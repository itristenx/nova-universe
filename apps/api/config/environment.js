import dotenv from 'dotenv';
import { validateDatabaseConfig } from './database.js';
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

// Only enforce hard requirements in production. In dev/test, provide safe defaults.
const required = [];
if (isProduction) {
  required.push(
    'SESSION_SECRET',
    'JWT_SECRET',
    'KIOSK_TOKEN',
    'SCIM_TOKEN'
  );
}

// Database configuration
// In production, require explicit DB configuration if no DATABASE_URL is provided
if (isProduction && !process.env.DATABASE_URL) {
  required.push('POSTGRES_HOST', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB');
}

if (process.env.MONGO_ENABLED === 'true') {
  // If Mongo is explicitly enabled, ensure required vars in production
  if (isProduction) required.push('MONGO_HOST', 'MONGO_DB');
}

// Only require SMTP in production
if (isProduction) {
  required.push('SMTP_HOST', 'SMTP_USER', 'SMTP_PASS');
}

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const config = {
  sessionSecret: process.env.SESSION_SECRET || (isProduction ? undefined : 'dev_session_secret'),
  jwtSecret: process.env.JWT_SECRET || (isProduction ? undefined : 'dev_jwt_secret'),
  assetEncryptionKey: process.env.ASSET_ENCRYPTION_KEY || (isProduction ? undefined : 'dev_asset_key'),
  smtp: {
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  nodeEnv: env,
  helpdeskEmail: process.env.HELPDESK_EMAIL,
  // Add more config as needed
};

// Validate environment and return status info
export const validateEnvironment = () => {
  const warnings = [];
  
  if (!config.sessionSecret) {
    warnings.push('SESSION_SECRET not set - using default (insecure)');
  }
  
  if (!config.jwtSecret) {
    warnings.push('JWT_SECRET not set - using default (insecure)');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Validate database configuration separately
  validateDatabaseConfig();
  
  return {
    environment: env,
    isProduction: isProduction,
    isDevelopment: env === 'development',
    isTest: env === 'test',
    authDisabled: process.env.DISABLE_AUTH === 'true',
    hasSmtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    hasHelpScout: !!(process.env.HELPSCOUT_API_KEY && process.env.HELPSCOUT_MAILBOX_ID),
    hasKioskToken: !!process.env.KIOSK_TOKEN,
    hasScimToken: !!process.env.SCIM_TOKEN,
    tlsEnabled: !!(process.env.TLS_CERT_PATH && process.env.TLS_KEY_PATH)
  };
};

export default config;

export const getConfig = () => {
  return {
    NODE_ENV: env,
    API_PORT: parseInt(process.env.API_PORT) || 3000,
    DATABASE_PATH: process.env.DATABASE_PATH || 'log.sqlite',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',
    ADMIN_NAME: process.env.ADMIN_NAME || 'Admin',
    SESSION_SECRET: process.env.SESSION_SECRET || (isProduction ? undefined : 'dev_session_secret'),
    KIOSK_TOKEN: process.env.KIOSK_TOKEN || (isProduction ? undefined : 'dev_kiosk_token'),
    SCIM_TOKEN: process.env.SCIM_TOKEN || (isProduction ? undefined : 'dev_scim_token'),
    DISABLE_AUTH: process.env.DISABLE_AUTH === 'true',
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
    SUBMIT_TICKET_LIMIT: parseInt(process.env.SUBMIT_TICKET_LIMIT) || 10,
    API_LOGIN_LIMIT: parseInt(process.env.API_LOGIN_LIMIT) || 5,
    AUTH_LIMIT: parseInt(process.env.AUTH_LIMIT) || 5,
    LOG_RETENTION_DAYS: parseInt(process.env.LOG_RETENTION_DAYS) || 30,
    TLS_CERT_PATH: process.env.TLS_CERT_PATH,
    TLS_KEY_PATH: process.env.TLS_KEY_PATH,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    HELPDESK_EMAIL: process.env.HELPDESK_EMAIL,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    HELPSCOUT_API_KEY: process.env.HELPSCOUT_API_KEY,
    HELPSCOUT_MAILBOX_ID: process.env.HELPSCOUT_MAILBOX_ID,
    HELPSCOUT_SMTP_FALLBACK: process.env.HELPSCOUT_SMTP_FALLBACK === 'true'
  };
};

// Log environment status
export const logEnvironmentStatus = () => {
  const cfg = validateEnvironment();
  
  console.log(`🌍 Environment: ${cfg.environment}`);
  console.log(`🔐 Authentication: ${cfg.authDisabled ? 'DISABLED' : 'ENABLED'}`);
  console.log(`📧 Email: ${cfg.hasSmtp ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`🎫 HelpScout: ${cfg.hasHelpScout ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`📱 Kiosk Token: ${cfg.hasKioskToken ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`🔐 SCIM Token: ${cfg.hasScimToken ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`🔒 TLS: ${cfg.tlsEnabled ? 'ENABLED' : 'DISABLED'}`);
  
  return cfg;
};
