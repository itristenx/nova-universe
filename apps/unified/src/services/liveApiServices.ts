import { createServiceClient, TokenManager } from './api';
import type {
  User,
  Role,
  Permission,
  Group,
  ApprovalFlow,
  ApprovalInstance,
  FeatureFlag,
} from '../types/rbac';

/**
 * Live API Service Layer
 * Replaces all demo data with real API calls
 * Uses the new service catalog API endpoints
 */

// Authentication Service
export class AuthService {
  private client = createServiceClient('auth');

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.client.post<{ token: string; user: User }>('/login', {
      username,
      password,
    });

    if (response.success && response.data.token) {
      TokenManager.setAccessToken(response.data.token);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/logout');
    } finally {
      TokenManager.clearTokens();
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post<{ token: string }>('/refresh', {
      refreshToken,
    });

    if (response.success && response.data.token) {
      TokenManager.setAccessToken(response.data.token);
    }

    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/me');
    if (!response.success) {
      throw new Error(response.message || 'Failed to get current user');
    }
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await this.client.post('/change-password', {
      currentPassword,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const response = await this.client.post('/request-password-reset', { email });
    if (!response.success) {
      throw new Error(response.message || 'Failed to request password reset');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await this.client.post('/reset-password', {
      token,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to reset password');
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

// User Management Service
export class UserService {
  private client = createServiceClient('users');

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
    status?: 'active' | 'inactive';
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.client.getPaginated<User>('/', params);
    return {
      users: response.data,
      total: response.meta.total,
      page: response.meta.page,
      limit: response.meta.perPage,
    };
  }

  async getUser(id: string): Promise<User> {
    const response = await this.client.get<User>(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch user');
    }
    return response.data;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const response = await this.client.post<User>('/', userData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create user');
    }
    return response.data;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const response = await this.client.patch<User>(`/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update user');
    }
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.client.delete(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user');
    }
  }

  async lockUser(id: string, reason: string): Promise<void> {
    const response = await this.client.post(`/${id}/lock`, { reason });
    if (!response.success) {
      throw new Error(response.message || 'Failed to lock user');
    }
  }

  async unlockUser(id: string): Promise<void> {
    const response = await this.client.post(`/${id}/unlock`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to unlock user');
    }
  }

  async resetUserPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await this.client.post<{ temporaryPassword: string }>(`/${id}/reset-password`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to reset user password');
    }
    return response.data;
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const response = await this.client.post(`/${userId}/roles`, { roleId });
    if (!response.success) {
      throw new Error(response.message || 'Failed to assign role');
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const response = await this.client.delete(`/${userId}/roles/${roleId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove role');
    }
  }

  async bulkUpdate(updates: Array<{ id: string; data: Partial<User> }>): Promise<User[]> {
    const response = await this.client.post<User[]>('/bulk-update', { updates });
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk update users');
    }
    return response.data;
  }

  async exportUsers(format: 'csv' | 'excel' = 'csv'): Promise<string> {
    const response = await this.client.get<{ downloadUrl: string }>(`/export?format=${format}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to export users');
    }
    return response.data.downloadUrl;
  }

  async importUsers(file: File): Promise<{ imported: number; errors: string[] }> {
    const response = await this.client.uploadFile<{ imported: number; errors: string[] }>(
      '/import',
      file,
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to import users');
    }
    return response.data;
  }
}

// Role Management Service
export class RoleService {
  private client = createServiceClient('roles');

  async getRoles(): Promise<Role[]> {
    const response = await this.client.get<Role[]>('/');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch roles');
    }
    return response.data;
  }

  async getRole(id: string): Promise<Role> {
    const response = await this.client.get<Role>(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch role');
    }
    return response.data;
  }

  async createRole(roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
    const response = await this.client.post<Role>('/', roleData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create role');
    }
    return response.data;
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const response = await this.client.patch<Role>(`/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update role');
    }
    return response.data;
  }

  async deleteRole(id: string): Promise<void> {
    const response = await this.client.delete(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete role');
    }
  }

  async cloneRole(id: string, newName: string): Promise<Role> {
    const response = await this.client.post<Role>(`/${id}/clone`, { name: newName });
    if (!response.success) {
      throw new Error(response.message || 'Failed to clone role');
    }
    return response.data;
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    const response = await this.client.post(`/${roleId}/permissions`, { permissionId });
    if (!response.success) {
      throw new Error(response.message || 'Failed to assign permission');
    }
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    const response = await this.client.delete(`/${roleId}/permissions/${permissionId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove permission');
    }
  }

  async getRoleUsage(id: string): Promise<{ userCount: number; users: User[] }> {
    const response = await this.client.get<{ userCount: number; users: User[] }>(`/${id}/usage`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to get role usage');
    }
    return response.data;
  }
}

// Permission Management Service
export class PermissionService {
  private client = createServiceClient('permissions');

  async getPermissions(): Promise<Permission[]> {
    const response = await this.client.get<Permission[]>('/');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch permissions');
    }
    return response.data;
  }

  async createPermission(permissionData: Omit<Permission, 'id'>): Promise<Permission> {
    const response = await this.client.post<Permission>('/', permissionData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create permission');
    }
    return response.data;
  }

  async updatePermission(id: string, updates: Partial<Permission>): Promise<Permission> {
    const response = await this.client.patch<Permission>(`/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update permission');
    }
    return response.data;
  }

  async deletePermission(id: string): Promise<void> {
    const response = await this.client.delete(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete permission');
    }
  }

  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    const response = await this.client.get<Permission[]>(`/resource/${resource}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch permissions by resource');
    }
    return response.data;
  }
}

// Group Management Service
export class GroupService {
  private client = createServiceClient('groups');

  async getGroups(): Promise<Group[]> {
    const response = await this.client.get<Group[]>('/');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch groups');
    }
    return response.data;
  }

  async getGroup(id: string): Promise<Group> {
    const response = await this.client.get<Group>(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch group');
    }
    return response.data;
  }

  async createGroup(groupData: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
    const response = await this.client.post<Group>('/', groupData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create group');
    }
    return response.data;
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group> {
    const response = await this.client.patch<Group>(`/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update group');
    }
    return response.data;
  }

  async deleteGroup(id: string): Promise<void> {
    const response = await this.client.delete(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete group');
    }
  }

  async addMember(groupId: string, userId: string): Promise<void> {
    const response = await this.client.post(`/${groupId}/members`, { userId });
    if (!response.success) {
      throw new Error(response.message || 'Failed to add group member');
    }
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    const response = await this.client.delete(`/${groupId}/members/${userId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove group member');
    }
  }

  async getGroupMembers(id: string): Promise<User[]> {
    const response = await this.client.get<User[]>(`/${id}/members`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch group members');
    }
    return response.data;
  }
}

// Approval Workflow Service
export class ApprovalService {
  private client = createServiceClient('approval');

  async getApprovalFlows(): Promise<ApprovalFlow[]> {
    const response = await this.client.get<ApprovalFlow[]>('/flows');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch approval flows');
    }
    return response.data;
  }

  async getApprovalFlow(id: string): Promise<ApprovalFlow> {
    const response = await this.client.get<ApprovalFlow>(`/flows/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch approval flow');
    }
    return response.data;
  }

  async createApprovalFlow(
    flowData: Omit<ApprovalFlow, 'id' | 'created_at' | 'updated_at' | 'version'>,
  ): Promise<ApprovalFlow> {
    const response = await this.client.post<ApprovalFlow>('/flows', flowData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create approval flow');
    }
    return response.data;
  }

  async updateApprovalFlow(id: string, updates: Partial<ApprovalFlow>): Promise<ApprovalFlow> {
    const response = await this.client.patch<ApprovalFlow>(`/flows/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update approval flow');
    }
    return response.data;
  }

  async deleteApprovalFlow(id: string): Promise<void> {
    const response = await this.client.delete(`/flows/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete approval flow');
    }
  }

  async getApprovalInstances(params?: {
    status?: string;
    assignedTo?: string;
    recordId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    instances: ApprovalInstance[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.client.getPaginated<ApprovalInstance>('/instances', params);
    return {
      instances: response.data,
      total: response.meta.total,
      page: response.meta.page,
      limit: response.meta.perPage,
    };
  }

  async getApprovalInstance(id: string): Promise<ApprovalInstance> {
    const response = await this.client.get<ApprovalInstance>(`/instances/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch approval instance');
    }
    return response.data;
  }

  async startApproval(
    flowId: string,
    recordId: string,
    recordTable: string,
    requestedBy: string,
  ): Promise<ApprovalInstance> {
    const response = await this.client.post<ApprovalInstance>('/instances', {
      flowId,
      recordId,
      recordTable,
      requestedBy,
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to start approval');
    }
    return response.data;
  }

  async approveRequest(instanceId: string, stepId: string, comments?: string): Promise<void> {
    const response = await this.client.post(`/instances/${instanceId}/approve`, {
      stepId,
      comments,
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to approve request');
    }
  }

  async rejectRequest(instanceId: string, stepId: string, reason: string): Promise<void> {
    const response = await this.client.post(`/instances/${instanceId}/reject`, {
      stepId,
      reason,
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to reject request');
    }
  }

  async delegateApproval(
    instanceId: string,
    stepId: string,
    toUserId: string,
    reason: string,
  ): Promise<void> {
    const response = await this.client.post(`/instances/${instanceId}/delegate`, {
      stepId,
      toUserId,
      reason,
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to delegate approval');
    }
  }

  async cancelApproval(instanceId: string, reason: string): Promise<void> {
    const response = await this.client.post(`/instances/${instanceId}/cancel`, { reason });
    if (!response.success) {
      throw new Error(response.message || 'Failed to cancel approval');
    }
  }

  async getMyApprovals(): Promise<ApprovalInstance[]> {
    const response = await this.client.get<ApprovalInstance[]>('/instances/my-approvals');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch my approvals');
    }
    return response.data;
  }

  async getApprovalHistory(recordId?: string): Promise<ApprovalInstance[]> {
    const endpoint = recordId ? `/instances/history?recordId=${recordId}` : '/instances/history';
    const response = await this.client.get<ApprovalInstance[]>(endpoint);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch approval history');
    }
    return response.data;
  }
}

// Feature Flag Service
export class FeatureFlagService {
  private client = createServiceClient('feature-flags');

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const response = await this.client.get<FeatureFlag[]>('/');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch feature flags');
    }
    return response.data;
  }

  async getFeatureFlag(id: string): Promise<FeatureFlag> {
    const response = await this.client.get<FeatureFlag>(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch feature flag');
    }
    return response.data;
  }

  async createFeatureFlag(
    flagData: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<FeatureFlag> {
    const response = await this.client.post<FeatureFlag>('/', flagData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create feature flag');
    }
    return response.data;
  }

  async updateFeatureFlag(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const response = await this.client.patch<FeatureFlag>(`/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update feature flag');
    }
    return response.data;
  }

  async deleteFeatureFlag(id: string): Promise<void> {
    const response = await this.client.delete(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete feature flag');
    }
  }

  async evaluateFlag(
    key: string,
    userId?: string,
    context?: Record<string, any>,
  ): Promise<{
    enabled: boolean;
    value: any;
    reason: string;
  }> {
    const response = await this.client.post<{
      enabled: boolean;
      value: any;
      reason: string;
    }>('/evaluate', {
      key,
      userId,
      context,
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to evaluate feature flag');
    }
    return response.data;
  }

  async getOverrides(flagId?: string): Promise<any[]> {
    const endpoint = flagId ? `/overrides?flagId=${flagId}` : '/overrides';
    const response = await this.client.get<any[]>(endpoint);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch overrides');
    }
    return response.data;
  }

  async createOverride(overrideData: any): Promise<any> {
    const response = await this.client.post<any>('/overrides', overrideData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create override');
    }
    return response.data;
  }

  async removeOverride(flagId: string, userId?: string, groupId?: string): Promise<void> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (groupId) params.append('groupId', groupId);

    const response = await this.client.delete(`/overrides/${flagId}?${params}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove override');
    }
  }
}

// Export service instances
export const authService = new AuthService();
export const userService = new UserService();
export const roleService = new RoleService();
export const permissionService = new PermissionService();
export const groupService = new GroupService();
export const approvalService = new ApprovalService();
export const featureFlagService = new FeatureFlagService();
