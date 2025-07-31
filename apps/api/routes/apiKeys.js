import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import ConfigurationManager from '../config/app-settings.js';
import { logger } from '../logger.js';

const router = express.Router();

// List API keys
router.get('/', authenticateJWT, createRateLimit(15 * 60 * 1000, 30), async (req, res) => {
  try {
    if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
      return res.status(403).json({ success: false, error: 'Admin access required', errorCode: 'ADMIN_ACCESS_REQUIRED' });
    }
    const apiKeys = await ConfigurationManager.get('apiKeys', []);
    res.json({ success: true, apiKeys });
  } catch (err) {
    logger.error('Error getting API keys:', err);
    res.status(500).json({ success: false, error: 'Failed to get API keys', errorCode: 'API_KEYS_ERROR' });
  }
});

// Create API key
router.post('/',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 10),
  [body('description').optional().isString()],
  async (req, res) => {
    try {
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
        return res.status(403).json({ success: false, error: 'Admin access required', errorCode: 'ADMIN_ACCESS_REQUIRED' });
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array(), errorCode: 'VALIDATION_ERROR' });
      }
      const key = uuidv4();
      const createdAt = new Date().toISOString();
      const apiKeys = await ConfigurationManager.get('apiKeys', []);
      apiKeys.push({ key, description: req.body.description || '', createdAt });
      const success = await ConfigurationManager.set('apiKeys', apiKeys, req.user.id);
      if (!success) {
        return res.status(500).json({ success: false, error: 'Failed to save API key', errorCode: 'API_KEYS_SAVE_ERROR' });
      }
      res.json({ success: true, apiKey: { key, createdAt, description: req.body.description || '' } });
    } catch (err) {
      logger.error('Error creating API key:', err);
      res.status(500).json({ success: false, error: 'Failed to create API key', errorCode: 'API_KEYS_ERROR' });
    }
  });

// Delete API key
router.delete('/:key', authenticateJWT, createRateLimit(15 * 60 * 1000, 10), async (req, res) => {
  try {
    if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
      return res.status(403).json({ success: false, error: 'Admin access required', errorCode: 'ADMIN_ACCESS_REQUIRED' });
    }
    const apiKeys = await ConfigurationManager.get('apiKeys', []);
    const filtered = apiKeys.filter(k => k.key !== req.params.key);
    if (filtered.length === apiKeys.length) {
      return res.status(404).json({ success: false, error: 'API key not found', errorCode: 'API_KEY_NOT_FOUND' });
    }
    const success = await ConfigurationManager.set('apiKeys', filtered, req.user.id);
    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to delete API key', errorCode: 'API_KEYS_SAVE_ERROR' });
    }
    res.json({ success: true, message: 'API key deleted' });
  } catch (err) {
    logger.error('Error deleting API key:', err);
    res.status(500).json({ success: false, error: 'Failed to delete API key', errorCode: 'API_KEYS_ERROR' });
  }
});

export default router;
