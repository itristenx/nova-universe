/**
 * Nova Comms Routes
 * Provides REST API endpoints for Nova Comms Slack integration
 */

import express from 'express';
import { logger } from '../logger.js';
import {
  isSlackAvailable,
  getSlackApp,
  initializeSlackApp,
  validateSlackEnv,
} from '../services/nova-comms.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/comms/health:
 *   get:
 *     summary: Check Nova Comms health status
 *     tags: [Comms]
 *     responses:
 *       200:
 *         description: Service health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 slack:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                     initialized:
 *                       type: boolean
 */
router.get('/health', (req, res) => {
  try {
    const slackApp = getSlackApp();
    const isAvailable = isSlackAvailable();

    res.json({
      status: 'healthy',
      slack: {
        available: isAvailable,
        initialized: slackApp !== null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error checking comms health:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /api/v1/comms/slack/status:
 *   get:
 *     summary: Get Slack integration status
 *     tags: [Comms]
 *     responses:
 *       200:
 *         description: Slack integration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 initialized:
 *                   type: boolean
 *                 config:
 *                   type: object
 */
router.get('/slack/status', (req, res) => {
  try {
    const isAvailable = isSlackAvailable();
    const slackApp = getSlackApp();

    let config = null;
    try {
      config = validateSlackEnv();
    } catch (configError) {
      logger.warn('Slack environment validation failed:', configError.message);
    }

    res.json({
      enabled: process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET ? true : false,
      initialized: isAvailable,
      app_instance: slackApp !== null,
      config: config
        ? {
            port: config.port,
            adminUrl: config.adminUrl,
            serviceUserId: config.serviceUserId,
            serviceUserEmail: config.serviceUserEmail,
            serviceUserName: config.serviceUserName,
            serviceUserRole: config.serviceUserRole,
            tenantId: config.tenantId,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error checking Slack status:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /api/v1/comms/slack/initialize:
 *   post:
 *     summary: Initialize Slack integration
 *     tags: [Comms]
 *     responses:
 *       200:
 *         description: Slack integration initialized successfully
 *       400:
 *         description: Missing required configuration
 *       500:
 *         description: Initialization failed
 */
router.post('/slack/initialize', async (req, res) => {
  try {
    if (isSlackAvailable()) {
      return res.json({
        message: 'Slack integration already initialized',
        status: 'success',
      });
    }

    const slackApp = initializeSlackApp();

    res.json({
      message: 'Slack integration initialized successfully',
      status: 'success',
      initialized: slackApp !== null,
    });
  } catch (error) {
    logger.error('Failed to initialize Slack integration:', error);
    res.status(500).json({
      error: error.message,
      status: 'error',
    });
  }
});

/**
 * @swagger
 * /api/v1/comms/slack/test:
 *   post:
 *     summary: Test Slack integration
 *     tags: [Comms]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 type: string
 *                 description: Slack channel to send test message to
 *                 example: "#general"
 *     responses:
 *       200:
 *         description: Test successful
 *       400:
 *         description: Slack not initialized
 *       500:
 *         description: Test failed
 */
router.post('/slack/test', async (req, res) => {
  try {
    const slackApp = getSlackApp();

    if (!slackApp) {
      return res.status(400).json({
        error: 'Slack integration not initialized',
        status: 'error',
      });
    }

    // Test authentication by calling auth.test
    const client = slackApp.client;
    const authTest = await client.auth.test();

    res.json({
      message: 'Slack integration test successful',
      status: 'success',
      auth: {
        user: authTest.user,
        user_id: authTest.user_id,
        team: authTest.team,
        team_id: authTest.team_id,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Slack integration test failed:', error);
    res.status(500).json({
      error: error.message,
      status: 'error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /api/v1/comms/slack/commands:
 *   get:
 *     summary: List available Slack commands
 *     tags: [Comms]
 *     responses:
 *       200:
 *         description: List of available Slack commands
 */
router.get('/slack/commands', (req, res) => {
  const commands = [
    {
      command: '/new-ticket',
      description: 'Submit a new support ticket',
      usage: '/new-ticket',
    },
    {
      command: '/it-help',
      description: 'Submit a new IT help request',
      usage: '/it-help',
    },
    {
      command: '/nova-status',
      description: 'Get Nova Universe system status',
      usage: '/nova-status',
    },
    {
      command: '/nova-queue',
      description: 'Get Pulse queue metrics summary',
      usage: '/nova-queue',
    },
    {
      command: '/nova-feedback',
      description: 'Submit platform feedback',
      usage: '/nova-feedback <your feedback message>',
    },
    {
      command: '/nova-assign',
      description: 'Get assignment recommendation for a ticket',
      usage: '/nova-assign <TICKET_ID>',
    },
    {
      command: '@Cosmo',
      description: 'Mention @Cosmo to start a conversation',
      usage: '@Cosmo <your message>',
    },
  ];

  res.json({
    commands,
    total: commands.length,
    timestamp: new Date().toISOString(),
  });
});

export default router;
