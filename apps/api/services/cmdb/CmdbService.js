import { logger } from '../../logger.js';

async function getCmdbPrisma() {
  if (process.env.PRISMA_DISABLED === 'true') return null;
  try {
    const mod = await import('../../../../prisma/generated/cmdb/index.js'); // TODO-LINT: move to async function
    return new mod.PrismaClient({ datasources: { cmdb_db: { url: process.env.CMDB_DATABASE_URL || process.env.DATABASE_URL } } });
  } catch {
    return null;
  }
}

async function getCorePrisma() {
  if (process.env.PRISMA_DISABLED === 'true') return null;
  try {
    const mod = await import('../../../../prisma/generated/core/index.js'); // TODO-LINT: move to async function
    return new mod.PrismaClient({ datasources: { core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } } });
  } catch {
    return null;
  }
}

class CmdbService {
  constructor() {
    this.clientPromise = getCmdbPrisma();
    this.coreDbPromise = getCorePrisma();
  }

  async _getClients() {
    const [client, coreDb] = await Promise.all([this.clientPromise, this.coreDbPromise]); // TODO-LINT: move to async function
    if (!client) throw new Error('CMDB Prisma client unavailable');
    return { client, coreDb };
  }

  /**
   * Get Configuration Items with filtering and pagination
   */
  async getConfigurationItems(filters = {}, pagination = { page: 1, limit: 50 }) {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      const where = this._buildCiWhereClause(filters);
      const skip = (pagination.page - 1) * pagination.limit;

      const [items, total] = await Promise.all([
        client.configurationItem.findMany({
          where,
          include: {
            ciType_rel: true,
            outgoingRelationships: {
              include: { targetCi: true, relationshipType: true }
            },
            incomingRelationships: {
              include: { sourceCi: true, relationshipType: true }
            }
          },
          orderBy: [ { updatedAt: 'desc' }, { name: 'asc' } ],
          skip,
          take: pagination.limit
        }),
        client.configurationItem.count({ where })
      ]); // TODO-LINT: move to async function

      return {
        items,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
          hasNext: pagination.page * pagination.limit < total,
          hasPrev: pagination.page > 1
        }
      };
    } catch (error) {
      logger.error('Error fetching Configuration Items:', error);
      throw new Error('Failed to fetch Configuration Items');
    }
  }

  /**
   * Get a specific Configuration Item by ID or CI number
   */
  async getConfigurationItem(identifier, options = {}) {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      const where = this._isUUID(identifier) ? { id: identifier } : { ciId: identifier };
      const include = { ciType_rel: true, hardwareDetails: true, softwareDetails: true, applicationDetails: true, networkDetails: true, serviceDetails: true, databaseDetails: true, virtualDetails: true, facilityDetails: true };
      if (options.includeRelationships) {
        include.outgoingRelationships = { include: { targetCi: true, relationshipType: true } };
        include.incomingRelationships = { include: { sourceCi: true, relationshipType: true } };
      }
      const ci = await client.configurationItem.findFirst({ where, include }); // TODO-LINT: move to async function
      if (options.includeHistory && ci) {
        const auditLogs = await client.ciAuditLog.findMany({ where: { ciId: ci.id }, orderBy: { timestamp: 'desc' }, take: 50 }); // TODO-LINT: move to async function
        ci.auditHistory = auditLogs;
      }
      return ci;
    } catch (error) {
      logger.error('Error fetching Configuration Item:', error);
      throw new Error('Failed to fetch Configuration Item');
    }
  }

  /**
   * Create a new Configuration Item
   */
  async createConfigurationItem(ciData) {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      // Generate CI ID (CI123456 format)
      const ciId = await this._generateCiId(); // TODO-LINT: move to async function

      // Validate CI Type exists
      const ciType = await client.ciType.findUnique({
        where: { id: ciData.ciType }
      }); // TODO-LINT: move to async function

      if (!ciType) {
        throw new Error(`CI Type ${ciData.ciType} does not exist`);
      }

      // Create the CI
      const ci = await client.configurationItem.create({
        data: {
          ...ciData,
          ciId,
          ciStatus: ciData.ciStatus || ciType.defaultStatus || 'Active'
        },
        include: {
          ciType_rel: true
        }
      }); // TODO-LINT: move to async function

      // Create audit log
      await this._createAuditLog(ci.id, 'CREATE', null, null, null, ciData.createdBy); // TODO-LINT: move to async function

      logger.info(`Configuration Item created: ${ci.ciId} (${ci.name})`);
      return ci;
    } catch (error) {
      logger.error('Error creating Configuration Item:', error);
      throw new Error(`Failed to create Configuration Item: ${error.message}`);
    }
  }

  /**
   * Update a Configuration Item
   */
  async updateConfigurationItem(identifier, updateData) {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      const where = this._isUUID(identifier) 
        ? { id: identifier }
        : { ciId: identifier };

      // Get existing CI for audit trail
      const existingCi = await client.configurationItem.findFirst({ where }); // TODO-LINT: move to async function
      if (!existingCi) {
        return null;
      }

      // Update CI
      const ci = await client.configurationItem.update({
        where: { id: existingCi.id },
        data: updateData,
        include: {
          ciType_rel: true
        }
      }); // TODO-LINT: move to async function

      // Create audit logs for changed fields
      await this._createUpdateAuditLogs(existingCi, updateData, updateData.updatedBy); // TODO-LINT: move to async function

      logger.info(`Configuration Item updated: ${ci.ciId} (${ci.name})`);
      return ci;
    } catch (error) {
      logger.error('Error updating Configuration Item:', error);
      throw new Error('Failed to update Configuration Item');
    }
  }

  /**
   * Delete a Configuration Item
   */
  async deleteConfigurationItem(identifier, deletedBy) {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      const where = this._isUUID(identifier) 
        ? { id: identifier }
        : { ciId: identifier };

      const ci = await client.configurationItem.findFirst({ where }); // TODO-LINT: move to async function
      if (!ci) {
        return false;
      }

      // Check for active relationships
      const relationshipCount = await client.ciRelationship.count({
        where: {
          OR: [
            { sourceCiId: ci.id },
            { targetCiId: ci.id }
          ],
          isActive: true
        }
      }); // TODO-LINT: move to async function

      if (relationshipCount > 0) {
        throw new Error('Cannot delete CI with active relationships. Remove relationships first.');
      }

      await client.configurationItem.delete({ where: { id: ci.id } }); // TODO-LINT: move to async function

      // Create audit log
      await this._createAuditLog(ci.id, 'DELETE', null, null, null, deletedBy); // TODO-LINT: move to async function

      logger.info(`Configuration Item deleted: ${ci.ciId} (${ci.name})`);
      return true;
    } catch (error) {
      logger.error('Error deleting Configuration Item:', error);
      throw new Error(`Failed to delete Configuration Item: ${error.message}`);
    }
  }

  /**
   * Get all CI Types
   */
  async getCiTypes() {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      return await client.ciType.findMany({
        where: { isActive: true },
        include: {
          parentType: true,
          childTypes: true
        },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      }); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error fetching CI Types:', error);
      throw new Error('Failed to fetch CI Types');
    }
  }

  /**
   * Create a new CI Type
   */
  async createCiType(typeData) {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      const ciType = await client.ciType.create({
        data: typeData,
        include: {
          parentType: true
        }
      }); // TODO-LINT: move to async function

      logger.info(`CI Type created: ${ciType.name}`);
      return ciType;
    } catch (error) {
      logger.error('Error creating CI Type:', error);
      throw new Error('Failed to create CI Type');
    }
  }

  /**
   * Get Business Services
   */
  async getBusinessServices() {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      return await client.businessService.findMany({
        include: {
          configurationItems: {
            include: {
              configurationItem: true
            }
          }
        },
        orderBy: { name: 'asc' }
      }); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error fetching Business Services:', error);
      throw new Error('Failed to fetch Business Services');
    }
  }

  /**
   * Get CMDB Health Metrics
   */
  async getCmdbHealth() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate metrics
      const [
        totalCis,
        activeCis,
        staleCis,
        orphanedCis,
        totalRelationships,
        discoveredCis
      ] = await Promise.all([
        this._getClients().then(({ client }) => client.configurationItem.count()),
        this._getClients().then(({ client }) => client.configurationItem.count({ where: { ciStatus: 'Active' } })),
        this._getClients().then(({ client }) => client.configurationItem.count({
          where: {
            updatedAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
            }
          }
        })),
        this._getOrphanedCisCount(),
        this._getClients().then(({ client }) => client.ciRelationship.count({ where: { isActive: true } })),
        this._getClients().then(({ client }) => client.configurationItem.count({ where: { isDiscovered: true } }))
      ]); // TODO-LINT: move to async function

      // Calculate completeness score (percentage of CIs with required fields)
      const completenessScore = await this._calculateCompletenessScore(); // TODO-LINT: move to async function

      const health = {
        metricDate: today,
        totalCis,
        activeCis,
        staleCis,
        orphanedCis,
        totalRelationships,
        discoveredRelationships: 0, // Will be calculated based on discovery source
        manualRelationships: totalRelationships,
        discoveredCis,
        manualCis: totalCis - discoveredCis,
        completenessScore,
        accuracyScore: this._calculateAccuracyScore({
          totalCis,
          activeCis,
          staleCis,
          orphanedCis,
          completenessScore
        })
      };

      // Store the health record
      await this._getClients().then(({ client }) => client.cmdbHealth.create({
        data: health
      })); // TODO-LINT: move to async function

      return health;
    } catch (error) {
      logger.error('Error calculating CMDB health:', error);
      throw new Error('Failed to calculate CMDB health');
    }
  }

  // ============================================================================
  // CI OWNERSHIP MANAGEMENT
  // ============================================================================

  async assignOwnership(ciId, ownershipData) {
    const {
      ownershipType,
      userId,
      supportGroupId,
      isPrimary = false,
      startDate,
      responsibilities = [],
      assignedBy
    } = ownershipData;

    // Validate user exists in core database
    if (userId) {
      const { coreDb } = await this._getClients(); // TODO-LINT: move to async function
      const user = await coreDb.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      }); // TODO-LINT: move to async function
      if (!user) {
        throw new Error('User not found');
      }
    }

    // Validate support group exists
    if (supportGroupId) {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      const supportGroup = await client.supportGroup.findUnique({
        where: { id: supportGroupId }
      }); // TODO-LINT: move to async function
      if (!supportGroup) {
        throw new Error('Support group not found');
      }
    }

    // Check for existing ownership of the same type
    const { client } = await this._getClients(); // TODO-LINT: move to async function
    const existingOwnership = await client.ciOwnership.findUnique({
      where: {
        ciId_ownershipType_userId: {
          ciId,
          ownershipType,
          userId
        }
      }
    }); // TODO-LINT: move to async function

    if (existingOwnership) {
      throw new Error('User already has this ownership type for this CI');
    }

    const ownership = await client.ciOwnership.create({
      data: {
        ciId,
        ownershipType,
        userId,
        supportGroupId,
        isPrimary,
        startDate,
        responsibilities,
        assignedBy
      }
    }); // TODO-LINT: move to async function

    return ownership;
  }

  async removeOwnership(ciId, ownershipType, userId) {
    const { client } = await this._getClients(); // TODO-LINT: move to async function
    await client.ciOwnership.delete({
      where: {
        ciId_ownershipType_userId: {
          ciId,
          ownershipType,
          userId
        }
      }
    }); // TODO-LINT: move to async function

    return { success: true };
  }

  async updateOwnership(ciId, ownershipType, userId, updateData) {
    const { client } = await this._getClients(); // TODO-LINT: move to async function
    const ownership = await client.ciOwnership.update({
      where: {
        ciId_ownershipType_userId: {
          ciId,
          ownershipType,
          userId
        }
      },
      data: updateData
    }); // TODO-LINT: move to async function

    return ownership;
  }

  async getCiOwnership(ciId) {
    const { client } = await this._getClients(); // TODO-LINT: move to async function
    const ownership = await client.ciOwnership.findMany({
      where: { ciId, isActive: true },
      include: {
        supportGroup: {
          select: {
            id: true,
            name: true,
            type: true,
            email: true
          }
        }
      }
    }); // TODO-LINT: move to async function

    // Enrich with user details from core database
    const enrichedOwnership = await Promise.all(
      ownership.map(async (owner) => {
        const { coreDb } = await this._getClients(); // TODO-LINT: move to async function
        const user = await coreDb.user.findUnique({
          where: { id: owner.userId },
          select: { id: true, name: true, email: true, department: true }
        }); // TODO-LINT: move to async function
        return { ...owner, user };
      })
    );

    return enrichedOwnership;
  }

  async getUserOwnedCis(userId, ownershipType = null) {
    const { client } = await this._getClients(); // TODO-LINT: move to async function
    const where = {
      userId,
      isActive: true,
      ...(ownershipType && { ownershipType })
    };

    const ownership = await client.ciOwnership.findMany({
      where,
      include: {
        configurationItem: {
          include: {
            ciType_rel: true
          }
        }
      }
    }); // TODO-LINT: move to async function

    return ownership.map(owner => ({
      ...owner.configurationItem,
      ownershipDetails: {
        ownershipType: owner.ownershipType,
        isPrimary: owner.isPrimary,
        responsibilities: owner.responsibilities,
        assignedAt: owner.assignedAt
      }
    }));
  }  /**
   * Build WHERE clause for CI filtering
   */
  _buildCiWhereClause(filters) {
    const where = {};

    if (filters.ciType) {
      where.ciType = filters.ciType;
    }

    if (filters.status) {
      where.ciStatus = filters.status;
    }

    if (filters.environment) {
      where.environment = filters.environment;
    }

    if (filters.criticality) {
      where.criticality = filters.criticality;
    }

    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive'
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search, mode: 'insensitive' } },
        { assetTag: { contains: filters.search, mode: 'insensitive' } },
        { ciId: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return where;
  }

  /**
   * Heuristic accuracy score based on CI health metrics
   */
  _calculateAccuracyScore({ totalCis, activeCis, staleCis, orphanedCis, completenessScore }) {
    if (!totalCis || totalCis <= 0) return 0;
    const freshness = 1 - Math.min(1, staleCis / Math.max(1, totalCis));
    const integrity = 1 - Math.min(1, orphanedCis / Math.max(1, totalCis));
    const activity = Math.min(1, activeCis / Math.max(1, totalCis));
    const completeness = Math.max(0, Math.min(1, completenessScore));
    const score = 0.35 * freshness + 0.25 * integrity + 0.2 * activity + 0.2 * completeness;
    return Math.round(score * 100);
  }

  /**
   * Generate unique CI ID
   */
  async _generateCiId() {
    const prefix = 'CI';
    let ciId;
    let exists = true;

    while (exists) {
      const number = Math.floor(100000 + Math.random() * 900000);
      ciId = `${prefix}${number}`;
      
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      const existing = await client.configurationItem.findUnique({
        where: { ciId }
      }); // TODO-LINT: move to async function
      exists = !!existing;
    }

    return ciId;
  }

  /**
   * Check if string is UUID
   */
  _isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Create audit log entry
   */
  async _createAuditLog(ciId, operation, fieldName, oldValue, newValue, changedBy) {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      await client.ciAuditLog.create({
        data: {
          ciId,
          operation,
          fieldName,
          oldValue: oldValue ? String(oldValue) : null,
          newValue: newValue ? String(newValue) : null,
          changedBy
        }
      }); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error creating audit log:', error);
    }
  }

  /**
   * Create audit logs for updated fields
   */
  async _createUpdateAuditLogs(existingCi, updateData, changedBy) {
    const auditPromises = [];

    for (const [field, newValue] of Object.entries(updateData)) {
      if (field === 'updatedBy' || field === 'updatedAt') continue;
      
      const oldValue = existingCi[field];
      if (oldValue !== newValue) {
        auditPromises.push(
          this._createAuditLog(existingCi.id, 'UPDATE', field, oldValue, newValue, changedBy)
        );
      }
    }

    await Promise.all(auditPromises); // TODO-LINT: move to async function
  }

  /**
   * Get count of orphaned CIs (no relationships)
   */
  async _getOrphanedCisCount() {
    try {
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      const result = await client.configurationItem.findMany({
        where: {
          AND: [
            {
              outgoingRelationships: {
                none: { isActive: true }
              }
            },
            {
              incomingRelationships: {
                none: { isActive: true }
              }
            }
          ]
        },
        select: { id: true }
      }); // TODO-LINT: move to async function
      
      return result.length;
    } catch (error) {
      logger.error('Error counting orphaned CIs:', error);
      return 0;
    }
  }

  /**
   * Calculate data completeness score
   */
  async _calculateCompletenessScore() {
    try {
      const requiredFields = ['name', 'ciType', 'environment', 'owner'];
      
      const { client } = await this._getClients(); // TODO-LINT: move to async function
      const totalCis = await client.configurationItem.count(); // TODO-LINT: move to async function
      if (totalCis === 0) return 100;

      let completeCount = 0;
      
      const cis = await client.configurationItem.findMany({
        select: {
          name: true,
          ciType: true,
          environment: true,
          owner: true
        }
      }); // TODO-LINT: move to async function

      for (const ci of cis) {
        const isComplete = requiredFields.every(field => 
          ci[field] && ci[field].trim() !== ''
        );
        
        if (isComplete) {
          completeCount++;
        }
      }

      return Math.round((completeCount / totalCis) * 100 * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      logger.error('Error calculating completeness score:', error);
      return 0;
    }
  }
}

export { CmdbService };
