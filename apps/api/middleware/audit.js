// Authentication audit logging for Nova Universe
// Implements comprehensive logging for security events and compliance

import db from '../db.js';
import { logger } from '../logger.js';

/**
 * Original audit middleware for general route tracking
 */
export function audit(actionKey) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || 'anonymous';
      const details = {
        path: req.originalUrl,
        method: req.method,
        params: req.params,
        query: req.query,
        // Avoid storing secrets; shallow copy body with redactions
        body: redactBody(req.body),
        ip_address: req.ip,
        user_agent: req.get('User-Agent') || null,
      };
      // Fire and forget
      db.createAuditLog(actionKey, userId, details).catch((err) => {
        logger.warn('Audit log failed', { actionKey, error: err?.message });
      });
    } catch (err) {
      logger.warn('Audit middleware error', { actionKey, error: err?.message });
    } finally {
      next();
    }
  };
}

/**
 * Helper to programmatically create audit entries.
 */
export async function logAudit(actionKey, user, details = {}) {
  try {
    const userId = user?.id || 'anonymous';
    await db.createAuditLog(actionKey, userId, details);
  } catch (err) {
    logger.warn('logAudit failed', { actionKey, error: err?.message });
  }
}

function redactBody(body) {
  if (!body || typeof body !== 'object') return body;
  try {
    const clone = JSON.parse(JSON.stringify(body));
    const redactKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    for (const key of redactKeys) {
      if (clone[key]) clone[key] = '[REDACTED]';
    }
    return clone;
  } catch (err) {
    return body;
  }
}

/**
 * Authentication event types for enhanced audit logging
 */
export const AUTH_EVENT_TYPES = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  
  // Registration events
  USER_REGISTRATION: 'USER_REGISTRATION',
  REGISTRATION_FAILURE: 'REGISTRATION_FAILURE',
  
  // Password events
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILURE: 'PASSWORD_RESET_FAILURE',
  
  // Token events
  TOKEN_GENERATED: 'TOKEN_GENERATED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_VALIDATION_FAILED: 'TOKEN_VALIDATION_FAILED',
  
  // SAML events
  SAML_LOGIN_SUCCESS: 'SAML_LOGIN_SUCCESS',
  SAML_LOGIN_FAILURE: 'SAML_LOGIN_FAILURE',
  SAML_LOGOUT: 'SAML_LOGOUT',
  
  // Security events
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  BRUTE_FORCE_DETECTED: 'BRUTE_FORCE_DETECTED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  IP_BLOCKED: 'IP_BLOCKED',
  
  // Permission events
  AUTHORIZATION_FAILURE: 'AUTHORIZATION_FAILURE',
  PRIVILEGE_ESCALATION_ATTEMPT: 'PRIVILEGE_ESCALATION_ATTEMPT',
  
  // MFA events
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',
  MFA_SUCCESS: 'MFA_SUCCESS',
  MFA_FAILURE: 'MFA_FAILURE',
};

/**
 * Log authentication event with comprehensive tracking
 */
export async function logAuthEvent(eventType, eventData = {}) {
  const timestamp = new Date().toISOString();
  
  // Prepare audit log entry
  const auditEntry = {
    eventType,
    timestamp,
    userId: eventData.userId || null,
    email: eventData.email || null,
    ipAddress: eventData.ip || eventData.ipAddress || null,
    userAgent: eventData.userAgent || null,
    sessionId: eventData.sessionId || null,
    success: eventData.success !== false, // Default to true unless explicitly false
    details: {
      ...eventData,
      // Remove sensitive data from details
      password: undefined,
      token: eventData.token ? eventData.token.substring(0, 20) + '...' : undefined,
    },
    severity: getSeverityLevel(eventType),
    source: 'nova-universe-api',
  };

  // Log to application logger with appropriate level
  const logLevel = getLogLevel(eventType);
  logger[logLevel](`Auth Event: ${eventType}`, auditEntry);

  // Store in database audit log (if available)
  try {
    await storeAuditEvent(auditEntry);
  } catch (dbError) {
    logger.error('Failed to store audit event in database', {
      error: dbError.message,
      eventType,
      timestamp,
    });
  }
}

/**
 * Store audit event in database
 */
async function storeAuditEvent(auditEntry) {
  try {
    // Use existing audit system format for compatibility
    await db.createAuditLog(
      auditEntry.eventType,
      auditEntry.userId || 'anonymous',
      {
        event_type: auditEntry.eventType,
        email: auditEntry.email,
        ip_address: auditEntry.ipAddress,
        user_agent: auditEntry.userAgent,
        success: auditEntry.success,
        severity: auditEntry.severity,
        details: auditEntry.details,
        timestamp: auditEntry.timestamp,
      }
    );
  } catch (error) {
    // If audit system fails, log to application logger only
    logger.info('Audit event (DB unavailable)', auditEntry);
    throw error;
  }
}

/**
 * Get severity level for event type
 */
function getSeverityLevel(eventType) {
  const severityMap = {
    // Critical events
    [AUTH_EVENT_TYPES.BRUTE_FORCE_DETECTED]: 'CRITICAL',
    [AUTH_EVENT_TYPES.PRIVILEGE_ESCALATION_ATTEMPT]: 'CRITICAL',
    [AUTH_EVENT_TYPES.IP_BLOCKED]: 'CRITICAL',
    
    // High severity events
    [AUTH_EVENT_TYPES.LOGIN_FAILURE]: 'HIGH',
    [AUTH_EVENT_TYPES.ACCOUNT_LOCKED]: 'HIGH',
    [AUTH_EVENT_TYPES.SAML_LOGIN_FAILURE]: 'HIGH',
    [AUTH_EVENT_TYPES.TOKEN_VALIDATION_FAILED]: 'HIGH',
    [AUTH_EVENT_TYPES.AUTHORIZATION_FAILURE]: 'HIGH',
    [AUTH_EVENT_TYPES.SUSPICIOUS_ACTIVITY]: 'HIGH',
    [AUTH_EVENT_TYPES.MFA_FAILURE]: 'HIGH',
    
    // Medium severity events
    [AUTH_EVENT_TYPES.RATE_LIMIT_EXCEEDED]: 'MEDIUM',
    [AUTH_EVENT_TYPES.PASSWORD_RESET_FAILURE]: 'MEDIUM',
    [AUTH_EVENT_TYPES.REGISTRATION_FAILURE]: 'MEDIUM',
    
    // Low severity events (normal operations)
    [AUTH_EVENT_TYPES.LOGIN_SUCCESS]: 'LOW',
    [AUTH_EVENT_TYPES.LOGOUT]: 'LOW',
    [AUTH_EVENT_TYPES.PASSWORD_CHANGE]: 'LOW',
    [AUTH_EVENT_TYPES.SAML_LOGIN_SUCCESS]: 'LOW',
    [AUTH_EVENT_TYPES.TOKEN_GENERATED]: 'LOW',
    [AUTH_EVENT_TYPES.USER_REGISTRATION]: 'LOW',
  };

  return severityMap[eventType] || 'MEDIUM';
}

/**
 * Get log level for event type
 */
function getLogLevel(eventType) {
  const severity = getSeverityLevel(eventType);
  
  switch (severity) {
    case 'CRITICAL':
      return 'error';
    case 'HIGH':
      return 'warn';
    case 'MEDIUM':
      return 'info';
    case 'LOW':
    default:
      return 'info';
  }
}

/**
 * Helper functions for common authentication events
 */
export const authAudit = {
  loginSuccess: (userId, email, ip, userAgent) => {
    return logAuthEvent(AUTH_EVENT_TYPES.LOGIN_SUCCESS, {
      userId, email, ip, userAgent, success: true,
    });
  },

  loginFailure: (email, ip, userAgent, reason) => {
    return logAuthEvent(AUTH_EVENT_TYPES.LOGIN_FAILURE, {
      email, ip, userAgent, reason, success: false,
    });
  },

  logout: (userId, email, ip, userAgent) => {
    return logAuthEvent(AUTH_EVENT_TYPES.LOGOUT, {
      userId, email, ip, userAgent, success: true,
    });
  },

  registration: (userId, email, ip, userAgent) => {
    return logAuthEvent(AUTH_EVENT_TYPES.USER_REGISTRATION, {
      userId, email, ip, userAgent, success: true,
    });
  },

  passwordChange: (userId, email, ip, userAgent) => {
    return logAuthEvent(AUTH_EVENT_TYPES.PASSWORD_CHANGE, {
      userId, email, ip, userAgent, success: true,
    });
  },

  passwordResetRequest: (email, ip, userAgent) => {
    return logAuthEvent(AUTH_EVENT_TYPES.PASSWORD_RESET_REQUEST, {
      email, ip, userAgent, success: true,
    });
  },

  tokenRevoked: (userId, email, tokenId, ip, userAgent) => {
    return logAuthEvent(AUTH_EVENT_TYPES.TOKEN_REVOKED, {
      userId, email, tokenId, ip, userAgent, success: true,
    });
  },

  bruteForceDetected: (email, ip, userAgent, attemptCount) => {
    return logAuthEvent(AUTH_EVENT_TYPES.BRUTE_FORCE_DETECTED, {
      email, ip, userAgent, attemptCount, success: false,
    });
  },

  rateLimitExceeded: (ip, userAgent, endpoint, limit) => {
    return logAuthEvent(AUTH_EVENT_TYPES.RATE_LIMIT_EXCEEDED, {
      ip, userAgent, endpoint, limit, success: false,
    });
  },

  samlLoginSuccess: (userId, email, ip, userAgent, sessionIndex) => {
    return logAuthEvent(AUTH_EVENT_TYPES.SAML_LOGIN_SUCCESS, {
      userId, email, ip, userAgent, sessionIndex, success: true,
    });
  },

  samlLoginFailure: (email, ip, userAgent, reason) => {
    return logAuthEvent(AUTH_EVENT_TYPES.SAML_LOGIN_FAILURE, {
      email, ip, userAgent, reason, success: false,
    });
  },

  authorizationFailure: (userId, email, ip, userAgent, resource, action) => {
    return logAuthEvent(AUTH_EVENT_TYPES.AUTHORIZATION_FAILURE, {
      userId, email, ip, userAgent, resource, action, success: false,
    });
  },
};
    for (const key of Object.keys(clone)) {
      if (redactKeys.includes(key.toLowerCase())) {
        clone[key] = '[REDACTED]';
      }
    }
    return clone;
  } catch {
    return undefined;
  }
}
