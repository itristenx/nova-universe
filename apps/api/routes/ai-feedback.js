import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/feedback', async (req, res) => {
  try {
    const { messageId, rating, feedback, provider, model } = req.body || {};
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating 1-5 required' });
    }
    await db.query(
      `INSERT INTO ai_feedback (id, actor_id, tenant_id, provider, model, message_id, rating, feedback, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [req.user?.id || null, req.user?.tenantId || null, provider || null, model || null, messageId || null, rating, feedback || null]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;