import express from 'express';
import { EmailCommunicationService } from '../services/email-communication.service.js';
import { CustomerLinkingService } from '../services/customer-linking.service.js';
import { EmailDelayService } from '../services/email-delay.service.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import logger from '../logger.js';
import DOMPurify from 'isomorphic-dompurify';
import xss from 'xss';

const router = express.Router();
const communicationService = new EmailCommunicationService();
const customerLinkingService = new CustomerLinkingService();
const emailDelayService = new EmailDelayService();

// Enhanced validation and sanitization helpers
const isUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
const isValidDate = (str) => !isNaN(Date.parse(str));
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

/**
 * Sanitize input to prevent XSS and injection attacks
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove any HTML tags and dangerous characters
    return DOMPurify.sanitize(
      xss(input.trim(), {
        whiteList: {}, // No HTML allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style'],
      }),
    );
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item));
  }
  return input;
};

/**
 * Validate and sanitize request parameters
 */
const sanitizeAndValidateParams = (req, res, next) => {
  try {
    // Sanitize all input
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    if (req.query) {
      req.query = sanitizeInput(req.query);
    }
    if (req.params) {
      req.params = sanitizeInput(req.params);
    }

    next();
  } catch (error) {
    logger.error('Error sanitizing request:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid request format',
    });
  }
};

/**
 * Get customer activity timeline with RBAC
 * Provides comprehensive timeline of all customer interactions with proper access control
 */
router.get(
  '/customers/:customerId/timeline',
  authenticateToken,
  sanitizeAndValidateParams,
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
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        activityTypes: activityTypes
          ? activityTypes.split(',').map((type) => sanitizeInput(type))
          : [],
        includeInternal: includeInternal === 'true',
        limit: Math.min(parseInt(limit) || 50, 200),
        offset: parseInt(offset) || 0,
      };

      // Use RBAC-aware service to get customer activity
      const result = await customerLinkingService.getCustomerActivityWithRBAC(
        customerId,
        req.user.id,
        options,
      );

      res.json({
        success: true,
        data: {
          customer: result.customer,
          timeline: result.activities,
          permissions: result.permissions,
          pagination: {
            limit: options.limit,
            offset: options.offset,
            hasMore: result.activities.length === options.limit,
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching customer timeline:', error);

      if (error.message.includes('Insufficient permissions')) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Insufficient permissions to view this customer',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer timeline',
      });
    }
  },
);

/**
 * Get end user's own activity timeline
 * Allows end users to view their own activities across all accessible queues
 */
router.get(
  '/my-activity',
  authenticateToken,
  sanitizeAndValidateParams,
  validateRequest,
  async (req, res) => {
    try {
      const { startDate, endDate, activityTypes, limit = 100, offset = 0 } = req.query;

      // Validate dates
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
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        activityTypes: activityTypes
          ? activityTypes.split(',').map((type) => sanitizeInput(type))
          : [],
        limit: Math.min(parseInt(limit) || 100, 500),
        offset: parseInt(offset) || 0,
      };

      // Get end user's own activity
      const result = await customerLinkingService.getEndUserOwnActivity(req.user.id, options);

      res.json({
        success: true,
        data: {
          customer: result.customer,
          activities: result.activities,
          totalAccessibleQueues: result.totalAccessibleQueues,
          hiddenQueuesCount: result.hiddenQueuesCount,
          pagination: {
            limit: options.limit,
            offset: options.offset,
            hasMore: result.activities.length === options.limit,
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching user own activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch your activity timeline',
      });
    }
  },
);

/**
 * Get ticket communication history with RBAC
 * Shows all emails and communications related to a specific ticket
 */
router.get(
  '/tickets/:ticketId/communications',
  authenticateToken,
  sanitizeAndValidateParams,
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

/**
 * Schedule email with delay (allows for ticket updates)
 * Provides configurable delay to allow agents to make multiple changes
 */
router.post(
  '/emails/schedule',
  authenticateToken,
  sanitizeAndValidateParams,
  validateRequest,
  async (req, res) => {
    try {
      const {
        ticketId,
        templateKey,
        recipientEmail,
        recipientName,
        data,
        delayMs,
        priority = 'NORMAL',
      } = req.body;

      // Validate required fields
      if (!ticketId || !isUUID(ticketId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid ticket ID is required',
        });
      }

      if (!templateKey || typeof templateKey !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Template key is required',
        });
      }

      if (!recipientEmail || !isValidEmail(recipientEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Valid recipient email is required',
        });
      }

      // Schedule the email
      const result = await emailDelayService.scheduleEmail(
        {
          ticketId,
          templateKey,
          recipientEmail: sanitizeInput(recipientEmail),
          recipientName: sanitizeInput(recipientName) || 'Customer',
          data: sanitizeInput(data) || {},
          organizationId: req.user.organizationId,
          priority: sanitizeInput(priority),
        },
        delayMs,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error scheduling email:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to schedule email',
      });
    }
  },
);

/**
 * Cancel scheduled email
 * Allows cancellation of delayed emails when ticket is updated
 */
router.delete(
  '/emails/schedule/:ticketId',
  authenticateToken,
  sanitizeAndValidateParams,
  validateRequest,
  async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { reason } = req.query;

      if (!isUUID(ticketId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid ticket ID is required',
        });
      }

      const cancelled = await emailDelayService.cancelScheduledEmail(
        ticketId,
        sanitizeInput(reason) || 'Cancelled by user',
      );

      res.json({
        success: true,
        data: {
          cancelledCount: cancelled,
          ticketId,
        },
      });
    } catch (error) {
      logger.error('Error cancelling scheduled email:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel scheduled email',
      });
    }
  },
);

/**
 * Find or create customer (with Nova user linking)
 * Automatically links customers to Nova users when email matches
 */
router.post(
  '/customers/find-or-create',
  authenticateToken,
  sanitizeAndValidateParams,
  validateRequest,
  async (req, res) => {
    try {
      const { email, customerInfo } = req.body;

      if (!email || !isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Valid email address is required',
        });
      }

      // Sanitize customer info
      const sanitizedCustomerInfo = sanitizeInput(customerInfo) || {};

      // Find or create customer with Nova user linking
      const customer = await customerLinkingService.findOrCreateCustomer(sanitizeInput(email), {
        ...sanitizedCustomerInfo,
        organizationId: req.user.organizationId,
      });

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error('Error finding/creating customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to find or create customer',
      });
    }
  },
);

export default router;
