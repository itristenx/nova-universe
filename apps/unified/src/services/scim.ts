import { apiClient } from './api';

export interface SCIMUser {
  id: string;
  userName: string;
  displayName: string;
  email: string;
  active: boolean;
  groups: string[];
  created: string;
  lastModified: string;
  externalId?: string;
  department?: string;
  title?: string;
  manager?: string;
}

export interface SCIMGroup {
  id: string;
  displayName: string;
  members: string[];
  created: string;
  lastModified: string;
  externalId?: string;
  description?: string;
}

export interface SCIMEvent {
  id: string;
  timestamp: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';
  resourceType: 'User' | 'Group';
  resourceId: string;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
  details: string;
  error?: string;
  duration?: number;
}

export interface SCIMConfiguration {
  enabled: boolean;
  endpoint: string;
  token: string;
  userAttributes: string[];
  groupAttributes: string[];
  syncInterval: number;
  lastSync: string;
  totalUsers: number;
  totalGroups: number;
}

export interface SCIMStats {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  activeGroups: number;
  lastSyncTime: string;
  syncStatus: 'success' | 'error' | 'in_progress';
  errorCount: number;
  pendingOperations: number;
}

export class SCIMService {
  private static baseUrl = '/api/v1/scim';

  /**
   * Get SCIM configuration
   */
  static async getConfiguration(): Promise<SCIMConfiguration> {
    const response = await apiClient.get<SCIMConfiguration>(`${this.baseUrl}/config`);
    if (!response.data) {
      throw new Error('Failed to get SCIM configuration');
    }
    return response.data;
  }

  /**
   * Update SCIM configuration
   */
  static async updateConfiguration(config: Partial<SCIMConfiguration>): Promise<SCIMConfiguration> {
    const response = await apiClient.put<SCIMConfiguration>(`${this.baseUrl}/config`, config);
    if (!response.data) {
      throw new Error('Failed to update SCIM configuration');
    }
    return response.data;
  }

  /**
   * Get SCIM statistics
   */
  static async getStats(): Promise<SCIMStats> {
    const response = await apiClient.get<SCIMStats>(`${this.baseUrl}/stats`);
    if (!response.data) {
      throw new Error('Failed to get SCIM statistics');
    }
    return response.data;
  }

  /**
   * Get all SCIM users
   */
  static async getUsers(limit = 50, offset = 0): Promise<{ users: SCIMUser[]; total: number }> {
    const response = await apiClient.get<{ users: SCIMUser[]; total: number }>(
      `${this.baseUrl}/users?limit=${limit}&offset=${offset}`,
    );
    return response.data || { users: [], total: 0 };
  }

  /**
   * Get SCIM user by ID
   */
  static async getUser(id: string): Promise<SCIMUser> {
    const response = await apiClient.get<SCIMUser>(`${this.baseUrl}/users/${id}`);
    if (!response.data) {
      throw new Error(`SCIM user ${id} not found`);
    }
    return response.data;
  }

  /**
   * Create SCIM user
   */
  static async createUser(userData: Partial<SCIMUser>): Promise<SCIMUser> {
    const response = await apiClient.post<SCIMUser>(`${this.baseUrl}/users`, userData);
    if (!response.data) {
      throw new Error('Failed to create SCIM user');
    }
    return response.data;
  }

  /**
   * Update SCIM user
   */
  static async updateUser(id: string, userData: Partial<SCIMUser>): Promise<SCIMUser> {
    const response = await apiClient.put<SCIMUser>(`${this.baseUrl}/users/${id}`, userData);
    if (!response.data) {
      throw new Error(`Failed to update SCIM user ${id}`);
    }
    return response.data;
  }

  /**
   * Delete SCIM user
   */
  static async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/users/${id}`);
  }

  /**
   * Get all SCIM groups
   */
  static async getGroups(limit = 50, offset = 0): Promise<{ groups: SCIMGroup[]; total: number }> {
    const response = await apiClient.get<{ groups: SCIMGroup[]; total: number }>(
      `${this.baseUrl}/groups?limit=${limit}&offset=${offset}`,
    );
    return response.data || { groups: [], total: 0 };
  }

  /**
   * Get SCIM group by ID
   */
  static async getGroup(id: string): Promise<SCIMGroup> {
    const response = await apiClient.get<SCIMGroup>(`${this.baseUrl}/groups/${id}`);
    if (!response.data) {
      throw new Error(`SCIM group ${id} not found`);
    }
    return response.data;
  }

  /**
   * Create SCIM group
   */
  static async createGroup(groupData: Partial<SCIMGroup>): Promise<SCIMGroup> {
    const response = await apiClient.post<SCIMGroup>(`${this.baseUrl}/groups`, groupData);
    if (!response.data) {
      throw new Error('Failed to create SCIM group');
    }
    return response.data;
  }

  /**
   * Update SCIM group
   */
  static async updateGroup(id: string, groupData: Partial<SCIMGroup>): Promise<SCIMGroup> {
    const response = await apiClient.put<SCIMGroup>(`${this.baseUrl}/groups/${id}`, groupData);
    if (!response.data) {
      throw new Error(`Failed to update SCIM group ${id}`);
    }
    return response.data;
  }

  /**
   * Delete SCIM group
   */
  static async deleteGroup(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/groups/${id}`);
  }

  /**
   * Get SCIM events/logs
   */
  static async getEvents(limit = 100, offset = 0): Promise<{ events: SCIMEvent[]; total: number }> {
    const response = await apiClient.get<{ events: SCIMEvent[]; total: number }>(
      `${this.baseUrl}/events?limit=${limit}&offset=${offset}`,
    );
    return response.data || { events: [], total: 0 };
  }

  /**
   * Trigger manual SCIM sync
   */
  static async triggerSync(): Promise<{ message: string; jobId: string }> {
    const response = await apiClient.post<{ message: string; jobId: string }>(
      `${this.baseUrl}/sync`,
    );
    if (!response.data) {
      throw new Error('Failed to trigger SCIM sync');
    }
    return response.data;
  }

  /**
   * Test SCIM connection
   */
  static async testConnection(): Promise<{ status: 'success' | 'error'; message: string }> {
    const response = await apiClient.post<{ status: 'success' | 'error'; message: string }>(
      `${this.baseUrl}/test-connection`,
    );
    if (!response.data) {
      throw new Error('Failed to test SCIM connection');
    }
    return response.data;
  }

  /**
   * Get sync job status
   */
  static async getSyncStatus(
    jobId: string,
  ): Promise<{ status: string; progress: number; message: string }> {
    const response = await apiClient.get<{ status: string; progress: number; message: string }>(
      `${this.baseUrl}/sync/${jobId}`,
    );
    if (!response.data) {
      throw new Error(`Failed to get sync status for job ${jobId}`);
    }
    return response.data;
  }

  /**
   * Export SCIM data
   */
  static async exportData(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${this.baseUrl}/export?format=${format}`, {
      responseType: 'blob',
    });
    if (!response.data) {
      throw new Error('Failed to export SCIM data');
    }
    return response.data;
  }

  /**
   * Import SCIM data
   */
  static async importData(
    file: File,
  ): Promise<{ message: string; imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ message: string; imported: number; errors: string[] }>(
      `${this.baseUrl}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    if (!response.data) {
      throw new Error('Failed to import SCIM data');
    }
    return response.data;
  }
}

export default SCIMService;
