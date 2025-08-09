import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateJWT, authenticateKioskToken } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { logger } from '../logger.js';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * @swagger
 * /api/v1/kiosks/{deviceId}:
 *   get:
 *     summary: Get kiosk status and configuration
 *     description: Retrieve current status and configuration for a specific kiosk
 *     tags: [Kiosks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kiosk information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 kiosk:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     deviceId:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                     location:
 *                       type: string
 *                     lastPing:
 *                       type: string
 *                     configuration:
 *                       type: object
 */
router.get('/:deviceId',
  authenticateJWT,
  createRateLimit(5 * 60 * 1000, 60), // 60 requests per 5 minutes
  [
    param('deviceId').isString().notEmpty().withMessage('Device ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { deviceId } = req.params;

      const kiosk = await db.oneOrNone(`
        SELECT k.*, kt.last_ping, kt.status as current_status
        FROM kiosks k
        LEFT JOIN kiosk_telemetry kt ON k.device_id = kt.device_id
        WHERE k.device_id = $1 AND k.deleted_at IS NULL
        ORDER BY kt.created_at DESC
        LIMIT 1
      `, [deviceId]);

      if (!kiosk) {
        return res.status(404).json({
          success: false,
          error: 'Kiosk not found',
          errorCode: 'KIOSK_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        kiosk: {
          id: kiosk.id,
          deviceId: kiosk.device_id,
          name: kiosk.name,
          isActive: kiosk.is_active,
          status: kiosk.current_status || kiosk.status,
          location: kiosk.location,
          lastPing: kiosk.last_ping,
          configuration: kiosk.configuration ? JSON.parse(kiosk.configuration) : {},
          createdAt: kiosk.created_at,
          updatedAt: kiosk.updated_at
        }
      });

    } catch (error) {
      logger.error('Error getting kiosk:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get kiosk information',
        errorCode: 'KIOSK_GET_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/kiosks/{deviceId}/status:
 *   post:
 *     summary: Update kiosk status
 *     description: Update the current status of a kiosk device
 *     tags: [Kiosks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, busy, maintenance, offline]
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               deviceId:
 *                 type: string
 *               location:
 *                 type: string
 */
router.post('/:deviceId/status',
  authenticateKioskToken,
  createRateLimit(1 * 60 * 1000, 30), // 30 status updates per minute
  [
    param('deviceId').isString().notEmpty().withMessage('Device ID is required'),
    body('status').isIn(['available', 'busy', 'maintenance', 'offline']).withMessage('Valid status required'),
    body('timestamp').optional().isISO8601().withMessage('Valid timestamp required'),
    body('location').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { deviceId } = req.params;
      const { status, timestamp, location } = req.body;
      const statusTimestamp = timestamp ? new Date(timestamp) : new Date();

      // Verify kiosk exists and is active
      const kiosk = await db.oneOrNone(
        'SELECT id, is_active FROM kiosks WHERE device_id = $1 AND deleted_at IS NULL',
        [deviceId]
      );

      if (!kiosk) {
        return res.status(404).json({
          success: false,
          error: 'Kiosk not found',
          errorCode: 'KIOSK_NOT_FOUND'
        });
      }

      if (!kiosk.is_active) {
        return res.status(403).json({
          success: false,
          error: 'Kiosk is deactivated',
          errorCode: 'KIOSK_DEACTIVATED'
        });
      }

      // Insert status update into telemetry
      await db.none(`
        INSERT INTO kiosk_telemetry (device_id, status, location, ping_time, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [deviceId, status, location, statusTimestamp, new Date()]);

      // Update last known status on kiosk record
      await db.none(`
        UPDATE kiosks 
        SET status = $1, last_ping = $2, updated_at = $3
        ${location ? ', location = $4' : ''}
        WHERE device_id = $1
      `, location ? [status, statusTimestamp, new Date(), location, deviceId] : [status, statusTimestamp, new Date(), deviceId]);

      logger.info(`Kiosk ${deviceId} status updated to ${status}`);

      res.json({
        success: true,
        message: 'Status updated successfully',
        kiosk: {
          deviceId,
          status,
          location,
          timestamp: statusTimestamp
        }
      });

    } catch (error) {
      logger.error('Error updating kiosk status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update kiosk status',
        errorCode: 'KIOSK_STATUS_UPDATE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/kiosks/{deviceId}/config:
 *   get:
 *     summary: Get kiosk configuration
 *     description: Retrieve configuration settings for a specific kiosk
 *     tags: [Kiosks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:deviceId/config',
  authenticateKioskToken,
  createRateLimit(5 * 60 * 1000, 20), // 20 config requests per 5 minutes
  [
    param('deviceId').isString().notEmpty().withMessage('Device ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { deviceId } = req.params;

      const kiosk = await db.oneOrNone(`
        SELECT configuration, location, status_update_interval, is_active
        FROM kiosks 
        WHERE device_id = $1 AND deleted_at IS NULL
      `, [deviceId]);

      if (!kiosk) {
        return res.status(404).json({
          success: false,
          error: 'Kiosk not found',
          errorCode: 'KIOSK_NOT_FOUND'
        });
      }

      const config = kiosk.configuration ? JSON.parse(kiosk.configuration) : {};
      
      res.json({
        success: true,
        configuration: {
          ...config,
          location: kiosk.location,
          statusUpdateInterval: kiosk.status_update_interval || 300, // 5 minutes default
          isActive: kiosk.is_active,
          deviceId
        }
      });

    } catch (error) {
      logger.error('Error getting kiosk configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get kiosk configuration',
        errorCode: 'KIOSK_CONFIG_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/kiosks/register:
 *   post:
 *     summary: Register a new kiosk
 *     description: Register a new kiosk device with the system
 *     tags: [Kiosks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - activationCode
 *             properties:
 *               deviceId:
 *                 type: string
 *               activationCode:
 *                 type: string
 *               location:
 *                 type: string
 *               name:
 *                 type: string
 */
router.post('/register',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 5), // 5 registrations per 15 minutes
  [
    body('deviceId').isString().notEmpty().withMessage('Device ID is required'),
    body('activationCode').isString().notEmpty().withMessage('Activation code is required'),
    body('location').optional().isString(),
    body('name').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { deviceId, activationCode, location, name } = req.body;

      // Verify activation code
      const activation = await db.oneOrNone(`
        SELECT * FROM kiosk_activations 
        WHERE activation_code = $1 AND used_at IS NULL 
        AND expires_at > $2
      `, [activationCode, new Date()]);

      if (!activation) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired activation code',
          errorCode: 'INVALID_ACTIVATION_CODE'
        });
      }

      // Check if device already exists
      const existingKiosk = await db.oneOrNone(
        'SELECT id FROM kiosks WHERE device_id = $1',
        [deviceId]
      );

      if (existingKiosk) {
        return res.status(409).json({
          success: false,
          error: 'Device already registered',
          errorCode: 'DEVICE_ALREADY_REGISTERED'
        });
      }

      // Create kiosk record
      const kioskId = uuidv4();
      const now = new Date();
      
      await db.none(`
        INSERT INTO kiosks (
          id, device_id, name, location, status, is_active, 
          activation_code, activated_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        kioskId, deviceId, name || `Kiosk ${deviceId}`, location || 'Unknown',
        'offline', true, activationCode, now, now, now
      ]);

      // Mark activation code as used
      await db.none(`
        UPDATE kiosk_activations 
        SET used_at = $1, used_by_device = $2 
        WHERE activation_code = $3
      `, [now, deviceId, activationCode]);

      // Generate access token for kiosk
      const token = uuidv4();
      await db.none(`
        INSERT INTO kiosk_tokens (device_id, token, created_at, expires_at)
        VALUES ($1, $2, $3, $4)
      `, [deviceId, token, now, new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000))]); // 1 year

      logger.info(`Kiosk ${deviceId} registered successfully`);

      res.status(201).json({
        success: true,
        message: 'Kiosk registered successfully',
        kiosk: {
          id: kioskId,
          deviceId,
          name: name || `Kiosk ${deviceId}`,
          location: location || 'Unknown',
          status: 'offline',
          token
        }
      });

    } catch (error) {
      logger.error('Error registering kiosk:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register kiosk',
        errorCode: 'KIOSK_REGISTRATION_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/kiosks:
 *   get:
 *     summary: List all kiosks
 *     description: Get a list of all registered kiosks with their status
 *     tags: [Kiosks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, busy, maintenance, offline]
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 */
router.get('/',
  authenticateJWT,
  createRateLimit(5 * 60 * 1000, 30), // 30 requests per 5 minutes
  async (req, res) => {
    try {
      const {
        status,
        location,
        active,
        limit = 50,
        offset = 0
      } = req.query;

      let query = `
        SELECT k.*, 
               kt.status as current_status,
               kt.ping_time as last_ping,
               COUNT(*) OVER() as total_count
        FROM kiosks k
        LEFT JOIN (
          SELECT DISTINCT ON (device_id) device_id, status, ping_time
          FROM kiosk_telemetry
          ORDER BY device_id, created_at DESC
        ) kt ON k.device_id = kt.device_id
        WHERE k.deleted_at IS NULL
      `;
      
      const params = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND COALESCE(kt.status, k.status) = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (location) {
        query += ` AND k.location ILIKE $${paramIndex}`;
        params.push(`%${location}%`);
        paramIndex++;
      }

      if (active !== undefined) {
        query += ` AND k.is_active = $${paramIndex}`;
        params.push(active === 'true');
        paramIndex++;
      }

      query += ` ORDER BY k.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      const rows = await db.any(query, params);

      const kiosks = rows.map(row => ({
        id: row.id,
        deviceId: row.device_id,
        name: row.name,
        location: row.location,
        status: row.current_status || row.status,
        isActive: row.is_active,
        lastPing: row.last_ping,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      const total = rows.length > 0 ? rows[0].total_count : 0;
      const hasMore = parseInt(offset) + parseInt(limit) < total;

      res.json({
        success: true,
        kiosks,
        total,
        hasMore,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total
        }
      });

    } catch (error) {
      logger.error('Error listing kiosks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list kiosks',
        errorCode: 'KIOSK_LIST_ERROR'
      });
    }
  }
);

export default router;