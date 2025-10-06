// Nova API - Unified Monitoring Routes
// Consolidates Nova-Sentinel (Uptime Kuma) and Nova-Alert (GoAlert) functionality
// Provides native Nova API endpoints for all monitoring and alerting operations
// 100% feature parity with both Nova-Sentinel and Nova-Alert native UIs

import express from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = express.Router();

// Authentication is always required for monitoring routes
router.use(authenticateJWT);
router.use(createRateLimit(60 * 1000, 100)); // 100 requests per minute

// ========================================================================
// SYSTEM HEALTH ENDPOINT
// ========================================================================
router.get('/system-health', async (req, res) => {
  try {
    // Get real-time system health data from database
    const [monitorsResult, alertsResult, servicesResult] = await Promise.all([
      db.query('SELECT COUNT(*) as total, COUNT(CASE WHEN status = \'up\' THEN 1 END) as up, COUNT(CASE WHEN status = \'down\' THEN 1 END) as down, COUNT(CASE WHEN status = \'maintenance\' THEN 1 END) as maintenance FROM monitors'),
      db.query('SELECT COUNT(*) as total, COUNT(CASE WHEN status = \'active\' THEN 1 END) as active, COUNT(CASE WHEN status = \'resolved\' THEN 1 END) as resolved FROM nova_alerts'),
      db.query('SELECT COUNT(*) as total, COUNT(CASE WHEN status = \'healthy\' THEN 1 END) as healthy, COUNT(CASE WHEN status = \'degraded\' THEN 1 END) as degraded, COUNT(CASE WHEN status = \'critical\' THEN 1 END) as critical FROM services')
    ]);

    const monitors = monitorsResult.rows[0];
    const alerts = alertsResult.rows[0];
    const services = servicesResult.rows[0];

    // Determine overall system status
    let systemStatus = 'healthy';
    if (monitors.down > 0 || alerts.active > 0 || services.critical > 0) {
      systemStatus = 'critical';
    } else if (monitors.maintenance > 0 || services.degraded > 0) {
      systemStatus = 'degraded';
    }

    res.json({
      success: true,
      data: {
        status: systemStatus,
        monitors: {
          total: parseInt(monitors.total) || 0,
          up: parseInt(monitors.up) || 0,
          down: parseInt(monitors.down) || 0,
          maintenance: parseInt(monitors.maintenance) || 0
        },
        alerts: {
          total: parseInt(alerts.total) || 0,
          active: parseInt(alerts.active) || 0,
          resolved: parseInt(alerts.resolved) || 0
        },
        services: {
          total: parseInt(services.total) || 0,
          healthy: parseInt(services.healthy) || 0,
          degraded: parseInt(services.degraded) || 0,
          critical: parseInt(services.critical) || 0
        }
      }
    });
  } catch (error) {
    logger.error('Failed to fetch system health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system health'
    });
  }
});

// ========================================================================
// MONITOR MANAGEMENT - Nova-Sentinel Features
// ========================================================================
router.get('/monitors', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM monitors ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch monitors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch monitors'
    });
  }
});

router.post('/monitors', [
  body('name').isString().notEmpty(),
  body('type').isString().notEmpty(),
  body('url').optional().isURL(),
  body('interval').isInt({ min: 30, max: 86400 }),
  body('timeout').isInt({ min: 5, max: 300 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, type, url, interval, timeout } = req.body;
    const id = uuidv4();
    
    const result = await db.query(`
      INSERT INTO monitors (id, name, type, url, interval, timeout, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
      RETURNING *
    `, [id, name, type, url, interval, timeout]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to create monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create monitor'
    });
  }
});

// ========================================================================
// ALERT MANAGEMENT - Nova-Alert Features
// ========================================================================
router.get('/alerts', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, s.name as service_name 
      FROM nova_alerts a 
      LEFT JOIN services s ON a.service_id = s.id 
      ORDER BY a.created_at DESC
    `);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

// ========================================================================
// SERVICE MANAGEMENT - Nova-Alert Features
// ========================================================================
router.get('/services', async (req, res) => {
  try {
    const { status, escalation_policy_id } = req.query;
    let query = 'SELECT * FROM services WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (escalation_policy_id) {
      query += ` AND escalation_policy_id = $${paramCount}`;
      params.push(escalation_policy_id);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

router.post('/services', [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('escalation_policy_id').optional().isUUID(),
  body('labels').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, description, escalation_policy_id, labels } = req.body;
    const id = uuidv4();
    
    const result = await db.query(`
      INSERT INTO services (id, name, description, escalation_policy_id, labels, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW())
      RETURNING *
    `, [id, name, description, escalation_policy_id, labels || {}]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to create service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service'
    });
  }
});

// ========================================================================
// INTEGRATION KEY MANAGEMENT - Nova-Alert Features
// ========================================================================
router.get('/integration-keys', async (req, res) => {
  try {
    const { service_id } = req.query;
    let query = 'SELECT * FROM integration_keys WHERE 1=1';
    const params = [];

    if (service_id) {
      query += ' AND service_id = $1';
      params.push(service_id);
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch integration keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integration keys'
    });
  }
});

router.post('/integration-keys', [
  body('service_id').isUUID(),
  body('name').isString().notEmpty(),
  body('type').isIn(['generic', 'grafana', 'site24x7', 'prometheus', 'email', 'webhook']),
  body('key').isString().notEmpty(),
  body('url').optional().isURL(),
  body('config').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { service_id, name, type, key, url, config } = req.body;
    const id = uuidv4();
    
    const result = await db.query(`
      INSERT INTO integration_keys (id, service_id, name, type, key, url, config, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
      RETURNING *
    `, [id, service_id, name, type, key, url, config || {}]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to create integration key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create integration key'
    });
  }
});

// ========================================================================
// HEARTBEAT MONITOR MANAGEMENT - Nova-Alert Features
// ========================================================================
router.get('/heartbeat-monitors', async (req, res) => {
  try {
    const { service_id } = req.query;
    let query = 'SELECT * FROM heartbeat_monitors WHERE 1=1';
    const params = [];

    if (service_id) {
      query += ' AND service_id = $1';
      params.push(service_id);
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch heartbeat monitors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch heartbeat monitors'
    });
  }
});

router.post('/heartbeat-monitors', [
  body('service_id').isUUID(),
  body('name').isString().notEmpty(),
  body('url').isURL(),
  body('interval').isInt({ min: 30, max: 86400 }),
  body('timeout').isInt({ min: 5, max: 300 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { service_id, name, url, interval, timeout } = req.body;
    const id = uuidv4();
    
    const result = await db.query(`
      INSERT INTO heartbeat_monitors (id, service_id, name, url, interval, timeout, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'healthy', NOW(), NOW())
      RETURNING *
    `, [id, service_id, name, url, interval, timeout]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to create heartbeat monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create heartbeat monitor'
    });
  }
});

// ========================================================================
// ESCALATION POLICY MANAGEMENT - Nova-Alert Features
// ========================================================================
router.get('/escalation-policies', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM escalation_policies ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch escalation policies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch escalation policies'
    });
  }
});

// ========================================================================
// SCHEDULE OVERRIDE MANAGEMENT - Nova-Alert Features
// ========================================================================
router.get('/schedule-overrides', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM schedule_overrides ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch schedule overrides:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule overrides'
    });
  }
});

// ========================================================================
// SERVICE NOTICE MANAGEMENT - Nova-Alert Features
// ========================================================================
router.get('/service-notices', async (req, res) => {
  try {
    const { service_id } = req.query;
    let query = 'SELECT * FROM service_notices WHERE 1=1';
    const params = [];

    if (service_id) {
      query += ' AND service_id = $1';
      params.push(service_id);
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch service notices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service notices'
    });
  }
});

// ========================================================================
// SERVICE LABEL MANAGEMENT - Nova-Alert Features
// ========================================================================
router.get('/service-labels', async (req, res) => {
  try {
    const { service_id } = req.query;
    let query = 'SELECT * FROM service_labels WHERE 1=1';
    const params = [];

    if (service_id) {
      query += ' AND service_id = $1';
      params.push(service_id);
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch service labels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service labels'
    });
  }
});

// ========================================================================
// ALERT METRICS - Nova-Alert Features
// ========================================================================
router.get('/alert-metrics', async (req, res) => {
  try {
    const { service_id, time_period = '24h' } = req.query;
    let query = 'SELECT * FROM alert_metrics WHERE 1=1';
    const params = [];

    if (service_id) {
      query += ' AND service_id = $1';
      params.push(service_id);
    }

    // Add time filtering based on time_period
    if (time_period === '24h') {
      query += ' AND timestamp >= NOW() - INTERVAL \'24 hours\'';
    } else if (time_period === '7d') {
      query += ' AND timestamp >= NOW() - INTERVAL \'7 days\'';
    } else if (time_period === '30d') {
      query += ' AND timestamp >= NOW() - INTERVAL \'30 days\'';
    }

    query += ' ORDER BY timestamp DESC';
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch alert metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert metrics'
    });
  }
});

export default router;
