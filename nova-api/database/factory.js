// Database factory and abstraction layer
import { logger } from '../logger.js';
import { databaseConfig } from '../config/database.js';
import postgresManager from './postgresql.js';
import mongoManager from './mongodb.js';
import sqlite3pkg from 'sqlite3';

const sqlite3 = sqlite3pkg.verbose();

/**
 * Database Factory
 * Provides unified interface for multiple database backends
 */
class DatabaseFactory {
  constructor() {
    this.initialized = false;
    this.primaryDb = null;
    this.mongodb = null;
    this.sqliteDb = null;
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

      // Initialize SQLite as fallback
      await this.initializeSQLite();

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
   * Initialize SQLite as fallback
   */
  async initializeSQLite() {
    try {
      return new Promise((resolve) => {
        this.sqliteDb = new sqlite3.Database(databaseConfig.sqlite.filename, (err) => {
          if (err) {
            logger.error('❌ SQLite initialization failed:', err.message);
            resolve(false);
          } else {
            this.availableDatabases.add('sqlite');
            logger.info('✅ SQLite initialized as fallback database');
            resolve(true);
          }
        });
      });
    } catch (error) {
      logger.error('❌ SQLite initialization failed:', error.message);
      return false;
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

    if (this.sqliteDb) {
      return this.sqliteDb;
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
   * Get SQLite instance
   */
  getSQLite() {
    if (!this.initialized) {
      throw new Error('Database factory not initialized. Call initialize() first.');
    }

    if (!this.sqliteDb) {
      throw new Error('SQLite not available');
    }

    return this.sqliteDb;
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

    // Check SQLite health
    if (this.isDatabaseAvailable('sqlite')) {
      status.health_checks.sqlite = {
        status: 'healthy',
        connected: true,
        file: databaseConfig.sqlite.filename
      };
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
      } else if (primaryDb === this.sqliteDb) {
        return await this.executeSQLiteQuery(sql, params);
      } else {
        throw new Error('Unsupported primary database type');
      }
    } catch (error) {
      logger.error('❌ Primary database query failed:', error.message);
      
      // Try fallback to SQLite if available and not already using it
      if (primaryDb !== this.sqliteDb && this.isDatabaseAvailable('sqlite')) {
        logger.warn('🔄 Falling back to SQLite database');
        return await this.executeSQLiteQuery(sql, params);
      }
      
      throw error;
    }
  }

  /**
   * Execute SQLite query with Promise wrapper
   */
  async executeSQLiteQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (sql.trim().toLowerCase().startsWith('select')) {
        this.sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        this.sqliteDb.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ 
            rowCount: this.changes,
            lastID: this.lastID 
          });
        });
      }
    });
  }

  /**
   * Execute transaction on primary database
   */
  async transaction(callback) {
    const primaryDb = this.getPrimaryDatabase();

    if (primaryDb === postgresManager) {
      return await primaryDb.transaction(callback);
    } else if (primaryDb === this.sqliteDb) {
      return await this.executeSQLiteTransaction(callback);
    } else {
      throw new Error('Transactions not supported for this database type');
    }
  }

  /**
   * Execute SQLite transaction
   */
  async executeSQLiteTransaction(callback) {
    return new Promise((resolve, reject) => {
      this.sqliteDb.serialize(async () => {
        try {
          await this.executeSQLiteQuery('BEGIN TRANSACTION');
          const result = await callback(this.sqliteDb);
          await this.executeSQLiteQuery('COMMIT');
          resolve(result);
        } catch (error) {
          await this.executeSQLiteQuery('ROLLBACK');
          reject(error);
        }
      });
    });
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
          'INSERT INTO audit_logs (action, user_id, details, timestamp) VALUES (?, ?, ?, ?)',
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

    if (this.sqliteDb) {
      closePromises.push(
        new Promise((resolve) => {
          this.sqliteDb.close((err) => {
            if (err) logger.error('❌ Error closing SQLite:', err.message);
            else logger.info('📴 SQLite connection closed');
            resolve();
          });
        })
      );
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
