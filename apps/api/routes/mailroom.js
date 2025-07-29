import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

function requireRoles(roles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    if (!roles.some(r => userRoles.includes(r))) {
      return res.status(403).json({ error: 'Insufficient permissions', errorCode: 'INSUFFICIENT_PERMISSIONS' });
    }
    next();
  };
}

// Create a new package record
router.post('/packages', authenticateJWT, requireRoles(['ops_technician','ops_lead']), async (req, res) => {
  try {
    const fields = [
      'tracking_number','carrier','sender','recipient_id','department','package_type','status','assigned_location','linked_ticket_id','linked_asset_id','flags'
    ];
    const values = fields.map(f => req.body[f] ?? null);
    const placeholders = fields.map((_,i) => `$${i+1}`).join(',');
    const { rows } = await db.query(
      `INSERT INTO mailroom_packages (${fields.join(',')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    await db.createAuditLog('mailroom_package_create', req.user.id, { id: rows[0].id });
    res.json({ success: true, package: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create package', errorCode: 'MAILROOM_ERROR' });
  }
});

// Retrieve package details
router.get('/packages/:id', authenticateJWT, requireRoles(['ops_technician','ops_lead','admin']), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM mailroom_packages WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, package: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch package', errorCode: 'MAILROOM_ERROR' });
  }
});

// Update package status
router.patch('/packages/:id/status', authenticateJWT, requireRoles(['ops_technician','ops_lead']), async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await db.query('UPDATE mailroom_packages SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await db.createAuditLog('mailroom_status_update', req.user.id, { id: rows[0].id, status });
    res.json({ success: true, package: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', errorCode: 'MAILROOM_ERROR' });
  }
});

// Assign proxy for pickup
router.post('/packages/:id/assign-proxy', authenticateJWT, requireRoles(['ops_technician','ops_lead']), async (req, res) => {
  try {
    const { proxy_id, recipient_id, expiration, status } = req.body;
    const { rows } = await db.query(
      'INSERT INTO proxy_authorizations (recipient_id, proxy_id, package_id, expiration, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [recipient_id, proxy_id, req.params.id, expiration, status || 'active']
    );
    await db.createAuditLog('mailroom_proxy_assign', req.user.id, { packageId: req.params.id, proxyId: proxy_id });
    res.json({ success: true, authorization: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign proxy', errorCode: 'MAILROOM_ERROR' });
  }
});

// Bulk import packages
router.post('/packages/bulk', authenticateJWT, requireRoles(['ops_technician','ops_lead']), async (req, res) => {
  try {
    const packages = Array.isArray(req.body.packages) ? req.body.packages : [];
    const results = [];
    for (const pkg of packages) {
      const fields = [
        'tracking_number','carrier','sender','recipient_id','department','package_type','status','assigned_location','linked_ticket_id','linked_asset_id','flags'
      ];
      const values = fields.map(f => pkg[f] ?? null);
      const placeholders = fields.map((_,i) => `$${i+1}`).join(',');
      const { rows } = await db.query(
        `INSERT INTO mailroom_packages (${fields.join(',')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      results.push(rows[0]);
    }
    await db.createAuditLog('mailroom_bulk_import', req.user.id, { count: results.length });
    res.json({ success: true, packages: results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import packages', errorCode: 'MAILROOM_ERROR' });
  }
});

export default router;
