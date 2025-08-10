// Nova Sentinel - Analytics Routes
// Comprehensive monitoring analytics and reporting

import express from 'express';
import { param, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for analytics operations
const analyticsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many analytics requests, please try again later.'
});

router.use(analyticsRateLimit);

// ========================================================================
// SYSTEM ANALYTICS
// ========================================================================

/**
 * @swagger
 * /api/v1/analytics/system:
 *   get:
 *     tags: [Analytics]
 *     summary: Get system-wide analytics
 */
router.get('/system', async (req, res) => {
  try {
    const { period = '24h' } = req.query;

    const analytics = await req.services.analytics.getSystemAnalytics(period);

    res.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('System analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system analytics',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/analytics/monitors/{id}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get monitor-specific analytics
 */
router.get('/monitors/:id',
  [
    param('id').isString().withMessage('Monitor ID required'),
    query('period').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid period')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period = '24h' } = req.query;

      const analytics = await req.services.analytics.getMonitorAnalytics(id, period);

      res.json({
        success: true,
        analytics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Monitor analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve monitor analytics',
        details: error.message
      });
    }
  }
);

export default router;
