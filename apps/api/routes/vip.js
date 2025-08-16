import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/proxies', authenticateJWT, createRateLimit(15 * 60 * 1000, 50), async (req, res) => {
  try {
    const rows = await db.any(
      'SELECT vp.*, u.name AS proxy_name FROM vip_proxies vp JOIN users u ON vp.proxy_id = u.id',
    );
    res.json({ success: true, proxies: rows });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: 'Failed to load proxies', errorCode: 'PROXY_ERROR' });
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
        return res
          .status(400)
          .json({
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
      res
        .status(500)
        .json({ success: false, error: 'Failed to add proxy', errorCode: 'PROXY_ERROR' });
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
      res
        .status(500)
        .json({ success: false, error: 'Failed to remove proxy', errorCode: 'PROXY_ERROR' });
    }
  },
);

router.get('/metrics', authenticateJWT, createRateLimit(15 * 60 * 1000, 50), async (req, res) => {
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
    res
      .status(500)
      .json({ success: false, error: 'Failed to load metrics', errorCode: 'METRICS_ERROR' });
  }
});

export default router;
