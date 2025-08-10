/**
 * Setup and Configuration Testing Routes
 * Handles testing connections for various services during setup wizard
 */

import express from 'express';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * Test Slack connection
 */
router.post('/test-slack', async (req, res) => {
  try {
    const { slackToken, slackChannel } = req.body;

    if (!slackToken) {
      return res.status(400).json({
        success: false,
        error: 'Slack token is required'
      });
    }

    // Test Slack API connection
    const response = await fetch('https://slack.com/api/auth.test', {
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!result.ok) {
      return res.json({
        success: false,
        error: result.error || 'Invalid Slack token'
      });
    }

    // Test sending a message to the channel if provided
    if (slackChannel) {
      const testMessage = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: slackChannel,
          text: 'Test message from Nova Universe setup wizard',
          as_user: true
        })
      });

      const messageResult = await testMessage.json();
      if (!messageResult.ok) {
        return res.json({
          success: false,
          error: `Channel test failed: ${messageResult.error}`
        });
      }
    }

    res.json({
      success: true,
      message: 'Slack connection successful',
      teamName: result.team,
      user: result.user
    });

  } catch (error) {
    logger.error('Slack test error:', error);
    res.json({
      success: false,
      error: 'Failed to test Slack connection'
    });
  }
});

/**
 * Test Microsoft Teams webhook
 */
router.post('/test-teams', async (req, res) => {
  try {
    const { teamsWebhook } = req.body;

    if (!teamsWebhook) {
      return res.status(400).json({
        success: false,
        error: 'Teams webhook URL is required'
      });
    }

    // Send test message to Teams
    const response = await fetch(teamsWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "summary": "Nova Universe Test",
        "themeColor": "0076D7",
        "title": "Nova Universe Setup Test",
        "text": "This is a test message from Nova Universe setup wizard"
      })
    });

    if (!response.ok) {
      return res.json({
        success: false,
        error: `Teams webhook test failed: ${response.statusText}`
      });
    }

    res.json({
      success: true,
      message: 'Teams webhook connection successful'
    });

  } catch (error) {
    logger.error('Teams test error:', error);
    res.json({
      success: false,
      error: 'Failed to test Teams webhook'
    });
  }
});

/**
 * Test S3 bucket access
 */
router.post('/test-s3', async (req, res) => {
  try {
    const { s3Bucket, s3Region, s3AccessKey, s3SecretKey } = req.body;

    if (!s3Bucket || !s3AccessKey || !s3SecretKey) {
      return res.status(400).json({
        success: false,
        error: 'S3 bucket, access key, and secret key are required'
      });
    }

    // Create S3 client
    const s3Client = new S3Client({
      region: s3Region || 'us-east-1',
      credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey
      }
    });

    // Test bucket access
    await s3Client.send(new HeadBucketCommand({ Bucket: s3Bucket }));

    res.json({
      success: true,
      message: 'S3 bucket access successful'
    });

  } catch (error) {
    logger.error('S3 test error:', error);
    
    let errorMessage = 'Failed to access S3 bucket';
    if (error.name === 'NoSuchBucket') {
      errorMessage = 'S3 bucket does not exist';
    } else if (error.name === 'AccessDenied' || error.name === 'InvalidAccessKeyId') {
      errorMessage = 'Invalid S3 credentials or insufficient permissions';
    }

    res.json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * Test Elasticsearch connection
 */
router.post('/test-elasticsearch', async (req, res) => {
  try {
    const { elasticsearchUrl } = req.body;

    if (!elasticsearchUrl) {
      return res.status(400).json({
        success: false,
        error: 'Elasticsearch URL is required'
      });
    }

    // Test Elasticsearch health
    const response = await fetch(`${elasticsearchUrl}/_cluster/health`, {
      timeout: 10000
    });

    if (!response.ok) {
      return res.json({
        success: false,
        error: `Elasticsearch connection failed: ${response.statusText}`
      });
    }

    const health = await response.json();

    res.json({
      success: true,
      message: 'Elasticsearch connection successful',
      clusterName: health.cluster_name,
      status: health.status
    });

  } catch (error) {
    logger.error('Elasticsearch test error:', error);
    res.json({
      success: false,
      error: 'Failed to connect to Elasticsearch'
    });
  }
});

/**
 * Test Nova Sentinel connection
 */
router.post('/test-sentinel', async (req, res) => {
  try {
    const { sentinelUrl, sentinelApiKey } = req.body;

    if (!sentinelUrl) {
      return res.status(400).json({
        success: false,
        error: 'Sentinel URL is required'
      });
    }

    // Test Sentinel health endpoint
    const headers = {
      'Content-Type': 'application/json'
    };

    if (sentinelApiKey) {
      headers['Authorization'] = `Bearer ${sentinelApiKey}`;
    }

    const response = await fetch(`${sentinelUrl}/api/v1/health`, {
      headers,
      timeout: 10000
    });

    if (!response.ok) {
      return res.json({
        success: false,
        error: `Sentinel connection failed: ${response.statusText}`
      });
    }

    const health = await response.json();

    res.json({
      success: true,
      message: 'Sentinel connection successful',
      version: health.version || 'unknown',
      status: health.status || 'healthy'
    });

  } catch (error) {
    logger.error('Sentinel test error:', error);
    res.json({
      success: false,
      error: 'Failed to connect to Nova Sentinel'
    });
  }
});

/**
 * Test GoAlert connection
 */
router.post('/test-goalert', async (req, res) => {
  try {
    const { goAlertUrl, goAlertApiKey } = req.body;

    if (!goAlertUrl || !goAlertApiKey) {
      return res.status(400).json({
        success: false,
        error: 'GoAlert URL and API key are required'
      });
    }

    // Test GoAlert API connection
    const response = await fetch(`${goAlertUrl}/api/v2/user/profile`, {
      headers: {
        'Authorization': `Bearer ${goAlertApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (!response.ok) {
      return res.json({
        success: false,
        error: `GoAlert connection failed: ${response.statusText}`
      });
    }

    const profile = await response.json();

    res.json({
      success: true,
      message: 'GoAlert connection successful',
      userName: profile.name || 'Unknown',
      userEmail: profile.email || 'Unknown'
    });

  } catch (error) {
    logger.error('GoAlert test error:', error);
    res.json({
      success: false,
      error: 'Failed to connect to GoAlert'
    });
  }
});

/**
 * Test SMTP email configuration
 */
router.post('/test-email', async (req, res) => {
  try {
    const { 
      provider, 
      host, 
      port, 
      username, 
      password, 
      apiKey, 
      fromEmail, 
      secure 
    } = req.body;

    if (provider === 'console') {
      return res.json({
        success: true,
        message: 'Console email provider configured (emails will be logged)'
      });
    }

    if (provider === 'smtp') {
      if (!host || !port || !fromEmail) {
        return res.status(400).json({
          success: false,
          error: 'SMTP host, port, and from email are required'
        });
      }

      // Create transporter
      const transporter = nodemailer.createTransporter({
        host,
        port: parseInt(port),
        secure: secure || port === '465',
        auth: username && password ? {
          user: username,
          pass: password
        } : undefined
      });

      // Verify connection
      await transporter.verify();

      res.json({
        success: true,
        message: 'SMTP connection successful'
      });
    } else {
      // For SendGrid, SES, etc.
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: `API key is required for ${provider}`
        });
      }

      res.json({
        success: true,
        message: `${provider} configuration validated`
      });
    }

  } catch (error) {
    logger.error('Email test error:', error);
    res.json({
      success: false,
      error: 'Failed to test email configuration'
    });
  }
});

export default router;
