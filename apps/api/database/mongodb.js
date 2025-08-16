// MongoDB database module with security and best practices
import { MongoClient, ServerApiVersion } from 'mongodb';
import { logger } from '../logger.js';
import { databaseConfig, validateDatabaseConfig } from '../config/database.js';

/**
 * MongoDB Database Manager
 * Provides secure connections, authentication, and best practices for MongoDB
 */
class MongoDBManager {
  constructor(config = databaseConfig.audit_db) {
    this.config = config;
    this.client = null;
    this.database = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    this.reconnectDelay = 5000;
  }

  /**
   * Initialize MongoDB connection with security features
   */
  async initialize() {
    if (!process.env.MONGO_ENABLED) {
      logger.info('📝 MongoDB is disabled (set MONGO_ENABLED=true to enable)');
      return false;
    }

    try {
      validateDatabaseConfig();

      const options = {
        ...this.config.options,

        // Security options
        authSource: this.config.options.authSource,
        authMechanism: this.config.options.authMechanism,

        // Use latest stable API version
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },

        // Connection monitoring
        monitorCommands: process.env.NODE_ENV === 'development',

        // TLS/SSL for production
        tls: process.env.NODE_ENV === 'production',
        tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production',
        tlsAllowInvalidHostnames: process.env.NODE_ENV !== 'production',
      };

      this.client = new MongoClient(this.config.uri, options);

      // Set up event handlers
      this.setupEventHandlers();

      // Connect to MongoDB
      await this.client.connect();

      // Get database instance
      this.database = this.client.db(this.config.database);

      // Test connection
      await this.testConnection();

      this.isConnected = true;
      this.connectionAttempts = 0;

      if (!process.env.CLI_MODE) {
        logger.info('✅ MongoDB connection established successfully');
        logger.info(`📊 Connected to database: ${this.config.database}`);
      }

      // Set up collections with proper indexes
      await this.setupCollections();

      return true;
    } catch (error) {
      this.connectionAttempts++;
      logger.error(
        `❌ MongoDB initialization failed (attempt ${this.connectionAttempts}):`,
        error.message,
      );

      if (this.connectionAttempts < this.maxConnectionAttempts) {
        logger.info(`🔄 Retrying MongoDB connection in ${this.reconnectDelay / 1000} seconds...`);
        setTimeout(() => this.initialize(), this.reconnectDelay);
      } else {
        logger.error('💀 MongoDB connection failed after maximum attempts');
        throw new Error(`MongoDB connection failed: ${error.message}`);
      }

      return false;
    }
  }

  /**
   * Set up event handlers for monitoring
   */
  setupEventHandlers() {
    this.client.on('connectionPoolCreated', (event) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('🏊 MongoDB connection pool created');
      }
    });

    this.client.on('connectionCreated', (event) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('🔗 New MongoDB connection created');
      }
    });

    this.client.on('connectionReady', (event) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('✅ MongoDB connection ready');
      }
    });

    this.client.on('connectionClosed', (event) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('📴 MongoDB connection closed');
      }
    });

    this.client.on('connectionPoolClosed', (event) => {
      logger.warn('🚫 MongoDB connection pool closed');
      this.isConnected = false;
    });

    this.client.on('error', (error) => {
      logger.error('💥 MongoDB client error:', error.message);
      this.isConnected = false;

      // Attempt to reconnect
      setTimeout(() => {
        if (!this.isConnected) {
          logger.info('🔄 Attempting to reconnect to MongoDB...');
          this.initialize();
        }
      }, this.reconnectDelay);
    });

    this.client.on('commandStarted', (event) => {
      if (process.env.NODE_ENV === 'development' && process.env.MONGO_DEBUG === 'true') {
        logger.debug('🎯 MongoDB command started:', {
          command: event.commandName,
          collection: event.command[event.commandName],
        });
      }
    });

    this.client.on('commandSucceeded', (event) => {
      if (process.env.NODE_ENV === 'development' && process.env.MONGO_DEBUG === 'true') {
        const duration = event.duration;
        if (duration > 1000) {
          logger.warn(`🐌 Slow MongoDB command (${duration}ms):`, event.commandName);
        }
      }
    });

    this.client.on('commandFailed', (event) => {
      logger.error('❌ MongoDB command failed:', {
        command: event.commandName,
        error: event.failure.message,
        duration: `${event.duration}ms`,
      });
    });
  }

  /**
   * Test database connection
   */
  async testConnection() {
    const admin = this.database.admin();
    const result = await admin.ping();

    if (result.ok === 1) {
      logger.debug('🏥 MongoDB health check passed');
    } else {
      throw new Error('MongoDB ping failed');
    }

    // Get server status for additional info
    const serverStatus = await admin.serverStatus();
    logger.debug('📋 MongoDB server info:', {
      version: serverStatus.version,
      uptime: `${Math.floor(serverStatus.uptime / 3600)}h`,
      connections: serverStatus.connections,
    });
  }

  /**
   * Set up collections with proper indexes
   */
  async setupCollections() {
    try {
      // Assets collection with indexes
      const assetsCollection = this.database.collection('assets');
      await assetsCollection.createIndex({ type: 1 });
      await assetsCollection.createIndex({ uploaded_at: -1 });
      await assetsCollection.createIndex({ name: 'text', type: 'text' });

      // Analytics collection (for future use)
      const analyticsCollection = this.database.collection('analytics');
      await analyticsCollection.createIndex({ timestamp: -1 });
      await analyticsCollection.createIndex({ event_type: 1 });
      await analyticsCollection.createIndex({ user_id: 1, timestamp: -1 });

      // Audit logs collection
      const auditCollection = this.database.collection('audit_logs');
      await auditCollection.createIndex({ timestamp: -1 });
      await auditCollection.createIndex({ user_id: 1 });
      await auditCollection.createIndex({ action: 1 });

      // TTL index for audit logs (remove after 1 year)
      await auditCollection.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: 31536000 }, // 1 year
      );

      // Configuration documents collection
      const configCollection = this.database.collection('configurations');
      await configCollection.createIndex({ key: 1 }, { unique: true });
      await configCollection.createIndex({ category: 1 });

      if (!process.env.CLI_MODE) {
        logger.info('📁 MongoDB collections and indexes created successfully');
      }
    } catch (error) {
      logger.error('❌ Error setting up MongoDB collections:', error.message);
      throw error;
    }
  }

  /**
   * Get a collection with type safety
   */
  collection(name) {
    if (!this.isConnected || !this.database) {
      throw new Error('MongoDB not connected. Call initialize() first.');
    }
    return this.database.collection(name);
  }

  /**
   * Execute operation with automatic retry
   */
  async withRetry(operation, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        if (this.isRetryableError(error)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          logger.warn(
            `🔄 Retrying MongoDB operation (attempt ${attempt + 1}/${maxRetries}) in ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const retryableCodes = [
      11600, // InterruptedAtShutdown
      11602, // InterruptedDueToReplStateChange
      10107, // NotMaster
      13435, // NotMasterNoSlaveOk
      13436, // NotMasterOrSecondary
      189, // PrimarySteppedDown
      91, // ShutdownInProgress
      7, // HostUnreachable
      6, // HostNotFound
      89, // NetworkTimeout
    ];

    return (
      retryableCodes.includes(error.code) ||
      error.message.includes('connection') ||
      error.message.includes('network')
    );
  }

  /**
   * Execute operation in transaction (for replica sets)
   */
  async withTransaction(callback) {
    const session = this.client.startSession();

    try {
      return await session.withTransaction(async () => {
        return await callback(session);
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Create audit log entry
   */
  async logAudit(action, userId, details = {}) {
    try {
      const auditCollection = this.collection('audit_logs');
      await auditCollection.insertOne({
        action,
        user_id: userId,
        details,
        timestamp: new Date(),
        ip_address: details.ip_address || null,
        user_agent: details.user_agent || null,
      });
    } catch (error) {
      logger.error('❌ Failed to create audit log:', error.message);
      // Don't throw - audit logging shouldn't break main functionality
    }
  }

  /**
   * Health check for monitoring systems
   */
  async healthCheck() {
    try {
      await this.testConnection();

      const stats = await this.database.stats();

      return {
        status: 'healthy',
        connected: this.isConnected,
        database: {
          name: this.database.databaseName,
          collections: stats.collections,
          dataSize: stats.dataSize,
          indexSize: stats.indexSize,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connected: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get connection stats for monitoring
   */
  async getConnectionStats() {
    if (!this.isConnected) {
      return null;
    }

    try {
      const admin = this.database.admin();
      const serverStatus = await admin.serverStatus();

      return {
        connections: serverStatus.connections,
        network: serverStatus.network,
        uptime: serverStatus.uptime,
      };
    } catch (error) {
      logger.error('❌ Error getting MongoDB connection stats:', error.message);
      return null;
    }
  }

  /**
   * Gracefully close connection
   */
  async close() {
    if (this.client) {
      try {
        await this.client.close();
        this.isConnected = false;
        this.database = null;
        logger.info('📴 MongoDB connection closed');
      } catch (error) {
        logger.error('❌ Error closing MongoDB connection:', error.message);
      }
    }
  }
}

// Create singleton instance for the audit database
const mongoManager = new MongoDBManager(databaseConfig.audit_db);

export default mongoManager;
export { MongoDBManager };
