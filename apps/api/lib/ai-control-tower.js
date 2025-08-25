/**
 * AI Control Tower Service
 * Enterprise-grade AI/ML/RAG system with custom training, audit trails, and governance
 * Based on industry standards for AI control plane architecture
 */

import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import * as fs from 'fs/promises';
import { logger } from '../../api/logger.js';

// Create AI database client
const aiDbClient = new PrismaClient({
  datasources: {
    ai_db: {
      url: process.env.AI_DATABASE_URL || 'postgresql://localhost:5432/nova_ai',
    },
  },
});

/**
 * AI Control Tower - Main orchestration service
 * Implements enterprise AI governance patterns from ServiceNow and industry best practices
 */
export class AIControlTowerService extends EventEmitter {
  constructor() {
    super();
    this.db = aiDbClient;
    this.initialized = false;
    this.towers = new Map();
    this.activeModels = new Map();
    this.trainingQueue = [];
    this.isTraining = false;

    // Vector database for RAG (can be extended to use external vector DBs)
    this.vectorDb = new Map();

    // AI Gateway routing
    this.gatewayRoutes = new Map();
    this.providers = new Map();

    // Performance monitoring
    this.metrics = {
      requests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      costTracking: 0,
    };
  }

  /**
   * Initialize AI Control Tower
   */
  async initialize() {
    try {
      logger.info('Initializing AI Control Tower...');

      // Connect to database
      await this.db.$connect();

      // Load existing towers and models
      await this.loadExistingResources();

      // Initialize default providers
      await this.initializeProviders();

      // Setup monitoring
      this.setupMonitoring();

      this.initialized = true;
      logger.info('AI Control Tower initialized successfully');

      this.emit('initialized');
    } catch (error) {
      logger.error('Failed to initialize AI Control Tower', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a new AI Control Tower instance
   */
  async createControlTower(config) {
    try {
      const tower = await this.db.aIControlTower.create({
        data: {
          name: config.name,
          description: config.description,
          organizationId: config.organizationId,
          environment: config.environment || 'DEVELOPMENT',
          configuration: config.configuration || {},
          metadata: config.metadata || {},
        },
      });

      this.towers.set(tower.id, tower);

      await this.recordAuditEvent({
        eventType: 'SYSTEM_EVENT',
        action: 'TOWER_CREATED',
        entityType: 'AIControlTower',
        entityId: tower.id,
        userId: config.userId || 'system',
        riskLevel: 'LOW',
        newValues: tower,
      });

      logger.info('AI Control Tower created', { towerId: tower.id, name: tower.name });
      this.emit('towerCreated', tower);

      return tower;
    } catch (error) {
      logger.error('Failed to create AI Control Tower', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a new AI model with configuration
   */
  async createModel(towerId, config) {
    try {
      const model = await this.db.aIModel.create({
        data: {
          controlTowerId: towerId,
          name: config.name,
          description: config.description,
          type: config.type,
          framework: config.framework || 'tensorflow',
          version: config.version || '1.0.0',
          configuration: config.configuration || {},
          hyperparameters: config.hyperparameters || {},
          architecture: config.architecture || {},
          trainingConfig: config.trainingConfig,
        },
      });

      this.activeModels.set(model.id, model);

      await this.recordAuditEvent({
        eventType: 'MODEL_CREATED',
        action: 'CREATE_MODEL',
        entityType: 'AIModel',
        entityId: model.id,
        controlTowerId: towerId,
        userId: config.userId || 'system',
        riskLevel: 'MEDIUM',
        newValues: model,
      });

      logger.info('AI Model created', { modelId: model.id, name: model.name, type: model.type });
      this.emit('modelCreated', model);

      return model;
    } catch (error) {
      logger.error('Failed to create AI model', { error: error.message });
      throw error;
    }
  }

  /**
   * Create custom training dataset
   */
  async createCustomDataset(towerId, config) {
    try {
      const dataset = await this.db.customDataset.create({
        data: {
          controlTowerId: towerId,
          name: config.name,
          description: config.description,
          datasetType: config.datasetType,
          schema: config.schema || {},
          metadata: config.metadata || {},
          tags: config.tags || [],
          storagePath: config.storagePath,
          storageFormat: config.storageFormat || 'parquet',
          isPublic: config.isPublic || false,
          accessPolicy: config.accessPolicy,
        },
      });

      await this.recordAuditEvent({
        eventType: 'DATASET_CREATED',
        action: 'CREATE_DATASET',
        entityType: 'CustomDataset',
        entityId: dataset.id,
        controlTowerId: towerId,
        userId: config.userId || 'system',
        riskLevel: 'MEDIUM',
        newValues: dataset,
      });

      logger.info('Custom dataset created', { datasetId: dataset.id, name: dataset.name });
      this.emit('datasetCreated', dataset);

      return dataset;
    } catch (error) {
      logger.error('Failed to create custom dataset', { error: error.message });
      throw error;
    }
  }

  /**
   * Start custom training job with audit trails
   */
  async startCustomTraining(modelId, trainingConfig) {
    try {
      const model = await this.db.aIModel.findUnique({
        where: { id: modelId },
        include: { controlTower: true },
      });

      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      // Create training job
      const job = await this.db.trainingJob.create({
        data: {
          modelId,
          name: trainingConfig.name || `Training ${model.name}`,
          description: trainingConfig.description,
          jobType: trainingConfig.jobType || 'TRAINING',
          trainingConfig: trainingConfig.config || {},
          datasetConfig: trainingConfig.datasetConfig || {},
          hyperparameters: trainingConfig.hyperparameters || {},
          totalEpochs: trainingConfig.epochs || 100,
        },
      });

      // Update model status
      await this.db.aIModel.update({
        where: { id: modelId },
        data: { status: 'TRAINING' },
      });

      // Add to training queue
      this.trainingQueue.push({
        jobId: job.id,
        modelId,
        config: trainingConfig,
      });

      await this.recordAuditEvent({
        eventType: 'MODEL_TRAINED',
        action: 'START_TRAINING',
        entityType: 'TrainingJob',
        entityId: job.id,
        modelId,
        controlTowerId: model.controlTowerId,
        userId: trainingConfig.userId || 'system',
        riskLevel: 'HIGH',
        newValues: { jobId: job.id, config: trainingConfig },
      });

      // Start processing queue if not already running
      if (!this.isTraining) {
        this.processTrainingQueue();
      }

      logger.info('Training job started', { jobId: job.id, modelId, modelName: model.name });
      this.emit('trainingStarted', { job, model });

      return job;
    } catch (error) {
      logger.error('Failed to start training', { error: error.message, modelId });
      throw error;
    }
  }

  /**
   * Process training queue with enterprise monitoring
   */
  async processTrainingQueue() {
    if (this.isTraining || this.trainingQueue.length === 0) {
      return;
    }

    this.isTraining = true;

    while (this.trainingQueue.length > 0) {
      const queueItem = this.trainingQueue.shift();
      await this.executeTraining(queueItem);
    }

    this.isTraining = false;
  }

  /**
   * Execute model training with comprehensive monitoring
   */
  async executeTraining(queueItem) {
    const { jobId, modelId, config } = queueItem;

    try {
      // Update job status
      await this.db.trainingJob.update({
        where: { id: jobId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      // Get model and training data
      const model = await this.db.aIModel.findUnique({
        where: { id: modelId },
        include: { customTrainingSets: true },
      });

      // Create TensorFlow model based on type
      let tfModel;
      switch (model.type) {
        case 'CLASSIFICATION':
          tfModel = await this.createClassificationModel(config);
          break;
        case 'REGRESSION':
          tfModel = await this.createRegressionModel(config);
          break;
        case 'NLP':
          tfModel = await this.createNLPModel(config);
          break;
        default:
          throw new Error(`Unsupported model type: ${model.type}`);
      }

      // Training with progress monitoring
      const trainingData = await this.prepareTrainingData(config);
      const history = await this.trainModelWithMonitoring(tfModel, trainingData, config, jobId);

      // Save trained model
      const modelPath = path.join('./data/ai-models', modelId);
      await fs.mkdir(modelPath, { recursive: true });
      await tfModel.save(`file://${modelPath}`);

      // Update model and job
      await this.db.aIModel.update({
        where: { id: modelId },
        data: {
          status: 'READY',
          modelPath,
          accuracy: history.accuracy,
          loss: history.loss,
        },
      });

      await this.db.trainingJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          finalMetrics: history,
          progress: 100,
        },
      });

      await this.recordAuditEvent({
        eventType: 'MODEL_TRAINED',
        action: 'TRAINING_COMPLETED',
        entityType: 'TrainingJob',
        entityId: jobId,
        modelId,
        userId: 'system',
        riskLevel: 'MEDIUM',
        newValues: { metrics: history, modelPath },
      });

      logger.info('Training completed successfully', { jobId, modelId });
      this.emit('trainingCompleted', { jobId, modelId, metrics: history });
    } catch (error) {
      // Handle training failure
      await this.db.trainingJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error.message,
        },
      });

      await this.db.aIModel.update({
        where: { id: modelId },
        data: { status: 'ERROR' },
      });

      await this.recordAuditEvent({
        eventType: 'SYSTEM_EVENT',
        action: 'TRAINING_FAILED',
        entityType: 'TrainingJob',
        entityId: jobId,
        modelId,
        userId: 'system',
        riskLevel: 'HIGH',
        newValues: { error: error.message },
      });

      logger.error('Training failed', { jobId, modelId, error: error.message });
      this.emit('trainingFailed', { jobId, modelId, error });
    }
  }

  /**
   * Create RAG system with vector database integration
   */
  async createRAGSystem(config) {
    try {
      const ragSystem = await this.db.rAGSystem.create({
        data: {
          name: config.name,
          description: config.description,
          embeddingModel: config.embeddingModel || 'sentence-transformers/all-MiniLM-L6-v2',
          vectorDimensions: config.vectorDimensions || 384,
          chunkSize: config.chunkSize || 1000,
          chunkOverlap: config.chunkOverlap || 200,
          retrievalStrategy: config.retrievalStrategy || 'semantic',
          maxRetrievalDocs: config.maxRetrievalDocs || 5,
          similarityThreshold: config.similarityThreshold || 0.7,
          generativeModel: config.generativeModel || 'gpt-3.5-turbo',
          maxTokens: config.maxTokens || 2048,
          temperature: config.temperature || 0.7,
          systemPrompt: config.systemPrompt,
          contextPrompt: config.contextPrompt,
        },
      });

      // Initialize vector storage for this RAG system
      this.vectorDb.set(ragSystem.id, new Map());

      logger.info('RAG system created', { ragSystemId: ragSystem.id, name: ragSystem.name });
      this.emit('ragSystemCreated', ragSystem);

      return ragSystem;
    } catch (error) {
      logger.error('Failed to create RAG system', { error: error.message });
      throw error;
    }
  }

  /**
   * Add document to RAG system with processing
   */
  async addRAGDocument(ragSystemId, documentConfig) {
    try {
      const document = await this.db.rAGDocument.create({
        data: {
          ragSystemId,
          title: documentConfig.title,
          content: documentConfig.content,
          contentType: documentConfig.contentType || 'text/plain',
          source: documentConfig.source,
          url: documentConfig.url,
          tags: documentConfig.tags || [],
          category: documentConfig.category,
          language: documentConfig.language || 'en',
        },
      });

      // Process document (chunking and embedding)
      await this.processRAGDocument(document);

      logger.info('RAG document added', { documentId: document.id, ragSystemId });
      this.emit('ragDocumentAdded', document);

      return document;
    } catch (error) {
      logger.error('Failed to add RAG document', { error: error.message });
      throw error;
    }
  }

  /**
   * Process RAG document - chunking and embedding
   */
  async processRAGDocument(document) {
    try {
      // Simple chunking implementation (can be enhanced with more sophisticated methods)
      const chunks = this.chunkText(document.content, 1000, 200);

      // Generate embeddings for chunks (placeholder - integrate with actual embedding service)
      const processedChunks = await Promise.all(
        chunks.map(async (chunk, index) => ({
          id: `${document.id}_chunk_${index}`,
          text: chunk,
          embedding: await this.generateEmbedding(chunk), // Placeholder
          metadata: {
            documentId: document.id,
            chunkIndex: index,
            title: document.title,
            source: document.source,
          },
        })),
      );

      // Store in vector database
      const vectorStore = this.vectorDb.get(document.ragSystemId);
      processedChunks.forEach((chunk) => {
        vectorStore.set(chunk.id, chunk);
      });

      // Update document with processed chunks
      await this.db.rAGDocument.update({
        where: { id: document.id },
        data: {
          processed: true,
          chunks: processedChunks.map((c) => ({ id: c.id, text: c.text, metadata: c.metadata })),
        },
      });

      logger.info('RAG document processed', {
        documentId: document.id,
        chunksCount: chunks.length,
      });
    } catch (error) {
      logger.error('Failed to process RAG document', {
        documentId: document.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Query RAG system
   */
  async queryRAG(ragSystemId, query, options = {}) {
    const startTime = Date.now();

    try {
      const ragSystem = await this.db.rAGSystem.findUnique({
        where: { id: ragSystemId },
      });

      if (!ragSystem) {
        throw new Error(`RAG system ${ragSystemId} not found`);
      }

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Retrieve relevant documents
      const retrievalStart = Date.now();
      const retrievedDocs = await this.retrieveDocuments(
        ragSystemId,
        queryEmbedding,
        ragSystem.maxRetrievalDocs,
      );
      const retrievalTime = Date.now() - retrievalStart;

      // Generate response
      const generationStart = Date.now();
      const response = await this.generateRAGResponse(ragSystem, query, retrievedDocs);
      const generationTime = Date.now() - generationStart;

      const totalTime = Date.now() - startTime;

      // Record query
      const ragQuery = await this.db.rAGQuery.create({
        data: {
          ragSystemId,
          query,
          queryEmbedding,
          retrievedDocs: retrievedDocs.map((d) => ({ id: d.id, score: d.score })),
          generatedResponse: response,
          retrievalTime,
          generationTime,
          totalTime,
          userId: options.userId,
          sessionId: options.sessionId,
        },
      });

      // Update system metrics
      await this.updateRAGMetrics(ragSystemId, totalTime);

      logger.info('RAG query processed', {
        ragSystemId,
        queryId: ragQuery.id,
        totalTime,
        retrievedDocsCount: retrievedDocs.length,
      });

      return {
        response,
        retrievedDocs,
        metrics: {
          retrievalTime,
          generationTime,
          totalTime,
        },
        queryId: ragQuery.id,
      };
    } catch (error) {
      logger.error('RAG query failed', { ragSystemId, error: error.message });
      throw error;
    }
  }

  /**
   * Record audit event with comprehensive tracking
   */
  async recordAuditEvent(event) {
    try {
      const auditTrail = await this.db.aIAuditTrail.create({
        data: {
          controlTowerId: event.controlTowerId,
          modelId: event.modelId,
          eventType: event.eventType,
          action: event.action,
          description: event.description,
          entityType: event.entityType,
          entityId: event.entityId,
          userId: event.userId,
          userRole: event.userRole,
          userAgent: event.userAgent,
          ipAddress: event.ipAddress,
          oldValues: event.oldValues,
          newValues: event.newValues,
          changedFields: event.changedFields || [],
          sessionId: event.sessionId,
          requestId: event.requestId,
          metadata: event.metadata,
          riskLevel: event.riskLevel || 'LOW',
          complianceFlags: event.complianceFlags || [],
        },
      });

      // Emit audit event for real-time monitoring
      this.emit('auditEvent', auditTrail);

      return auditTrail;
    } catch (error) {
      logger.error('Failed to record audit event', { error: error.message });
      // Don't throw here to avoid breaking main operations
    }
  }

  /**
   * Get control tower metrics and analytics
   */
  async getControlTowerMetrics(towerId, timeRange = '24h') {
    try {
      const tower = await this.db.aIControlTower.findUnique({
        where: { id: towerId },
        include: {
          models: true,
          auditTrails: {
            where: {
              createdAt: {
                gte: this.getTimeRangeStart(timeRange),
              },
            },
          },
          gateways: {
            include: {
              requests: {
                where: {
                  requestTime: {
                    gte: this.getTimeRangeStart(timeRange),
                  },
                },
              },
            },
          },
        },
      });

      if (!tower) {
        throw new Error(`Control tower ${towerId} not found`);
      }

      // Calculate metrics
      const totalModels = tower.models.length;
      const activeModels = tower.models.filter(
        (m) => m.status === 'READY' || m.status === 'DEPLOYED',
      ).length;
      const trainingModels = tower.models.filter((m) => m.status === 'TRAINING').length;

      const totalRequests = tower.gateways.reduce((sum, g) => sum + g.requests.length, 0);
      const avgResponseTime =
        tower.gateways.reduce((sum, g) => {
          const avgTime =
            g.requests.reduce((s, r) => s + (r.responseTime || 0), 0) / g.requests.length;
          return sum + (avgTime || 0);
        }, 0) / tower.gateways.length;

      const auditEvents = tower.auditTrails.length;
      const highRiskEvents = tower.auditTrails.filter(
        (a) => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL',
      ).length;

      return {
        towerId,
        towerName: tower.name,
        timeRange,
        models: {
          total: totalModels,
          active: activeModels,
          training: trainingModels,
          byType: this.groupBy(tower.models, 'type'),
          byStatus: this.groupBy(tower.models, 'status'),
        },
        requests: {
          total: totalRequests,
          averageResponseTime: avgResponseTime,
          errorRate: this.calculateErrorRate(tower.gateways),
        },
        audit: {
          totalEvents: auditEvents,
          highRiskEvents,
          eventsByType: this.groupBy(tower.auditTrails, 'eventType'),
          riskDistribution: this.groupBy(tower.auditTrails, 'riskLevel'),
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get control tower metrics', { towerId, error: error.message });
      throw error;
    }
  }

  // === HELPER METHODS ===

  async loadExistingResources() {
    const towers = await this.db.aIControlTower.findMany({
      include: { models: true },
    });

    towers.forEach((tower) => {
      this.towers.set(tower.id, tower);
      tower.models.forEach((model) => {
        this.activeModels.set(model.id, model);
      });
    });
  }

  async initializeProviders() {
    // Initialize default AI providers based on configuration
    const defaultProviders = [
      { name: 'OpenAI', type: 'OPENAI', endpoint: 'https://api.openai.com/v1' },
      { name: 'Anthropic', type: 'ANTHROPIC', endpoint: 'https://api.anthropic.com/v1' },
      { name: 'Azure OpenAI', type: 'AZURE_OPENAI', endpoint: process.env.AZURE_OPENAI_ENDPOINT },
    ];

    for (const provider of defaultProviders) {
      if (provider.endpoint) {
        this.providers.set(provider.name, provider);
      }
    }
  }

  setupMonitoring() {
    // Setup performance monitoring
    setInterval(() => {
      this.emit('metricsUpdate', this.metrics);
    }, 60000); // Every minute
  }

  chunkText(text, chunkSize, overlap) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async generateEmbedding(_text) {
    // Placeholder for embedding generation
    // In a real implementation, this would call an embedding service
    return Array.from({ length: 384 }, () => Math.random());
  }

  async retrieveDocuments(ragSystemId, queryEmbedding, maxDocs) {
    // Placeholder for vector similarity search
    // In a real implementation, this would use a proper vector database
    const vectorStore = this.vectorDb.get(ragSystemId);
    if (!vectorStore) return [];

    const docs = Array.from(vectorStore.values());
    return docs.slice(0, maxDocs).map((doc) => ({
      ...doc,
      score: Math.random(), // Placeholder similarity score
    }));
  }

  async generateRAGResponse(ragSystem, query, retrievedDocs) {
    // Placeholder for RAG response generation
    // In a real implementation, this would call the generative model
    const context = retrievedDocs.map((doc) => doc.text).join('\n\n');
    return `Based on the provided context, here's a response to: ${query}\n\nContext: ${context.substring(0, 500)}...`;
  }

  async createClassificationModel(config) {
    // Placeholder for TensorFlow model creation
    return tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [config.inputDim || 10], units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: config.numClasses || 2, activation: 'softmax' }),
      ],
    });
  }

  async createRegressionModel(config) {
    return tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [config.inputDim || 10], units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1 }),
      ],
    });
  }

  async createNLPModel(config) {
    return tf.sequential({
      layers: [
        tf.layers.embedding({ inputDim: config.vocabSize || 10000, outputDim: 128 }),
        tf.layers.lstm({ units: 64 }),
        tf.layers.dense({ units: config.numClasses || 2, activation: 'softmax' }),
      ],
    });
  }

  async trainModelWithMonitoring(model, trainingData, config, jobId) {
    const callbacks = {
      onEpochEnd: async (epoch, logs) => {
        // Update training progress
        await this.db.trainingJob.update({
          where: { id: jobId },
          data: {
            currentEpoch: epoch + 1,
            progress: ((epoch + 1) / config.epochs) * 100,
          },
        });

        this.emit('trainingProgress', {
          jobId,
          epoch: epoch + 1,
          totalEpochs: config.epochs,
          loss: logs.loss,
          accuracy: logs.acc,
        });
      },
    };

    // Compile model
    model.compile({
      optimizer: 'adam',
      loss: config.loss || 'sparseCategoricalCrossentropy',
      metrics: ['accuracy'],
    });

    // Train model
    const history = await model.fit(trainingData.xs, trainingData.ys, {
      epochs: config.epochs || 10,
      batchSize: config.batchSize || 32,
      validationSplit: config.validationSplit || 0.2,
      callbacks,
    });

    return {
      accuracy: history.history.acc?.[history.history.acc.length - 1] || 0,
      loss: history.history.loss?.[history.history.loss.length - 1] || 0,
      history: history.history,
    };
  }

  async prepareTrainingData(config) {
    // Placeholder for data preparation
    // In a real implementation, this would load and preprocess actual training data
    const numSamples = config.numSamples || 1000;
    const inputDim = config.inputDim || 10;

    const xs = tf.randomNormal([numSamples, inputDim]);
    const ys = tf.randomUniform([numSamples], 0, config.numClasses || 2, 'int32');

    return { xs, ys };
  }

  async updateRAGMetrics(ragSystemId, responseTime) {
    await this.db.rAGSystem.update({
      where: { id: ragSystemId },
      data: {
        totalQueries: { increment: 1 },
        avgResponseTime: responseTime, // Simplified - should be running average
      },
    });
  }

  getTimeRangeStart(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '6h':
        return new Date(now.getTime() - 6 * 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  calculateErrorRate(gateways) {
    const totalRequests = gateways.reduce((sum, g) => sum + g.requests.length, 0);
    const errorRequests = gateways.reduce(
      (sum, g) => sum + g.requests.filter((r) => r.statusCode >= 400).length,
      0,
    );

    return totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;
  }
}

// Export singleton instance
export const aiControlTower = new AIControlTowerService();
export default aiControlTower;
