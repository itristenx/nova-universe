// CSRF Protection Middleware for Nova Universe API
// Implements Cross-Site Request Forgery protection following OWASP guidelines

import crypto from 'crypto';
import { logger } from '../logger.js';

/**
 * CSRF protection configuration
 */
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'nova-csrf-token',
  headerName: 'x-csrf-token',
  sessionKey: 'csrfToken',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: false, // Must be false to allow JS access for reading
};

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCSRFToken() {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Set CSRF token in session and cookie
 */
function setCSRFToken(req, res) {
  const token = generateCSRFToken();
  
  // Store in session
  if (req.session) {
    req.session[CSRF_CONFIG.sessionKey] = token;
  }
  
  // Set cookie for client-side access
  res.cookie(CSRF_CONFIG.cookieName, token, {
    maxAge: CSRF_CONFIG.maxAge,
    sameSite: CSRF_CONFIG.sameSite,
    secure: CSRF_CONFIG.secure,
    httpOnly: CSRF_CONFIG.httpOnly,
  });
  
  return token;
}

/**
 * Get CSRF token from request
 */
function getCSRFTokenFromRequest(req) {
  // Check header first, then body, then query
  return req.headers[CSRF_CONFIG.headerName] ||
         req.body._csrf ||
         req.query._csrf;
}

/**
 * Validate CSRF token
 */
function validateCSRFToken(req, providedToken) {
  const sessionToken = req.session?.[CSRF_CONFIG.sessionKey];
  
  if (!sessionToken || !providedToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(sessionToken, 'hex'),
    Buffer.from(providedToken, 'hex')
  );
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(options = {}) {
  const config = { ...CSRF_CONFIG, ...options };
  
  return (req, res, next) => {
    // Skip CSRF for safe methods (GET, HEAD, OPTIONS)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      // Ensure token exists for safe methods
      if (!req.session?.[config.sessionKey]) {
        setCSRFToken(req, res);
      }
      return next();
    }
    
    // Skip CSRF for API endpoints with API key authentication
    if (req.headers['x-api-key']) {
      return next();
    }
    
    // Skip CSRF for WebSocket handshake
    if (req.headers.upgrade === 'websocket') {
      return next();
    }
    
    // Skip CSRF for certain content types (e.g., JSON API)
    const contentType = req.headers['content-type'];
    if (config.skipForContentTypes && config.skipForContentTypes.some(type => 
      contentType?.includes(type))) {
      return next();
    }
    
    const providedToken = getCSRFTokenFromRequest(req);
    
    if (!validateCSRFToken(req, providedToken)) {
      logger.warn('CSRF token validation failed', {
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl,
        providedToken: providedToken ? 'present' : 'missing',
        sessionToken: req.session?.[config.sessionKey] ? 'present' : 'missing'
      });
      
      return res.status(403).json({
        success: false,
        error: 'Invalid CSRF token',
        errorCode: 'CSRF_TOKEN_INVALID',
        message: 'Cross-site request forgery token is invalid or missing'
      });
    }
    
    next();
  };
}

/**
 * Middleware to generate and set CSRF token
 */
export function generateCSRFMiddleware(req, res, next) {
  if (!req.session?.[CSRF_CONFIG.sessionKey]) {
    setCSRFToken(req, res);
  }
  next();
}

/**
 * Route to get CSRF token
 */
export function getCSRFTokenRoute(req, res) {
  let token = req.session?.[CSRF_CONFIG.sessionKey];
  
  if (!token) {
    token = setCSRFToken(req, res);
  }
  
  res.json({
    success: true,
    csrfToken: token,
    expires: new Date(Date.now() + CSRF_CONFIG.maxAge).toISOString()
  });
}

/**
 * Conditional CSRF protection for mixed API/Web endpoints
 */
export function conditionalCSRFProtection(options = {}) {
  const protection = csrfProtection(options);
  
  return (req, res, next) => {
    // Skip CSRF for requests with Authorization header (JWT tokens)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return next();
    }
    
    // Skip for specific API routes
    if (req.originalUrl.startsWith('/api/') && !req.originalUrl.startsWith('/api/web/')) {
      return next();
    }
    
    // Apply CSRF protection for web requests
    return protection(req, res, next);
  };
}

/**
 * Double submit cookie pattern for stateless CSRF protection
 */
export function doubleSubmitCSRFProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const cookieToken = req.cookies[CSRF_CONFIG.cookieName];
  const headerToken = req.headers[CSRF_CONFIG.headerName];
  
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    logger.warn('Double submit CSRF validation failed', {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl,
      cookiePresent: !!cookieToken,
      headerPresent: !!headerToken,
      tokensMatch: cookieToken === headerToken
    });
    
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
      errorCode: 'CSRF_TOKEN_INVALID'
    });
  }
  
  next();
}

/**
 * Origin-based CSRF protection
 */
export function originCSRFProtection(allowedOrigins = []) {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    const origin = req.headers.origin || req.headers.referer;
    const host = req.headers.host;
    
    // Check if origin matches host or is in allowed origins
    if (origin && !allowedOrigins.includes(origin) && !origin.includes(host)) {
      logger.warn('Origin CSRF validation failed', {
        origin,
        host,
        allowedOrigins,
        userId: req.user?.id,
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        error: 'Invalid request origin',
        errorCode: 'INVALID_ORIGIN'
      });
    }
    
    next();
  };
}

export default {
  csrfProtection,
  generateCSRFMiddleware,
  getCSRFTokenRoute,
  conditionalCSRFProtection,
  doubleSubmitCSRFProtection,
  originCSRFProtection,
  CSRF_CONFIG
};