// Environment configuration validation
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define required environment variables for different modes
const requiredEnvVars = {
  development: [
    'SESSION_SECRET',
    'JWT_SECRET'
  ],
  production: [
    'SESSION_SECRET',
    'JWT_SECRET',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'HELPDESK_EMAIL'
  ],
  test: [
    'JWT_SECRET'
  ]
};

// Validate environment configuration
export const validateEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  const warnings = [];
  
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables for ${env} mode:`);
    missing.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    
    if (env === 'production') {
      console.error('Application cannot start in production without these variables.');
      process.exit(1);
    } else {
      console.warn('Some functionality may be limited without these variables.');
    }
  }
  
  // Security checks
  if (env === 'production') {
    if (process.env.DISABLE_AUTH === 'true') {
      console.error('DISABLE_AUTH cannot be true in production');
      process.exit(1);
    }
    
    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
      console.error('SESSION_SECRET must be at least 32 characters long in production');
      process.exit(1);
    }
    
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.error('JWT_SECRET must be at least 32 characters long in production');
      process.exit(1);
    }
    
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin') {
      warnings.push('ADMIN_PASSWORD should be changed from default value in production');
    }
    
    if (!process.env.KIOSK_TOKEN) {
      warnings.push('KIOSK_TOKEN not set - kiosk registration will be open');
    }
    
    if (!process.env.SCIM_TOKEN) {
      warnings.push('SCIM_TOKEN not set - SCIM endpoints will be disabled');
    }
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  return {
    environment: env,
    isProduction: env === 'production',
    isDevelopment: env === 'development',
    isTest: env === 'test',
    authDisabled: process.env.DISABLE_AUTH === 'true',
    hasSmtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    hasHelpScout: !!(process.env.HELPSCOUT_API_KEY && process.env.HELPSCOUT_MAILBOX_ID),
    hasServiceNow: !!(process.env.SERVICENOW_INSTANCE && process.env.SERVICENOW_USER),
    hasKioskToken: !!process.env.KIOSK_TOKEN,
    hasScimToken: !!process.env.SCIM_TOKEN,
    tlsEnabled: !!(process.env.TLS_CERT_PATH && process.env.TLS_KEY_PATH)
  };
};

export const getConfig = () => {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_PORT: parseInt(process.env.API_PORT) || 3000,
    DATABASE_PATH: process.env.DATABASE_PATH || 'log.sqlite',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',
    ADMIN_NAME: process.env.ADMIN_NAME || 'Admin',
    SESSION_SECRET: process.env.SESSION_SECRET,
    KIOSK_TOKEN: process.env.KIOSK_TOKEN,
    SCIM_TOKEN: process.env.SCIM_TOKEN,
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
    SERVICENOW_INSTANCE: process.env.SERVICENOW_INSTANCE,
    SERVICENOW_USER: process.env.SERVICENOW_USER,
    SERVICENOW_PASS: process.env.SERVICENOW_PASS,
    HELPSCOUT_API_KEY: process.env.HELPSCOUT_API_KEY,
    HELPSCOUT_MAILBOX_ID: process.env.HELPSCOUT_MAILBOX_ID,
    HELPSCOUT_SMTP_FALLBACK: process.env.HELPSCOUT_SMTP_FALLBACK === 'true'
  };
};

// Log environment status
export const logEnvironmentStatus = () => {
  const config = validateEnvironment();
  
  console.log(`🌍 Environment: ${config.environment}`);
  console.log(`🔐 Authentication: ${config.authDisabled ? 'DISABLED' : 'ENABLED'}`);
  console.log(`📧 Email: ${config.hasSmtp ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`🎫 HelpScout: ${config.hasHelpScout ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`🏢 ServiceNow: ${config.hasServiceNow ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`📱 Kiosk Token: ${config.hasKioskToken ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`🔐 SCIM Token: ${config.hasScimToken ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`🔒 TLS: ${config.tlsEnabled ? 'ENABLED' : 'DISABLED'}`);
  
  return config;
};
