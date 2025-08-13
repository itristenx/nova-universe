// Nova Sentinel - Monitoring Service
// Complete monitoring orchestration with Uptime Kuma integration

import { EventEmitter } from 'events';
import winston from 'winston';
import crypto from 'crypto';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

export class MonitoringService extends EventEmitter {
  constructor(database, uptimeKumaAdapter) {
    super();
    this.database = database;
    this.uptimeKuma = uptimeKumaAdapter;
    this.heartbeatCache = new Map();
    this.monitorStatusCache = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Set up event listeners for Uptime Kuma events
      this.setupUptimeKumaEventHandlers();
      
      // Load initial monitor states
      await this.loadInitialStates();
      
      this.isInitialized = true;
      logger.info('Monitoring service initialized');
    } catch (error) {
      logger.error('Failed to initialize monitoring service:', error);
      throw error;
    }
  }

  setupUptimeKumaEventHandlers() {
    // Handle heartbeat events from Uptime Kuma
    this.uptimeKuma.on('nova:heartbeat', (heartbeat) => {
      this.handleHeartbeat(heartbeat);
    });

    this.uptimeKuma.on('nova:heartbeatList', (heartbeats) => {
      this.handleHeartbeatList(heartbeats);
    });

    this.uptimeKuma.on('nova:monitorList', (monitors) => {
      this.handleMonitorList(monitors);
    });
  }

  async loadInitialStates() {
    try {
      // Load monitors from database
      const monitors = await this.database.getAllMonitors();
      
      for (const monitor of monitors) {
        // Get latest heartbeat for each monitor
        const heartbeat = await this.database.getLatestHeartbeat(monitor.uptime_kuma_id);
        if (heartbeat) {
          this.heartbeatCache.set(monitor.uptime_kuma_id, heartbeat);
          this.monitorStatusCache.set(monitor.uptime_kuma_id, heartbeat.status);
        }
      }
      
      logger.info(`Loaded ${monitors.length} monitors into cache`);
    } catch (error) {
      logger.error('Failed to load initial states:', error);
    }
  }

  // ========================================================================
  // HEARTBEAT HANDLING
  // ========================================================================

  async handleHeartbeat(heartbeat) {
    try {
      const monitorId = heartbeat.monitorID;
      const previousHeartbeat = this.heartbeatCache.get(monitorId);
      const previousStatus = this.monitorStatusCache.get(monitorId);
      
      // Update caches
      this.heartbeatCache.set(monitorId, heartbeat);
      this.monitorStatusCache.set(monitorId, heartbeat.status);
      
      // Save to database
      await this.database.saveHeartbeat({
        monitorId: monitorId,
        status: heartbeat.status,
        time: new Date(heartbeat.time),
        ping: heartbeat.ping,
        msg: heartbeat.msg,
        important: heartbeat.important || false,
        duration: heartbeat.duration
      });

      // Check for status changes
      if (previousStatus !== undefined && previousStatus !== heartbeat.status) {
        await this.handleStatusChange(monitorId, previousStatus, heartbeat.status, heartbeat);
      }

      // Emit real-time update
      this.emit('heartbeat', {
        monitorId,
        heartbeat,
        statusChanged: previousStatus !== heartbeat.status
      });

      // Log analytics event
      await this.database.logEvent({
        type: 'heartbeat',
        monitorId: monitorId,
        metadata: {
          status: heartbeat.status,
          ping: heartbeat.ping,
          important: heartbeat.important
        }
      });

    } catch (error) {
      logger.error('Error handling heartbeat:', error);
    }
  }

  async handleHeartbeatList(heartbeats) {
    try {
      for (const [monitorId, heartbeatList] of Object.entries(heartbeats)) {
        if (Array.isArray(heartbeatList) && heartbeatList.length > 0) {
          // Process the latest heartbeat
          const latestHeartbeat = heartbeatList[heartbeatList.length - 1];
          await this.handleHeartbeat({
            ...latestHeartbeat,
            monitorID: monitorId
          });
        }
      }
    } catch (error) {
      logger.error('Error handling heartbeat list:', error);
    }
  }

  async handleMonitorList(monitors) {
    try {
      for (const [monitorId, monitor] of Object.entries(monitors)) {
        // Update monitor cache if it exists in our database
        const dbMonitor = await this.database.getMonitor(monitorId);
        if (dbMonitor) {
          // Monitor exists, update configuration if needed
          await this.database.updateMonitor(monitorId, {
            config: monitor,
            updatedBy: 'system'
          });
        }
      }
      
      this.emit('monitorsUpdated', monitors);
    } catch (error) {
      logger.error('Error handling monitor list:', error);
    }
  }

  async handleStatusChange(monitorId, previousStatus, newStatus, heartbeat) {
    try {
      const monitor = await this.database.getMonitor(monitorId);
      if (!monitor) return;

      const statusChangeEvent = {
        type: newStatus === 1 ? 'monitor_up' : 'monitor_down',
        monitorId: monitorId,
        metadata: {
          previousStatus,
          newStatus,
          monitorName: monitor.name,
          responseTime: heartbeat.ping,
          message: heartbeat.msg,
          timestamp: heartbeat.time
        },
        tenantId: monitor.tenant_id
      };

      // Log analytics event
      await this.database.logEvent(statusChangeEvent);

      // Emit status change event
      this.emit('statusChange', statusChangeEvent);

      // Trigger notifications for monitor down events
      if (newStatus === 0) {
        this.emit('monitorDown', {
          monitor,
          heartbeat,
          previousStatus
        });
      } else if (newStatus === 1 && previousStatus === 0) {
        this.emit('monitorUp', {
          monitor,
          heartbeat,
          previousStatus
        });
      }

      logger.info(`Monitor ${monitor.name} status changed: ${previousStatus} -> ${newStatus}`);

    } catch (error) {
      logger.error('Error handling status change:', error);
    }
  }

  // ========================================================================
  // MONITOR OPERATIONS
  // ========================================================================

  async runMonitorChecks() {
    if (!this.isInitialized) return;

    try {
      // This would typically trigger Uptime Kuma to run checks
      // For now, we rely on Uptime Kuma's internal scheduling
      const stats = await this.getSystemStats();
      
      this.emit('monitorChecksCycle', {
        timestamp: new Date().toISOString(),
        stats
      });

      // Clean up old heartbeats periodically
      await this.cleanupOldHeartbeats();

    } catch (error) {
      logger.error('Error running monitor checks:', error);
    }
  }

  async cleanupOldHeartbeats() {
    try {
      // Keep heartbeats for the last 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const stmt = this.database.db.prepare(`
        DELETE FROM heartbeats 
        WHERE time < ? 
        AND important = false
      `);
      
      const result = stmt.run(cutoffDate.toISOString());
      
      if (result.changes > 0) {
        logger.info(`Cleaned up ${result.changes} old heartbeats`);
      }
    } catch (error) {
      logger.error('Error cleaning up heartbeats:', error);
    }
  }

  // ========================================================================
  // UPTIME STATISTICS
  // ========================================================================

  async getUptimeStats(monitorId, period = '24h') {
    try {
      const now = new Date();
      let startTime = new Date();

      // Calculate start time based on period
      switch (period) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
          break;
        case '6h':
          startTime.setHours(now.getHours() - 6);
          break;
        case '24h':
          startTime.setDate(now.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(now.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(now.getDate() - 30);
          break;
        case '90d':
          startTime.setDate(now.getDate() - 90);
          break;
        default:
          startTime.setDate(now.getDate() - 1);
      }

      const stmt = this.database.db.prepare(`
        SELECT 
          COUNT(*) as total_checks,
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as up_checks,
          SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as down_checks,
          AVG(CASE WHEN ping IS NOT NULL THEN ping ELSE 0 END) as avg_response_time,
          MIN(time) as period_start,
          MAX(time) as period_end
        FROM heartbeats 
        WHERE monitor_id = ? 
        AND time >= ?
      `);

      const stats = stmt.get(monitorId, startTime.toISOString());

      if (!stats || stats.total_checks === 0) {
        return {
          period,
          uptime: 0,
          totalChecks: 0,
          upChecks: 0,
          downChecks: 0,
          avgResponseTime: 0,
          periodStart: startTime.toISOString(),
          periodEnd: now.toISOString()
        };
      }

      const uptime = (stats.up_checks / stats.total_checks) * 100;

      return {
        period,
        uptime: Math.round(uptime * 100) / 100,
        totalChecks: stats.total_checks,
        upChecks: stats.up_checks,
        downChecks: stats.down_checks,
        avgResponseTime: Math.round(stats.avg_response_time * 100) / 100,
        periodStart: stats.period_start,
        periodEnd: stats.period_end
      };

    } catch (error) {
      logger.error('Error calculating uptime stats:', error);
      return {
        period,
        uptime: 0,
        totalChecks: 0,
        upChecks: 0,
        downChecks: 0,
        avgResponseTime: 0,
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString()
      };
    }
  }

  async getMultiPeriodUptime(monitorId) {
    const periods = ['1h', '6h', '24h', '7d', '30d', '90d'];
    const stats = {};

    for (const period of periods) {
      stats[period] = await this.getUptimeStats(monitorId, period);
    }

    return stats;
  }

  // ========================================================================
  // SYSTEM STATISTICS
  // ========================================================================

  async getSystemStats() {
    try {
      const dbStats = await this.database.getStats();
      
      // Count monitors by status
      let upMonitors = 0;
      let downMonitors = 0;
      let unknownMonitors = 0;

      for (const [monitorId, status] of this.monitorStatusCache.entries()) {
        if (status === 1) upMonitors++;
        else if (status === 0) downMonitors++;
        else unknownMonitors++;
      }

      // Calculate recent activity
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const recentEventsStmt = this.database.db.prepare(`
        SELECT COUNT(*) as count FROM analytics_events 
        WHERE timestamp >= ?
      `);
      const recentEvents = recentEventsStmt.get(oneHourAgo.toISOString());

      return {
        monitors: {
          total: dbStats.monitors,
          up: upMonitors,
          down: downMonitors,
          unknown: unknownMonitors
        },
        statusPages: dbStats.status_pages,
        recentHeartbeats: dbStats.recent_heartbeats,
        subscribers: dbStats.subscribers,
        recentEvents: recentEvents.count,
        cacheSize: {
          heartbeats: this.heartbeatCache.size,
          statuses: this.monitorStatusCache.size
        },
        timestamp: now.toISOString()
      };

    } catch (error) {
      logger.error('Error getting system stats:', error);
      return {
        monitors: { total: 0, up: 0, down: 0, unknown: 0 },
        statusPages: 0,
        recentHeartbeats: 0,
        subscribers: 0,
        recentEvents: 0,
        cacheSize: { heartbeats: 0, statuses: 0 },
        timestamp: new Date().toISOString()
      };
    }
  }

  // ========================================================================
  // ALERT CORRELATION
  // ========================================================================

  async correlateWithGoAlert(monitorEvent) {
    try {
      if (monitorEvent.type === 'monitor_down') {
        // Check if this monitor should trigger a GoAlert alert
        const monitor = monitorEvent.monitor;
        const shouldCreateAlert = await this.shouldCreateGoAlert(monitor);

        if (shouldCreateAlert) {
          this.emit('createGoAlert', {
            serviceId: monitor.goalert_service_id,
            summary: `${monitor.name} is down`,
            details: `Monitor ${monitor.name} (${monitor.type}) has failed.\n\nResponse: ${monitorEvent.heartbeat.msg}\nURL: ${monitor.config.url || 'N/A'}`,
            source: 'nova-sentinel',
            monitorId: monitor.uptime_kuma_id
          });
        }
      } else if (monitorEvent.type === 'monitor_up') {
        // Auto-close related alerts when monitor comes back up
        this.emit('closeGoAlert', {
          monitorId: monitor.uptime_kuma_id,
          reason: 'Monitor recovered'
        });
      }
    } catch (error) {
      logger.error('Error correlating with GoAlert:', error);
    }
  }

  async shouldCreateGoAlert(monitor) {
    // Logic to determine if a monitor failure should create a GoAlert
    // This could be based on monitor configuration, severity, business hours, etc.
    
    try {
      const config = monitor.config || {};
      
      // Check if GoAlert integration is enabled for this monitor
      if (!config.goalert_enabled) return false;
      
      // Check if it's a critical monitor
      if (config.priority === 'critical') return true;
      
      // Check if it's been down for a certain duration
      const downtime = await this.getMonitorDowntime(monitor.uptime_kuma_id);
      if (downtime > 300) return true; // 5 minutes
      
      // Check business hours if configured
      if (config.business_hours_only) {
        const isBusinessHours = this.isBusinessHours();
        return isBusinessHours;
      }
      
      return false;
    } catch (error) {
      logger.error('Error determining GoAlert creation:', error);
      return false;
    }
  }

  async getMonitorDowntime(monitorId) {
    try {
      const stmt = this.database.db.prepare(`
        SELECT time FROM heartbeats 
        WHERE monitor_id = ? AND status = 0 
        ORDER BY time DESC LIMIT 1
      `);
      
      const lastDownHeartbeat = stmt.get(monitorId);
      if (!lastDownHeartbeat) return 0;
      
      const downTime = new Date(lastDownHeartbeat.time);
      const now = new Date();
      
      return (now.getTime() - downTime.getTime()) / 1000; // seconds
    } catch (error) {
      logger.error('Error getting monitor downtime:', error);
      return 0;
    }
  }

  isBusinessHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Monday to Friday, 9 AM to 5 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  }

  // ========================================================================
  // CACHE MANAGEMENT
  // ========================================================================

  getLatestHeartbeat(monitorId) {
    return this.heartbeatCache.get(monitorId);
  }

  getMonitorStatus(monitorId) {
    return this.monitorStatusCache.get(monitorId);
  }

  clearMonitorCache(monitorId) {
    this.heartbeatCache.delete(monitorId);
    this.monitorStatusCache.delete(monitorId);
  }

  clearAllCaches() {
    this.heartbeatCache.clear();
    this.monitorStatusCache.clear();
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  async healthCheck() {
    try {
      return this.isInitialized && 
             this.database && 
             await this.database.healthCheck() &&
             this.uptimeKuma &&
             await this.uptimeKuma.healthCheck();
    } catch (error) {
      return false;
    }
  }

  async close() {
    this.removeAllListeners();
    this.clearAllCaches();
    this.isInitialized = false;
    logger.info('Monitoring service closed');
  }
}

export default MonitoringService;
