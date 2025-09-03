/**
 * Enhanced Email Tracking Service
 * Provides ServiceNow/Zendesk-style email tracking with threading and actions
 */

import crypto from 'crypto';
import { logger } from '../logger.js';
import { EmailCommunicationService } from './email-communication.service.js';
import { NotificationService } from './notification.service.js';

export class EnhancedEmailTrackingService extends EmailCommunicationService {
  constructor() {
    super();
    this.actionTokens = new Map(); // Store email action tokens
    this.threadTracker = new Map(); // Track email conversations
  }

  /**
   * Generate secure email tracking headers for thread continuation
   */
  generateTrackingHeaders(ticketId, originalMessageId = null) {
    const messageId = `<nova-${ticketId}-${Date.now()}-${crypto.randomUUID()}@nova.local>`;
    const conversationId = `nova-conversation-${ticketId}`;
    
    const headers = {
      'Message-ID': messageId,
      'X-Nova-Ticket-ID': ticketId,
      'X-Nova-Conversation-ID': conversationId,
      'X-Nova-Tracking': 'enabled'
    };

    // Add threading headers if this is a reply
    if (originalMessageId) {
      headers['In-Reply-To'] = originalMessageId;
      headers['References'] = originalMessageId;
    }

    return { messageId, conversationId, headers };
  }

  /**
   * Generate secure action tokens for email-based workflows
   */
  generateActionToken(action, context, expirationHours = 24) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    
    const actionData = {
      action,
      context,
      expiresAt,
      used: false,
      createdAt: new Date()
    };

    this.actionTokens.set(token, actionData);
    
    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();

    return token;
  }

  /**
   * Generate action URLs for email buttons
   */
  generateActionUrls(ticketId, workflowId = null, instanceId = null) {
    const baseUrl = process.env.PUBLIC_URL || 'https://nova.local';
    const context = { ticketId, workflowId, instanceId };

    const actions = {
      approve: {
        token: this.generateActionToken('approve', context),
        url: null
      },
      deny: {
        token: this.generateActionToken('deny', context),
        url: null
      },
      view: {
        url: `${baseUrl}/tickets/${ticketId}`
      },
      comment: {
        url: `${baseUrl}/tickets/${ticketId}#comment`
      }
    };

    // Generate action URLs with tokens
    actions.approve.url = `${baseUrl}/api/v1/email-actions/approve?token=${actions.approve.token}`;
    actions.deny.url = `${baseUrl}/api/v1/email-actions/deny?token=${actions.deny.token}`;

    return actions;
  }

  /**
   * Validate and process email action token
   */
  async processActionToken(token, userAgent = null, ipAddress = null) {
    const actionData = this.actionTokens.get(token);
    
    if (!actionData) {
      throw new Error('Invalid or expired action token');
    }

    if (actionData.used) {
      throw new Error('Action token has already been used');
    }

    if (new Date() > actionData.expiresAt) {
      this.actionTokens.delete(token);
      throw new Error('Action token has expired');
    }

    // Mark token as used
    actionData.used = true;
    actionData.usedAt = new Date();
    actionData.userAgent = userAgent;
    actionData.ipAddress = ipAddress;

    // Log the action for audit purposes
    await this.auditEmailAction(token, actionData);

    return actionData;
  }

  /**
   * Enhanced email sending with rich content and action buttons
   */
  async sendRichEmail(emailConfig) {
    try {
      const {
        to,
        subject,
        templateName,
        templateData = {},
        ticketId,
        workflowId,
        originalMessageId,
        actions = [],
        priority = 'normal',
        trackingEnabled = true
      } = emailConfig;

      // Generate tracking headers
      const tracking = trackingEnabled ? 
        this.generateTrackingHeaders(ticketId, originalMessageId) : {};

      // Generate action URLs if actions are requested
      let actionUrls = {};
      if (actions.length > 0) {
        actionUrls = this.generateActionUrls(ticketId, workflowId);
      }

      // Enhanced template data with actions
      const enrichedTemplateData = {
        ...templateData,
        actions: actionUrls,
        ticketUrl: `${process.env.PUBLIC_URL || 'https://nova.local'}/tickets/${ticketId}`,
        trackingPixel: trackingEnabled ? this.generateTrackingPixel(tracking.messageId) : null
      };

      // Send email using existing M365 service
      const m365Service = await import('./m365EmailService.js');
      await m365Service.default.sendEmail({
        to,
        subject,
        html: await this.renderTemplate(templateName, enrichedTemplateData),
        headers: tracking.headers
      });

      // Record email communication with enhanced tracking
      await this.recordEmailCommunication({
        messageId: tracking.messageId,
        conversationId: tracking.conversationId,
        direction: 'outbound',
        fromAddress: process.env.SYSTEM_EMAIL || 'noreply@nova.local',
        toAddresses: Array.isArray(to) ? to : [to],
        subject,
        bodyHtml: await this.renderTemplate(templateName, enrichedTemplateData),
        headers: tracking.headers,
        sentAt: new Date(),
        ticketId,
        metadata: {
          templateName,
          workflowId,
          actions: actions.map(action => ({ action, token: actionUrls[action]?.token })),
          priority
        }
      });

      logger.info(`Rich email sent successfully`, {
        ticketId,
        messageId: tracking.messageId,
        to,
        subject,
        actions
      });

      return {
        success: true,
        messageId: tracking.messageId,
        conversationId: tracking.conversationId,
        actions: actionUrls
      };

    } catch (error) {
      logger.error('Error sending rich email:', error);
      throw error;
    }
  }

  /**
   * Process email replies and route to appropriate ticket/workflow
   */
  async processEmailReply(emailData) {
    try {
      const {
        messageId,
        inReplyTo,
        references,
        from,
        subject,
        bodyText,
        bodyHtml,
        headers = {}
      } = emailData;

      // Extract ticket ID from headers or subject
      let ticketId = headers['X-Nova-Ticket-ID'];
      
      if (!ticketId && inReplyTo) {
        // Extract ticket ID from In-Reply-To header
        const match = inReplyTo.match(/nova-(\d+)-/);
        if (match) {
          ticketId = match[1];
        }
      }

      if (!ticketId) {
        // Try to extract from subject line
        const subjectMatch = subject.match(/\[NOVA-(\d+)\]/);
        if (subjectMatch) {
          ticketId = subjectMatch[1];
        }
      }

      if (!ticketId) {
        logger.warn('Could not determine ticket ID from email reply', { from, subject, inReplyTo });
        return { success: false, reason: 'Unable to determine ticket ID' };
      }

      // Record the reply
      await this.recordEmailCommunication({
        messageId,
        inReplyTo,
        references,
        direction: 'inbound',
        fromAddress: from,
        toAddresses: [headers['delivered-to'] || process.env.SYSTEM_EMAIL],
        subject,
        bodyText,
        bodyHtml,
        headers,
        receivedAt: new Date(),
        ticketId,
        metadata: {
          replyType: 'customer_reply',
          extractedFromHeaders: Boolean(headers['X-Nova-Ticket-ID'])
        }
      });

      // Add comment to ticket
      const ticketService = await import('./enhanced-ticket.service.js');
      await ticketService.TicketService.addComment(ticketId, {
        content: bodyText || bodyHtml,
        type: 'customer_reply',
        fromEmail: from,
        messageId,
        metadata: {
          emailReply: true,
          originalSubject: subject
        }
      });

      // Send notification to assigned technician
      await NotificationService.sendTicketUpdatedNotifications(
        { id: ticketId },
        { newComment: true },
        'customer'
      );

      logger.info(`Email reply processed successfully`, {
        ticketId,
        from,
        messageId
      });

      return {
        success: true,
        ticketId,
        messageId,
        action: 'comment_added'
      };

    } catch (error) {
      logger.error('Error processing email reply:', error);
      throw error;
    }
  }

  /**
   * Generate tracking pixel for email open tracking
   */
  generateTrackingPixel(messageId) {
    const baseUrl = process.env.PUBLIC_URL || 'https://nova.local';
    const trackingId = crypto.createHash('sha256').update(messageId).digest('hex').substring(0, 16);
    return `${baseUrl}/api/v1/email-tracking/pixel/${trackingId}.png`;
  }

  /**
   * Render email template with enhanced features
   */
  async renderTemplate(templateName, data) {
    const templateService = await import('./email-template.service.js');
    return templateService.default.renderTemplate(templateName, data);
  }

  /**
   * Audit email actions for compliance
   */
  async auditEmailAction(token, actionData) {
    try {
      const auditService = await import('./audit.service.js');
      await auditService.AuditService.logAction('email_action_executed', {
        token: token.substring(0, 8) + '...', // Partial token for audit
        action: actionData.action,
        context: actionData.context,
        usedAt: actionData.usedAt,
        userAgent: actionData.userAgent,
        ipAddress: actionData.ipAddress
      });
    } catch (error) {
      logger.error('Error auditing email action:', error);
    }
  }

  /**
   * Clean up expired action tokens
   */
  cleanupExpiredTokens() {
    const now = new Date();
    for (const [token, data] of this.actionTokens.entries()) {
      if (now > data.expiresAt) {
        this.actionTokens.delete(token);
      }
    }
  }

  /**
   * Get email thread for a ticket
   */
  async getEmailThread(ticketId) {
    try {
      // This would query the database for all emails related to a ticket
      // Implementation depends on your database structure
      const communications = await this.getTicketCommunications(ticketId);
      
      // Sort by timestamp and group by conversation
      const thread = communications
        .filter(comm => comm.channel === 'email')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(comm => ({
          messageId: comm.messageId,
          direction: comm.direction,
          from: comm.fromAddress,
          to: comm.toAddresses,
          subject: comm.subject,
          content: comm.bodyHtml || comm.bodyText,
          timestamp: comm.createdAt,
          attachments: comm.attachments || []
        }));

      return thread;
    } catch (error) {
      logger.error('Error getting email thread:', error);
      throw error;
    }
  }
}

export default new EnhancedEmailTrackingService();