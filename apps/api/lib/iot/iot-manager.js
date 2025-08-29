/**
 * IoT Manager Service
 * Handles IoT device management, sensor data collection, and smart building features
 */

import { logger } from '../../logger.js';

export class IoTManager {
  constructor() {
    this.initialized = false;
    this.devices = new Map();
    this.sensors = new Map();
    this.deviceTypes = ['sensor', 'controller', 'gateway', 'camera', 'display'];
    this.sensorTypes = [
      'temperature',
      'humidity',
      'occupancy',
      'air_quality',
      'light',
      'motion',
      'noise',
    ];
  }

  async initialize() {
    try {
      logger.info('IoT Manager initializing...');

      // Initialize IoT system
      await this.setupIoTSystem();

      // Start background processes
      this.startBackgroundProcesses();

      this.initialized = true;
      logger.info('IoT Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize IoT Manager:', error);
      throw error;
    }
  }

  async setupIoTSystem() {
    logger.debug('Setting up IoT system');

    // Initialize device managers
    this.deviceManagers = {
      sensor: this.createSensorManager(),
      controller: this.createControllerManager(),
      gateway: this.createGatewayManager(),
      camera: this.createCameraManager(),
      display: this.createDisplayManager(),
    };

    // Initialize data processors
    this.dataProcessors = {
      sensor: this.createSensorDataProcessor(),
      analytics: this.createAnalyticsProcessor(),
      alerts: this.createAlertProcessor(),
    };
  }

  createSensorManager() {
    return {
      name: 'sensor',
      devices: new Map(),

      async registerDevice(deviceData) {
        const device = {
          id: deviceData.id || `sensor_${Date.now()}`,
          type: 'sensor',
          sensorType: deviceData.sensorType,
          location: deviceData.location,
          status: 'active',
          lastReading: null,
          lastUpdate: new Date().toISOString(),
          config: deviceData.config || {},
        };

        this.devices.set(device.id, device);
        return device;
      },

      async updateReading(deviceId, reading) {
        const device = this.devices.get(deviceId);
        if (device) {
          device.lastReading = reading;
          device.lastUpdate = new Date().toISOString();
        }
        return device;
      },
    };
  }

  createControllerManager() {
    return {
      name: 'controller',
      devices: new Map(),

      async registerDevice(deviceData) {
        const device = {
          id: deviceData.id || `controller_${Date.now()}`,
          type: 'controller',
          controlType: deviceData.controlType,
          location: deviceData.location,
          status: 'active',
          lastCommand: null,
          lastUpdate: new Date().toISOString(),
          config: deviceData.config || {},
        };

        this.devices.set(device.id, device);
        return device;
      },

      async sendCommand(deviceId, command) {
        const device = this.devices.get(deviceId);
        if (device) {
          device.lastCommand = command;
          device.lastUpdate = new Date().toISOString();

          // Mock command execution
          logger.debug(`Executing command on controller ${deviceId}:`, command);

          return { success: true, command, timestamp: device.lastUpdate };
        }
        throw new Error('Controller device not found');
      },
    };
  }

  createGatewayManager() {
    return {
      name: 'gateway',
      devices: new Map(),

      async registerDevice(deviceData) {
        const device = {
          id: deviceData.id || `gateway_${Date.now()}`,
          type: 'gateway',
          protocol: deviceData.protocol,
          location: deviceData.location,
          status: 'active',
          connectedDevices: [],
          lastUpdate: new Date().toISOString(),
          config: deviceData.config || {},
        };

        this.devices.set(device.id, device);
        return device;
      },

      async connectDevice(gatewayId, deviceId) {
        const gateway = this.devices.get(gatewayId);
        if (gateway && !gateway.connectedDevices.includes(deviceId)) {
          gateway.connectedDevices.push(deviceId);
          gateway.lastUpdate = new Date().toISOString();
        }
        return gateway;
      },
    };
  }

  createCameraManager() {
    return {
      name: 'camera',
      devices: new Map(),

      async registerDevice(deviceData) {
        const device = {
          id: deviceData.id || `camera_${Date.now()}`,
          type: 'camera',
          cameraType: deviceData.cameraType,
          location: deviceData.location,
          status: 'active',
          recording: false,
          lastImage: null,
          lastUpdate: new Date().toISOString(),
          config: deviceData.config || {},
        };

        this.devices.set(device.id, device);
        return device;
      },

      async startRecording(cameraId) {
        const camera = this.devices.get(cameraId);
        if (camera) {
          camera.recording = true;
          camera.lastUpdate = new Date().toISOString();
          logger.debug(`Started recording on camera ${cameraId}`);
        }
        return camera;
      },

      async stopRecording(cameraId) {
        const camera = this.devices.get(cameraId);
        if (camera) {
          camera.recording = false;
          camera.lastUpdate = new Date().toISOString();
          logger.debug(`Stopped recording on camera ${cameraId}`);
        }
        return camera;
      },
    };
  }

  createDisplayManager() {
    return {
      name: 'display',
      devices: new Map(),

      async registerDevice(deviceData) {
        const device = {
          id: deviceData.id || `display_${Date.now()}`,
          type: 'display',
          displayType: deviceData.displayType,
          location: deviceData.location,
          status: 'active',
          currentContent: null,
          lastUpdate: new Date().toISOString(),
          config: deviceData.config || {},
        };

        this.devices.set(device.id, device);
        return device;
      },

      async updateContent(deviceId, content) {
        const display = this.devices.get(deviceId);
        if (display) {
          display.currentContent = content;
          display.lastUpdate = new Date().toISOString();
          logger.debug(`Updated content on display ${deviceId}:`, content);
        }
        return display;
      },
    };
  }

  createSensorDataProcessor() {
    return {
      name: 'sensor_data',
      async process(deviceId, data) {
        logger.debug(`Processing sensor data from ${deviceId}:`, data);

        // Process and validate sensor data
        const processedData = {
          deviceId,
          timestamp: new Date().toISOString(),
          value: data.value,
          unit: data.unit,
          quality: this.assessDataQuality(data),
          processed: true,
        };

        // Store processed data
        await this.storeSensorData(processedData);

        return processedData;
      },

      assessDataQuality(data) {
        // Mock data quality assessment
        const quality = Math.random();
        if (quality > 0.9) return 'excellent';
        if (quality > 0.7) return 'good';
        if (quality > 0.5) return 'fair';
        return 'poor';
      },

      async storeSensorData(data) {
        // Mock data storage
        logger.debug(`Storing sensor data:`, data);
        return { success: true };
      },
    };
  }

  createAnalyticsProcessor() {
    return {
      name: 'analytics',
      async process(deviceId, data) {
        logger.debug(`Processing analytics for device ${deviceId}`);

        // Generate analytics insights
        const analytics = {
          deviceId,
          timestamp: new Date().toISOString(),
          trends: this.generateTrends(data),
          anomalies: this.detectAnomalies(data),
          recommendations: this.generateRecommendations(data),
        };

        return analytics;
      },

      generateTrends(data) {
        // Mock trend generation
        return {
          direction: Math.random() > 0.5 ? 'increasing' : 'decreasing',
          rate: Math.random() * 10,
          confidence: Math.random() * 100,
        };
      },

      detectAnomalies(data) {
        // Mock anomaly detection
        const anomalies = [];
        if (Math.random() > 0.8) {
          anomalies.push({
            type: 'spike',
            severity: 'medium',
            description: 'Unusual reading detected',
          });
        }
        return anomalies;
      },

      generateRecommendations(data) {
        // Mock recommendation generation
        const recommendations = [
          'Consider adjusting temperature settings',
          'Check device calibration',
          'Schedule maintenance',
        ];

        return recommendations.slice(0, Math.floor(Math.random() * 2) + 1);
      },
    };
  }

  createAlertProcessor() {
    return {
      name: 'alerts',
      async process(deviceId, data, threshold) {
        logger.debug(`Processing alerts for device ${deviceId}`);

        // Check if alert conditions are met
        const alerts = [];

        if (data.value > threshold.max) {
          alerts.push({
            type: 'high_threshold',
            severity: 'warning',
            message: `Value ${data.value} exceeds maximum threshold ${threshold.max}`,
            deviceId,
            timestamp: new Date().toISOString(),
          });
        }

        if (data.value < threshold.min) {
          alerts.push({
            type: 'low_threshold',
            severity: 'warning',
            message: `Value ${data.value} below minimum threshold ${threshold.min}`,
            deviceId,
            timestamp: new Date().toISOString(),
          });
        }

        // Send alerts if any
        if (alerts.length > 0) {
          await this.sendAlerts(alerts);
        }

        return alerts;
      },

      async sendAlerts(alerts) {
        // Mock alert sending
        for (const alert of alerts) {
          logger.warn(`ALERT: ${alert.message}`);
        }
        return { success: true, alertsSent: alerts.length };
      },
    };
  }

  async registerDevice(deviceData) {
    try {
      logger.debug(`Registering IoT device:`, deviceData);

      if (!deviceData.type || !this.deviceTypes.includes(deviceData.type)) {
        throw new Error(`Invalid device type. Must be one of: ${this.deviceTypes.join(', ')}`);
      }

      const deviceManager = this.deviceManagers[deviceData.type];
      if (!deviceManager) {
        throw new Error(`Device manager not found for type: ${deviceData.type}`);
      }

      const device = await deviceManager.registerDevice(deviceData);

      // Store device reference
      this.devices.set(device.id, device);

      logger.info(`IoT device registered successfully: ${device.id}`);
      return { success: true, device };
    } catch (error) {
      logger.error('Failed to register IoT device:', error);
      throw error;
    }
  }

  async getDeviceById(deviceId) {
    return this.devices.get(deviceId);
  }

  async getAllDevices(filters = {}) {
    const devices = Array.from(this.devices.values());

    // Apply filters
    let filteredDevices = devices;

    if (filters.type) {
      filteredDevices = filteredDevices.filter((device) => device.type === filters.type);
    }

    if (filters.location) {
      filteredDevices = filteredDevices.filter((device) => device.location === filters.location);
    }

    if (filters.status) {
      filteredDevices = filteredDevices.filter((device) => device.status === filters.status);
    }

    return filteredDevices;
  }

  async updateDeviceStatus(deviceId, status) {
    try {
      const device = this.devices.get(deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      device.status = status;
      device.lastUpdate = new Date().toISOString();

      logger.info(`Device ${deviceId} status updated to: ${status}`);
      return { success: true, device };
    } catch (error) {
      logger.error(`Failed to update device ${deviceId} status:`, error);
      throw error;
    }
  }

  async sendDeviceCommand(deviceId, command) {
    try {
      const device = this.devices.get(deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      if (device.type !== 'controller') {
        throw new Error('Commands can only be sent to controller devices');
      }

      const deviceManager = this.deviceManagers.controller;
      const result = await deviceManager.sendCommand(deviceId, command);

      logger.info(`Command sent to device ${deviceId}:`, command);
      return result;
    } catch (error) {
      logger.error(`Failed to send command to device ${deviceId}:`, error);
      throw error;
    }
  }

  async processSensorData(deviceId, data) {
    try {
      const device = this.devices.get(deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      if (device.type !== 'sensor') {
        throw new Error('Data can only be processed from sensor devices');
      }

      // Process sensor data
      const processedData = await this.dataProcessors.sensor.process(deviceId, data);

      // Update device with latest reading
      const deviceManager = this.deviceManagers.sensor;
      await deviceManager.updateReading(deviceId, processedData);

      // Generate analytics
      const analytics = await this.dataProcessors.analytics.process(deviceId, processedData);

      // Check for alerts
      const alerts = await this.dataProcessors.alerts.process(
        deviceId,
        processedData,
        device.config.thresholds,
      );

      logger.debug(`Sensor data processed for device ${deviceId}`);
      return { processedData, analytics, alerts };
    } catch (error) {
      logger.error(`Failed to process sensor data for device ${deviceId}:`, error);
      throw error;
    }
  }

  async getDeviceMetrics(deviceId, timeRange = '24h') {
    try {
      const device = this.devices.get(deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      // Mock metrics generation
      const metrics = {
        deviceId,
        timeRange,
        uptime: Math.random() * 100,
        dataPoints: Math.floor(Math.random() * 1000) + 100,
        averageValue: Math.random() * 50 + 25,
        minValue: Math.random() * 20,
        maxValue: Math.random() * 30 + 70,
        lastUpdate: device.lastUpdate,
      };

      return metrics;
    } catch (error) {
      logger.error(`Failed to get metrics for device ${deviceId}:`, error);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const totalDevices = this.devices.size;
      const activeDevices = Array.from(this.devices.values()).filter(
        (d) => d.status === 'active',
      ).length;
      const offlineDevices = totalDevices - activeDevices;

      const health = {
        overall: (activeDevices / totalDevices) * 100,
        totalDevices,
        activeDevices,
        offlineDevices,
        lastCheck: new Date().toISOString(),
        recommendations: [],
      };

      if (health.overall < 80) {
        health.recommendations.push('System health below 80%. Check offline devices.');
      }

      if (offlineDevices > 0) {
        health.recommendations.push(
          `${offlineDevices} devices are offline. Investigate connectivity issues.`,
        );
      }

      return health;
    } catch (error) {
      logger.error('Failed to get system health:', error);
      throw error;
    }
  }

  startBackgroundProcesses() {
    // Start background processes
    setInterval(
      async () => {
        try {
          await this.healthCheck();
          await this.cleanupInactiveDevices();
        } catch (error) {
          logger.error('Error in background processes:', error);
        }
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
  }

  async healthCheck() {
    logger.debug('Performing IoT system health check');

    // Check device connectivity
    for (const [id, device] of this.devices) {
      const timeSinceUpdate = Date.now() - new Date(device.lastUpdate).getTime();
      const maxInactiveTime = 10 * 60 * 1000; // 10 minutes

      if (timeSinceUpdate > maxInactiveTime && device.status === 'active') {
        logger.warn(`Device ${id} appears to be inactive. Marking as offline.`);
        device.status = 'offline';
      }
    }

    logger.debug('IoT system health check completed');
  }

  async cleanupInactiveDevices() {
    logger.debug('Cleaning up inactive IoT devices');

    // This would remove devices that have been offline for too long
    // For now, just log the cleanup
    logger.debug('IoT device cleanup completed');
  }
}
