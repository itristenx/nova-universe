import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { CmdbService } from '../services/cmdb/CmdbService.js';
import { DiscoveryService } from '../services/cmdb/DiscoveryService.js';
import { RelationshipService } from '../services/cmdb/RelationshipService.js';
import { body, param, query } from 'express-validator';
import { logger } from '../logger.js';

const router = express.Router();
const cmdbService = new CmdbService();
const discoveryService = new DiscoveryService();
const relationshipService = new RelationshipService();

// ============================================================================
// CONFIGURATION ITEMS (CIs) ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/v1/cmdb/cis:
 *   get:
 *     summary: Get all Configuration Items with filtering and pagination
 *     tags: [CMDB]
 *     parameters:
 *       - in: query
 *         name: ciType
 *         schema:
 *           type: string
 *         description: Filter by CI type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by CI status (Active, Inactive, Retired)
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *         description: Filter by environment (Production, Development, Test)
 *       - in: query
 *         name: criticality
 *         schema:
 *           type: string
 *         description: Filter by criticality (Critical, High, Medium, Low)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, serial number, asset tag
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of Configuration Items
 */
router.get('/cis', authenticateJWT, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('ciType').optional().isString(),
  query('status').optional().isIn(['Active', 'Inactive', 'Retired']),
  query('environment').optional().isString(),
  query('criticality').optional().isIn(['Critical', 'High', 'Medium', 'Low']),
  query('location').optional().isString(),
  query('search').optional().isString().isLength({ min: 1, max: 100 })
], validateRequest, async (req, res) => {
  try {
    const filters = {
      ciType: req.query.ciType,
      status: req.query.status,
      environment: req.query.environment,
      criticality: req.query.criticality,
      location: req.query.location,
      search: req.query.search
    };
    
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const result = await cmdbService.getConfigurationItems(filters, pagination); // TODO-LINT: move to async function
    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      filters: filters
    });
  } catch (error) {
    logger.error('Error fetching CIs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Configuration Items',
      errorCode: 'CMDB_FETCH_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/cmdb/cis/{id}:
 *   get:
 *     summary: Get a specific Configuration Item by ID
 *     tags: [CMDB]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CI ID or CI number (CI123456)
 *       - in: query
 *         name: includeRelationships
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include CI relationships in response
 *       - in: query
 *         name: includeHistory
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include change history in response
 *     responses:
 *       200:
 *         description: Configuration Item details
 *       404:
 *         description: Configuration Item not found
 */
router.get('/cis/:id', authenticateJWT, [
  param('id').isString().notEmpty(),
  query('includeRelationships').optional().isBoolean(),
  query('includeHistory').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const options = {
      includeRelationships: req.query.includeRelationships === 'true',
      includeHistory: req.query.includeHistory === 'true'
    };

    const ci = await cmdbService.getConfigurationItem(req.params.id, options); // TODO-LINT: move to async function
    
    if (!ci) {
      return res.status(404).json({
        success: false,
        error: 'Configuration Item not found',
        errorCode: 'CI_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: ci
    });
  } catch (error) {
    logger.error('Error fetching CI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Configuration Item',
      errorCode: 'CMDB_FETCH_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/cmdb/cis:
 *   post:
 *     summary: Create a new Configuration Item
 *     tags: [CMDB]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ciType
 *             properties:
 *               name:
 *                 type: string
 *               displayName:
 *                 type: string
 *               description:
 *                 type: string
 *               ciType:
 *                 type: string
 *               ciSubType:
 *                 type: string
 *               environment:
 *                 type: string
 *               criticality:
 *                 type: string
 *               location:
 *                 type: string
 *               owner:
 *                 type: string
 *               technicalOwner:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               assetTag:
 *                 type: string
 *               customFields:
 *                 type: object
 *               attributes:
 *                 type: object
 *     responses:
 *       201:
 *         description: Configuration Item created successfully
 *       400:
 *         description: Validation error
 */
router.post('/cis', authenticateJWT, [
  body('name').isString().isLength({ min: 1, max: 255 }),
  body('displayName').optional().isString().isLength({ max: 255 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('ciType').isString().notEmpty(),
  body('ciSubType').optional().isString(),
  body('environment').optional().isIn(['Production', 'Development', 'Test', 'Staging']),
  body('criticality').optional().isIn(['Critical', 'High', 'Medium', 'Low']),
  body('location').optional().isString().isLength({ max: 255 }),
  body('owner').optional().isString().isLength({ max: 255 }),
  body('technicalOwner').optional().isString().isLength({ max: 255 }),
  body('serialNumber').optional().isString().isLength({ max: 100 }),
  body('assetTag').optional().isString().isLength({ max: 100 }),
  body('customFields').optional().isObject(),
  body('attributes').optional().isObject()
], validateRequest, async (req, res) => {
  try {
    const ciData = {
      ...req.body,
      createdBy: req.user.id
    };

    const ci = await cmdbService.createConfigurationItem(ciData); // TODO-LINT: move to async function
    
    res.status(201).json({
      success: true,
      data: ci,
      message: 'Configuration Item created successfully'
    });
  } catch (error) {
    logger.error('Error creating CI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Configuration Item',
      errorCode: 'CMDB_CREATE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/cmdb/cis/{id}:
 *   put:
 *     summary: Update a Configuration Item
 *     tags: [CMDB]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Configuration Item updated successfully
 *       404:
 *         description: Configuration Item not found
 */
router.put('/cis/:id', authenticateJWT, [
  param('id').isString().notEmpty(),
  body('name').optional().isString().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('ciStatus').optional().isIn(['Active', 'Inactive', 'Retired']),
  body('environment').optional().isIn(['Production', 'Development', 'Test', 'Staging']),
  body('criticality').optional().isIn(['Critical', 'High', 'Medium', 'Low']),
  body('changeTicket').optional().isString().isLength({ max: 50 })
], validateRequest, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const ci = await cmdbService.updateConfigurationItem(req.params.id, updateData); // TODO-LINT: move to async function
    
    if (!ci) {
      return res.status(404).json({
        success: false,
        error: 'Configuration Item not found',
        errorCode: 'CI_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: ci,
      message: 'Configuration Item updated successfully'
    });
  } catch (error) {
    logger.error('Error updating CI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update Configuration Item',
      errorCode: 'CMDB_UPDATE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/cmdb/cis/{id}:
 *   delete:
 *     summary: Delete a Configuration Item
 *     tags: [CMDB]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configuration Item deleted successfully
 *       404:
 *         description: Configuration Item not found
 */
router.delete('/cis/:id', authenticateJWT, [
  param('id').isString().notEmpty()
], validateRequest, async (req, res) => {
  try {
    const deleted = await cmdbService.deleteConfigurationItem(req.params.id, req.user.id); // TODO-LINT: move to async function
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Configuration Item not found',
        errorCode: 'CI_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Configuration Item deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting CI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete Configuration Item',
      errorCode: 'CMDB_DELETE_ERROR'
    });
  }
});

// ============================================================================
// CI TYPES ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/v1/cmdb/ci-types:
 *   get:
 *     summary: Get all CI Types
 *     tags: [CMDB]
 *     responses:
 *       200:
 *         description: List of CI Types
 */
router.get('/ci-types', authenticateJWT, async (req, res) => {
  try {
    const ciTypes = await cmdbService.getCiTypes(); // TODO-LINT: move to async function
    res.json({
      success: true,
      data: ciTypes
    });
  } catch (error) {
    logger.error('Error fetching CI types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch CI Types',
      errorCode: 'CMDB_FETCH_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/cmdb/ci-types:
 *   post:
 *     summary: Create a new CI Type
 *     tags: [CMDB]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               displayName:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               parentTypeId:
 *                 type: string
 *               attributeSchema:
 *                 type: object
 *     responses:
 *       201:
 *         description: CI Type created successfully
 */
router.post('/ci-types', authenticateJWT, [
  body('name').isString().isLength({ min: 1, max: 100 }),
  body('displayName').optional().isString().isLength({ max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('category').isString().notEmpty(),
  body('parentTypeId').optional().isUUID(),
  body('attributeSchema').optional().isObject()
], validateRequest, async (req, res) => {
  try {
    const ciType = await cmdbService.createCiType(req.body); // TODO-LINT: move to async function
    res.status(201).json({
      success: true,
      data: ciType,
      message: 'CI Type created successfully'
    });
  } catch (error) {
    logger.error('Error creating CI type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create CI Type',
      errorCode: 'CMDB_CREATE_ERROR'
    });
  }
});

// ============================================================================
// RELATIONSHIPS ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/v1/cmdb/cis/{id}/relationships:
 *   get:
 *     summary: Get relationships for a Configuration Item
 *     tags: [CMDB]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [incoming, outgoing, both]
 *           default: both
 *       - in: query
 *         name: relationshipType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CI relationships
 */
router.get('/cis/:id/relationships', authenticateJWT, [
  param('id').isString().notEmpty(),
  query('direction').optional().isIn(['incoming', 'outgoing', 'both']),
  query('relationshipType').optional().isString()
], validateRequest, async (req, res) => {
  try {
    const options = {
      direction: req.query.direction || 'both',
      relationshipType: req.query.relationshipType
    };

    const relationships = await relationshipService.getCiRelationships(req.params.id, options); // TODO-LINT: move to async function
    res.json({
      success: true,
      data: relationships
    });
  } catch (error) {
    logger.error('Error fetching CI relationships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch CI relationships',
      errorCode: 'CMDB_RELATIONSHIP_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/cmdb/relationships:
 *   post:
 *     summary: Create a relationship between two CIs
 *     tags: [CMDB]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceCiId
 *               - targetCiId
 *               - relationshipTypeId
 *             properties:
 *               sourceCiId:
 *                 type: string
 *               targetCiId:
 *                 type: string
 *               relationshipTypeId:
 *                 type: string
 *               description:
 *                 type: string
 *               criticality:
 *                 type: string
 *     responses:
 *       201:
 *         description: Relationship created successfully
 */
router.post('/relationships', authenticateJWT, [
  body('sourceCiId').isString().notEmpty(),
  body('targetCiId').isString().notEmpty(),
  body('relationshipTypeId').isString().notEmpty(),
  body('description').optional().isString().isLength({ max: 500 }),
  body('criticality').optional().isIn(['Critical', 'High', 'Medium', 'Low'])
], validateRequest, async (req, res) => {
  try {
    const relationshipData = {
      ...req.body,
      createdBy: req.user.id
    };

    const relationship = await relationshipService.createRelationship(relationshipData); // TODO-LINT: move to async function
    res.status(201).json({
      success: true,
      data: relationship,
      message: 'Relationship created successfully'
    });
  } catch (error) {
    logger.error('Error creating relationship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create relationship',
      errorCode: 'CMDB_RELATIONSHIP_ERROR'
    });
  }
});

// ============================================================================
// DISCOVERY ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/v1/cmdb/discovery/run:
 *   post:
 *     summary: Start a discovery run
 *     tags: [CMDB]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - discoveryType
 *               - scopeConfiguration
 *             properties:
 *               discoveryType:
 *                 type: string
 *               scopeConfiguration:
 *                 type: object
 *     responses:
 *       202:
 *         description: Discovery run started
 */
router.post('/discovery/run', authenticateJWT, [
  body('discoveryType').isIn(['Network', 'Windows', 'Linux', 'Cloud', 'Database']),
  body('scopeConfiguration').isObject()
], validateRequest, async (req, res) => {
  try {
    const discoveryRun = await discoveryService.startDiscoveryRun({
      ...req.body,
      initiatedBy: req.user.id
    }); // TODO-LINT: move to async function

    res.status(202).json({
      success: true,
      data: discoveryRun,
      message: 'Discovery run started successfully'
    });
  } catch (error) {
    logger.error('Error starting discovery run:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start discovery run',
      errorCode: 'CMDB_DISCOVERY_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/cmdb/discovery/runs:
 *   get:
 *     summary: Get discovery run history
 *     tags: [CMDB]
 *     responses:
 *       200:
 *         description: Discovery run history
 */
router.get('/discovery/runs', authenticateJWT, async (req, res) => {
  try {
    const runs = await discoveryService.getDiscoveryRuns(); // TODO-LINT: move to async function
    res.json({
      success: true,
      data: runs
    });
  } catch (error) {
    logger.error('Error fetching discovery runs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discovery runs',
      errorCode: 'CMDB_DISCOVERY_ERROR'
    });
  }
});

// ============================================================================
// BUSINESS SERVICES ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/v1/cmdb/business-services:
 *   get:
 *     summary: Get all business services
 *     tags: [CMDB]
 *     responses:
 *       200:
 *         description: List of business services
 */
router.get('/business-services', authenticateJWT, async (req, res) => {
  try {
    const services = await cmdbService.getBusinessServices(); // TODO-LINT: move to async function
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    logger.error('Error fetching business services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business services',
      errorCode: 'CMDB_FETCH_ERROR'
    });
  }
});

// ============================================================================
// CMDB HEALTH AND METRICS ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/v1/cmdb/health:
 *   get:
 *     summary: Get CMDB health metrics
 *     tags: [CMDB]
 *     responses:
 *       200:
 *         description: CMDB health metrics
 */
router.get('/health', authenticateJWT, async (req, res) => {
  try {
    const health = await cmdbService.getCmdbHealth(); // TODO-LINT: move to async function
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Error fetching CMDB health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch CMDB health metrics',
      errorCode: 'CMDB_HEALTH_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/cmdb/reports/impact-analysis:
 *   post:
 *     summary: Perform impact analysis for a CI
 *     tags: [CMDB]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ciId
 *             properties:
 *               ciId:
 *                 type: string
 *               depth:
 *                 type: integer
 *                 default: 3
 *     responses:
 *       200:
 *         description: Impact analysis results
 */
router.post('/reports/impact-analysis', authenticateJWT, [
  body('ciId').isString().notEmpty(),
  body('depth').optional().isInt({ min: 1, max: 10 })
], validateRequest, async (req, res) => {
  try {
    const { ciId, depth = 3 } = req.body;
    const impact = await relationshipService.performImpactAnalysis(ciId, depth); // TODO-LINT: move to async function
    
    res.json({
      success: true,
      data: impact
    });
  } catch (error) {
    logger.error('Error performing impact analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform impact analysis',
      errorCode: 'CMDB_IMPACT_ERROR'
    });
  }
});

export default router;
