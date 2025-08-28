/**
 * Centralized database client management for Nova Universe
 * Provides consistent access to all Prisma clients with proper error handling
 */

import { logger } from '../logger.js';

// Lazy-loaded Prisma clients to avoid import issues during startup
let coreClient = null;
let authClient = null;
let auditClient = null;
let cmdbClient = null;
let notificationClient = null;
let user360Client = null;
let integrationClient = null;
let aiClient = null;

/**
 * Get core database client with lazy initialization
 */
export async function getCoreClient() {
  if (!coreClient && process.env.PRISMA_DISABLED !== 'true') {
    try {
      const { PrismaClient } = await import('../../../prisma/generated/core/index.js');
      coreClient = new PrismaClient({
        datasources: {
          core_db: {
            url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
    } catch (error) {
      logger.error('Failed to initialize core Prisma client:', error);
      return null;
    }
  }
  return coreClient;
}

/**
 * Get auth database client with lazy initialization
 */
export async function getAuthClient() {
  if (!authClient && process.env.PRISMA_DISABLED !== 'true') {
    try {
      const { PrismaClient } = await import('../../../prisma/generated/auth/index.js');
      authClient = new PrismaClient({
        datasources: {
          auth_db: {
            url: process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
    } catch (error) {
      logger.error('Failed to initialize auth Prisma client:', error);
      return null;
    }
  }
  return authClient;
}

/**
 * Get audit database client with lazy initialization
 */
export async function getAuditClient() {
  if (!auditClient && process.env.PRISMA_DISABLED !== 'true') {
    try {
      const { PrismaClient } = await import('../../../prisma/generated/audit/index.js');
      auditClient = new PrismaClient({
        datasources: {
          audit_db: {
            url: process.env.AUDIT_DATABASE_URL || process.env.MONGO_URI
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
    } catch (error) {
      logger.error('Failed to initialize audit Prisma client:', error);
      return null;
    }
  }
  return auditClient;
}

/**
 * Get CMDB database client with lazy initialization
 */
export async function getCmdbClient() {
  if (!cmdbClient && process.env.PRISMA_DISABLED !== 'true') {
    try {
      const { PrismaClient } = await import('../../../prisma/generated/cmdb/index.js');
      cmdbClient = new PrismaClient({
        datasources: {
          cmdb_db: {
            url: process.env.CMDB_DATABASE_URL || process.env.DATABASE_URL
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
    } catch (error) {
      logger.error('Failed to initialize CMDB Prisma client:', error);
      return null;
    }
  }
  return cmdbClient;
}

/**
 * Get notification database client with lazy initialization
 */
export async function getNotificationClient() {
  if (!notificationClient && process.env.PRISMA_DISABLED !== 'true') {
    try {
      const { PrismaClient } = await import('../../../prisma/generated/notification/index.js');
      notificationClient = new PrismaClient({
        datasources: {
          notification_db: {
            url: process.env.NOTIFICATION_DATABASE_URL || process.env.DATABASE_URL
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
    } catch (error) {
      logger.error('Failed to initialize notification Prisma client:', error);
      return null;
    }
  }
  return notificationClient;
}

/**
 * Get User360 database client with lazy initialization
 */
export async function getUser360Client() {
  if (!user360Client && process.env.PRISMA_DISABLED !== 'true') {
    try {
      const { PrismaClient } = await import('../../../prisma/generated/user360/index.js');
      user360Client = new PrismaClient({
        datasources: {
          user360_db: {
            url: process.env.USER360_DATABASE_URL || process.env.DATABASE_URL
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
    } catch (error) {
      logger.error('Failed to initialize User360 Prisma client:', error);
      return null;
    }
  }
  return user360Client;
}

/**
 * Get integration database client with lazy initialization
 */
export async function getIntegrationClient() {
  if (!integrationClient && process.env.PRISMA_DISABLED !== 'true') {
    try {
      const { PrismaClient } = await import('../../../prisma/generated/integration/index.js');
      integrationClient = new PrismaClient({
        datasources: {
          integration_db: {
            url: process.env.INTEGRATION_DATABASE_URL || process.env.DATABASE_URL
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
    } catch (error) {
      logger.error('Failed to initialize integration Prisma client:', error);
      return null;
    }
  }
  return integrationClient;
}

/**
 * Get AI database client with lazy initialization
 */
export async function getAiClient() {
  if (!aiClient && process.env.PRISMA_DISABLED !== 'true') {
    try {
      const { PrismaClient } = await import('../../../prisma/generated/ai/index.js');
      aiClient = new PrismaClient({
        datasources: {
          ai_db: {
            url: process.env.AI_DATABASE_URL || process.env.DATABASE_URL
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      });
    } catch (error) {
      logger.error('Failed to initialize AI Prisma client:', error);
      return null;
    }
  }
  return aiClient;
}

/**
 * Health check for all database connections
 */
export async function checkDatabaseHealth() {
  const health = {
    core: false,
    auth: false,
    audit: false,
    cmdb: false,
    notification: false,
    user360: false,
    integration: false,
    ai: false
  };

  try {
    const core = await getCoreClient();
    if (core) {
      await core.$queryRaw`SELECT 1`;
      health.core = true;
    }
  } catch (error) {
    logger.debug('Core DB health check failed:', error.message);
  }

  try {
    const auth = await getAuthClient();
    if (auth) {
      await auth.$queryRaw`SELECT 1`;
      health.auth = true;
    }
  } catch (error) {
    logger.debug('Auth DB health check failed:', error.message);
  }

  try {
    const audit = await getAuditClient();
    if (audit) {
      // MongoDB doesn't support $queryRaw, use findFirst instead
      await audit.auditLog.findFirst({ take: 1 });
      health.audit = true;
    }
  } catch (error) {
    logger.debug('Audit DB health check failed:', error.message);
  }

  try {
    const cmdb = await getCmdbClient();
    if (cmdb) {
      await cmdb.$queryRaw`SELECT 1`;
      health.cmdb = true;
    }
  } catch (error) {
    logger.debug('CMDB health check failed:', error.message);
  }

  try {
    const notification = await getNotificationClient();
    if (notification) {
      await notification.$queryRaw`SELECT 1`;
      health.notification = true;
    }
  } catch (error) {
    logger.debug('Notification DB health check failed:', error.message);
  }

  try {
    const user360 = await getUser360Client();
    if (user360) {
      await user360.$queryRaw`SELECT 1`;
      health.user360 = true;
    }
  } catch (error) {
    logger.debug('User360 DB health check failed:', error.message);
  }

  try {
    const integration = await getIntegrationClient();
    if (integration) {
      await integration.$queryRaw`SELECT 1`;
      health.integration = true;
    }
  } catch (error) {
    logger.debug('Integration DB health check failed:', error.message);
  }

  try {
    const ai = await getAiClient();
    if (ai) {
      await ai.$queryRaw`SELECT 1`;
      health.ai = true;
    }
  } catch (error) {
    logger.debug('AI DB health check failed:', error.message);
  }

  return health;
}

/**
 * Gracefully disconnect all clients
 */
export async function disconnectAll() {
  const disconnectPromises = [];

  if (coreClient) {
    disconnectPromises.push(coreClient.$disconnect());
  }
  if (authClient) {
    disconnectPromises.push(authClient.$disconnect());
  }
  if (auditClient) {
    disconnectPromises.push(auditClient.$disconnect());
  }
  if (cmdbClient) {
    disconnectPromises.push(cmdbClient.$disconnect());
  }
  if (notificationClient) {
    disconnectPromises.push(notificationClient.$disconnect());
  }
  if (user360Client) {
    disconnectPromises.push(user360Client.$disconnect());
  }
  if (integrationClient) {
    disconnectPromises.push(integrationClient.$disconnect());
  }
  if (aiClient) {
    disconnectPromises.push(aiClient.$disconnect());
  }

  try {
    await Promise.all(disconnectPromises);
    logger.info('All database clients disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting database clients:', error);
  }

  // Reset all clients
  coreClient = null;
  authClient = null;
  auditClient = null;
  cmdbClient = null;
  notificationClient = null;
  user360Client = null;
  integrationClient = null;
  aiClient = null;
}

/**
 * Backward compatibility for existing code
 */
export const getPrisma = getCoreClient;
export default getCoreClient;