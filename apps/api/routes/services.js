import express from 'express';
import { query, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { prisma, getWithCache } from '../db.js';

const router = express.Router();

/**
 * Services API - Popular and featured IT services for Self-Service Portal
 * Provides quick access to commonly requested services
 */

/**
 * @route GET /api/v1/services/popular
 * @description Get popular IT services for quick access
 * @access Public (but can be personalized if authenticated)
 * @returns {Array} Array of popular services
 */
router.get(
  '/popular',
  createRateLimit(60 * 1000, 120),
  [query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const limit = parseInt(req.query.limit) || 10;
      const cacheKey = `nova:services:popular:limit:${limit}:v1`;

      const services = await getWithCache(
        cacheKey,
        async () => {
          // Get popular services from service catalog based on request count
          const popularServices = await prisma.serviceCatalogItem.findMany({
            where: {
              active: true,
              published: true,
            },
            orderBy: [
              { requestCount: 'desc' }, // Most requested first
              { rating: 'desc' }, // Highest rated second
              { name: 'asc' }, // Alphabetical third
            ],
            take: limit,
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              icon: true,
              requestCount: true,
              rating: true,
              avgFulfillmentTime: true, // In minutes
              price: true,
              currency: true,
              requiresApproval: true,
              tags: true,
            },
          });

          return popularServices.map((service) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            category: service.category,
            icon: service.icon || '📦',
            requests: service.requestCount || 0,
            rating: service.rating ? Math.round(service.rating * 10) / 10 : null,
            avgFulfillmentTime: service.avgFulfillmentTime || null,
            price: service.price || null,
            currency: service.currency || 'USD',
            requiresApproval: service.requiresApproval || false,
            tags: service.tags || [],
          }));
        },
        600 // 10 minutes TTL - popular services don't change frequently
      );

      res.json({
        success: true,
        data: services,
        meta: {
          count: services.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error fetching popular services:', error);

      // Graceful degradation if service catalog not set up
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        logger.warn('Service catalog feature not yet implemented in database');
        return res.json({
          success: true,
          data: [],
          meta: {
            count: 0,
            message: 'Service catalog coming soon',
            timestamp: new Date().toISOString(),
          },
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular services',
        message: error.message,
      });
    }
  }
);

/**
 * @route GET /api/v1/services/featured
 * @description Get featured IT services (admin-curated)
 * @access Public
 * @returns {Array} Array of featured services
 */
router.get('/featured', createRateLimit(60 * 1000, 120), async (req, res) => {
  try {
    const cacheKey = 'nova:services:featured:v1';

    const services = await getWithCache(
      cacheKey,
      async () => {
        const featuredServices = await prisma.serviceCatalogItem.findMany({
          where: {
            active: true,
            published: true,
            featured: true,
          },
          orderBy: [
            { featuredOrder: 'asc' }, // Admin-defined order
            { name: 'asc' },
          ],
          take: 8, // Show top 8 featured services
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            icon: true,
            requestCount: true,
            rating: true,
            avgFulfillmentTime: true,
            price: true,
            currency: true,
            requiresApproval: true,
            tags: true,
          },
        });

        return featuredServices.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          icon: service.icon || '📦',
          requests: service.requestCount || 0,
          rating: service.rating ? Math.round(service.rating * 10) / 10 : null,
          avgFulfillmentTime: service.avgFulfillmentTime || null,
          price: service.price || null,
          currency: service.currency || 'USD',
          requiresApproval: service.requiresApproval || false,
          tags: service.tags || [],
        }));
      },
      900 // 15 minutes TTL - featured services are curated and change infrequently
    );

    res.json({
      success: true,
      data: services,
      meta: {
        count: services.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching featured services:', error);

    // Graceful degradation
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      logger.warn('Service catalog feature not yet implemented in database');
      return res.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          message: 'Service catalog coming soon',
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured services',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/v1/services/categories
 * @description Get all service categories
 * @access Public
 * @returns {Array} Array of categories with service counts
 */
router.get('/categories', createRateLimit(60 * 1000, 60), async (req, res) => {
  try {
    const cacheKey = 'nova:services:categories:v1';

    const categories = await getWithCache(
      cacheKey,
      async () => {
        const categoryStats = await prisma.serviceCatalogItem.groupBy({
          by: ['category'],
          where: {
            active: true,
            published: true,
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        });

        return categoryStats.map((stat) => ({
          name: stat.category,
          serviceCount: stat._count.id,
        }));
      },
      900 // 15 minutes TTL
    );

    res.json({
      success: true,
      data: categories,
      meta: {
        count: categories.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching service categories:', error);

    // Graceful degradation
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      logger.warn('Service catalog feature not yet implemented in database');
      return res.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          message: 'Service catalog coming soon',
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch service categories',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/v1/services/:id/request
 * @description Submit a service request
 * @access Protected
 * @returns {Object} Created service request
 */
router.post(
  '/:id/request',
  authenticateJWT,
  createRateLimit(60 * 1000, 30),
  async (req, res) => {
    try {
      const serviceId = req.params.id;
      const userId = req.user.id;
      const { additionalInfo, urgency } = req.body;

      // Verify service exists and is active
      const service = await prisma.serviceCatalogItem.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          name: true,
          active: true,
          published: true,
          requiresApproval: true,
        },
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found',
        });
      }

      if (!service.active || !service.published) {
        return res.status(400).json({
          success: false,
          error: 'Service is not available',
        });
      }

      // Create service request (creates a ticket behind the scenes)
      const request = await prisma.serviceRequest.create({
        data: {
          serviceId,
          requesterId: userId,
          status: service.requiresApproval ? 'PENDING_APPROVAL' : 'NEW',
          additionalInfo: additionalInfo || null,
          urgency: urgency || 'MEDIUM',
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Increment request count (fire and forget)
      prisma.serviceCatalogItem
        .update({
          where: { id: serviceId },
          data: { requestCount: { increment: 1 } },
        })
        .catch((err) => logger.warn('Failed to increment request count:', err));

      res.status(201).json({
        success: true,
        data: {
          id: request.id,
          requestNumber: request.requestNumber,
          service: request.service,
          requester: request.requester,
          status: request.status,
          createdAt: request.createdAt,
        },
      });
    } catch (error) {
      logger.error('Error creating service request:', error);

      // Graceful degradation
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        logger.warn('Service catalog feature not yet implemented in database');
        return res.status(501).json({
          success: false,
          error: 'Service requests coming soon',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create service request',
        message: error.message,
      });
    }
  }
);

export default router;
