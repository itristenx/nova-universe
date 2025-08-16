import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /announcements
router.get('/', (req, res) => {
  db.all(
    `SELECT id, message, level, type, created_at, active FROM notifications WHERE active=1 ORDER BY created_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, error: 'DB error' });

      const announcements = (rows || []).map((r) => ({
        id: r.id,
        title: r.type || 'system',
        body: r.message,
        level: r.level || 'info',
        createdAt: r.created_at,
      }));

      res.json({ success: true, announcements });
    },
  );
});

export default router;
