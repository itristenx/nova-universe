import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';

const router = express.Router();

// Categories
router.get('/categories', authenticateJWT, checkPermission('catalog:read'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, icon, order_index, status, item_count, created_at, updated_at
      FROM service_catalog_categories 
      WHERE status = 'active'
      ORDER BY order_index, name
    `);
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching catalog categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', authenticateJWT, checkPermission('catalog:write'), async (req, res) => {
  const { name, description, icon, order_index } = req.body;
  try {
    const result = await db.query(
      `
      INSERT INTO service_catalog_categories (name, description, icon, order_index, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING id, name, description, icon, order_index, status, item_count, created_at, updated_at
    `,
      [name, description, icon, order_index || 0],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating catalog category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put(
  '/categories/:id',
  authenticateJWT,
  checkPermission('catalog:write'),
  async (req, res) => {
    const { id } = req.params;
    const { name, description, icon, order_index, status } = req.body;
    try {
      const result = await db.query(
        `
      UPDATE service_catalog_categories 
      SET name = $1, description = $2, icon = $3, order_index = $4, status = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, name, description, icon, order_index, status, item_count, created_at, updated_at
    `,
        [name, description, icon, order_index, status, id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error updating catalog category:', err);
      res.status(500).json({ error: 'Failed to update category' });
    }
  },
);

// Catalog Items
router.get('/items', authenticateJWT, checkPermission('catalog:read'), async (req, res) => {
  try {
    const { category_id, status, search, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT 
        i.id, i.name, i.short_description, i.description, i.category_id, i.status,
        i.price, i.recurring_price, i.currency, i.pricing_model, i.billing_type,
        i.license_type, i.license_cost_per_unit, i.base_cost, i.vendor_cost,
        i.markup_percentage, i.approval_required, i.sla_hours, i.variables,
        i.available_for, i.departments, i.locations, i.tags, i.order_count,
        i.created_by, i.updated_by, i.created_at, i.updated_at, i.version,
        c.name as category_name, c.icon as category_icon
      FROM service_catalog_items i
      LEFT JOIN service_catalog_categories c ON i.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (category_id) {
      paramCount++;
      query += ` AND i.category_id = $${paramCount}`;
      params.push(category_id);
    }

    if (status) {
      paramCount++;
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
    } else {
      query += ` AND i.status = 'active'`;
    }

    if (search) {
      paramCount++;
      query += ` AND (i.name ILIKE $${paramCount} OR i.description ILIKE $${paramCount} OR i.short_description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY i.order_count DESC, i.name`;

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));

    const result = await db.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM service_catalog_items i
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (category_id) {
      countParamCount++;
      countQuery += ` AND i.category_id = $${countParamCount}`;
      countParams.push(category_id);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND i.status = $${countParamCount}`;
      countParams.push(status);
    } else {
      countQuery += ` AND i.status = 'active'`;
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (i.name ILIKE $${countParamCount} OR i.description ILIKE $${countParamCount} OR i.short_description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      items: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    logger.error('Error fetching catalog items:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/items/:id', authenticateJWT, checkPermission('catalog:read'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      SELECT 
        i.*,
        c.name as category_name, c.icon as category_icon
      FROM service_catalog_items i
      LEFT JOIN service_catalog_categories c ON i.category_id = c.id
      WHERE i.id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error fetching catalog item:', err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/items', authenticateJWT, checkPermission('catalog:write'), async (req, res) => {
  const itemData = req.body;
  try {
    const {
      name,
      short_description,
      description,
      category_id,
      price,
      recurring_price,
      currency,
      pricing_model,
      billing_type,
      license_type,
      license_cost_per_unit,
      base_cost,
      vendor_cost,
      markup_percentage,
      approval_required,
      sla_hours,
      variables,
      available_for,
      departments,
      locations,
      tags,
    } = itemData;

    const result = await db.query(
      `
      INSERT INTO service_catalog_items (
        name, short_description, description, category_id, price, recurring_price,
        currency, pricing_model, billing_type, license_type, license_cost_per_unit,
        base_cost, vendor_cost, markup_percentage, approval_required, sla_hours,
        variables, available_for, departments, locations, tags, created_by, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, 'active'
      )
      RETURNING *
    `,
      [
        name,
        short_description,
        description,
        category_id,
        price,
        recurring_price,
        currency || 'USD',
        pricing_model || 'fixed',
        billing_type || 'one_time',
        license_type,
        license_cost_per_unit,
        base_cost || 0,
        vendor_cost,
        markup_percentage,
        approval_required || false,
        sla_hours,
        JSON.stringify(variables || []),
        available_for || ['*'],
        departments || ['*'],
        locations || ['*'],
        tags || [],
        req.user?.id,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating catalog item:', err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/items/:id', authenticateJWT, checkPermission('catalog:write'), async (req, res) => {
  const { id } = req.params;
  const itemData = req.body;
  try {
    const {
      name,
      short_description,
      description,
      category_id,
      price,
      recurring_price,
      currency,
      pricing_model,
      billing_type,
      license_type,
      license_cost_per_unit,
      base_cost,
      vendor_cost,
      markup_percentage,
      approval_required,
      sla_hours,
      variables,
      available_for,
      departments,
      locations,
      tags,
      status,
    } = itemData;

    const result = await db.query(
      `
      UPDATE service_catalog_items SET
        name = $1, short_description = $2, description = $3, category_id = $4,
        price = $5, recurring_price = $6, currency = $7, pricing_model = $8,
        billing_type = $9, license_type = $10, license_cost_per_unit = $11,
        base_cost = $12, vendor_cost = $13, markup_percentage = $14,
        approval_required = $15, sla_hours = $16, variables = $17,
        available_for = $18, departments = $19, locations = $20, tags = $21,
        status = $22, updated_by = $23, updated_at = CURRENT_TIMESTAMP,
        version = version + 1
      WHERE id = $24
      RETURNING *
    `,
      [
        name,
        short_description,
        description,
        category_id,
        price,
        recurring_price,
        currency,
        pricing_model,
        billing_type,
        license_type,
        license_cost_per_unit,
        base_cost,
        vendor_cost,
        markup_percentage,
        approval_required,
        sla_hours,
        JSON.stringify(variables || []),
        available_for,
        departments,
        locations,
        tags,
        status || 'active',
        req.user?.id,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error updating catalog item:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/items/:id', authenticateJWT, checkPermission('catalog:write'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      UPDATE service_catalog_items 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    logger.error('Error deleting catalog item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
