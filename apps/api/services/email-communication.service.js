import { PrismaClient } from '@prisma/client';
import logger from '../logger.js';

const prisma = new PrismaClient();

/**
 * Email Communication Tracking Service
 * Provides comprehensive email tracking and customer activity timeline management
 * Inspired by Zendesk's communication tracking architecture
 */
export class EmailCommunicationService {
  constructor() {
    this.sentimentAnalyzer = null;
    this.urgencyDetector = null;
  }

  /**
   * Record email communication in the system
   * Creates comprehensive tracking entry with timeline integration
   */
  async recordEmailCommunication(emailData) {
    try {
      const {
        messageId,
        conversationId,
        inReplyTo,
        references,
        direction,
        fromAddress,
        toAddresses,
        ccAddresses = [],
        bccAddresses = [],
        subject,
        bodyText,
        bodyHtml,
        contentType = 'text/plain',
        headers = {},
        attachments = [],
        sentAt,
        receivedAt,
        ticketId = null,
        customerId = null,
        accountId = null,
      } = emailData;

      // Analyze email content for AI insights
      const aiInsights = await this.analyzeEmailContent(bodyText || bodyHtml, subject);

      // Calculate email size
      const sizeBytes = this.calculateEmailSize(bodyText, bodyHtml, attachments);

      // Create email communication record
      const emailComm = await prisma.emailCommunication.create({
        data: {
          messageId,
          conversationId:
            conversationId || this.generateConversationId(subject, fromAddress, toAddresses),
          inReplyTo,
          references,
          ticketId,
          customerId: customerId || (await this.findCustomerByEmail(fromAddress)),
          accountId,
          direction,
          fromAddress,
          toAddresses,
          ccAddresses,
          bccAddresses,
          subject,
          bodyText,
          bodyHtml,
          contentType,
          headers,
          sizeBytes,
          attachmentsCount: attachments.length,
          sentimentScore: aiInsights.sentiment,
          urgencyDetected: aiInsights.urgency,
          categoryDetected: aiInsights.category,
          intentDetected: aiInsights.intent,
          languageDetected: aiInsights.language,
          confidenceScore: aiInsights.confidence,
          sentAt,
          receivedAt: receivedAt || new Date(),
          status: 'RECEIVED',
        },
      });

      // Process attachments
      if (attachments.length > 0) {
        await this.processEmailAttachments(emailComm.id, attachments);
      }

      // Update/create conversation thread
      await this.updateConversationThread(emailComm);

      // Create activity timeline entry (handled by database trigger)

      logger.info(`Email communication recorded: ${messageId}`);
      return emailComm;
    } catch (error) {
      logger.error('Error recording email communication:', error);
      throw error;
    }
  }

  /**
   * Track outbound email with delivery and engagement metrics
   */
  async trackOutboundEmail(emailData, templateName = null, variables = {}) {
    try {
      const emailComm = await this.recordEmailCommunication({
        ...emailData,
        direction: 'OUTBOUND',
      });

      // Record template usage if applicable
      if (templateName) {
        await this.recordTemplateUsage(
          emailComm.id,
          templateName,
          variables,
          emailData.ticketId,
          emailData.customerId,
        );
      }

      // Set up tracking for delivery and engagement
      await this.setupEmailTracking(emailComm.id, emailData.messageId);

      return emailComm;
    } catch (error) {
      logger.error('Error tracking outbound email:', error);
      throw error;
    }
  }

  /**
   * Record email tracking event (opens, clicks, bounces)
   */
  async recordTrackingEvent(messageId, eventType, eventData = {}) {
    try {
      const emailComm = await prisma.emailCommunication.findUnique({
        where: { messageId },
      });

      if (!emailComm) {
        logger.warn(`Email communication not found for message ID: ${messageId}`);
        return null;
      }

      // Create tracking event
      const trackingEvent = await prisma.emailTrackingEvent.create({
        data: {
          emailId: emailComm.id,
          eventType,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
          location: eventData.location,
          deviceType: eventData.deviceType,
          linkUrl: eventData.linkUrl,
          providerEventId: eventData.providerEventId,
          providerData: eventData.providerData,
          occurredAt: eventData.occurredAt || new Date(),
        },
      });

      // Update email communication with tracking data
      const updateData = {};

      switch (eventType) {
        case 'DELIVERED':
          updateData.deliveryStatus = 'DELIVERED';
          break;
        case 'BOUNCED':
          updateData.deliveryStatus = 'BOUNCED';
          break;
        case 'OPENED':
          if (!emailComm.openedAt) {
            updateData.openedAt = trackingEvent.occurredAt;
          }
          updateData.openedCount = emailComm.openedCount + 1;
          break;
        case 'CLICKED':
          updateData.clickedCount = emailComm.clickedCount + 1;
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.emailCommunication.update({
          where: { id: emailComm.id },
          data: updateData,
        });
      }

      // Create activity timeline entry for significant events
      if (['OPENED', 'CLICKED', 'BOUNCED'].includes(eventType)) {
        await this.createActivityTimelineEntry({
          customerId: emailComm.customerId,
          activityType: 'EMAIL_ENGAGEMENT',
          emailId: emailComm.id,
          ticketId: emailComm.ticketId,
          title: `Email ${eventType.toLowerCase()}`,
          description: this.getTrackingEventDescription(eventType, eventData),
          source: 'email',
          channel: 'email',
          occurredAt: trackingEvent.occurredAt,
          metadata: eventData,
        });
      }

      logger.info(`Email tracking event recorded: ${eventType} for ${messageId}`);
      return trackingEvent;
    } catch (error) {
      logger.error('Error recording tracking event:', error);
      throw error;
    }
  }

  /**
   * Get customer communication timeline
   */
  async getCustomerTimeline(customerId, options = {}) {
    try {
      const {
        startDate,
        endDate,
        activityTypes = [],
        includeInternal = false,
        limit = 50,
        offset = 0,
      } = options;

      const whereClause = {
        customerId,
        AND: [],
      };

      if (startDate) {
        whereClause.AND.push({ occurredAt: { gte: new Date(startDate) } });
      }

      if (endDate) {
        whereClause.AND.push({ occurredAt: { lte: new Date(endDate) } });
      }

      if (activityTypes.length > 0) {
        whereClause.AND.push({ activityType: { in: activityTypes } });
      }

      if (!includeInternal) {
        whereClause.AND.push({ isInternal: false });
      }

      const activities = await prisma.customerActivityTimeline.findMany({
        where: whereClause,
        include: {
          ticket: {
            select: {
              ticketNumber: true,
              title: true,
              state: true,
              priority: true,
            },
          },
          email: {
            select: {
              messageId: true,
              subject: true,
              direction: true,
              fromAddress: true,
              toAddresses: true,
              sentAt: true,
              receivedAt: true,
              sentimentScore: true,
              urgencyDetected: true,
            },
          },
          comment: {
            select: {
              content: true,
              isInternal: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { occurredAt: 'desc' },
        take: limit,
        skip: offset,
      });

      // Enrich activities with additional context
      const enrichedActivities = await Promise.all(
        activities.map(async (activity) => {
          const enriched = { ...activity };

          // Add email engagement data for email activities
          if (activity.emailId) {
            const trackingEvents = await prisma.emailTrackingEvent.findMany({
              where: { emailId: activity.emailId },
              orderBy: { occurredAt: 'asc' },
            });
            enriched.emailEngagement = trackingEvents;
          }

          return enriched;
        }),
      );

      return enrichedActivities;
    } catch (error) {
      logger.error('Error getting customer timeline:', error);
      throw error;
    }
  }

  /**
   * Get ticket communication history
   */
  async getTicketCommunicationHistory(ticketId) {
    try {
      const communications = await prisma.emailCommunication.findMany({
        where: { ticketId },
        include: {
          attachments: true,
          trackingEvents: {
            orderBy: { occurredAt: 'asc' },
          },
        },
        orderBy: [{ sentAt: 'asc' }, { receivedAt: 'asc' }],
      });

      // Get related timeline activities
      const timelineActivities = await prisma.customerActivityTimeline.findMany({
        where: { ticketId },
        orderBy: { occurredAt: 'asc' },
      });

      return {
        communications,
        timelineActivities,
      };
    } catch (error) {
      logger.error('Error getting ticket communication history:', error);
      throw error;
    }
  }

  /**
   * Get email conversation thread
   */
  async getConversationThread(threadId) {
    try {
      const thread = await prisma.emailConversationThread.findUnique({
        where: { threadId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          primaryTicket: {
            select: {
              ticketNumber: true,
              title: true,
              state: true,
            },
          },
        },
      });

      if (!thread) {
        throw new Error(`Conversation thread not found: ${threadId}`);
      }

      const emails = await prisma.emailCommunication.findMany({
        where: { conversationId: threadId },
        include: {
          attachments: true,
          trackingEvents: true,
        },
        orderBy: [{ sentAt: 'asc' }, { receivedAt: 'asc' }],
      });

      return {
        thread,
        emails,
      };
    } catch (error) {
      logger.error('Error getting conversation thread:', error);
      throw error;
    }
  }

  /**
   * Get email analytics and insights
   */
  async getEmailAnalytics(options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate = new Date(),
        accountId,
        customerId,
        ticketId,
      } = options;

      const whereClause = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (accountId) whereClause.accountId = accountId;
      if (customerId) whereClause.customerId = customerId;
      if (ticketId) whereClause.ticketId = ticketId;

      // Get basic email metrics
      const [
        totalEmails,
        inboundEmails,
        outboundEmails,
        avgSentiment,
        urgencyBreakdown,
        deliveryStats,
        engagementStats,
      ] = await Promise.all([
        prisma.emailCommunication.count({ where: whereClause }),
        prisma.emailCommunication.count({ where: { ...whereClause, direction: 'INBOUND' } }),
        prisma.emailCommunication.count({ where: { ...whereClause, direction: 'OUTBOUND' } }),
        prisma.emailCommunication.aggregate({
          where: { ...whereClause, sentimentScore: { not: null } },
          _avg: { sentimentScore: true },
        }),
        prisma.emailCommunication.groupBy({
          by: ['urgencyDetected'],
          where: { ...whereClause, urgencyDetected: { not: null } },
          _count: true,
        }),
        prisma.emailCommunication.groupBy({
          by: ['deliveryStatus'],
          where: { ...whereClause, direction: 'OUTBOUND', deliveryStatus: { not: null } },
          _count: true,
        }),
        prisma.emailCommunication.aggregate({
          where: { ...whereClause, direction: 'OUTBOUND' },
          _avg: { openedCount: true, clickedCount: true },
          _sum: { openedCount: true, clickedCount: true },
        }),
      ]);

      // Get template performance
      const templatePerformance = await prisma.emailTemplateUsage.groupBy({
        by: ['templateName'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
        _avg: { openRate: true, clickRate: true, responseTimeHours: true },
      });

      return {
        summary: {
          totalEmails,
          inboundEmails,
          outboundEmails,
          avgSentiment: avgSentiment._avg.sentimentScore,
          responseRate: inboundEmails > 0 ? outboundEmails / inboundEmails : 0,
        },
        urgencyBreakdown,
        deliveryStats,
        engagement: {
          avgOpens: engagementStats._avg.openedCount,
          avgClicks: engagementStats._avg.clickedCount,
          totalOpens: engagementStats._sum.openedCount,
          totalClicks: engagementStats._sum.clickedCount,
          openRate:
            outboundEmails > 0 ? (engagementStats._sum.openedCount / outboundEmails) * 100 : 0,
        },
        templatePerformance,
      };
    } catch (error) {
      logger.error('Error getting email analytics:', error);
      throw error;
    }
  }

  /**
   * Create custom activity timeline entry
   */
  async createActivityTimelineEntry(activityData) {
    try {
      return await prisma.customerActivityTimeline.create({
        data: {
          customerId: activityData.customerId,
          activityType: activityData.activityType,
          ticketId: activityData.ticketId,
          emailId: activityData.emailId,
          commentId: activityData.commentId,
          userId: activityData.userId,
          title: activityData.title,
          description: activityData.description,
          summary: activityData.summary,
          source: activityData.source,
          channel: activityData.channel,
          ipAddress: activityData.ipAddress,
          userAgent: activityData.userAgent,
          sessionId: activityData.sessionId,
          metadata: activityData.metadata,
          tags: activityData.tags,
          isInternal: activityData.isInternal || false,
          isSystem: activityData.isSystem || false,
          priorityLevel: activityData.priorityLevel || 'NORMAL',
          occurredAt: activityData.occurredAt || new Date(),
        },
      });
    } catch (error) {
      logger.error('Error creating activity timeline entry:', error);
      throw error;
    }
  }

  // Private helper methods

  async analyzeEmailContent(_content, _subject) {
    // Placeholder for AI analysis - integrate with your AI service
    // In production, this would analyze the content and subject for:
    // - Sentiment analysis
    // - Urgency detection
    // - Category classification
    // - Intent recognition
    // - Language detection
    return {
      sentiment: Math.random() * 2 - 1, // -1 to 1
      urgency: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
      category: 'SUPPORT', // Would be determined by AI
      intent: 'REQUEST_HELP', // Would be determined by AI
      language: 'en',
      confidence: Math.random(),
    };
  }

  calculateEmailSize(bodyText, bodyHtml, attachments) {
    let size = 0;
    if (bodyText) size += Buffer.byteLength(bodyText, 'utf8');
    if (bodyHtml) size += Buffer.byteLength(bodyHtml, 'utf8');

    attachments.forEach((attachment) => {
      size += attachment.size || 0;
    });

    return size;
  }

  async findCustomerByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      return user?.id || null;
    } catch (error) {
      logger.warn(`Could not find customer by email ${email}:`, error.message);
      return null;
    }
  }

  generateConversationId(subject, fromAddress, toAddresses) {
    // Generate conversation ID based on normalized subject and participants
    const normalizedSubject = subject.toLowerCase().replace(/^(re:|fw:|fwd:)\s*/i, '');
    const participants = [fromAddress, ...toAddresses].sort().join(',');
    return `${Buffer.from(normalizedSubject + participants)
      .toString('base64')
      .substring(0, 32)}`;
  }

  async processEmailAttachments(emailId, attachments) {
    try {
      const attachmentRecords = attachments.map((attachment) => ({
        emailId,
        filename: attachment.filename,
        originalName: attachment.originalName || attachment.filename,
        mimeType: attachment.mimeType || 'application/octet-stream',
        fileSize: attachment.size || 0,
        contentId: attachment.contentId,
        fileKey: attachment.fileKey || attachment.filename,
        isInline: attachment.isInline || false,
        isSecure: attachment.isSecure || false,
        scannedForMalware: false,
        malwareStatus: 'SCANNING',
      }));

      await prisma.emailAttachment.createMany({
        data: attachmentRecords,
      });

      logger.info(`Processed ${attachments.length} attachments for email ${emailId}`);
    } catch (error) {
      logger.error('Error processing email attachments:', error);
      throw error;
    }
  }

  async updateConversationThread(emailComm) {
    // This is handled by database triggers, but could add additional logic here
    logger.debug(`Conversation thread updated for: ${emailComm.conversationId}`);
  }

  async setupEmailTracking(emailId, messageId) {
    // Set up tracking pixels, webhook registrations, etc.
    logger.debug(`Email tracking setup for: ${messageId}`);
  }

  async recordTemplateUsage(emailId, templateName, variables, ticketId, customerId) {
    try {
      await prisma.emailTemplateUsage.create({
        data: {
          templateName,
          templateVersion: '1.0', // Would track actual version
          emailId,
          ticketId,
          userId: customerId, // Assuming this tracks who the template was used for
          variablesUsed: variables,
          deliverySuccess: true, // Would be updated based on actual delivery
        },
      });
    } catch (error) {
      logger.error('Error recording template usage:', error);
    }
  }

  getTrackingEventDescription(eventType, eventData) {
    switch (eventType) {
      case 'OPENED':
        return `Email opened from ${eventData.ipAddress || 'unknown location'}`;
      case 'CLICKED':
        return `Link clicked: ${eventData.linkUrl || 'unknown link'}`;
      case 'BOUNCED':
        return `Email bounced: ${eventData.reason || 'delivery failed'}`;
      default:
        return `Email ${eventType.toLowerCase()}`;
    }
  }

  /**
   * Clean up old tracking data (for GDPR compliance)
   */
  async cleanupOldData(retentionDays = 365) {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      const deleted = await prisma.$transaction([
        prisma.emailTrackingEvent.deleteMany({
          where: { createdAt: { lt: cutoffDate } },
        }),
        prisma.customerActivityTimeline.deleteMany({
          where: {
            createdAt: { lt: cutoffDate },
            activityType: { in: ['EMAIL_ENGAGEMENT'] },
          },
        }),
      ]);

      logger.info(
        `Cleaned up old email tracking data: ${deleted[0].count} tracking events, ${deleted[1].count} timeline entries`,
      );
      return deleted;
    } catch (error) {
      logger.error('Error cleaning up old data:', error);
      throw error;
    }
  }
}

export default EmailCommunicationService;
