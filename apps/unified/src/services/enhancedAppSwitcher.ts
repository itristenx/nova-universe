/**
 * Enhanced App Switcher Service with Helix Integration
 * Supports custom external apps, user/department assignments, and Okta/AD integration
 */

import { apiClient } from './api';

export interface CustomApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: string;
  iconUrl?: string;
  color: string;
  type: 'internal' | 'external' | 'saml' | 'oauth';

  // Assignment rules
  assignments: AppAssignment[];

  // External app configuration
  external_config?: {
    open_in_new_window: boolean;
    sso_enabled: boolean;
    pre_auth_url?: string;
    post_auth_redirect?: string;
  };

  // SAML/OAuth configuration
  auth_config?: {
    provider: 'okta' | 'azure_ad' | 'google' | 'custom';
    client_id?: string;
    tenant_id?: string;
    domain?: string;
    scopes?: string[];
  };

  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  order: number;
}

export interface AppAssignment {
  type: 'user' | 'department' | 'group' | 'role';
  target_id: string;
  target_name: string;
  granted_by: string;
  granted_at: Date;
  conditions?: AssignmentCondition[];
}

export interface AssignmentCondition {
  type: 'time_based' | 'location_based' | 'device_based' | 'attribute_based';
  operator: 'equals' | 'contains' | 'not_equals' | 'greater_than' | 'less_than';
  value: any;
  metadata?: Record<string, any>;
}

export interface OktaIntegration {
  enabled: boolean;
  domain: string;
  api_token?: string;
  sync_groups: boolean;
  sync_apps: boolean;
  last_sync?: Date;
}

export interface ADIntegration {
  enabled: boolean;
  tenant_id: string;
  client_id: string;
  sync_groups: boolean;
  sync_apps: boolean;
  last_sync?: Date;
}

export interface UserAppAccess {
  userId: string;
  apps: Array<{
    app: CustomApp;
    access_granted_via: 'direct' | 'department' | 'group' | 'role';
    granted_by: string;
    granted_at: Date;
    last_accessed?: Date;
    access_count: number;
  }>;
}

class EnhancedAppSwitcherService {
  private baseUrl = '/api/v1/app-switcher';

  /**
   * Get all available apps for current user
   */
  async getUserApps(userId: string): Promise<CustomApp[]> {
    const response = await apiClient.get<{ apps: CustomApp[] }>(
      `${this.baseUrl}/users/${userId}/apps`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch user apps');
    }
    return response.data.apps;
  }

  /**
   * Get all custom apps (admin view)
   */
  async getAllApps(): Promise<CustomApp[]> {
    const response = await apiClient.get<{ apps: CustomApp[] }>(`${this.baseUrl}/apps`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch apps');
    }
    return response.data.apps;
  }

  /**
   * Create a new custom app
   */
  async createApp(app: Omit<CustomApp, 'id' | 'created_at' | 'updated_at'>): Promise<CustomApp> {
    const response = await apiClient.post<CustomApp>(`${this.baseUrl}/apps`, app);
    if (!response.success || !response.data) {
      throw new Error('Failed to create app');
    }
    return response.data;
  }

  /**
   * Create a new custom app (simplified interface for admin)
   */
  async createCustomApp(appData: {
    name: string;
    description: string;
    url: string;
    type: 'external' | 'saml' | 'oauth';
    iconUrl?: string;
    color: string;
    ssoEnabled?: boolean;
    newWindow?: boolean;
    category?: string;
  }): Promise<CustomApp> {
    const app = {
      name: appData.name,
      description: appData.description,
      url: appData.url,
      type: appData.type as any,
      iconUrl: appData.iconUrl,
      color: appData.color,
      external_config: {
        open_in_new_window: appData.newWindow || true,
        sso_enabled: appData.ssoEnabled || false,
      },
      assignments: [],
      created_by: 'admin',
      is_active: true,
      order: 0,
    };

    return this.createApp(app);
  }

  /**
   * Create a new custom app (simplified interface for admin)
   */
  async createCustomApp(appData: {
    name: string;
    description: string;
    url: string;
    type: 'external' | 'saml' | 'oauth';
    iconUrl?: string;
    color: string;
    ssoEnabled?: boolean;
    newWindow?: boolean;
    category?: string;
  }): Promise<CustomApp> {
    const app = {
      name: appData.name,
      description: appData.description,
      url: appData.url,
      type: appData.type as any,
      iconUrl: appData.iconUrl,
      color: appData.color,
      assignments: [],
      external_config: {
        open_in_new_window: appData.newWindow || true,
        sso_enabled: appData.ssoEnabled || false,
      },
      created_by: 'current_user', // Will be set by backend
      is_active: true,
      order: 0,
    };

    return this.createApp(app);
  }

  /**
   * Update an existing app
   */
  async updateApp(appId: string, updates: Partial<CustomApp>): Promise<CustomApp> {
    const response = await apiClient.put<CustomApp>(`${this.baseUrl}/apps/${appId}`, updates);
    if (!response.success || !response.data) {
      throw new Error('Failed to update app');
    }
    return response.data;
  }

  /**
   * Update an existing app (simplified interface for admin)
   */
  async updateCustomApp(
    appId: string,
    appData: {
      name: string;
      description: string;
      url: string;
      type: 'external' | 'saml' | 'oauth';
      iconUrl?: string;
      color: string;
      ssoEnabled?: boolean;
      newWindow?: boolean;
      category?: string;
    },
  ): Promise<CustomApp> {
    const updates = {
      name: appData.name,
      description: appData.description,
      url: appData.url,
      type: appData.type as any,
      iconUrl: appData.iconUrl,
      color: appData.color,
      external_config: {
        open_in_new_window: appData.newWindow || true,
        sso_enabled: appData.ssoEnabled || false,
      },
    };

    return this.updateApp(appId, updates);
  }

  /**
   * Delete an app
   */
  async deleteApp(appId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/apps/${appId}`);
  }

  /**
   * Delete a custom app (alias for deleteApp)
   */
  async deleteCustomApp(appId: string): Promise<void> {
    return this.deleteApp(appId);
  }

  /**
   * Assign app to users
   */
  async assignAppToUsers(appId: string, userIds: string[], grantedBy: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/apps/${appId}/assign-users`, {
      userIds,
      grantedBy,
    });
  }

  /**
   * Assign app to department
   */
  async assignAppToDepartment(
    appId: string,
    departmentId: string,
    grantedBy: string,
    conditions?: AssignmentCondition[],
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/apps/${appId}/assign-department`, {
      departmentId,
      grantedBy,
      conditions,
    });
  }

  /**
   * Assign app to groups
   */
  async assignAppToGroups(
    appId: string,
    groupIds: string[],
    grantedBy: string,
    conditions?: AssignmentCondition[],
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/apps/${appId}/assign-groups`, {
      groupIds,
      grantedBy,
      conditions,
    });
  }

  /**
   * Remove app assignment
   */
  async removeAppAssignment(
    appId: string,
    assignmentType: 'user' | 'department' | 'group',
    targetId: string,
  ): Promise<void> {
    await apiClient.delete(
      `${this.baseUrl}/apps/${appId}/assignments/${assignmentType}/${targetId}`,
    );
  }

  /**
   * Get app assignments
   */
  async getAppAssignments(appId: string): Promise<AppAssignment[]> {
    const response = await apiClient.get<{ assignments: AppAssignment[] }>(
      `${this.baseUrl}/apps/${appId}/assignments`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch app assignments');
    }
    return response.data.assignments;
  }

  /**
   * Track app access
   */
  async trackAppAccess(
    appId: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/apps/${appId}/access`, {
      userId,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  /**
   * Get app access analytics
   */
  async getAppAnalytics(
    appId: string,
    dateRange?: { start: Date; end: Date },
  ): Promise<{
    total_users: number;
    total_accesses: number;
    unique_users_last_30_days: number;
    most_active_departments: Array<{ department: string; access_count: number }>;
    usage_by_day: Array<{ date: string; accesses: number; unique_users: number }>;
  }> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('start_date', dateRange.start.toISOString());
      params.append('end_date', dateRange.end.toISOString());
    }

    const response = await apiClient.get<{
      total_users: number;
      total_accesses: number;
      unique_users_last_30_days: number;
      most_active_departments: Array<{ department: string; access_count: number }>;
      usage_by_day: Array<{ date: string; accesses: number; unique_users: number }>;
    }>(`${this.baseUrl}/apps/${appId}/analytics?${params}`);

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch app analytics');
    }
    return response.data;
  }

  /**
   * Sync apps from Okta
   */
  async syncFromOkta(config: OktaIntegration): Promise<{
    synced_apps: number;
    synced_assignments: number;
    errors: string[];
  }> {
    const response = await apiClient.post<{
      synced_apps: number;
      synced_assignments: number;
      errors: string[];
    }>(`${this.baseUrl}/integrations/okta/sync`, config);

    if (!response.success || !response.data) {
      throw new Error('Failed to sync from Okta');
    }
    return response.data;
  }

  /**
   * Sync apps from Azure AD
   */
  async syncFromAzureAD(config: ADIntegration): Promise<{
    synced_apps: number;
    synced_assignments: number;
    errors: string[];
  }> {
    const response = await apiClient.post<{
      synced_apps: number;
      synced_assignments: number;
      errors: string[];
    }>(`${this.baseUrl}/integrations/azure-ad/sync`, config);

    if (!response.success || !response.data) {
      throw new Error('Failed to sync from Azure AD');
    }
    return response.data;
  }

  /**
   * Get Okta integration status
   */
  async getOktaIntegration(): Promise<OktaIntegration> {
    const response = await apiClient.get<OktaIntegration>(`${this.baseUrl}/integrations/okta`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch Okta integration');
    }
    return response.data;
  }

  /**
   * Get Azure AD integration status
   */
  async getAzureADIntegration(): Promise<ADIntegration> {
    const response = await apiClient.get<ADIntegration>(`${this.baseUrl}/integrations/azure-ad`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch Azure AD integration');
    }
    return response.data;
  }

  /**
   * Update Okta integration configuration
   */
  async updateOktaIntegration(config: Partial<OktaIntegration>): Promise<OktaIntegration> {
    const response = await apiClient.put<OktaIntegration>(
      `${this.baseUrl}/integrations/okta`,
      config,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to update Okta integration');
    }
    return response.data;
  }

  /**
   * Update Azure AD integration configuration
   */
  async updateAzureADIntegration(config: Partial<ADIntegration>): Promise<ADIntegration> {
    const response = await apiClient.put<ADIntegration>(
      `${this.baseUrl}/integrations/azure-ad`,
      config,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to update Azure AD integration');
    }
    return response.data;
  }

  /**
   * Get available departments for assignment
   */
  async getDepartments(): Promise<Array<{ id: string; name: string; userCount: number }>> {
    const response = await apiClient.get<{
      departments: Array<{ id: string; name: string; userCount: number }>;
    }>('/api/v1/helix/departments');
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch departments');
    }
    return response.data.departments;
  }

  /**
   * Get available groups for assignment
   */
  async getGroups(): Promise<
    Array<{ id: string; name: string; type: string; memberCount: number }>
  > {
    const response = await apiClient.get<{
      groups: Array<{ id: string; name: string; type: string; memberCount: number }>;
    }>('/api/v1/helix/groups');
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch groups');
    }
    return response.data.groups;
  }

  /**
   * Search users for assignment
   */
  async searchUsers(
    query: string,
    limit = 50,
  ): Promise<
    Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      department?: string;
      jobTitle?: string;
    }>
  > {
    const response = await apiClient.get<{
      users: Array<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        department?: string;
        jobTitle?: string;
      }>;
    }>(`/api/v1/helix/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error('Failed to search users');
    }
    return response.data.users;
  }

  /**
   * Generate app launch URL with SSO if configured
   */
  async generateAppLaunchUrl(
    appId: string,
    userId: string,
  ): Promise<{
    url: string;
    requires_new_window: boolean;
    sso_enabled: boolean;
  }> {
    const response = await apiClient.post<{
      url: string;
      requires_new_window: boolean;
      sso_enabled: boolean;
    }>(`${this.baseUrl}/apps/${appId}/launch`, { userId });

    if (!response.success || !response.data) {
      throw new Error('Failed to generate launch URL');
    }
    return response.data;
  }

  /**
   * Reorder apps for user
   */
  async reorderUserApps(userId: string, appOrder: string[]): Promise<void> {
    await apiClient.put(`${this.baseUrl}/users/${userId}/app-order`, { appOrder });
  }
}

// Export singleton instance
export const enhancedAppSwitcherService = new EnhancedAppSwitcherService();
export default enhancedAppSwitcherService;
