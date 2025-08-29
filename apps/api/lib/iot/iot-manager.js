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
    this.sensorTypes = ['temperature', 'humidity', 'occupancy', 'air_quality', 'light', 'motion', 'noise'];
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
      display: this.createDisplayManager()
    };
    
    // Initialize data processors
    this.dataProcessors = {
      sensor: this.createSensorDataProcessor(),
      analytics: this.createAnalyticsProcessor(),
      alerts: this.createAlertProcessor()
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
          config: deviceData.config || {}
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
      }
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
          config: deviceData.config || {}
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
      }
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
          config: deviceData.config || {}
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
      }
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
          config: deviceData.config || {}
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
      }
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
          config: deviceData.config || {}
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
      }
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
          processed: true
        };
        
        // Store processed data
        await this.storeSensorData(processedData);
        
        return processedData;
      },
      
      assessDataQuality(data) {
        // Assess data quality based on actual data properties
        let qualityScore = 1.0;
        
        // Check for missing or invalid values
        if (!data || data.value === undefined || data.value === null) {
          qualityScore -= 0.5;
        }
        
        // Check for reasonable value ranges based on sensor type
        if (data.sensorType === 'temperature' && (data.value < -50 || data.value > 100)) {
          qualityScore -= 0.3;
        } else if (data.sensorType === 'humidity' && (data.value < 0 || data.value > 100)) {
          qualityScore -= 0.3;
        } else if (data.sensorType === 'occupancy' && (data.value < 0)) {
          qualityScore -= 0.3;
        }
        
        // Check data freshness (assuming timestamp is provided)
        if (data.timestamp) {
          const age = Date.now() - new Date(data.timestamp).getTime();
          if (age > 300000) { // older than 5 minutes
            qualityScore -= 0.2;
          }
        }
        
        // Check for missing metadata
        if (!data.unit) qualityScore -= 0.1;
        if (!data.sensorType) qualityScore -= 0.1;
        
        // Determine quality level
        if (qualityScore > 0.9) return 'excellent';
        if (qualityScore > 0.7) return 'good';
        if (qualityScore > 0.5) return 'fair';
        return 'poor';
      },
      
      async storeSensorData(data) {
        // Mock data storage
        logger.debug(`Storing sensor data:`, data);
        return { success: true };
      }
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
          recommendations: this.generateRecommendations(data)
        };
        
        return analytics;
      },
      
      generateTrends(data) {
        // Analyze data trends based on historical values and current reading
        let direction = 'stable';
        let rate = 0;
        let confidence = 50;
        
        // Use current data point to influence trend calculation
        if (data && data.value !== undefined) {
          // Simulate trend analysis based on data properties
          const currentValue = parseFloat(data.value);
          
          // Use data characteristics to determine trend direction
          if (data.sensorType === 'temperature') {
            // Temperature trending logic
            direction = currentValue > 25 ? 'increasing' : currentValue < 15 ? 'decreasing' : 'stable';
            rate = Math.abs(currentValue - 20) * 0.5; // rate based on deviation from average
          } else if (data.sensorType === 'humidity') {
            // Humidity trending logic  
            direction = currentValue > 60 ? 'increasing' : currentValue < 30 ? 'decreasing' : 'stable';
            rate = Math.abs(currentValue - 45) * 0.3;
          } else if (data.sensorType === 'occupancy') {
            // Occupancy trending logic
            direction = currentValue > 5 ? 'increasing' : currentValue === 0 ? 'decreasing' : 'stable';
            rate = currentValue * 2;
          } else {
            // Generic trending for other sensor types
            direction = currentValue > 50 ? 'increasing' : currentValue < 25 ? 'decreasing' : 'stable';
            rate = Math.abs(currentValue - 37.5) * 0.4;
          }
          
          // Higher confidence for more extreme values
          confidence = Math.min(95, 60 + Math.abs(currentValue - 50) * 0.7);
        }
        
        return {
          direction,
          rate: Math.round(rate * 100) / 100,
          confidence: Math.round(confidence)
        };
      },
      
      detectAnomalies(data) {
        // Detect anomalies based on actual data characteristics
        const anomalies = [];
        
        if (!data || data.value === undefined) {
          anomalies.push({
            type: 'missing_data',
            severity: 'high',
            description: 'No data value provided'
          });
          return anomalies;
        }
        
        const value = parseFloat(data.value);
        
        // Detect sensor-specific anomalies
        if (data.sensorType === 'temperature') {
          if (value > 50 || value < -10) {
            anomalies.push({
              type: 'extreme_value',
              severity: value > 70 || value < -20 ? 'critical' : 'high',
              description: `Temperature reading of ${value}°C is outside normal range`,
              value: value
            });
          }
        } else if (data.sensorType === 'humidity') {
          if (value > 95 || value < 5) {
            anomalies.push({
              type: 'extreme_value', 
              severity: 'high',
              description: `Humidity reading of ${value}% is outside normal range`,
              value: value
            });
          }
        } else if (data.sensorType === 'occupancy') {
          if (value > 100) {
            anomalies.push({
              type: 'impossible_value',
              severity: 'critical',
              description: `Occupancy count of ${value} exceeds room capacity`,
              value: value
            });
          }
        }
        
        // Check for rapid changes (if previous value available)
        if (data.previousValue !== undefined) {
          const change = Math.abs(value - data.previousValue);
          const changePercent = (change / Math.abs(data.previousValue)) * 100;
          
          if (changePercent > 50) {
            anomalies.push({
              type: 'rapid_change',
              severity: changePercent > 100 ? 'high' : 'medium',
              description: `Rapid ${changePercent.toFixed(1)}% change from ${data.previousValue} to ${value}`,
              value: value,
              previousValue: data.previousValue,
              changePercent: changePercent
            });
          }
        }
        
        // Check data staleness
        if (data.timestamp) {
          const age = Date.now() - new Date(data.timestamp).getTime();
          if (age > 600000) { // older than 10 minutes
            anomalies.push({
              type: 'stale_data',
              severity: age > 3600000 ? 'high' : 'medium', // high if older than 1 hour
              description: `Data is ${Math.round(age / 60000)} minutes old`,
              ageMinutes: Math.round(age / 60000)
            });
          }
        }
        
        return anomalies;
      },
      
      generateRecommendations(data) {
        // Generate data-driven recommendations based on sensor readings
        const recommendations = [];
        
        if (!data || data.value === undefined) {
          recommendations.push('Check sensor connectivity and ensure data transmission');
          return recommendations;
        }
        
        const value = parseFloat(data.value);
        
        // Sensor-specific recommendations
        if (data.sensorType === 'temperature') {
          if (value > 26) {
            recommendations.push('Consider lowering temperature settings for energy efficiency');
            if (value > 30) {
              recommendations.push('Check HVAC system performance - temperature is unusually high');
            }
          } else if (value < 18) {
            recommendations.push('Consider raising temperature for occupant comfort');
            if (value < 10) {
              recommendations.push('Check heating system - temperature is critically low');
            }
          }
        } else if (data.sensorType === 'humidity') {
          if (value > 70) {
            recommendations.push('Consider increasing ventilation to reduce humidity');
            if (value > 80) {
              recommendations.push('High humidity detected - check for water leaks or inadequate ventilation');
            }
          } else if (value < 30) {
            recommendations.push('Consider adding humidification for comfort');
          }
        } else if (data.sensorType === 'occupancy') {
          if (value > 80) {
            recommendations.push('High occupancy detected - consider space expansion or schedule optimization');
          } else if (value === 0) {
            recommendations.push('Space is unoccupied - consider energy-saving mode activation');
          }
        } else if (data.sensorType === 'air_quality') {
          if (value > 150) {
            recommendations.push('Poor air quality detected - increase ventilation or check air filters');
          }
        }
        
        // Quality-based recommendations
        if (data.quality === 'poor') {
          recommendations.push('Sensor data quality is poor - consider device calibration or replacement');
        }
        
        // Time-based recommendations
        if (data.timestamp) {
          const age = Date.now() - new Date(data.timestamp).getTime();
          if (age > 300000) { // older than 5 minutes
            recommendations.push('Sensor data is stale - check device connectivity');
          }
        }
        
        // General maintenance recommendations based on reading patterns
        if (data.consecutiveAnomalies && data.consecutiveAnomalies > 3) {
          recommendations.push('Multiple anomalies detected - schedule device inspection');
        }
        
        return recommendations.length > 0 ? recommendations : ['Sensor operating normally - no actions required'];
      }
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
            timestamp: new Date().toISOString()
          });
        }
        
        if (data.value < threshold.min) {
          alerts.push({
            type: 'low_threshold',
            severity: 'warning',
            message: `Value ${data.value} below minimum threshold ${threshold.min}`,
            deviceId,
            timestamp: new Date().toISOString()
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
      }
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
      filteredDevices = filteredDevices.filter(device => device.type === filters.type);
    }
    
    if (filters.location) {
      filteredDevices = filteredDevices.filter(device => device.location === filters.location);
    }
    
    if (filters.status) {
      filteredDevices = filteredDevices.filter(device => device.status === filters.status);
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
      const alerts = await this.dataProcessors.alerts.process(deviceId, processedData, device.config.thresholds);
      
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
        lastUpdate: device.lastUpdate
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
      const activeDevices = Array.from(this.devices.values()).filter(d => d.status === 'active').length;
      const offlineDevices = totalDevices - activeDevices;
      
      const health = {
        overall: activeDevices / totalDevices * 100,
        totalDevices,
        activeDevices,
        offlineDevices,
        lastCheck: new Date().toISOString(),
        recommendations: []
      };
      
      if (health.overall < 80) {
        health.recommendations.push('System health below 80%. Check offline devices.');
      }
      
      if (offlineDevices > 0) {
        health.recommendations.push(`${offlineDevices} devices are offline. Investigate connectivity issues.`);
      }
      
      return health;
    } catch (error) {
      logger.error('Failed to get system health:', error);
      throw error;
    }
  }

  startBackgroundProcesses() {
    // Start background processes
    setInterval(async () => {
      try {
        await this.healthCheck();
        await this.cleanupInactiveDevices();
      } catch (error) {
        logger.error('Error in background processes:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
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
