import express from 'express';
import db from '../db.js';

const router = express.Router();

// Mock insights data
const insights = [
  { id: 1, message: 'User activity steady' },
  { id: 2, message: 'Most logins occur on Monday' }
];

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
 *     summary: Get system insights
 *     responses:
 *       200:
 *         description: List of insights
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   message:
 *                     type: string
 */
router.get('/insights', (req, res) => {
  res.json(insights);
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
