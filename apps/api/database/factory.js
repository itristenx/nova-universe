// Database factory and abstraction layer
import { logger } from '../logger.js';
import { databaseConfig } from '../config/database.js';
import postgresManager from './postgresql.js';
import mongoManager from './mongodb.js';

/**
 * Database Factory
 * Provides unified interface for multiple database backends
 */
class DatabaseFactory {
  constructor() {
    this.initialized = false;
    this.primaryDb = null;
    this.mongodb = null;
    this.availableDatabases = new Set();
  }

  /**
   * Initialize all configured databases
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    logger.info('🚀 Initializing database connections...');

    try {
      // Initialize primary database (PostgreSQL by default)
      if (databaseConfig.primary === 'postgresql' || process.env.POSTGRES_ENABLED === 'true') {
        await this.initializePostgreSQL();
      }

      // Initialize MongoDB if enabled
      if (process.env.MONGO_ENABLED === 'true') {
        await this.initializeMongoDB();
      }

      // Ensure we have at least one working database
      if (this.availableDatabases.size === 0) {
        throw new Error('No databases available. At least one database must be configured.');
      }

      this.initialized = true;
      logger.info(`✅ Database initialization complete. Available: ${Array.from(this.availableDatabases).join(', ')}`);

    } catch (error) {
      logger.error('❌ Database initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Initialize PostgreSQL
   */
  async initializePostgreSQL() {
    try {
      const success = await postgresManager.initialize();
      if (success) {
        this.primaryDb = postgresManager;
        this.availableDatabases.add('postgresql');
        logger.info('✅ PostgreSQL initialized as primary database');
      }
    } catch (error) {
      logger.error('❌ PostgreSQL initialization failed:', error.message);
      if (databaseConfig.primary === 'postgresql') {
        throw error; // Fail fast if primary database fails
      }
    }
  }

  /**
   * Initialize MongoDB
   */
  async initializeMongoDB() {
    try {
      const success = await mongoManager.initialize();
      if (success) {
        this.mongodb = mongoManager;
        this.availableDatabases.add('mongodb');
        logger.info('✅ MongoDB initialized');
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
  getMongoDB() {
    if (!this.initialized) {
      throw new Error('Database factory not initialized. Call initialize() first.');
    }

    if (!this.mongodb) {
      throw new Error('MongoDB not available');
    }

    return this.mongodb;
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
    if (this.isDatabaseAvailable('postgresql')) {
      try {
        status.health_checks.postgresql = await postgresManager.healthCheck();
      } catch (error) {
        status.health_checks.postgresql = {
          status: 'error',
          error: error.message
        };
      }
    }

    // Check MongoDB health
    if (this.isDatabaseAvailable('mongodb')) {
      try {
        status.health_checks.mongodb = await mongoManager.healthCheck();
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
      if (primaryDb !== this.mongodb && this.isDatabaseAvailable('mongodb')) {
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
    if (!this.isDatabaseAvailable('mongodb')) {
      throw new Error('MongoDB not available for document storage');
    }

    const mongoCollection = this.mongodb.collection(collection);
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
    if (!this.isDatabaseAvailable('mongodb')) {
      throw new Error('MongoDB not available for document retrieval');
    }

    const mongoCollection = this.mongodb.collection(collection);
    return await mongoCollection.find(filter, options).toArray();
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(action, userId, details = {}) {
    if (this.isDatabaseAvailable('mongodb')) {
      await this.mongodb.logAudit(action, userId, details);
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

    if (this.primaryDb === postgresManager) {
      closePromises.push(postgresManager.close());
    }

    if (this.mongodb) {
      closePromises.push(mongoManager.close());
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
