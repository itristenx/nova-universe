/**
 * Security Operations Center (SOC) Dashboard Component
 * ServiceNow-equivalent Security Operations with SOAR capabilities,
 * vulnerability management, threat intelligence, and incident response
 */

import React, { useState, useEffect, useCallback } from 'react';

// Local type definitions
interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

type SecurityIncidentState =
  | 'NEW'
  | 'INVESTIGATION'
  | 'CONTAINMENT'
  | 'ERADICATION'
  | 'RECOVERY'
  | 'LESSONS_LEARNED'
  | 'CLOSED';

type SecuritySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

type SecurityCategory =
  | 'MALWARE'
  | 'PHISHING'
  | 'DATA_BREACH'
  | 'UNAUTHORIZED_ACCESS'
  | 'DDoS'
  | 'INSIDER_THREAT'
  | 'APT'
  | 'VULNERABILITY_EXPLOITATION'
  | 'OTHER';

type VulnerabilityState =
  | 'NEW'
  | 'ASSESSMENT'
  | 'REMEDIATION'
  | 'TESTING'
  | 'CLOSED'
  | 'ACCEPTED_RISK';

type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface User extends BaseRecord {
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
}

interface SecurityIncident extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: SecurityIncidentState;
  severity: SecuritySeverity;
  category: SecurityCategory;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  source?: string;
  attack_vector?: string;
  threat_actor?: string;
  affected_users: string[];
  affected_systems: string[];
  mitre_tactics: string[];
  mitre_techniques: string[];
  containment_actions?: string;
  eradication_actions?: string;
  recovery_actions?: string;
  lessons_learned?: string;
  detected_at?: string;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
}

interface Vulnerability extends BaseRecord {
  number: string;
  cve_id?: string;
  title: string;
  description?: string;
  severity: VulnerabilitySeverity;
  cvss_score?: number;
  state: VulnerabilityState;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  affected_software?: string;
  affected_version?: string;
  exploit_available: boolean;
  patch_available: boolean;
  patch_details?: string;
  remediation_plan?: string;
  workaround?: string;
  due_date?: string;
  discovered_at?: string;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
}

interface PlaybookExecution extends BaseRecord {
  playbook_name: string;
  security_incident_id: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  executed_by_id: string;
  executed_by: User;
  steps_completed: number;
  total_steps: number;
  success_rate: number;
}

interface SecurityOperationsDashboard {
  securityIncidents: SecurityStatistics;
  vulnerabilities: VulnerabilityStatistics;
  threatIntelligence: ThreatIntelligence;
  playbooks: PlaybookMetrics;
  securityMetrics: SecurityMetrics;
  timestamp: string;
}

interface SecurityStatistics {
  total: number;
  new: number;
  investigation: number;
  containment: number;
  closed: number;
  by_severity: Record<SecuritySeverity, number>;
  by_category: Record<SecurityCategory, number>;
}

interface VulnerabilityStatistics {
  total: number;
  new: number;
  assessment: number;
  remediation: number;
  closed: number;
  by_severity: Record<VulnerabilitySeverity, number>;
  critical_overdue: number;
}

interface ThreatIntelligence {
  active_threats: number;
  blocked_ips: number;
  quarantined_files: number;
  recent_attacks: Array<{
    type: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

interface PlaybookMetrics {
  total_playbooks: number;
  executions_today: number;
  success_rate: number;
  average_execution_time: number;
}

interface SecurityMetrics {
  mean_time_to_detection: number;
  mean_time_to_response: number;
  mean_time_to_recovery: number;
  security_incidents_prevented: number;
}

interface SecurityOperationsCenterProps {
  onCreateSecurityIncident?: () => void;
  onCreateVulnerability?: () => void;
  onExecutePlaybook?: (playbookId: string) => void;
}

// Styling constants
const SEVERITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#d97706',
  LOW: '#65a30d',
  INFORMATIONAL: '#0891b2',
};

const STATE_COLORS = {
  NEW: '#3b82f6',
  INVESTIGATION: '#f59e0b',
  CONTAINMENT: '#ef4444',
  ERADICATION: '#8b5cf6',
  RECOVERY: '#06b6d4',
  LESSONS_LEARNED: '#10b981',
  CLOSED: '#6b7280',
  ASSESSMENT: '#f59e0b',
  REMEDIATION: '#8b5cf6',
  TESTING: '#06b6d4',
  ACCEPTED_RISK: '#6b7280',
};

const CATEGORY_ICONS = {
  MALWARE: '🦠',
  PHISHING: '🎣',
  DATA_BREACH: '💾',
  UNAUTHORIZED_ACCESS: '🔓',
  DDoS: '🌊',
  INSIDER_THREAT: '👤',
  APT: '🎯',
  VULNERABILITY_EXPLOITATION: '🔧',
  OTHER: '🔒',
};

// Component styles
const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '24px',
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f1f5f9',
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
    backgroundColor: '#dc2626',
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
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #334155',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  metricCardDanger: {
    borderColor: '#dc2626',
    boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
  },
  metricCardWarning: {
    borderColor: '#f59e0b',
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
  },
  metricCardSuccess: {
    borderColor: '#10b981',
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
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
    color: '#cbd5e1',
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
    color: '#f1f5f9',
    marginBottom: '8px',
  },
  metricSubtext: {
    fontSize: '14px',
    color: '#64748b',
  },
  tabContainer: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #334155',
    overflow: 'hidden',
  },
  tabHeader: {
    display: 'flex',
    borderBottom: '1px solid #334155',
    backgroundColor: '#0f172a',
  },
  tab: {
    padding: '16px 24px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#94a3b8',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#f1f5f9',
    borderBottomColor: '#dc2626',
    backgroundColor: '#1e293b',
  },
  tabContent: {
    padding: '24px',
  },
  recordsGrid: {
    display: 'grid',
    gap: '16px',
  },
  recordCard: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #334155',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  recordCardHover: {
    borderColor: '#475569',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
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
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  recordTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  severityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
  },
  stateBadge: {
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
    color: '#64748b',
    marginBottom: '4px',
  },
  metaValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#cbd5e1',
  },
  categoryIcon: {
    fontSize: '24px',
    marginRight: '8px',
  },
  mitreTag: {
    display: 'inline-block',
    backgroundColor: '#374151',
    color: '#d1d5db',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    marginRight: '4px',
    marginBottom: '2px',
  },
  playbookCard: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #334155',
    marginBottom: '16px',
  },
  playbookHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  playbookName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  playbookStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#374151',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '12px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '4px',
  },
  threatIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155',
    marginBottom: '12px',
  },
  threatIcon: {
    fontSize: '20px',
  },
  threatText: {
    fontSize: '14px',
    color: '#cbd5e1',
  },
  threatCount: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginLeft: 'auto',
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
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #991b1b',
  },
};

const SecurityOperationsCenter: React.FC<SecurityOperationsCenterProps> = ({
  onCreateSecurityIncident,
  onCreateVulnerability,
  onExecutePlaybook,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<SecurityOperationsDashboard | null>(null);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [playbookExecutions, setPlaybookExecutions] = useState<PlaybookExecution[]>([]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demonstration
      const mockSecurityIncidents: SecurityIncident[] = [
        {
          id: '1',
          number: 'SEC0001001',
          short_description: 'Suspicious network activity detected',
          description: 'Unusual outbound network traffic patterns detected from workstation WS-001',
          state: 'INVESTIGATION',
          severity: 'HIGH',
          category: 'UNAUTHORIZED_ACCESS',
          assigned_to_id: '1',
          assigned_to: {
            id: '1',
            email: 'security@company.com',
            first_name: 'Security',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'SOC Team',
          source: 'Network IDS',
          attack_vector: 'Network',
          affected_users: ['user1@company.com', 'user2@company.com'],
          affected_systems: ['WS-001', 'SERVER-001'],
          mitre_tactics: ['T1071', 'T1059'],
          mitre_techniques: ['Application Layer Protocol', 'Command and Scripting Interpreter'],
          detected_at: '2024-01-10T14:30:00Z',
          opened_at: '2024-01-10T14:30:00Z',
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-10T14:30:00Z',
        },
        {
          id: '2',
          number: 'SEC0001002',
          short_description: 'Malware detected on user workstation',
          description: 'Antivirus software detected malware on employee workstation',
          state: 'CONTAINMENT',
          severity: 'CRITICAL',
          category: 'MALWARE',
          assigned_to_id: '1',
          assigned_to: {
            id: '1',
            email: 'security@company.com',
            first_name: 'Security',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'SOC Team',
          source: 'Endpoint Protection',
          attack_vector: 'Email',
          affected_users: ['victim@company.com'],
          affected_systems: ['WS-042'],
          mitre_tactics: ['T1566'],
          mitre_techniques: ['Phishing'],
          containment_actions: 'Workstation isolated from network',
          detected_at: '2024-01-10T16:15:00Z',
          opened_at: '2024-01-10T16:15:00Z',
          created_at: '2024-01-10T16:15:00Z',
          updated_at: '2024-01-10T16:15:00Z',
        },
      ];

      const mockVulnerabilities: Vulnerability[] = [
        {
          id: '1',
          number: 'VUL0001001',
          cve_id: 'CVE-2024-0001',
          title: 'Critical RCE vulnerability in web application',
          description: 'Remote code execution vulnerability in customer portal',
          severity: 'CRITICAL',
          cvss_score: 9.8,
          state: 'REMEDIATION',
          assigned_to_id: '2',
          assigned_to: {
            id: '2',
            email: 'dev@company.com',
            first_name: 'Dev',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'Security Engineering',
          affected_software: 'Customer Portal',
          affected_version: '2.1.3',
          exploit_available: true,
          patch_available: true,
          patch_details: 'Upgrade to version 2.1.4',
          remediation_plan: 'Apply security patch during next maintenance window',
          due_date: '2024-01-12T00:00:00Z',
          discovered_at: '2024-01-08T10:00:00Z',
          opened_at: '2024-01-08T10:00:00Z',
          created_at: '2024-01-08T10:00:00Z',
          updated_at: '2024-01-08T10:00:00Z',
        },
      ];

      const mockPlaybookExecutions: PlaybookExecution[] = [
        {
          id: '1',
          playbook_name: 'Malware Containment and Eradication',
          security_incident_id: '2',
          status: 'RUNNING',
          started_at: '2024-01-10T16:20:00Z',
          executed_by_id: '1',
          executed_by: {
            id: '1',
            email: 'security@company.com',
            first_name: 'Security',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          steps_completed: 3,
          total_steps: 8,
          success_rate: 100,
          created_at: '2024-01-10T16:20:00Z',
          updated_at: '2024-01-10T16:20:00Z',
        },
      ];

      const mockDashboard: SecurityOperationsDashboard = {
        securityIncidents: {
          total: 15,
          new: 3,
          investigation: 7,
          containment: 3,
          closed: 2,
          by_severity: { CRITICAL: 4, HIGH: 6, MEDIUM: 3, LOW: 2, INFORMATIONAL: 0 },
          by_category: {
            MALWARE: 5,
            PHISHING: 3,
            DATA_BREACH: 1,
            UNAUTHORIZED_ACCESS: 4,
            DDoS: 1,
            INSIDER_THREAT: 0,
            APT: 1,
            VULNERABILITY_EXPLOITATION: 0,
            OTHER: 0,
          },
        },
        vulnerabilities: {
          total: 42,
          new: 8,
          assessment: 15,
          remediation: 12,
          closed: 7,
          by_severity: { CRITICAL: 6, HIGH: 15, MEDIUM: 18, LOW: 3 },
          critical_overdue: 2,
        },
        threatIntelligence: {
          active_threats: 23,
          blocked_ips: 156,
          quarantined_files: 89,
          recent_attacks: [
            { type: 'Brute Force', count: 45, trend: 'up' },
            { type: 'Phishing', count: 23, trend: 'down' },
            { type: 'Malware', count: 17, trend: 'stable' },
          ],
        },
        playbooks: {
          total_playbooks: 12,
          executions_today: 8,
          success_rate: 94,
          average_execution_time: 15.3,
        },
        securityMetrics: {
          mean_time_to_detection: 8.5,
          mean_time_to_response: 12.3,
          mean_time_to_recovery: 156.7,
          security_incidents_prevented: 234,
        },
        timestamp: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSecurityIncidents(mockSecurityIncidents);
      setVulnerabilities(mockVulnerabilities);
      setPlaybookExecutions(mockPlaybookExecutions);
      setDashboardData(mockDashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security operations data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    return (SEVERITY_COLORS as any)[severity] || '#6b7280';
  };

  // Get state color
  const getStateColor = (state: string): string => {
    return (STATE_COLORS as any)[state] || '#6b7280';
  };

  // Get category icon
  const getCategoryIcon = (category: SecurityCategory): string => {
    return CATEGORY_ICONS[category] || '🔒';
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

  // Render metrics cards
  const renderMetricsCards = () => {
    if (!dashboardData) return null;

    const metrics = [
      {
        title: 'Active Security Incidents',
        value: dashboardData.securityIncidents.new + dashboardData.securityIncidents.investigation,
        icon: '🚨',
        color: '#dc2626',
        subtext: `${dashboardData.securityIncidents.by_severity.CRITICAL} critical`,
        type: 'danger',
      },
      {
        title: 'Critical Vulnerabilities',
        value: dashboardData.vulnerabilities.by_severity.CRITICAL,
        icon: '🔓',
        color: '#ea580c',
        subtext: `${dashboardData.vulnerabilities.critical_overdue} overdue`,
        type: 'warning',
      },
      {
        title: 'Threats Blocked Today',
        value: dashboardData.threatIntelligence.blocked_ips,
        icon: '🛡️',
        color: '#10b981',
        subtext: `${dashboardData.threatIntelligence.active_threats} active threats`,
        type: 'success',
      },
      {
        title: 'SOAR Playbook Success',
        value: `${dashboardData.playbooks.success_rate}%`,
        icon: '🤖',
        color: '#3b82f6',
        subtext: `${dashboardData.playbooks.executions_today} executions today`,
        type: 'info',
      },
      {
        title: 'Mean Time to Detection',
        value: `${dashboardData.securityMetrics.mean_time_to_detection}h`,
        icon: '⏱️',
        color: '#8b5cf6',
        subtext: 'Industry target: <24h',
        type: 'info',
      },
    ];

    return (
      <div style={styles.metricsGrid}>
        {metrics.map((metric, index) => {
          let cardStyle = { ...styles.metricCard };
          if (metric.type === 'danger') cardStyle = { ...cardStyle, ...styles.metricCardDanger };
          if (metric.type === 'warning') cardStyle = { ...cardStyle, ...styles.metricCardWarning };
          if (metric.type === 'success') cardStyle = { ...cardStyle, ...styles.metricCardSuccess };

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

  // Render security incidents
  const renderSecurityIncidents = () => {
    return (
      <div style={styles.recordsGrid}>
        {securityIncidents.map((incident) => (
          <div
            key={incident.id}
            style={styles.recordCard}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.recordCardHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={styles.recordHeader}>
              <div>
                <div style={styles.recordNumber}>{incident.number}</div>
                <div style={styles.recordTitle}>
                  <span style={styles.categoryIcon}>{getCategoryIcon(incident.category)}</span>
                  {incident.short_description}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <div
                  style={{
                    ...styles.severityBadge,
                    backgroundColor: getSeverityColor(incident.severity),
                  }}
                >
                  {incident.severity}
                </div>
                <div
                  style={{ ...styles.stateBadge, backgroundColor: getStateColor(incident.state) }}
                >
                  {incident.state.replace('_', ' ')}
                </div>
              </div>
            </div>

            <div style={styles.recordMeta}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Category</span>
                <span style={styles.metaValue}>{incident.category.replace('_', ' ')}</span>
              </div>

              {incident.assigned_to && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Assigned to</span>
                  <span style={styles.metaValue}>
                    {incident.assigned_to.first_name} {incident.assigned_to.last_name}
                  </span>
                </div>
              )}

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Detected</span>
                <span style={styles.metaValue}>
                  {formatTimeAgo(incident.detected_at || incident.opened_at)}
                </span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Affected Systems</span>
                <span style={styles.metaValue}>{incident.affected_systems.length} systems</span>
              </div>
            </div>

            {incident.mitre_tactics.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={styles.metaLabel}>MITRE ATT&CK Tactics</div>
                <div style={{ marginTop: '4px' }}>
                  {incident.mitre_tactics.map((tactic, index) => (
                    <span key={index} style={styles.mitreTag}>
                      {tactic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render vulnerabilities
  const renderVulnerabilities = () => {
    return (
      <div style={styles.recordsGrid}>
        {vulnerabilities.map((vuln) => (
          <div
            key={vuln.id}
            style={styles.recordCard}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.recordCardHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={styles.recordHeader}>
              <div>
                <div style={styles.recordNumber}>
                  {vuln.number} • {vuln.cve_id}
                </div>
                <div style={styles.recordTitle}>{vuln.title}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <div
                  style={{
                    ...styles.severityBadge,
                    backgroundColor: getSeverityColor(vuln.severity),
                  }}
                >
                  {vuln.severity} ({vuln.cvss_score})
                </div>
                <div style={{ ...styles.stateBadge, backgroundColor: getStateColor(vuln.state) }}>
                  {vuln.state.replace('_', ' ')}
                </div>
              </div>
            </div>

            <div style={styles.recordMeta}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Affected Software</span>
                <span style={styles.metaValue}>
                  {vuln.affected_software} {vuln.affected_version}
                </span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Exploit Available</span>
                <span
                  style={{
                    ...styles.metaValue,
                    color: vuln.exploit_available ? '#ef4444' : '#10b981',
                  }}
                >
                  {vuln.exploit_available ? 'Yes ⚠️' : 'No ✅'}
                </span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Patch Available</span>
                <span
                  style={{
                    ...styles.metaValue,
                    color: vuln.patch_available ? '#10b981' : '#ef4444',
                  }}
                >
                  {vuln.patch_available ? 'Yes ✅' : 'No ⚠️'}
                </span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Discovered</span>
                <span style={styles.metaValue}>
                  {formatTimeAgo(vuln.discovered_at || vuln.opened_at)}
                </span>
              </div>
            </div>

            {vuln.patch_details && (
              <div style={{ marginTop: '12px' }}>
                <div style={styles.metaLabel}>Patch Details</div>
                <div style={{ ...styles.metaValue, marginTop: '4px' }}>{vuln.patch_details}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render SOAR playbooks
  const renderSOARPlaybooks = () => {
    return (
      <div>
        <h3 style={{ color: '#f1f5f9', marginBottom: '20px' }}>Active Playbook Executions</h3>
        {playbookExecutions.map((execution) => {
          const progress = (execution.steps_completed / execution.total_steps) * 100;
          const statusColor =
            execution.status === 'RUNNING'
              ? '#f59e0b'
              : execution.status === 'COMPLETED'
                ? '#10b981'
                : execution.status === 'FAILED'
                  ? '#ef4444'
                  : '#6b7280';

          return (
            <div key={execution.id} style={styles.playbookCard}>
              <div style={styles.playbookHeader}>
                <span style={styles.playbookName}>{execution.playbook_name}</span>
                <div style={styles.playbookStatus}>
                  <div style={{ ...styles.statusIndicator, backgroundColor: statusColor }} />
                  <span style={{ color: statusColor, fontSize: '14px', fontWeight: '500' }}>
                    {execution.status}
                  </span>
                </div>
              </div>

              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
              >
                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                  Step {execution.steps_completed} of {execution.total_steps}
                </span>
                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                  {Math.round(progress)}% Complete
                </span>
              </div>

              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>

              <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                Started {formatTimeAgo(execution.started_at)} • Success Rate:{' '}
                {execution.success_rate}%
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render threat intelligence
  const renderThreatIntelligence = () => {
    if (!dashboardData) return null;

    return (
      <div>
        <h3 style={{ color: '#f1f5f9', marginBottom: '20px' }}>Threat Intelligence</h3>

        <div style={styles.threatIndicator}>
          <span style={styles.threatIcon}>🎯</span>
          <span style={styles.threatText}>Active Threats</span>
          <span style={styles.threatCount}>{dashboardData.threatIntelligence.active_threats}</span>
        </div>

        <div style={styles.threatIndicator}>
          <span style={styles.threatIcon}>🚫</span>
          <span style={styles.threatText}>Blocked IPs (24h)</span>
          <span style={styles.threatCount}>{dashboardData.threatIntelligence.blocked_ips}</span>
        </div>

        <div style={styles.threatIndicator}>
          <span style={styles.threatIcon}>🔒</span>
          <span style={styles.threatText}>Quarantined Files</span>
          <span style={styles.threatCount}>
            {dashboardData.threatIntelligence.quarantined_files}
          </span>
        </div>

        <h4 style={{ color: '#f1f5f9', marginTop: '24px', marginBottom: '16px' }}>
          Recent Attack Patterns
        </h4>
        {dashboardData.threatIntelligence.recent_attacks.map((attack, index) => {
          const trendIcon = attack.trend === 'up' ? '📈' : attack.trend === 'down' ? '📉' : '➡️';
          const trendColor =
            attack.trend === 'up' ? '#ef4444' : attack.trend === 'down' ? '#10b981' : '#64748b';

          return (
            <div key={index} style={styles.threatIndicator}>
              <span style={styles.threatIcon}>{trendIcon}</span>
              <span style={styles.threatText}>{attack.type}</span>
              <span style={{ ...styles.threatCount, color: trendColor }}>
                {attack.count} {attack.trend === 'up' ? '↑' : attack.trend === 'down' ? '↓' : '→'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div style={styles.loading}>Loading Security Operations Center...</div>;
  }

  const tabs = [
    { label: 'Security Dashboard', icon: '🛡️' },
    { label: 'Security Incidents', icon: '🚨' },
    { label: 'Vulnerabilities', icon: '🔓' },
    { label: 'SOAR Playbooks', icon: '🤖' },
    { label: 'Threat Intelligence', icon: '🎯' },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>🛡️</span>
          Security Operations Center
        </h1>
        <div style={styles.actionButtons}>
          <button style={styles.buttonPrimary} onClick={onCreateSecurityIncident}>
            🚨 Create Security Incident
          </button>
          <button style={styles.buttonSecondary} onClick={onCreateVulnerability}>
            🔓 Report Vulnerability
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
              <h2 style={{ color: '#f1f5f9' }}>Security Operations Overview</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                Real-time security monitoring, threat detection, and incident response capabilities.
                Monitor security events, manage vulnerabilities, and orchestrate automated response
                workflows.
              </p>
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ color: '#f1f5f9' }}>Security Metrics</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginTop: '16px',
                  }}
                >
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Mean Time to Detection</div>
                    <div style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>
                      {dashboardData?.securityMetrics.mean_time_to_detection}h
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Mean Time to Response</div>
                    <div style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>
                      {dashboardData?.securityMetrics.mean_time_to_response}h
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Mean Time to Recovery</div>
                    <div style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>
                      {dashboardData?.securityMetrics.mean_time_to_recovery}h
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Incidents Prevented</div>
                    <div style={{ color: '#10b981', fontSize: '24px', fontWeight: '700' }}>
                      {dashboardData?.securityMetrics.security_incidents_prevented}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && renderSecurityIncidents()}
          {activeTab === 2 && renderVulnerabilities()}
          {activeTab === 3 && renderSOARPlaybooks()}
          {activeTab === 4 && renderThreatIntelligence()}
        </div>
      </div>
    </div>
  );
};

export default SecurityOperationsCenter;
