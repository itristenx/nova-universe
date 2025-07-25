// PostgreSQL database module with security and connection pooling
import pg from 'pg';
import { logger } from '../logger.js';
import { databaseConfig, validateDatabaseConfig } from '../config/database.js';

const { Pool } = pg;

/**
 * PostgreSQL Database Manager
 * Provides secure connection pooling, SSL encryption, and best practices
 */
class PostgreSQLManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    this.reconnectDelay = 5000;
  }

  /**
   * Initialize PostgreSQL connection pool with security features
   */
  async initialize() {
    try {
      validateDatabaseConfig();
      
      const config = {
        ...databaseConfig.postgresql,
        // Connection string for easier deployment
        connectionString: this.buildConnectionString(),
        
        // Security settings
        ssl: databaseConfig.postgresql.ssl,
        
        // Performance settings
        max: databaseConfig.postgresql.pool.max,
        min: databaseConfig.postgresql.pool.min,
        acquireTimeoutMillis: databaseConfig.postgresql.pool.acquireTimeoutMillis,
        idleTimeoutMillis: databaseConfig.postgresql.pool.idleTimeoutMillis,
        connectionTimeoutMillis: databaseConfig.postgresql.connectionTimeoutMillis,
        
        // Query settings
        statement_timeout: databaseConfig.postgresql.statement_timeout,
        query_timeout: databaseConfig.postgresql.query_timeout,
        
        // Application name for monitoring
        application_name: 'nova-universe-api',
        
        // Enable keep-alive
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      };

      this.pool = new Pool(config);
      
      // Handle pool events for monitoring and error handling
      this.setupPoolEventHandlers();
      
      // Test the connection
      await this.testConnection();
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      
      if (!process.env.CLI_MODE) {
        logger.info('✅ PostgreSQL connection pool initialized successfully');
        logger.info(`📊 Pool configuration: min=${config.min}, max=${config.max}`);
      }
      
      return true;
    } catch (error) {
      this.connectionAttempts++;
      logger.error(`❌ PostgreSQL initialization failed (attempt ${this.connectionAttempts}):`, error.message);
      
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        logger.info(`🔄 Retrying PostgreSQL connection in ${this.reconnectDelay / 1000} seconds...`);
        setTimeout(() => this.initialize(), this.reconnectDelay);
      } else {
        logger.error('💀 PostgreSQL connection failed after maximum attempts');
        throw new Error(`PostgreSQL connection failed: ${error.message}`);
      }
      
      return false;
    }
  }

  /**
   * Build secure connection string
   */
  buildConnectionString() {
    const config = databaseConfig.postgresql;
    const sslMode = config.ssl ? '?sslmode=require' : '?sslmode=disable';
    return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}${sslMode}`;
  }

  /**
   * Set up pool event handlers for monitoring
   */
  setupPoolEventHandlers() {
    this.pool.on('connect', (client) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('🔗 New PostgreSQL client connected');
      }
    });

    this.pool.on('acquire', (client) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('🎯 PostgreSQL client acquired from pool');
      }
    });

    this.pool.on('release', (client) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('↩️  PostgreSQL client released back to pool');
      }
    });

    this.pool.on('remove', (client) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('🗑️  PostgreSQL client removed from pool');
      }
    });

    this.pool.on('error', (error, client) => {
      logger.error('💥 PostgreSQL pool error:', error.message);
      this.isConnected = false;
      
      // Attempt to reconnect
      setTimeout(() => {
        if (!this.isConnected) {
          logger.info('🔄 Attempting to reconnect to PostgreSQL...');
          this.initialize();
        }
      }, this.reconnectDelay);
    });
  }

  /**
   * Test database connection
   */
  async testConnection() {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
      logger.debug('🏥 PostgreSQL health check passed:', {
        current_time: result.rows[0].current_time,
        version: result.rows[0].postgres_version.split(' ')[0]
      });
    } finally {
      client.release();
    }
  }

  /**
   * Execute a query with automatic retry and error handling
   */
  async query(text, params = [], options = {}) {
    if (!this.isConnected || !this.pool) {
      throw new Error('PostgreSQL not connected. Call initialize() first.');
    }

    const startTime = Date.now();
    const client = options.client || null;
    let shouldReleaseClient = false;

    try {
      let activeClient;
      
      if (client) {
        activeClient = client;
      } else {
        activeClient = await this.pool.connect();
        shouldReleaseClient = true;
      }

      const result = await activeClient.query(text, params);
      
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        logger.warn(`🐌 Slow PostgreSQL query (${duration}ms):`, text.substring(0, 100));
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('❌ PostgreSQL query error:', {
        error: error.message,
        query: text.substring(0, 100),
        duration: `${duration}ms`,
        params: params?.length ? '[PARAMS_REDACTED]' : 'none'
      });
      throw error;
    } finally {
      if (shouldReleaseClient && client) {
        client.release();
      }
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(callback) {
    if (!this.isConnected || !this.pool) {
      throw new Error('PostgreSQL not connected. Call initialize() first.');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await callback(client);
      
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('❌ PostgreSQL transaction failed:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get connection pool stats for monitoring
   */
  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      connected: this.isConnected
    };
  }

  /**
   * Health check for monitoring systems
   */
  async healthCheck() {
    try {
      await this.testConnection();
      const stats = this.getPoolStats();
      
      return {
        status: 'healthy',
        connected: this.isConnected,
        pool: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connected: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Gracefully close all connections
   */
  async close() {
    if (this.pool) {
      try {
        await this.pool.end();
        this.isConnected = false;
        logger.info('📴 PostgreSQL connection pool closed');
      } catch (error) {
        logger.error('❌ Error closing PostgreSQL pool:', error.message);
      }
    }
  }

  /**
   * Execute raw SQL from migration files
   */
  async executeSQL(sql) {
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    return this.transaction(async (client) => {
      const results = [];
      for (const statement of statements) {
        if (statement.trim()) {
          const result = await this.query(statement, [], { client });
          results.push(result);
        }
      }
      return results;
    });
  }
}

// Create singleton instance
const postgresManager = new PostgreSQLManager();

export default postgresManager;
export { PostgreSQLManager };
