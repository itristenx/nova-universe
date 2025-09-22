// middleware/auth.js
// Centralized authentication and authorization middleware for Nova Universe API
// Enhanced with comprehensive security features and integration

import jwt from 'jsonwebtoken';
import { logger } from '../logger.js';
import { verifyAccessToken } from './enhanced-jwt.js';
import { logSecurityEvent } from './security-monitoring.js';
import { recordFailedAttempt, clearFailedAttempts } from './account-lockout.js';
import { auditAuthentication } from './audit-logging.js';
import { monitorSecurityEvent } from './realtime-security-monitoring.js';

/**
 * Enhanced middleware to verify JWT and attach user info to req.user
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Log unauthorized access attempt
    const securityEvent = {
      eventType: 'UNAUTHORIZED_ACCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      resource: req.originalUrl,
      action: req.method,
      metadata: { result: 'missing_token' }
    };
    
    logSecurityEvent('UNAUTHORIZED_ACCESS', securityEvent);
    monitorSecurityEvent(securityEvent);
    
    auditAuthentication({
      eventType: 'AUTH_MISSING_TOKEN',
      level: 'WARN',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      resource: req.originalUrl,
      action: req.method,
      outcome: 'FAILURE',
      details: { reason: 'Missing or invalid Authorization header' }
    });

    return res.status(401).json({
      error: 'Missing or invalid Authorization header',
      errorCode: 'AUTH_HEADER_MISSING',
    });
  }

  const token = authHeader.split(' ')[1];

  // Basic token format validation
  if (!token || token.length < 10) {
    const securityEvent = {
      eventType: 'UNAUTHORIZED_ACCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      resource: req.originalUrl,
      action: req.method,
      metadata: { result: 'invalid_token_format' }
    };
    
    logSecurityEvent('UNAUTHORIZED_ACCESS', securityEvent);
    monitorSecurityEvent(securityEvent);
    
    auditAuthentication({
      eventType: 'AUTH_INVALID_TOKEN',
      level: 'WARN',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      resource: req.originalUrl,
      action: req.method,
      outcome: 'FAILURE',
      details: { reason: 'Invalid token format' }
    });

    return res.status(401).json({
      error: 'Invalid token format',
      errorCode: 'INVALID_TOKEN_FORMAT',
    });
  }

  try {
    // Use enhanced JWT verification
    const user = verifyAccessToken(token, {
      ipAddress: req.ip,
      verifyIpAddress: process.env.STRICT_IP_VERIFICATION === 'true'
    });

    if (!user || !user.id || !user.email) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        resource: req.originalUrl,
        action: req.method,
        result: 'invalid_token_payload'
      });

      return res.status(403).json({
        error: 'Invalid token payload',
        errorCode: 'INVALID_TOKEN_PAYLOAD',
      });
    }

    // Clear any failed attempts on successful authentication
    clearFailedAttempts(user.email);

    // Log successful authentication
    logSecurityEvent('LOGIN_SUCCESS', {
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      resource: req.originalUrl,
      action: req.method,
      result: 'success'
    });

    req.user = user;
    req.authToken = token; // Store token for potential blacklisting
    next();
  } catch (err) {
    // Record failed attempt if it looks like a real user trying to authenticate
    if (token.length > 20) {
      recordFailedAttempt(req.body.email || 'unknown', req.ip);
    }

    logger.warn('JWT verification failed', {
      error: err.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    logSecurityEvent('LOGIN_FAILURE', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      resource: req.originalUrl,
      action: req.method,
      result: err.name || 'verification_failed',
      metadata: { error: err.message }
    });

    let errorMessage = 'Invalid or expired token';
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    }

    return res.status(403).json({
      error: errorMessage,
      errorCode: 'INVALID_TOKEN',
    });
  }
}

/**
 * Middleware to require a specific role (e.g., 'admin', 'superadmin')
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        resource: req.originalUrl,
        action: req.method,
        result: 'no_user_context'
      });

      return res.status(401).json({
        error: 'Authentication required',
        errorCode: 'AUTH_REQUIRED',
      });
    }

    if (!req.user.roles || !Array.isArray(req.user.roles)) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', {
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        resource: req.originalUrl,
        action: req.method,
        result: 'invalid_role_data'
      });

      return res.status(403).json({
        error: 'Invalid user role data',
        errorCode: 'INVALID_ROLE_DATA',
      });
    }

    if (!req.user.roles.includes(role)) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        requiredRole: role,
        userRoles: req.user.roles,
        ip: req.ip,
      });

      logSecurityEvent('UNAUTHORIZED_ACCESS', {
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        resource: req.originalUrl,
        action: req.method,
        result: 'insufficient_role',
        metadata: {
          requiredRole: role,
          userRoles: req.user.roles
        }
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    // Log admin access for monitoring
    if (['admin', 'superadmin'].includes(role)) {
      logSecurityEvent('ADMIN_ACCESS', {
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        resource: req.originalUrl,
        action: req.method,
        result: 'success',
        metadata: { role }
      });
    }

    next();
  };
}

/**
 * Middleware to require any of the specified roles
 */
export function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        errorCode: 'AUTH_REQUIRED',
      });
    }

    if (!req.user.roles || !Array.isArray(req.user.roles)) {
      return res.status(403).json({
        error: 'Invalid user role data',
        errorCode: 'INVALID_ROLE_DATA',
      });
    }

    const hasRequiredRole = roles.some((role) => req.user.roles.includes(role));
    if (!hasRequiredRole) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        requiredRoles: roles,
        userRoles: req.user.roles,
        ip: req.ip,
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
}

/**
 * Helper to issue a JWT for a user object
 */
export function issueJWT(user) {
  // Validate input
  if (!user || !user.id || !user.email) {
    throw new Error('Invalid user object for JWT generation');
  }

  // Get JWT secret from environment
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  // You may want to include roles, permissions, etc. in the payload
  const payload = {
    id: user.id,
    email: user.email,
    roles: user.roles || [],
    iat: Math.floor(Date.now() / 1000), // issued at time
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: '12h',
    issuer: 'nova-universe-api',
    audience: 'nova-universe',
  });
}

/**
 * Middleware to require a specific permission
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        errorCode: 'AUTH_REQUIRED',
      });
    }

    if (!req.user.permissions || !Array.isArray(req.user.permissions)) {
      return res.status(403).json({
        error: 'Invalid user permission data',
        errorCode: 'INVALID_PERMISSION_DATA',
      });
    }

    if (!req.user.permissions.includes(permission) && !req.user.permissions.includes('*')) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        ip: req.ip,
      });

      return res.status(403).json({
        error: `Permission required: ${permission}`,
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
}

/**
 * Creates a rate limiter with custom configuration
 */
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const createRateLimit = (windowMs, max, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.user?.id || ipKeyGenerator(req);
    },
    handler: (req, res) => {
      logger.warn('Rate limit exceeded:', {
        userId: req.user?.id,
        ip: req.ip,
        endpoint: req.originalUrl,
        method: req.method,
      });

      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};
