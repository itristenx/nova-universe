import dotenv from 'dotenv';

dotenv.config();

export function _validateEnv() {
  const required = ['SLACK_SIGNING_SECRET', 'SLACK_BOT_TOKEN', 'API_URL', 'JWT_SECRET'];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    port: parseInt(process.env.SLACK_PORT) || 3001,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    adminUrl: process.env.VITE_ADMIN_URL,
    // Optional service identity for JWTs used to call Nova API
    serviceUserId: process.env.COMMS_SERVICE_USER_ID || 'comms-service',
    serviceUserEmail: process.env.COMMS_SERVICE_USER_EMAIL || 'comms@nova.local',
    serviceUserName: process.env.COMMS_SERVICE_USER_NAME || 'Nova Comms Bot',
    serviceUserRole: process.env.COMMS_SERVICE_USER_ROLE || 'technician',
    tenantId: process.env.COMMS_TENANT_ID || 'default'
  };
}
