/**
 * Backend API Client
 * 
 * Centralized API client for all Nova Universe backend endpoints.
 * Provides typed methods for all 37 production endpoints across Weeks 1-3.
 * 
 * Architecture:
 * - Uses existing api.ts axios instance
 * - Organized by feature domain
 * - TypeScript interfaces for all requests/responses
 * - Consistent error handling
 * - JWT authentication via existing TokenManager
 * 
 * @see FRONTEND-INTEGRATION-TODO.md Phase 1
 * @see docs/BACKEND-COMPLETE-FINAL-REPORT.md for endpoint inventory
 */

import api from './api';
import type { ApiResponse, PaginatedResponse } from '@/types';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Week 1: Knowledge Base Types
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  published: boolean;
  viewCount: number;
  helpfulCount: number;
  category?: string;
  tags?: string[];
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description?: string;
  articleCount: number;
}

// Week 1: Service Catalog Types
export interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'MAINTENANCE';
  featured?: boolean;
  featuredOrder?: number;
  iconUrl?: string;
}

export interface ServiceIncident {
  id: string;
  serviceId: string;
  title: string;
  description?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

// Week 1: Agent Portal Types
export interface AgentQueueItem {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  assignedTo?: string;
  createdAt: string;
}

export interface AgentStats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  customerSatisfaction: number;
}

// Week 1: Directory Types
export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  department?: string;
  title?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
}

export interface DirectoryGroup {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  type?: string;
}

// Week 2: Webhook Types
export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  headers?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING';
  statusCode?: number;
  response?: string;
  attemptCount: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface WebhookEvent {
  name: string;
  description: string;
  category: string;
}

// Week 2: Alert Types
export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  source?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  condition: any;
  actions: any[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlertStats {
  total: number;
  active: number;
  critical: number;
  warning: number;
  info: number;
}

// Week 3: Change Management Types
export interface ChangeRequest {
  id: string;
  number: string;
  shortDescription: string;
  description?: string;
  state: 'NEW' | 'ASSESSMENT' | 'AUTHORIZATION' | 'SCHEDULED' | 'IMPLEMENTATION' | 'REVIEW' | 'CLOSED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  changeType: 'STANDARD' | 'NORMAL' | 'EMERGENCY';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  category: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  justification?: string;
  implementationPlan?: string;
  backoutPlan?: string;
  implementationNotes?: string;
  reviewNotes?: string;
  requestedById: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeFilters {
  state?: string;
  priority?: string;
  changeType?: string;
  riskLevel?: string;
  category?: string;
  search?: string;
}

// Week 3: Workflow Types
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  definition: any;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  definition: any;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  currentStep?: string;
  variables?: any;
  startedById: string;
  createdAt: string;
  completedAt?: string;
}

export interface WorkflowAnalytics {
  workflowId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
  lastExecutionAt?: string;
}

// =============================================================================
// KNOWLEDGE BASE API (Week 1 - 4 endpoints)
// =============================================================================

export const knowledgeAPI = {
  /**
   * Get popular knowledge base articles
   * GET /api/v1/knowledge/popular
   */
  getPopular: async (limit = 10): Promise<KnowledgeArticle[]> => {
    const response = await api.get<ApiResponse<KnowledgeArticle[]>>(`/api/v1/knowledge/popular?limit=${limit}`);
    return response.data.data || response.data;
  },

  /**
   * Search knowledge base articles
   * GET /api/v1/knowledge/search
   */
  search: async (query: string): Promise<KnowledgeArticle[]> => {
    const response = await api.get<ApiResponse<KnowledgeArticle[]>>(`/api/v1/knowledge/search?q=${encodeURIComponent(query)}`);
    return response.data.data || response.data;
  },

  /**
   * Get knowledge base categories
   * GET /api/v1/knowledge/categories
   */
  getCategories: async (): Promise<KnowledgeCategory[]> => {
    const response = await api.get<ApiResponse<KnowledgeCategory[]>>('/api/v1/knowledge/categories');
    return response.data.data || response.data;
  },

  /**
   * Get single article by ID
   * GET /api/v1/knowledge/:id
   */
  getArticle: async (id: string): Promise<KnowledgeArticle> => {
    const response = await api.get<ApiResponse<KnowledgeArticle>>(`/api/v1/knowledge/${id}`);
    return response.data.data || response.data;
  },
};

// =============================================================================
// SERVICE CATALOG API (Week 1 - 4 endpoints)
// =============================================================================

export const servicesAPI = {
  /**
   * Get popular services
   * GET /api/v1/services/popular
   */
  getPopular: async (limit = 10): Promise<Service[]> => {
    const response = await api.get<ApiResponse<Service[]>>(`/api/v1/services/popular?limit=${limit}`);
    return response.data.data || response.data;
  },

  /**
   * Get featured services
   * GET /api/v1/services/featured
   */
  getFeatured: async (): Promise<Service[]> => {
    const response = await api.get<ApiResponse<Service[]>>('/api/v1/services/featured');
    return response.data.data || response.data;
  },

  /**
   * Get service categories
   * GET /api/v1/services/categories
   */
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/api/v1/services/categories');
    return response.data.data || response.data;
  },

  /**
   * Get service status
   * GET /api/v1/services/status
   */
  getStatus: async (): Promise<Service[]> => {
    const response = await api.get<ApiResponse<Service[]>>('/api/v1/services/status');
    return response.data.data || response.data;
  },
};

// =============================================================================
// AGENT PORTAL API (Week 1 - 2 endpoints)
// =============================================================================

export const agentAPI = {
  /**
   * Get agent queue
   * GET /api/v1/agent/queue
   */
  getQueue: async (): Promise<AgentQueueItem[]> => {
    const response = await api.get<ApiResponse<AgentQueueItem[]>>('/api/v1/agent/queue');
    return response.data.data || response.data;
  },

  /**
   * Get agent statistics
   * GET /api/v1/agent/stats
   */
  getStats: async (): Promise<AgentStats> => {
    const response = await api.get<ApiResponse<AgentStats>>('/api/v1/agent/stats');
    return response.data.data || response.data;
  },
};

// =============================================================================
// DIRECTORY API (Week 1 - 4 endpoints)
// =============================================================================

export const directoryAPI = {
  /**
   * Search users
   * GET /api/v1/directory/users
   */
  searchUsers: async (query: string): Promise<DirectoryUser[]> => {
    const response = await api.get<ApiResponse<DirectoryUser[]>>(`/api/v1/directory/users?search=${encodeURIComponent(query)}`);
    return response.data.data || response.data;
  },

  /**
   * Search groups
   * GET /api/v1/directory/groups
   */
  searchGroups: async (query: string): Promise<DirectoryGroup[]> => {
    const response = await api.get<ApiResponse<DirectoryGroup[]>>(`/api/v1/directory/groups?search=${encodeURIComponent(query)}`);
    return response.data.data || response.data;
  },

  /**
   * Get user by ID
   * GET /api/v1/directory/users/:id
   */
  getUser: async (id: string): Promise<DirectoryUser> => {
    const response = await api.get<ApiResponse<DirectoryUser>>(`/api/v1/directory/users/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Get group by ID
   * GET /api/v1/directory/groups/:id
   */
  getGroup: async (id: string): Promise<DirectoryGroup> => {
    const response = await api.get<ApiResponse<DirectoryGroup>>(`/api/v1/directory/groups/${id}`);
    return response.data.data || response.data;
  },
};

// =============================================================================
// WEBHOOKS API (Week 2 - 8 endpoints)
// =============================================================================

export const webhooksAPI = {
  /**
   * List all webhooks
   * GET /api/v1/webhooks
   */
  list: async (): Promise<WebhookEndpoint[]> => {
    const response = await api.get<ApiResponse<WebhookEndpoint[]>>('/api/v1/webhooks');
    return response.data.data || response.data;
  },

  /**
   * Create new webhook
   * POST /api/v1/webhooks
   */
  create: async (data: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> => {
    const response = await api.post<ApiResponse<WebhookEndpoint>>('/api/v1/webhooks', data);
    return response.data.data || response.data;
  },

  /**
   * Update webhook
   * PUT /api/v1/webhooks/:id
   */
  update: async (id: string, data: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> => {
    const response = await api.put<ApiResponse<WebhookEndpoint>>(`/api/v1/webhooks/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Delete webhook
   * DELETE /api/v1/webhooks/:id
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/webhooks/${id}`);
  },

  /**
   * Get available webhook events
   * GET /api/v1/webhooks/events
   */
  getEvents: async (): Promise<WebhookEvent[]> => {
    const response = await api.get<ApiResponse<WebhookEvent[]>>('/api/v1/webhooks/events');
    return response.data.data || response.data;
  },

  /**
   * Get webhook deliveries
   * GET /api/v1/webhooks/:id/deliveries
   */
  getDeliveries: async (id: string): Promise<WebhookDelivery[]> => {
    const response = await api.get<ApiResponse<WebhookDelivery[]>>(`/api/v1/webhooks/${id}/deliveries`);
    return response.data.data || response.data;
  },

  /**
   * Retry failed delivery
   * POST /api/v1/webhooks/:webhookId/retry/:deliveryId
   */
  retry: async (webhookId: string, deliveryId: string): Promise<WebhookDelivery> => {
    const response = await api.post<ApiResponse<WebhookDelivery>>(`/api/v1/webhooks/${webhookId}/retry/${deliveryId}`);
    return response.data.data || response.data;
  },

  /**
   * Test webhook
   * POST /api/v1/webhooks/:id/test
   */
  test: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(`/api/v1/webhooks/${id}/test`);
    return response.data.data || response.data;
  },
};

// =============================================================================
// ALERTS API (Week 2 - 6 core endpoints)
// =============================================================================

export const alertsAPI = {
  /**
   * Get active alerts
   * GET /api/v1/alerts/active
   */
  getActive: async (): Promise<Alert[]> => {
    const response = await api.get<ApiResponse<Alert[]>>('/api/v1/alerts/active');
    return response.data.data || response.data;
  },

  /**
   * Get alert statistics
   * GET /api/v1/alerts/stats
   */
  getStats: async (): Promise<AlertStats> => {
    const response = await api.get<ApiResponse<AlertStats>>('/api/v1/alerts/stats');
    return response.data.data || response.data;
  },

  /**
   * List all alerts
   * GET /api/v1/alerts
   */
  list: async (): Promise<Alert[]> => {
    const response = await api.get<ApiResponse<Alert[]>>('/api/v1/alerts');
    return response.data.data || response.data;
  },

  /**
   * Create alert rule
   * POST /api/v1/alerts/rules
   */
  createRule: async (data: Partial<AlertRule>): Promise<AlertRule> => {
    const response = await api.post<ApiResponse<AlertRule>>('/api/v1/alerts/rules', data);
    return response.data.data || response.data;
  },

  /**
   * Update alert rule
   * PUT /api/v1/alerts/rules/:id
   */
  updateRule: async (id: string, data: Partial<AlertRule>): Promise<AlertRule> => {
    const response = await api.put<ApiResponse<AlertRule>>(`/api/v1/alerts/rules/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Delete alert rule
   * DELETE /api/v1/alerts/rules/:id
   */
  deleteRule: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/alerts/rules/${id}`);
  },

  /**
   * Acknowledge alert
   * POST /api/v1/alerts/:id/acknowledge
   */
  acknowledge: async (id: string): Promise<Alert> => {
    const response = await api.post<ApiResponse<Alert>>(`/api/v1/alerts/${id}/acknowledge`);
    return response.data.data || response.data;
  },

  /**
   * Resolve alert
   * POST /api/v1/alerts/:id/resolve
   */
  resolve: async (id: string, notes?: string): Promise<Alert> => {
    const response = await api.post<ApiResponse<Alert>>(`/api/v1/alerts/${id}/resolve`, { notes });
    return response.data.data || response.data;
  },
};

// =============================================================================
// CHANGE MANAGEMENT API (Week 3 - 8 endpoints)
// =============================================================================

export const changesAPI = {
  /**
   * List change requests
   * GET /api/v1/changes
   */
  list: async (filters?: ChangeFilters): Promise<ChangeRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.state) params.append('state', filters.state);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.changeType) params.append('type', filters.changeType);
    if (filters?.riskLevel) params.append('risk', filters.riskLevel);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/api/v1/changes?${queryString}` : '/api/v1/changes';
    const response = await api.get<ApiResponse<ChangeRequest[]>>(url);
    return response.data.data || response.data;
  },

  /**
   * Create change request
   * POST /api/v1/changes
   */
  create: async (data: Partial<ChangeRequest>): Promise<ChangeRequest> => {
    const response = await api.post<ApiResponse<ChangeRequest>>('/api/v1/changes', data);
    return response.data.data || response.data;
  },

  /**
   * Get change request by ID
   * GET /api/v1/changes/:id
   */
  get: async (id: string): Promise<ChangeRequest> => {
    const response = await api.get<ApiResponse<ChangeRequest>>(`/api/v1/changes/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Update change request
   * PUT /api/v1/changes/:id
   */
  update: async (id: string, data: Partial<ChangeRequest>): Promise<ChangeRequest> => {
    const response = await api.put<ApiResponse<ChangeRequest>>(`/api/v1/changes/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Approve change request
   * POST /api/v1/changes/:id/approve
   */
  approve: async (id: string, notes?: string): Promise<ChangeRequest> => {
    const response = await api.post<ApiResponse<ChangeRequest>>(`/api/v1/changes/${id}/approve`, { notes });
    return response.data.data || response.data;
  },

  /**
   * Reject change request
   * POST /api/v1/changes/:id/reject
   */
  reject: async (id: string, reason: string): Promise<ChangeRequest> => {
    const response = await api.post<ApiResponse<ChangeRequest>>(`/api/v1/changes/${id}/reject`, { reason });
    return response.data.data || response.data;
  },

  /**
   * Mark change as implemented
   * POST /api/v1/changes/:id/implement
   */
  implement: async (id: string, notes?: string): Promise<ChangeRequest> => {
    const response = await api.post<ApiResponse<ChangeRequest>>(`/api/v1/changes/${id}/implement`, { notes });
    return response.data.data || response.data;
  },

  /**
   * Get change calendar
   * GET /api/v1/changes/calendar
   */
  getCalendar: async (): Promise<ChangeRequest[]> => {
    const response = await api.get<ApiResponse<ChangeRequest[]>>('/api/v1/changes/calendar');
    return response.data.data || response.data;
  },
};

// =============================================================================
// WORKFLOWS API (Week 3 - 11 endpoints)
// =============================================================================

export const workflowsAPI = {
  /**
   * List workflows
   * GET /api/v1/workflows
   */
  list: async (): Promise<Workflow[]> => {
    const response = await api.get<ApiResponse<Workflow[]>>('/api/v1/workflows');
    return response.data.data || response.data;
  },

  /**
   * Get workflow templates
   * GET /api/v1/workflows/templates
   */
  getTemplates: async (): Promise<WorkflowTemplate[]> => {
    const response = await api.get<ApiResponse<WorkflowTemplate[]>>('/api/v1/workflows/templates');
    return response.data.data || response.data;
  },

  /**
   * Get workflow system status
   * GET /api/v1/workflows/status
   */
  getStatus: async (): Promise<{ healthy: boolean; activeWorkflows: number; queuedTasks: number }> => {
    const response = await api.get<ApiResponse<any>>('/api/v1/workflows/status');
    return response.data.data || response.data;
  },

  /**
   * Get workflow by ID
   * GET /api/v1/workflows/:id
   */
  get: async (id: string): Promise<Workflow> => {
    const response = await api.get<ApiResponse<Workflow>>(`/api/v1/workflows/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Create workflow
   * POST /api/v1/workflows
   */
  create: async (data: Partial<Workflow>): Promise<Workflow> => {
    const response = await api.post<ApiResponse<Workflow>>('/api/v1/workflows', data);
    return response.data.data || response.data;
  },

  /**
   * Update workflow
   * PUT /api/v1/workflows/:id
   */
  update: async (id: string, data: Partial<Workflow>): Promise<Workflow> => {
    const response = await api.put<ApiResponse<Workflow>>(`/api/v1/workflows/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Delete workflow
   * DELETE /api/v1/workflows/:id
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/workflows/${id}`);
  },

  /**
   * Publish workflow
   * POST /api/v1/workflows/:id/publish
   */
  publish: async (id: string): Promise<Workflow> => {
    const response = await api.post<ApiResponse<Workflow>>(`/api/v1/workflows/${id}/publish`);
    return response.data.data || response.data;
  },

  /**
   * Execute workflow
   * POST /api/v1/workflows/:id/execute
   */
  execute: async (id: string, variables?: any): Promise<WorkflowInstance> => {
    const response = await api.post<ApiResponse<WorkflowInstance>>(`/api/v1/workflows/${id}/execute`, { variables });
    return response.data.data || response.data;
  },

  /**
   * Get workflow executions
   * GET /api/v1/workflows/:id/executions
   */
  getExecutions: async (id: string): Promise<WorkflowInstance[]> => {
    const response = await api.get<ApiResponse<WorkflowInstance[]>>(`/api/v1/workflows/${id}/executions`);
    return response.data.data || response.data;
  },

  /**
   * Get workflow analytics
   * GET /api/v1/workflows/:id/analytics
   */
  getAnalytics: async (id: string): Promise<WorkflowAnalytics> => {
    const response = await api.get<ApiResponse<WorkflowAnalytics>>(`/api/v1/workflows/${id}/analytics`);
    return response.data.data || response.data;
  },
};

// =============================================================================
// EXPORT ALL APIs
// =============================================================================

export default {
  knowledge: knowledgeAPI,
  services: servicesAPI,
  agent: agentAPI,
  directory: directoryAPI,
  webhooks: webhooksAPI,
  alerts: alertsAPI,
  changes: changesAPI,
  workflows: workflowsAPI,
};

/**
 * Usage Examples:
 * 
 * import backendAPI from '@/services/backend-api-client';
 * 
 * // Week 1 - Knowledge Base
 * const articles = await backendAPI.knowledge.getPopular();
 * const searchResults = await backendAPI.knowledge.search('deployment');
 * 
 * // Week 1 - Services
 * const services = await backendAPI.services.getPopular();
 * const featured = await backendAPI.services.getFeatured();
 * 
 * // Week 2 - Webhooks
 * const webhooks = await backendAPI.webhooks.list();
 * const created = await backendAPI.webhooks.create({ name: 'My Webhook', url: '...' });
 * 
 * // Week 2 - Alerts
 * const activeAlerts = await backendAPI.alerts.getActive();
 * const stats = await backendAPI.alerts.getStats();
 * 
 * // Week 3 - Changes
 * const changes = await backendAPI.changes.list({ state: 'NEW', priority: 'HIGH' });
 * const created = await backendAPI.changes.create({ shortDescription: '...' });
 * 
 * // Week 3 - Workflows
 * const workflows = await backendAPI.workflows.list();
 * const templates = await backendAPI.workflows.getTemplates();
 * const instance = await backendAPI.workflows.execute(workflowId, { key: 'value' });
 */
