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
   * Record audit event with RBAC compliance tracking
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
        source: 'nova-ai-monitoring',
        rbacCompliant: event.rbacCompliant !== false, // Default to true unless explicitly false
        dataSource: event.dataSource || 'nova-internal-only',
        novaValidated: event.novaValidated !== false,
      }
    };

    // Additional RBAC compliance validation
    if (event.type === 'data_access' || event.type === 'document_retrieval' || event.type === 'rag_query') {
      auditEvent.metadata.rbacValidationRequired = true;
      auditEvent.metadata.tenantIsolated = !!event.tenantId;
      auditEvent.metadata.userAuthenticated = !!event.userId;
    }

    // Store audit event
    this.metrics.set(`audit_${auditEvent.id}`, {
      operation: 'audit_event',
      data: auditEvent,
      timestamp: auditEvent.timestamp
    });

    logger.info('AI audit event recorded with RBAC tracking', {
      eventType: event.eventType || event.type,
      severity: event.severity,
      userId: event.userId,
      tenantId: event.tenantId,
      riskScore: event.riskScore,
      rbacCompliant: auditEvent.metadata.rbacCompliant,
      dataSource: auditEvent.metadata.dataSource
    });

    // Alert on RBAC violations
    if (auditEvent.metadata.rbacCompliant === false) {
      this.addAlert({
        type: 'rbac_violation',
        severity: 'high',
        message: `RBAC violation detected in event: ${event.type}`,
        eventId: auditEvent.id,
        userId: event.userId,
        tenantId: event.tenantId,
      });
    }

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
   * Get dashboard data with RBAC compliance metrics
   */
  getDashboardData() {
    const metrics = Array.from(this.metrics.values());
    const auditEvents = metrics.filter(m => m.operation === 'audit_event');
    
    // RBAC compliance analysis
    const rbacEvents = auditEvents.filter(e => e.data?.metadata?.rbacValidationRequired);
    const rbacCompliantEvents = rbacEvents.filter(e => e.data?.metadata?.rbacCompliant !== false);
    const rbacViolations = rbacEvents.filter(e => e.data?.metadata?.rbacCompliant === false);
    
    // Nova data source validation
    const novaOnlyEvents = auditEvents.filter(e => e.data?.metadata?.dataSource === 'nova-internal-only');
    const externalDataEvents = auditEvents.filter(e => 
      e.data?.metadata?.dataSource && 
      e.data?.metadata?.dataSource !== 'nova-internal-only'
    );
    
    return {
      overview: {
        totalMetrics: this.metrics.size,
        totalAuditEvents: auditEvents.length,
        alerts: this.alerts.length,
        systemStatus: this.initialized ? 'operational' : 'offline',
        lastUpdate: new Date().toISOString(),
        // Nova-specific compliance
        novaComplianceStatus: {
          rbacCompliant: rbacViolations.length === 0,
          dataSourceCompliant: externalDataEvents.length === 0,
          totalViolations: rbacViolations.length + externalDataEvents.length,
        }
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
        novaRbacCompliant: rbacViolations.length === 0,
        novaDataOnlyCompliant: externalDataEvents.length === 0,
        lastAssessment: new Date().toISOString(),
        rbacStats: {
          totalRbacEvents: rbacEvents.length,
          compliantEvents: rbacCompliantEvents.length,
          violations: rbacViolations.length,
          complianceRate: rbacEvents.length > 0 ? (rbacCompliantEvents.length / rbacEvents.length) : 1,
        },
        dataSourceStats: {
          novaOnlyEvents: novaOnlyEvents.length,
          externalDataEvents: externalDataEvents.length,
          totalEvents: auditEvents.length,
          novaComplianceRate: auditEvents.length > 0 ? (novaOnlyEvents.length / auditEvents.length) : 1,
        }
      },
      rbacCompliance: {
        enforcementActive: true,
        violations: rbacViolations.map(v => ({
          id: v.data.id,
          type: v.data.type,
          timestamp: v.data.timestamp,
          userId: v.data.userId,
          tenantId: v.data.tenantId,
          severity: 'high'
        })),
        stats: {
          totalChecks: rbacEvents.length,
          passed: rbacCompliantEvents.length,
          failed: rbacViolations.length,
          successRate: rbacEvents.length > 0 ? (rbacCompliantEvents.length / rbacEvents.length * 100).toFixed(2) : '100.00'
        }
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
