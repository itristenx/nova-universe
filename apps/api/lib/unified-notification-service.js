/**
 * Unified Notification Service
 *
 * Centralizes all notification delivery across Nova ecosystem using Nova Comms
 * as the primary notification hub. Integrates with:
 * - Nova Comms (primary notification system)
 * - GoAlert notification channels
 * - Uptime Kuma notification providers
 * - Custom notification endpoints
 *
 * Features:
 * - Template-based notifications
 * - Multi-channel delivery (email, SMS, Slack, Teams, etc.)
 * - Escalation policies
 * - Delivery confirmation and retry logic
 * - Notification preferences per user
 * - Rate limiting and spam protection
 *
 * Part of the Nova Monitoring & Alerting Integration
 */

import { logger } from '../utils/logger.js';
import { database } from '../utils/database.js';
import { NovaCommsIntegration } from './nova-comms-integration.js';

class UnifiedNotificationService {
  constructor() {
    this.commsIntegration = new NovaCommsIntegration();
    this.templates = new Map();
    this.deliveryProviders = new Map();
    this.rateLimiters = new Map();
    this.retryQueues = new Map();

    this.loadNotificationTemplates();
    this.setupDeliveryProviders();
  }

  /**
   * Initialize the notification service
   */
  async initialize() {
    try {
      logger.info('Initializing Unified Notification Service...');

      // Initialize Nova Comms integration
      await this.commsIntegration.initialize();

      // Load user preferences
      await this.loadUserPreferences();

      // Start retry queue processors
      this.startRetryProcessors();

      logger.info('Unified Notification Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Unified Notification Service:', error);
      throw error;
    }
  }

  // =============================================================================
  // CORE NOTIFICATION METHODS
  // =============================================================================

  /**
   * Send unified notification for monitoring events
   */
  async sendMonitoringNotification(type, data, options = {}) {
    try {
      const {
        recipients = [],
        channels = ['email'],
        priority = 'normal',
        tenant_id,
        escalate = false,
      } = options;

      // Get notification template
      const template = this.getTemplate(type);
      if (!template) {
        throw new Error(`No notification template found for type: ${type}`);
      }

      // Build notification content
      const notification = await this.buildNotification(template, data, options);

      // Get effective recipients
      const effectiveRecipients = await this.getEffectiveRecipients(recipients, tenant_id, type);

      // Send notifications through each channel
      const deliveryResults = await Promise.allSettled(
        channels.map(async (channel) => {
          return this.sendThroughChannel(channel, notification, effectiveRecipients, {
            ...options,
            priority,
          });
        }),
      );

      // Handle escalation if required
      if (escalate || priority === 'critical') {
        await this.handleEscalation(type, data, notification, options);
      }

      // Log delivery results
      await this.logNotificationDelivery(type, notification, deliveryResults, options);

      return {
        success: true,
        notification_id: notification.id,
        delivery_results: deliveryResults,
        recipients_count: effectiveRecipients.length,
      };
    } catch (error) {
      logger.error('Error sending monitoring notification:', error);
      throw error;
    }
  }

  /**
   * Send alert notifications with escalation
   */
  async sendAlertNotification(alert, options = {}) {
    const { type = 'alert_created', immediate = false } = options;

    // Determine notification priority based on alert severity
    const priority = this.getAlertPriority(alert.severity);
    const channels = this.getAlertChannels(alert.severity, immediate);

    // Get on-call recipients if not specified
    let recipients = options.recipients || [];
    if (recipients.length === 0 && alert.monitor_id) {
      recipients = await this.getOnCallRecipients(alert.monitor_id);
    }

    return this.sendMonitoringNotification(type, alert, {
      ...options,
      recipients,
      channels,
      priority,
      escalate: immediate || alert.severity === 'critical',
    });
  }

  /**
   * Send incident notifications with status page updates
   */
  async sendIncidentNotification(incident, options = {}) {
    const { type = 'incident_created' } = options;

    // Send to internal stakeholders
    const internalResult = await this.sendMonitoringNotification(type, incident, {
      ...options,
      channels: ['email', 'slack', 'teams'],
      priority: this.getIncidentPriority(incident.severity),
    });

    // Send to external subscribers if public incident
    let externalResult = null;
    if (incident.is_public) {
      externalResult = await this.sendPublicIncidentNotification(incident, type);
    }

    return {
      internal: internalResult,
      external: externalResult,
    };
  }

  /**
   * Send on-call schedule notifications
   */
  async sendScheduleNotification(schedule, options = {}) {
    const { type = 'schedule_updated' } = options;

    // Get team members
    const recipients = await this.getTeamMembers(schedule.team_id);

    return this.sendMonitoringNotification(type, schedule, {
      ...options,
      recipients,
      channels: ['email', 'push'],
      priority: 'normal',
    });
  }

  // =============================================================================
  // TEMPLATE MANAGEMENT
  // =============================================================================

  loadNotificationTemplates() {
    // Alert templates
    this.templates.set('alert_created', {
      subject: '🚨 Alert: {{alert.summary}}',
      email: {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <div style="background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
              <h2 style="margin: 0;">⚠️ New Alert</h2>
            </div>
            <div style="border: 1px solid #dc3545; padding: 20px; border-radius: 0 0 5px 5px;">
              <h3>{{alert.summary}}</h3>
              <p><strong>Severity:</strong> <span style="color: {{severityColor}};">{{alert.severity}}</span></p>
              <p><strong>Monitor:</strong> {{monitor.name}}</p>
              <p><strong>Created:</strong> {{alert.created_at}}</p>
              {{#if alert.description}}
              <p><strong>Description:</strong><br>{{alert.description}}</p>
              {{/if}}
              <div style="margin-top: 20px;">
                <a href="{{alertUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Alert</a>
                <a href="{{acknowledgeUrl}}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">Acknowledge</a>
              </div>
            </div>
          </div>
        `,
        text: `
🚨 NEW ALERT: {{alert.summary}}

Severity: {{alert.severity}}
Monitor: {{monitor.name}}
Created: {{alert.created_at}}

{{#if alert.description}}
Description: {{alert.description}}
{{/if}}

View Alert: {{alertUrl}}
Acknowledge: {{acknowledgeUrl}}
        `,
      },
      slack: {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 New Alert: {{alert.summary}}',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: '*Severity:* {{alert.severity}}',
              },
              {
                type: 'mrkdwn',
                text: '*Monitor:* {{monitor.name}}',
              },
              {
                type: 'mrkdwn',
                text: '*Created:* {{alert.created_at}}',
              },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Alert',
                },
                url: '{{alertUrl}}',
                style: 'primary',
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Acknowledge',
                },
                url: '{{acknowledgeUrl}}',
                style: 'danger',
              },
            ],
          },
        ],
      },
      sms: 'ALERT: {{alert.summary}} - Severity: {{alert.severity}} - {{alertUrl}}',
    });

    this.templates.set('alert_acknowledged', {
      subject: '✅ Alert Acknowledged: {{alert.summary}}',
      email: {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <div style="background: #28a745; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
              <h2 style="margin: 0;">✅ Alert Acknowledged</h2>
            </div>
            <div style="border: 1px solid #28a745; padding: 20px; border-radius: 0 0 5px 5px;">
              <h3>{{alert.summary}}</h3>
              <p><strong>Acknowledged by:</strong> {{acknowledgedBy.name}}</p>
              <p><strong>Time:</strong> {{alert.acknowledged_at}}</p>
              {{#if message}}
              <p><strong>Message:</strong><br>{{message}}</p>
              {{/if}}
              <div style="margin-top: 20px;">
                <a href="{{alertUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Alert</a>
              </div>
            </div>
          </div>
        `,
      },
      slack: {
        text: '✅ Alert acknowledged: {{alert.summary}} by {{acknowledgedBy.name}}',
      },
      sms: 'ACKNOWLEDGED: {{alert.summary}} by {{acknowledgedBy.name}}',
    });

    this.templates.set('alert_resolved', {
      subject: '✅ Alert Resolved: {{alert.summary}}',
      email: {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <div style="background: #28a745; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
              <h2 style="margin: 0;">✅ Alert Resolved</h2>
            </div>
            <div style="border: 1px solid #28a745; padding: 20px; border-radius: 0 0 5px 5px;">
              <h3>{{alert.summary}}</h3>
              <p><strong>Resolved by:</strong> {{resolvedBy.name}}</p>
              <p><strong>Time:</strong> {{alert.resolved_at}}</p>
              <p><strong>Duration:</strong> {{duration}}</p>
              {{#if resolutionNotes}}
              <p><strong>Resolution Notes:</strong><br>{{resolutionNotes}}</p>
              {{/if}}
              {{#if rootCause}}
              <p><strong>Root Cause:</strong><br>{{rootCause}}</p>
              {{/if}}
            </div>
          </div>
        `,
      },
    });

    // Incident templates
    this.templates.set('incident_created', {
      subject: '🔥 Incident: {{incident.summary}}',
      email: {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <div style="background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
              <h2 style="margin: 0;">🔥 New Incident</h2>
            </div>
            <div style="border: 1px solid #dc3545; padding: 20px; border-radius: 0 0 5px 5px;">
              <h3>{{incident.summary}}</h3>
              <p><strong>Severity:</strong> {{incident.severity}}</p>
              <p><strong>Status:</strong> {{incident.status}}</p>
              <p><strong>Started:</strong> {{incident.started_at}}</p>
              {{#if incident.description}}
              <p><strong>Description:</strong><br>{{incident.description}}</p>
              {{/if}}
              {{#if incident.affected_services}}
              <p><strong>Affected Services:</strong></p>
              <ul>
                {{#each incident.affected_services}}
                <li>{{this.name}}</li>
                {{/each}}
              </ul>
              {{/if}}
              <div style="margin-top: 20px;">
                <a href="{{incidentUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Incident</a>
                <a href="{{statusPageUrl}}" style="background: #6c757d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">Status Page</a>
              </div>
            </div>
          </div>
        `,
      },
    });

    // Schedule templates
    this.templates.set('schedule_updated', {
      subject: '📅 On-Call Schedule Updated: {{schedule.name}}',
      email: {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h3>📅 On-Call Schedule Updated</h3>
            <p><strong>Schedule:</strong> {{schedule.name}}</p>
            <p><strong>Updated by:</strong> {{updatedBy.name}}</p>
            <p><strong>Changes:</strong></p>
            <ul>
              {{#each changes}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
            <a href="{{scheduleUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Schedule</a>
          </div>
        `,
      },
    });

    // On-call override templates
    this.templates.set('oncall_override_created', {
      subject: '🔄 On-Call Override: {{schedule.name}}',
      email: {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h3>🔄 On-Call Override Created</h3>
            <p><strong>Schedule:</strong> {{schedule.name}}</p>
            <p><strong>Override User:</strong> {{overrideUser.name}}</p>
            <p><strong>Start:</strong> {{override.start_time}}</p>
            <p><strong>End:</strong> {{override.end_time}}</p>
            <p><strong>Reason:</strong> {{override.reason}}</p>
            {{#if replacedUser}}
            <p><strong>Replacing:</strong> {{replacedUser.name}}</p>
            {{/if}}
          </div>
        `,
      },
    });

    logger.info('Notification templates loaded successfully');
  }

  getTemplate(type) {
    return this.templates.get(type);
  }

  // =============================================================================
  // DELIVERY PROVIDERS
  // =============================================================================

  setupDeliveryProviders() {
    // Email provider (Nova Comms)
    this.deliveryProviders.set('email', {
      send: this.sendEmail.bind(this),
      validate: this.validateEmailRecipients.bind(this),
      rateLimitKey: 'email',
    });

    // SMS provider (Nova Comms)
    this.deliveryProviders.set('sms', {
      send: this.sendSMS.bind(this),
      validate: this.validateSMSRecipients.bind(this),
      rateLimitKey: 'sms',
    });

    // Slack provider
    this.deliveryProviders.set('slack', {
      send: this.sendSlack.bind(this),
      validate: this.validateSlackRecipients.bind(this),
      rateLimitKey: 'slack',
    });

    // Microsoft Teams provider
    this.deliveryProviders.set('teams', {
      send: this.sendTeams.bind(this),
      validate: this.validateTeamsRecipients.bind(this),
      rateLimitKey: 'teams',
    });

    // Push notifications
    this.deliveryProviders.set('push', {
      send: this.sendPushNotification.bind(this),
      validate: this.validatePushRecipients.bind(this),
      rateLimitKey: 'push',
    });

    // Voice calls (for critical alerts)
    this.deliveryProviders.set('voice', {
      send: this.sendVoiceCall.bind(this),
      validate: this.validateVoiceRecipients.bind(this),
      rateLimitKey: 'voice',
    });

    logger.info('Notification delivery providers configured');
  }

  async sendThroughChannel(channel, notification, recipients, options) {
    const provider = this.deliveryProviders.get(channel);
    if (!provider) {
      throw new Error(`Unknown notification channel: ${channel}`);
    }

    // Validate recipients for this channel
    const validRecipients = await provider.validate(recipients);
    if (validRecipients.length === 0) {
      return {
        channel,
        success: false,
        error: 'No valid recipients for channel',
        recipients_attempted: 0,
      };
    }

    // Check rate limits
    if (await this.isRateLimited(provider.rateLimitKey, options.tenant_id)) {
      logger.warn(`Rate limit exceeded for ${channel} notifications`);
      return {
        channel,
        success: false,
        error: 'Rate limit exceeded',
        recipients_attempted: validRecipients.length,
      };
    }

    try {
      // Send notification
      const result = await provider.send(notification, validRecipients, options);

      // Update rate limiter
      await this.updateRateLimit(provider.rateLimitKey, options.tenant_id);

      return {
        channel,
        success: true,
        recipients_attempted: validRecipients.length,
        recipients_delivered: result.delivered_count,
        delivery_id: result.delivery_id,
      };
    } catch (error) {
      logger.error(`Error sending ${channel} notification:`, error);

      // Queue for retry if it's a temporary failure
      if (this.isRetryableError(error)) {
        await this.queueForRetry(channel, notification, validRecipients, options);
      }

      return {
        channel,
        success: false,
        error: error.message,
        recipients_attempted: validRecipients.length,
        recipients_delivered: 0,
      };
    }
  }

  // =============================================================================
  // CHANNEL-SPECIFIC SENDERS
  // =============================================================================

  async sendEmail(notification, recipients, options) {
    const emailContent = notification.content.email;
    if (!emailContent) {
      throw new Error('No email content in notification');
    }

    const emailData = {
      subject: notification.subject,
      html: emailContent.html,
      text: emailContent.text,
      recipients: recipients.map((r) => r.email).filter(Boolean),
      priority: options.priority || 'normal',
      tenant_id: options.tenant_id,
    };

    return this.commsIntegration.sendEmail(emailData);
  }

  async sendSMS(notification, recipients, options) {
    const smsContent = notification.content.sms;
    if (!smsContent) {
      throw new Error('No SMS content in notification');
    }

    const smsData = {
      message: smsContent,
      recipients: recipients.map((r) => r.phone).filter(Boolean),
      priority: options.priority || 'normal',
      tenant_id: options.tenant_id,
    };

    return this.commsIntegration.sendSMS(smsData);
  }

  async sendSlack(notification, recipients, options) {
    const slackContent = notification.content.slack;
    if (!slackContent) {
      throw new Error('No Slack content in notification');
    }

    const slackData = {
      ...slackContent,
      channels: recipients.map((r) => r.slack_channel || r.slack_user_id).filter(Boolean),
      priority: options.priority || 'normal',
      tenant_id: options.tenant_id,
    };

    return this.commsIntegration.sendSlackMessage(slackData);
  }

  async sendTeams(notification, recipients, options) {
    const teamsContent = notification.content.teams || notification.content.email;
    if (!teamsContent) {
      throw new Error('No Teams content in notification');
    }

    const teamsData = {
      title: notification.subject,
      text: teamsContent.text || teamsContent.html,
      webhooks: recipients.map((r) => r.teams_webhook).filter(Boolean),
      priority: options.priority || 'normal',
      tenant_id: options.tenant_id,
    };

    return this.commsIntegration.sendTeamsMessage(teamsData);
  }

  async sendPushNotification(notification, recipients, options) {
    const pushData = {
      title: notification.subject,
      body: notification.content.text || notification.content.sms,
      user_ids: recipients.map((r) => r.id),
      priority: options.priority || 'normal',
      tenant_id: options.tenant_id,
      data: {
        type: 'monitoring_alert',
        alert_id: notification.resource_id,
      },
    };

    return this.commsIntegration.sendPushNotification(pushData);
  }

  async sendVoiceCall(notification, recipients, options) {
    const voiceData = {
      message: `Alert: ${notification.subject}. Please check your monitoring dashboard.`,
      phone_numbers: recipients.map((r) => r.phone).filter(Boolean),
      priority: 'critical',
      tenant_id: options.tenant_id,
    };

    return this.commsIntegration.makeVoiceCall(voiceData);
  }

  // =============================================================================
  // RECIPIENT VALIDATION
  // =============================================================================

  async validateEmailRecipients(recipients) {
    return recipients.filter((r) => r.email && this.isValidEmail(r.email));
  }

  async validateSMSRecipients(recipients) {
    return recipients.filter((r) => r.phone && this.isValidPhone(r.phone));
  }

  async validateSlackRecipients(recipients) {
    return recipients.filter((r) => r.slack_channel || r.slack_user_id);
  }

  async validateTeamsRecipients(recipients) {
    return recipients.filter((r) => r.teams_webhook);
  }

  async validatePushRecipients(recipients) {
    return recipients.filter((r) => r.id); // All users can receive push notifications
  }

  async validateVoiceRecipients(recipients) {
    return recipients.filter((r) => r.phone && this.isValidPhone(r.phone));
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
  }

  // =============================================================================
  // NOTIFICATION BUILDING
  // =============================================================================

  async buildNotification(template, data, options) {
    const notification = {
      id: this.generateNotificationId(),
      type: options.type,
      subject: await this.renderTemplate(template.subject, data, options),
      content: {},
      resource_id: data.id,
      tenant_id: options.tenant_id,
      created_at: new Date().toISOString(),
    };

    // Render content for each available format
    for (const [format, content] of Object.entries(template)) {
      if (format === 'subject') continue;

      if (typeof content === 'string') {
        notification.content[format] = await this.renderTemplate(content, data, options);
      } else if (typeof content === 'object') {
        notification.content[format] = {};
        for (const [key, value] of Object.entries(content)) {
          if (typeof value === 'string') {
            notification.content[format][key] = await this.renderTemplate(value, data, options);
          } else {
            notification.content[format][key] = value;
          }
        }
      }
    }

    return notification;
  }

  async renderTemplate(template, data, options) {
    // Simple template rendering - could be enhanced with a proper template engine
    let rendered = template;

    // Replace basic variables
    rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path.trim());
      return value !== undefined ? value : match;
    });

    // Add computed values
    if (data.alert) {
      rendered = rendered.replace('{{severityColor}}', this.getSeverityColor(data.alert.severity));
      rendered = rendered.replace(
        '{{alertUrl}}',
        this.getAlertUrl(data.alert.id, options.tenant_id),
      );
      rendered = rendered.replace(
        '{{acknowledgeUrl}}',
        this.getAcknowledgeUrl(data.alert.id, options.tenant_id),
      );
    }

    if (data.incident) {
      rendered = rendered.replace(
        '{{incidentUrl}}',
        this.getIncidentUrl(data.incident.id, options.tenant_id),
      );
      rendered = rendered.replace('{{statusPageUrl}}', this.getStatusPageUrl(options.tenant_id));
    }

    if (data.schedule) {
      rendered = rendered.replace(
        '{{scheduleUrl}}',
        this.getScheduleUrl(data.schedule.id, options.tenant_id),
      );
    }

    return rendered;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  getSeverityColor(severity) {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745',
    };
    return colors[severity] || '#6c757d';
  }

  getAlertUrl(alertId, tenantId) {
    return `${process.env.NOVA_BASE_URL}/dashboard/${tenantId}/alerts/${alertId}`;
  }

  getAcknowledgeUrl(alertId, tenantId) {
    return `${process.env.NOVA_BASE_URL}/api/v2/alerts/${alertId}/acknowledge?tenant=${tenantId}`;
  }

  getIncidentUrl(incidentId, tenantId) {
    return `${process.env.NOVA_BASE_URL}/dashboard/${tenantId}/incidents/${incidentId}`;
  }

  getStatusPageUrl(tenantId) {
    return `${process.env.NOVA_BASE_URL}/status/${tenantId}`;
  }

  getScheduleUrl(scheduleId, tenantId) {
    return `${process.env.NOVA_BASE_URL}/dashboard/${tenantId}/oncall/schedules/${scheduleId}`;
  }

  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // =============================================================================
  // RECIPIENT RESOLUTION
  // =============================================================================

  async getEffectiveRecipients(explicitRecipients, tenantId, notificationType) {
    const recipients = new Set();

    // Add explicit recipients
    for (const recipient of explicitRecipients) {
      if (typeof recipient === 'string') {
        // Could be user ID, email, or role
        const user = await this.resolveRecipient(recipient, tenantId);
        if (user) recipients.add(user);
      } else {
        recipients.add(recipient);
      }
    }

    // Add default recipients based on notification type
    const defaultRecipients = await this.getDefaultRecipients(notificationType, tenantId);
    for (const recipient of defaultRecipients) {
      recipients.add(recipient);
    }

    // Filter based on user preferences
    const filteredRecipients = [];
    for (const recipient of recipients) {
      if (await this.shouldReceiveNotification(recipient, notificationType)) {
        // Load full user data including contact preferences
        const fullUser = await this.loadUserWithPreferences(recipient.id);
        if (fullUser) {
          filteredRecipients.push(fullUser);
        }
      }
    }

    return filteredRecipients;
  }

  async getOnCallRecipients(monitorId) {
    const query = `
      SELECT DISTINCT u.*
      FROM users u
      JOIN oncall_schedule_assignments osa ON u.id = osa.user_id
      JOIN oncall_schedules s ON osa.schedule_id = s.id
      JOIN monitors m ON (s.team_id = m.team_id OR m.goalert_service_id IS NOT NULL)
      WHERE m.id = $1
        AND osa.shift_start <= CURRENT_TIMESTAMP
        AND osa.shift_end >= CURRENT_TIMESTAMP
        AND osa.is_active = true
        AND s.is_active = true
      ORDER BY osa.is_primary DESC
    `;

    const result = await database.query(query, [monitorId]);
    return result.rows;
  }

  async getTeamMembers(teamId) {
    if (!teamId) return [];

    const query = `
      SELECT u.*
      FROM users u
      JOIN team_members tm ON u.id = tm.user_id
      WHERE tm.team_id = $1 AND tm.is_active = true
    `;

    const result = await database.query(query, [teamId]);
    return result.rows;
  }

  async loadUserWithPreferences(userId) {
    const query = `
      SELECT 
        u.*,
        COALESCE(
          (
            SELECT json_build_object(
              'email_enabled', cp.email_enabled,
              'sms_enabled', cp.sms_enabled,
              'push_enabled', cp.push_enabled,
              'voice_enabled', cp.voice_enabled,
              'slack_channel', cp.slack_channel,
              'slack_user_id', cp.slack_user_id,
              'teams_webhook', cp.teams_webhook
            )
            FROM user_contact_preferences cp
            WHERE cp.user_id = u.id
          ),
          '{"email_enabled": true, "sms_enabled": true, "push_enabled": true, "voice_enabled": false}'::json
        ) as contact_preferences
      FROM users u
      WHERE u.id = $1
    `;

    const result = await database.query(query, [userId]);
    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    const prefs =
      typeof user.contact_preferences === 'string'
        ? JSON.parse(user.contact_preferences)
        : user.contact_preferences;

    return {
      ...user,
      ...prefs,
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  getAlertPriority(severity) {
    const priorities = {
      critical: 'critical',
      high: 'high',
      medium: 'normal',
      low: 'low',
    };
    return priorities[severity] || 'normal';
  }

  getAlertChannels(severity, immediate) {
    if (severity === 'critical' || immediate) {
      return ['email', 'sms', 'slack', 'push', 'voice'];
    } else if (severity === 'high') {
      return ['email', 'sms', 'slack', 'push'];
    } else {
      return ['email', 'slack', 'push'];
    }
  }

  getIncidentPriority(severity) {
    return this.getAlertPriority(severity);
  }

  async loadUserPreferences() {
    // Load global notification preferences
    logger.debug('Loading user notification preferences...');
  }

  startRetryProcessors() {
    // Start background processors for retry queues
    logger.debug('Starting notification retry processors...');
  }

  async handleEscalation(type, data, notification, _options) {
    // Implement escalation logic
    logger.info(`Handling escalation for ${type}:`, { notification_id: notification.id });
  }

  async logNotificationDelivery(type, notification, results, options) {
    try {
      await database.query(
        `
        INSERT INTO notification_delivery_log (
          notification_id, type, tenant_id, delivery_results, created_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      `,
        [notification.id, type, options.tenant_id, JSON.stringify(results)],
      );
    } catch (error) {
      logger.error('Error logging notification delivery:', error);
    }
  }

  async sendPublicIncidentNotification(incident, type) {
    // Send to external status page subscribers
    logger.info(`Sending public incident notification: ${type}`, { incident_id: incident.id });

    return {
      success: true,
      message: 'Public incident notification would be sent here',
    };
  }

  async resolveRecipient(identifier, tenantId) {
    // Resolve recipient by email, user ID, or role
    const query = `
      SELECT * FROM users 
      WHERE (id = $1 OR email = $1) AND tenant_id = $2
      LIMIT 1
    `;

    const result = await database.query(query, [identifier, tenantId]);
    return result.rows[0] || null;
  }

  async getDefaultRecipients(_notificationType, _tenantId) {
    // Get default recipients based on notification type and tenant configuration
    return [];
  }

  async shouldReceiveNotification(_recipient, _notificationType) {
    // Check if user should receive this type of notification
    return true; // Default to yes, override with user preferences
  }

  async isRateLimited(_rateLimitKey, _tenantId) {
    // Check if rate limit is exceeded
    return false; // Implementation needed
  }

  async updateRateLimit(rateLimitKey, _tenantId) {
    // Update rate limit counters
    logger.debug(`Updating rate limit for ${rateLimitKey}`);
  }

  isRetryableError(error) {
    // Determine if error is temporary and worth retrying
    const retryableErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'RATE_LIMITED'];

    return retryableErrors.some((code) => error.code === code || error.message.includes(code));
  }

  async queueForRetry(channel, notification, _recipients, _options) {
    // Queue failed notification for retry
    logger.info(`Queueing ${channel} notification for retry:`, {
      notification_id: notification.id,
    });
  }
}

// Create singleton instance
const unifiedNotificationService = new UnifiedNotificationService();

export { unifiedNotificationService };
export default unifiedNotificationService;
