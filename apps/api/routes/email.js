// Outbound email sending via Microsoft Graph
import express from 'express';
import db from '../db.js';
import { authenticateJWT } from '../middleware/auth.js';
// TODO: Import MSAL/Graph helper

const router = express.Router();

// POST /email/send
router.post('/send', authenticateJWT, async (req, res) => {
  const { from, to, subject, html, queue } = req.body;
  // TODO: Lookup account config, get Graph token, send mail via Graph API
  // Example Graph API call: POST /users/{from}/sendMail
  // Use MSAL to get access token for the account
  // If success, log and return 200
  // If error, return 500
  res.status(501).json({ error: 'Not implemented: Graph sendMail' });
});

export default router;
