/**
 * Enterprise Asset Management (EAM) Dashboard Component
 * ServiceNow-equivalent Asset Management UI with lifecycle tracking,
 * risk scoring, maintenance management, and analytics
 */

import React, { useState, useEffect, useCallback } from 'react';

// Local type definitions
interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

type AssetLifecycleStage =
  | 'PLANNING'
  | 'PROCUREMENT'
  | 'DEPLOYMENT'
  | 'OPERATIONAL'
  | 'MAINTENANCE'
  | 'DISPOSAL';

type AssetOperationalStatus =
  | 'OPERATIONAL'
  | 'NON_OPERATIONAL'
  | 'UNDER_MAINTENANCE'
  | 'RETIRED'
  | 'MISSING'
  | 'BROKEN';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'UPGRADE';

type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface User extends BaseRecord {
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
}

interface AssetCategory extends BaseRecord {
  name: string;
  description?: string;
  code: string;
}

interface Asset extends BaseRecord {
  asset_tag: string;
  serial_number?: string;
  name: string;
  description?: string;
  category_id: string;
  category?: AssetCategory;
  model?: string;
  manufacturer?: string;
  location?: string;
  cost?: number;
  purchase_date?: string;
  warranty_date?: string;
  lifecycle_stage: AssetLifecycleStage;
  operational_status: AssetOperationalStatus;
  risk_score: number;
  owner_id?: string;
  owner?: User;
  assigned_to_id?: string;
  assigned_to?: User;
  department?: string;
  business_unit?: string;
}

interface MaintenanceRecord extends BaseRecord {
  asset_id: string;
  asset: Asset;
  maintenance_type: MaintenanceType;
  scheduled_date: string;
  completed_date?: string;
  technician_id?: string;
  technician?: User;
  cost?: number;
  description?: string;
  notes?: string;
  status: MaintenanceStatus;
}

interface AssetDashboardData {
  totalAssets: number;
  assetsByCategory: Array<{
    category_id: string;
    category_name: string;
    _count: number;
  }>;
  assetsByLifecycle: Array<{
    lifecycle_stage: AssetLifecycleStage;
    _count: number;
  }>;
  assetsByStatus: Array<{
    operational_status: AssetOperationalStatus;
    _count: number;
  }>;
  riskDistribution: Array<{
    risk_score: number;
    _count: number;
  }>;
}

interface AssetManagementDashboardProps {
  onAssetCreate?: (asset: Partial<Asset>) => void;
  onAssetUpdate?: (id: string, asset: Partial<Asset>) => void;
  onAssetDelete?: (id: string) => void;
  onMaintenanceSchedule?: (assetId: string, maintenance: Partial<MaintenanceRecord>) => void;
}

// Styling constants
const ASSET_STATUS_COLORS = {
  OPERATIONAL: '#4caf50',
  NON_OPERATIONAL: '#f44336',
  UNDER_MAINTENANCE: '#ff9800',
  RETIRED: '#9e9e9e',
  MISSING: '#e91e63',
  BROKEN: '#d32f2f',
};

const LIFECYCLE_COLORS = {
  PLANNING: '#2196f3',
  PROCUREMENT: '#ff9800',
  DEPLOYMENT: '#9c27b0',
  OPERATIONAL: '#4caf50',
  MAINTENANCE: '#ff5722',
  DISPOSAL: '#607d8b',
};

const RISK_COLORS = {
  HIGH: '#f44336',
  MEDIUM: '#ff9800',
  LOW: '#4caf50',
};

// CSS styles
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  buttonPrimary: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    fontSize: '14px',
  },
  buttonSecondary: {
    backgroundColor: 'white',
    color: '#1976d2',
    border: '1px solid #1976d2',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  summaryIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  tabContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  tabHeader: {
    display: 'flex',
    borderBottom: '1px solid #e0e0e0',
  },
  tab: {
    padding: '15px 25px',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  tabActive: {
    borderBottomColor: '#1976d2',
    color: '#1976d2',
  },
  tabContent: {
    padding: '30px',
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    alignItems: 'end',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  assetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  assetCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease-in-out',
    cursor: 'pointer',
  },
  assetCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  assetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  assetInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  assetIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    fontSize: '18px',
    color: 'white',
  },
  assetName: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: '#333',
  },
  assetTag: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  },
  statusChips: {
    marginBottom: '15px',
  },
  chip: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    marginRight: '8px',
    marginBottom: '4px',
  },
  riskSection: {
    marginBottom: '15px',
  },
  riskLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
  },
  riskBar: {
    display: 'flex',
    alignItems: 'center',
  },
  riskProgress: {
    flex: 1,
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    marginRight: '10px',
    overflow: 'hidden',
  },
  riskValue: {
    fontSize: '12px',
    fontWeight: '500',
  },
  assetFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetCategory: {
    fontSize: '12px',
    color: '#666',
  },
  actionButtons: {
    display: 'flex',
    gap: '5px',
  },
  actionButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '18px',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #ef5350',
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalHeader: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
};

const AssetManagementDashboard: React.FC<AssetManagementDashboardProps> = ({
  onAssetCreate,
  onAssetUpdate,
  onAssetDelete,
  onMaintenanceSchedule,
}) => {
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [dashboardData, setDashboardData] = useState<AssetDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AssetOperationalStatus | 'ALL'>('ALL');
  const [filterLifecycle, setFilterLifecycle] = useState<AssetLifecycleStage | 'ALL'>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demonstration
      const mockAssets: Asset[] = [
        {
          id: '1',
          asset_tag: 'LAPTOP-001',
          name: 'Dell Latitude 7420',
          description: 'Employee laptop',
          category_id: '1',
          category: { id: '1', name: 'Computers', code: 'COMP', created_at: '', updated_at: '' },
          model: 'Latitude 7420',
          manufacturer: 'Dell',
          location: 'New York Office',
          cost: 1500,
          lifecycle_stage: 'OPERATIONAL',
          operational_status: 'OPERATIONAL',
          risk_score: 3,
          owner_id: '1',
          owner: {
            id: '1',
            email: 'john@company.com',
            first_name: 'John',
            last_name: 'Doe',
            created_at: '',
            updated_at: '',
          },
          department: 'Engineering',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          asset_tag: 'SERVER-001',
          name: 'Production Server',
          description: 'Main application server',
          category_id: '2',
          category: { id: '2', name: 'Servers', code: 'SERV', created_at: '', updated_at: '' },
          model: 'PowerEdge R750',
          manufacturer: 'Dell',
          location: 'Data Center',
          cost: 15000,
          lifecycle_stage: 'OPERATIONAL',
          operational_status: 'UNDER_MAINTENANCE',
          risk_score: 7,
          department: 'IT Operations',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      const mockDashboardData: AssetDashboardData = {
        totalAssets: 150,
        assetsByCategory: [
          { category_id: '1', category_name: 'Computers', _count: 75 },
          { category_id: '2', category_name: 'Servers', _count: 25 },
          { category_id: '3', category_name: 'Network Equipment', _count: 30 },
          { category_id: '4', category_name: 'Mobile Devices', _count: 20 },
        ],
        assetsByLifecycle: [
          { lifecycle_stage: 'OPERATIONAL', _count: 120 },
          { lifecycle_stage: 'MAINTENANCE', _count: 15 },
          { lifecycle_stage: 'DEPLOYMENT', _count: 10 },
          { lifecycle_stage: 'DISPOSAL', _count: 5 },
        ],
        assetsByStatus: [
          { operational_status: 'OPERATIONAL', _count: 125 },
          { operational_status: 'UNDER_MAINTENANCE', _count: 15 },
          { operational_status: 'NON_OPERATIONAL', _count: 8 },
          { operational_status: 'RETIRED', _count: 2 },
        ],
        riskDistribution: [
          { risk_score: 1, _count: 30 },
          { risk_score: 2, _count: 25 },
          { risk_score: 3, _count: 35 },
          { risk_score: 4, _count: 20 },
          { risk_score: 5, _count: 15 },
          { risk_score: 6, _count: 12 },
          { risk_score: 7, _count: 8 },
          { risk_score: 8, _count: 3 },
          { risk_score: 9, _count: 1 },
          { risk_score: 10, _count: 1 },
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAssets(mockAssets);
      setDashboardData(mockDashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filter assets based on search and filters
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      !searchTerm ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || asset.operational_status === filterStatus;
    const matchesLifecycle = filterLifecycle === 'ALL' || asset.lifecycle_stage === filterLifecycle;

    return matchesSearch && matchesStatus && matchesLifecycle;
  });

  // Get asset icon based on category
  const getAssetIcon = (category: string) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('computer') || categoryLower.includes('laptop')) return '💻';
    if (categoryLower.includes('phone') || categoryLower.includes('mobile')) return '📱';
    if (categoryLower.includes('network') || categoryLower.includes('router')) return '🌐';
    if (categoryLower.includes('printer')) return '🖨️';
    if (categoryLower.includes('server')) return '🖥️';
    return '📦';
  };

  // Get risk level color
  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 7) return RISK_COLORS.HIGH;
    if (riskScore >= 4) return RISK_COLORS.MEDIUM;
    return RISK_COLORS.LOW;
  };

  // Asset summary cards
  const renderSummaryCards = () => {
    if (!dashboardData) return null;

    const summaryItems = [
      {
        title: 'Total Assets',
        value: dashboardData.totalAssets,
        icon: '📦',
        color: '#2196f3',
        trend: '+5.2%',
      },
      {
        title: 'Operational',
        value:
          dashboardData.assetsByStatus.find((s) => s.operational_status === 'OPERATIONAL')
            ?._count || 0,
        icon: '✅',
        color: '#4caf50',
        trend: '+2.1%',
      },
      {
        title: 'Under Maintenance',
        value:
          dashboardData.assetsByStatus.find((s) => s.operational_status === 'UNDER_MAINTENANCE')
            ?._count || 0,
        icon: '🔧',
        color: '#ff9800',
        trend: '-1.3%',
      },
      {
        title: 'High Risk',
        value: dashboardData.riskDistribution
          .filter((r) => r.risk_score >= 7)
          .reduce((sum, r) => sum + r._count, 0),
        icon: '⚠️',
        color: '#f44336',
        trend: '-0.8%',
      },
    ];

    return (
      <div style={styles.summaryGrid}>
        {summaryItems.map((item, index) => (
          <div key={index} style={styles.summaryCard}>
            <div>
              <div style={styles.summaryLabel}>{item.title}</div>
              <div style={styles.summaryValue}>{item.value.toLocaleString()}</div>
              <div
                style={{
                  ...styles.chip,
                  backgroundColor: item.trend.startsWith('+') ? '#e8f5e8' : '#ffebee',
                  color: item.trend.startsWith('+') ? '#2e7d32' : '#c62828',
                }}
              >
                {item.trend}
              </div>
            </div>
            <div style={{ ...styles.summaryIcon, backgroundColor: item.color }}>{item.icon}</div>
          </div>
        ))}
      </div>
    );
  };

  // Asset cards view
  const renderAssetCards = () => {
    return (
      <div style={styles.assetsGrid}>
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            style={styles.assetCard}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.assetCardHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <div style={styles.assetHeader}>
              <div style={styles.assetInfo}>
                <div
                  style={{
                    ...styles.assetIcon,
                    backgroundColor: LIFECYCLE_COLORS[asset.lifecycle_stage],
                  }}
                >
                  {getAssetIcon(asset.category?.name || '')}
                </div>
                <div>
                  <h3 style={styles.assetName}>{asset.name}</h3>
                  <p style={styles.assetTag}>{asset.asset_tag}</p>
                </div>
              </div>
              <button style={styles.actionButton}>⋮</button>
            </div>

            <div style={styles.statusChips}>
              <span
                style={{
                  ...styles.chip,
                  backgroundColor: ASSET_STATUS_COLORS[asset.operational_status],
                  color: 'white',
                }}
              >
                {asset.operational_status}
              </span>
              <span
                style={{
                  ...styles.chip,
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: `1px solid ${LIFECYCLE_COLORS[asset.lifecycle_stage]}`,
                }}
              >
                {asset.lifecycle_stage}
              </span>
            </div>

            <div style={styles.riskSection}>
              <div style={styles.riskLabel}>Risk Score</div>
              <div style={styles.riskBar}>
                <div style={styles.riskProgress}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(asset.risk_score / 10) * 100}%`,
                      backgroundColor: getRiskColor(asset.risk_score),
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <span style={styles.riskValue}>{asset.risk_score}/10</span>
              </div>
            </div>

            <div style={styles.assetFooter}>
              <span style={styles.assetCategory}>{asset.category?.name}</span>
              <div style={styles.actionButtons}>
                <button
                  style={styles.actionButton}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setAssetDialogOpen(true);
                  }}
                >
                  👁️
                </button>
                <button
                  style={styles.actionButton}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setMaintenanceDialogOpen(true);
                  }}
                >
                  🔧
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div>Loading Enterprise Asset Management Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Enterprise Asset Management</h1>
        <div>
          <button
            style={styles.buttonPrimary}
            onClick={() => {
              setSelectedAsset(null);
              setAssetDialogOpen(true);
            }}
          >
            + Add Asset
          </button>
          <button style={styles.buttonSecondary} onClick={loadDashboardData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabHeader}>
          {['Asset Overview', 'Analytics', 'Maintenance', 'Risk Management'].map((label, index) => (
            <button
              key={index}
              style={{
                ...styles.tab,
                ...(tabValue === index ? styles.tabActive : {}),
              }}
              onClick={() => setTabValue(index)}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {tabValue === 0 && (
            <>
              {/* Filters and Search */}
              <div style={styles.filterContainer}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Search Assets
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Status
                  </label>
                  <select
                    style={styles.select}
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as AssetOperationalStatus | 'ALL')
                    }
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="OPERATIONAL">Operational</option>
                    <option value="NON_OPERATIONAL">Non-Operational</option>
                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    <option value="RETIRED">Retired</option>
                    <option value="MISSING">Missing</option>
                    <option value="BROKEN">Broken</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Lifecycle
                  </label>
                  <select
                    style={styles.select}
                    value={filterLifecycle}
                    onChange={(e) =>
                      setFilterLifecycle(e.target.value as AssetLifecycleStage | 'ALL')
                    }
                  >
                    <option value="ALL">All Stages</option>
                    <option value="PLANNING">Planning</option>
                    <option value="PROCUREMENT">Procurement</option>
                    <option value="DEPLOYMENT">Deployment</option>
                    <option value="OPERATIONAL">Operational</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="DISPOSAL">Disposal</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Actions
                  </label>
                  <button style={styles.buttonSecondary}>📤 Export</button>
                </div>
              </div>

              {/* Asset Display */}
              {renderAssetCards()}
            </>
          )}

          {tabValue === 1 && (
            <div>
              <h2>Analytics Dashboard</h2>
              <p>Asset analytics and reporting would be displayed here with charts and graphs.</p>
            </div>
          )}

          {tabValue === 2 && (
            <div>
              <h2>Maintenance Management</h2>
              <p>Maintenance scheduling and tracking functionality would be implemented here.</p>
            </div>
          )}

          {tabValue === 3 && (
            <div>
              <h2>Risk Management</h2>
              <p>Risk assessment and management tools would be available here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Asset Dialog */}
      {assetDialogOpen && (
        <div style={styles.modal} onClick={() => setAssetDialogOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalHeader}>{selectedAsset ? 'Edit Asset' : 'Create Asset'}</h2>
            <p>Asset form implementation would go here...</p>
            <div style={styles.modalActions}>
              <button style={styles.buttonSecondary} onClick={() => setAssetDialogOpen(false)}>
                Cancel
              </button>
              <button
                style={styles.buttonPrimary}
                onClick={() => {
                  onAssetCreate?.({});
                  setAssetDialogOpen(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Dialog */}
      {maintenanceDialogOpen && (
        <div style={styles.modal} onClick={() => setMaintenanceDialogOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalHeader}>Schedule Maintenance</h2>
            <p>Maintenance scheduling form would go here...</p>
            <div style={styles.modalActions}>
              <button
                style={styles.buttonSecondary}
                onClick={() => setMaintenanceDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                style={styles.buttonPrimary}
                onClick={() => {
                  if (selectedAsset) {
                    onMaintenanceSchedule?.(selectedAsset.id, {});
                  }
                  setMaintenanceDialogOpen(false);
                }}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagementDashboard;
