// Nova API - Setup Routes
// Handles setup wizard configuration testing and completion

import express from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';

const router = express.Router();

// Test connection endpoints for setup wizard
router.post('/test-slack', [
  body('slackToken').notEmpty().withMessage('Slack token is required'),
  body('slackChannel').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { slackToken, slackChannel = '#general' } = req.body;

    // Test Slack API connection
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!data.ok) {
      return res.status(400).json({ 
        success: false, 
        error: data.error || 'Slack authentication failed' 
      });
    }

    // Test sending a message
    const testResponse = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: slackChannel,
        text: 'Test message from Nova Universe setup wizard',
        username: 'Nova Setup',
      }),
    });

    const testData = await testResponse.json();
    
    if (testData.ok) {
      logger.info('Slack connection test successful');
      res.json({ success: true, message: 'Slack connection successful' });
    } else {
      res.status(400).json({ 
        success: false, 
        error: testData.error || 'Failed to send test message' 
      });
    }
  } catch (error) {
    logger.error('Slack connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test Slack connection' 
    });
  }
});

router.post('/test-teams', [
  body('teamsWebhook').isURL().withMessage('Valid Teams webhook URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { teamsWebhook } = req.body;

    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Nova Universe Setup Test",
      "sections": [{
        "activityTitle": "Setup Test",
        "activitySubtitle": "Nova Universe",
        "activityImage": "https://teamsnodesample.azurewebsites.net/static/img/image5.png",
        "facts": [{
          "name": "Status",
          "value": "Teams integration test successful"
        }],
        "markdown": true
      }]
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
        error: 'Failed to send test message to Teams' 
      });
    }
  } catch (error) {
    logger.error('Teams connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test Teams connection' 
    });
  }
});

router.post('/test-elasticsearch', [
  body('elasticsearchUrl').isURL().withMessage('Valid Elasticsearch URL is required')
], async (req, res) => {
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
        message: `Elasticsearch connection successful (${data.status})` 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to connect to Elasticsearch' 
      });
    }
  } catch (error) {
    logger.error('Elasticsearch connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test Elasticsearch connection' 
    });
  }
});

router.post('/test-s3', [
  body('s3Bucket').notEmpty().withMessage('S3 bucket name is required'),
  body('s3AccessKey').notEmpty().withMessage('S3 access key is required'),
  body('s3SecretKey').notEmpty().withMessage('S3 secret key is required'),
  body('s3Region').optional()
], async (req, res) => {
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
        error: 'Failed to connect to S3: ' + awsError.message 
      });
    }
  } catch (error) {
    logger.error('S3 connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test S3 connection (AWS SDK not available)' 
    });
  }
});

router.post('/test-sentinel', [
  body('sentinelUrl').isURL().withMessage('Valid Sentinel URL is required')
], async (req, res) => {
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
      const data = await response.json();
      logger.info('Sentinel connection test successful');
      res.json({ 
        success: true, 
        message: 'Nova Sentinel connection successful' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: `Failed to connect to Sentinel (${response.status})` 
      });
    }
  } catch (error) {
    logger.error('Sentinel connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test Sentinel connection: ' + error.message 
    });
  }
});

router.post('/test-goalert', [
  body('goalertUrl').isURL().withMessage('Valid GoAlert URL is required'),
  body('goalertApiKey').notEmpty().withMessage('GoAlert API key is required')
], async (req, res) => {
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
        'Authorization': `Bearer ${goalertApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Nova-Universe-Setup/1.0',
      },
      timeout: 10000,
    });

    if (response.ok) {
      const data = await response.json();
      logger.info('GoAlert connection test successful');
      res.json({ 
        success: true, 
        message: 'GoAlert connection successful' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: `Failed to connect to GoAlert (${response.status})` 
      });
    }
  } catch (error) {
    logger.error('GoAlert connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test GoAlert connection: ' + error.message 
    });
  }
});

// Complete setup
router.post('/complete', [
  authenticateJWT,
  body('setupData').isObject().withMessage('Setup data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: errors.array()[0].msg 
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
      message: 'Setup completed successfully' 
    });
  } catch (error) {
    logger.error('Setup completion failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete setup' 
    });
  }
});

export default router;
