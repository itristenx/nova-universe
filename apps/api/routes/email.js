import express from 'express';
import axios from 'axios';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';

const router = express.Router();
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// send email via Graph
router.post('/send', authenticateJWT, async (req, res) => {
  const { from, to, subject, html, queue } = req.body;
  if (!from || !to || !subject) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  try {
    const token = process.env.M365_TOKEN; // simple static token for now
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
});

export default router;
