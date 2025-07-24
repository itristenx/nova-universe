import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Platform-level server info endpoint
/**
 * @swagger
 * /api/v1/server-info:
 *   get:
 *     summary: Get platform-level server information
 *     responses:
 *       200:
 *         description: Server information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiName:
 *                   type: string
 *                 apiVersion:
 *                   type: string
 *                 nodeVersion:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 uptime:
 *                   type: string
 *                 uptimeSeconds:
 *                   type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/server-info', (req, res) => {
  const uptime = Math.floor(process.uptime());
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  res.json({
    apiName: 'Nova Platform API',
    apiVersion: '2.0.0',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    uptimeSeconds: uptime,
    timestamp: new Date().toISOString(),
  });
});

export default router;
