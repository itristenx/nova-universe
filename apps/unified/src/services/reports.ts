import { apiClient } from './api';

export interface MetricData {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ReportFilters {
  period: '24h' | '7d' | '30d' | '90d' | '1y';
  startDate?: string;
  endDate?: string;
  department?: string;
  category?: string;
}

export interface OverviewMetrics {
  totalTickets: MetricData;
  activeAssets: MetricData;
  activeUsers: MetricData;
  resolutionRate: MetricData;
  assetValue: MetricData;
  spaceUtilization: MetricData;
}

export interface TicketMetrics {
  totalTickets: MetricData;
  openTickets: MetricData;
  resolvedTickets: MetricData;
  avgResolutionTime: MetricData;
  escalatedTickets: MetricData;
  customerSatisfaction: MetricData;
}

export interface AssetMetrics {
  totalAssets: MetricData;
  activeAssets: MetricData;
  totalValue: MetricData;
  avgAge: MetricData;
  maintenanceCosts: MetricData;
  utilizationRate: MetricData;
}

export interface UserMetrics {
  totalUsers: MetricData;
  activeUsers: MetricData;
  newUsers: MetricData;
  avgSessionTime: MetricData;
  ticketsPerUser: MetricData;
  loginFrequency: MetricData;
}

export interface SpaceMetrics {
  totalSpaces: MetricData;
  occupiedSpaces: MetricData;
  utilizationRate: MetricData;
  avgOccupancy: MetricData;
  energyCosts: MetricData;
  maintenanceRequests: MetricData;
}

export interface TicketTrendData {
  newTickets: ChartData;
  resolvedTickets: ChartData;
  byPriority: ChartData;
  byCategory: ChartData;
  resolutionTimes: ChartData;
}

export interface AssetReportData {
  byCategory: ChartData;
  byStatus: ChartData;
  ageDistribution: ChartData;
  valueOverTime: ChartData;
  maintenanceCosts: ChartData;
}

export interface UserReportData {
  registrationTrends: ChartData;
  activityLevels: ChartData;
  roleDistribution: ChartData;
  departmentBreakdown: ChartData;
  loginPatterns: ChartData;
}

export interface SpaceReportData {
  utilizationTrends: ChartData;
  occupancyRates: ChartData;
  energyConsumption: ChartData;
  maintenanceRequests: ChartData;
  costBreakdown: ChartData;
}

class ReportsService {
  /**
   * Get overview metrics for dashboard
   */
  async getOverviewMetrics(filters: ReportFilters): Promise<OverviewMetrics> {
    try {
      const response = await apiClient.get('/reports/overview', {
        params: filters,
      });
      return response.data as OverviewMetrics;
    } catch (_error) {
      console.error('Failed to fetch overview metrics:', error);
      throw new Error('Failed to load overview metrics');
    }
  }

  /**
   * Get ticket-related metrics and charts
   */
  async getTicketMetrics(filters: ReportFilters): Promise<TicketMetrics> {
    try {
      const response = await apiClient.get('/reports/tickets/metrics', {
        params: filters,
      });
      return response.data as TicketMetrics;
    } catch (_error) {
      console.error('Failed to fetch ticket metrics:', error);
      throw new Error('Failed to load ticket metrics');
    }
  }

  /**
   * Get ticket trend data for charts
   */
  async getTicketTrends(filters: ReportFilters): Promise<TicketTrendData> {
    try {
      const response = await apiClient.get('/reports/tickets/trends', {
        params: filters,
      });
      return response.data as TicketTrendData;
    } catch (_error) {
      console.error('Failed to fetch ticket trends:', error);
      throw new Error('Failed to load ticket trends');
    }
  }

  /**
   * Get asset-related metrics
   */
  async getAssetMetrics(filters: ReportFilters): Promise<AssetMetrics> {
    try {
      const response = await apiClient.get('/reports/assets/metrics', {
        params: filters,
      });
      return response.data as AssetMetrics;
    } catch (_error) {
      console.error('Failed to fetch asset metrics:', error);
      throw new Error('Failed to load asset metrics');
    }
  }

  /**
   * Get asset report data for charts
   */
  async getAssetReportData(filters: ReportFilters): Promise<AssetReportData> {
    try {
      const response = await apiClient.get('/reports/assets/data', {
        params: filters,
      });
      return response.data as AssetReportData;
    } catch (_error) {
      console.error('Failed to fetch asset report data:', error);
      throw new Error('Failed to load asset report data');
    }
  }

  /**
   * Get user-related metrics
   */
  async getUserMetrics(filters: ReportFilters): Promise<UserMetrics> {
    try {
      const response = await apiClient.get('/reports/users/metrics', {
        params: filters,
      });
      return response.data as UserMetrics;
    } catch (_error) {
      console.error('Failed to fetch user metrics:', error);
      throw new Error('Failed to load user metrics');
    }
  }

  /**
   * Get user report data for charts
   */
  async getUserReportData(filters: ReportFilters): Promise<UserReportData> {
    try {
      const response = await apiClient.get('/reports/users/data', {
        params: filters,
      });
      return response.data as UserReportData;
    } catch (_error) {
      console.error('Failed to fetch user report data:', error);
      throw new Error('Failed to load user report data');
    }
  }

  /**
   * Get space-related metrics
   */
  async getSpaceMetrics(filters: ReportFilters): Promise<SpaceMetrics> {
    try {
      const response = await apiClient.get('/reports/spaces/metrics', {
        params: filters,
      });
      return response.data as SpaceMetrics;
    } catch (_error) {
      console.error('Failed to fetch space metrics:', error);
      throw new Error('Failed to load space metrics');
    }
  }

  /**
   * Get space report data for charts
   */
  async getSpaceReportData(filters: ReportFilters): Promise<SpaceReportData> {
    try {
      const response = await apiClient.get('/reports/spaces/data', {
        params: filters,
      });
      return response.data as SpaceReportData;
    } catch (_error) {
      console.error('Failed to fetch space report data:', error);
      throw new Error('Failed to load space report data');
    }
  }

  /**
   * Export report in specified format
   */
  async exportReport(
    reportType: 'overview' | 'tickets' | 'assets' | 'users' | 'spaces',
    format: 'pdf' | 'excel' | 'csv',
    filters: ReportFilters,
  ): Promise<Blob> {
    try {
      const response = await apiClient.post(
        `/reports/${reportType}/export`,
        {
          format,
          filters,
        },
        {
          responseType: 'blob',
        },
      );
      return response.data as Blob;
    } catch (_error) {
      console.error('Failed to export report:', error);
      throw new Error('Failed to export report');
    }
  }

  /**
   * Get available date ranges for reports
   */
  async getAvailableDateRanges(): Promise<{
    earliest: string;
    latest: string;
    suggested: Array<{ label: string; value: string; start: string; end: string }>;
  }> {
    try {
      const response = await apiClient.get('/reports/date-ranges');
      return response.data as {
        earliest: string;
        latest: string;
        suggested: Array<{ label: string; value: string; start: string; end: string }>;
      };
    } catch (_error) {
      console.error('Failed to fetch date ranges:', error);
      throw new Error('Failed to load date ranges');
    }
  }

  /**
   * Get custom report with specific metrics
   */
  async getCustomReport(
    metrics: string[],
    filters: ReportFilters,
    groupBy?: 'day' | 'week' | 'month' | 'quarter',
  ): Promise<{
    metrics: Record<string, MetricData>;
    charts: Record<string, ChartData>;
  }> {
    try {
      const response = await apiClient.post('/reports/custom', {
        metrics,
        filters,
        groupBy,
      });
      return response.data as {
        metrics: Record<string, MetricData>;
        charts: Record<string, ChartData>;
      };
    } catch (_error) {
      console.error('Failed to fetch custom report:', error);
      throw new Error('Failed to load custom report');
    }
  }

  /**
   * Get report schedule for automated reports
   */
  async getReportSchedules(): Promise<
    Array<{
      id: string;
      name: string;
      reportType: string;
      format: string;
      schedule: string;
      recipients: string[];
      isActive: boolean;
      lastRun?: string;
      nextRun: string;
    }>
  > {
    try {
      const response = await apiClient.get('/reports/schedules');
      return response.data as Array<{
        id: string;
        name: string;
        reportType: string;
        format: string;
        schedule: string;
        recipients: string[];
        isActive: boolean;
        lastRun?: string;
        nextRun: string;
      }>;
    } catch (_error) {
      console.error('Failed to fetch report schedules:', error);
      throw new Error('Failed to load report schedules');
    }
  }

  /**
   * Create or update a report schedule
   */
  async saveReportSchedule(schedule: {
    id?: string;
    name: string;
    reportType: string;
    format: string;
    schedule: string;
    recipients: string[];
    filters: ReportFilters;
  }): Promise<void> {
    try {
      if (schedule.id) {
        await apiClient.put(`/reports/schedules/${schedule.id}`, schedule);
      } else {
        await apiClient.post('/reports/schedules', schedule);
      }
    } catch (_error) {
      console.error('Failed to save report schedule:', error);
      throw new Error('Failed to save report schedule');
    }
  }

  /**
   * Delete a report schedule
   */
  async deleteReportSchedule(scheduleId: string): Promise<void> {
    try {
      await apiClient.delete(`/reports/schedules/${scheduleId}`);
    } catch (_error) {
      console.error('Failed to delete report schedule:', error);
      throw new Error('Failed to delete report schedule');
    }
  }
}

export const reportsService = new ReportsService();
