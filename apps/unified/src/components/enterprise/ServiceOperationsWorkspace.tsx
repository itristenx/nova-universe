/**
 * Service Operations Workspace (SOW) Dashboard Component
 * ServiceNow-equivalent unified ITSM interface with incident, service request,
 * change, and problem management capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';

// Local type definitions
interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

type ServiceRequestState =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

type IncidentState = 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';

type ProblemState =
  | 'NEW'
  | 'INVESTIGATION'
  | 'ROOT_CAUSE_ANALYSIS'
  | 'AWAITING_VENDOR'
  | 'RESOLVED'
  | 'CLOSED';

type ChangeState =
  | 'NEW'
  | 'ASSESSMENT'
  | 'AUTHORIZATION'
  | 'SCHEDULED'
  | 'IMPLEMENTATION'
  | 'REVIEW'
  | 'CLOSED'
  | 'CANCELLED';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type Urgency = 'HIGH' | 'MEDIUM' | 'LOW';
type Impact = 'HIGH' | 'MEDIUM' | 'LOW';
type ChangeType = 'STANDARD' | 'NORMAL' | 'EMERGENCY';
type ChangeRisk = 'HIGH' | 'MODERATE' | 'LOW';

interface User extends BaseRecord {
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
}

interface ServiceRequest extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: ServiceRequestState;
  priority: Priority;
  urgency: Urgency;
  impact: Impact;
  category?: string;
  subcategory?: string;
  requested_by_id: string;
  requested_by: User;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  sla_due_date?: string;
  response_time?: number;
  resolution_time?: number;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
}

interface Incident extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: IncidentState;
  priority: Priority;
  urgency: Urgency;
  impact: Impact;
  category?: string;
  subcategory?: string;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  caller_id: string;
  caller: User;
  sla_due_date?: string;
  response_time?: number;
  resolution_time?: number;
  resolution_code?: string;
  resolution_notes?: string;
  root_cause?: string;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
}

interface Problem extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: ProblemState;
  priority: Priority;
  impact: Impact;
  category?: string;
  subcategory?: string;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  root_cause?: string;
  workaround?: string;
  solution?: string;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
}

interface Change extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: ChangeState;
  priority: Priority;
  risk: ChangeRisk;
  impact: Impact;
  category?: string;
  type: ChangeType;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  requested_by_id: string;
  requested_by: User;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  implementation_plan?: string;
  backout_plan?: string;
  test_plan?: string;
  opened_at: string;
  closed_at?: string;
}

interface ServiceOperationsDashboard {
  incidents: ServiceStatistics;
  serviceRequests: ServiceStatistics;
  changes: ServiceStatistics;
  problems: ServiceStatistics;
  sla: SLAMetrics;
  timestamp: string;
}

interface ServiceStatistics {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
  closed: number;
  overdue: number;
  by_priority: Record<Priority, number>;
}

interface SLAMetrics {
  response_sla_met: number;
  resolution_sla_met: number;
  average_response_time: number;
  average_resolution_time: number;
}

interface ServiceOperationsWorkspaceProps {
  onCreateServiceRequest?: () => void;
  onCreateIncident?: () => void;
  onCreateChange?: () => void;
  onCreateProblem?: () => void;
}

// Styling constants
const STATE_COLORS = {
  // Service Request States
  NEW: '#2196f3',
  IN_PROGRESS: '#ff9800',
  AWAITING_APPROVAL: '#9c27b0',
  APPROVED: '#4caf50',
  REJECTED: '#f44336',
  RESOLVED: '#00bcd4',
  CLOSED: '#607d8b',
  CANCELLED: '#9e9e9e',

  // Incident States
  ON_HOLD: '#ff5722',

  // Problem States
  INVESTIGATION: '#ff9800',
  ROOT_CAUSE_ANALYSIS: '#9c27b0',
  AWAITING_VENDOR: '#795548',

  // Change States
  ASSESSMENT: '#ff9800',
  AUTHORIZATION: '#9c27b0',
  SCHEDULED: '#3f51b5',
  IMPLEMENTATION: '#ff5722',
  REVIEW: '#00bcd4',
};

const PRIORITY_COLORS = {
  CRITICAL: '#f44336',
  HIGH: '#ff9800',
  MEDIUM: '#2196f3',
  LOW: '#4caf50',
};

const RISK_COLORS = {
  HIGH: '#f44336',
  MODERATE: '#ff9800',
  LOW: '#4caf50',
};

// Component styles
const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  buttonSecondary: {
    backgroundColor: 'white',
    color: '#3b82f6',
    border: '1px solid #e2e8f0',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  metricTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
  },
  metricIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
  },
  metricSubtext: {
    fontSize: '14px',
    color: '#6b7280',
  },
  tabContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  tabHeader: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tab: {
    padding: '16px 24px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
    backgroundColor: 'white',
  },
  tabContent: {
    padding: '24px',
  },
  recordsGrid: {
    display: 'grid',
    gap: '16px',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  recordCardHover: {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderColor: '#cbd5e1',
  },
  recordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  recordNumber: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  recordTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
  },
  recordMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  metaLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  metaValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  priorityBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  slaIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  slaIcon: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '16px',
    color: '#6b7280',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fecaca',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#6b7280',
  },
  emptyStateIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyStateTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151',
  },
  emptyStateText: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
};

const ServiceOperationsWorkspace: React.FC<ServiceOperationsWorkspaceProps> = ({
  onCreateServiceRequest,
  onCreateIncident,
  onCreateChange,
  onCreateProblem,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<ServiceOperationsDashboard | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demonstration
      const mockServiceRequests: ServiceRequest[] = [
        {
          id: '1',
          number: 'SR0001001',
          short_description: 'Request for new laptop',
          description: 'Employee needs a new Dell laptop for remote work',
          state: 'IN_PROGRESS',
          priority: 'MEDIUM',
          urgency: 'MEDIUM',
          impact: 'LOW',
          category: 'Hardware',
          subcategory: 'Laptop',
          requested_by_id: '1',
          requested_by: {
            id: '1',
            email: 'john@company.com',
            first_name: 'John',
            last_name: 'Doe',
            created_at: '',
            updated_at: '',
          },
          assigned_to_id: '2',
          assigned_to: {
            id: '2',
            email: 'jane@company.com',
            first_name: 'Jane',
            last_name: 'Smith',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'Hardware Team',
          sla_due_date: '2024-01-15T10:00:00Z',
          opened_at: '2024-01-10T09:00:00Z',
          created_at: '2024-01-10T09:00:00Z',
          updated_at: '2024-01-10T09:00:00Z',
        },
      ];

      const mockIncidents: Incident[] = [
        {
          id: '1',
          number: 'INC0001001',
          short_description: 'Email server down',
          description: 'Users unable to access email services',
          state: 'IN_PROGRESS',
          priority: 'HIGH',
          urgency: 'HIGH',
          impact: 'HIGH',
          category: 'Infrastructure',
          subcategory: 'Email',
          assigned_to_id: '3',
          assigned_to: {
            id: '3',
            email: 'tech@company.com',
            first_name: 'Tech',
            last_name: 'Support',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'Infrastructure Team',
          caller_id: '1',
          caller: {
            id: '1',
            email: 'john@company.com',
            first_name: 'John',
            last_name: 'Doe',
            created_at: '',
            updated_at: '',
          },
          sla_due_date: '2024-01-11T10:00:00Z',
          opened_at: '2024-01-10T08:00:00Z',
          created_at: '2024-01-10T08:00:00Z',
          updated_at: '2024-01-10T08:00:00Z',
        },
      ];

      const mockChanges: Change[] = [
        {
          id: '1',
          number: 'CHG0001001',
          short_description: 'Server maintenance window',
          description: 'Scheduled maintenance for production servers',
          state: 'SCHEDULED',
          priority: 'MEDIUM',
          risk: 'MODERATE',
          impact: 'HIGH',
          category: 'Infrastructure',
          type: 'NORMAL',
          assigned_to_id: '3',
          assigned_to: {
            id: '3',
            email: 'tech@company.com',
            first_name: 'Tech',
            last_name: 'Support',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'Change Advisory Board',
          requested_by_id: '2',
          requested_by: {
            id: '2',
            email: 'jane@company.com',
            first_name: 'Jane',
            last_name: 'Smith',
            created_at: '',
            updated_at: '',
          },
          planned_start_date: '2024-01-15T02:00:00Z',
          planned_end_date: '2024-01-15T06:00:00Z',
          implementation_plan: 'Update server OS and security patches',
          backout_plan: 'Rollback to previous OS version if issues occur',
          opened_at: '2024-01-08T14:00:00Z',
          created_at: '2024-01-08T14:00:00Z',
          updated_at: '2024-01-08T14:00:00Z',
        },
      ];

      const mockProblems: Problem[] = [
        {
          id: '1',
          number: 'PRB0001001',
          short_description: 'Recurring network timeouts',
          description: 'Intermittent network connectivity issues affecting multiple users',
          state: 'INVESTIGATION',
          priority: 'HIGH',
          impact: 'HIGH',
          category: 'Network',
          subcategory: 'Connectivity',
          assigned_to_id: '3',
          assigned_to: {
            id: '3',
            email: 'tech@company.com',
            first_name: 'Tech',
            last_name: 'Support',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'Network Team',
          opened_at: '2024-01-09T11:00:00Z',
          created_at: '2024-01-09T11:00:00Z',
          updated_at: '2024-01-09T11:00:00Z',
        },
      ];

      const mockDashboard: ServiceOperationsDashboard = {
        incidents: {
          total: 25,
          new: 5,
          in_progress: 12,
          resolved: 6,
          closed: 2,
          overdue: 3,
          by_priority: { CRITICAL: 2, HIGH: 8, MEDIUM: 10, LOW: 5 },
        },
        serviceRequests: {
          total: 45,
          new: 8,
          in_progress: 22,
          resolved: 12,
          closed: 3,
          overdue: 5,
          by_priority: { CRITICAL: 1, HIGH: 6, MEDIUM: 25, LOW: 13 },
        },
        changes: {
          total: 15,
          new: 3,
          in_progress: 7,
          resolved: 4,
          closed: 1,
          overdue: 2,
          by_priority: { CRITICAL: 0, HIGH: 3, MEDIUM: 8, LOW: 4 },
        },
        problems: {
          total: 8,
          new: 2,
          in_progress: 4,
          resolved: 2,
          closed: 0,
          overdue: 1,
          by_priority: { CRITICAL: 1, HIGH: 3, MEDIUM: 3, LOW: 1 },
        },
        sla: {
          response_sla_met: 85,
          resolution_sla_met: 78,
          average_response_time: 2.5,
          average_resolution_time: 24.8,
        },
        timestamp: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setServiceRequests(mockServiceRequests);
      setIncidents(mockIncidents);
      setChanges(mockChanges);
      setProblems(mockProblems);
      setDashboardData(mockDashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service operations data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Get state color
  const getStateColor = (state: string): string => {
    return (STATE_COLORS as any)[state] || '#6b7280';
  };

  // Get priority color
  const getPriorityColor = (priority: Priority): string => {
    return PRIORITY_COLORS[priority];
  };

  // Get risk color
  const getRiskColor = (risk: ChangeRisk): string => {
    return RISK_COLORS[risk];
  };

  // Format time ago
  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Recently';
  };

  // Check SLA status
  const getSLAStatus = (
    dueDate?: string,
  ): { status: 'on-time' | 'warning' | 'breached'; color: string } => {
    if (!dueDate) return { status: 'on-time', color: '#10b981' };

    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) return { status: 'breached', color: '#ef4444' };
    if (diffHours < 4) return { status: 'warning', color: '#f59e0b' };
    return { status: 'on-time', color: '#10b981' };
  };

  // Render metrics cards
  const renderMetricsCards = () => {
    if (!dashboardData) return null;

    const metrics = [
      {
        title: 'Active Incidents',
        value: dashboardData.incidents.new + dashboardData.incidents.in_progress,
        total: dashboardData.incidents.total,
        icon: '🔥',
        color: '#ef4444',
        subtext: `${dashboardData.incidents.overdue} overdue`,
      },
      {
        title: 'Service Requests',
        value: dashboardData.serviceRequests.new + dashboardData.serviceRequests.in_progress,
        total: dashboardData.serviceRequests.total,
        icon: '🎫',
        color: '#3b82f6',
        subtext: `${dashboardData.serviceRequests.overdue} overdue`,
      },
      {
        title: 'Changes',
        value: dashboardData.changes.new + dashboardData.changes.in_progress,
        total: dashboardData.changes.total,
        icon: '🔄',
        color: '#8b5cf6',
        subtext: `${dashboardData.changes.overdue} overdue`,
      },
      {
        title: 'Problems',
        value: dashboardData.problems.new + dashboardData.problems.in_progress,
        total: dashboardData.problems.total,
        icon: '🔍',
        color: '#f59e0b',
        subtext: `${dashboardData.problems.overdue} overdue`,
      },
      {
        title: 'SLA Performance',
        value: `${dashboardData.sla.response_sla_met}%`,
        total: 100,
        icon: '📊',
        color: '#10b981',
        subtext: 'Response SLA met',
      },
    ];

    return (
      <div style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <div key={index} style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricTitle}>{metric.title}</span>
              <div
                style={{
                  ...styles.metricIcon,
                  backgroundColor: `${metric.color}20`,
                  color: metric.color,
                }}
              >
                {metric.icon}
              </div>
            </div>
            <div style={styles.metricValue}>{metric.value}</div>
            <div style={styles.metricSubtext}>{metric.subtext}</div>
          </div>
        ))}
      </div>
    );
  };

  // Render record cards
  const renderRecordCards = (
    records: any[],
    type: 'incident' | 'service-request' | 'change' | 'problem',
  ) => {
    if (records.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>
            {type === 'incident' && '🔥'}
            {type === 'service-request' && '🎫'}
            {type === 'change' && '🔄'}
            {type === 'problem' && '🔍'}
          </div>
          <div style={styles.emptyStateTitle}>No {type.replace('-', ' ')}s found</div>
          <div style={styles.emptyStateText}>
            Create your first {type.replace('-', ' ')} to get started.
          </div>
        </div>
      );
    }

    return (
      <div style={styles.recordsGrid}>
        {records.map((record) => {
          const slaStatus = getSLAStatus(record.sla_due_date);

          return (
            <div
              key={record.id}
              style={styles.recordCard}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.recordCardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={styles.recordHeader}>
                <div>
                  <div style={styles.recordNumber}>{record.number}</div>
                  <div style={styles.recordTitle}>{record.short_description}</div>
                </div>
                <div
                  style={{ ...styles.statusBadge, backgroundColor: getStateColor(record.state) }}
                >
                  {record.state.replace('_', ' ')}
                </div>
              </div>

              <div style={styles.recordMeta}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Priority</span>
                  <span
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: `${getPriorityColor(record.priority)}20`,
                      color: getPriorityColor(record.priority),
                    }}
                  >
                    {record.priority}
                  </span>
                </div>

                {record.assigned_to && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Assigned to</span>
                    <span style={styles.metaValue}>
                      {record.assigned_to.first_name} {record.assigned_to.last_name}
                    </span>
                  </div>
                )}

                {type === 'change' && record.risk && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Risk</span>
                    <span
                      style={{
                        ...styles.priorityBadge,
                        backgroundColor: `${getRiskColor(record.risk)}20`,
                        color: getRiskColor(record.risk),
                      }}
                    >
                      {record.risk}
                    </span>
                  </div>
                )}

                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Opened</span>
                  <span style={styles.metaValue}>{formatTimeAgo(record.opened_at)}</span>
                </div>

                {record.sla_due_date && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>SLA Status</span>
                    <div style={styles.slaIndicator}>
                      <div style={{ ...styles.slaIcon, backgroundColor: slaStatus.color }} />
                      <span style={{ ...styles.metaValue, color: slaStatus.color }}>
                        {slaStatus.status === 'breached'
                          ? 'Breached'
                          : slaStatus.status === 'warning'
                            ? 'At Risk'
                            : 'On Time'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div style={styles.loading}>Loading Service Operations Workspace...</div>;
  }

  const tabs = [
    { label: 'Overview', icon: '📊' },
    { label: 'Incidents', icon: '🔥' },
    { label: 'Service Requests', icon: '🎫' },
    { label: 'Changes', icon: '🔄' },
    { label: 'Problems', icon: '🔍' },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Service Operations Workspace</h1>
        <div style={styles.actionButtons}>
          <button style={styles.buttonPrimary} onClick={onCreateIncident}>
            🔥 Create Incident
          </button>
          <button style={styles.buttonPrimary} onClick={onCreateServiceRequest}>
            🎫 Create Service Request
          </button>
          <button style={styles.buttonSecondary} onClick={onCreateChange}>
            🔄 Create Change
          </button>
          <button style={styles.buttonSecondary} onClick={onCreateProblem}>
            🔍 Create Problem
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Metrics Cards */}
      {renderMetricsCards()}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabHeader}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              style={{
                ...styles.tab,
                ...(activeTab === index ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(index)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {activeTab === 0 && (
            <div>
              <h2>Service Operations Overview</h2>
              <p>
                Unified dashboard showing all ITSM activities and metrics across the organization.
              </p>
              <p>
                This view provides a comprehensive overview of service health, SLA performance, and
                operational metrics.
              </p>
            </div>
          )}

          {activeTab === 1 && renderRecordCards(incidents, 'incident')}
          {activeTab === 2 && renderRecordCards(serviceRequests, 'service-request')}
          {activeTab === 3 && renderRecordCards(changes, 'change')}
          {activeTab === 4 && renderRecordCards(problems, 'problem')}
        </div>
      </div>
    </div>
  );
};

export default ServiceOperationsWorkspace;
