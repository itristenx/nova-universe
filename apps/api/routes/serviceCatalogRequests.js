import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';

const router = express.Router();

// Get all requests with filtering and pagination
router.get('/', authenticateJWT, checkPermission('requests:read'), async (req, res) => {
  try {
    const {
      status,
      item_id,
      requested_by,
      cost_center_id,
      priority,
      limit = 50,
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = req.query;

    let query = `
      SELECT 
        r.id, r.request_number, r.item_id, r.quantity, r.total_cost,
        r.recurring_cost, r.currency, r.requested_by, r.requested_for,
        r.cost_center_id, r.department, r.location, r.priority, r.status,
        r.variables, r.justification, r.delivery_date, r.notes,
        r.approval_status, r.created_at, r.updated_at,
        i.name as item_name, i.short_description as item_description,
        i.price as item_price, i.recurring_price as item_recurring_price,
        c.name as category_name,
        u.name as requester_name, u.email as requester_email,
        uf.name as requestee_name, uf.email as requestee_email,
        cc.name as cost_center_name, cc.budget_limit as cost_center_budget
      FROM service_catalog_requests r
      LEFT JOIN service_catalog_items i ON r.item_id = i.id
      LEFT JOIN service_catalog_categories c ON i.category_id = c.id
      LEFT JOIN users u ON r.requested_by = u.id
      LEFT JOIN users uf ON r.requested_for = uf.id
      LEFT JOIN department_cost_centers cc ON r.cost_center_id = cc.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
    }

    if (item_id) {
      paramCount++;
      query += ` AND r.item_id = $${paramCount}`;
      params.push(item_id);
    }

    if (requested_by) {
      paramCount++;
      query += ` AND r.requested_by = $${paramCount}`;
      params.push(requested_by);
    }

    if (cost_center_id) {
      paramCount++;
      query += ` AND r.cost_center_id = $${paramCount}`;
      params.push(cost_center_id);
    }

    if (priority) {
      paramCount++;
      query += ` AND r.priority = $${paramCount}`;
      params.push(priority);
    }

    // Add ordering
    const validSortFields = ['created_at', 'updated_at', 'priority', 'total_cost', 'status'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY r.${sortField} ${sortDirection}`;

    // Add pagination
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
      FROM service_catalog_requests r
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND r.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (item_id) {
      countParamCount++;
      countQuery += ` AND r.item_id = $${countParamCount}`;
      countParams.push(item_id);
    }

    if (requested_by) {
      countParamCount++;
      countQuery += ` AND r.requested_by = $${countParamCount}`;
      countParams.push(requested_by);
    }

    if (cost_center_id) {
      countParamCount++;
      countQuery += ` AND r.cost_center_id = $${countParamCount}`;
      countParams.push(cost_center_id);
    }

    if (priority) {
      countParamCount++;
      countQuery += ` AND r.priority = $${countParamCount}`;
      countParams.push(priority);
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      requests: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    logger.error('Error fetching catalog requests:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get single request by ID
router.get('/:id', authenticateJWT, checkPermission('requests:read'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      SELECT 
        r.*,
        i.name as item_name, i.short_description as item_description,
        i.price as item_price, i.recurring_price as item_recurring_price,
        c.name as category_name,
        u.name as requester_name, u.email as requester_email,
        uf.name as requestee_name, uf.email as requestee_email,
        cc.name as cost_center_name, cc.budget_limit as cost_center_budget
      FROM service_catalog_requests r
      LEFT JOIN service_catalog_items i ON r.item_id = i.id
      LEFT JOIN service_catalog_categories c ON i.category_id = c.id
      LEFT JOIN users u ON r.requested_by = u.id
      LEFT JOIN users uf ON r.requested_for = uf.id
      LEFT JOIN department_cost_centers cc ON r.cost_center_id = cc.id
      WHERE r.id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error fetching catalog request:', err);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Create new request
router.post('/', authenticateJWT, checkPermission('requests:write'), async (req, res) => {
  const requestData = req.body;
  try {
    const {
      item_id,
      quantity,
      requested_for,
      cost_center_id,
      department,
      location,
      priority,
      variables,
      justification,
      delivery_date,
      notes,
    } = requestData;

    // Generate request number
    const requestNumber = await generateRequestNumber();

    // Get item details for cost calculation
    const itemResult = await db.query(
      `
      SELECT price, recurring_price, currency, approval_required
      FROM service_catalog_items 
      WHERE id = $1 AND status = 'active'
    `,
      [item_id],
    );

    if (itemResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or inactive item' });
    }

    const item = itemResult.rows[0];
    const totalCost = (item.price || 0) * (quantity || 1);
    const recurringCost = (item.recurring_price || 0) * (quantity || 1);

    const result = await db.query(
      `
      INSERT INTO service_catalog_requests (
        request_number, item_id, quantity, total_cost, recurring_cost, currency,
        requested_by, requested_for, cost_center_id, department, location,
        priority, status, variables, justification, delivery_date, notes,
        approval_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      RETURNING *
    `,
      [
        requestNumber,
        item_id,
        quantity || 1,
        totalCost,
        recurringCost,
        item.currency || 'USD',
        req.user?.id,
        requested_for || req.user?.id,
        cost_center_id,
        department,
        location,
        priority || 'medium',
        'pending',
        JSON.stringify(variables || {}),
        justification,
        delivery_date,
        notes,
        item.approval_required ? 'pending' : 'approved',
      ],
    );

    // If approval is required, trigger approval workflow
    if (item.approval_required) {
      await initiateApprovalWorkflow(result.rows[0].id, item_id, req.user?.id);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating catalog request:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Update request
router.put('/:id', authenticateJWT, checkPermission('requests:write'), async (req, res) => {
  const { id } = req.params;
  const requestData = req.body;
  try {
    const {
      quantity,
      requested_for,
      cost_center_id,
      department,
      location,
      priority,
      variables,
      justification,
      delivery_date,
      notes,
      status,
    } = requestData;

    // Recalculate costs if quantity changed
    let updateFields = `
      quantity = $1, requested_for = $2, cost_center_id = $3, department = $4,
      location = $5, priority = $6, variables = $7, justification = $8,
      delivery_date = $9, notes = $10, status = $11, updated_at = CURRENT_TIMESTAMP
    `;
    let params = [
      quantity,
      requested_for,
      cost_center_id,
      department,
      location,
      priority,
      JSON.stringify(variables || {}),
      justification,
      delivery_date,
      notes,
      status,
    ];

    if (quantity) {
      // Get item price for recalculation
      const itemResult = await db.query(
        `
        SELECT i.price, i.recurring_price, i.currency
        FROM service_catalog_items i
        JOIN service_catalog_requests r ON i.id = r.item_id
        WHERE r.id = $1
      `,
        [id],
      );

      if (itemResult.rows.length > 0) {
        const item = itemResult.rows[0];
        const totalCost = (item.price || 0) * quantity;
        const recurringCost = (item.recurring_price || 0) * quantity;

        updateFields = `
          quantity = $1, total_cost = $12, recurring_cost = $13,
          requested_for = $2, cost_center_id = $3, department = $4,
          location = $5, priority = $6, variables = $7, justification = $8,
          delivery_date = $9, notes = $10, status = $11, updated_at = CURRENT_TIMESTAMP
        `;
        params.push(totalCost, recurringCost);
      }
    }

    const result = await db.query(
      `
      UPDATE service_catalog_requests SET ${updateFields}
      WHERE id = $${params.length + 1}
      RETURNING *
    `,
      [...params, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error updating catalog request:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Cancel request
router.delete('/:id', authenticateJWT, checkPermission('requests:write'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      UPDATE service_catalog_requests 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status IN ('pending', 'in_progress')
      RETURNING id
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or cannot be cancelled' });
    }

    res.json({ message: 'Request cancelled successfully' });
  } catch (err) {
    logger.error('Error cancelling catalog request:', err);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

// Get request analytics
router.get(
  '/analytics/dashboard',
  authenticateJWT,
  checkPermission('requests:read'),
  async (req, res) => {
    try {
      const analytics = await Promise.all([
        // Total requests by status
        db.query(`
        SELECT status, COUNT(*) as count
        FROM service_catalog_requests
        GROUP BY status
      `),

        // Requests by month
        db.query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count,
          SUM(total_cost) as total_cost
        FROM service_catalog_requests
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `),

        // Top requested items
        db.query(`
        SELECT 
          i.name,
          COUNT(r.id) as request_count,
          SUM(r.total_cost) as total_cost
        FROM service_catalog_requests r
        JOIN service_catalog_items i ON r.item_id = i.id
        WHERE r.created_at >= CURRENT_DATE - INTERVAL '3 months'
        GROUP BY i.id, i.name
        ORDER BY request_count DESC
        LIMIT 10
      `),

        // Cost by department
        db.query(`
        SELECT 
          department,
          COUNT(*) as request_count,
          SUM(total_cost) as total_cost,
          AVG(total_cost) as avg_cost
        FROM service_catalog_requests
        WHERE created_at >= CURRENT_DATE - INTERVAL '3 months'
          AND department IS NOT NULL
        GROUP BY department
        ORDER BY total_cost DESC
      `),
      ]);

      res.json({
        statusCounts: analytics[0].rows,
        monthlyTrends: analytics[1].rows,
        topItems: analytics[2].rows,
        departmentCosts: analytics[3].rows,
      });
    } catch (err) {
      logger.error('Error fetching request analytics:', err);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },
);

// Helper functions
async function generateRequestNumber() {
  const year = new Date().getFullYear();
  const result = await db.query(
    `
    SELECT COUNT(*) as count
    FROM service_catalog_requests
    WHERE EXTRACT(YEAR FROM created_at) = $1
  `,
    [year],
  );

  const count = parseInt(result.rows[0].count) + 1;
  return `REQ-${year}-${count.toString().padStart(6, '0')}`;
}

async function initiateApprovalWorkflow(requestId, itemId, _userId) {
  try {
    // Find applicable approval workflow
    const workflowResult = await db.query(`
      SELECT id, steps FROM approval_workflows
      WHERE trigger_conditions @> '{"item_id": "${itemId}"}'
        OR trigger_conditions @> '{"all_items": true}'
      ORDER BY priority DESC
      LIMIT 1
    `);

    if (workflowResult.rows.length > 0) {
      const workflow = workflowResult.rows[0];

      // Create approval instance
      await db.query(
        `
        INSERT INTO approval_instances (
          workflow_id, request_id, current_step, status, metadata
        ) VALUES ($1, $2, 1, 'pending', '{}')
      `,
        [workflow.id, requestId],
      );
    }
  } catch (err) {
    logger.error('Error initiating approval workflow:', err);
  }
}

export default router;
