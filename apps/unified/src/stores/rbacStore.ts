import { create } from 'zustand';
import {
  User,
  Role,
  Permission,
  Group,
  ApprovalFlow,
  ApprovalInstance,
  FeatureFlag,
  SystemConfiguration,
  AuditLog,
  STANDARD_ROLES,
  ApprovalAuditEntry,
  FeatureFlagOverride,
  AdminModule,
} from '../types/rbac';

interface RBACStore {
  // Current User & Session
  currentUser: User | null;
  isAuthenticated: boolean;
  userPermissions: string[];
  userRoles: string[];

  // Users & Groups
  users: User[];
  roles: Role[];
  permissions: Permission[];
  groups: Group[];

  // Approval System
  approvalFlows: ApprovalFlow[];
  approvalInstances: ApprovalInstance[];

  // Feature Flags
  featureFlags: FeatureFlag[];
  featureFlagOverrides: FeatureFlagOverride[];

  // System Configuration
  systemConfig: SystemConfiguration[];
  adminModules: AdminModule[];

  // Audit & Compliance
  auditLogs: AuditLog[];

  // Authentication & Session Management
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkPermission: (permission: string, resource?: string) => boolean;
  hasPermission: (permission: string, resource?: string) => boolean;
  hasRole: (roleName: string) => boolean;
  getCurrentUserRoles: () => Role[];

  // User Management
  createUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => string;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  lockUser: (id: string, reason: string) => void;
  unlockUser: (id: string) => void;
  resetPassword: (id: string) => void;
  assignRoleToUser: (userId: string, roleId: string) => void;
  removeRoleFromUser: (userId: string, roleId: string) => void;

  // Role Management
  createRole: (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => string;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  cloneRole: (id: string, newName: string) => string;
  assignPermissionToRole: (roleId: string, permissionId: string) => void;
  removePermissionFromRole: (roleId: string, permissionId: string) => void;

  // Permission Management
  createPermission: (permissionData: Omit<Permission, 'id'>) => string;
  updatePermission: (id: string, updates: Partial<Permission>) => void;
  deletePermission: (id: string) => void;

  // Group Management
  createGroup: (groupData: Omit<Group, 'id' | 'created_at' | 'updated_at'>) => string;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addUserToGroup: (groupId: string, userId: string) => void;
  removeUserFromGroup: (groupId: string, userId: string) => void;

  // Approval System
  createApprovalFlow: (
    flowData: Omit<ApprovalFlow, 'id' | 'created_at' | 'updated_at' | 'version'>,
  ) => string;
  updateApprovalFlow: (id: string, updates: Partial<ApprovalFlow>) => void;
  deleteApprovalFlow: (id: string) => void;
  startApproval: (
    flowId: string,
    recordId: string,
    recordTable: string,
    requestedBy: string,
  ) => string;
  approveRequest: (instanceId: string, stepId: string, comments?: string) => void;
  rejectRequest: (instanceId: string, stepId: string, reason: string) => void;
  delegateApproval: (instanceId: string, stepId: string, toUserId: string, reason: string) => void;
  escalateApproval: (instanceId: string, stepId: string, reason: string) => void;
  cancelApproval: (instanceId: string, reason: string) => void;
  getMyApprovals: () => ApprovalInstance[];
  getApprovalHistory: (recordId?: string) => ApprovalInstance[];

  // Feature Flags
  createFeatureFlag: (flagData: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>) => string;
  updateFeatureFlag: (id: string, updates: Partial<FeatureFlag>) => void;
  deleteFeatureFlag: (id: string) => void;
  isFeatureEnabled: (key: string, userId?: string, context?: Record<string, any>) => boolean;
  getFeatureFlagValue: <T>(
    key: string,
    defaultValue: T,
    userId?: string,
    context?: Record<string, any>,
  ) => T;
  createFeatureFlagOverride: (overrideData: Omit<FeatureFlagOverride, 'created_at'>) => void;
  removeFeatureFlagOverride: (flagId: string, userId?: string, groupId?: string) => void;

  // System Configuration
  createSystemConfig: (
    configData: Omit<SystemConfiguration, 'id' | 'created_at' | 'updated_at'>,
  ) => string;
  updateSystemConfig: (id: string, updates: Partial<SystemConfiguration>) => void;
  deleteSystemConfig: (id: string) => void;
  getConfigValue: <T>(key: string, defaultValue: T) => T;
  setConfigValue: (key: string, value: any, category?: string) => void;

  // Admin Interface
  getAdminModules: () => AdminModule[];
  createAdminModule: (moduleData: Omit<AdminModule, 'id'>) => string;
  updateAdminModule: (id: string, updates: Partial<AdminModule>) => void;

  // Audit & Compliance
  logAuditEvent: (
    action: string,
    resourceType: string,
    resourceId: string,
    beforeValue?: object,
    afterValue?: object,
  ) => void;
  getAuditLogs: (filters?: {
    userId?: string;
    action?: string;
    dateRange?: [Date, Date];
  }) => AuditLog[];
  generateComplianceReport: (type: string, startDate: Date, endDate: Date) => Promise<string>;

  // Utilities
  initializeStandardRoles: () => void;
  validateRolePermissions: (roleId: string) => boolean;
  getRoleHierarchy: () => Record<string, string[]>;
  exportConfiguration: () => object;
  importConfiguration: (config: object) => void;

  // Data Loading Methods
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setRoles: (roles: Role[]) => void;
  setPermissions: (permissions: Permission[]) => void;
  setGroups: (groups: Group[]) => void;
  setApprovalFlows: (flows: ApprovalFlow[]) => void;
  setFeatureFlags: (flags: FeatureFlag[]) => void;
}

export const useRBACStore = create<RBACStore>()((set, get) => ({
  // Initial state
  currentUser: null,
  isAuthenticated: false,
  userPermissions: [],
  userRoles: [],
  users: [],
  roles: [],
  permissions: [],
  groups: [],
  approvalFlows: [],
  approvalInstances: [],
  featureFlags: [],
  featureFlagOverrides: [],
  systemConfig: [],
  adminModules: [],
  auditLogs: [],

  // Authentication & Session Management
  login: async (username: string, _password: string) => {
    // Simulate authentication - in real app, this would call an API
    const user = get().users.find((u) => u.username === username && u.active && !u.locked_out);
    if (user) {
      const permissions = user.roles.flatMap((role) =>
        role.permissions.map((p) => `${p.resource}:${p.action}`),
      );
      const roleNames = user.roles.map((r) => r.name);

      set({
        currentUser: user,
        isAuthenticated: true,
        userPermissions: permissions,
        userRoles: roleNames,
      });

      get().logAuditEvent('login', 'user', user.id);
      return true;
    }
    return false;
  },

  logout: () => {
    const currentUser = get().currentUser;
    if (currentUser) {
      get().logAuditEvent('logout', 'user', currentUser.id);
    }

    set({
      currentUser: null,
      isAuthenticated: false,
      userPermissions: [],
      userRoles: [],
    });
  },

  checkPermission: (permission: string, _resource?: string) => {
    const { userPermissions, currentUser } = get();
    if (!currentUser) return false;

    // Admin has all permissions
    if (userPermissions.includes('*')) return true;

    // Check exact permission
    if (userPermissions.includes(permission)) return true;

    // Check wildcard permissions
    const [resourceType, action] = permission.split(':');
    if (userPermissions.includes(`${resourceType}:*`)) return true;
    if (userPermissions.includes(`*:${action}`)) return true;

    return false;
  },

  hasPermission: (permission: string, resource?: string) => {
    // Alias for checkPermission for backward compatibility
    return get().checkPermission(permission, resource);
  },

  hasRole: (roleName: string) => {
    return get().userRoles.includes(roleName);
  },

  getCurrentUserRoles: () => {
    return get().currentUser?.roles || [];
  },

  // User Management
  createUser: (userData) => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newUser: User = {
      ...userData,
      id,
      created_at: now,
      updated_at: now,
      failed_login_attempts: 0,
      locked_out: false,
    };

    set((state) => ({
      users: [...state.users, newUser],
    }));

    get().logAuditEvent('created', 'user', id, undefined, newUser);
    return id;
  },

  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates, updated_at: new Date() } : user,
      ),
    }));

    get().logAuditEvent('updated', 'user', id, undefined, updates);
  },

  deleteUser: (id) => {
    const user = get().users.find((u) => u.id === id);
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));

    get().logAuditEvent('deleted', 'user', id, user);
  },

  lockUser: (id, reason) => {
    get().updateUser(id, { locked_out: true });
    get().logAuditEvent('locked', 'user', id, undefined, { reason });
  },

  unlockUser: (id) => {
    get().updateUser(id, { locked_out: false, failed_login_attempts: 0 });
    get().logAuditEvent('unlocked', 'user', id);
  },

  resetPassword: (id) => {
    get().logAuditEvent('password_reset', 'user', id);
  },

  assignRoleToUser: (userId, roleId) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) return;

    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              roles: [...user.roles.filter((r) => r.id !== roleId), role],
              updated_at: new Date(),
            }
          : user,
      ),
    }));

    get().logAuditEvent('role_assigned', 'user', userId, undefined, {
      roleId,
      roleName: role.name,
    });
  },

  removeRoleFromUser: (userId, roleId) => {
    const role = get().roles.find((r) => r.id === roleId);

    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              roles: user.roles.filter((r) => r.id !== roleId),
              updated_at: new Date(),
            }
          : user,
      ),
    }));

    get().logAuditEvent('role_removed', 'user', userId, undefined, {
      roleId,
      roleName: role?.name,
    });
  },

  // Role Management
  createRole: (roleData) => {
    const id = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newRole: Role = {
      ...roleData,
      id,
      created_at: now,
      updated_at: now,
      created_by: get().currentUser?.id || 'system',
    };

    set((state) => ({
      roles: [...state.roles, newRole],
    }));

    get().logAuditEvent('created', 'role', id, undefined, newRole);
    return id;
  },

  updateRole: (id, updates) => {
    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === id ? { ...role, ...updates, updated_at: new Date() } : role,
      ),
    }));

    get().logAuditEvent('updated', 'role', id, undefined, updates);
  },

  deleteRole: (id) => {
    const role = get().roles.find((r) => r.id === id);

    // Remove role from all users
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== id),
      users: state.users.map((user) => ({
        ...user,
        roles: user.roles.filter((r) => r.id !== id),
      })),
    }));

    get().logAuditEvent('deleted', 'role', id, role);
  },

  cloneRole: (id, newName) => {
    const originalRole = get().roles.find((r) => r.id === id);
    if (!originalRole) return '';

    return get().createRole({
      ...originalRole,
      name: newName,
      type: 'custom',
    });
  },

  assignPermissionToRole: (roleId, permissionId) => {
    const permission = get().permissions.find((p) => p.id === permissionId);
    if (!permission) return;

    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: [...role.permissions.filter((p) => p.id !== permissionId), permission],
              updated_at: new Date(),
            }
          : role,
      ),
    }));

    get().logAuditEvent('permission_assigned', 'role', roleId, undefined, {
      permissionId,
      permissionName: permission.name,
    });
  },

  removePermissionFromRole: (roleId, permissionId) => {
    const permission = get().permissions.find((p) => p.id === permissionId);

    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: role.permissions.filter((p) => p.id !== permissionId),
              updated_at: new Date(),
            }
          : role,
      ),
    }));

    get().logAuditEvent('permission_removed', 'role', roleId, undefined, {
      permissionId,
      permissionName: permission?.name,
    });
  },

  // Permission Management
  createPermission: (permissionData) => {
    const id = `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newPermission: Permission = {
      ...permissionData,
      id,
    };

    set((state) => ({
      permissions: [...state.permissions, newPermission],
    }));

    get().logAuditEvent('created', 'permission', id, undefined, newPermission);
    return id;
  },

  updatePermission: (id, updates) => {
    set((state) => ({
      permissions: state.permissions.map((permission) =>
        permission.id === id ? { ...permission, ...updates } : permission,
      ),
    }));

    get().logAuditEvent('updated', 'permission', id, undefined, updates);
  },

  deletePermission: (id) => {
    const permission = get().permissions.find((p) => p.id === id);

    // Remove permission from all roles
    set((state) => ({
      permissions: state.permissions.filter((p) => p.id !== id),
      roles: state.roles.map((role) => ({
        ...role,
        permissions: role.permissions.filter((p) => p.id !== id),
      })),
    }));

    get().logAuditEvent('deleted', 'permission', id, permission);
  },

  // Group Management
  createGroup: (groupData) => {
    const id = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newGroup: Group = {
      ...groupData,
      id,
      created_at: now,
      updated_at: now,
    };

    set((state) => ({
      groups: [...state.groups, newGroup],
    }));

    get().logAuditEvent('created', 'group', id, undefined, newGroup);
    return id;
  },

  updateGroup: (id, updates) => {
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === id ? { ...group, ...updates, updated_at: new Date() } : group,
      ),
    }));

    get().logAuditEvent('updated', 'group', id, undefined, updates);
  },

  deleteGroup: (id) => {
    const group = get().groups.find((g) => g.id === id);
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    }));

    get().logAuditEvent('deleted', 'group', id, group);
  },

  addUserToGroup: (groupId, userId) => {
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: [...group.members.filter((m) => m !== userId), userId],
              updated_at: new Date(),
            }
          : group,
      ),
    }));

    get().logAuditEvent('user_added', 'group', groupId, undefined, { userId });
  },

  removeUserFromGroup: (groupId, userId) => {
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: group.members.filter((m) => m !== userId),
              updated_at: new Date(),
            }
          : group,
      ),
    }));

    get().logAuditEvent('user_removed', 'group', groupId, undefined, { userId });
  },

  // Approval System
  createApprovalFlow: (flowData) => {
    const id = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newFlow: ApprovalFlow = {
      ...flowData,
      id,
      version: 1,
      created_at: now,
      updated_at: now,
      created_by: get().currentUser?.id || 'system',
    };

    set((state) => ({
      approvalFlows: [...state.approvalFlows, newFlow],
    }));

    get().logAuditEvent('created', 'approval_flow', id, undefined, newFlow);
    return id;
  },

  updateApprovalFlow: (id, updates) => {
    set((state) => ({
      approvalFlows: state.approvalFlows.map((flow) =>
        flow.id === id
          ? { ...flow, ...updates, updated_at: new Date(), version: flow.version + 1 }
          : flow,
      ),
    }));

    get().logAuditEvent('updated', 'approval_flow', id, undefined, updates);
  },

  deleteApprovalFlow: (id) => {
    const flow = get().approvalFlows.find((f) => f.id === id);
    set((state) => ({
      approvalFlows: state.approvalFlows.filter((f) => f.id !== id),
    }));

    get().logAuditEvent('deleted', 'approval_flow', id, flow);
  },

  startApproval: (flowId, recordId, recordTable, requestedBy) => {
    const flow = get().approvalFlows.find((f) => f.id === flowId);
    if (!flow || !flow.active) return '';

    const instanceId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newInstance: ApprovalInstance = {
      id: instanceId,
      flow_id: flowId,
      record_id: recordId,
      record_table: recordTable,
      current_step: 0,
      status: 'pending',
      requested_by: requestedBy,
      created_at: now,
      updated_at: now,
      steps: flow.steps.map((step) => ({
        id: `step_${step.id}_${Date.now()}`,
        step_id: step.id,
        order: step.order,
        status: step.order === 0 ? 'pending' : 'pending',
        escalated: false,
      })),
      audit_trail: [
        {
          id: `audit_${Date.now()}`,
          timestamp: now,
          user_id: requestedBy,
          user_name: get().users.find((u) => u.id === requestedBy)?.username || 'Unknown',
          action: 'created',
          details: `Approval process started for ${recordTable} record ${recordId}`,
        },
      ],
      escalation_count: 0,
    };

    set((state) => ({
      approvalInstances: [...state.approvalInstances, newInstance],
    }));

    get().logAuditEvent('started', 'approval_instance', instanceId, undefined, newInstance);
    return instanceId;
  },

  approveRequest: (instanceId, stepId, comments) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const now = new Date();
    const auditEntry: ApprovalAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: now,
      user_id: currentUser.id,
      user_name: currentUser.username,
      action: 'approved',
      details: comments || 'Request approved',
    };

    set((state) => ({
      approvalInstances: state.approvalInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              updated_at: now,
              steps: instance.steps.map((step) =>
                step.step_id === stepId
                  ? {
                      ...step,
                      status: 'approved',
                      decision: 'approved',
                      approver_id: currentUser.id,
                      approver_name: currentUser.username,
                      comments,
                      decided_at: now,
                    }
                  : step,
              ),
              audit_trail: [...instance.audit_trail, auditEntry],
            }
          : instance,
      ),
    }));

    get().logAuditEvent('approved', 'approval_instance', instanceId, undefined, {
      stepId,
      comments,
    });
  },

  rejectRequest: (instanceId, stepId, reason) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const now = new Date();
    const auditEntry: ApprovalAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: now,
      user_id: currentUser.id,
      user_name: currentUser.username,
      action: 'rejected',
      details: reason || 'Request rejected',
    };

    set((state) => ({
      approvalInstances: state.approvalInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              status: 'rejected',
              updated_at: now,
              completed_at: now,
              steps: instance.steps.map((step) =>
                step.step_id === stepId
                  ? {
                      ...step,
                      status: 'rejected',
                      decision: 'rejected',
                      approver_id: currentUser.id,
                      approver_name: currentUser.username,
                      comments: reason,
                      decided_at: now,
                    }
                  : step,
              ),
              audit_trail: [...instance.audit_trail, auditEntry],
            }
          : instance,
      ),
    }));

    get().logAuditEvent('rejected', 'approval_instance', instanceId, undefined, { stepId, reason });
  },

  delegateApproval: (instanceId, stepId, toUserId, reason) => {
    const currentUser = get().currentUser;
    const targetUser = get().users.find((u) => u.id === toUserId);
    if (!currentUser || !targetUser) return;

    const now = new Date();
    const auditEntry: ApprovalAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: now,
      user_id: currentUser.id,
      user_name: currentUser.username,
      action: 'delegated',
      details: `Delegated to ${targetUser.username}: ${reason}`,
    };

    set((state) => ({
      approvalInstances: state.approvalInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              updated_at: now,
              steps: instance.steps.map((step) =>
                step.step_id === stepId
                  ? {
                      ...step,
                      delegation_from: currentUser.id,
                      comments: reason,
                    }
                  : step,
              ),
              audit_trail: [...instance.audit_trail, auditEntry],
            }
          : instance,
      ),
    }));

    get().logAuditEvent('delegated', 'approval_instance', instanceId, undefined, {
      stepId,
      toUserId,
      reason,
    });
  },

  escalateApproval: (instanceId, stepId, reason) => {
    const now = new Date();
    const auditEntry: ApprovalAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: now,
      user_id: 'system',
      user_name: 'System',
      action: 'escalated',
      details: reason || 'Approval escalated due to timeout',
    };

    set((state) => ({
      approvalInstances: state.approvalInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              status: 'escalated',
              updated_at: now,
              escalation_count: instance.escalation_count + 1,
              steps: instance.steps.map((step) =>
                step.step_id === stepId ? { ...step, escalated: true } : step,
              ),
              audit_trail: [...instance.audit_trail, auditEntry],
            }
          : instance,
      ),
    }));

    get().logAuditEvent('escalated', 'approval_instance', instanceId, undefined, {
      stepId,
      reason,
    });
  },

  cancelApproval: (instanceId, reason) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const now = new Date();
    const auditEntry: ApprovalAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: now,
      user_id: currentUser.id,
      user_name: currentUser.username,
      action: 'cancelled',
      details: reason || 'Approval cancelled',
    };

    set((state) => ({
      approvalInstances: state.approvalInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              status: 'cancelled',
              updated_at: now,
              completed_at: now,
              audit_trail: [...instance.audit_trail, auditEntry],
            }
          : instance,
      ),
    }));

    get().logAuditEvent('cancelled', 'approval_instance', instanceId, undefined, { reason });
  },

  getMyApprovals: () => {
    const currentUser = get().currentUser;
    if (!currentUser) return [];

    return get().approvalInstances.filter(
      (instance) =>
        instance.status === 'pending' &&
        instance.steps.some(
          (step) =>
            step.status === 'pending' &&
            (step.approver_id === currentUser.id ||
              // Check if user has approval role for this step
              currentUser.roles.some((role) => role.name.includes('approver'))),
        ),
    );
  },

  getApprovalHistory: (recordId) => {
    const instances = get().approvalInstances;
    if (recordId) {
      return instances.filter((instance) => instance.record_id === recordId);
    }
    return instances;
  },

  // Feature Flags
  createFeatureFlag: (flagData) => {
    const id = `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newFlag: FeatureFlag = {
      ...flagData,
      id,
      created_at: now,
      updated_at: now,
      created_by: get().currentUser?.id || 'system',
    };

    set((state) => ({
      featureFlags: [...state.featureFlags, newFlag],
    }));

    get().logAuditEvent('created', 'feature_flag', id, undefined, newFlag);
    return id;
  },

  updateFeatureFlag: (id, updates) => {
    set((state) => ({
      featureFlags: state.featureFlags.map((flag) =>
        flag.id === id ? { ...flag, ...updates, updated_at: new Date() } : flag,
      ),
    }));

    get().logAuditEvent('updated', 'feature_flag', id, undefined, updates);
  },

  deleteFeatureFlag: (id) => {
    const flag = get().featureFlags.find((f) => f.id === id);
    set((state) => ({
      featureFlags: state.featureFlags.filter((f) => f.id !== id),
      featureFlagOverrides: state.featureFlagOverrides.filter((o) => o.flag_id !== id),
    }));

    get().logAuditEvent('deleted', 'feature_flag', id, flag);
  },

  isFeatureEnabled: (key, userId, _context) => {
    const flag = get().featureFlags.find((f) => f.key === key);
    if (!flag) return false;

    // Check for user-specific override
    if (userId) {
      const override = get().featureFlagOverrides.find(
        (o) => o.flag_id === flag.id && o.user_id === userId && o.enabled,
      );
      if (override) return Boolean(override.value);
    }

    // Check environment override
    if (flag.environment_override) {
      const envValue = process.env[`FEATURE_${key.toUpperCase()}`];
      if (envValue !== undefined) return envValue === 'true';
    }

    // Apply rollout logic if applicable
    if (flag.type === 'rollout' && flag.rollout_percentage) {
      const hash = userId ? userId.charCodeAt(0) : Math.random();
      return hash % 100 < flag.rollout_percentage;
    }

    return flag.enabled;
  },

  getFeatureFlagValue: (key, defaultValue, userId, context) => {
    const flag = get().featureFlags.find((f) => f.key === key);
    if (!flag || !get().isFeatureEnabled(key, userId, context)) return defaultValue;

    // Check for user-specific override
    if (userId) {
      const override = get().featureFlagOverrides.find(
        (o) => o.flag_id === flag.id && o.user_id === userId,
      );
      if (override) return override.value as typeof defaultValue;
    }

    return (flag.value as typeof defaultValue) || defaultValue;
  },

  createFeatureFlagOverride: (overrideData) => {
    const newOverride: FeatureFlagOverride = {
      ...overrideData,
      created_at: new Date(),
      created_by: get().currentUser?.id || 'system',
    };

    set((state) => ({
      featureFlagOverrides: [...state.featureFlagOverrides, newOverride],
    }));

    get().logAuditEvent(
      'created',
      'feature_flag_override',
      overrideData.flag_id,
      undefined,
      newOverride,
    );
  },

  removeFeatureFlagOverride: (flagId, userId, groupId) => {
    set((state) => ({
      featureFlagOverrides: state.featureFlagOverrides.filter(
        (o) =>
          !(
            o.flag_id === flagId &&
            (userId ? o.user_id === userId : true) &&
            (groupId ? o.group_id === groupId : true)
          ),
      ),
    }));

    get().logAuditEvent('removed', 'feature_flag_override', flagId, undefined, { userId, groupId });
  },

  // System Configuration
  createSystemConfig: (configData) => {
    const id = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newConfig: SystemConfiguration = {
      ...configData,
      id,
      created_at: now,
      updated_at: now,
      created_by: get().currentUser?.id || 'system',
    };

    set((state) => ({
      systemConfig: [...state.systemConfig, newConfig],
    }));

    get().logAuditEvent('created', 'system_config', id, undefined, newConfig);
    return id;
  },

  updateSystemConfig: (id, updates) => {
    const existing = get().systemConfig.find((c) => c.id === id);

    set((state) => ({
      systemConfig: state.systemConfig.map((config) =>
        config.id === id ? { ...config, ...updates, updated_at: new Date() } : config,
      ),
    }));

    get().logAuditEvent('updated', 'system_config', id, existing, updates);
  },

  deleteSystemConfig: (id) => {
    const config = get().systemConfig.find((c) => c.id === id);
    set((state) => ({
      systemConfig: state.systemConfig.filter((c) => c.id !== id),
    }));

    get().logAuditEvent('deleted', 'system_config', id, config);
  },

  getConfigValue: (key, defaultValue) => {
    const config = get().systemConfig.find((c) => c.key === key);
    if (!config) return defaultValue;

    // Check for environment override
    if (config.environment_override) {
      const envValue = process.env[key.toUpperCase()];
      if (envValue !== undefined) {
        // Convert environment string to appropriate type
        switch (config.data_type) {
          case 'number':
            return Number(envValue) as typeof defaultValue;
          case 'boolean':
            return (envValue === 'true') as typeof defaultValue;
          case 'json':
            return JSON.parse(envValue) as typeof defaultValue;
          default:
            return envValue as typeof defaultValue;
        }
      }
    }

    return (config.value as typeof defaultValue) || defaultValue;
  },

  setConfigValue: (key, value, category = 'general') => {
    const existing = get().systemConfig.find((c) => c.key === key);
    if (existing) {
      get().updateSystemConfig(existing.id, { value });
    } else {
      get().createSystemConfig({
        category,
        key,
        value,
        description: `Configuration for ${key}`,
        data_type: typeof value as any,
        required: false,
        environment_override: true,
        requires_restart: false,
        created_by: get().currentUser?.id || 'system',
      });
    }
  },

  // Admin Interface
  getAdminModules: () => {
    const currentUser = get().currentUser;
    if (!currentUser) return [];

    return get().adminModules.filter(
      (module) =>
        module.enabled &&
        module.required_roles.some((role) =>
          currentUser.roles.some((userRole) => userRole.name === role),
        ),
    );
  },

  createAdminModule: (moduleData) => {
    const id = `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newModule: AdminModule = {
      ...moduleData,
      id,
    };

    set((state) => ({
      adminModules: [...state.adminModules, newModule],
    }));

    get().logAuditEvent('created', 'admin_module', id, undefined, newModule);
    return id;
  },

  updateAdminModule: (id, updates) => {
    set((state) => ({
      adminModules: state.adminModules.map((module) =>
        module.id === id ? { ...module, ...updates } : module,
      ),
    }));

    get().logAuditEvent('updated', 'admin_module', id, undefined, updates);
  },

  // Audit & Compliance
  logAuditEvent: (action, resourceType, resourceId, beforeValue, afterValue) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      user_id: currentUser.id,
      user_name: currentUser.username,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      before_value: beforeValue,
      after_value: afterValue,
      ip_address: '127.0.0.1', // In real app, get from request
      user_agent: navigator.userAgent,
      session_id: 'session_' + currentUser.id,
      tags: [],
    };

    set((state) => ({
      auditLogs: [auditLog, ...state.auditLogs].slice(0, 10000), // Keep last 10k entries
    }));
  },

  getAuditLogs: (filters) => {
    let logs = get().auditLogs;

    if (filters?.userId) {
      logs = logs.filter((log) => log.user_id === filters.userId);
    }

    if (filters?.action) {
      logs = logs.filter((log) => log.action === filters.action);
    }

    if (filters?.dateRange) {
      const [start, end] = filters.dateRange;
      logs = logs.filter((log) => log.timestamp >= start && log.timestamp <= end);
    }

    return logs;
  },

  generateComplianceReport: async (type, startDate, endDate) => {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In real app, this would generate an actual compliance report
    get().logAuditEvent('generated', 'compliance_report', reportId, undefined, {
      type,
      startDate,
      endDate,
    });

    return reportId;
  },

  // Utilities
  initializeStandardRoles: () => {
    // Initialize standard ServiceNow-like roles
    Object.entries(STANDARD_ROLES).forEach(([key, roleData]) => {
      const existingRole = get().roles.find((r) => r.name === roleData.name);
      if (!existingRole) {
        const permissions = roleData.permissions.map((permKey) => {
          const [resource, action] = permKey.split(':');
          return {
            id: `perm_${permKey}`,
            name: permKey,
            description: `${action} permission for ${resource}`,
            resource,
            action: action as any,
            scope: 'global' as any,
          };
        });

        // Create permissions if they don't exist
        permissions.forEach((perm) => {
          const existingPerm = get().permissions.find((p) => p.name === perm.name);
          if (!existingPerm) {
            get().createPermission(perm);
          }
        });

        // Create role with permissions
        get().createRole({
          name: roleData.name,
          description: roleData.description,
          type: 'system',
          permissions,
          active: true,
          elevated_privilege: key === 'admin' || key === 'security_admin',
          requires_approval: key === 'admin',
          created_by: 'system',
        });
      }
    });
  },

  validateRolePermissions: (roleId) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) return false;

    // Check if all role permissions exist
    return role.permissions.every((perm) => get().permissions.some((p) => p.id === perm.id));
  },

  getRoleHierarchy: () => {
    // Return role hierarchy for inheritance
    return {
      admin: ['security_admin', 'workflow_admin', 'catalog_admin'],
      security_admin: ['approval_admin'],
      catalog_admin: ['catalog_editor'],
      approval_admin: ['approver_user'],
      workflow_admin: ['approver_user'],
      approver_user: ['user'],
      catalog_editor: ['user'],
      itil: ['user'],
    };
  },

  exportConfiguration: () => {
    return {
      roles: get().roles,
      permissions: get().permissions,
      groups: get().groups,
      approvalFlows: get().approvalFlows,
      featureFlags: get().featureFlags,
      systemConfig: get().systemConfig,
      adminModules: get().adminModules,
    };
  },

  importConfiguration: (config: any) => {
    set({
      roles: config.roles || get().roles,
      permissions: config.permissions || get().permissions,
      groups: config.groups || get().groups,
      approvalFlows: config.approvalFlows || get().approvalFlows,
      featureFlags: config.featureFlags || get().featureFlags,
      systemConfig: config.systemConfig || get().systemConfig,
      adminModules: config.adminModules || get().adminModules,
    });

    get().logAuditEvent('imported', 'system_configuration', 'bulk', undefined, config);
  },

  // Data Loading Methods
  setCurrentUser: (user) => {
    set({ currentUser: user, isAuthenticated: !!user });
    if (user) {
      const userRoleNames = (user.roles || []).map((role) =>
        typeof role === 'string' ? role : role.name,
      );
      const userPermissions = (user.roles || [])
        .flatMap((role) => (typeof role === 'string' ? [] : role.permissions || []))
        .map((permission) => (typeof permission === 'string' ? permission : permission.name));
      set({ userRoles: userRoleNames, userPermissions });
    } else {
      set({ userRoles: [], userPermissions: [] });
    }
  },

  setUsers: (users) => {
    set({ users });
  },

  setRoles: (roles) => {
    set({ roles });
  },

  setPermissions: (permissions) => {
    set({ permissions });
  },

  setGroups: (groups) => {
    set({ groups });
  },

  setApprovalFlows: (flows) => {
    set({ approvalFlows: flows });
  },

  setFeatureFlags: (flags) => {
    set({ featureFlags: flags });
  },
}));
