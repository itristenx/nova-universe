// Nova Sentinel - Monitor Management Routes
// Complete 1:1 Uptime Kuma Feature Parity

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for monitor operations
const monitorRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many monitor requests, please try again later.'
});

router.use(monitorRateLimit);

// ========================================================================
// MONITOR CRUD OPERATIONS - 1:1 UPTIME KUMA PARITY
// ========================================================================

/**
 * @swagger
 * /api/v1/monitors:
 *   get:
 *     tags: [Monitors]
 *     summary: Get all monitors with Helix user preferences
 *     description: Retrieve all monitors with user-specific settings from Helix
 */
router.get('/', async (req, res) => {
  try {
    const { search, type, status, tags, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    // Get monitors from Uptime Kuma
    const monitors = await req.services.uptimeKuma.getAllMonitors(); // TODO-LINT: move to async function
    
    // Apply filters
    let filteredMonitors = monitors;
    
    if (search) {
      filteredMonitors = filteredMonitors.filter(monitor => 
        monitor.name.toLowerCase().includes(search.toLowerCase()) ||
        monitor.url?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (type) {
      filteredMonitors = filteredMonitors.filter(monitor => monitor.type === type);
    }
    
    if (status) {
      filteredMonitors = filteredMonitors.filter(monitor => {
        const heartbeat = req.services.monitoring.getLatestHeartbeat(monitor.id);
        return heartbeat?.status === (status === 'up' ? 1 : 0);
      });
    }
    
    if (tags) {
      const tagList = tags.split(',');
      filteredMonitors = filteredMonitors.filter(monitor =>
        monitor.tags?.some(tag => tagList.includes(tag.name))
      );
    }

    // Apply pagination
    const paginatedMonitors = filteredMonitors.slice(offset, offset + parseInt(limit));

    // Enrich with Helix user preferences
    const enrichedMonitors = await Promise.all(
      paginatedMonitors.map(async (monitor) => {
        const preferences = await req.services.helix.getUserPreference(
          userId, 
          `sentinel.monitor.${monitor.id}`,
          { favorite: false, lastViewed: null, customName: null }
        ); // TODO-LINT: move to async function

        const heartbeat = req.services.monitoring.getLatestHeartbeat(monitor.id);
        const uptime = await req.services.monitoring.getUptimeStats(monitor.id); // TODO-LINT: move to async function

        return {
          ...monitor,
          userPreferences: preferences,
          currentStatus: heartbeat?.status === 1 ? 'up' : 'down',
          lastHeartbeat: heartbeat?.time,
          responseTime: heartbeat?.ping,
          uptime: uptime,
          errorMessage: heartbeat?.msg
        };
      })
    );

    res.json({
      success: true,
      monitors: enrichedMonitors,
      pagination: {
        total: filteredMonitors.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + parseInt(limit) < filteredMonitors.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Monitor list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitors',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/monitors:
 *   post:
 *     tags: [Monitors]
 *     summary: Create new monitor with all Uptime Kuma monitor types
 */
router.post('/',
  [
    body('name').isString().isLength({ min: 1, max: 150 }).withMessage('Monitor name required (1-150 chars)'),
    body('type').isIn([
      'http', 'port', 'ping', 'keyword', 'dns', 'docker', 'push', 'steam',
      'gamedig', 'mysql', 'postgres', 'redis', 'mongodb', 'grpc', 'radius'
    ]).withMessage('Valid monitor type required'),
    body('url').optional().isURL().withMessage('Valid URL required for HTTP monitors'),
    body('hostname').optional().isString().withMessage('Hostname must be string'),
    body('port').optional().isInt({ min: 1, max: 65535 }).withMessage('Valid port required'),
    body('interval').optional().isInt({ min: 20, max: 86400 }).withMessage('Interval must be 20-86400 seconds'),
    body('timeout').optional().isInt({ min: 1, max: 300 }).withMessage('Timeout must be 1-300 seconds'),
    body('maxretries').optional().isInt({ min: 0, max: 10 }).withMessage('Max retries must be 0-10'),
    body('retryInterval').optional().isInt({ min: 20, max: 86400 }).withMessage('Retry interval must be 20-86400 seconds'),
    body('upsideDown').optional().isBoolean(),
    body('ignoreTls').optional().isBoolean(),
    body('maxRedirect').optional().isInt({ min: 0, max: 20 }),
    body('accepted_statuscodes').optional().isArray(),
    body('method').optional().isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
    body('headers').optional().isString(),
    body('body').optional().isString(),
    body('keyword').optional().isString(),
    body('invertKeyword').optional().isBoolean(),
    body('authMethod').optional().isIn(['', 'basic', 'ntlm', 'mtls']),
    body('basic_auth_user').optional().isString(),
    body('basic_auth_pass').optional().isString(),
    body('tags').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      
      // Create monitor in Uptime Kuma
      const monitor = await req.services.uptimeKuma.createMonitor(req.body); // TODO-LINT: move to async function

      // Store in Nova database for correlation
      await req.services.database.createMonitor({
        uptimeKumaId: monitor.id,
        createdBy: userId,
        tenantId: req.user.tenantId,
        name: monitor.name,
        type: monitor.type,
        config: monitor
      }); // TODO-LINT: move to async function

      // Set default user preferences in Helix
      await req.services.helix.setUserPreference(
        userId,
        `sentinel.monitor.${monitor.id}`,
        { 
          favorite: false, 
          createdAt: new Date().toISOString(),
          customName: null
        }
      ); // TODO-LINT: move to async function

      // Emit real-time update
      req.io.to(`tenant_${req.user.tenantId}`).emit('monitor_created', monitor);

      res.status(201).json({
        success: true,
        monitor,
        message: 'Monitor created successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Monitor creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create monitor',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/monitors/{id}:
 *   get:
 *     tags: [Monitors]
 *     summary: Get monitor details with heartbeat history
 */
router.get('/:id',
  [param('id').isString().withMessage('Monitor ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period = '24h' } = req.query;
      const userId = req.user.id;

      // Get monitor from Uptime Kuma
      const monitor = await req.services.uptimeKuma.getMonitor(id); // TODO-LINT: move to async function
      if (!monitor) {
        return res.status(404).json({
          success: false,
          error: 'Monitor not found'
        });
      }

      // Get heartbeat history
      const heartbeats = await req.services.uptimeKuma.getMonitorHeartbeats(id, period); // TODO-LINT: move to async function
      
      // Get user preferences
      const preferences = await req.services.helix.getUserPreference(
        userId,
        `sentinel.monitor.${id}`,
        { favorite: false, lastViewed: null, customName: null }
      ); // TODO-LINT: move to async function

      // Update last viewed timestamp
      await req.services.helix.setUserPreference(
        userId,
        `sentinel.monitor.${id}`,
        { ...preferences, lastViewed: new Date().toISOString() }
      ); // TODO-LINT: move to async function

      // Calculate uptime statistics
      const uptime = await req.services.monitoring.getUptimeStats(id, period); // TODO-LINT: move to async function
      const currentHeartbeat = req.services.monitoring.getLatestHeartbeat(id);

      res.json({
        success: true,
        monitor: {
          ...monitor,
          userPreferences: preferences,
          currentStatus: currentHeartbeat?.status === 1 ? 'up' : 'down',
          lastHeartbeat: currentHeartbeat?.time,
          responseTime: currentHeartbeat?.ping,
          uptime,
          heartbeats: heartbeats.slice(-100), // Last 100 heartbeats
          errorMessage: currentHeartbeat?.msg
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Monitor details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve monitor details',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/monitors/{id}:
 *   put:
 *     tags: [Monitors]
 *     summary: Update monitor configuration
 */
router.put('/:id',
  [
    param('id').isString().withMessage('Monitor ID required'),
    body('name').optional().isString().isLength({ min: 1, max: 150 }),
    body('interval').optional().isInt({ min: 20, max: 86400 }),
    body('timeout').optional().isInt({ min: 1, max: 300 }),
    body('url').optional().isURL(),
    body('headers').optional().isString(),
    body('body').optional().isString()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Update monitor in Uptime Kuma
      const monitor = await req.services.uptimeKuma.updateMonitor(id, req.body); // TODO-LINT: move to async function

      // Update in Nova database
      await req.services.database.updateMonitor(id, {
        updatedBy: userId,
        config: monitor,
        updatedAt: new Date().toISOString()
      }); // TODO-LINT: move to async function

      // Emit real-time update
      req.io.to(`tenant_${req.user.tenantId}`).emit('monitor_updated', monitor);

      res.json({
        success: true,
        monitor,
        message: 'Monitor updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Monitor update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update monitor',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/monitors/{id}:
 *   delete:
 *     tags: [Monitors]
 *     summary: Delete monitor
 */
router.delete('/:id',
  [param('id').isString().withMessage('Monitor ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Delete from Uptime Kuma
      await req.services.uptimeKuma.deleteMonitor(id); // TODO-LINT: move to async function

      // Delete from Nova database
      await req.services.database.deleteMonitor(id); // TODO-LINT: move to async function

      // Clean up user preferences
      await req.services.helix.deleteUserPreference(userId, `sentinel.monitor.${id}`); // TODO-LINT: move to async function

      // Emit real-time update
      req.io.to(`tenant_${req.user.tenantId}`).emit('monitor_deleted', { id });

      res.json({
        success: true,
        message: 'Monitor deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Monitor deletion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete monitor',
        details: error.message
      });
    }
  }
);

// ========================================================================
// MONITOR CONTROL OPERATIONS
// ========================================================================

/**
 * @swagger
 * /api/v1/monitors/{id}/pause:
 *   post:
 *     tags: [Monitors]
 *     summary: Pause monitor
 */
router.post('/:id/pause',
  [param('id').isString().withMessage('Monitor ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;

      await req.services.uptimeKuma.pauseMonitor(id); // TODO-LINT: move to async function

      // Emit real-time update
      req.io.to(`tenant_${req.user.tenantId}`).emit('monitor_paused', { id });

      res.json({
        success: true,
        message: 'Monitor paused successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Monitor pause error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to pause monitor',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/monitors/{id}/resume:
 *   post:
 *     tags: [Monitors]
 *     summary: Resume monitor
 */
router.post('/:id/resume',
  [param('id').isString().withMessage('Monitor ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;

      await req.services.uptimeKuma.resumeMonitor(id); // TODO-LINT: move to async function

      // Emit real-time update
      req.io.to(`tenant_${req.user.tenantId}`).emit('monitor_resumed', { id });

      res.json({
        success: true,
        message: 'Monitor resumed successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Monitor resume error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resume monitor',
        details: error.message
      });
    }
  }
);

// ========================================================================
// MONITOR HEARTBEATS & STATISTICS
// ========================================================================

/**
 * @swagger
 * /api/v1/monitors/{id}/heartbeats:
 *   get:
 *     tags: [Monitors]
 *     summary: Get monitor heartbeat history
 */
router.get('/:id/heartbeats',
  [
    param('id').isString().withMessage('Monitor ID required'),
    query('period').optional().isIn(['1h', '6h', '24h', '7d', '30d', '90d']),
    query('limit').optional().isInt({ min: 1, max: 1000 })
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period = '24h', limit = 100 } = req.query;

      const heartbeats = await req.services.uptimeKuma.getMonitorHeartbeats(id, period); // TODO-LINT: move to async function
      const limitedHeartbeats = heartbeats.slice(-parseInt(limit));

      // Calculate statistics
      const stats = {
        total: heartbeats.length,
        up: heartbeats.filter(h => h.status === 1).length,
        down: heartbeats.filter(h => h.status === 0).length,
        avgResponseTime: heartbeats.length > 0 
          ? heartbeats.reduce((sum, h) => sum + (h.ping || 0), 0) / heartbeats.length 
          : 0,
        uptime: heartbeats.length > 0 
          ? (heartbeats.filter(h => h.status === 1).length / heartbeats.length) * 100 
          : 0
      };

      res.json({
        success: true,
        heartbeats: limitedHeartbeats,
        statistics: stats,
        period,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Heartbeats fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve heartbeats',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/monitors/{id}/uptime:
 *   get:
 *     tags: [Monitors]
 *     summary: Get monitor uptime statistics
 */
router.get('/:id/uptime',
  [
    param('id').isString().withMessage('Monitor ID required'),
    query('period').optional().isIn(['1h', '6h', '24h', '7d', '30d', '90d'])
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period = '24h' } = req.query;

      const uptime = await req.services.monitoring.getUptimeStats(id, period); // TODO-LINT: move to async function

      res.json({
        success: true,
        uptime,
        period,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Uptime stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve uptime statistics',
        details: error.message
      });
    }
  }
);

// ========================================================================
// USER PREFERENCES MANAGEMENT (Helix Integration)
// ========================================================================

/**
 * @swagger
 * /api/v1/monitors/{id}/favorite:
 *   post:
 *     tags: [Monitors]
 *     summary: Add monitor to user favorites (stored in Helix)
 */
router.post('/:id/favorite',
  [param('id').isString().withMessage('Monitor ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const preferences = await req.services.helix.getUserPreference(
        userId,
        `sentinel.monitor.${id}`,
        { favorite: false }
      ); // TODO-LINT: move to async function

      await req.services.helix.setUserPreference(
        userId,
        `sentinel.monitor.${id}`,
        { ...preferences, favorite: true, favoritedAt: new Date().toISOString() }
      ); // TODO-LINT: move to async function

      res.json({
        success: true,
        message: 'Monitor added to favorites',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Favorite monitor error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to favorite monitor',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/monitors/{id}/unfavorite:
 *   post:
 *     tags: [Monitors]
 *     summary: Remove monitor from user favorites
 */
router.post('/:id/unfavorite',
  [param('id').isString().withMessage('Monitor ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const preferences = await req.services.helix.getUserPreference(
        userId,
        `sentinel.monitor.${id}`,
        {}
      ); // TODO-LINT: move to async function

      await req.services.helix.setUserPreference(
        userId,
        `sentinel.monitor.${id}`,
        { ...preferences, favorite: false, unfavoritedAt: new Date().toISOString() }
      ); // TODO-LINT: move to async function

      res.json({
        success: true,
        message: 'Monitor removed from favorites',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Unfavorite monitor error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unfavorite monitor',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/monitors/{id}/custom-name:
 *   put:
 *     tags: [Monitors]
 *     summary: Set custom name for monitor (user-specific, stored in Helix)
 */
router.put('/:id/custom-name',
  [
    param('id').isString().withMessage('Monitor ID required'),
    body('customName').isString().isLength({ min: 1, max: 100 }).withMessage('Custom name required (1-100 chars)')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { customName } = req.body;
      const userId = req.user.id;

      const preferences = await req.services.helix.getUserPreference(
        userId,
        `sentinel.monitor.${id}`,
        {}
      ); // TODO-LINT: move to async function

      await req.services.helix.setUserPreference(
        userId,
        `sentinel.monitor.${id}`,
        { ...preferences, customName, customNameUpdatedAt: new Date().toISOString() }
      ); // TODO-LINT: move to async function

      res.json({
        success: true,
        message: 'Custom name updated successfully',
        customName,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Custom name error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update custom name',
        details: error.message
      });
    }
  }
);

export default router;
