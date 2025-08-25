import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';

const router = express.Router();

// Get all cost centers
router.get('/', authenticateJWT, checkPermission('cost_centers:read'), async (req, res) => {
  try {
    const { department, status } = req.query;

    let query = `
      SELECT 
        cc.id, cc.name, cc.code, cc.department, cc.budget_limit, cc.currency,
        cc.fiscal_year, cc.manager_id, cc.approver_ids, cc.status, cc.metadata,
        cc.created_at, cc.updated_at,
        u.name as manager_name, u.email as manager_email,
        COALESCE(SUM(r.total_cost), 0) as spent_amount,
        COUNT(r.id) as request_count
      FROM department_cost_centers cc
      LEFT JOIN users u ON cc.manager_id = u.id
      LEFT JOIN service_catalog_requests r ON cc.id = r.cost_center_id 
        AND r.status NOT IN ('cancelled', 'rejected')
        AND EXTRACT(YEAR FROM r.created_at) = cc.fiscal_year
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (department) {
      paramCount++;
      query += ` AND cc.department = $${paramCount}`;
      params.push(department);
    }

    if (status) {
      paramCount++;
      query += ` AND cc.status = $${paramCount}`;
      params.push(status);
    }

    query += `
      GROUP BY cc.id, cc.name, cc.code, cc.department, cc.budget_limit, cc.currency,
               cc.fiscal_year, cc.manager_id, cc.approver_ids, cc.status, cc.metadata,
               cc.created_at, cc.updated_at, u.name, u.email
      ORDER BY cc.department, cc.name
    `;

    const result = await db.query(query, params);

    // Calculate budget utilization percentage
    const costCenters = result.rows.map((cc) => ({
      ...cc,
      budget_utilization:
        cc.budget_limit > 0 ? Math.round((parseFloat(cc.spent_amount) / cc.budget_limit) * 100) : 0,
    }));

    res.json(costCenters);
  } catch (err) {
    logger.error('Error fetching cost centers:', err);
    res.status(500).json({ error: 'Failed to fetch cost centers' });
  }
});

// Get single cost center
router.get('/:id', authenticateJWT, checkPermission('cost_centers:read'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      SELECT 
        cc.*,
        u.name as manager_name, u.email as manager_email,
        COALESCE(SUM(r.total_cost), 0) as spent_amount,
        COUNT(r.id) as request_count
      FROM department_cost_centers cc
      LEFT JOIN users u ON cc.manager_id = u.id
      LEFT JOIN service_catalog_requests r ON cc.id = r.cost_center_id 
        AND r.status NOT IN ('cancelled', 'rejected')
        AND EXTRACT(YEAR FROM r.created_at) = cc.fiscal_year
      WHERE cc.id = $1
      GROUP BY cc.id, u.name, u.email
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cost center not found' });
    }

    const costCenter = result.rows[0];
    costCenter.budget_utilization =
      costCenter.budget_limit > 0
        ? Math.round((parseFloat(costCenter.spent_amount) / costCenter.budget_limit) * 100)
        : 0;

    res.json(costCenter);
  } catch (err) {
    logger.error('Error fetching cost center:', err);
    res.status(500).json({ error: 'Failed to fetch cost center' });
  }
});

// Create cost center
router.post('/', authenticateJWT, checkPermission('cost_centers:write'), async (req, res) => {
  const {
    name,
    code,
    department,
    budget_limit,
    currency,
    fiscal_year,
    manager_id,
    approver_ids,
    metadata,
  } = req.body;

  try {
    const result = await db.query(
      `
      INSERT INTO department_cost_centers (
        name, code, department, budget_limit, currency, fiscal_year,
        manager_id, approver_ids, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9)
      RETURNING *
    `,
      [
        name,
        code,
        department,
        budget_limit || 0,
        currency || 'USD',
        fiscal_year || new Date().getFullYear(),
        manager_id,
        JSON.stringify(approver_ids || []),
        JSON.stringify(metadata || {}),
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating cost center:', err);
    res.status(500).json({ error: 'Failed to create cost center' });
  }
});

// Update cost center
router.put('/:id', authenticateJWT, checkPermission('cost_centers:write'), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    code,
    department,
    budget_limit,
    currency,
    fiscal_year,
    manager_id,
    approver_ids,
    status,
    metadata,
  } = req.body;

  try {
    const result = await db.query(
      `
      UPDATE department_cost_centers 
      SET name = $1, code = $2, department = $3, budget_limit = $4, currency = $5,
          fiscal_year = $6, manager_id = $7, approver_ids = $8, status = $9,
          metadata = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `,
      [
        name,
        code,
        department,
        budget_limit,
        currency,
        fiscal_year,
        manager_id,
        JSON.stringify(approver_ids || []),
        status,
        JSON.stringify(metadata || {}),
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cost center not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error updating cost center:', err);
    res.status(500).json({ error: 'Failed to update cost center' });
  }
});

// Delete cost center
router.delete('/:id', authenticateJWT, checkPermission('cost_centers:write'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      UPDATE department_cost_centers 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cost center not found' });
    }

    res.json({ message: 'Cost center deleted successfully' });
  } catch (err) {
    logger.error('Error deleting cost center:', err);
    res.status(500).json({ error: 'Failed to delete cost center' });
  }
});

// Get cost center spending analytics
router.get(
  '/:id/analytics',
  authenticateJWT,
  checkPermission('cost_centers:read'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const analytics = await Promise.all([
        // Monthly spending trend
        db.query(
          `
        SELECT 
          DATE_TRUNC('month', r.created_at) as month,
          SUM(r.total_cost) as total_spent,
          COUNT(r.id) as request_count
        FROM service_catalog_requests r
        WHERE r.cost_center_id = $1 
          AND r.status NOT IN ('cancelled', 'rejected')
          AND r.created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', r.created_at)
        ORDER BY month
      `,
          [id],
        ),

        // Spending by category
        db.query(
          `
        SELECT 
          c.name as category_name,
          SUM(r.total_cost) as total_spent,
          COUNT(r.id) as request_count
        FROM service_catalog_requests r
        JOIN service_catalog_items i ON r.item_id = i.id
        JOIN service_catalog_categories c ON i.category_id = c.id
        WHERE r.cost_center_id = $1 
          AND r.status NOT IN ('cancelled', 'rejected')
          AND r.created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY c.id, c.name
        ORDER BY total_spent DESC
      `,
          [id],
        ),

        // Top requested items
        db.query(
          `
        SELECT 
          i.name as item_name,
          SUM(r.quantity) as total_quantity,
          SUM(r.total_cost) as total_spent,
          COUNT(r.id) as request_count
        FROM service_catalog_requests r
        JOIN service_catalog_items i ON r.item_id = i.id
        WHERE r.cost_center_id = $1 
          AND r.status NOT IN ('cancelled', 'rejected')
          AND r.created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY i.id, i.name
        ORDER BY total_spent DESC
        LIMIT 10
      `,
          [id],
        ),

        // Budget utilization by quarter
        db.query(
          `
        SELECT 
          EXTRACT(QUARTER FROM r.created_at) as quarter,
          EXTRACT(YEAR FROM r.created_at) as year,
          SUM(r.total_cost) as spent_amount,
          cc.budget_limit / 4 as quarterly_budget
        FROM service_catalog_requests r
        JOIN department_cost_centers cc ON r.cost_center_id = cc.id
        WHERE r.cost_center_id = $1 
          AND r.status NOT IN ('cancelled', 'rejected')
          AND EXTRACT(YEAR FROM r.created_at) = cc.fiscal_year
        GROUP BY EXTRACT(QUARTER FROM r.created_at), EXTRACT(YEAR FROM r.created_at), cc.budget_limit
        ORDER BY year, quarter
      `,
          [id],
        ),
      ]);

      res.json({
        monthlyTrends: analytics[0].rows,
        spendingByCategory: analytics[1].rows,
        topRequestedItems: analytics[2].rows,
        quarterlyUtilization: analytics[3].rows,
      });
    } catch (err) {
      logger.error('Error fetching cost center analytics:', err);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },
);

// Get budget alerts
router.get(
  '/:id/alerts',
  authenticateJWT,
  checkPermission('cost_centers:read'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.query(
        `
      SELECT 
        cc.id, cc.name, cc.budget_limit, cc.currency,
        COALESCE(SUM(r.total_cost), 0) as spent_amount,
        ROUND((COALESCE(SUM(r.total_cost), 0) / NULLIF(cc.budget_limit, 0)) * 100, 2) as utilization_percentage
      FROM department_cost_centers cc
      LEFT JOIN service_catalog_requests r ON cc.id = r.cost_center_id 
        AND r.status NOT IN ('cancelled', 'rejected')
        AND EXTRACT(YEAR FROM r.created_at) = cc.fiscal_year
      WHERE cc.id = $1
      GROUP BY cc.id, cc.name, cc.budget_limit, cc.currency
    `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cost center not found' });
      }

      const costCenter = result.rows[0];
      const alerts = [];

      // Generate alerts based on utilization
      if (costCenter.utilization_percentage >= 100) {
        alerts.push({
          type: 'critical',
          message: 'Budget exceeded',
          details: `Budget utilization is at ${costCenter.utilization_percentage}%`,
        });
      } else if (costCenter.utilization_percentage >= 90) {
        alerts.push({
          type: 'warning',
          message: 'Budget almost exhausted',
          details: `Budget utilization is at ${costCenter.utilization_percentage}%`,
        });
      } else if (costCenter.utilization_percentage >= 75) {
        alerts.push({
          type: 'info',
          message: 'High budget utilization',
          details: `Budget utilization is at ${costCenter.utilization_percentage}%`,
        });
      }

      res.json({
        cost_center: costCenter,
        alerts,
      });
    } catch (err) {
      logger.error('Error fetching budget alerts:', err);
      res.status(500).json({ error: 'Failed to fetch budget alerts' });
    }
  },
);

// Get cost center summary dashboard
router.get(
  '/analytics/dashboard',
  authenticateJWT,
  checkPermission('cost_centers:read'),
  async (req, res) => {
    try {
      const analytics = await Promise.all([
        // Budget utilization overview
        db.query(`
        SELECT 
          cc.department,
          COUNT(cc.id) as cost_center_count,
          SUM(cc.budget_limit) as total_budget,
          SUM(COALESCE(spent.amount, 0)) as total_spent,
          ROUND(AVG(COALESCE(spent.amount, 0) / NULLIF(cc.budget_limit, 0)) * 100, 2) as avg_utilization
        FROM department_cost_centers cc
        LEFT JOIN (
          SELECT 
            cost_center_id,
            SUM(total_cost) as amount
          FROM service_catalog_requests
          WHERE status NOT IN ('cancelled', 'rejected')
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
          GROUP BY cost_center_id
        ) spent ON cc.id = spent.cost_center_id
        WHERE cc.status = 'active'
        GROUP BY cc.department
        ORDER BY total_budget DESC
      `),

        // Budget alerts summary
        db.query(`
        SELECT 
          CASE 
            WHEN utilization.percentage >= 100 THEN 'over_budget'
            WHEN utilization.percentage >= 90 THEN 'near_budget'
            WHEN utilization.percentage >= 75 THEN 'high_usage'
            ELSE 'normal'
          END as alert_level,
          COUNT(*) as count
        FROM (
          SELECT 
            cc.id,
            ROUND((COALESCE(SUM(r.total_cost), 0) / NULLIF(cc.budget_limit, 0)) * 100, 2) as percentage
          FROM department_cost_centers cc
          LEFT JOIN service_catalog_requests r ON cc.id = r.cost_center_id 
            AND r.status NOT IN ('cancelled', 'rejected')
            AND EXTRACT(YEAR FROM r.created_at) = cc.fiscal_year
          WHERE cc.status = 'active'
          GROUP BY cc.id, cc.budget_limit
        ) utilization
        GROUP BY 
          CASE 
            WHEN utilization.percentage >= 100 THEN 'over_budget'
            WHEN utilization.percentage >= 90 THEN 'near_budget'
            WHEN utilization.percentage >= 75 THEN 'high_usage'
            ELSE 'normal'
          END
      `),

        // Top spending cost centers
        db.query(`
        SELECT 
          cc.name,
          cc.department,
          cc.budget_limit,
          COALESCE(SUM(r.total_cost), 0) as spent_amount,
          ROUND((COALESCE(SUM(r.total_cost), 0) / NULLIF(cc.budget_limit, 0)) * 100, 2) as utilization_percentage
        FROM department_cost_centers cc
        LEFT JOIN service_catalog_requests r ON cc.id = r.cost_center_id 
          AND r.status NOT IN ('cancelled', 'rejected')
          AND EXTRACT(YEAR FROM r.created_at) = cc.fiscal_year
        WHERE cc.status = 'active'
        GROUP BY cc.id, cc.name, cc.department, cc.budget_limit
        ORDER BY spent_amount DESC
        LIMIT 10
      `),

        // Monthly spending trends
        db.query(`
        SELECT 
          DATE_TRUNC('month', r.created_at) as month,
          SUM(r.total_cost) as total_spent,
          COUNT(DISTINCT r.cost_center_id) as active_cost_centers
        FROM service_catalog_requests r
        WHERE r.status NOT IN ('cancelled', 'rejected')
          AND r.created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', r.created_at)
        ORDER BY month
      `),
      ]);

      res.json({
        departmentOverview: analytics[0].rows,
        alertsSummary: analytics[1].rows,
        topSpenders: analytics[2].rows,
        monthlyTrends: analytics[3].rows,
      });
    } catch (err) {
      logger.error('Error fetching cost center dashboard:', err);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  },
);

export default router;
