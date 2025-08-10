// Nova Sentinel - Settings Routes
// System configuration management

import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for settings operations
const settingsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many settings requests, please try again later.'
});

router.use(settingsRateLimit);

// ========================================================================
// SYSTEM SETTINGS
// ========================================================================

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get system settings
 */
router.get('/', async (req, res) => {
  try {
    const settings = await req.services.database.db.prepare(`
      SELECT key, value, type, description FROM settings ORDER BY key
    `).all();

    const formattedSettings = {};
    settings.forEach(setting => {
      let value = setting.value;
      
      switch (setting.type) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          value = JSON.parse(value);
          break;
      }
      
      formattedSettings[setting.key] = {
        value,
        type: setting.type,
        description: setting.description
      };
    });

    res.json({
      success: true,
      settings: formattedSettings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve settings',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/settings:
 *   put:
 *     tags: [Settings]
 *     summary: Update system settings
 */
router.put('/',
  [body('settings').isObject().withMessage('Settings object required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { settings } = req.body;
      const userId = req.user.id;

      // Update each setting
      for (const [key, config] of Object.entries(settings)) {
        const { value, type = 'string', description } = config;
        
        let stringValue = value;
        if (type === 'json') {
          stringValue = JSON.stringify(value);
        } else if (type === 'boolean') {
          stringValue = value ? 'true' : 'false';
        } else {
          stringValue = String(value);
        }

        await req.services.database.db.prepare(`
          INSERT OR REPLACE INTO settings (key, value, type, description, updated_by, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).run(key, stringValue, type, description, userId);
      }

      // Update Uptime Kuma settings if needed
      await req.services.uptimeKuma.updateSettings(settings);

      res.json({
        success: true,
        message: 'Settings updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Settings update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update settings',
        details: error.message
      });
    }
  }
);

export default router;
