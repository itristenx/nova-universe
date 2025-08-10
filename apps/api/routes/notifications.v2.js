import express from 'express';
import { logger } from '../logger.js';
import db from '../db.js';
import m365EmailService from '../services/m365EmailService.js';
import { authenticateJWT } from '../middleware/auth.js';

// Simple channel drivers
import { NotificationService } from '../services/notification/NotificationService.js';

const router = express.Router();
const service = new NotificationService({ db, logger, m365EmailService });

// POST /api/v2/notifications/events - ingest an event and fan out per preferences/RBAC
router.post('/events', authenticateJWT, async (req, res) => {
  try {
    const event = req.body;
    if (!event || !event.type || !event.title) {
      return res.status(400).json({ error: 'Missing required fields: type, title' });
    }
    const result = await service.processEvent(event, req.app);
    res.json({ accepted: true, deliveries: result.deliveries.length, eventId: result.eventId });
  } catch (err) {
    logger.error('Failed to process notification event', err);
    res.status(500).json({ error: 'Failed to process event' });
  }
});

// GET /api/v2/notifications/preferences/:userId - get preferences (RBAC-aware later)
router.get('/preferences/:userId', authenticateJWT, async (req, res) => {
  try {
    const prefs = await service.getUserPreferences(req.params.userId);
    res.json(prefs);
  } catch (err) {
    logger.error('Failed to fetch preferences', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /api/v2/notifications/preferences/:userId - set preferences
router.put('/preferences/:userId', authenticateJWT, async (req, res) => {
  try {
    const updated = await service.setUserPreferences(req.params.userId, req.body);
    res.json(updated);
  } catch (err) {
    logger.error('Failed to update preferences', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// GET /api/v2/notifications/deliveries?userId=... - list recent deliveries
router.get('/deliveries', authenticateJWT, async (req, res) => {
  try {
    const { userId, limit = 50 } = req.query;
    const deliveries = await service.listDeliveries({ userId, limit: Number(limit) });
    res.json(deliveries);
  } catch (err) {
    logger.error('Failed to list deliveries', err);
    res.status(500).json({ error: 'Failed to list deliveries' });
  }
});

export default router;