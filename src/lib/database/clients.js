/**
 * Nova Universal Notification Platform Database Clients
 * 
 * Manages connections to different Prisma schemas used throughout
 * the Nova ecosystem for unified notification management
 */

import { PrismaClient as CorePrismaClient } from '../../../prisma/generated/core/index.js';
import { PrismaClient as CmdbPrismaClient } from '../../../prisma/generated/cmdb/index.js';
import { PrismaClient as NotificationPrismaClient } from '../../../prisma/generated/notification/index.js';
import { logger } from '../../../apps/api/logger.js';

// ============================================================================
// DATABASE CLIENT INITIALIZATION
// ============================================================================

/**
 * Core database client for user management, authentication, and general Nova operations
 */
export const coreClient = new CorePrismaClient({
  datasources: {
    core_db: {
      url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL
    }
  },
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ]
});

/**
 * CMDB database client for asset and configuration management
 */
export const cmdbClient = new CmdbPrismaClient({
  datasources: {
    cmdb_db: {
      url: process.env.CMDB_DATABASE_URL || process.env.DATABASE_URL
    }
  },
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ]
});

/**
 * Notification database client for Universal Notification Platform
 */
export const notificationClient = new NotificationPrismaClient({
  datasources: {
    notification_db: {
      url: process.env.NOTIFICATION_DATABASE_URL || process.env.DATABASE_URL
    }
  },
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ]
});

// ============================================================================
// LOGGING SETUP
// ============================================================================

// Core client logging
coreClient.$on('query', (e) => {
  logger.debug('Core DB Query:', {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
    timestamp: e.timestamp
  });
});

coreClient.$on('error', (e) => {
  logger.error('Core DB Error:', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp
  });
});

// CMDB client logging
cmdbClient.$on('query', (e) => {
  logger.debug('CMDB DB Query:', {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
    timestamp: e.timestamp
  });
});

cmdbClient.$on('error', (e) => {
  logger.error('CMDB DB Error:', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp
  });
});

// Notification client logging
notificationClient.$on('query', (e) => {
  logger.debug('Notification DB Query:', {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
    timestamp: e.timestamp
  });
});

notificationClient.$on('error', (e) => {
  logger.error('Notification DB Error:', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp
  });
});

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

/**
 * Initialize all database connections
 */
export async function initializeDatabaseConnections() {
  try {
    logger.info('Initializing database connections...');

    // Test core connection
    await coreClient.$connect(); // TODO-LINT: move to async function
    await coreClient.$executeRaw`SELECT 1`; // TODO-LINT: move to async function
    logger.info('Core database connection established');

    // Test CMDB connection (if different from core)
    if (process.env.CMDB_DATABASE_URL && process.env.CMDB_DATABASE_URL !== process.env.DATABASE_URL) {
      await cmdbClient.$connect(); // TODO-LINT: move to async function
      await cmdbClient.$executeRaw`SELECT 1`; // TODO-LINT: move to async function
      logger.info('CMDB database connection established');
    } else {
      logger.info('CMDB using same database as core');
    }

    // Test notification connection (if different from core)
    if (process.env.NOTIFICATION_DATABASE_URL && process.env.NOTIFICATION_DATABASE_URL !== process.env.DATABASE_URL) {
      await notificationClient.$connect(); // TODO-LINT: move to async function
      await notificationClient.$executeRaw`SELECT 1`; // TODO-LINT: move to async function
      logger.info('Notification database connection established');
    } else {
      logger.info('Notification using same database as core');
    }

    logger.info('All database connections initialized successfully');

  } catch (error) {
    logger.error('Failed to initialize database connections:', error);
    throw error;
  }
}

/**
 * Gracefully close all database connections
 */
export async function closeDatabaseConnections() {
  try {
    logger.info('Closing database connections...');

    await Promise.all([
      coreClient.$disconnect(),
      cmdbClient.$disconnect(),
      notificationClient.$disconnect()
    ]); // TODO-LINT: move to async function

    logger.info('All database connections closed successfully');

  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
}

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Check health of all database connections
 */
export async function checkDatabaseHealth() {
  const health = {
    core: { status: 'unknown', latency: null },
    cmdb: { status: 'unknown', latency: null },
    notification: { status: 'unknown', latency: null }
  };

  // Check core database
  try {
    const start = Date.now();
    await coreClient.$executeRaw`SELECT 1`; // TODO-LINT: move to async function
    health.core = {
      status: 'healthy',
      latency: Date.now() - start
    };
  } catch (error) {
    health.core = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check CMDB database
  try {
    const start = Date.now();
    await cmdbClient.$executeRaw`SELECT 1`; // TODO-LINT: move to async function
    health.cmdb = {
      status: 'healthy',
      latency: Date.now() - start
    };
  } catch (error) {
    health.cmdb = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check notification database
  try {
    const start = Date.now();
    await notificationClient.$executeRaw`SELECT 1`; // TODO-LINT: move to async function
    health.notification = {
      status: 'healthy',
      latency: Date.now() - start
    };
  } catch (error) {
    health.notification = {
      status: 'unhealthy',
      error: error.message
    };
  }

  return health;
}

// ============================================================================
// TRANSACTION HELPERS
// ============================================================================

/**
 * Execute a transaction across multiple databases
 * Note: This doesn't provide true atomicity across different databases
 * Use with caution and implement proper error handling
 */
export async function executeMultiDbTransaction(operations) {
  const results = [];
  const rollbackOperations = [];

  try {
    for (const operation of operations) {
      const result = await operation.execute(); // TODO-LINT: move to async function
      results.push(result);
      
      if (operation.rollback) {
        rollbackOperations.unshift(operation.rollback); // Add to beginning for reverse order
      }
    }

    return results;

  } catch (error) {
    logger.error('Multi-database transaction failed, attempting rollback:', error);

    // Attempt to rollback in reverse order
    for (const rollback of rollbackOperations) {
      try {
        await rollback(); // TODO-LINT: move to async function
      } catch (rollbackError) {
        logger.error('Rollback operation failed:', rollbackError);
      }
    }

    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const stats = {};

    // Core database stats
    try {
      const coreUsers = await coreClient.user.count(); // TODO-LINT: move to async function
      const coreRoles = await coreClient.role.count(); // TODO-LINT: move to async function
      stats.core = {
        users: coreUsers,
        roles: coreRoles,
        status: 'healthy'
      };
    } catch (error) {
      stats.core = { status: 'error', error: error.message };
    }

    // Notification database stats
    try {
      const notificationEvents = await notificationClient.notificationEvent.count(); // TODO-LINT: move to async function
      const notificationDeliveries = await notificationClient.notificationDelivery.count(); // TODO-LINT: move to async function
      stats.notification = {
        events: notificationEvents,
        deliveries: notificationDeliveries,
        status: 'healthy'
      };
    } catch (error) {
      stats.notification = { status: 'error', error: error.message };
    }

    return stats;

  } catch (error) {
    logger.error('Failed to get database stats:', error);
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  coreClient,
  cmdbClient,
  notificationClient,
  initializeDatabaseConnections,
  closeDatabaseConnections,
  checkDatabaseHealth,
  executeMultiDbTransaction,
  getDatabaseStats
};

// Process handlers for graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing database connections...');
  await closeDatabaseConnections(); // TODO-LINT: move to async function
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing database connections...');
  await closeDatabaseConnections(); // TODO-LINT: move to async function
  process.exit(0);
});
