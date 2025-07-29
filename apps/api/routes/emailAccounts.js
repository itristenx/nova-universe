import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';
import { body, param, validationResult } from 'express-validator';

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
router.put(
  '/:id',
  authenticateJWT,
  [
    param('id').isUUID(),
    body('queue').optional().isIn(['IT', 'HR', 'OPS', 'CYBER']),
    body('address').optional().isEmail(),
    body('displayName').optional().isString(),
    body('enabled').optional().isBoolean(),
    body('graphImpersonation').optional().isBoolean(),
    body('autoCreateTickets').optional().isBoolean(),
    body('webhookMode').optional().isBoolean(),
    body('lastSynced').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: errors.array() });
    }
    const { id } = req.params;
    const fields = {
      queue: req.body.queue,
      address: req.body.address,
      display_name: req.body.displayName,
      enabled: req.body.enabled,
      graph_impersonation: req.body.graphImpersonation,
      auto_create_tickets: req.body.autoCreateTickets,
      webhook_mode: req.body.webhookMode,
      last_synced: req.body.lastSynced,
    };
    const setClauses = [];
    const values = [];
    let i = 1;
    for (const [col, val] of Object.entries(fields)) {
      if (val !== undefined) {
        setClauses.push(`${col}=$${i}`);
        values.push(val);
        i++;
      }
    }
    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, error: 'NO_FIELDS' });
    }
    values.push(id);
    try {
      const result = await db.query(
        `UPDATE email_accounts SET ${setClauses.join(', ')} WHERE id=$${i} RETURNING *`,
        values
      );
      res.json({ success: true, account: result.rows[0] });
    } catch (err) {
      logger.error('Update account error', err);
      res.status(500).json({ success: false, error: 'DB_ERROR' });
    }
  }
);

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
