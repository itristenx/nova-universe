// Nova Database Integration for Uptime Kuma
// This script configures Uptime Kuma to use Nova's PostgreSQL database instead of SQLite

const fs = require('fs');
const path = require('path');

// Nova Database Configuration
const NOVA_DB_CONFIG = {
    host: process.env.UPTIME_KUMA_NOVA_DB_HOST || 'postgres',
    port: parseInt(process.env.UPTIME_KUMA_NOVA_DB_PORT) || 5432,
    database: process.env.UPTIME_KUMA_NOVA_DB_NAME || 'nova_universe',
    username: process.env.UPTIME_KUMA_NOVA_DB_USER || 'nova_admin',
    password: process.env.UPTIME_KUMA_NOVA_DB_PASSWORD || 'nova_password',
    schema: 'uptime_kuma'
};

// Check if Nova database integration is enabled
const NOVA_INTEGRATION_ENABLED = process.env.UPTIME_KUMA_USE_NOVA_DB === 'true';

if (!NOVA_INTEGRATION_ENABLED) {
    console.log('Nova database integration disabled. Using default SQLite.');
    process.exit(0);
}

console.log('Configuring Uptime Kuma for Nova database integration...');

// Create database configuration for Uptime Kuma
const dbConfig = {
    type: 'postgres',
    host: NOVA_DB_CONFIG.host,
    port: NOVA_DB_CONFIG.port,
    username: NOVA_DB_CONFIG.username,
    password: NOVA_DB_CONFIG.password,
    database: NOVA_DB_CONFIG.database,
    schema: NOVA_DB_CONFIG.schema,
    synchronize: false, // Don't auto-sync schema, we manage it manually
    logging: process.env.NODE_ENV === 'development',
    entities: [], // Will be populated by Uptime Kuma
    migrations: [], // We handle migrations in Nova
    extra: {
        searchPath: `${NOVA_DB_CONFIG.schema},public`
    }
};

// Write the database configuration
const configPath = '/app/data/database-config.json';
fs.writeFileSync(configPath, JSON.stringify(dbConfig, null, 2));

console.log(`Database configuration written to ${configPath}`);

// Create environment variables for Uptime Kuma to use PostgreSQL
process.env.UPTIME_KUMA_DATABASE_TYPE = 'postgres';
process.env.UPTIME_KUMA_DATABASE_HOST = NOVA_DB_CONFIG.host;
process.env.UPTIME_KUMA_DATABASE_PORT = NOVA_DB_CONFIG.port.toString();
process.env.UPTIME_KUMA_DATABASE_NAME = NOVA_DB_CONFIG.database;
process.env.UPTIME_KUMA_DATABASE_USERNAME = NOVA_DB_CONFIG.username;
process.env.UPTIME_KUMA_DATABASE_PASSWORD = NOVA_DB_CONFIG.password;
process.env.UPTIME_KUMA_DATABASE_SCHEMA = NOVA_DB_CONFIG.schema;

// Disable SQLite
process.env.UPTIME_KUMA_DISABLE_SQLITE = 'true';

// Nova API integration settings
process.env.UPTIME_KUMA_NOVA_API_URL = process.env.NOVA_API_URL || 'http://nova-api:3000';
process.env.UPTIME_KUMA_NOVA_WEBHOOK_SECRET = process.env.NOVA_WEBHOOK_SECRET || 'nova-uptime-kuma-webhook-secret';

// Authentication integration
process.env.UPTIME_KUMA_AUTH_METHOD = 'nova';
process.env.UPTIME_KUMA_DISABLE_LOCAL_AUTH = 'true';

console.log('Nova database integration configured successfully!');
console.log('Configuration:', {
    database: `${NOVA_DB_CONFIG.host}:${NOVA_DB_CONFIG.port}/${NOVA_DB_CONFIG.database}`,
    schema: NOVA_DB_CONFIG.schema,
    authMethod: 'nova',
    localAuthDisabled: true
});