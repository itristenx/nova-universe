import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';

const router = express.Router();

// Get all feature flags
router.get('/', authenticateJWT, checkPermission('feature_flags:read'), async (req, res) => {
  try {
    const { environment, category, status } = req.query;

    let query = `
      SELECT id, name, key, description, category, is_enabled, environments,
             rollout_percentage, user_targeting, conditions, metadata,
             created_by, created_at, updated_at
      FROM feature_flags
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (environment) {
      paramCount++;
      query += ` AND environments @> $${paramCount}`;
      params.push(JSON.stringify([environment]));
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (status === 'enabled') {
      query += ` AND is_enabled = true`;
    } else if (status === 'disabled') {
      query += ` AND is_enabled = false`;
    }

    query += ` ORDER BY category, name`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching feature flags:', err);
    res.status(500).json({ error: 'Failed to fetch feature flags' });
  }
});

// Get single feature flag
router.get('/:id', authenticateJWT, checkPermission('feature_flags:read'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      SELECT ff.*,
        u.name as created_by_name,
        COALESCE(
          json_agg(
            json_build_object(
              'experiment_id', abe.id,
              'experiment_name', abe.name,
              'status', abe.status
            )
          ) FILTER (WHERE abe.id IS NOT NULL), 
          '[]'::json
        ) as linked_experiments
      FROM feature_flags ff
      LEFT JOIN users u ON ff.created_by = u.id
      LEFT JOIN ab_experiments abe ON ff.id = ANY(abe.feature_flags)
      WHERE ff.id = $1
      GROUP BY ff.id, u.name
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error fetching feature flag:', err);
    res.status(500).json({ error: 'Failed to fetch feature flag' });
  }
});

// Create feature flag
router.post('/', authenticateJWT, checkPermission('feature_flags:write'), async (req, res) => {
  const {
    name,
    key,
    description,
    category,
    is_enabled,
    environments,
    rollout_percentage,
    user_targeting,
    conditions,
    metadata,
  } = req.body;

  try {
    const result = await db.query(
      `
      INSERT INTO feature_flags (
        name, key, description, category, is_enabled, environments,
        rollout_percentage, user_targeting, conditions, metadata, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
      [
        name,
        key,
        description,
        category || 'general',
        is_enabled || false,
        JSON.stringify(environments || ['development']),
        rollout_percentage || 0,
        JSON.stringify(user_targeting || {}),
        JSON.stringify(conditions || {}),
        JSON.stringify(metadata || {}),
        req.user?.id,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating feature flag:', err);
    res.status(500).json({ error: 'Failed to create feature flag' });
  }
});

// Update feature flag
router.put('/:id', authenticateJWT, checkPermission('feature_flags:write'), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    key,
    description,
    category,
    is_enabled,
    environments,
    rollout_percentage,
    user_targeting,
    conditions,
    metadata,
  } = req.body;

  try {
    const result = await db.query(
      `
      UPDATE feature_flags 
      SET name = $1, key = $2, description = $3, category = $4, is_enabled = $5,
          environments = $6, rollout_percentage = $7, user_targeting = $8,
          conditions = $9, metadata = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `,
      [
        name,
        key,
        description,
        category,
        is_enabled,
        JSON.stringify(environments || []),
        rollout_percentage,
        JSON.stringify(user_targeting || {}),
        JSON.stringify(conditions || {}),
        JSON.stringify(metadata || {}),
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error updating feature flag:', err);
    res.status(500).json({ error: 'Failed to update feature flag' });
  }
});

// Toggle feature flag
router.post(
  '/:id/toggle',
  authenticateJWT,
  checkPermission('feature_flags:write'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.query(
        `
      UPDATE feature_flags 
      SET is_enabled = NOT is_enabled, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Feature flag not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error toggling feature flag:', err);
      res.status(500).json({ error: 'Failed to toggle feature flag' });
    }
  },
);

// Delete feature flag
router.delete('/:id', authenticateJWT, checkPermission('feature_flags:write'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      DELETE FROM feature_flags 
      WHERE id = $1
      RETURNING id
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    res.json({ message: 'Feature flag deleted successfully' });
  } catch (err) {
    logger.error('Error deleting feature flag:', err);
    res.status(500).json({ error: 'Failed to delete feature flag' });
  }
});

// Evaluate feature flag for user/context
router.post('/evaluate', authenticateJWT, async (req, res) => {
  const { flag_key, user_id, context } = req.body;

  try {
    const result = await db.query(
      `
      SELECT * FROM feature_flags
      WHERE key = $1 AND is_enabled = true
    `,
      [flag_key],
    );

    if (result.rows.length === 0) {
      return res.json({ enabled: false, reason: 'Flag not found or disabled' });
    }

    const flag = result.rows[0];
    const evaluation = await evaluateFeatureFlag(flag, user_id, context);

    res.json(evaluation);
  } catch (err) {
    logger.error('Error evaluating feature flag:', err);
    res.status(500).json({ error: 'Failed to evaluate feature flag' });
  }
});

// Bulk evaluate feature flags
router.post('/evaluate/bulk', authenticateJWT, async (req, res) => {
  const { flag_keys, user_id, context } = req.body;

  try {
    const result = await db.query(
      `
      SELECT * FROM feature_flags
      WHERE key = ANY($1) AND is_enabled = true
    `,
      [flag_keys],
    );

    const evaluations = {};

    for (const flagKey of flag_keys) {
      const flag = result.rows.find((f) => f.key === flagKey);
      if (flag) {
        evaluations[flagKey] = await evaluateFeatureFlag(flag, user_id, context);
      } else {
        evaluations[flagKey] = { enabled: false, reason: 'Flag not found or disabled' };
      }
    }

    res.json(evaluations);
  } catch (err) {
    logger.error('Error bulk evaluating feature flags:', err);
    res.status(500).json({ error: 'Failed to evaluate feature flags' });
  }
});

// Get feature flag analytics
router.get(
  '/analytics/dashboard',
  authenticateJWT,
  checkPermission('feature_flags:read'),
  async (req, res) => {
    try {
      const analytics = await Promise.all([
        // Flag status distribution
        db.query(`
        SELECT 
          CASE WHEN is_enabled THEN 'enabled' ELSE 'disabled' END as status,
          COUNT(*) as count
        FROM feature_flags
        GROUP BY is_enabled
      `),

        // Flags by category
        db.query(`
        SELECT 
          category,
          COUNT(*) as total_count,
          COUNT(*) FILTER (WHERE is_enabled = true) as enabled_count
        FROM feature_flags
        GROUP BY category
        ORDER BY total_count DESC
      `),

        // Recent flag changes
        db.query(`
        SELECT 
          ff.name, ff.key, ff.is_enabled,
          u.name as updated_by_name,
          ff.updated_at
        FROM feature_flags ff
        LEFT JOIN users u ON ff.created_by = u.id
        WHERE ff.updated_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY ff.updated_at DESC
        LIMIT 10
      `),

        // Environment distribution
        db.query(`
        SELECT 
          env.value as environment,
          COUNT(*) as flag_count
        FROM feature_flags ff,
             jsonb_array_elements_text(ff.environments) env
        GROUP BY env.value
        ORDER BY flag_count DESC
      `),
      ]);

      res.json({
        statusDistribution: analytics[0].rows,
        categoryBreakdown: analytics[1].rows,
        recentChanges: analytics[2].rows,
        environmentDistribution: analytics[3].rows,
      });
    } catch (err) {
      logger.error('Error fetching feature flag analytics:', err);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },
);

// Helper function to evaluate feature flag
async function evaluateFeatureFlag(flag, userId, context = {}) {
  try {
    // Check environment
    const environment = context.environment || 'development';
    if (!flag.environments.includes(environment)) {
      return { enabled: false, reason: 'Environment not enabled' };
    }

    // Check rollout percentage
    if (flag.rollout_percentage < 100) {
      const hash = simpleHash(`${flag.key}:${userId}`);
      const bucket = hash % 100;
      if (bucket >= flag.rollout_percentage) {
        return { enabled: false, reason: 'Not in rollout percentage' };
      }
    }

    // Check user targeting
    if (flag.user_targeting && Object.keys(flag.user_targeting).length > 0) {
      const targeting = flag.user_targeting;

      // Check included users
      if (targeting.included_users && targeting.included_users.includes(userId)) {
        return { enabled: true, reason: 'User explicitly included' };
      }

      // Check excluded users
      if (targeting.excluded_users && targeting.excluded_users.includes(userId)) {
        return { enabled: false, reason: 'User explicitly excluded' };
      }

      // Check user attributes (if provided in context)
      if (targeting.user_attributes && context.user_attributes) {
        for (const [attr, values] of Object.entries(targeting.user_attributes)) {
          if (context.user_attributes[attr] && !values.includes(context.user_attributes[attr])) {
            return { enabled: false, reason: `User attribute ${attr} not matched` };
          }
        }
      }
    }

    // Check additional conditions
    if (flag.conditions && Object.keys(flag.conditions).length > 0) {
      // Custom condition evaluation logic would go here
      // For now, we'll assume conditions pass
    }

    return { enabled: true, reason: 'All conditions met' };
  } catch (err) {
    logger.error('Error evaluating feature flag:', err);
    return { enabled: false, reason: 'Evaluation error' };
  }
}

// Simple hash function for consistent bucketing
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export default router;
