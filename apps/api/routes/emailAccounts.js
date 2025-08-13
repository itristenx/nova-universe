// Admin endpoints for managing M365 email accounts
import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// List all email configs
router.get('/', authenticateJWT, async (req, res) => {
  const accounts = await db.any('SELECT * FROM email_accounts ORDER BY id');
  res.json(accounts);
});

// Add new email integration
router.post('/', authenticateJWT, async (req, res) => {
  const { queue, address, displayName, enabled, graphImpersonation, autoCreateTickets, webhookMode } = req.body;
  const result = await db.one(
    `INSERT INTO email_accounts (queue, address, display_name, enabled, graph_impersonation, auto_create_tickets, webhook_mode)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [queue, address, displayName, enabled, graphImpersonation, autoCreateTickets, webhookMode]
  );
  res.status(201).json(result);
});

// Update email config
router.put('/:id', authenticateJWT, async (req, res) => {
  const { queue, address, displayName, enabled, graphImpersonation, autoCreateTickets, webhookMode } = req.body;
  const result = await db.oneOrNone(
    `UPDATE email_accounts SET queue=$1, address=$2, display_name=$3, enabled=$4, graph_impersonation=$5, auto_create_tickets=$6, webhook_mode=$7, updated_at=NOW()
     WHERE id=$8 RETURNING *`,
    [queue, address, displayName, enabled, graphImpersonation, autoCreateTickets, webhookMode, req.params.id]
  );
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
});

// Remove email account integration
router.delete('/:id', authenticateJWT, async (req, res) => {
  const result = await db.result('DELETE FROM email_accounts WHERE id=$1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

export default router;
