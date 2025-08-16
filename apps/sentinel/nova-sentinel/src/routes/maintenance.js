// Nova Sentinel - Maintenance Routes
// Complete maintenance window management

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const router = express.Router();

// Rate limiting for maintenance operations
const maintenanceRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many maintenance requests, please try again later.',
});

router.use(maintenanceRateLimit);

// ========================================================================
// MAINTENANCE WINDOW MANAGEMENT
// ========================================================================

/**
 * @swagger
 * /api/v1/maintenance:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get all maintenance windows
 */
router.get('/', async (req, res) => {
  try {
    const { status, upcoming, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT * FROM maintenance 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (upcoming === 'true') {
      query += ' AND start_time > datetime("now")';
    }

    query += ' ORDER BY start_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const maintenance = await req.services.database.db.prepare(query).all(...params);

    const enrichedMaintenance = maintenance.map((m) => ({
      ...m,
      affectedMonitors: JSON.parse(m.affected_monitors || '[]'),
      affectedStatusPages: JSON.parse(m.affected_status_pages || '[]'),
    }));

    res.json({
      success: true,
      maintenance: enrichedMaintenance,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: maintenance.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Maintenance list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve maintenance windows',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/maintenance:
 *   post:
 *     tags: [Maintenance]
 *     summary: Create maintenance window
 */
router.post(
  '/',
  [
    body('title')
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('Maintenance title required'),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('startTime').isISO8601().withMessage('Valid start time required'),
    body('endTime').isISO8601().withMessage('Valid end time required'),
    body('timezone').optional().isString(),
    body('affectedMonitors').optional().isArray(),
    body('affectedStatusPages').optional().isArray(),
    body('strategy').optional().isIn(['single', 'recurring']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const {
        title,
        description,
        startTime,
        endTime,
        timezone = 'UTC',
        affectedMonitors = [],
        affectedStatusPages = [],
        strategy = 'single',
      } = req.body;

      // Validate time range
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time',
        });
      }

      if (start < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Start time cannot be in the past',
        });
      }

      // Create maintenance in Uptime Kuma
      const uptimeKumaMaintenance = await req.services.uptimeKuma.createMaintenance({
        title,
        description,
        dateTime: startTime,
        dateTimeEnd: endTime,
        strategy,
        monitorList: affectedMonitors,
        statusPageList: affectedStatusPages,
      });

      // Store in database
      const maintenanceId = crypto.randomUUID();
      await req.services.database.db
        .prepare(
          `
        INSERT INTO maintenance (
          id, uptime_kuma_id, created_by, title, description, strategy,
          start_time, end_time, timezone, affected_monitors, affected_status_pages, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          maintenanceId,
          uptimeKumaMaintenance.id,
          req.user.id,
          title,
          description,
          strategy,
          startTime,
          endTime,
          timezone,
          JSON.stringify(affectedMonitors),
          JSON.stringify(affectedStatusPages),
          'scheduled',
        );

      // Notify affected status page subscribers
      for (const statusPageId of affectedStatusPages) {
        await req.services.notifications.notifyStatusPageSubscribers(statusPageId, {
          type: 'maintenance',
          title: `Scheduled Maintenance: ${title}`,
          content: `${description}\n\nScheduled: ${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}`,
        });
      }

      // Emit real-time update
      req.io.emit('maintenance_scheduled', {
        id: maintenanceId,
        title,
        startTime,
        endTime,
        affectedMonitors,
        affectedStatusPages,
      });

      res.status(201).json({
        success: true,
        maintenance: {
          id: maintenanceId,
          uptimeKumaId: uptimeKumaMaintenance.id,
          title,
          description,
          startTime,
          endTime,
          timezone,
          affectedMonitors,
          affectedStatusPages,
          status: 'scheduled',
        },
        message: 'Maintenance window scheduled successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Maintenance creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create maintenance window',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v1/maintenance/{id}:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get maintenance window details
 */
router.get(
  '/:id',
  [param('id').isString().withMessage('Maintenance ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;

      const maintenance = await req.services.database.db
        .prepare(
          `
        SELECT * FROM maintenance WHERE id = ?
      `,
        )
        .get(id);

      if (!maintenance) {
        return res.status(404).json({
          success: false,
          error: 'Maintenance window not found',
        });
      }

      // Get affected monitors details
      const affectedMonitors = JSON.parse(maintenance.affected_monitors || '[]');
      const monitorDetails = [];

      if (affectedMonitors.length > 0) {
        const placeholders = affectedMonitors.map(() => '?').join(',');
        const monitors = await req.services.database.db
          .prepare(
            `
          SELECT uptime_kuma_id, name, type FROM monitors WHERE uptime_kuma_id IN (${placeholders})
        `,
          )
          .all(...affectedMonitors);
        monitorDetails.push(...monitors);
      }

      res.json({
        success: true,
        maintenance: {
          ...maintenance,
          affectedMonitors: JSON.parse(maintenance.affected_monitors || '[]'),
          affectedStatusPages: JSON.parse(maintenance.affected_status_pages || '[]'),
          monitorDetails,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Maintenance details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve maintenance details',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v1/maintenance/{id}:
 *   put:
 *     tags: [Maintenance]
 *     summary: Update maintenance window
 */
router.put(
  '/:id',
  [
    param('id').isString().withMessage('Maintenance ID required'),
    body('title').optional().isString().isLength({ min: 1, max: 200 }),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get existing maintenance
      const existing = await req.services.database.db
        .prepare(
          `
        SELECT * FROM maintenance WHERE id = ?
      `,
        )
        .get(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Maintenance window not found',
        });
      }

      // Check if maintenance can be updated (only scheduled maintenance)
      if (existing.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          error: 'Only scheduled maintenance can be updated',
        });
      }

      // Update in Uptime Kuma
      await req.services.uptimeKuma.updateMaintenance(existing.uptime_kuma_id, req.body);

      // Update in database
      const fields = [];
      const values = [];

      Object.entries(req.body).forEach(([key, value]) => {
        if (['title', 'description', 'startTime', 'endTime'].includes(key)) {
          fields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`);
          values.push(value);
        }
      });

      if (fields.length > 0) {
        values.push(id);
        await req.services.database.db
          .prepare(
            `
          UPDATE maintenance SET ${fields.join(', ')} WHERE id = ?
        `,
          )
          .run(...values);
      }

      // Get updated maintenance
      const updated = await req.services.database.db
        .prepare(
          `
        SELECT * FROM maintenance WHERE id = ?
      `,
        )
        .get(id);

      // Emit real-time update
      req.io.emit('maintenance_updated', {
        id,
        ...req.body,
      });

      res.json({
        success: true,
        maintenance: {
          ...updated,
          affectedMonitors: JSON.parse(updated.affected_monitors || '[]'),
          affectedStatusPages: JSON.parse(updated.affected_status_pages || '[]'),
        },
        message: 'Maintenance window updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Maintenance update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update maintenance window',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v1/maintenance/{id}:
 *   delete:
 *     tags: [Maintenance]
 *     summary: Cancel maintenance window
 */
router.delete(
  '/:id',
  [param('id').isString().withMessage('Maintenance ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get maintenance
      const maintenance = await req.services.database.db
        .prepare(
          `
        SELECT * FROM maintenance WHERE id = ?
      `,
        )
        .get(id);

      if (!maintenance) {
        return res.status(404).json({
          success: false,
          error: 'Maintenance window not found',
        });
      }

      // Cancel in Uptime Kuma
      await req.services.uptimeKuma.deleteMaintenance(maintenance.uptime_kuma_id);

      // Update status in database
      await req.services.database.db
        .prepare(
          `
        UPDATE maintenance SET status = 'cancelled' WHERE id = ?
      `,
        )
        .run(id);

      // Notify subscribers
      const affectedStatusPages = JSON.parse(maintenance.affected_status_pages || '[]');
      for (const statusPageId of affectedStatusPages) {
        await req.services.notifications.notifyStatusPageSubscribers(statusPageId, {
          type: 'maintenance',
          title: `Maintenance Cancelled: ${maintenance.title}`,
          content: `The scheduled maintenance "${maintenance.title}" has been cancelled.`,
        });
      }

      // Emit real-time update
      req.io.emit('maintenance_cancelled', { id });

      res.json({
        success: true,
        message: 'Maintenance window cancelled successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Maintenance cancellation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel maintenance window',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v1/maintenance/{id}/start:
 *   post:
 *     tags: [Maintenance]
 *     summary: Start maintenance window manually
 */
router.post(
  '/:id/start',
  [param('id').isString().withMessage('Maintenance ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get maintenance
      const maintenance = await req.services.database.db
        .prepare(
          `
        SELECT * FROM maintenance WHERE id = ?
      `,
        )
        .get(id);

      if (!maintenance) {
        return res.status(404).json({
          success: false,
          error: 'Maintenance window not found',
        });
      }

      if (maintenance.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          error: 'Only scheduled maintenance can be started',
        });
      }

      // Update status
      await req.services.database.db
        .prepare(
          `
        UPDATE maintenance SET status = 'active' WHERE id = ?
      `,
        )
        .run(id);

      // Emit real-time update
      req.io.emit('maintenance_started', {
        id,
        title: maintenance.title,
        affectedMonitors: JSON.parse(maintenance.affected_monitors || '[]'),
      });

      res.json({
        success: true,
        message: 'Maintenance window started',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Maintenance start error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start maintenance window',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v1/maintenance/{id}/complete:
 *   post:
 *     tags: [Maintenance]
 *     summary: Complete maintenance window
 */
router.post(
  '/:id/complete',
  [param('id').isString().withMessage('Maintenance ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get maintenance
      const maintenance = await req.services.database.db
        .prepare(
          `
        SELECT * FROM maintenance WHERE id = ?
      `,
        )
        .get(id);

      if (!maintenance) {
        return res.status(404).json({
          success: false,
          error: 'Maintenance window not found',
        });
      }

      if (!['scheduled', 'active'].includes(maintenance.status)) {
        return res.status(400).json({
          success: false,
          error: 'Only scheduled or active maintenance can be completed',
        });
      }

      // Update status
      await req.services.database.db
        .prepare(
          `
        UPDATE maintenance SET status = 'completed' WHERE id = ?
      `,
        )
        .run(id);

      // Notify subscribers
      const affectedStatusPages = JSON.parse(maintenance.affected_status_pages || '[]');
      for (const statusPageId of affectedStatusPages) {
        await req.services.notifications.notifyStatusPageSubscribers(statusPageId, {
          type: 'maintenance',
          title: `Maintenance Completed: ${maintenance.title}`,
          content: `The maintenance "${maintenance.title}" has been completed successfully.`,
        });
      }

      // Emit real-time update
      req.io.emit('maintenance_completed', {
        id,
        title: maintenance.title,
      });

      res.json({
        success: true,
        message: 'Maintenance window completed',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Maintenance completion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete maintenance window',
        details: error.message,
      });
    }
  },
);

export default router;
