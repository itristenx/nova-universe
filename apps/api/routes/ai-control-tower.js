/**
 * AI Control Tower API Routes
 * Enterprise-grade AI/ML/RAG system with custom training and audit trails
 * Provides REST API endpoints for AI control tower management
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import { aiControlTower } from '../lib/ai-control-tower.js';
import { aiMonitoringSystem } from '../lib/ai-monitoring.js';
import { authenticateJWT as authMiddleware } from '../middleware/auth.js';
import { logger } from '../logger.js';

const router = Router();

// Rate limiting for AI operations
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many AI requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// Enhanced rate limit for training operations
const trainingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit training requests
  message: {
    error: 'Too many training requests, please try again later.',
    code: 'TRAINING_RATE_LIMIT_EXCEEDED',
  },
});

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
      code: 'VALIDATION_ERROR',
    });
  }
  next();
};

// Apply auth and rate limiting to all routes
router.use(authMiddleware);
router.use(aiRateLimit);

/**
 * @swagger
 * /api/ai-control-tower/towers:
 *   post:
 *     summary: Create a new AI Control Tower
 *     tags: [AI Control Tower]
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
 *               - organizationId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the control tower
 *               description:
 *                 type: string
 *                 description: Description of the control tower
 *               organizationId:
 *                 type: string
 *                 description: Organization ID
 *               environment:
 *                 type: string
 *                 enum: [DEVELOPMENT, STAGING, PRODUCTION]
 *                 description: Environment type
 *               configuration:
 *                 type: object
 *                 description: Configuration object
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       201:
 *         description: Control tower created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/towers',
  [
    body('name').isLength({ min: 1, max: 255 }).trim().notEmpty(),
    body('description').optional().isLength({ max: 1000 }),
    body('organizationId').isUUID(),
    body('environment').optional().isIn(['DEVELOPMENT', 'STAGING', 'PRODUCTION']),
    body('configuration').optional().isObject(),
    body('metadata').optional().isObject(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const config = {
        ...req.body,
        userId: req.user.id,
      };

      const tower = await aiControlTower.createControlTower(config);

      res.status(201).json({
        success: true,
        data: tower,
        message: 'AI Control Tower created successfully',
      });
    } catch (error) {
      logger.error('Failed to create control tower', {
        error: error.message,
        userId: req.user.id,
        body: req.body,
      });

      res.status(500).json({
        error: 'Failed to create control tower',
        message: error.message,
        code: 'TOWER_CREATION_FAILED',
      });
    }
  },
);

/**
 * @swagger
 * /api/ai-control-tower/towers:
 *   get:
 *     summary: Get all control towers for the user's organization
 *     tags: [AI Control Tower]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *           enum: [DEVELOPMENT, STAGING, PRODUCTION]
 *         description: Filter by environment
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Control towers retrieved successfully
 */
router.get(
  '/towers',
  [
    query('environment').optional().isIn(['DEVELOPMENT', 'STAGING', 'PRODUCTION']),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { environment, status } = req.query;

      // Get towers for user's organization
      const towers = Array.from(aiControlTower.towers.values()).filter((tower) => {
        if (environment && tower.environment !== environment) return false;
        if (status && tower.status !== status) return false;
        return true; // In real implementation, filter by user's organization
      });

      res.json({
        success: true,
        data: towers,
        count: towers.length,
      });
    } catch (error) {
      logger.error('Failed to get control towers', {
        error: error.message,
        userId: req.user.id,
      });

      res.status(500).json({
        error: 'Failed to get control towers',
        message: error.message,
        code: 'TOWERS_FETCH_FAILED',
      });
    }
  },
);

/**
 * @swagger
 * /api/ai-control-tower/towers/{towerId}/metrics:
 *   get:
 *     summary: Get control tower metrics and analytics
 *     tags: [AI Control Tower]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: towerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Control tower ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [1h, 6h, 24h, 7d, 30d]
 *           default: 24h
 *         description: Time range for metrics
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 */
router.get(
  '/towers/:towerId/metrics',
  [param('towerId').isUUID(), query('timeRange').optional().isIn(['1h', '6h', '24h', '7d', '30d'])],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { towerId } = req.params;
      const { timeRange = '24h' } = req.query;

      const metrics = await aiControlTower.getControlTowerMetrics(towerId, timeRange);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Failed to get control tower metrics', {
        error: error.message,
        towerId: req.params.towerId,
        userId: req.user.id,
      });

      res.status(500).json({
        error: 'Failed to get control tower metrics',
        message: error.message,
        code: 'METRICS_FETCH_FAILED',
      });
    }
  },
);

/**
 * @swagger
 * /api/ai-control-tower/models:
 *   post:
 *     summary: Create a new AI model
 *     tags: [AI Models]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - towerId
 *               - name
 *               - type
 *             properties:
 *               towerId:
 *                 type: string
 *                 description: Control tower ID
 *               name:
 *                 type: string
 *                 description: Model name
 *               description:
 *                 type: string
 *                 description: Model description
 *               type:
 *                 type: string
 *                 enum: [CLASSIFICATION, REGRESSION, NLP, COMPUTER_VISION, TIME_SERIES, CLUSTERING, REINFORCEMENT_LEARNING]
 *                 description: Model type
 *               framework:
 *                 type: string
 *                 enum: [tensorflow, pytorch, scikit-learn, xgboost, lightgbm, huggingface]
 *                 description: ML framework
 *               version:
 *                 type: string
 *                 description: Model version
 *     responses:
 *       201:
 *         description: Model created successfully
 */
router.post(
  '/models',
  [
    body('towerId').isUUID(),
    body('name').isLength({ min: 1, max: 255 }).trim().notEmpty(),
    body('description').optional().isLength({ max: 1000 }),
    body('type').isIn([
      'CLASSIFICATION',
      'REGRESSION',
      'NLP',
      'COMPUTER_VISION',
      'TIME_SERIES',
      'CLUSTERING',
      'REINFORCEMENT_LEARNING',
    ]),
    body('framework')
      .optional()
      .isIn(['tensorflow', 'pytorch', 'scikit-learn', 'xgboost', 'lightgbm', 'huggingface']),
    body('version').optional().isLength({ max: 50 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { towerId, ...modelConfig } = req.body;
      modelConfig.userId = req.user.id;

      const model = await aiControlTower.createModel(towerId, modelConfig);

      res.status(201).json({
        success: true,
        data: model,
        message: 'AI Model created successfully',
      });
    } catch (error) {
      logger.error('Failed to create AI model', {
        error: error.message,
        userId: req.user.id,
        body: req.body,
      });

      res.status(500).json({
        error: 'Failed to create AI model',
        message: error.message,
        code: 'MODEL_CREATION_FAILED',
      });
    }
  },
);

/**
 * @swagger
 * /api/ai-control-tower/datasets:
 *   post:
 *     summary: Create a custom training dataset
 *     tags: [AI Datasets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - towerId
 *               - name
 *               - datasetType
 *               - storagePath
 *             properties:
 *               towerId:
 *                 type: string
 *                 description: Control tower ID
 *               name:
 *                 type: string
 *                 description: Dataset name
 *               description:
 *                 type: string
 *                 description: Dataset description
 *               datasetType:
 *                 type: string
 *                 enum: [TRAINING, VALIDATION, TEST, CUSTOM]
 *                 description: Dataset type
 *               storagePath:
 *                 type: string
 *                 description: Storage path for dataset
 *               storageFormat:
 *                 type: string
 *                 enum: [csv, parquet, json, tfrecord]
 *                 description: Storage format
 *     responses:
 *       201:
 *         description: Dataset created successfully
 */
router.post(
  '/datasets',
  [
    body('towerId').isUUID(),
    body('name').isLength({ min: 1, max: 255 }).trim().notEmpty(),
    body('description').optional().isLength({ max: 1000 }),
    body('datasetType').isIn(['TRAINING', 'VALIDATION', 'TEST', 'CUSTOM']),
    body('storagePath').notEmpty(),
    body('storageFormat').optional().isIn(['csv', 'parquet', 'json', 'tfrecord']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { towerId, ...datasetConfig } = req.body;
      datasetConfig.userId = req.user.id;

      const dataset = await aiControlTower.createCustomDataset(towerId, datasetConfig);

      res.status(201).json({
        success: true,
        data: dataset,
        message: 'Custom dataset created successfully',
      });
    } catch (error) {
      logger.error('Failed to create custom dataset', {
        error: error.message,
        userId: req.user.id,
        body: req.body,
      });

      res.status(500).json({
        error: 'Failed to create custom dataset',
        message: error.message,
        code: 'DATASET_CREATION_FAILED',
      });
    }
  },
);

/**
 * @swagger
 * /api/ai-control-tower/training:
 *   post:
 *     summary: Start custom model training
 *     tags: [AI Training]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelId
 *               - name
 *             properties:
 *               modelId:
 *                 type: string
 *                 description: Model ID to train
 *               name:
 *                 type: string
 *                 description: Training job name
 *               description:
 *                 type: string
 *                 description: Training job description
 *               epochs:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *                 description: Number of training epochs
 *               batchSize:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1024
 *                 description: Training batch size
 *               learningRate:
 *                 type: number
 *                 minimum: 0.0001
 *                 maximum: 1.0
 *                 description: Learning rate
 *     responses:
 *       201:
 *         description: Training started successfully
 */
router.post(
  '/training',
  trainingRateLimit,
  [
    body('modelId').isUUID(),
    body('name').isLength({ min: 1, max: 255 }).trim().notEmpty(),
    body('description').optional().isLength({ max: 1000 }),
    body('epochs').optional().isInt({ min: 1, max: 1000 }),
    body('batchSize').optional().isInt({ min: 1, max: 1024 }),
    body('learningRate').optional().isFloat({ min: 0.0001, max: 1.0 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const trainingConfig = {
        ...req.body,
        userId: req.user.id,
      };

      const job = await aiControlTower.startCustomTraining(req.body.modelId, trainingConfig);

      res.status(201).json({
        success: true,
        data: job,
        message: 'Training started successfully',
      });
    } catch (error) {
      logger.error('Failed to start training', {
        error: error.message,
        userId: req.user.id,
        body: req.body,
      });

      res.status(500).json({
        error: 'Failed to start training',
        message: error.message,
        code: 'TRAINING_START_FAILED',
      });
    }
  },
);

/**
 * @swagger
 * /api/ai-control-tower/rag:
 *   post:
 *     summary: Create a new RAG system
 *     tags: [RAG Systems]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: RAG system name
 *               description:
 *                 type: string
 *                 description: RAG system description
 *               embeddingModel:
 *                 type: string
 *                 description: Embedding model to use
 *               chunkSize:
 *                 type: integer
 *                 minimum: 100
 *                 maximum: 4000
 *                 description: Text chunk size
 *               maxRetrievalDocs:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Maximum documents to retrieve
 *     responses:
 *       201:
 *         description: RAG system created successfully
 */
router.post(
  '/rag',
  [
    body('name').isLength({ min: 1, max: 255 }).trim().notEmpty(),
    body('description').optional().isLength({ max: 1000 }),
    body('embeddingModel').optional().isLength({ max: 255 }),
    body('chunkSize').optional().isInt({ min: 100, max: 4000 }),
    body('maxRetrievalDocs').optional().isInt({ min: 1, max: 20 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const ragSystem = await aiControlTower.createRAGSystem({
        ...req.body,
        userId: req.user.id,
      });

      res.status(201).json({
        success: true,
        data: ragSystem,
        message: 'RAG system created successfully',
      });
    } catch (error) {
      logger.error('Failed to create RAG system', {
        error: error.message,
        userId: req.user.id,
        body: req.body,
      });

      res.status(500).json({
        error: 'Failed to create RAG system',
        message: error.message,
        code: 'RAG_CREATION_FAILED',
      });
    }
  },
);

/**
 * @swagger
 * /api/ai-control-tower/rag/{ragId}/documents:
 *   post:
 *     summary: Add document to RAG system
 *     tags: [RAG Systems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ragId
 *         required: true
 *         schema:
 *           type: string
 *         description: RAG system ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Document title
 *               content:
 *                 type: string
 *                 description: Document content
 *               contentType:
 *                 type: string
 *                 description: Content type
 *               source:
 *                 type: string
 *                 description: Document source
 *               url:
 *                 type: string
 *                 description: Document URL
 *     responses:
 *       201:
 *         description: Document added successfully
 */
router.post(
  '/rag/:ragId/documents',
  [
    param('ragId').isUUID(),
    body('title').isLength({ min: 1, max: 500 }).trim().notEmpty(),
    body('content').isLength({ min: 1 }).notEmpty(),
    body('contentType').optional().isLength({ max: 100 }),
    body('source').optional().isLength({ max: 255 }),
    body('url').optional().isURL(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { ragId } = req.params;
      const documentConfig = {
        ...req.body,
        userId: req.user.id,
      };

      const document = await aiControlTower.addRAGDocument(ragId, documentConfig);

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document added to RAG system successfully',
      });
    } catch (error) {
      logger.error('Failed to add RAG document', {
        error: error.message,
        ragId: req.params.ragId,
        userId: req.user.id,
        body: req.body,
      });

      res.status(500).json({
        error: 'Failed to add RAG document',
        message: error.message,
        code: 'RAG_DOCUMENT_ADD_FAILED',
      });
    }
  },
);

/**
 * @swagger
 * /api/ai-control-tower/rag/{ragId}/query:
 *   post:
 *     summary: Query RAG system
 *     tags: [RAG Systems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ragId
 *         required: true
 *         schema:
 *           type: string
 *         description: RAG system ID
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
 *                 description: Query text
 *               maxDocs:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Maximum documents to retrieve
 *               sessionId:
 *                 type: string
 *                 description: Session ID for tracking
 *     responses:
 *       200:
 *         description: Query processed successfully
 */
router.post(
  '/rag/:ragId/query',
  [
    param('ragId').isUUID(),
    body('query').isLength({ min: 1, max: 2000 }).trim().notEmpty(),
    body('maxDocs').optional().isInt({ min: 1, max: 20 }),
    body('sessionId').optional().isUUID(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { ragId } = req.params;
      const { query, maxDocs, sessionId } = req.body;

      const options = {
        userId: req.user.id,
        sessionId,
        maxDocs,
      };

      const result = await aiControlTower.queryRAG(ragId, query, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Failed to query RAG system', {
        error: error.message,
        ragId: req.params.ragId,
        userId: req.user.id,
        body: req.body,
      });

      res.status(500).json({
        error: 'Failed to query RAG system',
        message: error.message,
        code: 'RAG_QUERY_FAILED',
      });
    }
  },
);

/**
 * @swagger
 * /api/ai-control-tower/external-providers/config:
 *   get:
 *     summary: Get external provider configuration
 *     tags: [AI Control Tower - External Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: External provider configuration retrieved successfully
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
 *                     enabled:
 *                       type: boolean
 *                     allowedProviders:
 *                       type: array
 *                       items:
 *                         type: string
 *                     lastModified:
 *                       type: string
 *                       format: date-time
 *                     modifiedBy:
 *                       type: string
 *                     totalExternalProviders:
 *                       type: integer
 *                     activeExternalProviders:
 *                       type: integer
 *       403:
 *         description: Admin privileges required
 */
router.get('/external-providers/config', async (req, res) => {
  try {
    // Check admin privileges
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin privileges required for external provider configuration'
      });
    }

    const { aiFabric } = await import('../lib/ai-fabric.js');
    const config = aiFabric.getExternalProviderConfig();

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Failed to get external provider configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve external provider configuration',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai-control-tower/external-providers/enable:
 *   post:
 *     summary: Enable external AI providers (admin only)
 *     tags: [AI Control Tower - External Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allowedProviders:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [openai-gpt4, anthropic-claude, azure-openai]
 *                 description: List of external providers to enable (empty array means all available)
 *                 example: ["openai-gpt4"]
 *     responses:
 *       200:
 *         description: External providers enabled successfully
 *       403:
 *         description: Admin privileges required
 */
router.post('/external-providers/enable', async (req, res) => {
  try {
    // Check admin privileges
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin privileges required to enable external providers'
      });
    }

    const { allowedProviders = [] } = req.body;

    // Validate provider IDs
    const validProviders = ['openai-gpt4', 'anthropic-claude', 'azure-openai'];
    const invalidProviders = allowedProviders.filter(p => !validProviders.includes(p));
    
    if (invalidProviders.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider IDs',
        invalidProviders,
        validProviders
      });
    }

    const { aiFabric } = await import('../lib/ai-fabric.js');
    await aiFabric.enableExternalProviders(req.user.id, allowedProviders);

    // Record audit event
    try {
      await aiMonitoringSystem.recordAuditEvent({
        eventType: 'admin_action',
        severity: 'medium',
        userId: req.user.id,
        metadata: {
          action: 'external_providers_enabled',
          allowedProviders,
          totalEnabled: allowedProviders.length
        },
        complianceFlags: ['admin_configuration_change'],
        riskScore: 0.3
      });
    } catch (auditError) {
      logger.warn('Failed to record audit event:', { message: auditError.message });
    }

    res.json({
      success: true,
      message: 'External providers enabled successfully',
      data: {
        enabled: true,
        allowedProviders,
        enabledBy: req.user.id,
        enabledAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to enable external providers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable external providers',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai-control-tower/external-providers/disable:
 *   post:
 *     summary: Disable all external AI providers (admin only)
 *     tags: [AI Control Tower - External Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: External providers disabled successfully
 *       403:
 *         description: Admin privileges required
 */
router.post('/external-providers/disable', async (req, res) => {
  try {
    // Check admin privileges
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin privileges required to disable external providers'
      });
    }

    const { aiFabric } = await import('../lib/ai-fabric.js');
    await aiFabric.disableExternalProviders(req.user.id);

    // Record audit event
    try {
      await aiMonitoringSystem.recordAuditEvent({
        eventType: 'admin_action',
        severity: 'medium',
        userId: req.user.id,
        metadata: {
          action: 'external_providers_disabled',
          reason: 'admin_request'
        },
        complianceFlags: ['admin_configuration_change'],
        riskScore: 0.3
      });
    } catch (auditError) {
      logger.warn('Failed to record audit event:', { message: auditError.message });
    }

    res.json({
      success: true,
      message: 'External providers disabled successfully',
      data: {
        enabled: false,
        disabledBy: req.user.id,
        disabledAt: new Date().toISOString(),
        note: 'Nova models remain active and prioritized'
      }
    });
  } catch (error) {
    logger.error('Failed to disable external providers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable external providers',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai-control-tower/external-providers/update:
 *   put:
 *     summary: Update allowed external providers (admin only)
 *     tags: [AI Control Tower - External Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - allowedProviders
 *             properties:
 *               allowedProviders:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [openai-gpt4, anthropic-claude, azure-openai]
 *                 description: Updated list of allowed external providers
 *     responses:
 *       200:
 *         description: External providers updated successfully
 *       403:
 *         description: Admin privileges required
 */
router.put('/external-providers/update', async (req, res) => {
  try {
    // Check admin privileges
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin privileges required to update external providers'
      });
    }

    const { allowedProviders } = req.body;

    if (!Array.isArray(allowedProviders)) {
      return res.status(400).json({
        success: false,
        error: 'allowedProviders must be an array'
      });
    }

    // Validate provider IDs
    const validProviders = ['openai-gpt4', 'anthropic-claude', 'azure-openai'];
    const invalidProviders = allowedProviders.filter(p => !validProviders.includes(p));
    
    if (invalidProviders.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider IDs',
        invalidProviders,
        validProviders
      });
    }

    const { aiFabric } = await import('../lib/ai-fabric.js');
    await aiFabric.updateAllowedExternalProviders(req.user.id, allowedProviders);

    // Record audit event
    try {
      await aiMonitoringSystem.recordAuditEvent({
        eventType: 'admin_action',
        severity: 'medium',
        userId: req.user.id,
        metadata: {
          action: 'external_providers_updated',
          allowedProviders,
          totalAllowed: allowedProviders.length
        },
        complianceFlags: ['admin_configuration_change'],
        riskScore: 0.3
      });
    } catch (auditError) {
      logger.warn('Failed to record audit event:', { message: auditError.message });
    }

    res.json({
      success: true,
      message: 'External providers configuration updated successfully',
      data: {
        allowedProviders,
        updatedBy: req.user.id,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to update external providers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update external providers',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai-control-tower/providers/status:
 *   get:
 *     summary: Get all AI provider status with Nova/External categorization
 *     tags: [AI Control Tower - Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider status retrieved successfully
 */
router.get('/providers/status', async (req, res) => {
  try {
    const { aiFabric } = await import('../lib/ai-fabric.js');
    const status = aiFabric.getStatus();
    const externalConfig = aiFabric.getExternalProviderConfig();
    
    const providers = status.providers || [];
    
    // Categorize providers
    const novaProviders = providers.filter(p => p.isNova);
    const externalProviders = providers.filter(p => !p.isNova);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalProviders: providers.length,
          novaProviders: novaProviders.length,
          externalProviders: externalProviders.length,
          activeNovaProviders: novaProviders.filter(p => p.isActive).length,
          activeExternalProviders: externalProviders.filter(p => p.isActive).length
        },
        externalProviderConfig: externalConfig,
        providers: {
          nova: novaProviders.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            capabilities: p.capabilities,
            isActive: p.isActive,
            canDisable: p.canDisable || false,
            healthStatus: p.healthStatus,
            lastHealthCheck: p.lastHealthCheck,
            priority: 'always_highest'
          })),
          external: externalProviders.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            capabilities: p.capabilities,
            isActive: p.isActive,
            canDisable: p.canDisable !== false,
            healthStatus: p.healthStatus,
            lastHealthCheck: p.lastHealthCheck,
            adminControlled: true,
            allowedByAdmin: externalConfig.enabled && (
              externalConfig.allowedProviders.length === 0 || 
              externalConfig.allowedProviders.includes(p.id)
            )
          }))
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get provider status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provider status',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai-control-tower/providers/validate-config:
 *   post:
 *     summary: Validate provider configuration changes (admin only)
 *     tags: [AI Control Tower - Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [enable_external, disable_external, update_external]
 *               allowedProviders:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Configuration validated successfully
 *       400:
 *         description: Configuration validation failed
 *       403:
 *         description: Admin privileges required
 */
router.post('/providers/validate-config', async (req, res) => {
  try {
    // Check admin privileges
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin privileges required for provider configuration validation'
      });
    }

    const { action, allowedProviders = [] } = req.body;
    const validActions = ['enable_external', 'disable_external', 'update_external'];
    
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
        validActions
      });
    }

    const validationResult = {
      valid: true,
      warnings: [],
      errors: [],
      recommendations: []
    };

    // Validate provider IDs if provided
    if (allowedProviders.length > 0) {
      const validProviders = ['openai-gpt4', 'anthropic-claude', 'azure-openai'];
      const invalidProviders = allowedProviders.filter(p => !validProviders.includes(p));
      
      if (invalidProviders.length > 0) {
        validationResult.valid = false;
        validationResult.errors.push({
          field: 'allowedProviders',
          message: 'Invalid provider IDs',
          invalidProviders,
          validProviders
        });
      }
    }

    // Check for potential issues
    if (action === 'disable_external') {
      validationResult.warnings.push({
        type: 'availability',
        message: 'Disabling external providers will limit AI capabilities to Nova models only',
        impact: 'Reduced fallback options for AI requests'
      });
      
      validationResult.recommendations.push({
        type: 'monitoring',
        message: 'Monitor Nova model performance closely after disabling external providers',
        action: 'Set up enhanced monitoring for Nova model health and response times'
      });
    }

    if (action === 'enable_external' && allowedProviders.length === 0) {
      validationResult.warnings.push({
        type: 'security',
        message: 'Enabling all external providers increases attack surface',
        recommendation: 'Consider limiting to specific providers only'
      });
    }

    // Always remind about Nova model priority
    validationResult.recommendations.push({
      type: 'architecture',
      message: 'Nova models will always maintain highest priority regardless of external provider settings',
      detail: 'This configuration only affects fallback behavior when Nova models are unavailable'
    });

    res.json({
      success: true,
      data: validationResult
    });
  } catch (error) {
    logger.error('Failed to validate provider configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate provider configuration',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai-control-tower/audit/{towerId}:
 *   get:
 *     summary: Get audit trail for control tower
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: towerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Control tower ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [1h, 6h, 24h, 7d, 30d]
 *           default: 24h
 *         description: Time range for audit events
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filter by event type
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         description: Filter by risk level
 *     responses:
 *       200:
 *         description: Audit trail retrieved successfully
 */
router.get(
  '/audit/:towerId',
  [
    param('towerId').isUUID(),
    query('timeRange').optional().isIn(['1h', '6h', '24h', '7d', '30d']),
    query('eventType').optional().isLength({ max: 100 }),
    query('riskLevel').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { towerId } = req.params;
      const { timeRange = '24h', eventType, riskLevel } = req.query;

      // Get audit events from database
      const timeStart = aiControlTower.getTimeRangeStart(timeRange);
      const whereClause = {
        controlTowerId: towerId,
        createdAt: { gte: timeStart },
      };

      if (eventType) whereClause.eventType = eventType;
      if (riskLevel) whereClause.riskLevel = riskLevel;

      const auditEvents = await aiControlTower.db.aIAuditTrail.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 1000, // Limit results
      });

      res.json({
        success: true,
        data: auditEvents,
        count: auditEvents.length,
        timeRange,
        filters: { eventType, riskLevel },
      });
    } catch (error) {
      logger.error('Failed to get audit trail', {
        error: error.message,
        towerId: req.params.towerId,
        userId: req.user.id,
      });

      res.status(500).json({
        error: 'Failed to get audit trail',
        message: error.message,
        code: 'AUDIT_FETCH_FAILED',
      });
    }
  },
);

// Error handling middleware
router.use((error, req, res, _next) => {
  logger.error('AI Control Tower API error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
  });
});

export default router;
