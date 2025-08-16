// Database factory and abstraction layer
import { logger } from '../logger.js';
import { databaseConfig } from '../config/database.js';
import postgresManager, { PostgreSQLManager } from './postgresql.js';
import mongoManager, { MongoDBManager } from './mongodb.js';

/**
 * Database Factory
 * Provides unified interface for multiple database backends
 */
class DatabaseFactory {
  constructor() {
    this.initialized = false;
    this.initializationPromise = null;
    this.primaryDb = null;
    this.coreDb = postgresManager;
    this.authDb = new PostgreSQLManager(databaseConfig.auth_db);
    this.auditDb = mongoManager;
    this.availableDatabases = new Set();
  }

  /**
   * Initialize all configured databases
   */
  async initialize() {
    if (this.initialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = (async () => {
      logger.info('🚀 Initializing database connections...');
      try {
        await this.initializePostgreSQL();
        await this.initializeAuthPostgreSQL();
        if (process.env.MONGO_ENABLED === 'true') {
          await this.initializeMongoDB();
        }
        if (this.availableDatabases.size === 0) {
          const allowDegraded = process.env.ALLOW_START_WITHOUT_DB === 'true' || process.env.NODE_ENV === 'development';
          if (allowDegraded) {
            logger.warn('⚠️  No databases available. Continuing in degraded mode (ALLOW_START_WITHOUT_DB).');
          } else {
            throw new Error('No databases available. At least one database must be configured.');
          }
        } else {
          this.initialized = true;
          logger.info(`✅ Database initialization complete. Available: ${Array.from(this.availableDatabases).join(', ')}`);
        }
      } catch (error) {
        logger.error('❌ Database initialization failed:', error.message);
        if (!(process.env.ALLOW_START_WITHOUT_DB === 'true' || process.env.NODE_ENV === 'development')) {
          throw error;
        }
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Initialize PostgreSQL
   */
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
        throw error; // Fail fast if primary database fails
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

  /**
   * Initialize MongoDB
   */
  async initializeMongoDB() {
    try {
      const success = await this.auditDb.initialize();
      if (success) {
        this.availableDatabases.add('audit_db');
        logger.info('✅ MongoDB audit database initialized');
      }
    } catch (error) {
      logger.error('❌ MongoDB initialization failed:', error.message);
      // MongoDB is optional, don't fail if it's not available
    }
  }

  /**
   * Get primary database instance
   */
  getPrimaryDatabase() {
    if (!this.initialized) {
      throw new Error('Database factory not initialized. Call initialize() first.');
    }

    if (this.primaryDb) {
      return this.primaryDb;
    }

    throw new Error('No primary database available');
  }

  /**
   * Get MongoDB instance
   */
  getAuditDB() {
    if (!this.initialized) {
      throw new Error('Database factory not initialized. Call initialize() first.');
    }

    if (!this.auditDb) {
      throw new Error('MongoDB not available');
    }

    return this.auditDb;
  }

  /**
   * Check if a specific database is available
   */
  isDatabaseAvailable(dbType) {
    return this.availableDatabases.has(dbType);
  }

  /**
   * Get health status of all databases
   */
  async getHealthStatus() {
    const status = {
      initialized: this.initialized,
      available_databases: Array.from(this.availableDatabases),
      primary_database: databaseConfig.primary,
      health_checks: {}
    };

    // Check PostgreSQL health
    if (this.isDatabaseAvailable('core_db')) {
      try {
        status.health_checks.postgresql = await this.coreDb.healthCheck();
      } catch (error) {
        status.health_checks.postgresql = {
          status: 'error',
          error: error.message
        };
      }
    }

    // Check MongoDB health
    if (this.isDatabaseAvailable('audit_db')) {
      try {
        status.health_checks.mongodb = await this.auditDb.healthCheck();
      } catch (error) {
        status.health_checks.mongodb = {
          status: 'error',
          error: error.message
        };
      }
    }

    return status;
  }

  /**
   * Execute query on primary database with fallback
   */
  async query(sql, params = []) {
    const primaryDb = this.getPrimaryDatabase();

    try {
      if (primaryDb === postgresManager) {
        return await primaryDb.query(sql, params);
      } else {
        throw new Error('Unsupported primary database type');
      }
    } catch (error) {
      logger.error('❌ Primary database query failed:', error.message);
      
      // Try fallback to MongoDB if available and not already using it
      if (primaryDb !== this.auditDb && this.isDatabaseAvailable('audit_db')) {
        logger.warn('🔄 Falling back to MongoDB');
        const collectionName = sql.split(' ')[2]; // Extract collection name from SQL (naive approach)
        return await this.getDocuments(collectionName, params[0]);
      }
      
      throw error;
    }
  }

  /**
   * Store document in MongoDB (if available)
   */
  async storeDocument(collection, document) {
    if (!this.isDatabaseAvailable('audit_db')) {
      throw new Error('MongoDB not available for document storage');
    }

    const mongoCollection = this.auditDb.collection(collection);
    return await mongoCollection.insertOne({
      ...document,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Retrieve documents from MongoDB
   */
  async getDocuments(collection, filter = {}, options = {}) {
    if (!this.isDatabaseAvailable('audit_db')) {
      throw new Error('MongoDB not available for document retrieval');
    }

    const mongoCollection = this.auditDb.collection(collection);
    return await mongoCollection.find(filter, options).toArray();
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(action, userId, details = {}) {
    if (this.isDatabaseAvailable('audit_db')) {
      await this.auditDb.logAudit(action, userId, details);
    } else {
      // Fallback to primary database audit table
      try {
        await this.query(
          'INSERT INTO audit_logs (action, user_id, details, timestamp) VALUES ($1, $2, $3, $4)',
          [action, userId, JSON.stringify(details), new Date().toISOString()]
        );
      } catch (error) {
        logger.error('❌ Failed to create audit log:', error.message);
      }
    }
  }

  /**
   * Gracefully close all database connections
   */
  async close() {
    logger.info('📴 Closing database connections...');

    const closePromises = [];

    if (this.coreDb) {
      closePromises.push(this.coreDb.close());
    }

    if (this.authDb) {
      closePromises.push(this.authDb.close());
    }

    if (this.auditDb) {
      closePromises.push(this.auditDb.close());
    }

    await Promise.all(closePromises);
    this.initialized = false;
    logger.info('✅ All database connections closed');
  }
}

// Create singleton instance
const dbFactory = new DatabaseFactory();

// Export both the instance and the class for testing
export default dbFactory;
export { DatabaseFactory };
