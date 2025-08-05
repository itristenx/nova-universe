// WebSocket event handlers for real-time updates
import { logger } from '../logger.js';
import events from '../events.js';

export class WebSocketManager {
  constructor(io) {
    this.io = io;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Ticket-related events
    events.on('ticket-created', (ticket) => {
      this.broadcastToSubscribers('tickets', {
        type: 'ticket_created',
        data: ticket,
        timestamp: new Date().toISOString()
      });
      
      // Send notification to admins
      this.broadcastToRoom('admin', {
        type: 'notification',
        data: {
          title: 'New Ticket Created',
          message: `Ticket #${ticket.id}: ${ticket.title}`,
          level: 'info',
          timestamp: new Date().toISOString()
        }
      });
    });

    events.on('ticket-updated', (ticket) => {
      this.broadcastToSubscribers('tickets', {
        type: 'ticket_updated',
        data: ticket,
        timestamp: new Date().toISOString()
      });
    });

    events.on('ticket-status-changed', (ticketData) => {
      this.broadcastToSubscribers('tickets', {
        type: 'ticket_status_changed',
        data: ticketData,
        timestamp: new Date().toISOString()
      });
    });

    // Kiosk-related events
    events.on('kiosk-registered', (kioskData) => {
      this.broadcastToSubscribers('kiosks', {
        type: 'kiosk_registered',
        data: kioskData,
        timestamp: new Date().toISOString()
      });
      
      this.broadcastToRoom('admin', {
        type: 'notification',
        data: {
          title: 'Kiosk Registered',
          message: `Kiosk ${kioskData.id} has come online`,
          level: 'success',
          timestamp: new Date().toISOString()
        }
      });
    });

    events.on('kiosk-offline', (kioskData) => {
      this.broadcastToSubscribers('kiosks', {
        type: 'kiosk_offline',
        data: kioskData,
        timestamp: new Date().toISOString()
      });
      
      this.broadcastToRoom('admin', {
        type: 'notification',
        data: {
          title: 'Kiosk Offline',
          message: `Kiosk ${kioskData.id} has gone offline`,
          level: 'warning',
          timestamp: new Date().toISOString()
        }
      });
    });

    // User-related events
    events.on('user-created', (userData) => {
      this.broadcastToSubscribers('users', {
        type: 'user_created',
        data: userData,
        timestamp: new Date().toISOString()
      });
    });

    events.on('user-updated', (userData) => {
      this.broadcastToSubscribers('users', {
        type: 'user_updated',
        data: userData,
        timestamp: new Date().toISOString()
      });
    });

    // System-related events
    events.on('system-alert', (alertData) => {
      this.broadcastToRoom('admin', {
        type: 'system_alert',
        data: alertData,
        timestamp: new Date().toISOString()
      });
    });

    events.on('module-status-changed', (moduleData) => {
      this.broadcastToSubscribers('modules', {
        type: 'module_status_changed',
        data: moduleData,
        timestamp: new Date().toISOString()
      });
    });

    // Configuration updates
    events.on('config-updated', (configData) => {
      this.broadcastToRoom('admin', {
        type: 'config_updated',
        data: configData,
        timestamp: new Date().toISOString()
      });
    });

    // Analytics updates (periodic)
    events.on('analytics-updated', (analyticsData) => {
      this.broadcastToSubscribers('analytics', {
        type: 'analytics_updated',
        data: analyticsData,
        timestamp: new Date().toISOString()
      });
    });

    logger.info('WebSocket event listeners initialized');
  }

  // Broadcast to all users subscribed to a specific data type
  broadcastToSubscribers(dataType, message) {
    this.io.to(dataType).emit('data_update', message);
    logger.debug(`Broadcast to ${dataType}: ${message.type}`);
  }

  // Broadcast to a specific room
  broadcastToRoom(room, message) {
    this.io.to(room).emit('realtime_update', message);
    logger.debug(`Broadcast to room ${room}: ${message.type}`);
  }

  // Send message to specific user
  sendToUser(userId, message) {
    this.io.to(`user_${userId}`).emit('user_update', message);
    logger.debug(`Message sent to user ${userId}: ${message.type}`);
  }

  // Broadcast system status
  broadcastSystemStatus(status) {
    this.broadcastToSubscribers('system_status', {
      type: 'system_status',
      data: status,
      timestamp: new Date().toISOString()
    });
  }

  // Get connection statistics
  getConnectionStats() {
    const sockets = this.io.sockets.sockets;
    const connectedUsers = new Set();
    
    sockets.forEach(socket => {
      if (socket.userId) {
        connectedUsers.add(socket.userId);
      }
    });

    return {
      totalConnections: sockets.size,
      authenticatedUsers: connectedUsers.size,
      timestamp: new Date().toISOString()
    };
  }
}

// Helper function to emit real-time updates from anywhere in the app
export function emitRealtimeUpdate(io, type, data) {
  if (io) {
    io.emit('realtime_update', {
      type,
      data,
      timestamp: new Date().toISOString()
    });
  }
}

export default WebSocketManager;
