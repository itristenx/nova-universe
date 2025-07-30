import express from 'express';

const router = express.Router();
const runs = [];

export function triggerWorkflow(workflow) {
  const id = runs.length + 1;
  const record = { id, workflow, status: 'queued', triggeredAt: new Date().toISOString() };
  runs.push(record);
  return record;
}

/**
 * @swagger
 * /api/workflows/trigger:
 *   post:
 *     summary: Trigger a workflow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workflow:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workflow triggered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 runId:
 *                   type: integer
 *                 status:
 *                   type: string
 *       400:
 *         description: Missing workflow id
 */
router.post('/trigger', (req, res) => {
  const { workflow } = req.body || {};
  if (!workflow) {
    return res.status(400).json({ error: 'Missing workflow' });
  }
  const record = triggerWorkflow(workflow);
  res.json({ runId: record.id, status: record.status });
});

/**
 * @swagger
 * /api/workflows/status:
 *   get:
 *     summary: Get workflow status
 *     responses:
 *       200:
 *         description: List of workflow runs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   workflow:
 *                     type: string
 *                   status:
 *                     type: string
 *                   triggeredAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/status', (req, res) => {
  res.json(runs);
});

export function resetWorkflowRuns() {
  runs.length = 0;
}

export default router;
