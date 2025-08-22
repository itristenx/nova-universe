/**
 * Unified Database Service
 * Consolidates database operations and health checks
 */

import { logger } from '../../../apps/api/logger.js';
import { DatabaseHealthStatus, checkDatabaseHealth } from './error-handling.js';

export interface DatabaseConnection {
  name: string;
  connection: any;
  healthQuery?: string;
}

export interface DatabaseManager {
  connections: Map<string, DatabaseConnection>;
  healthStatus: Map<string, DatabaseHealthStatus>;
}

class UnifiedDatabaseService implements DatabaseManager {
  public connections: Map<string, DatabaseConnection> = new Map();
  public healthStatus: Map<string, DatabaseHealthStatus> = new Map();

  /**
   * Register a database connection
   */
  registerConnection(name: string, connection: any, healthQuery?: string): void {
    this.connections.set(name, {
      name,
      connection,
      healthQuery: healthQuery || 'SELECT 1'
    });
    
    logger.info(`Database connection registered: ${name}`);
  }

  /**
   * Get connection by name
   */
  getConnection(name: string): any {
    const conn = this.connections.get(name);
    if (!conn) {
      throw new Error(`Database connection not found: ${name}`);
    }
    return conn.connection;
  }

  /**
   * Check health of all registered databases
   */
  async checkAllHealth(): Promise<Map<string, DatabaseHealthStatus>> {
    const healthChecks = Array.from(this.connections.entries()).map(
      async ([name, conn]) => {
        const health = await checkDatabaseHealth(conn.connection, conn.healthQuery);
        this.healthStatus.set(name, health);
        return [name, health] as const;
      }
    );

    const results = await Promise.allSettled(healthChecks);
    
    for (const result of results) {
      if (result.status === 'rejected') {
        logger.error(`Database health check failed: ${result.reason}`);
      }
    }

    return this.healthStatus;
  }

  /**
   * Check health of specific database
   */
  async checkHealth(name: string): Promise<DatabaseHealthStatus> {
    const conn = this.connections.get(name);
    if (!conn) {
      throw new Error(`Database connection not found: ${name}`);
    }

    const health = await checkDatabaseHealth(conn.connection, conn.healthQuery);
    this.healthStatus.set(name, health);
    
    return health;
  }

  /**
   * Get overall system health
   */
  getOverallHealth(): { healthy: boolean; summary: Record<string, boolean> } {
    const summary: Record<string, boolean> = {};
    let allHealthy = true;

    this.healthStatus.forEach((status, name) => {
      summary[name] = status.healthy;
      if (!status.healthy) {
        allHealthy = false;
      }
    });

    return {
      healthy: allHealthy,
      summary
    };
  }

  /**
   * Initialize all connections
   */
  async initializeAll(): Promise<void> {
    logger.info('Initializing all database connections...');
    
    const initPromises = Array.from(this.connections.values()).map(async (conn) => {
      try {
        if (conn.connection.$connect) {
          await conn.connection.$connect();
        }
        logger.info(`Database connection initialized: ${conn.name}`);
      } catch (error) {
        logger.error(`Failed to initialize database connection: ${conn.name} - ${error}`);
        throw error;
      }
    });

    await Promise.all(initPromises);
    logger.info('All database connections initialized successfully');
  }

  /**
   * Close all connections gracefully
   */
  async closeAll(): Promise<void> {
    logger.info('Closing all database connections...');
    
    const closePromises = Array.from(this.connections.values()).map(async (conn) => {
      try {
        if (conn.connection.$disconnect) {
          await conn.connection.$disconnect();
        }
        logger.info(`Database connection closed: ${conn.name}`);
      } catch (error) {
        logger.error(`Failed to close database connection: ${conn.name} - ${error}`);
      }
    });

    await Promise.allSettled(closePromises);
    logger.info('All database connections closed');
  }

  /**
   * Execute transaction across multiple databases
   * Note: This doesn't provide true atomicity across different databases
   */
  async executeMultiDbTransaction(operations: Array<{
    database: string;
    operation: (connection: any) => Promise<any>;
  }>): Promise<any[]> {
    const results: any[] = [];
    const rollbackOperations: Array<() => Promise<void>> = [];

    try {
      for (const { database, operation } of operations) {
        const connection = this.getConnection(database);
        const result = await operation(connection);
        results.push(result);
        
        // Store rollback operation if supported
        if (connection.$executeRaw) {
          rollbackOperations.push(async () => {
            // Implement rollback logic based on operation type
            logger.warn(`Rollback not fully implemented for ${database}`);
          });
        }
      }

      return results;
    } catch (error) {
      // Attempt rollback of completed operations
      logger.error('Multi-database transaction failed, attempting rollback...');
      
      for (const rollback of rollbackOperations.reverse()) {
        try {
          await rollback();
        } catch (rollbackError) {
          logger.error(`Rollback operation failed: ${rollbackError}`);
        }
      }

      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    const connectionNames = Array.from(this.connections.keys());
    for (const name of connectionNames) {
      const conn = this.connections.get(name)!;
      try {
        const health = await this.checkHealth(name);
        stats[name] = {
          healthy: health.healthy,
          latency: health.latency,
          lastCheck: health.timestamp,
          connectionType: this.getConnectionType(conn.connection)
        };
      } catch (error) {
        stats[name] = {
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return stats;
  }

  private getConnectionType(connection: any): string {
    if (connection.$connect) return 'prisma';
    if (connection.collection) return 'mongodb';
    if (connection.search) return 'elasticsearch';
    return 'unknown';
  }
}

// Export singleton instance
export const unifiedDbService = new UnifiedDatabaseService();

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing database connections...');
  await unifiedDbService.closeAll();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing database connections...');
  await unifiedDbService.closeAll();
  process.exit(0);
});

export default unifiedDbService;
