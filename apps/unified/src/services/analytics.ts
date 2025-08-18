import { api } from './api';

export interface DashboardAnalytics {
  summary: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    avgResolutionHours: string;
    vipTickets: number;
    activeUsers: number;
    knowledgeArticles: number;
    systemUptime: number;
  };
  performance: {
    avgResponseTime: string;
    maxResponseTime: string;
    errorRate: string;
    dbSize: number;
    activeConnections: number;
  };
  trends: {
    dailyTickets: Array<{
      date: string;
      tickets: number;
      vip_tickets: number;
    }>;
    resolutionTimes: Array<{
      date: string;
      avg_resolution_hours: number;
    }>;
    userActivity: Array<{
      date: string;
      active_users: number;
    }>;
  };
  analysis: {
    categories: Array<{
      category: string;
      count: number;
      avg_resolution_hours: number;
      resolution_rate: number;
    }>;
    agents: Array<{
      assigned_to: string;
      tickets_handled: number;
      avg_resolution_hours: number;
      resolved_count: number;
    }>;
    satisfaction: {
      avg_rating: number;
      total_ratings: number;
    };
  };
  metadata: {
    timeRange: string;
    generatedAt: string;
    userId?: string;
  };
}

export interface RealTimeMetrics {
  timestamp: string;
  activeUsers: number;
  openTickets: number;
  systemLoad: number;
  responseTime: number;
  errorRate: number;
  queueDepth: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ActivityItem {
  id: string;
  type: 'ticket' | 'asset' | 'space' | 'user' | 'system' | 'auth';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  metadata?: Record<string, any>;
}

class AnalyticsService {
  async getDashboardAnalytics(timeRange: '1d' | '7d' | '30d' | '90d' = '7d'): Promise<DashboardAnalytics> {
    const response = await api.get(`/v1/analytics/dashboard?range=${timeRange}`);
    return response.data;
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const response = await api.get('/v1/analytics/real-time');
    return response.data;
  }

  async getTicketTrends(timeRange: string = '7d') {
    const response = await api.get(`/v1/analytics/trends/tickets?range=${timeRange}`);
    return response.data;
  }

  async getAgentPerformance(timeRange: string = '7d') {
    const response = await api.get(`/v1/analytics/performance/agents?range=${timeRange}`);
    return response.data;
  }

  async getCategoryAnalysis(timeRange: string = '7d') {
    const response = await api.get(`/v1/analytics/categories?range=${timeRange}`);
    return response.data;
  }

  async getSystemMetrics() {
    const response = await api.get('/v1/analytics/system');
    return response.data;
  }

  async getCustomMetrics(metricType: string, timeRange: string = '7d') {
    const response = await api.get(`/v1/analytics/custom/${metricType}?range=${timeRange}`);
    return response.data;
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    try {
      // Get recent audit activity (auth events, system changes)
      const auditResponse = await api.get(`/helix/login/audit?limit=${Math.min(limit, 5)}`);
      const auditLogs = auditResponse.data?.data || [];

      // Get recent ticket activity 
      const ticketResponse = await api.get(`/v1/tickets?limit=${Math.min(limit, 5)}&sort=created_at:desc`);
      const recentTickets = ticketResponse.data?.data || [];

      // Transform audit logs to activity items
      const auditActivities: ActivityItem[] = auditLogs.map((log: any) => ({
        id: `audit-${log.id}`,
        type: 'auth' as const,
        title: this.formatAuditTitle(log.event_type),
        description: this.formatAuditDescription(log),
        timestamp: this.formatTimestamp(log.created_at),
        user: log.user_name || log.user_email || 'System',
        status: this.getAuditStatus(log.event_type),
        metadata: log.metadata
      }));

      // Transform tickets to activity items
      const ticketActivities: ActivityItem[] = recentTickets.map((ticket: any) => ({
        id: `ticket-${ticket.id}`,
        type: 'ticket' as const,
        title: this.formatTicketTitle(ticket),
        description: ticket.title || 'No description available',
        timestamp: this.formatTimestamp(ticket.created_at),
        user: ticket.requester?.name || ticket.requester?.email || 'Unknown',
        status: this.getTicketStatus(ticket.status),
        metadata: { priority: ticket.priority, type: ticket.type }
      }));

      // Combine and sort by timestamp
      const allActivities = [...auditActivities, ...ticketActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

      return allActivities;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Return empty array as fallback
      return [];
    }
  }

  private formatAuditTitle(eventType: string): string {
    const titles: Record<string, string> = {
      'login_success': 'User Login',
      'login_failed': 'Failed Login Attempt',
      'logout': 'User Logout',
      'password_change': 'Password Changed',
      'mfa_enabled': 'MFA Enabled',
      'mfa_disabled': 'MFA Disabled',
      'tenant_discovery': 'Tenant Discovery',
      'sso_login': 'SSO Login',
      'token_refresh': 'Session Refreshed'
    };
    return titles[eventType] || 'Authentication Event';
  }

  private formatAuditDescription(log: any): string {
    const { event_type, metadata = {} } = log;
    switch (event_type) {
      case 'login_success':
        return `Successful login from ${metadata.ip_address || 'unknown IP'}`;
      case 'login_failed':
        return `Failed login attempt: ${metadata.error_reason || 'Invalid credentials'}`;
      case 'tenant_discovery':
        return `Tenant discovery for ${metadata.email || 'user'}`;
      case 'sso_login':
        return `SSO login via ${metadata.provider || 'provider'}`;
      default:
        return log.event_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'System event';
    }
  }

  private formatTicketTitle(ticket: any): string {
    const prefix = ticket.ticket_number || `T-${ticket.id}`;
    return `${prefix} - ${ticket.type || 'Ticket'} ${ticket.status || 'Created'}`;
  }

  private getAuditStatus(eventType: string): 'success' | 'warning' | 'error' | 'info' {
    if (eventType?.includes('failed') || eventType?.includes('error')) return 'error';
    if (eventType?.includes('warning') || eventType?.includes('disabled')) return 'warning';
    if (eventType?.includes('success') || eventType?.includes('enabled')) return 'success';
    return 'info';
  }

  private getTicketStatus(status: string): 'success' | 'warning' | 'error' | 'info' {
    switch (status?.toLowerCase()) {
      case 'resolved':
      case 'closed':
        return 'success';
      case 'urgent':
      case 'high':
        return 'error';
      case 'in_progress':
      case 'assigned':
        return 'warning';
      default:
        return 'info';
    }
  }

  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const analyticsService = new AnalyticsService();
