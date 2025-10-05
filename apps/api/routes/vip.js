import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateJWT, requirePermission } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/proxies', authenticateJWT, requirePermission('vip:read'), createRateLimit(15 * 60 * 1000, 50), async (req, res) => {
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
  requirePermission('vip:write'),
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
  requirePermission('vip:write'),
  createRateLimit(15 * 60 * 1000, 20),
  async (req, res) => {
    try {
      // Verify the proxy exists before attempting deletion to prevent information disclosure
      const existing = await db.oneOrNone('SELECT id FROM vip_proxies WHERE id = $1', [req.params.id]);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Proxy not found',
          errorCode: 'PROXY_NOT_FOUND'
        });
      }

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

router.get('/metrics', authenticateJWT, requirePermission('vip:read'), createRateLimit(15 * 60 * 1000, 50), async (req, res) => {
  try {
    const vipCountRow = await db.one('SELECT COUNT(*) AS count FROM users WHERE is_vip = true');
    const ticketRow = await db.one(
      'SELECT COUNT(*) AS count FROM support_tickets WHERE vip_priority_score > 0',
    );
    res.json({
      success: true,
      metrics: {
        vipUsers: parseInt(vipCountRow.count, 10),
        vipTickets: parseInt(ticketRow.count, 10),
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

export default router;
