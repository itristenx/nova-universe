import rateLimit from 'express-rate-limit';
import { logger } from '../logger.js';

// In-memory store for advanced rate limiting (in production, use Redis)
const rateLimitStore = new Map();
const suspiciousIPs = new Map(); // Track IPs with suspicious activity
const blockedIPs = new Set(); // Temporarily blocked IPs

/**
 * Advanced rate limiter with progressive penalties and IP reputation tracking
 * @param {object} options - Configuration options
 * @returns {import('express').RequestHandler}
 */
export const createAdvancedRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      errorCode: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    
    // Custom key generator that includes user agent for better tracking
    keyGenerator: (req) => {
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'unknown';
      return `${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 20)}`;
    },

    // Enhanced skip logic
    skip: (req) => {
      // Skip for health checks
      if (req.path === '/api/health' || req.path === '/health') return true;
      
      // Skip in test environment
      if (process.env.NODE_ENV === 'test') return true;
      
      return false;
    },

    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      // Track suspicious activity
      const suspicious = suspiciousIPs.get(ip) || { count: 0, firstSeen: Date.now() };
      suspicious.count += 1;
      suspicious.lastSeen = Date.now();
      suspiciousIPs.set(ip, suspicious);
      
      // Block IP temporarily if too many rate limit violations
      if (suspicious.count >= 10) {
        blockedIPs.add(ip);
        setTimeout(() => blockedIPs.delete(ip), 60 * 60 * 1000); // Block for 1 hour
        
        logger.warn('IP temporarily blocked due to excessive rate limiting', {
          ip,
          userAgent,
          violationCount: suspicious.count,
          timestamp: new Date().toISOString(),
        });
      }
      
      logger.warn('Rate limit exceeded', {
        ip,
        userAgent,
        path: req.path,
        method: req.method,
        suspiciousCount: suspicious.count,
        timestamp: new Date().toISOString(),
      });

      return res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(options.windowMs / 1000) || 900, // seconds
      });
    },

    // Pre-request check for blocked IPs
    skip: (req) => {
      const ip = req.ip || req.connection.remoteAddress;
      
      if (blockedIPs.has(ip)) {
        logger.warn('Request from blocked IP', {
          ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
        });
        return false; // Don't skip - let it be rate limited
      }
      
      // Original skip logic
      if (req.path === '/api/health' || req.path === '/health') return true;
      if (process.env.NODE_ENV === 'test') return true;
      
      return false;
    },
  };

  return rateLimit({ ...defaults, ...options });
};

/**
 * Legacy rate limiter for compatibility
 */
export const createRateLimiter = (options = {}) => {
  return createAdvancedRateLimiter(options);
};

/**
 * Preconfigured rate limiters for different API areas with industry-standard limits
 */
export const rateLimiters = {
  /**
   * Authentication endpoints - very strict limits
   */
  auth: createAdvancedRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: {
      error: 'Too many authentication attempts. Please try again later.',
      errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  }),

  /**
   * Password reset - strict limits to prevent abuse
   */
  passwordReset: createAdvancedRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset requests per hour
    message: {
      error: 'Too many password reset requests. Please try again later.',
      errorCode: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    },
  }),

  /**
   * API endpoints - moderate limits
   */
  api: createAdvancedRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
      error: 'Too many API requests. Please try again later.',
      errorCode: 'API_RATE_LIMIT_EXCEEDED',
    },
  }),

  /**
   * File uploads - strict limits due to resource usage
   */
  upload: createAdvancedRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: {
      error: 'Too many file uploads. Please try again later.',
      errorCode: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    },
  }),

  /**
   * Search endpoints - moderate limits
   */
  search: createAdvancedRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // 50 searches per 5 minutes
    message: {
      error: 'Too many search requests. Please try again later.',
      errorCode: 'SEARCH_RATE_LIMIT_EXCEEDED',
    },
  }),

  /**
   * Registration - strict limits to prevent spam
   */
  registration: createAdvancedRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour per IP
    message: {
      error: 'Too many registration attempts. Please try again later.',
      errorCode: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
    },
  }),

  /**
   * General endpoints - lenient limits
   */
  general: createAdvancedRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 minutes
    message: {
      error: 'Too many requests. Please try again later.',
      errorCode: 'GENERAL_RATE_LIMIT_EXCEEDED',
    },
  }),
};

/**
 * Middleware to block requests from known malicious IPs
 */
export function blockMaliciousIPs(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  
  if (blockedIPs.has(ip)) {
    logger.warn('Request blocked from malicious IP', {
      ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
    
    return res.status(403).json({
      error: 'Access denied',
      errorCode: 'IP_BLOCKED',
    });
  }
  
  next();
}

/**
 * Cleanup function to remove old entries (call periodically)
 */
export function cleanupRateLimitData() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  // Clean up suspicious IPs data older than 1 hour
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (data.lastSeen < oneHourAgo) {
      suspiciousIPs.delete(ip);
    }
  }
  
  logger.info('Rate limit data cleanup completed', {
    suspiciousIPsRemaining: suspiciousIPs.size,
    blockedIPsRemaining: blockedIPs.size,
    timestamp: new Date().toISOString(),
  });
}

// Set up periodic cleanup (every hour)
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupRateLimitData, 60 * 60 * 1000);
}
  /**
   * API endpoints - moderate limits
   */
  api: createRateLimiter({
    windowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_API_MAX) || 100,
  }),
  /**
   * Kiosk endpoints - specific limits
   */
  kiosk: createRateLimiter({
    windowMs: parseInt(process.env.RATE_LIMIT_KIOSK_WINDOW_MS) || 1 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_KIOSK_MAX) || 10,
    message: {
      error: 'Too many kiosk requests, please try again later.',
    },
  }),
  /**
   * Ticket submission - prevent spam
   */
  ticket: createRateLimiter({
    windowMs: parseInt(process.env.RATE_LIMIT_TICKET_WINDOW_MS) || 5 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_TICKET_MAX) || 5,
    message: {
      error: 'Too many ticket submissions, please try again later.',
    },
  }),
};

export const createRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [id, data] of rateLimitStore.entries()) {
      if (data.lastRequest < windowStart) {
        rateLimitStore.delete(id);
      }
    }

    // Get or create client data
    const clientData = rateLimitStore.get(clientId) || { requests: [], lastRequest: now };

    // Filter requests within window
    clientData.requests = clientData.requests.filter((time) => time > windowStart);

    // Check rate limit
    if (clientData.requests.length >= maxRequests) {
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
      });
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`,
      });
    }

    // Add current request
    clientData.requests.push(now);
    clientData.lastRequest = now;
    rateLimitStore.set(clientId, clientData);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - clientData.requests.length,
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
    });

    next();
  };
};

// Specific rate limiters for different endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const kioskRateLimit = createRateLimit(60 * 1000, 10); // 10 requests per minute for kiosks
