// Nova API - Enhanced Uptime Kuma Proxy Routes
// Provides seamless integration between Nova UI and Uptime Kuma backend
// All authentication handled through Nova, Uptime Kuma uses Nova database

import express from 'express';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { UptimeKumaClient } from '../lib/uptime-kuma.js';
import { logAudit } from '../middleware/audit.js';
import { checkPermissions } from '../middleware/rbac.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import db from '../db.js';

const router = express.Router();

// Uptime Kuma Configuration for Nova Integration
const UPTIME_KUMA_CONFIG = {
  baseUrl: process.env.UPTIME_KUMA_API_URL || 'http://nova-uptime-kuma-backend:3001',
  apiKey: process.env.UPTIME_KUMA_API_KEY,
  enabled: process.env.UPTIME_KUMA_PROXY_ENABLED !== 'false', // Default enabled
  webhookSecret: process.env.UPTIME_KUMA_WEBHOOK_SECRET || 'nova-uptime-kuma-webhook-secret',
  useNovaAuth: true, // Always use Nova authentication
  dbSchema: 'uptime_kuma', // Nova database schema for Uptime Kuma
};

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * Ensure Nova user and monitor are synchronized with Uptime Kuma
 */
async function ensureUptimeKumaSync(req) {
  const user = req.user;
  if (!user) {
    throw new Error('No authenticated user');
  }

  try {
    // Sync user monitors to Uptime Kuma if needed
    const result = await db.query(`
      SELECT COUNT(*) as unsynced_count
      FROM monitors m 
      WHERE m.user_id = $1 
      AND m.url IS NOT NULL 
      AND m.id NOT IN (
        SELECT nova_monitor_id 
        FROM uptime_kuma.monitors 
        WHERE nova_monitor_id IS NOT NULL
      )
    `, [user.id]);

    if (result.rows[0].unsynced_count > 0) {
      logger.info('Syncing user monitors to Uptime Kuma', { 
        userId: user.id, 
        unsyncedCount: result.rows[0].unsynced_count 
      });
      
      // Sync all user monitors
      await db.query('SELECT uptime_kuma.sync_nova_monitor_to_kuma(id) FROM monitors WHERE user_id = $1 AND url IS NOT NULL', [user.id]);
    }
  } catch (error) {
    logger.error('Failed to sync user monitors to Uptime Kuma', { 
      userId: user.id, 
      error: error.message 
    });
    // Continue anyway - don't block request
  }
}

// Middleware to ensure user data is synchronized
router.use(async (req, res, next) => {
  if (req.user) {
    try {
      await ensureUptimeKumaSync(req);
    } catch (error) {
      logger.error('Failed to sync user data to Uptime Kuma', { 
        userId: req.user.id, 
        error: error.message 
      });
    }
  }
  next();
});

// Initialize Uptime Kuma client with Nova configuration
const kumaClient = new UptimeKumaClient(
  UPTIME_KUMA_CONFIG.baseUrl,
  UPTIME_KUMA_CONFIG.apiKey,
);

/**
 * @swagger
 * /api/v1/uptime-kuma/admin/health:
 *   get:
 *     summary: Check Uptime Kuma integration health
 *     tags: [Uptime Kuma Administration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin/health', checkPermissions(['uptime-kuma:admin:read']), async (req, res) => {
  try {
    // Check Uptime Kuma API connectivity
    const kumaHealth = await kumaClient.ping()
      .then(() => ({ status: 'healthy', message: 'API accessible' }))
      .catch(err => ({ status: 'unhealthy', message: err.message }));

    // Check database connectivity
    const dbHealth = await db.query('SELECT 1 FROM uptime_kuma.monitors LIMIT 1')
      .then(() => ({ status: 'healthy', message: 'Database accessible' }))
      .catch(err => ({ status: 'unhealthy', message: err.message }));

    // Check monitor sync status
    const syncStats = await db.query(`
      SELECT 
        COUNT(*) as total_monitors,
        COUNT(CASE WHEN sync_status = 'synced' THEN 1 END) as synced_monitors,
        COUNT(CASE WHEN sync_status = 'failed' THEN 1 END) as failed_monitors,
        MAX(updated_date) as last_sync
      FROM uptime_kuma.monitors
    `);

    const healthData = {
      uptime_kuma_api: kumaHealth,
      database: dbHealth,
      monitor_sync: {
        status: syncStats.rows[0].failed_monitors > 0 ? 'degraded' : 'healthy',
        total_monitors: parseInt(syncStats.rows[0].total_monitors),
        synced_monitors: parseInt(syncStats.rows[0].synced_monitors),
        failed_monitors: parseInt(syncStats.rows[0].failed_monitors),
        last_sync: syncStats.rows[0].last_sync,
      },
      overall_status: (kumaHealth.status === 'healthy' && dbHealth.status === 'healthy') 
        ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };

    logAudit(req, 'uptime_kuma_health_check', { health: healthData });

    res.json({
      success: true,
      health: healthData,
    });
  } catch (error) {
    logger.error('Uptime Kuma health check failed', {
      error: error.message,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/admin/sync-monitors:
 *   post:
 *     summary: Synchronize all Nova monitors to Uptime Kuma
 *     tags: [Uptime Kuma Administration]
 *     security:
 *       - bearerAuth: []
 */
router.post('/admin/sync-monitors', checkPermissions(['uptime-kuma:admin:manage']), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT uptime_kuma.sync_nova_monitor_to_kuma(id) as kuma_monitor_id, name
      FROM monitors 
      WHERE url IS NOT NULL 
      AND (
        id NOT IN (SELECT nova_monitor_id FROM uptime_kuma.monitors WHERE nova_monitor_id IS NOT NULL)
        OR id IN (SELECT nova_monitor_id FROM uptime_kuma.monitors WHERE sync_status = 'failed')
      )
    `);

    logAudit(req, 'uptime_kuma_monitor_sync', {
      synced_count: result.rowCount,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      message: 'Monitor synchronization completed',
      syncedMonitors: result.rowCount,
      monitors: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Monitor sync failed', {
      error: error.message,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Monitor synchronization failed',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors:
 *   get:
 *     summary: Get all monitors from Uptime Kuma (Nova integrated)
 *     description: Retrieves all monitoring targets with Nova user context
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monitors', async (req, res) => {
  try {
    // Get monitors from Nova database with Uptime Kuma integration data
    const result = await db.query(`
      SELECT 
        um.id as kuma_monitor_id,
        um.name,
        um.url,
        um.type,
        um.interval,
        um.active,
        um.nova_monitor_id,
        um.created_date,
        um.updated_date,
        um.sync_status,
        -- Get latest heartbeat data
        h.status as current_status,
        h.time as last_check,
        h.duration as response_time_ms,
        h.msg as status_message,
        -- Nova monitor data
        m.name as nova_monitor_name,
        m.description as nova_monitor_description,
        m.user_id as nova_user_id
      FROM uptime_kuma.monitors um
      LEFT JOIN monitors m ON um.nova_monitor_id = m.id
      LEFT JOIN LATERAL (
        SELECT status, time, duration, msg
        FROM uptime_kuma.heartbeats hb
        WHERE hb.monitor_id = um.id
        ORDER BY time DESC
        LIMIT 1
      ) h ON true
      WHERE um.active = true
      AND (um.nova_user_id = $1 OR $2 = true)
      ORDER BY um.name
    `, [req.user.id, req.user.role === 'admin']);

    const monitors = result.rows.map(row => ({
      id: row.kuma_monitor_id,
      name: row.name,
      url: row.url,
      type: row.type,
      interval: row.interval,
      active: row.active,
      status: row.current_status ? 'up' : 'down',
      lastCheck: row.last_check,
      responseTime: row.response_time_ms,
      statusMessage: row.status_message,
      novaMonitorId: row.nova_monitor_id,
      novaMonitorName: row.nova_monitor_name,
      syncStatus: row.sync_status,
      createdAt: row.created_date,
      updatedAt: row.updated_date
    }));

    logAudit(req, 'uptime_kuma_monitors_view', {
      count: monitors.length,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: monitors,
      count: monitors.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get monitors from Nova database', {
      error: error.message,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitors',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors/{id}:
 *   get:
 *     summary: Get specific monitor details
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monitors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const monitor = await kumaClient.getMonitorStatus(parseInt(id));

    logAudit(req, 'uptime_kuma_monitor_view', {
      monitor_id: id,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: monitor,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get monitor from Uptime Kuma', {
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id,
    });
    res.status(404).json({
      success: false,
      error: 'Monitor not found',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors:
 *   post:
 *     summary: Create new monitor in Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.post('/monitors', async (req, res) => {
  try {
    const monitorData = req.body;

    // Validate required fields
    if (!monitorData.name || !monitorData.type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and type are required',
      });
    }

    const monitor = await kumaClient.createMonitor(monitorData);

    logAudit(req, 'uptime_kuma_monitor_create', {
      monitor_id: monitor.id,
      monitor_name: monitor.name,
      monitor_type: monitor.type,
      user_id: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: monitor,
      message: 'Monitor created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to create monitor in Uptime Kuma', {
      error: error.message,
      monitor_data: req.body,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create monitor',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors/{id}:
 *   patch:
 *     summary: Update monitor in Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/monitors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const monitor = await kumaClient.updateMonitor(parseInt(id), updates);

    logAudit(req, 'uptime_kuma_monitor_update', {
      monitor_id: id,
      updates: Object.keys(updates),
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: monitor,
      message: 'Monitor updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to update monitor in Uptime Kuma', {
      error: error.message,
      monitor_id: req.params.id,
      updates: req.body,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update monitor',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors/{id}:
 *   delete:
 *     summary: Delete monitor from Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/monitors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await kumaClient.deleteMonitor(parseInt(id));

    logAudit(req, 'uptime_kuma_monitor_delete', {
      monitor_id: id,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      message: 'Monitor deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to delete monitor from Uptime Kuma', {
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to delete monitor',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors/{id}/pause:
 *   post:
 *     summary: Pause monitor in Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.post('/monitors/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;

    await kumaClient.pauseMonitor(parseInt(id));

    logAudit(req, 'uptime_kuma_monitor_pause', {
      monitor_id: id,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      message: 'Monitor paused successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to pause monitor in Uptime Kuma', {
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to pause monitor',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors/{id}/resume:
 *   post:
 *     summary: Resume monitor in Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.post('/monitors/:id/resume', async (req, res) => {
  try {
    const { id } = req.params;

    await kumaClient.resumeMonitor(parseInt(id));

    logAudit(req, 'uptime_kuma_monitor_resume', {
      monitor_id: id,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      message: 'Monitor resumed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to resume monitor in Uptime Kuma', {
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to resume monitor',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors/{id}/test:
 *   post:
 *     summary: Test monitor immediately in Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.post('/monitors/:id/test', async (req, res) => {
  try {
    const { id } = req.params;

    // For testing, we get the current status which includes the latest heartbeat
    const status = await kumaClient.getMonitorStatus(parseInt(id));

    logAudit(req, 'uptime_kuma_monitor_test', {
      monitor_id: id,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: status.heartbeat,
      message: 'Monitor tested successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to test monitor in Uptime Kuma', {
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to test monitor',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors/{id}/heartbeats:
 *   get:
 *     summary: Get monitor heartbeat history
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monitors/:id/heartbeats', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '24h', limit = 100 } = req.query;

    const heartbeats = await kumaClient.getHeartbeats(parseInt(id), parseInt(limit));

    logAudit(req, 'uptime_kuma_heartbeats_view', {
      monitor_id: id,
      period,
      limit,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: heartbeats,
      count: heartbeats.length,
      period,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get heartbeats from Uptime Kuma', {
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve heartbeats',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors/{id}/uptime:
 *   get:
 *     summary: Get monitor uptime statistics
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monitors/:id/uptime', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    const uptimeStats = await kumaClient.getUptimeStats(parseInt(id));

    logAudit(req, 'uptime_kuma_uptime_view', {
      monitor_id: id,
      period,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: uptimeStats,
      period,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get uptime stats from Uptime Kuma', {
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve uptime statistics',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/health:
 *   get:
 *     summary: Get overall system health from Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/health', async (req, res) => {
  try {
    // Get all monitors to compute system health
    const monitors = await kumaClient.getMonitors();
    const serverInfo = await kumaClient.getServerInfo();

    // Calculate system statistics
    const totalMonitors = monitors.length;
    const upMonitors = monitors.filter((m) => m.active).length;
    const downMonitors = totalMonitors - upMonitors;

    // Get average response time from recent heartbeats
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    for (const monitor of monitors.slice(0, 10)) {
      // Sample first 10 for performance
      try {
        const heartbeats = await kumaClient.getHeartbeats(monitor.id, 5);
        const validResponseTimes = heartbeats.filter((h) => h.ping !== null);
        if (validResponseTimes.length > 0) {
          totalResponseTime += validResponseTimes.reduce((sum, h) => sum + h.ping, 0);
          responseTimeCount += validResponseTimes.length;
        }
      } catch {
        // Skip monitors that can't provide heartbeat data
        continue;
      }
    }

    const avgResponseTime =
      responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0;

    logAudit(req, 'uptime_kuma_health_view', {
      total_monitors: totalMonitors,
      up_monitors: upMonitors,
      down_monitors: downMonitors,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: {
        monitors,
        serverInfo,
        systemStats: {
          totalMonitors,
          upMonitors,
          downMonitors,
          avgResponseTime,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get system health from Uptime Kuma', {
      error: error.message,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system health',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/tags:
 *   get:
 *     summary: Get all tags from Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tags', async (req, res) => {
  try {
    // This would require implementing tag management in the Uptime Kuma client
    // For now, return empty array as tags are handled per-monitor
    const tags = [];

    logAudit(req, 'uptime_kuma_tags_view', {
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: tags,
      count: tags.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get tags from Uptime Kuma', {
      error: error.message,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tags',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/notifications:
 *   get:
 *     summary: Get all notification providers from Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/notifications', async (req, res) => {
  try {
    // This would require implementing notification management in the Uptime Kuma client
    // For now, return empty array as this requires Socket.IO authentication
    const notifications = [];

    logAudit(req, 'uptime_kuma_notifications_view', {
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get notifications from Uptime Kuma', {
      error: error.message,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notifications',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/status-pages:
 *   get:
 *     summary: Get all status pages from Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/status-pages', async (req, res) => {
  try {
    // This would require implementing status page management in the Uptime Kuma client
    // For now, return empty array as this requires Socket.IO authentication
    const statusPages = [];

    logAudit(req, 'uptime_kuma_status_pages_view', {
      user_id: req.user.id,
    });

    res.json({
      success: true,
      data: statusPages,
      count: statusPages.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get status pages from Uptime Kuma', {
      error: error.message,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve status pages',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/uptime-kuma/ping:
 *   get:
 *     summary: Test connection to Uptime Kuma backend
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/ping', async (req, res) => {
  try {
    const isConnected = await kumaClient.ping();

    logAudit(req, 'uptime_kuma_ping', {
      connected: isConnected,
      user_id: req.user.id,
    });

    res.json({
      success: true,
      connected: isConnected,
      message: isConnected
        ? 'Uptime Kuma backend is reachable'
        : 'Uptime Kuma backend is not reachable',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to ping Uptime Kuma backend', {
      error: error.message,
      user_id: req.user.id,
    });
    res.status(500).json({
      success: false,
      connected: false,
      error: 'Failed to ping Uptime Kuma backend',
      message: error.message,
    });
  }
});

export default router;
