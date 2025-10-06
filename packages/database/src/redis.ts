/**
 * ============================================================================
 * REDIS CLIENT FACTORY (Industry Standard 2024/2025)
 * ============================================================================
 * 
 * Centralized Redis client for:
 * - Cache management (query results, computed data)
 * - Session storage (user sessions, temporary tokens)
 * - Rate limiting (API throttling, DDoS protection)
 * - Real-time features (pub/sub, presence)
 * - Job queues (background tasks, scheduled jobs)
 * 
 * Architecture:
 * - ioredis for robust Redis client with cluster support
 * - Connection pooling with auto-reconnect
 * - Graceful degradation (application continues if Redis unavailable)
 * - Structured key namespacing (prevents key collisions)
 * - TTL management for all cached data
 * 
 * Key Naming Convention:
 * - {app}:{feature}:{identifier}
 * - Example: nova:cache:user:123, nova:session:abc123, nova:ratelimit:api:456
 * 
 * References:
 * - https://redis.io/docs/latest/develop/clients/nodejs/
 * - https://github.com/redis/ioredis
 * - https://daily.dev/blog/redis-caching-strategies-2024
 * ============================================================================
 */

import Redis, { RedisOptions, Cluster, ClusterOptions } from 'ioredis';

// ============================================================================
// TYPES
// ============================================================================

export interface CacheOptions {
  /** Time to live in seconds (default: 3600 = 1 hour) */
  ttl?: number;
  /** Namespace prefix for the key */
  namespace?: string;
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  max: number;
  /** Time window in seconds */
  window: number;
  /** Identifier (e.g., user ID, IP address) */
  identifier: string;
}

export interface SessionData {
  [key: string]: unknown;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const isProduction = process.env.NODE_ENV === 'production';
const _isDevelopment = process.env.NODE_ENV === 'development'; // Reserved for future use

// Redis connection configuration
const REDIS_CONFIG: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  
  // Connection pool settings
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  
  // Timeouts (in milliseconds)
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // Reconnection strategy
  retryStrategy(times: number): number {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // TLS for production
  ...(isProduction && process.env.REDIS_TLS_ENABLED === 'true' && {
    tls: {
      rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
    },
  }),
};

// Cluster configuration (for high availability)
const REDIS_CLUSTER_NODES = process.env.REDIS_CLUSTER_NODES?.split(',').map(node => {
  const [host, port] = node.split(':');
  return { host, port: parseInt(port) };
}) || [];

const REDIS_CLUSTER_CONFIG: ClusterOptions = {
  redisOptions: REDIS_CONFIG,
  clusterRetryStrategy(times: number): number {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Default TTL values (in seconds)
const DEFAULT_TTL = {
  QUERY_CACHE: 3600,        // 1 hour for query results
  SESSION: 86400,           // 24 hours for user sessions
  RATE_LIMIT: 60,           // 1 minute for rate limiting
  TEMP_DATA: 300,           // 5 minutes for temporary data
  PUBSUB: 0,                // No expiration for pub/sub
} as const;

// Key namespaces
const NAMESPACE = {
  CACHE: 'nova:cache',
  SESSION: 'nova:session',
  RATE_LIMIT: 'nova:ratelimit',
  PUBSUB: 'nova:pubsub',
  QUEUE: 'nova:queue',
  LOCK: 'nova:lock',
} as const;

// ============================================================================
// REDIS CLIENT SINGLETON
// ============================================================================

class RedisClientFactory {
  private static instance: RedisClientFactory;
  private client: Redis | Cluster | null = null;
  private isConnected = false;
  private isEnabled = true; // Graceful degradation flag

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RedisClientFactory {
    if (!RedisClientFactory.instance) {
      RedisClientFactory.instance = new RedisClientFactory();
    }
    return RedisClientFactory.instance;
  }

  /**
   * Initialize Redis connection
   */
  private initialize(): void {
    try {
      // Check if Redis is disabled
      if (process.env.REDIS_ENABLED === 'false') {
        console.log('📦 Redis is disabled - application will continue without caching');
        this.isEnabled = false;
        return;
      }

      // Create cluster or standalone client
      if (REDIS_CLUSTER_NODES.length > 0) {
        console.log('📦 Connecting to Redis Cluster...');
        this.client = new Redis.Cluster(REDIS_CLUSTER_NODES, REDIS_CLUSTER_CONFIG);
      } else {
        console.log('📦 Connecting to Redis...');
        this.client = new Redis(REDIS_CONFIG);
      }

      // Event handlers
      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis ready');
      });

      this.client.on('error', (error: Error) => {
        console.error('❌ Redis error:', error.message);
        this.isConnected = false;
        
        // Graceful degradation - disable Redis if connection fails
        if (!isProduction) {
          console.warn('⚠️ Redis unavailable - continuing without cache');
          this.isEnabled = false;
        }
      });

      this.client.on('close', () => {
        console.log('📦 Redis connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.isEnabled = false; // Graceful degradation
    }
  }

  /**
   * Get Redis client
   */
  public getClient(): Redis | Cluster | null {
    return this.client;
  }

  /**
   * Check if Redis is available
   */
  public isAvailable(): boolean {
    return this.isEnabled && this.isConnected && this.client !== null;
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    
    try {
      const result = await this.client!.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================

  /**
   * Set cache value
   */
  public async cacheSet(
    key: string,
    value: unknown,
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const { ttl = DEFAULT_TTL.QUERY_CACHE, namespace = NAMESPACE.CACHE } = options;
      const fullKey = `${namespace}:${key}`;
      const serialized = JSON.stringify(value);

      if (ttl > 0) {
        await this.client!.setex(fullKey, ttl, serialized);
      } else {
        await this.client!.set(fullKey, serialized);
      }

      return true;
    } catch (error) {
      console.error('Redis cache set error:', error);
      return false;
    }
  }

  /**
   * Get cache value
   */
  public async cacheGet<T = unknown>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    if (!this.isAvailable()) return null;

    try {
      const { namespace = NAMESPACE.CACHE } = options;
      const fullKey = `${namespace}:${key}`;
      const result = await this.client!.get(fullKey);

      if (!result) return null;
      return JSON.parse(result) as T;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  /**
   * Delete cache value
   */
  public async cacheDelete(
    key: string,
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const { namespace = NAMESPACE.CACHE } = options;
      const fullKey = `${namespace}:${key}`;
      await this.client!.del(fullKey);
      return true;
    } catch (error) {
      console.error('Redis cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   */
  public async cacheClear(pattern = '*', namespace: string = NAMESPACE.CACHE): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const fullPattern = `${namespace}:${pattern}`;
      const keys = await this.client!.keys(fullPattern);
      
      if (keys.length > 0) {
        await this.client!.del(...keys);
      }
      
      return true;
    } catch (error) {
      console.error('Redis cache clear error:', error);
      return false;
    }
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Set session data
   */
  public async sessionSet(
    sessionId: string,
    data: SessionData,
    ttl = DEFAULT_TTL.SESSION
  ): Promise<boolean> {
    return this.cacheSet(sessionId, data, {
      ttl,
      namespace: NAMESPACE.SESSION,
    });
  }

  /**
   * Get session data
   */
  public async sessionGet(sessionId: string): Promise<SessionData | null> {
    return this.cacheGet<SessionData>(sessionId, {
      namespace: NAMESPACE.SESSION,
    });
  }

  /**
   * Delete session
   */
  public async sessionDelete(sessionId: string): Promise<boolean> {
    return this.cacheDelete(sessionId, {
      namespace: NAMESPACE.SESSION,
    });
  }

  /**
   * Update session TTL (keep session alive)
   */
  public async sessionTouch(sessionId: string, ttl = DEFAULT_TTL.SESSION): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const fullKey = `${NAMESPACE.SESSION}:${sessionId}`;
      await this.client!.expire(fullKey, ttl);
      return true;
    } catch (error) {
      console.error('Redis session touch error:', error);
      return false;
    }
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  /**
   * Check rate limit (token bucket algorithm)
   */
  public async rateLimitCheck(config: RateLimitConfig): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    // Graceful degradation - allow all requests if Redis unavailable
    if (!this.isAvailable()) {
      return {
        allowed: true,
        remaining: config.max,
        resetAt: Date.now() + config.window * 1000,
      };
    }

    try {
      const { max, window, identifier } = config;
      const key = `${NAMESPACE.RATE_LIMIT}:${identifier}`;
      
      // Get current count
      const current = await this.client!.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= max) {
        // Rate limit exceeded
        const ttl = await this.client!.ttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetAt: Date.now() + ttl * 1000,
        };
      }

      // Increment counter
      const newCount = await this.client!.incr(key);
      
      // Set expiration on first request
      if (newCount === 1) {
        await this.client!.expire(key, window);
      }

      return {
        allowed: true,
        remaining: max - newCount,
        resetAt: Date.now() + window * 1000,
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Allow request on error
      return {
        allowed: true,
        remaining: config.max,
        resetAt: Date.now() + config.window * 1000,
      };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  public async rateLimitReset(identifier: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const key = `${NAMESPACE.RATE_LIMIT}:${identifier}`;
      await this.client!.del(key);
      return true;
    } catch (error) {
      console.error('Redis rate limit reset error:', error);
      return false;
    }
  }

  // ============================================================================
  // PUB/SUB
  // ============================================================================

  /**
   * Publish message to channel
   */
  public async publish(channel: string, message: unknown): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const fullChannel = `${NAMESPACE.PUBSUB}:${channel}`;
      const serialized = JSON.stringify(message);
      await this.client!.publish(fullChannel, serialized);
      return true;
    } catch (error) {
      console.error('Redis publish error:', error);
      return false;
    }
  }

  /**
   * Subscribe to channel
   */
  public async subscribe(
    channel: string,
    callback: (message: unknown) => void
  ): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const fullChannel = `${NAMESPACE.PUBSUB}:${channel}`;
      
      // Create subscriber client (ioredis requirement)
      const subscriber = this.client!.duplicate();
      
      subscriber.on('message', (ch: string, msg: string) => {
        if (ch === fullChannel) {
          try {
            const parsed = JSON.parse(msg);
            callback(parsed);
          } catch (error) {
            console.error('Redis message parse error:', error);
          }
        }
      });

      await subscriber.subscribe(fullChannel);
      return true;
    } catch (error) {
      console.error('Redis subscribe error:', error);
      return false;
    }
  }

  // ============================================================================
  // DISTRIBUTED LOCKS
  // ============================================================================

  /**
   * Acquire distributed lock
   */
  public async acquireLock(
    resource: string,
    ttl = 10000, // 10 seconds
    retries = 3
  ): Promise<string | null> {
    if (!this.isAvailable()) return null;

    try {
      const key = `${NAMESPACE.LOCK}:${resource}`;
      const token = Math.random().toString(36).substring(7);

      for (let i = 0; i < retries; i++) {
        const result = await this.client!.set(key, token, 'PX', ttl, 'NX');
        
        if (result === 'OK') {
          return token;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
      }

      return null;
    } catch (error) {
      console.error('Redis acquire lock error:', error);
      return null;
    }
  }

  /**
   * Release distributed lock
   */
  public async releaseLock(resource: string, token: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const key = `${NAMESPACE.LOCK}:${resource}`;
      
      // Lua script to ensure atomic check-and-delete
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await this.client!.eval(script, 1, key, token);
      return result === 1;
    } catch (error) {
      console.error('Redis release lock error:', error);
      return false;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Singleton instance
export const redisClient = RedisClientFactory.getInstance();

// Export class for testing
export { RedisClientFactory };

// Convenience exports
export const redis = {
  // Connection management
  getClient: () => redisClient.getClient(),
  isAvailable: () => redisClient.isAvailable(),
  disconnect: () => redisClient.disconnect(),
  healthCheck: () => redisClient.healthCheck(),

  // Cache operations
  cache: {
    set: (key: string, value: unknown, options?: CacheOptions) => 
      redisClient.cacheSet(key, value, options),
    get: <T = unknown>(key: string, options?: CacheOptions) => 
      redisClient.cacheGet<T>(key, options),
    delete: (key: string, options?: CacheOptions) => 
      redisClient.cacheDelete(key, options),
    clear: (pattern = '*', namespace = NAMESPACE.CACHE as string) => 
      redisClient.cacheClear(pattern, namespace),
  },

  // Session management
  session: {
    set: (sessionId: string, data: SessionData, ttl = DEFAULT_TTL.SESSION) => 
      redisClient.sessionSet(sessionId, data, ttl),
    get: (sessionId: string) => 
      redisClient.sessionGet(sessionId),
    delete: (sessionId: string) => 
      redisClient.sessionDelete(sessionId),
    touch: (sessionId: string, ttl = DEFAULT_TTL.SESSION) => 
      redisClient.sessionTouch(sessionId, ttl),
  },

  // Rate limiting
  rateLimit: {
    check: (config: RateLimitConfig) => 
      redisClient.rateLimitCheck(config),
    reset: (identifier: string) => 
      redisClient.rateLimitReset(identifier),
  },

  // Pub/Sub
  pubsub: {
    publish: (channel: string, message: unknown) => 
      redisClient.publish(channel, message),
    subscribe: (channel: string, callback: (message: unknown) => void) => 
      redisClient.subscribe(channel, callback),
  },

  // Distributed locks
  lock: {
    acquire: (resource: string, ttl?: number, retries?: number) => 
      redisClient.acquireLock(resource, ttl, retries),
    release: (resource: string, token: string) => 
      redisClient.releaseLock(resource, token),
  },
};

// Default export
export default redis;
