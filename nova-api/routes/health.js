import express from 'express';
import { DatabaseFactory } from '../../database/factory.js';
import { logger } from '../logger.js';

const router = express.Router();

// Initialize the shared database factory instance lazily
let dbFactory = null;
async function getDbFactory() {
  if (dbFactory) return dbFactory;
  dbFactory = new DatabaseFactory();
  try {
    await dbFactory.initialize();
  } catch (error) {
    logger.error('Failed to initialize DatabaseFactory for health endpoint:', error);
  }
  return dbFactory;
}

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Platform health check
 *     description: Returns application uptime and database connection health for PostgreSQL and MongoDB.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 databases:
 *                   type: object
 *                   properties:
 *                     postgresql:
 *                       type: object
 *                     mongodb:
 *                       type: object
 */
router.get('/', async (req, res) => {
  try {
    const factory = await getDbFactory();
    const dbHealth = factory ? await factory.healthCheck() : {};

    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databases: dbHealth
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

export default router;