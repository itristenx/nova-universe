/**
 * Workflow Service
 * Handles API calls for workflow management, execution, and analytics
 */

import { apiClient } from './api';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'PROCESS' | 'APPROVAL' | 'AUTOMATION' | 'INTEGRATION';
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  version: string;
  created_by: string;
  created_at: string;
  last_executed?: string;
  execution_count: number;
  success_rate: number;
  [key: string]: any;
}

export interface WorkflowExecution {
  execution_id: string;
  workflow_id: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  started_at: string;
  completed_at?: string;
  duration?: number;
  triggered_by: string;
  result?: string;
  error?: string;
  [key: string]: any;
}

class WorkflowService {
  private readonly basePath = '/api/v1/workflows';

  /**
   * Get all workflows with optional filtering
   */
  async getWorkflows(params?: {
    type?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ workflows: Workflow[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}`, { params });
    return response.data;
  }

  /**
   * Get a single workflow by ID
   */
  async getWorkflow(id: string): Promise<Workflow> {
    const response = await apiClient.get(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await apiClient.post(`${this.basePath}`, workflow);
    return response.data;
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const response = await apiClient.put(`${this.basePath}/${id}`, updates);
    return response.data;
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(id: string, params?: any): Promise<WorkflowExecution> {
    const response = await apiClient.post(`${this.basePath}/${id}/execute`, params);
    return response.data;
  }

  /**
   * Get workflow executions
   */
  async getExecutions(workflowId?: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ executions: WorkflowExecution[]; total: number }> {
    const path = workflowId 
      ? `${this.basePath}/${workflowId}/executions`
      : `${this.basePath}/executions`;
    const response = await apiClient.get(path, { params });
    return response.data;
  }

  /**
   * Get workflow analytics
   */
  async getAnalytics(workflowId?: string): Promise<any> {
    const path = workflowId
      ? `${this.basePath}/${workflowId}/analytics`
      : `${this.basePath}/analytics`;
    const response = await apiClient.get(path);
    return response.data;
  }

  /**
   * Pause a workflow
   */
  async pauseWorkflow(id: string): Promise<Workflow> {
    const response = await apiClient.post(`${this.basePath}/${id}/pause`);
    return response.data;
  }

  /**
   * Resume a workflow
   */
  async resumeWorkflow(id: string): Promise<Workflow> {
    const response = await apiClient.post(`${this.basePath}/${id}/resume`);
    return response.data;
  }

  /**
   * Cancel a workflow execution
   */
  async cancelExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await apiClient.post(`${this.basePath}/executions/${executionId}/cancel`);
    return response.data;
  }
}

export const workflowService = new WorkflowService();
