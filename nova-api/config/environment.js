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
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
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

// Logging and SIEM environment variables
// Local/console
//   LOG_LEVEL=debug|info|warn|error
//   LOG_PRETTY=true (development pretty printing)
// File
//   LOG_FILE_ENABLED=true
//   LOG_DIR=/var/log/nova
//   LOG_FILE_NAME=nova-api.log
//   LOG_FILE_ROTATE_SIZE=10M
//   LOG_FILE_INTERVAL=1d
//   LOG_FILE_MAX=14
//   LOG_FILE_COMPRESS=true
// Syslog (RFC5424)
//   LOG_SYSLOG_ENABLED=true
//   LOG_SYSLOG_HOST=127.0.0.1
//   LOG_SYSLOG_PORT=514
//   LOG_SYSLOG_PROTOCOL=udp|tcp
//   LOG_SYSLOG_TLS=false
//   LOG_SYSLOG_HOSTNAME=api.example.com
// Splunk HEC
//   LOG_SPLUNK_HEC_ENABLED=true
//   LOG_SPLUNK_HEC_URL=https://splunk.example.com:8088
//   LOG_SPLUNK_HEC_TOKEN=xxxxx
//   LOG_SPLUNK_INDEX=main
//   LOG_SPLUNK_SOURCETYPE=json
// Azure Log Analytics (Sentinel)
//   LOG_AZURE_LA_ENABLED=true
//   LOG_AZURE_WORKSPACE_ID=<workspace-id>
//   LOG_AZURE_SHARED_KEY=<base64-shared-key>
//   LOG_AZURE_LOG_TYPE=NovaAppLogs
