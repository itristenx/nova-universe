/**
 * User 360 Service
 * Handles comprehensive user profile data aggregation
 */

import { apiClient } from './api';

export interface User360Profile {
  // Core Identity
  id: string;
  helix_uid: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  employee_id?: string;

  // Organizational Info
  department: string;
  title: string;
  manager: {
    id: string;
    name: string;
    email: string;
  } | null;
  location: {
    office: string;
    city: string;
    country: string;
    timezone: string;
  };

  // Contact Info
  phone?: string;
  mobile?: string;

  // Status
  status: 'active' | 'inactive' | 'suspended';
  last_seen?: Date;
  is_online: boolean;

  // Security
  mfa_enabled: boolean;
  last_login?: Date;
  failed_login_attempts: number;
  password_last_changed?: Date;

  // HR Data
  hire_date?: Date;
  employment_type: 'full-time' | 'part-time' | 'contractor';
  cost_center?: string;
}

export interface LinkedAccount {
  id: string;
  platform: string;
  account_id: string;
  email: string;
  status: 'connected' | 'disconnected' | 'error';
  last_sync?: Date;
}

export interface AssetItem {
  id: string;
  name: string;
  type: 'laptop' | 'phone' | 'tablet' | 'monitor' | 'software';
  brand: string;
  model: string;
  serial_number?: string;
  status: 'assigned' | 'available' | 'maintenance' | 'retired';
  compliance_status: 'compliant' | 'non-compliant' | 'unknown';
  assigned_date: Date;
  last_checkin?: Date;
}

export interface SecurityAlert {
  id: string;
  type: 'login_anomaly' | 'device_risk' | 'policy_violation' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  created_at: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

export interface TicketSummary {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: Date;
  updated_at: Date;
  category: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  event_type: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  risk_score?: number;
}

export interface TrainingRecord {
  id: string;
  course_name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  completion_date?: Date;
  due_date?: Date;
  score?: number;
}

class User360Service {
  private baseUrl = '/api/v2/user360';

  /**
   * Get comprehensive user profile
   */
  async getUserProfile(helixUid: string, include: string = 'all'): Promise<User360Profile> {
    const response = await apiClient.get<{ profile: User360Profile }>(
      `${this.baseUrl}/profile/${helixUid}?include=${include}`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch user profile');
    }
    return response.data.profile;
  }

  /**
   * Get linked accounts for user
   */
  async getLinkedAccounts(helixUid: string): Promise<LinkedAccount[]> {
    const response = await apiClient.get<{ accounts: LinkedAccount[] }>(
      `${this.baseUrl}/accounts/${helixUid}`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch linked accounts');
    }
    return response.data.accounts;
  }

  /**
   * Get assets assigned to user
   */
  async getUserAssets(helixUid: string): Promise<AssetItem[]> {
    const response = await apiClient.get<{ assets: AssetItem[] }>(
      `${this.baseUrl}/assets/${helixUid}`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch user assets');
    }
    return response.data.assets;
  }

  /**
   * Get security alerts for user
   */
  async getSecurityAlerts(helixUid: string): Promise<SecurityAlert[]> {
    const response = await apiClient.get<{ alerts: SecurityAlert[] }>(
      `${this.baseUrl}/security/${helixUid}`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch security alerts');
    }
    return response.data.alerts;
  }

  /**
   * Get tickets for user
   */
  async getUserTickets(helixUid: string, limit: number = 10): Promise<TicketSummary[]> {
    const response = await apiClient.get<{ tickets: TicketSummary[] }>(
      `${this.baseUrl}/tickets/${helixUid}?limit=${limit}`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch user tickets');
    }
    return response.data.tickets;
  }

  /**
   * Get activity logs for user
   */
  async getActivityLogs(helixUid: string, limit: number = 50): Promise<ActivityLogEntry[]> {
    const response = await apiClient.get<{ activities: ActivityLogEntry[] }>(
      `${this.baseUrl}/activity/${helixUid}?limit=${limit}`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch activity logs');
    }
    return response.data.activities;
  }

  /**
   * Get training records for user
   */
  async getTrainingRecords(helixUid: string): Promise<TrainingRecord[]> {
    const response = await apiClient.get<{ training: TrainingRecord[] }>(
      `${this.baseUrl}/training/${helixUid}`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch training records');
    }
    return response.data.training;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    helixUid: string,
    updates: Partial<User360Profile>,
  ): Promise<User360Profile> {
    const response = await apiClient.patch<User360Profile>(
      `${this.baseUrl}/profile/${helixUid}`,
      updates,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to update user profile');
    }
    return response.data;
  }

  /**
   * Trigger profile sync from external sources
   */
  async syncUserProfile(helixUid: string): Promise<{ status: string; updated_fields: string[] }> {
    const response = await apiClient.post<{ status: string; updated_fields: string[] }>(
      `${this.baseUrl}/sync/${helixUid}`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to sync user profile');
    }
    return response.data;
  }

  /**
   * Search users
   */
  async searchUsers(
    query: string,
    filters?: {
      department?: string;
      status?: string;
      location?: string;
    },
  ): Promise<User360Profile[]> {
    const searchParams = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const response = await apiClient.get<{ users: User360Profile[] }>(
      `${this.baseUrl}/search?${searchParams}`,
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to search users');
    }
    return response.data.users;
  }

  /**
   * Get user's org chart (manager, peers, direct reports)
   */
  async getOrgChart(helixUid: string): Promise<{
    manager?: User360Profile;
    peers: User360Profile[];
    direct_reports: User360Profile[];
  }> {
    const response = await apiClient.get<{
      manager?: User360Profile;
      peers: User360Profile[];
      direct_reports: User360Profile[];
    }>(`${this.baseUrl}/orgchart/${helixUid}`);

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch org chart');
    }
    return response.data;
  }

  /**
   * Get security posture summary
   */
  async getSecurityPosture(helixUid: string): Promise<{
    score: number;
    factors: {
      mfa_enabled: boolean;
      password_age: number;
      failed_logins: number;
      device_compliance: number;
      policy_violations: number;
    };
    recommendations: string[];
  }> {
    const response = await apiClient.get<{
      score: number;
      factors: any;
      recommendations: string[];
    }>(`${this.baseUrl}/security/posture/${helixUid}`);

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch security posture');
    }
    return response.data;
  }

  /**
   * Perform quick actions on user account
   */
  async performQuickAction(
    helixUid: string,
    action: string,
    params?: Record<string, any>,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/actions/${helixUid}`,
      {
        action,
        params,
      },
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to perform action');
    }
    return response.data;
  }
}

export const user360Service = new User360Service();
export default user360Service;
