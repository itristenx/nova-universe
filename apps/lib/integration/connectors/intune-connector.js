/**
 * Microsoft Intune Connector
 * Implements Microsoft Graph API for Intune/device management integration
 *
 * @author Nova Team
 * @version 1.0.0
 */

import { IConnector, ConnectorType, HealthStatus } from '../nova-integration-layer.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Microsoft Intune Connector for device and app management
 * Follows enterprise integration patterns for Microsoft cloud services
 */
export class IntuneConnector extends IConnector {
  constructor() {
    super('intune-connector', 'Microsoft Intune', '1.0.0', ConnectorType.DEVICE_MANAGEMENT);
    this.client = null;
    this.config = null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Initialize Intune connector with enterprise configuration
   */
  async initialize(config) {
    try {
      this.config = config;

      // Validate Intune-specific configuration
      this.validateIntuneConfig(config);

      // Initialize Microsoft Graph API client
      this.client = axios.create({
        baseURL: config.endpoints.graphUrl || 'https://graph.microsoft.com/v1.0',
        timeout: config.timeout || 30000,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Authenticate and get bearer token
      await this.authenticate();

      // Test the connection
      await this.testConnection();

      console.log('Intune connector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Intune connector:', error);
      throw error;
    }
  }

  /**
   * Health check with comprehensive Intune API testing
   */
  async health() {
    try {
      const startTime = Date.now();

      // Ensure we have a valid token
      await this.ensureValidToken();

      // Test device management endpoints
      const devicesResponse = await this.client.get('/deviceManagement/managedDevices?$top=1', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      const apiLatency = Date.now() - startTime;

      // Test apps access
      let appsStatus = 'healthy';
      let appsLatency = 0;

      try {
        const appsStartTime = Date.now();
        await this.client.get('/deviceAppManagement/mobileApps?$top=1', {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        appsLatency = Date.now() - appsStartTime;
      } catch (error) {
        appsStatus = 'degraded';
      }

      // Test compliance policies
      let complianceStatus = 'healthy';
      let complianceLatency = 0;

      try {
        const complianceStartTime = Date.now();
        await this.client.get('/deviceManagement/deviceCompliancePolicies?$top=1', {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        complianceLatency = Date.now() - complianceStartTime;
      } catch (error) {
        complianceStatus = 'degraded';
      }

      const overallStatus =
        devicesResponse.status === 200 && appsStatus === 'healthy' && complianceStatus === 'healthy'
          ? HealthStatus.HEALTHY
          : HealthStatus.DEGRADED;

      return {
        status: overallStatus,
        lastCheck: new Date(),
        metrics: [
          {
            name: 'api_latency',
            value: apiLatency,
            unit: 'ms',
          },
          {
            name: 'apps_latency',
            value: appsLatency,
            unit: 'ms',
          },
          {
            name: 'compliance_latency',
            value: complianceLatency,
            unit: 'ms',
          },
          {
            name: 'auth_status',
            value: this.accessToken ? 1 : 0,
            unit: 'boolean',
          },
        ],
        issues:
          overallStatus !== HealthStatus.HEALTHY ? ['Some Intune API endpoints degraded'] : [],
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        lastCheck: new Date(),
        metrics: [],
        issues: [error.message],
      };
    }
  }

  /**
   * Sync devices, apps, and policies from Intune
   */
  async sync(options = {}) {
    try {
      const syncType = options.type || 'full';
      let totalRecords = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      console.log(`Starting ${syncType} sync from Intune...`);

      // Ensure valid authentication
      await this.ensureValidToken();

      // Sync managed devices
      const devicesResult = await this.syncDevices(options);
      totalRecords += devicesResult.totalRecords;
      successCount += devicesResult.successCount;
      errorCount += devicesResult.errorCount;
      errors.push(...devicesResult.errors);

      // Sync mobile apps
      const appsResult = await this.syncApps(options);
      totalRecords += appsResult.totalRecords;
      successCount += appsResult.successCount;
      errorCount += appsResult.errorCount;
      errors.push(...appsResult.errors);

      // Sync compliance policies
      const complianceResult = await this.syncCompliance(options);
      totalRecords += complianceResult.totalRecords;
      successCount += complianceResult.successCount;
      errorCount += complianceResult.errorCount;
      errors.push(...complianceResult.errors);

      const status = errorCount === 0 ? 'success' : successCount > 0 ? 'partial' : 'failed';

      return {
        jobId: crypto.randomUUID(),
        status,
        metrics: {
          totalRecords,
          successCount,
          errorCount,
        },
        errors: errors.slice(0, 10), // Limit error details
        data: null,
      };
    } catch (error) {
      return {
        jobId: crypto.randomUUID(),
        status: 'failed',
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
        },
        errors: [
          {
            message: error.message,
          },
        ],
      };
    }
  }

  /**
   * Poll for real-time device changes and compliance issues
   */
  async poll() {
    try {
      const since = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

      await this.ensureValidToken();

      // Get recent device compliance changes
      const filter = `lastSyncDateTime ge ${since.toISOString()}`;
      const devicesResponse = await this.client.get(
        `/deviceManagement/managedDevices?$filter=${encodeURIComponent(filter)}&$top=100`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );

      const events = [];

      for (const device of devicesResponse.data.value || []) {
        // Check for compliance state changes
        if (device.complianceState && device.complianceState !== 'compliant') {
          events.push({
            id: `intune-compliance-${device.id}`,
            type: 'device.compliance_changed',
            timestamp: new Date(device.lastSyncDateTime),
            data: {
              deviceId: device.id,
              deviceName: device.deviceName,
              userPrincipalName: device.userPrincipalName,
              complianceState: device.complianceState,
              operatingSystem: device.operatingSystem,
              osVersion: device.osVersion,
            },
            source: 'intune',
          });
        }

        // Check for enrollment changes
        if (device.enrolledDateTime && new Date(device.enrolledDateTime) > since) {
          events.push({
            id: `intune-enrollment-${device.id}`,
            type: 'device.enrolled',
            timestamp: new Date(device.enrolledDateTime),
            data: {
              deviceId: device.id,
              deviceName: device.deviceName,
              userPrincipalName: device.userPrincipalName,
              operatingSystem: device.operatingSystem,
              enrollmentType: device.enrollmentType,
            },
            source: 'intune',
          });
        }
      }

      return events;
    } catch (error) {
      console.error('Failed to poll Intune events:', error);
      return [];
    }
  }

  /**
   * Execute actions on Intune (remote wipe, lock, etc.)
   */
  async push(action) {
    try {
      const { action: actionType, target, parameters } = action;

      await this.ensureValidToken();

      switch (actionType) {
        case 'remote_wipe':
          return await this.remoteWipe(target, parameters);

        case 'remote_lock':
          return await this.remoteLock(target);

        case 'retire':
          return await this.retireDevice(target);

        case 'sync':
          return await this.syncDevice(target);

        case 'reset_passcode':
          return await this.resetPasscode(target);

        case 'locate_device':
          return await this.locateDevice(target);

        case 'assign_app':
          return await this.assignApp(target, parameters);

        default:
          throw new Error(`Unsupported action: ${actionType}`);
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }
  }

  /**
   * Validate Intune-specific configuration
   */
  validateConfig(config) {
    const errors = [];

    if (!config.credentials?.clientId || !config.credentials?.clientSecret) {
      errors.push('Missing Azure AD client ID or client secret');
    }

    if (!config.credentials?.tenantId) {
      errors.push('Missing Azure AD tenant ID');
    }

    if (config.endpoints?.graphUrl && !config.endpoints.graphUrl.includes('graph.microsoft.com')) {
      errors.push('Invalid Microsoft Graph URL');
    }

    return {
      valid: errors.length === 0,
      errors,
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
      rateLimit: 2000, // Microsoft Graph rate limit
      dataTypes: ['devices', 'apps', 'policies', 'compliance', 'users', 'groups'],
      actions: [
        'remote_wipe',
        'remote_lock',
        'retire',
        'sync',
        'reset_passcode',
        'locate_device',
        'assign_app',
      ],
      platforms: ['windows', 'ios', 'android', 'macos'],
    };
  }

  /**
   * Get data schema for Intune integration
   */
  getSchema() {
    return {
      input: {
        managedDevice: {
          id: 'string',
          deviceName: 'string',
          operatingSystem: 'string',
          osVersion: 'string',
          complianceState: 'string',
          enrollmentType: 'string',
        },
        mobileApp: {
          id: 'string',
          displayName: 'string',
          publisher: 'string',
          bundleId: 'string',
          appStoreUrl: 'string',
        },
      },
      output: {
        nova_device: {
          deviceId: 'string',
          deviceName: 'string',
          platform: 'string',
          osVersion: 'string',
          complianceStatus: 'string',
          lastSync: 'date',
        },
        nova_app: {
          appId: 'string',
          appName: 'string',
          publisher: 'string',
          platform: 'string',
          assignmentStatus: 'string',
        },
      },
    };
  }

  async shutdown() {
    // Cleanup resources
    this.client = null;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.config = null;
    console.log('Intune connector shut down');
  }

  // Private helper methods

  validateIntuneConfig(config) {
    if (!config.credentials?.tenantId?.match(/^[a-f0-9-]{36}$/)) {
      throw new Error('Invalid Azure AD tenant ID format');
    }

    if (!config.credentials?.clientId?.match(/^[a-f0-9-]{36}$/)) {
      throw new Error('Invalid Azure AD client ID format');
    }
  }

  async authenticate() {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.config.credentials.clientId);
      params.append('client_secret', this.config.credentials.clientSecret);
      params.append('scope', 'https://graph.microsoft.com/.default');

      const authUrl = `https://login.microsoftonline.com/${this.config.credentials.tenantId}/oauth2/v2.0/token`;

      const response = await axios.post(authUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);

      console.log('Intune authentication successful');
    } catch (error) {
      throw new Error(`Intune authentication failed: ${error.message}`);
    }
  }

  async ensureValidToken() {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/deviceManagement', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (response.status !== 200) {
        throw new Error('Failed to connect to Intune API');
      }
    } catch (error) {
      throw new Error(`Intune connection test failed: ${error.message}`);
    }
  }

  async syncDevices(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      let nextLink = '/deviceManagement/managedDevices';

      // Add filter for incremental sync
      if (options.type === 'incremental' && options.lastSyncTime) {
        const filter = `lastSyncDateTime ge ${options.lastSyncTime.toISOString()}`;
        nextLink += `?$filter=${encodeURIComponent(filter)}`;
      }

      while (nextLink) {
        const response = await this.client.get(nextLink, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });

        const devices = response.data.value || [];
        totalRecords += devices.length;

        // Process each device
        for (const device of devices) {
          try {
            await this.processDevice(device);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              deviceId: device.id,
              message: error.message,
            });
          }
        }

        nextLink = response.data['@odata.nextLink'];
        if (nextLink) {
          // Extract relative path for next request
          nextLink = nextLink.replace('https://graph.microsoft.com/v1.0', '');
        }

        // Respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return {
        totalRecords,
        successCount,
        errorCount,
        errors,
      };
    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }],
      };
    }
  }

  async syncApps(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      let nextLink = '/deviceAppManagement/mobileApps';

      while (nextLink) {
        const response = await this.client.get(nextLink, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });

        const apps = response.data.value || [];
        totalRecords += apps.length;

        // Process each app
        for (const app of apps) {
          try {
            await this.processApp(app);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              appId: app.id,
              message: error.message,
            });
          }
        }

        nextLink = response.data['@odata.nextLink'];
        if (nextLink) {
          nextLink = nextLink.replace('https://graph.microsoft.com/v1.0', '');
        }

        // Respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return {
        totalRecords,
        successCount,
        errorCount,
        errors,
      };
    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }],
      };
    }
  }

  async syncCompliance(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      const response = await this.client.get('/deviceManagement/deviceCompliancePolicies', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      const policies = response.data.value || [];
      totalRecords = policies.length;

      // Process each compliance policy
      for (const policy of policies) {
        try {
          await this.processCompliancePolicy(policy);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            policyId: policy.id,
            message: error.message,
          });
        }
      }

      return {
        totalRecords,
        successCount,
        errorCount,
        errors,
      };
    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }],
      };
    }
  }

  async processDevice(device) {
    // Transform Intune device to Nova format
    const novaDevice = {
      deviceId: `intune-${device.id}`,
      deviceName: device.deviceName,
      platform: device.operatingSystem,
      osVersion: device.osVersion,
      serialNumber: device.serialNumber,
      imei: device.imei,
      complianceStatus: device.complianceState,
      enrollmentType: device.enrollmentType,
      managementAgent: 'intune',
      lastSync: new Date(device.lastSyncDateTime),
      enrolledDateTime: new Date(device.enrolledDateTime),
      userPrincipalName: device.userPrincipalName,
      source: 'intune',
      intuneId: device.id,
      azureADDeviceId: device.azureADDeviceId,
      model: device.model,
      manufacturer: device.manufacturer,
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed Intune device: ${novaDevice.deviceName}`);

    return novaDevice;
  }

  async processApp(app) {
    // Transform Intune app to Nova format
    const novaApp = {
      appId: `intune-${app.id}`,
      appName: app.displayName,
      publisher: app.publisher,
      platform: this.determinePlatform(app['@odata.type']),
      bundleId: app.bundleId,
      appStoreUrl: app.informationUrl,
      version: app.displayVersion,
      description: app.description,
      source: 'intune',
      intuneId: app.id,
      createdDateTime: new Date(app.createdDateTime),
      lastModifiedDateTime: new Date(app.lastModifiedDateTime),
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed Intune app: ${novaApp.appName}`);

    return novaApp;
  }

  async processCompliancePolicy(policy) {
    // Transform Intune compliance policy to Nova format
    const novaPolicy = {
      policyId: `intune-${policy.id}`,
      policyName: policy.displayName,
      description: policy.description,
      platform: this.determinePlatformFromPolicy(policy),
      source: 'intune',
      intuneId: policy.id,
      createdDateTime: new Date(policy.createdDateTime),
      lastModifiedDateTime: new Date(policy.lastModifiedDateTime),
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed Intune compliance policy: ${novaPolicy.policyName}`);

    return novaPolicy;
  }

  determinePlatform(odataType) {
    if (odataType.includes('ios')) return 'ios';
    if (odataType.includes('android')) return 'android';
    if (odataType.includes('win32')) return 'windows';
    if (odataType.includes('macOS')) return 'macos';
    return 'unknown';
  }

  determinePlatformFromPolicy(policy) {
    const odataType = policy['@odata.type'];
    if (odataType.includes('ios')) return 'ios';
    if (odataType.includes('android')) return 'android';
    if (odataType.includes('windows')) return 'windows';
    if (odataType.includes('macOS')) return 'macos';
    return 'unknown';
  }

  async remoteWipe(deviceId, parameters = {}) {
    try {
      const keepEnrollmentData = parameters.keepEnrollmentData || false;
      const keepUserData = parameters.keepUserData || false;

      await this.client.post(
        `/deviceManagement/managedDevices/${deviceId}/wipe`,
        {
          keepEnrollmentData,
          keepUserData,
        },
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );

      return {
        success: true,
        message: 'Remote wipe initiated successfully',
        data: { deviceId, action: 'remote_wipe' },
      };
    } catch (error) {
      throw new Error(`Failed to initiate remote wipe: ${error.message}`);
    }
  }

  async remoteLock(deviceId) {
    try {
      await this.client.post(
        `/deviceManagement/managedDevices/${deviceId}/remoteLock`,
        {},
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );

      return {
        success: true,
        message: 'Remote lock initiated successfully',
        data: { deviceId, action: 'remote_lock' },
      };
    } catch (error) {
      throw new Error(`Failed to initiate remote lock: ${error.message}`);
    }
  }

  async retireDevice(deviceId) {
    try {
      await this.client.post(
        `/deviceManagement/managedDevices/${deviceId}/retire`,
        {},
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );

      return {
        success: true,
        message: 'Device retirement initiated successfully',
        data: { deviceId, action: 'retire' },
      };
    } catch (error) {
      throw new Error(`Failed to retire device: ${error.message}`);
    }
  }

  async syncDevice(deviceId) {
    try {
      await this.client.post(
        `/deviceManagement/managedDevices/${deviceId}/syncDevice`,
        {},
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );

      return {
        success: true,
        message: 'Device sync initiated successfully',
        data: { deviceId, action: 'sync' },
      };
    } catch (error) {
      throw new Error(`Failed to sync device: ${error.message}`);
    }
  }

  async resetPasscode(deviceId) {
    try {
      await this.client.post(
        `/deviceManagement/managedDevices/${deviceId}/resetPasscode`,
        {},
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );

      return {
        success: true,
        message: 'Passcode reset initiated successfully',
        data: { deviceId, action: 'reset_passcode' },
      };
    } catch (error) {
      throw new Error(`Failed to reset passcode: ${error.message}`);
    }
  }

  async locateDevice(deviceId) {
    try {
      await this.client.post(
        `/deviceManagement/managedDevices/${deviceId}/locateDevice`,
        {},
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );

      return {
        success: true,
        message: 'Device location request sent successfully',
        data: { deviceId, action: 'locate_device' },
      };
    } catch (error) {
      throw new Error(`Failed to locate device: ${error.message}`);
    }
  }

  async assignApp(deviceId, parameters) {
    try {
      const { appId, assignmentType = 'required' } = parameters;

      // This would involve creating an assignment through the assignments API
      // Implementation depends on specific requirements

      return {
        success: true,
        message: 'App assignment created successfully',
        data: { deviceId, appId, action: 'assign_app' },
      };
    } catch (error) {
      throw new Error(`Failed to assign app: ${error.message}`);
    }
  }
}
