/**
 * Enhanced A/B Testing Service with Helix Database Integration
 * Supports user, group, and department-based assignment
 */

import { apiClient } from './api';
import { ABTest, ABVariation, ABTestResults } from '@components/ABTestingFramework';

export interface UserAssignment {
  userId: string;
  testId: string;
  variationId: string;
  assignedAt: Date;
  segmentCriteria: Record<string, any>;
}

export interface GroupAssignment {
  groupId: string;
  groupType: 'department' | 'team' | 'role' | 'custom';
  testId: string;
  variationId: string;
  assignedAt: Date;
  rules: AssignmentRule[];
}

export interface AssignmentRule {
  type: 'attribute' | 'segment' | 'percentage' | 'geolocation';
  attribute?: string;
  operator?: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value?: any;
  percentage?: number;
}

export interface HelixUserProfile {
  id: string;
  helixUid: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
  location?: string;
  roles: string[];
  groups: string[];
  permissions: string[];
  customAttributes: Record<string, any>;
  securityScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  lastActiveAt?: Date;
}

export interface ABTestConfiguration {
  targeting: {
    userCriteria: AssignmentRule[];
    departmentCriteria: AssignmentRule[];
    groupCriteria: AssignmentRule[];
    excludeUsers?: string[];
    excludeGroups?: string[];
    includeOnlyUsers?: string[];
    includeOnlyGroups?: string[];
  };
  traffic: {
    allocation: number; // Percentage of eligible users
    rampUp?: {
      enabled: boolean;
      startPercentage: number;
      endPercentage: number;
      durationDays: number;
    };
  };
  scheduling: {
    startDate?: Date;
    endDate?: Date;
    timeZone?: string;
    businessHoursOnly?: boolean;
  };
}

class HelixABTestingService {
  private baseUrl = '/api/v1/ab-testing';

  /**
   * Create a new A/B test with Helix integration
   */
  async createTest(test: Omit<ABTest, 'id' | 'created_at' | 'updated_at'>): Promise<ABTest> {
    const response = await apiClient.post<ABTest>(`${this.baseUrl}/tests`, test);
    if (!response.success || !response.data) {
      throw new Error('Failed to create A/B test');
    }
    return response.data;
  }

  /**
   * Get all A/B tests with filtering
   */
  async getTests(filters?: {
    status?: ABTest['status'][];
    creator?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  }): Promise<ABTest[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status.join(','));
    if (filters?.creator) params.append('creator', filters.creator);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.dateRange) {
      params.append('start_date', filters.dateRange.start.toISOString());
      params.append('end_date', filters.dateRange.end.toISOString());
    }

    const response = await apiClient.get<{ tests: ABTest[] }>(`${this.baseUrl}/tests?${params}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch A/B tests');
    }
    return response.data.tests;
  }

  /**
   * Get test assignment for a specific user
   */
  async getUserAssignment(testId: string, userId: string): Promise<UserAssignment | null> {
    const response = await apiClient.get<UserAssignment>(
      `${this.baseUrl}/tests/${testId}/users/${userId}/assignment`,
    );
    return response.success ? response.data : null;
  }

  /**
   * Assign users to A/B test variations based on Helix criteria
   */
  async assignUsersToTest(
    testId: string,
    config: ABTestConfiguration,
  ): Promise<{
    assigned: number;
    excluded: number;
    assignments: UserAssignment[];
  }> {
    const response = await apiClient.post<{
      assigned: number;
      excluded: number;
      assignments: UserAssignment[];
    }>(`${this.baseUrl}/tests/${testId}/assign`, config);

    if (!response.success || !response.data) {
      throw new Error('Failed to assign users to test');
    }
    return response.data;
  }

  /**
   * Assign entire departments to A/B test
   */
  async assignDepartmentToTest(
    testId: string,
    departments: string[],
    variationId: string,
    rules?: AssignmentRule[],
  ): Promise<GroupAssignment[]> {
    const response = await apiClient.post<GroupAssignment[]>(
      `${this.baseUrl}/tests/${testId}/assign-departments`,
      {
        departments,
        variationId,
        rules: rules || [],
      },
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to assign departments to test');
    }
    return response.data;
  }

  /**
   * Assign user groups to A/B test
   */
  async assignGroupsToTest(
    testId: string,
    groups: Array<{ id: string; type: 'team' | 'role' | 'custom' }>,
    variationId: string,
    rules?: AssignmentRule[],
  ): Promise<GroupAssignment[]> {
    const response = await apiClient.post<GroupAssignment[]>(
      `${this.baseUrl}/tests/${testId}/assign-groups`,
      {
        groups,
        variationId,
        rules: rules || [],
      },
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to assign groups to test');
    }
    return response.data;
  }

  /**
   * Get eligible users for A/B test based on criteria
   */
  async getEligibleUsers(criteria: AssignmentRule[]): Promise<HelixUserProfile[]> {
    const response = await apiClient.post<{ users: HelixUserProfile[] }>(
      `${this.baseUrl}/eligible-users`,
      {
        criteria,
      },
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch eligible users');
    }
    return response.data.users;
  }

  /**
   * Get user's A/B test assignments for User360 display
   */
  async getUserTestAssignments(userId: string): Promise<
    Array<{
      test: ABTest;
      variation: ABVariation;
      assignedAt: Date;
      isActive: boolean;
      metrics: {
        exposures: number;
        conversions: number;
        lastExposure?: Date;
      };
    }>
  > {
    const response = await apiClient.get<
      Array<{
        test: ABTest;
        variation: ABVariation;
        assignedAt: Date;
        isActive: boolean;
        metrics: {
          exposures: number;
          conversions: number;
          lastExposure?: Date;
        };
      }>
    >(`${this.baseUrl}/users/${userId}/assignments`);

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch user test assignments');
    }
    return response.data;
  }

  /**
   * Track user exposure to A/B test variation
   */
  async trackExposure(
    testId: string,
    userId: string,
    variationId: string,
    context?: Record<string, any>,
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/tests/${testId}/exposures`, {
      userId,
      variationId,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track conversion for A/B test
   */
  async trackConversion(
    testId: string,
    userId: string,
    conversionType: string,
    value?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/tests/${testId}/conversions`, {
      userId,
      conversionType,
      value,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get A/B test results with statistical analysis
   */
  async getTestResults(testId: string): Promise<ABTestResults> {
    const response = await apiClient.get<ABTestResults>(`${this.baseUrl}/tests/${testId}/results`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch test results');
    }
    return response.data;
  }

  /**
   * Check if user should see specific variation
   */
  async shouldShowVariation(
    testId: string,
    userId: string,
    featureFlag: string,
  ): Promise<{
    shouldShow: boolean;
    variationId?: string;
    configuration?: Record<string, any>;
  }> {
    const response = await apiClient.get<{
      shouldShow: boolean;
      variationId?: string;
      configuration?: Record<string, any>;
    }>(`${this.baseUrl}/tests/${testId}/evaluate?userId=${userId}&featureFlag=${featureFlag}`);

    return response.success ? response.data! : { shouldShow: false };
  }

  /**
   * Get departments from Helix for targeting
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
   * Get user groups from Helix for targeting
   */
  async getUserGroups(): Promise<
    Array<{
      id: string;
      name: string;
      type: 'team' | 'role' | 'custom';
      memberCount: number;
      description?: string;
    }>
  > {
    const response = await apiClient.get<{
      groups: Array<{
        id: string;
        name: string;
        type: 'team' | 'role' | 'custom';
        memberCount: number;
        description?: string;
      }>;
    }>('/api/v1/helix/groups');

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch user groups');
    }
    return response.data.groups;
  }

  /**
   * Start A/B test
   */
  async startTest(testId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/tests/${testId}/start`);
  }

  /**
   * Pause A/B test
   */
  async pauseTest(testId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/tests/${testId}/pause`);
  }

  /**
   * Stop A/B test
   */
  async stopTest(testId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/tests/${testId}/stop`);
  }

  /**
   * Update A/B test configuration
   */
  async updateTest(testId: string, updates: Partial<ABTest>): Promise<ABTest> {
    const response = await apiClient.put<ABTest>(`${this.baseUrl}/tests/${testId}`, updates);
    if (!response.success || !response.data) {
      throw new Error('Failed to update A/B test');
    }
    return response.data;
  }

  /**
   * Delete A/B test
   */
  async deleteTest(testId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/tests/${testId}`);
  }

  /**
   * Export test results
   */
  async exportResults(testId: string, format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/tests/${testId}/export?format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('nova_access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export test results');
    }

    return response.blob();
  }
}

// Export singleton instance
export const helixABTestingService = new HelixABTestingService();
export default helixABTestingService;
