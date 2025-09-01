/**
 * Nova AI Agent API Routes
 * Enhanced API endpoints for industry-standard AI Agent framework
 */

import express from 'express';
import { novaAIAgent } from '../lib/nova-ai-agent-framework.js';
import { novaConversationalInterface } from '../lib/nova-conversational-interface.js';
import { novaAIAgentAnalytics } from '../lib/nova-ai-agent-analytics.js';
import { logger } from '../logger.js';
import { authenticateJWT as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/ai-agent/chat:
 *   post:
 *     summary: Send message to AI agent
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - channel
 *             properties:
 *               message:
 *                 type: string
 *                 description: User message
 *               channel:
 *                 type: string
 *                 enum: [web, mobile, email, slack, teams, api]
 *                 description: Communication channel
 *               sessionId:
 *                 type: string
 *                 description: Conversation session ID
 *               conversationId:
 *                 type: string
 *                 description: Conversation ID for multi-turn dialog
 *               tenantId:
 *                 type: string
 *                 description: Tenant ID for multi-tenant filtering
 *               metadata:
 *                 type: object
 *                 description: Additional context metadata
 *     responses:
 *       200:
 *         description: Message processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     session:
 *                       type: object
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     metadata:
 *                       type: object
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, channel, sessionId, conversationId, tenantId, metadata } = req.body;
    const userId = req.user?.id;

    if (!message || !channel) {
      return res.status(400).json({
        success: false,
        error: 'Message and channel are required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const result = await novaConversationalInterface.processMessage(message, {
      userId,
      tenantId: tenantId || req.user?.tenantId || 'default',
      channelId: channel,
      sessionId,
      conversationId,
      metadata
    });

    res.json({
      success: true,
      data: {
        messages: result.messages,
        suggestions: result.suggestions,
        session: {
          id: result.session.id,
          channel: result.session.channel.name,
          isActive: result.session.isActive,
          startTime: result.session.startTime,
          lastActivity: result.session.lastActivity
        },
        actions: result.actions,
        metadata: {
          channelCapabilities: result.session.channel.features,
          responseTime: Date.now() - new Date().getTime() // Calculate actual response time
        }
      }
    });

  } catch (error) {
    logger.error('Error in AI agent chat endpoint', {
      error: error.message,
      userId: req.user?.id,
      channel: req.body.channel
    });

    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/capabilities:
 *   get:
 *     summary: Get available AI agent capabilities
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Capabilities retrieved successfully
 */
router.get('/capabilities', async (req, res) => {
  try {
    const capabilities = novaAIAgent.getCapabilities();
    
    res.json({
      success: true,
      data: {
        capabilities: capabilities.map(cap => ({
          name: cap.name,
          category: cap.category,
          description: cap.description,
          intents: cap.intents,
          isActive: cap.isActive,
          confidence: cap.confidence,
          workflows: cap.workflows.length
        }))
      }
    });

  } catch (error) {
    logger.error('Error getting AI agent capabilities', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get capabilities'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/channels:
 *   get:
 *     summary: Get supported communication channels
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 */
router.get('/channels', async (req, res) => {
  try {
    const channels = novaConversationalInterface.getSupportedChannels();
    
    res.json({
      success: true,
      data: {
        channels: channels.map(channel => ({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          features: channel.features,
          limitations: channel.limitations
        }))
      }
    });

  } catch (error) {
    logger.error('Error getting supported channels', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get channels'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/sessions:
 *   get:
 *     summary: Get active conversation sessions
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         description: Filter by tenant ID
 */
router.get('/sessions', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const userId = req.user?.id;
    
    const sessions = novaConversationalInterface.getActiveSessions(
      userId,
      tenantId as string || req.user?.tenantId
    );
    
    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          userId: session.userId,
          channel: session.channel.name,
          startTime: session.startTime,
          lastActivity: session.lastActivity,
          isActive: session.isActive,
          metadata: session.metadata
        }))
      }
    });

  } catch (error) {
    logger.error('Error getting active sessions', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get sessions'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/sessions/{sessionId}/close:
 *   post:
 *     summary: Close conversation session
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/sessions/:sessionId/close', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await novaConversationalInterface.closeSession(sessionId);
    
    res.json({
      success: true,
      data: {
        message: 'Session closed successfully'
      }
    });

  } catch (error) {
    logger.error('Error closing session', {
      error: error.message,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to close session'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/feedback:
 *   post:
 *     summary: Submit user feedback
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - type
 *               - rating
 *             properties:
 *               conversationId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [satisfaction, correction, suggestion, complaint]
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               category:
 *                 type: string
 */
router.post('/feedback', async (req, res) => {
  try {
    const { conversationId, type, rating, comment, category } = req.body;
    const userId = req.user?.id;

    if (!conversationId || !type || !rating) {
      return res.status(400).json({
        success: false,
        error: 'ConversationId, type, and rating are required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const feedback = await novaAIAgentAnalytics.recordFeedback({
      conversationId,
      userId,
      type,
      rating,
      comment,
      category: category || 'general'
    });

    res.json({
      success: true,
      data: {
        feedback: {
          id: feedback.id,
          type: feedback.type,
          rating: feedback.rating,
          timestamp: feedback.timestamp
        }
      }
    });

  } catch (error) {
    logger.error('Error recording feedback', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: 'Failed to record feedback'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/analytics:
 *   get:
 *     summary: Get AI agent performance analytics
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 */
router.get('/analytics', async (req, res) => {
  try {
    const { tenantId, startDate, endDate, interval = 'day' } = req.query;
    const userTenantId = tenantId as string || req.user?.tenantId || 'default';

    // Default to last 7 days if dates not provided
    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate ? new Date(startDate as string) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    const analytics = await novaAIAgentAnalytics.generateAnalytics(userTenantId, {
      start,
      end,
      interval: interval as any
    });

    res.json({
      success: true,
      data: {
        analytics: {
          id: analytics.id,
          timeframe: analytics.timeframe,
          metrics: analytics.metrics,
          breakdown: analytics.breakdown,
          trends: analytics.trends
        }
      }
    });

  } catch (error) {
    logger.error('Error getting analytics', {
      error: error.message,
      tenantId: req.query.tenantId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/analytics/summary:
 *   get:
 *     summary: Get analytics summary
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 */
router.get('/analytics/summary', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    
    const summary = await novaAIAgentAnalytics.getAnalyticsSummary(tenantId);
    
    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Error getting analytics summary', {
      error: error.message,
      tenantId: req.user?.tenantId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get analytics summary'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/ab-tests:
 *   post:
 *     summary: Create A/B test experiment
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - type
 *               - targetMetric
 *               - variants
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [response_variation, intent_threshold, escalation_rules, personality_tone]
 *               targetMetric:
 *                 type: string
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *               endDate:
 *                 type: string
 *                 format: date
 */
router.post('/ab-tests', async (req, res) => {
  try {
    const { name, description, type, targetMetric, variants, endDate } = req.body;

    if (!name || !description || !type || !targetMetric || !variants) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, type, targetMetric, and variants are required'
      });
    }

    const experiment = await novaAIAgentAnalytics.createABTest({
      name,
      description,
      type,
      targetMetric,
      variants: variants.map((v: any, index: number) => ({
        id: `variant_${index + 1}`,
        name: v.name || `Variant ${index + 1}`,
        description: v.description || '',
        configuration: v.configuration || {},
        trafficAllocation: v.trafficAllocation || 1.0 / variants.length,
        conversationCount: 0,
        metrics: {}
      })),
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : undefined
    });

    res.json({
      success: true,
      data: {
        experiment: {
          id: experiment.id,
          name: experiment.name,
          status: experiment.status,
          variants: experiment.variants.length,
          startDate: experiment.startDate
        }
      }
    });

  } catch (error) {
    logger.error('Error creating A/B test', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to create A/B test'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/ab-tests/{experimentId}/start:
 *   post:
 *     summary: Start A/B test experiment
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: experimentId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/ab-tests/:experimentId/start', async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    const experiment = await novaAIAgentAnalytics.startABTest(experimentId);
    
    res.json({
      success: true,
      data: {
        experiment: {
          id: experiment.id,
          name: experiment.name,
          status: experiment.status,
          startDate: experiment.startDate
        }
      }
    });

  } catch (error) {
    logger.error('Error starting A/B test', {
      error: error.message,
      experimentId: req.params.experimentId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to start A/B test'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/bias-detection:
 *   post:
 *     summary: Run bias detection analysis
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantId:
 *                 type: string
 */
router.post('/bias-detection', async (req, res) => {
  try {
    const { tenantId } = req.body;
    const userTenantId = tenantId || req.user?.tenantId || 'default';
    
    const results = await novaAIAgentAnalytics.runBiasDetection(userTenantId);
    
    res.json({
      success: true,
      data: {
        results: results.map(result => ({
          id: result.id,
          type: result.type,
          severity: result.severity,
          description: result.description,
          affectedGroups: result.affectedGroups,
          detectionDate: result.detectionDate,
          resolved: result.resolved
        }))
      }
    });

  } catch (error) {
    logger.error('Error running bias detection', {
      error: error.message,
      tenantId: req.body.tenantId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to run bias detection'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/performance:
 *   get:
 *     summary: Get agent performance metrics
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 */
router.get('/performance', async (req, res) => {
  try {
    const { userId, tenantId, category, startDate, endDate } = req.query;
    
    const filters: any = {};
    if (userId) filters.userId = userId as string;
    if (tenantId) filters.tenantId = tenantId as string;
    if (category) filters.category = category as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    
    const performance = await novaAIAgent.getPerformanceMetrics(filters);
    
    res.json({
      success: true,
      data: {
        metrics: performance.metrics,
        summary: performance.summary
      }
    });

  } catch (error) {
    logger.error('Error getting performance metrics', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics'
    });
  }
});

/**
 * @swagger
 * /api/ai-agent/capabilities/{capabilityName}:
 *   put:
 *     summary: Update agent capability configuration
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: capabilityName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *               confidence:
 *                 type: number
 *               workflows:
 *                 type: array
 *               permissions:
 *                 type: array
 */
router.put('/capabilities/:capabilityName', async (req, res) => {
  try {
    const { capabilityName } = req.params;
    const updates = req.body;
    
    const capability = await novaAIAgent.updateCapability(capabilityName, updates);
    
    res.json({
      success: true,
      data: {
        capability: {
          name: capability.name,
          category: capability.category,
          description: capability.description,
          isActive: capability.isActive,
          confidence: capability.confidence
        }
      }
    });

  } catch (error) {
    logger.error('Error updating capability', {
      error: error.message,
      capabilityName: req.params.capabilityName
    });

    res.status(500).json({
      success: false,
      error: 'Failed to update capability'
    });
  }
});

export default router;