// Nova Sentinel - Analytics Service
// Comprehensive monitoring analytics and reporting

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

export class AnalyticsService {
  constructor(database) {
    this.database = database;
    this.metricsCache = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize analytics collections
      await this.setupMetricsCollection();

      this.isInitialized = true;
      logger.info('Analytics service initialized');
    } catch (error) {
      logger.error('Failed to initialize analytics service:', error);
      throw error;
    }
  }

  async setupMetricsCollection() {
    // Set up periodic metrics collection
    setInterval(async () => {
      await this.collectSystemMetrics();
    }, 300000); // Every 5 minutes

    setInterval(async () => {
      await this.calculateDailyStats();
    }, 3600000); // Every hour
  }

  // ========================================================================
  // METRICS COLLECTION
  // ========================================================================

  async collectMetrics() {
    try {
      await Promise.all([
        this.collectSystemMetrics(),
        this.calculateUptimeMetrics(),
        this.calculateResponseTimeMetrics(),
        this.collectUsageMetrics(),
      ]);
    } catch (error) {
      logger.error('Error collecting metrics:', error);
    }
  }

  async collectSystemMetrics() {
    try {
      const timestamp = new Date().toISOString();

      // Get monitor counts by status
      const monitorStats = await this.database.db
        .prepare(
          `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN h.status = 1 THEN 1 ELSE 0 END) as up,
          SUM(CASE WHEN h.status = 0 THEN 1 ELSE 0 END) as down
        FROM monitors m
        LEFT JOIN (
          SELECT DISTINCT monitor_id, status
          FROM heartbeats h1
          WHERE h1.time = (
            SELECT MAX(h2.time) FROM heartbeats h2 WHERE h2.monitor_id = h1.monitor_id
          )
        ) h ON m.uptime_kuma_id = h.monitor_id
      `,
        )
        .get();

      // Get heartbeat counts
      const heartbeatStats = await this.database.db
        .prepare(
          `
        SELECT 
          COUNT(*) as total_heartbeats,
          COUNT(CASE WHEN time > datetime('now', '-1 hour') THEN 1 END) as recent_heartbeats,
          AVG(ping) as avg_response_time
        FROM heartbeats
        WHERE time > datetime('now', '-24 hours')
      `,
        )
        .get();

      // Store system metrics
      await this.database.logEvent({
        type: 'system_metrics',
        metadata: {
          timestamp,
          monitors: monitorStats,
          heartbeats: heartbeatStats,
          memory_usage: process.memoryUsage(),
          uptime: process.uptime(),
        },
      });

      this.metricsCache.set('system', {
        ...monitorStats,
        ...heartbeatStats,
        timestamp,
      });
    } catch (error) {
      logger.error('Error collecting system metrics:', error);
    }
  }

  async calculateUptimeMetrics() {
    try {
      const monitors = await this.database.getAllMonitors();
      const periods = ['1h', '24h', '7d', '30d'];

      for (const monitor of monitors) {
        const uptimeStats = {};

        for (const period of periods) {
          const stats = await this.calculateMonitorUptime(monitor.uptime_kuma_id, period);
          uptimeStats[period] = stats;
        }

        // Cache uptime stats
        this.metricsCache.set(`uptime_${monitor.uptime_kuma_id}`, {
          monitorId: monitor.uptime_kuma_id,
          stats: uptimeStats,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Error calculating uptime metrics:', error);
    }
  }

  async calculateMonitorUptime(monitorId, period) {
    try {
      const now = new Date();
      let startTime = new Date();

      switch (period) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
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
      }

      const stmt = this.database.db.prepare(`
        SELECT 
          COUNT(*) as total_checks,
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as up_checks,
          AVG(CASE WHEN ping IS NOT NULL THEN ping ELSE 0 END) as avg_response_time,
          MAX(ping) as max_response_time,
          MIN(CASE WHEN ping > 0 THEN ping ELSE NULL END) as min_response_time
        FROM heartbeats 
        WHERE monitor_id = ? AND time >= ?
      `);

      const result = stmt.get(monitorId, startTime.toISOString());

      if (!result || result.total_checks === 0) {
        return {
          uptime: 100,
          totalChecks: 0,
          upChecks: 0,
          downChecks: 0,
          avgResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
        };
      }

      return {
        uptime: (result.up_checks / result.total_checks) * 100,
        totalChecks: result.total_checks,
        upChecks: result.up_checks,
        downChecks: result.total_checks - result.up_checks,
        avgResponseTime: Math.round(result.avg_response_time || 0),
        maxResponseTime: result.max_response_time || 0,
        minResponseTime: result.min_response_time || 0,
      };
    } catch (error) {
      logger.error('Error calculating monitor uptime:', error);
      return {
        uptime: 0,
        totalChecks: 0,
        upChecks: 0,
        downChecks: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
      };
    }
  }

  async calculateResponseTimeMetrics() {
    try {
      const periods = ['1h', '24h', '7d', '30d'];
      const responseTimeStats = {};

      for (const period of periods) {
        const stats = await this.getResponseTimeStats(period);
        responseTimeStats[period] = stats;
      }

      this.metricsCache.set('response_times', {
        stats: responseTimeStats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error calculating response time metrics:', error);
    }
  }

  async getResponseTimeStats(period) {
    try {
      const now = new Date();
      let startTime = new Date();

      switch (period) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
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
      }

      const stmt = this.database.db.prepare(`
        SELECT 
          AVG(ping) as avg_response_time,
          MAX(ping) as max_response_time,
          MIN(CASE WHEN ping > 0 THEN ping ELSE NULL END) as min_response_time,
          COUNT(*) as total_measurements
        FROM heartbeats 
        WHERE ping IS NOT NULL AND ping > 0 AND time >= ?
      `);

      const result = stmt.get(startTime.toISOString());

      return {
        avgResponseTime: Math.round(result.avg_response_time || 0),
        maxResponseTime: result.max_response_time || 0,
        minResponseTime: result.min_response_time || 0,
        totalMeasurements: result.total_measurements || 0,
      };
    } catch (error) {
      logger.error('Error getting response time stats:', error);
      return {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        totalMeasurements: 0,
      };
    }
  }

  async collectUsageMetrics() {
    try {
      const timestamp = new Date().toISOString();

      // Collect usage statistics
      const usageStats = await this.database.db
        .prepare(
          `
        SELECT 
          event_type,
          COUNT(*) as count
        FROM analytics_events
        WHERE timestamp > datetime('now', '-24 hours')
        GROUP BY event_type
      `,
        )
        .all();

      const formattedStats = {};
      usageStats.forEach((stat) => {
        formattedStats[stat.event_type] = stat.count;
      });

      this.metricsCache.set('usage', {
        stats: formattedStats,
        timestamp,
      });
    } catch (error) {
      logger.error('Error collecting usage metrics:', error);
    }
  }

  async calculateDailyStats() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate daily uptime for all monitors
      const monitors = await this.database.getAllMonitors();

      for (const monitor of monitors) {
        const dailyStats = await this.database.db
          .prepare(
            `
          SELECT 
            COUNT(*) as total_checks,
            SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as up_checks,
            AVG(ping) as avg_response_time
          FROM heartbeats 
          WHERE monitor_id = ? 
          AND time >= ? 
          AND time < ?
        `,
          )
          .get(monitor.uptime_kuma_id, yesterday.toISOString(), today.toISOString());

        if (dailyStats.total_checks > 0) {
          await this.database.logEvent({
            type: 'daily_stats',
            monitorId: monitor.uptime_kuma_id,
            metadata: {
              date: yesterday.toISOString().split('T')[0],
              uptime: (dailyStats.up_checks / dailyStats.total_checks) * 100,
              totalChecks: dailyStats.total_checks,
              upChecks: dailyStats.up_checks,
              downChecks: dailyStats.total_checks - dailyStats.up_checks,
              avgResponseTime: dailyStats.avg_response_time,
            },
          });
        }
      }
    } catch (error) {
      logger.error('Error calculating daily stats:', error);
    }
  }

  // ========================================================================
  // ANALYTICS QUERIES
  // ========================================================================

  async getMonitorAnalytics(monitorId, period = '24h') {
    try {
      const uptimeStats = await this.calculateMonitorUptime(monitorId, period);
      const responseTimeStats = await this.getMonitorResponseTimes(monitorId, period);
      const incidentStats = await this.getMonitorIncidents(monitorId, period);

      return {
        monitorId,
        period,
        uptime: uptimeStats,
        responseTimes: responseTimeStats,
        incidents: incidentStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting monitor analytics:', error);
      throw error;
    }
  }

  async getMonitorResponseTimes(monitorId, period) {
    try {
      const now = new Date();
      let startTime = new Date();

      switch (period) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
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
      }

      const stmt = this.database.db.prepare(`
        SELECT 
          time,
          ping as response_time,
          status
        FROM heartbeats 
        WHERE monitor_id = ? 
        AND time >= ?
        AND ping IS NOT NULL
        ORDER BY time ASC
      `);

      const data = stmt.all(monitorId, startTime.toISOString());

      return {
        data: data.map((row) => ({
          timestamp: row.time,
          responseTime: row.response_time,
          status: row.status,
        })),
        count: data.length,
      };
    } catch (error) {
      logger.error('Error getting monitor response times:', error);
      return { data: [], count: 0 };
    }
  }

  async getMonitorIncidents(monitorId, period) {
    try {
      const now = new Date();
      let startTime = new Date();

      switch (period) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
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
      }

      const stmt = this.database.db.prepare(`
        SELECT 
          timestamp,
          metadata
        FROM analytics_events 
        WHERE event_type = 'monitor_down'
        AND monitor_id = ?
        AND timestamp >= ?
        ORDER BY timestamp DESC
      `);

      const incidents = stmt.all(monitorId, startTime.toISOString());

      return {
        incidents: incidents.map((incident) => ({
          timestamp: incident.timestamp,
          metadata: JSON.parse(incident.metadata),
        })),
        count: incidents.length,
      };
    } catch (error) {
      logger.error('Error getting monitor incidents:', error);
      return { incidents: [], count: 0 };
    }
  }

  async getSystemAnalytics(period = '24h') {
    try {
      const systemStats = this.metricsCache.get('system') || {};
      const responseTimeStats = this.metricsCache.get('response_times') || { stats: {} };
      const usageStats = this.metricsCache.get('usage') || { stats: {} };

      // Get top performing monitors
      const topMonitors = await this.getTopPerformingMonitors(period, 10);

      // Get slowest monitors
      const slowestMonitors = await this.getSlowestMonitors(period, 10);

      // Get recent incidents
      const recentIncidents = await this.getRecentIncidents(period);

      return {
        period,
        system: systemStats,
        responseTimes: responseTimeStats.stats[period] || {},
        usage: usageStats.stats,
        topMonitors,
        slowestMonitors,
        recentIncidents,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting system analytics:', error);
      throw error;
    }
  }

  async getTopPerformingMonitors(period, limit = 10) {
    try {
      const now = new Date();
      let startTime = new Date();

      switch (period) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
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
      }

      const stmt = this.database.db.prepare(`
        SELECT 
          m.name,
          m.uptime_kuma_id,
          COUNT(*) as total_checks,
          SUM(CASE WHEN h.status = 1 THEN 1 ELSE 0 END) as up_checks,
          (SUM(CASE WHEN h.status = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as uptime_percentage,
          AVG(h.ping) as avg_response_time
        FROM monitors m
        JOIN heartbeats h ON m.uptime_kuma_id = h.monitor_id
        WHERE h.time >= ?
        GROUP BY m.uptime_kuma_id, m.name
        HAVING total_checks > 0
        ORDER BY uptime_percentage DESC, avg_response_time ASC
        LIMIT ?
      `);

      const monitors = stmt.all(startTime.toISOString(), limit);

      return monitors.map((monitor) => ({
        name: monitor.name,
        monitorId: monitor.uptime_kuma_id,
        uptime: Math.round(monitor.uptime_percentage * 100) / 100,
        avgResponseTime: Math.round(monitor.avg_response_time || 0),
        totalChecks: monitor.total_checks,
      }));
    } catch (error) {
      logger.error('Error getting top performing monitors:', error);
      return [];
    }
  }

  async getSlowestMonitors(period, limit = 10) {
    try {
      const now = new Date();
      let startTime = new Date();

      switch (period) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
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
      }

      const stmt = this.database.db.prepare(`
        SELECT 
          m.name,
          m.uptime_kuma_id,
          AVG(h.ping) as avg_response_time,
          MAX(h.ping) as max_response_time,
          COUNT(*) as total_checks
        FROM monitors m
        JOIN heartbeats h ON m.uptime_kuma_id = h.monitor_id
        WHERE h.time >= ? AND h.ping IS NOT NULL AND h.ping > 0
        GROUP BY m.uptime_kuma_id, m.name
        HAVING total_checks > 0
        ORDER BY avg_response_time DESC
        LIMIT ?
      `);

      const monitors = stmt.all(startTime.toISOString(), limit);

      return monitors.map((monitor) => ({
        name: monitor.name,
        monitorId: monitor.uptime_kuma_id,
        avgResponseTime: Math.round(monitor.avg_response_time),
        maxResponseTime: Math.round(monitor.max_response_time),
        totalChecks: monitor.total_checks,
      }));
    } catch (error) {
      logger.error('Error getting slowest monitors:', error);
      return [];
    }
  }

  async getRecentIncidents(period) {
    try {
      const now = new Date();
      let startTime = new Date();

      switch (period) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
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
      }

      const stmt = this.database.db.prepare(`
        SELECT 
          ae.timestamp,
          ae.monitor_id,
          ae.metadata,
          m.name as monitor_name
        FROM analytics_events ae
        LEFT JOIN monitors m ON ae.monitor_id = m.uptime_kuma_id
        WHERE ae.event_type = 'monitor_down'
        AND ae.timestamp >= ?
        ORDER BY ae.timestamp DESC
        LIMIT 20
      `);

      const incidents = stmt.all(startTime.toISOString());

      return incidents.map((incident) => ({
        timestamp: incident.timestamp,
        monitorId: incident.monitor_id,
        monitorName: incident.monitor_name,
        metadata: JSON.parse(incident.metadata),
      }));
    } catch (error) {
      logger.error('Error getting recent incidents:', error);
      return [];
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  getCachedMetrics(key) {
    return this.metricsCache.get(key);
  }

  async healthCheck() {
    return this.isInitialized && this.database && (await this.database.healthCheck());
  }

  async close() {
    this.metricsCache.clear();
    this.isInitialized = false;
    logger.info('Analytics service closed');
  }
}

export default AnalyticsService;
