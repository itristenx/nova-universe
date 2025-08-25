import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';

const router = express.Router();

// Get all A/B experiments
router.get(
  '/experiments',
  authenticateJWT,
  checkPermission('ab_testing:read'),
  async (req, res) => {
    try {
      const { status, category } = req.query;

      let query = `
      SELECT 
        e.id, e.name, e.description, e.hypothesis, e.category, e.status,
        e.start_date, e.end_date, e.traffic_allocation, e.variants,
        e.metrics, e.feature_flags, e.metadata, e.created_by, e.created_at,
        u.name as created_by_name,
        COUNT(ep.id) as participant_count
      FROM ab_experiments e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN ab_experiment_participants ep ON e.id = ep.experiment_id
      WHERE 1=1
    `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND e.status = $${paramCount}`;
        params.push(status);
      }

      if (category) {
        paramCount++;
        query += ` AND e.category = $${paramCount}`;
        params.push(category);
      }

      query += ` 
      GROUP BY e.id, e.name, e.description, e.hypothesis, e.category, e.status,
               e.start_date, e.end_date, e.traffic_allocation, e.variants,
               e.metrics, e.feature_flags, e.metadata, e.created_by, e.created_at, u.name
      ORDER BY e.created_at DESC
    `;

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (err) {
      logger.error('Error fetching A/B experiments:', err);
      res.status(500).json({ error: 'Failed to fetch experiments' });
    }
  },
);

// Get single experiment
router.get(
  '/experiments/:id',
  authenticateJWT,
  checkPermission('ab_testing:read'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.query(
        `
      SELECT 
        e.*,
        u.name as created_by_name,
        COUNT(ep.id) as participant_count,
        COUNT(ep.id) FILTER (WHERE ep.variant = 'control') as control_count,
        COUNT(ep.id) FILTER (WHERE ep.variant = 'treatment') as treatment_count
      FROM ab_experiments e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN ab_experiment_participants ep ON e.id = ep.experiment_id
      WHERE e.id = $1
      GROUP BY e.id, u.name
    `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Experiment not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error fetching experiment:', err);
      res.status(500).json({ error: 'Failed to fetch experiment' });
    }
  },
);

// Create experiment
router.post(
  '/experiments',
  authenticateJWT,
  checkPermission('ab_testing:write'),
  async (req, res) => {
    const {
      name,
      description,
      hypothesis,
      category,
      start_date,
      end_date,
      traffic_allocation,
      variants,
      metrics,
      feature_flags,
      metadata,
    } = req.body;

    try {
      const result = await db.query(
        `
      INSERT INTO ab_experiments (
        name, description, hypothesis, category, status, start_date, end_date,
        traffic_allocation, variants, metrics, feature_flags, metadata, created_by
      ) VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
        [
          name,
          description,
          hypothesis,
          category || 'general',
          start_date,
          end_date,
          traffic_allocation || 50,
          JSON.stringify(variants || []),
          JSON.stringify(metrics || []),
          JSON.stringify(feature_flags || []),
          JSON.stringify(metadata || {}),
          req.user?.id,
        ],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      logger.error('Error creating experiment:', err);
      res.status(500).json({ error: 'Failed to create experiment' });
    }
  },
);

// Update experiment
router.put(
  '/experiments/:id',
  authenticateJWT,
  checkPermission('ab_testing:write'),
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      description,
      hypothesis,
      category,
      start_date,
      end_date,
      traffic_allocation,
      variants,
      metrics,
      feature_flags,
      metadata,
    } = req.body;

    try {
      const result = await db.query(
        `
      UPDATE ab_experiments 
      SET name = $1, description = $2, hypothesis = $3, category = $4,
          start_date = $5, end_date = $6, traffic_allocation = $7,
          variants = $8, metrics = $9, feature_flags = $10, metadata = $11,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND status = 'draft'
      RETURNING *
    `,
        [
          name,
          description,
          hypothesis,
          category,
          start_date,
          end_date,
          traffic_allocation,
          JSON.stringify(variants || []),
          JSON.stringify(metrics || []),
          JSON.stringify(feature_flags || []),
          JSON.stringify(metadata || {}),
          id,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Experiment not found or not in draft status' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error updating experiment:', err);
      res.status(500).json({ error: 'Failed to update experiment' });
    }
  },
);

// Start experiment
router.post(
  '/experiments/:id/start',
  authenticateJWT,
  checkPermission('ab_testing:write'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.query(
        `
      UPDATE ab_experiments 
      SET status = 'running', start_date = COALESCE(start_date, CURRENT_TIMESTAMP),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'draft'
      RETURNING *
    `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Experiment not found or not in draft status' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error starting experiment:', err);
      res.status(500).json({ error: 'Failed to start experiment' });
    }
  },
);

// Stop experiment
router.post(
  '/experiments/:id/stop',
  authenticateJWT,
  checkPermission('ab_testing:write'),
  async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
      const result = await db.query(
        `
      UPDATE ab_experiments 
      SET status = 'stopped', end_date = CURRENT_TIMESTAMP,
          metadata = metadata || jsonb_build_object('stop_reason', $2),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'running'
      RETURNING *
    `,
        [id, reason || 'Manual stop'],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Experiment not found or not running' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error stopping experiment:', err);
      res.status(500).json({ error: 'Failed to stop experiment' });
    }
  },
);

// Complete experiment
router.post(
  '/experiments/:id/complete',
  authenticateJWT,
  checkPermission('ab_testing:write'),
  async (req, res) => {
    const { id } = req.params;
    const { results, conclusion } = req.body;

    try {
      const result = await db.query(
        `
      UPDATE ab_experiments 
      SET status = 'completed', end_date = COALESCE(end_date, CURRENT_TIMESTAMP),
          results = $2, conclusion = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status IN ('running', 'stopped')
      RETURNING *
    `,
        [id, JSON.stringify(results || {}), conclusion],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Experiment not found or not in valid status' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Error completing experiment:', err);
      res.status(500).json({ error: 'Failed to complete experiment' });
    }
  },
);

// Assign user to experiment variant
router.post('/experiments/:id/assign', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { user_id, context } = req.body;
  const userId = user_id || req.user?.id;

  try {
    // Check if experiment is running
    const experimentResult = await db.query(
      `
      SELECT * FROM ab_experiments
      WHERE id = $1 AND status = 'running'
        AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
        AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
    `,
      [id],
    );

    if (experimentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Experiment not found or not running' });
    }

    const experiment = experimentResult.rows[0];

    // Check if user is already assigned
    const existingResult = await db.query(
      `
      SELECT variant FROM ab_experiment_participants
      WHERE experiment_id = $1 AND user_id = $2
    `,
      [id, userId],
    );

    if (existingResult.rows.length > 0) {
      return res.json({
        variant: existingResult.rows[0].variant,
        experiment_id: id,
        user_id: userId,
        message: 'User already assigned',
      });
    }

    // Determine variant assignment
    const variant = assignVariant(experiment, userId, context);

    // Record assignment
    await db.query(
      `
      INSERT INTO ab_experiment_participants (experiment_id, user_id, variant, context, assigned_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `,
      [id, userId, variant, JSON.stringify(context || {})],
    );

    res.json({
      variant,
      experiment_id: id,
      user_id: userId,
      message: 'User assigned to variant',
    });
  } catch (err) {
    logger.error('Error assigning user to experiment:', err);
    res.status(500).json({ error: 'Failed to assign user to experiment' });
  }
});

// Track experiment event
router.post('/experiments/:id/track', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { user_id, event_type, event_data } = req.body;
  const userId = user_id || req.user?.id;

  try {
    // Verify user is in experiment
    const participantResult = await db.query(
      `
      SELECT variant FROM ab_experiment_participants
      WHERE experiment_id = $1 AND user_id = $2
    `,
      [id, userId],
    );

    if (participantResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in experiment' });
    }

    const variant = participantResult.rows[0].variant;

    // Record event
    await db.query(
      `
      INSERT INTO ab_experiment_events (
        experiment_id, user_id, variant, event_type, event_data, tracked_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `,
      [id, userId, variant, event_type, JSON.stringify(event_data || {})],
    );

    res.json({ message: 'Event tracked successfully' });
  } catch (err) {
    logger.error('Error tracking experiment event:', err);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get experiment results
router.get(
  '/experiments/:id/results',
  authenticateJWT,
  checkPermission('ab_testing:read'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const analytics = await Promise.all([
        // Participant counts by variant
        db.query(
          `
        SELECT variant, COUNT(*) as participant_count
        FROM ab_experiment_participants
        WHERE experiment_id = $1
        GROUP BY variant
        ORDER BY variant
      `,
          [id],
        ),

        // Event counts by variant and type
        db.query(
          `
        SELECT variant, event_type, COUNT(*) as event_count
        FROM ab_experiment_events
        WHERE experiment_id = $1
        GROUP BY variant, event_type
        ORDER BY variant, event_type
      `,
          [id],
        ),

        // Daily event trends
        db.query(
          `
        SELECT 
          DATE(tracked_at) as date,
          variant,
          event_type,
          COUNT(*) as event_count
        FROM ab_experiment_events
        WHERE experiment_id = $1
        GROUP BY DATE(tracked_at), variant, event_type
        ORDER BY date, variant, event_type
      `,
          [id],
        ),

        // Conversion rates (assuming 'conversion' event type)
        db.query(
          `
        SELECT 
          p.variant,
          COUNT(DISTINCT p.user_id) as total_participants,
          COUNT(DISTINCT e.user_id) as conversions,
          CASE 
            WHEN COUNT(DISTINCT p.user_id) > 0 
            THEN (COUNT(DISTINCT e.user_id)::float / COUNT(DISTINCT p.user_id) * 100)
            ELSE 0 
          END as conversion_rate
        FROM ab_experiment_participants p
        LEFT JOIN ab_experiment_events e ON p.experiment_id = e.experiment_id 
          AND p.user_id = e.user_id 
          AND e.event_type = 'conversion'
        WHERE p.experiment_id = $1
        GROUP BY p.variant
        ORDER BY p.variant
      `,
          [id],
        ),
      ]);

      res.json({
        participantCounts: analytics[0].rows,
        eventCounts: analytics[1].rows,
        dailyTrends: analytics[2].rows,
        conversionRates: analytics[3].rows,
      });
    } catch (err) {
      logger.error('Error fetching experiment results:', err);
      res.status(500).json({ error: 'Failed to fetch experiment results' });
    }
  },
);

// Get A/B testing analytics dashboard
router.get(
  '/analytics/dashboard',
  authenticateJWT,
  checkPermission('ab_testing:read'),
  async (req, res) => {
    try {
      const analytics = await Promise.all([
        // Experiment status distribution
        db.query(`
        SELECT status, COUNT(*) as count
        FROM ab_experiments
        GROUP BY status
        ORDER BY count DESC
      `),

        // Active experiments
        db.query(`
        SELECT 
          e.id, e.name, e.category, e.start_date, e.end_date,
          COUNT(ep.id) as participant_count
        FROM ab_experiments e
        LEFT JOIN ab_experiment_participants ep ON e.id = ep.experiment_id
        WHERE e.status = 'running'
        GROUP BY e.id, e.name, e.category, e.start_date, e.end_date
        ORDER BY e.start_date DESC
      `),

        // Recent experiment activity
        db.query(`
        SELECT 
          e.name as experiment_name,
          ee.event_type,
          COUNT(*) as event_count,
          DATE(ee.tracked_at) as date
        FROM ab_experiment_events ee
        JOIN ab_experiments e ON ee.experiment_id = e.id
        WHERE ee.tracked_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY e.name, ee.event_type, DATE(ee.tracked_at)
        ORDER BY date DESC, event_count DESC
        LIMIT 20
      `),

        // Experiment performance summary
        db.query(`
        SELECT 
          e.name,
          e.category,
          COUNT(DISTINCT ep.user_id) as total_participants,
          COUNT(DISTINCT ee.user_id) FILTER (WHERE ee.event_type = 'conversion') as conversions
        FROM ab_experiments e
        LEFT JOIN ab_experiment_participants ep ON e.id = ep.experiment_id
        LEFT JOIN ab_experiment_events ee ON e.id = ee.experiment_id
        WHERE e.status IN ('running', 'completed')
        GROUP BY e.id, e.name, e.category
        ORDER BY total_participants DESC
        LIMIT 10
      `),
      ]);

      res.json({
        statusDistribution: analytics[0].rows,
        activeExperiments: analytics[1].rows,
        recentActivity: analytics[2].rows,
        performanceSummary: analytics[3].rows,
      });
    } catch (err) {
      logger.error('Error fetching A/B testing analytics:', err);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },
);

// Helper function to assign variant
function assignVariant(experiment, userId, _context = {}) {
  try {
    // Simple hash-based assignment for consistent results
    const hash = simpleHash(`${experiment.id}:${userId}`);
    const bucket = hash % 100;

    // Default to 50/50 split between control and treatment
    const allocation = experiment.traffic_allocation || 50;

    if (bucket < allocation) {
      return 'treatment';
    } else {
      return 'control';
    }
  } catch (err) {
    logger.error('Error assigning variant:', err);
    return 'control'; // Default to control on error
  }
}

// Simple hash function for consistent assignment
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
