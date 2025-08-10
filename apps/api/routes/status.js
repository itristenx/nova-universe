import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /status/summary
router.get('/summary', (req, res) => {
  db.all("SELECT key, value FROM config", (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'DB error' });
    const cfg = Object.fromEntries((rows || []).map(r => [r.key, r.value]));
    const currentStatus = cfg.currentStatus || 'operational';

    res.json({
      success: true,
      status: currentStatus,
      components: [
        { id: 'api', name: 'API', status: 'operational' },
        { id: 'db', name: 'Database', status: 'operational' },
        { id: 'notifications', name: 'Notifications', status: 'operational' }
      ],
      updatedAt: new Date().toISOString()
    });
  });
});

export default router;
