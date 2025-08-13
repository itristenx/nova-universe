import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * Generate intelligent insights based on actual system data
 */
async function generateSystemInsights() {
  try {
    const insights = [];
    
    // Analyze ticket volume trends
    const ticketTrends = await db.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as day,
        COUNT(*) as count
      FROM support_tickets 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day
    `);
    
    if (ticketTrends.rows.length > 1) {
      const recent = ticketTrends.rows[ticketTrends.rows.length - 1].count;
      const previous = ticketTrends.rows[ticketTrends.rows.length - 2].count;
      const change = ((recent - previous) / previous * 100).toFixed(1);
      
      if (Math.abs(change) > 20) {
        insights.push({
          id: Date.now() + 1,
          type: 'trend',
          severity: Math.abs(change) > 50 ? 'high' : 'medium',
          message: `Ticket volume ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)}% today`,
          recommendation: change > 0 ? 'Consider increasing support staff coverage' : 'Current staffing levels are adequate'
        });
      }
    }
    
    // Analyze resolution times
    const avgResolutionTime = await db.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
      FROM support_tickets 
      WHERE resolved_at IS NOT NULL 
      AND created_at >= NOW() - INTERVAL '7 days'
    `);
    
    if (avgResolutionTime.rows[0]?.avg_hours > 24) {
      insights.push({
        id: Date.now() + 2,
        type: 'performance',
        severity: avgResolutionTime.rows[0].avg_hours > 48 ? 'high' : 'medium',
        message: `Average resolution time is ${avgResolutionTime.rows[0].avg_hours.toFixed(1)} hours`,
        recommendation: 'Review ticket assignment and escalation processes'
      });
    }
    
    // Analyze user activity patterns
    const peakHours = await db.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM support_tickets 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `);
    
    if (peakHours.rows.length > 0) {
      insights.push({
        id: Date.now() + 3,
        type: 'pattern',
        severity: 'info',
        message: `Peak activity occurs at ${peakHours.rows[0].hour}:00 with ${peakHours.rows[0].count} tickets`,
        recommendation: 'Ensure adequate staffing during peak hours'
      });
    }
    
    // Analyze top issue categories
    const topCategories = await db.query(`
      SELECT system, COUNT(*) as count
      FROM support_tickets 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY system
      ORDER BY count DESC
      LIMIT 3
    `);
    
    if (topCategories.rows.length > 0) {
      insights.push({
        id: Date.now() + 4,
        type: 'category',
        severity: 'info',
        message: `Top issue categories: ${topCategories.rows.map(r => `${r.system} (${r.count})`).join(', ')}`,
        recommendation: 'Consider creating knowledge base articles for common issues'
      });
    }
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [{
      id: Date.now(),
      type: 'error',
      severity: 'low',
      message: 'Unable to generate insights at this time',
      recommendation: 'Check system logs for details'
    }];
  }
}

/**
 * @swagger
 * /api/reports/usage:
 *   get:
 *     summary: Get basic usage metrics
 *     responses:
 *       200:
 *         description: Usage metrics object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: integer
 *                 kiosks:
 *                   type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/usage', async (req, res) => {
  try {
    const { rows: userRows } = await db.query('SELECT COUNT(*) AS count FROM users');
    const { rows: kioskRows } = await db.query('SELECT COUNT(*) AS count FROM kiosks');
    res.json({
      users: parseInt(userRows[0].count, 10),
      kiosks: parseInt(kioskRows[0].count, 10),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
  }
});

/**
 * @swagger
 * /api/reports/insights:
 *   get:
 *     summary: Get intelligent system insights
 *     responses:
 *       200:
 *         description: List of AI-generated insights
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   type:
 *                     type: string
 *                   severity:
 *                     type: string
 *                   message:
 *                     type: string
 *                   recommendation:
 *                     type: string
 */
router.get('/insights', async (req, res) => {
  try {
    const insights = await generateSystemInsights();
    res.json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Failed to generate insights', errorCode: 'INSIGHTS_ERROR' });
  }
});

// Simple VIP heatmap endpoint
router.get('/vip-heatmap', async (req, res) => {
  try {
    const rows = await db.any(`
      SELECT to_char(created_at, 'YYYY-MM-DD') as day, COUNT(*) as count
      FROM support_tickets
      WHERE vip_priority_score > 0
      GROUP BY day ORDER BY day
    `);
    res.json({ success: true, heatmap: rows });
  } catch (err) {
    res.status(500).json({ success:false, error:'Failed to load heatmap', errorCode:'HEATMAP_ERROR' });
  }
});

export default router;
