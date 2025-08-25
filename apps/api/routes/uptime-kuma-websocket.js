// Nova WebSocket Routes - Uptime Kuma Real-time Events
// Provides WebSocket endpoints for real-time monitoring data

import express from 'express';
import { logger } from '../logger.js';
import { getUptimeKumaWebSocketStatus } from '../websocket/uptime-kuma-handler.js';

const router = express.Router();

// WebSocket status endpoint for Uptime Kuma integration
router.get('/status', async (req, res) => {
  try {
    const status = getUptimeKumaWebSocketStatus();

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get Uptime Kuma WebSocket status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get WebSocket status',
      message: error.message,
    });
  }
});

// Health check for WebSocket connectivity
router.get('/health', async (req, res) => {
  try {
    const status = getUptimeKumaWebSocketStatus();

    const isHealthy = status.connected && status.kumaConnected;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      healthy: isHealthy,
      data: {
        connected: status.connected,
        kumaConnected: status.kumaConnected,
        clientCount: status.clientCount,
        reconnectAttempts: status.reconnectAttempts,
      },
      message: isHealthy ? 'WebSocket connection healthy' : 'WebSocket connection issues detected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to check Uptime Kuma WebSocket health', { error: error.message });
    res.status(500).json({
      success: false,
      healthy: false,
      error: 'Failed to check WebSocket health',
      message: error.message,
    });
  }
});

export default router;
