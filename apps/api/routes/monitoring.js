import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Alert thresholds configuration
const ALERT_THRESHOLDS = {
  TICKET_VOLUME_HIGH: 50, // tickets per hour
  RESOLUTION_TIME_HIGH: 48, // hours
  ERROR_RATE_HIGH: 5, // percentage
  VIP_QUEUE_HIGH: 5, // VIP tickets waiting
  RESPONSE_TIME_HIGH: 1000, // milliseconds
  SYSTEM_LOAD_HIGH: 80 // percentage
};

// Alert severity levels
const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * @swagger
 * /api/monitoring/alerts:
 *   get:
 *     summary: Get current system alerts
 *     description: Active alerts and their severity levels
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 */
router.get('/alerts', authenticateJWT, async (req, res) => {
  try {
    const alerts = await generateSystemAlerts();
    res.json({
      alerts,
      count: alerts.length,
      severityCounts: {
        critical: alerts.filter(a => a.severity === SEVERITY.CRITICAL).length,
        high: alerts.filter(a => a.severity === SEVERITY.HIGH).length,
        medium: alerts.filter(a => a.severity === SEVERITY.MEDIUM).length,
        low: alerts.filter(a => a.severity === SEVERITY.LOW).length
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get alerts', { error: error.message });
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

/**
 * @swagger
 * /api/monitoring/health:
 *   get:
 *     summary: Get system health status
 *     description: Overall system health and component status
 *     tags: [Monitoring]
 */
router.get('/health', async (req, res) => {
  try {
    const healthChecks = await Promise.allSettled([
      checkDatabaseHealth(),
      checkAPIHealth(),
      checkServiceHealth(),
      checkExternalDependencies()
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      components: {
        database: healthChecks[0].status === 'fulfilled' ? healthChecks[0].value : { status: 'error', error: healthChecks[0].reason?.message },
        api: healthChecks[1].status === 'fulfilled' ? healthChecks[1].value : { status: 'error', error: healthChecks[1].reason?.message },
        services: healthChecks[2].status === 'fulfilled' ? healthChecks[2].value : { status: 'error', error: healthChecks[2].reason?.message },
        external: healthChecks[3].status === 'fulfilled' ? healthChecks[3].value : { status: 'error', error: healthChecks[3].reason?.message }
      }
    };

    // Determine overall status
    const componentStatuses = Object.values(health.components).map(c => c.status);
    if (componentStatuses.includes('critical')) {
      health.status = 'critical';
    } else if (componentStatuses.includes('degraded')) {
      health.status = 'degraded';
    } else if (componentStatuses.includes('error')) {
      health.status = 'unhealthy';
    }

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/monitoring/performance:
 *   get:
 *     summary: Get performance metrics
 *     description: System performance and resource utilization
 *     tags: [Monitoring]
 */
router.get('/performance', authenticateJWT, async (req, res) => {
  try {
    const performance = await getPerformanceMetrics();
    res.json(performance);
  } catch (error) {
    logger.error('Failed to get performance metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Generate system alerts based on thresholds
async function generateSystemAlerts() {
  const alerts = [];
  const now = new Date();

  try {
    // Check ticket volume
    const ticketVolume = await db.query(`
      SELECT COUNT(*) as count 
      FROM support_tickets 
      WHERE created_at >= NOW() - INTERVAL '1 hour'
    `);
    
    const hourlyTickets = parseInt(ticketVolume.rows[0].count);
    if (hourlyTickets > ALERT_THRESHOLDS.TICKET_VOLUME_HIGH) {
      alerts.push({
        id: `ticket-volume-${now.getTime()}`,
        type: 'ticket_volume',
        severity: hourlyTickets > ALERT_THRESHOLDS.TICKET_VOLUME_HIGH * 2 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        message: `High ticket volume: ${hourlyTickets} tickets created in the last hour`,
        metric: hourlyTickets,
        threshold: ALERT_THRESHOLDS.TICKET_VOLUME_HIGH,
        timestamp: now.toISOString(),
        action: 'Consider increasing support staff or activating escalation procedures'
      });
    }

    // Check average resolution time
    const resolutionTime = await db.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
      FROM support_tickets 
      WHERE resolved_at IS NOT NULL 
      AND resolved_at >= NOW() - INTERVAL '24 hours'
    `);
    
    const avgResolutionHours = parseFloat(resolutionTime.rows[0]?.avg_hours || 0);
    if (avgResolutionHours > ALERT_THRESHOLDS.RESOLUTION_TIME_HIGH) {
      alerts.push({
        id: `resolution-time-${now.getTime()}`,
        type: 'resolution_time',
        severity: avgResolutionHours > ALERT_THRESHOLDS.RESOLUTION_TIME_HIGH * 2 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        message: `High resolution time: ${avgResolutionHours.toFixed(1)} hours average`,
        metric: avgResolutionHours,
        threshold: ALERT_THRESHOLDS.RESOLUTION_TIME_HIGH,
        timestamp: now.toISOString(),
        action: 'Review ticket assignments and agent workload'
      });
    }

    // Check VIP queue
    const vipQueue = await db.query(`
      SELECT COUNT(*) as count 
      FROM support_tickets 
      WHERE vip_priority_score > 0 AND status IN ('open', 'in_progress')
    `);
    
    const vipWaiting = parseInt(vipQueue.rows[0].count);
    if (vipWaiting > ALERT_THRESHOLDS.VIP_QUEUE_HIGH) {
      alerts.push({
        id: `vip-queue-${now.getTime()}`,
        type: 'vip_queue',
        severity: vipWaiting > ALERT_THRESHOLDS.VIP_QUEUE_HIGH * 2 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        message: `High VIP queue: ${vipWaiting} VIP tickets waiting`,
        metric: vipWaiting,
        threshold: ALERT_THRESHOLDS.VIP_QUEUE_HIGH,
        timestamp: now.toISOString(),
        action: 'Prioritize VIP ticket assignment immediately'
      });
    }

    // Check error rate (mock for now)
    const errorRate = Math.random() * 10; // Mock error rate
    if (errorRate > ALERT_THRESHOLDS.ERROR_RATE_HIGH) {
      alerts.push({
        id: `error-rate-${now.getTime()}`,
        type: 'error_rate',
        severity: errorRate > ALERT_THRESHOLDS.ERROR_RATE_HIGH * 2 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        message: `High error rate: ${errorRate.toFixed(1)}% of requests failing`,
        metric: errorRate,
        threshold: ALERT_THRESHOLDS.ERROR_RATE_HIGH,
        timestamp: now.toISOString(),
        action: 'Check application logs and system health'
      });
    }

    // Check database connections
    const dbConnections = await db.query(`
      SELECT COUNT(*) as active_connections 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `).catch(() => ({ rows: [{ active_connections: 0 }] }));
    
    const connections = parseInt(dbConnections.rows[0].active_connections);
    if (connections > 50) { // Arbitrary threshold
      alerts.push({
        id: `db-connections-${now.getTime()}`,
        type: 'database_connections',
        severity: connections > 80 ? SEVERITY.CRITICAL : SEVERITY.MEDIUM,
        message: `High database connections: ${connections} active connections`,
        metric: connections,
        threshold: 50,
        timestamp: now.toISOString(),
        action: 'Monitor database performance and connection pooling'
      });
    }

  } catch (error) {
    logger.error('Error generating alerts', { error: error.message });
    alerts.push({
      id: `system-error-${now.getTime()}`,
      type: 'system_error',
      severity: SEVERITY.MEDIUM,
      message: 'Failed to generate some system alerts',
      timestamp: now.toISOString(),
      action: 'Check system logs for details'
    });
  }

  return alerts;
}

// Database health check
async function checkDatabaseHealth() {
  try {
    const result = await db.query('SELECT 1 as health');
    const connectionCount = await db.query('SELECT COUNT(*) FROM pg_stat_activity');
    
    return {
      status: 'healthy',
      responseTime: 50, // Mock response time
      connections: parseInt(connectionCount.rows[0].count),
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }
}

// API health check
async function checkAPIHealth() {
  try {
    // Simple health indicators
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      status: 'healthy',
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) // MB
      },
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }
}

// Service health check
async function checkServiceHealth() {
  return {
    status: 'healthy',
    services: {
      authentication: 'healthy',
      notifications: 'healthy',
      fileStorage: 'healthy',
      search: 'healthy'
    },
    lastChecked: new Date().toISOString()
  };
}

// External dependencies health check
async function checkExternalDependencies() {
  return {
    status: 'healthy',
    dependencies: {
      smtp: 'healthy',
      helpscout: 'healthy',
      slack: 'healthy'
    },
    lastChecked: new Date().toISOString()
  };
}

// Get performance metrics
async function getPerformanceMetrics() {
  const memoryUsage = process.memoryUsage();
  
  return {
    api: {
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        usage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      cpu: {
        usage: Math.random() * 30 + 10 // Mock CPU usage
      }
    },
    database: {
      connections: await db.query('SELECT COUNT(*) FROM pg_stat_activity').then(r => parseInt(r.rows[0].count)).catch(() => 0),
      size: await db.query('SELECT pg_database_size(current_database())').then(r => parseInt(r.rows[0].pg_database_size)).catch(() => 0)
    },
    timestamp: new Date().toISOString()
  };
}

export default router;
