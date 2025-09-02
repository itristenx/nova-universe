/**
 * ML Pipeline API Routes
 * Provides endpoints for managing ML experiments, training, and Cosmo personality integration
 */

import express from 'express';
import { novaMLPipeline } from '../lib/nova-ml-pipeline.ts';
import { itsmTrainingData } from '../lib/itsm-training-data.ts';
import { logger } from '../logger.js';
import { authenticateJWT as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/ml-pipeline/status:
 *   get:
 *     summary: Get ML Pipeline status
 *     tags: [ML Pipeline]
 *     responses:
 *       200:
 *         description: Pipeline status retrieved successfully
 */
router.get('/status', async (req, res) => {
  try {
    const status = novaMLPipeline.getStatus();
    res.json(status);
  } catch (error) {
    logger.error('Failed to get ML pipeline status:', error);
    res.status(500).json({ error: 'Failed to get pipeline status' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/experiments:
 *   get:
 *     summary: List all ML experiments
 *     tags: [ML Pipeline]
 *     responses:
 *       200:
 *         description: Experiments retrieved successfully
 */
router.get('/experiments', async (req, res) => {
  try {
    const experiments = novaMLPipeline.listExperiments();
    res.json(experiments);
  } catch (error) {
    logger.error('Failed to list experiments:', error);
    res.status(500).json({ error: 'Failed to list experiments' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/experiments/itsm:
 *   post:
 *     summary: Create ITSM classification experiment
 *     tags: [ML Pipeline]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modelName:
 *                 type: string
 *               cosmoPersonalityProfile:
 *                 type: string
 *               itsmCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: ITSM experiment created successfully
 */
router.post('/experiments/itsm', async (req, res) => {
  try {
    const { modelName, cosmoPersonalityProfile, itsmCategories } = req.body;

    if (!modelName) {
      return res.status(400).json({ error: 'Model name is required' });
    }

    // Initialize ML Pipeline if not already done
    if (!novaMLPipeline.isInitialized) {
      await novaMLPipeline.initialize();
    }

    const experimentId = await novaMLPipeline.createITSMExperiment(
      modelName,
      cosmoPersonalityProfile || 'default',
      itsmCategories
    );

    logger.info(`Created ITSM experiment: ${experimentId}`);
    res.status(201).json({ 
      experimentId,
      message: 'ITSM experiment created successfully'
    });
  } catch (error) {
    logger.error('Failed to create ITSM experiment:', error);
    res.status(500).json({ error: error.message || 'Failed to create ITSM experiment' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/experiments/{experimentId}:
 *   get:
 *     summary: Get experiment details
 *     tags: [ML Pipeline]
 *     parameters:
 *       - in: path
 *         name: experimentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experiment details retrieved successfully
 */
router.get('/experiments/:experimentId', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const experiment = novaMLPipeline.getExperiment(experimentId);

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json(experiment);
  } catch (error) {
    logger.error('Failed to get experiment:', error);
    res.status(500).json({ error: 'Failed to get experiment' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/experiments/{experimentId}/status:
 *   get:
 *     summary: Get experiment training status
 *     tags: [ML Pipeline]
 *     parameters:
 *       - in: path
 *         name: experimentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Training status retrieved successfully
 */
router.get('/experiments/:experimentId/status', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const experiment = novaMLPipeline.getExperiment(experimentId);

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({
      status: experiment.status,
      progress: experiment.status === 'running' ? Math.random() * 100 : 100, // Simplified progress
      metrics: experiment.metrics,
      cosmoPersonality: experiment.cosmoPersonality,
      lastUpdated: experiment.updated_at
    });
  } catch (error) {
    logger.error('Failed to get experiment status:', error);
    res.status(500).json({ error: 'Failed to get experiment status' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/experiments/{experimentId}/train:
 *   post:
 *     summary: Start training for an experiment
 *     tags: [ML Pipeline]
 *     parameters:
 *       - in: path
 *         name: experimentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Training started successfully
 */
router.post('/experiments/:experimentId/train', async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    // Start training asynchronously
    novaMLPipeline.trainITSMModel(experimentId)
      .then(() => {
        logger.info(`Training completed for experiment: ${experimentId}`);
      })
      .catch((error) => {
        logger.error(`Training failed for experiment ${experimentId}:`, error);
      });

    res.json({ 
      message: 'Training started successfully',
      experimentId
    });
  } catch (error) {
    logger.error('Failed to start training:', error);
    res.status(500).json({ error: error.message || 'Failed to start training' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/experiments/{experimentId}/cosmo-personality:
 *   put:
 *     summary: Update Cosmo personality for an experiment
 *     tags: [ML Pipeline]
 *     parameters:
 *       - in: path
 *         name: experimentId
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
 *               personalityProfile:
 *                 type: string
 *               customTraits:
 *                 type: object
 *     responses:
 *       200:
 *         description: Cosmo personality updated successfully
 */
router.put('/experiments/:experimentId/cosmo-personality', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const { personalityProfile, customTraits } = req.body;

    await novaMLPipeline.updateCosmoPersonality(experimentId, personalityProfile, customTraits);

    res.json({ 
      message: 'Cosmo personality updated successfully',
      experimentId
    });
  } catch (error) {
    logger.error('Failed to update Cosmo personality:', error);
    res.status(500).json({ error: error.message || 'Failed to update Cosmo personality' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/experiments/{experimentId}/settings:
 *   put:
 *     summary: Update experiment settings
 *     tags: [ML Pipeline]
 *     parameters:
 *       - in: path
 *         name: experimentId
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
 *               hyperparameters:
 *                 type: object
 *               evaluation:
 *                 type: object
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.put('/experiments/:experimentId/settings', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const { hyperparameters, evaluation } = req.body;

    const experiment = novaMLPipeline.getExperiment(experimentId);
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    // Update experiment configuration
    if (hyperparameters) {
      experiment.config.hyperparameters = { ...experiment.config.hyperparameters, ...hyperparameters };
    }
    if (evaluation) {
      experiment.config.evaluation = { ...experiment.config.evaluation, ...evaluation };
    }

    experiment.updated_at = new Date();
    
    res.json({ 
      message: 'Settings updated successfully',
      experimentId,
      config: experiment.config
    });
  } catch (error) {
    logger.error('Failed to update experiment settings:', error);
    res.status(500).json({ error: 'Failed to update experiment settings' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/experiments/{experimentId}:
 *   delete:
 *     summary: Delete an experiment
 *     tags: [ML Pipeline]
 *     parameters:
 *       - in: path
 *         name: experimentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experiment deleted successfully
 */
router.delete('/experiments/:experimentId', async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    const experiment = novaMLPipeline.getExperiment(experimentId);
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    // Remove experiment from registry
    novaMLPipeline.registry.experiments.delete(experimentId);

    logger.info(`Deleted experiment: ${experimentId}`);
    res.json({ 
      message: 'Experiment deleted successfully',
      experimentId
    });
  } catch (error) {
    logger.error('Failed to delete experiment:', error);
    res.status(500).json({ error: 'Failed to delete experiment' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/cosmo-personalities:
 *   get:
 *     summary: Get available Cosmo personality profiles
 *     tags: [ML Pipeline]
 *     responses:
 *       200:
 *         description: Personality profiles retrieved successfully
 */
router.get('/cosmo-personalities', async (req, res) => {
  try {
    const personalities = novaMLPipeline.getCosmoPersonalityProfiles();
    const personalityObject = Object.fromEntries(personalities);
    
    res.json(personalityObject);
  } catch (error) {
    logger.error('Failed to get Cosmo personalities:', error);
    res.status(500).json({ error: 'Failed to get Cosmo personalities' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/experiments/{experimentId}/predict:
 *   post:
 *     summary: Make prediction with trained model
 *     tags: [ML Pipeline]
 *     parameters:
 *       - in: path
 *         name: experimentId
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
 *               inputText:
 *                 type: string
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Prediction completed successfully
 */
router.post('/experiments/:experimentId/predict', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const { inputText, context } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: 'Input text is required' });
    }

    const prediction = await novaMLPipeline.predictWithCosmoPersonality(
      experimentId,
      inputText,
      context
    );

    res.json(prediction);
  } catch (error) {
    logger.error('Failed to make prediction:', error);
    res.status(500).json({ error: error.message || 'Failed to make prediction' });
  }
});

/**
 * @swagger
 * /api/ml-pipeline/itsm-training-data:
 *   get:
 *     summary: Generate ITSM training data
 *     tags: [ML Pipeline]
 *     responses:
 *       200:
 *         description: Training data generated successfully
 */
router.get('/itsm-training-data', async (req, res) => {
  try {
    const trainingData = await itsmTrainingData.generateITSMTrainingData();
    
    res.json({
      count: trainingData.length,
      sample: trainingData.slice(0, 5), // Return first 5 samples
      categories: [...new Set(trainingData.map(item => item.category.primary))],
      personalities: [...new Set(trainingData.map(item => 
        Object.keys(itsmTrainingData.getAllPersonalityProfiles()).find(key => 
          JSON.stringify(itsmTrainingData.getCosmoPersonality(key)) === JSON.stringify(item.cosmoPersonality)
        )
      ))]
    });
  } catch (error) {
    logger.error('Failed to generate ITSM training data:', error);
    res.status(500).json({ error: 'Failed to generate ITSM training data' });
  }
});

export default router;