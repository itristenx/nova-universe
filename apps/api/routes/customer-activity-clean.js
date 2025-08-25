import express from 'express';
import { EmailCommunicationService } from '../services/email-communication.service.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import logger from '../logger.js';

const router = express.Router();
const communicationService = new EmailCommunicationService();

// Basic validation helpers
const isUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
const isValidDate = (str) => !isNaN(Date.parse(str));

/**
 * Get customer activity timeline
 * Provides comprehensive timeline of all customer interactions
 */
router.get(
  '/customers/:customerId/timeline',
  authenticateToken,
  validateRequest,
  async (req, res) => {
    try {
      const { customerId } = req.params;

      // Validate customer ID
      if (!isUUID(customerId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid customer ID is required',
        });
      }

      const {
        startDate,
        endDate,
        activityTypes,
        includeInternal = false,
        limit = 50,
        offset = 0,
      } = req.query;

      // Validate dates if provided
      if (startDate && !isValidDate(startDate)) {
        return res.status(400).json({
          success: false,
          error: 'Valid start date required',
        });
      }

      if (endDate && !isValidDate(endDate)) {
        return res.status(400).json({
          success: false,
          error: 'Valid end date required',
        });
      }

      const options = {
        startDate,
        endDate,
        activityTypes: activityTypes ? activityTypes.split(',') : [],
        includeInternal: includeInternal === 'true',
        limit: Math.min(parseInt(limit) || 50, 200),
        offset: parseInt(offset) || 0,
      };

      const timeline = await communicationService.getCustomerTimeline(customerId, options);

      res.json({
        success: true,
        data: {
          timeline,
          pagination: {
            limit: options.limit,
            offset: options.offset,
            hasMore: timeline.length === options.limit,
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching customer timeline:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer timeline',
      });
    }
  },
);

/**
 * Get ticket communication history
 * Shows all emails and communications related to a specific ticket
 */
router.get(
  '/tickets/:ticketId/communications',
  authenticateToken,
  validateRequest,
  async (req, res) => {
    try {
      const { ticketId } = req.params;

      if (!isUUID(ticketId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid ticket ID is required',
        });
      }

      const history = await communicationService.getTicketCommunicationHistory(ticketId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      logger.error('Error fetching ticket communication history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ticket communication history',
      });
    }
  },
);

/**
 * Get email conversation thread
 * Retrieves all emails in a conversation thread
 */
router.get('/conversations/:threadId', authenticateToken, validateRequest, async (req, res) => {
  try {
    const { threadId } = req.params;

    if (!threadId || typeof threadId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid thread ID is required',
      });
    }

    const conversation = await communicationService.getConversationThread(threadId);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    logger.error('Error fetching conversation thread:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation thread',
    });
  }
});

/**
 * Record email tracking event
 * Used by email tracking pixels and webhooks
 */
router.post('/emails/track', validateRequest, async (req, res) => {
  try {
    const {
      messageId,
      eventType,
      ipAddress,
      userAgent,
      location,
      deviceType,
      linkUrl,
      occurredAt,
    } = req.body;

    // Validate required fields
    if (!messageId || typeof messageId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message ID is required',
      });
    }

    const validEventTypes = [
      'DELIVERED',
      'OPENED',
      'CLICKED',
      'BOUNCED',
      'COMPLAINED',
      'UNSUBSCRIBED',
    ];
    if (!eventType || !validEventTypes.includes(eventType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid event type is required',
      });
    }

    const eventData = {
      ipAddress,
      userAgent,
      location,
      deviceType,
      linkUrl,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
    };

    const trackingEvent = await communicationService.recordTrackingEvent(
      messageId,
      eventType,
      eventData,
    );

    if (!trackingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Email not found',
      });
    }

    res.json({
      success: true,
      data: trackingEvent,
    });
  } catch (error) {
    logger.error('Error recording tracking event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record tracking event',
    });
  }
});

/**
 * Create custom activity timeline entry
 * Allows manual creation of timeline entries for external integrations
 */
router.post(
  '/customers/:customerId/timeline',
  authenticateToken,
  validateRequest,
  async (req, res) => {
    try {
      const { customerId } = req.params;

      if (!isUUID(customerId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid customer ID is required',
        });
      }

      const {
        activityType,
        title,
        description,
        summary,
        source,
        channel,
        ticketId,
        metadata,
        tags,
        isInternal,
        priorityLevel,
        occurredAt,
      } = req.body;

      // Validate required fields
      const validActivityTypes = [
        'EMAIL_SENT',
        'EMAIL_RECEIVED',
        'TICKET_CREATED',
        'TICKET_UPDATED',
        'TICKET_RESOLVED',
        'TICKET_CLOSED',
        'COMMENT_ADDED',
        'ATTACHMENT_ADDED',
        'PHONE_CALL',
        'CHAT_SESSION',
        'PORTAL_LOGIN',
        'FORM_SUBMITTED',
        'SURVEY_COMPLETED',
        'ESCALATION',
        'SLA_BREACH',
        'APPROVAL_REQUESTED',
        'WORKFLOW_STARTED',
        'AUTOMATED_ACTION',
        'SYSTEM_NOTIFICATION',
      ];

      if (!activityType || !validActivityTypes.includes(activityType)) {
        return res.status(400).json({
          success: false,
          error: 'Valid activity type is required',
        });
      }

      if (!title || typeof title !== 'string' || title.length === 0 || title.length > 255) {
        return res.status(400).json({
          success: false,
          error: 'Title is required and must be between 1 and 255 characters',
        });
      }

      const activityData = {
        customerId,
        userId: req.user.id,
        activityType,
        title,
        description,
        summary,
        source,
        channel,
        ticketId,
        metadata,
        tags,
        isInternal,
        priorityLevel,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      };

      const activity = await communicationService.createActivityTimelineEntry(activityData);

      res.status(201).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      logger.error('Error creating activity timeline entry:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create activity timeline entry',
      });
    }
  },
);

/**
 * Get email analytics and insights
 * Provides comprehensive email communication analytics
 */
router.get('/analytics/emails', authenticateToken, validateRequest, async (req, res) => {
  try {
    const { startDate, endDate, accountId, customerId, ticketId } = req.query;

    const options = {};
    if (startDate && isValidDate(startDate)) options.startDate = new Date(startDate);
    if (endDate && isValidDate(endDate)) options.endDate = new Date(endDate);
    if (accountId && isUUID(accountId)) options.accountId = accountId;
    if (customerId && isUUID(customerId)) options.customerId = customerId;
    if (ticketId && isUUID(ticketId)) options.ticketId = ticketId;

    const analytics = await communicationService.getEmailAnalytics(options);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error fetching email analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email analytics',
    });
  }
});

/**
 * Get customer communication summary
 * Provides overview of all customer communications
 */
router.get(
  '/customers/:customerId/communications/summary',
  authenticateToken,
  validateRequest,
  async (req, res) => {
    try {
      const { customerId } = req.params;

      if (!isUUID(customerId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid customer ID is required',
        });
      }

      // Get communication summary from database view
      const summary = await communicationService.prisma.$queryRaw`
        SELECT * FROM v_customer_communication_summary 
        WHERE customer_id = ${customerId}
      `;

      if (!summary.length) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found or no communications',
        });
      }

      res.json({
        success: true,
        data: summary[0],
      });
    } catch (error) {
      logger.error('Error fetching customer communication summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer communication summary',
      });
    }
  },
);

/**
 * Email engagement tracking pixel endpoint
 * 1x1 transparent pixel for tracking email opens
 */
router.get('/track/pixel/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Record the open event
    await communicationService.recordTrackingEvent(messageId, 'OPENED', {
      ipAddress,
      userAgent,
      occurredAt: new Date(),
    });

    // Return 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    res.end(pixel);
  } catch (error) {
    logger.error('Error tracking email open:', error);
    // Still return pixel even if tracking fails
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
    });
    res.end(pixel);
  }
});

/**
 * Email link click tracking endpoint
 * Redirects to original URL while tracking the click
 */
router.get('/track/click/:messageId', validateRequest, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required',
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Record the click event
    await communicationService.recordTrackingEvent(messageId, 'CLICKED', {
      ipAddress,
      userAgent,
      linkUrl: url,
      occurredAt: new Date(),
    });

    // Redirect to original URL
    res.redirect(302, url);
  } catch (error) {
    logger.error('Error tracking email click:', error);
    // Still redirect even if tracking fails
    const { url } = req.query;
    if (url) {
      res.redirect(302, url);
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid tracking link',
      });
    }
  }
});

export default router;
