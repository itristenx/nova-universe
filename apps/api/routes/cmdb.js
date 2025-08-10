import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../logger.js';

const router = express.Router();

// Helpers
function isAdmin(req) {
  return req.user?.roles?.includes('admin') || req.user?.roles?.includes('superadmin');
}

// ---- CI Classes ----
router.get('/classes', authenticateJWT, createRateLimit(15 * 60 * 1000, 200), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cmdb_ci_classes ORDER BY name ASC');
    res.json({ success: true, classes: result.rows });
  } catch (error) {
    logger.error('CMDB classes list error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch classes' });
  }
});

router.post(
  '/classes',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 30),
  [
    body('name').isString().isLength({ min: 2 }),
    body('key').isString().isLength({ min: 2 }),
    body('description').optional().isString(),
    body('icon').optional().isString(),
    body('parentId').optional().isInt({ min: 1 }),
    body('attributeSchema').optional().isObject(),
  ],
  async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Admin access required' });
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array() });
      const { name, key, description, icon, parentId, attributeSchema } = req.body;
      const { rows } = await db.query(
        `INSERT INTO cmdb_ci_classes (name, key, description, icon, parent_id, attribute_schema)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [name, key.toLowerCase(), description || null, icon || null, parentId || null, attributeSchema || {}]
      );
      res.json({ success: true, class: rows[0] });
    } catch (error) {
      logger.error('CMDB class create error:', error);
      if (error?.code === '23505') {
        return res.status(409).json({ success: false, error: 'Class key already exists' });
      }
      res.status(500).json({ success: false, error: 'Failed to create class' });
    }
  }
);

router.get('/classes/:id', authenticateJWT, [param('id').isInt({ min: 1 })], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Invalid id' });
    const { rows } = await db.query('SELECT * FROM cmdb_ci_classes WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, class: rows[0] });
  } catch (error) {
    logger.error('CMDB class get error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch class' });
  }
});

router.patch(
  '/classes/:id',
  authenticateJWT,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Admin access required' });
      const fields = ['name', 'description', 'icon', 'parent_id', 'attribute_schema'];
      const updates = [];
      const values = [];
      let idx = 1;
      if (typeof req.body.name === 'string') { updates.push(`name=$${idx++}`); values.push(req.body.name); }
      if (typeof req.body.description === 'string') { updates.push(`description=$${idx++}`); values.push(req.body.description); }
      if (typeof req.body.icon === 'string') { updates.push(`icon=$${idx++}`); values.push(req.body.icon); }
      if (req.body.parent_id === null || Number.isInteger(req.body.parent_id)) { updates.push(`parent_id=$${idx++}`); values.push(req.body.parent_id || null); }
      if (req.body.attribute_schema && typeof req.body.attribute_schema === 'object') { updates.push(`attribute_schema=$${idx++}`); values.push(req.body.attribute_schema); }
      if (updates.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });
      values.push(req.params.id);
      const { rows } = await db.query(`UPDATE cmdb_ci_classes SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${idx} RETURNING *`, values);
      res.json({ success: true, class: rows[0] });
    } catch (error) {
      logger.error('CMDB class update error:', error);
      res.status(500).json({ success: false, error: 'Failed to update class' });
    }
  }
);

router.delete('/classes/:id', authenticateJWT, [param('id').isInt({ min: 1 })], async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Admin access required' });
    await db.query('DELETE FROM cmdb_ci_classes WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    logger.error('CMDB class delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete class' });
  }
});

// ---- Configuration Items (CIs) ----
router.get(
  '/items',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 400),
  [
    query('classKey').optional().isString(),
    query('q').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const { classKey, q } = req.query;
      const limit = parseInt(req.query.limit || '50');
      const offset = parseInt(req.query.offset || '0');
      const params = [];
      const where = [];
      if (classKey) {
        where.push('ci.class_id = (SELECT id FROM cmdb_ci_classes WHERE key=$1)');
        params.push(classKey.toLowerCase());
      }
      if (q) {
        params.push(`%${q}%`);
        where.push('(ci.name ILIKE $' + params.length + ' OR ci.attributes::text ILIKE $' + params.length + ')');
      }
      const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
      params.push(limit);
      params.push(offset);
      const sql = `
        SELECT ci.*, c.key as class_key, c.name as class_name
        FROM cmdb_configuration_items ci
        JOIN cmdb_ci_classes c ON ci.class_id = c.id
        ${whereSql}
        ORDER BY ci.updated_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;
      const { rows } = await db.query(sql, params);
      res.json({ success: true, items: rows });
    } catch (error) {
      logger.error('CMDB items list error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch items' });
    }
  }
);

router.post(
  '/items',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 60),
  [
    body('classKey').isString().isLength({ min: 2 }),
    body('name').isString().isLength({ min: 1 }),
    body('attributes').optional().isObject(),
    body('lifecycleState').optional().isString(),
    body('environment').optional().isString(),
    body('ownerUserId').optional().isString(),
    body('externalRef').optional().isObject(),
  ],
  async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Admin access required' });
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array() });
      const { classKey, name, attributes, lifecycleState, environment, ownerUserId, ownerGroupId, businessCriticality, status, externalRef } = req.body;
      const { rows } = await db.query(
        `INSERT INTO cmdb_configuration_items (class_id, name, attributes, lifecycle_state, environment, owner_user_id, owner_group_id, business_criticality, status, external_ref)
         VALUES ((SELECT id FROM cmdb_ci_classes WHERE key=$1), $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [classKey.toLowerCase(), name, attributes || {}, lifecycleState || 'active', environment || null, ownerUserId || null, ownerGroupId || null, businessCriticality || null, status || 'operational', externalRef || null]
      );
      res.json({ success: true, item: rows[0] });
    } catch (error) {
      logger.error('CMDB item create error:', error);
      res.status(500).json({ success: false, error: 'Failed to create item' });
    }
  }
);

router.get('/items/:id', authenticateJWT, [param('id').isInt({ min: 1 })], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Invalid id' });
    const { rows } = await db.query(
      `SELECT ci.*, c.key as class_key, c.name as class_name
       FROM cmdb_configuration_items ci
       JOIN cmdb_ci_classes c ON ci.class_id = c.id
       WHERE ci.id=$1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, item: rows[0] });
  } catch (error) {
    logger.error('CMDB item get error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch item' });
  }
});

router.patch('/items/:id', authenticateJWT, [param('id').isInt({ min: 1 })], async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Admin access required' });
    const updates = [];
    const values = [];
    let idx = 1;
    if (typeof req.body.name === 'string') { updates.push(`name=$${idx++}`); values.push(req.body.name); }
    if (req.body.attributes && typeof req.body.attributes === 'object') { updates.push(`attributes=$${idx++}`); values.push(req.body.attributes); }
    if (typeof req.body.lifecycle_state === 'string') { updates.push(`lifecycle_state=$${idx++}`); values.push(req.body.lifecycle_state); }
    if (typeof req.body.environment === 'string') { updates.push(`environment=$${idx++}`); values.push(req.body.environment); }
    if (typeof req.body.owner_user_id === 'string' || req.body.owner_user_id === null) { updates.push(`owner_user_id=$${idx++}`); values.push(req.body.owner_user_id || null); }
    if (typeof req.body.owner_group_id === 'string' || req.body.owner_group_id === null) { updates.push(`owner_group_id=$${idx++}`); values.push(req.body.owner_group_id || null); }
    if (typeof req.body.business_criticality === 'string' || req.body.business_criticality === null) { updates.push(`business_criticality=$${idx++}`); values.push(req.body.business_criticality || null); }
    if (typeof req.body.status === 'string') { updates.push(`status=$${idx++}`); values.push(req.body.status); }
    if (req.body.external_ref && typeof req.body.external_ref === 'object') { updates.push(`external_ref=$${idx++}`); values.push(req.body.external_ref); }
    if (updates.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });
    values.push(req.params.id);
    const { rows } = await db.query(`UPDATE cmdb_configuration_items SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${idx} RETURNING *`, values);
    res.json({ success: true, item: rows[0] });
  } catch (error) {
    logger.error('CMDB item update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update item' });
  }
});

router.delete('/items/:id', authenticateJWT, [param('id').isInt({ min: 1 })], async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Admin access required' });
    await db.query('DELETE FROM cmdb_configuration_items WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    logger.error('CMDB item delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
});

// ---- Relationships ----
router.get('/items/:id/relations', authenticateJWT, [param('id').isInt({ min: 1 })], async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, s.name as source_name, t.name as target_name
       FROM cmdb_ci_relationships r
       JOIN cmdb_configuration_items s ON r.source_ci_id = s.id
       JOIN cmdb_configuration_items t ON r.target_ci_id = t.id
       WHERE r.source_ci_id = $1 OR r.target_ci_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, relations: rows });
  } catch (error) {
    logger.error('CMDB relations list error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch relations' });
  }
});

router.post(
  '/relations',
  authenticateJWT,
  [
    body('sourceCiId').isInt({ min: 1 }),
    body('targetCiId').isInt({ min: 1 }),
    body('type').isString().isLength({ min: 2 }),
    body('metadata').optional().isObject(),
  ],
  async (req, res) => {
    try {
      if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Admin access required' });
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array() });
      const { sourceCiId, targetCiId, type, metadata } = req.body;
      const { rows } = await db.query(
        `INSERT INTO cmdb_ci_relationships (source_ci_id, target_ci_id, type, metadata)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [sourceCiId, targetCiId, type, metadata || {}]
      );
      res.json({ success: true, relation: rows[0] });
    } catch (error) {
      logger.error('CMDB relation create error:', error);
      res.status(500).json({ success: false, error: 'Failed to create relation' });
    }
  }
);

router.delete('/relations/:id', authenticateJWT, [param('id').isInt({ min: 1 })], async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Admin access required' });
    await db.query('DELETE FROM cmdb_ci_relationships WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    logger.error('CMDB relation delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete relation' });
  }
});

// ---- Graph/Impact ----
router.get('/graph', authenticateJWT, [query('rootId').isInt({ min: 1 }), query('depth').optional().isInt({ min: 1, max: 5 })], async (req, res) => {
  try {
    const rootId = parseInt(req.query.rootId);
    const depth = parseInt(req.query.depth || '2');
    const visited = new Set();
    const nodes = new Map();
    const edges = [];

    async function traverse(ciId, level) {
      if (level > depth || visited.has(ciId)) return;
      visited.add(ciId);
      const { rows: ciRows } = await db.query('SELECT id, name, class_id FROM cmdb_configuration_items WHERE id=$1', [ciId]);
      if (!ciRows[0]) return;
      nodes.set(ciId, ciRows[0]);
      const { rows: relRows } = await db.query(
        `SELECT * FROM cmdb_ci_relationships WHERE source_ci_id=$1 OR target_ci_id=$1`,
        [ciId]
      );
      for (const r of relRows) {
        const otherId = r.source_ci_id === ciId ? r.target_ci_id : r.source_ci_id;
        edges.push({ id: r.id, source: r.source_ci_id, target: r.target_ci_id, type: r.type });
        await traverse(otherId, level + 1);
      }
    }

    await traverse(rootId, 1);

    res.json({ success: true, graph: { nodes: Array.from(nodes.values()), edges } });
  } catch (error) {
    logger.error('CMDB graph error:', error);
    res.status(500).json({ success: false, error: 'Failed to build graph' });
  }
});

// ---- My CIs (Orbit surface) ----
router.get('/my', authenticateJWT, createRateLimit(15 * 60 * 1000, 100), async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await db.query(
      `SELECT ci.* FROM cmdb_configuration_items ci WHERE ci.owner_user_id=$1 ORDER BY ci.updated_at DESC`,
      [userId]
    );
    res.json({ success: true, items: rows });
  } catch (error) {
    logger.error('CMDB my items error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch items' });
  }
});

export default router;