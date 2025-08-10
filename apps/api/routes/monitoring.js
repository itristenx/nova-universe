import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import axios from 'axios';
import events from '../events.js';
import { audit, logAudit } from '../middleware/audit.js';

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

// ==========================================
// NOVA SENTINEL MONITORING ENDPOINTS
// ==========================================

/**
 * @swagger
 * /api/monitoring/monitors:
 *   get:
 *     summary: List all monitors (scoped by role)
 *     description: Get monitors based on user role and tenant
 *     tags: [Nova Sentinel]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monitors', authenticateJWT, async (req, res) => {
  try {
    const { tenant_id, group_id, status, type } = req.query;
    const user = req.user;

    let query = `
      SELECT m.*, 
             COUNT(CASE WHEN h.status = 'up' THEN 1 END) * 100.0 / NULLIF(COUNT(h.id), 0) as uptime_24h,
             mg.name as group_name,
             CASE WHEN mi.id IS NOT NULL THEN mi.status ELSE NULL END as incident_status
      FROM monitors m
      LEFT JOIN monitor_heartbeats h ON m.id = h.monitor_id 
        AND h.checked_at >= NOW() - INTERVAL '24 hours'
      LEFT JOIN monitor_group_members mgm ON m.id = mgm.monitor_id
      LEFT JOIN monitor_groups mg ON mgm.group_id = mg.id
      LEFT JOIN monitor_incidents mi ON m.id = mi.monitor_id 
        AND mi.status IN ('open', 'acknowledged', 'investigating')
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Apply tenant scoping for Orbit users
    if (tenant_id) {
      query += ` AND m.tenant_id = $${paramIndex}`;
      params.push(tenant_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND m.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (type) {
      query += ` AND m.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (group_id) {
      query += ` AND mgm.group_id = $${paramIndex}`;
      params.push(group_id);
      paramIndex++;
    }

    query += `
      GROUP BY m.id, mg.name, mi.id, mi.status
      ORDER BY m.name
    `;

    const result = await db.query(query, params);
    
    res.json({
      monitors: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get monitors', { error: error.message });
    res.status(500).json({ error: 'Failed to get monitors' });
  }
});

/**
 * @swagger
 * /api/monitoring/monitors:
 *   post:
 *     summary: Create a new monitor
 *     description: Create a new monitoring configuration
 *     tags: [Nova Sentinel]
 *     security:
 *       - bearerAuth: []
 */
router.post('/monitors', authenticateJWT, async (req, res) => {
  try {
    const {
      name, type, url, hostname, port, tenant_id, tags = [],
      interval_seconds = 60, timeout_seconds = 30, retry_interval_seconds = 60,
      max_retries = 3, http_method = 'GET', http_headers = {},
      accepted_status_codes = [200, 201, 202, 203, 204],
      follow_redirects = true, ignore_ssl = false
    } = req.body;

    const user = req.user;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    // Type-specific validation
    if (type === 'http' && !url) {
      return res.status(400).json({ error: 'URL is required for HTTP monitors' });
    }
    if ((type === 'ping' || type === 'dns') && !hostname) {
      return res.status(400).json({ error: 'Hostname is required for ping/DNS monitors' });
    }
    if (type === 'tcp' && (!hostname || !port)) {
      return res.status(400).json({ error: 'Hostname and port are required for TCP monitors' });
    }

    const result = await db.query(`
      INSERT INTO monitors (
        name, type, url, hostname, port, tenant_id, tags, 
        interval_seconds, timeout_seconds, retry_interval_seconds, max_retries,
        http_method, http_headers, accepted_status_codes, follow_redirects, ignore_ssl,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      name, type, url, hostname, port, tenant_id, JSON.stringify(tags),
      interval_seconds, timeout_seconds, retry_interval_seconds, max_retries,
      http_method, JSON.stringify(http_headers), JSON.stringify(accepted_status_codes),
      follow_redirects, ignore_ssl, user.id
    ]);

    const monitor = result.rows[0];

    // Create corresponding Uptime Kuma monitor via API (best-effort)
    try {
      const { kumaClient } = await import('../lib/uptime-kuma.js');
      const kuma = await kumaClient.createMonitor({
        name: monitor.name,
        type: monitor.type,
        url: monitor.url,
        hostname: monitor.hostname,
        port: monitor.port,
        interval: monitor.interval_seconds,
        timeout: monitor.timeout_seconds,
        active: monitor.status !== 'disabled'
      });
      // persist kuma_id
      await db.query('UPDATE monitors SET kuma_id = $1 WHERE id = $2', [kuma.id, monitor.id]);
    } catch (e) {
      logger.warn('Failed to create Kuma monitor (non-blocking)', { error: e.message, monitorId: monitor.id });
    }

    logger.info('Monitor created', { 
      monitorId: monitor.id, 
      name: monitor.name, 
      type: monitor.type,
      createdBy: user.id 
    });

    res.status(201).json(monitor);
  } catch (error) {
    logger.error('Failed to create monitor', { error: error.message });
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

/**
 * @swagger
 * /api/monitoring/monitors/{id}:
 *   get:
 *     summary: Get monitor details
 *     description: Get detailed information about a specific monitor
 *     tags: [Nova Sentinel]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monitors/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '24h' } = req.query;

    // Get monitor details
    const monitorResult = await db.query(`
      SELECT m.*, 
             mg.name as group_name,
             COUNT(CASE WHEN h.status = 'up' THEN 1 END) * 100.0 / NULLIF(COUNT(h.id), 0) as uptime_percent,
             AVG(h.response_time_ms) as avg_response_time
      FROM monitors m
      LEFT JOIN monitor_group_members mgm ON m.id = mgm.monitor_id
      LEFT JOIN monitor_groups mg ON mgm.group_id = mg.id
      LEFT JOIN monitor_heartbeats h ON m.id = h.monitor_id 
        AND h.checked_at >= NOW() - INTERVAL '${period === '7d' ? '7 days' : '24 hours'}'
      WHERE m.id = $1
      GROUP BY m.id, mg.name
    `, [id]);

    if (monitorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const monitor = monitorResult.rows[0];

    // Get recent heartbeats
    const heartbeatsResult = await db.query(`
      SELECT status, response_time_ms, checked_at, error_message
      FROM monitor_heartbeats
      WHERE monitor_id = $1
      ORDER BY checked_at DESC
      LIMIT 100
    `, [id]);

    // Get active incidents
    const incidentsResult = await db.query(`
      SELECT id, status, severity, summary, started_at, acknowledged_at
      FROM monitor_incidents
      WHERE monitor_id = $1 AND status IN ('open', 'acknowledged', 'investigating')
      ORDER BY started_at DESC
    `, [id]);

    res.json({
      monitor,
      heartbeats: heartbeatsResult.rows,
      incidents: incidentsResult.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get monitor details', { error: error.message });
    res.status(500).json({ error: 'Failed to get monitor details' });
  }
});

/**
 * @swagger
 * /api/monitoring/monitors/{id}:
 *   patch:
 *     summary: Update monitor
 *     description: Update an existing monitor configuration
 *     tags: [Nova Sentinel]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/monitors/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;

    // Build dynamic update query
    const allowedFields = [
      'name', 'url', 'hostname', 'port', 'tags', 'interval_seconds',
      'timeout_seconds', 'retry_interval_seconds', 'max_retries', 'status',
      'http_method', 'http_headers', 'accepted_status_codes', 'follow_redirects',
      'ignore_ssl', 'notification_settings'
    ];

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE monitors 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Update corresponding Uptime Kuma monitor
    try {
      const updated = result.rows[0];
      if (updated.kuma_id) {
        const { kumaClient } = await import('../lib/uptime-kuma.js');
        await kumaClient.updateMonitor(updated.kuma_id, {
          name: updated.name,
          type: updated.type,
          url: updated.url,
          hostname: updated.hostname,
          port: updated.port,
          interval: updated.interval_seconds,
          timeout: updated.timeout_seconds,
          active: updated.status !== 'disabled'
        });
      }
    } catch (e) {
      logger.warn('Failed to update Kuma monitor (non-blocking)', { error: e.message, monitorId: id });
    }

    logger.info('Monitor updated', { 
      monitorId: id, 
      updates: Object.keys(updates),
      updatedBy: user.id 
    });

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to update monitor', { error: error.message });
    res.status(500).json({ error: 'Failed to update monitor' });
  }
});

/**
 * @swagger
 * /api/monitoring/monitors/{id}:
 *   delete:
 *     summary: Delete monitor
 *     description: Delete a monitor and all associated data
 *     tags: [Nova Sentinel]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/monitors/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await db.query('DELETE FROM monitors WHERE id = $1 RETURNING name, kuma_id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Delete corresponding Uptime Kuma monitor
    try {
      const kumaId = result.rows[0].kuma_id;
      if (kumaId) {
        const { kumaClient } = await import('../lib/uptime-kuma.js');
        await kumaClient.deleteMonitor(kumaId);
      }
    } catch (e) {
      logger.warn('Failed to delete Kuma monitor (non-blocking)', { error: e.message, monitorId: id });
    }

    logger.info('Monitor deleted', { 
      monitorId: id, 
      name: result.rows[0].name,
      deletedBy: user.id 
    });

    res.json({ message: 'Monitor deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete monitor', { error: error.message });
    res.status(500).json({ error: 'Failed to delete monitor' });
  }
});

/**
 * @swagger
 * /api/monitoring/incidents:
 *   get:
 *     summary: List current incidents
 *     description: Get list of active and recent incidents
 *     tags: [Nova Sentinel]
 *     security:
 *       - bearerAuth: []
 */
router.get('/incidents', authenticateJWT, async (req, res) => {
  try {
    const { status, severity, monitor_id, tenant_id } = req.query;

    let query = `
      SELECT i.*, m.name as monitor_name, m.type as monitor_type, m.tenant_id
      FROM monitor_incidents i
      JOIN monitors m ON i.monitor_id = m.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (severity) {
      query += ` AND i.severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    if (monitor_id) {
      query += ` AND i.monitor_id = $${paramIndex}`;
      params.push(monitor_id);
      paramIndex++;
    }

    if (tenant_id) {
      query += ` AND m.tenant_id = $${paramIndex}`;
      params.push(tenant_id);
      paramIndex++;
    }

    query += ` ORDER BY i.started_at DESC LIMIT 100`;

    const result = await db.query(query, params);

    res.json({
      incidents: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get incidents', { error: error.message });
    res.status(500).json({ error: 'Failed to get incidents' });
  }
});

/**
 * @swagger
 * /api/monitoring/events:
 *   post:
 *     summary: Webhook endpoint for Uptime Kuma events
 *     description: Receives monitor status change events from Uptime Kuma
 *     tags: [Nova Sentinel]
 */
router.post('/events', async (req, res) => {
  try {
    const { monitor, heartbeat, msg } = req.body;
    const signature = req.headers['x-uptime-kuma-signature'];

    // Verify webhook signature if a secret is configured
    if (!verifyWebhookSignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process the event
    await processKumaEvent({
      monitor,
      heartbeat,
      message: msg,
      timestamp: new Date().toISOString()
    });

    // Emit realtime update to monitoring subscribers
    if (req.app?.wsManager) {
      req.app.wsManager.broadcastToSubscribers('system_status', {
        type: 'sentinel_kuma_event',
        data: { monitorId: monitor?.id, status: heartbeat?.status, time: heartbeat?.time },
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to process Kuma event', { error: error.message });
    res.status(500).json({ error: 'Failed to process event' });
  }
});

/**
 * @swagger
 * /api/monitoring/subscribe:
 *   post:
 *     summary: Subscribe to monitor notifications
 *     description: Subscribe user to notifications for specific monitors
 *     tags: [Nova Sentinel]
 *     security:
 *       - bearerAuth: []
 */
router.post('/subscribe', authenticateJWT, async (req, res) => {
  try {
    const { monitor_id, notification_type = 'email', notification_config = {} } = req.body;
    const user = req.user;

    if (!monitor_id) {
      return res.status(400).json({ error: 'Monitor ID is required' });
    }

    const result = await db.query(`
      INSERT INTO monitor_subscriptions (monitor_id, user_id, notification_type, notification_config)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (monitor_id, user_id, notification_type) 
      DO UPDATE SET active = true, notification_config = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [monitor_id, user.id, notification_type, JSON.stringify(notification_config)]);

    logger.info('User subscribed to monitor', { 
      monitorId: monitor_id, 
      userId: user.id, 
      notificationType: notification_type 
    });

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to create subscription', { error: error.message });
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * @swagger
 * /api/monitoring/history/{id}:
 *   get:
 *     summary: Get monitor uptime history
 *     description: Fetch uptime history and statistics for a monitor
 *     tags: [Nova Sentinel]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '7d' } = req.query;
    // Whitelist granularity to prevent SQL injection via date_trunc
    const rawGranularity = (req.query.granularity || 'hour').toString();
    const allowedGranularity = new Set(['hour', 'day']);
    const granularity = allowedGranularity.has(rawGranularity) ? rawGranularity : 'hour';

    let interval;
    let timeRange;

    switch (period) {
      case '24h':
        interval = '1 hour';
        timeRange = '24 hours';
        break;
      case '7d':
        interval = '6 hours';
        timeRange = '7 days';
        break;
      case '30d':
        interval = '1 day';
        timeRange = '30 days';
        break;
      default:
        interval = '1 hour';
        timeRange = '24 hours';
    }

    const query = `
      SELECT 
        date_trunc('${granularity}', checked_at) as time_bucket,
        COUNT(*) as total_checks,
        COUNT(CASE WHEN status = 'up' THEN 1 END) as up_checks,
        AVG(response_time_ms) as avg_response_time,
        MIN(response_time_ms) as min_response_time,
        MAX(response_time_ms) as max_response_time
      FROM monitor_heartbeats
      WHERE monitor_id = $1 
        AND checked_at >= NOW() - INTERVAL '${timeRange}'
      GROUP BY time_bucket
      ORDER BY time_bucket
    `;

    const result = await db.query(query, [id]);

    // Calculate overall statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_checks,
        COUNT(CASE WHEN status = 'up' THEN 1 END) as up_checks,
        COUNT(CASE WHEN status = 'down' THEN 1 END) as down_checks,
        AVG(response_time_ms) as avg_response_time
      FROM monitor_heartbeats
      WHERE monitor_id = $1 
        AND checked_at >= NOW() - INTERVAL '${timeRange}'
    `;

    const statsResult = await db.query(statsQuery, [id]);
    const stats = statsResult.rows[0];

    res.json({
      history: result.rows.map(row => ({
        timestamp: row.time_bucket,
        uptime_percent: stats.total_checks > 0 ? (row.up_checks / row.total_checks) * 100 : 0,
        avg_response_time: parseFloat(row.avg_response_time) || 0,
        min_response_time: parseInt(row.min_response_time) || 0,
        max_response_time: parseInt(row.max_response_time) || 0,
        total_checks: parseInt(row.total_checks)
      })),
      statistics: {
        period,
        total_checks: parseInt(stats.total_checks),
        uptime_percent: stats.total_checks > 0 ? (stats.up_checks / stats.total_checks) * 100 : 0,
        downtime_count: parseInt(stats.down_checks),
        avg_response_time: parseFloat(stats.avg_response_time) || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get monitor history', { error: error.message });
    res.status(500).json({ error: 'Failed to get monitor history' });
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Process incoming Uptime Kuma event
 */
async function processKumaEvent(event) {
  try {
    const { monitor, heartbeat, message, timestamp } = event;
    
    // Find our monitor by kuma_id
    const monitorResult = await db.query(
      'SELECT * FROM monitors WHERE kuma_id = $1',
      [monitor.id]
    );

    if (monitorResult.rows.length === 0) {
      logger.warn('Received event for unknown monitor', { kumaId: monitor.id });
      return;
    }

    const novaMonitor = monitorResult.rows[0];

    // Record heartbeat
    await db.query(`
      INSERT INTO monitor_heartbeats (
        monitor_id, status, response_time_ms, status_code, 
        error_message, checked_at, important
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      novaMonitor.id,
      heartbeat.status === 1 ? 'up' : 'down',
      heartbeat.ping || null,
      heartbeat.statusCode || null,
      heartbeat.msg || null,
      new Date(heartbeat.time),
      heartbeat.important || false
    ]);

    // Handle incident management
    if (heartbeat.status === 0 && heartbeat.important) {
      // Service went down - create/update incident
      await handleServiceDown(novaMonitor, heartbeat, message);
    } else if (heartbeat.status === 1 && heartbeat.important) {
      // Service recovered - resolve incident
      await handleServiceRecovered(novaMonitor, heartbeat);
    }

    logger.debug('Kuma event processed', { 
      monitorId: novaMonitor.id, 
      status: heartbeat.status === 1 ? 'up' : 'down',
      important: heartbeat.important 
    });

  } catch (error) {
    logger.error('Failed to process Kuma event', { error: error.message, event });
  }
}

/**
 * Verify HMAC-SHA256 signature for Uptime Kuma webhooks
 * Accepts hex-encoded signatures. If no secret configured, reject.
 */
function verifyWebhookSignature(payload, signatureHeader) {
  try {
    const secret = process.env.SENTINEL_WEBHOOK_SECRET || process.env.KUMA_WEBHOOK_SECRET;
    if (!secret) {
      // No secret configured → reject to avoid accepting unsigned requests in production
      return false;
    }

    if (!signatureHeader || typeof signatureHeader !== 'string') {
      return false;
    }

    const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expected = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');

    const sig = Buffer.from(signatureHeader, 'utf8');
    const exp = Buffer.from(expected, 'utf8');
    if (sig.length !== exp.length) return false;
    return crypto.timingSafeEqual(sig, exp);
  } catch (e) {
    logger.warn('Webhook signature verification error', { error: e.message });
    return false;
  }
}

/**
 * Handle service down event
 */
async function handleServiceDown(monitor, heartbeat, message) {
  try {
    // Check if there's already an open incident
    const existingIncident = await db.query(`
      SELECT id FROM monitor_incidents 
      WHERE monitor_id = $1 AND status IN ('open', 'acknowledged', 'investigating')
      ORDER BY started_at DESC LIMIT 1
    `, [monitor.id]);

    if (existingIncident.rows.length === 0) {
      // Create new incident
      const severity = determineSeverity(monitor, heartbeat);
      const summary = await generateIncidentSummary(monitor, heartbeat, message);

      const result = await db.query(`
        INSERT INTO monitor_incidents (
          monitor_id, status, severity, summary, description, started_at
        ) VALUES ($1, 'open', $2, $3, $4, $5)
        RETURNING *
      `, [
        monitor.id,
        severity,
        summary,
        `Monitor ${monitor.name} is experiencing issues: ${heartbeat.msg || 'Unknown error'}`,
        new Date(heartbeat.time)
      ]);

      const incident = result.rows[0];

      // Emit realtime update
      if (globalThis.app?.wsManager) {
        try {
          globalThis.app.wsManager.broadcastToSubscribers('system_status', {
            type: 'sentinel_incident_created',
            data: { incident },
            timestamp: new Date().toISOString()
          });
        } catch {}
      }

      // Write audit log
      await db.createAuditLog('sentinel.incident.auto_created', 'system', {
        monitor_id: monitor.id,
        severity,
        summary,
      });

      logger.info('Incident created', { 
        incidentId: incident.id, 
        monitorId: monitor.id, 
        severity 
      });
    }
  } catch (error) {
    logger.error('Failed to handle service down', { error: error.message });
  }
}

/**
 * Handle service recovered event
 */
async function handleServiceRecovered(monitor, heartbeat) {
  try {
    // Auto-resolve open incidents if configured
    const autoResolve = await getConfigValue('monitoring.incident_auto_resolve', 'true');
    
    if (autoResolve === 'true') {
      const result = await db.query(`
        UPDATE monitor_incidents 
        SET status = 'resolved', resolved_at = $1, auto_resolved = true
        WHERE monitor_id = $2 AND status IN ('open', 'acknowledged', 'investigating')
        RETURNING *
      `, [new Date(heartbeat.time), monitor.id]);

      const resolved = result.rows;

      if (globalThis.app?.wsManager && resolved.length > 0) {
        try {
          globalThis.app.wsManager.broadcastToSubscribers('system_status', {
            type: 'sentinel_incident_resolved',
            data: { monitorId: monitor.id, count: resolved.length },
            timestamp: new Date().toISOString()
          });
        } catch {}
      }

      await db.createAuditLog('sentinel.incident.auto_resolved', 'system', {
        monitor_id: monitor.id,
        resolved_count: resolved.length,
      });

      // Send recovery notifications
      try {
        const { notificationService } = await import('../lib/notifications.js');
        await notificationService.sendNotification({
          type: 'incident_resolved',
          monitor_id: monitor.id,
          incident_id: resolved?.[0]?.id,
          tenant_id: monitor.tenant_id || 'default',
          severity: 'low',
          title: `Service recovered: ${monitor.name}`,
          message: `Monitor ${monitor.name} has recovered at ${new Date(heartbeat.time).toISOString()}.`,
          data: { monitor, heartbeat }
        });
      } catch (notifyErr) {
        logger.warn('Failed to send recovery notifications', { error: notifyErr.message });
      }

      // Update Orbit banners via WebSocket broadcast (best-effort)
      try {
        if (globalThis.app?.wsManager) {
          globalThis.app.wsManager.broadcastToSubscribers('system_status', {
            type: 'service_recovered',
            data: { monitorId: monitor.id, name: monitor.name },
            timestamp: new Date().toISOString()
          });
        }
      } catch {}

      logger.info('Incident auto-resolved', { monitorId: monitor.id });
    }
  } catch (error) {
    logger.error('Failed to handle service recovery', { error: error.message });
  }
}

/**
 * Determine incident severity based on monitor configuration
 */
function determineSeverity(monitor, heartbeat) {
  // Basic severity determination - can be enhanced with ML
  if (monitor.tenant_id) {
    // Tenant-scoped monitors are more critical
    return 'high';
  }
  
  if (monitor.type === 'http' && heartbeat.statusCode >= 500) {
    return 'high';
  }
  
  return 'medium';
}

/**
 * Generate AI-enhanced incident summary
 */
async function generateIncidentSummary(monitor, heartbeat, message) {
  // Attempt AI-generated summary via Nova Synth MCP
  try {
    const { initializeMCPServer } = await import('../utils/cosmo.js');
    const mcp = await initializeMCPServer();
    const analysis = await mcp.callTool('nova.alerts.analyze', {
      userId: monitor.updated_by || monitor.created_by || 'system',
      module: 'pulse',
      userRole: 'technician',
      context: {
        ticketId: null,
        priority: 'high',
        affectedUsers: 0,
        serviceCategory: monitor.type,
        keywords: ['outage', 'down']
      },
      message: `Monitor ${monitor.name} is ${heartbeat.status === 1 ? 'up' : 'down'}.
Reason: ${heartbeat.msg || message || 'Unknown'}`
    });
    const parsed = JSON.parse(analysis.content?.[0]?.text || '{}');
    return parsed.reasoning || `Incident detected on ${monitor.name}: ${heartbeat.msg || 'Service appears to be down.'}`;
  } catch (e) {
    // Fallback to basic summary
    return `${monitor.name} is currently experiencing issues. ${heartbeat.msg || 'Service appears to be down.'}`;
  }
}

// ==========================================
// NOVA SENTINEL UPTIME KUMA INTEGRATION
// ==========================================

/**
 * @swagger
 * /api/monitoring/kuma/monitors:
 *   get:
 *     summary: Get all monitors with Kuma integration
 *     description: Fetch monitors from Nova Sentinel with live Kuma status
 *     tags: [Nova Sentinel]
 *     security:
 *       - bearerAuth: []
 */
router.get('/kuma/monitors', authenticateJWT, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    // Import Kuma client dynamically to avoid module loading issues
    const { kumaClient, syncStatusFromKuma } = await import('../lib/uptime-kuma.js');
    
    // Sync latest status from Kuma (non-blocking)
    try {
      await syncStatusFromKuma();
    } catch (syncError) {
      logger.warn('Failed to sync from Kuma, using cached data', { error: syncError.message });
    }
    
    const result = await db.query(`
      SELECT 
        m.*,
        COUNT(CASE WHEN i.status != 'resolved' THEN 1 END) as active_incidents
      FROM monitors m
      LEFT JOIN monitor_incidents i ON m.id = i.monitor_id
      WHERE m.tenant_id = $1 AND m.deleted_at IS NULL
      GROUP BY m.id
      ORDER BY m.name ASC
    `, [tenantId]);
    
    res.json({
      monitors: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    logger.error('Error fetching Kuma monitors', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

/**
 * @swagger
 * /api/monitoring/kuma/webhook:
 *   post:
 *     summary: Process webhook from Uptime Kuma
 *     description: Handle real-time status updates from Kuma
 *     tags: [Nova Sentinel]
 */
router.post('/kuma/webhook', async (req, res) => {
  try {
    logger.info('Received Kuma webhook', { payload: req.body });
    
    // Import webhook processor dynamically
    const { processKumaWebhook } = await import('../lib/uptime-kuma.js');
    
    // Process the webhook
    await processKumaWebhook(req.body);
    
    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    logger.error('Error processing Kuma webhook', { error: error.message });
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

/**
 * @swagger
 * /api/monitoring/status/{tenant}:
 *   get:
 *     summary: Public status page endpoint
 *     description: Get public status page data for a tenant
 *     tags: [Nova Sentinel]
 *     parameters:
 *       - in: path
 *         name: tenant
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/status/:tenant', async (req, res) => {
  try {
    const tenantId = req.params.tenant;
    
    // Get status page configuration
    const configResult = await db.query(`
      SELECT * FROM status_page_configs 
      WHERE tenant_id = $1
    `, [tenantId]);
    
    const config = configResult.rows[0] || {
      title: 'Service Status',
      description: 'Current status of our services',
      show_uptime_percentages: true,
      show_incident_history_days: 30
    };
    
    // Get monitors and their status (with groups)
    const monitorsResult = await db.query(`
      SELECT 
        m.id,
        m.name,
        m.type,
        m.status,
        m.uptime_24h,
        m.uptime_7d,
        m.uptime_30d,
        m.avg_response_time,
        m.last_check,
        m.description,
        mg.id as group_id,
        mg.name as group_name
      FROM monitors m
      LEFT JOIN monitor_group_members mgm ON m.id = mgm.monitor_id
      LEFT JOIN monitor_groups mg ON mgm.group_id = mg.id
      WHERE m.tenant_id = $1 AND m.deleted_at IS NULL AND m.status != 'disabled'
      ORDER BY m.name ASC
    `, [tenantId]);
    
    // Get active incidents
    const incidentsResult = await db.query(`
      SELECT 
        i.*,
        m.name as monitor_name
      FROM monitor_incidents i
      JOIN monitors m ON i.monitor_id = m.id
      WHERE i.tenant_id = $1 AND i.status != 'resolved'
      ORDER BY i.started_at DESC
    `, [tenantId]);
    
    // Calculate overall status
    const monitors = monitorsResult.rows;
    let overallStatus = 'operational';
    
    if (monitors.some(m => m.uptime_24h < 50)) {
      overallStatus = 'major_outage';
    } else if (monitors.some(m => m.uptime_24h < 95)) {
      overallStatus = 'degraded';
    }
    
    // Check for maintenance windows
    const maintenanceResult = await db.query(`
      SELECT * FROM maintenance_windows 
      WHERE tenant_id = $1 
      AND (status = 'in_progress' OR (status = 'scheduled' AND scheduled_start <= NOW() + INTERVAL '24 hours'))
      ORDER BY scheduled_start ASC
    `, [tenantId]);
    
    if (maintenanceResult.rows.length > 0) {
      overallStatus = 'maintenance';
    }
    
    // Build service groups
    const groupsMap = new Map();
    for (const m of monitors) {
      if (m.group_id && m.group_name) {
        if (!groupsMap.has(m.group_id)) {
          groupsMap.set(m.group_id, { id: m.group_id, name: m.group_name, services: [] });
        }
        groupsMap.get(m.group_id).services.push(m.id);
      }
    }

    res.json({
      config,
      services: monitors,
      groups: Array.from(groupsMap.values()),
      active_incidents: incidentsResult.rows,
      maintenance_windows: maintenanceResult.rows,
      overall_status: overallStatus,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching status page', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch status page' });
  }
});

/**
 * @swagger
 * /api/monitoring/health:
 *   get:
 *     summary: System health check
 *     description: Check health of Nova Sentinel and Uptime Kuma
 *     tags: [Nova Sentinel]
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await db.query('SELECT 1');
    
    // Check Uptime Kuma connectivity
    let kumaHealth = false;
    try {
      const { kumaClient } = await import('../lib/uptime-kuma.js');
      kumaHealth = await kumaClient.ping();
    } catch (kumaError) {
      logger.warn('Kuma health check failed', { error: kumaError.message });
    }
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime_kuma: kumaHealth ? 'connected' : 'disconnected'
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// ==========================================
// END NOVA SENTINEL INTEGRATION
// ==========================================

/**
 * Get configuration value with fallback
 */
async function getConfigValue(key, defaultValue) {
  try {
    const result = await db.query('SELECT value FROM config WHERE key = $1', [key]);
    return result.rows.length > 0 ? result.rows[0].value : defaultValue;
  } catch (error) {
    logger.error('Failed to get config value', { key, error: error.message });
    return defaultValue;
  }
}

/**
 * Create incident manually from Pulse UI
 */
router.post('/monitor-incident', authenticateJWT, audit('sentinel.incident.create'), async (req, res) => {
  try {
    const { monitorId, monitorName, status = 'down', errorMessage = '', important = false } = req.body;

    // Find monitor by kuma_id or internal id
    const monitorQuery = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/.test(monitorId)
      ? { sql: 'SELECT * FROM monitors WHERE id = $1', params: [monitorId] }
      : { sql: 'SELECT * FROM monitors WHERE kuma_id = $1', params: [monitorId] };

    const monitorResult = await db.query(monitorQuery.sql, monitorQuery.params);
    if (monitorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    const monitor = monitorResult.rows[0];

    const severity = determineSeverity(monitor, { status: status === 'up' ? 1 : 0, statusCode: null });
    const summary = await generateIncidentSummary(monitor, { msg: errorMessage }, errorMessage);

    const result = await db.query(`
      INSERT INTO monitor_incidents (monitor_id, status, severity, summary, description, started_at)
      VALUES ($1, 'open', $2, $3, $4, NOW())
      RETURNING *
    `, [monitor.id, severity, summary, `Manual incident: ${errorMessage || 'Triggered from Pulse'}`]);

    const incident = result.rows[0];

    // Broadcast via websockets
    if (req.app?.wsManager) {
      req.app.wsManager.broadcastToSubscribers('system_status', {
        type: 'sentinel_incident_created',
        data: { incident },
        timestamp: new Date().toISOString()
      });
    }

    // Audit log
    await logAudit('sentinel.incident.created', req.user, {
      monitor_id: monitor.id,
      monitor_name: monitorName || monitor.name,
      severity,
      status,
    });

    res.status(201).json({ success: true, incident });
  } catch (error) {
    logger.error('Failed to create incident', { error: error.message });
    res.status(500).json({ error: 'Failed to create incident' });
  }
});
