// Security middleware for Nova Universe API
// Implements comprehensive security headers and protection measures

import helmet from 'helmet';
import cors from 'cors';
import { logger } from '../logger.js';
import ConfigurationManager from '../config/app-settings.js';

// Import logSecurityEvent for SQL injection detection
let logSecurityEvent;
try {
  const securityMonitoring = await import('./security-monitoring.js');
  logSecurityEvent = securityMonitoring.logSecurityEvent;
} catch (error) {
  logger.warn('Security monitoring not available:', error.message);
}

/**
 * Configure comprehensive security headers using Helmet
 */
export function configureSecurityHeaders() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return helmet({
    // Content Security Policy - Enhanced for security
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        
        // Script sources - be very restrictive
        scriptSrc: [
          "'self'",
          // Only allow inline scripts with nonces in development
          ...(isDevelopment ? ["'unsafe-inline'"] : []),
          // Trusted CDNs
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net',
        ],
        
        // Style sources
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Needed for some UI frameworks
          'https://fonts.googleapis.com',
          'https://cdnjs.cloudflare.com',
        ],
        
        // Font sources
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'data:',
        ],
        
        // Image sources
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https:',
          // Allow images from trusted sources
          'https://images.unsplash.com',
          'https://via.placeholder.com',
        ],
        
        // Connection sources for API calls
        connectSrc: [
          "'self'",
          'https://api.github.com', // If using GitHub integration
          'wss:',
          'ws:',
        ],
        
        // Media sources
        mediaSrc: ["'self'", 'blob:', 'data:'],
        
        // Object and embed sources - disabled for security
        objectSrc: ["'none'"],
        embedSrc: ["'none'"],
        
        // Frame sources - very restrictive
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        
        // Worker sources
        workerSrc: ["'self'", 'blob:'],
        childSrc: ["'self'"],
        
        // Form actions - only allow self
        formAction: ["'self'"],
        
        // Base URI
        baseUri: ["'self'"],
        
        // Manifest source
        manifestSrc: ["'self'"],
        
        // Upgrade insecure requests in production
        ...(process.env.NODE_ENV === 'production' && {
          upgradeInsecureRequests: [],
        }),
      },
      
      // Report only mode for development
      reportOnly: isDevelopment,
    },

    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Disable for API compatibility

    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: { policy: 'same-origin' },

    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // DNS Prefetch Control - disable for privacy
    dnsPrefetchControl: { allow: false },

    // Frame Options - deny all framing
    frameguard: { action: 'deny' },

    // Hide Powered-By header
    hidePoweredBy: true,

    // HTTP Strict Transport Security - Enhanced
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // IE No Open
    ieNoOpen: true,

    // MIME Type sniffing prevention
    noSniff: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // Referrer Policy - Enhanced privacy
    referrerPolicy: { 
      policy: ['no-referrer', 'same-origin'] 
    },

    // X-XSS-Protection
    xssFilter: true,

    // Permissions Policy (formerly Feature Policy) - Enhanced
    permissionsPolicy: {
      accelerometer: [],
      'ambient-light-sensor': [],
      autoplay: [],
      battery: [],
      camera: [],
      'cross-origin-isolated': [],
      'display-capture': [],
      'document-domain': [],
      'encrypted-media': [],
      'execution-while-not-rendered': [],
      'execution-while-out-of-viewport': [],
      fullscreen: [],
      geolocation: [],
      gyroscope: [],
      'keyboard-map': [],
      magnetometer: [],
      microphone: [],
      midi: [],
      'navigation-override': [],
      payment: [],
      'picture-in-picture': [],
      'publickey-credentials-get': [],
      'screen-wake-lock': [],
      'sync-xhr': [],
      usb: [],
      'web-share': [],
      'xr-spatial-tracking': [],
    },

    // Disable X-Permitted-Cross-Domain-Policies
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
 * Input sanitization middleware with XSS protection
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

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    // Check for potential SQL injection attempts
    const sqlInjectionPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(or\s+1\s*=\s*1|and\s+1\s*=\s*1)/gi,
      /(--|#|\/\*|\*\/)/g,
      /(\bor\b|\band\b).*(\b=\b)/gi,
    ];

    const requestString = JSON.stringify({
      body: req.body,
      query: req.query,
      params: req.params
    });

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(requestString)) {
        logger.warn('Potential SQL injection attempt detected', {
          pattern: pattern.toString(),
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
          userId: req.user?.id
        });

        // Log security event
        if (typeof logSecurityEvent === 'function') {
          logSecurityEvent('SQL_INJECTION_ATTEMPT', {
            userId: req.user?.id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            resource: req.originalUrl,
            action: req.method,
            metadata: { pattern: pattern.toString() }
          });
        }

        return res.status(400).json({
          success: false,
          error: 'Invalid input detected',
          errorCode: 'SUSPICIOUS_INPUT'
        });
      }
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
 * Sanitize individual values with enhanced XSS protection
 */
function sanitizeValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  // Remove potential XSS vectors
  let sanitized = value
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\son\w+\s*=/gi, '')
    // Remove data URIs that could contain scripts
    .replace(/data:(?!image\/)[^;]*;base64/gi, '')
    // Remove potential HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove CDATA sections
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    // Remove potential CSS expressions
    .replace(/expression\s*\(/gi, '')
    // Remove eval and similar functions
    .replace(/\b(eval|setTimeout|setInterval)\s*\(/gi, '')
    // Remove potential CSS imports
    .replace(/@import/gi, '')
    // Remove vbscript: URLs
    .replace(/vbscript:/gi, '')
    // Remove potential XML processing instructions
    .replace(/<\?[\s\S]*?\?>/g, '');

  // Additional checks for common XSS patterns
  const xssPatterns = [
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /<input/gi,
    /<textarea/gi,
    /<select/gi,
    /<meta/gi,
    /<link/gi,
    /<style/gi,
    /alert\s*\(/gi,
    /confirm\s*\(/gi,
    /prompt\s*\(/gi,
  ];

  // Check for XSS patterns and log if found
  for (const pattern of xssPatterns) {
    if (pattern.test(sanitized)) {
      logger.warn('Potential XSS attempt detected and sanitized', {
        pattern: pattern.toString(),
        originalValue: value.substring(0, 100),
        sanitizedValue: sanitized.substring(0, 100)
      });
      
      // Log security event if available
      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('XSS_ATTEMPT', {
          metadata: { 
            pattern: pattern.toString(),
            originalLength: value.length,
            sanitizedLength: sanitized.length
          }
        });
      }
      
      // Remove the problematic content
      sanitized = sanitized.replace(pattern, '');
    }
  }

  // Encode remaining HTML entities for safety
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
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
