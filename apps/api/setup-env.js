#!/usr/bin/env node

/**
 * Environment Setup Script for Nova Universe API
 * Sets up default environment variables for development
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate secure random string
 */
function generateSecureString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create default environment configuration
 */
function createDefaultEnv() {
  const envPath = path.join(__dirname, '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Skipping creation.');
    return;
  }

  const envContent = `# Nova Universe API Environment Configuration
# Auto-generated for development - customize for production

# ===================================================================
# BASIC CONFIGURATION
# ===================================================================

# Environment
NODE_ENV=development
API_PORT=3000
HOST=localhost

# Security
JWT_SECRET=${generateSecureString(64)}
SESSION_SECRET=${generateSecureString(64)}

# Organization settings
ORGANIZATION_NAME=Nova ITSM
ADMIN_EMAIL=admin@nova.local
ADMIN_PASSWORD=admin123

# Authentication
DISABLE_AUTH=false
KIOSK_TOKEN=dev_kiosk_token_secure_2024
SCIM_TOKEN=dev_scim_token_secure_2024

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:3001

# ===================================================================
# DATABASE CONFIGURATION
# ===================================================================

# PostgreSQL Primary Database
CORE_DATABASE_URL=postgresql://nova_admin:nova_password@localhost:5432/nova_universe
POSTGRES_DB=nova_universe
POSTGRES_USER=nova_admin
POSTGRES_PASSWORD=nova_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Core Database Configuration
CORE_DB_HOST=localhost
CORE_DB_PORT=5432
CORE_DB_NAME=nova_universe
CORE_DB_USER=nova_admin
CORE_DB_PASSWORD=nova_password

# Auth Database Configuration
AUTH_DB_HOST=localhost
AUTH_DB_PORT=5432
AUTH_DB_NAME=nova_universe
AUTH_DB_USER=nova_admin
AUTH_DB_PASSWORD=nova_password

# Audit Database Configuration
AUDIT_DB_HOST=localhost
AUDIT_DB_PORT=5432
AUDIT_DB_NAME=nova_universe
AUDIT_DB_USER=nova_admin
AUDIT_DB_PASSWORD=nova_password

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=mongo_secure_pass_2024
MONGO_DB=nova_logs
MONGO_PORT=27017
MONGO_URI=mongodb://admin:mongo_secure_pass_2024@localhost:27017/nova_logs?authSource=admin

# Redis Configuration
REDIS_PASSWORD=redis_secure_pass_2024
REDIS_PORT=6379
REDIS_HOST=localhost

# Elasticsearch
ELASTIC_PORT=9200
ELASTIC_PASSWORD=changeme
ELASTIC_HOST=localhost

# ===================================================================
# DEVELOPMENT SETTINGS
# ===================================================================

# Log Level: error, warn, info, debug
LOG_LEVEL=info
DB_VERBOSE_LOGGING=true

# Debug settings
DEBUG=false

# ===================================================================
# INTEGRATION SETTINGS
# ===================================================================

# Slack Integration (Nova Comms)
SLACK_BOT_TOKEN=xoxb-dev-token
SLACK_SIGNING_SECRET=dev-signing-secret
SLACK_APP_TOKEN=xapp-dev-token

# SMTP Configuration
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=admin@nova.local
SMTP_PASS=nova_smtp_pass_2024

# ===================================================================
# MCP SERVER CONFIGURATION
# ===================================================================

# Model Context Protocol Server
MCP_SERVER_ENABLED=true
MCP_SERVER_PORT=3001
MCP_SERVER_HOST=localhost

# ===================================================================
# PERFORMANCE & MONITORING
# ===================================================================

# Database Pool Settings
POSTGRES_POOL_MIN=2
POSTGRES_POOL_MAX=20
POSTGRES_POOL_ACQUIRE_TIMEOUT=60000
POSTGRES_POOL_IDLE_TIMEOUT=30000
POSTGRES_STATEMENT_TIMEOUT=30000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===================================================================
# DEVELOPMENT FLAGS
# ===================================================================

# Allow startup without database (for development)
ALLOW_START_WITHOUT_DB=true

# Enable mock database for development
MOCK_DB_ENABLED=false

# Debug database connections
DEBUG_DB_CONNECTION=true
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with default development configuration');
    console.log('📝 Please customize the configuration for your environment');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Setting up Nova Universe API environment...');
  
  try {
    createDefaultEnv();
    console.log('✅ Environment setup complete');
    console.log('💡 Run "npm run dev" to start the API server');
  } catch (error) {
    console.error('❌ Environment setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createDefaultEnv };
