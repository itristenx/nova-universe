/**
 * Configuration Management Database (CMDB) Dashboard Component
 * ServiceNow-equivalent CMDB with configuration items, relationships,
 * impact analysis, and dependency mapping
 */

import React, { useState, useEffect, useCallback } from 'react';

// Local type definitions
interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

type ConfigurationItemType =
  | 'COMPUTER'
  | 'SERVER'
  | 'NETWORK_GEAR'
  | 'SOFTWARE'
  | 'SERVICE'
  | 'DATABASE'
  | 'APPLICATION'
  | 'INFRASTRUCTURE'
  | 'VIRTUAL_MACHINE'
  | 'CONTAINER'
  | 'CLOUD_RESOURCE';

type ConfigurationItemState =
  | 'OPERATIONAL'
  | 'NON_OPERATIONAL'
  | 'REPAIR_IN_PROGRESS'
  | 'DISPOSED'
  | 'RETIRED'
  | 'UNDER_DEVELOPMENT'
  | 'TESTING'
  | 'PENDING_APPROVAL';

type RelationshipType =
  | 'RUNS_ON'
  | 'DEPENDS_ON'
  | 'CONNECTS_TO'
  | 'INSTALLED_ON'
  | 'HOSTED_ON'
  | 'MANAGES'
  | 'MONITORS'
  | 'COMMUNICATES_WITH'
  | 'PROVIDES_SERVICE_TO'
  | 'CONTAINS';

type Environment = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT' | 'TEST' | 'UAT' | 'DISASTER_RECOVERY';

interface User extends BaseRecord {
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
}

interface ConfigurationItem extends BaseRecord {
  name: string;
  number: string;
  type: ConfigurationItemType;
  state: ConfigurationItemState;
  environment: Environment;
  category?: string;
  subcategory?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  version?: string;
  serial_number?: string;
  asset_tag?: string;
  ip_address?: string;
  mac_address?: string;
  location?: string;
  cost?: number;
  business_service?: string;
  operational_status?: string;
  health_status?: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  owned_by_id?: string;
  owned_by?: User;
  managed_by_id?: string;
  managed_by?: User;
  assignment_group?: string;
  discovery_source?: string;
  last_discovered?: string;
  first_discovered?: string;
  install_status?: string;
  used_for?: string;
  comments?: string;
  change_control?: string;
  maintenance_schedule?: string;
  warranty_expiration?: string;
  support_group?: string;
  vendor?: string;
  purchase_date?: string;
  install_date?: string;
  due_date?: string;
  can_print?: boolean;
  attributes?: Record<string, any>;
}

interface ConfigurationItemRelationship extends BaseRecord {
  parent_id: string;
  parent: ConfigurationItem;
  child_id: string;
  child: ConfigurationItem;
  type: RelationshipType;
  connection_strength?: number;
  port?: string;
  attributes?: Record<string, any>;
}

interface CMDBAnalytics {
  totalCIs: number;
  cisByType: Record<ConfigurationItemType, number>;
  cisByState: Record<ConfigurationItemState, number>;
  cisByEnvironment: Record<Environment, number>;
  healthDistribution: Record<'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN', number>;
  discoveryStats: {
    lastScanned: number;
    newlyDiscovered: number;
    orphanedCIs: number;
    duplicateCIs: number;
  };
  relationships: {
    totalRelationships: number;
    byType: Record<RelationshipType, number>;
    avgConnectionsPerCI: number;
  };
  compliance: {
    fullyMapped: number;
    partiallyMapped: number;
    unmapped: number;
  };
}

interface ImpactAnalysisResult {
  affected_cis: ConfigurationItem[];
  dependency_depth: number;
  business_impact: 'HIGH' | 'MEDIUM' | 'LOW';
  affected_services: string[];
  estimated_users_affected: number;
  recovery_time_estimate: number;
  dependencies: Array<{
    ci: ConfigurationItem;
    relationship: RelationshipType;
    impact_level: 'DIRECT' | 'INDIRECT';
  }>;
}

interface CMDBDashboardProps {
  onCreateCI?: () => void;
  onRunDiscovery?: () => void;
  onViewRelationships?: (ciId: string) => void;
  onPerformImpactAnalysis?: (ciId: string) => void;
}

// Styling constants
const TYPE_COLORS = {
  COMPUTER: '#3b82f6',
  SERVER: '#dc2626',
  NETWORK_GEAR: '#059669',
  SOFTWARE: '#7c3aed',
  SERVICE: '#0891b2',
  DATABASE: '#c2410c',
  APPLICATION: '#be185d',
  INFRASTRUCTURE: '#65a30d',
  VIRTUAL_MACHINE: '#4338ca',
  CONTAINER: '#0d9488',
  CLOUD_RESOURCE: '#7c2d12',
};

const STATE_COLORS = {
  OPERATIONAL: '#10b981',
  NON_OPERATIONAL: '#ef4444',
  REPAIR_IN_PROGRESS: '#f59e0b',
  DISPOSED: '#6b7280',
  RETIRED: '#6b7280',
  UNDER_DEVELOPMENT: '#3b82f6',
  TESTING: '#8b5cf6',
  PENDING_APPROVAL: '#f59e0b',
};

const HEALTH_COLORS = {
  HEALTHY: '#10b981',
  WARNING: '#f59e0b',
  CRITICAL: '#ef4444',
  UNKNOWN: '#6b7280',
};

const TYPE_ICONS = {
  COMPUTER: '💻',
  SERVER: '🖥️',
  NETWORK_GEAR: '🌐',
  SOFTWARE: '💿',
  SERVICE: '⚙️',
  DATABASE: '🗄️',
  APPLICATION: '📱',
  INFRASTRUCTURE: '🏗️',
  VIRTUAL_MACHINE: '🔧',
  CONTAINER: '📦',
  CLOUD_RESOURCE: '☁️',
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
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #334155',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  metricCardSuccess: {
    borderColor: '#10b981',
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
  },
  metricCardWarning: {
    borderColor: '#f59e0b',
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
  },
  metricCardDanger: {
    borderColor: '#dc2626',
    boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
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
    borderBottomColor: '#3b82f6',
    backgroundColor: '#1e293b',
  },
  tabContent: {
    padding: '24px',
  },
  ciGrid: {
    display: 'grid',
    gap: '16px',
  },
  ciCard: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #334155',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  ciCardHover: {
    borderColor: '#475569',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  ciHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  ciNumber: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  ciName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  ciType: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  typeBadge: {
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
  healthBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
  },
  ciMeta: {
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
  relationshipDiagram: {
    width: '100%',
    height: '400px',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    border: '1px solid #334155',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  nodeContainer: {
    position: 'absolute' as const,
    width: '120px',
    height: '80px',
    backgroundColor: '#1e293b',
    border: '2px solid #334155',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  nodeIcon: {
    fontSize: '20px',
    marginBottom: '4px',
  },
  nodeName: {
    fontSize: '10px',
    color: '#cbd5e1',
    textAlign: 'center' as const,
    fontWeight: '500',
  },
  connectionLine: {
    position: 'absolute' as const,
    backgroundColor: '#475569',
    transformOrigin: 'left center',
  },
  distributionChart: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  distributionCard: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #334155',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '16px',
  },
  chartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #334155',
  },
  chartLabel: {
    fontSize: '14px',
    color: '#cbd5e1',
  },
  chartValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  chartBar: {
    height: '8px',
    backgroundColor: '#374151',
    borderRadius: '4px',
    marginTop: '4px',
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: '4px',
  },
  impactAnalysisCard: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #334155',
    marginBottom: '16px',
  },
  impactHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  impactTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  impactLevel: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
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

const CMDBDashboard: React.FC<CMDBDashboardProps> = ({
  onCreateCI,
  onRunDiscovery,
  onViewRelationships,
  onPerformImpactAnalysis,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<CMDBAnalytics | null>(null);
  const [configurationItems, setConfigurationItems] = useState<ConfigurationItem[]>([]);
  const [relationships, setRelationships] = useState<ConfigurationItemRelationship[]>([]);
  const [selectedCI, setSelectedCI] = useState<ConfigurationItem | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysisResult | null>(null);

  // Load CMDB data
  const loadCMDBData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demonstration
      const mockCIs: ConfigurationItem[] = [
        {
          id: '1',
          name: 'WEB-SERVER-01',
          number: 'CI0001001',
          type: 'SERVER',
          state: 'OPERATIONAL',
          environment: 'PRODUCTION',
          category: 'Hardware',
          subcategory: 'Physical Server',
          description: 'Primary web server for customer portal',
          manufacturer: 'Dell',
          model: 'PowerEdge R750',
          version: '1.0',
          serial_number: 'DL001234567',
          asset_tag: 'AST-001234',
          ip_address: '10.1.1.10',
          location: 'Data Center 1, Rack A1',
          cost: 8500,
          business_service: 'Customer Portal',
          operational_status: 'Active',
          health_status: 'HEALTHY',
          owned_by_id: '1',
          owned_by: {
            id: '1',
            email: 'admin@company.com',
            first_name: 'IT',
            last_name: 'Admin',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'Infrastructure Team',
          discovery_source: 'Network Discovery',
          last_discovered: '2024-01-10T08:00:00Z',
          first_discovered: '2024-01-01T00:00:00Z',
          install_status: 'Installed',
          vendor: 'Dell Technologies',
          purchase_date: '2023-12-01T00:00:00Z',
          install_date: '2023-12-15T00:00:00Z',
          warranty_expiration: '2026-12-01T00:00:00Z',
          support_group: 'Infrastructure Support',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-10T08:00:00Z',
        },
        {
          id: '2',
          name: 'CUSTOMER-PORTAL-APP',
          number: 'CI0001002',
          type: 'APPLICATION',
          state: 'OPERATIONAL',
          environment: 'PRODUCTION',
          category: 'Software',
          subcategory: 'Web Application',
          description: 'Customer self-service portal application',
          version: '2.4.1',
          business_service: 'Customer Portal',
          operational_status: 'Active',
          health_status: 'HEALTHY',
          owned_by_id: '2',
          owned_by: {
            id: '2',
            email: 'dev@company.com',
            first_name: 'Dev',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'Application Team',
          discovery_source: 'Manual Registration',
          last_discovered: '2024-01-10T08:00:00Z',
          first_discovered: '2024-01-01T00:00:00Z',
          install_status: 'Installed',
          vendor: 'Internal Development',
          install_date: '2024-01-05T00:00:00Z',
          support_group: 'Application Support',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-10T08:00:00Z',
        },
        {
          id: '3',
          name: 'CUSTOMER-DB-01',
          number: 'CI0001003',
          type: 'DATABASE',
          state: 'OPERATIONAL',
          environment: 'PRODUCTION',
          category: 'Software',
          subcategory: 'Database Instance',
          description: 'Customer data PostgreSQL database',
          version: '15.4',
          business_service: 'Customer Portal',
          operational_status: 'Active',
          health_status: 'WARNING',
          owned_by_id: '3',
          owned_by: {
            id: '3',
            email: 'dba@company.com',
            first_name: 'DBA',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          assignment_group: 'Database Team',
          discovery_source: 'Application Discovery',
          last_discovered: '2024-01-10T08:00:00Z',
          first_discovered: '2024-01-01T00:00:00Z',
          install_status: 'Installed',
          vendor: 'PostgreSQL Global Development Group',
          install_date: '2024-01-02T00:00:00Z',
          support_group: 'Database Support',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-10T08:00:00Z',
        },
      ];

      const mockRelationships: ConfigurationItemRelationship[] = [
        {
          id: '1',
          parent_id: '2',
          parent: mockCIs[1],
          child_id: '1',
          child: mockCIs[0],
          type: 'RUNS_ON',
          connection_strength: 90,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          parent_id: '2',
          parent: mockCIs[1],
          child_id: '3',
          child: mockCIs[2],
          type: 'DEPENDS_ON',
          connection_strength: 95,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockAnalytics: CMDBAnalytics = {
        totalCIs: 1247,
        cisByType: {
          COMPUTER: 256,
          SERVER: 89,
          NETWORK_GEAR: 45,
          SOFTWARE: 234,
          SERVICE: 67,
          DATABASE: 34,
          APPLICATION: 123,
          INFRASTRUCTURE: 78,
          VIRTUAL_MACHINE: 189,
          CONTAINER: 167,
          CLOUD_RESOURCE: 65,
        },
        cisByState: {
          OPERATIONAL: 1089,
          NON_OPERATIONAL: 23,
          REPAIR_IN_PROGRESS: 15,
          DISPOSED: 34,
          RETIRED: 67,
          UNDER_DEVELOPMENT: 12,
          TESTING: 5,
          PENDING_APPROVAL: 2,
        },
        cisByEnvironment: {
          PRODUCTION: 567,
          STAGING: 123,
          DEVELOPMENT: 234,
          TEST: 189,
          UAT: 87,
          DISASTER_RECOVERY: 47,
        },
        healthDistribution: {
          HEALTHY: 978,
          WARNING: 156,
          CRITICAL: 34,
          UNKNOWN: 79,
        },
        discoveryStats: {
          lastScanned: 24,
          newlyDiscovered: 12,
          orphanedCIs: 8,
          duplicateCIs: 3,
        },
        relationships: {
          totalRelationships: 2847,
          byType: {
            RUNS_ON: 456,
            DEPENDS_ON: 678,
            CONNECTS_TO: 234,
            INSTALLED_ON: 189,
            HOSTED_ON: 267,
            MANAGES: 123,
            MONITORS: 89,
            COMMUNICATES_WITH: 345,
            PROVIDES_SERVICE_TO: 234,
            CONTAINS: 232,
          },
          avgConnectionsPerCI: 2.3,
        },
        compliance: {
          fullyMapped: 89,
          partiallyMapped: 234,
          unmapped: 23,
        },
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setConfigurationItems(mockCIs);
      setRelationships(mockRelationships);
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CMDB data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCMDBData();
  }, [loadCMDBData]);

  // Get type color
  const getTypeColor = (type: ConfigurationItemType): string => {
    return TYPE_COLORS[type] || '#6b7280';
  };

  // Get state color
  const getStateColor = (state: ConfigurationItemState): string => {
    return STATE_COLORS[state] || '#6b7280';
  };

  // Get health color
  const getHealthColor = (health: string): string => {
    return (HEALTH_COLORS as any)[health] || '#6b7280';
  };

  // Get type icon
  const getTypeIcon = (type: ConfigurationItemType): string => {
    return TYPE_ICONS[type] || '⚙️';
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

  // Handle impact analysis
  const handleImpactAnalysis = (ci: ConfigurationItem) => {
    setSelectedCI(ci);

    // Mock impact analysis
    const mockImpactAnalysis: ImpactAnalysisResult = {
      affected_cis: configurationItems.filter((item) => item.id !== ci.id).slice(0, 3),
      dependency_depth: 3,
      business_impact: 'HIGH',
      affected_services: ['Customer Portal', 'Mobile App', 'API Gateway'],
      estimated_users_affected: 15000,
      recovery_time_estimate: 4.5,
      dependencies: [
        {
          ci: configurationItems[1],
          relationship: 'DEPENDS_ON',
          impact_level: 'DIRECT',
        },
        {
          ci: configurationItems[2],
          relationship: 'RUNS_ON',
          impact_level: 'INDIRECT',
        },
      ],
    };

    setImpactAnalysis(mockImpactAnalysis);
    onPerformImpactAnalysis?.(ci.id);
  };

  // Render metrics cards
  const renderMetricsCards = () => {
    if (!analytics) return null;

    const metrics = [
      {
        title: 'Total Configuration Items',
        value: analytics.totalCIs.toLocaleString(),
        icon: '📋',
        color: '#3b82f6',
        subtext: `${analytics.discoveryStats.newlyDiscovered} discovered today`,
        type: 'info',
      },
      {
        title: 'Operational CIs',
        value: `${Math.round((analytics.cisByState.OPERATIONAL / analytics.totalCIs) * 100)}%`,
        icon: '✅',
        color: '#10b981',
        subtext: `${analytics.cisByState.OPERATIONAL} out of ${analytics.totalCIs}`,
        type: 'success',
      },
      {
        title: 'Health Status',
        value: analytics.healthDistribution.CRITICAL,
        icon: '⚠️',
        color: '#ef4444',
        subtext: `${analytics.healthDistribution.WARNING} warnings`,
        type: 'danger',
      },
      {
        title: 'Relationships Mapped',
        value: analytics.relationships.totalRelationships.toLocaleString(),
        icon: '🔗',
        color: '#8b5cf6',
        subtext: `${analytics.relationships.avgConnectionsPerCI} avg per CI`,
        type: 'info',
      },
      {
        title: 'Discovery Compliance',
        value: `${Math.round((analytics.compliance.fullyMapped / (analytics.compliance.fullyMapped + analytics.compliance.partiallyMapped + analytics.compliance.unmapped)) * 100)}%`,
        icon: '🎯',
        color: '#059669',
        subtext: `${analytics.discoveryStats.orphanedCIs} orphaned CIs`,
        type: 'warning',
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

  // Render configuration items
  const renderConfigurationItems = () => {
    return (
      <div style={styles.ciGrid}>
        {configurationItems.map((ci) => (
          <div
            key={ci.id}
            style={styles.ciCard}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.ciCardHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.boxShadow = '';
            }}
            onClick={() => handleImpactAnalysis(ci)}
          >
            <div style={styles.ciHeader}>
              <div>
                <div style={styles.ciNumber}>{ci.number}</div>
                <div style={styles.ciName}>{ci.name}</div>
                <div style={styles.ciType}>
                  <span>{getTypeIcon(ci.type)}</span>
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{ci.description}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <div style={{ ...styles.typeBadge, backgroundColor: getTypeColor(ci.type) }}>
                  {ci.type.replace('_', ' ')}
                </div>
                <div style={{ ...styles.stateBadge, backgroundColor: getStateColor(ci.state) }}>
                  {ci.state.replace('_', ' ')}
                </div>
                {ci.health_status && (
                  <div
                    style={{
                      ...styles.healthBadge,
                      backgroundColor: getHealthColor(ci.health_status),
                    }}
                  >
                    {ci.health_status}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.ciMeta}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Environment</span>
                <span style={styles.metaValue}>{ci.environment}</span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Business Service</span>
                <span style={styles.metaValue}>{ci.business_service || 'N/A'}</span>
              </div>

              {ci.owned_by && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Owner</span>
                  <span style={styles.metaValue}>
                    {ci.owned_by.first_name} {ci.owned_by.last_name}
                  </span>
                </div>
              )}

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Last Discovered</span>
                <span style={styles.metaValue}>
                  {formatTimeAgo(ci.last_discovered || ci.created_at)}
                </span>
              </div>

              {ci.ip_address && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>IP Address</span>
                  <span style={styles.metaValue}>{ci.ip_address}</span>
                </div>
              )}

              {ci.version && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Version</span>
                  <span style={styles.metaValue}>{ci.version}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render relationship diagram
  const renderRelationshipDiagram = () => {
    if (!selectedCI) {
      return (
        <div
          style={{
            ...styles.relationshipDiagram,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
            <div style={{ fontSize: '16px' }}>
              Select a Configuration Item to view its relationships
            </div>
          </div>
        </div>
      );
    }

    // Create a simple network diagram layout
    const centerX = 250;
    const centerY = 200;
    const radius = 120;

    const relatedCIs = relationships
      .filter((rel) => rel.parent_id === selectedCI.id || rel.child_id === selectedCI.id)
      .map((rel) => (rel.parent_id === selectedCI.id ? rel.child : rel.parent));

    return (
      <div style={styles.relationshipDiagram}>
        {/* Center node (selected CI) */}
        <div
          style={{
            ...styles.nodeContainer,
            left: centerX - 60,
            top: centerY - 40,
            borderColor: getTypeColor(selectedCI.type),
            backgroundColor: `${getTypeColor(selectedCI.type)}20`,
          }}
        >
          <div style={styles.nodeIcon}>{getTypeIcon(selectedCI.type)}</div>
          <div style={styles.nodeName}>{selectedCI.name}</div>
        </div>

        {/* Related nodes */}
        {relatedCIs.map((ci, index) => {
          const angle = (index * 2 * Math.PI) / relatedCIs.length;
          const x = centerX + radius * Math.cos(angle) - 60;
          const y = centerY + radius * Math.sin(angle) - 40;

          // Connection line
          const lineLength = radius;
          const lineAngle = angle * (180 / Math.PI);

          return (
            <React.Fragment key={ci.id}>
              {/* Connection line */}
              <div
                style={{
                  ...styles.connectionLine,
                  left: centerX,
                  top: centerY - 1,
                  width: lineLength,
                  height: '2px',
                  transform: `rotate(${lineAngle}deg)`,
                }}
              />

              {/* Related CI node */}
              <div
                style={{
                  ...styles.nodeContainer,
                  left: x,
                  top: y,
                  borderColor: getTypeColor(ci.type),
                }}
                onClick={() => onViewRelationships?.(ci.id)}
              >
                <div style={styles.nodeIcon}>{getTypeIcon(ci.type)}</div>
                <div style={styles.nodeName}>{ci.name}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Render distribution charts
  const renderDistributionCharts = () => {
    if (!analytics) return null;

    const charts = [
      {
        title: 'CIs by Type',
        data: analytics.cisByType,
        colors: TYPE_COLORS,
      },
      {
        title: 'CIs by State',
        data: analytics.cisByState,
        colors: STATE_COLORS,
      },
      {
        title: 'Health Distribution',
        data: analytics.healthDistribution,
        colors: HEALTH_COLORS,
      },
    ];

    return (
      <div style={styles.distributionChart}>
        {charts.map((chart, chartIndex) => {
          const maxValue = Math.max(...Object.values(chart.data));

          return (
            <div key={chartIndex} style={styles.distributionCard}>
              <div style={styles.chartTitle}>{chart.title}</div>
              {Object.entries(chart.data).map(([key, value]) => {
                const percentage = (value / maxValue) * 100;
                const color = (chart.colors as any)[key] || '#6b7280';

                return (
                  <div key={key} style={styles.chartItem}>
                    <div>
                      <div style={styles.chartLabel}>{key.replace('_', ' ')}</div>
                      <div style={styles.chartBar}>
                        <div
                          style={{
                            ...styles.chartBarFill,
                            width: `${percentage}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                    <div style={styles.chartValue}>{value}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Render impact analysis
  const renderImpactAnalysis = () => {
    if (!impactAnalysis || !selectedCI) return null;

    const impactColor =
      impactAnalysis.business_impact === 'HIGH'
        ? '#ef4444'
        : impactAnalysis.business_impact === 'MEDIUM'
          ? '#f59e0b'
          : '#10b981';

    return (
      <div>
        <div style={styles.impactAnalysisCard}>
          <div style={styles.impactHeader}>
            <div style={styles.impactTitle}>Impact Analysis: {selectedCI.name}</div>
            <div style={{ ...styles.impactLevel, backgroundColor: impactColor }}>
              {impactAnalysis.business_impact} IMPACT
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Affected CIs</span>
              <span style={styles.metaValue}>{impactAnalysis.affected_cis.length}</span>
            </div>

            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Dependency Depth</span>
              <span style={styles.metaValue}>{impactAnalysis.dependency_depth} levels</span>
            </div>

            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Users Affected</span>
              <span style={styles.metaValue}>
                {impactAnalysis.estimated_users_affected.toLocaleString()}
              </span>
            </div>

            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Recovery Time</span>
              <span style={styles.metaValue}>{impactAnalysis.recovery_time_estimate}h</span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={styles.metaLabel}>Affected Services</div>
            <div style={{ marginTop: '8px' }}>
              {impactAnalysis.affected_services.map((service, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#374151',
                    color: '#d1d5db',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginRight: '8px',
                    marginBottom: '4px',
                  }}
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.impactAnalysisCard}>
          <div style={styles.impactTitle}>Dependency Chain</div>
          <div style={{ marginTop: '16px' }}>
            {impactAnalysis.dependencies.map((dep, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #334155',
                }}
              >
                <div style={{ marginRight: '12px' }}>{getTypeIcon(dep.ci.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#f1f5f9' }}>{dep.ci.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {dep.relationship.replace('_', ' ')} • {dep.impact_level} impact
                  </div>
                </div>
                <div
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    backgroundColor: dep.impact_level === 'DIRECT' ? '#dc262620' : '#f59e0b20',
                    color: dep.impact_level === 'DIRECT' ? '#dc2626' : '#f59e0b',
                  }}
                >
                  {dep.impact_level}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={styles.loading}>Loading Configuration Management Database...</div>;
  }

  const tabs = [
    { label: 'CMDB Overview', icon: '📊' },
    { label: 'Configuration Items', icon: '📋' },
    { label: 'Relationships', icon: '🔗' },
    { label: 'Impact Analysis', icon: '📈' },
    { label: 'Discovery & Compliance', icon: '🎯' },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>🗂️</span>
          Configuration Management Database
        </h1>
        <div style={styles.actionButtons}>
          <button style={styles.buttonPrimary} onClick={onCreateCI}>
            ➕ Add Configuration Item
          </button>
          <button style={styles.buttonSecondary} onClick={onRunDiscovery}>
            🔍 Run Discovery
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
              <h2 style={{ color: '#f1f5f9' }}>CMDB Overview</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                Comprehensive view of all configuration items, their relationships, and
                dependencies. Monitor compliance, track changes, and perform impact analysis across
                your IT infrastructure.
              </p>
              {renderDistributionCharts()}
            </div>
          )}

          {activeTab === 1 && renderConfigurationItems()}
          {activeTab === 2 && (
            <div>
              <h2 style={{ color: '#f1f5f9' }}>Configuration Item Relationships</h2>
              {renderRelationshipDiagram()}
            </div>
          )}
          {activeTab === 3 && (
            <div>
              <h2 style={{ color: '#f1f5f9' }}>Impact Analysis</h2>
              {impactAnalysis ? (
                renderImpactAnalysis()
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
                  <div>Click on a Configuration Item to perform impact analysis</div>
                </div>
              )}
            </div>
          )}
          {activeTab === 4 && (
            <div>
              <h2 style={{ color: '#f1f5f9' }}>Discovery & Compliance</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px',
                }}
              >
                <div style={styles.distributionCard}>
                  <div style={styles.chartTitle}>Discovery Statistics</div>
                  <div style={styles.chartItem}>
                    <span style={styles.chartLabel}>Last Scanned (24h)</span>
                    <span style={styles.chartValue}>
                      {analytics?.discoveryStats.lastScanned || 0}
                    </span>
                  </div>
                  <div style={styles.chartItem}>
                    <span style={styles.chartLabel}>Newly Discovered</span>
                    <span style={styles.chartValue}>
                      {analytics?.discoveryStats.newlyDiscovered || 0}
                    </span>
                  </div>
                  <div style={styles.chartItem}>
                    <span style={styles.chartLabel}>Orphaned CIs</span>
                    <span style={styles.chartValue}>
                      {analytics?.discoveryStats.orphanedCIs || 0}
                    </span>
                  </div>
                  <div style={styles.chartItem}>
                    <span style={styles.chartLabel}>Duplicate CIs</span>
                    <span style={styles.chartValue}>
                      {analytics?.discoveryStats.duplicateCIs || 0}
                    </span>
                  </div>
                </div>

                <div style={styles.distributionCard}>
                  <div style={styles.chartTitle}>Mapping Compliance</div>
                  <div style={styles.chartItem}>
                    <span style={styles.chartLabel}>Fully Mapped</span>
                    <span style={{ ...styles.chartValue, color: '#10b981' }}>
                      {analytics?.compliance.fullyMapped || 0}%
                    </span>
                  </div>
                  <div style={styles.chartItem}>
                    <span style={styles.chartLabel}>Partially Mapped</span>
                    <span style={{ ...styles.chartValue, color: '#f59e0b' }}>
                      {analytics?.compliance.partiallyMapped || 0}%
                    </span>
                  </div>
                  <div style={styles.chartItem}>
                    <span style={styles.chartLabel}>Unmapped</span>
                    <span style={{ ...styles.chartValue, color: '#ef4444' }}>
                      {analytics?.compliance.unmapped || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CMDBDashboard;
