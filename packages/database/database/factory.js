// database/factory.js
// Database factory for unified access to PostgreSQL, MongoDB, and SQLite
import { PostgreSQLManager } from './postgresql.js';
import { MongoDBManager } from './mongodb.js';
import { logger } from '../nova-api/logger.js';
import { databaseConfig } from '../nova-api/config/database.js';

export class DatabaseFactory {
  constructor() {
    this.postgresql = null;
    this.mongodb = null;
    this.config = databaseConfig;
    this.isInitialized = false;
  }

  /**
   * Initialize database connections based on configuration
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      logger.info('Initializing database factory...');
      // Use correct config property for primary database
      const primaryDatabases = (this.config.primary || this.config.primaryDatabase || 'sqlite').split(',').map(db => db.trim());
      
      // Initialize PostgreSQL if enabled
      if (primaryDatabases.includes('postgresql')) {
        this.postgresql = new PostgreSQLManager();
        await this.postgresql.initialize(); // TODO-LINT: move to async function
        logger.info('PostgreSQL initialized in factory');
      }

      // Initialize MongoDB if enabled
      if (primaryDatabases.includes('mongodb')) {
        this.mongodb = new MongoDBManager();
        await this.mongodb.initialize(); // TODO-LINT: move to async function
        logger.info('MongoDB initialized in factory');
      }

      this.isInitialized = true;
      logger.info('Database factory initialization completed');
    } catch (error) {
      logger.error('Database factory initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute PostgreSQL query
   */
  async query(text, params = []) {
    if (!this.postgresql) {
      throw new Error('PostgreSQL not initialized');
    }
    return await this.postgresql.query(text, params); // TODO-LINT: move to async function
  }

  /**
   * Execute PostgreSQL transaction
   */
  async transaction(callback) {
    if (!this.postgresql) {
      throw new Error('PostgreSQL not initialized');
    }
    return await this.postgresql.transaction(callback); // TODO-LINT: move to async function
  }

  /**
   * Store document in MongoDB
   */
  async storeDocument(collection, document) {
    if (!this.mongodb) {
      throw new Error('MongoDB not initialized');
    }
    return await this.mongodb.storeDocument(collection, document); // TODO-LINT: move to async function
  }

  /**
   * Find documents in MongoDB
   */
  async findDocuments(collection, query = {}, options = {}) {
    if (!this.mongodb) {
      throw new Error('MongoDB not initialized');
    }
    return await this.mongodb.findDocuments(collection, query, options); // TODO-LINT: move to async function
  }

  /**
   * Update documents in MongoDB
   */
  async updateDocuments(collection, query, update, options = {}) {
    if (!this.mongodb) {
      throw new Error('MongoDB not initialized');
    }
    return await this.mongodb.updateDocuments(collection, query, update, options); // TODO-LINT: move to async function
  }

  /**
   * Delete documents from MongoDB
   */
  async deleteDocuments(collection, query) {
    if (!this.mongodb) {
      throw new Error('MongoDB not initialized');
    }
    return await this.mongodb.deleteDocuments(collection, query); // TODO-LINT: move to async function
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(action, userId, details = {}) {
    if (this.mongodb) {
      return await this.mongodb.logAudit(action, userId, details); // TODO-LINT: move to async function
    } else {
      logger.warn('MongoDB not available for audit logging');
    }
  }

  /**
   * Health check for all databases
   */
  async healthCheck() {
    const health = {};

    if (this.postgresql) {
      health.postgresql = await this.postgresql.healthCheck(); // TODO-LINT: move to async function
    }

    if (this.mongodb) {
      health.mongodb = await this.mongodb.healthCheck(); // TODO-LINT: move to async function
    }

    return health;
  }

  /**
   * Close all database connections
   */
  async close() {
    const promises = [];

    if (this.postgresql) {
      promises.push(this.postgresql.close());
    }

    if (this.mongodb) {
      promises.push(this.mongodb.close());
    }

    await Promise.all(promises); // TODO-LINT: move to async function
    this.isInitialized = false;
    logger.info('Database factory closed');
  }
}
