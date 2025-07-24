import express from 'express';
import db from '../db.js';

const router = express.Router();


/**
 * @swagger
 * /api/v1/organizations/config:
 *   get:
 *     summary: Get organization/tenant configuration
 *     responses:
 *       200:
 *         description: Organization config object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.get('/config', (req, res) => {
  db.all(`SELECT key, value FROM config`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
    const config = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    // Parse known JSON fields
    if (config.integration_smtp) {
      try { config.integration_smtp = JSON.parse(config.integration_smtp); } catch {}
    }

    // Parse numeric fields
    if (config.minPinLength) config.minPinLength = parseInt(config.minPinLength);
    if (config.maxPinLength) config.maxPinLength = parseInt(config.maxPinLength);

    res.json(config);
  });
});

export default router;

