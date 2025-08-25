/**
 * AI Control Tower API Routes
 * Enterprise-grade AI/ML/RAG system with custom training and audit trails
 * Provides REST API endpoints for AI control tower management
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import { aiControlTower } from '../lib/ai-control-tower.js';
import { authMiddleware } from '../middleware/auth.js';
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
