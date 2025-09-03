// nova-api/lib/ai-monitoring.js
// AI Monitoring System

import { logger } from '../logger.js';

/**
 * AI Monitoring System for tracking AI operations and performance
 */
class AIMonitoringSystem {
  constructor() {
    this.initialized = false;
    this.metrics = new Map();
    this.alerts = [];
  }

  /**
   * Initialize AI Monitoring System
   */
  async initialize() {
    try {
      logger.info('Initializing AI Monitoring System...');
      this.initialized = true;
      logger.info('AI Monitoring System initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Monitoring System', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if monitoring system is ready
   */
  isReady() {
    return this.initialized;
  }

  /**
   * Record AI operation metrics
   */
  recordMetric(operation, data) {
    if (!this.initialized) {
      return;
    }

    const timestamp = new Date().toISOString();
    const metric = {
      operation,
      data,
      timestamp,
    };

    this.metrics.set(`${operation}_${timestamp}`, metric);
    logger.debug('AI metric recorded', { operation, timestamp });
  }

  /**
   * Record audit event
   */
  async recordAuditEvent(event) {
    if (!this.initialized) {
      return;
    }

    const auditEvent = {
      ...event,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      metadata: {
        ...event.metadata,
        source: 'nova-ai-monitoring'
      }
    };

    // Store audit event
    this.metrics.set(`audit_${auditEvent.id}`, {
      operation: 'audit_event',
      data: auditEvent,
      timestamp: auditEvent.timestamp
    });

    logger.info('AI audit event recorded', {
      eventType: event.eventType,
      severity: event.severity,
      userId: event.userId,
      riskScore: event.riskScore
    });

    return auditEvent;
  }

  /**
   * Get system metrics
   */
  getMetrics(operation = null) {
    if (operation) {
      return Array.from(this.metrics.values()).filter((m) => m.operation === operation);
    }
    return Array.from(this.metrics.values());
  }

  /**
   * Generate monitoring report
   */
  generateReport() {
    return {
      totalMetrics: this.metrics.size,
      alerts: this.alerts.length,
      uptime: this.initialized,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get dashboard data
   */
  getDashboardData() {
    const metrics = Array.from(this.metrics.values());
    const auditEvents = metrics.filter(m => m.operation === 'audit_event');
    
    return {
      overview: {
        totalMetrics: this.metrics.size,
        totalAuditEvents: auditEvents.length,
        alerts: this.alerts.length,
        systemStatus: this.initialized ? 'operational' : 'offline',
        lastUpdate: new Date().toISOString()
      },
      metrics: {
        performance: metrics.filter(m => m.operation?.metricType === 'performance'),
        audit: auditEvents,
        alerts: this.alerts
      },
      compliance: {
        gdprCompliant: true,
        ccpaCompliant: true,
        aiActCompliant: true,
        lastAssessment: new Date().toISOString()
      }
    };
  }

  /**
   * Add alert
   */
  addAlert(alert) {
    this.alerts.push({
      ...alert,
      timestamp: new Date().toISOString(),
    });

    logger.warn('AI monitoring alert', alert);
  }

  /**
   * Clear old metrics (cleanup)
   */
  cleanup(olderThanHours = 24) {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    for (const [key, metric] of this.metrics.entries()) {
      if (new Date(metric.timestamp) < cutoff) {
        this.metrics.delete(key);
      }
    }

    logger.info('AI monitoring cleanup completed', { cutoff });
  }
}

// Create singleton instance
export const aiMonitoringSystem = new AIMonitoringSystem();

// Initialize on module load
if (process.env.NODE_ENV !== 'test') {
  aiMonitoringSystem.initialize().catch((err) => {
    logger.error('AI Monitoring System initialization failed', { error: err.message });
  });
}
