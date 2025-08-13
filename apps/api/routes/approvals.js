import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import db from '../db.js';
import { body, param } from 'express-validator';

const router = express.Router();

// List approvals for current user (Orbit)
router.get('/my', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, title, status, created_at FROM approvals WHERE approver_user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ items: rows || [] });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

// Approve/Reject
router.post('/:id/action', authenticateJWT, [
  param('id').isString(),
  body('action').isIn(['approve','reject'])
], async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    await db.query('UPDATE approvals SET status=$1, acted_by=$2, acted_at=NOW() WHERE id=$3 AND approver_user_id=$2', [action === 'approve' ? 'approved' : 'rejected', req.user.id, id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

// Technician: create one-off approval request for a user
router.post('/request', authenticateJWT, [
  body('approverUserId').isString(),
  body('title').isString().isLength({ min: 1, max: 255 }),
  body('details').optional().isString()
], async (req, res) => {
  try {
    const { approverUserId, title, details } = req.body;
    const { rows } = await db.query('INSERT INTO approvals (title, details, status, requester_user_id, approver_user_id, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id', [title, details || null, 'pending', req.user.id, approverUserId]);
    res.status(201).json({ id: rows[0].id });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

export default router;