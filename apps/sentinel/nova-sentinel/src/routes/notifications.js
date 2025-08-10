// Nova Sentinel - Notification Routes
// Complete notification provider management

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for notification operations
const notificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many notification requests, please try again later.'
});

router.use(notificationRateLimit);

// ========================================================================
// NOTIFICATION PROVIDER MANAGEMENT
// ========================================================================

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notification providers
 */
router.get('/', async (req, res) => {
  try {
    const { type, active } = req.query;
    const tenantId = req.user.tenantId;

    const providers = await req.services.notifications.getNotificationProviders(tenantId);
    
    // Apply filters
    let filteredProviders = providers;
    
    if (type) {
      filteredProviders = filteredProviders.filter(p => p.type === type);
    }
    
    if (active !== undefined) {
      filteredProviders = filteredProviders.filter(p => p.active === (active === 'true'));
    }

    res.json({
      success: true,
      providers: filteredProviders,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Notification providers fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notification providers',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Create notification provider
 */
router.post('/',
  [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Provider name required'),
    body('type').isIn(['email', 'slack', 'discord', 'webhook', 'telegram', 'teams', 'sms']).withMessage('Valid provider type required'),
    body('config').isObject().withMessage('Provider configuration required'),
    body('isDefault').optional().isBoolean(),
    body('active').optional().isBoolean()
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

      const provider = await req.services.notifications.createNotificationProvider({
        ...req.body,
        tenantId: req.user.tenantId,
        createdBy: req.user.id,
        uptimeKumaId: crypto.randomUUID()
      });

      res.status(201).json({
        success: true,
        provider,
        message: 'Notification provider created successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Notification provider creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create notification provider',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/notifications/{id}/test:
 *   post:
 *     tags: [Notifications]
 *     summary: Test notification provider
 */
router.post('/:id/test',
  [param('id').isString().withMessage('Provider ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get provider from database
      const provider = await req.services.database.db.prepare(`
        SELECT * FROM notifications WHERE id = ? AND tenant_id = ?
      `).get(id, req.user.tenantId);

      if (!provider) {
        return res.status(404).json({
          success: false,
          error: 'Notification provider not found'
        });
      }

      const providerData = {
        ...provider,
        config: JSON.parse(provider.config)
      };

      const result = await req.services.notifications.testNotificationProvider(providerData);

      res.json({
        success: result.success,
        message: result.success ? 'Test notification sent successfully' : 'Test notification failed',
        details: result.error || result.result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Notification test error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test notification provider',
        details: error.message
      });
    }
  }
);

export default router;
