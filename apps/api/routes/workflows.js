import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';

const router = express.Router();
const runs = [];

// In-memory workflow templates for demo purposes - replace with database
const workflowTemplates = [
  {
    id: 'template_incident_response',
    name: 'Incident Response Workflow',
    description: 'Automated incident handling and escalation process',
    category: 'INCIDENT',
    nodes: [
      { id: 'start', type: 'TRIGGER', name: 'Incident Created', position: { x: 100, y: 100 } },
      { id: 'classify', type: 'ACTION', name: 'Auto-Classify Priority', position: { x: 300, y: 100 } },
      { id: 'assign', type: 'ACTION', name: 'Auto-Assign to Team', position: { x: 500, y: 100 } },
      { id: 'notify', type: 'NOTIFICATION', name: 'Notify Stakeholders', position: { x: 700, y: 100 } },
      { id: 'escalate_check', type: 'CONDITION', name: 'Check SLA Breach', position: { x: 500, y: 300 } },
      { id: 'escalate', type: 'ACTION', name: 'Escalate to Manager', position: { x: 700, y: 300 } },
      { id: 'end', type: 'END', name: 'Complete', position: { x: 900, y: 200 } }
    ],
    connections: [
      { from: 'start', to: 'classify' },
      { from: 'classify', to: 'assign' },
      { from: 'assign', to: 'notify' },
      { from: 'notify', to: 'escalate_check' },
      { from: 'escalate_check', to: 'escalate', condition: 'sla_breached' },
      { from: 'escalate_check', to: 'end', condition: 'sla_ok' },
      { from: 'escalate', to: 'end' }
    ]
  },
  {
    id: 'template_change_approval',
    name: 'Change Approval Workflow',
    description: 'Multi-level change approval process',
    category: 'APPROVAL',
    nodes: [
      { id: 'start', type: 'TRIGGER', name: 'Change Request Submitted', position: { x: 100, y: 100 } },
      { id: 'risk_assess', type: 'ACTION', name: 'Risk Assessment', position: { x: 300, y: 100 } },
      { id: 'manager_approval', type: 'APPROVAL', name: 'Manager Approval', position: { x: 500, y: 100 } },
      { id: 'cab_approval', type: 'APPROVAL', name: 'CAB Approval', position: { x: 700, y: 100 } },
      { id: 'schedule', type: 'ACTION', name: 'Schedule Change', position: { x: 900, y: 100 } },
      { id: 'end', type: 'END', name: 'Approved', position: { x: 1100, y: 100 } }
    ],
    connections: [
      { from: 'start', to: 'risk_assess' },
      { from: 'risk_assess', to: 'manager_approval' },
      { from: 'manager_approval', to: 'cab_approval' },
      { from: 'cab_approval', to: 'schedule' },
      { from: 'schedule', to: 'end' }
    ]
  },
  {
    id: 'template_user_provisioning',
    name: 'User Provisioning Workflow',
    description: 'Automated user account and access provisioning',
    category: 'AUTOMATION',
    nodes: [
      { id: 'start', type: 'TRIGGER', name: 'New User Request', position: { x: 100, y: 100 } },
      { id: 'validate', type: 'VALIDATION', name: 'Validate Request', position: { x: 300, y: 100 } },
      { id: 'hr_approval', type: 'APPROVAL', name: 'HR Approval', position: { x: 500, y: 100 } },
      { id: 'create_accounts', type: 'INTEGRATION', name: 'Create AD Account', position: { x: 700, y: 100 } },
      { id: 'assign_access', type: 'INTEGRATION', name: 'Assign Role-Based Access', position: { x: 900, y: 100 } },
      { id: 'notify_manager', type: 'NOTIFICATION', name: 'Notify Manager', position: { x: 1100, y: 100 } },
      { id: 'end', type: 'END', name: 'Complete', position: { x: 1300, y: 100 } }
    ],
    connections: [
      { from: 'start', to: 'validate' },
      { from: 'validate', to: 'hr_approval' },
      { from: 'hr_approval', to: 'create_accounts' },
      { from: 'create_accounts', to: 'assign_access' },
      { from: 'assign_access', to: 'notify_manager' },
      { from: 'notify_manager', to: 'end' }
    ]
  }
];

export function triggerWorkflow(workflow) {
  const id = runs.length + 1;
  const record = { id, workflow, status: 'queued', triggeredAt: new Date().toISOString() };
  runs.push(record);
  return record;
}

// ================ WORKFLOW MANAGEMENT ================

// Get all workflows
router.get('/', authenticateJWT, checkPermission('workflows:read'), async (req, res) => {
  try {
    const { status, type, category } = req.query;
    
    // TODO: Replace with database-backed workflows
    let workflows = [
      {
        id: 'wf_incident_mgmt',
        name: 'Incident Management',
        description: 'Automated incident handling and escalation',
        type: 'PROCESS',
        category: 'INCIDENT',
        status: 'ACTIVE',
        version: '1.2.0',
        created_by: 'admin',
        created_at: new Date().toISOString(),
        last_executed: new Date(Date.now() - 3600000).toISOString(),
        execution_count: 156,
        success_rate: 94.5
      },
      {
        id: 'wf_change_approval',
        name: 'Change Approval Process',
        description: 'Multi-level change approval workflow',
        type: 'APPROVAL',
        category: 'CHANGE',
        status: 'ACTIVE',
        version: '2.1.0',
        created_by: 'admin',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        last_executed: new Date(Date.now() - 1800000).toISOString(),
        execution_count: 89,
        success_rate: 98.9
      },
      {
        id: 'wf_user_provisioning',
        name: 'User Provisioning',
        description: 'Automated user account and access management',
        type: 'AUTOMATION',
        category: 'IAM',
        status: 'ACTIVE',
        version: '1.0.0',
        created_by: 'admin',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        last_executed: new Date(Date.now() - 900000).toISOString(),
        execution_count: 234,
        success_rate: 96.2
      }
    ];

    // Apply filters
    if (status) workflows = workflows.filter(w => w.status === status.toUpperCase());
    if (type) workflows = workflows.filter(w => w.type === type.toUpperCase());
    if (category) workflows = workflows.filter(w => w.category === category.toUpperCase());

    res.json([]);
  } catch (err) {
    logger.error('Error fetching workflows:', err);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Get workflow templates
router.get('/templates', authenticateJWT, checkPermission('workflows:read'), (req, res) => {
  res.json(workflowTemplates);
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

// Get single workflow
router.get('/:id', authenticateJWT, checkPermission('workflows:read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock detailed workflow data - replace with database query
    const workflow = {
      id,
      name: 'Incident Management Workflow',
      description: 'Comprehensive incident handling process with automatic escalation',
      type: 'PROCESS',
      category: 'INCIDENT',
      status: 'ACTIVE',
      version: '1.2.0',
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      nodes: [
        {
          id: 'start',
          type: 'TRIGGER',
          name: 'Incident Created',
          description: 'Automatically triggered when new incident is created',
          position: { x: 100, y: 100 },
          config: {
            trigger_events: ['incident.created'],
            filters: { priority: ['high', 'critical'] }
          }
        },
        {
          id: 'classify',
          type: 'ACTION',
          name: 'Auto-Classify',
          description: 'Automatically classify incident based on AI analysis',
          position: { x: 300, y: 100 },
          config: {
            ai_enabled: true,
            classification_rules: ['keyword_matching', 'ml_prediction']
          }
        },
        {
          id: 'assign',
          type: 'ACTION',
          name: 'Smart Assignment',
          description: 'Assign to best available technician',
          position: { x: 500, y: 100 },
          config: {
            assignment_strategy: 'skill_based',
            load_balancing: true
          }
        }
      ],
      connections: [
        { from: 'start', to: 'classify', conditions: {} },
        { from: 'classify', to: 'assign', conditions: {} }
      ],
      metrics: {
        total_executions: 156,
        successful_executions: 147,
        failed_executions: 9,
        avg_execution_time: 245.6,
        success_rate: 94.2
      }
    };

    res.json(workflow);
  } catch (err) {
    logger.error('Error fetching workflow:', err);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

// Create workflow
router.post('/', authenticateJWT, checkPermission('workflows:write'), async (req, res) => {
  try {
    const { name, description, type, category, nodes = [], connections = [] } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    // Mock workflow creation - replace with database insert
    const newWorkflow = {
      id: `wf_${Date.now()}`,
      name,
      description: description || '',
      type: type.toUpperCase(),
      category: category?.toUpperCase() || 'GENERAL',
      status: 'DRAFT',
      version: '1.0.0',
      created_by: req.user?.id || 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      nodes,
      connections,
      metrics: {
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        avg_execution_time: 0,
        success_rate: 0
      }
    };

    res.status(201).json(newWorkflow);
  } catch (err) {
    logger.error('Error creating workflow:', err);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Update workflow
router.put('/:id', authenticateJWT, checkPermission('workflows:write'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, nodes, connections, status } = req.body;

    // Mock workflow update - replace with database update
    const updatedWorkflow = {
      id,
      name: name || 'Updated Workflow',
      description: description || '',
      nodes: nodes || [],
      connections: connections || [],
      status: status || 'DRAFT',
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id || 'admin'
    };

    res.json(updatedWorkflow);
  } catch (err) {
    logger.error('Error updating workflow:', err);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

// Publish workflow
router.post('/:id/publish', authenticateJWT, checkPermission('workflows:write'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock workflow publish - replace with database update
    const publishedWorkflow = {
      id,
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
      published_by: req.user?.id || 'admin',
      version: '1.0.0'
    };

    res.json({ message: 'Workflow published successfully', workflow: publishedWorkflow });
  } catch (err) {
    logger.error('Error publishing workflow:', err);
    res.status(500).json({ error: 'Failed to publish workflow' });
  }
});

// Execute workflow
router.post('/:id/execute', authenticateJWT, checkPermission('workflows:execute'), async (req, res) => {
  try {
    const { id } = req.params;
    const { input_data = {}, context = {} } = req.body;

    // Mock workflow execution - replace with actual execution engine
    const execution = {
      execution_id: `exec_${Date.now()}`,
      workflow_id: id,
      status: 'RUNNING',
      started_at: new Date().toISOString(),
      input_data,
      context,
      current_step: 'start',
      progress: 0
    };

    // Simulate async execution
    setTimeout(() => {
      execution.status = 'COMPLETED';
      execution.completed_at = new Date().toISOString();
      execution.progress = 100;
    }, 2000);

    res.json(execution);
  } catch (err) {
    logger.error('Error executing workflow:', err);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

// Get workflow executions
router.get('/:id/executions', authenticateJWT, checkPermission('workflows:read'), async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0, status } = req.query;

    // Mock execution history - replace with database query
    let executions = [
      {
        execution_id: 'exec_001',
        workflow_id: id,
        status: 'COMPLETED',
        started_at: new Date(Date.now() - 3600000).toISOString(),
        completed_at: new Date(Date.now() - 3300000).toISOString(),
        duration: 300000,
        triggered_by: 'system',
        result: 'success'
      },
      {
        execution_id: 'exec_002',
        workflow_id: id,
        status: 'FAILED',
        started_at: new Date(Date.now() - 7200000).toISOString(),
        failed_at: new Date(Date.now() - 7020000).toISOString(),
        duration: 180000,
        triggered_by: 'user_123',
        error: 'Connection timeout'
      }
    ];

    if (status) {
      executions = executions.filter(e => e.status === status.toUpperCase());
    }

    const total = executions.length;
    const paginatedExecutions = executions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      executions: paginatedExecutions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (err) {
    logger.error('Error fetching workflow executions:', err);
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

// Get workflow analytics
router.get('/:id/analytics', authenticateJWT, checkPermission('workflows:read'), async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    // Mock analytics data - replace with database aggregation
    const analytics = {
      workflow_id: id,
      period,
      metrics: {
        total_executions: 156,
        successful_executions: 147,
        failed_executions: 9,
        avg_execution_time: 245.6,
        success_rate: 94.2,
        performance_trend: [
          { date: '2024-01-01', executions: 12, avg_time: 230.1, success_rate: 91.7 },
          { date: '2024-01-02', executions: 15, avg_time: 245.3, success_rate: 93.3 },
          { date: '2024-01-03', executions: 18, avg_time: 251.8, success_rate: 94.4 }
        ]
      },
      bottlenecks: [
        { node_id: 'classify', avg_time: 120.5, percentage: 48.9 },
        { node_id: 'assign', avg_time: 95.2, percentage: 38.7 }
      ],
      common_failures: [
        { error_type: 'timeout', count: 5, percentage: 55.6 },
        { error_type: 'validation_failed', count: 3, percentage: 33.3 },
        { error_type: 'external_api_error', count: 1, percentage: 11.1 }
      ]
    };

    res.json(analytics);
  } catch (err) {
    logger.error('Error fetching workflow analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

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

export function resetWorkflowRuns() {
  runs.length = 0;
}

export default router;
