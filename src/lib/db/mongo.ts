// src/lib/db/mongo.ts
// Enhanced MongoDB client with connection management, schema validation, and auditing
import { Db, MongoClient } from 'mongodb';
import { logger } from '../../../apps/api/logger.js';

const uri = process.env.MONGO_URL || process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'nova_logs';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Global connection management
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
  };

  // Add authentication if configured
  if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
    Object.assign(options, {
      auth: {
        username: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD
      },
      authSource: process.env.MONGO_AUTH_SOURCE || 'admin'
    });
  }

  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

// Enhanced MongoDB client with schema validation and indexes
class EnhancedMongoClient {
  private db: Db | null = null;
  private isInitialized = false;

  async getDb(): Promise<Db> {
    if (!this.db) {
      const client = await clientPromise; // TODO-LINT: move to async function
      this.db = client.db(dbName);
      
      if (!this.isInitialized) {
        await this.setupCollections(); // TODO-LINT: move to async function
        this.isInitialized = true;
      }
    }
    return this.db;
  }

  private async setupCollections() {
    if (!this.db) return;

    try {
      logger.info('Setting up MongoDB collections and indexes...');

      // Audit logs collection with TTL index
      await this.createCollectionIfNotExists('audit_logs'); // TODO-LINT: move to async function
      await this.db.collection('audit_logs').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 7776000 } // 90 days
      ); // TODO-LINT: move to async function
      await this.db.collection('audit_logs').createIndex({ userId: 1 }); // TODO-LINT: move to async function
      await this.db.collection('audit_logs').createIndex({ action: 1 }); // TODO-LINT: move to async function

      // System logs collection with TTL index
      await this.createCollectionIfNotExists('system_logs'); // TODO-LINT: move to async function
      await this.db.collection('system_logs').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 2592000 } // 30 days
      ); // TODO-LINT: move to async function
      await this.db.collection('system_logs').createIndex({ level: 1 }); // TODO-LINT: move to async function
      await this.db.collection('system_logs').createIndex({ source: 1 }); // TODO-LINT: move to async function

      // User activity logs
      await this.createCollectionIfNotExists('user_activity'); // TODO-LINT: move to async function
      await this.db.collection('user_activity').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 15552000 } // 180 days
      ); // TODO-LINT: move to async function
      await this.db.collection('user_activity').createIndex({ userId: 1 }); // TODO-LINT: move to async function
      await this.db.collection('user_activity').createIndex({ action: 1 }); // TODO-LINT: move to async function

      // Performance metrics
      await this.createCollectionIfNotExists('performance_metrics'); // TODO-LINT: move to async function
      await this.db.collection('performance_metrics').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 604800 } // 7 days
      ); // TODO-LINT: move to async function
      await this.db.collection('performance_metrics').createIndex({ service: 1 }); // TODO-LINT: move to async function
      await this.db.collection('performance_metrics').createIndex({ endpoint: 1 }); // TODO-LINT: move to async function

      // Error logs
      await this.createCollectionIfNotExists('error_logs'); // TODO-LINT: move to async function
      await this.db.collection('error_logs').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 7776000 } // 90 days
      ); // TODO-LINT: move to async function
      await this.db.collection('error_logs').createIndex({ level: 1 }); // TODO-LINT: move to async function
      await this.db.collection('error_logs').createIndex({ source: 1 }); // TODO-LINT: move to async function

      // API usage telemetry
      await this.createCollectionIfNotExists('api_usage'); // TODO-LINT: move to async function
      await this.db.collection('api_usage').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 2592000 } // 30 days
      ); // TODO-LINT: move to async function
      await this.db.collection('api_usage').createIndex({ endpoint: 1 }); // TODO-LINT: move to async function
      await this.db.collection('api_usage').createIndex({ userId: 1 }); // TODO-LINT: move to async function

      // User preferences (no TTL)
      await this.createCollectionIfNotExists('user_preferences'); // TODO-LINT: move to async function
      await this.db.collection('user_preferences').createIndex({ userId: 1 }, { unique: true }); // TODO-LINT: move to async function

      // Search analytics
      await this.createCollectionIfNotExists('search_analytics'); // TODO-LINT: move to async function
      await this.db.collection('search_analytics').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 7776000 } // 90 days
      ); // TODO-LINT: move to async function
      await this.db.collection('search_analytics').createIndex({ userId: 1 }); // TODO-LINT: move to async function
      await this.db.collection('search_analytics').createIndex({ query: 'text' }); // TODO-LINT: move to async function

      logger.info('MongoDB collections and indexes setup completed');
    } catch (error) {
      logger.error('Error setting up MongoDB collections: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  private async createCollectionIfNotExists(name: string, options = {}) {
    if (!this.db) return;

    try {
      const collections = await this.db.listCollections({ name }).toArray(); // TODO-LINT: move to async function
      if (collections.length === 0) {
        await this.db.createCollection(name, options); // TODO-LINT: move to async function
        logger.debug(`Created MongoDB collection: ${name}`);
      }
    } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  // Audit logging method
  async logAudit(userId: string, action: string, details: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}, ip?: string) {
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      const auditEntry = {
        userId,
        action,
        details,
        ip: ip || 'unknown',
        timestamp: new Date(),
        source: 'nova-universe'
      };

      await db.collection('audit_logs').insertOne(auditEntry); // TODO-LINT: move to async function
      
      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`Audit log created: ${action} by ${userId}`);
      }
    } catch (error) {
      logger.error('Error creating audit log: ' + (error instanceof Error ? error.message : String(error)));
      // Don't throw - audit logging failures shouldn't break main operations
    }
  }

  // System logging method
  async logSystem(level: string, message: string, source: string, details: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      const logEntry = {
        level,
        message,
        source,
        details,
        timestamp: new Date()
      };

      await db.collection('system_logs').insertOne(logEntry); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error creating system log: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  // User activity logging
  async logUserActivity(userId: string, action: string, details: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      const activityEntry = {
        userId,
        action,
        details,
        timestamp: new Date(),
        source: 'nova-universe'
      };

      await db.collection('user_activity').insertOne(activityEntry); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error logging user activity: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  // Performance metrics logging
  async logPerformance(service: string, endpoint: string, duration: number, details: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      const metricsEntry = {
        service,
        endpoint,
        duration,
        details,
        timestamp: new Date()
      };

      await db.collection('performance_metrics').insertOne(metricsEntry); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error logging performance metrics: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  // Error logging
  async logError(level: string, message: string, source: string, error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types, details: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      const errorEntry = {
        level,
        message,
        source,
        error: {
          name: error?.name,
          message: error?.message,
          stack: error?.stack
        },
        details,
        timestamp: new Date()
      };

      await db.collection('error_logs').insertOne(errorEntry); // TODO-LINT: move to async function
    } catch (logError) {
      logger.error('Error logging error: ' + (logError instanceof Error ? logError.message : String(logError)));
    }
  }

  // API usage tracking
  async logApiUsage(endpoint: string, method: string, userId?: string, duration?: number, details: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      const usageEntry = {
        endpoint,
        method,
        userId,
        duration,
        details,
        timestamp: new Date()
      };

      await db.collection('api_usage').insertOne(usageEntry); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error logging API usage: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  // Search analytics
  async logSearch(query: string, userId?: string, results?: number, duration?: number, details: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      const searchEntry = {
        query,
        userId,
        results,
        duration,
        details,
        timestamp: new Date()
      };

      await db.collection('search_analytics').insertOne(searchEntry); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error logging search analytics: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  // User preferences management
  async getUserPreferences(userId: string) {
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      return await db.collection('user_preferences').findOne({ userId }); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error getting user preferences: ' + (error instanceof Error ? error.message : String(error)));
      return null;
    }
  }

  async setUserPreferences(userId: string, preferences: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      await db.collection('user_preferences').replaceOne(
        { userId },
        { userId, ...preferences, updatedAt: new Date() },
        { upsert: true }
      ); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error setting user preferences: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    const start = Date.now();
    
    try {
      const db = await this.getDb(); // TODO-LINT: move to async function
      await db.admin().ping(); // TODO-LINT: move to async function
      const responseTime = Date.now() - start;
      
      return {
        healthy: true,
        responseTime,
        database: 'mongodb',
        dbName
      };
    } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
      return {
        healthy: false,
        error: error.message,
        responseTime: Date.now() - start,
        database: 'mongodb'
      };
    }
  }

  // Close connection
  async close() {
    try {
      const client = await clientPromise; // TODO-LINT: move to async function
      await client.close(); // TODO-LINT: move to async function
      logger.info('MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}

// Export singleton instance
export const mongoClient = new EnhancedMongoClient();

// Convenience function for getting _the database
export async function _getMongoDb(): Promise<Db> {
  return await mongoClient.getDb(); // TODO-LINT: move to async function
}

// Export individual logging functions for easy imports
export const {
  logAudit,
  logSystem,
  logUserActivity,
  logPerformance,
  logError,
  logApiUsage,
  logSearch,
  getUserPreferences,
  setUserPreferences
} = mongoClient;

export default mongoClient;
