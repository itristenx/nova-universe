/**
 * Configuration Service
 * Centralized service for retrieving configuration values with proper fallback hierarchy:
 * 1. Database configuration (admin configurable via UI)
 * 2. Environment variables (deployment specific)
 * 3. Built-in defaults (fallback)
 */

import { PrismaClient } from '../../../prisma/generated/core/index.js';
import { logger } from '../logger.js';

// Initialize Prisma client
const prisma = new PrismaClient();

class ConfigurationService {
  // Cache for configuration values to avoid repeated database queries
  static cache = new Map();
  static cacheExpiry = new Map();
  static CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Environment variable mapping for fallback
   */
  static environmentVariableMap = {
    // Organization & Branding
    organization_name: 'ORGANIZATION_NAME',
    company_name: 'COMPANY_NAME',
    logo_url: 'LOGO_URL',
    favicon_url: 'FAVICON_URL',
    primary_color: 'PRIMARY_COLOR',
    secondary_color: 'SECONDARY_COLOR',

    // Messages
    welcome_message: 'WELCOME_MESSAGE',
    help_message: 'HELP_MESSAGE',
    status_open_msg: 'STATUS_OPEN_MSG',
    status_closed_msg: 'STATUS_CLOSED_MSG',
    status_error_msg: 'STATUS_ERROR_MSG',
    status_meeting_msg: 'STATUS_MEETING_MSG',
    status_brb_msg: 'STATUS_BRB_MSG',
    status_lunch_msg: 'STATUS_LUNCH_MSG',
    status_unavailable_msg: 'STATUS_UNAVAILABLE_MSG',

    // Email Settings
    support_email: 'SUPPORT_EMAIL',
    from_email: 'FROM_EMAIL',
    from_name: 'FROM_NAME',
    email_tracking_enabled: 'EMAIL_TRACKING_ENABLED',
    email_tracking_domain: 'EMAIL_TRACKING_DOMAIN',

    // Security Settings
    rate_limit_window: 'RATE_LIMIT_WINDOW',
    rate_limit_max: 'RATE_LIMIT_MAX',
    min_pin_length: 'MIN_PIN_LENGTH',
    max_pin_length: 'MAX_PIN_LENGTH',

    // File Upload Settings
    upload_max_file_size: 'UPLOAD_MAX_FILE_SIZE',
    upload_allowed_types: 'UPLOAD_ALLOWED_TYPES',

    // Feature Flags
    cosmo_enabled: 'COSMO_ENABLED',
    cosmo_xp_enabled: 'COSMO_XP_ENABLED',
    mcp_enabled: 'MCP_ENABLED',
    ai_ticket_processing_enabled: 'AI_TICKET_PROCESSING_ENABLED',
    ai_duplicate_detection_enabled: 'AI_DUPLICATE_DETECTION_ENABLED',
    ai_trend_analysis_enabled: 'AI_TREND_ANALYSIS_ENABLED',
    ml_sentiment_analysis_enabled: 'ML_SENTIMENT_ANALYSIS_ENABLED',
    ml_language_detection_enabled: 'ML_LANGUAGE_DETECTION_ENABLED',
    directory_enabled: 'DIRECTORY_ENABLED',
    input_sanitization_enabled: 'ENABLE_INPUT_SANITIZATION',
    field_redaction_enabled: 'ENABLE_FIELD_REDACTION',

    // URLs
    base_url: 'WEB_BASE_URL',
    api_url: 'API_URL',
    public_url: 'PUBLIC_URL',

    // System Settings
    backup_retention_days: 'BACKUP_RETENTION_DAYS',
    health_check_interval: 'HEALTH_CHECK_INTERVAL',
    log_level: 'LOG_LEVEL',
  };

  /**
   * Built-in defaults for critical configuration values
   */
  static defaults = {
    // Organization & Branding
    organization_name: 'Nova ITSM',
    company_name: 'Nova ITSM',
    logo_url: '/logo.png',
    favicon_url: '/vite.svg',
    primary_color: '#1D4ED8',
    secondary_color: '#9333EA',

    // Messages
    welcome_message: 'Welcome to the Help Desk',
    help_message: 'Need to report an issue?',
    status_open_msg: 'Open',
    status_closed_msg: 'Closed',
    status_error_msg: 'Error',
    status_meeting_msg: 'In a Meeting - Back Soon',
    status_brb_msg: 'Be Right Back',
    status_lunch_msg: 'Out to Lunch - Back in 1 Hour',
    status_unavailable_msg: 'Status Unavailable',

    // Email Settings
    support_email: 'support@example.com',
    from_email: 'noreply@example.com',
    from_name: 'Nova ITSM',
    email_tracking_enabled: true,
    email_tracking_domain: 'example.com',

    // Security Settings
    rate_limit_window: 900000,
    rate_limit_max: 100,
    min_pin_length: 4,
    max_pin_length: 8,

    // File Upload Settings
    upload_max_file_size: 10485760,
    upload_allowed_types: 'jpeg,jpg,png,gif,svg,ico,pdf,txt,json,zip,doc,docx,xls,xlsx,ppt,pptx',

    // Feature Flags
    cosmo_enabled: true,
    cosmo_xp_enabled: true,
    mcp_enabled: true,
    ai_ticket_processing_enabled: true,
    ai_duplicate_detection_enabled: true,
    ai_trend_analysis_enabled: true,
    ml_sentiment_analysis_enabled: true,
    ml_language_detection_enabled: true,
    directory_enabled: false,
    input_sanitization_enabled: true,
    field_redaction_enabled: true,

    // URLs
    base_url: 'http://localhost:3000',
    api_url: 'http://localhost:3000',
    public_url: 'http://localhost:3000',

    // System Settings
    backup_retention_days: 7,
    health_check_interval: 30000,
    log_level: 'info',
  };

  /**
   * Get configuration value with proper fallback hierarchy
   * @param {string} key - Configuration key
   * @param {boolean} useCache - Whether to use cache (default: true)
   * @returns {Promise<any>} Configuration value
   */
  static async getValue(key, useCache = true) {
    try {
      // Check cache first
      if (useCache && this.cache.has(key)) {
        const expiry = this.cacheExpiry.get(key);
        if (expiry && Date.now() < expiry) {
          return this.cache.get(key);
        }
        // Cache expired, remove it
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }

      let value = null;

      // 1. Try database first (highest priority - admin configurable)
      try {
        const config = await prisma.config.findUnique({
          where: { key },
        });

        if (config && config.value !== null && config.value !== '') {
          value = this.parseConfigValue(config.value, config.value_type);
          logger.debug(`Config: Using database value for ${key}: ${value}`);
        }
      } catch (dbError) {
        logger.warn(`Failed to get ${key} from database:`, dbError.message);
      }

      // 2. Fallback to environment variable
      if (value === null) {
        const envKey = this.environmentVariableMap[key];
        if (envKey && process.env[envKey]) {
          value = process.env[envKey];
          logger.debug(`Config: Using environment value for ${key}: ${value}`);
        }
      }

      // 3. Fallback to built-in default
      if (value === null) {
        value = this.defaults[key];
        if (value !== undefined) {
          logger.debug(`Config: Using default value for ${key}: ${value}`);
        }
      }

      // Cache the result
      if (useCache && value !== null) {
        this.cache.set(key, value);
        this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
      }

      return value;
    } catch (error) {
      logger.error(`Error getting configuration for ${key}:`, error);
      return this.defaults[key] || null;
    }
  }

  /**
   * Get multiple configuration values at once
   * @param {string[]} keys - Array of configuration keys
   * @returns {Promise<Object>} Object with key-value pairs
   */
  static async getValues(keys) {
    const result = {};

    try {
      // Batch database query for efficiency
      const dbConfigs = await prisma.config.findMany({
        where: { key: { in: keys } },
      });

      const dbConfigMap = new Map(
        dbConfigs.map((config) => [
          config.key,
          this.parseConfigValue(config.value, config.value_type),
        ]),
      );

      for (const key of keys) {
        let value = dbConfigMap.get(key);

        // Fallback to environment variable
        if (value === null || value === undefined || value === '') {
          const envKey = this.environmentVariableMap[key];
          if (envKey && process.env[envKey]) {
            value = process.env[envKey];
          }
        }

        // Fallback to default
        if (value === null || value === undefined || value === '') {
          value = this.defaults[key];
        }

        result[key] = value;
      }
    } catch (error) {
      logger.error('Error getting multiple configuration values:', error);
      // Fallback to individual gets
      for (const key of keys) {
        result[key] = await this.getValue(key, false);
      }
    }

    return result;
  }

  /**
   * Get organization-specific configuration
   * @returns {Promise<Object>} Organization configuration
   */
  static async getOrganizationConfig() {
    const keys = [
      'organization_name',
      'company_name',
      'logo_url',
      'favicon_url',
      'primary_color',
      'secondary_color',
      'welcome_message',
      'help_message',
    ];

    return await this.getValues(keys);
  }

  /**
   * Get email-specific configuration
   * @returns {Promise<Object>} Email configuration
   */
  static async getEmailConfig() {
    const keys = [
      'organization_name',
      'company_name',
      'support_email',
      'from_email',
      'from_name',
      'base_url',
      'api_url',
      'public_url',
    ];

    const config = await this.getValues(keys);

    // Apply URL fallback chain for base URL
    config.baseUrl =
      config.base_url ||
      process.env.WEB_BASE_URL ||
      process.env.BASE_URL ||
      process.env.PUBLIC_URL ||
      'http://localhost:3000';

    // Ensure company name has proper fallback
    config.companyName = config.organization_name || config.company_name || 'Nova ITSM';

    return config;
  }

  /**
   * Parse configuration value based on type
   * @param {string} value - Raw value from database
   * @param {string} type - Value type (string, number, boolean, json)
   * @returns {any} Parsed value
   */
  static parseConfigValue(value, type) {
    if (value === null || value === undefined) {
      return null;
    }

    try {
      switch (type) {
        case 'boolean':
          return value === 'true' || value === true;
        case 'number':
          return Number(value);
        case 'json':
          return JSON.parse(value);
        case 'string':
        default:
          return String(value);
      }
    } catch (error) {
      logger.warn(`Failed to parse config value "${value}" as ${type}:`, error.message);
      return value; // Return raw value if parsing fails
    }
  }

  /**
   * Clear configuration cache
   * @param {string} key - Specific key to clear, or null to clear all
   */
  static clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
    logger.info(key ? `Cleared cache for ${key}` : 'Cleared all configuration cache');
  }

  /**
   * Refresh configuration cache
   * Useful after configuration updates via admin interface
   */
  static async refreshCache() {
    this.clearCache();
    logger.info('Configuration cache refreshed');
  }

  /**
   * Get configuration with metadata for admin interface
   * @param {string} key - Configuration key
   * @returns {Promise<Object>} Configuration with metadata
   */
  static async getConfigWithMetadata(key) {
    try {
      const config = await prisma.config.findUnique({
        where: { key },
      });

      if (!config) {
        return null;
      }

      const value = await this.getValue(key, false);
      const envKey = this.environmentVariableMap[key];
      const envValue = envKey ? process.env[envKey] : null;
      const defaultValue = this.defaults[key];

      return {
        ...config,
        currentValue: value,
        environmentValue: envValue,
        defaultValue: defaultValue,
        source: config.value ? 'database' : envValue ? 'environment' : 'default',
      };
    } catch (error) {
      logger.error(`Error getting config metadata for ${key}:`, error);
      return null;
    }
  }

  /**
   * Update configuration value
   * @param {string} key - Configuration key
   * @param {any} value - New value
   * @param {string} userId - User making the change
   * @param {string} reason - Reason for change
   * @returns {Promise<boolean>} Success status
   */
  static async setValue(key, value, userId, reason = null) {
    try {
      // Update database
      await prisma.config.update({
        where: { key },
        data: {
          value: String(value),
          updated_at: new Date(),
          updated_by: userId,
        },
      });

      // Clear cache for this key
      this.clearCache(key);

      // Log the change
      logger.info(
        `Configuration updated: ${key} = ${value} by user ${userId}${reason ? ` (${reason})` : ''}`,
      );

      return true;
    } catch (error) {
      logger.error(`Error updating configuration ${key}:`, error);
      return false;
    }
  }

  /**
   * Get messages configuration
   * @returns {Promise<Object>} Messages configuration
   */
  static async getMessagesConfig() {
    const keys = [
      'welcome_message',
      'help_message',
      'status_open_msg',
      'status_closed_msg',
      'status_error_msg',
      'status_meeting_msg',
      'status_brb_msg',
      'status_lunch_msg',
      'status_unavailable_msg',
    ];

    return await this.getValues(keys);
  }

  /**
   * Get feature flags configuration
   * @returns {Promise<Object>} Feature flags configuration
   */
  static async getFeatureFlagsConfig() {
    const keys = [
      'cosmo_enabled',
      'cosmo_xp_enabled',
      'mcp_enabled',
      'ai_ticket_processing_enabled',
      'ai_duplicate_detection_enabled',
      'ai_trend_analysis_enabled',
      'ml_sentiment_analysis_enabled',
      'ml_language_detection_enabled',
      'directory_enabled',
      'input_sanitization_enabled',
      'field_redaction_enabled',
      'email_tracking_enabled',
    ];

    return await this.getValues(keys);
  }

  /**
   * Get security settings configuration
   * @returns {Promise<Object>} Security configuration
   */
  static async getSecurityConfig() {
    const keys = ['rate_limit_window', 'rate_limit_max', 'min_pin_length', 'max_pin_length'];

    return await this.getValues(keys);
  }

  /**
   * Get file upload configuration
   * @returns {Promise<Object>} Upload configuration
   */
  static async getUploadConfig() {
    const keys = ['upload_max_file_size', 'upload_allowed_types'];

    return await this.getValues(keys);
  }

  /**
   * Get system settings configuration
   * @returns {Promise<Object>} System configuration
   */
  static async getSystemConfig() {
    const keys = [
      'backup_retention_days',
      'health_check_interval',
      'log_level',
      'base_url',
      'api_url',
      'public_url',
    ];

    return await this.getValues(keys);
  }

  /**
   * Get all configuration organized by category
   * @returns {Promise<Object>} Categorized configuration
   */
  static async getAllCategorizedConfig() {
    const [organization, messages, features, security, upload, email, system] = await Promise.all([
      this.getOrganizationConfig(),
      this.getMessagesConfig(),
      this.getFeatureFlagsConfig(),
      this.getSecurityConfig(),
      this.getUploadConfig(),
      this.getEmailConfig(),
      this.getSystemConfig(),
    ]);

    return {
      organization,
      messages,
      features,
      security,
      upload,
      email,
      system,
    };
  }

  /**
   * Update multiple configuration values
   * @param {Object} configs - Object with key-value pairs
   * @param {string} userId - User making the changes
   * @param {string} reason - Reason for changes
   * @returns {Promise<Object>} Results of updates
   */
  static async setValues(configs, userId, reason = null) {
    const results = {};

    for (const [key, value] of Object.entries(configs)) {
      try {
        results[key] = await this.setValue(key, value, userId, reason);
      } catch (error) {
        logger.error(`Error updating configuration ${key}:`, error);
        results[key] = false;
      }
    }

    return results;
  }

  /**
   * Get all public configuration for frontend
   * @returns {Promise<Object>} Public configuration object
   */
  static async getPublicConfig() {
    try {
      const configs = await prisma.config.findMany({
        where: { is_public: true },
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
      });

      const result = {};
      for (const config of configs) {
        const value = await this.getValue(config.key);
        if (value !== null) {
          result[config.key] = value;
        }
      }

      return result;
    } catch (error) {
      logger.error('Error getting public configuration:', error);
      return {};
    }
  }
}

export default ConfigurationService;
