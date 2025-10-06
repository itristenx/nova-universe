/**
 * ============================================================================
 * DATABASE PACKAGE - UNIFIED EXPORTS
 * ============================================================================
 * 
 * Single entry point for all database operations:
 * - PostgreSQL via Prisma ORM (primary storage)
 * - Redis for caching, sessions, and rate limiting
 * - Multi-tenancy helpers
 * - Transaction management
 * - Health checks
 * 
 * Usage:
 * ```typescript
 * import { prisma, redis, Prisma } from '@/packages/database';
 * 
 * // PostgreSQL operations
 * const users = await prisma.user.findMany();
 * 
 * // Redis caching
 * await redis.cache.set('key', { data: 'value' }, { ttl: 3600 });
 * const cached = await redis.cache.get('key');
 * 
 * // Multi-tenancy
 * setTenant('tenant-123');
 * const tenantUsers = await prisma.user.findMany(); // Automatically filtered
 * 
 * // Transactions
 * await withRetry(async () => {
 *   return prisma.$transaction([
 *     prisma.user.create({ data: {...} }),
 *     prisma.log.create({ data: {...} })
 *   ]);
 * });
 * ```
 * ============================================================================
 */

// ============================================================================
// PRISMA (PostgreSQL)
// ============================================================================

export {
  prisma,
  prismaReadReplica,
  Prisma,
  setTenant,
  clearTenant,
  getCurrentTenant,
  checkDatabaseHealth,
  getPoolMetrics,
  executeTransaction,
} from './client.js';

// Re-export default as db for convenience
export { default as db } from './client.js';

// ============================================================================
// REDIS
// ============================================================================

export {
  redis,
  redisClient,
  RedisClientFactory,
} from './redis.js';

export type {
  CacheOptions,
  RateLimitConfig,
  SessionData,
} from './redis.js';

// ============================================================================
// DEFAULT EXPORT (Prisma client)
// ============================================================================

export { default } from './client.js';
