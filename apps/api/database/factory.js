// Database factory and abstraction layer
import { logger } from '../logger.js';
import { databaseConfig } from '../config/database.js';
import postgresManager, { PostgreSQLManager } from './postgresql.js';
import mongoManager, { MongoDBManager } from './mongodb.js';

class InMemoryDb {
  constructor() {
    this.pool = { totalCount: 0, idleCount: 0, waitingCount: 0 };
    this.isConnected = true;
  }
  async initialize() { return true; }
  async query() { return { rows: [], rowCount: 0 }; }
  async healthCheck() { return { status: 'healthy' }; }
  async close() { this.isConnected = false; }
}

/**
 * Database Factory
 * Provides unified interface for multiple database backends
 */
class DatabaseFactory {
  constructor() {
    this.initialized = false;
    this.primaryDb = null;
    this.coreDb = postgresManager;
    this.authDb = new PostgreSQLManager(databaseConfig.auth_db);
    this.auditDb = mongoManager;
    this.availableDatabases = new Set();
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    logger.info('🚀 Initializing database connections...');

    const allowMemory = process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'test';

    try {
      await this.initializePostgreSQL();
      await this.initializeAuthPostgreSQL();

      if (process.env.MONGO_ENABLED === 'true') {
        await this.initializeMongoDB();
      }

      if (this.availableDatabases.size === 0 && allowMemory) {
        logger.warn('⚠️  No databases available, falling back to in-memory DB for TEST_MODE.');
        this.coreDb = new InMemoryDb();
        this.authDb = new InMemoryDb();
        this.primaryDb = this.coreDb;
        this.availableDatabases.add('core_db');
      }

      if (this.availableDatabases.size === 0) {
        throw new Error('No databases available. At least one database must be configured.');
      }

      this.initialized = true;
      logger.info(`✅ Database initialization complete. Available: ${Array.from(this.availableDatabases).join(', ')}`);

    } catch (error) {
      logger.error('❌ Database initialization failed:', error.message);
      if (allowMemory) {
        logger.warn('⚠️  Enabling in-memory database due to initialization failure in TEST_MODE.');
        this.coreDb = new InMemoryDb();
        this.authDb = new InMemoryDb();
        this.primaryDb = this.coreDb;
        this.availableDatabases.add('core_db');
        this.initialized = true;
      } else {
        throw error;
      }
    }
  }

  async initializePostgreSQL() {
    try {
      const success = await this.coreDb.initialize();
      if (success) {
        this.primaryDb = this.coreDb;
        this.availableDatabases.add('core_db');
        logger.info('✅ Core PostgreSQL initialized');
      }
    } catch (error) {
      logger.error('❌ PostgreSQL initialization failed:', error.message);
      if (databaseConfig.primary === 'postgresql') {
        throw error;
      }
    }
  }

  async initializeAuthPostgreSQL() {
    try {
      const success = await this.authDb.initialize();
      if (success) {
        this.availableDatabases.add('auth_db');
        logger.info('✅ Auth PostgreSQL initialized');
      }
    } catch (error) {
      logger.error('❌ Auth PostgreSQL initialization failed:', error.message);
    }
  }

  async initializeMongoDB() {
    try {
      const success = await this.auditDb.initialize();
      if (success) {
        this.availableDatabases.add('audit_db');
        logger.info('✅ MongoDB audit database initialized');
      }
    } catch (error) {
      logger.error('❌ MongoDB initialization failed:', error.message);
    }
  }

  getPrimaryDatabase() {
    if (!this.initialized) {
      throw new Error('Database factory not initialized. Call initialize() first.');
    }

    if (this.primaryDb) {
      return this.primaryDb;
    }

    throw new Error('No primary database available');
  }

  isDatabaseAvailable(dbType) {
    return this.availableDatabases.has(dbType);
  }

  async getHealthStatus() {
    const status = {
      initialized: this.initialized,
      available_databases: Array.from(this.availableDatabases),
      primary_database: databaseConfig.primary,
      health_checks: {}
    };

    if (this.isDatabaseAvailable('core_db')) {
      try {
        status.health_checks.postgresql = await this.coreDb.healthCheck();
      } catch (error) {
        status.health_checks.postgresql = { status: 'error', error: error.message };
      }
    }

    if (this.isDatabaseAvailable('audit_db')) {
      try {
        status.health_checks.mongodb = await this.auditDb.healthCheck();
      } catch (error) {
        status.health_checks.mongodb = { status: 'error', error: error.message };
      }
    }

    return status;
  }

  async query(sql, params = []) {
    const primaryDb = this.getPrimaryDatabase();
    return primaryDb.query(sql, params);
  }
}

const dbFactory = new DatabaseFactory();

export default dbFactory;
export { DatabaseFactory };
