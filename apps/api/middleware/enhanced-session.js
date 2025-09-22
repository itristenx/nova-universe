// Enhanced Session Security for Nova Universe API
// Implements secure session management with additional protection layers

import session from 'express-session';
import crypto from 'crypto';
import { logger } from '../logger.js';

/**
 * Session security configuration
 */
const SESSION_CONFIG = {
  name: process.env.SESSION_NAME || 'nova.session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  maxAge: parseInt(process.env.SESSION_MAX_AGE) || 4 * 60 * 60 * 1000, // 4 hours
  regenerateInterval: parseInt(process.env.SESSION_REGENERATE_INTERVAL) || 30 * 60 * 1000, // 30 minutes
  absoluteTimeout: parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT) || 8 * 60 * 60 * 1000, // 8 hours
};

/**
 * Enhanced session configuration with security features
 */
export function createSecureSessionConfig() {
  if (!SESSION_CONFIG.secret || SESSION_CONFIG.secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and be at least 32 characters long');
  }
  
  return session({
    name: SESSION_CONFIG.name,
    secret: SESSION_CONFIG.secret,
    resave: SESSION_CONFIG.resave,
    saveUninitialized: SESSION_CONFIG.saveUninitialized,
    rolling: SESSION_CONFIG.rolling,
    
    cookie: {
      // Security settings
      httpOnly: true, // Prevent XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: SESSION_CONFIG.maxAge,
      
      // Additional security
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: process.env.COOKIE_PATH || '/',
    },
    
    // Custom session store configuration would go here
    // store: new RedisStore({ ... }) // For production
    
    // Custom session ID generation
    genid: () => {
      return crypto.randomBytes(32).toString('hex');
    },
  });
}

/**
 * Session security middleware
 */
export function sessionSecurityMiddleware(req, res, next) {
  // Skip if no session
  if (!req.session) {
    return next();
  }
  
  const now = Date.now();
  
  // Initialize session security data
  if (!req.session.security) {
    req.session.security = {
      createdAt: now,
      lastActivity: now,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      regenerateAt: now + SESSION_CONFIG.regenerateInterval,
    };
  }
  
  // Check for session hijacking attempts
  const sessionSecurity = req.session.security;
  
  // IP address validation (optional - can be disabled for mobile users)
  if (process.env.STRICT_SESSION_IP === 'true' && 
      sessionSecurity.ipAddress && 
      sessionSecurity.ipAddress !== req.ip) {
    
    logger.warn('Session IP address mismatch detected', {
      sessionId: req.sessionID,
      originalIP: sessionSecurity.ipAddress,
      currentIP: req.ip,
      userId: req.session.userId
    });
    
    // Destroy suspicious session
    req.session.destroy((err) => {
      if (err) {
        logger.error('Failed to destroy suspicious session:', err);
      }
    });
    
    return res.status(401).json({
      success: false,
      error: 'Session security violation',
      errorCode: 'SESSION_SECURITY_VIOLATION'
    });
  }
  
  // User agent validation (detect major changes)
  if (sessionSecurity.userAgent && 
      !isSimilarUserAgent(sessionSecurity.userAgent, req.get('User-Agent'))) {
    
    logger.warn('Session user agent mismatch detected', {
      sessionId: req.sessionID,
      originalUA: sessionSecurity.userAgent?.substring(0, 100),
      currentUA: req.get('User-Agent')?.substring(0, 100),
      userId: req.session.userId
    });
    
    // For security, we'll log but not destroy (user agents can change)
    // Consider requiring re-authentication for sensitive operations
  }
  
  // Check absolute session timeout
  if (now - sessionSecurity.createdAt > SESSION_CONFIG.absoluteTimeout) {
    logger.info('Session absolute timeout reached', {
      sessionId: req.sessionID,
      createdAt: new Date(sessionSecurity.createdAt),
      userId: req.session.userId
    });
    
    req.session.destroy((err) => {
      if (err) {
        logger.error('Failed to destroy expired session:', err);
      }
    });
    
    return res.status(401).json({
      success: false,
      error: 'Session expired',
      errorCode: 'SESSION_EXPIRED'
    });
  }
  
  // Session regeneration for security
  if (now >= sessionSecurity.regenerateAt) {
    req.session.regenerate((err) => {
      if (err) {
        logger.error('Failed to regenerate session:', err);
        return next();
      }
      
      // Update security data
      req.session.security = {
        ...sessionSecurity,
        regenerateAt: now + SESSION_CONFIG.regenerateInterval,
        lastRegeneration: now,
      };
      
      logger.info('Session regenerated for security', {
        sessionId: req.sessionID,
        userId: req.session.userId
      });
      
      next();
    });
    return;
  }
  
  // Update last activity
  sessionSecurity.lastActivity = now;
  
  next();
}

/**
 * Check if user agents are similar (detect major changes)
 */
function isSimilarUserAgent(original, current) {
  if (!original || !current) {
    return false;
  }
  
  // Extract key components
  const extractKey = (ua) => {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
    return match ? match[0] : ua.substring(0, 50);
  };
  
  return extractKey(original) === extractKey(current);
}

/**
 * Session cleanup middleware for logout
 */
export function destroySession(req, res, _next) {
  if (req.session) {
    const userId = req.session.userId;
    
    req.session.destroy((err) => {
      if (err) {
        logger.error('Failed to destroy session on logout:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to logout properly'
        });
      }
      
      logger.info('Session destroyed on logout', { userId });
      
      // Clear session cookie
      res.clearCookie(SESSION_CONFIG.name);
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  } else {
    res.json({
      success: true,
      message: 'No active session'
    });
  }
}

/**
 * Get session information
 */
export function getSessionInfo(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'No active session'
    });
  }
  
  const security = req.session.security || {};
  
  res.json({
    success: true,
    session: {
      id: req.sessionID,
      userId: req.session.userId,
      createdAt: new Date(security.createdAt).toISOString(),
      lastActivity: new Date(security.lastActivity).toISOString(),
      expiresAt: new Date(security.lastActivity + SESSION_CONFIG.maxAge).toISOString(),
      absoluteTimeout: new Date(security.createdAt + SESSION_CONFIG.absoluteTimeout).toISOString(),
      ipAddress: security.ipAddress,
      isSecure: req.session.cookie?.secure || false,
    }
  });
}

/**
 * Force session regeneration (for sensitive operations)
 */
export function forceSessionRegeneration(req, res, next) {
  if (!req.session) {
    return next();
  }
  
  req.session.regenerate((err) => {
    if (err) {
      logger.error('Failed to force regenerate session:', err);
      return res.status(500).json({
        success: false,
        error: 'Session regeneration failed'
      });
    }
    
    // Update security data
    const now = Date.now();
    req.session.security = {
      ...req.session.security,
      regenerateAt: now + SESSION_CONFIG.regenerateInterval,
      lastRegeneration: now,
    };
    
    logger.info('Session force regenerated', {
      sessionId: req.sessionID,
      userId: req.session.userId
    });
    
    next();
  });
}

/**
 * Session validation middleware
 */
export function validateSession(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      errorCode: 'NO_SESSION'
    });
  }
  
  // Check if session is still valid
  const security = req.session.security;
  if (security) {
    const now = Date.now();
    
    // Check activity timeout
    if (now - security.lastActivity > SESSION_CONFIG.maxAge) {
      logger.info('Session activity timeout', {
        sessionId: req.sessionID,
        lastActivity: new Date(security.lastActivity),
        userId: req.session.userId
      });
      
      req.session.destroy(() => {});
      
      return res.status(401).json({
        success: false,
        error: 'Session expired due to inactivity',
        errorCode: 'SESSION_TIMEOUT'
      });
    }
  }
  
  next();
}

/**
 * Concurrent session limiter
 */
export function limitConcurrentSessions(maxSessions = 5) {
  return async (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return next();
    }
    
    const userId = req.session.userId;
    
    // This would require a session store that supports querying
    // For now, we'll just log the intent
    logger.info('Concurrent session check', {
      userId,
      maxSessions,
      currentSession: req.sessionID
    });
    
    // In production, implement actual session counting and cleanup
    next();
  };
}

export default {
  createSecureSessionConfig,
  sessionSecurityMiddleware,
  destroySession,
  getSessionInfo,
  forceSessionRegeneration,
  validateSession,
  limitConcurrentSessions,
  SESSION_CONFIG
};