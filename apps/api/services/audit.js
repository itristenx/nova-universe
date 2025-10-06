// Comprehensive Audit Logging Service
// Tracks all security-relevant events and user actions
// Following OWASP Logging Security Cheat Sheet

import { logger } from '../logger.js';
import db from '../db.js';

/**
 * Audit Actions (following industry standards)
 */
export const AuditActions = {
  // Authentication & Authorization
  LOGIN: 'login',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled',
  MFA_SUCCESS: 'mfa_success',
  MFA_FAILED: 'mfa_failed',
  MFA_BACKUP_CODE_USED: 'mfa_backup_code_used',

  // User Management
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ROLE_ASSIGNED: 'user_role_assigned',
  USER_ROLE_REMOVED: 'user_role_removed',
  USER_PERMISSIONS_CHANGED: 'user_permissions_changed',

  // Resource Access
  RESOURCE_VIEWED: 'resource_viewed',
  RESOURCE_CREATED: 'resource_created',
  RESOURCE_UPDATED: 'resource_updated',
  RESOURCE_DELETED: 'resource_deleted',
  RESOURCE_EXPORTED: 'resource_exported',

  // Tickets & ITSM
  TICKET_CREATED: 'ticket_created',
  TICKET_UPDATED: 'ticket_updated',
  TICKET_DELETED: 'ticket_deleted',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_CLOSED: 'ticket_closed',
  TICKET_REOPENED: 'ticket_reopened',

  // Security Events
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  PERMISSION_DENIED: 'permission_denied',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  DATA_BREACH_ATTEMPT: 'data_breach_attempt',

  // System Configuration
  CONFIG_CHANGED: 'config_changed',
  INTEGRATION_ENABLED: 'integration_enabled',
  INTEGRATION_DISABLED: 'integration_disabled',
  API_KEY_CREATED: 'api_key_created',
  API_KEY_REVOKED: 'api_key_revoked',

  // Data Operations
  DATA_IMPORT: 'data_import',
  DATA_EXPORT: 'data_export',
  BULK_UPDATE: 'bulk_update',
  BULK_DELETE: 'bulk_delete',
};

/**
 * Security Event Severities
 */
export const SecuritySeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Audit Logging Service
 */
class AuditService {
  /**
   * Log an audit event
   * @param {Object} params - Audit event parameters
   * @param {number} params.userId - User ID (optional)
   * @param {string} params.action - Action performed
   * @param {string} params.resourceType - Type of resource (optional)
   * @param {string} params.resourceId - Resource ID (optional)
   * @param {string} params.ipAddress - IP address
   * @param {string} params.userAgent - User agent string
   * @param {string} params.requestMethod - HTTP method (optional)
   * @param {string} params.requestPath - Request path (optional)
   * @param {number} params.statusCode - Response status code (optional)
   * @param {string} params.errorMessage - Error message (optional)
   * @param {Object} params.metadata - Additional metadata (optional)
   * @param {string} params.sessionId - Session ID (optional)
   * @param {number} params.tenantId - Tenant ID (optional)
   */
  async log({
    userId = null,
    action,
    resourceType = null,
    resourceId = null,
    ipAddress = null,
    userAgent = null,
    requestMethod = null,
    requestPath = null,
    statusCode = null,
    errorMessage = null,
    metadata = {},
    sessionId = null,
    tenantId = null,
  }) {
    try {
      await db.query(
        `INSERT INTO audit_logs (
          user_id, action, resource_type, resource_id,
          ip_address, user_agent, request_method, request_path,
          status_code, error_message, metadata, session_id, tenant_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          userId,
          action,
          resourceType,
          resourceId,
          ipAddress,
          userAgent,
          requestMethod,
          requestPath,
          statusCode,
          errorMessage,
          JSON.stringify(metadata),
          sessionId,
          tenantId,
        ]
      );

      // Also log to application logger for immediate visibility
      logger.info('Audit event', {
        userId,
        action,
        resourceType,
        resourceId,
        ipAddress,
        statusCode,
      });
    } catch (error) {
      // Never let audit logging failures break the application
      logger.error('Failed to write audit log:', error);
    }
  }

  /**
   * Log from Express request object
   * @param {Object} req - Express request object
   * @param {string} action - Action performed
   * @param {Object} additionalData - Additional data to log
   */
  async logRequest(req, action, additionalData = {}) {
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    const userAgent = req.get('user-agent') || null;
    const sessionId = req.session?.id || req.sessionID || null;
    const tenantId = req.user?.tenantId || req.tenant?.id || null;

    await this.log({
      userId,
      action,
      ipAddress,
      userAgent,
      requestMethod: req.method,
      requestPath: req.path,
      sessionId,
      tenantId,
      ...additionalData,
    });
  }

  /**
   * Log a security event
   * @param {Object} params - Security event parameters
   * @param {string} params.eventType - Type of security event
   * @param {string} params.severity - Severity level
   * @param {number} params.userId - User ID (optional)
   * @param {string} params.ipAddress - IP address
   * @param {Object} params.details - Event details
   */
  async logSecurityEvent({
    eventType,
    severity = SecuritySeverity.MEDIUM,
    userId = null,
    ipAddress = null,
    details = {},
  }) {
    try {
      await db.query(
        `INSERT INTO security_events (
          event_type, severity, user_id, ip_address, details
        ) VALUES ($1, $2, $3, $4, $5)`,
        [eventType, severity, userId, ipAddress, JSON.stringify(details)]
      );

      // Log critical/high severity events to application logger immediately
      if ([SecuritySeverity.CRITICAL, SecuritySeverity.HIGH].includes(severity)) {
        logger.warn('Security event', {
          eventType,
          severity,
          userId,
          ipAddress,
          details,
        });
      }

      // For critical events, also send alert (if configured)
      if (severity === SecuritySeverity.CRITICAL) {
        await this.sendSecurityAlert({
          eventType,
          userId,
          ipAddress,
          details,
        });
      }
    } catch (error) {
      logger.error('Failed to write security event:', error);
    }
  }

  /**
   * Send security alert for critical events
   * @private
   */
  async sendSecurityAlert({ eventType, userId, ipAddress, details }) {
    try {
      // Send alert via configured channels (email, Slack, PagerDuty, etc.)
      const alertMessage = `🚨 CRITICAL SECURITY EVENT\n\nType: ${eventType}\nUser ID: ${userId}\nIP: ${ipAddress}\nDetails: ${JSON.stringify(details, null, 2)}`;

      // Example: Send to Slack webhook
      if (process.env.SECURITY_SLACK_WEBHOOK) {
        const axios = (await import('axios')).default;
        await axios.post(process.env.SECURITY_SLACK_WEBHOOK, {
          text: alertMessage,
          username: 'Nova Security',
          icon_emoji: ':rotating_light:',
        });
      }

      logger.info('Security alert sent', { eventType, userId });
    } catch (error) {
      logger.error('Failed to send security alert:', error);
    }
  }

  /**
   * Get audit logs with filtering
   * @param {Object} filters - Filter criteria
   * @returns {Array} Audit logs
   */
  async getAuditLogs(filters = {}) {
    try {
      const {
        userId,
        action,
        resourceType,
        startDate,
        endDate,
        limit = 100,
        offset = 0,
      } = filters;

      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (action) {
        query += ` AND action = $${paramIndex}`;
        params.push(action);
        paramIndex++;
      }

      if (resourceType) {
        query += ` AND resource_type = $${paramIndex}`;
        params.push(resourceType);
        paramIndex++;
      }

      if (startDate) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get audit logs:', error);
      throw error;
    }
  }

  /**
   * Get security events with filtering
   * @param {Object} filters - Filter criteria
   * @returns {Array} Security events
   */
  async getSecurityEvents(filters = {}) {
    try {
      const { severity, resolved, limit = 100, offset = 0 } = filters;

      let query = 'SELECT * FROM recent_security_events WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (severity) {
        query += ` AND severity = $${paramIndex}`;
        params.push(severity);
        paramIndex++;
      }

      if (resolved !== undefined) {
        query += ` AND resolved = $${paramIndex}`;
        params.push(resolved);
        paramIndex++;
      }

      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get security events:', error);
      throw error;
    }
  }

  /**
   * Get user activity summary
   * @param {number} userId - User ID
   * @returns {Object} Activity summary
   */
  async getUserActivitySummary(userId) {
    try {
      const result = await db.query(
        'SELECT * FROM user_activity_summary WHERE user_id = $1',
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get user activity summary:', error);
      throw error;
    }
  }

  /**
   * Clean old audit logs (should be run periodically)
   */
  async cleanOldLogs() {
    try {
      await db.query('SELECT clean_old_audit_logs()');
      logger.info('Old audit logs cleaned successfully');
    } catch (error) {
      logger.error('Failed to clean old audit logs:', error);
      throw error;
    }
  }

  /**
   * Resolve a security event
   * @param {number} eventId - Security event ID
   * @param {number} resolvedBy - User ID who resolved the event
   */
  async resolveSecurityEvent(eventId, resolvedBy) {
    try {
      await db.query(
        `UPDATE security_events 
         SET resolved = TRUE, 
             resolved_at = NOW(), 
             resolved_by = $2 
         WHERE id = $1`,
        [eventId, resolvedBy]
      );

      logger.info(`Security event ${eventId} resolved by user ${resolvedBy}`);
    } catch (error) {
      logger.error('Failed to resolve security event:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AuditService();
