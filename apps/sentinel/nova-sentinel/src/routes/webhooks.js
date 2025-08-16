// Nova Sentinel - Webhook Routes
// Handle external webhook integrations

import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

const router = express.Router();

// ========================================================================
// WEBHOOK ENDPOINTS (No authentication required)
// ========================================================================

/**
 * @swagger
 * /api/v1/webhooks/uptime-kuma:
 *   post:
 *     tags: [Webhooks]
 *     summary: Receive webhooks from Uptime Kuma
 */
router.post('/uptime-kuma', async (req, res) => {
  try {
    const { monitorID, status, time, ping, msg } = req.body;

    // Validate webhook data
    if (!monitorID || status === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required webhook data'
      });
    }

    // Process heartbeat
    await req.services.monitoring.handleHeartbeat({
      monitorID,
      status: parseInt(status),
      time: time || new Date().toISOString(),
      ping,
      msg
    }); // TODO-LINT: move to async function

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Uptime Kuma webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

/**
 * @swagger
 * /api/v1/webhooks/external:
 *   post:
 *     tags: [Webhooks]
 *     summary: Generic webhook endpoint for external services
 */
router.post('/external', async (req, res) => {
  try {
    // Log webhook for debugging
    await req.services.database.logEvent({
      type: 'external_webhook',
      metadata: {
        headers: req.headers,
        body: req.body,
        source: req.headers['user-agent'] || 'unknown'
      }
    }); // TODO-LINT: move to async function

    res.json({
      success: true,
      message: 'Webhook received'
    });

  } catch (error) {
    console.error('External webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

export default router;
