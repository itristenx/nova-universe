import express from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import db from '../db.js';
import events from '../events.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const allowedFields = [
  'asset_tag',
  'type_id',
  'serial_number',
  'model',
  'vendor_id',
  'purchase_date',
  'warranty_expiry',
  'assigned_to_user_id',
  'assigned_to_org_id',
  'assigned_to_customer_id',
  'department',
  'status',
  'location_id',
  'kiosk_id',
  'custom_fields',
  'notes',
  'created_by',
  'updated_by'
];

export function parseCsv(text) {
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(v => v.trim());
  };

  const lines = text.trim().split(/\r?\n/);
  const headers = parseLine(lines.shift());
  return lines.filter(l => l.trim()).map(line => {
    const values = parseLine(line);
    const record = {};
    headers.forEach((h, i) => {
      record[h] = values[i] !== undefined ? values[i] : null;
    });
    return record;
  });
}

// List all assets
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM inventory_assets ORDER BY id');
    res.json({ success: true, assets: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assets', errorCode: 'INVENTORY_ERROR' });
  }
});

// Assets by user
router.get('/user/:userId', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM inventory_assets WHERE assigned_to_user_id = $1', [req.params.userId]);
    res.json({ success: true, assets: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assets', errorCode: 'INVENTORY_ERROR' });
  }
});

// Import assets from CSV
router.post('/import', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    const csv = req.file ? req.file.buffer.toString('utf8') : (req.body.csv || '');
    const records = parseCsv(csv);
    let inserted = 0;
    for (const record of records) {
      const fields = Object.keys(record).filter(f => allowedFields.includes(f));
      if (!fields.length) continue;
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(',');
      const values = fields.map(f => record[f] || null);
      await db.query(
        `INSERT INTO inventory_assets (${fields.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        values
      );
      inserted++;
    }
    res.json({ success: true, inserted });
  } catch (err) {
    res.status(400).json({ success: false, error: `Import failed: ${err.message}` });
  }
});

// Export assets as CSV
router.get('/export', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM inventory_assets ORDER BY id');
    if (!rows.length) return res.send('');
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => r[h]).join(','))).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Export failed', errorCode: 'INVENTORY_ERROR' });
  }
});

// Get single asset
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM inventory_assets WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, asset: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch asset', errorCode: 'INVENTORY_ERROR' });
  }
});

// Create asset
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const fields = [
      'asset_tag',
      'type_id',
      'serial_number',
      'model',
      'vendor_id',
      'purchase_date',
      'warranty_expiry',
      'assigned_to_user_id',
      'assigned_to_org_id',
      'assigned_to_customer_id',
      'department',
      'status',
      'location_id',
      'kiosk_id',
      'custom_fields',
      'notes',
      'created_by',
      'updated_by'
    ];
    const values = fields.map(f => req.body[f] ?? null);
    const placeholders = fields.map((_, i) => '$' + (i + 1)).join(',');
    const { rows } = await db.query(
      `INSERT INTO inventory_assets (${fields.join(',')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.json({ success: true, asset: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create asset', errorCode: 'INVENTORY_ERROR' });
  }
});

// Update asset
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const fields = [
      'asset_tag',
      'type_id',
      'serial_number',
      'model',
      'vendor_id',
      'purchase_date',
      'warranty_expiry',
      'assigned_to_user_id',
      'assigned_to_org_id',
      'assigned_to_customer_id',
      'department',
      'status',
      'location_id',
      'kiosk_id',
      'custom_fields',
      'notes',
      'updated_by'
    ];
    const set = fields.map((f, i) => `${f} = $${i+1}`).join(',');
    const values = fields.map(f => req.body[f] ?? null);
    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE inventory_assets SET ${set} WHERE id = $${fields.length+1} RETURNING *`,
      values
    );
    res.json({ success: true, asset: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update asset', errorCode: 'INVENTORY_ERROR' });
  }
});

// Delete asset
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    await db.query('DELETE FROM inventory_assets WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete asset', errorCode: 'INVENTORY_ERROR' });
  }
});

// Asset history
router.get('/:id/history', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM asset_status_logs WHERE asset_id = $1 ORDER BY timestamp DESC', [req.params.id]);
    res.json({ success: true, history: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch history', errorCode: 'INVENTORY_ERROR' });
  }
});

// Log new status
router.post('/:id/status', authenticateJWT, async (req, res) => {
  try {
    const { previous_status, new_status, notes } = req.body;
  const { rows } = await db.query(
    `INSERT INTO asset_status_logs (asset_id, previous_status, new_status, changed_by_user_id, notes)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.params.id, previous_status, new_status, req.user.id, notes]
  );
  events.emit('asset.status_changed', { assetId: req.params.id, new_status, previous_status });
  res.json({ success: true, log: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to log status', errorCode: 'INVENTORY_ERROR' });
  }
});

// Create assignment
router.post('/:id/assign', authenticateJWT, async (req, res) => {
  try {
    let { user_id, org_id, customer_id, assigned_by, expected_return, manager_id } = req.body;

    if (user_id === null || user_id === undefined || user_id === '') {
      user_id = null;
    }
  const { rows } = await db.query(
      `INSERT INTO asset_assignments (asset_id, user_id, org_id, customer_id, assigned_by, expected_return, manager_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.id, user_id, org_id, customer_id, assigned_by || req.user.id, expected_return, manager_id]
    );
  await db.query('UPDATE inventory_assets SET assigned_to_user_id=$1 WHERE id=$2', [user_id, req.params.id]);
  events.emit('asset.assigned', { assetId: req.params.id, user_id });
  res.json({ success: true, assignment: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to assign asset', errorCode: 'INVENTORY_ERROR' });
  }
});

export default router;
