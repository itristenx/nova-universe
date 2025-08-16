// middleware/auth.js
// Centralized authentication and authorization middleware for Nova Universe API
import jwt from 'jsonwebtoken';
// import db from '../db.js'; // Currently unused but may be needed for future auth features
import { verify as verifyJwtToken } from '../jwt.js';
import { logger } from '../logger.js';

/**
 * Middleware to verify JWT and attach user info to req.user
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header',
      errorCode: 'AUTH_HEADER_MISSING',
    });
  }

  const token = authHeader.split(' ')[1];

  // Basic token format validation
  if (!token || token.length < 10) {
    return res.status(401).json({
      error: 'Invalid token format',
      errorCode: 'INVALID_TOKEN_FORMAT',
    });
  }

  try {
    const user = verifyJwtToken(token);
    if (!user || !user.id || !user.email) {
      return res.status(403).json({
        error: 'Invalid token payload',
        errorCode: 'INVALID_TOKEN_PAYLOAD',
      });
    }
    req.user = user;
    next();
  } catch (err) {
    logger.warn('JWT verification failed', {
      error: err.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    return res.status(403).json({
      error: 'Invalid or expired token',
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

    if (!req.user.roles.includes(role)) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        requiredRole: role,
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
