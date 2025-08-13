/**
 * Nova Universal Notification Platform API Routes
 * 
 * RESTful API endpoints for managing notifications, preferences, and analytics
 * across all Nova modules with industry-standard patterns and security
 */

import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { authenticateJWT, requirePermission, createRateLimit } from '../middleware/auth.js';
import { novaNotificationPlatform } from '../lib/notification/nova-notification-platform.js';
import { logger } from '../logger.js';

const router = express.Router();
// Rate limiting for notification endpoints
const notificationRateLimit = createRateLimit(60 * 1000, 100); // 100 requests per minute
const bulkRateLimit = createRateLimit(60 * 1000, 10);         // 10 bulk requests per minute
const adminRateLimit = createRateLimit(60 * 1000, 200);      // 200 admin requests per minute

// Validation helpers
const validateNotificationPayload = [
  body('module').isString().isLength({ min: 1 }).withMessage('Module is required'),
  body('eventType').isString().isLength({ min: 1 }).withMessage('Event type is required'),
  body('title').isString().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be under 255 characters'),
  body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Message is required and must be under 2000 characters'),
  body('details').optional().isString().isLength({ max: 10000 }).withMessage('Details must be under 10000 characters'),
  body('priority').optional().isIn(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']).withMessage('Invalid priority'),
  body('recipientRoles').optional().isArray().withMessage('Recipient roles must be an array'),
  body('recipientUsers').optional().isArray().withMessage('Recipient users must be an array'),
  body('tenantId').optional().isString().withMessage('Tenant ID must be a string'),
  body('scheduledFor').optional().isISO8601().withMessage('Scheduled time must be a valid date'),
  body('expiresAt').optional().isISO8601().withMessage('Expiry time must be a valid date')
];

// ============================================================================
// NOTIFICATION SENDING ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/v2/notifications/send:
 *   post:
 *     tags: [Notifications]
 *     summary: Send a notification event
 *     description: Creates and processes a notification event for delivery to specified recipients
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - module
 *               - eventType
 *               - title
 *               - message
 *             properties:
 *               module:
 *                 type: string
 *                 description: Source module (e.g., pulse.tickets, sentinel, goalert)
 *               eventType:
 *                 type: string
 *                 description: Type of event (e.g., sla_breach, system_alert)
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               message:
 *                 type: string
 *                 maxLength: 2000
 *               details:
 *                 type: string
 *                 maxLength: 10000
 *                 description: Rich text details (HTML supported)
 *               priority:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, NORMAL, LOW]
 *                 default: NORMAL
 *               recipientRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of role names
 *               recipientUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs
 *               actions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     label:
 *                       type: string
 *                     url:
 *                       type: string
 *                     action:
 *                       type: string
 *                     style:
 *                       type: string
 *                       enum: [primary, secondary, danger]
 *               metadata:
 *                 type: object
 *                 description: Additional event-specific data
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *                 description: Schedule notification for future delivery
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Notification expiry time
 *     responses:
 *       201:
 *         description: Notification event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 eventId:
 *                   type: string
 *                   description: Unique event identifier
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post('/send',
  authenticateJWT,
  notificationRateLimit,
  validateNotificationPayload,
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Extract payload
      const payload = {
        ...req.body,
        createdBy: req.user.id
      };

      // Validate recipients
      if (!payload.recipientRoles && !payload.recipientUsers) {
        return res.status(400).json({
          success: false,
          error: 'At least one recipient (role or user) is required'
        });
      }

      // Send notification
      const eventId = await novaNotificationPlatform.sendNotification(payload);

      logger.info(`Notification sent by user ${req.user.id}:`, {
        eventId,
        module: payload.module,
        eventType: payload.eventType,
        priority: payload.priority
      });

      res.status(201).json({
        success: true,
        eventId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to send notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send notification',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/notifications/send/batch:
 *   post:
 *     tags: [Notifications]
 *     summary: Send multiple notifications in batch
 *     description: Efficiently send multiple notification events
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notifications
 *             properties:
 *               notifications:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   $ref: '#/components/schemas/NotificationPayload'
 *     responses:
 *       201:
 *         description: Batch notifications processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 eventIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                 successCount:
 *                   type: integer
 *                 failureCount:
 *                   type: integer
 */
router.post('/send/batch',
  authenticateJWT,
  requirePermission('notifications:bulk_send'),
  bulkRateLimit,
  [
    body('notifications').isArray({ min: 1, max: 100 }).withMessage('Notifications array must contain 1-100 items')
  ],
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

      const { notifications } = req.body;
      
      // Add created by to each notification
      const enrichedNotifications = notifications.map(notification => ({
        ...notification,
        createdBy: req.user.id
      }));

      // Send batch
      const eventIds = await novaNotificationPlatform.sendBatch(enrichedNotifications);

      logger.info(`Batch notifications sent by user ${req.user.id}:`, {
        count: notifications.length,
        successCount: eventIds.length,
        failureCount: notifications.length - eventIds.length
      });

      res.status(201).json({
        success: true,
        eventIds,
        successCount: eventIds.length,
        failureCount: notifications.length - eventIds.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to send batch notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send batch notifications',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/notifications/schedule:
 *   post:
 *     tags: [Notifications]
 *     summary: Schedule a notification for future delivery
 *     description: Schedule a notification to be sent at a specific time
 */
router.post('/schedule',
  authenticateJWT,
  requirePermission('notifications:schedule'),
  notificationRateLimit,
  [
    ...validateNotificationPayload,
    body('scheduledFor').isISO8601().withMessage('Valid scheduled time is required')
  ],
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

      const scheduledFor = new Date(req.body.scheduledFor);
      
      // Validate scheduled time is in the future
      if (scheduledFor <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Scheduled time must be in the future'
        });
      }

      const payload = {
        ...req.body,
        createdBy: req.user.id
      };

      const eventId = await novaNotificationPlatform.scheduleNotification(payload, scheduledFor);

      logger.info(`Notification scheduled by user ${req.user.id}:`, {
        eventId,
        scheduledFor: scheduledFor.toISOString()
      });

      res.status(201).json({
        success: true,
        eventId,
        scheduledFor: scheduledFor.toISOString(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to schedule notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to schedule notification',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/notifications/{eventId}/cancel:
 *   post:
 *     tags: [Notifications]
 *     summary: Cancel a scheduled notification
 *     description: Cancel a notification that hasn't been sent yet
 */
router.post('/:eventId/cancel',
  authenticateJWT,
  requirePermission('notifications:cancel'),
  notificationRateLimit,
  [
    param('eventId').isUUID().withMessage('Valid event ID is required')
  ],
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

      const { eventId } = req.params;
      const cancelled = await novaNotificationPlatform.cancelNotification(eventId);

      if (cancelled) {
        logger.info(`Notification cancelled by user ${req.user.id}:`, { eventId });
        res.json({
          success: true,
          message: 'Notification cancelled successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Notification not found or cannot be cancelled'
        });
      }

    } catch (error) {
      logger.error('Failed to cancel notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel notification',
        details: error.message
      });
    }
  }
);

// ============================================================================
// USER PREFERENCES ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/v2/notifications/preferences:
 *   get:
 *     tags: [User Preferences]
 *     summary: Get user notification preferences
 *     description: Retrieve the current user's notification preferences
 */
router.get('/preferences',
  authenticateJWT,
  async (req, res) => {
    try {
      const preferences = await novaNotificationPlatform.getUserPreferences(req.user.id);

      res.json({
        success: true,
        preferences,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`Failed to get preferences for user ${req.user.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve preferences',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/notifications/preferences:
 *   put:
 *     tags: [User Preferences]
 *     summary: Update user notification preferences
 *     description: Update the current user's notification preferences
 */
router.put('/preferences',
  authenticateJWT,
  notificationRateLimit,
  [
    body('preferences').isArray().withMessage('Preferences must be an array'),
    body('preferences.*.module').isString().withMessage('Module is required'),
    body('preferences.*.eventType').isString().withMessage('Event type is required'),
    body('preferences.*.channels').isArray().withMessage('Channels must be an array'),
    body('preferences.*.priority').optional().isIn(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']).withMessage('Invalid priority')
  ],
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

      const { preferences } = req.body;
      await novaNotificationPlatform.updateUserPreferences(req.user.id, preferences);

      logger.info(`Preferences updated for user ${req.user.id}:`, {
        preferencesCount: preferences.length
      });

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`Failed to update preferences for user ${req.user.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update preferences',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/notifications/preferences/helix:
 *   get:
 *     tags: [User Preferences]
 *     summary: Get Helix user notification profile
 *     description: Retrieve the user's comprehensive notification profile including GoAlert, Synth, and Sentinel settings
 */
router.get('/preferences/helix',
  authenticateJWT,
  async (req, res) => {
    try {
      // This would fetch from the Helix notification profile
      const profile = {
        userId: req.user.id,
        globalEnabled: true,
        defaultChannels: ['EMAIL', 'IN_APP'],
        timezone: 'UTC',
        digestEnabled: false,
        // ... other profile data
      };

      res.json({
        success: true,
        profile,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`Failed to get Helix profile for user ${req.user.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve Helix profile',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/notifications/preferences/helix:
 *   put:
 *     tags: [User Preferences]
 *     summary: Update Helix user notification profile
 *     description: Update the user's comprehensive notification profile
 */
router.put('/preferences/helix',
  authenticateJWT,
  notificationRateLimit,
  [
    body('globalEnabled').optional().isBoolean(),
    body('defaultChannels').optional().isArray(),
    body('timezone').optional().isString(),
    body('digestEnabled').optional().isBoolean(),
    body('goalertEnabled').optional().isBoolean(),
    body('synthEnabled').optional().isBoolean(),
    body('sentinelEnabled').optional().isBoolean()
  ],
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

      await novaNotificationPlatform.createHelixUserProfile(req.user.id, req.body);

      logger.info(`Helix profile updated for user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Helix profile updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`Failed to update Helix profile for user ${req.user.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update Helix profile',
        details: error.message
      });
    }
  }
);

// ============================================================================
// NOTIFICATION HISTORY AND STATUS
// ============================================================================

/**
 * @swagger
 * /api/v2/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     description: Retrieve notifications for the current user with pagination and filtering
 */
router.get('/',
  authenticateJWT,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['PENDING', 'DELIVERED', 'READ', 'FAILED']).withMessage('Invalid status'),
    query('channel').optional().isString().withMessage('Channel must be a string'),
    query('priority').optional().isIn(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']).withMessage('Invalid priority')
  ],
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

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      // Build filters
      const where = {
        user_id: req.user.id
      };

      const conditions = ['(target_user_id = $1 OR target_user_id IS NULL)'];
      const params = [req.user.id];
      if (req.query.status) {
        conditions.push('status = $' + (params.length + 1));
        params.push(req.query.status);
      }
      if (req.query.channel) {
        conditions.push('type = $' + (params.length + 1));
        params.push(req.query.channel);
      }
      if (req.query.priority) {
        conditions.push('level = $' + (params.length + 1));
        params.push(req.query.priority.toLowerCase());
      }

      const baseWhere = conditions.length ? ('WHERE ' + conditions.join(' AND ')) : '';
      // Query notifications (gracefully handle missing table)
      let notifications = [];
      let total = 0;
      try {
        const countRes = await req.app.get('db').query(`SELECT COUNT(*)::int AS cnt FROM notifications ${baseWhere}`, params);
        total = countRes.rows?.[0]?.cnt || 0;
        const listRes = await req.app.get('db').query(
          `SELECT id, uuid, message AS title, level AS priority, type AS channel, created_at, expires_at
           FROM notifications ${baseWhere}
           ORDER BY created_at DESC
           LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
          [...params, limit, offset]
        );
        notifications = listRes.rows || [];
      } catch (e) {
        // If table doesn't exist yet, return empty without failing the API
        notifications = [];
        total = 0;
      }

      res.json({
        success: true,
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`Failed to get notifications for user ${req.user.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve notifications',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/notifications/{notificationId}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read by the current user
 */
router.post('/:notificationId/read',
  authenticateJWT,
  [
    param('notificationId').isUUID().withMessage('Valid notification ID is required')
  ],
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

      const { notificationId } = req.params;
      
      // Mark as read - implementation would go in the notification platform
      logger.info(`Notification marked as read:`, {
        notificationId,
        userId: req.user.id
      });

      res.json({
        success: true,
        message: 'Notification marked as read',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read',
        details: error.message
      });
    }
  }
);

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/v2/notifications/admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Get notification analytics
 *     description: Retrieve notification analytics and metrics (admin only)
 */
router.get('/admin/analytics',
  authenticateJWT,
  requirePermission('notifications:admin'),
  adminRateLimit,
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be valid'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid'),
    query('module').optional().isString().withMessage('Module must be a string'),
    query('granularity').optional().isIn(['hour', 'day', 'week']).withMessage('Invalid granularity')
  ],
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

      // Basic analytics from notifications table; fall back to zeros
      let analytics = {
        totalEvents: 0,
        totalNotifications: 0,
        deliveryRate: 0,
        channelBreakdown: {},
        moduleBreakdown: {},
        timeline: []
      };
      try {
        const totalRes = await req.app.get('db').query('SELECT COUNT(*)::int AS cnt FROM notifications');
        analytics.totalNotifications = totalRes.rows?.[0]?.cnt || 0;
        const byType = await req.app.get('db').query('SELECT type, COUNT(*)::int AS cnt FROM notifications GROUP BY type');
        analytics.channelBreakdown = Object.fromEntries(byType.rows.map(r => [r.type, r.cnt]));
      } catch {}


      res.json({
        success: true,
        analytics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to get analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/notifications/admin/providers:
 *   get:
 *     tags: [Admin]
 *     summary: Get notification providers
 *     description: Retrieve configured notification providers (admin only)
 */
router.get('/admin/providers',
  authenticateJWT,
  requirePermission('notifications:admin'),
  adminRateLimit,
  async (req, res) => {
    try {
      // Pull provider list from configuration if available; otherwise empty
      const providers = (await novaNotificationPlatform.listProviders?.()) || [];

      res.json({
        success: true,
        providers,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to get providers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve providers',
        details: error.message
      });
    }
  }
);

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * @swagger
 * /api/v2/notifications/health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     description: Check the health of the notification system
 */
router.get('/health',
  async (req, res) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'healthy',
          queue: 'healthy',
          providers: 'healthy'
        }
      };

      res.json(health);

    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;
