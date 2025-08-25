/**
 * Performance Monitoring and Metrics Collection
 * Production-ready monitoring for Nova Universe API
 */
import { logger } from '../logger.js';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: new Map(),
      database: new Map(),
      errors: new Map(),
      system: new Map(),
    };

    this.startTime = Date.now();
    this.intervals = [];

    // Start system metrics collection
    this.startSystemMetrics();
  }

  /**
   * Start system metrics collection
   */
  startSystemMetrics() {
    // Collect system metrics every 30 seconds
    const systemInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    this.intervals.push(systemInterval);
  }

  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      const systemMetrics = {
        timestamp: new Date().toISOString(),
        memory: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external,
          arrayBuffers: memUsage.arrayBuffers,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        uptime: process.uptime(),
        pid: process.pid,
      };

      this.metrics.system.set(Date.now(), systemMetrics);

      // Keep only last 100 system metrics
      if (this.metrics.system.size > 100) {
        const oldestKey = Math.min(...this.metrics.system.keys());
        this.metrics.system.delete(oldestKey);
      }

      // Log warnings for high memory usage
      const memUsageGB = memUsage.heapUsed / 1024 / 1024 / 1024;
      if (memUsageGB > 1) {
        logger.warn(`High memory usage detected: ${memUsageGB.toFixed(2)}GB`);
      }
    } catch (error) {
      logger.error('Error collecting system metrics:', error.message);
    }
  }

  /**
   * Middleware for request performance tracking
   */
  requestTracking() {
    return (req, res, next) => {
      const startTime = Date.now();
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      req.requestId = requestId;
      req.startTime = startTime;

      // Track request completion
      res.on('finish', () => {
        const duration = Date.now() - startTime;

        const requestMetric = {
          id: requestId,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          timestamp: new Date().toISOString(),
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          userId: req.user?.id,
        };

        this.recordRequest(requestMetric);

        // Log slow requests
        if (duration > 5000) {
          logger.warn(`Slow request detected: ${req.method} ${req.url} took ${duration}ms`);
        }

        // Log errors
        if (res.statusCode >= 400) {
          logger.warn(`Error response: ${req.method} ${req.url} - ${res.statusCode}`);
        }
      });

      next();
    };
  }

  /**
   * Record request metrics
   */
  recordRequest(metric) {
    const key = `${metric.method}:${metric.url}`;

    if (!this.metrics.requests.has(key)) {
      this.metrics.requests.set(key, {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        errorCount: 0,
        recentRequests: [],
      });
    }

    const stats = this.metrics.requests.get(key);
    stats.count++;
    stats.totalDuration += metric.duration;
    stats.averageDuration = stats.totalDuration / stats.count;
    stats.minDuration = Math.min(stats.minDuration, metric.duration);
    stats.maxDuration = Math.max(stats.maxDuration, metric.duration);

    if (metric.statusCode >= 400) {
      stats.errorCount++;
    }

    // Keep recent requests for analysis
    stats.recentRequests.push(metric);
    if (stats.recentRequests.length > 10) {
      stats.recentRequests.shift();
    }
  }

  /**
   * Database query performance tracking
   */
  trackDatabaseQuery(query, duration, error = null) {
    const metric = {
      query: query.substring(0, 100), // Truncate for privacy
      duration,
      timestamp: new Date().toISOString(),
      error: error ? error.message : null,
    };

    const key = `db:${query.split(' ')[0].toUpperCase()}`;

    if (!this.metrics.database.has(key)) {
      this.metrics.database.set(key, {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
        errorCount: 0,
        slowQueries: [],
      });
    }

    const stats = this.metrics.database.get(key);
    stats.count++;
    stats.totalDuration += duration;
    stats.averageDuration = stats.totalDuration / stats.count;

    if (error) {
      stats.errorCount++;
    }

    // Track slow queries
    if (duration > 1000) {
      stats.slowQueries.push(metric);
      if (stats.slowQueries.length > 10) {
        stats.slowQueries.shift();
      }

      logger.warn(`Slow database query: ${duration}ms - ${query.substring(0, 50)}...`);
    }
  }

  /**
   * Record application errors
   */
  recordError(error, context = {}) {
    const errorMetric = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    };

    const key = error.name || 'UnknownError';

    if (!this.metrics.errors.has(key)) {
      this.metrics.errors.set(key, {
        count: 0,
        recentErrors: [],
      });
    }

    const stats = this.metrics.errors.get(key);
    stats.count++;
    stats.recentErrors.push(errorMetric);

    if (stats.recentErrors.length > 20) {
      stats.recentErrors.shift();
    }

    logger.error(`Application error: ${error.message}`, { context });
  }

  /**
   * Get current metrics summary
   */
  getMetrics() {
    const summary = {
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
      requests: {
        total: 0,
        endpoints: {},
      },
      database: {
        total: 0,
        queries: {},
      },
      errors: {
        total: 0,
        types: {},
      },
      system: this.getLatestSystemMetrics(),
    };

    // Aggregate request metrics
    for (const [endpoint, stats] of this.metrics.requests) {
      summary.requests.total += stats.count;
      summary.requests.endpoints[endpoint] = {
        count: stats.count,
        averageDuration: Math.round(stats.averageDuration),
        errorRate: ((stats.errorCount / stats.count) * 100).toFixed(2) + '%',
      };
    }

    // Aggregate database metrics
    for (const [queryType, stats] of this.metrics.database) {
      summary.database.total += stats.count;
      summary.database.queries[queryType] = {
        count: stats.count,
        averageDuration: Math.round(stats.averageDuration),
        errorCount: stats.errorCount,
      };
    }

    // Aggregate error metrics
    for (const [errorType, stats] of this.metrics.errors) {
      summary.errors.total += stats.count;
      summary.errors.types[errorType] = stats.count;
    }

    return summary;
  }

  /**
   * Get latest system metrics
   */
  getLatestSystemMetrics() {
    if (this.metrics.system.size === 0) return null;

    const latestKey = Math.max(...this.metrics.system.keys());
    return this.metrics.system.get(latestKey);
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const metrics = this.getMetrics();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
    };

    // Memory check
    if (metrics.system?.memory?.heapUsed) {
      const memUsageGB = metrics.system.memory.heapUsed / 1024 / 1024 / 1024;
      health.checks.memory = {
        status: memUsageGB < 2 ? 'healthy' : 'warning',
        value: `${memUsageGB.toFixed(2)}GB`,
      };

      if (memUsageGB >= 4) {
        health.status = 'unhealthy';
      } else if (memUsageGB >= 2) {
        health.status = 'warning';
      }
    }

    // Error rate check
    const totalRequests = metrics.requests.total;
    const totalErrors = metrics.errors.total;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    health.checks.errorRate = {
      status: errorRate < 5 ? 'healthy' : errorRate < 10 ? 'warning' : 'unhealthy',
      value: `${errorRate.toFixed(2)}%`,
    };

    if (errorRate >= 10) {
      health.status = 'unhealthy';
    } else if (errorRate >= 5) {
      health.status = 'warning';
    }

    // Response time check
    const avgResponseTime =
      Object.values(metrics.requests.endpoints).reduce(
        (acc, endpoint) => acc + endpoint.averageDuration,
        0,
      ) / Object.keys(metrics.requests.endpoints).length || 0;

    health.checks.responseTime = {
      status: avgResponseTime < 1000 ? 'healthy' : avgResponseTime < 3000 ? 'warning' : 'unhealthy',
      value: `${Math.round(avgResponseTime)}ms`,
    };

    if (avgResponseTime >= 3000) {
      health.status = 'unhealthy';
    } else if (avgResponseTime >= 1000) {
      health.status = 'warning';
    }

    return health;
  }

  /**
   * Cleanup resources
   */
  shutdown() {
    logger.info('Shutting down performance monitor...');

    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];

    // Clear metrics
    this.metrics.requests.clear();
    this.metrics.database.clear();
    this.metrics.errors.clear();
    this.metrics.system.clear();
  }
}

export default PerformanceMonitor;
