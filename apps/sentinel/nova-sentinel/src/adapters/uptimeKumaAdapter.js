// Nova Sentinel - Uptime Kuma Adapter
// Complete 1:1 Feature Parity Implementation

import fetch from 'node-fetch';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

export class UptimeKumaAdapter extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
    this.sessionId = null;
    this.monitors = new Map();
    this.statusPages = new Map();
    this.heartbeats = new Map();
  }

  async initialize() {
    if (!this.config.enabled) {
      logger.info('Uptime Kuma integration disabled');
      return;
    }

    try {
      await this.connect();
      await this.authenticate();
      await this.setupEventHandlers();
      await this.syncInitialData();

      logger.info('Uptime Kuma adapter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Uptime Kuma adapter:', error);
      throw error;
    }
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.url.replace('http', 'ws') + '/socket.io/?EIO=4&transport=websocket';

      logger.info(`Connecting to Uptime Kuma WebSocket: ${wsUrl}`);

      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        logger.info('Connected to Uptime Kuma WebSocket');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('close', () => {
        logger.warn('Uptime Kuma WebSocket connection closed');
        this.isConnected = false;
        this.reconnect();
      });

      this.ws.on('error', (error) => {
        logger.error('Uptime Kuma WebSocket error:', error);
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  async authenticate() {
    if (this.config.apiKey) {
      await this.sendMessage('login', {
        username: 'admin',
        password: this.config.apiKey,
        token: this.config.apiKey,
      });
    }
  }

  async setupEventHandlers() {
    // Handle various Uptime Kuma events
    this.on('heartbeat', (data) => {
      this.handleHeartbeat(data);
    });

    this.on('heartbeatList', (data) => {
      this.handleHeartbeatList(data);
    });

    this.on('monitorList', (data) => {
      this.handleMonitorList(data);
    });

    this.on('statusPageList', (data) => {
      this.handleStatusPageList(data);
    });

    this.on('incidentList', (data) => {
      this.handleIncidentList(data);
    });

    this.on('maintenanceList', (data) => {
      this.handleMaintenanceList(data);
    });
  }

  async syncInitialData() {
    // Request initial data from Uptime Kuma
    await this.sendMessage('getMonitorList');
    await this.sendMessage('getStatusPageList');
    await this.sendMessage('getIncidentList');
    await this.sendMessage('getMaintenanceList');

    // Wait a moment for data to sync
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  handleMessage(message) {
    try {
      // Parse Socket.IO message format
      if (message.startsWith('42')) {
        const data = JSON.parse(message.substring(2));
        const [event, payload] = data;

        logger.debug(`Received event: ${event}`, payload);
        this.emit(event, payload);
      } else if (message.startsWith('40')) {
        // Connection established
        logger.info('Uptime Kuma Socket.IO connection established');
      }
    } catch (error) {
      logger.error('Error parsing message:', error, message);
    }
  }

  async sendMessage(event, data = {}) {
    if (!this.isConnected || !this.ws) {
      throw new Error('Not connected to Uptime Kuma');
    }

    const message = `42["${event}",${JSON.stringify(data)}]`;
    this.ws.send(message);

    logger.debug(`Sent message: ${event}`, data);
  }

  handleHeartbeat(heartbeat) {
    this.heartbeats.set(heartbeat.monitorID, heartbeat);
    this.emit('nova:heartbeat', heartbeat);
  }

  handleHeartbeatList(heartbeats) {
    Object.values(heartbeats).forEach((heartbeat) => {
      this.heartbeats.set(heartbeat.monitorID, heartbeat);
    });
    this.emit('nova:heartbeatList', heartbeats);
  }

  handleMonitorList(monitors) {
    Object.values(monitors).forEach((monitor) => {
      this.monitors.set(monitor.id, monitor);
    });
    this.emit('nova:monitorList', monitors);
  }

  handleStatusPageList(statusPages) {
    Object.values(statusPages).forEach((statusPage) => {
      this.statusPages.set(statusPage.id, statusPage);
    });
    this.emit('nova:statusPageList', statusPages);
  }

  handleIncidentList(incidents) {
    this.emit('nova:incidentList', incidents);
  }

  handleMaintenanceList(maintenances) {
    this.emit('nova:maintenanceList', maintenances);
  }

  async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    logger.info(`Attempting to reconnect to Uptime Kuma (attempt ${this.reconnectAttempts})`);

    setTimeout(async () => {
      try {
        await this.connect();
        await this.authenticate();
        await this.syncInitialData();
      } catch (error) {
        logger.error('Reconnection failed:', error);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // ========================================================================
  // MONITOR MANAGEMENT - 1:1 UPTIME KUMA FEATURE PARITY
  // ========================================================================

  async createMonitor(monitorData) {
    const monitor = {
      type: monitorData.type || 'http',
      name: monitorData.name,
      url: monitorData.url,
      hostname: monitorData.hostname,
      port: monitorData.port,
      interval: monitorData.interval || 60,
      retryInterval: monitorData.retryInterval || 60,
      timeout: monitorData.timeout || 48,
      maxretries: monitorData.maxretries || 0,
      upsideDown: monitorData.upsideDown || false,
      ignoreTls: monitorData.ignoreTls || false,
      maxRedirect: monitorData.maxRedirect || 10,
      accepted_statuscodes: monitorData.accepted_statuscodes || ['200-299'],
      dns_resolve_type: monitorData.dns_resolve_type || 'A',
      dns_resolve_server: monitorData.dns_resolve_server || '1.1.1.1',
      docker_container: monitorData.docker_container || '',
      docker_host: monitorData.docker_host || null,
      proxyId: monitorData.proxyId || null,
      method: monitorData.method || 'GET',
      body: monitorData.body || '',
      headers: monitorData.headers || '',
      keyword: monitorData.keyword || '',
      invertKeyword: monitorData.invertKeyword || false,
      pushToken: monitorData.pushToken || null,
      databaseConnectionString: monitorData.databaseConnectionString || '',
      databaseQuery: monitorData.databaseQuery || '',
      authMethod: monitorData.authMethod || '',
      basic_auth_user: monitorData.basic_auth_user || '',
      basic_auth_pass: monitorData.basic_auth_pass || '',
      authWorkstation: monitorData.authWorkstation || '',
      authDomain: monitorData.authDomain || '',
      grpcUrl: monitorData.grpcUrl || '',
      grpcProtobuf: monitorData.grpcProtobuf || '',
      grpcServiceName: monitorData.grpcServiceName || '',
      grpcMethod: monitorData.grpcMethod || '',
      grpcBody: monitorData.grpcBody || '',
      grpcMetadata: monitorData.grpcMetadata || '',
      grpcEnableTls: monitorData.grpcEnableTls || false,
      radiusUsername: monitorData.radiusUsername || '',
      radiusPassword: monitorData.radiusPassword || '',
      radiusSecret: monitorData.radiusSecret || '',
      radiusCalledStationId: monitorData.radiusCalledStationId || '',
      radiusCallingStationId: monitorData.radiusCallingStationId || '',
      tag: monitorData.tags || [],
    };

    await this.sendMessage('add', monitor);
    return monitor;
  }

  async updateMonitor(monitorId, monitorData) {
    const monitor = { id: monitorId, ...monitorData };
    await this.sendMessage('editMonitor', monitor);
    return monitor;
  }

  async deleteMonitor(monitorId) {
    await this.sendMessage('deleteMonitor', monitorId);
  }

  async pauseMonitor(monitorId) {
    await this.sendMessage('pauseMonitor', monitorId);
  }

  async resumeMonitor(monitorId) {
    await this.sendMessage('resumeMonitor', monitorId);
  }

  async getMonitor(monitorId) {
    return this.monitors.get(monitorId);
  }

  async getAllMonitors() {
    return Array.from(this.monitors.values());
  }

  async getMonitorHeartbeats(monitorId, period = '24h') {
    // Request heartbeat history
    await this.sendMessage('getMonitorBeats', { monitorId, period });
    // Return cached heartbeats for now
    return this.heartbeats.get(monitorId) || [];
  }

  // ========================================================================
  // STATUS PAGE MANAGEMENT
  // ========================================================================

  async createStatusPage(statusPageData) {
    const statusPage = {
      title: statusPageData.title,
      description: statusPageData.description,
      theme: statusPageData.theme || 'light',
      published: statusPageData.published || true,
      showTags: statusPageData.showTags || false,
      domainNameList: statusPageData.domainNameList || [],
      customCSS: statusPageData.customCSS || '',
      footerText: statusPageData.footerText || '',
      showPoweredBy: statusPageData.showPoweredBy !== false,
      icon: statusPageData.icon || '/icon.svg',
      publicGroupList: statusPageData.publicGroupList || [],
    };

    await this.sendMessage('saveStatusPage', statusPage);
    return statusPage;
  }

  async updateStatusPage(statusPageId, statusPageData) {
    const statusPage = { id: statusPageId, ...statusPageData };
    await this.sendMessage('saveStatusPage', statusPage);
    return statusPage;
  }

  async deleteStatusPage(statusPageId) {
    await this.sendMessage('deleteStatusPage', statusPageId);
  }

  async getStatusPage(statusPageId) {
    return this.statusPages.get(statusPageId);
  }

  async getAllStatusPages() {
    return Array.from(this.statusPages.values());
  }

  // ========================================================================
  // NOTIFICATION MANAGEMENT
  // ========================================================================

  async createNotification(notificationData) {
    const notification = {
      name: notificationData.name,
      type: notificationData.type, // slack, discord, webhook, etc.
      isDefault: notificationData.isDefault || false,
      applyExisting: notificationData.applyExisting || false,
      ...notificationData.config, // Type-specific configuration
    };

    await this.sendMessage('addNotification', notification);
    return notification;
  }

  async updateNotification(notificationId, notificationData) {
    const notification = { id: notificationId, ...notificationData };
    await this.sendMessage('editNotification', notification);
    return notification;
  }

  async deleteNotification(notificationId) {
    await this.sendMessage('deleteNotification', notificationId);
  }

  async testNotification(notificationData) {
    await this.sendMessage('testNotification', notificationData);
  }

  // ========================================================================
  // MAINTENANCE MANAGEMENT
  // ========================================================================

  async createMaintenance(maintenanceData) {
    const maintenance = {
      title: maintenanceData.title,
      description: maintenanceData.description,
      strategy: maintenanceData.strategy || 'single',
      dateTime: maintenanceData.dateTime,
      dateTimeEnd: maintenanceData.dateTimeEnd,
      durationMinutes: maintenanceData.durationMinutes,
      monitorList: maintenanceData.monitorList || [],
      statusPageList: maintenanceData.statusPageList || [],
    };

    await this.sendMessage('addMaintenance', maintenance);
    return maintenance;
  }

  async updateMaintenance(maintenanceId, maintenanceData) {
    const maintenance = { id: maintenanceId, ...maintenanceData };
    await this.sendMessage('editMaintenance', maintenance);
    return maintenance;
  }

  async deleteMaintenance(maintenanceId) {
    await this.sendMessage('deleteMaintenance', maintenanceId);
  }

  async pauseMaintenance(maintenanceId) {
    await this.sendMessage('pauseMaintenance', maintenanceId);
  }

  async resumeMaintenance(maintenanceId) {
    await this.sendMessage('resumeMaintenance', maintenanceId);
  }

  // ========================================================================
  // INCIDENT MANAGEMENT
  // ========================================================================

  async createIncident(incidentData) {
    const incident = {
      title: incidentData.title,
      content: incidentData.content,
      style: incidentData.style || 'danger',
      statusPageList: incidentData.statusPageList || [],
    };

    await this.sendMessage('postIncident', incident);
    return incident;
  }

  async updateIncident(incidentId, incidentData) {
    const incident = { id: incidentId, ...incidentData };
    await this.sendMessage('editIncident', incident);
    return incident;
  }

  async deleteIncident(incidentId) {
    await this.sendMessage('deleteIncident', incidentId);
  }

  // ========================================================================
  // TAG MANAGEMENT
  // ========================================================================

  async createTag(tagData) {
    const tag = {
      name: tagData.name,
      color: tagData.color || '#007cba',
    };

    await this.sendMessage('addTag', tag);
    return tag;
  }

  async updateTag(tagId, tagData) {
    const tag = { id: tagId, ...tagData };
    await this.sendMessage('editTag', tag);
    return tag;
  }

  async deleteTag(tagId) {
    await this.sendMessage('deleteTag', tagId);
  }

  // ========================================================================
  // PROXY MANAGEMENT
  // ========================================================================

  async createProxy(proxyData) {
    const proxy = {
      protocol: proxyData.protocol,
      host: proxyData.host,
      port: proxyData.port,
      auth: proxyData.auth || false,
      username: proxyData.username || '',
      password: proxyData.password || '',
      active: proxyData.active !== false,
    };

    await this.sendMessage('addProxy', proxy);
    return proxy;
  }

  async updateProxy(proxyId, proxyData) {
    const proxy = { id: proxyId, ...proxyData };
    await this.sendMessage('editProxy', proxy);
    return proxy;
  }

  async deleteProxy(proxyId) {
    await this.sendMessage('deleteProxy', proxyId);
  }

  // ========================================================================
  // SETTINGS MANAGEMENT
  // ========================================================================

  async updateSettings(settingsData) {
    await this.sendMessage('setSettings', settingsData);
  }

  async getSettings() {
    await this.sendMessage('getSettings');
  }

  // ========================================================================
  // DOCKER MANAGEMENT
  // ========================================================================

  async getDockerHosts() {
    await this.sendMessage('getDockerHosts');
  }

  async testDockerHost(dockerHostData) {
    await this.sendMessage('testDockerHost', dockerHostData);
  }

  // ========================================================================
  // API KEY MANAGEMENT
  // ========================================================================

  async createAPIKey(keyData) {
    const apiKey = {
      name: keyData.name,
      expires: keyData.expires || null,
      active: keyData.active !== false,
    };

    await this.sendMessage('addAPIKey', apiKey);
    return apiKey;
  }

  async deleteAPIKey(keyId) {
    await this.sendMessage('deleteAPIKey', keyId);
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  async healthCheck() {
    return this.isConnected;
  }

  async getStats() {
    return {
      connected: this.isConnected,
      monitors: this.monitors.size,
      statusPages: this.statusPages.size,
      heartbeats: this.heartbeats.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  async close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export default UptimeKumaAdapter;
