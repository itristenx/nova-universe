// nova-api/routes/goalert-proxy.js
// Complete GoAlert API Proxy - 1:1 Feature Parity Implementation
// All GoAlert UI features accessible through Nova interfaces with Helix authentication

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { checkPermissions } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import fetch from 'node-fetch';
import { SupportGroupService } from '../services/cmdb/SupportGroupService.js';

const router = express.Router();
const supportGroupService = new SupportGroupService();

// ========================================================================
// GOALERT CONFIGURATION
// ========================================================================

const GOALERT_CONFIG = {
  baseUrl: process.env.GOALERT_API_BASE || 'http://localhost:8081',
  apiKey: process.env.GOALERT_API_KEY,
  enabled: process.env.GOALERT_PROXY_ENABLED === 'true',
  webhookSecret: process.env.GOALERT_WEBHOOK_SECRET
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

async function setConfigKey(key, value) {
  try {
    await db.query(
      `INSERT INTO config (key, value, value_type, category, created_at, updated_at)
       VALUES ($1, $2, 'string', 'goalert', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      [key, typeof value === 'string' ? value : JSON.stringify(value)]
    );
  } catch (e) {
    logger.warn('Failed to persist config key', { key, error: e.message });
  }
}

async function resolveGoAlertUserIdByEmail(email) {
  try {
    const result = await makeGoAlertRequest(`/api/v2/users?limit=50&search=${encodeURIComponent(email)}`);
    const users = result?.users || result || [];
    const match = users.find(u => u.email?.toLowerCase() === String(email).toLowerCase()) || users[0];
    return match?.id || null;
  } catch (e) {
    logger.warn('Failed to resolve GoAlert user by email', { email, error: e.message });
    return null;
  }
}

async function buildScheduleRulesFromSupportGroup(supportGroupId) {
  try {
    const group = await supportGroupService.getSupportGroup(supportGroupId);
    const members = group?.members || [];
    const targets = [];
    for (const m of members) {
      const email = m.user?.email;
      if (!email) continue;
      const goId = await resolveGoAlertUserIdByEmail(email);
      if (goId) {
        targets.push({ type: 'user', id: goId });
      }
    }
    if (targets.length === 0) return [];
    // Single step with collected targets, 0 delay
    return [{ delayMinutes: 0, targets }];
  } catch (e) {
    logger.warn('Failed to build schedule rules from support group', { supportGroupId, error: e.message });
    return [];
  }
}

/**
 * Store user preferences in Helix
 */
async function storeHelixUserPreference(userId, key, value) {
  try {
    await db.run(`
      INSERT INTO helix_user_preferences (user_id, preference_key, preference_value, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(user_id, preference_key) 
      DO UPDATE SET preference_value = ?, updated_at = datetime('now')
    `, [userId, key, JSON.stringify(value), JSON.stringify(value)]);
  } catch (error) {
    logger.error('Failed to store Helix user preference:', error);
  }
}

/**
 * Get user preferences from Helix
 */
async function getHelixUserPreference(userId, key, defaultValue = null) {
  try {
    const result = await db.get(`
      SELECT preference_value FROM helix_user_preferences 
      WHERE user_id = ? AND preference_key = ?
    `, [userId, key]);
    
    return result ? JSON.parse(result.preference_value) : defaultValue;
  } catch (error) {
    logger.error('Failed to get Helix user preference:', error);
    return defaultValue;
  }
}

// ========================================================================
// SERVICE MANAGEMENT (1:1 GoAlert Services Feature)
// ========================================================================

/**
 * @swagger
 * /api/v2/goalert/services:
 *   get:
 *     tags: [GoAlert Services]
 *     summary: List all services
 *     description: Get all services configured in GoAlert
 */
router.get('/services',
  authenticateJWT,
  checkPermissions(['goalert:services:read']),
  async (req, res) => {
    try {
      const { search, favorite, limit = 50, offset = 0 } = req.query;
      
      let endpoint = `/api/v2/services?limit=${limit}&offset=${offset}`;
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;
      if (favorite) endpoint += `&favorite=${favorite}`;

      const services = await makeGoAlertRequest(endpoint);

      // Enrich with Nova metadata and user preferences
      const enrichedServices = await Promise.all(
        services.map(async (service) => {
          const userFavorite = await getHelixUserPreference(
            req.user.id, 
            `goalert.service.${service.id}.favorite`, 
            false
          );
          
          return {
            ...service,
            userFavorite,
            lastAccessed: await getHelixUserPreference(
              req.user.id, 
              `goalert.service.${service.id}.lastAccessed`
            )
          };
        })
      );

      res.json({
        success: true,
        services: enrichedServices,
        total: services.length,
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
 * /api/v2/goalert/services:
 *   post:
 *     tags: [GoAlert Services]
 *     summary: Create new service
 *     description: Create a new service in GoAlert
 */
router.post('/services',
  authenticateJWT,
  checkPermissions(['goalert:services:create']),
  createRateLimit(60 * 1000, 10),
  [
    body('name').isString().isLength({ min: 1, max: 255 }).withMessage('Service name required'),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('escalationPolicyID').isString().withMessage('Escalation policy ID required'),
    body('favorite').optional().isBoolean(),
    body('supportGroupId').optional().isString()
  ],
  audit('goalert.service.create'),
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

      const { name, description, escalationPolicyID, favorite = false, supportGroupId } = req.body;

      const service = await makeGoAlertRequest('/api/v2/services', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          escalationPolicyID
        })
      });

      // Store user preference for favorite
      if (favorite) {
        await storeHelixUserPreference(
          req.user.id, 
          `goalert.service.${service.id}.favorite`, 
          true
        );
      }

      // Store last accessed
      await storeHelixUserPreference(
        req.user.id, 
        `goalert.service.${service.id}.lastAccessed`, 
        new Date().toISOString()
      );

      // Persist mapping to support group if provided
      if (supportGroupId) {
        await setConfigKey(`goalert.service.${service.id}.support_group_id`, supportGroupId);
      }

      res.status(201).json({
        success: true,
        service: {
          ...service,
          userFavorite: favorite,
          supportGroupId: supportGroupId || null
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Service creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Service creation failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/services/{id}:
 *   get:
 *     tags: [GoAlert Services]
 *     summary: Get service details
 */
router.get('/services/:id',
  authenticateJWT,
  checkPermissions(['goalert:services:read']),
  [param('id').isString()],
  async (req, res) => {
    try {
      const { id } = req.params;

      const service = await makeGoAlertRequest(`/api/v2/services/${id}`);

      // Update last accessed
      await storeHelixUserPreference(
        req.user.id, 
        `goalert.service.${id}.lastAccessed`, 
        new Date().toISOString()
      );

      // Get user preferences
      const userFavorite = await getHelixUserPreference(
        req.user.id, 
        `goalert.service.${id}.favorite`, 
        false
      );

      res.json({
        success: true,
        service: {
          ...service,
          userFavorite
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Service fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Service fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/services/{id}:
 *   put:
 *     tags: [GoAlert Services]
 *     summary: Update service
 */
router.put('/services/:id',
  authenticateJWT,
  checkPermissions(['goalert:services:update']),
  [
    param('id').isString(),
    body('name').isString().isLength({ min: 1, max: 255 }),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('escalationPolicyID').isString(),
    body('favorite').optional().isBoolean(),
    body('supportGroupId').optional().isString()
  ],
  audit('goalert.service.update'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { favorite, supportGroupId, ...serviceData } = req.body;

      const service = await makeGoAlertRequest(`/api/v2/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData)
      });

      // Update user preference for favorite
      if (typeof supportGroupId === 'string') {
        await setConfigKey(`goalert.service.${id}.support_group_id`, supportGroupId);
      }
      if (typeof favorite === 'boolean') {
        await storeHelixUserPreference(
          req.user.id, 
          `goalert.service.${id}.favorite`, 
          favorite
        );
      }

      res.json({
        success: true,
        service: {
          ...service,
          userFavorite: favorite !== undefined ? favorite : await getHelixUserPreference(
            req.user.id, 
            `goalert.service.${id}.favorite`, 
            false
          ),
          supportGroupId: supportGroupId || null
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Service update failed:', error);
      res.status(500).json({
        success: false,
        error: 'Service update failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/services/{id}:
 *   delete:
 *     tags: [GoAlert Services]
 *     summary: Delete service
 */
router.delete('/services/:id',
  authenticateJWT,
  checkPermissions(['goalert:services:delete']),
  [param('id').isString()],
  audit('goalert.service.delete'),
  async (req, res) => {
    try {
      const { id } = req.params;

      await makeGoAlertRequest(`/api/v2/services/${id}`, {
        method: 'DELETE'
      });

      // Clean up user preferences
      await db.run(`
        DELETE FROM helix_user_preferences 
        WHERE user_id = ? AND preference_key LIKE 'goalert.service.' || ? || '.%'
      `, [req.user.id, id]);

      res.json({
        success: true,
        message: 'Service deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Service deletion failed:', error);
      res.status(500).json({
        success: false,
        error: 'Service deletion failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// ESCALATION POLICIES (1:1 GoAlert Feature)
// ========================================================================

/**
 * @swagger
 * /api/v2/goalert/escalation-policies:
 *   get:
 *     tags: [GoAlert Escalation Policies]
 *     summary: List escalation policies
 */
router.get('/escalation-policies',
  authenticateJWT,
  checkPermissions(['goalert:escalation-policies:read']),
  async (req, res) => {
    try {
      const { search, favorite, limit = 50, offset = 0 } = req.query;
      
      let endpoint = `/api/v2/escalation-policies?limit=${limit}&offset=${offset}`;
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;

      const policies = await makeGoAlertRequest(endpoint);

      // Enrich with user preferences
      const enrichedPolicies = await Promise.all(
        policies.map(async (policy) => {
          const userFavorite = await getHelixUserPreference(
            req.user.id, 
            `goalert.escalation-policy.${policy.id}.favorite`, 
            false
          );
          
          return {
            ...policy,
            userFavorite
          };
        })
      );

      res.json({
        success: true,
        escalationPolicies: enrichedPolicies,
        total: policies.length,
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

/**
 * @swagger
 * /api/v2/goalert/escalation-policies:
 *   post:
 *     tags: [GoAlert Escalation Policies]
 *     summary: Create escalation policy
 */
router.post('/escalation-policies',
  authenticateJWT,
  checkPermissions(['goalert:escalation-policies:create']),
  createRateLimit(60 * 1000, 10),
  [
    body('name').isString().isLength({ min: 1, max: 255 }),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('repeat').optional().isInt({ min: 0, max: 9 }),
    body('steps').isArray().withMessage('Steps array required'),
    body('steps.*.delayMinutes').isInt({ min: 0 }),
    body('steps.*.targets').isArray()
  ],
  audit('goalert.escalation-policy.create'),
  async (req, res) => {
    try {
      const { name, description, repeat = 0, steps } = req.body;

      const policy = await makeGoAlertRequest('/api/v2/escalation-policies', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          repeat,
          steps
        })
      });

      res.status(201).json({
        success: true,
        escalationPolicy: policy,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Escalation policy creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Escalation policy creation failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// SCHEDULES (1:1 GoAlert Feature)
// ========================================================================

/**
 * @swagger
 * /api/v2/goalert/schedules:
 *   get:
 *     tags: [GoAlert Schedules]
 *     summary: List schedules
 */
router.get('/schedules',
  authenticateJWT,
  checkPermissions(['goalert:schedules:read']),
  async (req, res) => {
    try {
      const { search, favorite, limit = 50, offset = 0 } = req.query;
      
      let endpoint = `/api/v2/schedules?limit=${limit}&offset=${offset}`;
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;

      const schedules = await makeGoAlertRequest(endpoint);

      // Enrich with user preferences and current on-call
      const enrichedSchedules = await Promise.all(
        schedules.map(async (schedule) => {
          const userFavorite = await getHelixUserPreference(
            req.user.id, 
            `goalert.schedule.${schedule.id}.favorite`, 
            false
          );

          // Get current on-call for this schedule
          try {
            const onCall = await makeGoAlertRequest(`/api/v2/schedules/${schedule.id}/on-call`);
            schedule.currentOnCall = onCall;
          } catch (onCallError) {
            logger.debug('Failed to fetch on-call data:', onCallError);
            schedule.currentOnCall = [];
          }
          
          return {
            ...schedule,
            userFavorite
          };
        })
      );

      res.json({
        success: true,
        schedules: enrichedSchedules,
        total: schedules.length,
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
 * /api/v2/goalert/schedules:
 *   post:
 *     tags: [GoAlert Schedules]
 *     summary: Create schedule
 */
router.post('/schedules',
  authenticateJWT,
  checkPermissions(['goalert:schedules:create']),
  createRateLimit(60 * 1000, 10),
  [
    body('name').isString().isLength({ min: 1, max: 255 }),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('timeZone').isString().withMessage('Time zone required'),
    body('favorite').optional().isBoolean(),
    body('supportGroupId').optional().isString(),
    body('rules').optional().isArray()
  ],
  audit('goalert.schedule.create'),
  async (req, res) => {
    try {
      const { name, description, timeZone, favorite = false, supportGroupId, rules } = req.body;

      const schedule = await makeGoAlertRequest('/api/v2/schedules', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          timeZone
        })
      });

      // If rules provided or supportGroupId provided, create schedule rules
      try {
        const finalRules = Array.isArray(rules) && rules.length > 0
          ? rules
          : (supportGroupId ? await buildScheduleRulesFromSupportGroup(supportGroupId) : []);
        if (finalRules.length > 0) {
          for (const step of finalRules) {
            // GoAlert rules endpoint varies; use generic create rule per step/targets
            await makeGoAlertRequest(`/api/v2/schedules/${schedule.id}/rules`, {
              method: 'POST',
              body: JSON.stringify({
                delayMinutes: step.delayMinutes || step.delay || 0,
                targets: step.targets || []
              })
            });
          }
        }
      } catch (e) {
        logger.warn('Failed to configure schedule rules', { scheduleId: schedule.id, error: e.message });
      }

      if (supportGroupId) {
        await setConfigKey(`goalert.schedule.${schedule.id}.support_group_id`, supportGroupId);
      }

      // Store user preference for favorite
      if (favorite) {
        await storeHelixUserPreference(
          req.user.id, 
          `goalert.schedule.${schedule.id}.favorite`, 
          true
        );
      }

      res.status(201).json({
        success: true,
        schedule: {
          ...schedule,
          userFavorite: favorite,
          supportGroupId: supportGroupId || null
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Schedule creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Schedule creation failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/schedules/{id}/on-call:
 *   get:
 *     tags: [GoAlert Schedules]
 *     summary: Get current on-call for schedule
 */
router.get('/schedules/:id/on-call',
  authenticateJWT,
  checkPermissions(['goalert:schedules:read']),
  [param('id').isString()],
  async (req, res) => {
    try {
      const { id } = req.params;

      const onCall = await makeGoAlertRequest(`/api/v2/schedules/${id}/on-call`);

      res.json({
        success: true,
        onCall,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('On-call fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'On-call fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/schedules/{id}/assignments:
 *   get:
 *     tags: [GoAlert Schedules]
 *     summary: Get schedule assignments
 */
router.get('/schedules/:id/assignments',
  authenticateJWT,
  checkPermissions(['goalert:schedules:read']),
  [
    param('id').isString(),
    query('start').optional().isISO8601(),
    query('end').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { start, end } = req.query;

      let endpoint = `/api/v2/schedules/${id}/assignments`;
      const params = new URLSearchParams();
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const assignments = await makeGoAlertRequest(endpoint);

      res.json({
        success: true,
        assignments,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Schedule assignments fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Schedule assignments fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/schedules/{id}/overrides:
 *   post:
 *     tags: [GoAlert Schedules]
 *     summary: Create schedule override
 */
router.post('/schedules/:id/overrides',
  authenticateJWT,
  checkPermissions(['goalert:schedules:update']),
  createRateLimit(60 * 1000, 20),
  [
    param('id').isString(),
    body('userID').isString().withMessage('User ID required'),
    body('start').isISO8601().withMessage('Valid start time required'),
    body('end').isISO8601().withMessage('Valid end time required')
  ],
  audit('goalert.schedule.override.create'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userID, start, end } = req.body;

      const override = await makeGoAlertRequest(`/api/v2/schedules/${id}/overrides`, {
        method: 'POST',
        body: JSON.stringify({
          userID,
          start,
          end
        })
      });

      res.status(201).json({
        success: true,
        override,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Schedule override creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Schedule override creation failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// USERS (1:1 GoAlert Feature)
// ========================================================================

/**
 * @swagger
 * /api/v2/goalert/users:
 *   get:
 *     tags: [GoAlert Users]
 *     summary: List users
 */
router.get('/users',
  authenticateJWT,
  checkPermissions(['goalert:users:read']),
  async (req, res) => {
    try {
      const { search, limit = 50, offset = 0 } = req.query;
      
      let endpoint = `/api/v2/users?limit=${limit}&offset=${offset}`;
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;

      const users = await makeGoAlertRequest(endpoint);

      res.json({
        success: true,
        users,
        total: users.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Users fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Users fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/users/{id}/contact-methods:
 *   get:
 *     tags: [GoAlert Users]
 *     summary: Get user contact methods
 */
router.get('/users/:id/contact-methods',
  authenticateJWT,
  checkPermissions(['goalert:users:read']),
  [param('id').isString()],
  async (req, res) => {
    try {
      const { id } = req.params;

      const contactMethods = await makeGoAlertRequest(`/api/v2/users/${id}/contact-methods`);

      res.json({
        success: true,
        contactMethods,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Contact methods fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Contact methods fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/users/{id}/contact-methods:
 *   post:
 *     tags: [GoAlert Users]
 *     summary: Create contact method
 */
router.post('/users/:id/contact-methods',
  authenticateJWT,
  checkPermissions(['goalert:users:update']),
  createRateLimit(60 * 1000, 10),
  [
    param('id').isString(),
    body('name').isString().isLength({ min: 1, max: 255 }),
    body('type').isIn(['SMS', 'VOICE', 'EMAIL', 'WEBHOOK']),
    body('value').isString().withMessage('Contact value required')
  ],
  audit('goalert.user.contact-method.create'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, type, value } = req.body;

      const contactMethod = await makeGoAlertRequest(`/api/v2/users/${id}/contact-methods`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          type,
          value
        })
      });

      // Store in Helix for user preference tracking
      await storeHelixUserPreference(
        req.user.id, 
        `goalert.contact-methods.${contactMethod.id}`, 
        { name, type, value, createdAt: new Date().toISOString() }
      );

      res.status(201).json({
        success: true,
        contactMethod,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Contact method creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Contact method creation failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/users/{id}/notification-rules:
 *   get:
 *     tags: [GoAlert Users]
 *     summary: Get user notification rules
 */
router.get('/users/:id/notification-rules',
  authenticateJWT,
  checkPermissions(['goalert:users:read']),
  [param('id').isString()],
  async (req, res) => {
    try {
      const { id } = req.params;

      const notificationRules = await makeGoAlertRequest(`/api/v2/users/${id}/notification-rules`);

      res.json({
        success: true,
        notificationRules,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Notification rules fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Notification rules fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/users/{id}/notification-rules:
 *   post:
 *     tags: [GoAlert Users]
 *     summary: Create notification rule
 */
router.post('/users/:id/notification-rules',
  authenticateJWT,
  checkPermissions(['goalert:users:update']),
  createRateLimit(60 * 1000, 10),
  [
    param('id').isString(),
    body('contactMethodID').isString().withMessage('Contact method ID required'),
    body('delayMinutes').isInt({ min: 0 }).withMessage('Delay minutes required')
  ],
  audit('goalert.user.notification-rule.create'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { contactMethodID, delayMinutes } = req.body;

      const notificationRule = await makeGoAlertRequest(`/api/v2/users/${id}/notification-rules`, {
        method: 'POST',
        body: JSON.stringify({
          contactMethodID,
          delayMinutes
        })
      });

      // Store in Helix for user preference tracking
      await storeHelixUserPreference(
        req.user.id, 
        `goalert.notification-rules.${notificationRule.id}`, 
        { contactMethodID, delayMinutes, createdAt: new Date().toISOString() }
      );

      res.status(201).json({
        success: true,
        notificationRule,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Notification rule creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Notification rule creation failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// ALERTS (1:1 GoAlert Feature)
// ========================================================================

/**
 * @swagger
 * /api/v2/goalert/alerts:
 *   get:
 *     tags: [GoAlert Alerts]
 *     summary: List alerts
 */
router.get('/alerts',
  authenticateJWT,
  checkPermissions(['goalert:alerts:read']),
  async (req, res) => {
    try {
      const { 
        serviceID, 
        status = 'active',
        limit = 50, 
        offset = 0,
        start,
        end 
      } = req.query;
      
      let endpoint = `/api/v2/alerts?limit=${limit}&offset=${offset}`;
      if (serviceID) endpoint += `&serviceID=${serviceID}`;
      if (status) endpoint += `&status=${status}`;
      if (start) endpoint += `&start=${encodeURIComponent(start)}`;
      if (end) endpoint += `&end=${encodeURIComponent(end)}`;

      const alerts = await makeGoAlertRequest(endpoint);

      // Store user's alert viewing preferences
      await storeHelixUserPreference(
        req.user.id, 
        'goalert.alerts.lastViewFilter', 
        { serviceID, status, limit, start, end, timestamp: new Date().toISOString() }
      );

      res.json({
        success: true,
        alerts,
        total: alerts.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Alerts fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Alerts fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/alerts:
 *   post:
 *     tags: [GoAlert Alerts]
 *     summary: Create manual alert
 */
router.post('/alerts',
  authenticateJWT,
  checkPermissions(['goalert:alerts:create']),
  createRateLimit(60 * 1000, 20),
  [
    body('serviceID').isString().withMessage('Service ID required'),
    body('summary').isString().isLength({ min: 1, max: 255 }).withMessage('Alert summary required'),
    body('details').optional().isString().isLength({ max: 1000 })
  ],
  audit('goalert.alert.create'),
  async (req, res) => {
    try {
      const { serviceID, summary, details = '' } = req.body;

      const alert = await makeGoAlertRequest('/api/v2/alerts', {
        method: 'POST',
        body: JSON.stringify({
          serviceID,
          summary,
          details
        })
      });

      res.status(201).json({
        success: true,
        alert,
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
 * /api/v2/goalert/alerts/{id}/acknowledge:
 *   post:
 *     tags: [GoAlert Alerts]
 *     summary: Acknowledge alert
 */
router.post('/alerts/:id/acknowledge',
  authenticateJWT,
  checkPermissions(['goalert:alerts:acknowledge']),
  createRateLimit(60 * 1000, 50),
  [param('id').isString()],
  audit('goalert.alert.acknowledge'),
  async (req, res) => {
    try {
      const { id } = req.params;

      await makeGoAlertRequest(`/api/v2/alerts/${id}/acknowledge`, {
        method: 'POST'
      });

      // Store acknowledgment in Helix for tracking
      await storeHelixUserPreference(
        req.user.id, 
        `goalert.alerts.${id}.acknowledged`, 
        { acknowledgedAt: new Date().toISOString(), acknowledgedBy: req.user.id }
      );

      res.json({
        success: true,
        message: 'Alert acknowledged successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Alert acknowledgment failed:', error);
      res.status(500).json({
        success: false,
        error: 'Alert acknowledgment failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/alerts/{id}/close:
 *   post:
 *     tags: [GoAlert Alerts]
 *     summary: Close alert
 */
router.post('/alerts/:id/close',
  authenticateJWT,
  checkPermissions(['goalert:alerts:close']),
  createRateLimit(60 * 1000, 50),
  [param('id').isString()],
  audit('goalert.alert.close'),
  async (req, res) => {
    try {
      const { id } = req.params;

      await makeGoAlertRequest(`/api/v2/alerts/${id}/close`, {
        method: 'POST'
      });

      // Store closure in Helix for tracking
      await storeHelixUserPreference(
        req.user.id, 
        `goalert.alerts.${id}.closed`, 
        { closedAt: new Date().toISOString(), closedBy: req.user.id }
      );

      res.json({
        success: true,
        message: 'Alert closed successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Alert closure failed:', error);
      res.status(500).json({
        success: false,
        error: 'Alert closure failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// HEARTBEAT MONITORS (1:1 GoAlert Feature)
// ========================================================================

/**
 * @swagger
 * /api/v2/goalert/heartbeat-monitors:
 *   get:
 *     tags: [GoAlert Heartbeat Monitors]
 *     summary: List heartbeat monitors
 */
router.get('/heartbeat-monitors',
  authenticateJWT,
  checkPermissions(['goalert:heartbeat-monitors:read']),
  async (req, res) => {
    try {
      const { serviceID, limit = 50, offset = 0 } = req.query;
      
      let endpoint = `/api/v2/heartbeat-monitors?limit=${limit}&offset=${offset}`;
      if (serviceID) endpoint += `&serviceID=${serviceID}`;

      const monitors = await makeGoAlertRequest(endpoint);

      res.json({
        success: true,
        heartbeatMonitors: monitors,
        total: monitors.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Heartbeat monitors fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Heartbeat monitors fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/heartbeat-monitors:
 *   post:
 *     tags: [GoAlert Heartbeat Monitors]
 *     summary: Create heartbeat monitor
 */
router.post('/heartbeat-monitors',
  authenticateJWT,
  checkPermissions(['goalert:heartbeat-monitors:create']),
  createRateLimit(60 * 1000, 10),
  [
    body('serviceID').isString().withMessage('Service ID required'),
    body('name').isString().isLength({ min: 1, max: 255 }).withMessage('Monitor name required'),
    body('timeoutMinutes').isInt({ min: 1, max: 9999 }).withMessage('Valid timeout required')
  ],
  audit('goalert.heartbeat-monitor.create'),
  async (req, res) => {
    try {
      const { serviceID, name, timeoutMinutes } = req.body;

      const monitor = await makeGoAlertRequest('/api/v2/heartbeat-monitors', {
        method: 'POST',
        body: JSON.stringify({
          serviceID,
          name,
          timeoutMinutes
        })
      });

      res.status(201).json({
        success: true,
        heartbeatMonitor: monitor,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Heartbeat monitor creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Heartbeat monitor creation failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// INTEGRATION KEYS (1:1 GoAlert Feature)
// ========================================================================

/**
 * @swagger
 * /api/v2/goalert/services/{serviceID}/integration-keys:
 *   get:
 *     tags: [GoAlert Integration Keys]
 *     summary: List integration keys for service
 */
router.get('/services/:serviceID/integration-keys',
  authenticateJWT,
  checkPermissions(['goalert:integration-keys:read']),
  [param('serviceID').isString()],
  async (req, res) => {
    try {
      const { serviceID } = req.params;

      const integrationKeys = await makeGoAlertRequest(`/api/v2/services/${serviceID}/integration-keys`);

      res.json({
        success: true,
        integrationKeys,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Integration keys fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Integration keys fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/services/{serviceID}/integration-keys:
 *   post:
 *     tags: [GoAlert Integration Keys]
 *     summary: Create integration key
 */
router.post('/services/:serviceID/integration-keys',
  authenticateJWT,
  checkPermissions(['goalert:integration-keys:create']),
  createRateLimit(60 * 1000, 10),
  [
    param('serviceID').isString(),
    body('name').isString().isLength({ min: 1, max: 255 }),
    body('type').isIn(['generic', 'grafana', 'site24x7', 'prometheusAlertmanager'])
  ],
  audit('goalert.integration-key.create'),
  async (req, res) => {
    try {
      const { serviceID } = req.params;
      const { name, type } = req.body;

      const integrationKey = await makeGoAlertRequest(`/api/v2/services/${serviceID}/integration-keys`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          type
        })
      });

      res.status(201).json({
        success: true,
        integrationKey,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Integration key creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Integration key creation failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// USER PREFERENCES & SETTINGS (Helix Integration)
// ========================================================================

/**
 * @swagger
 * /api/v2/goalert/user/preferences:
 *   get:
 *     tags: [GoAlert User Preferences]
 *     summary: Get user's GoAlert preferences from Helix
 */
router.get('/user/preferences',
  authenticateJWT,
  async (req, res) => {
    try {
      const preferences = await db.all(`
        SELECT preference_key, preference_value, updated_at 
        FROM helix_user_preferences 
        WHERE user_id = ? AND preference_key LIKE 'goalert.%'
        ORDER BY updated_at DESC
      `, [req.user.id]);

      const formattedPreferences = {};
      preferences.forEach(pref => {
        const key = pref.preference_key.replace('goalert.', '');
        formattedPreferences[key] = {
          value: JSON.parse(pref.preference_value),
          updatedAt: pref.updated_at
        };
      });

      res.json({
        success: true,
        preferences: formattedPreferences,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('User preferences fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'User preferences fetch failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/goalert/user/preferences:
 *   post:
 *     tags: [GoAlert User Preferences]
 *     summary: Store user's GoAlert preferences in Helix
 */
router.post('/user/preferences',
  authenticateJWT,
  createRateLimit(60 * 1000, 20),
  [
    body('preferences').isObject().withMessage('Preferences object required')
  ],
  async (req, res) => {
    try {
      const { preferences } = req.body;

      // Store each preference
      for (const [key, value] of Object.entries(preferences)) {
        await storeHelixUserPreference(
          req.user.id, 
          `goalert.${key}`, 
          value
        );
      }

      res.json({
        success: true,
        message: 'Preferences saved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('User preferences save failed:', error);
      res.status(500).json({
        success: false,
        error: 'User preferences save failed',
        details: error.message
      });
    }
  }
);

export default router;
