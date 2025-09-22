// Real-time Security Monitoring and Alerting for Nova Universe API
// Implements comprehensive security monitoring with real-time alerts and dashboards

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { logger } from '../logger.js';
import { auditSecurity } from './audit-logging.js';

/**
 * Real-time monitoring configuration
 */
const MONITORING_CONFIG = {
  // Alert thresholds
  thresholds: {
    failedLogins: {
      count: 5,
      window: 5 * 60 * 1000, // 5 minutes
      severity: 'medium',
    },
    rateLimitExceeded: {
      count: 10,
      window: 10 * 60 * 1000, // 10 minutes
      severity: 'high',
    },
    suspiciousIPs: {
      count: 3,
      window: 15 * 60 * 1000, // 15 minutes
      severity: 'high',
    },
    passwordBreach: {
      count: 1,
      window: 0, // Immediate
      severity: 'critical',
    },
    intrusionAttempts: {
      count: 5,
      window: 10 * 60 * 1000, // 10 minutes
      severity: 'critical',
    },
    dataAccess: {
      count: 100,
      window: 60 * 60 * 1000, // 1 hour
      severity: 'medium',
    },
    systemErrors: {
      count: 20,
      window: 15 * 60 * 1000, // 15 minutes
      severity: 'high',
    },
  },
  
  // Alert channels
  channels: {
    websocket: true,
    email: process.env.ALERT_EMAIL_ENABLED === 'true',
    slack: process.env.ALERT_SLACK_ENABLED === 'true',
    webhook: process.env.ALERT_WEBHOOK_ENABLED === 'true',
  },
  
  // Dashboard update intervals
  dashboardUpdate: {
    realtime: 1000,    // 1 second for real-time metrics
    summary: 30000,    // 30 seconds for summary data
    analytics: 300000, // 5 minutes for analytics
  },
  
  // Data retention for real-time monitoring
  retention: {
    events: 1000,      // Keep last 1000 events in memory
    metrics: 2880,     // Keep 48 hours of minute-level metrics
    alerts: 10000,     // Keep last 10000 alerts
  },
};

/**
 * Real-time security monitor class
 */
class SecurityMonitor extends EventEmitter {
  constructor() {
    super();
    this.eventCounts = new Map(); // Event type -> count tracking
    this.recentEvents = []; // Circular buffer of recent events
    this.activeAlerts = new Map(); // Active alert tracking
    this.metrics = new Map(); // Real-time metrics
    this.websocketClients = new Set(); // Connected WebSocket clients
    this.wss = null; // WebSocket server
    
    this.startMetricsCollection();
    this.startAlertProcessing();
  }

  /**
   * Initialize WebSocket server for real-time updates
   */
  initializeWebSocket(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/security-monitor',
      verifyClient: () => {
        // Add authentication check here if needed
        return true;
      }
    });
    
    this.wss.on('connection', (ws, req) => {
      logger.info('Security monitor client connected', { 
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      this.websocketClients.add(ws);
      
      // Send initial dashboard data
      this.sendDashboardUpdate(ws);
      
      ws.on('close', () => {
        this.websocketClients.delete(ws);
        logger.debug('Security monitor client disconnected');
      });
      
      ws.on('error', (error) => {
        logger.error('WebSocket error', { error: error.message });
        this.websocketClients.delete(ws);
      });
      
      // Handle client messages (for filtering, etc.)
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          logger.warn('Invalid WebSocket message', { error: error.message });
        }
      });
    });
    
    logger.info('Security monitoring WebSocket server initialized');
  }

  /**
   * Process incoming security events
   */
  async processSecurityEvent(event) {
    try {
      // Add to recent events buffer
      this.addToRecentEvents(event);
      
      // Update event counts
      this.updateEventCounts(event);
      
      // Check alert thresholds
      await this.checkAlertThresholds(event);
      
      // Update real-time metrics
      this.updateMetrics(event);
      
      // Broadcast to WebSocket clients
      this.broadcastEvent(event);
      
      // Emit event for other handlers
      this.emit('securityEvent', event);
      
    } catch (error) {
      logger.error('Failed to process security event', { 
        error: error.message,
        event: event.eventType 
      });
    }
  }

  /**
   * Add event to recent events buffer
   */
  addToRecentEvents(event) {
    this.recentEvents.push({
      ...event,
      id: event.id || crypto.randomUUID(),
      timestamp: event.timestamp || new Date().toISOString(),
    });
    
    // Keep buffer size manageable
    if (this.recentEvents.length > MONITORING_CONFIG.retention.events) {
      this.recentEvents.shift();
    }
  }

  /**
   * Update event counts for threshold checking
   */
  updateEventCounts(event) {
    const eventType = event.eventType;
    const now = Date.now();
    
    if (!this.eventCounts.has(eventType)) {
      this.eventCounts.set(eventType, []);
    }
    
    const counts = this.eventCounts.get(eventType);
    counts.push(now);
    
    // Clean old entries for each threshold window
    Object.values(MONITORING_CONFIG.thresholds).forEach(threshold => {
      const windowStart = now - threshold.window;
      const recentCounts = counts.filter(timestamp => timestamp > windowStart);
      this.eventCounts.set(eventType, recentCounts);
    });
  }

  /**
   * Check if events exceed alert thresholds
   */
  async checkAlertThresholds(event) {
    const eventType = event.eventType;
    const threshold = this.getThresholdForEvent(eventType);
    
    if (!threshold) return;
    
    const counts = this.eventCounts.get(eventType) || [];
    const now = Date.now();
    const windowStart = now - threshold.window;
    const recentCounts = counts.filter(timestamp => timestamp > windowStart);
    
    if (recentCounts.length >= threshold.count) {
      await this.triggerAlert({
        type: `${eventType}_THRESHOLD_EXCEEDED`,
        severity: threshold.severity,
        eventType,
        count: recentCounts.length,
        threshold: threshold.count,
        window: threshold.window,
        triggeredBy: event,
        metadata: {
          windowStart: new Date(windowStart).toISOString(),
          eventDetails: event,
        }
      });
    }
  }

  /**
   * Get threshold configuration for event type
   */
  getThresholdForEvent(eventType) {
    const mappings = {
      'LOGIN_FAILED': 'failedLogins',
      'RATE_LIMIT_EXCEEDED': 'rateLimitExceeded',
      'SUSPICIOUS_IP_DETECTED': 'suspiciousIPs',
      'PASSWORD_BREACH_DETECTED': 'passwordBreach',
      'INTRUSION_ATTEMPT_DETECTED': 'intrusionAttempts',
      'DATA_ACCESS': 'dataAccess',
      'SYSTEM_ERROR': 'systemErrors',
    };
    
    const thresholdKey = mappings[eventType];
    return thresholdKey ? MONITORING_CONFIG.thresholds[thresholdKey] : null;
  }

  /**
   * Trigger security alert
   */
  async triggerAlert(alertData) {
    const alert = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...alertData,
      status: 'active',
    };
    
    // Store alert
    this.activeAlerts.set(alert.id, alert);
    
    // Clean up old alerts
    if (this.activeAlerts.size > MONITORING_CONFIG.retention.alerts) {
      const alertIds = Array.from(this.activeAlerts.keys());
      const oldestAlert = alertIds[0];
      this.activeAlerts.delete(oldestAlert);
    }
    
    logger.warn('Security alert triggered', alert);
    
    // Log to audit system
    await auditSecurity({
      eventType: 'SECURITY_ALERT_TRIGGERED',
      level: alert.severity === 'critical' ? 'CRITICAL' : 
             alert.severity === 'high' ? 'ERROR' : 'WARN',
      details: alert,
      outcome: 'SUCCESS',
    });
    
    // Send through various channels
    await this.sendAlert(alert);
    
    // Broadcast to WebSocket clients
    this.broadcastAlert(alert);
    
    this.emit('alert', alert);
  }

  /**
   * Update real-time metrics
   */
  updateMetrics(event) {
    const now = Date.now();
    const minute = Math.floor(now / 60000) * 60000; // Round to minute
    
    // Initialize minute bucket if needed
    if (!this.metrics.has(minute)) {
      this.metrics.set(minute, {
        timestamp: minute,
        events: 0,
        alerts: 0,
        uniqueIPs: new Set(),
        uniqueUsers: new Set(),
        eventTypes: new Map(),
        severities: new Map(),
      });
    }
    
    const bucket = this.metrics.get(minute);
    bucket.events++;
    
    if (event.ipAddress) {
      bucket.uniqueIPs.add(event.ipAddress);
    }
    
    if (event.userId) {
      bucket.uniqueUsers.add(event.userId);
    }
    
    const eventType = event.eventType;
    bucket.eventTypes.set(eventType, (bucket.eventTypes.get(eventType) || 0) + 1);
    
    // Clean up old metrics
    const cutoff = now - (MONITORING_CONFIG.retention.metrics * 60000);
    for (const [timestamp] of this.metrics.entries()) {
      if (timestamp < cutoff) {
        this.metrics.delete(timestamp);
      }
    }
  }

  /**
   * Send alert through configured channels
   */
  async sendAlert(alert) {
    try {
      if (MONITORING_CONFIG.channels.email) {
        await this.sendEmailAlert(alert);
      }
      
      if (MONITORING_CONFIG.channels.slack) {
        await this.sendSlackAlert(alert);
      }
      
      if (MONITORING_CONFIG.channels.webhook) {
        await this.sendWebhookAlert(alert);
      }
      
    } catch (error) {
      logger.error('Failed to send alert', { 
        error: error.message,
        alertId: alert.id 
      });
    }
  }

  /**
   * Send email alert (placeholder - implement with actual email service)
   */
  async sendEmailAlert(alert) {
    // Implement email sending logic here
    logger.info('Email alert sent', { alertId: alert.id, type: alert.type });
  }

  /**
   * Send Slack alert (placeholder - implement with Slack API)
   */
  async sendSlackAlert(alert) {
    // Implement Slack webhook logic here
    logger.info('Slack alert sent', { alertId: alert.id, type: alert.type });
  }

  /**
   * Send webhook alert (placeholder - implement with HTTP webhook)
   */
  async sendWebhookAlert(alert) {
    // Implement webhook logic here
    logger.info('Webhook alert sent', { alertId: alert.id, type: alert.type });
  }

  /**
   * Broadcast event to WebSocket clients
   */
  broadcastEvent(event) {
    if (!MONITORING_CONFIG.channels.websocket) return;
    
    const message = JSON.stringify({
      type: 'security_event',
      data: event,
      timestamp: new Date().toISOString(),
    });
    
    this.websocketClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          logger.warn('Failed to send WebSocket message', { error: error.message });
          this.websocketClients.delete(client);
        }
      }
    });
  }

  /**
   * Broadcast alert to WebSocket clients
   */
  broadcastAlert(alert) {
    if (!MONITORING_CONFIG.channels.websocket) return;
    
    const message = JSON.stringify({
      type: 'security_alert',
      data: alert,
      timestamp: new Date().toISOString(),
    });
    
    this.websocketClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          logger.warn('Failed to send WebSocket alert', { error: error.message });
          this.websocketClients.delete(client);
        }
      }
    });
  }

  /**
   * Send dashboard update to client(s)
   */
  sendDashboardUpdate(client = null) {
    const dashboard = this.generateDashboardData();
    const message = JSON.stringify({
      type: 'dashboard_update',
      data: dashboard,
      timestamp: new Date().toISOString(),
    });
    
    if (client) {
      // Send to specific client
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    } else {
      // Broadcast to all clients
      this.websocketClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(message);
          } catch (error) {
            logger.warn('Failed to send dashboard update', { error: error.message });
            this.websocketClients.delete(client);
          }
        }
      });
    }
  }

  /**
   * Generate dashboard data
   */
  generateDashboardData() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const lastHour = now - (60 * 60 * 1000);
    
    // Recent events
    const recentEvents = this.recentEvents
      .filter(event => new Date(event.timestamp).getTime() > lastHour)
      .slice(-50); // Last 50 events
    
    // Active alerts
    const activeAlerts = Array.from(this.activeAlerts.values())
      .filter(alert => alert.status === 'active')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20); // Top 20 alerts
    
    // Metrics summary
    const metricsArray = Array.from(this.metrics.values())
      .filter(metric => metric.timestamp > last24Hours)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    const totalEvents = metricsArray.reduce((sum, metric) => sum + metric.events, 0);
    const uniqueIPs = new Set();
    const uniqueUsers = new Set();
    const eventTypes = new Map();
    
    metricsArray.forEach(metric => {
      metric.uniqueIPs.forEach(ip => uniqueIPs.add(ip));
      metric.uniqueUsers.forEach(user => uniqueUsers.add(user));
      metric.eventTypes.forEach((count, type) => {
        eventTypes.set(type, (eventTypes.get(type) || 0) + count);
      });
    });
    
    return {
      summary: {
        totalEvents,
        activeAlerts: activeAlerts.length,
        uniqueIPs: uniqueIPs.size,
        uniqueUsers: uniqueUsers.size,
        timeframe: '24 hours',
      },
      recentEvents,
      activeAlerts,
      eventTypes: Object.fromEntries(eventTypes),
      metrics: metricsArray.map(metric => ({
        timestamp: metric.timestamp,
        events: metric.events,
        uniqueIPs: metric.uniqueIPs.size,
        uniqueUsers: metric.uniqueUsers.size,
      })),
      thresholds: MONITORING_CONFIG.thresholds,
    };
  }

  /**
   * Handle client messages
   */
  handleClientMessage(client, message) {
    switch (message.type) {
      case 'get_dashboard':
        this.sendDashboardUpdate(client);
        break;
      
      case 'acknowledge_alert':
        this.acknowledgeAlert(message.alertId, message.userId);
        break;
      
      case 'filter_events':
        // Implement event filtering
        break;
      
      default:
        logger.warn('Unknown client message type', { type: message.type });
    }
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId, userId) {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date().toISOString();
      
      logger.info('Alert acknowledged', { alertId, userId });
      
      // Broadcast update
      this.broadcastAlert(alert);
    }
  }

  /**
   * Start metrics collection interval
   */
  startMetricsCollection() {
    setInterval(() => {
      this.sendDashboardUpdate();
    }, MONITORING_CONFIG.dashboardUpdate.summary);
    
    logger.info('Metrics collection started');
  }

  /**
   * Start alert processing
   */
  startAlertProcessing() {
    // Process any queued alerts or perform periodic checks
    setInterval(() => {
      // Implement any periodic alert processing here
    }, 60000); // Every minute
    
    logger.info('Alert processing started');
  }

  /**
   * Get monitoring statistics
   */
  getStatistics() {
    return {
      connectedClients: this.websocketClients.size,
      recentEvents: this.recentEvents.length,
      activeAlerts: this.activeAlerts.size,
      metricsPoints: this.metrics.size,
      eventTypes: Array.from(this.eventCounts.keys()),
    };
  }
}

// Singleton monitor instance
const securityMonitor = new SecurityMonitor();

/**
 * Initialize monitoring system
 */
export function initializeSecurityMonitoring(server) {
  securityMonitor.initializeWebSocket(server);
  logger.info('Security monitoring system initialized');
}

/**
 * Process security event through monitoring system
 */
export function monitorSecurityEvent(event) {
  securityMonitor.processSecurityEvent(event);
}

/**
 * Get current monitoring dashboard data
 */
export function getMonitoringDashboard() {
  return securityMonitor.generateDashboardData();
}

/**
 * Get monitoring statistics
 */
export function getMonitoringStatistics() {
  return securityMonitor.getStatistics();
}

/**
 * Manually trigger alert (for testing or admin use)
 */
export function triggerManualAlert(alertData) {
  return securityMonitor.triggerAlert({
    ...alertData,
    type: alertData.type || 'MANUAL_ALERT',
    severity: alertData.severity || 'medium',
  });
}

export default {
  initializeSecurityMonitoring,
  monitorSecurityEvent,
  getMonitoringDashboard,
  getMonitoringStatistics,
  triggerManualAlert,
  MONITORING_CONFIG,
};