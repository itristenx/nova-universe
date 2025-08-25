import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';

const router = express.Router();

// ================== APPROVAL WORKFLOWS ==================

// Get all approval workflows
router.get('/workflows', authenticateJWT, checkPermission('approvals:read'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, trigger_conditions, steps, is_active, priority,
             created_by, created_at, updated_at
      FROM approval_workflows
      WHERE is_active = true
      ORDER BY priority DESC, name
    `);
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching approval workflows:', err);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Get single workflow
router.get(
  '/workflows/:id',
  authenticateJWT,
  checkPermission('approvals:read'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.query(
        `
      SELECT w.*,
        u.name as created_by_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ai.id,
              'request_id', ai.request_id,
              'current_step', ai.current_step,
              'status', ai.status,
              'created_at', ai.created_at
            )
          ) FILTER (WHERE ai.id IS NOT NULL), 
          '[]'::json
        ) as active_instances
      FROM approval_workflows w
      LEFT JOIN users u ON w.created_by = u.id
      LEFT JOIN approval_instances ai ON w.id = ai.workflow_id AND ai.status IN ('pending', 'in_progress')
      WHERE w.id = $1
      GROUP BY w.id, u.name
    `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error fetching workflow:', err);
      res.status(500).json({ error: 'Failed to fetch workflow' });
    }
  },
);

// Create workflow
router.post('/workflows', authenticateJWT, checkPermission('approvals:write'), async (req, res) => {
  const { name, description, trigger_conditions, steps, priority } = req.body;
  try {
    const result = await db.query(
      `
      INSERT INTO approval_workflows (
        name, description, trigger_conditions, steps, is_active, priority, created_by
      ) VALUES ($1, $2, $3, $4, true, $5, $6)
      RETURNING *
    `,
      [
        name,
        description,
        JSON.stringify(trigger_conditions || {}),
        JSON.stringify(steps || []),
        priority || 1,
        req.user?.id,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating workflow:', err);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Update workflow
router.put(
  '/workflows/:id',
  authenticateJWT,
  checkPermission('approvals:write'),
  async (req, res) => {
    const { id } = req.params;
    const { name, description, trigger_conditions, steps, is_active, priority } = req.body;
    try {
      const result = await db.query(
        `
      UPDATE approval_workflows 
      SET name = $1, description = $2, trigger_conditions = $3, steps = $4, 
          is_active = $5, priority = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `,
        [
          name,
          description,
          JSON.stringify(trigger_conditions || {}),
          JSON.stringify(steps || []),
          is_active,
          priority,
          id,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error updating workflow:', err);
      res.status(500).json({ error: 'Failed to update workflow' });
    }
  },
);

// ================== APPROVAL INSTANCES ==================

// Get approval instances (for approvers)
router.get('/instances', authenticateJWT, checkPermission('approvals:read'), async (req, res) => {
  try {
    const { status, assigned_to, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        ai.id, ai.workflow_id, ai.request_id, ai.current_step, ai.status,
        ai.metadata, ai.created_at, ai.updated_at,
        w.name as workflow_name, w.steps,
        r.request_number, r.item_id, r.quantity, r.total_cost,
        r.requested_by, r.justification,
        i.name as item_name, i.short_description as item_description,
        u.name as requester_name, u.email as requester_email
      FROM approval_instances ai
      JOIN approval_workflows w ON ai.workflow_id = w.id
      JOIN service_catalog_requests r ON ai.request_id = r.id
      JOIN service_catalog_items i ON r.item_id = i.id
      JOIN users u ON r.requested_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND ai.status = $${paramCount}`;
      params.push(status);
    }

    // If assigned_to is provided, check if current user is an approver for current step
    if (assigned_to) {
      paramCount++;
      query += ` AND (
        w.steps->((ai.current_step - 1)::int)->'approvers' @> $${paramCount}::jsonb
        OR w.steps->((ai.current_step - 1)::int)->'approver_roles' ?| 
          (SELECT array_agg(r.name) FROM rbac_user_role_assignments ura 
           JOIN rbac_roles r ON ura.role_id = r.id 
           WHERE ura.user_id = $${paramCount}::uuid)
      )`;
      params.push(`"${assigned_to}"`);
    }

    query += ` ORDER BY ai.created_at DESC`;

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching approval instances:', err);
    res.status(500).json({ error: 'Failed to fetch approval instances' });
  }
});

// Get single approval instance
router.get(
  '/instances/:id',
  authenticateJWT,
  checkPermission('approvals:read'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.query(
        `
      SELECT 
        ai.*,
        w.name as workflow_name, w.steps,
        r.request_number, r.item_id, r.quantity, r.total_cost,
        r.requested_by, r.justification, r.variables as request_variables,
        i.name as item_name, i.description as item_description,
        u.name as requester_name, u.email as requester_email
      FROM approval_instances ai
      JOIN approval_workflows w ON ai.workflow_id = w.id
      JOIN service_catalog_requests r ON ai.request_id = r.id
      JOIN service_catalog_items i ON r.item_id = i.id
      JOIN users u ON r.requested_by = u.id
      WHERE ai.id = $1
    `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Approval instance not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error fetching approval instance:', err);
      res.status(500).json({ error: 'Failed to fetch approval instance' });
    }
  },
);

// Approve/Reject approval step
router.post(
  '/instances/:id/action',
  authenticateJWT,
  checkPermission('approvals:write'),
  async (req, res) => {
    const { id } = req.params;
    const { action, comment } = req.body; // action: 'approve' | 'reject'

    try {
      // Get current approval instance
      const instanceResult = await db.query(
        `
      SELECT ai.*, w.steps, r.id as request_id
      FROM approval_instances ai
      JOIN approval_workflows w ON ai.workflow_id = w.id
      JOIN service_catalog_requests r ON ai.request_id = r.id
      WHERE ai.id = $1 AND ai.status IN ('pending', 'in_progress')
    `,
        [id],
      );

      if (instanceResult.rows.length === 0) {
        return res.status(404).json({ error: 'Approval instance not found or already completed' });
      }

      const instance = instanceResult.rows[0];
      const currentStepIndex = instance.current_step - 1;
      const currentStep = instance.steps[currentStepIndex];

      if (!currentStep) {
        return res.status(400).json({ error: 'Invalid approval step' });
      }

      // Verify user can approve this step
      const canApprove = await verifyApprovalPermission(req.user?.id, currentStep);
      if (!canApprove) {
        return res.status(403).json({ error: 'You are not authorized to approve this step' });
      }

      // Record the approval action
      const actionMetadata = {
        ...instance.metadata,
        actions: [
          ...(instance.metadata?.actions || []),
          {
            step: instance.current_step,
            action,
            comment,
            approved_by: req.user?.id,
            approved_at: new Date().toISOString(),
          },
        ],
      };

      if (action === 'reject') {
        // Reject the entire approval
        await db.query(
          `
        UPDATE approval_instances 
        SET status = 'rejected', metadata = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
          [JSON.stringify(actionMetadata), id],
        );

        // Update request status
        await db.query(
          `
        UPDATE service_catalog_requests 
        SET approval_status = 'rejected', status = 'rejected', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
          [instance.request_id],
        );

        res.json({ message: 'Request rejected', status: 'rejected' });
      } else {
        // Check if this is the last step
        const isLastStep = currentStepIndex === instance.steps.length - 1;

        if (isLastStep) {
          // Approve the entire request
          await db.query(
            `
          UPDATE approval_instances 
          SET status = 'approved', metadata = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `,
            [JSON.stringify(actionMetadata), id],
          );

          // Update request status
          await db.query(
            `
          UPDATE service_catalog_requests 
          SET approval_status = 'approved', status = 'approved', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
            [instance.request_id],
          );

          res.json({ message: 'Request fully approved', status: 'approved' });
        } else {
          // Move to next step
          const nextStep = instance.current_step + 1;
          await db.query(
            `
          UPDATE approval_instances 
          SET current_step = $1, metadata = $2, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `,
            [nextStep, JSON.stringify(actionMetadata), id],
          );

          res.json({
            message: 'Step approved, moved to next step',
            status: 'in_progress',
            current_step: nextStep,
          });
        }
      }
    } catch (err) {
      logger.error('Error processing approval action:', err);
      res.status(500).json({ error: 'Failed to process approval action' });
    }
  },
);

// Get approval analytics
router.get(
  '/analytics/dashboard',
  authenticateJWT,
  checkPermission('approvals:read'),
  async (req, res) => {
    try {
      const analytics = await Promise.all([
        // Pending approvals by workflow
        db.query(`
        SELECT 
          w.name as workflow_name,
          COUNT(ai.id) as pending_count
        FROM approval_workflows w
        LEFT JOIN approval_instances ai ON w.id = ai.workflow_id AND ai.status = 'pending'
        WHERE w.is_active = true
        GROUP BY w.id, w.name
        ORDER BY pending_count DESC
      `),

        // Approval time metrics
        db.query(`
        SELECT 
          w.name as workflow_name,
          AVG(EXTRACT(EPOCH FROM (ai.updated_at - ai.created_at))/3600) as avg_hours,
          COUNT(ai.id) as completed_count
        FROM approval_instances ai
        JOIN approval_workflows w ON ai.workflow_id = w.id
        WHERE ai.status IN ('approved', 'rejected')
          AND ai.created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY w.id, w.name
        ORDER BY avg_hours
      `),

        // Approval status distribution
        db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM approval_instances
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY status
      `),

        // Top approvers
        db.query(`
        SELECT 
          u.name as approver_name,
          COUNT(*) as approvals_count
        FROM approval_instances ai,
             jsonb_array_elements(ai.metadata->'actions') action
        JOIN users u ON (action->>'approved_by')::uuid = u.id
        WHERE ai.updated_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY u.id, u.name
        ORDER BY approvals_count DESC
        LIMIT 10
      `),
      ]);

      res.json({
        pendingByWorkflow: analytics[0].rows,
        approvalTimes: analytics[1].rows,
        statusDistribution: analytics[2].rows,
        topApprovers: analytics[3].rows,
      });
    } catch (err) {
      logger.error('Error fetching approval analytics:', err);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },
);

// Helper function to verify approval permission
async function verifyApprovalPermission(userId, step) {
  try {
    // Check if user is directly listed as approver
    if (step.approvers && step.approvers.includes(userId)) {
      return true;
    }

    // Check if user has required approval roles
    if (step.approver_roles && step.approver_roles.length > 0) {
      const roleResult = await db.query(
        `
        SELECT 1
        FROM rbac_user_role_assignments ura
        JOIN rbac_roles r ON ura.role_id = r.id
        WHERE ura.user_id = $1 AND r.name = ANY($2) AND r.status = 'active'
        LIMIT 1
      `,
        [userId, step.approver_roles],
      );

      return roleResult.rows.length > 0;
    }

    return false;
  } catch (err) {
    logger.error('Error verifying approval permission:', err);
    return false;
  }
}

export default router;
