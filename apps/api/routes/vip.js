import express from 'express';
import { body, query, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { logger } from '../logger.js';

const router = express.Router();

// VIP proxy management endpoints
router.get('/proxies', authenticateJWT, createRateLimit(15 * 60 * 1000, 50), async (req, res) => {
  try {
    const rows = await db.any(
      'SELECT vp.*, u.name AS proxy_name FROM vip_proxies vp JOIN users u ON vp.proxy_id = u.id',
    );
    res.json({ success: true, proxies: rows });
  } catch (err) {
    console.error('Failed to load VIP proxies:', err);
    console.error('User requesting proxies:', req.user?.id);
    
    res
      .status(500)
      .json({ 
        success: false, 
        error: 'Failed to load proxies', 
        errorCode: 'PROXY_ERROR',
        ...(process.env.NODE_ENV !== 'production' && { details: err.message })
      });
  }
});

router.post(
  '/proxies',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20),
  [body('vipId').isString(), body('proxyId').isString(), body('expiresAt').optional().isISO8601()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR',
        });
      }
      const { vipId, proxyId, expiresAt } = req.body;
      await db.none(
        'INSERT INTO vip_proxies (vip_id, proxy_id, created_at, expires_at) VALUES ($1,$2, CURRENT_TIMESTAMP, $3)',
        [vipId, proxyId, expiresAt || null],
      );
      res.json({ success: true });
    } catch (err) {
      console.error('Failed to add VIP proxy:', err);
      console.error('Request body:', req.body);
      console.error('User performing action:', req.user?.id);
      
      res
        .status(500)
        .json({ 
          success: false, 
          error: 'Failed to add proxy', 
          errorCode: 'PROXY_ERROR',
          ...(process.env.NODE_ENV !== 'production' && { details: err.message })
        });
    }
  },
);

router.delete(
  '/proxies/:id',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20),
  async (req, res) => {
    try {
      await db.none('DELETE FROM vip_proxies WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error('Failed to remove VIP proxy:', err);
      console.error('Proxy ID to delete:', req.params.id);
      console.error('User performing action:', req.user?.id);
      
      res
        .status(500)
        .json({ 
          success: false, 
          error: 'Failed to remove proxy', 
          errorCode: 'PROXY_ERROR',
          ...(process.env.NODE_ENV !== 'production' && { details: err.message })
        });
    }
  },
);

// VIP metrics endpoint
router.get('/metrics', authenticateJWT, createRateLimit(15 * 60 * 1000, 50), async (req, res) => {
  try {
    const vipCountRow = await db.one('SELECT COUNT(*) AS count FROM users WHERE is_vip = true');
    const ticketRow = await db.one(
      'SELECT COUNT(*) AS count FROM enhanced_support_tickets WHERE vip_priority_score > 0',
    );
    
    // Get VIP breakdown by level
    const vipBreakdown = await db.any(`
      SELECT 
        vip_level,
        COUNT(*) as count
      FROM users 
      WHERE is_vip = true 
      GROUP BY vip_level
    `);

    // Get VIP ticket metrics
    const vipTicketMetrics = await db.any(`
      SELECT 
        state,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at))/3600)::DECIMAL(10,2) as avg_resolution_hours
      FROM enhanced_support_tickets 
      WHERE is_vip = true 
      GROUP BY state
    `);

    res.json({
      success: true,
      metrics: {
        vipUsers: parseInt(vipCountRow.count, 10),
        vipTickets: parseInt(ticketRow.count, 10),
        vipBreakdown: vipBreakdown,
        vipTicketMetrics: vipTicketMetrics
      },
    });
  } catch (err) {
    console.error('Failed to load VIP metrics:', err);
    console.error('User requesting metrics:', req.user?.id);
    
    res
      .status(500)
      .json({ 
        success: false, 
        error: 'Failed to load metrics', 
        errorCode: 'METRICS_ERROR',
        ...(process.env.NODE_ENV !== 'production' && { details: err.message })
      });
  }
});

// VIP SLA overrides management
router.get('/sla-overrides', authenticateJWT, createRateLimit(15 * 60 * 1000, 50), async (req, res) => {
  try {
    const adminRoles = req.user?.roles || [];
    if (!adminRoles.includes('admin') && !adminRoles.includes('superadmin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required', 
        errorCode: 'ADMIN_ACCESS_REQUIRED' 
      });
    }

    const slaOverrides = await db.any(`
      SELECT 
        vso.*,
        u.name as user_name,
        u.email as user_email
      FROM vip_sla_overrides vso
      LEFT JOIN users u ON vso.user_id = u.id
      WHERE vso.is_active = true
      ORDER BY vso.created_at DESC
    `);

    res.json({ success: true, slaOverrides });
  } catch (err) {
    logger.error('Failed to load VIP SLA overrides:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load SLA overrides', 
      errorCode: 'SLA_OVERRIDE_ERROR' 
    });
  }
});

router.post('/sla-overrides', 
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20),
  [
    body('userId').optional().isInt(),
    body('groupName').optional().isString(),
    body('location').optional().isString(),
    body('responseMinutes').isInt({ min: 1 }),
    body('resolutionMinutes').isInt({ min: 1 }),
    body('businessHoursOnly').optional().isBoolean(),
    body('escalationChain').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR',
        });
      }

      const adminRoles = req.user?.roles || [];
      if (!adminRoles.includes('admin') && !adminRoles.includes('superadmin')) {
        return res.status(403).json({ 
          success: false, 
          error: 'Admin access required', 
          errorCode: 'ADMIN_ACCESS_REQUIRED' 
        });
      }

      const { userId, groupName, location, responseMinutes, resolutionMinutes, businessHoursOnly, escalationChain } = req.body;

      await db.none(`
        INSERT INTO vip_sla_overrides 
        (user_id, group_name, location, response_minutes, resolution_minutes, business_hours_only, escalation_chain, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      `, [userId || null, groupName || null, location || null, responseMinutes, resolutionMinutes, businessHoursOnly || false, JSON.stringify(escalationChain || [])]);

      // Log the SLA override creation
      await db.createAuditLog('VIP_SLA_OVERRIDE_CREATED', req.user.id, { 
        userId, groupName, location, responseMinutes, resolutionMinutes 
      });

      res.json({ success: true });
    } catch (err) {
      logger.error('Failed to create VIP SLA override:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create SLA override', 
        errorCode: 'SLA_OVERRIDE_ERROR' 
      });
    }
  }
);

// VIP notification preferences
router.get('/notification-preferences/:userId', 
  authenticateJWT, 
  createRateLimit(15 * 60 * 1000, 50), 
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Users can only access their own preferences, admins can access any
      const adminRoles = req.user?.roles || [];
      if (req.user.id !== parseInt(userId) && !adminRoles.includes('admin') && !adminRoles.includes('superadmin')) {
        return res.status(403).json({ 
          success: false, 
          error: 'Access denied', 
          errorCode: 'ACCESS_DENIED' 
        });
      }

      const preferences = await db.any(`
        SELECT * FROM vip_notification_preferences 
        WHERE user_id = $1 
        ORDER BY notification_type, escalation_level
      `, [userId]);

      res.json({ success: true, preferences });
    } catch (err) {
      logger.error('Failed to load VIP notification preferences:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to load notification preferences', 
        errorCode: 'NOTIFICATION_PREF_ERROR' 
      });
    }
  }
);

// VIP escalation endpoint for immediate escalation
router.post('/escalate/:ticketId',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 10),
  [
    body('reason').isString().isLength({ min: 10 }),
    body('escalationLevel').optional().isInt({ min: 1, max: 5 }),
    body('escalateTo').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR',
        });
      }

      const { ticketId } = req.params;
      const { reason, escalationLevel = 1, escalateTo } = req.body;

      // Verify ticket exists and is VIP
      const ticket = await db.oneOrNone(`
        SELECT id, ticket_number, is_vip, vip_priority_score, user_id 
        FROM enhanced_support_tickets 
        WHERE id = $1
      `, [ticketId]);

      if (!ticket) {
        return res.status(404).json({ 
          success: false, 
          error: 'Ticket not found', 
          errorCode: 'TICKET_NOT_FOUND' 
        });
      }

      if (!ticket.is_vip) {
        return res.status(400).json({ 
          success: false, 
          error: 'Only VIP tickets can use VIP escalation', 
          errorCode: 'NOT_VIP_TICKET' 
        });
      }

      // Create escalation record
      await db.none(`
        INSERT INTO ticket_escalations 
        (ticket_id, escalation_level, escalated_by, escalated_to, reason, status)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
      `, [ticketId, escalationLevel, req.user.id, escalateTo || null, reason]);

      // Update ticket priority if not already at maximum
      await db.none(`
        UPDATE enhanced_support_tickets 
        SET 
          is_escalated = true,
          priority = CASE 
            WHEN priority != 'CRITICAL' THEN 'CRITICAL'
            ELSE priority
          END,
          vip_priority_score = CASE 
            WHEN vip_priority_score < 150 THEN vip_priority_score + 50
            ELSE vip_priority_score
          END
        WHERE id = $1
      `, [ticketId]);

      // Log escalation
      await db.createAuditLog('VIP_ESCALATION_CREATED', req.user.id, { 
        ticketId, reason, escalationLevel, escalateTo 
      });

      logger.info(`VIP ticket ${ticket.ticket_number} escalated by user ${req.user.id}: ${reason}`);

      res.json({ success: true, message: 'VIP ticket escalated successfully' });
    } catch (err) {
      logger.error('Failed to escalate VIP ticket:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to escalate ticket', 
        errorCode: 'ESCALATION_ERROR' 
      });
    }
  }
);

export default router;
