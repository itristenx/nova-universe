// WebSocket API endpoints
import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/v1/websocket/stats:
 *   get:
 *     summary: Get WebSocket connection statistics
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: WebSocket connection statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalConnections:
 *                   type: integer
 *                 authenticatedUsers:
 *                   type: integer
 *                 timestamp:
 *                   type: string
 */
router.get('/stats', (req, res) => {
  if (req.app.wsManager) {
    const stats = req.app.wsManager.getConnectionStats();
    res.json(stats);
  } else {
    res.status(503).json({ error: 'WebSocket service not available' });
  }
});

/**
 * @swagger
 * /api/v1/websocket/broadcast:
 *   post:
 *     summary: Broadcast a message to all connected clients
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Message type
 *               data:
 *                 type: object
 *                 description: Message data
 *               room:
 *                 type: string
 *                 description: Target room (optional)
 *     responses:
 *       200:
 *         description: Message broadcasted successfully
 */
router.post('/broadcast', (req, res) => {
  const { type, data, room } = req.body;
  
  if (!type || !data) {
    return res.status(400).json({ error: 'Type and data are required' });
  }

  if (req.app.wsManager) {
    const message = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    if (room) {
      req.app.wsManager.broadcastToRoom(room, message);
    } else {
      req.app.io.emit('admin_broadcast', message);
    }

    res.json({ success: true, message: 'Broadcast sent' });
  } else {
    res.status(503).json({ error: 'WebSocket service not available' });
  }
});

/**
 * @swagger
 * /api/v1/websocket/notify:
 *   post:
 *     summary: Send notification to specific user
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: Target user ID
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               level:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *                 description: Notification level
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
router.post('/notify', (req, res) => {
  const { userId, title, message, level = 'info' } = req.body;
  
  if (!userId || !title || !message) {
    return res.status(400).json({ error: 'userId, title, and message are required' });
  }

  if (req.app.wsManager) {
    req.app.wsManager.sendToUser(userId, {
      type: 'notification',
      data: {
        title,
        message,
        level,
        timestamp: new Date().toISOString()
      }
    });

    res.json({ success: true, message: 'Notification sent' });
  } else {
    res.status(503).json({ error: 'WebSocket service not available' });
  }
});

/**
 * @swagger
 * /api/v1/websocket/system-status:
 *   post:
 *     summary: Broadcast system status update
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [operational, maintenance, degraded, outage]
 *               message:
 *                 type: string
 *               services:
 *                 type: object
 *     responses:
 *       200:
 *         description: System status broadcasted successfully
 */
router.post('/system-status', (req, res) => {
  const { status, message, services } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  if (req.app.wsManager) {
    req.app.wsManager.broadcastSystemStatus({
      status,
      message,
      services,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'System status broadcasted' });
  } else {
    res.status(503).json({ error: 'WebSocket service not available' });
  }
});

export default router;
