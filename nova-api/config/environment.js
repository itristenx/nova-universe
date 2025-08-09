import dotenv from 'dotenv';
dotenv.config();

const required = [
  'SESSION_SECRET',
  'JWT_SECRET'
];

// Only require SMTP in production
if (process.env.NODE_ENV === 'production') {
  required.push('SMTP_HOST', 'SMTP_USER', 'SMTP_PASS');
}

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  if (process.env.NODE_ENV === 'test') {
    // Provide safe defaults in test mode
    if (!process.env.SESSION_SECRET) process.env.SESSION_SECRET = 'test_session_secret';
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test_jwt_secret';
  } else {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

const config = {
  sessionSecret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  smtp: {
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  nodeEnv: process.env.NODE_ENV || 'development',
  helpdeskEmail: process.env.HELPDESK_EMAIL,
// Add more config as needed
};

// Validate environment and return status info
export const validateEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  const warnings = [];
  
  if (!process.env.SESSION_SECRET) {
    warnings.push('SESSION_SECRET not set - using default (insecure)');
  }
  
  if (!process.env.JWT_SECRET) {
    warnings.push('JWT_SECRET not set - using default (insecure)');
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

export default config;

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
