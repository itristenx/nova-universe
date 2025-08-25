import { PrismaClient } from '@prisma/client';
import logger from '../logger.js';
import { EmailCommunicationService } from './email-communication.service.js';
import EmailTemplateService from './email-template.service.js';

export class EmailDelayService {
  constructor() {
    this.prisma = new PrismaClient();
    this.communicationService = new EmailCommunicationService();
    this.templateService = new EmailTemplateService();
    this.delayedEmails = new Map(); // ticketId -> timeout
    this.defaultDelayMs = 30000; // 30 seconds default delay
    this.maxDelayMs = 300000; // 5 minutes maximum delay
  }

  /**
   * Schedule an email to be sent after a delay
   * Allows for cancellation if ticket is updated again
   */
  async scheduleEmail(emailData, delayMs = null) {
    try {
      const {
        ticketId,
        templateKey,
        recipientEmail,
        recipientName,
        data,
        organizationId,
        priority = 'NORMAL',
      } = emailData;

      // Get delay configuration
      const delay = delayMs || (await this.getEmailDelay(organizationId, templateKey, priority));

      // Cancel any existing scheduled email for this ticket
      if (this.delayedEmails.has(ticketId)) {
        clearTimeout(this.delayedEmails.get(ticketId));
        logger.info(`Cancelled previous scheduled email for ticket ${ticketId}`);
      }

      // For critical priority or escalations, send immediately
      if (priority === 'CRITICAL' || templateKey.includes('escalation')) {
        logger.info(`Sending immediate email for critical ticket ${ticketId}`);
        return await this.sendEmail(emailData);
      }

      // Store pending email in database
      const pendingEmail = await this.prisma.pendingEmail.create({
        data: {
          ticketId,
          templateKey,
          recipientEmail,
          recipientName,
          emailData: JSON.stringify(data),
          organizationId,
          priority,
          scheduledAt: new Date(Date.now() + delay),
          status: 'PENDING',
          createdAt: new Date(),
        },
      });

      // Schedule the email
      const timeout = setTimeout(async () => {
        try {
          await this.processPendingEmail(pendingEmail.id);
          this.delayedEmails.delete(ticketId);
        } catch (error) {
          logger.error(`Error processing delayed email for ticket ${ticketId}:`, error);
        }
      }, delay);

      this.delayedEmails.set(ticketId, timeout);

      logger.info(`Scheduled email for ticket ${ticketId} in ${delay}ms`);
      return {
        success: true,
        pendingEmailId: pendingEmail.id,
        scheduledAt: pendingEmail.scheduledAt,
        delay,
      };
    } catch (error) {
      logger.error('Error scheduling email:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled email
   */
  async cancelScheduledEmail(ticketId, reason = 'Ticket updated') {
    try {
      // Cancel in-memory timeout
      if (this.delayedEmails.has(ticketId)) {
        clearTimeout(this.delayedEmails.get(ticketId));
        this.delayedEmails.delete(ticketId);
      }

      // Update database record
      const cancelled = await this.prisma.pendingEmail.updateMany({
        where: {
          ticketId,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason,
          updatedAt: new Date(),
        },
      });

      if (cancelled.count > 0) {
        logger.info(
          `Cancelled ${cancelled.count} scheduled emails for ticket ${ticketId}: ${reason}`,
        );
      }

      return cancelled.count;
    } catch (error) {
      logger.error('Error cancelling scheduled email:', error);
      throw error;
    }
  }

  /**
   * Process a pending email
   */
  async processPendingEmail(pendingEmailId) {
    try {
      const pendingEmail = await this.prisma.pendingEmail.findUnique({
        where: { id: pendingEmailId },
      });

      if (!pendingEmail || pendingEmail.status !== 'PENDING') {
        logger.warn(`Pending email ${pendingEmailId} not found or not pending`);
        return;
      }

      // Check if ticket still exists and is in valid state
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: pendingEmail.ticketId },
        include: {
          customer: true,
          assignee: true,
          queue: true,
          organization: true,
        },
      });

      if (!ticket) {
        await this.prisma.pendingEmail.update({
          where: { id: pendingEmailId },
          data: {
            status: 'FAILED',
            errorMessage: 'Ticket not found',
            processedAt: new Date(),
          },
        });
        return;
      }

      // Parse email data
      const emailData = JSON.parse(pendingEmail.emailData);

      // Enhance data with current ticket state
      const enhancedData = {
        ...emailData,
        ticket: {
          ...ticket,
          // Get latest updates since email was scheduled
          updates: await this.getRecentTicketUpdates(ticket.id, pendingEmail.createdAt),
        },
        customer: ticket.customer,
        assignee: ticket.assignee,
        organization: ticket.organization,
        unsubscribeUrl: this.generateUnsubscribeUrl(
          ticket.customer.id,
          pendingEmail.organizationId,
        ),
      };

      // Send the email
      const emailResult = await this.sendEmail({
        ticketId: pendingEmail.ticketId,
        templateKey: pendingEmail.templateKey,
        recipientEmail: pendingEmail.recipientEmail,
        recipientName: pendingEmail.recipientName,
        data: enhancedData,
        organizationId: pendingEmail.organizationId,
        priority: pendingEmail.priority,
      });

      // Update pending email status
      await this.prisma.pendingEmail.update({
        where: { id: pendingEmailId },
        data: {
          status: emailResult.success ? 'SENT' : 'FAILED',
          processedAt: new Date(),
          emailId: emailResult.emailId || null,
          errorMessage: emailResult.error || null,
        },
      });

      logger.info(`Processed pending email ${pendingEmailId} for ticket ${pendingEmail.ticketId}`);
      return emailResult;
    } catch (error) {
      logger.error(`Error processing pending email ${pendingEmailId}:`, error);

      // Mark as failed
      await this.prisma.pendingEmail.update({
        where: { id: pendingEmailId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          processedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Send email immediately
   */
  async sendEmail(emailData) {
    try {
      const {
        ticketId,
        templateKey,
        recipientEmail,
        recipientName,
        data,
        organizationId,
        priority,
      } = emailData;

      // Render email template
      const renderedEmail = await this.templateService.renderTemplate(
        templateKey,
        data,
        organizationId,
      );

      // Add tracking parameters
      const trackingData = {
        ticketId,
        templateKey,
        recipientEmail,
        organizationId,
        priority,
      };

      // Send email through communication service
      const emailResult = await this.communicationService.trackOutboundEmail({
        ticketId,
        customerId: data.customer?.id,
        fromEmail: data.organization?.supportEmail || 'support@nova.com',
        fromName: data.organization?.name || 'Nova Support',
        toEmails: [recipientEmail],
        toNames: [recipientName],
        subject: renderedEmail.subject,
        bodyHtml: renderedEmail.bodyHtml,
        bodyText: renderedEmail.bodyText,
        templateKey,
        priority,
        metadata: {
          ...trackingData,
          delayProcessed: true,
          sentAt: new Date(),
        },
      });

      return {
        success: true,
        emailId: emailResult.id,
        messageId: emailResult.messageId,
      };
    } catch (error) {
      logger.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get email delay configuration
   */
  async getEmailDelay(organizationId, templateKey, priority) {
    try {
      // Get organization-specific delay settings
      const delayConfig = await this.prisma.emailDelayConfiguration.findFirst({
        where: {
          organizationId,
          templateKey,
          isActive: true,
        },
      });

      if (delayConfig) {
        return Math.min(delayConfig.delayMs, this.maxDelayMs);
      }

      // Check for template category defaults
      const categoryConfig = await this.prisma.emailDelayConfiguration.findFirst({
        where: {
          organizationId,
          templateCategory: this.getTemplateCategory(templateKey),
          isActive: true,
        },
      });

      if (categoryConfig) {
        return Math.min(categoryConfig.delayMs, this.maxDelayMs);
      }

      // Priority-based defaults
      const priorityDelays = {
        CRITICAL: 0, // Immediate
        HIGH: 10000, // 10 seconds
        NORMAL: this.defaultDelayMs, // 30 seconds
        LOW: 60000, // 1 minute
      };

      return priorityDelays[priority] || this.defaultDelayMs;
    } catch (error) {
      logger.error('Error getting email delay configuration:', error);
      return this.defaultDelayMs;
    }
  }

  /**
   * Get template category from template key
   */
  getTemplateCategory(templateKey) {
    if (templateKey.includes('customer')) return 'customer_notifications';
    if (templateKey.includes('agent')) return 'agent_notifications';
    if (templateKey.includes('escalation')) return 'system_notifications';
    return 'general';
  }

  /**
   * Get recent ticket updates since a timestamp
   */
  async getRecentTicketUpdates(ticketId, since) {
    try {
      const updates = await this.prisma.ticketUpdate.findMany({
        where: {
          ticketId,
          createdAt: {
            gt: since,
          },
        },
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      return updates;
    } catch (error) {
      logger.error('Error getting recent ticket updates:', error);
      return [];
    }
  }

  /**
   * Generate unsubscribe URL
   */
  generateUnsubscribeUrl(customerId, organizationId) {
    const baseUrl =
      process.env.PORTAL_BASE_URL ||
      process.env.WEB_BASE_URL ||
      process.env.BASE_URL ||
      'http://localhost:3000';
    return `${baseUrl}/unsubscribe?customer=${customerId}&org=${organizationId}`;
  }

  /**
   * Cleanup old pending emails
   */
  async cleanupOldPendingEmails() {
    try {
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      const deleted = await this.prisma.pendingEmail.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          status: {
            in: ['SENT', 'FAILED', 'CANCELLED'],
          },
        },
      });

      if (deleted.count > 0) {
        logger.info(`Cleaned up ${deleted.count} old pending emails`);
      }

      return deleted.count;
    } catch (error) {
      logger.error('Error cleaning up old pending emails:', error);
      throw error;
    }
  }

  /**
   * Get pending emails summary
   */
  async getPendingEmailsSummary(organizationId = null) {
    try {
      const where = organizationId ? { organizationId } : {};

      const summary = await this.prisma.pendingEmail.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
      });

      const result = {
        PENDING: 0,
        SENT: 0,
        FAILED: 0,
        CANCELLED: 0,
      };

      summary.forEach((item) => {
        result[item.status] = item._count.status;
      });

      return result;
    } catch (error) {
      logger.error('Error getting pending emails summary:', error);
      throw error;
    }
  }

  /**
   * Restart service and reload pending emails
   */
  async restartService() {
    try {
      // Clear existing timeouts
      for (const [_ticketId, timeout] of this.delayedEmails.entries()) {
        clearTimeout(timeout);
      }
      this.delayedEmails.clear();

      // Reload pending emails from database
      const pendingEmails = await this.prisma.pendingEmail.findMany({
        where: {
          status: 'PENDING',
          scheduledAt: {
            gt: new Date(),
          },
        },
      });

      for (const pendingEmail of pendingEmails) {
        const remainingDelay = Math.max(0, new Date(pendingEmail.scheduledAt) - new Date());

        if (remainingDelay > 0) {
          const timeout = setTimeout(async () => {
            try {
              await this.processPendingEmail(pendingEmail.id);
              this.delayedEmails.delete(pendingEmail.ticketId);
            } catch (error) {
              logger.error(
                `Error processing reloaded email for ticket ${pendingEmail.ticketId}:`,
                error,
              );
            }
          }, remainingDelay);

          this.delayedEmails.set(pendingEmail.ticketId, timeout);
        } else {
          // Process immediately if already due
          await this.processPendingEmail(pendingEmail.id);
        }
      }

      logger.info(`Restarted email delay service with ${pendingEmails.length} pending emails`);
      return pendingEmails.length;
    } catch (error) {
      logger.error('Error restarting email delay service:', error);
      throw error;
    }
  }
}

export default EmailDelayService;
