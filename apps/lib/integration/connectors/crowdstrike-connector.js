/**
 * CrowdStrike Falcon Connector
 * Implements CrowdStrike Falcon API for endpoint security integration
 * 
 * @author Nova Team
 * @version 1.0.0
 */

import { IConnector, ConnectorType, HealthStatus } from '../nova-integration-layer.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * CrowdStrike Falcon Connector for endpoint security
 * Follows enterprise integration patterns for security platforms
 */
export class CrowdStrikeConnector extends IConnector {
  constructor() {
    super('crowdstrike-connector', 'CrowdStrike Falcon', '1.0.0', ConnectorType.SECURITY_PLATFORM);
    this.client = null;
    this.config = null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Initialize CrowdStrike connector with enterprise configuration
   */
  async initialize(config) {
    try {
      this.config = config;
      
      // Validate CrowdStrike-specific configuration
      this.validateCrowdStrikeConfig(config);
      
      // Initialize CrowdStrike API client
      this.client = axios.create({
        baseURL: config.endpoints.falconUrl || 'https://api.crowdstrike.com',
        timeout: config.timeout || 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Authenticate and get bearer token
      await this.authenticate(); // TODO-LINT: move to async function
      
      // Test the connection
      await this.testConnection(); // TODO-LINT: move to async function
      
      console.log('CrowdStrike connector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CrowdStrike connector:', error);
      throw error;
    }
  }

  /**
   * Health check with comprehensive CrowdStrike API testing
   */
  async health() {
    try {
      const startTime = Date.now();
      
      // Ensure we have a valid token
      await this.ensureValidToken(); // TODO-LINT: move to async function
      
      // Test CrowdStrike API endpoints
      const hostsResponse = await this.client.get('/devices/queries/devices/v1?limit=1', {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }); // TODO-LINT: move to async function
      
      const apiLatency = Date.now() - startTime;

      // Test detections access
      let detectionsStatus = 'healthy';
      let detectionsLatency = 0;
      
      try {
        const detectionsStartTime = Date.now();
        await this.client.get('/detects/queries/detects/v1?limit=1', {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }); // TODO-LINT: move to async function
        detectionsLatency = Date.now() - detectionsStartTime;
      } catch (error) {
        detectionsStatus = 'degraded';
      }

      const overallStatus = hostsResponse.status === 200 && detectionsStatus === 'healthy'
        ? HealthStatus.HEALTHY 
        : HealthStatus.DEGRADED;

      return {
        status: overallStatus,
        lastCheck: new Date(),
        metrics: [
          {
            name: 'api_latency',
            value: apiLatency,
            unit: 'ms'
          },
          {
            name: 'detections_latency',
            value: detectionsLatency,
            unit: 'ms'
          },
          {
            name: 'auth_status',
            value: this.accessToken ? 1 : 0,
            unit: 'boolean'
          }
        ],
        issues: overallStatus !== HealthStatus.HEALTHY ? ['Detections API access issues'] : []
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        lastCheck: new Date(),
        metrics: [],
        issues: [error.message]
      };
    }
  }

  /**
   * Sync hosts and detections from CrowdStrike
   */
  async sync(options = {}) {
    try {
      const syncType = options.type || 'full';
      let totalRecords = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      console.log(`Starting ${syncType} sync from CrowdStrike...`);

      // Ensure valid authentication
      await this.ensureValidToken(); // TODO-LINT: move to async function

      // Sync hosts (endpoints)
      const hostsResult = await this.syncHosts(options); // TODO-LINT: move to async function
      totalRecords += hostsResult.totalRecords;
      successCount += hostsResult.successCount;
      errorCount += hostsResult.errorCount;
      errors.push(...hostsResult.errors);

      // Sync detections
      const detectionsResult = await this.syncDetections(options); // TODO-LINT: move to async function
      totalRecords += detectionsResult.totalRecords;
      successCount += detectionsResult.successCount;
      errorCount += detectionsResult.errorCount;
      errors.push(...detectionsResult.errors);

      const status = errorCount === 0 ? 'success' : 
        successCount > 0 ? 'partial' : 'failed';

      return {
        jobId: crypto.randomUUID(),
        status,
        metrics: {
          totalRecords,
          successCount,
          errorCount
        },
        errors: errors.slice(0, 10), // Limit error details
        data: null
      };

    } catch (error) {
      return {
        jobId: crypto.randomUUID(),
        status: 'failed',
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1
        },
        errors: [{
          message: error.message
        }]
      };
    }
  }

  /**
   * Poll for real-time detections and alerts
   */
  async poll() {
    try {
      const since = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
      
      await this.ensureValidToken(); // TODO-LINT: move to async function
      
      // Get recent detections
      const filter = `created_timestamp:>'${since.toISOString()}'`;
      const detectionsResponse = await this.client.get(`/detects/queries/detects/v1?filter=${encodeURIComponent(filter)}&limit=100`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }); // TODO-LINT: move to async function

      const detectionIds = detectionsResponse.data.resources || [];
      
      if (detectionIds.length === 0) {
        return [];
      }

      // Get detailed detection information
      const detailsResponse = await this.client.post('/detects/entities/summaries/GET/v1', {
        ids: detectionIds
      }, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }); // TODO-LINT: move to async function

      const events = [];
      
      for (const detection of detailsResponse.data.resources || []) {
        events.push({
          id: detection.detection_id,
          type: 'security.detection',
          timestamp: new Date(detection.created_timestamp),
          data: {
            detectionId: detection.detection_id,
            hostId: detection.device.device_id,
            hostname: detection.device.hostname,
            severity: detection.max_severity_displayname,
            status: detection.status,
            description: detection.detection_description,
            tactic: detection.tactic,
            technique: detection.technique
          },
          source: 'crowdstrike'
        });
      }

      return events;

    } catch (error) {
      console.error('Failed to poll CrowdStrike events:', error);
      return [];
    }
  }

  /**
   * Execute actions on CrowdStrike (quarantine, release, etc.)
   */
  async push(action) {
    try {
      const { action: actionType, target, parameters } = action;

      await this.ensureValidToken(); // TODO-LINT: move to async function

      switch (actionType) {
        case 'quarantine':
          return await this.quarantineHost(target); // TODO-LINT: move to async function
        
        case 'release':
          return await this.releaseHost(target); // TODO-LINT: move to async function
        
        case 'contain':
          return await this.containHost(target); // TODO-LINT: move to async function
        
        case 'lift_containment':
          return await this.liftContainment(target); // TODO-LINT: move to async function
        
        case 'update_detection':
          return await this.updateDetection(target, parameters); // TODO-LINT: move to async function
        
        default:
          throw new Error(`Unsupported action: ${actionType}`);
      }

    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message
      };
    }
  }

  /**
   * Validate CrowdStrike-specific configuration
   */
  validateConfig(config) {
    const errors = [];

    if (!config.credentials?.clientId || !config.credentials?.clientSecret) {
      errors.push('Missing CrowdStrike client ID or client secret');
    }

    if (config.endpoints?.falconUrl && !config.endpoints.falconUrl.includes('crowdstrike.com')) {
      errors.push('Invalid CrowdStrike Falcon URL');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get connector capabilities
   */
  getCapabilities() {
    return {
      supportsSync: true,
      supportsPush: true,
      supportsPoll: true,
      rateLimit: 300, // CrowdStrike rate limit
      dataTypes: [
        'hosts',
        'detections',
        'incidents',
        'iocs',
        'policies'
      ],
      actions: [
        'quarantine',
        'release',
        'contain',
        'lift_containment',
        'update_detection'
      ],
      securityCategories: ['endpoint_protection', 'threat_detection', 'incident_response']
    };
  }

  /**
   * Get data schema for CrowdStrike integration
   */
  getSchema() {
    return {
      input: {
        host: {
          device_id: 'string',
          hostname: 'string',
          platform_name: 'string',
          os_version: 'string',
          status: 'string'
        },
        detection: {
          detection_id: 'string',
          device: 'object',
          severity: 'number',
          status: 'string',
          behaviors: 'array'
        }
      },
      output: {
        nova_device: {
          deviceId: 'string',
          hostname: 'string',
          platform: 'string',
          securityStatus: 'string',
          lastSync: 'date'
        },
        nova_alert: {
          alertId: 'string',
          deviceId: 'string',
          severity: 'string',
          status: 'string',
          description: 'string'
        }
      }
    };
  }

  async shutdown() {
    // Cleanup resources
    this.client = null;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.config = null;
    console.log('CrowdStrike connector shut down');
  }

  // Private helper methods

  validateCrowdStrikeConfig(config) {
    if (!config.credentials?.clientId?.match(/^[a-f0-9]{32}$/)) {
      throw new Error('Invalid CrowdStrike client ID format');
    }

    if (!config.credentials?.clientSecret?.match(/^[A-Za-z0-9_-]+$/)) {
      throw new Error('Invalid CrowdStrike client secret format');
    }
  }

  async authenticate() {
    try {
      const params = new URLSearchParams();
      params.append('client_id', this.config.credentials.clientId);
      params.append('client_secret', this.config.credentials.clientSecret);

      const response = await this.client.post('/oauth2/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }); // TODO-LINT: move to async function

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      console.log('CrowdStrike authentication successful');
    } catch (error) {
      throw new Error(`CrowdStrike authentication failed: ${error.message}`);
    }
  }

  async ensureValidToken() {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate(); // TODO-LINT: move to async function
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/devices/queries/devices/v1?limit=1', {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }); // TODO-LINT: move to async function
      
      if (response.status !== 200) {
        throw new Error('Failed to connect to CrowdStrike API');
      }
    } catch (error) {
      throw new Error(`CrowdStrike connection test failed: ${error.message}`);
    }
  }

  async syncHosts(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        // Get host IDs
        const hostsResponse = await this.client.get(`/devices/queries/devices/v1?limit=${limit}&offset=${offset}`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }); // TODO-LINT: move to async function

        const hostIds = hostsResponse.data.resources || [];
        totalRecords += hostIds.length;

        if (hostIds.length === 0) {
          break;
        }

        // Get detailed host information
        const detailsResponse = await this.client.post('/devices/entities/devices/v1', {
          ids: hostIds
        }, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }); // TODO-LINT: move to async function

        // Process each host
        for (const host of detailsResponse.data.resources || []) {
          try {
            await this.processHost(host); // TODO-LINT: move to async function
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              hostId: host.device_id,
              message: error.message
            });
          }
        }

        hasMore = hostIds.length === limit;
        offset += limit;

        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100)); // TODO-LINT: move to async function
      }

      return {
        totalRecords,
        successCount,
        errorCount,
        errors
      };

    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }]
      };
    }
  }

  async syncDetections(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      // Build filter for incremental sync
      let filter = '';
      if (options.type === 'incremental' && options.lastSyncTime) {
        filter = `created_timestamp:>'${options.lastSyncTime.toISOString()}'`;
      }

      while (hasMore) {
        // Get detection IDs
        const detectionsResponse = await this.client.get(
          `/detects/queries/detects/v1?limit=${limit}&offset=${offset}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }); // TODO-LINT: move to async function

        const detectionIds = detectionsResponse.data.resources || [];
        totalRecords += detectionIds.length;

        if (detectionIds.length === 0) {
          break;
        }

        // Get detailed detection information
        const detailsResponse = await this.client.post('/detects/entities/summaries/GET/v1', {
          ids: detectionIds
        }, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }); // TODO-LINT: move to async function

        // Process each detection
        for (const detection of detailsResponse.data.resources || []) {
          try {
            await this.processDetection(detection); // TODO-LINT: move to async function
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              detectionId: detection.detection_id,
              message: error.message
            });
          }
        }

        hasMore = detectionIds.length === limit;
        offset += limit;

        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100)); // TODO-LINT: move to async function
      }

      return {
        totalRecords,
        successCount,
        errorCount,
        errors
      };

    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }]
      };
    }
  }

  async processHost(host) {
    // Transform CrowdStrike host to Nova format
    const novaDevice = {
      deviceId: `crowdstrike-${host.device_id}`,
      hostname: host.hostname,
      platform: host.platform_name,
      osVersion: host.os_version,
      serialNumber: host.serial_number,
      macAddress: host.mac_address,
      securityStatus: host.status,
      agentVersion: host.agent_version,
      lastSeen: new Date(host.last_seen),
      source: 'crowdstrike',
      crowdStrikeId: host.device_id,
      policies: host.policies || []
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed CrowdStrike host: ${novaDevice.hostname}`);
    
    return novaDevice;
  }

  async processDetection(detection) {
    // Transform CrowdStrike detection to Nova format
    const novaAlert = {
      alertId: `crowdstrike-${detection.detection_id}`,
      deviceId: `crowdstrike-${detection.device.device_id}`,
      hostname: detection.device.hostname,
      severity: detection.max_severity_displayname,
      status: detection.status,
      description: detection.detection_description,
      tactic: detection.tactic,
      technique: detection.technique,
      createdAt: new Date(detection.created_timestamp),
      updatedAt: new Date(detection.last_behavior),
      source: 'crowdstrike',
      crowdStrikeDetectionId: detection.detection_id,
      behaviors: detection.behaviors || []
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed CrowdStrike detection: ${novaAlert.alertId}`);
    
    return novaAlert;
  }

  async quarantineHost(hostId) {
    try {
      await this.client.post('/devices/entities/devices-actions/v2', {
        action_name: 'quarantine',
        ids: [hostId]
      }, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }); // TODO-LINT: move to async function

      return {
        success: true,
        message: 'Host quarantined successfully',
        data: { hostId, action: 'quarantine' }
      };
    } catch (error) {
      throw new Error(`Failed to quarantine host: ${error.message}`);
    }
  }

  async releaseHost(hostId) {
    try {
      await this.client.post('/devices/entities/devices-actions/v2', {
        action_name: 'unquarantine',
        ids: [hostId]
      }, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }); // TODO-LINT: move to async function

      return {
        success: true,
        message: 'Host released from quarantine successfully',
        data: { hostId, action: 'release' }
      };
    } catch (error) {
      throw new Error(`Failed to release host: ${error.message}`);
    }
  }

  async containHost(hostId) {
    try {
      await this.client.post('/devices/entities/devices-actions/v2', {
        action_name: 'contain',
        ids: [hostId]
      }, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }); // TODO-LINT: move to async function

      return {
        success: true,
        message: 'Host contained successfully',
        data: { hostId, action: 'contain' }
      };
    } catch (error) {
      throw new Error(`Failed to contain host: ${error.message}`);
    }
  }

  async liftContainment(hostId) {
    try {
      await this.client.post('/devices/entities/devices-actions/v2', {
        action_name: 'lift_containment',
        ids: [hostId]
      }, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }); // TODO-LINT: move to async function

      return {
        success: true,
        message: 'Containment lifted successfully',
        data: { hostId, action: 'lift_containment' }
      };
    } catch (error) {
      throw new Error(`Failed to lift containment: ${error.message}`);
    }
  }

  async updateDetection(detectionId, parameters) {
    try {
      const { status, comment } = parameters;
      
      await this.client.patch('/detects/entities/detects/v2', {
        ids: [detectionId],
        status: status || 'in_progress',
        comment: comment || 'Updated via Nova Integration Layer'
      }, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }); // TODO-LINT: move to async function

      return {
        success: true,
        message: 'Detection updated successfully',
        data: { detectionId, action: 'update_detection', status }
      };
    } catch (error) {
      throw new Error(`Failed to update detection: ${error.message}`);
    }
  }
}
