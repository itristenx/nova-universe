// database/postgresql.js
// PostgreSQL database manager with connection pooling and SSL support
import pg from 'pg';
import { logger } from '../nova-api/logger.js';
import { databaseConfig } from '../nova-api/config/database.js';

const { Pool } = pg;

export class PostgreSQLManager {
  constructor(config = null) {
    this.config = config || databaseConfig.postgresql;
    this.pool = null;
    this.isInitialized = false;
  }

  /**
   * Initialize PostgreSQL connection pool
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      logger.info('Initializing PostgreSQL connection pool...');
      
      // Configure SSL if enabled
      const sslConfig = this.config.ssl ? {
        rejectUnauthorized: false,
        cert: this.config.sslCert,
        key: this.config.sslKey,
        ca: this.config.sslCa
      } : false;

      // Create connection pool
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        ssl: sslConfig,
        max: this.config.maxConnections,
        min: this.config.minConnections,
        idleTimeoutMillis: this.config.idleTimeout,
        connectionTimeoutMillis: this.config.connectionTimeout,
        statement_timeout: 30000,
        query_timeout: 30000
      });

      // Set up pool event handlers
      this.pool.on('connect', (client) => {
        logger.debug('PostgreSQL client connected');
      });

      this.pool.on('error', (err, client) => {
        logger.error('PostgreSQL pool error:', err);
      });

      this.pool.on('remove', (client) => {
        logger.debug('PostgreSQL client removed');
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isInitialized = true;
      logger.info('PostgreSQL connection pool initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize PostgreSQL connection pool:', error);
      throw error;
    }
  }

  /**
   * Execute a query
   */
  async query(text, params = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const start = Date.now();
    
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`SQL Query executed in ${duration}ms:`, { text, params });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`SQL Query failed after ${duration}ms:`, { text, params, error: error.message });
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction(callback) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
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

      await this.pool.query('SELECT 1');
      const responseTime = Date.now() - start;
      
      return {
        healthy: true,
        responseTime,
        connections: {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount
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
   * Close all connections
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isInitialized = false;
      logger.info('PostgreSQL connection pool closed');
    }
  }
}
