// Security middleware for Nova Universe API
// Implements comprehensive security headers and protection measures

import helmet from 'helmet';
import cors from 'cors';
import { logger } from '../logger.js';

/**
 * Configure comprehensive security headers using Helmet with industry standards
 */
export function configureSecurityHeaders() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return helmet({
    // Content Security Policy - Enhanced for security
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        blockAllMixedContent: [],
        fontSrc: ["'self'", 'https:', 'data:'],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        objectSrc: ["'none'"],
        scriptSrc: isDevelopment 
          ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] // Relaxed for development
          : ["'self'", "'sha256-...'"], // Strict for production (add actual hashes)
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        upgradeInsecureRequests: isProduction ? [] : null,
        workerSrc: ["'self'", 'blob:'],
        connectSrc: [
          "'self'",
          ...(process.env.CORS_ORIGINS?.split(',') || []),
          'wss:', // WebSocket support
        ],
        reportUri: '/api/csp-report', // CSP violation reporting
      },
    },

    // Cross-Origin policies for enhanced security
    crossOriginEmbedderPolicy: false, // Keep disabled for API compatibility
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },

    // Frame Options - Prevent clickjacking
    frameguard: { action: 'deny' },

    // Hide X-Powered-By header
    hidePoweredBy: true,

    // HTTP Strict Transport Security (HSTS) - Production only
    hsts: isProduction ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    } : false,

    // IE No Open - Prevent IE from executing downloads
    ieNoOpen: true,

    // No Sniff - Prevent MIME sniffing
    noSniff: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // Permissions Policy (formerly Feature Policy)
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: [],
      bluetooth: [],
      magnetometer: [],
      gyroscope: [],
      accelerometer: [],
      ambient: [],
    },

    // Referrer Policy
    referrerPolicy: { policy: ['no-referrer', 'strict-origin-when-cross-origin'] },

    // X-Content-Type-Options
    xssFilter: true,
  });
}

/**
 * Configure CORS with security best practices
 */
export function configureCORS() {
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://localhost:8080',
  ];

  const isDevelopment = process.env.NODE_ENV === 'development';

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (isDevelopment || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Log blocked CORS requests for security monitoring
      logger.warn('CORS request blocked', { 
        origin, 
        allowedOrigins,
        timestamp: new Date().toISOString(),
      });
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Cache-Control',
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
  });
}

/**
 * Security middleware for request validation
 */
export function securityValidation(req, res, next) {
  // Block requests with suspicious patterns
  const suspiciousPatterns = [
    /\.\./,     // Directory traversal
    /<script/i, // XSS attempts
    /javascript:/i,
    /vbscript:/i,
    /on\w+=/i,  // Event handlers
    /script:/i,
    /alert\(/i,
    /eval\(/i,
    /expression\(/i,
    /import\(/i,
  ];

  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const queryString = req.url.split('?')[1] || '';
  const requestBody = JSON.stringify(req.body || {});

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl) || pattern.test(queryString) || pattern.test(requestBody)) {
      logger.warn('Suspicious request blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        pattern: pattern.toString(),
        timestamp: new Date().toISOString(),
      });
      
      return res.status(400).json({
        error: 'Invalid request',
        errorCode: 'SECURITY_VIOLATION',
      });
    }
  }

  // Validate request size (prevent DoS attacks)
  const contentLength = parseInt(req.get('Content-Length') || '0', 10);
  const maxRequestSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxRequestSize) {
    logger.warn('Large request blocked', {
      ip: req.ip,
      contentLength,
      maxAllowed: maxRequestSize,
      timestamp: new Date().toISOString(),
    });
    
    return res.status(413).json({
      error: 'Request too large',
      errorCode: 'REQUEST_TOO_LARGE',
    });
  }

  next();
}

    // Hide Powered-By header
    hidePoweredBy: true,

    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // IE No Open
    ieNoOpen: true,

    // MIME Type sniffing prevention
    noSniff: true,

    // Referrer Policy
    referrerPolicy: { policy: 'no-referrer' },

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
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
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
      'X-Request-ID',
      // Allow commonly used caching headers that may trigger preflight in some browsers
      'Cache-Control',
      'Pragma',
    ],

    exposedHeaders: [
      'X-Total-Count',
      'X-Rate-Limit-Limit',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
    ],

    maxAge: 86400, // 24 hours

    optionsSuccessStatus: 200, // For legacy browser support

    preflightContinue: false,
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
      errorCode: 'INVALID_INPUT',
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
    return obj.map((item) => sanitizeObject(item));
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
      errorCode: 'API_KEY_REQUIRED',
    });
  }

  // Basic API key format validation
  if (!/^[a-zA-Z0-9_-]{32,}$/.test(apiKey)) {
    return res.status(401).json({
      error: 'Invalid API key format',
      errorCode: 'INVALID_API_KEY_FORMAT',
    });
  }

  (async () => {
    try {
      // Prefer DB-backed keys stored via ConfigurationManager under 'apiKeys'
      const stored = await ConfigurationManager.get('apiKeys', []);
      const storedKeys = Array.isArray(stored) ? stored.map((k) => k.key).filter(Boolean) : [];

      // Env fallback for emergency use
      const envKey = process.env.API_KEY;

      const isMatch = storedKeys.includes(apiKey) || (envKey ? apiKey === envKey : false);
      if (!isMatch) {
        logger.warn('Invalid API key attempt', {
          providedKey: apiKey.substring(0, 8) + '...',
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
        });

        // Add slight delay to slow down brute force attempts
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return res.status(401).json({
          error: 'Invalid API key',
          errorCode: 'INVALID_API_KEY',
        });
      }

      return next();
    } catch (e) {
      logger.error('API key validation error', { error: e.message });
      return res
        .status(500)
        .json({ error: 'API key validation failed', errorCode: 'API_KEY_VALIDATION_ERROR' });
    }
  })();
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
    timestamp: new Date().toISOString(),
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    // Log response
    logger.info('Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id || null,
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
        userId: req.user?.id || null,
      });
    }

    originalSend.call(this, data);
  };

  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  const requestId = req.id || req.headers['x-request-id'] || undefined;

  // Log request
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId,
    });
  });

  next();
}

/**
 * Security headers middleware - alias for configureSecurityHeaders
 */
export const securityHeaders = configureSecurityHeaders;

export default {
  configureSecurityHeaders,
  configureCORS,
  sanitizeInput,
  validateApiKey,
  securityLogging,
  requestLogger,
  securityHeaders,
};
