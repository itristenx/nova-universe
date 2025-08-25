import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import NovaEnterprisePlatform from '../lib/enterprise-platform.js';

const router = express.Router();
const enterprisePlatform = new NovaEnterprisePlatform();

// Middleware for validation error handling
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// Middleware for error handling
const handleAsyncErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// =============================================================================
// ENTERPRISE ASSET MANAGEMENT (EAM) ENDPOINTS
// =============================================================================

// Create new asset
router.post(
  '/assets',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category_id').notEmpty().withMessage('Category ID is required'),
    body('created_by_id').notEmpty().withMessage('Creator ID is required'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const asset = await enterprisePlatform.createAsset(req.body);
    res.status(201).json({
      success: true,
      data: asset,
      message: 'Asset created successfully',
    });
  }),
);

// Get asset by ID
router.get(
  '/assets/:id',
  [param('id').isUUID().withMessage('Invalid asset ID')],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const asset = await enterprisePlatform.prisma.asset.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        owner: true,
        assigned_to: true,
        created_by: true,
        maintenance_records: { orderBy: { created_at: 'desc' }, take: 10 },
        incidents: { where: { state: { not: 'CLOSED' } } },
        configuration_items: true,
      },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.json({
      success: true,
      data: asset,
    });
  }),
);

// Update asset lifecycle
router.patch(
  '/assets/:id/lifecycle',
  [
    param('id').isUUID().withMessage('Invalid asset ID'),
    body('lifecycle_stage')
      .isIn(['PLANNING', 'PROCUREMENT', 'DEPLOYMENT', 'OPERATIONAL', 'MAINTENANCE', 'DISPOSAL'])
      .withMessage('Invalid lifecycle stage'),
    body('notes').optional().isString(),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const asset = await enterprisePlatform.updateAssetLifecycle(
      req.params.id,
      req.body.lifecycle_stage,
      req.body.notes,
    );
    res.json({
      success: true,
      data: asset,
      message: 'Asset lifecycle updated successfully',
    });
  }),
);

// Get asset dashboard
router.get(
  '/assets/dashboard',
  handleAsyncErrors(async (req, res) => {
    const filters = {};
    if (req.query.category) filters.where = { category_id: req.query.category };
    if (req.query.department)
      filters.where = { ...filters.where, department: req.query.department };

    const dashboard = await enterprisePlatform.getAssetDashboard(filters);
    res.json({
      success: true,
      data: dashboard,
    });
  }),
);

// Calculate asset risk score
router.post(
  '/assets/:id/calculate-risk',
  [param('id').isUUID().withMessage('Invalid asset ID')],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const riskScore = await enterprisePlatform.calculateAssetRiskScore(req.params.id);
    res.json({
      success: true,
      data: { risk_score: riskScore },
      message: 'Asset risk score calculated successfully',
    });
  }),
);

// =============================================================================
// SERVICE OPERATIONS WORKSPACE (SOW) ENDPOINTS
// =============================================================================

// Create incident
router.post(
  '/incidents',
  [
    body('short_description').notEmpty().withMessage('Short description is required'),
    body('caller_id').notEmpty().withMessage('Caller ID is required'),
    body('urgency').isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid urgency'),
    body('impact').isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid impact'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const incident = await enterprisePlatform.createIncident(req.body);
    res.status(201).json({
      success: true,
      data: incident,
      message: 'Incident created successfully',
    });
  }),
);

// Update incident state
router.patch(
  '/incidents/:id/state',
  [
    param('id').isUUID().withMessage('Invalid incident ID'),
    body('state')
      .isIn(['NEW', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED'])
      .withMessage('Invalid state'),
    body('resolution_code').optional().isString(),
    body('resolution_notes').optional().isString(),
    body('root_cause').optional().isString(),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const { state, ...resolutionData } = req.body;
    const incident = await enterprisePlatform.updateIncidentState(
      req.params.id,
      state,
      resolutionData,
    );
    res.json({
      success: true,
      data: incident,
      message: 'Incident state updated successfully',
    });
  }),
);

// Create service request
router.post(
  '/service-requests',
  [
    body('short_description').notEmpty().withMessage('Short description is required'),
    body('requested_by_id').notEmpty().withMessage('Requestor ID is required'),
    body('urgency').isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid urgency'),
    body('impact').isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid impact'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const serviceRequest = await enterprisePlatform.createServiceRequest(req.body);
    res.status(201).json({
      success: true,
      data: serviceRequest,
      message: 'Service request created successfully',
    });
  }),
);

// Create change request
router.post(
  '/changes',
  [
    body('short_description').notEmpty().withMessage('Short description is required'),
    body('requested_by_id').notEmpty().withMessage('Requestor ID is required'),
    body('type').isIn(['STANDARD', 'NORMAL', 'EMERGENCY']).withMessage('Invalid change type'),
    body('risk').isIn(['HIGH', 'MODERATE', 'LOW']).withMessage('Invalid risk level'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const change = await enterprisePlatform.createChange(req.body);
    res.status(201).json({
      success: true,
      data: change,
      message: 'Change request created successfully',
    });
  }),
);

// Get service operations dashboard
router.get(
  '/service-operations/dashboard',
  handleAsyncErrors(async (req, res) => {
    const filters = {};
    if (req.query.assignment_group) filters.assignment_group = req.query.assignment_group;
    if (req.query.priority) filters.priority = req.query.priority;

    const dashboard = await enterprisePlatform.getServiceOperationsDashboard(filters);
    res.json({
      success: true,
      data: dashboard,
    });
  }),
);

// =============================================================================
// SECURITY OPERATIONS CENTER (SOC) ENDPOINTS
// =============================================================================

// Create security incident
router.post(
  '/security-incidents',
  [
    body('short_description').notEmpty().withMessage('Short description is required'),
    body('category')
      .isIn([
        'MALWARE',
        'PHISHING',
        'DATA_BREACH',
        'UNAUTHORIZED_ACCESS',
        'DDoS',
        'INSIDER_THREAT',
        'APT',
        'VULNERABILITY_EXPLOITATION',
        'OTHER',
      ])
      .withMessage('Invalid category'),
    body('severity')
      .isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'])
      .withMessage('Invalid severity'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const securityIncident = await enterprisePlatform.createSecurityIncident(req.body);
    res.status(201).json({
      success: true,
      data: securityIncident,
      message: 'Security incident created successfully',
    });
  }),
);

// Execute security playbook
router.post(
  '/security-incidents/:id/execute-playbook',
  [
    param('id').isUUID().withMessage('Invalid security incident ID'),
    body('playbook_id').isUUID().withMessage('Invalid playbook ID'),
    body('executed_by_id').isUUID().withMessage('Invalid executor ID'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const execution = await enterprisePlatform.executeSecurityPlaybook(
      req.body.playbook_id,
      req.params.id,
      req.body.executed_by_id,
    );
    res.json({
      success: true,
      data: execution,
      message: 'Security playbook executed successfully',
    });
  }),
);

// Create vulnerability
router.post(
  '/vulnerabilities',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('severity').isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid severity'),
    body('cvss_score')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('CVSS score must be between 0 and 10'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const vulnerability = await enterprisePlatform.createVulnerability(req.body);
    res.status(201).json({
      success: true,
      data: vulnerability,
      message: 'Vulnerability created successfully',
    });
  }),
);

// Get security operations dashboard
router.get(
  '/security-operations/dashboard',
  handleAsyncErrors(async (req, res) => {
    const filters = {};
    if (req.query.severity) filters.severity = req.query.severity;
    if (req.query.category) filters.category = req.query.category;

    const dashboard = await enterprisePlatform.getSecurityOperationsDashboard(filters);
    res.json({
      success: true,
      data: dashboard,
    });
  }),
);

// =============================================================================
// CONFIGURATION MANAGEMENT DATABASE (CMDB) ENDPOINTS
// =============================================================================

// Create configuration item
router.post(
  '/configuration-items',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('ci_class').notEmpty().withMessage('CI class is required'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const ci = await enterprisePlatform.createConfigurationItem(req.body);
    res.status(201).json({
      success: true,
      data: ci,
      message: 'Configuration item created successfully',
    });
  }),
);

// Create CI relationship
router.post(
  '/configuration-items/:upstreamId/relationships',
  [
    param('upstreamId').isUUID().withMessage('Invalid upstream CI ID'),
    body('downstream_ci_id').isUUID().withMessage('Invalid downstream CI ID'),
    body('relationship_type')
      .isIn([
        'DEPENDS_ON',
        'USED_BY',
        'RUNS_ON',
        'HOSTED_ON',
        'CONTAINS',
        'MEMBER_OF',
        'CONNECTS_TO',
        'MANAGES',
      ])
      .withMessage('Invalid relationship type'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const relationship = await enterprisePlatform.createCIRelationship(
      req.params.upstreamId,
      req.body.downstream_ci_id,
      req.body.relationship_type,
    );
    res.status(201).json({
      success: true,
      data: relationship,
      message: 'CI relationship created successfully',
    });
  }),
);

// Get CI impact analysis
router.get(
  '/configuration-items/:id/impact-analysis',
  [param('id').isUUID().withMessage('Invalid CI ID')],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const impactAnalysis = await enterprisePlatform.getCIImpactAnalysis(req.params.id);
    res.json({
      success: true,
      data: impactAnalysis,
    });
  }),
);

// =============================================================================
// EMPLOYEE CENTER & EXPERIENCE ENDPOINTS
// =============================================================================

// Create employee profile
router.post(
  '/employee-profiles',
  [body('user_id').isUUID().withMessage('Invalid user ID')],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const profile = await enterprisePlatform.createEmployeeProfile(req.body);
    res.status(201).json({
      success: true,
      data: profile,
      message: 'Employee profile created successfully',
    });
  }),
);

// Get employee center dashboard
router.get(
  '/employee-center/dashboard/:userId',
  [param('userId').isUUID().withMessage('Invalid user ID')],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const dashboard = await enterprisePlatform.getEmployeeCenterDashboard(req.params.userId);
    res.json({
      success: true,
      data: dashboard,
    });
  }),
);

// Create service offering
router.post(
  '/service-offerings',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('created_by_id').isUUID().withMessage('Invalid creator ID'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const offering = await enterprisePlatform.createServiceOffering(req.body);
    res.status(201).json({
      success: true,
      data: offering,
      message: 'Service offering created successfully',
    });
  }),
);

// =============================================================================
// WORKFLOW AUTOMATION ENDPOINTS
// =============================================================================

// Trigger workflow
router.post(
  '/workflows/trigger',
  [
    body('trigger_type').notEmpty().withMessage('Trigger type is required'),
    body('record_id').isUUID().withMessage('Invalid record ID'),
    body('record_table').notEmpty().withMessage('Record table is required'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const executions = await enterprisePlatform.triggerWorkflow(
      req.body.trigger_type,
      req.body.record_id,
      req.body.record_table,
      req.body.trigger_data || {},
    );
    res.json({
      success: true,
      data: executions,
      message: 'Workflows triggered successfully',
    });
  }),
);

// Execute specific workflow
router.post(
  '/workflows/:id/execute',
  [
    param('id').isUUID().withMessage('Invalid workflow ID'),
    body('record_id').isUUID().withMessage('Invalid record ID'),
    body('record_table').notEmpty().withMessage('Record table is required'),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const execution = await enterprisePlatform.executeWorkflow(
      req.params.id,
      req.body.record_id,
      req.body.record_table,
      req.body.context_data || {},
    );
    res.json({
      success: true,
      data: execution,
      message: 'Workflow executed successfully',
    });
  }),
);

// =============================================================================
// KNOWLEDGE MANAGEMENT ENDPOINTS
// =============================================================================

// Search knowledge articles
router.get(
  '/knowledge-articles/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('category').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  handleValidationErrors,
  handleAsyncErrors(async (req, res) => {
    const articles = await enterprisePlatform.prisma.knowledgeArticle.findMany({
      where: {
        AND: [
          { workflow_state: 'PUBLISHED' },
          {
            OR: [
              { title: { contains: req.query.q, mode: 'insensitive' } },
              { content: { contains: req.query.q, mode: 'insensitive' } },
              { tags: { hasSome: [req.query.q] } },
            ],
          },
          req.query.category ? { category: req.query.category } : {},
        ],
      },
      take: req.query.limit || 20,
      orderBy: [{ helpful_count: 'desc' }, { view_count: 'desc' }],
      include: {
        author: {
          select: { first_name: true, last_name: true },
        },
      },
    });

    res.json({
      success: true,
      data: articles,
    });
  }),
);

// =============================================================================
// ANALYTICS & REPORTING ENDPOINTS
// =============================================================================

// Get enterprise platform metrics
router.get(
  '/analytics/enterprise-metrics',
  handleAsyncErrors(async (req, res) => {
    const [assetMetrics, serviceMetrics, securityMetrics, workflowMetrics] = await Promise.all([
      enterprisePlatform.getAssetDashboard(),
      enterprisePlatform.getServiceOperationsDashboard(),
      enterprisePlatform.getSecurityOperationsDashboard(),
      enterprisePlatform.getWorkflowMetrics(),
    ]);

    res.json({
      success: true,
      data: {
        assets: assetMetrics,
        serviceOperations: serviceMetrics,
        securityOperations: securityMetrics,
        workflows: workflowMetrics,
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Global error handler
router.use((error, req, res, _next) => {
  console.error('Enterprise Platform API Error:', error);

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Unique constraint violation',
      error: error.message,
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
      error: error.message,
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: error.message,
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

export default router;
