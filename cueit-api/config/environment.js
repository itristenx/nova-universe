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
