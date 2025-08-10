import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Utilities
function toInt(val, def = 10) {
  const n = parseInt(String(val || ''));
  return Number.isNaN(n) ? def : n;
}

// Classes
router.get('/classes', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM ci_classes ORDER BY name');
    res.json({ success: true, classes: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to list classes' });
  }
});

router.post('/classes', authenticateJWT, async (req, res) => {
  try {
    const { name, label, description, parent_id } = req.body || {};
    if (!name) return res.status(400).json({ success: false, error: 'name required' });
    const { rows } = await db.query(
      `INSERT INTO ci_classes (name, label, description, parent_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, label || null, description || null, parent_id || null]
    );
    res.json({ success: true, class: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create class' });
  }
});

// Items
router.get('/items', authenticateJWT, async (req, res) => {
  try {
    const { q, classId, limit, offset } = req.query;
    const where = [];
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      where.push(`(name ILIKE $${params.length})`);
    }
    if (classId) {
      params.push(classId);
      where.push(`class_id = $${params.length}`);
    }
    const lim = toInt(limit, 50);
    const off = toInt(offset, 0);
    params.push(lim);
    params.push(off);

    const sql = `SELECT * FROM ci_items ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await db.query(sql, params);
    res.json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to list items' });
  }
});

router.get('/items/:id', authenticateJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rows } = await db.query('SELECT * FROM ci_items WHERE id=$1', [id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    // fetch identifiers and relationships
    const [idents, relsOut, relsIn] = await Promise.all([
      db.query('SELECT * FROM ci_identifiers WHERE item_id=$1 ORDER BY namespace, name', [id]),
      db.query(`SELECT r.*, t.name as type_name, t.forward_label FROM ci_relationships r JOIN ci_relationship_types t ON r.type_id=t.id WHERE source_item_id=$1`, [id]),
      db.query(`SELECT r.*, t.name as type_name, t.reverse_label FROM ci_relationships r JOIN ci_relationship_types t ON r.type_id=t.id WHERE target_item_id=$1`, [id]),
    ]);
    res.json({ success: true, item: rows[0], identifiers: idents.rows, relationships: { out: relsOut.rows, in: relsIn.rows } });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to get item' });
  }
});

router.post('/items', authenticateJWT, async (req, res) => {
  try {
    const { class_id, name, status, environment, owner_user_id, owner_group, criticality, attributes, identifiers } = req.body || {};
    if (!class_id || !name) return res.status(400).json({ success: false, error: 'class_id and name required' });
    const { rows } = await db.query(
      `INSERT INTO ci_items (class_id, name, status, environment, owner_user_id, owner_group, criticality, attributes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [class_id, name, status || 'active', environment || null, owner_user_id || null, owner_group || null, criticality || null, attributes || {}]
    );
    const item = rows[0];
    if (Array.isArray(identifiers) && identifiers.length) {
      for (const iden of identifiers) {
        if (!iden) continue;
        await db.query(
          `INSERT INTO ci_identifiers (item_id, namespace, name, value) VALUES ($1,$2,$3,$4) ON CONFLICT (namespace,name,value) DO NOTHING`,
          [item.id, iden.namespace || 'default', iden.name || 'name', iden.value]
        );
      }
    }
    await db.query('INSERT INTO ci_audit (item_id, action, diff, user_id) VALUES ($1,$2,$3,$4)', [item.id, 'create', req.body || {}, req.user?.id || null]);
    res.json({ success: true, item });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create item' });
  }
});

router.put('/items/:id', authenticateJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fields = ['class_id','name','status','environment','owner_user_id','owner_group','criticality','attributes'];
    const set = [];
    const params = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        params.push(req.body[f]);
        set.push(`${f} = $${params.length}`);
      }
    });
    if (set.length === 0) return res.json({ success: true, item: (await db.query('SELECT * FROM ci_items WHERE id=$1',[id])).rows[0] });
    params.push(id);
    const { rows } = await db.query(`UPDATE ci_items SET ${set.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id=$${params.length} RETURNING *`, params);
    await db.query('INSERT INTO ci_audit (item_id, action, diff, user_id) VALUES ($1,$2,$3,$4)', [id, 'update', req.body || {}, req.user?.id || null]);
    res.json({ success: true, item: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to update item' });
  }
});

router.delete('/items/:id', authenticateJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.query('INSERT INTO ci_audit (item_id, action, user_id) VALUES ($1,$2,$3)', [id, 'delete', req.user?.id || null]);
    await db.query('DELETE FROM ci_items WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
});

// Relationship types
router.get('/relationship-types', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM ci_relationship_types ORDER BY name');
    res.json({ success: true, types: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to list relationship types' });
  }
});

router.post('/relationship-types', authenticateJWT, async (req, res) => {
  try {
    const { name, forward_label, reverse_label, description } = req.body || {};
    if (!name || !forward_label || !reverse_label) return res.status(400).json({ success: false, error: 'name, forward_label, reverse_label required' });
    const { rows } = await db.query(
      `INSERT INTO ci_relationship_types (name, forward_label, reverse_label, description) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, forward_label, reverse_label, description || null]
    );
    res.json({ success: true, type: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create relationship type' });
  }
});

// Relationships
router.post('/relationships', authenticateJWT, async (req, res) => {
  try {
    const { type_id, source_item_id, target_item_id, properties } = req.body || {};
    if (!type_id || !source_item_id || !target_item_id) return res.status(400).json({ success: false, error: 'type_id, source_item_id, target_item_id required' });
    const { rows } = await db.query(
      `INSERT INTO ci_relationships (type_id, source_item_id, target_item_id, properties, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [type_id, source_item_id, target_item_id, properties || {}, req.user?.id || null]
    );
    res.json({ success: true, relationship: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create relationship' });
  }
});

router.get('/items/:id/relationships', authenticateJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rows } = await db.query(
      `SELECT r.*, t.name as type_name, t.forward_label, t.reverse_label,
              s.name as source_name, d.name as target_name
       FROM ci_relationships r
       JOIN ci_relationship_types t ON r.type_id=t.id
       JOIN ci_items s ON r.source_item_id=s.id
       JOIN ci_items d ON r.target_item_id=d.id
       WHERE r.source_item_id=$1 OR r.target_item_id=$1`,
      [id]
    );
    res.json({ success: true, relationships: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to list relationships' });
  }
});

// Simple search
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || String(q).length < 2) return res.status(400).json({ success: false, error: 'q too short' });
    const like = `%${q}%`;
    const { rows } = await db.query(
      `SELECT i.*, c.name AS class_name
       FROM ci_items i JOIN ci_classes c ON i.class_id=c.id
       WHERE i.name ILIKE $1 OR CAST(i.attributes AS TEXT) ILIKE $1
       ORDER BY i.updated_at DESC LIMIT 50`,
      [like]
    );
    res.json({ success: true, results: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

export default router;