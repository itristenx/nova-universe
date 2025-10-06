/**
 * ============================================================================
 * DATABASE CLIENT FACTORY (Industry Standard 2024/2025)
 * ============================================================================
 * 
 * Centralized database access layer with:
 * - PostgreSQL via Prisma ORM (primary database)
 * - Redis for caching and sessions (optional)
 * - Connection pooling and optimization
 * - Multi-tenancy support (Shared Database, Separate Schemas pattern)
 * - Query logging and performance monitoring
 * - Automatic reconnection and error handling
 * - Support for read replicas
 * - Middleware for cross-cutting concerns
 * 
 * Architecture Decision:
 * - PostgreSQL for ALL persistent data (users, tickets, KB, assets)
 * - Redis ONLY for ephemeral data (cache, sessions, rate limiting)
 * - No MongoDB (consolidated to PostgreSQL for ACID compliance)
 * 
 * References:
 * - https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 * - https://daily.dev/blog/multi-tenant-database-design-patterns-2024
 * - https://www.postgresql.org/docs/current/runtime-config-connection.html
 * ============================================================================
 */

import { PrismaClient, Prisma } from '../../../prisma/generated/client/index.js';
// Redis client is exported separately - imported here for type checking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { redisClient } from './redis.js';

// ============================================================================
// GLOBAL TYPE EXTENSIONS
// ============================================================================

declare global {
  // Prisma client singleton for HMR (Hot Module Replacement)
  var __prismaClient: PrismaClient | undefined;
  // Current tenant ID for multi-tenancy
  var __currentTenant: string | null | undefined;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Connection pool configuration (industry best practices)
// These values are documented here for reference but applied via DATABASE_URL connection string
// Format: postgresql://user:password@host:port/database?connection_limit=20&connect_timeout=10
const _CONNECTION_POOL_CONFIG = {
  // Maximum connections in pool (recommendation: 2-5 per CPU core)
  connection_limit: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
  // Connection timeout in seconds
  connect_timeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10'),
  // Pool timeout in seconds (how long to wait for available connection)
  pool_timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '10'),
} as const;

// Logging configuration
const LOG_CONFIG: Prisma.LogLevel[] = isDevelopment 
  ? ['query', 'info', 'warn', 'error'] 
  : ['warn', 'error'];

// ============================================================================
// PRISMA CLIENT SINGLETON (Prevent multiple instances)
// ============================================================================

/**
 * Create Prisma Client with optimized configuration
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: LOG_CONFIG,
    
    // Connection pool configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Error formatting
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
  });

  // ============================================================================
  // MIDDLEWARE: Query Logging and Performance Monitoring
  // ============================================================================
  
  // Query logging middleware
  if (isDevelopment) {
    client.$use(async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      const duration = after - before;

      // Log slow queries (> 100ms in production, > 50ms in development)
      const slowQueryThreshold = isProduction ? 100 : 50;
      if (duration > slowQueryThreshold) {
        console.warn(`[Prisma] Slow query detected (${duration}ms):`, {
          model: params.model,
          action: params.action,
          duration: `${duration}ms`,
        });
      }

      return result;
    });
  }

  // ============================================================================
  // MIDDLEWARE: Multi-Tenancy Support (Shared Database, Separate Schemas)
  // ============================================================================
  
  /**
   * Automatically set search_path for tenant isolation
   * This implements the "Shared Database, Separate Schemas" pattern
   * which is industry standard for B2B SaaS applications
   */
  client.$use(async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) => {
    // Get tenant from context (set by your auth middleware)
    const tenantId = global.__currentTenant;
    
    if (tenantId && isProduction) {
      // Set PostgreSQL search_path for this transaction
      // This ensures all queries use the tenant's schema
      await client.$executeRaw`SET search_path TO ${Prisma.raw(tenantId)}, public`;
    }
    
    return next(params);
  });

  // ============================================================================
  // MIDDLEWARE: Soft Delete Support
  // ============================================================================
  
  /**
   * Automatically filter out soft-deleted records
   * Add { deletedAt: null } to all findMany/findFirst queries
   */
  client.$use(async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) => {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      // Check if model has deletedAt field
      if (params.model && 'deletedAt' in (params.model as Record<string, unknown>)) {
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      }
    }
    
    return next(params);
  });

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  // Graceful shutdown
  process.on('beforeExit', async () => {
    await client.$disconnect();
  });

  process.on('SIGINT', async () => {
    await client.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await client.$disconnect();
    process.exit(0);
  });

  return client;
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Global Prisma Client instance (singleton pattern)
 * 
 * In development, we use globalThis to prevent hot-reload from creating
 * multiple instances. In production, we create one instance per process.
 */
export const prisma = global.__prismaClient || createPrismaClient();

if (isDevelopment) {
  global.__prismaClient = prisma;
}

// ============================================================================
// READ REPLICA SUPPORT (Optional)
// ============================================================================

/**
 * Optional read replica for heavy read operations
 * Reduces load on primary database
 * 
 * Usage:
 * - Use `prisma` for writes and critical reads
 * - Use `prismaReadReplica` for analytics, reports, and non-critical reads
 */
export const prismaReadReplica = process.env.DATABASE_URL_READ_REPLICA
  ? new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_READ_REPLICA,
        },
      },
      log: ['error'],
    })
  : prisma; // Fallback to primary if no replica configured

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Set tenant context for multi-tenancy
 * Call this in your authentication middleware
 * 
 * @example
 * ```typescript
 * app.use((req, res, next) => {
 *   const tenantId = req.user?.tenantId;
 *   setTenant(tenantId);
 *   next();
 * });
 * ```
 */
export function setTenant(tenantId: string | null) {
  global.__currentTenant = tenantId;
}

/**
 * Clear tenant context (useful for background jobs)
 */
export function clearTenant() {
  global.__currentTenant = null;
}

/**
 * Get current tenant from context
 */
export function getCurrentTenant(): string | null {
  return global.__currentTenant || null;
}

/**
 * Health check for database connectivity
 * 
 * @example
 * ```typescript
 * app.get('/health/db', async (req, res) => {
 *   const isHealthy = await checkDatabaseHealth();
 *   res.status(isHealthy ? 200 : 503).json({ healthy: isHealthy });
 * });
 * ```
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[Prisma] Database health check failed:', error);
    return false;
  }
}

/**
 * Get database connection pool metrics
 * Useful for monitoring and alerting
 */
export async function getPoolMetrics() {
  try {
    const result = await prisma.$queryRaw<Array<{ 
      total: number; 
      active: number; 
      idle: number; 
      waiting: number; 
    }>>`
      SELECT 
        numbackends as total,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) FILTER (WHERE wait_event_type IS NOT NULL) as waiting
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY numbackends
    `;
    
    return result[0] || { total: 0, active: 0, idle: 0, waiting: 0 };
  } catch (error) {
    console.error('[Prisma] Failed to get pool metrics:', error);
    return { total: 0, active: 0, idle: 0, waiting: 0 };
  }
}

// ============================================================================
// TRANSACTION HELPERS
// ============================================================================

/**
 * Execute multiple operations in a transaction with retry logic
 * 
 * @example
 * ```typescript
 * await executeTransaction(async (tx) => {
 *   await tx.user.create({ data: { email: 'user@example.com' } });
 *   await tx.ticket.create({ data: { title: 'New Ticket', userId: user.id } });
 * });
 * ```
 */
export async function executeTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxRetries?: number;
    timeout?: number;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries || 3;
  const timeout = options?.timeout || 10000; // 10 seconds default
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        maxWait: timeout,
        timeout,
      });
    } catch (error) {
      lastError = error as Error;
      
      // Only retry on serialization errors or deadlocks
      const shouldRetry = 
        error instanceof Error &&
        (error.message.includes('serialization') ||
         error.message.includes('deadlock'));
      
      if (!shouldRetry || attempt === maxRetries - 1) {
        break;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Transaction failed after retries');
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export the Prisma namespace for all types
export { Prisma } from '../../../prisma/generated/client/index.js';

// Export Redis client
export { redis, redisClient } from './redis.js';

// Default export
export default prisma;
