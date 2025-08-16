// nova-api/config/app-settings.js
// Application configuration management system
// Supports environment variables, database configuration, and UI overrides

import { logger } from '../logger.js';
import db from '../db.js';

/**
 * Configuration hierarchy:
 * 1. Environment variables (highest priority)
 * 2. Database configuration (admin configurable)
 * 3. Default values (built-in fallbacks)
 */

// Default configuration values
const DEFAULT_CONFIG = {
  // Organization branding (UI configurable)
  organization: {
    name: 'Nova Universe',
    logoUrl: '/logo.png',
    faviconUrl: '/vite.svg',
    primaryColor: '#1D4ED8',
    secondaryColor: '#9333EA',
    welcomeMessage: 'Welcome to the Help Desk',
    helpMessage: 'Need to report an issue?'
  },

  // Security settings (UI configurable with validation)
  security: {
    minPinLength: 4,
    maxPinLength: 8,
    sessionMaxAge: 86400000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 900000 // 15 minutes
  },

  // Application behavior (UI configurable)
  application: {
    defaultPageSize: 20,
    maxPageSize: 100,
    enableRegistration: true,
    requireEmailVerification: false,
    enableGuestAccess: false,
    maintenanceMode: false
  },

  // Search settings (UI configurable)
  search: {
    enableSemanticSearch: true,
    enableHybridSearch: true,
    maxSearchResults: 100,
    searchTimeout: 10000,
    enableSearchSuggestions: true,
    enableSearchAnalytics: true
  },

  // Rate limiting (performance tuning)
  rateLimiting: {
    enabled: true,
    windowMs: 900000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Feature toggles (UI configurable)
  features: {
    directoryIntegration: false,
    slackIntegration: false,
    teamsIntegration: false,
    emailNotifications: true,
    pushNotifications: false,
    darkModeSupport: true,
    multiLanguageSupport: false
  },

  // Status messages (UI configurable)
  statusMessages: {
    open: 'Open',
    closed: 'Closed',
    error: 'Error',
    meeting: 'In a Meeting - Back Soon',
    brb: 'Be Right Back',
    lunch: 'Out to Lunch - Back in 1 Hour',
    unavailable: 'Status Unavailable'
  },

  // Email templates (UI configurable)
  emailTemplates: {
    fromEmail: 'noreply@yourorg.com',
    fromName: 'Nova Universe Support',
    welcomeSubject: 'Welcome to Nova Universe',
    passwordResetSubject: 'Password Reset Request',
    ticketCreatedSubject: 'Ticket Created: {{ticketId}}',
    ticketUpdatedSubject: 'Ticket Updated: {{ticketId}}'
  }
};

// Configuration cache
let configCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 300000; // 5 minutes

class ConfigurationManager {
  /**
   * Get configuration value with hierarchy support
   * @param {string} key - Configuration key (e.g., 'organization.name')
   * @param {any} fallback - Fallback value if not found
   * @returns {any} Configuration value
   */
  static async get(key, fallback = null) {
    try {
      const config = await this.getFullConfig(); // TODO-LINT: move to async function
      const value = this.getNestedValue(config, key);
      return value !== undefined ? value : fallback;
    } catch (error) {
      logger.error('Error getting configuration:', error);
      return this.getNestedValue(DEFAULT_CONFIG, key) || fallback;
    }
  }

  /**
   * Set configuration value in database
   * @param {string} key - Configuration key
   * @param {any} value - Configuration value
   * @param {string} userId - User making the change
   * @returns {Promise<boolean>} Success status
   */
  static async set(key, value, userId = null) {
    try {
      // Validate the configuration change
      const isValid = await this.validateConfigValue(key, value); // TODO-LINT: move to async function
      if (!isValid) {
        throw new Error(`Invalid configuration value for ${key}`);
      }

      // Store in database
      await this.saveToDatabase(key, value, userId); // TODO-LINT: move to async function
      
      // Invalidate cache
      this.invalidateCache();
      
      logger.info('Configuration updated', { key, userId, hasValue: value !== null });
      return true;
    } catch (error) {
      logger.error('Error setting configuration:', error);
      return false;
    }
  }

  /**
   * Get full configuration object
   * @returns {Promise<object>} Complete configuration
   */
  static async getFullConfig() {
    // Check cache
    const now = Date.now();
    if (configCache && (now - cacheTimestamp) < CACHE_TTL) {
      return configCache;
    }

    try {
      // Start with default configuration
      let config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

      // Override with database configuration
      const dbConfig = await this.loadFromDatabase(); // TODO-LINT: move to async function
      config = this.mergeConfigurations(config, dbConfig);

      // Override with environment variables
      const envConfig = this.loadFromEnvironment();
      config = this.mergeConfigurations(config, envConfig);

      // Cache the result
      configCache = config;
      cacheTimestamp = now;

      return config;
    } catch (error) {
      logger.error('Error loading full configuration:', error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Load configuration from database
   * @returns {Promise<object>} Database configuration
   */
  static async loadFromDatabase() {
    try {
      // Ensure database is ready
      await db.ensureReady(); // TODO-LINT: move to async function
      
      const query = 'SELECT key, value FROM configurations';
      const result = await db.query(query); // TODO-LINT: move to async function
      const rows = result.rows || [];

      const config = {};
      rows.forEach(row => {
        try {
          const value = JSON.parse(row.value);
          this.setNestedValue(config, row.key, value);
        } catch (error) {
          // If it's not valid JSON, use the string value directly
          this.setNestedValue(config, row.key, row.value);
        }
      });

      return config;
    } catch (error) {
      logger.error('Error loading configuration from database:', error);
      return {};
    }
  }

  /**
   * Load configuration from environment variables
   * @returns {object} Environment configuration
   */
  static loadFromEnvironment() {
    const config = {};

    // Organization settings
    if (process.env.ORGANIZATION_NAME) {
      config.organization = config.organization || {};
      config.organization.name = process.env.ORGANIZATION_NAME;
    }
    if (process.env.LOGO_URL) {
      config.organization = config.organization || {};
      config.organization.logoUrl = process.env.LOGO_URL;
    }
    if (process.env.FAVICON_URL) {
      config.organization = config.organization || {};
      config.organization.faviconUrl = process.env.FAVICON_URL;
    }
    if (process.env.PRIMARY_COLOR) {
      config.organization = config.organization || {};
      config.organization.primaryColor = process.env.PRIMARY_COLOR;
    }
    if (process.env.SECONDARY_COLOR) {
      config.organization = config.organization || {};
      config.organization.secondaryColor = process.env.SECONDARY_COLOR;
    }
    if (process.env.WELCOME_MESSAGE) {
      config.organization = config.organization || {};
      config.organization.welcomeMessage = process.env.WELCOME_MESSAGE;
    }
    if (process.env.HELP_MESSAGE) {
      config.organization = config.organization || {};
      config.organization.helpMessage = process.env.HELP_MESSAGE;
    }

    // Security settings
    if (process.env.MIN_PIN_LENGTH) {
      config.security = config.security || {};
      config.security.minPinLength = parseInt(process.env.MIN_PIN_LENGTH);
    }
    if (process.env.MAX_PIN_LENGTH) {
      config.security = config.security || {};
      config.security.maxPinLength = parseInt(process.env.MAX_PIN_LENGTH);
    }

    // Rate limiting
    if (process.env.RATE_LIMIT_WINDOW) {
      config.rateLimiting = config.rateLimiting || {};
      config.rateLimiting.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW);
    }
    if (process.env.RATE_LIMIT_MAX) {
      config.rateLimiting = config.rateLimiting || {};
      config.rateLimiting.maxRequests = parseInt(process.env.RATE_LIMIT_MAX);
    }

    // Feature toggles
    if (process.env.DIRECTORY_ENABLED) {
      config.features = config.features || {};
      config.features.directoryIntegration = process.env.DIRECTORY_ENABLED === 'true';
    }

    return config;
  }

  /**
   * Save configuration to database
   * @param {string} key - Configuration key
   * @param {any} value - Configuration value
   * @param {string} userId - User making the change
   */
  static async saveToDatabase(key, value, userId) {
    const query = `
      INSERT OR REPLACE INTO app_configuration 
      (config_key, config_value, updated_by, updated_at, enabled) 
      VALUES (?, ?, ?, datetime('now'), 1)
    `;
    
    return new Promise((resolve, reject) => {
      db.run(query, [key, JSON.stringify(value), userId], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  /**
   * Validate configuration value
   * @param {string} key - Configuration key
   * @param {any} value - Configuration value
   * @returns {Promise<boolean>} Is valid
   */
  static async validateConfigValue(key, value) {
    try {
      // Security settings validation
      if (key === 'security.minPinLength') {
        return Number.isInteger(value) && value >= 1 && value <= 20;
      }
      if (key === 'security.maxPinLength') {
        return Number.isInteger(value) && value >= 1 && value <= 20 && value >= (await this.get('security.minPinLength', 4)); // TODO-LINT: move to async function
      }
      if (key === 'security.maxLoginAttempts') {
        return Number.isInteger(value) && value >= 1 && value <= 20;
      }

      // Organization settings validation
      if (key === 'organization.name') {
        return typeof value === 'string' && value.length >= 1 && value.length <= 100;
      }
      if (key.includes('Url')) {
        return typeof value === 'string' && (value.startsWith('/') || value.startsWith('http'));
      }
      if (key === 'organization.primaryColor' || key === 'organization.secondaryColor') {
        return typeof value === 'string' && /^#([0-9A-Fa-f]{3}){1,2}$/.test(value);
      }

      // Rate limiting validation
      if (key === 'rateLimiting.windowMs') {
        return Number.isInteger(value) && value >= 60000 && value <= 3600000; // 1 minute to 1 hour
      }
      if (key === 'rateLimiting.maxRequests') {
        return Number.isInteger(value) && value >= 1 && value <= 10000;
      }

      // Default: allow any value
      return true;
    } catch (error) {
      logger.error('Error validating configuration:', error);
      return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   * @param {object} obj - Object to search
   * @param {string} key - Dot-separated key
   * @returns {any} Value or undefined
   */
  static getNestedValue(obj, key) {
    return key.split('.').reduce((current, part) => current?.[part], obj);
  }

  /**
   * Set nested value in object using dot notation
   * @param {object} obj - Object to modify
   * @param {string} key - Dot-separated key
   * @param {any} value - Value to set
   */
  static setNestedValue(obj, key, value) {
    const parts = key.split('.');
    const last = parts.pop();
    const target = parts.reduce((current, part) => {
      if (!(part in current)) current[part] = {};
      return current[part];
    }, obj);
    target[last] = value;
  }

  /**
   * Merge two configuration objects
   * @param {object} base - Base configuration
   * @param {object} override - Override configuration
   * @returns {object} Merged configuration
   */
  static mergeConfigurations(base, override) {
    const result = JSON.parse(JSON.stringify(base));
    
    function merge(target, source) {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    
    merge(result, override);
    return result;
  }

  /**
   * Invalidate configuration cache
   */
  static invalidateCache() {
    configCache = null;
    cacheTimestamp = 0;
  }

  /**
   * Initialize configuration system
   */
  static async initialize() {
    try {
      // Create configuration table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS app_configuration (
          id SERIAL PRIMARY KEY,
          config_key TEXT UNIQUE NOT NULL,
          config_value TEXT NOT NULL,
          updated_by TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          enabled INTEGER DEFAULT 1
        )
      `;
      
      await new Promise((resolve, reject) => {
        db.run(createTableQuery, [], (err) => {
          if (err) reject(err); // TODO-LINT: move to async function
          else resolve();
        });
      });

      // Load initial configuration to populate cache
      await this.getFullConfig(); // TODO-LINT: move to async function
      
      logger.info('Configuration management system initialized');
    } catch (error) {
      logger.error('Failed to initialize configuration system:', error);
    }
  }

  /**
   * Export configuration for backup
   * @returns {Promise<object>} Configuration export
   */
  static async exportConfiguration() {
    try {
      const config = await this.getFullConfig(); // TODO-LINT: move to async function
      return {
        timestamp: new Date().toISOString(),
        version: '1.0',
        configuration: config
      };
    } catch (error) {
      logger.error('Error exporting configuration:', error);
      throw error;
    }
  }

  /**
   * Import configuration from backup
   * @param {object} configData - Configuration data
   * @param {string} userId - User performing import
   * @returns {Promise<boolean>} Success status
   */
  static async importConfiguration(configData, userId) {
    try {
      if (!configData.configuration) {
        throw new Error('Invalid configuration data format');
      }

      // Validate and import each configuration item
      const promises = [];
      const flatConfig = this.flattenObject(configData.configuration);
      
      for (const [key, value] of Object.entries(flatConfig)) {
        if (await this.validateConfigValue(key, value)) {
          promises.push(this.saveToDatabase(key, value, userId)); // TODO-LINT: move to async function
        }
      }

      await Promise.all(promises); // TODO-LINT: move to async function
      this.invalidateCache();
      
      logger.info('Configuration imported successfully', { userId, itemCount: promises.length });
      return true;
    } catch (error) {
      logger.error('Error importing configuration:', error);
      return false;
    }
  }

  /**
   * Flatten nested object to dot notation
   * @param {object} obj - Object to flatten
   * @param {string} prefix - Key prefix
   * @returns {object} Flattened object
   */
  static flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, this.flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
    
    return flattened;
  }
}

export default ConfigurationManager;
