// Nova API - Embedded Uptime Kuma Proxy Routes
// Provides seamless integration between Nova UI and Uptime Kuma backend

import express from 'express';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { UptimeKumaClient } from '../lib/uptime-kuma.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateJWT);

// Initialize Uptime Kuma client
const kumaClient = new UptimeKumaClient(
  process.env.UPTIME_KUMA_URL || 'http://nova-uptime-kuma-backend:3001',
  process.env.UPTIME_KUMA_API_KEY
);

/**
 * @swagger
 * /api/v1/uptime-kuma/monitors:
 *   get:
 *     summary: Get all monitors from Uptime Kuma
 *     description: Retrieves all monitoring targets configured in Uptime Kuma
 *     tags: [Uptime Kuma Integration]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monitors', async (req, res) => {
  try {
    const monitors = await kumaClient.getMonitors();
    
    logAudit(req, 'uptime_kuma_monitors_view', {
      count: monitors.length,
      user_id: req.user.id
    });

    res.json({
      success: true,
      data: monitors,
      count: monitors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get monitors from Uptime Kuma', { 
      error: error.message,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve monitors',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      data: monitor,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get monitor from Uptime Kuma', { 
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id 
    });
    res.status(404).json({ 
      success: false,
      error: 'Monitor not found',
      message: error.message 
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
        error: 'Missing required fields: name and type are required'
      });
    }

    const monitor = await kumaClient.createMonitor(monitorData);
    
    logAudit(req, 'uptime_kuma_monitor_create', {
      monitor_id: monitor.id,
      monitor_name: monitor.name,
      monitor_type: monitor.type,
      user_id: req.user.id
    });

    res.status(201).json({
      success: true,
      data: monitor,
      message: 'Monitor created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to create monitor in Uptime Kuma', { 
      error: error.message,
      monitor_data: req.body,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to create monitor',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      data: monitor,
      message: 'Monitor updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to update monitor in Uptime Kuma', { 
      error: error.message,
      monitor_id: req.params.id,
      updates: req.body,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to update monitor',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      message: 'Monitor deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to delete monitor from Uptime Kuma', { 
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete monitor',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      message: 'Monitor paused successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to pause monitor in Uptime Kuma', { 
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to pause monitor',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      message: 'Monitor resumed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to resume monitor in Uptime Kuma', { 
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to resume monitor',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      data: status.heartbeat,
      message: 'Monitor tested successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to test monitor in Uptime Kuma', { 
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to test monitor',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      data: heartbeats,
      count: heartbeats.length,
      period,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get heartbeats from Uptime Kuma', { 
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve heartbeats',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      data: uptimeStats,
      period,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get uptime stats from Uptime Kuma', { 
      error: error.message,
      monitor_id: req.params.id,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve uptime statistics',
      message: error.message 
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
    const upMonitors = monitors.filter(m => m.active).length;
    const downMonitors = totalMonitors - upMonitors;
    
    // Get average response time from recent heartbeats
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    
    for (const monitor of monitors.slice(0, 10)) { // Sample first 10 for performance
      try {
        const heartbeats = await kumaClient.getHeartbeats(monitor.id, 5);
        const validResponseTimes = heartbeats.filter(h => h.ping !== null);
        if (validResponseTimes.length > 0) {
          totalResponseTime += validResponseTimes.reduce((sum, h) => sum + h.ping, 0);
          responseTimeCount += validResponseTimes.length;
        }
      } catch {
        // Skip monitors that can't provide heartbeat data
        continue;
      }
    }
    
    const avgResponseTime = responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0;
    
    logAudit(req, 'uptime_kuma_health_view', {
      total_monitors: totalMonitors,
      up_monitors: upMonitors,
      down_monitors: downMonitors,
      user_id: req.user.id
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
          avgResponseTime
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get system health from Uptime Kuma', { 
      error: error.message,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve system health',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      data: tags,
      count: tags.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get tags from Uptime Kuma', { 
      error: error.message,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve tags',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get notifications from Uptime Kuma', { 
      error: error.message,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve notifications',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      data: statusPages,
      count: statusPages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get status pages from Uptime Kuma', { 
      error: error.message,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve status pages',
      message: error.message 
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
      user_id: req.user.id
    });

    res.json({
      success: true,
      connected: isConnected,
      message: isConnected ? 'Uptime Kuma backend is reachable' : 'Uptime Kuma backend is not reachable',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to ping Uptime Kuma backend', { 
      error: error.message,
      user_id: req.user.id 
    });
    res.status(500).json({ 
      success: false,
      connected: false,
      error: 'Failed to ping Uptime Kuma backend',
      message: error.message 
    });
  }
});

export default router;
