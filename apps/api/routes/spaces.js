/**
 * Enhanced Nova Spaces API Routes
 * Enterprise-grade space management competing with Maptician
 * Provides advanced booking, analytics, visitor management, and integrations
 */

import express from 'express';
import { logger } from '../logger.js';
import { novaSpacesService } from '../lib/nova-spaces-service.js';

const router = express.Router();

// Initialize the enhanced spaces service
let serviceReady = false;
novaSpacesService
  .initialize()
  .then(() => {
    serviceReady = true;
    logger.info('Enhanced Nova Spaces Service ready');
  })
  .catch((error) => {
    logger.error('Failed to initialize Enhanced Nova Spaces Service:', error);
  });

// Middleware to check service readiness
const ensureServiceReady = (req, res, next) => {
  if (!serviceReady) {
    return res.status(503).json({
      success: false,
      error: 'Spaces service is initializing, please try again in a moment',
    });
  }
  next();
};

// =====================================
// BUILDING & INFRASTRUCTURE ENDPOINTS
// =====================================

/**
 * GET /api/v1/spaces/buildings
 * Get all buildings with real-time metrics
 */
router.get('/buildings', ensureServiceReady, async (req, res) => {
  try {
    const { search, city, country } = req.query;
    const result = await novaSpacesService.getBuildings({ search, city, country });
    res.json(result);
  } catch (error) {
    logger.error('Error fetching buildings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buildings',
    });
  }
});

/**
 * GET /api/v1/spaces/buildings/:id
 * Get building details with floor plans and real-time data
 */
router.get('/buildings/:id', ensureServiceReady, async (req, res) => {
  try {
    const building = await novaSpacesService.getBuildingDetails(req.params.id);
    if (!building) {
      return res.status(404).json({
        success: false,
        error: 'Building not found',
      });
    }
    res.json({
      success: true,
      data: building,
    });
  } catch (error) {
    logger.error('Error fetching building details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch building details',
    });
  }
});

// =====================================
// SPACE MANAGEMENT ENDPOINTS
// =====================================

/**
 * GET /api/v1/spaces
 * Get spaces with advanced filtering and real-time data
 */
router.get('/', ensureServiceReady, async (req, res) => {
  try {
    const {
      buildingId,
      floorId,
      type,
      category,
      status,
      minCapacity,
      maxCapacity,
      amenities,
      features,
      accessibility,
      available,
      availableFrom,
      availableTo,
      search,
      tags,
      page = 1,
      limit = 25,
      include,
    } = req.query;

    const filters = {
      buildingId,
      floorId,
      type: type ? (Array.isArray(type) ? type : type.split(',')) : undefined,
      category,
      status: status ? (Array.isArray(status) ? status : status.split(',')) : undefined,
      capacity: {
        min: minCapacity ? parseInt(minCapacity) : undefined,
        max: maxCapacity ? parseInt(maxCapacity) : undefined,
      },
      amenities: amenities
        ? Array.isArray(amenities)
          ? amenities
          : amenities.split(',')
        : undefined,
      features: features ? (Array.isArray(features) ? features : features.split(',')) : undefined,
      accessibility: accessibility
        ? Array.isArray(accessibility)
          ? accessibility
          : accessibility.split(',')
        : undefined,
      available: available === 'true',
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      availableTo: availableTo ? new Date(availableTo) : undefined,
      search,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined,
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      include: include ? (Array.isArray(include) ? include : include.split(',')) : [],
    };

    const result = await novaSpacesService.getSpaces(filters, options);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching spaces:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch spaces',
    });
  }
});

/**
 * GET /api/v1/spaces/:id
 * Get detailed space information with real-time data
 */
router.get('/:id', ensureServiceReady, async (req, res) => {
  try {
    const space = await novaSpacesService.getSpaceDetails(req.params.id);
    if (!space) {
      return res.status(404).json({
        success: false,
        error: 'Space not found',
      });
    }
    res.json({
      success: true,
      data: space,
    });
  } catch (error) {
    logger.error('Error fetching space details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch space details',
    });
  }
});

/**
 * POST /api/v1/spaces
 * Create a new space with full validation
 */
router.post('/', ensureServiceReady, async (req, res) => {
  try {
    // TODO: Add authentication middleware and get userId from req.user
    const userId = req.user?.id || 'system';
    const result = await novaSpacesService.createSpace(req.body, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating space:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create space',
    });
  }
});

/**
 * PUT /api/v1/spaces/:id
 * Update space information
 */
router.put('/:id', ensureServiceReady, async (req, res) => {
  try {
    const userId = req.user?.id || 'system';
    const result = await novaSpacesService.updateSpace(req.params.id, req.body, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Error updating space:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update space',
    });
  }
});

/**
 * DELETE /api/v1/spaces/:id
 * Delete a space
 */
router.delete('/:id', ensureServiceReady, async (req, res) => {
  try {
    const userId = req.user?.id || 'system';
    const result = await novaSpacesService.deleteSpace(req.params.id, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Error deleting space:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete space',
    });
  }
});

// =====================================
// BOOKING MANAGEMENT ENDPOINTS
// =====================================

/**
 * GET /api/v1/spaces/bookings
 * Get bookings with advanced filtering
 */
router.get('/bookings', ensureServiceReady, async (req, res) => {
  try {
    const { spaceId, userId, status, startDate, endDate, page = 1, limit = 25 } = req.query;

    const filters = {
      spaceId,
      userId,
      status: status ? (Array.isArray(status) ? status : status.split(',')) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const options = { page: parseInt(page), limit: parseInt(limit) };
    const result = await novaSpacesService.getBookings(filters, options);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
    });
  }
});

/**
 * POST /api/v1/spaces/bookings
 * Create a new booking with conflict detection
 */
router.post('/bookings', ensureServiceReady, async (req, res) => {
  try {
    const userId = req.user?.id || 'system';
    const result = await novaSpacesService.createBooking(req.body, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
    });
  }
});

/**
 * GET /api/v1/spaces/:id/availability
 * Check space availability with smart suggestions
 */
router.get('/:id/availability', ensureServiceReady, async (req, res) => {
  try {
    const { startTime, endTime, duration, attendees } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'startTime and endTime are required',
      });
    }

    const options = {
      duration: duration ? parseInt(duration) : undefined,
      attendees: attendees ? parseInt(attendees) : undefined,
      includeSuggestions: true,
    };

    const result = await novaSpacesService.checkAvailability(
      req.params.id,
      new Date(startTime),
      new Date(endTime),
      options,
    );

    res.json(result);
  } catch (error) {
    logger.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check availability',
    });
  }
});

/**
 * POST /api/v1/spaces/find-alternatives
 * Find alternative spaces when preferred space is unavailable
 */
router.post('/find-alternatives', ensureServiceReady, async (req, res) => {
  try {
    const result = await novaSpacesService.findAlternativeSpaces(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error finding alternatives:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find alternative spaces',
    });
  }
});

// =====================================
// ANALYTICS & REPORTING ENDPOINTS
// =====================================

/**
 * GET /api/v1/spaces/metrics
 * Get comprehensive space metrics and analytics
 */
router.get('/metrics', ensureServiceReady, async (req, res) => {
  try {
    const { period = 'week', buildingId, spaceType } = req.query;
    const filters = { period, buildingId, spaceType };
    const result = await novaSpacesService.getSpaceMetrics(filters);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching space metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch space metrics',
    });
  }
});

/**
 * GET /api/v1/spaces/:id/utilization
 * Get utilization report for a specific space
 */
router.get('/:id/utilization', ensureServiceReady, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const result = await novaSpacesService.getUtilizationReport(req.params.id, period);
    res.json(result);
  } catch (error) {
    logger.error('Error generating utilization report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate utilization report',
    });
  }
});

/**
 * GET /api/v1/spaces/analytics/dashboard
 * Get dashboard analytics data
 */
router.get('/analytics/dashboard', ensureServiceReady, async (req, res) => {
  try {
    const { buildingId } = req.query;
    const result = await novaSpacesService.getDashboardAnalytics(buildingId);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard analytics',
    });
  }
});

// =====================================
// VISITOR MANAGEMENT ENDPOINTS
// =====================================

/**
 * POST /api/v1/spaces/visitors
 * Register a new visitor
 */
router.post('/visitors', ensureServiceReady, async (req, res) => {
  try {
    const hostUserId = req.user?.id || req.body.hostUserId;
    if (!hostUserId) {
      return res.status(400).json({
        success: false,
        error: 'Host user ID is required',
      });
    }

    const result = await novaSpacesService.registerVisitor(req.body, hostUserId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error registering visitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register visitor',
    });
  }
});

/**
 * POST /api/v1/spaces/visitors/:id/checkin
 * Check in a visitor
 */
router.post('/visitors/:id/checkin', ensureServiceReady, async (req, res) => {
  try {
    const result = await novaSpacesService.checkInVisitor(req.params.id, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Error checking in visitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check in visitor',
    });
  }
});

// =====================================
// IOT & SENSOR ENDPOINTS
// =====================================

/**
 * GET /api/v1/spaces/:id/sensors
 * Get real-time sensor data for a space
 */
router.get('/:id/sensors', ensureServiceReady, async (req, res) => {
  try {
    const { types } = req.query;
    const sensorTypes = types ? types.split(',') : [];
    const result = await novaSpacesService.getSensorData(req.params.id, sensorTypes);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching sensor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor data',
    });
  }
});

/**
 * POST /api/v1/spaces/:id/occupancy/update
 * Update occupancy from sensor data
 */
router.post('/:id/occupancy/update', ensureServiceReady, async (req, res) => {
  try {
    const result = await novaSpacesService.updateOccupancyFromSensors(req.params.id);
    res.json(result);
  } catch (error) {
    logger.error('Error updating occupancy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update occupancy',
    });
  }
});

// =====================================
// INTEGRATION ENDPOINTS
// =====================================

/**
 * POST /api/v1/spaces/calendar/sync
 * Sync with external calendar systems
 */
router.post('/calendar/sync', ensureServiceReady, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
    }

    const result = await novaSpacesService.syncCalendars(userId);
    res.json(result);
  } catch (error) {
    logger.error('Error syncing calendars:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync calendars',
    });
  }
});

/**
 * POST /api/v1/spaces/bookings/:id/meeting
 * Create Zoom/Teams meeting for booking
 */
router.post('/bookings/:id/meeting', ensureServiceReady, async (req, res) => {
  try {
    const { platform = 'zoom' } = req.body;
    const result = await novaSpacesService.createMeetingForBooking(req.params.id, platform);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Error creating meeting for booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting for booking',
    });
  }
});

// =====================================
// LEGACY ENDPOINTS (for backward compatibility)
// =====================================

// Keep some mock endpoints for backward compatibility during transition
const mockSpaceMetrics = {
  totalSpaces: 145,
  availableSpaces: 67,
  occupiedSpaces: 72,
  maintenanceSpaces: 6,
  utilizationRate: 74.5,
  peakOccupancyTime: '2:00 PM',
  averageBookingDuration: 90,
  mostPopularSpaces: [
    { spaceId: '1', name: 'Conference Room A', bookingCount: 23 },
    { spaceId: '2', name: 'Focus Pod 3', bookingCount: 18 },
    { spaceId: '3', name: 'Meeting Room B', bookingCount: 15 },
  ],
  lastUpdated: new Date().toISOString(),
};

/**
 * GET /api/v1/spaces/metrics/legacy
 * Legacy metrics endpoint for backward compatibility
 */
router.get('/metrics/legacy', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockSpaceMetrics,
    });
  } catch (error) {
    logger.error('Error fetching legacy metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
    });
  }
});

export default router;
