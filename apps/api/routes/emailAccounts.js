import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';

const router = express.Router();

// List accounts
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM email_accounts ORDER BY address');
    res.json({ success: true, accounts: result.rows });
  } catch (err) {
    logger.error('List accounts error', err);
    res.status(500).json({ success: false, error: 'DB_ERROR' });
  }
});

// Create account
router.post('/', authenticateJWT, async (req, res) => {
  const { queue, address, displayName, enabled = true, graphImpersonation = false, autoCreateTickets = true, webhookMode = false } = req.body;
  try {
    const insert = `INSERT INTO email_accounts (queue, address, display_name, enabled, graph_impersonation, auto_create_tickets, webhook_mode)
                    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const result = await db.query(insert, [queue, address, displayName, enabled, graphImpersonation, autoCreateTickets, webhookMode]);
    res.status(201).json({ success: true, account: result.rows[0] });
  } catch (err) {
    logger.error('Create account error', err);
    res.status(500).json({ success: false, error: 'DB_ERROR' });
  }
});

// Update account
router.put('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { queue, address, displayName, enabled, graphImpersonation, autoCreateTickets, webhookMode, lastSynced } = req.body;
  try {
    const result = await db.query(
      `UPDATE email_accounts SET queue=$1, address=$2, display_name=$3, enabled=$4, graph_impersonation=$5, auto_create_tickets=$6, webhook_mode=$7, last_synced=$8 WHERE id=$9 RETURNING *`,
      [queue, address, displayName, enabled, graphImpersonation, autoCreateTickets, webhookMode, lastSynced, id]
    );
    res.json({ success: true, account: result.rows[0] });
  } catch (err) {
    logger.error('Update account error', err);
    res.status(500).json({ success: false, error: 'DB_ERROR' });
  }
});

// Delete account
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    await db.query('DELETE FROM email_accounts WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    logger.error('Delete account error', err);
    res.status(500).json({ success: false, error: 'DB_ERROR' });
  }
});

export default router;
