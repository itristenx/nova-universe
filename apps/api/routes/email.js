// Outbound email sending via Microsoft Graph
import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
import m365EmailService from '../services/m365EmailService.js';

const router = express.Router();

// POST /email/send
router.post('/send', authenticateJWT, async (req, res) => {
  const { from, to, subject, html, queue } = req.body;
  try {
    let sender = from;
    if (!sender && queue) {
      const account = await db.oneOrNone(
        'SELECT address FROM email_accounts WHERE queue=$1 AND enabled=TRUE',
        [queue]
      );
      if (!account) {
        return res.status(400).json({ error: 'Unknown queue' });
      }
      sender = account.address;
    }

    if (!sender) {
      return res.status(400).json({ error: 'Sender required' });
    }

    await m365EmailService.sendEmail({ from: sender, to, subject, html });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

export default router;
