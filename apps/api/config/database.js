// Database configuration and factory
import { logger } from '../logger.js';

/**
 * Generate a secure password for development
 */
function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Database configuration for PostgreSQL and MongoDB
 * Supports both local development and production environments
 */

export const databaseConfig = {
  // Default to PostgreSQL for primary operations
  primary: process.env.PRIMARY_DB || 'core_db',

  core_db: {
    // Connection pool configuration
    host: process.env.CORE_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.CORE_DB_PORT || process.env.POSTGRES_PORT || '5432'),
    database: process.env.CORE_DB_NAME || process.env.POSTGRES_DB || 'nova_universe',
    user: process.env.CORE_DB_USER || process.env.POSTGRES_USER || 'nova_admin',
    password: (() => {
      const password = process.env.CORE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
      if (!password) {
        if (process.env.NODE_ENV === 'production') {
          logger.error('CRITICAL: CORE_DB_PASSWORD or POSTGRES_PASSWORD must be set for production deployment');
          throw new Error('Database password is required in production environment');
        }
        const devPassword = generateSecurePassword();
        logger.warn('Using fallback password for development only');
        logger.warn('⚠️  Database password generated automatically. Please set proper credentials in environment variables.');
        return devPassword;
      }
      return password;
    })(),

    // SSL/TLS configuration
    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED !== 'false',
            ca: process.env.POSTGRES_SSL_CA,
            cert: process.env.POSTGRES_SSL_CERT,
            key: process.env.POSTGRES_SSL_KEY,
          }
        : false,

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
    host: process.env.AUTH_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.AUTH_DB_PORT || process.env.POSTGRES_PORT || '5432'),
    database: process.env.AUTH_DB_NAME || process.env.POSTGRES_DB || 'nova_universe',
    user: process.env.AUTH_DB_USER || process.env.POSTGRES_USER || 'nova_admin',
    password: (() => {
      const password = process.env.AUTH_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
      if (!password) {
        if (process.env.NODE_ENV === 'production') {
          logger.error('CRITICAL: AUTH_DB_PASSWORD or POSTGRES_PASSWORD must be set for production deployment');
          throw new Error('Auth database password is required in production environment');
        }
        const devPassword = generateSecurePassword();
        logger.warn('Using fallback password for development only');
        logger.warn('⚠️  Database password generated automatically. Please set proper credentials in environment variables.');
        return devPassword;
      }
      return password;
    })(),
    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED !== 'false',
            ca: process.env.POSTGRES_SSL_CA,
            cert: process.env.POSTGRES_SSL_CERT,
            key: process.env.POSTGRES_SSL_KEY,
          }
        : false,
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
    host: process.env.AUDIT_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.AUDIT_DB_PORT || process.env.POSTGRES_PORT || '5432'),
    database: process.env.AUDIT_DB_NAME || process.env.POSTGRES_DB || 'nova_universe',
    user: process.env.AUDIT_DB_USER || process.env.POSTGRES_USER || 'nova_admin',
    password: (() => {
      const password = process.env.AUDIT_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
      if (!password) {
        if (process.env.NODE_ENV === 'production') {
          logger.error('CRITICAL: AUDIT_DB_PASSWORD or POSTGRES_PASSWORD must be set for production deployment');
          throw new Error('Audit database password is required in production environment');
        }
        const devPassword = generateSecurePassword();
        logger.warn('Using fallback password for development only');
        return devPassword;
      }
      return password;
    })(),
    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED !== 'false',
            ca: process.env.POSTGRES_SSL_CA,
            cert: process.env.POSTGRES_SSL_CERT,
            key: process.env.POSTGRES_SSL_KEY,
          }
        : false,
    pool: {
      min: parseInt(process.env.POSTGRES_POOL_MIN || '2'),
      max: parseInt(process.env.POSTGRES_POOL_MAX || '10'),
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

  mongo: {
    url: process.env.MONGO_URI || `mongodb://${process.env.MONGO_ROOT_USERNAME || 'admin'}:${process.env.MONGO_ROOT_PASSWORD || 'mongo_secure_pass_2024'}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DB || 'nova_logs'}?authSource=admin`,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE || '10'),
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT || '5000'),
      socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT || '45000'),
      bufferMaxEntries: 0,
      retryWrites: true,
      w: 'majority',
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || 'redis_secure_pass_2024',
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  },
};

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

  if (!databaseConfig.audit_db.host) errors.push('AUDIT_DB_HOST is required');
  if (!databaseConfig.audit_db.database) errors.push('AUDIT_DB_NAME is required');
  if (!databaseConfig.audit_db.user) errors.push('AUDIT_DB_USER is required');
  if (!databaseConfig.audit_db.password) errors.push('AUDIT_DB_PASSWORD is required');

  if (!databaseConfig.mongo.url) errors.push('MONGO_URI is required');
  if (!databaseConfig.redis.host) errors.push('REDIS_HOST is required');

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
