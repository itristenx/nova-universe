/**
 * Workflow Automation Dashboard Component
 * ServiceNow-equivalent workflow automation with visual designer,
 * execution monitoring, and process orchestration
 */

import React, { useState, useEffect, useCallback } from 'react';

// Local type definitions
interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'TESTING' | 'FAILED' | 'ARCHIVED';

type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';

type TriggerType =
  | 'MANUAL'
  | 'SCHEDULED'
  | 'EVENT_DRIVEN'
  | 'API_CALL'
  | 'RECORD_CHANGE'
  | 'APPROVAL_RESPONSE';

type ActionType =
  | 'EMAIL_NOTIFICATION'
  | 'CREATE_RECORD'
  | 'UPDATE_RECORD'
  | 'DELETE_RECORD'
  | 'API_CALL'
  | 'APPROVAL_REQUEST'
  | 'SCRIPT_EXECUTION'
  | 'FILE_OPERATION'
  | 'INTEGRATION_CALL'
  | 'WAIT_CONDITION';

type ConditionOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'IN'
  | 'NOT_IN'
  | 'IS_EMPTY'
  | 'IS_NOT_EMPTY';

interface User extends BaseRecord {
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
}

interface WorkflowCondition extends BaseRecord {
  field: string;
  operator: ConditionOperator;
  value: string;
  workflow_step_id: string;
}

interface WorkflowAction extends BaseRecord {
  name: string;
  type: ActionType;
  configuration: Record<string, any>;
  timeout_seconds?: number;
  retry_count?: number;
  workflow_step_id: string;
  execution_order: number;
}

interface WorkflowStep extends BaseRecord {
  name: string;
  description?: string;
  step_type: 'ACTION' | 'CONDITION' | 'PARALLEL' | 'LOOP';
  workflow_id: string;
  parent_step_id?: string;
  execution_order: number;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  x_position?: number;
  y_position?: number;
}

interface Workflow extends BaseRecord {
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger_type: TriggerType;
  trigger_configuration?: Record<string, any>;
  version: string;
  is_template: boolean;
  category?: string;
  tags: string[];
  created_by_id: string;
  created_by: User;
  last_modified_by_id?: string;
  last_modified_by?: User;
  last_executed?: string;
  execution_count: number;
  success_rate: number;
  average_duration: number;
  steps: WorkflowStep[];
}

interface WorkflowExecution extends BaseRecord {
  workflow_id: string;
  workflow: Workflow;
  execution_id: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  triggered_by_id?: string;
  triggered_by?: User;
  trigger_data?: Record<string, any>;
  current_step_id?: string;
  current_step?: WorkflowStep;
  steps_completed: number;
  total_steps: number;
  error_message?: string;
  execution_log: Array<{
    timestamp: string;
    step_name: string;
    action: string;
    status: ExecutionStatus;
    message?: string;
    duration_ms: number;
  }>;
}

interface WorkflowAnalytics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  executionsToday: number;
  averageSuccessRate: number;
  averageExecutionTime: number;
  executionsByStatus: Record<ExecutionStatus, number>;
  workflowsByTrigger: Record<TriggerType, number>;
  popularWorkflows: Array<{
    workflow: Workflow;
    execution_count: number;
    success_rate: number;
  }>;
  recentFailures: WorkflowExecution[];
  performanceMetrics: {
    throughput: number;
    latency: number;
    errorRate: number;
    availability: number;
  };
}

interface WorkflowAutomationProps {
  onCreateWorkflow?: () => void;
  onEditWorkflow?: (workflowId: string) => void;
  onExecuteWorkflow?: (workflowId: string) => void;
  onViewExecution?: (executionId: string) => void;
}

// Styling constants
const STATUS_COLORS = {
  DRAFT: '#6b7280',
  ACTIVE: '#10b981',
  INACTIVE: '#64748b',
  TESTING: '#f59e0b',
  FAILED: '#ef4444',
  ARCHIVED: '#6b7280',
};

const EXECUTION_COLORS = {
  PENDING: '#3b82f6',
  RUNNING: '#f59e0b',
  COMPLETED: '#10b981',
  FAILED: '#ef4444',
  CANCELLED: '#6b7280',
  TIMEOUT: '#dc2626',
};

const TRIGGER_ICONS = {
  MANUAL: '👤',
  SCHEDULED: '⏰',
  EVENT_DRIVEN: '⚡',
  API_CALL: '🔗',
  RECORD_CHANGE: '📝',
  APPROVAL_RESPONSE: '✅',
};

const ACTION_ICONS = {
  EMAIL_NOTIFICATION: '📧',
  CREATE_RECORD: '➕',
  UPDATE_RECORD: '✏️',
  DELETE_RECORD: '🗑️',
  API_CALL: '🔗',
  APPROVAL_REQUEST: '🔐',
  SCRIPT_EXECUTION: '⚙️',
  FILE_OPERATION: '📁',
  INTEGRATION_CALL: '🔌',
  WAIT_CONDITION: '⏸️',
};

// Component styles
const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '24px',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  titleIcon: {
    fontSize: '32px',
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
    backgroundColor: '#374151',
    color: '#f3f4f6',
    border: '1px solid #4b5563',
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
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  metricCardSuccess: {
    borderColor: '#10b981',
    boxShadow: '0 1px 3px rgba(16, 185, 129, 0.2)',
  },
  metricCardWarning: {
    borderColor: '#f59e0b',
    boxShadow: '0 1px 3px rgba(245, 158, 11, 0.2)',
  },
  metricCardDanger: {
    borderColor: '#dc2626',
    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.2)',
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
    color: '#1e293b',
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
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
    color: '#64748b',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#1e293b',
    borderBottomColor: '#3b82f6',
    backgroundColor: 'white',
  },
  tabContent: {
    padding: '24px',
  },
  workflowGrid: {
    display: 'grid',
    gap: '16px',
  },
  workflowCard: {
    backgroundColor: '#fafbfc',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  workflowCardHover: {
    borderColor: '#3b82f6',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
  },
  workflowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  workflowName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
  },
  workflowDescription: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
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
  workflowMeta: {
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
  executionCard: {
    backgroundColor: '#fafbfc',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
    cursor: 'pointer',
  },
  executionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  executionId: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
  },
  executionWorkflow: {
    fontSize: '12px',
    color: '#6b7280',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '12px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  visualDesigner: {
    width: '100%',
    height: '500px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '2px dashed #d1d5db',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  designerPlaceholder: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#6b7280',
  },
  workflowNode: {
    position: 'absolute' as const,
    width: '160px',
    minHeight: '80px',
    backgroundColor: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  nodeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  nodeIcon: {
    fontSize: '16px',
  },
  nodeName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  nodeDescription: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.4',
  },
  connectionLine: {
    position: 'absolute' as const,
    backgroundColor: '#9ca3af',
    transformOrigin: 'left center',
  },
  executionLogCard: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  },
  logEntry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #374151',
    fontSize: '12px',
  },
  logTimestamp: {
    color: '#9ca3af',
    minWidth: '80px',
  },
  logLevel: {
    minWidth: '60px',
    fontWeight: '600',
  },
  logMessage: {
    color: '#f3f4f6',
    flex: 1,
  },
  performanceChart: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  chartCard: {
    backgroundColor: '#fafbfc',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
  },
  chartValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  chartSubtext: {
    fontSize: '14px',
    color: '#6b7280',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '16px',
    color: '#64748b',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fecaca',
  },
};

const WorkflowAutomationDashboard: React.FC<WorkflowAutomationProps> = ({
  onCreateWorkflow,
  onEditWorkflow,
  onExecuteWorkflow,
  onViewExecution,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<WorkflowAnalytics | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demonstration
      const mockWorkflows: Workflow[] = [
        {
          id: '1',
          name: 'Employee Onboarding Automation',
          description:
            'Automates the complete employee onboarding process including account creation, equipment provisioning, and access requests',
          status: 'ACTIVE',
          trigger_type: 'RECORD_CHANGE',
          trigger_configuration: { table: 'hr_employees', condition: 'state=hired' },
          version: '2.1.0',
          is_template: false,
          category: 'HR',
          tags: ['onboarding', 'hr', 'automation'],
          created_by_id: '1',
          created_by: {
            id: '1',
            email: 'admin@company.com',
            first_name: 'System',
            last_name: 'Admin',
            created_at: '',
            updated_at: '',
          },
          last_executed: '2024-01-10T14:30:00Z',
          execution_count: 127,
          success_rate: 94.5,
          average_duration: 185,
          steps: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-10T14:30:00Z',
        },
        {
          id: '2',
          name: 'Incident Response Automation',
          description:
            'Automatically escalates critical incidents, creates war rooms, and notifies stakeholders',
          status: 'ACTIVE',
          trigger_type: 'EVENT_DRIVEN',
          trigger_configuration: { event: 'incident.created', severity: 'critical' },
          version: '1.8.3',
          is_template: false,
          category: 'IT Operations',
          tags: ['incident', 'escalation', 'notification'],
          created_by_id: '2',
          created_by: {
            id: '2',
            email: 'ops@company.com',
            first_name: 'Operations',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          last_executed: '2024-01-10T16:45:00Z',
          execution_count: 89,
          success_rate: 97.8,
          average_duration: 45,
          steps: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-10T16:45:00Z',
        },
        {
          id: '3',
          name: 'Security Vulnerability Remediation',
          description:
            'Automatically creates tickets, assigns to security team, and tracks remediation progress',
          status: 'TESTING',
          trigger_type: 'API_CALL',
          trigger_configuration: { endpoint: '/api/vulnerabilities', method: 'POST' },
          version: '1.0.0',
          is_template: false,
          category: 'Security',
          tags: ['security', 'vulnerability', 'remediation'],
          created_by_id: '3',
          created_by: {
            id: '3',
            email: 'security@company.com',
            first_name: 'Security',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          last_executed: '2024-01-10T12:00:00Z',
          execution_count: 23,
          success_rate: 87.0,
          average_duration: 120,
          steps: [],
          created_at: '2024-01-05T00:00:00Z',
          updated_at: '2024-01-10T12:00:00Z',
        },
      ];

      const mockExecutions: WorkflowExecution[] = [
        {
          id: '1',
          workflow_id: '1',
          workflow: mockWorkflows[0],
          execution_id: 'WFE-2024-001',
          status: 'RUNNING',
          started_at: '2024-01-10T16:30:00Z',
          triggered_by_id: '1',
          triggered_by: {
            id: '1',
            email: 'hr@company.com',
            first_name: 'HR',
            last_name: 'System',
            created_at: '',
            updated_at: '',
          },
          current_step_id: '3',
          steps_completed: 3,
          total_steps: 8,
          execution_log: [
            {
              timestamp: '2024-01-10T16:30:00Z',
              step_name: 'Create AD Account',
              action: 'CREATE_RECORD',
              status: 'COMPLETED',
              message: 'Active Directory account created successfully',
              duration_ms: 2340,
            },
            {
              timestamp: '2024-01-10T16:30:30Z',
              step_name: 'Send Welcome Email',
              action: 'EMAIL_NOTIFICATION',
              status: 'COMPLETED',
              message: 'Welcome email sent to new employee',
              duration_ms: 1250,
            },
            {
              timestamp: '2024-01-10T16:31:00Z',
              step_name: 'Provision Equipment',
              action: 'CREATE_RECORD',
              status: 'RUNNING',
              message: 'Equipment request submitted to facilities',
              duration_ms: 0,
            },
          ],
          created_at: '2024-01-10T16:30:00Z',
          updated_at: '2024-01-10T16:31:00Z',
        },
        {
          id: '2',
          workflow_id: '2',
          workflow: mockWorkflows[1],
          execution_id: 'WFE-2024-002',
          status: 'COMPLETED',
          started_at: '2024-01-10T15:45:00Z',
          completed_at: '2024-01-10T15:46:30Z',
          duration_seconds: 90,
          triggered_by_id: '2',
          triggered_by: {
            id: '2',
            email: 'monitoring@company.com',
            first_name: 'Monitoring',
            last_name: 'System',
            created_at: '',
            updated_at: '',
          },
          steps_completed: 4,
          total_steps: 4,
          execution_log: [
            {
              timestamp: '2024-01-10T15:45:00Z',
              step_name: 'Escalate Incident',
              action: 'UPDATE_RECORD',
              status: 'COMPLETED',
              message: 'Incident escalated to P1',
              duration_ms: 890,
            },
            {
              timestamp: '2024-01-10T15:45:15Z',
              step_name: 'Create War Room',
              action: 'INTEGRATION_CALL',
              status: 'COMPLETED',
              message: 'Slack war room created',
              duration_ms: 2100,
            },
            {
              timestamp: '2024-01-10T15:45:45Z',
              step_name: 'Notify Stakeholders',
              action: 'EMAIL_NOTIFICATION',
              status: 'COMPLETED',
              message: 'Stakeholders notified via email and SMS',
              duration_ms: 1800,
            },
            {
              timestamp: '2024-01-10T15:46:30Z',
              step_name: 'Update Dashboard',
              action: 'API_CALL',
              status: 'COMPLETED',
              message: 'Operations dashboard updated',
              duration_ms: 560,
            },
          ],
          created_at: '2024-01-10T15:45:00Z',
          updated_at: '2024-01-10T15:46:30Z',
        },
      ];

      const mockAnalytics: WorkflowAnalytics = {
        totalWorkflows: 27,
        activeWorkflows: 19,
        totalExecutions: 1842,
        executionsToday: 47,
        averageSuccessRate: 93.2,
        averageExecutionTime: 142.5,
        executionsByStatus: {
          PENDING: 3,
          RUNNING: 5,
          COMPLETED: 1675,
          FAILED: 89,
          CANCELLED: 45,
          TIMEOUT: 25,
        },
        workflowsByTrigger: {
          MANUAL: 8,
          SCHEDULED: 6,
          EVENT_DRIVEN: 7,
          API_CALL: 4,
          RECORD_CHANGE: 2,
          APPROVAL_RESPONSE: 0,
        },
        popularWorkflows: [
          { workflow: mockWorkflows[0], execution_count: 127, success_rate: 94.5 },
          { workflow: mockWorkflows[1], execution_count: 89, success_rate: 97.8 },
          { workflow: mockWorkflows[2], execution_count: 23, success_rate: 87.0 },
        ],
        recentFailures: [],
        performanceMetrics: {
          throughput: 23.4,
          latency: 142.5,
          errorRate: 6.8,
          availability: 99.7,
        },
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setWorkflows(mockWorkflows);
      setExecutions(mockExecutions);
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow automation data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Get status color
  const getStatusColor = (status: WorkflowStatus | ExecutionStatus): string => {
    return (STATUS_COLORS as any)[status] || (EXECUTION_COLORS as any)[status] || '#6b7280';
  };

  // Get trigger icon
  const getTriggerIcon = (triggerType: TriggerType): string => {
    return TRIGGER_ICONS[triggerType] || '⚙️';
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

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Render metrics cards
  const renderMetricsCards = () => {
    if (!analytics) return null;

    const metrics = [
      {
        title: 'Active Workflows',
        value: analytics.activeWorkflows,
        icon: '⚡',
        color: '#10b981',
        subtext: `${analytics.totalWorkflows} total workflows`,
        type: 'success',
      },
      {
        title: 'Executions Today',
        value: analytics.executionsToday,
        icon: '🔄',
        color: '#3b82f6',
        subtext: `${analytics.totalExecutions.toLocaleString()} total executions`,
        type: 'info',
      },
      {
        title: 'Success Rate',
        value: `${analytics.averageSuccessRate}%`,
        icon: '✅',
        color: '#10b981',
        subtext: `${analytics.executionsByStatus.FAILED} failed executions`,
        type: 'success',
      },
      {
        title: 'Avg Execution Time',
        value: `${Math.round(analytics.averageExecutionTime)}s`,
        icon: '⏱️',
        color: '#8b5cf6',
        subtext: 'Performance optimization available',
        type: 'info',
      },
      {
        title: 'System Availability',
        value: `${analytics.performanceMetrics.availability}%`,
        icon: '🎯',
        color: '#059669',
        subtext: 'SLA: 99.5% uptime',
        type: 'success',
      },
    ];

    return (
      <div style={styles.metricsGrid}>
        {metrics.map((metric, index) => {
          let cardStyle = { ...styles.metricCard };
          if (metric.type === 'success') cardStyle = { ...cardStyle, ...styles.metricCardSuccess };
          if (metric.type === 'warning') cardStyle = { ...cardStyle, ...styles.metricCardWarning };
          if (metric.type === 'danger') cardStyle = { ...cardStyle, ...styles.metricCardDanger };

          return (
            <div key={index} style={cardStyle}>
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
          );
        })}
      </div>
    );
  };

  // Render workflows
  const renderWorkflows = () => {
    return (
      <div style={styles.workflowGrid}>
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            style={styles.workflowCard}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.workflowCardHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '';
            }}
            onClick={() => {
              setSelectedWorkflow(workflow);
              onEditWorkflow?.(workflow.id);
            }}
          >
            <div style={styles.workflowHeader}>
              <div>
                <div style={styles.workflowName}>
                  {getTriggerIcon(workflow.trigger_type)} {workflow.name}
                </div>
                <div style={styles.workflowDescription}>{workflow.description}</div>
              </div>
              <div
                style={{ ...styles.statusBadge, backgroundColor: getStatusColor(workflow.status) }}
              >
                {workflow.status}
              </div>
            </div>

            <div style={styles.workflowMeta}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Trigger</span>
                <span style={styles.metaValue}>{workflow.trigger_type.replace('_', ' ')}</span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Executions</span>
                <span style={styles.metaValue}>{workflow.execution_count}</span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Success Rate</span>
                <span style={styles.metaValue}>{workflow.success_rate}%</span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Last Executed</span>
                <span style={styles.metaValue}>
                  {formatTimeAgo(workflow.last_executed || workflow.created_at)}
                </span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Avg Duration</span>
                <span style={styles.metaValue}>{formatDuration(workflow.average_duration)}</span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Version</span>
                <span style={styles.metaValue}>{workflow.version}</span>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={styles.metaLabel}>Tags</div>
              <div style={{ marginTop: '4px' }}>
                {workflow.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      marginRight: '4px',
                      marginBottom: '2px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render executions
  const renderExecutions = () => {
    return (
      <div>
        {executions.map((execution) => {
          const progress = (execution.steps_completed / execution.total_steps) * 100;
          const progressColor =
            execution.status === 'COMPLETED'
              ? '#10b981'
              : execution.status === 'FAILED'
                ? '#ef4444'
                : execution.status === 'RUNNING'
                  ? '#3b82f6'
                  : '#6b7280';

          return (
            <div
              key={execution.id}
              style={styles.executionCard}
              onClick={() => onViewExecution?.(execution.id)}
            >
              <div style={styles.executionHeader}>
                <div>
                  <div style={styles.executionId}>{execution.execution_id}</div>
                  <div style={styles.executionWorkflow}>{execution.workflow.name}</div>
                </div>
                <div
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(execution.status),
                  }}
                >
                  {execution.status}
                </div>
              </div>

              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
              >
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Step {execution.steps_completed} of {execution.total_steps}
                </span>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  {Math.round(progress)}% Complete
                </span>
              </div>

              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${progress}%`,
                    backgroundColor: progressColor,
                  }}
                />
              </div>

              <div style={styles.workflowMeta}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Started</span>
                  <span style={styles.metaValue}>{formatTimeAgo(execution.started_at)}</span>
                </div>

                {execution.duration_seconds && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Duration</span>
                    <span style={styles.metaValue}>
                      {formatDuration(execution.duration_seconds)}
                    </span>
                  </div>
                )}

                {execution.triggered_by && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Triggered By</span>
                    <span style={styles.metaValue}>
                      {execution.triggered_by.first_name} {execution.triggered_by.last_name}
                    </span>
                  </div>
                )}

                {execution.current_step && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Current Step</span>
                    <span style={styles.metaValue}>{execution.current_step.name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render visual designer
  const renderVisualDesigner = () => {
    if (!selectedWorkflow) {
      return (
        <div style={styles.visualDesigner}>
          <div style={styles.designerPlaceholder}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Visual Workflow Designer
            </div>
            <div style={{ fontSize: '14px' }}>
              Select a workflow to view and edit its visual flow
            </div>
          </div>
        </div>
      );
    }

    // Mock workflow nodes for demonstration
    const mockNodes = [
      { id: '1', name: 'Start', type: 'start', x: 50, y: 200, icon: '🟢' },
      { id: '2', name: 'Create Record', type: 'action', x: 200, y: 150, icon: '📝' },
      { id: '3', name: 'Send Email', type: 'action', x: 200, y: 250, icon: '📧' },
      { id: '4', name: 'Approval?', type: 'condition', x: 400, y: 200, icon: '❓' },
      { id: '5', name: 'Complete', type: 'end', x: 600, y: 200, icon: '🔴' },
    ];

    const connections = [
      { from: '1', to: '2' },
      { from: '1', to: '3' },
      { from: '2', to: '4' },
      { from: '3', to: '4' },
      { from: '4', to: '5' },
    ];

    return (
      <div style={styles.visualDesigner}>
        {mockNodes.map((node) => (
          <div
            key={node.id}
            style={{
              ...styles.workflowNode,
              left: node.x,
              top: node.y,
            }}
          >
            <div style={styles.nodeHeader}>
              <span style={styles.nodeIcon}>{node.icon}</span>
              <span style={styles.nodeName}>{node.name}</span>
            </div>
            <div style={styles.nodeDescription}>
              {node.type === 'start' && 'Workflow entry point'}
              {node.type === 'action' && 'Automated action'}
              {node.type === 'condition' && 'Decision point'}
              {node.type === 'end' && 'Workflow completion'}
            </div>
          </div>
        ))}

        {connections.map((conn, index) => {
          const fromNode = mockNodes.find((n) => n.id === conn.from);
          const toNode = mockNodes.find((n) => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.x + 160;
          const y1 = fromNode.y + 40;
          const x2 = toNode.x;
          const y2 = toNode.y + 40;

          const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

          return (
            <div
              key={index}
              style={{
                ...styles.connectionLine,
                left: x1,
                top: y1 - 1,
                width: length,
                height: '2px',
                transform: `rotate(${angle}deg)`,
              }}
            />
          );
        })}
      </div>
    );
  };

  // Render performance analytics
  const renderPerformanceAnalytics = () => {
    if (!analytics) return null;

    return (
      <div style={styles.performanceChart}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Throughput</div>
          <div style={styles.chartValue}>{analytics.performanceMetrics.throughput}</div>
          <div style={styles.chartSubtext}>executions/hour</div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Average Latency</div>
          <div style={styles.chartValue}>{Math.round(analytics.performanceMetrics.latency)}ms</div>
          <div style={styles.chartSubtext}>response time</div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Error Rate</div>
          <div style={styles.chartValue}>{analytics.performanceMetrics.errorRate}%</div>
          <div style={styles.chartSubtext}>failed executions</div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>System Availability</div>
          <div style={styles.chartValue}>{analytics.performanceMetrics.availability}%</div>
          <div style={styles.chartSubtext}>uptime SLA</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={styles.loading}>Loading Workflow Automation Dashboard...</div>;
  }

  const tabs = [
    { label: 'Overview', icon: '📊' },
    { label: 'Workflows', icon: '⚡' },
    { label: 'Executions', icon: '🔄' },
    { label: 'Designer', icon: '🎨' },
    { label: 'Analytics', icon: '📈' },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>⚡</span>
          Workflow Automation
        </h1>
        <div style={styles.actionButtons}>
          <button style={styles.buttonPrimary} onClick={onCreateWorkflow}>
            ➕ Create Workflow
          </button>
          <button style={styles.buttonSecondary}>📋 View Templates</button>
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
              <h2 style={{ color: '#1e293b' }}>Workflow Automation Overview</h2>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Orchestrate and automate business processes with visual workflow designer, real-time
                monitoring, and comprehensive analytics. Build, deploy, and manage workflows that
                integrate with your entire enterprise ecosystem.
              </p>
              {renderPerformanceAnalytics()}
            </div>
          )}

          {activeTab === 1 && renderWorkflows()}
          {activeTab === 2 && renderExecutions()}
          {activeTab === 3 && (
            <div>
              <h2 style={{ color: '#1e293b' }}>Visual Workflow Designer</h2>
              {renderVisualDesigner()}
            </div>
          )}
          {activeTab === 4 && (
            <div>
              <h2 style={{ color: '#1e293b' }}>Performance Analytics</h2>
              {renderPerformanceAnalytics()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowAutomationDashboard;
