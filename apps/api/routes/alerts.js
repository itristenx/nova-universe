// nova-api/routes/alerts.js
// Nova Alert System - GoAlert Proxy Integration
// Complete 1:1 feature parity with GoAlert backend through Nova API

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { checkPermissions } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js'; // ensured to be ESM and writes to alert_audit_log
import fetch from 'node-fetch';

const router = express.Router();

// ========================================================================
// GOALERT PROXY CONFIGURATION
// ========================================================================

const GOALERT_CONFIG = {
  baseUrl: process.env.GOALERT_API_BASE || 'http://localhost:8081',
  apiKey: process.env.GOALERT_API_KEY,
  enabled: process.env.GOALERT_PROXY_ENABLED === 'true',
  source: process.env.GOALERT_ALERT_SOURCE || 'nova'
};

/**
 * Make authenticated request to GoAlert API
 */
async function makeGoAlertRequest(endpoint, options = {}) {
  if (!GOALERT_CONFIG.enabled) {
    throw new Error('GoAlert integration is disabled');
  }

  const url = `${GOALERT_CONFIG.baseUrl}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${GOALERT_CONFIG.apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Nova-Universe/1.0',
    ...options.headers
  };

  logger.debug(`GoAlert API Request: ${options.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
    timeout: 30000
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error(`GoAlert API Error: ${response.status} - ${error}`);
    throw new Error(`GoAlert API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Log alert operations for audit trail
 */
async function logAlertOperation(userId, operation, alertData, metadata = {}) {
  try {
    const logEntry = {
      user_id: userId,
      operation,
      alert_id: alertData.id || alertData.alertId,
      schedule_id: alertData.scheduleId,
      source_ticket_id: alertData.sourceTicketId,
      delivery_status: alertData.deliveryStatus || 'pending',
      metadata: JSON.stringify(metadata),
      created_at: new Date().toISOString()
    };

    await db.run(`
      INSERT INTO alert_audit_log 
      (user_id, operation, alert_id, schedule_id, source_ticket_id, delivery_status, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, Object.values(logEntry));

    logger.info('Alert operation logged:', logEntry);
  } catch (error) {
    logger.error('Failed to log alert operation:', error);
  }
}

// ========================================================================
// ALERT MANAGEMENT ENDPOINTS
// ========================================================================

/**
 * @swagger
 * /api/v2/alerts/create:
 *   post:
 *     tags: [Alerts]
 *     summary: Create new alert via workflow or manual trigger
 *     description: Proxy for GoAlert alert creation with Nova RBAC and audit logging
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - summary
 *               - source
 *             properties:
 *               summary:
 *                 type: string
 *                 description: Alert summary/title
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 description: Detailed alert description
 *                 maxLength: 2000
 *               source:
 *                 type: string
 *                 description: Alert source (workflow, manual, ticket)
 *               serviceId:
 *                 type: string
 *                 description: GoAlert service ID to alert
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: medium
 *               ticketId:
 *                 type: string
 *                 description: Associated Nova ticket ID
 *               metadata:
 *                 type: object
 *                 description: Additional alert metadata
 */
router.post('/create',
  authenticateJWT,
  checkPermissions(['alerts:create']),
  createRateLimit(60 * 1000, 10), // 10 alerts per minute
  [
    body('summary').isString().isLength({ min: 1, max: 200 }).withMessage('Summary required (1-200 chars)'),
    body('description').optional().isString().isLength({ max: 2000 }),
    body('source').isString().isIn(['workflow', 'manual', 'ticket', 'cosmo']),
    body('serviceId').isString().withMessage('Service ID required'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('ticketId').optional().isString(),
    body('metadata').optional().isObject()
  ],
  audit('alert.create'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { summary, description, source, serviceId, priority = 'medium', ticketId, metadata = {} } = req.body;

      // Create alert in GoAlert
      const alertPayload = {
        summary,
        details: description || '',
        source: {
          type: 'generic',
          value: GOALERT_CONFIG.source
        },
        dedup: ticketId ? `nova-${ticketId}` : `nova-${Date.now()}`,
        action: 'trigger'
      };

      const goAlertResponse = await makeGoAlertRequest(`/api/v2/generic/incoming?token=${serviceId}`, {
        method: 'POST',
        body: JSON.stringify(alertPayload)
      });

      // Log the alert creation
      await logAlertOperation(req.user.id, 'create', {
        id: goAlertResponse.id || goAlertResponse.alertId,
        sourceTicketId: ticketId,
        scheduleId: serviceId
      }, {
        source,
        priority,
        summary,
        userRole: req.user.role,
        ...metadata
      });

      res.json({
        success: true,
        alert: {
          id: goAlertResponse.id || goAlertResponse.alertId,
          summary,
          source,
          priority,
          serviceId,
          ticketId,
          status: 'triggered',
          createdAt: new Date().toISOString(),
          createdBy: req.user.id
        },
        goAlertResponse,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Alert creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Alert creation failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/alerts/escalate/{ticketId}:
 *   post:
 *     tags: [Alerts]
 *     summary: Escalate an active incident to on-call team
 *     description: Create escalation alert for existing ticket
 */
router.post('/escalate/:ticketId',
  authenticateJWT,
  checkPermissions(['alerts:escalate']),
  createRateLimit(60 * 1000, 5), // 5 escalations per minute
  [
    param('ticketId').isString().withMessage('Ticket ID required'),
    body('reason').isString().withMessage('Escalation reason required'),
    body('priority').optional().isIn(['medium', 'high', 'critical']),
    body('serviceId').isString().withMessage('Service ID required')
  ],
  audit('alert.escalate'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { ticketId } = req.params;
      const { reason, priority = 'high', serviceId } = req.body;

      // Get ticket details for context
      const ticketQuery = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
      if (!ticketQuery) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }

      // Create escalation alert
      const escalationPayload = {
        summary: `🚨 ESCALATION: ${ticketQuery.title}`,
        details: `Ticket #${ticketId} has been escalated.\n\nReason: ${reason}\n\nOriginal Description: ${ticketQuery.description}\n\nCustomer: ${ticketQuery.requester_name || 'Unknown'}\nPriority: ${priority}`,
        source: {
          type: 'generic',
          value: `${GOALERT_CONFIG.source}-escalation`
        },
        dedup: `nova-escalation-${ticketId}`,
        action: 'trigger'
      };

      const goAlertResponse = await makeGoAlertRequest(`/api/v2/generic/incoming?token=${serviceId}`, {
        method: 'POST',
        body: JSON.stringify(escalationPayload)
      });

      // Update ticket with escalation info
      await db.run(`
        UPDATE tickets 
        SET escalated = 1, escalated_at = datetime('now'), escalation_reason = ?
        WHERE id = ?
      `, [reason, ticketId]);

      // Log escalation
      await logAlertOperation(req.user.id, 'escalate', {
        id: goAlertResponse.id || goAlertResponse.alertId,
        sourceTicketId: ticketId,
        scheduleId: serviceId
      }, {
        reason,
        priority,
        originalPriority: ticketQuery.priority,
        userRole: req.user.role
      });

      res.json({
        success: true,
        escalation: {
          alertId: goAlertResponse.id || goAlertResponse.alertId,
          ticketId,
          reason,
          priority,
          serviceId,
          escalatedAt: new Date().toISOString(),
          escalatedBy: req.user.id
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Alert escalation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Alert escalation failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/alerts/status/{alertId}:
 *   get:
 *     tags: [Alerts]
 *     summary: Get current alert status and details
 */
router.get('/status/:alertId',
  authenticateJWT,
  checkPermissions(['alerts:read']),
  [
    param('alertId').isString().withMessage('Alert ID required')
  ],
  async (req, res) => {
    try {
      const { alertId } = req.params;

      // Get alert from GoAlert
      const goAlertData = await makeGoAlertRequest(`/api/v2/alerts/${alertId}`);

      // Get Nova audit data
      const auditData = await db.get(`
        SELECT * FROM alert_audit_log 
        WHERE alert_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [alertId]);

      res.json({
        success: true,
        alert: {
          ...goAlertData,
          novaMetadata: auditData ? JSON.parse(auditData.metadata || '{}') : {},
          sourceTicketId: auditData?.source_ticket_id,
          createdBy: auditData?.user_id
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Alert status fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Alert status fetch failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// SCHEDULE MANAGEMENT ENDPOINTS
// ========================================================================

/**
 * @swagger
 * /api/v2/alerts/schedules:
 *   get:
 *     tags: [Alerts - Schedules]
 *     summary: List viewable on-call schedules
 *     description: Get schedules based on user role and permissions
 */
router.get('/schedules',
  authenticateJWT,
  checkPermissions(['alerts:read']),
  [
    query('team').optional().isString(),
    query('active').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const { team, active } = req.query;

      // Get schedules from GoAlert
      let endpoint = '/api/v2/schedules';
      const params = new URLSearchParams();
      if (team) params.append('search', team);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const schedulesData = await makeGoAlertRequest(endpoint);

      // Filter based on user permissions and role
      let filteredSchedules = schedulesData.schedules || schedulesData;

      // Apply role-based filtering
      if (req.user.role === 'technician') {
        // Technicians can only see schedules they're assigned to
        filteredSchedules = filteredSchedules.filter(schedule => 
          schedule.users?.some(user => user.id === req.user.id) ||
          schedule.participants?.some(participant => participant.user_id === req.user.id)
        );
      }

      if (active !== undefined) {
        filteredSchedules = filteredSchedules.filter(schedule => 
          active ? schedule.enabled : !schedule.enabled
        );
      }

      res.json({
        success: true,
        schedules: filteredSchedules.map(schedule => ({
          id: schedule.id,
          name: schedule.name,
          description: schedule.description,
          timeZone: schedule.time_zone,
          enabled: schedule.enabled,
          currentOnCall: schedule.current_on_call || [],
          nextOnCall: schedule.next_on_call || [],
          userCanEdit: req.user.role === 'pulse_lead' || req.user.role === 'core_admin'
        })),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Schedules fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Schedules fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/alerts/schedules/{scheduleId}:
 *   get:
 *     tags: [Alerts - Schedules]
 *     summary: Get detailed schedule information
 */
router.get('/schedules/:scheduleId',
  authenticateJWT,
  checkPermissions(['alerts:read']),
  [
    param('scheduleId').isString().withMessage('Schedule ID required')
  ],
  async (req, res) => {
    try {
      const { scheduleId } = req.params;

      const [scheduleData, rulesData, overridesData] = await Promise.all([
        makeGoAlertRequest(`/api/v2/schedules/${scheduleId}`),
        makeGoAlertRequest(`/api/v2/schedules/${scheduleId}/rules`),
        makeGoAlertRequest(`/api/v2/schedules/${scheduleId}/overrides`)
      ]);

      res.json({
        success: true,
        schedule: {
          ...scheduleData,
          rules: rulesData.rules || rulesData,
          overrides: overridesData.overrides || overridesData,
          userCanEdit: req.user.role === 'pulse_lead' || req.user.role === 'core_admin'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Schedule details fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Schedule details fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/alerts/rotate/{scheduleId}:
 *   post:
 *     tags: [Alerts - Schedules]
 *     summary: Trigger manual rotation for schedule
 */
router.post('/rotate/:scheduleId',
  authenticateJWT,
  checkPermissions(['alerts:manage']),
  [
    param('scheduleId').isString().withMessage('Schedule ID required'),
    body('reason').optional().isString()
  ],
  audit('alert.rotate'),
  async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const { reason } = req.body;

      // Create override in GoAlert to force rotation
      const overridePayload = {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        user_id: req.user.goalert_user_id, // Assumes user has GoAlert ID mapped
        reason: reason || 'Manual rotation triggered from Nova'
      };

      const rotationResponse = await makeGoAlertRequest(`/api/v2/schedules/${scheduleId}/overrides`, {
        method: 'POST',
        body: JSON.stringify(overridePayload)
      });

      // Log the rotation
      await logAlertOperation(req.user.id, 'rotate', {
        scheduleId
      }, {
        reason,
        userRole: req.user.role
      });

      res.json({
        success: true,
        rotation: {
          scheduleId,
          overrideId: rotationResponse.id,
          reason,
          rotatedAt: new Date().toISOString(),
          rotatedBy: req.user.id
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Schedule rotation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Schedule rotation failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// SERVICE & ESCALATION MANAGEMENT
// ========================================================================

/**
 * @swagger
 * /api/v2/alerts/services:
 *   get:
 *     tags: [Alerts - Services]
 *     summary: List available alert services
 */
router.get('/services',
  authenticateJWT,
  checkPermissions(['alerts:read']),
  async (req, res) => {
    try {
      const servicesData = await makeGoAlertRequest('/api/v2/services');

      res.json({
        success: true,
        services: (servicesData.services || servicesData).map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          escalationPolicyId: service.escalation_policy_id,
          escalationPolicy: service.escalation_policy,
          integrationCount: service.integration_keys?.length || 0,
          userCanEdit: req.user.role === 'pulse_lead' || req.user.role === 'core_admin'
        })),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Services fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Services fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/alerts/escalation-policies:
 *   get:
 *     tags: [Alerts - Escalation]
 *     summary: List escalation policies
 */
router.get('/escalation-policies',
  authenticateJWT,
  checkPermissions(['alerts:read']),
  async (req, res) => {
    try {
      const policiesData = await makeGoAlertRequest('/api/v2/escalation-policies');

      res.json({
        success: true,
        escalationPolicies: (policiesData.escalation_policies || policiesData).map(policy => ({
          id: policy.id,
          name: policy.name,
          description: policy.description,
          stepCount: policy.steps?.length || 0,
          steps: policy.steps?.map(step => ({
            id: step.id,
            stepNumber: step.step_number,
            delayMinutes: step.delay_minutes,
            targets: step.targets || []
          })) || [],
          userCanEdit: req.user.role === 'pulse_lead' || req.user.role === 'core_admin'
        })),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Escalation policies fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Escalation policies fetch failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// ALERT HISTORY & ANALYTICS
// ========================================================================

/**
 * @swagger
 * /api/v2/alerts/history:
 *   get:
 *     tags: [Alerts - Analytics]
 *     summary: Get alert history and analytics
 */
router.get('/history',
  authenticateJWT,
  checkPermissions(['alerts:read']),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('serviceId').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
    try {
      const { startDate, endDate, serviceId, limit = 50 } = req.query;

      // Build query params for GoAlert
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      if (serviceId) params.append('service_id', serviceId);
      params.append('limit', limit.toString());

      const alertsData = await makeGoAlertRequest(`/api/v2/alerts?${params.toString()}`);

      // Get Nova audit data for these alerts
      const alertIds = (alertsData.alerts || alertsData).map(alert => alert.id);
      if (alertIds.length > 0) {
        const auditData = await db.all(`
          SELECT alert_id, user_id, operation, source_ticket_id, created_at, metadata
          FROM alert_audit_log 
          WHERE alert_id IN (${alertIds.map(() => '?').join(',')})
          ORDER BY created_at DESC
        `, alertIds);

        // Merge Nova metadata with GoAlert data
        const enrichedAlerts = (alertsData.alerts || alertsData).map(alert => {
          const novaData = auditData.find(audit => audit.alert_id === alert.id);
          return {
            ...alert,
            novaMetadata: novaData ? {
              sourceTicketId: novaData.source_ticket_id,
              createdBy: novaData.user_id,
              operation: novaData.operation,
              metadata: JSON.parse(novaData.metadata || '{}')
            } : null
          };
        });

        res.json({
          success: true,
          alerts: enrichedAlerts,
          total: alertsData.total || enrichedAlerts.length,
          timestamp: new Date().toISOString()
        });
      } else {
        res.json({
          success: true,
          alerts: [],
          total: 0,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      logger.error('Alert history fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Alert history fetch failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// HEALTH CHECK & CONFIGURATION
// ========================================================================

/**
 * @swagger
 * /api/v2/alerts/health:
 *   get:
 *     tags: [Alerts - System]
 *     summary: Check GoAlert integration health
 */
router.get('/health',
  authenticateJWT,
  checkPermissions(['alerts:read']),
  async (req, res) => {
    try {
      const healthData = await makeGoAlertRequest('/api/v2/system/limits');
      
      res.json({
        success: true,
        status: 'healthy',
        goalert: {
          connected: true,
          version: healthData.version || 'unknown',
          limits: healthData
        },
        proxy: {
          enabled: GOALERT_CONFIG.enabled,
          source: GOALERT_CONFIG.source
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('GoAlert health check failed:', error);
      res.json({
        success: false,
        status: 'unhealthy',
        goalert: {
          connected: false,
          error: error.message
        },
        proxy: {
          enabled: GOALERT_CONFIG.enabled,
          source: GOALERT_CONFIG.source
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;
