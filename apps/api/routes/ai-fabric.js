/**
 * Nova AI Fabric API Routes
 *
 * Provides REST API endpoints for interacting with the AI Fabric system.
 * Includes routes for AI processing, monitoring, RAG queries, and MCP integration.
 */

import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';
import { aiFabric } from '../lib/ai-fabric.js';
import { ragEngine } from '../lib/rag-engine.js';
import { aiMonitoringSystem } from '../lib/ai-monitoring.js';
import { novaMCPServer } from '../lib/mcp-server.js';

const router = express.Router();

/**
 * @swagger
 * /api/ai-fabric/status:
 *   get:
 *     summary: Get AI Fabric status
 *     description: Returns the current status and health of the AI Fabric system
 *     tags: [AI Fabric]
 *     security:
 *       - bearerAuth: []
 */
router.get('/status', authenticateJWT, async (req, res) => {
  try {
    const status = {
      aiFabric: aiFabric.getStatus(),
      ragEngine: ragEngine.getStats(),
      monitoring: aiMonitoringSystem.getDashboardData(),
      mcpServer: {
        isRunning: novaMCPServer.isServerRunning,
        port: novaMCPServer.serverPort,
        info: novaMCPServer.getServerInfo(),
      },
      timestamp: new Date().toISOString(),
    };

    res.json(status);
  } catch (error) {
    logger.error('Failed to get AI Fabric status:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/process:
 *   post:
 *     summary: Process AI request
 *     description: Submit a request to be processed by the AI Fabric
 *     tags: [AI Fabric]
 *     security:
 *       - bearerAuth: []
 */
router.post('/process', authenticateJWT, async (req, res) => {
  try {
    const { type, input, preferences = {}, metadata = {} } = req.body;

    if (!type || !input) {
      return res.status(400).json({ error: 'Missing required fields: type, input' });
    }

    const aiRequest = {
      type,
      input,
      context: {
        userId: req.user.id,
        tenantId: req.user.tenant_id,
        module: 'api',
        sessionId: req.sessionID,
      },
      preferences,
      metadata: {
        ...metadata,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      },
      timestamp: new Date(),
    };

    const response = await aiFabric.processRequest(aiRequest);

    // Record metrics
    await aiMonitoringSystem.recordMetric({
      metricType: 'performance',
      providerId: response.provider,
      model: response.metadata.model || 'unknown',
      value: response.processingTime,
      unit: 'milliseconds',
      metadata: { userId: req.user.id },
      tags: ['api_request'],
    });

    res.json({
      requestId: response.requestId,
      result: response.result,
      confidence: response.confidence,
      processingTime: response.processingTime,
      provider: response.provider,
      metadata: response.metadata,
    });
  } catch (error) {
    logger.error('AI processing error:', error);

    // Record error event
    await aiMonitoringSystem.recordAuditEvent({
      eventType: 'error',
      severity: 'high',
      userId: req.user.id,
      metadata: {
        error: error.message,
        requestBody: req.body,
      },
      complianceFlags: [],
      riskScore: 0.5,
    });

    res.status(500).json({ error: 'AI processing failed' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/rag/query:
 *   post:
 *     summary: Query RAG system
 *     description: Search for relevant information using RAG
 *     tags: [AI Fabric, RAG]
 *     security:
 *       - bearerAuth: []
 */
router.post('/rag/query', authenticateJWT, async (req, res) => {
  try {
    const { query, filters, options = {} } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing required field: query' });
    }

    const ragQuery = {
      query,
      context: {
        userId: req.user.id,
        tenantId: req.user.tenant_id,
        module: 'api',
      },
      filters,
      options: {
        maxResults: 10,
        hybridSearch: true,
        rerank: true,
        ...options,
      },
      metadata: {},
    };

    const result = await ragEngine.query(ragQuery);

    res.json({
      queryId: result.queryId,
      chunks: result.chunks,
      summary: result.summary,
      confidence: result.confidence,
      retrievalTime: result.retrievalTime,
      totalResults: result.totalResults,
    });
  } catch (error) {
    logger.error('RAG query error:', error);
    res.status(500).json({ error: 'RAG query failed' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/rag/documents:
 *   post:
 *     summary: Add documents to RAG
 *     description: Add documents to the RAG knowledge base
 *     tags: [AI Fabric, RAG]
 *     security:
 *       - bearerAuth: []
 */
router.post('/rag/documents', authenticateJWT, async (req, res) => {
  try {
    const { documents } = req.body;

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'Invalid documents array' });
    }

    // Validate document structure
    for (const doc of documents) {
      if (!doc.id || !doc.content) {
        return res.status(400).json({ error: 'Each document must have id and content' });
      }
    }

    await ragEngine.addDocuments(documents);

    res.json({
      message: `Successfully added ${documents.length} documents`,
      count: documents.length,
    });
  } catch (error) {
    logger.error('Document addition error:', error);
    res.status(500).json({ error: 'Failed to add documents' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/monitoring/metrics:
 *   get:
 *     summary: Get AI monitoring metrics
 *     description: Retrieve AI performance and compliance metrics
 *     tags: [AI Fabric, Monitoring]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monitoring/metrics', authenticateJWT, async (req, res) => {
  try {
    const { timeframe = 'hour' } = req.query;
    const dashboardData = aiMonitoringSystem.getDashboardData();

    res.json({
      timeframe,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Monitoring metrics error:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/monitoring/bias:
 *   post:
 *     summary: Assess model bias
 *     description: Run bias assessment on AI model
 *     tags: [AI Fabric, Monitoring]
 *     security:
 *       - bearerAuth: []
 */
router.post('/monitoring/bias', authenticateJWT, async (req, res) => {
  try {
    const { model, testData, protectedAttribute } = req.body;

    if (!model || !testData || !protectedAttribute) {
      return res.status(400).json({
        error: 'Missing required fields: model, testData, protectedAttribute',
      });
    }

    const biasMetric = await aiMonitoringSystem.assessBias(model, testData, protectedAttribute);

    res.json(biasMetric);
  } catch (error) {
    logger.error('Bias assessment error:', error);
    res.status(500).json({ error: 'Bias assessment failed' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/monitoring/compliance:
 *   get:
 *     summary: Get compliance report
 *     description: Generate compliance report for specified period
 *     tags: [AI Fabric, Monitoring]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monitoring/compliance', authenticateJWT, async (req, res) => {
  try {
    const { reportType = 'gdpr', startDate, endDate } = req.query;

    const period = {
      start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate) : new Date(),
    };

    const report = await aiMonitoringSystem.generateComplianceReport(reportType, period);

    res.json(report);
  } catch (error) {
    logger.error('Compliance report error:', error);
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/monitoring/explain:
 *   post:
 *     summary: Generate explanation for AI decision
 *     description: Generate explainability report for AI prediction
 *     tags: [AI Fabric, Monitoring]
 *     security:
 *       - bearerAuth: []
 */
router.post('/monitoring/explain', authenticateJWT, async (req, res) => {
  try {
    const { requestId, model, prediction, inputData } = req.body;

    if (!requestId || !model || !prediction) {
      return res.status(400).json({
        error: 'Missing required fields: requestId, model, prediction',
      });
    }

    const explanation = await aiMonitoringSystem.generateExplanation(
      requestId,
      model,
      prediction,
      inputData || {},
    );

    res.json(explanation);
  } catch (error) {
    logger.error('Explanation generation error:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/providers:
 *   get:
 *     summary: List AI providers
 *     description: Get list of available AI providers and their status
 *     tags: [AI Fabric]
 *     security:
 *       - bearerAuth: []
 */
router.get('/providers', authenticateJWT, async (req, res) => {
  try {
    const status = aiFabric.getStatus();
    const providers = status.providers || [];

    res.json({
      providers: providers.map((provider) => ({
        id: provider.id,
        name: provider.name,
        type: provider.type,
        capabilities: provider.capabilities,
        healthStatus: provider.healthStatus,
        lastHealthCheck: provider.lastHealthCheck,
        isActive: provider.isActive,
      })),
      total: providers.length,
      healthy: providers.filter((p) => p.healthStatus === 'healthy').length,
    });
  } catch (error) {
    logger.error('Provider list error:', error);
    res.status(500).json({ error: 'Failed to retrieve providers' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/providers/{providerId}/health:
 *   post:
 *     summary: Check provider health
 *     description: Manually trigger health check for specific provider
 *     tags: [AI Fabric]
 *     security:
 *       - bearerAuth: []
 */
router.post('/providers/:providerId/health', authenticateJWT, async (req, res) => {
  try {
    const { providerId } = req.params;

    // Trigger a provider health check via AI Monitoring system if available
    try {
      const { aiMonitoringSystem } = await import('../lib/ai-monitoring.js');
      if (aiMonitoringSystem?.checkProviderHealth) {
        const result = await aiMonitoringSystem.checkProviderHealth(providerId);
        return res.json({ providerId, ...result, checkedAt: new Date().toISOString() });
      }
    } catch {}

    // Fallback response
    res.json({ providerId, status: 'unknown', checkedAt: new Date().toISOString() });
  } catch (error) {
    logger.error('Provider health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/learning/feedback:
 *   post:
 *     summary: Submit learning feedback
 *     description: Submit feedback to improve AI performance
 *     tags: [AI Fabric, Learning]
 *     security:
 *       - bearerAuth: []
 */
router.post('/learning/feedback', authenticateJWT, async (req, res) => {
  try {
    const { requestId, rating, feedback, type = 'user_feedback' } = req.body;

    if (!requestId || rating === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: requestId, rating',
      });
    }

    const learningEvent = {
      type,
      data: {
        requestId,
        rating,
        feedback,
        userId: req.user.id,
      },
      context: {
        userId: req.user.id,
        tenantId: req.user.tenant_id,
        module: 'api',
      },
      timestamp: new Date(),
      quality: Math.max(0, Math.min(1, rating / 5)), // Normalize to 0-1
    };

    await aiFabric.recordLearningEvent(learningEvent);

    res.json({
      message: 'Feedback recorded successfully',
      eventId: learningEvent.data.requestId,
    });
  } catch (error) {
    logger.error('Learning feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

/**
 * @swagger
 * /api/ai-fabric/initialize:
 *   post:
 *     summary: Initialize AI Fabric
 *     description: Initialize or reinitialize the AI Fabric system
 *     tags: [AI Fabric]
 *     security:
 *       - bearerAuth: []
 */
router.post('/initialize', authenticateJWT, async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    logger.info(`AI Fabric initialization requested by user ${req.user.id}`);

    // Initialize all components
    const results = {
      aiFabric: false,
      ragEngine: false,
      monitoring: false,
      mcpServer: false,
    };

    try {
      if (!aiFabric.getStatus().isInitialized) {
        await aiFabric.initialize();
      }
      results.aiFabric = true;
    } catch (error) {
      logger.error('AI Fabric initialization failed:', error);
    }

    try {
      if (!ragEngine.getStats().isInitialized) {
        await ragEngine.initialize();
      }
      results.ragEngine = true;
    } catch (error) {
      logger.error('RAG Engine initialization failed:', error);
    }

    try {
      await aiMonitoringSystem.initialize();
      results.monitoring = true;
    } catch (error) {
      logger.error('Monitoring system initialization failed:', error);
    }

    try {
      if (!novaMCPServer.isServerRunning) {
        await novaMCPServer.start();
      }
      results.mcpServer = true;
    } catch (error) {
      logger.error('MCP Server initialization failed:', error);
    }

    // Record initialization event
    await aiMonitoringSystem.recordAuditEvent({
      eventType: 'admin_action',
      severity: 'medium',
      userId: req.user.id,
      metadata: {
        action: 'ai_fabric_initialization',
        results,
      },
      complianceFlags: [],
      riskScore: 0.2,
    });

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    res.json({
      message: `AI Fabric initialization completed: ${successCount}/${totalCount} components initialized`,
      results,
      success: successCount === totalCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('AI Fabric initialization error:', error);
    res.status(500).json({ error: 'Initialization failed' });
  }
});

export default router;
