// database/mongodb.js
// MongoDB database manager with authentication and security features
import { MongoClient } from 'mongodb';
import { logger } from '../nova-api/logger.js';
import { databaseConfig } from '../nova-api/config/database.js';

export class MongoDBManager {
  constructor(config = null) {
    this.config = config || databaseConfig.mongodb;
    this.client = null;
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize MongoDB connection
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      logger.info('Initializing MongoDB connection...');
      
      // Configure SSL if enabled
      const sslOptions = this.config.ssl ? {
        tls: true,
        tlsCertificateKeyFile: this.config.sslCert,
        tlsCAFile: this.config.sslCa,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false
      } : {};

      // Connection options with improved security and performance settings
      const options = {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
        ...sslOptions
      };

      // Add authentication if configured
      if (this.config.username && this.config.password) {
        options.auth = {
          username: this.config.username,
          password: this.config.password
        };
        options.authSource = this.config.options?.authSource || 'admin';
      }

      // Connect to MongoDB
      this.client = new MongoClient(this.config.uri, options);
      await this.client.connect();
      
      // Get database instance
      const dbName = this.config.uri.split('/').pop().split('?')[0];
      this.db = this.client.db(dbName);

      // Test connection
      await this.db.admin().ping();

      // Set up collections with validation
      await this.setupCollections();

      this.isInitialized = true;
      logger.info('MongoDB connection initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize MongoDB connection:', error);
      throw error;
    }
  }

  /**
   * Set up collections with schema validation
   */
  async setupCollections() {
    try {
      // User preferences collection
      await this.createCollectionIfNotExists('user_preferences', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['user_id'],
            properties: {
              user_id: { bsonType: 'int' },
              theme: { bsonType: 'string' },
              notifications: { bsonType: 'bool' },
              last_updated: { bsonType: 'date' }
            }
          }
        }
      });

      // Analytics collection with TTL index
      await this.createCollectionIfNotExists('analytics');
      await this.db.collection('analytics').createIndex(
        { created_at: 1 }, 
        { expireAfterSeconds: 2592000 } // 30 days
      );

      // Audit logs collection with TTL index
      await this.createCollectionIfNotExists('audit_logs');
      await this.db.collection('audit_logs').createIndex(
        { created_at: 1 }, 
        { expireAfterSeconds: 7776000 } // 90 days
      );

      // Sessions collection with TTL index
      await this.createCollectionIfNotExists('sessions');
      await this.db.collection('sessions').createIndex(
        { expires_at: 1 }, 
        { expireAfterSeconds: 0 }
      );

      // File chunks for GridFS-like storage
      await this.createCollectionIfNotExists('file_chunks');

      logger.info('MongoDB collections setup completed');
    } catch (error) {
      logger.error('Error setting up MongoDB collections:', error);
    }
  }

  /**
   * Create collection if it doesn't exist
   */
  async createCollectionIfNotExists(name, options = {}) {
    try {
      const collections = await this.db.listCollections({ name }).toArray();
      if (collections.length === 0) {
        await this.db.createCollection(name, options);
        logger.debug(`Created MongoDB collection: ${name}`);
      }
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  /**
   * Store a document
   */
  async storeDocument(collection, document) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const timestamp = new Date();
      const docWithTimestamp = {
        ...document,
        created_at: timestamp,
        updated_at: timestamp
      };

      const result = await this.db.collection(collection).insertOne(docWithTimestamp);
      
      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`Document inserted into ${collection}:`, result.insertedId);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error storing document in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Find documents
   */
  async findDocuments(collection, query = {}, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const cursor = this.db.collection(collection).find(query, options);
      const documents = await cursor.toArray();
      
      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`Found ${documents.length} documents in ${collection}`);
      }
      
      return documents;
    } catch (error) {
      logger.error(`Error finding documents in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Update documents
   */
  async updateDocuments(collection, query, update, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const updateWithTimestamp = {
        ...update,
        $set: {
          ...update.$set,
          updated_at: new Date()
        }
      };

      const result = await this.db.collection(collection).updateMany(query, updateWithTimestamp, options);
      
      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`Updated ${result.modifiedCount} documents in ${collection}`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error updating documents in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Delete documents
   */
  async deleteDocuments(collection, query) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await this.db.collection(collection).deleteMany(query);
      
      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`Deleted ${result.deletedCount} documents from ${collection}`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error deleting documents from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async withTransaction(callback) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const session = this.client.startSession();
    
    try {
      const result = await session.withTransaction(callback);
      return result;
    } catch (error) {
      logger.error('MongoDB transaction failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Create audit log entry
   */
  async logAudit(action, userId, details = {}) {
    try {
      const auditEntry = {
        action,
        user_id: userId,
        details,
        ip_address: details.ip || 'unknown',
        user_agent: details.userAgent || 'unknown',
        timestamp: new Date()
      };

      await this.storeDocument('audit_logs', auditEntry);
    } catch (error) {
      logger.error('Error creating audit log:', error);
      // Don't throw - audit logging failures shouldn't break the main operation
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    const start = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await this.db.admin().ping();
      const responseTime = Date.now() - start;
      
      const serverStatus = await this.db.admin().serverStatus();
      
      return {
        healthy: true,
        responseTime,
        serverStatus: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections
        }
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        responseTime: Date.now() - start
      };
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
      this.isInitialized = false;
      logger.info('MongoDB connection closed');
    }
  }
}
