// Security Monitoring Service
// Monitors audit_logs and security_events tables for suspicious activity
// Sends alerts to configured webhooks for critical security events

import { logger } from '../logger.js';
import db from '../db.js';
import axios from 'axios';

/**
 * Security Monitor Service
 * Continuously monitors database for security events and triggers alerts
 */
class SecurityMonitor {
  constructor() {
    this.webhookUrl = process.env.SECURITY_ALERT_WEBHOOK;
    this.webhookType = process.env.SECURITY_ALERT_WEBHOOK_TYPE || 'slack';
    this.enabled = process.env.SECURITY_ALERT_ENABLED === 'true';
    this.checkInterval = Number(process.env.SECURITY_CHECK_INTERVAL || 60000); // 1 minute
    this.alertThresholds = {
      failedLogins: 5, // Failed login attempts from same IP within time window
      mfaFailures: 3, // Failed MFA attempts
      suspiciousActivity: 10, // Suspicious actions from same user/IP
      timeWindow: 300000, // 5 minutes
    };
    
    this.monitoringActive = false;
    this.intervalId = null;
  }

  /**
   * Start monitoring security events
   */
  start() {
    if (!this.enabled) {
      logger.info('Security monitoring is disabled. Set SECURITY_ALERT_ENABLED=true to enable.');
      return;
    }

    if (!this.webhookUrl) {
      logger.warn('SECURITY_ALERT_WEBHOOK not configured. Security alerts will be logged only.');
    }

    if (this.monitoringActive) {
      logger.warn('Security monitoring is already active');
      return;
    }

    logger.info('🔒 Starting security monitoring service...');
    this.monitoringActive = true;

    // Run initial check
    this.performSecurityCheck();

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.performSecurityCheck();
    }, this.checkInterval);

    logger.info(`✅ Security monitoring active (checking every ${this.checkInterval / 1000}s)`);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.monitoringActive = false;
    logger.info('🛑 Security monitoring stopped');
  }

  /**
   * Perform comprehensive security check
   */
  async performSecurityCheck() {
    try {
      await Promise.all([
        this.checkFailedLogins(),
        this.checkMFAFailures(),
        this.checkUnresolvedSecurityEvents(),
        this.checkSuspiciousActivity(),
        this.checkBruteForceAttempts(),
      ]);
    } catch (error) {
      logger.error('Security check failed:', error);
    }
  }

  /**
   * Check for failed login attempts
   */
  async checkFailedLogins() {
    try {
      const timeWindow = new Date(Date.now() - this.alertThresholds.timeWindow);
      
      const result = await db.query(
        `SELECT ip_address, COUNT(*) as attempts, 
                array_agg(DISTINCT user_agent) as user_agents,
                MAX(created_at) as last_attempt
         FROM audit_logs
         WHERE action IN ('login_failed', 'invalid_credentials')
           AND created_at > $1
         GROUP BY ip_address
         HAVING COUNT(*) >= $2
         ORDER BY attempts DESC`,
        [timeWindow, this.alertThresholds.failedLogins]
      );

      for (const row of result.rows) {
        await this.sendAlert({
          severity: 'high',
          type: 'failed_logins',
          title: '⚠️ Multiple Failed Login Attempts Detected',
          description: `IP ${row.ip_address} has attempted ${row.attempts} failed logins in the last 5 minutes`,
          details: {
            ip_address: row.ip_address,
            attempts: row.attempts,
            user_agents: row.user_agents,
            last_attempt: row.last_attempt,
          },
        });

        // Create security event
        await this.createSecurityEvent({
          event_type: 'brute_force_login',
          severity: 'high',
          ip_address: row.ip_address,
          details: {
            attempts: row.attempts,
            user_agents: row.user_agents,
            last_attempt: row.last_attempt,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to check failed logins:', error);
    }
  }

  /**
   * Check for MFA failures
   */
  async checkMFAFailures() {
    try {
      const timeWindow = new Date(Date.now() - this.alertThresholds.timeWindow);
      
      const result = await db.query(
        `SELECT user_id, ip_address, COUNT(*) as failures,
                MAX(created_at) as last_failure
         FROM audit_logs
         WHERE action = 'mfa_failed'
           AND created_at > $1
         GROUP BY user_id, ip_address
         HAVING COUNT(*) >= $2
         ORDER BY failures DESC`,
        [timeWindow, this.alertThresholds.mfaFailures]
      );

      for (const row of result.rows) {
        // Get user details
        const userResult = await db.query(
          'SELECT email, name FROM users WHERE id = $1',
          [row.user_id]
        );
        const user = userResult.rows[0];

        await this.sendAlert({
          severity: 'critical',
          type: 'mfa_failures',
          title: '🚨 Multiple MFA Failures Detected',
          description: `User ${user?.email || row.user_id} has ${row.failures} failed MFA attempts from IP ${row.ip_address}`,
          details: {
            user_id: row.user_id,
            user_email: user?.email,
            ip_address: row.ip_address,
            failures: row.failures,
            last_failure: row.last_failure,
          },
        });

        await this.createSecurityEvent({
          event_type: 'mfa_brute_force',
          severity: 'critical',
          user_id: row.user_id,
          ip_address: row.ip_address,
          details: {
            failures: row.failures,
            last_failure: row.last_failure,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to check MFA failures:', error);
    }
  }

  /**
   * Check for unresolved critical security events
   */
  async checkUnresolvedSecurityEvents() {
    try {
      const result = await db.query(
        `SELECT * FROM security_events
         WHERE resolved = false
           AND severity IN ('high', 'critical')
           AND created_at > NOW() - INTERVAL '24 hours'
         ORDER BY severity DESC, created_at DESC
         LIMIT 10`
      );

      if (result.rows.length > 0) {
        await this.sendAlert({
          severity: 'high',
          type: 'unresolved_events',
          title: '⚠️ Unresolved Security Events',
          description: `There are ${result.rows.length} unresolved critical security events`,
          details: {
            count: result.rows.length,
            events: result.rows.map(e => ({
              id: e.id,
              type: e.event_type,
              severity: e.severity,
              created_at: e.created_at,
            })),
          },
        });
      }
    } catch (error) {
      logger.error('Failed to check unresolved security events:', error);
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  async checkSuspiciousActivity() {
    try {
      const timeWindow = new Date(Date.now() - this.alertThresholds.timeWindow);
      
      // Check for rapid succession of different action types from same IP
      const result = await db.query(
        `SELECT ip_address, 
                COUNT(DISTINCT action) as unique_actions,
                COUNT(*) as total_actions,
                array_agg(DISTINCT action) as actions
         FROM audit_logs
         WHERE created_at > $1
           AND action NOT IN ('login_success', 'logout')
         GROUP BY ip_address
         HAVING COUNT(*) >= $2
         ORDER BY total_actions DESC`,
        [timeWindow, this.alertThresholds.suspiciousActivity]
      );

      for (const row of result.rows) {
        await this.sendAlert({
          severity: 'medium',
          type: 'suspicious_activity',
          title: '🔍 Suspicious Activity Pattern Detected',
          description: `IP ${row.ip_address} performed ${row.total_actions} actions across ${row.unique_actions} different types`,
          details: {
            ip_address: row.ip_address,
            total_actions: row.total_actions,
            unique_actions: row.unique_actions,
            actions: row.actions,
          },
        });

        await this.createSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'medium',
          ip_address: row.ip_address,
          details: {
            total_actions: row.total_actions,
            unique_actions: row.unique_actions,
            actions: row.actions,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to check suspicious activity:', error);
    }
  }

  /**
   * Check for brute force attempts
   */
  async checkBruteForceAttempts() {
    try {
      const timeWindow = new Date(Date.now() - 600000); // 10 minutes
      
      const result = await db.query(
        `SELECT ip_address, user_id, COUNT(*) as attempts
         FROM audit_logs
         WHERE action LIKE '%failed%'
           AND created_at > $1
         GROUP BY ip_address, user_id
         HAVING COUNT(*) >= 10
         ORDER BY attempts DESC`,
        [timeWindow]
      );

      for (const row of result.rows) {
        await this.sendAlert({
          severity: 'critical',
          type: 'brute_force',
          title: '🚨 Brute Force Attack Detected',
          description: `Potential brute force attack from IP ${row.ip_address}`,
          details: {
            ip_address: row.ip_address,
            user_id: row.user_id,
            attempts: row.attempts,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to check brute force attempts:', error);
    }
  }

  /**
   * Create a security event in the database
   */
  async createSecurityEvent(event) {
    try {
      await db.query(
        `INSERT INTO security_events 
         (event_type, severity, user_id, ip_address, details, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          event.event_type,
          event.severity,
          event.user_id || null,
          event.ip_address || null,
          JSON.stringify(event.details),
        ]
      );
    } catch (error) {
      logger.error('Failed to create security event:', error);
    }
  }

  /**
   * Send alert to configured webhook
   */
  async sendAlert(alert) {
    // Always log the alert
    logger.warn('🔒 SECURITY ALERT:', {
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      description: alert.description,
      details: alert.details,
    });

    // Send to webhook if configured
    if (!this.webhookUrl) {
      return;
    }

    try {
      const payload = this.formatWebhookPayload(alert);
      
      await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      logger.info(`✅ Security alert sent to ${this.webhookType} webhook`);
    } catch (error) {
      logger.error('Failed to send security alert to webhook:', error.message);
    }
  }

  /**
   * Format alert payload for webhook service
   */
  formatWebhookPayload(alert) {
    const severityEmoji = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🔴',
      critical: '🚨',
    };

    const color = {
      low: '#36a64f',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#9c27b0',
    };

    if (this.webhookType === 'slack') {
      return {
        text: `${severityEmoji[alert.severity]} *${alert.title}*`,
        attachments: [
          {
            color: color[alert.severity],
            fields: [
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true,
              },
              {
                title: 'Type',
                value: alert.type,
                short: true,
              },
              {
                title: 'Description',
                value: alert.description,
                short: false,
              },
              {
                title: 'Details',
                value: `\`\`\`${JSON.stringify(alert.details, null, 2)}\`\`\``,
                short: false,
              },
            ],
            footer: 'Nova Universe Security Monitor',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      };
    } else if (this.webhookType === 'teams') {
      return {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: alert.title,
        themeColor: color[alert.severity].replace('#', ''),
        title: `${severityEmoji[alert.severity]} ${alert.title}`,
        sections: [
          {
            facts: [
              { name: 'Severity', value: alert.severity.toUpperCase() },
              { name: 'Type', value: alert.type },
              { name: 'Description', value: alert.description },
            ],
          },
          {
            text: `**Details:**\n\`\`\`json\n${JSON.stringify(alert.details, null, 2)}\n\`\`\``,
          },
        ],
      };
    } else {
      // Generic webhook format
      return {
        severity: alert.severity,
        type: alert.type,
        title: alert.title,
        description: alert.description,
        details: alert.details,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get security statistics
   */
  async getStatistics(timeWindow = '24 hours') {
    try {
      const [auditStats, securityStats] = await Promise.all([
        db.query(
          `SELECT 
             COUNT(*) as total_events,
             COUNT(CASE WHEN action LIKE '%failed%' THEN 1 END) as failed_actions,
             COUNT(CASE WHEN action = 'login_success' THEN 1 END) as successful_logins,
             COUNT(DISTINCT ip_address) as unique_ips,
             COUNT(DISTINCT user_id) as unique_users
           FROM audit_logs
           WHERE created_at > NOW() - INTERVAL '${timeWindow}'`
        ),
        db.query(
          `SELECT 
             COUNT(*) as total_events,
             COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved,
             COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
             COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
             COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium,
             COUNT(CASE WHEN severity = 'low' THEN 1 END) as low
           FROM security_events
           WHERE created_at > NOW() - INTERVAL '${timeWindow}'`
        ),
      ]);

      return {
        audit_logs: auditStats.rows[0],
        security_events: securityStats.rows[0],
        monitoring_active: this.monitoringActive,
        webhook_configured: !!this.webhookUrl,
      };
    } catch (error) {
      logger.error('Failed to get security statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new SecurityMonitor();
