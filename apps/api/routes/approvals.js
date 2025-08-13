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
    // Audit
    await db.createAuditLog('approval.action', req.user.id, {
      approval_id: id,
      action,
      ip: req.ip,
      userAgent: req.get('User-Agent') || null
    });
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
    // Audit
    await db.createAuditLog('approval.request', req.user.id, {
      approval_id: rows[0].id,
      approver_user_id: approverUserId,
      title,
      ip: req.ip,
      userAgent: req.get('User-Agent') || null
    });
    res.status(201).json({ id: rows[0].id });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

// Admin: reassign/reroute approval to different approver
router.put('/:id/reassign', authenticateJWT, [
  param('id').isString(),
  body('approverUserId').isString()
], async (req, res) => {
  try {
    if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { id } = req.params;
    const { approverUserId } = req.body;
    const { rowCount } = await db.query('UPDATE approvals SET approver_user_id=$1, status=$2, acted_by=NULL, acted_at=NULL WHERE id=$3', [approverUserId, 'pending', id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Approval not found' });
    // Audit
    await db.createAuditLog('approval.reassign', req.user.id, {
      approval_id: id,
      new_approver_user_id: approverUserId,
      ip: req.ip,
      userAgent: req.get('User-Agent') || null
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

// Admin: approval history (audit trail)
router.get('/:id/history', authenticateJWT, [
  param('id').isString()
], async (req, res) => {
  try {
    if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { id } = req.params;
    // Fetch audit events for this approval from document audit store
    const entries = await db.findDocuments('audit_logs', {
      action: { $in: ['approval.request', 'approval.action', 'approval.reassign'] },
      $or: [
        { 'details.approval_id': id },
        { approval_id: id } // fallback if details flattened
      ]
    }, { sort: { timestamp: -1 }, limit: 200 });
    res.json({ items: entries || [] });
  } catch (e) { res.status(500).json({ error: 'History unavailable' }); }
});

// Admin: list approvals
router.get('/', authenticateJWT, async (req, res) => {
  try {
    if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { status, q } = req.query || {};
    let sql = 'SELECT id, title, status, requester_user_id, approver_user_id, created_at, acted_by, acted_at FROM approvals';
    const clauses = [];
    const params = [];
    if (status) {
      params.push(status);
      clauses.push(`status = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      clauses.push(`title ILIKE $${params.length}`);
    }
    if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT 500';
    const { rows } = await db.query(sql, params);
    res.json({ items: rows || [] });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

export default router;