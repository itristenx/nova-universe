// =============================================================================
// WEBHOOK CONFIGURATION ROUTES
// =============================================================================
// Endpoints for managing webhook integrations
// Week 2 Implementation
// =============================================================================

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { prisma, getWithCache, invalidateCache } from '../db.js';
import fetch from 'node-fetch';

const router = Router();
const authenticateToken = authenticateJWT; // Alias for consistency

// Rate limiting: 30 requests per minute for webhooks
const webhookRateLimit = createRateLimit(60 * 1000, 30);

// Available webhook events
const WEBHOOK_EVENTS = [
  'ticket.created',
  'ticket.updated',
  'ticket.closed',
  'alert.triggered',
  'alert.resolved',
  'user.created',
  'user.updated',
  'service.requested',
  'service.approved',
  'asset.created',
  'asset.updated',
  'change.created',
  'change.approved',
  'knowledge.published',
  'notification.sent'
];

// =============================================================================
// WEBHOOK ENDPOINTS
// =============================================================================

/**
 * GET /api/v1/webhooks
 * List all webhooks (Admin only)
 */
router.get('/', authenticateToken, webhookRateLimit, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only admins can view webhooks'
      });
    }

    const { isActive, limit = 50, offset = 0 } = req.query;
    const cacheKey = `webhooks:list:${isActive || 'all'}:${limit}:${offset}`;

    const result = await getWithCache(
      cacheKey,
      async () => {
        const where = isActive !== undefined ? { isActive: isActive === 'true' } : {};

        const [webhooks, total] = await Promise.all([
          prisma.webhookEndpoint.findMany({
            where,
            include: {
              _count: {
                select: {
                  deliveries: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: parseInt(limit),
            skip: parseInt(offset)
          }),
          prisma.webhookEndpoint.count({ where })
        ]);

        // Mask auth credentials in response
        const maskedWebhooks = webhooks.map(webhook => ({
          ...webhook,
          authCredentials: webhook.authCredentials ? '***MASKED***' : null
        }));

        return {
          success: true,
          data: maskedWebhooks,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + webhooks.length < total
          }
        };
      },
      300 // 5 min cache
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch webhooks',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/webhooks/events
 * List available webhook event types
 */
router.get('/events', authenticateToken, webhookRateLimit, async (req, res) => {
  res.json({
    success: true,
    data: WEBHOOK_EVENTS.map(event => ({
      name: event,
      category: event.split('.')[0],
      action: event.split('.')[1]
    }))
  });
});

/**
 * GET /api/v1/webhooks/:id
 * Get webhook details (Admin only)
 */
router.get('/:id', authenticateToken, webhookRateLimit, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only admins can view webhook details'
      });
    }

    const { id } = req.params;
    const cacheKey = `webhook:${id}`;

    const webhook = await getWithCache(
      cacheKey,
      async () => {
        return await prisma.webhookEndpoint.findUnique({
          where: { id },
          include: {
            deliveries: {
              take: 10,
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        });
      },
      300 // 5 min cache
    );

    if (!webhook) {
      return res.status(404).json({
        success: false,
        error: 'Webhook not found'
      });
    }

    // Mask auth credentials
    const maskedWebhook = {
      ...webhook,
      authCredentials: webhook.authCredentials ? '***MASKED***' : null
    };

    res.json({
      success: true,
      data: maskedWebhook
    });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch webhook details',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/webhooks/:id/logs
 * Get webhook delivery logs (Admin only)
 */
router.get('/:id/logs', authenticateToken, webhookRateLimit, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only admins can view webhook logs'
      });
    }

    const { id } = req.params;
    const { limit = 50, offset = 0, status } = req.query;

    const where = {
      endpointId: id,
      ...(status && { status })
    };

    const [logs, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.webhookDelivery.count({ where })
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + logs.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch webhook logs',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/webhooks
 * Create new webhook (Admin only)
 */
router.post('/', authenticateToken, webhookRateLimit, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only admins can create webhooks'
      });
    }

    const {
      name,
      description,
      url,
      method = 'POST',
      headers,
      authType = 'none',
      authCredentials,
      events,
      isActive = true,
      retryCount = 3,
      retryDelay = 5000
    } = req.body;

    // Validate required fields
    if (!name || !url || !events || events.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Missing required fields: name, url, events'
      });
    }

    // Validate URL is HTTPS
    if (!url.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Webhook URL must use HTTPS'
      });
    }

    // Validate events
    const invalidEvents = events.filter(e => !WEBHOOK_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: `Invalid events: ${invalidEvents.join(', ')}`
      });
    }

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        name,
        description,
        url,
        method,
        headers: headers || {},
        authType,
        authCredentials: authCredentials || {},
        events,
        isActive,
        retryCount: parseInt(retryCount),
        retryDelay: parseInt(retryDelay)
      }
    });

    // Invalidate cache
    await invalidateCache('webhooks:list:all');
    await invalidateCache('webhooks:list:true');

    res.status(201).json({
      success: true,
      data: {
        ...webhook,
        authCredentials: webhook.authCredentials ? '***MASKED***' : null
      },
      message: 'Webhook created successfully'
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create webhook',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/webhooks/:id/test
 * Test webhook by sending a test payload (Admin only)
 */
router.post('/:id/test', authenticateToken, webhookRateLimit, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only admins can test webhooks'
      });
    }

    const { id } = req.params;

    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id }
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        error: 'Webhook not found'
      });
    }

    // Prepare test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery from Nova Universe',
        webhookId: webhook.id,
        webhookName: webhook.name
      }
    };

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Nova-Universe-Webhook/1.0',
      ...webhook.headers
    };

    // Add authentication
    if (webhook.authType === 'bearer' && webhook.authCredentials?.token) {
      headers['Authorization'] = `Bearer ${webhook.authCredentials.token}`;
    } else if (webhook.authType === 'api_key' && webhook.authCredentials?.key) {
      headers[webhook.authCredentials.headerName || 'X-API-Key'] = webhook.authCredentials.key;
    } else if (webhook.authType === 'basic' && webhook.authCredentials?.username && webhook.authCredentials?.password) {
      const auth = Buffer.from(`${webhook.authCredentials.username}:${webhook.authCredentials.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    // Send webhook
    const startTime = Date.now();
    let delivery;

    try {
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers,
        body: JSON.stringify(testPayload),
        timeout: 30000
      });

      const responseBody = await response.text();
      const duration = Date.now() - startTime;

      // Log delivery
      delivery = await prisma.webhookDelivery.create({
        data: {
          endpointId: webhook.id,
          event: 'webhook.test',
          payload: testPayload,
          status: response.ok ? 'success' : 'failed',
          attempts: 1,
          statusCode: response.status,
          responseBody: responseBody.substring(0, 1000), // Limit response size
          errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
          createdAt: new Date(),
          lastAttemptAt: new Date(),
          deliveredAt: response.ok ? new Date() : null
        }
      });

      res.json({
        success: true,
        data: {
          delivered: response.ok,
          statusCode: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          responsePreview: responseBody.substring(0, 200),
          deliveryLog: delivery
        },
        message: response.ok ? 'Webhook test successful' : 'Webhook test failed'
      });
    } catch (error) {
      // Log failed delivery
      delivery = await prisma.webhookDelivery.create({
        data: {
          endpointId: webhook.id,
          event: 'webhook.test',
          payload: testPayload,
          status: 'failed',
          attempts: 1,
          errorMessage: error.message,
          createdAt: new Date(),
          lastAttemptAt: new Date()
        }
      });

      res.status(500).json({
        success: false,
        error: 'Webhook delivery failed',
        message: error.message,
        deliveryLog: delivery
      });
    }
  } catch (error) {
    console.error('Error testing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test webhook',
      message: error.message
    });
  }
});

/**
 * PUT /api/v1/webhooks/:id
 * Update webhook (Admin only)
 */
router.put('/:id', authenticateToken, webhookRateLimit, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only admins can update webhooks'
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate URL if provided
    if (updateData.url && !updateData.url.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Webhook URL must use HTTPS'
      });
    }

    // Validate events if provided
    if (updateData.events) {
      const invalidEvents = updateData.events.filter(e => !WEBHOOK_EVENTS.includes(e));
      if (invalidEvents.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: `Invalid events: ${invalidEvents.join(', ')}`
        });
      }
    }

    // Convert numeric fields
    if (updateData.retryCount) updateData.retryCount = parseInt(updateData.retryCount);
    if (updateData.retryDelay) updateData.retryDelay = parseInt(updateData.retryDelay);

    const webhook = await prisma.webhookEndpoint.update({
      where: { id },
      data: updateData
    });

    // Invalidate caches
    await invalidateCache(`webhook:${id}`);
    await invalidateCache('webhooks:list:all');
    await invalidateCache('webhooks:list:true');
    await invalidateCache('webhooks:list:false');

    res.json({
      success: true,
      data: {
        ...webhook,
        authCredentials: webhook.authCredentials ? '***MASKED***' : null
      },
      message: 'Webhook updated successfully'
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update webhook',
      message: error.message
    });
  }
});

/**
 * DELETE /api/v1/webhooks/:id
 * Delete webhook (Admin only)
 */
router.delete('/:id', authenticateToken, webhookRateLimit, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only admins can delete webhooks'
      });
    }

    const { id } = req.params;

    // Delete webhook and all its deliveries (cascade)
    await prisma.webhookEndpoint.delete({
      where: { id }
    });

    // Invalidate caches
    await invalidateCache(`webhook:${id}`);
    await invalidateCache('webhooks:list:all');
    await invalidateCache('webhooks:list:true');

    res.json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete webhook',
      message: error.message
    });
  }
});

/**
 * Helper function to trigger webhook delivery
 * Called by other parts of the application when events occur
 */
export async function triggerWebhook(eventType, eventData) {
  try {
    // Find all active webhooks subscribed to this event
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: {
        isActive: true,
        events: {
          has: eventType
        }
      }
    });

    if (webhooks.length === 0) {
      return;
    }

    // Trigger delivery for each webhook
    const deliveryPromises = webhooks.map(webhook => deliverWebhook(webhook, eventType, eventData));
    await Promise.allSettled(deliveryPromises);
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
}

/**
 * Deliver webhook with retry logic
 */
async function deliverWebhook(webhook, eventType, eventData, attempt = 1) {
  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: eventData
  };

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Nova-Universe-Webhook/1.0',
    ...webhook.headers
  };

  // Add authentication
  if (webhook.authType === 'bearer' && webhook.authCredentials?.token) {
    headers['Authorization'] = `Bearer ${webhook.authCredentials.token}`;
  } else if (webhook.authType === 'api_key' && webhook.authCredentials?.key) {
    headers[webhook.authCredentials.headerName || 'X-API-Key'] = webhook.authCredentials.key;
  } else if (webhook.authType === 'basic' && webhook.authCredentials?.username && webhook.authCredentials?.password) {
    const auth = Buffer.from(`${webhook.authCredentials.username}:${webhook.authCredentials.password}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }

  try {
    const response = await fetch(webhook.url, {
      method: webhook.method,
      headers,
      body: JSON.stringify(payload),
      timeout: 30000
    });

    const responseBody = await response.text();

    // Log successful delivery
    await prisma.webhookDelivery.create({
      data: {
        endpointId: webhook.id,
        event: eventType,
        payload,
        status: response.ok ? 'success' : 'failed',
        attempts: attempt,
        statusCode: response.status,
        responseBody: responseBody.substring(0, 1000),
        errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
        createdAt: new Date(),
        lastAttemptAt: new Date(),
        deliveredAt: response.ok ? new Date() : null
      }
    });

    // Retry if failed and retries available
    if (!response.ok && attempt < webhook.retryCount) {
      await new Promise(resolve => setTimeout(resolve, webhook.retryDelay));
      return deliverWebhook(webhook, eventType, eventData, attempt + 1);
    }
  } catch (error) {
    // Log failed delivery
    await prisma.webhookDelivery.create({
      data: {
        endpointId: webhook.id,
        event: eventType,
        payload,
        status: attempt < webhook.retryCount ? 'retrying' : 'failed',
        attempts: attempt,
        errorMessage: error.message,
        createdAt: new Date(),
        lastAttemptAt: new Date()
      }
    });

    // Retry if retries available
    if (attempt < webhook.retryCount) {
      await new Promise(resolve => setTimeout(resolve, webhook.retryDelay));
      return deliverWebhook(webhook, eventType, eventData, attempt + 1);
    }
  }
}

export default router;
