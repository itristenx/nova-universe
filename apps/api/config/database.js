// Database configuration and factory
import { logger } from '../logger.js';

/**
 * Database configuration for PostgreSQL and MongoDB
 * Supports both local development and production environments
 */

export const databaseConfig = {
  // Default to PostgreSQL for primary operations
  primary: process.env.PRIMARY_DB || 'postgresql',
  
  postgresql: {
    // Connection pool configuration
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'nova_universe',
    user: process.env.POSTGRES_USER || 'nova_admin',
    password: (() => {
      const password = process.env.POSTGRES_PASSWORD;
      if (!password) {
        logger.error('POSTGRES_PASSWORD is not set. Falling back to a secure default password.');
        return generateSecurePassword();
      }
      return password;
    })(),
    
    // SSL/TLS configuration
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED !== 'false',
      ca: process.env.POSTGRES_SSL_CA,
      cert: process.env.POSTGRES_SSL_CERT,
      key: process.env.POSTGRES_SSL_KEY,
    } : false,
    
    // Connection pool settings for scalability
    pool: {
      min: parseInt(process.env.POSTGRES_POOL_MIN || '2'),
      max: parseInt(process.env.POSTGRES_POOL_MAX || '20'),
      acquireTimeoutMillis: parseInt(process.env.POSTGRES_POOL_ACQUIRE_TIMEOUT || '60000'),
      idleTimeoutMillis: parseInt(process.env.POSTGRES_POOL_IDLE_TIMEOUT || '30000'),
      createTimeoutMillis: parseInt(process.env.POSTGRES_POOL_CREATE_TIMEOUT || '30000'),
      destroyTimeoutMillis: parseInt(process.env.POSTGRES_POOL_DESTROY_TIMEOUT || '5000'),
      reapIntervalMillis: parseInt(process.env.POSTGRES_POOL_REAP_INTERVAL || '1000'),
      createRetryIntervalMillis: parseInt(process.env.POSTGRES_POOL_CREATE_RETRY_INTERVAL || '200'),
    },
    
    // Query configuration
    statement_timeout: parseInt(process.env.POSTGRES_STATEMENT_TIMEOUT || '30000'),
    query_timeout: parseInt(process.env.POSTGRES_QUERY_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '5000'),
  },
  
  mongodb: {
    // Connection configuration
    host: process.env.MONGO_HOST || 'localhost',
    port: parseInt(process.env.MONGO_PORT || '27017'),
    database: process.env.MONGO_DB || 'nova_universe',
    username: process.env.MONGO_USERNAME || 'nova_admin',
    password: process.env.MONGO_PASSWORD || generateSecurePassword(),
    
    // Connection URI without credentials for security
    // Note: Credentials (username and password) are intentionally excluded from the URI
    // to prevent sensitive information from being exposed in logs or error messages.
    // Authentication should be handled separately via the `options` object below.
    get uri() {
      const sslOptions = process.env.NODE_ENV === 'production' ? '&ssl=true' : '';
      return `mongodb://${this.host}:${this.port}/${this.database}?retryWrites=true&w=majority${sslOptions}`;
    },
    
    // MongoDB client options
    options: {
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10'),
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '2'),
      maxIdleTimeMS: parseInt(process.env.MONGO_MAX_IDLE_TIME || '30000'),
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT || '5000'),
      socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT || '45000'),
      connectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT || '10000'),
      heartbeatFrequencyMS: parseInt(process.env.MONGO_HEARTBEAT_FREQUENCY || '10000'),
      retryWrites: true,
      retryReads: true,
      compressors: ['snappy', 'zlib'],
      
      // Security options
      authSource: process.env.MONGO_AUTH_SOURCE || 'admin',
      authMechanism: process.env.MONGO_AUTH_MECHANISM || 'SCRAM-SHA-256',
    }
  },
  
  // SQLite fallback for development/testing
  sqlite: {
    filename: process.env.SQLITE_DB || 'log.sqlite',
    options: {
      verbose: process.env.NODE_ENV === 'development'
    }
  }
};

/**
 * Generate secure random password for database users
 * Used when no password is provided in environment
 */
function generateSecurePassword() {
  if (process.env.NODE_ENV === 'development') {
    return 'dev_password_123!';
  }
  
  // In production, this should be provided via environment variables
  // This is just a fallback that generates a random password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 32; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  if (!process.env.CLI_MODE) {
    logger.warn('⚠️  Database password generated automatically. Please set proper credentials in environment variables.');
    logger.warn(`Generated password: ${password}`);
  }
  
  return password;
}

/**
 * Validate database configuration
 */
export function validateDatabaseConfig() {
  const errors = [];
  
  // Check required PostgreSQL config
  if (databaseConfig.primary === 'postgresql' || process.env.POSTGRES_ENABLED === 'true') {
    if (!databaseConfig.postgresql.host) errors.push('POSTGRES_HOST is required');
    if (!databaseConfig.postgresql.database) errors.push('POSTGRES_DB is required');
    if (!databaseConfig.postgresql.user) errors.push('POSTGRES_USER is required');
    if (!databaseConfig.postgresql.password) errors.push('POSTGRES_PASSWORD is required');
  }
  
  // Check required MongoDB config if enabled
  if (process.env.MONGO_ENABLED === 'true') {
    if (!databaseConfig.mongodb.host) errors.push('MONGO_HOST is required');
    if (!databaseConfig.mongodb.database) errors.push('MONGO_DB is required');
  }
  
  // Production security checks
  if (process.env.NODE_ENV === 'production') {
    if (databaseConfig.postgresql.password === 'dev_password_123!') {
      errors.push('Production PostgreSQL password must be set via POSTGRES_PASSWORD');
    }
    if (databaseConfig.mongodb.password === 'dev_password_123!') {
      errors.push('Production MongoDB password must be set via MONGO_PASSWORD');
    }
    if (!databaseConfig.postgresql.ssl) {
      logger.warn('⚠️  PostgreSQL SSL is disabled in production');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Database configuration errors:\n${errors.join('\n')}`);
  }
  
  return true;
}

export default databaseConfig;
