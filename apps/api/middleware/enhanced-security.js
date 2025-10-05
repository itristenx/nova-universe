/**
 * Enhanced Security Middleware
 * Provides comprehensive security controls for API endpoints
 */

import { logger } from '../logger.js';

/**
 * Ensure user is authenticated
 * Returns 401 if no valid authentication token
 */
export const ensureAuthenticated = (req, res, next) => {
  if (!req.user && !req.isAuthenticated()) {
    logger.warn('Unauthorized access attempt', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
  }
  
  next();
};

/**
 * Require specific permission
 * @param {string} permission - Permission required (e.g., 'tickets.delete', 'admin.config')
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    // Check if user has the required permission
    const hasPermission = await checkUserPermission(req.user.id, permission);
    
    if (!hasPermission) {
      logger.warn('Permission denied', {
        userId: req.user.id,
        permission,
        path: req.path,
        method: req.method,
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `You do not have permission to ${permission}`,
      });
    }
    
    next();
  };
};

/**
 * Require specific role
 * @param {string|string[]} roles - Required role(s) (e.g., 'admin', ['admin', 'tech_lead'])
 */
export const requireRole = (roles) => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    // Get user roles
    const userRoles = await getUserRoles(req.user.id);
    
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      logger.warn('Role requirement not met', {
        userId: req.user.id,
        requiredRoles,
        userRoles,
        path: req.path,
        method: req.method,
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This resource requires one of the following roles: ${requiredRoles.join(', ')}`,
      });
    }
    
    next();
  };
};

/**
 * Ensure user owns the resource or has admin permissions
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from request
 */
export const ensureOwnershipOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    const resourceOwnerId = await getResourceOwnerId(req);
    const isOwner = resourceOwnerId === req.user.id;
    const isAdmin = await checkUserRole(req.user.id, 'admin');
    
    if (!isOwner && !isAdmin) {
      logger.warn('Ownership/admin requirement not met', {
        userId: req.user.id,
        resourceOwnerId,
        path: req.path,
        method: req.method,
      });
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources',
      });
    }
    
    next();
  };
};

/**
 * Validate request body against schema
 * @param {Object} schema - Validation schema
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn('Request validation failed', {
        path: req.path,
        errors: error.details.map(d => d.message),
      });
      
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Audit log middleware for sensitive operations
 * @param {string} action - Action being performed (e.g., 'config.update', 'user.delete')
 */
export const auditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Track response
    let responseData = null;
    let statusCode = 200;
    
    res.send = function(data) {
      responseData = data;
      statusCode = res.statusCode;
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      responseData = data;
      statusCode = res.statusCode;
      return originalJson.call(this, data);
    };
    
    // Log after response
    res.on('finish', () => {
      logger.info('Audit log', {
        action,
        userId: req.user?.id,
        userEmail: req.user?.email,
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: sanitizeForAudit(req.body),
        statusCode,
        success: statusCode >= 200 && statusCode < 300,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    });
    
    next();
  };
};

/**
 * Deprecation warning middleware
 * @param {string} replacement - Suggested replacement endpoint
 * @param {string} sunsetDate - Date when endpoint will be removed (ISO string)
 */
export const deprecationWarning = (replacement, sunsetDate = null) => {
  return (req, res, next) => {
    res.set('X-API-Deprecated', 'true');
    res.set('X-API-Replacement', replacement);
    
    if (sunsetDate) {
      res.set('X-API-Sunset', sunsetDate);
    }
    
    logger.warn('Deprecated endpoint accessed', {
      path: req.path,
      replacement,
      sunsetDate,
      userId: req.user?.id,
    });
    
    next();
  };
};

/**
 * Enhanced security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  });
  
  // Remove technology disclosure
  res.removeHeader('X-Powered-By');
  
  next();
};

// Helper functions (these should be implemented based on your auth system)

async function checkUserPermission(userId, permission) {
  // TODO: Implement permission check against database
  // This is a placeholder - should check user_permissions table
  return false;
}

async function getUserRoles(userId) {
  // TODO: Implement role retrieval from database
  // This is a placeholder - should query user_roles table
  return [];
}

async function checkUserRole(userId, role) {
  // TODO: Implement role check against database
  const roles = await getUserRoles(userId);
  return roles.includes(role);
}

function sanitizeForAudit(data) {
  if (!data) return data;
  
  const sanitized = { ...data };
  
  // Remove sensitive fields from audit logs
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

export default {
  ensureAuthenticated,
  requirePermission,
  requireRole,
  ensureOwnershipOrAdmin,
  validateBody,
  auditLog,
  deprecationWarning,
  securityHeaders,
};
