import express from 'express';
import { SupportGroupService } from '../services/cmdb/SupportGroupService.js';
import { CmdbInventoryIntegrationService } from '../services/cmdb/CmdbInventoryIntegrationService.js';
import { CmdbService } from '../services/cmdb/CmdbService.js';
import { logger } from '../logger.js';

const router = express.Router();
const supportGroupService = new SupportGroupService();
const integrationService = new CmdbInventoryIntegrationService();
const cmdbService = new CmdbService();

// ============================================================================
// SUPPORT GROUP ROUTES
// ============================================================================

// Get all support groups
router.get('/support-groups', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      isActive: req.query.isActive !== 'false',
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const result = await supportGroupService.listSupportGroups(filters); // TODO-LINT: move to async function
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get support group by ID
router.get('/support-groups/:id', async (req, res) => {
  try {
    const supportGroup = await supportGroupService.getSupportGroup(req.params.id); // TODO-LINT: move to async function
    res.json(supportGroup);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Create support group
router.post('/support-groups', async (req, res) => {
  try {
    const supportGroup = await supportGroupService.createSupportGroup({
      ...req.body,
      createdBy: req.user?.id
    }); // TODO-LINT: move to async function
    res.status(201).json(supportGroup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update support group
router.put('/support-groups/:id', async (req, res) => {
  try {
    const supportGroup = await supportGroupService.updateSupportGroup(req.params.id, {
      ...req.body,
      updatedBy: req.user?.id
    }); // TODO-LINT: move to async function
    res.json(supportGroup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete support group
router.delete('/support-groups/:id', async (req, res) => {
  try {
    await supportGroupService.deleteSupportGroup(req.params.id); // TODO-LINT: move to async function
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add member to support group
router.post('/support-groups/:id/members', async (req, res) => {
  try {
    const member = await supportGroupService.addMember(req.params.id, {
      ...req.body,
      assignedBy: req.user?.id
    }); // TODO-LINT: move to async function
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove member from support group
router.delete('/support-groups/:id/members/:userId', async (req, res) => {
  try {
    await supportGroupService.removeMember(req.params.id, req.params.userId); // TODO-LINT: move to async function
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update member role
router.put('/support-groups/:id/members/:userId', async (req, res) => {
  try {
    const member = await supportGroupService.updateMemberRole(
      req.params.id, 
      req.params.userId, 
      req.body
    ); // TODO-LINT: move to async function
    res.json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add permission to support group
router.post('/support-groups/:id/permissions', async (req, res) => {
  try {
    const permission = await supportGroupService.addPermission(req.params.id, {
      ...req.body,
      grantedBy: req.user?.id
    }); // TODO-LINT: move to async function
    res.status(201).json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove permission from support group
router.delete('/support-groups/:id/permissions/:resource/:action', async (req, res) => {
  try {
    await supportGroupService.removePermission(
      req.params.id, 
      req.params.resource, 
      req.params.action
    ); // TODO-LINT: move to async function
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user permissions
router.get('/users/:userId/permissions', async (req, res) => {
  try {
    const permissions = await supportGroupService.getUserPermissions(req.params.userId); // TODO-LINT: move to async function
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check user permission
router.post('/users/:userId/permissions/check', async (req, res) => {
  try {
    const { resource, action, context } = req.body;
    const hasPermission = await supportGroupService.checkPermission(
      req.params.userId,
      resource,
      action,
      context
    ); // TODO-LINT: move to async function
    res.json({ hasPermission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// CI OWNERSHIP ROUTES
// ============================================================================

// Get CI ownership
router.get('/cis/:ciId/ownership', async (req, res) => {
  try {
    const ownership = await cmdbService.getCiOwnership(req.params.ciId); // TODO-LINT: move to async function
    res.json(ownership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign CI ownership
router.post('/cis/:ciId/ownership', async (req, res) => {
  try {
    const ownership = await cmdbService.assignOwnership(req.params.ciId, {
      ...req.body,
      assignedBy: req.user?.id
    }); // TODO-LINT: move to async function
    res.status(201).json(ownership);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove CI ownership
router.delete('/cis/:ciId/ownership/:ownershipType/:userId', async (req, res) => {
  try {
    await cmdbService.removeOwnership(
      req.params.ciId,
      req.params.ownershipType,
      req.params.userId
    ); // TODO-LINT: move to async function
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update CI ownership
router.put('/cis/:ciId/ownership/:ownershipType/:userId', async (req, res) => {
  try {
    const ownership = await cmdbService.updateOwnership(
      req.params.ciId,
      req.params.ownershipType,
      req.params.userId,
      req.body
    ); // TODO-LINT: move to async function
    res.json(ownership);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user owned CIs
router.get('/users/:userId/owned-cis', async (req, res) => {
  try {
    const ownershipType = req.query.ownershipType;
    const cis = await cmdbService.getUserOwnedCis(req.params.userId, ownershipType); // TODO-LINT: move to async function
    res.json(cis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// CMDB-INVENTORY INTEGRATION ROUTES
// ============================================================================

// Get all mappings
router.get('/inventory-mappings', async (req, res) => {
  try {
    const filters = {
      ciId: req.query.ciId,
      inventoryAssetId: req.query.inventoryAssetId ? parseInt(req.query.inventoryAssetId) : undefined,
      mappingType: req.query.mappingType,
      syncEnabled: req.query.syncEnabled !== undefined ? req.query.syncEnabled === 'true' : undefined,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const result = await integrationService.listMappings(filters); // TODO-LINT: move to async function
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mapping by ID
router.get('/inventory-mappings/:id', async (req, res) => {
  try {
    const mapping = await integrationService.getMapping(req.params.id); // TODO-LINT: move to async function
    res.json(mapping);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Create mapping
router.post('/inventory-mappings', async (req, res) => {
  try {
    const mapping = await integrationService.createMapping({
      ...req.body,
      createdBy: req.user?.id
    }); // TODO-LINT: move to async function
    res.status(201).json(mapping);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update mapping
router.put('/inventory-mappings/:id', async (req, res) => {
  try {
    const mapping = await integrationService.updateMapping(req.params.id, req.body); // TODO-LINT: move to async function
    res.json(mapping);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete mapping
router.delete('/inventory-mappings/:id', async (req, res) => {
  try {
    await integrationService.deleteMapping(req.params.id); // TODO-LINT: move to async function
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync mapping
router.post('/inventory-mappings/:id/sync', async (req, res) => {
  try {
    const result = await integrationService.syncMapping(req.params.id); // TODO-LINT: move to async function
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync all mappings
router.post('/inventory-mappings/sync-all', async (req, res) => {
  try {
    const result = await integrationService.syncAllMappings(); // TODO-LINT: move to async function
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze integration opportunities
router.get('/inventory-integration/analyze', async (req, res) => {
  try {
    const analysis = await integrationService.analyzeIntegrationOpportunities(); // TODO-LINT: move to async function
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk create mappings
router.post('/inventory-mappings/bulk', async (req, res) => {
  try {
    const { mappings } = req.body;
    const result = await integrationService.bulkCreateMappings(
      mappings.map(mapping => ({
        ...mapping,
        createdBy: req.user?.id
      }))
    ); // TODO-LINT: move to async function
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate integration report
router.get('/inventory-integration/report', async (req, res) => {
  try {
    const report = await integrationService.generateIntegrationReport(); // TODO-LINT: move to async function
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
