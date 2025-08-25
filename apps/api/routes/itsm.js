import express from 'express';
import { PrismaClient } from '@prisma/client';
import { EnhancedTicketService } from '../services/enhanced-ticket.service.js';
import { AutoClassificationService } from '../services/autoClassification.service.js';
import { WorkflowService } from '../services/workflow.service.js';
import { logger } from '../logger.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads/tickets');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Security: restrict file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/itsm/tickets:
 *   get:
 *     summary: Get tickets with advanced filtering and search
 *     tags: [ITSM Tickets]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: slaStatus
 *         schema:
 *           type: string
 *           enum: [ok, warning, breach]
 *     responses:
 *       200:
 *         description: List of tickets with metadata
 */
router.get('/tickets', async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 20, 100),
      search: req.query.search,
      category: req.query.category,
      status: req.query.status,
      priority: req.query.priority,
      assignedTo: req.query.assignedTo,
      slaStatus: req.query.slaStatus,
      dateRange: {
        from: req.query.dateFrom,
        to: req.query.dateTo,
      },
    };

    const result = await EnhancedTicketService.searchTickets(filters, req.user);

    res.json({
      success: true,
      data: result.tickets,
      meta: {
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(result.total / filters.limit),
        aggregations: result.aggregations,
      },
    });
  } catch (error) {
    logger.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets',
      code: 'TICKETS_FETCH_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/tickets:
 *   post:
 *     summary: Create a new ticket with auto-classification
 *     tags: [ITSM Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               urgency:
 *                 type: string
 *               impact:
 *                 type: string
 *               requestedFor:
 *                 type: string
 *               templateId:
 *                 type: string
 *               templateVariables:
 *                 type: object
 *     responses:
 *       201:
 *         description: Ticket created successfully
 */
router.post('/tickets', upload.array('attachments', 5), async (req, res) => {
  try {
    const ticketData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      subcategory: req.body.subcategory,
      priority: req.body.priority,
      urgency: req.body.urgency,
      impact: req.body.impact,
      requesterId: req.user.id,
      requestedFor: req.body.requestedFor || req.user.id,
      contactMethod: req.body.contactMethod || 'EMAIL',
      location: req.body.location,
      businessJustification: req.body.businessJustification,
    };

    // Handle template-based creation
    if (req.body.templateId) {
      const templateData = {
        templateId: req.body.templateId,
        variables: JSON.parse(req.body.templateVariables || '{}'),
      };

      const ticket = await EnhancedTicketService.createFromTemplate(templateData, req.user);
      return res.status(201).json({
        success: true,
        data: ticket,
        message: 'Ticket created from template successfully',
      });
    }

    // Auto-classify the ticket
    const classification = await AutoClassificationService.classifyTicket(ticketData);

    // Merge classification results
    Object.assign(ticketData, {
      category: ticketData.category || classification.category,
      subcategory: ticketData.subcategory || classification.subcategory,
      priority: ticketData.priority || classification.priority,
      urgency: ticketData.urgency || classification.urgency,
      impact: ticketData.impact || classification.impact,
    });

    // Create the ticket
    const ticket = await EnhancedTicketService.createTicket(ticketData, req.user);

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      await EnhancedTicketService.addAttachments(ticket.id, req.files, req.user);
    }

    // Auto-assign if suggested
    if (classification.suggestedAssignee) {
      await EnhancedTicketService.assignTicket(
        ticket.id,
        classification.suggestedAssignee,
        req.user,
        'Auto-assigned based on classification',
      );
    }

    // Start workflow if applicable
    const applicableWorkflow = await WorkflowService.findApplicableWorkflow(ticket);
    if (applicableWorkflow) {
      await WorkflowService.startWorkflow(ticket.id, applicableWorkflow.id, req.user);
    }

    res.status(201).json({
      success: true,
      data: {
        ...ticket,
        classification: {
          confidence: classification.confidence,
          reasoning: classification.reasoning,
          similarTickets: classification.similarTickets,
        },
      },
      message: 'Ticket created successfully',
    });
  } catch (error) {
    logger.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create ticket',
      code: 'TICKET_CREATE_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/tickets/{ticketId}:
 *   get:
 *     summary: Get ticket details with full context
 *     tags: [ITSM Tickets]
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed ticket information
 */
router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const ticket = await EnhancedTicketService.getTicketById(req.params.ticketId, req.user);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        code: 'TICKET_NOT_FOUND',
      });
    }

    // Get additional context
    const [comments, attachments, slaStatus, workflowStatus, relatedTickets] = await Promise.all([
      EnhancedTicketService.getTicketComments(req.params.ticketId),
      EnhancedTicketService.getTicketAttachments(req.params.ticketId),
      EnhancedTicketService.getSLAStatus(req.params.ticketId),
      EnhancedTicketService.getWorkflowStatus(req.params.ticketId),
      EnhancedTicketService.getRelatedTickets(req.params.ticketId),
    ]);

    res.json({
      success: true,
      data: {
        ...ticket,
        comments,
        attachments,
        slaStatus,
        workflowStatus,
        relatedTickets,
      },
    });
  } catch (error) {
    logger.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket',
      code: 'TICKET_FETCH_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/tickets/{ticketId}:
 *   put:
 *     summary: Update ticket with audit trail
 *     tags: [ITSM Tickets]
 */
router.put('/tickets/:ticketId', async (req, res) => {
  try {
    const updates = req.body;
    const ticket = await EnhancedTicketService.updateTicket(req.params.ticketId, updates, req.user);

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket updated successfully',
    });
  } catch (error) {
    logger.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ticket',
      code: 'TICKET_UPDATE_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/tickets/{ticketId}/comments:
 *   post:
 *     summary: Add comment to ticket
 */
router.post('/tickets/:ticketId/comments', async (req, res) => {
  try {
    const comment = await EnhancedTicketService.addComment(
      req.params.ticketId,
      {
        content: req.body.content,
        isInternal: req.body.isInternal || false,
        notifyCustomer: req.body.notifyCustomer || true,
      },
      req.user,
    );

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    });
  } catch (error) {
    logger.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment',
      code: 'COMMENT_ADD_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/tickets/{ticketId}/assign:
 *   post:
 *     summary: Assign ticket to agent
 */
router.post('/tickets/:ticketId/assign', async (req, res) => {
  try {
    const { assigneeId, notes } = req.body;

    await EnhancedTicketService.assignTicket(req.params.ticketId, assigneeId, req.user, notes);

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
    });
  } catch (error) {
    logger.error('Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign ticket',
      code: 'TICKET_ASSIGN_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/tickets/{ticketId}/resolve:
 *   post:
 *     summary: Resolve ticket with solution
 */
router.post('/tickets/:ticketId/resolve', async (req, res) => {
  try {
    const { resolution, resolutionCategory, rootCause } = req.body;

    const ticket = await EnhancedTicketService.resolveTicket(
      req.params.ticketId,
      {
        resolution,
        resolutionCategory,
        rootCause,
        preventionSteps: req.body.preventionSteps,
        knowledgeBase: req.body.createKnowledgeArticle,
      },
      req.user,
    );

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket resolved successfully',
    });
  } catch (error) {
    logger.error('Error resolving ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve ticket',
      code: 'TICKET_RESOLVE_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/templates:
 *   get:
 *     summary: Get available ticket templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await EnhancedTicketService.getTicketTemplates(req.user);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
      code: 'TEMPLATES_FETCH_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/categories:
 *   get:
 *     summary: Get ticket categories and subcategories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await EnhancedTicketService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      code: 'CATEGORIES_FETCH_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/sla/status:
 *   get:
 *     summary: Get SLA status dashboard
 */
router.get('/sla/status', async (req, res) => {
  try {
    const slaStatus = await EnhancedTicketService.getSLADashboard(req.user);

    res.json({
      success: true,
      data: slaStatus,
    });
  } catch (error) {
    logger.error('Error fetching SLA status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SLA status',
      code: 'SLA_STATUS_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/analytics/dashboard:
 *   get:
 *     summary: Get ITSM analytics dashboard data
 */
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const analytics = await EnhancedTicketService.getAnalyticsDashboard(req.user);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      code: 'ANALYTICS_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/v1/itsm/search:
 *   post:
 *     summary: Advanced ticket search with full-text capabilities
 */
router.post('/search', async (req, res) => {
  try {
    const searchParams = {
      query: req.body.query,
      filters: req.body.filters || {},
      sort: req.body.sort || { field: 'createdAt', direction: 'desc' },
      page: req.body.page || 1,
      limit: Math.min(req.body.limit || 20, 100),
    };

    const results = await EnhancedTicketService.advancedSearch(searchParams, req.user);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('Error in advanced search:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      code: 'SEARCH_ERROR',
    });
  }
});

export default router;
