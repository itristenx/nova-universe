/**
 * Approvals Service
 * Handles API calls for approval flows and instances
 */

import { apiClient } from './api';

export interface ApprovalFlow {
  id: string;
  name: string;
  description: string;
  trigger_conditions: any;
  approval_steps: any[];
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  created_by: string;
  created_at: string;
  [key: string]: any;
}

export interface ApprovalInstance {
  id: string;
  flow_id: string;
  flow_name: string;
  request_id: string;
  request_type: string;
  requester_id: string;
  requester_name: string;
  current_step: number;
  total_steps: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submitted_at: string;
  [key: string]: any;
}

class ApprovalsService {
  private readonly basePath = '/api/v1/approvals';

  async getFlows(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ flows: ApprovalFlow[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/flows`, { params });
    return response.data;
  }

  async getFlow(id: string): Promise<ApprovalFlow> {
    const response = await apiClient.get(`${this.basePath}/flows/${id}`);
    return response.data;
  }

  async createFlow(flow: Partial<ApprovalFlow>): Promise<ApprovalFlow> {
    const response = await apiClient.post(`${this.basePath}/flows`, flow);
    return response.data;
  }

  async updateFlow(id: string, updates: Partial<ApprovalFlow>): Promise<ApprovalFlow> {
    const response = await apiClient.put(`${this.basePath}/flows/${id}`, updates);
    return response.data;
  }

  async deleteFlow(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/flows/${id}`);
  }

  async getInstances(params?: {
    status?: string;
    flow_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ instances: ApprovalInstance[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/instances`, { params });
    return response.data;
  }

  async getInstance(id: string): Promise<ApprovalInstance> {
    const response = await apiClient.get(`${this.basePath}/instances/${id}`);
    return response.data;
  }

  async approveInstance(id: string, comments?: string): Promise<ApprovalInstance> {
    const response = await apiClient.post(`${this.basePath}/instances/${id}/approve`, { comments });
    return response.data;
  }

  async rejectInstance(id: string, reason: string): Promise<ApprovalInstance> {
    const response = await apiClient.post(`${this.basePath}/instances/${id}/reject`, { reason });
    return response.data;
  }
}

export const approvalsService = new ApprovalsService();
