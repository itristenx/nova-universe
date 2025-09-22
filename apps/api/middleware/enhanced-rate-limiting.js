// Enhanced Rate Limiting for Nova Universe API
// Implements sophisticated rate limiting with user/IP tracking and adaptive limits

import rateLimit from 'express-rate-limit';
import { logger } from '../logger.js';
import { logSecurityEvent } from './security-monitoring.js';

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  // Default limits
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  
  // Different limits for different user types
  limits: {
    anonymous: 100, // Requests per window for unauthenticated users
    authenticated: 1000, // Requests per window for authenticated users
    premium: 5000, // Requests per window for premium users
    admin: 10000, // Requests per window for admin users
  },
  
  // Endpoint-specific limits
  endpointLimits: {
    '/api/auth/login': { max: 5, windowMs: 15 * 60 * 1000 }, // 5 login attempts per 15 minutes
    '/api/auth/register': { max: 3, windowMs: 60 * 60 * 1000 }, // 3 registrations per hour
    '/api/auth/password-reset': { max: 3, windowMs: 60 * 60 * 1000 }, // 3 password resets per hour
    '/api/auth/verify-email': { max: 5, windowMs: 60 * 60 * 1000 }, // 5 email verifications per hour
    '/api/upload': { max: 20, windowMs: 60 * 60 * 1000 }, // 20 uploads per hour
    '/api/search': { max: 100, windowMs: 15 * 60 * 1000 }, // 100 searches per 15 minutes
  },
};

/**
 * In-memory store for rate limiting (use Redis in production)
 */
class MemoryRateLimitStore {
  constructor() {
    this.store = new Map();
    this.cleanup();
  }

  async get(key) {
    const data = this.store.get(key);
    if (!data) return { count: 0, resetTime: Date.now() + RATE_LIMIT_CONFIG.windowMs };
    
    // Check if window has expired
    if (Date.now() > data.resetTime) {
      this.store.delete(key);
      return { count: 0, resetTime: Date.now() + RATE_LIMIT_CONFIG.windowMs };
    }
    
    return data;
  }

  async set(key, data) {
    this.store.set(key, data);
  }

  async increment(key, windowMs = RATE_LIMIT_CONFIG.windowMs) {
    const existing = await this.get(key);
    const newData = {
      count: existing.count + 1,
      resetTime: existing.resetTime || Date.now() + windowMs,
    };
    
    await this.set(key, newData);
    return newData;
  }

  // Cleanup expired entries
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (now > data.resetTime) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }
}

const rateLimitStore = new MemoryRateLimitStore();

/**
 * Generate rate limit key based on user and IP
 */
function generateRateLimitKey(req, prefix = 'global') {
  const userId = req.user?.id;
  const ip = req.ip;
  
  if (userId) {
    return `${prefix}:user:${userId}`;
  }
  
  return `${prefix}:ip:${ip}`;
}

/**
 * Get rate limit for user type
 */
function getRateLimitForUser(req) {
  if (!req.user) {
    return RATE_LIMIT_CONFIG.limits.anonymous;
  }
  
  const roles = req.user.roles || [];
  
  if (roles.includes('admin') || roles.includes('superadmin')) {
    return RATE_LIMIT_CONFIG.limits.admin;
  }
  
  if (roles.includes('premium')) {
    return RATE_LIMIT_CONFIG.limits.premium;
  }
  
  return RATE_LIMIT_CONFIG.limits.authenticated;
}

/**
 * Adaptive rate limiter that adjusts based on user type
 */
export function createAdaptiveRateLimit(options = {}) {
  const config = { ...RATE_LIMIT_CONFIG, ...options };
  
  return rateLimit({
    windowMs: config.windowMs,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    
    // Dynamic limit based on user
    max: (req) => {
      const userLimit = getRateLimitForUser(req);
      return options.max || userLimit;
    },
    
    // Custom key generator
    keyGenerator: (req) => {
      return generateRateLimitKey(req, options.prefix || 'global');
    },
    
    // Enhanced handler with security logging
    handler: (req, res, next, options) => {
      const key = generateRateLimitKey(req, options.prefix || 'global');
      const userType = req.user ? 'authenticated' : 'anonymous';
      const limit = getRateLimitForUser(req);
      
      logger.warn('Rate limit exceeded', {
        key,
        userType,
        userId: req.user?.id,
        ip: req.ip,
        endpoint: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        limit,
        windowMs: config.windowMs,
      });
      
      // Log security event
      logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        resource: req.originalUrl,
        action: req.method,
        metadata: {
          userType,
          limit,
          windowMs: config.windowMs,
        }
      });
      
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(config.windowMs / 1000),
        limit,
        message: `Rate limit exceeded. Please wait ${Math.ceil(config.windowMs / 1000)} seconds before trying again.`
      });
    },
    
    // Skip function for certain conditions
    skip: (req) => {
      // Skip rate limiting for certain admin operations in development
      if (process.env.NODE_ENV === 'development' && req.user?.roles?.includes('admin')) {
        return options.skipAdminInDev !== false;
      }
      
      return false;
    },
  });
}

/**
 * Endpoint-specific rate limiters
 */
export function createEndpointRateLimit(endpoint) {
  const endpointConfig = RATE_LIMIT_CONFIG.endpointLimits[endpoint];
  
  if (!endpointConfig) {
    return createAdaptiveRateLimit();
  }
  
  return createAdaptiveRateLimit({
    ...endpointConfig,
    prefix: `endpoint:${endpoint.replace(/\//g, ':')}`,
  });
}

/**
 * Aggressive rate limiter for sensitive endpoints
 */
export function createAggressiveRateLimit(options = {}) {
  return createAdaptiveRateLimit({
    windowMs: options.windowMs || 5 * 60 * 1000, // 5 minutes
    max: options.max || 3,
    prefix: options.prefix || 'sensitive',
    skipAdminInDev: false, // Don't skip for sensitive endpoints
  });
}

/**
 * Progressive rate limiter that increases restrictions on repeated violations
 */
export function createProgressiveRateLimit(options = {}) {
  const violations = new Map();
  
  return createAdaptiveRateLimit({
    ...options,
    
    // Reduce limit for repeat offenders
    max: (req) => {
      const key = generateRateLimitKey(req);
      const violationCount = violations.get(key) || 0;
      const baseLimit = getRateLimitForUser(req);
      
      // Reduce limit by 20% for each violation, minimum of 10 requests
      const reduction = Math.min(violationCount * 0.2, 0.8);
      return Math.max(Math.floor(baseLimit * (1 - reduction)), 10);
    },
    
    // Track violations
    handler: (req, res, next, options) => {
      const key = generateRateLimitKey(req);
      const currentViolations = violations.get(key) || 0;
      violations.set(key, currentViolations + 1);
      
      // Clean up old violations
      setTimeout(() => {
        const current = violations.get(key) || 0;
        if (current > 0) {
          violations.set(key, current - 1);
        }
      }, 60 * 60 * 1000); // Reduce violation count after 1 hour
      
      // Call default handler
      createAdaptiveRateLimit(options).handler(req, res, next, options);
    },
  });
}

/**
 * IP-based rate limiter for additional protection
 */
export function createIPRateLimit(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 1000, // Higher limit for IP-based limiting
    standardHeaders: true,
    legacyHeaders: false,
    
    keyGenerator: (req) => `ip:${req.ip}`,
    
    handler: (req, res) => {
      logger.warn('IP rate limit exceeded', {
        ip: req.ip,
        endpoint: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
      });
      
      logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        resource: req.originalUrl,
        action: req.method,
        metadata: { type: 'ip_based' }
      });
      
      res.status(429).json({
        success: false,
        error: 'IP rate limit exceeded',
        errorCode: 'IP_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
  });
}

/**
 * Global rate limiter combining user and IP limits
 */
export function createGlobalRateLimit() {
  return [
    createIPRateLimit({ max: 2000, windowMs: 15 * 60 * 1000 }), // IP limit
    createAdaptiveRateLimit(), // User-based limit
  ];
}

/**
 * Rate limit middleware for specific authentication endpoints
 */
export const authRateLimit = createEndpointRateLimit('/api/auth/login');
export const registerRateLimit = createEndpointRateLimit('/api/auth/register');
export const passwordResetRateLimit = createEndpointRateLimit('/api/auth/password-reset');
export const emailVerifyRateLimit = createEndpointRateLimit('/api/auth/verify-email');

/**
 * Rate limit for file uploads
 */
export const uploadRateLimit = createEndpointRateLimit('/api/upload');

/**
 * Rate limit for search endpoints
 */
export const searchRateLimit = createEndpointRateLimit('/api/search');

/**
 * Get rate limit status for a user
 */
export async function getRateLimitStatus(req) {
  const key = generateRateLimitKey(req);
  const data = await rateLimitStore.get(key);
  const limit = getRateLimitForUser(req);
  
  return {
    limit,
    used: data.count,
    remaining: Math.max(0, limit - data.count),
    resetTime: new Date(data.resetTime),
    windowMs: RATE_LIMIT_CONFIG.windowMs,
  };
}

export default {
  createAdaptiveRateLimit,
  createEndpointRateLimit,
  createAggressiveRateLimit,
  createProgressiveRateLimit,
  createIPRateLimit,
  createGlobalRateLimit,
  getRateLimitStatus,
  authRateLimit,
  registerRateLimit,
  passwordResetRateLimit,
  emailVerifyRateLimit,
  uploadRateLimit,
  searchRateLimit,
};