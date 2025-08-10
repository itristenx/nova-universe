import { PrismaClient as CmdbPrismaClient } from '../../../../prisma/generated/cmdb/index.js';
import { PrismaClient as CorePrismaClient } from '../../../../prisma/generated/core/index.js';
import { logger } from '../../logger.js';

// Initialize database clients
const coreClient = new CorePrismaClient();

const cmdbClient = new CmdbPrismaClient();

class SupportGroupService {
  constructor() {
    this.coreDb = coreClient;
    this.cmdbDb = cmdbClient;
  }

  // ============================================================================
  // SUPPORT GROUP MANAGEMENT
  // ============================================================================

  async createSupportGroup(data) {
    const {
      name,
      description,
      type = 'technical',
      email,
      phone,
      manager,
      escalationGroup,
      businessHours,
      slaTarget,
      externalId,
      adGroupDn,
      members = [],
      permissions = [],
      createdBy
    } = data;

    // Validate manager exists in core.User
    if (manager) {
      const managerUser = await this.coreDb.user.findUnique({
        where: { id: manager }
      });
      if (!managerUser) {
        throw new Error('Manager user not found');
      }
    }

    // Validate escalation group exists
    if (escalationGroup) {
      const escalationGroupExists = await this.cmdbDb.supportGroup.findUnique({
        where: { id: escalationGroup }
      });
      if (!escalationGroupExists) {
        throw new Error('Escalation group not found');
      }
    }

    // Create support group with members and permissions
    const supportGroup = await this.cmdbDb.supportGroup.create({
      data: {
        name,
        description,
        type,
        email,
        phone,
        manager,
        escalationGroup,
        businessHours,
        slaTarget,
        externalId,
        adGroupDn,
        createdBy,
        members: {
          create: members.map(member => ({
            userId: member.userId,
            role: member.role || 'member',
            isPrimary: member.isPrimary || false,
            startDate: member.startDate,
            assignedBy: createdBy
          }))
        },
        permissions: {
          create: permissions.map(permission => ({
            resource: permission.resource,
            action: permission.action,
            scope: permission.scope,
            conditions: permission.conditions,
            grantedBy: createdBy
          }))
        }
      },
      include: {
        members: true,
        permissions: true,
        escalationTarget: true,
        escalationSource: true
      }
    });

    return supportGroup;
  }

  async updateSupportGroup(id, data) {
    const {
      name,
      description,
      type,
      email,
      phone,
      manager,
      escalationGroup,
      businessHours,
      slaTarget,
      isActive,
      externalId,
      adGroupDn,
      updatedBy
    } = data;

    // Validate manager exists if provided
    if (manager) {
      const managerUser = await this.coreDb.user.findUnique({
        where: { id: manager }
      });
      if (!managerUser) {
        throw new Error('Manager user not found');
      }
    }

    const supportGroup = await this.cmdbDb.supportGroup.update({
      where: { id },
      data: {
        name,
        description,
        type,
        email,
        phone,
        manager,
        escalationGroup,
        businessHours,
        slaTarget,
        isActive,
        externalId,
        adGroupDn,
        updatedBy
      },
      include: {
        members: true,
        permissions: true,
        escalationTarget: true,
        escalationSource: true
      }
    });

    return supportGroup;
  }

  async deleteSupportGroup(id) {
    // Check if group is referenced by any CIs
    const ciCount = await this.cmdbDb.ciOwnership.count({
      where: { supportGroupId: id }
    });

    if (ciCount > 0) {
      throw new Error('Cannot delete support group - it is assigned to configuration items');
    }

    await this.cmdbDb.supportGroup.delete({
      where: { id }
    });

    return { success: true };
  }

  async getSupportGroup(id) {
    const supportGroup = await this.cmdbDb.supportGroup.findUnique({
      where: { id },
      include: {
        members: true,
        permissions: true,
        escalationTarget: true,
        escalationSource: true,
        configurationItems: {
          include: {
            ciType_rel: true
          }
        }
      }
    });

    if (!supportGroup) {
      throw new Error('Support group not found');
    }

    // Enrich with user details from core database
    const enrichedMembers = await Promise.all(
      supportGroup.members.map(async (member) => {
        const user = await this.coreDb.user.findUnique({
          where: { id: member.userId },
          select: { id: true, name: true, email: true, department: true }
        });
        return { ...member, user };
      })
    );

    return {
      ...supportGroup,
      members: enrichedMembers
    };
  }

  async listSupportGroups(filters = {}) {
    const {
      type,
      isActive = true,
      search,
      page = 1,
      limit = 50
    } = filters;

    const where = {
      isActive,
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [supportGroups, total] = await Promise.all([
      this.cmdbDb.supportGroup.findMany({
        where,
        include: {
          members: true,
          permissions: true,
          _count: {
            select: {
              configurationItems: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      this.cmdbDb.supportGroup.count({ where })
    ]);

    return {
      supportGroups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // ============================================================================
  // SUPPORT GROUP MEMBERSHIP MANAGEMENT
  // ============================================================================

  async addMember(supportGroupId, userData) {
    const { userId, role = 'member', isPrimary = false, startDate, assignedBy } = userData;

    // Validate user exists in core database
    const user = await this.coreDb.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already a member
    const existingMembership = await this.cmdbDb.supportGroupMember.findUnique({
      where: {
        supportGroupId_userId: {
          supportGroupId,
          userId
        }
      }
    });

    if (existingMembership) {
      throw new Error('User is already a member of this support group');
    }

    const member = await this.cmdbDb.supportGroupMember.create({
      data: {
        supportGroupId,
        userId,
        role,
        isPrimary,
        startDate,
        assignedBy
      }
    });

    return { ...member, user };
  }

  async removeMember(supportGroupId, userId) {
    await this.cmdbDb.supportGroupMember.delete({
      where: {
        supportGroupId_userId: {
          supportGroupId,
          userId
        }
      }
    });

    return { success: true };
  }

  async updateMemberRole(supportGroupId, userId, roleData) {
    const { role, isPrimary, endDate } = roleData;

    const member = await this.cmdbDb.supportGroupMember.update({
      where: {
        supportGroupId_userId: {
          supportGroupId,
          userId
        }
      },
      data: {
        role,
        isPrimary,
        endDate,
        isActive: !endDate
      }
    });

    return member;
  }

  // ============================================================================
  // SUPPORT GROUP PERMISSIONS MANAGEMENT
  // ============================================================================

  async addPermission(supportGroupId, permissionData) {
    const { resource, action, scope, conditions, grantedBy } = permissionData;

    const permission = await this.cmdbDb.supportGroupPermission.create({
      data: {
        supportGroupId,
        resource,
        action,
        scope,
        conditions,
        grantedBy
      }
    });

    return permission;
  }

  async removePermission(supportGroupId, resource, action) {
    await this.cmdbDb.supportGroupPermission.delete({
      where: {
        supportGroupId_resource_action: {
          supportGroupId,
          resource,
          action
        }
      }
    });

    return { success: true };
  }

  async getUserPermissions(userId) {
    // Get all support groups the user belongs to
    const memberships = await this.cmdbDb.supportGroupMember.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        supportGroup: {
          include: {
            permissions: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    // Aggregate permissions from all groups
    const permissions = {};
    memberships.forEach(membership => {
      membership.supportGroup.permissions.forEach(permission => {
        const key = `${permission.resource}:${permission.action}`;
        if (!permissions[key]) {
          permissions[key] = {
            resource: permission.resource,
            action: permission.action,
            scopes: [],
            conditions: []
          };
        }
        if (permission.scope) {
          permissions[key].scopes.push(permission.scope);
        }
        if (permission.conditions) {
          permissions[key].conditions.push(permission.conditions);
        }
      });
    });

    return Object.values(permissions);
  }

  async checkPermission(userId, resource, action, context = {}) {
    const permissions = await this.getUserPermissions(userId);
    
    const hasPermission = permissions.some(permission => {
      if (permission.resource !== resource || permission.action !== action) {
        return false;
      }

      // Check scope restrictions
      if (permission.scopes.length > 0) {
        const scopeMatch = permission.scopes.some(scope => {
          // Implement scope checking logic based on context
          if (scope.startsWith('ci_type:')) {
            const allowedType = scope.split(':')[1];
            return context.ciType === allowedType;
          }
          if (scope.startsWith('location:')) {
            const allowedLocation = scope.split(':')[1];
            return context.location === allowedLocation;
          }
          return true;
        });
        if (!scopeMatch) return false;
      }

      // Check additional conditions
      if (permission.conditions.length > 0) {
        return permission.conditions.every(condition => {
          // Implement condition checking logic
          return this.evaluateCondition(condition, context);
        });
      }

      return true;
    });

    return hasPermission;
  }

  evaluateCondition(condition, context) {
    // Simple condition evaluation - can be extended
    try {
      if (condition.field && condition.operator && condition.value) {
        const contextValue = context[condition.field];
        switch (condition.operator) {
          case 'equals':
            return contextValue === condition.value;
          case 'contains':
            return contextValue && contextValue.includes(condition.value);
          case 'in':
            return Array.isArray(condition.value) && condition.value.includes(contextValue);
          default:
            return true;
        }
      }
      return true;
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }
}

export { SupportGroupService };
