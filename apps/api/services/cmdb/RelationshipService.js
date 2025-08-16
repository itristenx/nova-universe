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

const clientPromise = getCmdbPrisma();

export class RelationshipService {
  constructor() {
    this.clientPromise = clientPromise;
  }

  /**
   * Get relationships for a Configuration Item
   */
  async getCiRelationships(ciId, options = {}) {
    try {
      const client = await this.clientPromise; // TODO-LINT: move to async function
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const where = this._isUUID(ciId) 
        ? { id: ciId }
        : { ciId: ciId };

      // First, find the CI
      const ci = await client.configurationItem.findFirst({ where }); // TODO-LINT: move to async function
      if (!ci) {
        throw new Error('Configuration Item not found');
      }

      const relationshipWhere = { isActive: true };
      if (options.relationshipType) {
        relationshipWhere.relationshipType = { name: options.relationshipType };
      }

      let relationships = [];

      if (options.direction === 'outgoing' || options.direction === 'both') {
        const outgoing = await client.ciRelationship.findMany({
          where: { sourceCiId: ci.id, ...relationshipWhere },
          include: { targetCi: { include: { ciType_rel: true } }, relationshipType: true }
        }); // TODO-LINT: move to async function

        relationships = relationships.concat(
          outgoing.map(rel => ({ ...rel, direction: 'outgoing', relatedCi: rel.targetCi }))
        );
      }

      if (options.direction === 'incoming' || options.direction === 'both') {
        const incoming = await client.ciRelationship.findMany({
          where: { targetCiId: ci.id, ...relationshipWhere },
          include: { sourceCi: { include: { ciType_rel: true } }, relationshipType: true }
        }); // TODO-LINT: move to async function

        relationships = relationships.concat(
          incoming.map(rel => ({ ...rel, direction: 'incoming', relatedCi: rel.sourceCi }))
        );
      }

      return relationships;
    } catch (error) {
      logger.error('Error fetching CI relationships:', error);
      throw new Error('Failed to fetch CI relationships');
    }
  }

  /**
   * Create a relationship between two CIs
   */
  async createRelationship(relationshipData) {
    try {
      const client = await this.clientPromise; // TODO-LINT: move to async function
      if (!client) throw new Error('CMDB Prisma client unavailable');
      // Validate source and target CIs exist
      const [sourceCi, targetCi] = await Promise.all([
        client.configurationItem.findFirst({
          where: this._isUUID(relationshipData.sourceCiId) ? { id: relationshipData.sourceCiId } : { ciId: relationshipData.sourceCiId }
        }),
        client.configurationItem.findFirst({
          where: this._isUUID(relationshipData.targetCiId) ? { id: relationshipData.targetCiId } : { ciId: relationshipData.targetCiId }
        })
      ]); // TODO-LINT: move to async function

      if (!sourceCi) {
        throw new Error('Source Configuration Item not found');
      }
      if (!targetCi) {
        throw new Error('Target Configuration Item not found');
      }

      // Validate relationship type exists
      const relationshipType = await client.ciRelationshipType.findUnique({ where: { id: relationshipData.relationshipTypeId } }); // TODO-LINT: move to async function

      if (!relationshipType) {
        throw new Error('Relationship type not found');
      }

      // Check if relationship already exists
      const existingRelationship = await client.ciRelationship.findFirst({
        where: {
          sourceCiId: sourceCi.id,
          targetCiId: targetCi.id,
          relationshipTypeId: relationshipData.relationshipTypeId,
          isActive: true
        }
      }); // TODO-LINT: move to async function

      if (existingRelationship) {
        throw new Error('Relationship already exists between these CIs');
      }

      // Validate relationship type constraints
      await this._validateRelationshipConstraints(sourceCi, targetCi, relationshipType); // TODO-LINT: move to async function

      // Create the relationship
      const relationship = await client.ciRelationship.create({
        data: {
          sourceCiId: sourceCi.id,
          targetCiId: targetCi.id,
          relationshipTypeId: relationshipData.relationshipTypeId,
          description: relationshipData.description,
          criticality: relationshipData.criticality,
          createdBy: relationshipData.createdBy
        },
        include: { sourceCi: true, targetCi: true, relationshipType: true }
      }); // TODO-LINT: move to async function

      logger.info(`Relationship created: ${sourceCi.ciId} -> ${targetCi.ciId} (${relationshipType.name})`);
      return relationship;
    } catch (error) {
      logger.error('Error creating relationship:', error);
      throw new Error(`Failed to create relationship: ${error.message}`);
    }
  }

  /**
   * Delete a relationship
   */
  async deleteRelationship(relationshipId, deletedBy) {
    try {
      const client = await this.clientPromise; // TODO-LINT: move to async function
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const relationship = await client.ciRelationship.findUnique({
        where: { id: relationshipId },
        include: { sourceCi: true, targetCi: true, relationshipType: true }
      }); // TODO-LINT: move to async function

      if (!relationship) {
        return false;
      }

      await client.ciRelationship.update({
        where: { id: relationshipId },
        data: { isActive: false, updatedAt: new Date() }
      }); // TODO-LINT: move to async function

      logger.info(`Relationship deleted: ${relationship.sourceCi.ciId} -> ${relationship.targetCi.ciId} (${relationship.relationshipType.name})`);
      return true;
    } catch (error) {
      logger.error('Error deleting relationship:', error);
      throw new Error('Failed to delete relationship');
    }
  }

  /**
   * Get all relationship types
   */
  async getRelationshipTypes() {
    try {
      const client = await this.clientPromise; // TODO-LINT: move to async function
      if (!client) throw new Error('CMDB Prisma client unavailable');
      return await client.ciRelationshipType.findMany({
        include: { sourceCiType: true, targetCiType: true },
        orderBy: { name: 'asc' }
      }); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Error fetching relationship types:', error);
      throw new Error('Failed to fetch relationship types');
    }
  }

  /**
   * Create a new relationship type
   */
  async createRelationshipType(typeData) {
    try {
      const client = await this.clientPromise; // TODO-LINT: move to async function
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const relationshipType = await client.ciRelationshipType.create({
        data: typeData,
        include: {
          sourceCiType: true,
          targetCiType: true
        }
      }); // TODO-LINT: move to async function

      logger.info(`Relationship type created: ${relationshipType.name}`);
      return relationshipType;
    } catch (error) {
      logger.error('Error creating relationship type:', error);
      throw new Error('Failed to create relationship type');
    }
  }

  /**
   * Perform impact analysis for a CI
   */
  async performImpactAnalysis(ciId, depth = 3) {
    try {
      const client = await this.clientPromise; // TODO-LINT: move to async function
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const where = this._isUUID(ciId) ? { id: ciId } : { ciId: ciId };
      const rootCi = await client.configurationItem.findFirst({ where, include: { ciType_rel: true } }); // TODO-LINT: move to async function

      if (!rootCi) {
        throw new Error('Configuration Item not found');
      }

      const impactMap = new Map();
      const visited = new Set();
      
      await this._traverseRelationships(rootCi, 0, depth, impactMap, visited); // TODO-LINT: move to async function

      // Convert map to array and categorize by impact level
      const impactLevels = {
        direct: [],     // depth 1
        indirect: [],   // depth 2
        extended: []    // depth 3+
      };

      for (const [ciId, impactData] of impactMap) {
        if (impactData.depth === 1) {
          impactLevels.direct.push(impactData);
        } else if (impactData.depth === 2) {
          impactLevels.indirect.push(impactData);
        } else {
          impactLevels.extended.push(impactData);
        }
      }

      // Calculate business service impact
      const businessServiceImpact = await this._calculateBusinessServiceImpact(rootCi.id, impactMap); // TODO-LINT: move to async function

      return {
        rootCi,
        impactLevels,
        businessServiceImpact,
        totalImpactedCis: impactMap.size,
        analysisDepth: depth,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error performing impact analysis:', error);
      throw new Error(`Failed to perform impact analysis: ${error.message}`);
    }
  }

  /**
   * Get dependency tree for a CI
   */
  async getDependencyTree(ciId, direction = 'both', depth = 3) {
    try {
      const client = await this.clientPromise; // TODO-LINT: move to async function
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const where = this._isUUID(ciId) ? { id: ciId } : { ciId: ciId };
      const rootCi = await client.configurationItem.findFirst({ where, include: { ciType_rel: true } }); // TODO-LINT: move to async function

      if (!rootCi) {
        throw new Error('Configuration Item not found');
      }

      const tree = await this._buildDependencyTree(rootCi, direction, depth, new Set()); // TODO-LINT: move to async function

      return tree;
    } catch (error) {
      logger.error('Error building dependency tree:', error);
      throw new Error('Failed to build dependency tree');
    }
  }

  /**
   * Validate relationships for circular dependencies
   */
  async validateCircularDependencies(sourceCiId, targetCiId) {
    try {
      const visited = new Set();
      const hasCircular = await this._checkCircularDependency(targetCiId, sourceCiId, visited); // TODO-LINT: move to async function
      
      return {
        hasCircularDependency: hasCircular,
        validationPassed: !hasCircular
      };
    } catch (error) {
      logger.error('Error validating circular dependencies:', error);
      throw new Error('Failed to validate circular dependencies');
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Check if string is UUID
   */
  _isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Validate relationship type constraints
   */
  async _validateRelationshipConstraints(sourceCi, targetCi, relationshipType) {
    // Check CI type constraints
    if (relationshipType.sourceCiTypeId && sourceCi.ciType !== relationshipType.sourceCiTypeId) {
      throw new Error(`Source CI type ${sourceCi.ciType} is not allowed for relationship type ${relationshipType.name}`);
    }

    if (relationshipType.targetCiTypeId && targetCi.ciType !== relationshipType.targetCiTypeId) {
      throw new Error(`Target CI type ${targetCi.ciType} is not allowed for relationship type ${relationshipType.name}`);
    }

    // Check multiple relationship constraint
    if (!relationshipType.allowMultiple) {
      const client = await this.clientPromise; // TODO-LINT: move to async function
      if (!client) return;
      const existingCount = await client.ciRelationship.count({
        where: {
          sourceCiId: sourceCi.id,
          relationshipTypeId: relationshipType.id,
          isActive: true
        }
      }); // TODO-LINT: move to async function

      if (existingCount > 0) {
        throw new Error(`Only one ${relationshipType.name} relationship is allowed from this CI`);
      }
    }
  }

  /**
   * Traverse relationships for impact analysis
   */
  async _traverseRelationships(ci, currentDepth, maxDepth, impactMap, visited) {
    if (currentDepth >= maxDepth || visited.has(ci.id)) {
      return;
    }

    visited.add(ci.id);

    if (currentDepth > 0) {
      impactMap.set(ci.id, { ci, depth: currentDepth, impactType: this._determineImpactType(ci, currentDepth) });
    }

    const client = await this.clientPromise; // TODO-LINT: move to async function
    if (!client) return;

    // Get all outgoing relationships (dependencies)
    const outgoingRelationships = await client.ciRelationship.findMany({
      where: { sourceCiId: ci.id, isActive: true },
      include: { targetCi: { include: { ciType_rel: true } }, relationshipType: true }
    }); // TODO-LINT: move to async function

    // Recursively traverse dependencies
    for (const rel of outgoingRelationships) {
      await this._traverseRelationships(
        rel.targetCi, 
        currentDepth + 1, 
        maxDepth, 
        impactMap, 
        visited
      ); // TODO-LINT: move to async function
    }

    visited.delete(ci.id);
  }

  /**
   * Calculate business service impact
   */
  async _calculateBusinessServiceImpact(ciId, impactMap) {
    try {
      const client = await this.clientPromise; // TODO-LINT: move to async function
      if (!client) return [];
      const allCiIds = [ciId, ...Array.from(impactMap.keys())];
      
      const businessServices = await client.ciBusinessService.findMany({
        where: {
          ciId: { in: allCiIds }
        },
        include: {
          businessService: true,
          configurationItem: true
        }
      }); // TODO-LINT: move to async function

      const serviceImpact = {};
      
      for (const service of businessServices) {
        if (!serviceImpact[service.businessService.id]) {
          serviceImpact[service.businessService.id] = {
            service: service.businessService,
            impactedCis: [],
            criticalityLevel: 'Low'
          };
        }

        serviceImpact[service.businessService.id].impactedCis.push({
          ci: service.configurationItem,
          criticality: service.criticality
        });

        // Update criticality level
        if (service.criticality === 'Critical' || service.criticality === 'High') {
          serviceImpact[service.businessService.id].criticalityLevel = 'High';
        }
      }

      return Object.values(serviceImpact);
    } catch (error) {
      logger.error('Error calculating business service impact:', error);
      return [];
    }
  }

  /**
   * Build dependency tree recursively
   */
  async _buildDependencyTree(ci, direction, remainingDepth, visited) {
    if (remainingDepth <= 0 || visited.has(ci.id)) {
      return { ci, children: [] };
    }

    visited.add(ci.id);

    const client = await this.clientPromise; // TODO-LINT: move to async function
    if (!client) return { ci, children: [] };

    const children = [];
    
    if (direction === 'outgoing' || direction === 'both') {
      const outgoingRels = await client.ciRelationship.findMany({
        where: { sourceCiId: ci.id, isActive: true },
        include: { targetCi: { include: { ciType_rel: true } }, relationshipType: true }
      }); // TODO-LINT: move to async function

      for (const rel of outgoingRels) {
        const childTree = await this._buildDependencyTree(
          rel.targetCi, 
          direction, 
          remainingDepth - 1, 
          visited
        ); // TODO-LINT: move to async function
        children.push({
          ...childTree,
          relationship: rel,
          direction: 'outgoing'
        });
      }
    }

    if (direction === 'incoming' || direction === 'both') {
      const incomingRels = await client.ciRelationship.findMany({
        where: { targetCiId: ci.id, isActive: true },
        include: { sourceCi: { include: { ciType_rel: true } }, relationshipType: true }
      }); // TODO-LINT: move to async function

      for (const rel of incomingRels) {
        const childTree = await this._buildDependencyTree(
          rel.sourceCi, 
          direction, 
          remainingDepth - 1, 
          visited
        ); // TODO-LINT: move to async function
        children.push({
          ...childTree,
          relationship: rel,
          direction: 'incoming'
        });
      }
    }

    visited.delete(ci.id);

    return {
      ci,
      children
    };
  }

  /**
   * Check for circular dependencies
   */
  async _checkCircularDependency(currentCiId, targetCiId, visited) {
    if (currentCiId === targetCiId) {
      return true;
    }

    if (visited.has(currentCiId)) {
      return false;
    }

    visited.add(currentCiId);

    const client = await this.clientPromise; // TODO-LINT: move to async function
    if (!client) return false;

    const relationships = await client.ciRelationship.findMany({ where: { sourceCiId: currentCiId, isActive: true } }); // TODO-LINT: move to async function

    for (const rel of relationships) {
      if (await this._checkCircularDependency(rel.targetCiId, targetCiId, visited)) {
        return true; // TODO-LINT: move to async function
      }
    }

    visited.delete(currentCiId);
    return false;
  }

  /**
   * Determine impact type based on CI and depth
   */
  _determineImpactType(ci, depth) {
    if (ci.criticality === 'Critical') {
      return depth === 1 ? 'Critical' : 'High';
    } else if (ci.criticality === 'High') {
      return depth <= 2 ? 'High' : 'Medium';
    } else {
      return depth <= 2 ? 'Medium' : 'Low';
    }
  }
}
