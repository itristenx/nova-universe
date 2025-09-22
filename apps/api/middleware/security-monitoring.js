// Security Event Logging and Monitoring for Nova Universe API
// Comprehensive security event tracking and alerting system

import { logger } from '../logger.js';
import db from '../db.js';
import crypto from 'crypto';

/**
 * Security event types and their severity levels
 */
export const SECURITY_EVENTS = {
  // Authentication Events
  LOGIN_SUCCESS: { type: 'LOGIN_SUCCESS', severity: 'info', category: 'auth' },
  LOGIN_FAILURE: { type: 'LOGIN_FAILURE', severity: 'warning', category: 'auth' },
  LOGIN_BLOCKED: { type: 'LOGIN_BLOCKED', severity: 'high', category: 'auth' },
  ACCOUNT_LOCKED: { type: 'ACCOUNT_LOCKED', severity: 'high', category: 'auth' },
  PASSWORD_CHANGED: { type: 'PASSWORD_CHANGED', severity: 'info', category: 'auth' },
  PASSWORD_RESET: { type: 'PASSWORD_RESET', severity: 'warning', category: 'auth' },
  MFA_ENABLED: { type: 'MFA_ENABLED', severity: 'info', category: 'auth' },
  MFA_DISABLED: { type: 'MFA_DISABLED', severity: 'warning', category: 'auth' },
  MFA_BYPASS_ATTEMPT: { type: 'MFA_BYPASS_ATTEMPT', severity: 'critical', category: 'auth' },
  
  // Session Events
  SESSION_CREATED: { type: 'SESSION_CREATED', severity: 'info', category: 'session' },
  SESSION_EXPIRED: { type: 'SESSION_EXPIRED', severity: 'info', category: 'session' },
  SESSION_HIJACK_ATTEMPT: { type: 'SESSION_HIJACK_ATTEMPT', severity: 'critical', category: 'session' },
  CONCURRENT_SESSION_LIMIT: { type: 'CONCURRENT_SESSION_LIMIT', severity: 'warning', category: 'session' },
  
  // Authorization Events
  UNAUTHORIZED_ACCESS: { type: 'UNAUTHORIZED_ACCESS', severity: 'high', category: 'authz' },
  PRIVILEGE_ESCALATION: { type: 'PRIVILEGE_ESCALATION', severity: 'critical', category: 'authz' },
  ADMIN_ACCESS: { type: 'ADMIN_ACCESS', severity: 'warning', category: 'authz' },
  
  // Security Violations
  SQL_INJECTION_ATTEMPT: { type: 'SQL_INJECTION_ATTEMPT', severity: 'critical', category: 'injection' },
  XSS_ATTEMPT: { type: 'XSS_ATTEMPT', severity: 'critical', category: 'injection' },
  CSRF_VIOLATION: { type: 'CSRF_VIOLATION', severity: 'high', category: 'csrf' },
  RATE_LIMIT_EXCEEDED: { type: 'RATE_LIMIT_EXCEEDED', severity: 'warning', category: 'ratelimit' },
  
  // Data Events
  SENSITIVE_DATA_ACCESS: { type: 'SENSITIVE_DATA_ACCESS', severity: 'warning', category: 'data' },
  DATA_EXPORT: { type: 'DATA_EXPORT', severity: 'warning', category: 'data' },
  BULK_DATA_ACCESS: { type: 'BULK_DATA_ACCESS', severity: 'warning', category: 'data' },
  
  // System Events
  CONFIGURATION_CHANGED: { type: 'CONFIGURATION_CHANGED', severity: 'warning', category: 'system' },
  SECURITY_SETTING_CHANGED: { type: 'SECURITY_SETTING_CHANGED', severity: 'high', category: 'system' },
  API_KEY_COMPROMISED: { type: 'API_KEY_COMPROMISED', severity: 'critical', category: 'system' },
  
  // Suspicious Activity
  UNUSUAL_LOGIN_LOCATION: { type: 'UNUSUAL_LOGIN_LOCATION', severity: 'warning', category: 'anomaly' },
  UNUSUAL_LOGIN_TIME: { type: 'UNUSUAL_LOGIN_TIME', severity: 'info', category: 'anomaly' },
  SUSPICIOUS_USER_AGENT: { type: 'SUSPICIOUS_USER_AGENT', severity: 'warning', category: 'anomaly' },
  AUTOMATED_BEHAVIOR: { type: 'AUTOMATED_BEHAVIOR', severity: 'warning', category: 'anomaly' },
};

/**
 * Alert thresholds for different event types
 */
const ALERT_THRESHOLDS = {
  LOGIN_FAILURE: { count: 10, window: 5 * 60 * 1000 }, // 10 failures in 5 minutes
  UNAUTHORIZED_ACCESS: { count: 5, window: 10 * 60 * 1000 }, // 5 attempts in 10 minutes
  SQL_INJECTION_ATTEMPT: { count: 1, window: 0 }, // Immediate alert
  XSS_ATTEMPT: { count: 1, window: 0 }, // Immediate alert
  PRIVILEGE_ESCALATION: { count: 1, window: 0 }, // Immediate alert
};

/**
 * In-memory event counters for alerting
 */
const eventCounters = new Map();

/**
 * Log security event
 */
export async function logSecurityEvent(eventType, details = {}) {
  const event = SECURITY_EVENTS[eventType];
  if (!event) {
    logger.error('Unknown security event type:', eventType);
    return;
  }
  
  const eventId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const eventData = {
    id: eventId,
    type: event.type,
    severity: event.severity,
    category: event.category,
    timestamp,
    userId: details.userId || null,
    sessionId: details.sessionId || null,
    ipAddress: details.ipAddress || null,
    userAgent: details.userAgent || null,
    resource: details.resource || null,
    action: details.action || null,
    result: details.result || null,
    metadata: JSON.stringify(details.metadata || {}),
    riskScore: calculateRiskScore(event, details),
  };
  
  try {
    // Store in database
    await storeSecurityEvent(eventData);
    
    // Log to application logger
    const logLevel = getSeverityLogLevel(event.severity);
    logger[logLevel]('Security event logged', {
      eventType: event.type,
      severity: event.severity,
      userId: eventData.userId,
      ipAddress: eventData.ipAddress,
      riskScore: eventData.riskScore,
      details: details.metadata
    });
    
    // Check for alerting
    await checkAlertThresholds(event.type, eventData);
    
    // Real-time notifications for critical events
    if (event.severity === 'critical') {
      await sendImmediateAlert(eventData);
    }
    
    return eventId;
    
  } catch (error) {
    logger.error('Failed to log security event:', error);
    throw error;
  }
}

/**
 * Store security event in database
 */
async function storeSecurityEvent(eventData) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO security_events (
        id, type, severity, category, timestamp, user_id, session_id,
        ip_address, user_agent, resource, action, result, metadata, risk_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      eventData.id,
      eventData.type,
      eventData.severity,
      eventData.category,
      eventData.timestamp,
      eventData.userId,
      eventData.sessionId,
      eventData.ipAddress,
      eventData.userAgent,
      eventData.resource,
      eventData.action,
      eventData.result,
      eventData.metadata,
      eventData.riskScore
    ], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Calculate risk score for an event
 */
function calculateRiskScore(event, details) {
  let score = 0;
  
  // Base score by severity
  const severityScores = {
    'info': 1,
    'warning': 3,
    'high': 7,
    'critical': 10
  };
  
  score += severityScores[event.severity] || 1;
  
  // Additional risk factors
  if (details.ipAddress && isUnusualIP(details.ipAddress)) {
    score += 2;
  }
  
  if (details.userAgent && isSuspiciousUserAgent(details.userAgent)) {
    score += 2;
  }
  
  if (details.userId && isHighPrivilegeUser(details.userId)) {
    score += 1;
  }
  
  if (details.metadata?.repeated === true) {
    score += 2;
  }
  
  return Math.min(score, 10); // Cap at 10
}

/**
 * Check if IP address is unusual (simplified implementation)
 */
function isUnusualIP(ipAddress) {
  // Check if IP is from known VPN/proxy ranges, different country, etc.
  // This is a simplified implementation - in production, use GeoIP services
  const knownVPNRanges = ['10.0.', '192.168.', '172.'];
  return !knownVPNRanges.some(range => ipAddress.startsWith(range));
}

/**
 * Check if user agent is suspicious
 */
function isSuspiciousUserAgent(userAgent) {
  const suspiciousPatterns = [
    /bot/i, /crawler/i, /spider/i, /curl/i, /wget/i,
    /python/i, /java/i, /perl/i, /ruby/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Check if user has high privileges (simplified)
 */
function isHighPrivilegeUser(_userId) {
  // In production, check user roles from database
  return false; // Placeholder
}

/**
 * Get log level for severity
 */
function getSeverityLogLevel(severity) {
  const mapping = {
    'info': 'info',
    'warning': 'warn',
    'high': 'warn',
    'critical': 'error'
  };
  
  return mapping[severity] || 'info';
}

/**
 * Check alert thresholds and trigger alerts
 */
async function checkAlertThresholds(eventType, eventData) {
  const threshold = ALERT_THRESHOLDS[eventType];
  if (!threshold) {
    return;
  }
  
  const now = Date.now();
  const windowStart = now - threshold.window;
  const key = `${eventType}_${eventData.ipAddress || 'global'}`;
  
  // Get or initialize counter
  let counter = eventCounters.get(key) || { count: 0, firstEvent: now };
  
  // Reset counter if outside window
  if (counter.firstEvent < windowStart) {
    counter = { count: 0, firstEvent: now };
  }
  
  counter.count++;
  eventCounters.set(key, counter);
  
  // Check if threshold exceeded
  if (counter.count >= threshold.count) {
    await triggerAlert(eventType, eventData, counter.count);
    
    // Reset counter after alert
    eventCounters.delete(key);
  }
}

/**
 * Trigger security alert
 */
async function triggerAlert(eventType, eventData, count) {
  const alertData = {
    id: crypto.randomUUID(),
    type: 'SECURITY_ALERT',
    eventType,
    count,
    severity: 'critical',
    timestamp: new Date().toISOString(),
    details: eventData
  };
  
  logger.error('Security alert triggered', alertData);
  
  // Store alert
  await storeSecurityAlert(alertData);
  
  // Send notifications (implement as needed)
  await sendAlertNotification(alertData);
}

/**
 * Send immediate alert for critical events
 */
async function sendImmediateAlert(eventData) {
  logger.error('Critical security event detected', {
    eventType: eventData.type,
    userId: eventData.userId,
    ipAddress: eventData.ipAddress,
    timestamp: eventData.timestamp
  });
  
  // Implement immediate notification logic (email, Slack, etc.)
  // This is a placeholder for the actual implementation
}

/**
 * Store security alert
 */
async function storeSecurityAlert(alertData) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO security_alerts (
        id, type, event_type, count, severity, timestamp, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      alertData.id,
      alertData.type,
      alertData.eventType,
      alertData.count,
      alertData.severity,
      alertData.timestamp,
      JSON.stringify(alertData.details)
    ], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Send alert notification
 */
async function sendAlertNotification(alertData) {
  // Placeholder for notification implementation
  // Could integrate with email, Slack, PagerDuty, etc.
  logger.info('Alert notification would be sent:', alertData.type);
}

/**
 * Get security events with filtering
 */
export async function getSecurityEvents(filters = {}) {
  try {
    let query = 'SELECT * FROM security_events WHERE 1=1';
    const params = [];
    
    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }
    
    if (filters.severity) {
      query += ' AND severity = ?';
      params.push(filters.severity);
    }
    
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    
    if (filters.startTime) {
      query += ' AND timestamp >= ?';
      params.push(filters.startTime);
    }
    
    if (filters.endTime) {
      query += ' AND timestamp <= ?';
      params.push(filters.endTime);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(filters.limit || 100);
    
    const events = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    return events.map(event => ({
      ...event,
      metadata: JSON.parse(event.metadata || '{}')
    }));
    
  } catch (error) {
    logger.error('Failed to get security events:', error);
    throw error;
  }
}

/**
 * Get security statistics
 */
export async function getSecurityStats(timeRange = '24h') {
  try {
    const timeFilter = getTimeFilter(timeRange);
    
    const stats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          category,
          severity,
          COUNT(*) as count,
          AVG(risk_score) as avg_risk_score
        FROM security_events 
        WHERE timestamp >= ?
        GROUP BY category, severity
        ORDER BY count DESC
      `, [timeFilter], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const totalEvents = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as total FROM security_events 
        WHERE timestamp >= ?
      `, [timeFilter], (err, row) => {
        if (err) reject(err);
        else resolve(row?.total || 0);
      });
    });
    
    return {
      totalEvents,
      eventsByCategory: stats,
      timeRange,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('Failed to get security stats:', error);
    throw error;
  }
}

/**
 * Get time filter for queries
 */
function getTimeFilter(timeRange) {
  const now = new Date();
  const duration = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  
  const milliseconds = duration[timeRange] || duration['24h'];
  return new Date(now.getTime() - milliseconds).toISOString();
}

/**
 * Initialize security event tables
 */
export async function initializeSecurityTables() {
  try {
    // Security events table
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS security_events (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          severity TEXT NOT NULL,
          category TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          user_id TEXT,
          session_id TEXT,
          ip_address TEXT,
          user_agent TEXT,
          resource TEXT,
          action TEXT,
          result TEXT,
          metadata TEXT,
          risk_score INTEGER DEFAULT 0
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Security alerts table
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS security_alerts (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          event_type TEXT NOT NULL,
          count INTEGER NOT NULL,
          severity TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          details TEXT
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Create indexes
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_security_events_timestamp 
        ON security_events (timestamp)
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_security_events_user_id 
        ON security_events (user_id)
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    logger.info('Security event tables initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize security tables:', error);
    throw error;
  }
}

/**
 * Cleanup old security events
 */
export async function cleanupOldEvents(retentionDays = 90) {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        DELETE FROM security_events 
        WHERE timestamp < ?
      `, [cutoffDate], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    logger.info('Cleaned up old security events', { 
      removedEvents: result,
      retentionDays 
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to cleanup old events:', error);
    throw error;
  }
}

export default {
  logSecurityEvent,
  getSecurityEvents,
  getSecurityStats,
  initializeSecurityTables,
  cleanupOldEvents,
  SECURITY_EVENTS
};