import { logger } from '../../logger.js';

async function getCorePrisma() {
  if (process.env.PRISMA_DISABLED === 'true') return null;
  try {
    const mod = await import('../../../../prisma/generated/core/index.js'); // TODO-LINT: move to async function
    return new mod.PrismaClient();
  } catch { return null; }
}

async function getCmdbPrisma() {
  if (process.env.PRISMA_DISABLED === 'true') return null;
  try {
    const mod = await import('../../../../prisma/generated/cmdb/index.js'); // TODO-LINT: move to async function
    return new mod.PrismaClient();
  } catch { return null; }
}

// Initialize database clients
const coreClientPromise = getCorePrisma();
const cmdbClientPromise = getCmdbPrisma();

class CmdbInventoryIntegrationService {
  constructor() {
    this.coreDb = coreClientPromise;
    this.cmdbDb = cmdbClientPromise;
  }

  // ============================================================================
  // CMDB-INVENTORY MAPPING MANAGEMENT
  // ============================================================================

  async createMapping(data) {
    const {
      ciId,
      inventoryAssetId,
      mappingType = 'direct',
      relationship,
      syncEnabled = true,
      conflictResolution = 'cmdb_wins',
      fieldMapping,
      createdBy
    } = data;

    // Validate CI exists
    const ci = await this.cmdbDb.configurationItem.findUnique({
      where: { id: ciId }
    }); // TODO-LINT: move to async function
    if (!ci) {
      throw new Error('Configuration Item not found');
    }

    // Validate inventory asset exists
    const asset = await this.coreDb.inventoryAsset.findUnique({
      where: { id: inventoryAssetId }
    }); // TODO-LINT: move to async function
    if (!asset) {
      throw new Error('Inventory Asset not found');
    }

    // Create mapping
    const mapping = await this.cmdbDb.cmdbInventoryMapping.create({
      data: {
        ciId,
        inventoryAssetId,
        mappingType,
        relationship,
        syncEnabled,
        conflictResolution,
        fieldMapping,
        createdBy
      }
    }); // TODO-LINT: move to async function

    // Perform initial sync if enabled
    if (syncEnabled) {
      await this.syncMapping(mapping.id); // TODO-LINT: move to async function
    }

    return mapping;
  }

  async updateMapping(id, data) {
    const {
      mappingType,
      relationship,
      syncEnabled,
      conflictResolution,
      fieldMapping
    } = data;

    const mapping = await this.cmdbDb.cmdbInventoryMapping.update({
      where: { id },
      data: {
        mappingType,
        relationship,
        syncEnabled,
        conflictResolution,
        fieldMapping
      }
    }); // TODO-LINT: move to async function

    return mapping;
  }

  async deleteMapping(id) {
    await this.cmdbDb.cmdbInventoryMapping.delete({
      where: { id }
    }); // TODO-LINT: move to async function

    return { success: true };
  }

  async getMapping(id) {
    const mapping = await this.cmdbDb.cmdbInventoryMapping.findUnique({
      where: { id },
      include: {
        configurationItem: {
          include: {
            ciType_rel: true
          }
        }
      }
    }); // TODO-LINT: move to async function

    if (!mapping) {
      throw new Error('Mapping not found');
    }

    // Get inventory asset details
    const inventoryAsset = await this.coreDb.inventoryAsset.findUnique({
      where: { id: mapping.inventoryAssetId },
      include: {
        statusLogs: { take: 5, orderBy: { timestamp: 'desc' } },
        assignments: { 
          where: { returnDate: null },
          take: 1,
          orderBy: { assignedDate: 'desc' }
        }
      }
    }); // TODO-LINT: move to async function

    return {
      ...mapping,
      inventoryAsset
    };
  }

  async listMappings(filters = {}) {
    const {
      ciId,
      inventoryAssetId,
      mappingType,
      syncEnabled,
      page = 1,
      limit = 50
    } = filters;

    const where = {
      ...(ciId && { ciId }),
      ...(inventoryAssetId && { inventoryAssetId }),
      ...(mappingType && { mappingType }),
      ...(syncEnabled !== undefined && { syncEnabled })
    };

    const [mappings, total] = await Promise.all([
      this.cmdbDb.cmdbInventoryMapping.findMany({
        where,
        include: {
          configurationItem: {
            select: {
              id: true,
              ciId: true,
              name: true,
              ciType: true,
              ciStatus: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.cmdbDb.cmdbInventoryMapping.count({ where })
    ]); // TODO-LINT: move to async function

    // Enrich with inventory asset details
    const enrichedMappings = await Promise.all(
      mappings.map(async (mapping) => {
        const inventoryAsset = await this.coreDb.inventoryAsset.findUnique({
          where: { id: mapping.inventoryAssetId },
          select: {
            id: true,
            assetTag: true,
            serialNumber: true,
            model: true,
            status: true,
            assignedToUserId: true
          }
        }); // TODO-LINT: move to async function
        return { ...mapping, inventoryAsset };
      })
    );

    return {
      mappings: enrichedMappings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  async syncMapping(mappingId) {
    const mapping = await this.cmdbDb.cmdbInventoryMapping.findUnique({
      where: { id: mappingId },
      include: {
        configurationItem: true
      }
    }); // TODO-LINT: move to async function

    if (!mapping) {
      throw new Error('Mapping not found');
    }

    if (!mapping.syncEnabled) {
      throw new Error('Sync is disabled for this mapping');
    }

    try {
      const inventoryAsset = await this.coreDb.inventoryAsset.findUnique({
        where: { id: mapping.inventoryAssetId }
      }); // TODO-LINT: move to async function

      if (!inventoryAsset) {
        throw new Error('Inventory asset not found');
      }

      const updateData = await this.mapInventoryToCmdb(inventoryAsset, mapping); // TODO-LINT: move to async function
      
      // Update CI with mapped data
      await this.cmdbDb.configurationItem.update({
        where: { id: mapping.ciId },
        data: updateData
      }); // TODO-LINT: move to async function

      // Update mapping sync status
      await this.cmdbDb.cmdbInventoryMapping.update({
        where: { id: mappingId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'success',
          syncErrors: null
        }
      }); // TODO-LINT: move to async function

      return { success: true, syncedAt: new Date() };
    } catch (error) {
      // Update mapping with error
      await this.cmdbDb.cmdbInventoryMapping.update({
        where: { id: mappingId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'failed',
          syncErrors: error.message
        }
      }); // TODO-LINT: move to async function

      throw error;
    }
  }

  async syncAllMappings() {
    const mappings = await this.cmdbDb.cmdbInventoryMapping.findMany({
      where: { syncEnabled: true }
    }); // TODO-LINT: move to async function

    const results = [];
    for (const mapping of mappings) {
      try {
        await this.syncMapping(mapping.id); // TODO-LINT: move to async function
        results.push({ mappingId: mapping.id, status: 'success' });
      } catch (error) {
        results.push({ 
          mappingId: mapping.id, 
          status: 'failed', 
          error: error.message 
        });
      }
    }

    return {
      totalMappings: mappings.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    };
  }

  mapInventoryToCmdb(inventoryAsset, mapping) {
    const defaultMapping = {
      serialNumber: inventoryAsset.serialNumber,
      assetTag: inventoryAsset.assetTag,
      model: inventoryAsset.model,
      vendor: inventoryAsset.vendorId ? `vendor_${inventoryAsset.vendorId}` : null,
      location: inventoryAsset.locationId ? `location_${inventoryAsset.locationId}` : null,
      department: inventoryAsset.department,
      purchaseDate: inventoryAsset.purchaseDate,
      warrantyExpiryDate: inventoryAsset.warrantyExpiry,
      owner: inventoryAsset.assignedToUserId ? `user_${inventoryAsset.assignedToUserId}` : null,
      ciStatus: this.mapInventoryStatusToCiStatus(inventoryAsset.status),
      customFields: inventoryAsset.customFields,
      updatedAt: new Date()
    };

    // Apply custom field mapping if defined
    if (mapping.fieldMapping) {
      const customMapping = {};
      Object.entries(mapping.fieldMapping).forEach(([cmdbField, inventoryField]) => {
        if (inventoryAsset[inventoryField] !== undefined) {
          customMapping[cmdbField] = inventoryAsset[inventoryField];
        }
      });
      return { ...defaultMapping, ...customMapping };
    }

    return defaultMapping;
  }

  mapInventoryStatusToCiStatus(inventoryStatus) {
    const statusMap = {
      'active': 'Active',
      'deployed': 'Active',
      'available': 'Active',
      'in_use': 'Active',
      'maintenance': 'Non-Operational',
      'repair': 'Non-Operational',
      'decommissioned': 'Retired',
      'disposed': 'Retired',
      'lost': 'Retired',
      'stolen': 'Retired'
    };

    return statusMap[inventoryStatus?.toLowerCase()] || 'Active';
  }

  // ============================================================================
  // INTEGRATION ANALYSIS
  // ============================================================================

  async analyzeIntegrationOpportunities() {
    // Find inventory assets without CMDB mapping
    const unmappedAssets = await this.coreDb.inventoryAsset.findMany({
      where: {
        NOT: {
          id: {
            in: await this.cmdbDb.cmdbInventoryMapping.findMany({
              select: { inventoryAssetId: true }
            }).then(mappings => mappings.map(m => m.inventoryAssetId))
          }
        }
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    }); // TODO-LINT: move to async function

    // Find CIs without inventory mapping
    const unmappedCis = await this.cmdbDb.configurationItem.findMany({
      where: {
        NOT: {
          id: {
            in: await this.cmdbDb.cmdbInventoryMapping.findMany({
              select: { ciId: true }
            }).then(mappings => mappings.map(m => m.ciId))
          }
        }
      },
      include: {
        ciType_rel: true
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    }); // TODO-LINT: move to async function

    // Suggest potential mappings based on matching criteria
    const suggestions = [];
    for (const asset of unmappedAssets) {
      const potentialCis = await this.findPotentialCiMatches(asset); // TODO-LINT: move to async function
      if (potentialCis.length > 0) {
        suggestions.push({
          inventoryAsset: asset,
          potentialCis: potentialCis.slice(0, 3), // Top 3 matches
          confidence: this.calculateMatchConfidence(asset, potentialCis[0])
        });
      }
    }

    return {
      unmappedAssets: unmappedAssets.length,
      unmappedCis: unmappedCis.length,
      suggestions: suggestions.slice(0, 20), // Top 20 suggestions
      totalMappings: await this.cmdbDb.cmdbInventoryMapping.count()
    }; // TODO-LINT: move to async function
  }

  async findPotentialCiMatches(inventoryAsset) {
    const searchCriteria = [];

    // Match by serial number
    if (inventoryAsset.serialNumber) {
      searchCriteria.push({
        serialNumber: {
          equals: inventoryAsset.serialNumber,
          mode: 'insensitive'
        }
      });
    }

    // Match by asset tag
    if (inventoryAsset.assetTag) {
      searchCriteria.push({
        assetTag: {
          equals: inventoryAsset.assetTag,
          mode: 'insensitive'
        }
      });
    }

    // Match by model and manufacturer combination
    if (inventoryAsset.model) {
      searchCriteria.push({
        AND: [
          { model: { contains: inventoryAsset.model, mode: 'insensitive' } },
          inventoryAsset.serialNumber ? {
            serialNumber: {
              contains: inventoryAsset.serialNumber,
              mode: 'insensitive'
            }
          } : {}
        ]
      });
    }

    if (searchCriteria.length === 0) {
      return [];
    }

    const potentialCis = await this.cmdbDb.configurationItem.findMany({
      where: {
        OR: searchCriteria
      },
      include: {
        ciType_rel: true
      },
      take: 10
    }); // TODO-LINT: move to async function

    return potentialCis;
  }

  calculateMatchConfidence(inventoryAsset, ci) {
    let confidence = 0;
    let factors = 0;

    // Serial number exact match
    if (inventoryAsset.serialNumber && ci.serialNumber) {
      factors++;
      if (inventoryAsset.serialNumber.toLowerCase() === ci.serialNumber.toLowerCase()) {
        confidence += 40;
      }
    }

    // Asset tag exact match
    if (inventoryAsset.assetTag && ci.assetTag) {
      factors++;
      if (inventoryAsset.assetTag.toLowerCase() === ci.assetTag.toLowerCase()) {
        confidence += 30;
      }
    }

    // Model similarity
    if (inventoryAsset.model && ci.model) {
      factors++;
      if (inventoryAsset.model.toLowerCase() === ci.model.toLowerCase()) {
        confidence += 20;
      } else if (ci.model.toLowerCase().includes(inventoryAsset.model.toLowerCase())) {
        confidence += 10;
      }
    }

    // Location similarity
    if (inventoryAsset.department && ci.department) {
      factors++;
      if (inventoryAsset.department.toLowerCase() === ci.department.toLowerCase()) {
        confidence += 10;
      }
    }

    return factors > 0 ? Math.round(confidence / factors) : 0;
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async bulkCreateMappings(mappingData) {
    const results = [];
    
    for (const data of mappingData) {
      try {
        const mapping = await this.createMapping(data); // TODO-LINT: move to async function
        results.push({ 
          success: true, 
          mapping,
          ciId: data.ciId,
          inventoryAssetId: data.inventoryAssetId
        });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message,
          ciId: data.ciId,
          inventoryAssetId: data.inventoryAssetId
        });
      }
    }

    return {
      total: mappingData.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async generateIntegrationReport() {
    const [
      totalMappings,
      activeMappings,
      failedSyncs,
      recentActivity,
      unmappedAssets,
      unmappedCis
    ] = await Promise.all([
      this.cmdbDb.cmdbInventoryMapping.count(),
      this.cmdbDb.cmdbInventoryMapping.count({ where: { syncEnabled: true } }),
      this.cmdbDb.cmdbInventoryMapping.count({ where: { syncStatus: 'failed' } }),
      this.cmdbDb.cmdbInventoryMapping.findMany({
        where: {
          lastSyncAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: {
          configurationItem: {
            select: { ciId: true, name: true }
          }
        },
        orderBy: { lastSyncAt: 'desc' },
        take: 10
      }),
      this.analyzeIntegrationOpportunities().then(result => result.unmappedAssets),
      this.analyzeIntegrationOpportunities().then(result => result.unmappedCis)
    ]); // TODO-LINT: move to async function

    return {
      summary: {
        totalMappings,
        activeMappings,
        failedSyncs,
        unmappedAssets,
        unmappedCis,
        integrationHealth: failedSyncs === 0 ? 'Healthy' : failedSyncs < 5 ? 'Warning' : 'Critical'
      },
      recentActivity,
      recommendations: this.generateRecommendations({
        totalMappings,
        activeMappings,
        failedSyncs,
        unmappedAssets,
        unmappedCis
      })
    };
  }

  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.failedSyncs > 0) {
      recommendations.push({
        type: 'error',
        title: 'Sync Failures Detected',
        description: `${metrics.failedSyncs} mappings have failed sync operations`,
        action: 'Review and resolve sync errors'
      });
    }

    if (metrics.unmappedAssets > 50) {
      recommendations.push({
        type: 'warning',
        title: 'High Number of Unmapped Assets',
        description: `${metrics.unmappedAssets} inventory assets are not mapped to CMDB`,
        action: 'Consider bulk mapping operations'
      });
    }

    if (metrics.unmappedCis > 30) {
      recommendations.push({
        type: 'info',
        title: 'CIs Without Inventory Links',
        description: `${metrics.unmappedCis} configuration items lack inventory mapping`,
        action: 'Review CIs for potential asset relationships'
      });
    }

    if (metrics.totalMappings === 0) {
      recommendations.push({
        type: 'warning',
        title: 'No CMDB-Inventory Integration',
        description: 'No mappings exist between CMDB and Inventory systems',
        action: 'Start by mapping critical assets to CIs'
      });
    }

    return recommendations;
  }
}

export { CmdbInventoryIntegrationService };
