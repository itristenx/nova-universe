import { apiClient } from './api';
import type { ApiResponse } from '@/types';

// Types for Pulse API dashboard data
export interface PulseDashboardData {
  myTickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  todayStats: {
    ticketsResolved: number;
    avgResolutionTime: number;
    totalTimeLogged: number;
  };
  upcomingTasks: Array<{
    id: string;
    ticketId: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    category: string;
    subcategory: string;
    location: string;
    estimatedTime: number;
    actualTime: number;
    requestedBy: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    dueDate: string;
  }>;
  recentActivity: Array<{
    ticketId: string;
    action: string;
    timestamp: string;
  }>;
}

export interface QueueMetrics {
  queue_name: string;
  tickets_in_queue: number;
  avg_wait_time_minutes: number;
  sla_breach_count: number;
  agents_available: number;
  total_agents: number;
}

export interface AgentAvailability {
  user_id: string;
  queue_name: string;
  is_available: boolean;
  status: string;
  max_capacity: number;
  current_load: number;
  last_updated: string;
  name: string;
  email: string;
  department: string;
  current_tickets: number;
}

class PulseService {
  private readonly baseUrl = '/api/v1/pulse';

  /**
   * Get dashboard data for current user
   */
  async getDashboard(): Promise<PulseDashboardData> {
    const response = await apiClient.get<ApiResponse<{ dashboard: PulseDashboardData }>>(
      `${this.baseUrl}/dashboard`,
    );
    if (response.data?.data?.dashboard) {
      return response.data.data.dashboard;
    }
    // Handle direct response format
    return (
      (response.data as any)?.dashboard || {
        myTickets: { total: 0, open: 0, inProgress: 0, resolved: 0 },
        todayStats: { ticketsResolved: 0, avgResolutionTime: 0, totalTimeLogged: 0 },
        upcomingTasks: [],
        recentActivity: [],
      }
    );
  }

  /**
   * Get queue metrics - all queues or specific queue
   */
  async getQueueMetrics(queueName?: string): Promise<QueueMetrics[]> {
    const url = queueName
      ? `${this.baseUrl}/queues/metrics?queue=${queueName}`
      : `${this.baseUrl}/queues/metrics`;

    const response = await apiClient.get<ApiResponse<{ metrics: QueueMetrics[] }>>(url);
    const metrics = response.data?.data?.metrics || (response.data as any)?.metrics || [];
    return Array.isArray(metrics) ? metrics : [metrics].filter(Boolean);
  }

  /**
   * Get agent availability for specific queue
   */
  async getQueueAgents(queueName: string): Promise<AgentAvailability[]> {
    const response = await apiClient.get<ApiResponse<{ agents: AgentAvailability[] }>>(
      `${this.baseUrl}/queues/${queueName}/agents`,
    );
    return response.data?.data?.agents || (response.data as any)?.agents || [];
  }

  /**
   * Toggle agent availability for a queue
   */
  async updateAgentAvailability(
    queueName: string,
    data: {
      isAvailable: boolean;
      status?: string;
      maxCapacity?: number;
    },
  ): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      `${this.baseUrl}/queues/${queueName}/agents/availability`,
      data,
    );
  }

  /**
   * Get XP leaderboard data
   */
  async getXPLeaderboard(): Promise<{
    leaderboard: Array<{
      userId: string;
      name: string;
      department: string;
      xp_total: number;
    }>;
    teams: Array<{
      team: string;
      xp_total: number;
    }>;
    me: {
      xp: number;
    };
  }> {
    const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/xp`);
    return (
      response.data?.data ||
      (response.data as any) || {
        leaderboard: [],
        teams: [],
        me: { xp: 0 },
      }
    );
  }

  /**
   * Award XP to current user
   */
  async awardXP(amount: number, reason?: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/xp`, {
      amount,
      reason,
    });
  }
}

export const pulseService = new PulseService();
