// Nova WebSocket Handler - Uptime Kuma Real-time Integration
// Handles Socket.IO communication with Uptime Kuma backend and forwards events to Nova clients

import { logger } from '../logger.js';
import { io as Client } from 'socket.io-client';

class UptimeKumaWebSocketHandler {
  constructor() {
    this.kumaSocket = null;
    this.novaClients = new Set();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000;
  }

  // Initialize connection to Uptime Kuma Socket.IO server
  async initialize() {
    try {
      const kumaUrl = process.env.UPTIME_KUMA_URL || 'http://localhost:3001';

      this.kumaSocket = Client(kumaUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      });

      this.setupKumaEventHandlers();

      // Attempt to authenticate with Uptime Kuma
      await this.authenticateWithKuma();

      logger.info('Uptime Kuma WebSocket handler initialized', { kumaUrl });
    } catch (error) {
      logger.error('Failed to initialize Uptime Kuma WebSocket handler', { error: error.message });
      this.scheduleReconnect();
    }
  }

  // Authenticate with Uptime Kuma using admin credentials
  async authenticateWithKuma() {
    return new Promise((resolve, reject) => {
      if (!this.kumaSocket) {
        reject(new Error('Kuma socket not initialized'));
        return;
      }

      // Check if authentication is required
      this.kumaSocket.on('loginRequired', () => {
        logger.info('Uptime Kuma login required, attempting authentication...');

        // Use environment variables for Kuma authentication
        const username = process.env.UPTIME_KUMA_USERNAME || 'admin';
        const password = process.env.UPTIME_KUMA_PASSWORD || 'nova-admin';

        this.kumaSocket.emit(
          'login',
          {
            username,
            password,
          },
          (response) => {
            if (response.ok) {
              logger.info('Successfully authenticated with Uptime Kuma');
              this.isConnected = true;
              this.reconnectAttempts = 0;
              resolve(response);
            } else {
              logger.error('Failed to authenticate with Uptime Kuma', { error: response.msg });
              reject(new Error(response.msg || 'Authentication failed'));
            }
          },
        );
      });

      // Handle direct connection without auth requirement
      this.kumaSocket.on('connect', () => {
        logger.info('Connected to Uptime Kuma WebSocket');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve({ ok: true });
      });

      // Handle connection errors
      this.kumaSocket.on('connect_error', (error) => {
        logger.error('Uptime Kuma connection error', { error: error.message });
        reject(error);
      });
    });
  }

  // Set up event handlers for Uptime Kuma events
  setupKumaEventHandlers() {
    if (!this.kumaSocket) return;

    // Handle real-time heartbeat updates
    this.kumaSocket.on('heartbeat', (heartbeat) => {
      const transformedEvent = {
        type: heartbeat.status === 1 ? 'monitor_up' : 'monitor_down',
        data: {
          monitorId: heartbeat.monitorID,
          status: heartbeat.status === 1 ? 'up' : 'down',
          responseTime: heartbeat.ping || 0,
          message: heartbeat.msg,
          timestamp: heartbeat.time,
          important: heartbeat.important,
        },
      };

      logger.debug('Received Uptime Kuma heartbeat', transformedEvent);
      this.broadcastToNovaClients(transformedEvent);
    });

    // Handle monitor list updates
    this.kumaSocket.on('monitorList', (monitors) => {
      const transformedEvent = {
        type: 'monitors_updated',
        data: Object.values(monitors).map((monitor) => ({
          id: monitor.id.toString(),
          name: monitor.name,
          type: monitor.type,
          status: monitor.active ? 'up' : 'down',
          url: monitor.url,
          isActive: monitor.active,
        })),
      };

      logger.debug('Received Uptime Kuma monitor list update', {
        count: Object.keys(monitors).length,
      });
      this.broadcastToNovaClients(transformedEvent);
    });

    // Handle individual monitor updates
    this.kumaSocket.on('updateMonitorIntoList', (monitors) => {
      const transformedEvent = {
        type: 'monitor_updated',
        data: Object.values(monitors).map((monitor) => ({
          id: monitor.id.toString(),
          name: monitor.name,
          type: monitor.type,
          status: monitor.active ? 'up' : 'down',
          url: monitor.url,
          isActive: monitor.active,
        })),
      };

      logger.debug('Received Uptime Kuma monitor update');
      this.broadcastToNovaClients(transformedEvent);
    });

    // Handle monitor deletions
    this.kumaSocket.on('deleteMonitorFromList', (monitorId) => {
      const transformedEvent = {
        type: 'monitor_deleted',
        data: {
          monitorId: monitorId.toString(),
        },
      };

      logger.debug('Received Uptime Kuma monitor deletion', { monitorId });
      this.broadcastToNovaClients(transformedEvent);
    });

    // Handle uptime percentage updates
    this.kumaSocket.on('uptime', (data) => {
      const transformedEvent = {
        type: 'uptime_updated',
        data: {
          monitorId: data.monitorID.toString(),
          period: data.periodKey,
          uptime: data.percentage,
        },
      };

      logger.debug('Received Uptime Kuma uptime update');
      this.broadcastToNovaClients(transformedEvent);
    });

    // Handle average ping updates
    this.kumaSocket.on('avgPing', (data) => {
      const transformedEvent = {
        type: 'avg_ping_updated',
        data: {
          monitorId: data.monitorID.toString(),
          avgPing: data.avgPing,
        },
      };

      this.broadcastToNovaClients(transformedEvent);
    });

    // Handle certificate info updates
    this.kumaSocket.on('certInfo', (data) => {
      const transformedEvent = {
        type: 'cert_info_updated',
        data: {
          monitorId: data.monitorID.toString(),
          certInfo: JSON.parse(data.tlsInfoJSON || '{}'),
        },
      };

      this.broadcastToNovaClients(transformedEvent);
    });

    // Handle disconnection
    this.kumaSocket.on('disconnect', (reason) => {
      logger.warn('Disconnected from Uptime Kuma WebSocket', { reason });
      this.isConnected = false;
      this.scheduleReconnect();
    });

    // Handle errors
    this.kumaSocket.on('error', (error) => {
      logger.error('Uptime Kuma WebSocket error', { error });
    });
  }

  // Broadcast events to all connected Nova clients
  broadcastToNovaClients(event) {
    const message = JSON.stringify(event);

    this.novaClients.forEach((client) => {
      try {
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.send(message);
        } else {
          // Remove disconnected clients
          this.novaClients.delete(client);
        }
      } catch (error) {
        logger.error('Failed to send message to Nova client', { error: error.message });
        this.novaClients.delete(client);
      }
    });

    logger.debug('Broadcasted event to Nova clients', {
      event: event.type,
      clientCount: this.novaClients.size,
    });
  }

  // Add a Nova WebSocket client
  addNovaClient(ws) {
    this.novaClients.add(ws);
    logger.debug('Nova client connected to Uptime Kuma events', {
      clientCount: this.novaClients.size,
    });

    // Send connection status
    ws.send(
      JSON.stringify({
        type: 'connection_status',
        data: {
          connected: this.isConnected,
          kumaConnected: this.kumaSocket?.connected || false,
        },
      }),
    );

    // Handle client disconnect
    ws.on('close', () => {
      this.novaClients.delete(ws);
      logger.debug('Nova client disconnected from Uptime Kuma events', {
        clientCount: this.novaClients.size,
      });
    });

    ws.on('error', (error) => {
      logger.error('Nova client WebSocket error', { error: error.message });
      this.novaClients.delete(ws);
    });
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached for Uptime Kuma WebSocket');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    logger.info('Scheduling Uptime Kuma WebSocket reconnection', {
      attempt: this.reconnectAttempts,
      delay: delay / 1000 + 's',
    });

    setTimeout(() => {
      this.initialize();
    }, delay);
  }

  // Clean shutdown
  shutdown() {
    logger.info('Shutting down Uptime Kuma WebSocket handler');

    if (this.kumaSocket) {
      this.kumaSocket.disconnect();
      this.kumaSocket = null;
    }

    this.novaClients.forEach((client) => {
      try {
        client.close();
      } catch {
        // Ignore errors when closing
      }
    });

    this.novaClients.clear();
    this.isConnected = false;
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      kumaConnected: this.kumaSocket?.connected || false,
      clientCount: this.novaClients.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Singleton instance
const uptimeKumaWsHandler = new UptimeKumaWebSocketHandler();

// Express WebSocket handler for Nova clients
export function handleUptimeKumaWebSocket(ws, _req) {
  // Add authentication middleware for WebSocket connections
  // In a real implementation, you'd validate the JWT token from the WebSocket connection

  logger.info('New WebSocket connection for Uptime Kuma events');
  uptimeKumaWsHandler.addNovaClient(ws);
}

// Initialize the handler
export async function initializeUptimeKumaWebSocket() {
  await uptimeKumaWsHandler.initialize();
}

// Shutdown the handler
export function shutdownUptimeKumaWebSocket() {
  uptimeKumaWsHandler.shutdown();
}

// Get handler status
export function getUptimeKumaWebSocketStatus() {
  return uptimeKumaWsHandler.getStatus();
}

export default uptimeKumaWsHandler;
