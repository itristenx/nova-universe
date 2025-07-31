import dotenv from 'dotenv';

dotenv.config();

export function validateEnv() {
  const required = ['SLACK_SIGNING_SECRET', 'SLACK_BOT_TOKEN', 'API_URL', 'JWT_SECRET'];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    port: parseInt(process.env.SLACK_PORT) || 3001,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    adminUrl: process.env.VITE_ADMIN_URL
  };
}
