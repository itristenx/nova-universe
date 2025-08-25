/**
 * Production Environment Validation
 * Validates critical environment variables before application startup
 */
import { logger } from '../logger.js';

/**
 * Critical environment variables required for production
 */
const REQUIRED_PRODUCTION_VARS = [
  'NODE_ENV',
  'JWT_SECRET',
  'SESSION_SECRET',
  'POSTGRES_PASSWORD',
  'CORE_DB_PASSWORD',
  'AUTH_DB_PASSWORD',
  'AUDIT_DB_PASSWORD',
  'ELASTIC_PASSWORD',
];

/**
 * Environment variables required for specific features
 */
const CONDITIONAL_REQUIREMENTS = {
  smtp: {
    condition: () => process.env.NODE_ENV === 'production',
    vars: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'],
    description: 'SMTP configuration for email notifications',
  },
  saml: {
    condition: () => !!process.env.SAML_ENTRY_POINT,
    vars: ['SAML_ISSUER', 'SAML_CALLBACK_URL', 'SAML_CERT'],
    description: 'SAML SSO configuration',
  },
  ssl: {
    condition: () => process.env.NODE_ENV === 'production',
    vars: ['TLS_CERT_PATH', 'TLS_KEY_PATH'],
    description: 'SSL/TLS certificates for HTTPS',
    required: false, // Optional but recommended
  },
};

/**
 * Password strength validation
 */
function validatePasswordStrength(password, name) {
  const errors = [];

  if (!password) {
    errors.push(`${name} is required`);
    return errors;
  }

  if (password.length < 12) {
    errors.push(`${name} must be at least 12 characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(`${name} must contain uppercase letters`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push(`${name} must contain lowercase letters`);
  }

  if (!/[0-9]/.test(password)) {
    errors.push(`${name} must contain numbers`);
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
    errors.push(`${name} must contain special characters`);
  }

  // Check for common weak passwords
  const weakPasswords = [
    'password',
    'admin',
    'root',
    'changeme',
    'default',
    'nova_password',
    'dev_password_123!',
    'test_password',
  ];

  if (weakPasswords.some((weak) => password.toLowerCase().includes(weak.toLowerCase()))) {
    errors.push(`${name} contains common weak password patterns`);
  }

  return errors;
}

/**
 * JWT secret validation
 */
function validateJwtSecret(secret) {
  const errors = [];

  if (!secret) {
    errors.push('JWT_SECRET is required');
    return errors;
  }

  if (secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters');
  }

  // Check for common weak secrets
  const weakSecrets = ['secret', 'jwt_secret', 'default', 'changeme'];
  if (weakSecrets.some((weak) => secret.toLowerCase().includes(weak))) {
    errors.push('JWT_SECRET contains weak patterns');
  }

  return errors;
}

/**
 * Validate production environment
 */
export function validateProductionEnvironment() {
  const errors = [];
  const warnings = [];

  logger.info('🔍 Validating production environment configuration...');

  // Check if running in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    logger.info('🏭 Production mode detected - enforcing strict validation');

    // Validate required variables
    for (const varName of REQUIRED_PRODUCTION_VARS) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    }

    // Validate password strength for production
    const passwordVars = [
      { name: 'POSTGRES_PASSWORD', value: process.env.POSTGRES_PASSWORD },
      { name: 'CORE_DB_PASSWORD', value: process.env.CORE_DB_PASSWORD },
      { name: 'AUTH_DB_PASSWORD', value: process.env.AUTH_DB_PASSWORD },
      { name: 'AUDIT_DB_PASSWORD', value: process.env.AUDIT_DB_PASSWORD },
      { name: 'ELASTIC_PASSWORD', value: process.env.ELASTIC_PASSWORD },
    ];

    for (const { name, value } of passwordVars) {
      const passwordErrors = validatePasswordStrength(value, name);
      errors.push(...passwordErrors);
    }

    // Validate JWT secret
    const jwtErrors = validateJwtSecret(process.env.JWT_SECRET);
    errors.push(...jwtErrors);

    // Validate session secret
    const sessionErrors = validatePasswordStrength(process.env.SESSION_SECRET, 'SESSION_SECRET');
    errors.push(...sessionErrors);
  }

  // Check conditional requirements
  for (const [feature, config] of Object.entries(CONDITIONAL_REQUIREMENTS)) {
    if (config.condition()) {
      for (const varName of config.vars) {
        if (!process.env[varName]) {
          if (config.required !== false) {
            errors.push(`Missing ${feature} configuration: ${varName} (${config.description})`);
          } else {
            warnings.push(
              `Recommended ${feature} configuration missing: ${varName} (${config.description})`,
            );
          }
        }
      }
    }
  }

  // Security checks
  if (process.env.DISABLE_AUTH === 'true' && isProduction) {
    errors.push('DISABLE_AUTH cannot be true in production environment');
  }

  if (process.env.CORS_ORIGINS === '*' && isProduction) {
    warnings.push('CORS allows all origins - consider restricting for production');
  }

  // Log results
  if (warnings.length > 0) {
    logger.warn('⚠️  Environment validation warnings:');
    warnings.forEach((warning) => logger.warn(`   - ${warning}`));
  }

  if (errors.length > 0) {
    logger.error('❌ Environment validation failed:');
    errors.forEach((error) => logger.error(`   - ${error}`));

    if (isProduction) {
      throw new Error(
        `Production environment validation failed with ${errors.length} critical errors`,
      );
    }
  } else {
    logger.info('✅ Environment validation passed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    isProduction,
  };
}

/**
 * Generate secure random string for secrets
 */
export function generateSecureSecret(length = 64) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export default {
  validateProductionEnvironment,
  generateSecureSecret,
};
