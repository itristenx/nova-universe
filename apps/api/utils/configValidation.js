/**
 * Configuration Value Validation Utilities
 * Provides validation for configuration values based on their type and rules
 */

import { logger } from '../logger.js';

/**
 * Validate configuration value based on its type and validation rules
 * @param {string} key - Configuration key
 * @param {any} value - Value to validate
 * @param {object} config - Configuration metadata from database
 * @returns {object} - { valid: boolean, error?: string }
 */
export async function validateConfigValue(key, value, config) {
  try {
    // Check required values
    if (config.isRequired && (value === null || value === undefined || value === '')) {
      return { valid: false, error: 'This configuration is required and cannot be empty' };
    }

    // Type validation
    const typeValidation = validateByType(value, config.valueType);
    if (!typeValidation.valid) {
      return typeValidation;
    }

    // Custom validation rules
    if (config.validationRules) {
      const rulesValidation = validateByRules(value, config.validationRules, config.valueType);
      if (!rulesValidation.valid) {
        return rulesValidation;
      }
    }

    // Key-specific validation
    const keyValidation = validateByKey(key, value);
    if (!keyValidation.valid) {
      return keyValidation;
    }

    return { valid: true };
  } catch (error) {
    logger.error(`Error validating config value for key ${key}:`, error);
    return { valid: false, error: 'Validation error occurred' };
  }
}

/**
 * Validate value by its declared type
 */
function validateByType(value, valueType) {
  if (value === null || value === undefined) {
    return { valid: true }; // Null values are handled by required check
  }

  switch (valueType) {
    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
      }
      break;

    case 'number':
      const num = Number(value);
      if (isNaN(num) || !isFinite(num)) {
        return { valid: false, error: 'Value must be a valid number' };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return { valid: false, error: 'Value must be true or false' };
      }
      break;

    case 'json':
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch {
          return { valid: false, error: 'Value must be valid JSON' };
        }
      } else if (typeof value !== 'object') {
        return { valid: false, error: 'Value must be a JSON object or valid JSON string' };
      }
      break;

    case 'array':
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            return { valid: false, error: 'Value must be a valid JSON array' };
          }
        } catch {
          return { valid: false, error: 'Value must be a valid JSON array' };
        }
      } else if (!Array.isArray(value)) {
        return { valid: false, error: 'Value must be an array' };
      }
      break;

    default:
      // Unknown type, treat as string
      break;
  }

  return { valid: true };
}

/**
 * Validate value against custom validation rules
 */
function validateByRules(value, rules, valueType) {
  if (!rules || typeof rules !== 'object') {
    return { valid: true };
  }

  // Convert value to appropriate type for validation
  const typedValue = convertValueForValidation(value, valueType);

  // String validation rules
  if (valueType === 'string' && typeof typedValue === 'string') {
    if (rules.minLength && typedValue.length < rules.minLength) {
      return { valid: false, error: `Value must be at least ${rules.minLength} characters long` };
    }
    if (rules.maxLength && typedValue.length > rules.maxLength) {
      return { valid: false, error: `Value must be no more than ${rules.maxLength} characters long` };
    }
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(typedValue)) {
        return { valid: false, error: rules.patternMessage || 'Value does not match required pattern' };
      }
    }
    if (rules.allowedValues && !rules.allowedValues.includes(typedValue)) {
      return { valid: false, error: `Value must be one of: ${rules.allowedValues.join(', ')}` };
    }
  }

  // Number validation rules
  if (valueType === 'number' && typeof typedValue === 'number') {
    if (rules.min !== undefined && typedValue < rules.min) {
      return { valid: false, error: `Value must be at least ${rules.min}` };
    }
    if (rules.max !== undefined && typedValue > rules.max) {
      return { valid: false, error: `Value must be no more than ${rules.max}` };
    }
    if (rules.integer && !Number.isInteger(typedValue)) {
      return { valid: false, error: 'Value must be an integer' };
    }
    if (rules.positive && typedValue <= 0) {
      return { valid: false, error: 'Value must be positive' };
    }
  }

  // Array validation rules
  if (valueType === 'array' && Array.isArray(typedValue)) {
    if (rules.minItems && typedValue.length < rules.minItems) {
      return { valid: false, error: `Array must have at least ${rules.minItems} items` };
    }
    if (rules.maxItems && typedValue.length > rules.maxItems) {
      return { valid: false, error: `Array must have no more than ${rules.maxItems} items` };
    }
    if (rules.uniqueItems && new Set(typedValue).size !== typedValue.length) {
      return { valid: false, error: 'Array items must be unique' };
    }
  }

  return { valid: true };
}

/**
 * Key-specific validation for special configuration keys
 */
function validateByKey(key, value) {
  const stringValue = String(value);

  switch (key) {
    case 'organization.primary_color':
    case 'organization.secondary_color':
      if (!/^#[0-9A-Fa-f]{6}$/.test(stringValue)) {
        return { valid: false, error: 'Color must be a valid hex color (e.g., #3b82f6)' };
      }
      break;

    case 'organization.logo_url':
    case 'organization.favicon_url':
      if (stringValue && !isValidUrl(stringValue) && !isValidPath(stringValue)) {
        return { valid: false, error: 'Must be a valid URL or file path' };
      }
      break;

    case 'security.min_pin_length':
      const minPin = Number(value);
      if (minPin < 3 || minPin > 12) {
        return { valid: false, error: 'Minimum PIN length must be between 3 and 12' };
      }
      break;

    case 'security.max_pin_length':
      const maxPin = Number(value);
      if (maxPin < 4 || maxPin > 20) {
        return { valid: false, error: 'Maximum PIN length must be between 4 and 20' };
      }
      break;

    case 'security.rate_limit_window':
      const window = Number(value);
      if (window < 1000 || window > 86400000) { // 1 second to 24 hours
        return { valid: false, error: 'Rate limit window must be between 1 second (1000ms) and 24 hours (86400000ms)' };
      }
      break;

    case 'security.rate_limit_max':
    case 'security.submit_ticket_limit':
    case 'security.api_login_limit':
      const limit = Number(value);
      if (limit < 1 || limit > 10000) {
        return { valid: false, error: 'Limit must be between 1 and 10000' };
      }
      break;

    case 'integrations.cosmo_model_provider':
      const validProviders = ['openai', 'anthropic', 'azure', 'google', 'cohere'];
      if (!validProviders.includes(stringValue)) {
        return { valid: false, error: `Provider must be one of: ${validProviders.join(', ')}` };
      }
      break;

    case 'integrations.directory_provider':
      const validDirProviders = ['mock', 'ldap', 'azure_ad', 'okta', 'google'];
      if (!validDirProviders.includes(stringValue)) {
        return { valid: false, error: `Directory provider must be one of: ${validDirProviders.join(', ')}` };
      }
      break;

    case 'integrations.cosmo_personality':
      const validPersonalities = ['friendly_professional', 'technical_expert', 'casual_helper', 'formal_assistant'];
      if (!validPersonalities.includes(stringValue)) {
        return { valid: false, error: `Personality must be one of: ${validPersonalities.join(', ')}` };
      }
      break;

    default:
      // No specific validation for this key
      break;
  }

  return { valid: true };
}

/**
 * Convert value to appropriate type for validation
 */
function convertValueForValidation(value, valueType) {
  switch (valueType) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === true;
    case 'json':
      return typeof value === 'string' ? JSON.parse(value) : value;
    case 'array':
      return typeof value === 'string' ? JSON.parse(value) : value;
    default:
      return String(value);
  }
}

/**
 * Check if string is a valid URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is a valid file path
 */
function isValidPath(string) {
  // Basic path validation - starts with / or ./ or contains common path patterns
  return /^(\/|\.\/|\.\.\/|\w+\/|\w+\.\w+)/.test(string);
}

/**
 * Get validation schema for a configuration key
 * @param {string} key - Configuration key
 * @param {object} config - Configuration metadata
 * @returns {object} - JSON schema for validation
 */
export function getConfigValidationSchema(key, config) {
  const schema = {
    type: config.valueType || 'string',
    description: config.description,
    required: config.isRequired || false,
    default: config.defaultValue
  };

  // Add type-specific schema properties
  switch (config.valueType) {
    case 'string':
      schema.minLength = 0;
      if (config.validationRules?.minLength) schema.minLength = config.validationRules.minLength;
      if (config.validationRules?.maxLength) schema.maxLength = config.validationRules.maxLength;
      if (config.validationRules?.pattern) schema.pattern = config.validationRules.pattern;
      if (config.validationRules?.allowedValues) schema.enum = config.validationRules.allowedValues;
      break;

    case 'number':
      if (config.validationRules?.min !== undefined) schema.minimum = config.validationRules.min;
      if (config.validationRules?.max !== undefined) schema.maximum = config.validationRules.max;
      if (config.validationRules?.integer) schema.type = 'integer';
      break;

    case 'boolean':
      schema.type = 'boolean';
      break;

    case 'array':
      schema.type = 'array';
      if (config.validationRules?.minItems) schema.minItems = config.validationRules.minItems;
      if (config.validationRules?.maxItems) schema.maxItems = config.validationRules.maxItems;
      if (config.validationRules?.uniqueItems) schema.uniqueItems = config.validationRules.uniqueItems;
      break;

    case 'json':
      schema.type = 'object';
      break;
  }

  // Add key-specific validation
  addKeySpecificValidation(key, schema);

  return schema;
}

/**
 * Add key-specific validation to schema
 */
function addKeySpecificValidation(key, schema) {
  switch (key) {
    case 'organization.primary_color':
    case 'organization.secondary_color':
      schema.pattern = '^#[0-9A-Fa-f]{6}$';
      schema.example = '#3b82f6';
      break;

    case 'security.min_pin_length':
      schema.minimum = 3;
      schema.maximum = 12;
      break;

    case 'security.max_pin_length':
      schema.minimum = 4;
      schema.maximum = 20;
      break;

    case 'security.rate_limit_window':
      schema.minimum = 1000;
      schema.maximum = 86400000;
      schema.description += ' (in milliseconds)';
      break;

    case 'integrations.cosmo_model_provider':
      schema.enum = ['openai', 'anthropic', 'azure', 'google', 'cohere'];
      break;

    case 'integrations.directory_provider':
      schema.enum = ['mock', 'ldap', 'azure_ad', 'okta', 'google'];
      break;

    case 'integrations.cosmo_personality':
      schema.enum = ['friendly_professional', 'technical_expert', 'casual_helper', 'formal_assistant'];
      break;
  }
}

/**
 * Validate configuration dependencies
 * Some configurations depend on others being set correctly
 */
export function validateConfigDependencies(configs) {
  const errors = [];

  // Check PIN length consistency
  const minPin = Number(configs['security.min_pin_length']);
  const maxPin = Number(configs['security.max_pin_length']);
  if (minPin >= maxPin) {
    errors.push({
      keys: ['security.min_pin_length', 'security.max_pin_length'],
      error: 'Minimum PIN length must be less than maximum PIN length'
    });
  }

  // Check rate limiting consistency
  const rateWindow = Number(configs['security.rate_limit_window']);
  const rateMax = Number(configs['security.rate_limit_max']);
  if (rateWindow < 1000 && rateMax > 100) {
    errors.push({
      keys: ['security.rate_limit_window', 'security.rate_limit_max'],
      error: 'Very short rate limit windows should have lower maximum request limits'
    });
  }

  // Check AI feature dependencies
  const cosmoEnabled = configs['features.cosmo_enabled'] === 'true';
  const aiProcessingEnabled = configs['features.ai_ticket_processing'] === 'true';
  if (aiProcessingEnabled && !cosmoEnabled) {
    errors.push({
      keys: ['features.cosmo_enabled', 'features.ai_ticket_processing'],
      error: 'AI ticket processing requires Cosmo AI assistant to be enabled'
    });
  }

  return errors;
}

export default {
  validateConfigValue,
  getConfigValidationSchema,
  validateConfigDependencies
};
