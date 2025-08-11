// nova-api/routes/beacon.js
// Nova Beacon - Kiosk API Routes
import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { validateKioskAuth } from '../middleware/validation.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import HelixKioskIntegration from '../services/helixKioskIntegration.js';
import { authenticateJWT } from '../middleware/auth.js';
import events from '../events.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     KioskConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         location:
 *           type: string
 *         isActive:
 *           type: boolean
 *         configuration:
 *           type: object
 *         lastSeen:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v2/beacon/config:
 *   get:
 *     tags: [Beacon - Kiosk]
 *     summary: Get kiosk configuration
 *     description: Retrieve configuration for a registered kiosk
 *     security:
 *       - KioskAuth: []
 *     responses:
 *       200:
 *         description: Kiosk configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 config:
 *                   $ref: '#/components/schemas/KioskConfig'
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Invalid kiosk authentication
 */
router.get('/config',
  validateKioskAuth,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const kioskId = req.kiosk.id;

      // Get kiosk configuration
      db.get(
        'SELECT * FROM kiosks WHERE id = $1 AND isActive = 1',
        [kioskId],
        (err, kiosk) => {
          if (err) {
            logger.error('Database error getting kiosk config:', err);
            return res.status(500).json({
              success: false,
              error: 'Database error',
              errorCode: 'DB_ERROR'
            });
          }

          if (!kiosk) {
            return res.status(404).json({
              success: false,
              error: 'Kiosk not found or inactive',
              errorCode: 'KIOSK_NOT_FOUND'
            });
          }

          // Get ticket categories
          db.all(
            'SELECT id, name, description FROM ticket_categories WHERE isActive = 1 ORDER BY name',
            [],
            (err, categories) => {
              if (err) {
                logger.warn('Error getting categories:', err);
                categories = []; // Fallback to empty array
              }

              // Update last seen timestamp
              db.run(
                'UPDATE kiosks SET lastSeen = datetime("now") WHERE id = $1',
                [kioskId]
              );

              res.json({
                success: true,
                config: {
                  id: kiosk.id,
                  name: kiosk.name,
                  location: kiosk.location,
                  isActive: Boolean(kiosk.isActive),
                  configuration: JSON.parse(kiosk.configuration || '{}'),
                  lastSeen: kiosk.lastSeen
                },
                categories: categories || []
              });
            }
          );
        }
      );
    } catch (error) {
      logger.error('Error getting kiosk config:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/beacon/ticket:
 *   post:
 *     tags: [Beacon - Kiosk]
 *     summary: Submit ticket from kiosk
 *     description: Create a new support ticket from a kiosk device
 *     security:
 *       - KioskAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - requesterName
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *               requesterName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               requesterEmail:
 *                 type: string
 *                 format: email
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: medium
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     ticketId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Invalid kiosk authentication
 */
router.post('/ticket',
  validateKioskAuth,
  createRateLimit(5 * 60 * 1000, 10), // 10 tickets per 5 minutes
  [
    body('title')
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('description')
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('requesterName')
      .isLength({ min: 2, max: 100 })
      .withMessage('Requester name must be between 2 and 100 characters'),
    body('requesterEmail')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('category')
      .optional()
      .isString(),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Priority must be one of: low, medium, high, critical'),
    body('location')
      .optional()
      .isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const {
        title,
        description,
        requesterName,
        requesterEmail,
        category = 'general',
        priority = 'medium',
        location
      } = req.body;

      const kioskId = req.kiosk.id;

      // Generate ticket ID
      const ticketId = `TKT-${Date.now().toString().slice(-8).padStart(8, '0')}`;

      // Create ticket
      try {
        const result = await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO tickets (
              ticketId, title, description, requesterName, requesterEmail,
              category, priority, location, source, sourceId, status, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'kiosk', ?, 'open', datetime('now'))`,
            [
              ticketId,
              title,
              description,
              requesterName,
              requesterEmail || null,
              category,
              priority,
              location || req.kiosk.location,
              kioskId
            ],
            function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.lastID);
              }
            }
          );
        });

        const ticketDbId = result;

        logger.info('Ticket created from kiosk', {
          ticketId,
          kioskId,
          requesterName,
          title
        });

        // Trigger notifications/integrations for kiosk status change
        try {
          const { notificationService } = await import('../lib/notifications.js');
          await notificationService.sendNotification({
            type: 'monitor_up',
            tenant_id: req.user?.tenant_id || 'default',
            severity: 'low',
            title: `Kiosk ${kioskId} activated`,
            message: `Kiosk ${kioskId} was successfully activated and linked.`,
            data: { kioskId }
          });
        } catch {}

        res.status(201).json({
          success: true,
          ticket: {
            id: ticketDbId,
            ticketId,
            title,
            status: 'open',
            createdAt: new Date().toISOString()
          },
          message: `Ticket ${ticketId} created successfully`
        });
      } catch (err) {
        logger.error('Error creating ticket from kiosk:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to create ticket',
          errorCode: 'TICKET_CREATE_ERROR'
        });
      }
    } catch (error) {
      logger.error('Error creating ticket from kiosk:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/beacon/assets:
 *   get:
 *     tags: [Beacon - Kiosk]
 *     summary: Get assets for kiosk location
 *     description: Retrieve assets associated with the kiosk's location
 *     security:
 *       - KioskAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for asset name or serial number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of assets to return
 *     responses:
 *       200:
 *         description: Assets list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 assets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       serialNumber:
 *                         type: string
 *                       type:
 *                         type: string
 *                       location:
 *                         type: string
 *       401:
 *         description: Invalid kiosk authentication
 */
router.get('/assets',
  validateKioskAuth,
  createRateLimit(15 * 60 * 1000, 50), // 50 requests per 15 minutes
  async (req, res) => {
    try {
      const kioskLocation = req.kiosk.location;
      const { search, limit = 20 } = req.query;

      let query = 'SELECT id, name, serialNumber, type, location FROM assets WHERE location = $1';
      let params = [kioskLocation];

      if (search) {
        query += ' AND (name LIKE $2 OR serialNumber LIKE $2)';
        params.push(`%${search}%`);
      }

      query += ' ORDER BY name LIMIT $' + (params.length + 1);
      params.push(parseInt(limit));

      db.all(query, params, (err, assets) => {
        if (err) {
          logger.error('Error getting assets for kiosk:', err);
          return res.status(500).json({
            success: false,
            error: 'Database error',
            errorCode: 'DB_ERROR'
          });
        }

        res.json({
          success: true,
          assets: assets || []
        });
      });
    } catch (error) {
      logger.error('Error getting assets for kiosk:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/beacon/activate:
 *   post:
 *     tags: [Beacon - Kiosk]
 *     summary: Activate kiosk with code
 *     description: Activate a kiosk using an activation code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activationCode
 *               - deviceInfo
 *             properties:
 *               activationCode:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 32
 *               deviceInfo:
 *                 type: object
 *                 properties:
 *                   deviceId:
 *                     type: string
 *                   deviceName:
 *                     type: string
 *                   osVersion:
 *                     type: string
 *                   appVersion:
 *                     type: string
 *     responses:
 *       200:
 *         description: Kiosk activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 kiosk:
 *                   $ref: '#/components/schemas/KioskConfig'
 *       400:
 *         description: Invalid activation code
 *       404:
 *         description: Activation code not found or expired
 */
router.post('/activate',
  createRateLimit(15 * 60 * 1000, 10), // 10 activation attempts per 15 minutes
  [
    body('activationCode')
      .isLength({ min: 6, max: 32 })
      .withMessage('Activation code must be between 6 and 32 characters'),
    body('deviceInfo')
      .isObject()
      .withMessage('Device info is required'),
    body('deviceInfo.deviceId')
      .notEmpty()
      .withMessage('Device ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { activationCode, deviceInfo } = req.body;

      // Find pending kiosk registration
      db.get(
        `SELECT * FROM kiosk_activations 
         WHERE activationCode = $1 AND isUsed = 0 AND expiresAt > datetime('now')`,
        [activationCode],
        (err, activation) => {
          if (err) {
            logger.error('Database error during kiosk activation:', err);
            return res.status(500).json({
              success: false,
              error: 'Database error',
              errorCode: 'DB_ERROR'
            });
          }

          if (!activation) {
            logger.warn('Invalid or expired activation code attempt', {
              activationCode,
              ip: req.ip
            });
            return res.status(404).json({
              success: false,
              error: 'Invalid or expired activation code',
              errorCode: 'INVALID_ACTIVATION_CODE'
            });
          }

          // Generate kiosk token
          const kioskToken = crypto.randomBytes(32).toString('hex');

          // Create or update kiosk record
          db.run(
            `INSERT OR REPLACE INTO kiosks (
              id, name, location, deviceInfo, token, isActive, 
              activatedAt, lastSeen, configuration
            ) VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'), ?)`,
            [
              activation.kioskId,
              activation.kioskName,
              activation.location,
              JSON.stringify(deviceInfo),
              kioskToken,
              activation.configuration || '{}'
            ],
            function(err) {
              if (err) {
                logger.error('Error creating kiosk record:', err);
                return res.status(500).json({
                  success: false,
                  error: 'Failed to activate kiosk',
                  errorCode: 'ACTIVATION_ERROR'
                });
              }

              // Auto-register kiosk record in inventory (if inventory module available)
              try {
               // Link kiosk to inventory asset if found by hardwareId
               // Note: inventory lookup uses callback-based db API; prefer service-layer helpers for async/await patterns
               // const asset = await db.query('SELECT id FROM inventory_assets WHERE hardware_id = $1 LIMIT 1', [hardwareId]);
               // const assetId = asset.rows?.[0]?.id || null;
                // In a real system, deviceInfo/serial would be matched.
                HelixKioskIntegration.updateHelixSyncStatus?.(activation.kioskId, 0, { status: 'pending', timestamp: new Date().toISOString() });
              } catch (e) {
                logger.warn('Inventory/Helix auto-registration hook failed:', e.message);
              }

              // Mark activation as used
              db.run(
                'UPDATE kiosk_activations SET isUsed = 1, usedAt = datetime("now") WHERE id = $1',
                [activation.id]
              );

              logger.info('Kiosk activated successfully', {
                kioskId: activation.kioskId,
                kioskName: activation.kioskName,
                location: activation.location
              });

              // Emit kiosk-activated for realtime UIs
              events.emit('kiosk-activated', { kioskId: activation.kioskId, kioskName: activation.kioskName, location: activation.location });

              res.json({
                success: true,
                token: kioskToken,
                kiosk: {
                  id: activation.kioskId,
                  name: activation.kioskName,
                  location: activation.location,
                  isActive: true,
                  configuration: JSON.parse(activation.configuration || '{}')
                },
                message: 'Kiosk activated successfully'
              });
            }
          );
        }
      );
    } catch (error) {
      logger.error('Error during kiosk activation:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR'
      });
    }
  }
);

// Admin-issued activation code generation
router.post('/activation-codes', createRateLimit(5 * 60 * 1000, 20), async (req, res) => {
  try {
    const { kioskId, kioskName, location, configuration } = req.body || {};
    if (!kioskId) return res.status(400).json({ success: false, error: 'kioskId required' });
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString(); // 15 min
    db.run(
      `INSERT INTO kiosk_activations (kioskId, kioskName, location, activationCode, configuration, isUsed, expiresAt)
       VALUES ($1, $2, $3, $4, $5, 0, $6)`,
      [kioskId, kioskName || kioskId, location || '', code, JSON.stringify(configuration || {}), expiresAt],
      function(err) {
        if (err) return res.status(500).json({ success: false, error: 'DB error' });
        const activationUrl = `${process.env.ADMIN_URL || ''}/activate?kioskId=${encodeURIComponent(kioskId)}&code=${code}`;
        QRCode.toDataURL(activationUrl).then(qr => {
          res.status(201).json({ success: true, code, kioskId, kioskName, location, expiresAt, activationUrl, qr });
        }).catch(() => res.status(201).json({ success: true, code, kioskId, kioskName, location, expiresAt, activationUrl }));
      }
    );
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create activation code' });
  }
});

// Kiosk check-in to update lastSeen and trigger Helix sync
router.post('/check-in', validateKioskAuth, async (req, res) => {
  try {
    const kioskId = req.kiosk.id;
    db.run('UPDATE kiosks SET lastSeen = datetime("now") WHERE id = $1', [kioskId], async (err) => {
      if (err) return res.status(500).json({ success: false, error: 'DB error' });
      // Trigger Helix sync for any pending assets linked to this kiosk
      try {
        const helix = (await import('../services/helixKioskIntegration.js')).default;
        if (helix?.bulkSyncWithHelix) {
          await helix.bulkSyncWithHelix({ limit: 50 });
        }
      } catch (e) {
        logger.warn('Helix bulk sync trigger failed:', e.message);
      }
      events.emit('kiosk_check_in', { kioskId, timestamp: new Date().toISOString() });
      res.json({ success: true, kioskId });
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Check-in failed' });
  }
});

// Link a kiosk to an inventory asset by tag or serial
router.post('/link-asset', authenticateJWT, async (req, res) => {
  try {
    const { kioskId, assetTag, serialNumber } = req.body || {};
    if (!kioskId || (!assetTag && !serialNumber)) {
      return res.status(400).json({ success: false, error: 'kioskId and assetTag or serialNumber required' });
    }
    const helix = (await import('../services/helixKioskIntegration.js')).default;

    // Lookup asset in inventory
    let asset = null;
    if (assetTag) {
      asset = await helix.db.inventoryAsset.findFirst({ where: { asset_tag: assetTag } });
      if (!asset) {
        asset = await helix.db.inventoryAsset.findFirst({ where: { asset_tag: { equals: assetTag, mode: 'insensitive' } } });
      }
    }
    if (!asset && serialNumber) {
      // Attempt plaintext field
      asset = await helix.db.inventoryAsset.findFirst({ where: { serial_number_plain: serialNumber } }).catch(() => null);
      // Fallback: case-insensitive partial match
      if (!asset) {
        asset = await helix.db.inventoryAsset.findFirst({ where: { serial_number_plain: { contains: serialNumber, mode: 'insensitive' } } }).catch(() => null);
      }
      // Fallback: decrypt compare across recent assets (bounded scan)
      if (!asset) {
        const recent = await helix.db.inventoryAsset.findMany({ take: 200, orderBy: { updated_at: 'desc' } }).catch(() => []);
        for (const a of recent) {
          if (a.serial_number_enc) {
            try {
              const { decrypt } = await import('../utils/encryption.js');
              const dec = decrypt(a.serial_number_enc);
              if (dec && dec.toLowerCase() === String(serialNumber).toLowerCase()) { asset = a; break; }
            } catch {}
          }
        }
      }
    }
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    const result = await helix.registerAssetWithKiosk(asset.id, kioskId, { userId: req.user?.id || 'admin' });
    // Trigger sync immediately for responsiveness, ignoring errors
    try {
      await helix.syncWithHelix(kioskId, asset.id, asset, result.metadata || {});
    } catch (e) {
      logger.warn('Immediate Helix sync failed:', e.message);
    }
    return res.json({ success: true, result });
  } catch (e) {
    logger.error('Link asset failed:', e);
    res.status(500).json({ success: false, error: 'Link asset failed' });
  }
});

export default router;
