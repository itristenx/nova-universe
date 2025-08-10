import { EventEmitter } from 'events';
import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { aiMonitoringSystem } from './ai-monitoring.js';

// Interfaces for Nova Local AI
export interface NovaModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'nlp' | 'prediction' | 'clustering';
  status: 'training' | 'ready' | 'deploying' | 'error';
  accuracy?: number;
  trainingData: {
    samples: number;
    features: number;
    lastUpdated: Date;
  };
  modelPath: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingConfig {
  modelType: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  earlyStoppingPatience: number;
  metrics: string[];
  optimizer: string;
  lossFunction: string;
}

export interface TrainingData {
  features: number[][];
  labels: number[];
  metadata: {
    source: string;
    timestamp: Date;
    userId?: string;
    ticketId?: string;
  }[];
}

export interface PredictionRequest {
  modelId: string;
  input: any;
  context?: any;
  userId?: string;
  sessionId?: string;
}

export interface PredictionResult {
  prediction: any;
  confidence: number;
  modelUsed: string;
  processingTime: number;
  explanation?: any;
  alternatives?: Array<{
    prediction: any;
    confidence: number;
  }>;
}

export interface LearningFeedback {
  predictionId: string;
  actualOutcome: any;
  feedback: 'correct' | 'incorrect' | 'partial';
  userCorrection?: any;
  context?: any;
}

/**
 * Nova Local AI/ML System
 * Provides in-house AI capabilities with continuous learning
 */
export class NovaLocalAI extends EventEmitter {
  private models: Map<string, NovaModel> = new Map();
  private loadedModels: Map<string, tf.LayersModel> = new Map();
  private trainingQueue: Array<{
    modelId: string;
    config: TrainingConfig;
    data: TrainingData;
  }> = [];
  private isTraining = false;
  private modelsPath: string;
  private feedbackBuffer: LearningFeedback[] = [];
  private retrainingThreshold = 100; // Number of feedback items before retraining

  constructor() {
    super();
    this.modelsPath = process.env.NOVA_AI_MODELS_PATH || '/workspace/data/ai-models';
    this.initializeDirectory();
    this.loadExistingModels();
    this.startContinuousLearning();
  }

  /**
   * Initialize models directory
   */
  private async initializeDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.modelsPath, { recursive: true });
      await fs.mkdir(path.join(this.modelsPath, 'training'), { recursive: true });
      await fs.mkdir(path.join(this.modelsPath, 'production'), { recursive: true });
      await fs.mkdir(path.join(this.modelsPath, 'archive'), { recursive: true });
    } catch (error) {
      console.error('Failed to initialize models directory:', error);
    }
  }

  /**
   * Load existing models from disk
   */
  private async loadExistingModels(): Promise<void> {
    try {
      const modelsFile = path.join(this.modelsPath, 'models.json');
      const exists = await fs.access(modelsFile).then(() => true).catch(() => false);
      
      if (exists) {
        const modelsData = await fs.readFile(modelsFile, 'utf-8');
        const models: NovaModel[] = JSON.parse(modelsData);
        
        for (const model of models) {
          this.models.set(model.id, model);
          if (model.status === 'ready') {
            await this.loadModel(model.id);
          }
        }
        
        console.log(`Loaded ${models.length} Nova AI models`);
      }
    } catch (error) {
      console.error('Failed to load existing models:', error);
    }
  }

  /**
   * Create a new AI model
   */
  async createModel(
    name: string,
    type: NovaModel['type'],
    config: TrainingConfig
  ): Promise<string> {
    const modelId = createHash('sha256')
      .update(`${name}-${type}-${Date.now()}`)
      .digest('hex')
      .substring(0, 16);

    const model: NovaModel = {
      id: modelId,
      name,
      version: '1.0.0',
      type,
      status: 'training',
      trainingData: {
        samples: 0,
        features: 0,
        lastUpdated: new Date()
      },
      modelPath: path.join(this.modelsPath, 'production', modelId),
      metadata: { config },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.models.set(modelId, model);
    await this.saveModelsMetadata();

    await aiMonitoringSystem.recordAuditEvent({
      type: 'model_created',
      userId: 'system',
      details: { modelId, name, type },
      riskLevel: 'low'
    });

    this.emit('modelCreated', model);
    return modelId;
  }

  /**
   * Train a model with provided data
   */
  async trainModel(
    modelId: string,
    trainingData: TrainingData,
    config: TrainingConfig
  ): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Add to training queue
    this.trainingQueue.push({ modelId, config, data: trainingData });
    
    model.status = 'training';
    model.trainingData = {
      samples: trainingData.features.length,
      features: trainingData.features[0]?.length || 0,
      lastUpdated: new Date()
    };
    
    this.models.set(modelId, model);
    await this.saveModelsMetadata();

    if (!this.isTraining) {
      this.processTrainingQueue();
    }

    await aiMonitoringSystem.recordAuditEvent({
      type: 'model_training_started',
      userId: 'system',
      details: { modelId, samples: trainingData.features.length },
      riskLevel: 'medium'
    });
  }

  /**
   * Process training queue
   */
  private async processTrainingQueue(): Promise<void> {
    if (this.isTraining || this.trainingQueue.length === 0) {
      return;
    }

    this.isTraining = true;

    while (this.trainingQueue.length > 0) {
      const job = this.trainingQueue.shift()!;
      await this.executeTraining(job.modelId, job.data, job.config);
    }

    this.isTraining = false;
  }

  /**
   * Execute model training
   */
  private async executeTraining(
    modelId: string,
    data: TrainingData,
    config: TrainingConfig
  ): Promise<void> {
    try {
      const model = this.models.get(modelId)!;
      
      // Create TensorFlow model based on type
      let tfModel: tf.LayersModel;
      
      switch (model.type) {
        case 'classification':
          tfModel = await this.createClassificationModel(data, config);
          break;
        case 'regression':
          tfModel = await this.createRegressionModel(data, config);
          break;
        case 'nlp':
          tfModel = await this.createNLPModel(data, config);
          break;
        case 'prediction':
          tfModel = await this.createPredictionModel(data, config);
          break;
        default:
          throw new Error(`Unsupported model type: ${model.type}`);
      }

      // Prepare training data
      const xs = tf.tensor2d(data.features);
      const ys = tf.tensor1d(data.labels);

      // Training callbacks
      const callbacks = {
        onEpochEnd: (epoch: number, logs: any) => {
          this.emit('trainingProgress', {
            modelId,
            epoch,
            loss: logs.loss,
            accuracy: logs.accuracy
          });
        }
      };

      // Train the model
      const history = await tfModel.fit(xs, ys, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationSplit: config.validationSplit,
        callbacks
      });

      // Save the trained model
      await tfModel.save(`file://${model.modelPath}`);
      
      // Update model metadata
      const finalAccuracy = history.history.accuracy?.slice(-1)[0] as number || 0;
      model.status = 'ready';
      model.accuracy = finalAccuracy;
      model.updatedAt = new Date();
      
      this.models.set(modelId, model);
      this.loadedModels.set(modelId, tfModel);
      
      await this.saveModelsMetadata();

      // Record training completion
      await aiMonitoringSystem.recordMetric({
        type: 'model_performance',
        value: finalAccuracy,
        metadata: { modelId, type: model.type, trainingTime: Date.now() }
      });

      // Cleanup tensors
      xs.dispose();
      ys.dispose();

      this.emit('trainingCompleted', { modelId, accuracy: finalAccuracy });

    } catch (error) {
      const model = this.models.get(modelId)!;
      model.status = 'error';
      this.models.set(modelId, model);
      
      await aiMonitoringSystem.recordAuditEvent({
        type: 'model_training_failed',
        userId: 'system',
        details: { modelId, error: error.message },
        riskLevel: 'high'
      });

      throw error;
    }
  }

  /**
   * Create classification model
   */
  private async createClassificationModel(
    data: TrainingData,
    config: TrainingConfig
  ): Promise<tf.LayersModel> {
    const inputShape = data.features[0].length;
    const numClasses = Math.max(...data.labels) + 1;

    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [inputShape],
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: numClasses,
          activation: 'softmax'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'sparseCategoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Create regression model
   */
  private async createRegressionModel(
    data: TrainingData,
    config: TrainingConfig
  ): Promise<tf.LayersModel> {
    const inputShape = data.features[0].length;

    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [inputShape],
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'linear'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'meanSquaredError',
      metrics: ['meanAbsoluteError']
    });

    return model;
  }

  /**
   * Create NLP model (simplified)
   */
  private async createNLPModel(
    data: TrainingData,
    config: TrainingConfig
  ): Promise<tf.LayersModel> {
    const inputShape = data.features[0].length;
    const vocabSize = Math.max(...data.features.flat()) + 1;
    const embeddingDim = 128;

    const model = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: vocabSize,
          outputDim: embeddingDim,
          inputLength: inputShape
        }),
        tf.layers.globalAveragePooling1d(),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Create prediction model (time series)
   */
  private async createPredictionModel(
    data: TrainingData,
    config: TrainingConfig
  ): Promise<tf.LayersModel> {
    const inputShape = data.features[0].length;

    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: [inputShape, 1]
        }),
        tf.layers.lstm({
          units: 50,
          returnSequences: false
        }),
        tf.layers.dense({
          units: 25,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'linear'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'meanSquaredError',
      metrics: ['meanAbsoluteError']
    });

    return model;
  }

  /**
   * Load a trained model into memory
   */
  async loadModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model || model.status !== 'ready') {
      throw new Error(`Model ${modelId} not ready for loading`);
    }

    try {
      const tfModel = await tf.loadLayersModel(`file://${model.modelPath}/model.json`);
      this.loadedModels.set(modelId, tfModel);
      
      await aiMonitoringSystem.recordAuditEvent({
        type: 'model_loaded',
        userId: 'system',
        details: { modelId },
        riskLevel: 'low'
      });

    } catch (error) {
      console.error(`Failed to load model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Make prediction using a trained model
   */
  async predict(request: PredictionRequest): Promise<PredictionResult> {
    const startTime = Date.now();
    const model = this.models.get(request.modelId);
    
    if (!model) {
      throw new Error(`Model ${request.modelId} not found`);
    }

    if (!this.loadedModels.has(request.modelId)) {
      await this.loadModel(request.modelId);
    }

    const tfModel = this.loadedModels.get(request.modelId)!;

    try {
      // Prepare input tensor
      const inputTensor = tf.tensor2d([request.input]);
      
      // Make prediction
      const prediction = tfModel.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Calculate confidence based on model type
      let confidence = 0;
      let result: any;

      if (model.type === 'classification') {
        const probabilities = Array.from(predictionData);
        confidence = Math.max(...probabilities);
        result = probabilities.indexOf(confidence);
      } else {
        result = predictionData[0];
        confidence = Math.min(1, Math.max(0, 1 - Math.abs(result) / 100)); // Simple confidence
      }

      // Cleanup tensors
      inputTensor.dispose();
      prediction.dispose();

      const processingTime = Date.now() - startTime;

      // Record prediction metric
      await aiMonitoringSystem.recordMetric({
        type: 'model_prediction',
        value: confidence,
        metadata: {
          modelId: request.modelId,
          processingTime,
          userId: request.userId
        }
      });

      const predictionResult: PredictionResult = {
        prediction: result,
        confidence,
        modelUsed: request.modelId,
        processingTime,
        explanation: await this.generateExplanation(request, result)
      };

      this.emit('predictionMade', predictionResult);
      return predictionResult;

    } catch (error) {
      await aiMonitoringSystem.recordAuditEvent({
        type: 'model_prediction_failed',
        userId: request.userId || 'system',
        details: { modelId: request.modelId, error: error.message },
        riskLevel: 'medium'
      });

      throw error;
    }
  }

  /**
   * Generate explanation for prediction
   */
  private async generateExplanation(
    request: PredictionRequest,
    result: any
  ): Promise<any> {
    // Simplified explanation - in production, use SHAP, LIME, or similar
    return {
      method: 'feature_importance',
      factors: [
        { feature: 'primary_factor', importance: 0.7, value: 'high' },
        { feature: 'secondary_factor', importance: 0.3, value: 'medium' }
      ],
      reasoning: `Prediction based on ${request.input.length} input features`
    };
  }

  /**
   * Submit learning feedback
   */
  async submitFeedback(feedback: LearningFeedback): Promise<void> {
    this.feedbackBuffer.push(feedback);

    await aiMonitoringSystem.recordAuditEvent({
      type: 'learning_feedback_received',
      userId: 'system',
      details: { 
        predictionId: feedback.predictionId,
        feedback: feedback.feedback 
      },
      riskLevel: 'low'
    });

    // Trigger retraining if threshold reached
    if (this.feedbackBuffer.length >= this.retrainingThreshold) {
      await this.processLearningFeedback();
    }

    this.emit('feedbackReceived', feedback);
  }

  /**
   * Process accumulated learning feedback
   */
  private async processLearningFeedback(): Promise<void> {
    if (this.feedbackBuffer.length === 0) return;

    const feedback = [...this.feedbackBuffer];
    this.feedbackBuffer = [];

    // Group feedback by model
    const modelFeedback = new Map<string, LearningFeedback[]>();
    
    for (const item of feedback) {
      // Note: In real implementation, track prediction->model mapping
      const modelId = 'default'; // Simplified for this example
      if (!modelFeedback.has(modelId)) {
        modelFeedback.set(modelId, []);
      }
      modelFeedback.get(modelId)!.push(item);
    }

    // Process feedback for each model
    for (const [modelId, feedbackItems] of modelFeedback) {
      await this.updateModelFromFeedback(modelId, feedbackItems);
    }

    await aiMonitoringSystem.recordAuditEvent({
      type: 'learning_feedback_processed',
      userId: 'system',
      details: { 
        feedbackItems: feedback.length,
        modelsUpdated: modelFeedback.size 
      },
      riskLevel: 'low'
    });
  }

  /**
   * Update model based on feedback
   */
  private async updateModelFromFeedback(
    modelId: string,
    feedback: LearningFeedback[]
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Extract corrected training samples from feedback
    // 2. Retrain or fine-tune the model
    // 3. Validate improved performance
    // 4. Deploy updated model

    console.log(`Processing ${feedback.length} feedback items for model ${modelId}`);
    
    // Simplified: just log the feedback processing
    const correctFeedback = feedback.filter(f => f.feedback === 'correct').length;
    const incorrectFeedback = feedback.filter(f => f.feedback === 'incorrect').length;
    
    const accuracy = correctFeedback / feedback.length;
    
    await aiMonitoringSystem.recordMetric({
      type: 'model_feedback_accuracy',
      value: accuracy,
      metadata: { modelId, totalFeedback: feedback.length }
    });
  }

  /**
   * Start continuous learning process
   */
  private startContinuousLearning(): void {
    // Process feedback every 5 minutes
    setInterval(async () => {
      if (this.feedbackBuffer.length > 0) {
        await this.processLearningFeedback();
      }
    }, 5 * 60 * 1000);

    // Health check every hour
    setInterval(async () => {
      await this.performHealthCheck();
    }, 60 * 60 * 1000);
  }

  /**
   * Perform health check on all models
   */
  private async performHealthCheck(): Promise<void> {
    for (const [modelId, model] of this.models) {
      try {
        if (model.status === 'ready' && this.loadedModels.has(modelId)) {
          // Simple health check - make a test prediction
          const testInput = Array(model.trainingData.features).fill(0);
          await this.predict({
            modelId,
            input: testInput,
            context: { healthCheck: true }
          });
        }
      } catch (error) {
        console.error(`Health check failed for model ${modelId}:`, error);
        
        await aiMonitoringSystem.recordAuditEvent({
          type: 'model_health_check_failed',
          userId: 'system',
          details: { modelId, error: error.message },
          riskLevel: 'high'
        });
      }
    }
  }

  /**
   * Get model information
   */
  getModel(modelId: string): NovaModel | undefined {
    return this.models.get(modelId);
  }

  /**
   * List all models
   */
  listModels(): NovaModel[] {
    return Array.from(this.models.values());
  }

  /**
   * Delete a model
   */
  async deleteModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Remove from memory
    this.loadedModels.delete(modelId);
    this.models.delete(modelId);

    // Archive model files
    const archivePath = path.join(this.modelsPath, 'archive', `${modelId}-${Date.now()}`);
    try {
      await fs.rename(model.modelPath, archivePath);
    } catch (error) {
      console.error(`Failed to archive model ${modelId}:`, error);
    }

    await this.saveModelsMetadata();

    await aiMonitoringSystem.recordAuditEvent({
      type: 'model_deleted',
      userId: 'system',
      details: { modelId, archived: true },
      riskLevel: 'medium'
    });
  }

  /**
   * Save models metadata to disk
   */
  private async saveModelsMetadata(): Promise<void> {
    try {
      const modelsFile = path.join(this.modelsPath, 'models.json');
      const modelsArray = Array.from(this.models.values());
      await fs.writeFile(modelsFile, JSON.stringify(modelsArray, null, 2));
    } catch (error) {
      console.error('Failed to save models metadata:', error);
    }
  }

  /**
   * Get system status
   */
  getStatus(): any {
    return {
      totalModels: this.models.size,
      loadedModels: this.loadedModels.size,
      trainingQueue: this.trainingQueue.length,
      isTraining: this.isTraining,
      feedbackBuffer: this.feedbackBuffer.length,
      models: Array.from(this.models.values()).map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        status: m.status,
        accuracy: m.accuracy
      }))
    };
  }
}

// Export singleton instance
export const novaLocalAI = new NovaLocalAI();
