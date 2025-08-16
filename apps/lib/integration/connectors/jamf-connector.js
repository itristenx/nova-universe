/**
 * Jamf Pro Device Management Connector
 * Implements Jamf Pro API for macOS/iOS device integration
 *
 * @author Nova Team
 * @version 1.0.0
 */

import { IConnector, ConnectorType, HealthStatus } from '../nova-integration-layer.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Jamf Pro Connector for Apple device management
 * Follows enterprise integration patterns for MDM systems
 */
export class JamfConnector extends IConnector {
  constructor() {
    super('jamf-connector', 'Jamf Pro Device Management', '1.0.0', ConnectorType.DEVICE_MANAGEMENT);
    this.client = null;
    this.config = null;
    this.authToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Initialize Jamf connector with enterprise configuration
   */
  async initialize(config) {
    try {
      this.config = config;

      // Validate Jamf-specific configuration
      this.validateJamfConfig(config);

      // Initialize Jamf Pro API client
      this.client = axios.create({
        baseURL: config.endpoints.jamfUrl,
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

      console.log('Jamf connector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Jamf connector:', error);
      throw error;
    }
  }

  /**
   * Health check with comprehensive Jamf API testing
   */
  async health() {
    try {
      const startTime = Date.now();

      // Ensure we have a valid token
      await this.ensureValidToken();

      // Test Jamf Pro API endpoints
      const activationCodeResponse = await this.client.get('/JSSResource/activationcode', {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      const apiLatency = Date.now() - startTime;

      // Test computer inventory access
      let inventoryStatus = 'healthy';
      let inventoryLatency = 0;

      try {
        const inventoryStartTime = Date.now();
        await this.client.get('/JSSResource/computers/subset/basic', {
          headers: { Authorization: `Bearer ${this.authToken}` },
        });
        inventoryLatency = Date.now() - inventoryStartTime;
      } catch (error) {
        inventoryStatus = 'degraded';
      }

      const overallStatus =
        activationCodeResponse.status === 200 && inventoryStatus === 'healthy'
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
            name: 'inventory_latency',
            value: inventoryLatency,
            unit: 'ms',
          },
          {
            name: 'auth_status',
            value: this.authToken ? 1 : 0,
            unit: 'boolean',
          },
        ],
        issues: overallStatus !== HealthStatus.HEALTHY ? ['Inventory access issues detected'] : [],
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
   * Sync devices from Jamf using pagination
   */
  async sync(options = {}) {
    try {
      const syncType = options.type || 'full';
      let totalDevices = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      console.log(`Starting ${syncType} sync from Jamf...`);

      // Ensure valid authentication
      await this.ensureValidToken();

      // Sync computers (macOS devices)
      const computerResult = await this.syncComputers(options);
      totalDevices += computerResult.totalRecords;
      successCount += computerResult.successCount;
      errorCount += computerResult.errorCount;
      errors.push(...computerResult.errors);

      // Sync mobile devices (iOS/iPadOS devices)
      const mobileResult = await this.syncMobileDevices(options);
      totalDevices += mobileResult.totalRecords;
      successCount += mobileResult.successCount;
      errorCount += mobileResult.errorCount;
      errors.push(...mobileResult.errors);

      const status = errorCount === 0 ? 'success' : successCount > 0 ? 'partial' : 'failed';

      return {
        jobId: crypto.randomUUID(),
        status,
        metrics: {
          totalRecords: totalDevices,
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
   * Poll for real-time events (Jamf doesn't have real-time events, so we simulate)
   */
  async poll() {
    try {
      // Jamf Pro doesn't have real-time events like Okta
      // We can poll for recently updated devices instead
      const since = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

      await this.ensureValidToken();

      // Get recently updated computers
      const computersResponse = await this.client.get('/JSSResource/computers/subset/basic', {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      const events = [];

      // Filter for recent updates (simplified - in reality you'd need to track last poll time)
      for (const computer of computersResponse.data.computers || []) {
        // Simulate event based on device status
        events.push({
          id: crypto.randomUUID(),
          type: 'device.updated',
          timestamp: new Date(),
          data: {
            deviceId: computer.id,
            deviceName: computer.name,
            serialNumber: computer.serial_number,
            platform: 'macOS',
            action: 'inventory_update',
          },
          source: 'jamf',
        });
      }

      return events.slice(0, 50); // Limit to 50 events
    } catch (error) {
      console.error('Failed to poll Jamf events:', error);
      return [];
    }
  }

  /**
   * Execute actions on Jamf devices
   */
  async push(action) {
    try {
      const { action: actionType, target, parameters } = action;

      await this.ensureValidToken();

      switch (actionType) {
        case 'remote_lock':
          return await this.remoteLockDevice(target, parameters);

        case 'remote_wipe':
          return await this.remoteWipeDevice(target, parameters);

        case 'inventory_update':
          return await this.updateInventory(target);

        case 'install_app':
          return await this.installApplication(target, parameters);

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
   * Validate Jamf-specific configuration
   */
  validateConfig(config) {
    const errors = [];

    if (!config.credentials?.username || !config.credentials?.password) {
      errors.push('Missing Jamf username or password');
    }

    if (!config.endpoints?.jamfUrl) {
      errors.push('Missing Jamf Pro URL');
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
      rateLimit: 300, // Conservative rate limit for Jamf
      dataTypes: ['computers', 'mobile_devices', 'users', 'policies', 'configuration_profiles'],
      actions: ['remote_lock', 'remote_wipe', 'inventory_update', 'install_app'],
      platforms: ['macOS', 'iOS', 'iPadOS'],
    };
  }

  /**
   * Get data schema for Jamf integration
   */
  getSchema() {
    return {
      input: {
        computer: {
          id: 'number',
          name: 'string',
          serial_number: 'string',
          udid: 'string',
          mac_address: 'string',
          platform: 'string',
        },
        mobile_device: {
          id: 'number',
          name: 'string',
          device_name: 'string',
          serial_number: 'string',
          udid: 'string',
          platform: 'string',
        },
      },
      output: {
        nova_device: {
          deviceId: 'string',
          hostname: 'string',
          serialNumber: 'string',
          platform: 'string',
          assignedUser: 'object',
          status: 'string',
          lastSync: 'date',
        },
      },
    };
  }

  async shutdown() {
    // Cleanup resources
    this.client = null;
    this.authToken = null;
    this.tokenExpiry = null;
    this.config = null;
    console.log('Jamf connector shut down');
  }

  // Private helper methods

  validateJamfConfig(config) {
    if (
      !config.endpoints?.jamfUrl?.includes('jamfcloud.com') &&
      !config.endpoints?.jamfUrl?.match(/^https?:\/\/.+/)
    ) {
      throw new Error('Invalid Jamf Pro URL format');
    }
  }

  async authenticate() {
    try {
      const credentials = Buffer.from(
        `${this.config.credentials.username}:${this.config.credentials.password}`,
      ).toString('base64');

      const response = await this.client.post(
        '/api/v1/auth/token',
        {},
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      this.authToken = response.data.token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);

      console.log('Jamf authentication successful');
    } catch (error) {
      throw new Error(`Jamf authentication failed: ${error.message}`);
    }
  }

  async ensureValidToken() {
    if (!this.authToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/api/v1/jamf-pro-server-url', {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      if (response.status !== 200) {
        throw new Error('Failed to connect to Jamf Pro API');
      }
    } catch (error) {
      throw new Error(`Jamf connection test failed: ${error.message}`);
    }
  }

  async syncComputers(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      // Get basic computer list
      const response = await this.client.get('/JSSResource/computers/subset/basic', {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      const computers = response.data.computers || [];

      // Process each computer
      for (const computer of computers) {
        try {
          await this.processComputer(computer);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            deviceId: computer.id,
            message: error.message,
          });
        }
      }

      return {
        totalRecords: computers.length,
        successCount,
        errorCount,
        errors,
      };
    } catch (error) {
      return {
        totalRecords: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }],
      };
    }
  }

  async syncMobileDevices(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      // Get basic mobile device list
      const response = await this.client.get('/JSSResource/mobiledevices/subset/basic', {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      const devices = response.data.mobile_devices || [];

      // Process each mobile device
      for (const device of devices) {
        try {
          await this.processMobileDevice(device);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            deviceId: device.id,
            message: error.message,
          });
        }
      }

      return {
        totalRecords: devices.length,
        successCount,
        errorCount,
        errors,
      };
    } catch (error) {
      return {
        totalRecords: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }],
      };
    }
  }

  async processComputer(computer) {
    // Get detailed computer information
    const detailResponse = await this.client.get(`/JSSResource/computers/id/${computer.id}`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });

    const detail = detailResponse.data.computer;

    // Transform to Nova format
    const novaDevice = {
      deviceId: `jamf-computer-${detail.general.id}`,
      hostname: detail.general.name,
      serialNumber: detail.general.serial_number,
      platform: 'macOS',
      osVersion: `${detail.general.platform} ${detail.general.os_version}`,
      assignedUser: {
        email: detail.location?.email_address,
        name: detail.location?.real_name,
      },
      status: detail.general.last_contact_time ? 'managed' : 'offline',
      lastCheckIn: new Date(detail.general.last_contact_time_epoch * 1000),
      source: 'jamf',
      jamfId: detail.general.id,
      udid: detail.general.udid,
      macAddress: detail.general.mac_address,
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed computer: ${novaDevice.hostname}`);

    return novaDevice;
  }

  async processMobileDevice(device) {
    // Get detailed mobile device information
    const detailResponse = await this.client.get(`/JSSResource/mobiledevices/id/${device.id}`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });

    const detail = detailResponse.data.mobile_device;

    // Transform to Nova format
    const novaDevice = {
      deviceId: `jamf-mobile-${detail.general.id}`,
      hostname: detail.general.device_name,
      serialNumber: detail.general.serial_number,
      platform: detail.general.platform,
      osVersion: `${detail.general.os_type} ${detail.general.os_version}`,
      assignedUser: {
        email: detail.location?.email_address,
        name: detail.location?.real_name,
      },
      status: detail.general.last_inventory_update ? 'managed' : 'offline',
      lastCheckIn: new Date(detail.general.last_inventory_update_epoch * 1000),
      source: 'jamf',
      jamfId: detail.general.id,
      udid: detail.general.udid,
      wifiMacAddress: detail.general.wifi_mac_address,
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed mobile device: ${novaDevice.hostname}`);

    return novaDevice;
  }

  async remoteLockDevice(deviceId, parameters) {
    try {
      const deviceType = parameters?.deviceType || 'computer';
      const endpoint =
        deviceType === 'mobile'
          ? `/JSSResource/mobiledevicecommands/command/DeviceLock/id/${deviceId}`
          : `/JSSResource/computercommands/command/DeviceLock/id/${deviceId}`;

      await this.client.post(
        endpoint,
        {
          command: {
            name: 'DeviceLock',
            passcode: parameters?.passcode || '000000',
          },
        },
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        },
      );

      return {
        success: true,
        message: 'Device lock command sent successfully',
        data: { deviceId, action: 'remote_lock' },
      };
    } catch (error) {
      throw new Error(`Failed to lock device: ${error.message}`);
    }
  }

  async remoteWipeDevice(deviceId, parameters) {
    try {
      const deviceType = parameters?.deviceType || 'computer';
      const endpoint =
        deviceType === 'mobile'
          ? `/JSSResource/mobiledevicecommands/command/EraseDevice/id/${deviceId}`
          : `/JSSResource/computercommands/command/EraseDevice/id/${deviceId}`;

      await this.client.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        },
      );

      return {
        success: true,
        message: 'Device wipe command sent successfully',
        data: { deviceId, action: 'remote_wipe' },
      };
    } catch (error) {
      throw new Error(`Failed to wipe device: ${error.message}`);
    }
  }

  async updateInventory(deviceId) {
    try {
      await this.client.post(
        `/JSSResource/computercommands/command/UpdateInventory/id/${deviceId}`,
        {},
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        },
      );

      return {
        success: true,
        message: 'Inventory update command sent successfully',
        data: { deviceId, action: 'inventory_update' },
      };
    } catch (error) {
      throw new Error(`Failed to update inventory: ${error.message}`);
    }
  }

  async installApplication(deviceId, parameters) {
    try {
      const { appId, deviceType = 'computer' } = parameters;

      if (!appId) {
        throw new Error('Application ID is required');
      }

      const endpoint =
        deviceType === 'mobile'
          ? `/JSSResource/mobiledevicecommands/command/InstallApplication/id/${deviceId}`
          : `/JSSResource/computercommands/command/InstallApplication/id/${deviceId}`;

      await this.client.post(
        endpoint,
        {
          command: {
            name: 'InstallApplication',
            application_id: appId,
          },
        },
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        },
      );

      return {
        success: true,
        message: 'Application install command sent successfully',
        data: { deviceId, action: 'install_app', appId },
      };
    } catch (error) {
      throw new Error(`Failed to install application: ${error.message}`);
    }
  }
}
