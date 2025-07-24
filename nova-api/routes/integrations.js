import express from 'express';
import { logger } from '../logger.js';
import db from '../db.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/integrations:
 *   get:
 *     summary: Get all integration configurations
 *     responses:
 *       200:
 *         description: List of integrations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
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
router.get('/', (req, res) => {
  // Get stored integration configs from database

  db.all('SELECT key, value FROM config WHERE key LIKE "integration_%"', [], (err, configRows) => {
    if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
    // Parse stored configs if needed
    const storedConfigs = {};
    for (const row of configRows) {
      try {
        storedConfigs[row.key.replace('integration_', '')] = JSON.parse(row.value);
      } catch {
        storedConfigs[row.key.replace('integration_', '')] = {};
      }
    }
    const integrations = [
      {
        id: 4,
        name: 'Slack',
        type: 'slack',
        enabled: storedConfigs.slack?.enabled ?? Boolean(process.env.SLACK_WEBHOOK_URL),
        working: process.env.SLACK_WEBHOOK_URL ? true : false,
        config: storedConfigs.slack?.config || {
          webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
          channel: process.env.SLACK_CHANNEL || '#general',
          username: process.env.SLACK_USERNAME || 'CueIT Bot'
        }
      },
      {
        id: 5,
        name: 'Microsoft Teams',
        type: 'teams',
        enabled: storedConfigs.teams?.enabled ?? Boolean(process.env.TEAMS_WEBHOOK_URL),
        working: process.env.TEAMS_WEBHOOK_URL ? true : false,
        config: storedConfigs.teams?.config || {
          webhookUrl: process.env.TEAMS_WEBHOOK_URL || ''
        }
      },
      {
        id: 6,
        name: 'Generic Webhook',
        type: 'webhook',
        enabled: storedConfigs.webhook?.enabled ?? Boolean(process.env.WEBHOOK_URL),
        working: process.env.WEBHOOK_URL ? true : false,
        config: storedConfigs.webhook?.config || {
          url: process.env.WEBHOOK_URL || '',
          method: process.env.WEBHOOK_METHOD || 'POST',
          contentType: process.env.WEBHOOK_CONTENT_TYPE || 'application/json'
        }
      }
    ];
    res.json(integrations);
  });
});


/**
 * @swagger
 * /api/integrations/{id}:
 *   put:
 *     summary: Update an integration configuration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Integration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               config:
 *                 type: object
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Integration updated
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
router.put('/:id', (req, res) => {
  // ...existing code...
});


/**
 * @swagger
 * /api/integrations/{id}:
 *   delete:
 *     summary: Delete an integration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Integration ID
 *     responses:
 *       200:
 *         description: Integration deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Integration not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
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
router.delete('/:id', (req, res) => {
  // ...existing code...
});


/**
 * @swagger
 * /api/integrations/{id}/test:
 *   post:
 *     summary: Test an integration connection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Integration ID
 *     responses:
 *       200:
 *         description: Integration test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing or invalid integration configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 *       404:
 *         description: Integration not found or test not implemented
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 *                 supportedTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Integration test failed
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

router.post('/:id/test', async (req, res, next) => {
  // ...existing code...
});

export default router;
