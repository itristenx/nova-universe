/**
 * Nova RAG API Routes
 * Enhanced RAG endpoints with RBAC controls, Nova Synth integration, and comprehensive testing interfaces
 */

import express from 'express';
import { ragEngine } from '../lib/rag-engine.js';
import { ragRBAC } from '../lib/nova-rag-rbac.js';
import { ragDataConnectors } from '../lib/nova-rag-data-connectors.js';
import { novaSynthRAG } from '../lib/nova-synth-rag-integration.js';
import { logger } from '../logger.js';
import { authenticateJWT as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/nova-rag/query:
 *   post:
 *     summary: Execute RAG query with RBAC enforcement
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: The search query
 *               tenantId:
 *                 type: string
 *                 description: Tenant ID for multi-tenant filtering
 *               enforceRBAC:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to enforce RBAC controls
 *               maxResults:
 *                 type: integer
 *                 default: 10
 *                 description: Maximum number of results to return
 *               minScore:
 *                 type: number
 *                 default: 0.7
 *                 description: Minimum relevance score threshold
 *               includeMetadata:
 *                 type: boolean
 *                 default: true
 *                 description: Include document metadata in results
 *               hybridSearch:
 *                 type: boolean
 *                 default: true
 *                 description: Use hybrid semantic + keyword search
 *     responses:
 *       200:
 *         description: Query executed successfully
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
 *                     id:
 *                       type: string
 *                     queryId:
 *                       type: string
 *                     chunks:
 *                       type: array
 *                     summary:
 *                       type: string
 *                     confidence:
 *                       type: number
 *                     retrievalTime:
 *                       type: number
 *                     totalResults:
 *                       type: integer
 *                     metadata:
 *                       type: object
 *       400:
 *         description: Invalid request parameters
 *       403:
 *         description: Access denied by RBAC
 *       500:
 *         description: Internal server error
 */
router.post('/query', async (req, res) => {
  try {
    const {
      query,
      tenantId = req.user?.tenantId || 'default',
      enforceRBAC = true,
      maxResults = 10,
      minScore = 0.7,
      includeMetadata = true,
      hybridSearch = true,
      filters = {},
    } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const ragQuery = {
      query,
      context: {
        userId: req.user.id,
        tenantId,
        module: 'nova-rag-api',
        userRoles: req.user.roles || [],
        securityClearance: req.user.securityClearance || 'standard',
      },
      filters: {
        ...filters,
        tenantId,
      },
      options: {
        maxResults,
        minScore,
        includeMetadata,
        hybridSearch,
        enforceRBAC,
        rerank: true,
        expandQuery: true,
      },
      metadata: {
        apiRequest: true,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        timestamp: new Date(),
      },
    };

    const result = await ragEngine.query(ragQuery);

    res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    logger.error('RAG query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute RAG query',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/synth-query:
 *   post:
 *     summary: Execute Synth query with personality-aware responses
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *               personalityProfile:
 *                 type: string
 *                 enum: [default, technical-expert, crisis-management, friendly-assistant, professional]
 *                 default: default
 *               requestType:
 *                 type: string
 *                 enum: [information, assistance, troubleshooting, guidance]
 *                 default: information
 *               urgency:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: medium
 *               conversationId:
 *                 type: string
 *                 description: ID for conversation tracking
 *               includeRecommendations:
 *                 type: boolean
 *                 default: true
 *               trackConversation:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Synth query executed successfully
 */
router.post('/synth-query', async (req, res) => {
  try {
    const {
      query,
      personalityProfile = 'default',
      requestType = 'information',
      urgency = 'medium',
      conversationId,
      includeRecommendations = true,
      trackConversation = true,
      maxContextChunks = 10,
    } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    // Get personality configuration
    const personalityProfiles = {
      'default': {
        tone: 'friendly',
        responseStyle: 'conversational',
        communicationPreferences: {
          provideContext: true,
          offerAlternatives: true,
          proactiveFollowUp: true,
          includeReferences: true,
          adaptToUserLevel: true,
        },
      },
      'technical-expert': {
        tone: 'professional',
        responseStyle: 'detailed',
        communicationPreferences: {
          provideContext: true,
          offerAlternatives: true,
          proactiveFollowUp: false,
          includeReferences: true,
          adaptToUserLevel: false,
        },
      },
      'crisis-management': {
        tone: 'empathetic',
        responseStyle: 'step-by-step',
        communicationPreferences: {
          provideContext: true,
          offerAlternatives: true,
          proactiveFollowUp: true,
          includeReferences: true,
          adaptToUserLevel: true,
        },
      },
    };

    const synthQuery = {
      query,
      context: {
        userId: req.user.id,
        tenantId: req.user.tenantId || 'default',
        sessionId: req.sessionID,
        conversationId,
        module: 'nova-rag-api',
        requestType,
        urgency,
      },
      personalityConfig: {
        profile: personalityProfile,
        traits: personalityProfiles[personalityProfile] || personalityProfiles['default'],
        adaptationRules: {
          contextSensitive: true,
          urgencyAware: true,
          roleBasedAdjustment: true,
          learningEnabled: true,
        },
      },
      options: {
        includeRAGContext: true,
        maxContextChunks,
        generateResponse: true,
        includeRecommendations,
        trackConversation,
        enableLearning: true,
      },
    };

    const result = await novaSynthRAG.processSynthQuery(synthQuery);

    res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    logger.error('Synth query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute Synth query',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/test-rbac:
 *   post:
 *     summary: Test RBAC configuration and policies
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: RBAC test results
 */
router.post('/test-rbac', async (req, res) => {
  try {
    const testResults = await ragRBAC.testRBACConfiguration();

    res.json({
      success: true,
      data: testResults,
    });

  } catch (error) {
    logger.error('RBAC test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute RBAC tests',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/test-personalities:
 *   post:
 *     summary: Test different personality responses for a query
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *               personalities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 default: [default, technical-expert, crisis-management]
 *     responses:
 *       200:
 *         description: Personality test results
 */
router.post('/test-personalities', async (req, res) => {
  try {
    const {
      query,
      personalities = ['default', 'technical-expert', 'crisis-management'],
    } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const testResults = await novaSynthRAG.testPersonalityResponses(
      query,
      req.user.id,
      req.user.tenantId || 'default',
      personalities
    );

    res.json({
      success: true,
      data: testResults,
    });

  } catch (error) {
    logger.error('Personality test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute personality tests',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/index-documents:
 *   post:
 *     summary: Index documents with RBAC metadata
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     content:
 *                       type: string
 *                     metadata:
 *                       type: object
 *               securityClassification:
 *                 type: string
 *                 enum: [public, internal, confidential, restricted, top_secret]
 *                 default: internal
 *               departmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documents indexed successfully
 */
router.post('/index-documents', async (req, res) => {
  try {
    const {
      documents,
      securityClassification = 'internal',
      departmentId,
    } = req.body;

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        error: 'Documents array is required',
      });
    }

    const rbacContext = {
      userId: req.user.id,
      tenantId: req.user.tenantId || 'default',
      departmentId: departmentId || req.user.departmentId,
      securityClassification,
    };

    await ragEngine.addDocuments(documents, rbacContext);

    res.json({
      success: true,
      data: {
        documentsIndexed: documents.length,
        rbacContext,
      },
    });

  } catch (error) {
    logger.error('Document indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to index documents',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/data-sources:
 *   get:
 *     summary: Get data source connector status
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data source status retrieved successfully
 */
router.get('/data-sources', async (req, res) => {
  try {
    const connectors = ragDataConnectors.getConnectorStatus();

    res.json({
      success: true,
      data: {
        connectors,
        totalConnectors: connectors.length,
        activeConnectors: connectors.filter(c => c.isConnected).length,
      },
    });

  } catch (error) {
    logger.error('Data sources status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get data source status',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/data-sources/sync:
 *   post:
 *     summary: Trigger data source synchronization
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connectorId:
 *                 type: string
 *                 description: Specific connector to sync (optional)
 *     responses:
 *       200:
 *         description: Sync initiated successfully
 */
router.post('/data-sources/sync', async (req, res) => {
  try {
    const { connectorId } = req.body;

    let results;
    if (connectorId) {
      results = [await ragDataConnectors.syncDataSource(connectorId)];
    } else {
      results = await ragDataConnectors.syncAllSources();
    }

    res.json({
      success: true,
      data: {
        syncResults: results,
        totalSynced: results.length,
        documentsProcessed: results.reduce((sum, r) => sum + r.documentsProcessed, 0),
        documentsAdded: results.reduce((sum, r) => sum + r.documentsAdded, 0),
        errors: results.flatMap(r => r.errors),
      },
    });

  } catch (error) {
    logger.error('Data source sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync data sources',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/data-sources/{connectorId}/toggle:
 *   post:
 *     summary: Enable or disable a data source connector
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectorId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Connector toggled successfully
 */
router.post('/data-sources/:connectorId/toggle', async (req, res) => {
  try {
    const { connectorId } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled field must be a boolean',
      });
    }

    await ragDataConnectors.setConnectorEnabled(connectorId, enabled);

    res.json({
      success: true,
      data: {
        connectorId,
        enabled,
      },
    });

  } catch (error) {
    logger.error('Connector toggle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle connector',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/rbac/users:
 *   post:
 *     summary: Create RBAC user
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - tenantId
 *               - roles
 *             properties:
 *               email:
 *                 type: string
 *               tenantId:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               departmentId:
 *                 type: string
 *               securityClearance:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 */
router.post('/rbac/users', async (req, res) => {
  try {
    const {
      email,
      tenantId,
      roles = [],
      permissions = [],
      departmentId,
      securityClearance = 'standard',
      attributes = {},
    } = req.body;

    if (!email || !tenantId || !roles.length) {
      return res.status(400).json({
        success: false,
        error: 'email, tenantId, and roles are required',
      });
    }

    const userId = await ragRBAC.createUser({
      email,
      tenantId,
      roles,
      permissions,
      securityClearance,
      departmentId,
      attributes,
    });

    res.json({
      success: true,
      data: {
        userId,
        email,
        tenantId,
        roles,
      },
    });

  } catch (error) {
    logger.error('RBAC user creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create RBAC user',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/rbac/policies:
 *   post:
 *     summary: Create RBAC policy
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 */
router.post('/rbac/policies', async (req, res) => {
  try {
    const {
      name,
      description,
      tenantId,
      resources = [],
      subjects = [],
      actions = [],
      effect = 'allow',
      priority = 50,
      conditions = [],
    } = req.body;

    if (!name || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'name and tenantId are required',
      });
    }

    const policyId = await ragRBAC.createPolicy({
      name,
      description,
      tenantId,
      resources,
      subjects,
      actions,
      effect,
      priority,
      conditions,
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        policyId,
        name,
        tenantId,
        effect,
      },
    });

  } catch (error) {
    logger.error('RBAC policy creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create RBAC policy',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/rbac/audit-logs:
 *   get:
 *     summary: Get RBAC audit logs
 *     tags: [Nova RAG]
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
 *         name: resource
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get('/rbac/audit-logs', async (req, res) => {
  try {
    const {
      userId,
      tenantId,
      resource,
      action,
      limit = 100,
    } = req.query;

    const filters = {};
    if (userId) filters.userId = userId;
    if (tenantId) filters.tenantId = tenantId;
    if (resource) filters.resource = resource;
    if (action) filters.action = action;
    if (limit) filters.limit = parseInt(limit);

    const auditLogs = ragRBAC.getAuditLogs(filters);

    res.json({
      success: true,
      data: {
        logs: auditLogs,
        total: auditLogs.length,
        filters,
      },
    });

  } catch (error) {
    logger.error('Audit logs retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/conversation-history:
 *   get:
 *     summary: Get conversation history for Synth interactions
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Conversation history retrieved successfully
 */
router.get('/conversation-history', async (req, res) => {
  try {
    const {
      conversationId,
      limit = 10,
    } = req.query;

    const conversations = await novaSynthRAG.getConversationHistory(
      req.user.id,
      req.user.tenantId || 'default',
      conversationId,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        conversations,
        total: conversations.length,
      },
    });

  } catch (error) {
    logger.error('Conversation history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation history',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/nova-rag/stats:
 *   get:
 *     summary: Get comprehensive RAG system statistics
 *     tags: [Nova RAG]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      ragEngine: ragEngine.getStats(),
      rbac: ragRBAC.getStats(),
      dataConnectors: ragDataConnectors.getConnectorStatus(),
      synthRAG: novaSynthRAG.getStats(),
      timestamp: new Date(),
    };

    res.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system statistics',
      details: error.message,
    });
  }
});

export default router;