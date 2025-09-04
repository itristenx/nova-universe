// Database factory and abstraction layer
import { logger } from '../logger.js';
import { databaseConfig } from '../config/database.js';

// Import database managers with graceful fallbacks
let postgresManager, PostgreSQLManager, mongoManager;

try {
  const postgresModule = await import('./postgresql.js');
  postgresManager = postgresModule.default;
  PostgreSQLManager = postgresModule.PostgreSQLManager;
} catch (error) {
  logger.warn('PostgreSQL manager not available:', error.message);
  postgresManager = null;
  PostgreSQLManager = null;
}

try {
  const mongoModule = await import('./mongodb.js');
  mongoManager = mongoModule.default;
} catch (error) {
  logger.warn('MongoDB manager not available:', error.message);
  mongoManager = null;
}

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
    this.authDb = PostgreSQLManager ? new PostgreSQLManager(databaseConfig.auth_db) : null;
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
        if (postgresManager) {
          await this.initializePostgreSQL();
        }
        
        if (PostgreSQLManager && this.authDb) {
          await this.initializeAuthPostgreSQL();
        }
        
        if (mongoManager && process.env.MONGO_ENABLED === 'true') {
          await this.initializeMongoDB();
        }
        
        if (this.availableDatabases.size === 0) {
          throw new Error('No databases available. At least one database must be configured.');
        } else {
          this.initialized = true;
          logger.info(
            `✅ Database initialization complete. Available: ${Array.from(this.availableDatabases).join(', ')}`,
          );
        }
      } catch (error) {
        logger.error('❌ Database initialization failed:', error.message);
        throw error;
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
      if (!postgresManager) {
        logger.warn('PostgreSQL manager not available');
        return false;
      }

      const success = await postgresManager.initialize();
      if (success) {
        this.primaryDb = postgresManager;
        this.availableDatabases.add('core_db');
        logger.info('✅ Core PostgreSQL initialized');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('❌ PostgreSQL initialization failed:', error.message);
      if (databaseConfig.primary === 'postgresql') {
        throw error;
      }
      return false;
    }
  }

  /**
   * Initialize Auth PostgreSQL
   */
  async initializeAuthPostgreSQL() {
    try {
      if (!this.authDb) {
        logger.warn('Auth PostgreSQL manager not available');
        return false;
      }

      const success = await this.authDb.initialize();
      if (success) {
        this.availableDatabases.add('auth_db');
        logger.info('✅ Auth PostgreSQL initialized');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('❌ Auth PostgreSQL initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Initialize MongoDB
   */
  async initializeMongoDB() {
    try {
      if (!mongoManager) {
        logger.warn('MongoDB manager not available');
        return false;
      }

      const success = await mongoManager.initialize();
      if (success) {
        this.availableDatabases.add('audit_db');
        logger.info('✅ MongoDB initialized');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('❌ MongoDB initialization failed:', error.message);
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
      health_checks: {},
    };

    // Check PostgreSQL health
    if (this.isDatabaseAvailable('core_db')) {
      try {
        status.health_checks.postgresql = await this.coreDb.healthCheck();
      } catch (error) {
        status.health_checks.postgresql = {
          status: 'error',
          error: error.message,
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
          error: error.message,
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
      updated_at: new Date(),
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
          [action, userId, JSON.stringify(details), new Date().toISOString()],
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

  /**
   * Create mock database for development mode
   */
  createMockDatabase() {
    throw new Error('Mock database is disabled. Configure real databases.');
  }
}

// Create singleton instance
const dbFactory = new DatabaseFactory();

// Export both the instance and the class for testing
export default dbFactory;
export { DatabaseFactory };
