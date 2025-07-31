import express from 'express';
import ConfigurationManager from '../config/app-settings.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { body, validationResult } from 'express-validator';
import { logger } from '../logger.js';

const router = express.Router();

// Get list of modules (feature toggles)
router.get('/',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 30),
  async (req, res) => {
    try {
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          errorCode: 'ADMIN_ACCESS_REQUIRED'
        });
      }

      const features = await ConfigurationManager.get('features');
      res.json({ success: true, modules: features || {} });
    } catch (error) {
      logger.error('Error getting modules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get modules',
        errorCode: 'MODULES_ERROR'
      });
    }
  }
);

// Update a single module
router.put('/:key',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20),
  [body('enabled').isBoolean()],
  async (req, res) => {
    try {
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          errorCode: 'ADMIN_ACCESS_REQUIRED'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { key } = req.params;
      const { enabled } = req.body;
      const features = await ConfigurationManager.get('features') || {};
      features[key] = enabled;
      const success = await ConfigurationManager.set('features', features, req.user.id);
      if (!success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update module',
          errorCode: 'MODULE_UPDATE_FAILED'
        });
      }

      res.json({ success: true, message: 'Module updated', key, enabled });
    } catch (error) {
      logger.error('Error updating module:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update module',
        errorCode: 'MODULE_UPDATE_ERROR'
      });
    }
  }
);

export default router;
