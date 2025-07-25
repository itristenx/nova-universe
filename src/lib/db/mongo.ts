// src/lib/db/mongo.ts
// Native MongoDB client for logs and telemetry
import { MongoClient, Db } from 'mongodb';
import { logger } from '../../../nova-api/logger.js';

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
      const client = await clientPromise;
      this.db = client.db(dbName);
      
      if (!this.isInitialized) {
        await this.setupCollections();
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
      await this.createCollectionIfNotExists('audit_logs');
      await this.db.collection('audit_logs').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 7776000 } // 90 days
      );
      await this.db.collection('audit_logs').createIndex({ userId: 1 });
      await this.db.collection('audit_logs').createIndex({ action: 1 });

      // System logs collection with TTL index
      await this.createCollectionIfNotExists('system_logs');
      await this.db.collection('system_logs').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 2592000 } // 30 days
      );
      await this.db.collection('system_logs').createIndex({ level: 1 });
      await this.db.collection('system_logs').createIndex({ source: 1 });

      // User activity logs
      await this.createCollectionIfNotExists('user_activity');
      await this.db.collection('user_activity').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 15552000 } // 180 days
      );
      await this.db.collection('user_activity').createIndex({ userId: 1 });
      await this.db.collection('user_activity').createIndex({ action: 1 });

      // Performance metrics
      await this.createCollectionIfNotExists('performance_metrics');
      await this.db.collection('performance_metrics').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 604800 } // 7 days
      );
      await this.db.collection('performance_metrics').createIndex({ service: 1 });
      await this.db.collection('performance_metrics').createIndex({ endpoint: 1 });

      // Error logs
      await this.createCollectionIfNotExists('error_logs');
      await this.db.collection('error_logs').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 7776000 } // 90 days
      );
      await this.db.collection('error_logs').createIndex({ level: 1 });
      await this.db.collection('error_logs').createIndex({ source: 1 });

      // API usage telemetry
      await this.createCollectionIfNotExists('api_usage');
      await this.db.collection('api_usage').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 2592000 } // 30 days
      );
      await this.db.collection('api_usage').createIndex({ endpoint: 1 });
      await this.db.collection('api_usage').createIndex({ userId: 1 });

      // User preferences (no TTL)
      await this.createCollectionIfNotExists('user_preferences');
      await this.db.collection('user_preferences').createIndex({ userId: 1 }, { unique: true });

      // Search analytics
      await this.createCollectionIfNotExists('search_analytics');
      await this.db.collection('search_analytics').createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 7776000 } // 90 days
      );
      await this.db.collection('search_analytics').createIndex({ userId: 1 });
      await this.db.collection('search_analytics').createIndex({ query: 'text' });

      logger.info('MongoDB collections and indexes setup completed');
    } catch (error) {
      logger.error('Error setting up MongoDB collections:', error);
    }
  }

  private async createCollectionIfNotExists(name: string, options = {}) {
    if (!this.db) return;

    try {
      const collections = await this.db.listCollections({ name }).toArray();
      if (collections.length === 0) {
        await this.db.createCollection(name, options);
        logger.debug(`Created MongoDB collection: ${name}`);
      }
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  // Audit logging method
  async logAudit(userId: string, action: string, details: any = {}, ip?: string) {
    try {
      const db = await this.getDb();
      const auditEntry = {
        userId,
        action,
        details,
        ip: ip || 'unknown',
        timestamp: new Date(),
        source: 'nova-universe'
      };

      await db.collection('audit_logs').insertOne(auditEntry);
      
      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`Audit log created: ${action} by ${userId}`);
      }
    } catch (error) {
      logger.error('Error creating audit log:', error);
      // Don't throw - audit logging failures shouldn't break main operations
    }
  }

  // System logging method
  async logSystem(level: string, message: string, source: string, details: any = {}) {
    try {
      const db = await this.getDb();
      const logEntry = {
        level,
        message,
        source,
        details,
        timestamp: new Date()
      };

      await db.collection('system_logs').insertOne(logEntry);
    } catch (error) {
      logger.error('Error creating system log:', error);
    }
  }

  // User activity logging
  async logUserActivity(userId: string, action: string, details: any = {}) {
    try {
      const db = await this.getDb();
      const activityEntry = {
        userId,
        action,
        details,
        timestamp: new Date(),
        source: 'nova-universe'
      };

      await db.collection('user_activity').insertOne(activityEntry);
    } catch (error) {
      logger.error('Error logging user activity:', error);
    }
  }

  // Performance metrics logging
  async logPerformance(service: string, endpoint: string, duration: number, details: any = {}) {
    try {
      const db = await this.getDb();
      const metricsEntry = {
        service,
        endpoint,
        duration,
        details,
        timestamp: new Date()
      };

      await db.collection('performance_metrics').insertOne(metricsEntry);
    } catch (error) {
      logger.error('Error logging performance metrics:', error);
    }
  }

  // Error logging
  async logError(level: string, message: string, source: string, error: any, details: any = {}) {
    try {
      const db = await this.getDb();
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

      await db.collection('error_logs').insertOne(errorEntry);
    } catch (logError) {
      logger.error('Error logging error:', logError);
    }
  }

  // API usage tracking
  async logApiUsage(endpoint: string, method: string, userId?: string, duration?: number, details: any = {}) {
    try {
      const db = await this.getDb();
      const usageEntry = {
        endpoint,
        method,
        userId,
        duration,
        details,
        timestamp: new Date()
      };

      await db.collection('api_usage').insertOne(usageEntry);
    } catch (error) {
      logger.error('Error logging API usage:', error);
    }
  }

  // Search analytics
  async logSearch(query: string, userId?: string, results?: number, duration?: number, details: any = {}) {
    try {
      const db = await this.getDb();
      const searchEntry = {
        query,
        userId,
        results,
        duration,
        details,
        timestamp: new Date()
      };

      await db.collection('search_analytics').insertOne(searchEntry);
    } catch (error) {
      logger.error('Error logging search analytics:', error);
    }
  }

  // User preferences management
  async getUserPreferences(userId: string) {
    try {
      const db = await this.getDb();
      return await db.collection('user_preferences').findOne({ userId });
    } catch (error) {
      logger.error('Error getting user preferences:', error);
      return null;
    }
  }

  async setUserPreferences(userId: string, preferences: any) {
    try {
      const db = await this.getDb();
      await db.collection('user_preferences').replaceOne(
        { userId },
        { userId, ...preferences, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (error) {
      logger.error('Error setting user preferences:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    const start = Date.now();
    
    try {
      const db = await this.getDb();
      await db.admin().ping();
      const responseTime = Date.now() - start;
      
      return {
        healthy: true,
        responseTime,
        database: 'mongodb',
        dbName
      };
    } catch (error: any) {
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
      const client = await clientPromise;
      await client.close();
      logger.info('MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
    }
  }
}

// Export singleton instance
export const mongoClient = new EnhancedMongoClient();

// Convenience function for getting the database
export async function getMongoDb(): Promise<Db> {
  return await mongoClient.getDb();
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
