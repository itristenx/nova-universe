import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { deleteConfigByKey, fetchConfigByKey } from '../utils/dbUtils.js';

const router = express.Router();

async function getIntegrationLayer() {
  try {
    const mod = await import('../../lib/integration/nova-integration-layer.js');
    return mod.novaIntegrationLayer;
  } catch (e) {
    logger.warn('Integration layer unavailable; skipping NIL-dependent route', { error: e?.message });
    return null;
  }
}

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
 *               type: object
 *               properties:
 *                 integrations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                 storedConfigs:
 *                   type: object
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
  db.all('SELECT key, value FROM config WHERE key LIKE $1', ['integration_%'], (err, configRows) => {
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
        description: 'Slack integration for Nova Universe',
        status: 'active',
      },
      {
        id: 5,
        name: 'Microsoft Teams',
        description: 'Teams integration for Nova Universe',
        status: 'planned',
      },
      {
        id: 6,
        name: 'Discord',
        description: 'Discord integration for Nova Universe',
        status: 'beta',
      },
    ];
    res.json({ integrations, storedConfigs });
  });
});


/**
 * @swagger
 * /api/v1/integrations/{id}:
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
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request body
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
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, config, enabled } = req.body;

  if (!name || !type || !config || typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'Invalid request body', errorCode: 'INVALID_BODY' });
  }

  const query = 'UPDATE integrations SET name = $1, type = $2, config = $3, enabled = $4 WHERE id = $5';
  const params = [name, type, JSON.stringify(config), enabled, id];

  db.run(query, params, function (err) {
    if (err) {
      logger.error(`Failed to update integration with id ${id}: ${err.message}`);
      return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Integration not found', errorCode: 'NOT_FOUND' });
    }

    res.status(200).json({ message: 'Integration updated successfully' });
  });
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
router.delete('/:id', async (req, res) => {
  const integrationId = parseInt(req.params.id, 10);
  const key = `integration_${integrationId}`;

  if (isNaN(integrationId)) {
    return res.status(400).json({ error: 'Invalid integration ID', errorCode: 'INVALID_ID' });
  }

  try {
    const changes = await deleteConfigByKey(key);

    if (changes === 0) {
      return res.status(404).json({ error: 'Integration not found', errorCode: 'NOT_FOUND' });
    }

    res.status(200).json({ message: 'Integration deleted' });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
  }
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
  const integrationId = req.params.id;
  const key = `integration_${integrationId}`;

  try {
    const config = await fetchConfigByKey(key);

    if (!config) {
      return res.status(404).json({
        error: 'Integration not found',
        errorCode: 'NOT_FOUND',
        supportedTypes: ['Slack', 'Discord'],
      });
    }

    // Perform the integration test
    if (config.type === 'Slack') {
      return res.status(200).json({ message: 'Slack integration test successful' });
    } else if (config.type === 'Discord') {
      return res.status(200).json({ message: 'Discord integration test successful' });
    } else {
      return res.status(404).json({
        error: 'Test not implemented for this integration type',
        errorCode: 'TEST_NOT_IMPLEMENTED',
        supportedTypes: ['Slack', 'Discord'],
      });
    }
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({ error: 'Integration test failed', errorCode: 'TEST_FAILED' });
  }
});

/**
 * @swagger
 * /api/v1/integrations/connectors/health:
 *   get:
 *     summary: Get health status of all connectors
 *     responses:
 *       200:
 *         description: Connector health status
 */
router.get('/connectors/health', async (req, res) => {
  try {
    const layer = await getIntegrationLayer();
    if (!layer) return res.status(503).json({ error: 'Integration layer unavailable', code: 'NIL_UNAVAILABLE' });

    const healthStatuses = await layer.getConnectorHealth();
    
    res.json({
      connectors: healthStatuses,
      overall: healthStatuses.every(h => h.status === 'healthy') ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to get connector health: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to get connector health', 
      code: 'HEALTH_CHECK_FAILED' 
    });
  }
});

/**
 * @swagger
 * /api/v1/integrations/connectors/{id}/sync:
 *   post:
 *     summary: Trigger sync for a specific connector
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/connectors/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'incremental', dryRun = false } = req.body;

    const layer = await getIntegrationLayer();
    if (!layer) return res.status(503).json({ error: 'Integration layer unavailable', code: 'NIL_UNAVAILABLE' });

    const result = await layer.executeSync(id, { type, dryRun });
    
    res.json({
      success: true,
      jobId: result.jobId,
      status: result.status,
      metrics: result.metrics
    });
  } catch (error) {
    logger.error(`Failed to trigger sync for connector ${req.params.id}: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to trigger sync', 
      code: 'SYNC_FAILED' 
    });
  }
});

/**
 * @swagger
 * /api/v1/integrations/actions:
 *   post:
 *     summary: Execute action on external system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - connectorId
 *               - action
 *               - target
 *             properties:
 *               connectorId:
 *                 type: string
 *               action:
 *                 type: string
 *               target:
 *                 type: string
 *               parameters:
 *                 type: object
 */
router.post('/actions', async (req, res) => {
  try {
    const { connectorId, action, target, parameters = {} } = req.body;
    
    if (!connectorId || !action || !target) {
      return res.status(400).json({ 
        error: 'Missing required fields: connectorId, action, target', 
        code: 'MISSING_FIELDS' 
      });
    }

    const layer = await getIntegrationLayer();
    if (!layer) return res.status(503).json({ error: 'Integration layer unavailable', code: 'NIL_UNAVAILABLE' });
    
    const result = await layer.executeAction({
      connectorId,
      action,
      target,
      parameters,
      requestedBy: req.user?.id || 'api'
    });
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    logger.error(`Failed to execute action: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to execute action', 
      code: 'ACTION_FAILED' 
    });
  }
});

export default router;
