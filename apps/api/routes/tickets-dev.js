import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { memoryDB } from '../lib/memoryStore.js';

const router = express.Router();
const isTestMode = process.env.NODE_ENV !== 'production' || process.env.TEST_MODE === 'true';

router.get('/tickets', authenticateJWT, async (req, res) => {
  if (!isTestMode) return res.status(404).end();
  const list = await memoryDB.listTickets();
  res.json(list);
});

router.post('/tickets', authenticateJWT, async (req, res) => {
  if (!isTestMode) return res.status(404).end();
  const t = await memoryDB.createTicket(req.body || {});
  res.status(201).json(t);
});

router.get('/tickets/:ticketId', authenticateJWT, async (req, res) => {
  if (!isTestMode) return res.status(404).end();
  const t = await memoryDB.getTicket(req.params.ticketId);
  if (!t) return res.status(404).json({ error: 'not found' });
  res.json(t);
});

router.patch('/tickets/:ticketId', authenticateJWT, async (req, res) => {
  if (!isTestMode) return res.status(404).end();
  const t = await memoryDB.updateTicket(req.params.ticketId, req.body || {});
  if (!t) return res.status(404).json({ error: 'not found' });
  res.json(t);
});

router.post('/tickets/:ticketId/comments', authenticateJWT, async (req, res) => {
  if (!isTestMode) return res.status(404).end();
  const c = await memoryDB.addComment(req.params.ticketId, req.body || {});
  if (!c) return res.status(404).json({ error: 'not found' });
  res.status(201).json(c);
});

export default router;