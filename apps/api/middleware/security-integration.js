// Comprehensive Security Integration for Nova Universe API
// Integrates all security middleware components with centralized configuration

import { logger } from '../logger.js';

// Import all security middleware
import passwordPolicyMiddleware from './password-policy.js';
import csrfProtection from './csrf-protection.js';
import enhancedJWT from './enhanced-jwt.js';
import accountLockout from './account-lockout.js';
import securityMonitoring from './security-monitoring.js';
import enhancedSession from './enhanced-session.js';
import enhancedRateLimit from './enhanced-rate-limiting.js';
import apiKeyManagement from './api-key-management.js';
import passwordBreachDetection from './password-breach-detection.js';
import intrusionDetection from './intrusion-detection.js';
import auditLogging from './audit-logging.js';
import realtimeMonitoring from './realtime-security-monitoring.js';
import { configureSecurityHeaders, sanitizeInput } from './security.js';

/**
 * Comprehensive security configuration
 */
export const SECURITY_CONFIG = {
  // Feature toggles
  features: {
    passwordPolicy: true,
    csrfProtection: true,
    enhancedJWT: true,
    accountLockout: true,
    securityMonitoring: true,
    enhancedSession: true,
    rateLimit: true,
    apiKeyManagement: true,
    passwordBreachDetection: true,
    intrusionDetection: true,
    auditLogging: true,
    realtimeMonitoring: true,
  },
  
  // Environment-specific settings
  environment: process.env.NODE_ENV || 'development',
  
  // Security levels
  securityLevel: process.env.SECURITY_LEVEL || 'high', // low, medium, high, paranoid
  
  // Database initialization settings
  initializeDatabase: true,
  
  // Monitoring settings
  enableRealTimeMonitoring: true,
  enableWebSocketMonitoring: true,
  
  // Compliance settings
  compliance: {
    gdpr: true,
    hipaa: false,
    sox: false,
    pci: false,
  },
};

/**
 * Initialize security database schemas
 */
export async function initializeSecurityDatabase(db) {
  try {
    logger.info('Initializing security database schemas...');
    
    // Initialize all security-related database schemas
    if (SECURITY_CONFIG.features.securityMonitoring) {
      await securityMonitoring.initializeSchema(db);
    }
    
    if (SECURITY_CONFIG.features.enhancedJWT) {
      await enhancedJWT.initializeSchema(db);
    }
    
    if (SECURITY_CONFIG.features.accountLockout) {
      await accountLockout.initializeSchema(db);
    }
    
    if (SECURITY_CONFIG.features.apiKeyManagement) {
      await apiKeyManagement.initializeApiKeySchema(db);
    }
    
    if (SECURITY_CONFIG.features.auditLogging) {
      await auditLogging.initializeAuditSchema(db);
    }
    
    logger.info('Security database schemas initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize security database schemas', { error: error.message });
    throw error;
  }
}

/**
 * Configure security middleware stack based on security level
 */
export function getSecurityMiddlewareStack(options = {}) {
  const {
    securityLevel = SECURITY_CONFIG.securityLevel,
    skipRateLimit = false,
  } = options;
  
  const middleware = [];
  
  // Basic security headers (always enabled)
  middleware.push(configureSecurityHeaders());
  
  // Input sanitization (always enabled)
  middleware.push(sanitizeInput());
  
  // Audit logging (if enabled)
  if (SECURITY_CONFIG.features.auditLogging) {
    middleware.push(auditLogging.auditMiddleware({
      includeRequestBody: securityLevel === 'paranoid',
      includeResponseBody: false,
    }));
  }
  
  // Intrusion detection (high security and above)
  if (SECURITY_CONFIG.features.intrusionDetection && ['high', 'paranoid'].includes(securityLevel)) {
    middleware.push(intrusionDetection.intrusionDetectionMiddleware());
  }
  
  // Rate limiting (if not skipped)
  if (SECURITY_CONFIG.features.rateLimit && !skipRateLimit) {
    const rateLimitConfig = {
      low: { windowMs: 15 * 60 * 1000, max: 500 },
      medium: { windowMs: 15 * 60 * 1000, max: 300 },
      high: { windowMs: 15 * 60 * 1000, max: 200 },
      paranoid: { windowMs: 10 * 60 * 1000, max: 100 },
    };
    
    middleware.push(enhancedRateLimit.createAdaptiveRateLimit(rateLimitConfig[securityLevel]));
  }
  
  // Session security (if sessions are used)
  if (SECURITY_CONFIG.features.enhancedSession) {
    middleware.push(enhancedSession.sessionSecurityMiddleware());
  }
  
  // CSRF protection (medium security and above)
  if (SECURITY_CONFIG.features.csrfProtection && ['medium', 'high', 'paranoid'].includes(securityLevel)) {
    middleware.push(csrfProtection.csrfProtection());
  }
  
  return middleware;
}

/**
 * Configure authentication middleware
 */
export function getAuthenticationMiddleware(options = {}) {
  const {
    requireJWT = true,
    requireApiKey = false,
    allowBoth = false,
    requiredScope = 'read',
  } = options;
  
  const middleware = [];
  
  if (allowBoth) {
    // Allow either JWT or API key
    middleware.push((req, res, next) => {
      const hasJWT = req.headers.authorization?.startsWith('Bearer ');
      const hasApiKey = req.headers['x-api-key'] || req.query.api_key;
      
      if (hasApiKey) {
        return apiKeyManagement.authenticateApiKey(requiredScope)(req, res, next);
      } else if (hasJWT) {
        return enhancedJWT.authenticateJWT(req, res, next);
      } else {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          errorCode: 'AUTH_REQUIRED'
        });
      }
    });
  } else if (requireApiKey) {
    middleware.push(apiKeyManagement.authenticateApiKey(requiredScope));
  } else if (requireJWT) {
    middleware.push(enhancedJWT.authenticateJWT);
  }
  
  return middleware;
}

/**
 * Configure endpoint-specific security
 */
export function getEndpointSecurity(endpoint) {
  const middleware = [];
  
  // Endpoint-specific rate limiting
  const endpointLimits = {
    '/api/auth/login': enhancedRateLimit.authRateLimit,
    '/api/auth/register': enhancedRateLimit.registerRateLimit,
    '/api/auth/password-reset': enhancedRateLimit.passwordResetRateLimit,
    '/api/auth/verify-email': enhancedRateLimit.emailVerifyRateLimit,
    '/api/upload': enhancedRateLimit.uploadRateLimit,
    '/api/search': enhancedRateLimit.searchRateLimit,
  };
  
  if (endpointLimits[endpoint]) {
    middleware.push(endpointLimits[endpoint]);
  }
  
  // Password breach detection for password-related endpoints
  if (endpoint.includes('password') || endpoint.includes('register')) {
    if (SECURITY_CONFIG.features.passwordBreachDetection) {
      middleware.push(passwordBreachDetection.validatePasswordBreach({
        blockBreached: SECURITY_CONFIG.securityLevel === 'paranoid',
        warnOnly: SECURITY_CONFIG.securityLevel !== 'paranoid',
      }));
    }
  }
  
  // Account lockout for authentication endpoints
  if (endpoint.includes('/auth/login')) {
    if (SECURITY_CONFIG.features.accountLockout) {
      middleware.push(accountLockout.checkAccountLockout());
    }
  }
  
  return middleware;
}

/**
 * Initialize comprehensive security system
 */
export async function initializeSecurity(app, server, db) {
  try {
    logger.info('Initializing comprehensive security system...', {
      securityLevel: SECURITY_CONFIG.securityLevel,
      environment: SECURITY_CONFIG.environment,
    });
    
    // Store database reference globally for middleware access
    global.db = db;
    app.use((req, res, next) => {
      req.db = db;
      next();
    });
    
    // Initialize database schemas
    if (SECURITY_CONFIG.initializeDatabase) {
      await initializeSecurityDatabase(db);
    }
    
    // Initialize real-time monitoring
    if (SECURITY_CONFIG.features.realtimeMonitoring && SECURITY_CONFIG.enableRealTimeMonitoring) {
      realtimeMonitoring.initializeSecurityMonitoring(server);
    }
    
    // Set up global error handling for security events
    process.on('uncaughtException', async (error) => {
      logger.error('Uncaught exception in security system', { error: error.message, stack: error.stack });
      
      if (SECURITY_CONFIG.features.securityMonitoring) {
        await securityMonitoring.logSecurityEvent('SYSTEM_ERROR', {
          resource: 'security_system',
          metadata: { 
            error: error.message, 
            stack: error.stack,
            type: 'uncaught_exception'
          }
        });
      }
    });
    
    process.on('unhandledRejection', async (reason, promise) => {
      logger.error('Unhandled promise rejection in security system', { reason, promise });
      
      if (SECURITY_CONFIG.features.securityMonitoring) {
        await securityMonitoring.logSecurityEvent('SYSTEM_ERROR', {
          resource: 'security_system',
          metadata: { 
            reason: String(reason),
            type: 'unhandled_rejection'
          }
        });
      }
    });
    
    // Set up periodic cleanup tasks
    if (SECURITY_CONFIG.features.apiKeyManagement) {
      setInterval(async () => {
        try {
          await apiKeyManagement.cleanupExpiredApiKeys(db);
        } catch (error) {
          logger.error('Failed to cleanup expired API keys', { error: error.message });
        }
      }, 24 * 60 * 60 * 1000); // Daily cleanup
    }
    
    logger.info('Comprehensive security system initialized successfully');
    
    return {
      securityLevel: SECURITY_CONFIG.securityLevel,
      featuresEnabled: Object.entries(SECURITY_CONFIG.features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature),
      middleware: {
        getSecurityStack: getSecurityMiddlewareStack,
        getAuthentication: getAuthenticationMiddleware,
        getEndpointSecurity: getEndpointSecurity,
      },
    };
    
  } catch (error) {
    logger.error('Failed to initialize security system', { error: error.message });
    throw error;
  }
}

/**
 * Get security status and statistics
 */
export function getSecurityStatus() {
  const status = {
    timestamp: new Date().toISOString(),
    securityLevel: SECURITY_CONFIG.securityLevel,
    environment: SECURITY_CONFIG.environment,
    features: SECURITY_CONFIG.features,
    statistics: {},
  };
  
  // Gather statistics from various security components
  if (SECURITY_CONFIG.features.realtimeMonitoring) {
    status.statistics.monitoring = realtimeMonitoring.getMonitoringStatistics();
  }
  
  if (SECURITY_CONFIG.features.intrusionDetection) {
    status.statistics.threats = intrusionDetection.getThreatIntelligence();
  }
  
  return status;
}

/**
 * Security health check
 */
export async function performSecurityHealthCheck(db) {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {},
    issues: [],
  };
  
  try {
    // Database connectivity check
    try {
      await new Promise((resolve, reject) => {
        db.get('SELECT 1', [], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      healthCheck.checks.database = 'healthy';
    } catch {
      healthCheck.checks.database = 'unhealthy';
      healthCheck.issues.push('Database connectivity issue');
      healthCheck.status = 'degraded';
    }
    
    // Security monitoring check
    if (SECURITY_CONFIG.features.securityMonitoring) {
      try {
        const eventCount = await securityMonitoring.getEventCount('1 hour');
        healthCheck.checks.securityMonitoring = 'healthy';
        healthCheck.checks.recentEvents = eventCount;
      } catch {
        healthCheck.checks.securityMonitoring = 'unhealthy';
        healthCheck.issues.push('Security monitoring issue');
        healthCheck.status = 'degraded';
      }
    }
    
    // Real-time monitoring check
    if (SECURITY_CONFIG.features.realtimeMonitoring) {
      const stats = realtimeMonitoring.getMonitoringStatistics();
      healthCheck.checks.realtimeMonitoring = stats.connectedClients >= 0 ? 'healthy' : 'unhealthy';
      healthCheck.checks.connectedClients = stats.connectedClients;
    }
    
    // If any critical issues, mark as unhealthy
    if (healthCheck.issues.length > 2) {
      healthCheck.status = 'unhealthy';
    }
    
    return healthCheck;
    
  } catch (error) {
    logger.error('Security health check failed', { error: error.message });
    
    return {
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error.message,
      checks: {},
      issues: ['Health check execution failed'],
    };
  }
}

/**
 * Export security components for individual use
 */
export const securityComponents = {
  passwordPolicy: passwordPolicyMiddleware,
  csrfProtection,
  enhancedJWT,
  accountLockout,
  securityMonitoring,
  enhancedSession,
  enhancedRateLimit,
  apiKeyManagement,
  passwordBreachDetection,
  intrusionDetection,
  auditLogging,
  realtimeMonitoring,
};

export default {
  SECURITY_CONFIG,
  initializeSecurity,
  getSecurityMiddlewareStack,
  getAuthenticationMiddleware,
  getEndpointSecurity,
  getSecurityStatus,
  performSecurityHealthCheck,
  securityComponents,
};