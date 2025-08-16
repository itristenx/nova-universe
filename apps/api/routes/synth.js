// nova-api/routes/synth.js
// Nova Synth - AI Engine Routes
import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { 
  startConversation, 
  sendMessage, 
  endConversation, 
  getConversationHistory,
  createEscalation,
  handleMCPRequest 
} from '../utils/cosmo.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AIInsight:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [ticket_suggestion, resolution_recommendation, pattern_detection, resource_optimization]
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *         relevantTickets:
 *           type: array
 *           items:
 *             type: string
 *         actionable:
 *           type: boolean
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v2/synth/tickets/process:
 *   post:
 *     tags: [Synth v2 - AI Ticket Processing]
 *     summary: Process ticket with AI analysis
 *     description: Analyze and enhance ticket data using AI including classification, customer matching, and duplicate detection
 *     security:
 *       - BearerAuth: []
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
 *                 minLength: 5
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *               category:
 *                 type: string
 *                 enum: [hardware, software, network, access, security, email, phone, other]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               requesterEmail:
 *                 type: string
 *                 format: email
 *               requesterName:
 *                 type: string
 *               location:
 *                 type: string
 *               useAI:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Ticket processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 processedTicket:
 *                   type: object
 *                 aiAnalysis:
 *                   type: object
 *                   properties:
 *                     classification:
 *                       type: object
 *                     customerMatch:
 *                       type: object
 *                     duplicateAnalysis:
 *                       type: object
 *                     suggestions:
 *                       type: array
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/tickets/process',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 30), // 30 requests per 15 minutes
  [
    body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('category').optional().isIn(['hardware', 'software', 'network', 'access', 'security', 'email', 'phone', 'other']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('requesterEmail').optional().isEmail().withMessage('Valid email required'),
    body('useAI').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { title, description, category, priority, requesterEmail, requesterName, location, useAI = true } = req.body;

      // Get MCP server and ticket processor
      const mcpServer = await initializeMCPServer();
      
      // Process ticket with AI if enabled
      if (useAI) {
        try {
          const result = await mcpServer.callTool('nova.tickets.create', {
            title,
            description,
            category,
            priority,
            location,
            requesterEmail,
            requesterName,
            useAI: true
          }, { userId: req.user.id });

          res.json({
            success: true,
            message: 'Ticket processed with AI enhancement',
            result: result.content[0].text,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          logger.error('AI ticket processing failed:', error);
          res.status(500).json({
            success: false,
            error: 'AI processing failed',
            fallback: 'Ticket will be created without AI enhancement'
          });
        }
      } else {
        // Process without AI
        const result = await mcpServer.callTool('nova.tickets.create', {
          title,
          description,
          category: category || 'other',
          priority: priority || 'medium',
          location,
          useAI: false
        }, { userId: req.user.id });

        res.json({
          success: true,
          message: 'Ticket created successfully',
          result: result.content[0].text,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Ticket processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process ticket',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/tickets/analyze:
 *   post:
 *     tags: [Synth v2 - AI Ticket Processing]
 *     summary: Analyze ticket content with AI
 *     description: Get AI analysis of ticket content without creating a ticket
 *     security:
 *       - BearerAuth: []
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
 *               requesterEmail:
 *                 type: string
 *                 format: email
 *               requesterName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analysis completed
 *       400:
 *         description: Invalid input
 */
router.post('/tickets/analyze',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 analyses per 15 minutes
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('requesterEmail').optional().isEmail()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { title, description, requesterEmail, requesterName } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.ai.analyze_ticket', {
        title,
        description,
        requesterEmail,
        requesterName
      });

      res.json({
        success: true,
        analysis: result.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Ticket analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Analysis failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/tickets/similar:
 *   post:
 *     tags: [Synth v2 - AI Ticket Processing]
 *     summary: Find similar tickets
 *     description: Find tickets similar to the provided content
 *     security:
 *       - BearerAuth: []
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
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 default: 5
 *     responses:
 *       200:
 *         description: Similar tickets found
 *       400:
 *         description: Invalid input
 */
router.post('/tickets/similar',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('limit').optional().isInt({ min: 1, max: 20 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { title, description, limit = 5 } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.ai.find_similar_tickets', {
        title,
        description,
        limit
      });

      res.json({
        success: true,
        similarTickets: result.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Similar tickets search error:', error);
      res.status(500).json({
        success: false,
        error: 'Similar tickets search failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/tickets/trends:
 *   get:
 *     tags: [Synth v2 - AI Ticket Processing]
 *     summary: Get ticket trends and patterns
 *     description: Get AI-powered analysis of ticket trends and patterns
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *     responses:
 *       200:
 *         description: Trends analysis retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/tickets/trends',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20), // 20 requests per 15 minutes
  async (req, res) => {
    try {
      const { timeframe = 'daily' } = req.query;

      if (!['daily', 'weekly', 'monthly'].includes(timeframe)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid timeframe. Must be daily, weekly, or monthly'
        });
      }

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.ai.get_trends', {
        timeframe
      });

      res.json({
        success: true,
        trends: result.content[0].text,
        timeframe,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Trends analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Trends analysis failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/customers/add:
 *   post:
 *     tags: [Synth v2 - AI Ticket Processing]
 *     summary: Add customer to AI database
 *     description: Add a customer to the AI customer matching database
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - domain
 *               - emails
 *             properties:
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *               contract:
 *                 type: string
 *                 enum: [standard, premium, enterprise]
 *                 default: standard
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               location:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer added successfully
 *       400:
 *         description: Invalid input
 */
router.post('/customers/add',
  authenticateJWT,
  createRateLimit(60 * 60 * 1000, 10), // 10 customers per hour
  [
    body('name').notEmpty().withMessage('Customer name is required'),
    body('domain').notEmpty().withMessage('Domain is required'),
    body('emails').isArray({ min: 1 }).withMessage('At least one email is required'),
    body('emails.*').isEmail().withMessage('Valid email addresses required'),
    body('contract').optional().isIn(['standard', 'premium', 'enterprise']),
    body('priority').optional().isIn(['low', 'medium', 'high'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { name, domain, emails, contract = 'standard', priority = 'medium', location, department } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.ai.add_customer', {
        name,
        domain,
        emails,
        contract,
        priority,
        location,
        department
      });

      res.json({
        success: true,
        message: result.content[0].text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Add customer error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add customer',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/analyze/ticket/{ticketId}:
 *   post:
 *     summary: Analyze ticket with AI
 *     description: Analyze a ticket using AI to provide insights and suggestions
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID to analyze
 *     responses:
 *       200:
 *         description: AI analysis results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     suggestedCategory:
 *                       type: string
 *                     suggestedPriority:
 *                       type: string
 *                     estimatedResolutionTime:
 *                       type: integer
 *                     similarTickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ticketId:
 *                             type: string
 *                           similarity:
 *                             type: number
 *                           resolution:
 *                             type: string
 *                     recommendedActions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     knowledgeBaseRecommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           kbId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           relevance:
 *                             type: number
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 */
router.post('/analyze/ticket/:ticketId',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 analyses per 15 minutes
  async (req, res) => {
    try {
      const { ticketId } = req.params;

      // Check if ticket exists
      db.get('SELECT * FROM tickets WHERE ticket_id = $1 AND deleted_at IS NULL', [ticketId], async (err, ticket) => {
        if (err) {
          logger.error('Error fetching ticket for analysis:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to analyze ticket',
            errorCode: 'TICKET_FETCH_ERROR'
          });
        }

        if (!ticket) {
          return res.status(404).json({
            success: false,
            error: 'Ticket not found',
            errorCode: 'TICKET_NOT_FOUND'
          });
        }

        // Simulate AI analysis (in production, this would call actual AI services)
        const analysis = await performTicketAnalysis(ticket);

        // Store analysis results
        const analysisId = require('uuid').v4();
        db.run(
          'INSERT INTO ai_analyses (id, ticket_id, analysis_type, results, confidence, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [analysisId, ticketId, 'ticket_analysis', JSON.stringify(analysis), analysis.confidence || 0.8, new Date().toISOString()],
          (insertErr) => {
            if (insertErr) {
              logger.error('Error storing AI analysis:', insertErr);
            }
          }
        );

        res.json({
          success: true,
          analysis
        });
      });
    } catch (error) {
      logger.error('Error in ticket analysis endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze ticket',
        errorCode: 'ANALYSIS_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/synth/insights:
 *   get:
 *     summary: Get AI insights
 *     description: Returns AI-generated insights about tickets, patterns, and system performance
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ticket_suggestion, resolution_recommendation, pattern_detection, resource_optimization]
 *         description: Filter by insight type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of insights to return
 *     responses:
 *       200:
 *         description: List of AI insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 insights:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIInsight'
 *       401:
 *         description: Unauthorized
 */
router.get('/insights',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const { type, limit = 20 } = req.query;

      // Generate or retrieve AI insights
      const insights = await generateAIInsights(type, parseInt(limit));

      res.json({
        success: true,
        insights
      });
    } catch (error) {
      logger.error('Error in insights endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch insights',
        errorCode: 'INSIGHTS_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/synth/predict/workload:
 *   get:
 *     summary: Predict workload
 *     description: Predict future ticket workload using AI
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: weekly
 *         description: Prediction period
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Workload prediction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 prediction:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                     confidence:
 *                       type: number
 *                     expectedTickets:
 *                       type: integer
 *                     peakDays:
 *                       type: array
 *                       items:
 *                         type: string
 *                     categoryBreakdown:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     recommendedStaffing:
 *                       type: object
 *                       properties:
 *                         currentStaff:
 *                           type: integer
 *                         recommendedStaff:
 *                           type: integer
 *                         justification:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/predict/workload',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 30), // 30 predictions per 15 minutes
  async (req, res) => {
    try {
      const { period = 'weekly', department } = req.query;

      // Get historical data
      db.all(`
        SELECT 
          DATE(created_at) as date,
          category,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at)) / 3600.0) as avg_resolution_hours
        FROM tickets 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        ${department ? 'AND department = $1' : ''}
        GROUP BY DATE(created_at), category
        ORDER BY date DESC
      `, department ? [department] : [], async (err, historicalData) => {
        if (err) {
          logger.error('Error fetching historical data:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to generate workload prediction',
            errorCode: 'HISTORICAL_DATA_ERROR'
          });
        }

        // Generate prediction based on historical data
        const prediction = await generateWorkloadPrediction(historicalData, period, department);

        res.json({
          success: true,
          prediction
        });
      });
    } catch (error) {
      logger.error('Error in workload prediction endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate workload prediction',
        errorCode: 'PREDICTION_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/synth/optimize/assignment:
 *   post:
 *     summary: Get optimal ticket assignment
 *     description: Use AI to determine the best technician for a ticket assignment
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketId
 *             properties:
 *               ticketId:
 *                 type: string
 *               availableTechnicians:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of technician user IDs
 *     responses:
 *       200:
 *         description: Optimal assignment recommendation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 recommendation:
 *                   type: object
 *                   properties:
 *                     recommendedTechnician:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         score:
 *                           type: number
 *                         reasoning:
 *                           type: string
 *                     alternatives:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           score:
 *                             type: number
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 */
router.post('/optimize/assignment',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 optimizations per 15 minutes
  [
    body('ticketId').isString().withMessage('Ticket ID is required'),
    body('availableTechnicians').optional().isArray().withMessage('Available technicians must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { ticketId, availableTechnicians } = req.body;

      // Get ticket details
      db.get('SELECT * FROM tickets WHERE ticket_id = $1 AND deleted_at IS NULL', [ticketId], async (err, ticket) => {
        if (err) {
          logger.error('Error fetching ticket for assignment optimization:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to optimize assignment',
            errorCode: 'TICKET_FETCH_ERROR'
          });
        }

        if (!ticket) {
          return res.status(404).json({
            success: false,
            error: 'Ticket not found',
            errorCode: 'TICKET_NOT_FOUND'
          });
        }

        // Get technician data
        let technicianQuery = `
          SELECT u.id, u.name, u.email,
                 COUNT(t.id) as current_tickets,
                 AVG(t.actual_time_minutes) as avg_resolution_time,
                 STRING_AGG(DISTINCT t.category, ',') as categories_handled
          FROM users u
          LEFT JOIN tickets t ON u.id = t.assigned_to_id AND t.status IN ('open', 'in_progress')
          WHERE u.role = 'technician' AND u.active = 1
        `;
        
        const params = [];
        if (availableTechnicians && availableTechnicians.length > 0) {
          const placeholders = availableTechnicians.map((_, i) => `$${i + 1}`).join(',');
          technicianQuery += ` AND u.id IN (${placeholders})`;
          params.push(...availableTechnicians);
        }
        
        technicianQuery += ' GROUP BY u.id, u.name, u.email';

        db.all(technicianQuery, params, async (techErr, technicians) => {
          if (techErr) {
            logger.error('Error fetching technicians:', techErr);
            return res.status(500).json({
              success: false,
              error: 'Failed to optimize assignment',
              errorCode: 'TECHNICIANS_FETCH_ERROR'
            });
          }

          // Generate assignment recommendation
          const recommendation = await optimizeAssignment(ticket, technicians);

          res.json({
            success: true,
            recommendation
          });
        });
      });
    } catch (error) {
      logger.error('Error in assignment optimization endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to optimize assignment',
        errorCode: 'OPTIMIZATION_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/synth/patterns:
 *   get:
 *     summary: Detect patterns in tickets
 *     description: Use AI to detect patterns and trends in ticket data
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Timeframe for pattern detection
 *     responses:
 *       200:
 *         description: Detected patterns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 patterns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       frequency:
 *                         type: string
 *                       impact:
 *                         type: string
 *                         enum: [low, medium, high]
 *                       recommendation:
 *                         type: string
 *                       relatedTickets:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/patterns',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 pattern detections per 15 minutes
  async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;

      // Convert timeframe to days
      const days = parseInt(timeframe.replace('d', ''));

      // Get ticket data for pattern analysis
      db.all(`
        SELECT 
          category,
          subcategory,
          priority,
          status,
          location,
          DATE(created_at) as date,
          EXTRACT(HOUR FROM created_at) as hour,
          EXTRACT(DOW FROM created_at) as day_of_week,
          description,
          title
        FROM tickets 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        AND deleted_at IS NULL
        ORDER BY created_at DESC
      `, [], async (err, tickets) => {
        if (err) {
          logger.error('Error fetching tickets for pattern detection:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to detect patterns',
            errorCode: 'PATTERN_DATA_ERROR'
          });
        }

        // Analyze patterns
        const patterns = await detectPatterns(tickets, timeframe);

        res.json({
          success: true,
          patterns
        });
      });
    } catch (error) {
      logger.error('Error in pattern detection endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to detect patterns',
        errorCode: 'PATTERN_ERROR'
      });
    }
  }
);

// Helper functions for AI processing (simulated)

async function performTicketAnalysis(ticket) {
  // Simulate AI analysis
  const keywords = ticket.description.toLowerCase().split(' ');
  
  // Simulate category suggestion based on keywords
  let suggestedCategory = ticket.category;
  let suggestedPriority = ticket.priority;
  
  if (keywords.includes('urgent') || keywords.includes('critical') || keywords.includes('down')) {
    suggestedPriority = 'high';
  }
  
  if (keywords.includes('password') || keywords.includes('login')) {
    suggestedCategory = 'Account & Access';
  } else if (keywords.includes('printer') || keywords.includes('hardware')) {
    suggestedCategory = 'Hardware';
  } else if (keywords.includes('software') || keywords.includes('application')) {
    suggestedCategory = 'Software';
  }

  return {
    suggestedCategory,
    suggestedPriority,
    estimatedResolutionTime: suggestedPriority === 'high' ? 240 : 480, // minutes
    similarTickets: [
      { ticketId: 'INC001234', similarity: 0.85, resolution: 'Password reset via admin portal' },
      { ticketId: 'INC000098', similarity: 0.72, resolution: 'Account unlocked after security verification' }
    ],
    recommendedActions: [
      'Check user account status',
      'Verify user identity',
      'Reset password if needed',
      'Test account access'
    ],
    knowledgeBaseRecommendations: [
      { kbId: 'KB-00001', title: 'Password Reset Procedures', relevance: 0.95 },
      { kbId: 'KB-00045', title: 'Account Lockout Troubleshooting', relevance: 0.78 }
    ],
    confidence: 0.82
  };
}

async function generateAIInsights(type, limit) {
  // Simulate AI-generated insights
  const insights = [
    {
      id: require('uuid').v4(),
      type: 'pattern_detection',
      title: 'Recurring Network Issues on Fridays',
      description: 'Pattern detected: Network connectivity issues spike by 40% on Friday afternoons',
      confidence: 0.89,
      relevantTickets: ['INC000234', 'REQ000256', 'INC000278'],
      actionable: true,
      metadata: {
        frequency: 'weekly',
        impact: 'medium',
        affectedUsers: 45
      },
      createdAt: new Date().toISOString()
    },
    {
      id: require('uuid').v4(),
      type: 'resource_optimization',
      title: 'Technician Workload Imbalance',
      description: 'AI detected workload imbalance: Tech A has 15 tickets, Tech B has 3 tickets',
      confidence: 0.95,
      relevantTickets: [],
      actionable: true,
      metadata: {
        suggestion: 'redistribute_workload',
        efficiency_gain: '23%'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: require('uuid').v4(),
      type: 'resolution_recommendation',
      title: 'Knowledge Base Gap Identified',
      description: 'Frequent tickets about VPN setup suggest missing KB article',
      confidence: 0.76,
      relevantTickets: ['INC000301', 'INC000315', 'REQ000332'],
      actionable: true,
      metadata: {
        topic: 'VPN Setup',
        frequency: 8,
        avg_resolution_time: 45
      },
      createdAt: new Date().toISOString()
    }
  ];

  if (type) {
    return insights.filter(insight => insight.type === type).slice(0, limit);
  }

  return insights.slice(0, limit);
}

async function generateWorkloadPrediction(historicalData, period, department) {
  // Simulate workload prediction based on historical data
  const avgTicketsPerDay = historicalData.length > 0 ? 
    historicalData.reduce((sum, d) => sum + d.count, 0) / historicalData.length : 10;

  const multiplier = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
  const expectedTickets = Math.round(avgTicketsPerDay * multiplier * 1.1); // 10% growth assumption

  return {
    period,
    confidence: 0.78,
    expectedTickets,
    peakDays: period === 'weekly' ? ['Monday', 'Wednesday'] : ['Monday', 'Tuesday', 'Wednesday'],
    categoryBreakdown: {
      'Hardware': Math.round(expectedTickets * 0.3),
      'Software': Math.round(expectedTickets * 0.25),
      'Network': Math.round(expectedTickets * 0.2),
      'Account & Access': Math.round(expectedTickets * 0.15),
      'Other': Math.round(expectedTickets * 0.1)
    },
    recommendedStaffing: {
      currentStaff: 5,
      recommendedStaff: expectedTickets > 50 ? 6 : 5,
      justification: expectedTickets > 50 ? 
        'Predicted workload increase requires additional technician' : 
        'Current staffing adequate for predicted workload'
    }
  };
}

async function optimizeAssignment(ticket, technicians) {
  // Simulate AI assignment optimization
  const scores = technicians.map(tech => {
    let score = 100;
    
    // Reduce score based on current workload
    score -= (tech.current_tickets || 0) * 10;
    
    // Boost score if technician has handled this category before
    if (tech.categories_handled && tech.categories_handled.includes(ticket.category)) {
      score += 20;
    }
    
    // Adjust for average resolution time (lower is better)
    if (tech.avg_resolution_time) {
      score -= (tech.avg_resolution_time / 60) * 2; // penalty for longer resolution times
    }
    
    return {
      id: tech.id,
      name: tech.name,
      score: Math.max(0, Math.min(100, score)),
      currentWorkload: tech.current_tickets || 0,
      expertise: tech.categories_handled ? tech.categories_handled.split(',') : []
    };
  });

  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  const reasoning = `Recommended based on: ${best.currentWorkload < 5 ? 'low workload, ' : ''}${best.expertise.includes(ticket.category) ? 'category expertise, ' : ''}optimal balance of availability and skills`;

  return {
    recommendedTechnician: {
      id: best.id,
      name: best.name,
      score: best.score,
      reasoning
    },
    alternatives: scores.slice(1, 3).map(tech => ({
      id: tech.id,
      name: tech.name,
      score: tech.score
    }))
  };
}

async function detectPatterns(tickets, timeframe) {
  // Simulate pattern detection
  const patterns = [];

  // Time-based patterns
  const hourCounts = {};
  const dayOfWeekCounts = {};
  const categoryLocationCounts = {};

  tickets.forEach(ticket => {
    // Hour patterns
    hourCounts[ticket.hour] = (hourCounts[ticket.hour] || 0) + 1;
    
    // Day of week patterns
    dayOfWeekCounts[ticket.day_of_week] = (dayOfWeekCounts[ticket.day_of_week] || 0) + 1;
    
    // Category-location patterns
    const key = `${ticket.category}-${ticket.location}`;
    categoryLocationCounts[key] = (categoryLocationCounts[key] || 0) + 1;
  });

  // Find peak hour
  const peakHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);
  if (hourCounts[peakHour] > tickets.length * 0.2) {
    patterns.push({
      type: 'temporal',
      description: `Peak ticket volume occurs at ${peakHour}:00`,
      frequency: 'daily',
      impact: 'medium',
      recommendation: 'Consider staffing adjustments during peak hours',
        relatedTickets: tickets.filter(t => t.hour === peakHour).slice(0, 5).map(t => t.id || `INC${Math.random().toString().slice(2,8).padStart(6,'0')}`)
    });
  }

  // Find problematic location-category combinations
  Object.entries(categoryLocationCounts).forEach(([key, count]) => {
    if (count > 3) {
      const [category, location] = key.split('-');
      patterns.push({
        type: 'location_category',
        description: `High frequency of ${category} issues in ${location}`,
        frequency: `${count} times in ${timeframe}`,
        impact: count > 10 ? 'high' : count > 5 ? 'medium' : 'low',
        recommendation: `Investigate infrastructure or training needs for ${category} in ${location}`,
        relatedTickets: tickets.filter(t => t.category === category && t.location === location).slice(0, 5).map(t => t.id || `INC${Math.random().toString().slice(2,8).padStart(6,'0')}`)
      });
    }
  });

  return patterns;
}

// ========================================================================
// COSMO CONVERSATION ENDPOINTS
// ========================================================================

/**
 * @swagger
 * /api/v2/synth/conversation/start:
 *   post:
 *     summary: Start a new conversation with Cosmo
 *     description: Initialize a new AI conversation session
 *     tags: [Synth - Cosmo AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *               context:
 *                 type: object
 *                 properties:
 *                   module:
 *                     type: string
 *                     enum: [pulse, orbit, comms, beacon]
 *                   ticketId:
 *                     type: string
 *                   userRole:
 *                     type: string
 *                   capabilities:
 *                     type: array
 *                     items:
 *                       type: string
 *               initialMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conversation started successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/conversation/start',
  authenticateJWT,
  createRateLimit(60 * 1000, 10), // 10 conversations per minute
  [
    body('conversationId').isUUID().withMessage('Valid conversation ID required'),
    body('context.module').isIn(['pulse', 'orbit', 'comms', 'beacon']).withMessage('Valid module required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { conversationId, context, initialMessage } = req.body;
      const userId = req.user.id;
      const tenantId = req.user.tenant_id;

      const conversation = await startConversation(conversationId, userId, tenantId, context, initialMessage);

      res.json({
        success: true,
        conversation
      });
    } catch (error) {
      logger.error('Error starting conversation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start conversation',
        errorCode: 'CONVERSATION_START_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/conversation/{id}/send:
 *   post:
 *     summary: Send a message in a conversation
 *     description: Send a message to Cosmo and get a response
 *     tags: [Synth - Cosmo AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Message sent and response received
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.post('/conversation/:id/send',
  authenticateJWT,
  createRateLimit(60 * 1000, 30), // 30 messages per minute
  [
    body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id: conversationId } = req.params;
      const { message, context } = req.body;
      const userId = req.user.id;

      const response = await sendMessage(conversationId, userId, message, context);

      res.json({
        success: true,
        message: response.message,
        metadata: response.metadata,
        actions: response.actions
      });
    } catch (error) {
      logger.error('Error sending message:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
          errorCode: 'CONVERSATION_NOT_FOUND'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to send message',
        errorCode: 'MESSAGE_SEND_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/conversation/{id}:
 *   get:
 *     summary: Get conversation history
 *     description: Retrieve the history of a conversation
 *     tags: [Synth - Cosmo AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation history retrieved
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.get('/conversation/:id',
  authenticateJWT,
  async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const userId = req.user.id;

      const conversation = await getConversationHistory(conversationId, userId);

      res.json({
        success: true,
        conversation
      });
    } catch (error) {
      logger.error('Error getting conversation history:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
          errorCode: 'CONVERSATION_NOT_FOUND'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get conversation history',
        errorCode: 'CONVERSATION_HISTORY_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/conversation/{id}:
 *   delete:
 *     summary: End a conversation
 *     description: End and archive a conversation
 *     tags: [Synth - Cosmo AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation ended successfully
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/conversation/:id',
  authenticateJWT,
  async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const userId = req.user.id;

      await endConversation(conversationId, userId);

      res.json({
        success: true,
        message: 'Conversation ended successfully'
      });
    } catch (error) {
      logger.error('Error ending conversation:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
          errorCode: 'CONVERSATION_NOT_FOUND'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to end conversation',
        errorCode: 'CONVERSATION_END_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/escalation/create:
 *   post:
 *     summary: Create an escalation
 *     description: Create an escalation for technical support
 *     tags: [Synth - Cosmo AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *               ticketId:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               reason:
 *                 type: string
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Escalation created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/escalation/create',
  authenticateJWT,
  createRateLimit(60 * 1000, 5), // 5 escalations per minute
  [
    body('conversationId').isUUID().withMessage('Valid conversation ID required'),
    body('level').isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid escalation level required'),
    body('reason').isString().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { conversationId, ticketId, level, reason, context } = req.body;
      const userId = req.user.id;
      const tenantId = req.user.tenant_id;

      const escalation = await createEscalation(conversationId, userId, tenantId, {
        ticketId,
        level,
        reason,
        context
      });

      res.json({
        success: true,
        escalation
      });
    } catch (error) {
      logger.error('Error creating escalation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create escalation',
        errorCode: 'ESCALATION_CREATE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/chat:
 *   post:
 *     summary: Legacy chat endpoint
 *     description: Legacy endpoint for simple chat interactions (backward compatibility)
 *     tags: [Synth - Cosmo AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat response
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/chat',
  authenticateJWT,
  createRateLimit(60 * 1000, 20), // 20 messages per minute
  [
    body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { message } = req.body;
      const userId = req.user.id;
      const tenantId = req.user.tenant_id;

      // Create a temporary conversation for legacy support
      const conversationId = require('uuid').v4();
      const context = {
        module: 'orbit',
        userRole: req.user.role || 'user',
        capabilities: ['basic_chat']
      };

      await startConversation(conversationId, userId, tenantId, context);
      const response = await sendMessage(conversationId, userId, message, { legacy: true });

      res.json({
        success: true,
        message: response.message
      });
    } catch (error) {
      logger.error('Error in legacy chat endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message',
        errorCode: 'CHAT_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/mcp:
 *   post:
 *     summary: Model Context Protocol endpoint
 *     description: Handle MCP requests for tool integration
 *     tags: [Synth - MCP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: MCP request handled
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/mcp',
  authenticateJWT,
  createRateLimit(60 * 1000, 50), // 50 MCP requests per minute
  async (req, res) => {
    try {
      const userId = req.user.id;
      const tenantId = req.user.tenant_id;
      const mcpRequest = req.body;

      const response = await handleMCPRequest(userId, tenantId, mcpRequest);

      res.json(response);
    } catch (error) {
      logger.error('Error handling MCP request:', error);
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: req.body.id || null
      });
    }
  }
);

export default router;
