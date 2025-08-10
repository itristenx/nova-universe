// nova-api/routes/configuration.js
// API routes for application configuration management
import express from 'express';
import ConfigurationManager from '../config/app-settings.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { body, validationResult } from 'express-validator';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfigurationItem:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *         value:
 *           type: object
 *         updatedBy:
 *           type: string
 *         updatedAt:
 *           type: string
 *     
 *     ConfigurationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         configuration:
 *           type: object
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/configuration:
 *   get:
 *     summary: Get application configuration
 *     description: Get the complete application configuration (admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfigurationResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 30), // 30 requests per 15 minutes
  async (req, res) => {
    try {
      // Check if user has admin role
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          errorCode: 'ADMIN_ACCESS_REQUIRED'
        });
      }

      const configuration = await ConfigurationManager.getFullConfig();

      res.json({
        success: true,
        configuration,
        message: 'Configuration retrieved successfully'
      });

    } catch (error) {
      logger.error('Error getting configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get configuration',
        errorCode: 'CONFIG_GET_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/configuration/public:
 *   get:
 *     summary: Get public application configuration
 *     description: Get non-sensitive configuration available to all authenticated users
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Public configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 configuration:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/public',
  createRateLimit(15 * 60 * 1000, 100, 15 * 60 * 1000), // 100 requests per 15 minutes (no auth required)
  async (req, res) => {
    try {
      const fullConfig = await ConfigurationManager.getFullConfig();
      
      // Return only non-sensitive configuration
      const publicConfig = {
        organization: fullConfig.organization,
        application: {
          defaultPageSize: fullConfig.application?.defaultPageSize,
          enableRegistration: fullConfig.application?.enableRegistration,
          enableGuestAccess: fullConfig.application?.enableGuestAccess,
          maintenanceMode: fullConfig.application?.maintenanceMode
        },
        search: {
          enableSemanticSearch: fullConfig.search?.enableSemanticSearch,
          enableHybridSearch: fullConfig.search?.enableHybridSearch,
          enableSearchSuggestions: fullConfig.search?.enableSearchSuggestions
        },
        features: fullConfig.features,
        statusMessages: fullConfig.statusMessages
      };

      res.json({
        success: true,
        configuration: publicConfig
      });

    } catch (error) {
      logger.error('Error getting public configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get public configuration',
        errorCode: 'PUBLIC_CONFIG_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/configuration/{key}:
 *   get:
 *     summary: Get specific configuration value
 *     description: Get a specific configuration value by key (admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key (dot notation supported)
 *     responses:
 *       200:
 *         description: Configuration value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 key:
 *                   type: string
 *                 value:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Configuration key not found
 */
router.get('/:key',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50, 15 * 60 * 1000),
  async (req, res) => {
    try {
      // Check if user has admin role
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          errorCode: 'ADMIN_ACCESS_REQUIRED'
        });
      }

      const { key } = req.params;
      const value = await ConfigurationManager.get(key);

      if (value === null || value === undefined) {
        return res.status(404).json({
          success: false,
          error: 'Configuration key not found',
          errorCode: 'CONFIG_KEY_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        key,
        value
      });

    } catch (error) {
      logger.error('Error getting configuration value:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get configuration value',
        errorCode: 'CONFIG_VALUE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/configuration/{key}:
 *   put:
 *     summary: Update configuration value
 *     description: Update a specific configuration value (admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key (dot notation supported)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 description: Configuration value
 *             required:
 *               - value
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid configuration value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/:key',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20, 15 * 60 * 1000),
  [
    body('value').exists().withMessage('Value is required')
  ],
  async (req, res) => {
    try {
      // Check if user has admin role
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
      const { value } = req.body;
      const userId = req.user.id;

      const success = await ConfigurationManager.set(key, value, userId);

      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid configuration value or validation failed',
          errorCode: 'CONFIG_VALIDATION_ERROR'
        });
      }

      logger.info('Configuration updated', { key, userId, userEmail: req.user.email });

      res.json({
        success: true,
        message: 'Configuration updated successfully',
        key,
        value
      });

    } catch (error) {
      logger.error('Error updating configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update configuration',
        errorCode: 'CONFIG_UPDATE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/configuration/bulk:
 *   put:
 *     summary: Bulk update configuration
 *     description: Update multiple configuration values at once (admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: object
 *                 description: Key-value pairs of configuration updates
 *             required:
 *               - updates
 *     responses:
 *       200:
 *         description: Bulk update results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: object
 *                 errors:
 *                   type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/bulk',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 10, 15 * 60 * 1000),
  [
    body('updates').isObject().withMessage('Updates must be an object')
  ],
  async (req, res) => {
    try {
      // Check if user has admin role
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

      const { updates } = req.body;
      const userId = req.user.id;
      const results = {};
      const updateErrors = [];

      // Process each update
      for (const [key, value] of Object.entries(updates)) {
        try {
          const success = await ConfigurationManager.set(key, value, userId);
          results[key] = success;
          if (!success) {
            updateErrors.push({ key, error: 'Validation failed' });
          }
        } catch (error) {
          results[key] = false;
          updateErrors.push({ key, error: error.message });
        }
      }

      logger.info('Bulk configuration update', { 
        userId, 
        userEmail: req.user.email,
        updatesCount: Object.keys(updates).length,
        errorsCount: updateErrors.length
      });

      res.json({
        success: updateErrors.length === 0,
        results,
        errors: updateErrors,
        message: `Updated ${Object.keys(results).length} configuration items${updateErrors.length > 0 ? ` with ${updateErrors.length} errors` : ''}`
      });

    } catch (error) {
      logger.error('Error in bulk configuration update:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform bulk update',
        errorCode: 'BULK_UPDATE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/configuration/export:
 *   get:
 *     summary: Export configuration
 *     description: Export current configuration for backup (admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration export
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 export:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/export',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 5, 15 * 60 * 1000),
  async (req, res) => {
    try {
      // Check if user has admin role
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          errorCode: 'ADMIN_ACCESS_REQUIRED'
        });
      }

      const exportData = await ConfigurationManager.exportConfiguration();

      logger.info('Configuration exported', { 
        userId: req.user.id, 
        userEmail: req.user.email 
      });

      res.json({
        success: true,
        export: exportData
      });

    } catch (error) {
      logger.error('Error exporting configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export configuration',
        errorCode: 'CONFIG_EXPORT_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/configuration/import:
 *   post:
 *     summary: Import configuration
 *     description: Import configuration from backup (admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               configData:
 *                 type: object
 *                 description: Configuration data to import
 *             required:
 *               - configData
 *     responses:
 *       200:
 *         description: Configuration imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid configuration data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/import',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 3, 15 * 60 * 1000),
  [
    body('configData').isObject().withMessage('Config data must be an object')
  ],
  async (req, res) => {
    try {
      // Check if user has admin role
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

      const { configData } = req.body;
      const userId = req.user.id;

      const success = await ConfigurationManager.importConfiguration(configData, userId);

      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Failed to import configuration - invalid data format or validation errors',
          errorCode: 'CONFIG_IMPORT_ERROR'
        });
      }

      logger.info('Configuration imported', { 
        userId, 
        userEmail: req.user.email,
        timestamp: configData.timestamp
      });

      res.json({
        success: true,
        message: 'Configuration imported successfully'
      });

    } catch (error) {
      logger.error('Error importing configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import configuration',
        errorCode: 'CONFIG_IMPORT_ERROR'
      });
    }
  }
);

// Alias: /api/v1/config for test compatibility
router.get('/api/v1/config',
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
      const configuration = await ConfigurationManager.getFullConfig();
      res.json({
        success: true,
        configuration,
        message: 'Configuration retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get configuration',
        errorCode: 'CONFIG_GET_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/configuration/monitoring:
 *   get:
 *     summary: Get monitoring configuration
 *     description: Get Nova Sentinel and GoAlert configuration (admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monitoring configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get('/monitoring',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 30),
  async (req, res) => {
    try {
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      // Get monitoring configuration from ConfigurationManager
      const monitoringConfig = {
        sentinelEnabled: await ConfigurationManager.get('sentinel.enabled', false),
        sentinelUrl: await ConfigurationManager.get('sentinel.url', 'http://localhost:3001'),
        sentinelApiKey: await ConfigurationManager.get('sentinel.apiKey', ''),
        sentinelWebhookSecret: await ConfigurationManager.get('sentinel.webhookSecret', ''),
        goAlertEnabled: await ConfigurationManager.get('goalert.enabled', false),
        goAlertUrl: await ConfigurationManager.get('goalert.url', 'http://localhost:8081'),
        goAlertApiKey: await ConfigurationManager.get('goalert.apiKey', ''),
        goAlertSmtpHost: await ConfigurationManager.get('goalert.smtp.host', ''),
        goAlertSmtpPort: await ConfigurationManager.get('goalert.smtp.port', '587'),
        goAlertSmtpUser: await ConfigurationManager.get('goalert.smtp.user', ''),
        goAlertSmtpPass: await ConfigurationManager.get('goalert.smtp.pass', '')
      };

      res.json({
        success: true,
        data: monitoringConfig
      });

    } catch (error) {
      logger.error('Error getting monitoring configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get monitoring configuration'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/configuration/monitoring:
 *   post:
 *     summary: Update monitoring configuration
 *     description: Update Nova Sentinel and GoAlert configuration (admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sentinelEnabled:
 *                 type: boolean
 *               sentinelUrl:
 *                 type: string
 *               sentinelApiKey:
 *                 type: string
 *               sentinelWebhookSecret:
 *                 type: string
 *               goAlertEnabled:
 *                 type: boolean
 *               goAlertUrl:
 *                 type: string
 *               goAlertApiKey:
 *                 type: string
 *               goAlertSmtpHost:
 *                 type: string
 *               goAlertSmtpPort:
 *                 type: string
 *               goAlertSmtpUser:
 *                 type: string
 *               goAlertSmtpPass:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 */
router.post('/monitoring',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 10),
  [
    body('sentinelEnabled').optional().isBoolean(),
    body('sentinelUrl').optional().isURL(),
    body('sentinelApiKey').optional().isString(),
    body('sentinelWebhookSecret').optional().isString(),
    body('goAlertEnabled').optional().isBoolean(),
    body('goAlertUrl').optional().isURL(),
    body('goAlertApiKey').optional().isString(),
    body('goAlertSmtpHost').optional().isString(),
    body('goAlertSmtpPort').optional().isString(),
    body('goAlertSmtpUser').optional().isString(),
    body('goAlertSmtpPass').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: errors.array()
        });
      }

      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const {
        sentinelEnabled,
        sentinelUrl,
        sentinelApiKey,
        sentinelWebhookSecret,
        goAlertEnabled,
        goAlertUrl,
        goAlertApiKey,
        goAlertSmtpHost,
        goAlertSmtpPort,
        goAlertSmtpUser,
        goAlertSmtpPass
      } = req.body;

      // Update monitoring configuration
      const updates = [];

      if (sentinelEnabled !== undefined) {
        await ConfigurationManager.set('sentinel.enabled', sentinelEnabled, req.user.id);
        updates.push('sentinel.enabled');
      }
      if (sentinelUrl !== undefined) {
        await ConfigurationManager.set('sentinel.url', sentinelUrl, req.user.id);
        updates.push('sentinel.url');
      }
      if (sentinelApiKey !== undefined) {
        await ConfigurationManager.set('sentinel.apiKey', sentinelApiKey, req.user.id);
        updates.push('sentinel.apiKey');
      }
      if (sentinelWebhookSecret !== undefined) {
        await ConfigurationManager.set('sentinel.webhookSecret', sentinelWebhookSecret, req.user.id);
        updates.push('sentinel.webhookSecret');
      }
      if (goAlertEnabled !== undefined) {
        await ConfigurationManager.set('goalert.enabled', goAlertEnabled, req.user.id);
        updates.push('goalert.enabled');
      }
      if (goAlertUrl !== undefined) {
        await ConfigurationManager.set('goalert.url', goAlertUrl, req.user.id);
        updates.push('goalert.url');
      }
      if (goAlertApiKey !== undefined) {
        await ConfigurationManager.set('goalert.apiKey', goAlertApiKey, req.user.id);
        updates.push('goalert.apiKey');
      }
      if (goAlertSmtpHost !== undefined) {
        await ConfigurationManager.set('goalert.smtp.host', goAlertSmtpHost, req.user.id);
        updates.push('goalert.smtp.host');
      }
      if (goAlertSmtpPort !== undefined) {
        await ConfigurationManager.set('goalert.smtp.port', goAlertSmtpPort, req.user.id);
        updates.push('goalert.smtp.port');
      }
      if (goAlertSmtpUser !== undefined) {
        await ConfigurationManager.set('goalert.smtp.user', goAlertSmtpUser, req.user.id);
        updates.push('goalert.smtp.user');
      }
      if (goAlertSmtpPass !== undefined) {
        await ConfigurationManager.set('goalert.smtp.pass', goAlertSmtpPass, req.user.id);
        updates.push('goalert.smtp.pass');
      }

      logger.info(`Monitoring configuration updated by ${req.user.email}:`, updates);

      res.json({
        success: true,
        message: 'Monitoring configuration updated successfully',
        updatedKeys: updates
      });

    } catch (error) {
      logger.error('Error updating monitoring configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update monitoring configuration'
      });
    }
  }
);

export default router;
