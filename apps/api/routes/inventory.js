import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { parse as parseCsv } from 'csv-parse/sync';

const router = express.Router();

// List all assets
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM inventory_assets ORDER BY id');
    const assets = rows.map(a => ({
      ...a,
      serial_number: a.serial_number_enc ? decrypt(a.serial_number_enc) : null
    }));
    res.json({ success: true, assets });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assets', errorCode: 'INVENTORY_ERROR' });
  }
});

// Assets by user
router.get('/user/:userId', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM inventory_assets WHERE assigned_to_user_id = $1', [req.params.userId]);
    const assets = rows.map(a => ({
      ...a,
      serial_number: a.serial_number_enc ? decrypt(a.serial_number_enc) : null
    }));
    res.json({ success: true, assets });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assets', errorCode: 'INVENTORY_ERROR' });
  }
});

// Get single asset
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM inventory_assets WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    const asset = {
      ...rows[0],
      serial_number: rows[0].serial_number_enc ? decrypt(rows[0].serial_number_enc) : null
    };
    // Warranty alert if within 30 days
    let warrantyAlert = false;
    if (asset.warranty_expiry) {
      const exp = new Date(asset.warranty_expiry);
      const diff = exp - new Date();
      warrantyAlert = diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
    }
    res.json({ success: true, asset, warrantyAlert });
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
      'serial_number_enc',
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
    const values = fields.map(f => {
      if (f === 'serial_number_enc') {
        return req.body.serial_number ? encrypt(req.body.serial_number) : null;
      }
      return req.body[f] ?? null;
    });
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
      'serial_number_enc',
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
    const values = fields.map(f => {
      if (f === 'serial_number_enc') {
        return req.body.serial_number ? encrypt(req.body.serial_number) : null;
      }
      return req.body[f] ?? null;
    });
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
    res.json({ success: true, assignment: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to assign asset', errorCode: 'INVENTORY_ERROR' });
  }
});

// Import assets via CSV or JSON
router.post('/import', authenticateJWT, async (req, res) => {
  try {
    const { format, data } = req.body;
    const records = [];
    if (format === 'csv') {
      try {
        records.push(
          ...parseCsv(data, {
            columns: true,
            skip_empty_lines: true,
            trim: true
          })
        );
      } catch (e) {
        return res.status(400).json({ error: 'Invalid CSV data' });
      }
    } else if (format === 'json') {
      if (typeof data !== 'string' || data.length > MAX_JSON_DATA_LENGTH) {
        return res.status(400).json({ error: 'Invalid JSON data' });
      }
      try {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
          return res.status(400).json({ error: 'JSON must be an array of records' });
        }
        records.push(...parsed);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON data' });
      }
    } else {
      return res.status(400).json({ error: 'Unsupported format' });
    }

    for (const rec of records) {
      if (typeof rec.asset_tag !== 'string' || !assetTagRegex.test(rec.asset_tag)) {
        return res.status(400).json({ error: `Invalid asset_tag: ${rec.asset_tag}` });
      }
    }

    await db.query('BEGIN');
    try {
      for (const rec of records) {
        await db.query(
          'INSERT INTO inventory_assets (asset_tag, serial_number_enc) VALUES ($1,$2)',
          [rec.asset_tag, rec.serial_number ? encrypt(rec.serial_number) : null]
        );
      }
      await db.query('COMMIT');
    } catch (e) {
      await db.query('ROLLBACK');
      throw e;
    }

    res.json({ success: true, imported: records.length });
  } catch (err) {
    console.error('Error during asset import:', err); // Log the full error for debugging
    res.status(500).json({ 
      success: false, 
      error: 'Import failed due to a server error. Please check the data and try again.', 
      errorCode: 'IMPORT_ERROR' 
    });
  }
});

export default router;
