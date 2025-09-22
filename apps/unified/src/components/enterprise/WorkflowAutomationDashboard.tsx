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
  // New styles for execution log display
  executionLogSection: {
    marginTop: '16px',
  },
  executionLogTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '8px',
  },
  executionLogContainer: {
    maxHeight: '120px',
    overflowY: 'auto' as const,
  },
  executionLogEntry: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px',
    margin: '2px 0',
    borderRadius: '4px',
  },
  executionLogIcon: {
    fontSize: '16px',
  },
  executionLogContent: {
    flex: 1,
    minWidth: 0,
  },
  executionLogStepName: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  executionLogAction: {
    fontSize: '11px',
    color: '#6b7280',
  },
  executionLogStatus: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
  },
  executionLogMore: {
    fontSize: '11px',
    color: '#6b7280',
    textAlign: 'center' as const,
    marginTop: '4px',
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

      // Fetch real data from API endpoints
      try {
        const [workflowsResponse, executionsResponse, analyticsResponse] = await Promise.all([
          apiClient.get('/api/v1/workflows'),
          apiClient.get('/api/v1/workflow-executions'),
          apiClient.get('/api/v1/workflow-analytics'),
        ]);

        if (workflowsResponse.success) {
          setWorkflows(workflowsResponse.data || []);
        }

        if (executionsResponse.success) {
          setExecutions(executionsResponse.data || []);
        }

        if (analyticsResponse.success) {
          setAnalytics(analyticsResponse.data || {
            totalWorkflows: 0,
            activeWorkflows: 0,
            totalExecutions: 0,
            executionsToday: 0,
            averageSuccessRate: 0,
            averageExecutionTime: 0,
            executionsByStatus: {},
            workflowsByTrigger: {},
            popularWorkflows: [],
            recentFailures: [],
            performanceMetrics: {
              throughput: 0,
              latency: 0,
              errorRate: 0,
              availability: 0,
            },
          });
        }
      } catch (apiError) {
        console.warn('API endpoints not available, using empty data:', apiError);
        // Set empty data instead of mock data for production
        setWorkflows([]);
        setExecutions([]);
        setAnalytics({
          totalWorkflows: 0,
          activeWorkflows: 0,
          totalExecutions: 0,
          executionsToday: 0,
          averageSuccessRate: 0,
          averageExecutionTime: 0,
          executionsByStatus: {},
          workflowsByTrigger: {},
          popularWorkflows: [],
          recentFailures: [],
          performanceMetrics: {
            throughput: 0,
            latency: 0,
            errorRate: 0,
            availability: 0,
          },
        });
      }
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

            {/* Action buttons */}
            <div style={styles.actionButtons}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExecuteWorkflow?.(workflow.id);
                }}
                style={styles.buttonPrimary}
                disabled={workflow.status !== 'ACTIVE'}
                title={workflow.status !== 'ACTIVE' ? 'Workflow must be active to execute' : 'Execute workflow'}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Execute
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditWorkflow?.(workflow.id);
                }}
                style={styles.buttonSecondary}
                title="Edit workflow"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
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

              {/* Enhanced execution log display using ACTION_ICONS */}
              {execution.execution_log && execution.execution_log.length > 0 && (
                <div style={styles.executionLogSection}>
                  <div style={styles.executionLogTitle}>
                    Recent Actions
                  </div>
                  <div style={styles.executionLogContainer}>
                    {execution.execution_log.slice(-3).map((logEntry, index) => (
                      <div
                        key={index}
                        style={{
                          ...styles.executionLogEntry,
                          backgroundColor: logEntry.status === 'COMPLETED' ? '#f0fdf4' : logEntry.status === 'FAILED' ? '#fef2f2' : '#f8fafc',
                          borderLeft: `3px solid ${logEntry.status === 'COMPLETED' ? '#10b981' : logEntry.status === 'FAILED' ? '#ef4444' : '#6b7280'}`,
                        }}
                      >
                        <span style={styles.executionLogIcon}>
                          {ACTION_ICONS[logEntry.action as keyof typeof ACTION_ICONS] || '⚙️'}
                        </span>
                        <div style={styles.executionLogContent}>
                          <div style={styles.executionLogStepName}>
                            {logEntry.step_name}
                          </div>
                          <div style={styles.executionLogAction}>
                            {logEntry.action.replace(/_/g, ' ')} • {logEntry.duration_ms}ms
                          </div>
                        </div>
                        <div style={{
                          ...styles.executionLogStatus,
                          backgroundColor: logEntry.status === 'COMPLETED' ? '#10b981' : logEntry.status === 'FAILED' ? '#ef4444' : '#6b7280',
                        }}>
                          {logEntry.status}
                        </div>
                      </div>
                    ))}
                  </div>
                  {execution.execution_log.length > 3 && (
                    <div style={styles.executionLogMore}>
                      +{execution.execution_log.length - 3} more steps
                    </div>
                  )}
                </div>
              )}

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

    // Use workflow data from API
    const workflowNodes = selectedWorkflow?.nodes || [];
    const connections = selectedWorkflow?.connections || [];

    return (
      <div style={styles.visualDesigner}>
        {workflowNodes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            {selectedWorkflow ? 'No workflow nodes available' : 'Select a workflow to view its design'}
          </div>
        ) : (
          workflowNodes.map((node: any) => (
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
        )))}

        {connections.map((conn: any, index: number) => {
          const fromNode = workflowNodes.find((n: any) => n.id === conn.from);
          const toNode = workflowNodes.find((n: any) => n.id === conn.to);
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
