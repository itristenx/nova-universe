
import helmet from 'helmet';
import { logger } from '../logger.js';

/**
 * Security middleware using helmet and custom headers.
 * @type {import('express').RequestHandler}
 */
export const securityHeaders = [
  helmet(),
  (req, res, next) => {
    // Additional custom headers
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Content Security Policy
    const isDevelopment = process.env.NODE_ENV === 'development';
    const csp = [
      "default-src 'self'",
      isDevelopment ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    next();
  }
];

/**
 * Request logging middleware using centralized logger.
 * @type {import('express').RequestHandler}
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };
    if (res.statusCode >= 400) {
      logger.error(`HTTP ${res.statusCode} ${req.method} ${req.url} - ${duration}ms - ${logData.ip}`);
    } else {
      logger.info(`${req.method} ${req.url} - ${duration}ms - ${logData.ip}`);
    }
    return originalSend.call(this, data);
  };
  next();
};

// Security logging middleware
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'unknown'
    };
    
    // Log security-relevant events
    if (res.statusCode >= 400) {
      console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);
    }
    
    // Log suspicious patterns
    if (req.url.includes('../') || req.url.includes('..\\')) {
      console.log(`[SECURITY] Path traversal attempt: ${JSON.stringify(logEntry)}`);
    }
    
    if (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',').length > 3) {
      console.log(`[SECURITY] Suspicious proxy chain: ${JSON.stringify(logEntry)}`);
    }
  });
  
  next();
};
