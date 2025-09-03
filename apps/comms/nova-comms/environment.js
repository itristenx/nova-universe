/**
 * Environment validation for Nova Comms service
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables for Slack integration
 */
export function validateEnv() {
  const required = ['SLACK_SIGNING_SECRET', 'SLACK_BOT_TOKEN', 'API_URL', 'JWT_SECRET'];
  const missing = required.filter((v) => !process.env[v]);
  
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    port: parseInt(process.env.SLACK_PORT) || 3001,
    slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    apiUrl: process.env.API_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    adminUrl: process.env.VITE_ADMIN_URL,
    // Service identity for Nova API JWTs
    serviceUserId: process.env.COMMS_SERVICE_USER_ID || 'comms-service',
    serviceUserEmail: process.env.COMMS_SERVICE_USER_EMAIL || 'comms@nova.local',
    serviceUserName: process.env.COMMS_SERVICE_USER_NAME || 'Nova Comms Bot',
    serviceUserRole: process.env.COMMS_SERVICE_USER_ROLE || 'technician',
    tenantId: process.env.COMMS_TENANT_ID || 'default',
  };
}