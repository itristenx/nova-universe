import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/v1/logs?start=YYYY-MM-DD&end=YYYY-MM-DD&status=fail
router.get('/api/v1/logs', async (req, res) => {
  try {
    let query = 'SELECT * FROM logs WHERE 1=1';
    const params = [];
    if (req.query.start) {
      query += ' AND timestamp >= $' + (params.length + 1);
      params.push(req.query.start);
    }
    if (req.query.end) {
      query += ' AND timestamp <= $' + (params.length + 1);
      params.push(req.query.end);
    }
    if (req.query.status) {
      query += ' AND email_status = $' + (params.length + 1);
      params.push(req.query.status);
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
  }
});

export default router;
