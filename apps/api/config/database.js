// Database configuration and factory
import { logger } from '../logger.js';

/**
 * Database configuration for PostgreSQL and MongoDB
 * Supports both local development and production environments
 */

export const databaseConfig = {
  // Default to PostgreSQL for primary operations
  primary: process.env.PRIMARY_DB || 'core_db',

  core_db: {
    // Connection pool configuration
    host: process.env.CORE_DB_HOST || 'localhost',
    port: parseInt(process.env.CORE_DB_PORT || '5432'),
    database: process.env.CORE_DB_NAME || 'nova_universe',
    user: process.env.CORE_DB_USER || 'nova_user',
    password: (() => {
      const password = process.env.CORE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
      if (!password) {
        logger.error('POSTGRES_PASSWORD is not set. Using nova_password.');
        return 'nova_password';
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

  auth_db: {
    host: process.env.AUTH_DB_HOST || 'localhost',
    port: parseInt(process.env.AUTH_DB_PORT || '5432'),
    database: process.env.AUTH_DB_NAME || 'nova_universe',
    user: process.env.AUTH_DB_USER || 'nova_user',
    password: (() => {
      const password = process.env.AUTH_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
      if (!password) {
        logger.error('AUTH_DB_PASSWORD is not set. Using nova_password.');
        return 'nova_password';
      }
      return password;
    })(),
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED !== 'false',
      ca: process.env.POSTGRES_SSL_CA,
      cert: process.env.POSTGRES_SSL_CERT,
      key: process.env.POSTGRES_SSL_KEY,
    } : false,
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
    statement_timeout: parseInt(process.env.POSTGRES_STATEMENT_TIMEOUT || '30000'),
    query_timeout: parseInt(process.env.POSTGRES_QUERY_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '5000'),
  },

  audit_db: {
    // Connection configuration
    uri: process.env.AUDIT_DATABASE_URL || 'mongodb://localhost:27017/nova_audit',
    username: process.env.AUDIT_DB_USER || 'nova_admin',
    password: process.env.AUDIT_DB_PASSWORD || generateSecurePassword(),
    
    // Build connection URI with SSL options for production
    get connectionUri() {
      const baseUri = process.env.AUDIT_DATABASE_URL || 'mongodb://localhost:27017/nova_audit';
      const sslOptions = process.env.NODE_ENV === 'production' ? '&ssl=true' : '';
      return `${baseUri}${sslOptions}`;
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

  if (!databaseConfig.core_db.host) errors.push('CORE_DB_HOST is required');
  if (!databaseConfig.core_db.database) errors.push('CORE_DB_NAME is required');
  if (!databaseConfig.core_db.user) errors.push('CORE_DB_USER is required');
  if (!databaseConfig.core_db.password) errors.push('CORE_DB_PASSWORD is required');

  if (!databaseConfig.auth_db.host) errors.push('AUTH_DB_HOST is required');
  if (!databaseConfig.auth_db.database) errors.push('AUTH_DB_NAME is required');
  if (!databaseConfig.auth_db.user) errors.push('AUTH_DB_USER is required');
  if (!databaseConfig.auth_db.password) errors.push('AUTH_DB_PASSWORD is required');

  if (!databaseConfig.audit_db.uri) errors.push('AUDIT_DATABASE_URL is required');
  
  // Production security checks
  if (process.env.NODE_ENV === 'production') {
    if (databaseConfig.core_db.password === 'dev_password_123!') {
      errors.push('Production PostgreSQL password must be set via CORE_DB_PASSWORD');
    }
    if (databaseConfig.auth_db.password === 'dev_password_123!') {
      errors.push('Production PostgreSQL password must be set via AUTH_DB_PASSWORD');
    }
    if (databaseConfig.audit_db.password === 'dev_password_123!') {
      errors.push('Production MongoDB password must be set via AUDIT_DB_PASSWORD');
    }
    if (!databaseConfig.core_db.ssl) {
      logger.warn('⚠️  PostgreSQL SSL is disabled in production');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Database configuration errors:\n${errors.join('\n')}`);
  }
  
  return true;
}

export default databaseConfig;
