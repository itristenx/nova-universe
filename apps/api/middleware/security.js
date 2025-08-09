// Security middleware for Nova Universe API
// Implements comprehensive security headers and protection measures

import helmet from 'helmet';
import cors from 'cors';
import { logger } from '../logger.js';

/**
 * Configure comprehensive security headers using Helmet
 */
export function configureSecurityHeaders() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'"],
        childSrc: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },

    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Disable for API compatibility

    // Cross-Origin Opener Policy  
    crossOriginOpenerPolicy: { policy: "same-origin" },

    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },

    // Frame Options
    frameguard: { action: 'deny' },

    // Hide Powered-By header
    hidePoweredBy: true,

    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },

    // IE No Open
    ieNoOpen: true,

    // MIME Type sniffing prevention
    noSniff: true,

    // Referrer Policy
    referrerPolicy: { policy: "no-referrer" },

    // X-XSS-Protection
    xssFilter: true,

    // Permissions Policy (formerly Feature Policy)
    permittedCrossDomainPolicies: false,
  });
}

/**
 * Configure CORS with security-focused settings
 */
export function configureCORS() {
  const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'];

  // Add production URLs if specified
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  return cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      
      // In development, allow localhost with any port
      if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      
      logger.warn('CORS blocked origin', { origin, allowedOrigins });
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    
    credentials: true,
    
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Client-Version',
      'X-Request-ID'
    ],
    
    exposedHeaders: [
      'X-Total-Count',
      'X-Rate-Limit-Limit',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset'
    ],
    
    maxAge: 86400, // 24 hours
    
    optionsSuccessStatus: 200, // For legacy browser support
    
    preflightContinue: false
  });
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput(req, res, next) {
  try {
    // Recursively sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    next();
  } catch (error) {
    logger.error('Input sanitization error:', error);
    res.status(400).json({
      error: 'Invalid input data',
      errorCode: 'INVALID_INPUT'
    });
  }
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return sanitizeValue(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize the key
    const cleanKey = sanitizeValue(key);
    sanitized[cleanKey] = sanitizeObject(value);
  }
  
  return sanitized;
}

/**
 * Sanitize individual values
 */
function sanitizeValue(value) {
  if (typeof value !== 'string') {
    return value;
  }
  
  // Remove potential XSS vectors
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/style\s*=/gi, '') // Remove inline styles
    .trim();
}

/**
 * API Key validation middleware
 */
export function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      errorCode: 'API_KEY_REQUIRED'
    });
  }
  
  // Basic API key format validation
  if (!/^[a-zA-Z0-9_-]{32,}$/.test(apiKey)) {
    return res.status(401).json({
      error: 'Invalid API key format',
      errorCode: 'INVALID_API_KEY_FORMAT'
    });
  }
  
  // TODO: Implement actual API key validation against database
  // For now, check against environment variable
  const validApiKey = process.env.API_KEY;
  if (validApiKey && apiKey !== validApiKey) {
    logger.warn('Invalid API key attempt', { 
      providedKey: apiKey.substring(0, 8) + '...',
      ip: req.ip
    });
    
    return res.status(401).json({
      error: 'Invalid API key',
      errorCode: 'INVALID_API_KEY'
    });
  }
  
  next();
}

/**
 * Request logging middleware for security monitoring
 */
export function securityLogging(req, res, next) {
  const startTime = Date.now();
  
  // Log request
  logger.info('Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || null,
    timestamp: new Date().toISOString()
  });
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info('Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id || null
    });
    
    // Log security events
    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.warn('Security event', {
        event: 'ACCESS_DENIED',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || null
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
}

export default {
  configureSecurityHeaders,
  configureCORS,
  sanitizeInput,
  validateApiKey,
  securityLogging
};
