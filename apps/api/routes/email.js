import express from 'express';
import axios from 'axios';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';
import db from '../db.js';
import { body, validationResult } from 'express-validator';
import { envTokenProvider } from '../services/m365EmailService.js';

const router = express.Router();
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// send email via Graph
router.post(
  '/send',
  authenticateJWT,
  [
    body('from').isEmail(),
    body('to').isEmail(),
    body('subject').notEmpty(),
    body('queue').optional().isIn(['IT', 'HR', 'OPS', 'CYBER'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', details: errors.array() });
    }
    const { from, to, subject, html, queue } = req.body;
    try {
      if (queue) {
        const check = await db.query(
          'SELECT id FROM email_accounts WHERE address=$1 AND queue=$2 AND enabled=true',
          [from, queue]
        );
        if (check.rowCount === 0) {
          return res.status(400).json({ success: false, error: 'INVALID_QUEUE' });
        }
      }
      const token = await envTokenProvider();
      await axios.post(
        `${GRAPH_BASE}/users/${from}/sendMail`,
        {
          message: {
            subject,
            body: { contentType: 'HTML', content: html },
            toRecipients: [{ emailAddress: { address: to } }]
          }
        },
        { headers: authHeader(token) }
      );
      res.json({ success: true });
    } catch (err) {
      logger.error('Send mail error', err?.response?.data || err.message);
      res.status(500).json({ success: false, error: 'SEND_ERROR' });
    }
  }
);

export default router;
