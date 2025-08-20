// Nova API - Setup Routes
// Handles setup wizard configuration testing and completion

import express from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import _nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import crypto from 'crypto';
import SetupWizardService from '../services/setup-wizard.js';

const router = express.Router();
const setupWizard = new SetupWizardService();

// Initialize WebSocket server if server instance is available
router.setupWebSocket = (httpServer) => {
  setupWizard.initializeWebSocketServer(httpServer);
};

// Get setup wizard configuration and steps
router.get('/wizard/config', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    
    res.json({
      success: true,
      data: {
        steps: setupWizard.getStepsForClient(),
        sessionId: sessionId || 'new',
        websocketUrl: `ws://${req.get('host')}/setup-wizard/ws`,
        supportedFormats: ['json', 'yaml', 'env'],
        features: {
          realTimeValidation: true,
          progressSaving: true,
          rollbackSupport: true,
          configExport: true,
          dependencyChecking: true
        }
      }
    });
  } catch (error) {
    logger.error('Setup wizard config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get setup configuration'
    });
  }
});

// Create new setup session
router.post('/wizard/session', async (req, res) => {
  try {
    const sessionId = crypto.randomUUID();
    
    // Initialize session in setup wizard service
    setupWizard.sessions.set(sessionId, {
      clients: new Set(),
      currentStep: 'welcome',
      configuration: {},
      startTime: new Date(),
      progress: 0,
      status: 'created'
    });
    
    res.json({
      success: true,
      data: {
        sessionId,
        websocketUrl: `ws://${req.get('host')}/setup-wizard/ws?sessionId=${sessionId}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
  } catch (error) {
    logger.error('Setup session creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create setup session'
    });
  }
});

// Resume existing setup session
router.get('/wizard/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = setupWizard.sessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        sessionId,
        currentStep: session.currentStep,
        progress: session.progress,
        startTime: session.startTime,
        configuration: session.configuration,
        status: session.status
      }
    });
  } catch (error) {
    logger.error('Setup session retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get setup session'
    });
  }
});

// Enhanced test connection endpoints for setup wizard
router.post(
  '/test-slack',
  [
    body('slackToken').notEmpty().withMessage('Slack token is required'),
    body('slackChannel').optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { slackToken, slackChannel = '#general' } = req.body;

      // Test Slack API connection with enhanced validation
      const response = await fetch('https://slack.com/api/auth.test', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.ok) {
        return res.status(400).json({
          success: false,
          error: data.error || 'Slack authentication failed',
          suggestions: [
            'Verify the Slack token is valid and has not expired',
            'Ensure the token has the required permissions (chat:write, channels:read)',
            'Check if the Slack workspace is active'
          ]
        });
      }

      // Test sending a message to verify permissions
      const testResponse = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: slackChannel,
          text: '🔧 Nova Universe Setup Test - Connection successful!',
          as_user: true,
        }),
      });

      const testData = await testResponse.json();
      
      if (!testData.ok) {
        return res.status(400).json({
          success: false,
          error: `Failed to send test message: ${testData.error}`,
          suggestions: [
            'Ensure the channel exists and the bot has access',
            'Verify chat:write permissions are granted',
            'Check if the channel is public or the bot is invited to private channels'
          ]
        });
      }

      logger.info('Slack connection test successful');
      res.json({
        success: true,
        message: 'Slack connection successful',
        data: {
          team: data.team,
          user: data.user,
          teamId: data.team_id,
          userId: data.user_id,
          testMessage: testData.ts
        }
      });
    } catch (error) {
      logger.error('Slack connection test failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test Slack connection: ' + error.message,
        suggestions: [
          'Check your internet connection',
          'Verify Slack API is accessible from your server',
          'Ensure firewall allows outbound HTTPS connections'
        ]
      });
    }
  },
);

router.post(
  '/test-teams',
  [body('teamsWebhook').isURL().withMessage('Valid Teams webhook URL is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { teamsWebhook } = req.body;

      const payload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: '0076D7',
        summary: 'Nova Universe Setup Test',
        sections: [
          {
            activityTitle: 'Setup Test',
            activitySubtitle: 'Nova Universe',
            activityImage: 'https://teamsnodesample.azurewebsites.net/static/img/image5.png',
            facts: [
              {
                name: 'Status',
                value: 'Teams integration test successful',
              },
            ],
            markdown: true,
          },
        ],
      };

      const response = await fetch(teamsWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        logger.info('Teams connection test successful');
        res.json({ success: true, message: 'Teams connection successful' });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to send test message to Teams',
        });
      }
    } catch (error) {
      logger.error('Teams connection test failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test Teams connection',
      });
    }
  },
);

router.post(
  '/test-elasticsearch',
  [body('elasticsearchUrl').isURL().withMessage('Valid Elasticsearch URL is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { elasticsearchUrl } = req.body;

      // Test Elasticsearch connection
      const response = await fetch(`${elasticsearchUrl}/_cluster/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      if (response.ok) {
        const data = await response.json();
        logger.info('Elasticsearch connection test successful');
        res.json({
          success: true,
          message: `Elasticsearch connection successful (${data.status})`,
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to connect to Elasticsearch',
        });
      }
    } catch (error) {
      logger.error('Elasticsearch connection test failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test Elasticsearch connection',
      });
    }
  },
);

router.post(
  '/test-s3',
  [
    body('s3Bucket').notEmpty().withMessage('S3 bucket name is required'),
    body('s3AccessKey').notEmpty().withMessage('S3 access key is required'),
    body('s3SecretKey').notEmpty().withMessage('S3 secret key is required'),
    body('s3Region').optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { s3Bucket, s3AccessKey, s3SecretKey, s3Region = 'us-east-1' } = req.body;

      // Import AWS SDK (if available)
      try {
        const AWS = await import('@aws-sdk/client-s3');
        const { S3Client, HeadBucketCommand } = AWS;

        const s3Client = new S3Client({
          region: s3Region,
          credentials: {
            accessKeyId: s3AccessKey,
            secretAccessKey: s3SecretKey,
          },
        });

        // Test bucket access
        await s3Client.send(new HeadBucketCommand({ Bucket: s3Bucket }));

        logger.info('S3 connection test successful');
        res.json({ success: true, message: 'S3 connection successful' });
      } catch (awsError) {
        logger.error('S3 connection test failed:', awsError);
        res.status(400).json({
          success: false,
          error: 'Failed to connect to S3: ' + awsError.message,
        });
      }
    } catch (error) {
      logger.error('S3 connection test failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test S3 connection (AWS SDK not available)',
      });
    }
  },
);

router.post(
  '/test-sentinel',
  [body('sentinelUrl').isURL().withMessage('Valid Sentinel URL is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { sentinelUrl, sentinelApiKey } = req.body;

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Nova-Universe-Setup/1.0',
      };

      if (sentinelApiKey) {
        headers['Authorization'] = `Bearer ${sentinelApiKey}`;
      }

      // Test Sentinel API health endpoint
      const response = await fetch(`${sentinelUrl}/api/status`, {
        method: 'GET',
        headers,
        timeout: 10000,
      });

      if (response.ok) {
        const _data = await response.json();
        logger.info('Sentinel connection test successful');
        res.json({
          success: true,
          message: 'Nova Sentinel connection successful',
        });
      } else {
        res.status(400).json({
          success: false,
          error: `Failed to connect to Sentinel (${response.status})`,
        });
      }
    } catch (error) {
      logger.error('Sentinel connection test failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test Sentinel connection: ' + error.message,
      });
    }
  },
);

router.post(
  '/test-goalert',
  [
    body('goalertUrl').isURL().withMessage('Valid GoAlert URL is required'),
    body('goalertApiKey').notEmpty().withMessage('GoAlert API key is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { goalertUrl, goalertApiKey } = req.body;

      // Test GoAlert API connection
      const response = await fetch(`${goalertUrl}/api/v2/user/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${goalertApiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Nova-Universe-Setup/1.0',
        },
        timeout: 10000,
      });

      if (response.ok) {
        const _data = await response.json();
        logger.info('GoAlert connection test successful');
        res.json({
          success: true,
          message: 'GoAlert connection successful',
        });
      } else {
        res.status(400).json({
          success: false,
          error: `Failed to connect to GoAlert (${response.status})`,
        });
      }
    } catch (error) {
      logger.error('GoAlert connection test failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test GoAlert connection: ' + error.message,
      });
    }
  },
);

// Complete setup
router.post(
  '/complete',
  [authenticateJWT, body('setupData').isObject().withMessage('Setup data is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { setupData } = req.body;
      const userId = req.user?.id;

      // Store setup completion in database
      // This would typically update environment variables and configuration
      logger.info('Setup completed by user:', userId);
      logger.info('Setup data:', JSON.stringify(setupData, null, 2));

      // In a real implementation, you would:
      // 1. Store configuration in database
      // 2. Update environment variables
      // 3. Initialize services
      // 4. Mark setup as complete

      res.json({
        success: true,
        message: 'Setup completed successfully',
      });
    } catch (error) {
      logger.error('Setup completion failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete setup',
      });
    }
  },
);

export default router;
