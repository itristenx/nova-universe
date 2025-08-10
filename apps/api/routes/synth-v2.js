// nova-api/routes/synth.js
// Nova Synth - AI Orchestration Engine API Routes
// Implements the complete Nova Synth specification with MCP support

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
  handleMCPRequest,
  initializeMCPServer 
} from '../utils/cosmo.js';

const router = express.Router();

// ========================================================================
// 1. CONVERSATION MANAGEMENT
// ========================================================================

/**
 * @swagger
 * /api/v2/synth/conversation/start:
 *   post:
 *     tags: [Synth v2 - Conversation]
 *     summary: Start a new conversation with Cosmo
 *     description: Initialize a new AI conversation session with contextual setup
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               context:
 *                 type: object
 *                 properties:
 *                   module:
 *                     type: string
 *                     enum: [pulse, orbit, comms, beacon, core]
 *                     description: Nova module context
 *                   ticketId:
 *                     type: string
 *                     description: Associated ticket ID if applicable
 *                   userRole:
 *                     type: string
 *                     enum: [user, technician, admin]
 *                   department:
 *                     type: string
 *                   location:
 *                     type: string
 *               initialMessage:
 *                 type: string
 *                 description: Optional initial message to start conversation
 *     responses:
 *       200:
 *         description: Conversation started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversationId:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *                 context:
 *                   type: object
 *                 availableTools:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.post('/conversation/start',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20), // 20 conversations per 15 minutes
  [
    body('context.module').optional().isIn(['pulse', 'orbit', 'comms', 'beacon', 'core']),
    body('context.userRole').optional().isIn(['user', 'technician', 'admin']),
    body('initialMessage').optional().isLength({ max: 2000 })
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

      const { context = {}, initialMessage } = req.body;
      
      // Enhanced context with user info from JWT
      const enhancedContext = {
        ...context,
        userId: req.user.id,
        userName: req.user.name,
        userRole: context.userRole || req.user.role,
        tenantId: req.user.tenantId || 'default',
        timestamp: new Date().toISOString()
      };

      const result = await startConversation(enhancedContext, initialMessage);

      res.json({
        success: true,
        conversationId: result.conversationId,
        sessionId: result.sessionId,
        context: enhancedContext,
        availableTools: result.availableTools || [],
        message: result.initialResponse || 'Hello! I\'m Cosmo, your Nova AI assistant. How can I help you today?',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to start conversation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start conversation',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/conversation/{id}/send:
 *   post:
 *     tags: [Synth v2 - Conversation]
 *     summary: Send message to active conversation
 *     description: Send a message to an existing conversation and get AI response
 *     security:
 *       - BearerAuth: []
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
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 2000
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [file, image, ticket, kb_article]
 *                     id:
 *                       type: string
 *                     url:
 *                       type: string
 *               enableTools:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Message sent and response received
 */
router.post('/conversation/:id/send',
  authenticateJWT,
  createRateLimit(60 * 1000, 30), // 30 messages per minute
  [
    body('message').isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters'),
    body('enableTools').optional().isBoolean()
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
      const { message, attachments = [], enableTools = true } = req.body;

      const result = await sendMessage(conversationId, {
        message,
        attachments,
        enableTools,
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        messageId: result.messageId,
        response: result.response,
        toolsUsed: result.toolsUsed || [],
        suggestions: result.suggestions || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to send message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/conversation/{id}:
 *   get:
 *     tags: [Synth v2 - Conversation]
 *     summary: Get conversation history
 *     description: Retrieve conversation state and message history
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 200
 */
router.get('/conversation/:id',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const { limit = 50 } = req.query;

      const conversation = await getConversationHistory(conversationId, {
        userId: req.user.id,
        limit: Math.min(parseInt(limit), 200)
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }

      res.json({
        success: true,
        conversation: {
          id: conversation.id,
          context: conversation.context,
          messages: conversation.messages,
          status: conversation.status,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        }
      });
    } catch (error) {
      logger.error('Failed to get conversation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve conversation',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/conversation/{id}:
 *   delete:
 *     tags: [Synth v2 - Conversation]
 *     summary: End and archive conversation
 *     description: End an active conversation and archive the session
 */
router.delete('/conversation/:id',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 deletions per 15 minutes
  async (req, res) => {
    try {
      const { id: conversationId } = req.params;

      const result = await endConversation(conversationId, {
        userId: req.user.id,
        reason: 'user_requested'
      });

      res.json({
        success: true,
        message: 'Conversation ended and archived',
        summary: result.summary || null,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to end conversation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to end conversation',
        details: error.message
      });
    }
  }
);

// ========================================================================
// 2. INTENT & TICKET CLASSIFICATION
// ========================================================================

/**
 * @swagger
 * /api/v2/synth/intent/classify:
 *   post:
 *     tags: [Synth v2 - Intent Classification]
 *     summary: Classify user input intent
 *     description: Use AI to classify user input into categories like ticket, command, query
 */
router.post('/intent/classify',
  authenticateJWT,
  createRateLimit(60 * 1000, 100), // 100 classifications per minute
  [
    body('input').isLength({ min: 1, max: 2000 }).withMessage('Input text required'),
    body('context').optional().isObject()
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

      const { input, context = {} } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.ai.classify_intent', {
        input,
        context: {
          ...context,
          userId: req.user.id,
          userRole: req.user.role
        }
      });

      const classification = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        classification: {
          intent: classification.intent, // ticket, command, query, greeting, escalation
          confidence: classification.confidence,
          category: classification.category,
          priority: classification.priority,
          entities: classification.entities || [],
          suggestedActions: classification.suggestedActions || []
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Intent classification failed:', error);
      res.status(500).json({
        success: false,
        error: 'Intent classification failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/ticket/auto-create:
 *   post:
 *     tags: [Synth v2 - Intent Classification]
 *     summary: Auto-create ticket from classified intent
 *     description: Automatically create a ticket based on intent classification
 */
router.post('/ticket/auto-create',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20), // 20 auto-creations per 15 minutes
  [
    body('input').isLength({ min: 5, max: 2000 }).withMessage('Input text required'),
    body('classification').optional().isObject(),
    body('requesterInfo').optional().isObject()
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

      const { input, classification, requesterInfo = {} } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.tickets.auto_create', {
        input,
        classification,
        requesterInfo: {
          ...requesterInfo,
          userId: req.user.id,
          userName: req.user.name,
          userEmail: req.user.email
        },
        useAI: true
      });

      const ticket = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        ticket: {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          assignedTo: ticket.assignedTo,
          estimatedResolution: ticket.estimatedResolution
        },
        aiAnalysis: ticket.aiAnalysis || null,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Auto ticket creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Auto ticket creation failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// 3. KNOWLEDGE RETRIEVAL (LORE)
// ========================================================================

/**
 * @swagger
 * /api/v2/synth/lore/query:
 *   post:
 *     tags: [Synth v2 - Knowledge Retrieval]
 *     summary: Semantic knowledge base search
 *     description: AI-powered semantic search of Nova Lore knowledge base
 */
router.post('/lore/query',
  authenticateJWT,
  createRateLimit(60 * 1000, 50), // 50 queries per minute
  [
    body('query').isLength({ min: 3, max: 500 }).withMessage('Query must be 3-500 characters'),
    body('context').optional().isObject(),
    body('limit').optional().isInt({ min: 1, max: 20 }),
    body('includeAttachments').optional().isBoolean()
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

      const { query, context = {}, limit = 10, includeAttachments = false } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.lore.semantic_search', {
        query,
        context: {
          ...context,
          userId: req.user.id,
          userRole: req.user.role,
          tenantId: req.user.tenantId
        },
        limit,
        includeAttachments
      });

      const searchResults = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        results: searchResults.articles || [],
        totalResults: searchResults.totalResults || 0,
        searchTime: searchResults.searchTime || 0,
        suggestions: searchResults.suggestions || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Knowledge search failed:', error);
      res.status(500).json({
        success: false,
        error: 'Knowledge search failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/lore/feedback:
 *   post:
 *     tags: [Synth v2 - Knowledge Retrieval]
 *     summary: Submit feedback on AI results
 *     description: Submit feedback to improve AI search and recommendations
 */
router.post('/lore/feedback',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 feedback submissions per 15 minutes
  [
    body('queryId').isString().withMessage('Query ID required'),
    body('resultId').isString().withMessage('Result ID required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('feedback').optional().isLength({ max: 1000 }),
    body('helpful').isBoolean().withMessage('Helpful flag required')
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

      const { queryId, resultId, rating, feedback, helpful } = req.body;

      const mcpServer = await initializeMCPServer();
      await mcpServer.callTool('nova.lore.submit_feedback', {
        queryId,
        resultId,
        rating,
        feedback,
        helpful,
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Feedback submission failed:', error);
      res.status(500).json({
        success: false,
        error: 'Feedback submission failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// 4. WORKFLOW AUTOMATION
// ========================================================================

/**
 * @swagger
 * /api/v2/synth/workflow/execute:
 *   post:
 *     tags: [Synth v2 - Workflow]
 *     summary: Execute predefined workflow
 *     description: Execute a predefined workflow by ID with parameters
 */
router.post('/workflow/execute',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 30), // 30 workflow executions per 15 minutes
  [
    body('workflowId').isString().withMessage('Workflow ID required'),
    body('parameters').optional().isObject(),
    body('dryRun').optional().isBoolean()
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

      const { workflowId, parameters = {}, dryRun = false } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.workflows.execute', {
        workflowId,
        parameters: {
          ...parameters,
          executedBy: req.user.id,
          timestamp: new Date().toISOString()
        },
        dryRun
      });

      const execution = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        execution: {
          id: execution.id,
          workflowId,
          status: execution.status,
          steps: execution.steps || [],
          duration: execution.duration,
          output: execution.output,
          dryRun
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Workflow execution failed:', error);
      res.status(500).json({
        success: false,
        error: 'Workflow execution failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/workflow/custom:
 *   post:
 *     tags: [Synth v2 - Workflow]
 *     summary: Execute custom ad-hoc workflow
 *     description: Execute a custom workflow defined in the request
 */
router.post('/workflow/custom',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 10), // 10 custom workflows per 15 minutes
  [
    body('name').isString().withMessage('Workflow name required'),
    body('steps').isArray({ min: 1 }).withMessage('At least one step required'),
    body('parameters').optional().isObject(),
    body('dryRun').optional().isBoolean()
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

      const { name, steps, parameters = {}, dryRun = false } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.workflows.execute_custom', {
        name,
        steps,
        parameters: {
          ...parameters,
          createdBy: req.user.id,
          timestamp: new Date().toISOString()
        },
        dryRun
      });

      const execution = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        execution: {
          id: execution.id,
          name,
          status: execution.status,
          steps: execution.steps || [],
          duration: execution.duration,
          output: execution.output,
          dryRun
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Custom workflow execution failed:', error);
      res.status(500).json({
        success: false,
        error: 'Custom workflow execution failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// 5. GAMIFICATION (NOVA ASCEND)
// ========================================================================

/**
 * @swagger
 * /api/v2/synth/gamification/xp:
 *   post:
 *     tags: [Synth v2 - Gamification]
 *     summary: Grant or deduct XP
 *     description: Award or deduct experience points with optional reason
 */
router.post('/gamification/xp',
  authenticateJWT,
  createRateLimit(60 * 1000, 50), // 50 XP operations per minute
  [
    body('userId').optional().isString(),
    body('amount').isInt({ min: -1000, max: 1000 }).withMessage('XP amount must be -1000 to 1000'),
    body('reason').optional().isString(),
    body('category').optional().isIn(['ticket_resolved', 'knowledge_shared', 'feedback_given', 'milestone_reached', 'penalty']),
    body('metadata').optional().isObject()
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

      const { userId = req.user.id, amount, reason, category, metadata = {} } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.gamification.grant_xp', {
        userId,
        amount,
        reason,
        category,
        metadata: {
          ...metadata,
          grantedBy: req.user.id,
          timestamp: new Date().toISOString()
        }
      });

      const xpResult = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        result: {
          userId,
          amountGranted: amount,
          newTotal: xpResult.newTotal,
          levelUp: xpResult.levelUp || false,
          newLevel: xpResult.newLevel,
          badgesEarned: xpResult.badgesEarned || [],
          reason
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('XP operation failed:', error);
      res.status(500).json({
        success: false,
        error: 'XP operation failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/gamification/profile:
 *   get:
 *     tags: [Synth v2 - Gamification]
 *     summary: Get user gamification profile
 *     description: Retrieve user XP, level, badges, and leaderboard position
 */
router.get('/gamification/profile',
  authenticateJWT,
  createRateLimit(60 * 1000, 100), // 100 profile requests per minute
  async (req, res) => {
    try {
      const { userId = req.user.id } = req.query;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.gamification.get_profile', {
        userId,
        includeLeaderboard: true,
        includeHistory: false
      });

      const profile = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        profile: {
          userId,
          xp: profile.xp,
          level: profile.level,
          badges: profile.badges || [],
          achievements: profile.achievements || [],
          leaderboardRank: profile.leaderboardRank,
          streaks: profile.streaks || {},
          stats: profile.stats || {}
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Profile retrieval failed:', error);
      res.status(500).json({
        success: false,
        error: 'Profile retrieval failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// 6. INTEGRATION HOOKS
// ========================================================================

/**
 * @swagger
 * /api/v2/synth/hook/register:
 *   post:
 *     tags: [Synth v2 - Integration]
 *     summary: Register an event hook
 *     description: Register a webhook or API call for specific events
 */
router.post('/hook/register',
  authenticateJWT,
  createRateLimit(60 * 60 * 1000, 10), // 10 hook registrations per hour
  [
    body('name').isString().withMessage('Hook name required'),
    body('event').isString().withMessage('Event type required'),
    body('endpoint').isURL().withMessage('Valid endpoint URL required'),
    body('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE']),
    body('headers').optional().isObject(),
    body('active').optional().isBoolean()
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

      const { name, event, endpoint, method = 'POST', headers = {}, active = true } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.hooks.register', {
        name,
        event,
        endpoint,
        method,
        headers,
        active,
        registeredBy: req.user.id,
        tenantId: req.user.tenantId
      });

      const hook = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        hook: {
          id: hook.id,
          name,
          event,
          endpoint,
          method,
          active,
          createdAt: hook.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Hook registration failed:', error);
      res.status(500).json({
        success: false,
        error: 'Hook registration failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/alerts/analyze:
 *   post:
 *     tags: [Synth v2 - Alert Intelligence]
 *     summary: Analyze situation and recommend alert actions
 *     description: Use Cosmo AI to analyze tickets/situations and suggest alert creation or escalation
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - context
 *               - message
 *             properties:
 *               context:
 *                 type: object
 *                 properties:
 *                   ticketId:
 *                     type: string
 *                   alertId:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   customerTier:
 *                     type: string
 *                   affectedUsers:
 *                     type: integer
 *                   serviceCategory:
 *                     type: string
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *               message:
 *                 type: string
 *                 description: Analysis request message
 *               module:
 *                 type: string
 *                 enum: [pulse, orbit, core]
 *               userRole:
 *                 type: string
 */
router.post('/alerts/analyze',
  authenticateJWT,
  createRateLimit(60 * 1000, 20), // 20 analyses per minute
  [
    body('context').isObject().withMessage('Context object required'),
    body('message').isString().withMessage('Analysis message required'),
    body('module').optional().isIn(['pulse', 'orbit', 'core']),
    body('userRole').optional().isString()
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

      const { context, message, module = 'pulse', userRole = 'technician' } = req.body;

      // Initialize MCP server for analysis
      const mcpServer = await initializeMCPServer();
      
      // Prepare analysis context for Cosmo
      const analysisPayload = {
        userId: req.user.id,
        module,
        userRole,
        context: {
          ...context,
          tenantId: req.user.tenantId,
          timestamp: new Date().toISOString()
        },
        message: `${message}\n\nContext: ${JSON.stringify(context, null, 2)}\n\nBased on this information, analyze the situation and recommend one of the following actions:
1. create_alert - If a new alert should be created
2. escalate_alert - If an existing situation should be escalated
3. suggest_resolution - If you have resolution suggestions but no alert is needed
4. no_action - If no immediate action is required

Please provide your reasoning, confidence level (0-1), and specific action data if applicable.`
      };

      // Call Cosmo for intelligent analysis
      const analysisResult = await mcpServer.callTool('nova.alerts.analyze', analysisPayload);
      
      let analysis;
      try {
        analysis = JSON.parse(analysisResult.content[0].text);
      } catch (parseError) {
        // If parsing fails, create a structured response from the text
        const responseText = analysisResult.content[0].text;
        analysis = {
          action: 'suggest_resolution',
          reasoning: responseText,
          confidence: 0.7,
          suggestions: [responseText]
        };
      }

      // Enhance analysis with Nova-specific logic
      const enhancedAnalysis = await enhanceAnalysisWithRules(analysis, context, req.user);

      res.json({
        success: true,
        analysis: enhancedAnalysis,
        conversationId: analysisResult.conversationId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Alert analysis failed:', error);
      res.status(500).json({
        success: false,
        error: 'Alert analysis failed',
        details: error.message
      });
    }
  }
);

/**
 * Enhance Cosmo analysis with Nova business rules
 */
async function enhanceAnalysisWithRules(analysis, context, user) {
  // Apply VIP customer rules
  if (context.customerTier === 'vip' && context.priority === 'high') {
    analysis.confidence = Math.min(1.0, analysis.confidence + 0.2);
    if (analysis.action === 'suggest_resolution') {
      analysis.action = 'escalate_alert';
      analysis.reasoning += ' Enhanced priority due to VIP customer status.';
    }
  }

  // Apply affected users threshold
  if (context.affectedUsers && context.affectedUsers > 10) {
    analysis.confidence = Math.min(1.0, analysis.confidence + 0.15);
    if (analysis.action === 'no_action') {
      analysis.action = 'create_alert';
      analysis.reasoning += ' Alert recommended due to high number of affected users.';
    }
  }

  // Apply security keyword detection
  const securityKeywords = ['security', 'breach', 'malware', 'phishing', 'unauthorized'];
  if (context.keywords && context.keywords.some(k => securityKeywords.includes(k))) {
    analysis.confidence = Math.min(1.0, analysis.confidence + 0.25);
    if (analysis.action === 'no_action' || analysis.action === 'suggest_resolution') {
      analysis.action = 'create_alert';
      analysis.reasoning += ' Security incident detected - alert creation recommended.';
      
      // Set specific alert data for security incidents
      analysis.alertData = {
        summary: `🔒 Security Alert: ${context.ticketId ? `Ticket #${context.ticketId}` : 'Security Incident'}`,
        description: `Automated security alert created by Cosmo AI.\n\nReasoning: ${analysis.reasoning}`,
        source: 'cosmo',
        serviceId: 'security-001', // Default security service
        priority: 'critical',
        ticketId: context.ticketId,
        metadata: {
          cosmoGenerated: true,
          securityIncident: true,
          detectedKeywords: context.keywords.filter(k => securityKeywords.includes(k))
        }
      };
    }
  }

  // Apply infrastructure outage detection
  const infraKeywords = ['outage', 'down', 'failed', 'unreachable', 'disconnected'];
  if (context.keywords && context.keywords.some(k => infraKeywords.includes(k))) {
    if (context.affectedUsers && context.affectedUsers > 5) {
      analysis.confidence = Math.min(1.0, analysis.confidence + 0.2);
      analysis.action = 'escalate_alert';
      analysis.reasoning += ' Infrastructure outage with multiple users affected.';
      
      analysis.escalationData = {
        ticketId: context.ticketId,
        reason: `Infrastructure outage affecting ${context.affectedUsers} users. Cosmo AI analysis: ${analysis.reasoning}`,
        priority: 'critical',
        serviceId: 'ops-infra-001'
      };
    }
  }

  // Set default service mapping based on category
  if (analysis.action === 'create_alert' && !analysis.alertData) {
    const serviceMapping = {
      'security': 'security-001',
      'infrastructure': 'ops-infra-001',
      'network': 'ops-network-001',
      'software': 'support-l2-001',
      'hardware': 'ops-infra-001'
    };

    analysis.alertData = {
      summary: `Alert: ${context.ticketId ? `Ticket #${context.ticketId}` : 'Cosmo Analysis'}`,
      description: `Automated alert created by Cosmo AI.\n\nReasoning: ${analysis.reasoning}`,
      source: 'cosmo',
      serviceId: serviceMapping[context.serviceCategory] || 'support-l1-001',
      priority: context.priority || 'medium',
      ticketId: context.ticketId,
      metadata: {
        cosmoGenerated: true,
        confidence: analysis.confidence
      }
    };
  }

  return analysis;
}

/**
 * @swagger
 * /api/v2/synth/hook/trigger:
 *   post:
 *     tags: [Synth v2 - Integration]
 *     summary: Manually trigger a hook
 *     description: Manually trigger a registered hook with test data
 */
router.post('/hook/trigger',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20), // 20 manual triggers per 15 minutes
  [
    body('hookId').isString().withMessage('Hook ID required'),
    body('testData').optional().isObject()
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

      const { hookId, testData = {} } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.hooks.trigger', {
        hookId,
        testData: {
          ...testData,
          triggeredBy: req.user.id,
          timestamp: new Date().toISOString(),
          manual: true
        }
      });

      const triggerResult = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        result: {
          hookId,
          status: triggerResult.status,
          responseCode: triggerResult.responseCode,
          responseTime: triggerResult.responseTime,
          error: triggerResult.error || null
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Hook trigger failed:', error);
      res.status(500).json({
        success: false,
        error: 'Hook trigger failed',
        details: error.message
      });
    }
  }
);

// ========================================================================
// 7. MCP (Model Context Protocol) SUPPORT
// ========================================================================

/**
 * @swagger
 * /api/v2/synth/mcp/session:
 *   post:
 *     tags: [Synth v2 - MCP]
 *     summary: Start MCP session
 *     description: Initialize a new Model Context Protocol session with available tools
 */
router.post('/mcp/session',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20), // 20 MCP sessions per 15 minutes
  [
    body('tools').optional().isArray(),
    body('context').optional().isObject(),
    body('sessionName').optional().isString()
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

      const { tools, context = {}, sessionName } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.mcp.create_session', {
        requestedTools: tools,
        context: {
          ...context,
          userId: req.user.id,
          userRole: req.user.role,
          tenantId: req.user.tenantId
        },
        sessionName
      });

      const session = JSON.parse(result.content[0].text);

      res.json({
        success: true,
        session: {
          id: session.id,
          availableTools: session.availableTools,
          context: session.context,
          status: 'active',
          createdAt: session.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('MCP session creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'MCP session creation failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/mcp/tool/{name}:
 *   post:
 *     tags: [Synth v2 - MCP]
 *     summary: Execute MCP tool
 *     description: Execute a specific MCP tool with parameters
 */
router.post('/mcp/tool/:name',
  authenticateJWT,
  createRateLimit(60 * 1000, 100), // 100 tool calls per minute
  [
    body('sessionId').optional().isString(),
    body('parameters').optional().isObject(),
    body('timeout').optional().isInt({ min: 1000, max: 300000 })
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

      const { name: toolName } = req.params;
      const { sessionId, parameters = {}, timeout = 30000 } = req.body;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool(toolName, {
        ...parameters,
        userId: req.user.id,
        sessionId
      }, { timeout });

      res.json({
        success: true,
        tool: toolName,
        result: result.content[0].text,
        executionTime: result.executionTime || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`MCP tool ${req.params.name} execution failed:`, error);
      res.status(500).json({
        success: false,
        error: 'MCP tool execution failed',
        tool: req.params.name,
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/mcp/session/{id}:
 *   get:
 *     tags: [Synth v2 - MCP]
 *     summary: Get MCP session context
 *     description: Retrieve MCP session state and available tools
 */
router.get('/mcp/session/:id',
  authenticateJWT,
  createRateLimit(60 * 1000, 100), // 100 session queries per minute
  async (req, res) => {
    try {
      const { id: sessionId } = req.params;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.mcp.get_session', {
        sessionId,
        userId: req.user.id
      });

      const session = JSON.parse(result.content[0].text);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'MCP session not found'
        });
      }

      res.json({
        success: true,
        session: {
          id: session.id,
          availableTools: session.availableTools,
          context: session.context,
          status: session.status,
          callHistory: session.callHistory || [],
          createdAt: session.createdAt,
          lastActive: session.lastActive
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('MCP session retrieval failed:', error);
      res.status(500).json({
        success: false,
        error: 'MCP session retrieval failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/synth/mcp/session/{id}:
 *   delete:
 *     tags: [Synth v2 - MCP]
 *     summary: End MCP session
 *     description: End and cleanup MCP session
 */
router.delete('/mcp/session/:id',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 session deletions per 15 minutes
  async (req, res) => {
    try {
      const { id: sessionId } = req.params;

      const mcpServer = await initializeMCPServer();
      const result = await mcpServer.callTool('nova.mcp.end_session', {
        sessionId,
        userId: req.user.id
      });

      res.json({
        success: true,
        message: 'MCP session ended successfully',
        sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('MCP session cleanup failed:', error);
      res.status(500).json({
        success: false,
        error: 'MCP session cleanup failed',
        details: error.message
      });
    }
  }
);

export default router;
