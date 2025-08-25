/**
 * Configuration Management API
 * Provides hierarchical configuration management with environment variable fallbacks
 */

import { Router } from 'express';
import { PrismaClient } from '../../../prisma/generated/core/index.js';
import { logger } from '../logger.js';
import { ensureAuth } from '../middleware/auth.js';
import { validateConfigValue, getConfigValidationSchema } from '../utils/configValidation.js';
import ConfigurationService from '../services/configuration.service.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * Hierarchical configuration resolution:
 * 1. Environment variables (highest priority)
 * 2. Database configuration (admin configurable)
 * 3. Built-in defaults (fallback)
 */
class ConfigurationManager {
  static environmentVariableMap = {
    // Branding
    'organization.name': 'ORGANIZATION_NAME',
    'organization.logo_url': 'LOGO_URL',
    'organization.favicon_url': 'FAVICON_URL',
    'organization.primary_color': 'PRIMARY_COLOR',
    'organization.secondary_color': 'SECONDARY_COLOR',

    // Messages
    'messages.welcome': 'WELCOME_MESSAGE',
    'messages.help': 'HELP_MESSAGE',

    // Status Messages
    'status.open': 'STATUS_OPEN_MSG',
    'status.closed': 'STATUS_CLOSED_MSG',
    'status.error': 'STATUS_ERROR_MSG',
    'status.meeting': 'STATUS_MEETING_MSG',
    'status.brb': 'STATUS_BRB_MSG',
    'status.lunch': 'STATUS_LUNCH_MSG',
    'status.unavailable': 'STATUS_UNAVAILABLE_MSG',

    // Security
    'security.min_pin_length': 'MIN_PIN_LENGTH',
    'security.max_pin_length': 'MAX_PIN_LENGTH',
    'security.rate_limit_window': 'RATE_LIMIT_WINDOW',
    'security.rate_limit_max': 'RATE_LIMIT_MAX',
    'security.submit_ticket_limit': 'SUBMIT_TICKET_LIMIT',
    'security.api_login_limit': 'API_LOGIN_LIMIT',

    // Features
    'features.directory_enabled': 'DIRECTORY_ENABLED',
    'features.cosmo_enabled': 'COSMO_ENABLED',
    'features.ai_ticket_processing': 'AI_TICKET_PROCESSING_ENABLED',
    'features.sentiment_analysis': 'ML_SENTIMENT_ANALYSIS_ENABLED',

    // Integrations
    'integrations.directory_provider': 'DIRECTORY_PROVIDER',
    'integrations.cosmo_model_provider': 'COSMO_MODEL_PROVIDER',
    'integrations.cosmo_personality': 'COSMO_PERSONALITY',
  };

  /**
   * Get configuration value with hierarchical resolution
   */
  static async getValue(key) {
    try {
      // 1. Check environment variable first (highest priority)
      const envVar = this.environmentVariableMap[key];
      if (envVar && process.env[envVar] !== undefined) {
        return {
          value: process.env[envVar],
          source: 'environment',
          key,
        };
      }

      // 2. Check database configuration
      const dbConfig = await prisma.config.findUnique({
        where: { key },
      });

      if (dbConfig && dbConfig.value !== null) {
        return {
          value: this.parseValue(dbConfig.value, dbConfig.valueType),
          source: 'database',
          key,
          ...dbConfig,
        };
      }

      // 3. Use default value from database schema
      if (dbConfig && dbConfig.defaultValue !== null) {
        return {
          value: this.parseValue(dbConfig.defaultValue, dbConfig.valueType),
          source: 'default',
          key,
          ...dbConfig,
        };
      }

      return null;
    } catch (error) {
      logger.error(`Error getting config value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get all configuration values by category
   */
  static async getByCategory(category, includeAdvanced = false) {
    try {
      const whereClause = { category };
      if (!includeAdvanced) {
        whereClause.isAdvanced = false;
      }

      const configs = await prisma.config.findMany({
        where: whereClause,
        orderBy: [{ displayOrder: 'asc' }, { key: 'asc' }],
      });

      const result = {};
      for (const config of configs) {
        const resolved = await this.getValue(config.key);
        if (resolved) {
          result[config.key] = resolved;
        }
      }

      return result;
    } catch (error) {
      logger.error(`Error getting config by category ${category}:`, error);
      return {};
    }
  }

  /**
   * Set configuration value with validation and audit
   */
  static async setValue(key, value, userId, reason = null) {
    try {
      // Check if configuration exists and is UI editable
      const config = await prisma.config.findUnique({
        where: { key },
      });

      if (!config) {
        throw new Error(`Configuration key '${key}' not found`);
      }

      if (!config.isUIEditable) {
        throw new Error(`Configuration key '${key}' is not editable via UI`);
      }

      // Validate the value
      const isValid = await validateConfigValue(key, value, config);
      if (!isValid.valid) {
        throw new Error(`Invalid value for '${key}': ${isValid.error}`);
      }

      // Get current value for audit trail
      const currentValue = await this.getValue(key);
      const oldValue = currentValue ? currentValue.value : null;

      // Convert value to string for storage
      const stringValue = this.stringifyValue(value, config.valueType);

      // Update configuration in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update config
        const updatedConfig = await tx.config.update({
          where: { key },
          data: {
            value: stringValue,
            updatedBy: userId,
            updatedAt: new Date(),
          },
        });

        // Create audit trail
        await tx.configHistory.create({
          data: {
            configKey: key,
            oldValue: oldValue ? String(oldValue) : null,
            newValue: stringValue,
            changedBy: userId,
            changeReason: reason,
          },
        });

        return updatedConfig;
      });

      logger.info(`Configuration updated: ${key} = ${stringValue} by user ${userId}`);
      return result;
    } catch (error) {
      logger.error(`Error setting config value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Parse stored value based on type
   */
  static parseValue(value, type) {
    if (value === null || value === undefined) return null;

    switch (type) {
      case 'boolean':
        return value === 'true' || value === true;
      case 'number':
        return Number(value);
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      case 'array':
        try {
          return Array.isArray(value) ? value : JSON.parse(value);
        } catch {
          return [];
        }
      default:
        return String(value);
    }
  }

  /**
   * Convert value to string for storage
   */
  static stringifyValue(value, type) {
    if (value === null || value === undefined) return null;

    switch (type) {
      case 'boolean':
        return String(Boolean(value));
      case 'number':
        return String(Number(value));
      case 'json':
      case 'array':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }
}

// GET /api/v1/config - Get all public configuration
router.get('/', async (req, res) => {
  try {
    const { category, includeAdvanced = false } = req.query;

    let result;
    if (category) {
      result = await ConfigurationManager.getByCategory(category, includeAdvanced === 'true');
    } else {
      // Get all public configurations
      const configs = await prisma.config.findMany({
        where: {
          isPublic: true,
          ...(includeAdvanced !== 'true' ? { isAdvanced: false } : {}),
        },
        orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }, { key: 'asc' }],
      });

      result = {};
      for (const config of configs) {
        const resolved = await ConfigurationManager.getValue(config.key);
        if (resolved) {
          result[config.key] = resolved.value;
        }
      }
    }

    res.json(result);
  } catch (error) {
    logger.error('Error getting public configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/config/admin - Get all configuration (admin only)
router.get('/admin', ensureAuth, async (req, res) => {
  try {
    const { category, includeAdvanced = true } = req.query;

    let result;
    if (category) {
      result = await ConfigurationManager.getByCategory(category, includeAdvanced === 'true');
    } else {
      // Get all configurations with metadata
      const configs = await prisma.config.findMany({
        orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }, { key: 'asc' }],
      });

      result = {};
      for (const config of configs) {
        const resolved = await ConfigurationManager.getValue(config.key);
        if (resolved) {
          result[config.key] = {
            value: resolved.value,
            source: resolved.source,
            metadata: {
              description: config.description,
              category: config.category,
              subcategory: config.subcategory,
              valueType: config.valueType,
              isUIEditable: config.isUIEditable,
              isRequired: config.isRequired,
              defaultValue: config.defaultValue,
              helpText: config.helpText,
              isAdvanced: config.isAdvanced,
              displayOrder: config.displayOrder,
            },
          };
        }
      }
    }

    res.json(result);
  } catch (error) {
    logger.error('Error getting admin configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/config/:key - Get specific configuration value
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;

    const config = await prisma.config.findUnique({
      where: { key },
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Check if public or user is authenticated
    if (!config.isPublic && !req.user) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const resolved = await ConfigurationManager.getValue(key);
    if (!resolved) {
      return res.status(404).json({ error: 'Configuration value not found' });
    }

    res.json({
      key,
      value: resolved.value,
      source: resolved.source,
      ...(req.user
        ? {
            metadata: {
              description: config.description,
              category: config.category,
              subcategory: config.subcategory,
              valueType: config.valueType,
              helpText: config.helpText,
            },
          }
        : {}),
    });
  } catch (error) {
    logger.error(`Error getting configuration for key ${req.params.key}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/v1/config/:key - Update configuration value (admin only)
router.put('/:key', ensureAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, reason } = req.body;
    const userId = req.user.id;

    const updated = await ConfigurationManager.setValue(key, value, userId, reason);

    const resolved = await ConfigurationManager.getValue(key);

    res.json({
      success: true,
      key,
      value: resolved.value,
      source: resolved.source,
      updatedAt: updated.updatedAt,
      updatedBy: updated.updatedBy,
    });
  } catch (error) {
    logger.error(`Error updating configuration for key ${req.params.key}:`, error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/config/organization - Update organization configuration (admin only)
router.post('/organization', ensureAuth, async (req, res) => {
  try {
    const {
      organizationName,
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      welcomeMessage,
      helpMessage,
    } = req.body;
    const userId = req.user.id;
    const reason = 'Organization configuration update';

    const updates = [];
    const errors = [];

    // Define organization config mappings
    const organizationConfigs = [
      { key: 'organization_name', value: organizationName, required: true },
      { key: 'logo_url', value: logoUrl },
      { key: 'favicon_url', value: faviconUrl },
      { key: 'primary_color', value: primaryColor },
      { key: 'secondary_color', value: secondaryColor },
      { key: 'welcome_message', value: welcomeMessage },
      { key: 'help_message', value: helpMessage },
    ];

    // Validate required fields
    if (!organizationName || organizationName.trim().length === 0) {
      return res.status(400).json({
        error: 'Organization name is required',
        field: 'organizationName',
      });
    }

    // Update each configuration
    for (const config of organizationConfigs) {
      if (config.value !== undefined && config.value !== null) {
        try {
          const updated = await ConfigurationManager.setValue(
            config.key,
            config.value,
            userId,
            reason,
          );
          if (updated) {
            const resolved = await ConfigurationManager.getValue(config.key);
            updates.push({
              key: config.key,
              value: resolved.value,
              success: true,
            });
          } else {
            errors.push({
              key: config.key,
              error: 'Failed to update configuration',
            });
          }
        } catch (error) {
          logger.error(`Error updating ${config.key}:`, error);
          errors.push({
            key: config.key,
            error: error.message,
          });
        }
      }
    }

    // Clear configuration cache to ensure fresh values
    ConfigurationManager.clearCache();

    if (errors.length > 0 && updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update organization configuration',
        errors,
      });
    }

    res.json({
      success: true,
      message: 'Organization configuration updated successfully',
      updates,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logger.error('Error updating organization configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/v1/config/organization - Get organization configuration
router.get('/organization', async (req, res) => {
  try {
    const organizationKeys = [
      'organization_name',
      'logo_url',
      'favicon_url',
      'primary_color',
      'secondary_color',
      'welcome_message',
      'help_message',
    ];

    const result = {};
    for (const key of organizationKeys) {
      const resolved = await ConfigurationManager.getValue(key);
      if (resolved) {
        result[key] = resolved.value;
      }
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error getting organization configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/v1/config/bulk - Bulk update configurations (admin only)
router.post('/bulk', ensureAuth, async (req, res) => {
  try {
    const { configs, reason } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(configs)) {
      return res.status(400).json({ error: 'Configs must be an array' });
    }

    const results = [];
    const errors = [];

    for (const { key, value } of configs) {
      try {
        await ConfigurationManager.setValue(key, value, userId, reason);
        const resolved = await ConfigurationManager.getValue(key);
        results.push({
          key,
          value: resolved.value,
          success: true,
        });
      } catch (error) {
        logger.error(`Error updating config ${key}:`, error);
        errors.push({
          key,
          error: error.message,
        });
      }
    }

    res.json({
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logger.error('Error bulk updating configurations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/bulk', ensureAuth, async (req, res) => {
  try {
    const { configs, reason } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(configs)) {
      return res.status(400).json({ error: 'Configs must be an array' });
    }

    const results = [];
    const errors = [];

    for (const { key, value } of configs) {
      try {
        await ConfigurationManager.setValue(key, value, userId, reason);
        const resolved = await ConfigurationManager.getValue(key);
        results.push({
          key,
          value: resolved.value,
          success: true,
        });
      } catch (error) {
        errors.push({
          key,
          error: error.message,
        });
      }
    }

    res.json({
      success: errors.length === 0,
      results,
      errors,
      total: configs.length,
      successful: results.length,
      failed: errors.length,
    });
  } catch (error) {
    logger.error('Error in bulk configuration update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/config/:key/history - Get configuration change history (admin only)
router.get('/:key/history', ensureAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const history = await prisma.configHistory.findMany({
      where: { configKey: key },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        config: {
          select: {
            description: true,
            category: true,
          },
        },
      },
    });

    const total = await prisma.configHistory.count({
      where: { configKey: key },
    });

    res.json({
      history,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Error getting configuration history for key ${req.params.key}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/config/schema/validation - Get validation schema for all configs
router.get('/schema/validation', ensureAuth, async (req, res) => {
  try {
    const configs = await prisma.config.findMany({
      select: {
        key: true,
        valueType: true,
        validationRules: true,
        isRequired: true,
        defaultValue: true,
      },
    });

    const schema = {};
    for (const config of configs) {
      schema[config.key] = getConfigValidationSchema(config.key, config);
    }

    res.json(schema);
  } catch (error) {
    logger.error('Error getting validation schema:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/config/templates - Get configuration templates (admin only)
router.get('/templates', ensureAuth, async (req, res) => {
  try {
    const templates = await prisma.configTemplate.findMany({
      orderBy: [{ isDefault: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    });

    res.json(templates);
  } catch (error) {
    logger.error('Error getting configuration templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/config/templates/:id/apply - Apply configuration template (admin only)
router.post('/templates/:id/apply', ensureAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const template = await prisma.configTemplate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const configs = Object.entries(template.template);
    const results = [];
    const errors = [];

    for (const [key, value] of configs) {
      try {
        await ConfigurationManager.setValue(
          key,
          value,
          userId,
          reason || `Applied template: ${template.name}`,
        );
        results.push({ key, value, success: true });
      } catch (error) {
        errors.push({ key, error: error.message });
      }
    }

    res.json({
      success: errors.length === 0,
      template: template.name,
      results,
      errors,
      total: configs.length,
      applied: results.length,
      failed: errors.length,
    });
  } catch (error) {
    logger.error('Error applying configuration template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ====== NEW CONFIGURATION SERVICE CATEGORY ENDPOINTS ======

/**
 * Get all categorized configuration
 */
router.get('/categories/all', ensureAuth, async (req, res) => {
  try {
    const config = await ConfigurationService.getAllCategorizedConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Error getting all categorized configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Get messages configuration
 */
router.get('/categories/messages', async (req, res) => {
  try {
    const config = await ConfigurationService.getMessagesConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Error getting messages configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Update messages configuration
 */
router.post('/categories/messages', ensureAuth, async (req, res) => {
  try {
    const { config } = req.body;
    const userId = req.user?.id || 'system';
    const results = await ConfigurationService.setValues(config, userId, 'UI update');
    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('Error updating messages configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Get feature flags configuration
 */
router.get('/categories/features', ensureAuth, async (req, res) => {
  try {
    const config = await ConfigurationService.getFeatureFlagsConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Error getting feature flags configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Update feature flags configuration
 */
router.post('/categories/features', ensureAuth, async (req, res) => {
  try {
    const { config } = req.body;
    const userId = req.user?.id || 'system';
    const results = await ConfigurationService.setValues(config, userId, 'Feature flags update');
    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('Error updating feature flags configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Get security configuration
 */
router.get('/categories/security', ensureAuth, async (req, res) => {
  try {
    const config = await ConfigurationService.getSecurityConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Error getting security configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Update security configuration
 */
router.post('/categories/security', ensureAuth, async (req, res) => {
  try {
    const { config } = req.body;
    const userId = req.user?.id || 'system';
    const results = await ConfigurationService.setValues(
      config,
      userId,
      'Security settings update',
    );
    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('Error updating security configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Get upload configuration
 */
router.get('/categories/upload', ensureAuth, async (req, res) => {
  try {
    const config = await ConfigurationService.getUploadConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Error getting upload configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Update upload configuration
 */
router.post('/categories/upload', ensureAuth, async (req, res) => {
  try {
    const { config } = req.body;
    const userId = req.user?.id || 'system';
    const results = await ConfigurationService.setValues(config, userId, 'Upload settings update');
    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('Error updating upload configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Get system configuration
 */
router.get('/categories/system', ensureAuth, async (req, res) => {
  try {
    const config = await ConfigurationService.getSystemConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Error getting system configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Update system configuration
 */
router.post('/categories/system', ensureAuth, async (req, res) => {
  try {
    const { config } = req.body;
    const userId = req.user?.id || 'system';
    const results = await ConfigurationService.setValues(config, userId, 'System settings update');
    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('Error updating system configuration:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
