
import rateLimit from 'express-rate-limit';
import config from '../config/environment.js';

// In-memory store for rate limiting
const rateLimitStore = new Map();

/**
 * Create a rate limiter middleware with sensible defaults, overridable by options or environment variables.
 * @param {object} options - express-rate-limit options
 * @returns {import('express').RequestHandler}
 */
export const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => req.path === '/api/health',
  };
  return rateLimit({ ...defaults, ...options });
};

/**
 * Preconfigured rate limiters for different API areas.
 */
export const _rateLimiters = {
  /**
   * Authentication endpoints - stricter limits
   */
  auth: createRateLimiter({
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 5,
    message: {
      error: 'Too many authentication attempts, please try again later.',
    },
  }),
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
    clientData.requests = clientData.requests.filter(time => time > windowStart);
    
    // Check rate limit
    if (clientData.requests.length >= maxRequests) {
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
      });
      return res.status(429).json({ 
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`
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
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });
    
    next();
  };
};

// Specific rate limiters for different endpoints
export const _authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const _apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const _kioskRateLimit = createRateLimit(60 * 1000, 10); // 10 requests per minute for kiosks
