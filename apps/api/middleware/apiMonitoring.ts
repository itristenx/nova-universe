/**
 * API Monitoring and Analytics Configuration
 * Tracks API usage, performance, and errors for Nova Universe Platform V1
 */

import { EventEmitter } from 'events';
import os from 'os';

// ========================================
// Types & Interfaces
// ========================================

interface APIMetric {
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  userId?: number;
  error?: string;
}

interface AggregatedMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByEndpoint: Record<string, number>;
  requestsByMethod: Record<string, number>;
  requestsByStatus: Record<number, number>;
  errorRate: number;
  uptime: number;
}

interface PerformanceThresholds {
  responseTimeWarning: number;
  responseTimeCritical: number;
  errorRateWarning: number;
  errorRateCritical: number;
}

// ========================================
// API Monitor Class
// ========================================

export class APIMonitor extends EventEmitter {
  private metrics: APIMetric[] = [];
  private startTime: Date = new Date();
  private maxMetricsStored: number = 10000;
  
  private thresholds: PerformanceThresholds = {
    responseTimeWarning: 1000,    // 1 second
    responseTimeCritical: 5000,   // 5 seconds
    errorRateWarning: 0.05,       // 5%
    errorRateCritical: 0.10,      // 10%
  };

  constructor(config?: {
    maxMetricsStored?: number;
    thresholds?: Partial<PerformanceThresholds>;
  }) {
    super();
    
    if (config?.maxMetricsStored) {
      this.maxMetricsStored = config.maxMetricsStored;
    }
    
    if (config?.thresholds) {
      this.thresholds = { ...this.thresholds, ...config.thresholds };
    }
  }

  /**
   * Record an API request metric
   */
  recordRequest(metric: Omit<APIMetric, 'timestamp'>): void {
    const fullMetric: APIMetric = {
      ...metric,
      timestamp: new Date(),
    };

    this.metrics.push(fullMetric);

    // Trim old metrics if we exceed the limit
    if (this.metrics.length > this.maxMetricsStored) {
      this.metrics = this.metrics.slice(-this.maxMetricsStored);
    }

    // Check thresholds and emit warnings
    this.checkThresholds(fullMetric);

    // Emit metric event
    this.emit('metric', fullMetric);
  }

  /**
   * Check if metric exceeds thresholds
   */
  private checkThresholds(metric: APIMetric): void {
    // Response time check
    if (metric.responseTime > this.thresholds.responseTimeCritical) {
      this.emit('alert', {
        level: 'critical',
        type: 'slow_response',
        message: `Critical: Response time ${metric.responseTime}ms for ${metric.method} ${metric.endpoint}`,
        metric,
      });
    } else if (metric.responseTime > this.thresholds.responseTimeWarning) {
      this.emit('alert', {
        level: 'warning',
        type: 'slow_response',
        message: `Warning: Response time ${metric.responseTime}ms for ${metric.method} ${metric.endpoint}`,
        metric,
      });
    }

    // Error check
    if (metric.statusCode >= 500) {
      this.emit('alert', {
        level: 'critical',
        type: 'server_error',
        message: `Server error: ${metric.statusCode} for ${metric.method} ${metric.endpoint}`,
        metric,
      });
    }
  }

  /**
   * Get aggregated metrics for a time window
   */
  getMetrics(windowMinutes: number = 60): AggregatedMetrics {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    const windowMetrics = this.metrics.filter(m => m.timestamp >= windowStart);

    if (windowMetrics.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        requestsByEndpoint: {},
        requestsByMethod: {},
        requestsByStatus: {},
        errorRate: 0,
        uptime: this.getUptime(),
      };
    }

    const totalRequests = windowMetrics.length;
    const successfulRequests = windowMetrics.filter(m => m.statusCode < 400).length;
    const failedRequests = totalRequests - successfulRequests;

    const totalResponseTime = windowMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    const averageResponseTime = totalResponseTime / totalRequests;

    const requestsByEndpoint: Record<string, number> = {};
    const requestsByMethod: Record<string, number> = {};
    const requestsByStatus: Record<number, number> = {};

    windowMetrics.forEach(metric => {
      // By endpoint
      requestsByEndpoint[metric.endpoint] = (requestsByEndpoint[metric.endpoint] || 0) + 1;
      
      // By method
      requestsByMethod[metric.method] = (requestsByMethod[metric.method] || 0) + 1;
      
      // By status code
      requestsByStatus[metric.statusCode] = (requestsByStatus[metric.statusCode] || 0) + 1;
    });

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime),
      requestsByEndpoint,
      requestsByMethod,
      requestsByStatus,
      errorRate: failedRequests / totalRequests,
      uptime: this.getUptime(),
    };
  }

  /**
   * Get system uptime in seconds
   */
  private getUptime(): number {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  /**
   * Get current system stats
   */
  getSystemStats() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model || 'Unknown',
      totalMemoryMB: Math.round(totalMem / 1024 / 1024),
      freeMemoryMB: Math.round(freeMem / 1024 / 1024),
      usedMemoryMB: Math.round((totalMem - freeMem) / 1024 / 1024),
      memoryUsagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
    };
  }

  /**
   * Get top endpoints by request count
   */
  getTopEndpoints(limit: number = 10, windowMinutes: number = 60): Array<{
    endpoint: string;
    count: number;
    averageResponseTime: number;
  }> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    const windowMetrics = this.metrics.filter(m => m.timestamp >= windowStart);

    const endpointStats: Record<string, {
      count: number;
      totalResponseTime: number;
    }> = {};

    windowMetrics.forEach(metric => {
      if (!endpointStats[metric.endpoint]) {
        endpointStats[metric.endpoint] = { count: 0, totalResponseTime: 0 };
      }
      endpointStats[metric.endpoint].count++;
      endpointStats[metric.endpoint].totalResponseTime += metric.responseTime;
    });

    return Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        averageResponseTime: Math.round(stats.totalResponseTime / stats.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get slowest endpoints
   */
  getSlowestEndpoints(limit: number = 10, windowMinutes: number = 60): Array<{
    endpoint: string;
    method: string;
    responseTime: number;
    timestamp: Date;
  }> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    const windowMetrics = this.metrics.filter(m => m.timestamp >= windowStart);

    return windowMetrics
      .map(m => ({
        endpoint: m.endpoint,
        method: m.method,
        responseTime: m.responseTime,
        timestamp: m.timestamp,
      }))
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, limit);
  }

  /**
   * Get error breakdown
   */
  getErrorBreakdown(windowMinutes: number = 60): Array<{
    endpoint: string;
    statusCode: number;
    count: number;
    lastOccurrence: Date;
  }> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    const errorMetrics = this.metrics.filter(
      m => m.timestamp >= windowStart && m.statusCode >= 400
    );

    const errorStats: Record<string, {
      count: number;
      lastOccurrence: Date;
    }> = {};

    errorMetrics.forEach(metric => {
      const key = `${metric.endpoint}:${metric.statusCode}`;
      if (!errorStats[key]) {
        errorStats[key] = { count: 0, lastOccurrence: metric.timestamp };
      }
      errorStats[key].count++;
      if (metric.timestamp > errorStats[key].lastOccurrence) {
        errorStats[key].lastOccurrence = metric.timestamp;
      }
    });

    return Object.entries(errorStats)
      .map(([key, stats]) => {
        const [endpoint, statusCode] = key.split(':');
        return {
          endpoint,
          statusCode: parseInt(statusCode),
          count: stats.count,
          lastOccurrence: stats.lastOccurrence,
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(windowMinutes?: number): string {
    const metrics = windowMinutes
      ? this.metrics.filter(m => m.timestamp >= new Date(Date.now() - windowMinutes * 60 * 1000))
      : this.metrics;

    return JSON.stringify({
      exportedAt: new Date(),
      metricsCount: metrics.length,
      metrics,
      aggregated: this.getMetrics(windowMinutes),
      systemStats: this.getSystemStats(),
    }, null, 2);
  }
}

// ========================================
// Express Middleware
// ========================================

export function createMonitoringMiddleware(monitor: APIMonitor) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Capture the original end function
    const originalEnd = res.end;

    // Override end function to capture metrics
    res.end = function(...args: any[]) {
      const responseTime = Date.now() - startTime;

      // Record the metric
      monitor.recordRequest({
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        userAgent: req.get('user-agent'),
        userId: req.user?.id,
      });

      // Call the original end function
      return originalEnd.apply(res, args);
    };

    next();
  };
}

// ========================================
// Singleton Instance
// ========================================

let monitorInstance: APIMonitor | null = null;

export function getMonitor(config?: any): APIMonitor {
  if (!monitorInstance) {
    monitorInstance = new APIMonitor(config);
  }
  return monitorInstance;
}

// ========================================
// Dashboard Route Handlers
// ========================================

export function setupMonitoringRoutes(app: any, monitor: APIMonitor) {
  /**
   * GET /api/v1/monitoring/metrics
   * Get aggregated metrics
   */
  app.get('/api/v1/monitoring/metrics', (req: any, res: any) => {
    const windowMinutes = parseInt(req.query.window || '60');
    const metrics = monitor.getMetrics(windowMinutes);
    
    res.json({
      success: true,
      window: `${windowMinutes} minutes`,
      metrics,
    });
  });

  /**
   * GET /api/v1/monitoring/system
   * Get system stats
   */
  app.get('/api/v1/monitoring/system', (req: any, res: any) => {
    const stats = monitor.getSystemStats();
    res.json({
      success: true,
      stats,
    });
  });

  /**
   * GET /api/v1/monitoring/top-endpoints
   * Get top endpoints by request count
   */
  app.get('/api/v1/monitoring/top-endpoints', (req: any, res: any) => {
    const limit = parseInt(req.query.limit || '10');
    const windowMinutes = parseInt(req.query.window || '60');
    const topEndpoints = monitor.getTopEndpoints(limit, windowMinutes);
    
    res.json({
      success: true,
      window: `${windowMinutes} minutes`,
      topEndpoints,
    });
  });

  /**
   * GET /api/v1/monitoring/slowest-endpoints
   * Get slowest endpoints
   */
  app.get('/api/v1/monitoring/slowest-endpoints', (req: any, res: any) => {
    const limit = parseInt(req.query.limit || '10');
    const windowMinutes = parseInt(req.query.window || '60');
    const slowestEndpoints = monitor.getSlowestEndpoints(limit, windowMinutes);
    
    res.json({
      success: true,
      window: `${windowMinutes} minutes`,
      slowestEndpoints,
    });
  });

  /**
   * GET /api/v1/monitoring/errors
   * Get error breakdown
   */
  app.get('/api/v1/monitoring/errors', (req: any, res: any) => {
    const windowMinutes = parseInt(req.query.window || '60');
    const errors = monitor.getErrorBreakdown(windowMinutes);
    
    res.json({
      success: true,
      window: `${windowMinutes} minutes`,
      errors,
    });
  });

  /**
   * GET /api/v1/monitoring/export
   * Export metrics as JSON
   */
  app.get('/api/v1/monitoring/export', (req: any, res: any) => {
    const windowMinutes = req.query.window ? parseInt(req.query.window) : undefined;
    const exportData = monitor.exportMetrics(windowMinutes);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="api-metrics-${Date.now()}.json"`);
    res.send(exportData);
  });

  /**
   * POST /api/v1/monitoring/clear
   * Clear metrics (admin only)
   */
  app.post('/api/v1/monitoring/clear', (req: any, res: any) => {
    // TODO: Add admin permission check
    monitor.clearMetrics();
    
    res.json({
      success: true,
      message: 'Metrics cleared successfully',
    });
  });
}

export default APIMonitor;
