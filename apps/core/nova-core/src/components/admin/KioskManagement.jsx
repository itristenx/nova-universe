/**
 * Nova Universe Kiosk Management Interface
 * Phase 3 Implementation - Real kiosk management using design system
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardActions,
  Button,
  PrimaryButton,
  OutlineButton,
  GhostButton,
  DangerButton,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Toast,
  Progress,
  Spinner,
  Skeleton,
  useTheme,
} from '../../packages/design-system';

const kioskStyles = `
.kiosk-management {
  padding: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
  background-color: var(--color-background);
  min-height: 100vh;
}

.kiosk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.kiosk-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0;
  flex: 1;
}

.kiosk-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.overview-card {
  background: linear-gradient(135deg, var(--color-primary)10, var(--color-accent)10);
  border: 1px solid var(--color-primary)20;
}

.overview-number {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin: 0 0 var(--space-1) 0;
}

.overview-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: 0;
}

.overview-detail {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.kiosk-filters {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 120px;
}

.filter-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kiosk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-4);
}

.kiosk-card {
  border: 1px solid var(--color-muted)20;
  transition: all var(--duration-200) var(--ease-in-out);
  position: relative;
}

.kiosk-card:hover {
  border-color: var(--color-primary)40;
  transform: translateY(-2px);
}

.kiosk-card--online {
  border-left: 4px solid var(--color-success);
}

.kiosk-card--offline {
  border-left: 4px solid var(--color-error);
}

.kiosk-card--maintenance {
  border-left: 4px solid var(--color-warning);
}

.kiosk-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.kiosk-id {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-primary);
  background-color: var(--color-primary)10;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-base);
}

.kiosk-status {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.kiosk-status--online {
  background-color: var(--color-success)20;
  color: var(--color-success);
}

.kiosk-status--offline {
  background-color: var(--color-error)20;
  color: var(--color-error);
}

.kiosk-status--maintenance {
  background-color: var(--color-warning)20;
  color: var(--color-warning);
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.kiosk-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-content);
  margin: 0 0 var(--space-2) 0;
}

.kiosk-location {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: 0 0 var(--space-3) 0;
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.kiosk-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background-color: var(--color-muted)05;
  border-radius: var(--radius-md);
}

.kiosk-stat {
  text-align: center;
}

.kiosk-stat-value {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0;
}

.kiosk-stat-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin: 0;
}

.kiosk-health {
  margin-bottom: var(--space-4);
}

.health-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-content);
  margin: 0 0 var(--space-1) 0;
}

.health-bar {
  background-color: var(--color-muted)20;
  border-radius: var(--radius-full);
  height: 6px;
  overflow: hidden;
  margin-bottom: var(--space-1);
}

.health-progress {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--duration-300) var(--ease-in-out);
}

.health-progress--excellent {
  background-color: var(--color-success);
}

.health-progress--good {
  background-color: var(--color-info);
}

.health-progress--fair {
  background-color: var(--color-warning);
}

.health-progress--poor {
  background-color: var(--color-error);
}

.health-details {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin: 0;
}

.kiosk-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-muted)20;
}

.kiosk-last-update {
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-align: right;
  margin-top: var(--space-2);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-6);
  color: var(--color-muted);
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-2) 0;
}

.empty-state-description {
  margin: 0 0 var(--space-6) 0;
}

@media (max-width: 768px) {
  .kiosk-management {
    padding: var(--space-4);
  }
  
  .kiosk-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .kiosk-filters {
    flex-direction: column;
  }
  
  .kiosk-grid {
    grid-template-columns: 1fr;
  }
  
  .kiosk-actions {
    flex-direction: column;
  }
}

.modal-section {
  margin-bottom: var(--space-6);
}

.modal-section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-content);
  margin: 0 0 var(--space-3) 0;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-muted)20;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-muted);
}

.info-value {
  font-size: var(--text-base);
  color: var(--color-content);
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-muted)10;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.activity-icon--info {
  background-color: var(--color-info)20;
  color: var(--color-info);
}

.activity-icon--warning {
  background-color: var(--color-warning)20;
  color: var(--color-warning);
}

.activity-icon--error {
  background-color: var(--color-error)20;
  color: var(--color-error);
}

.activity-icon--success {
  background-color: var(--color-success)20;
  color: var(--color-success);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-content);
  margin: 0 0 var(--space-1) 0;
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin: 0;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = kioskStyles;
  document.head.appendChild(styleElement);
}

// Mock kiosk data
const mockKiosks = [
  {
    id: 'KIOSK-001',
    name: 'Main Lobby Terminal',
    location: 'Building A - Level 1',
    status: 'online',
    health: 95,
    uptime: '99.2%',
    todayTickets: 23,
    totalTickets: 1847,
    lastUpdate: '2024-01-20T12:45:00Z',
    version: '2.1.4',
    ipAddress: '192.168.1.101',
    department: 'Reception',
  },
  {
    id: 'KIOSK-002',
    name: 'IT Help Desk',
    location: 'Building B - Level 3',
    status: 'online',
    health: 87,
    uptime: '98.7%',
    todayTickets: 15,
    totalTickets: 982,
    lastUpdate: '2024-01-20T12:42:00Z',
    version: '2.1.4',
    ipAddress: '192.168.1.102',
    department: 'IT Support',
  },
  {
    id: 'KIOSK-003',
    name: 'Conference Room Check-in',
    location: 'Building A - Level 2',
    status: 'maintenance',
    health: 65,
    uptime: '87.3%',
    todayTickets: 0,
    totalTickets: 634,
    lastUpdate: '2024-01-20T09:15:00Z',
    version: '2.1.2',
    ipAddress: '192.168.1.103',
    department: 'Facilities',
  },
  {
    id: 'KIOSK-004',
    name: 'Employee Services',
    location: 'Building C - Level 1',
    status: 'offline',
    health: 0,
    uptime: '0%',
    todayTickets: 0,
    totalTickets: 1203,
    lastUpdate: '2024-01-19T16:30:00Z',
    version: '2.0.8',
    ipAddress: '192.168.1.104',
    department: 'HR',
  },
  {
    id: 'KIOSK-005',
    name: 'Visitor Registration',
    location: 'Building A - Main Entrance',
    status: 'online',
    health: 92,
    uptime: '99.8%',
    todayTickets: 31,
    totalTickets: 2156,
    lastUpdate: '2024-01-20T12:47:00Z',
    version: '2.1.4',
    ipAddress: '192.168.1.105',
    department: 'Security',
  },
  {
    id: 'KIOSK-006',
    name: 'Cafeteria Feedback',
    location: 'Building B - Cafeteria',
    status: 'online',
    health: 78,
    uptime: '96.5%',
    todayTickets: 8,
    totalTickets: 445,
    lastUpdate: '2024-01-20T12:30:00Z',
    version: '2.1.3',
    ipAddress: '192.168.1.106',
    department: 'Food Services',
  },
];

// Mock activity data
const generateKioskActivity = (kioskId) => [
  {
    type: 'info',
    title: 'Ticket submitted successfully',
    time: '2024-01-20T12:45:00Z',
  },
  {
    type: 'warning',
    title: 'Low memory warning - 85% usage',
    time: '2024-01-20T11:30:00Z',
  },
  {
    type: 'success',
    title: 'Software update completed',
    time: '2024-01-20T09:15:00Z',
  },
  {
    type: 'info',
    title: 'User session started',
    time: '2024-01-20T09:00:00Z',
  },
  {
    type: 'error',
    title: 'Network connectivity issue resolved',
    time: '2024-01-19T16:45:00Z',
  },
];

export default function KioskManagement() {
  const { colorMode } = useTheme();
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKiosk, setSelectedKiosk] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    location: 'all',
    search: '',
  });

  // Load kiosks
  useEffect(() => {
    const loadKiosks = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setKiosks(mockKiosks);
      setLoading(false);
    };

    loadKiosks();
  }, []);

  // Filter kiosks
  const filteredKiosks = kiosks.filter((kiosk) => {
    if (filters.status !== 'all' && kiosk.status !== filters.status) {
      return false;
    }

    if (filters.location !== 'all' && !kiosk.location.includes(filters.location)) {
      return false;
    }

    if (
      filters.search &&
      !kiosk.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !kiosk.id.toLowerCase().includes(filters.search.toLowerCase()) &&
      !kiosk.location.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Calculate overview stats
  const overview = {
    total: kiosks.length,
    online: kiosks.filter((k) => k.status === 'online').length,
    offline: kiosks.filter((k) => k.status === 'offline').length,
    maintenance: kiosks.filter((k) => k.status === 'maintenance').length,
    todayTotal: kiosks.reduce((sum, k) => sum + k.todayTickets, 0),
    avgHealth: Math.round(kiosks.reduce((sum, k) => sum + k.health, 0) / kiosks.length),
  };

  const handleKioskClick = (kiosk) => {
    setSelectedKiosk(kiosk);
    setShowModal(true);
  };

  const handleStatusUpdate = (kioskId, newStatus) => {
    setKiosks((prev) =>
      prev.map((kiosk) => (kiosk.id === kioskId ? { ...kiosk, status: newStatus } : kiosk)),
    );
  };

  const getHealthColor = (health) => {
    if (health >= 90) return 'excellent';
    if (health >= 75) return 'good';
    if (health >= 50) return 'fair';
    return 'poor';
  };

  const getHealthLabel = (health) => {
    if (health >= 90) return 'Excellent';
    if (health >= 75) return 'Good';
    if (health >= 50) return 'Fair';
    return 'Poor';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="kiosk-management">
        <div className="kiosk-header">
          <Skeleton variant="title" width="300px" />
          <Skeleton variant="button" />
        </div>

        <div className="kiosk-overview">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="kiosk-grid">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-management">
      {/* Header */}
      <div className="kiosk-header">
        <h1 className="kiosk-title">Kiosk Management</h1>
        <PrimaryButton>+ Add Kiosk</PrimaryButton>
      </div>

      {/* Overview */}
      <div className="kiosk-overview">
        <Card className="overview-card">
          <CardBody>
            <div className="overview-number">{overview.total}</div>
            <div className="overview-label">Total Kiosks</div>
            <div className="overview-detail">
              {overview.online} online, {overview.offline} offline
            </div>
          </CardBody>
        </Card>

        <Card className="overview-card">
          <CardBody>
            <div className="overview-number">{overview.online}</div>
            <div className="overview-label">Online</div>
            <div className="overview-detail">
              {Math.round((overview.online / overview.total) * 100)}% operational
            </div>
          </CardBody>
        </Card>

        <Card className="overview-card">
          <CardBody>
            <div className="overview-number">{overview.maintenance}</div>
            <div className="overview-label">Maintenance</div>
            <div className="overview-detail">Scheduled updates</div>
          </CardBody>
        </Card>

        <Card className="overview-card">
          <CardBody>
            <div className="overview-number">{overview.todayTotal}</div>
            <div className="overview-label">Today's Tickets</div>
            <div className="overview-detail">Across all kiosks</div>
          </CardBody>
        </Card>

        <Card className="overview-card">
          <CardBody>
            <div className="overview-number">{overview.avgHealth}%</div>
            <div className="overview-label">Avg Health</div>
            <div className="overview-detail">System performance</div>
          </CardBody>
        </Card>

        <Card className="overview-card">
          <CardBody>
            <div className="overview-number">v2.1.4</div>
            <div className="overview-label">Latest Version</div>
            <div className="overview-detail">4 kiosks updated</div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="kiosk-filters">
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <Input
            placeholder="Search kiosks..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-muted)40',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-content)',
            }}
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Building</label>
          <select
            value={filters.location}
            onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-muted)40',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-content)',
            }}
          >
            <option value="all">All Buildings</option>
            <option value="Building A">Building A</option>
            <option value="Building B">Building B</option>
            <option value="Building C">Building C</option>
          </select>
        </div>
      </div>

      {/* Kiosks Grid */}
      {filteredKiosks.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state">
              <div className="empty-state-icon">🖥️</div>
              <h3 className="empty-state-title">No kiosks found</h3>
              <p className="empty-state-description">
                {filters.search || filters.status !== 'all' || filters.location !== 'all'
                  ? 'Try adjusting your filters to see more kiosks.'
                  : 'No kiosks have been configured yet.'}
              </p>
              <PrimaryButton>Add First Kiosk</PrimaryButton>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="kiosk-grid">
          {filteredKiosks.map((kiosk) => (
            <Card
              key={kiosk.id}
              className={`kiosk-card kiosk-card--${kiosk.status}`}
              interactive
              onClick={() => handleKioskClick(kiosk)}
            >
              <CardBody>
                <div className="kiosk-header-row">
                  <div className="kiosk-id">{kiosk.id}</div>
                  <div className={`kiosk-status kiosk-status--${kiosk.status}`}>
                    <span className="status-indicator"></span>
                    {kiosk.status}
                  </div>
                </div>

                <h3 className="kiosk-name">{kiosk.name}</h3>
                <div className="kiosk-location">📍 {kiosk.location}</div>

                <div className="kiosk-stats">
                  <div className="kiosk-stat">
                    <div className="kiosk-stat-value">{kiosk.todayTickets}</div>
                    <div className="kiosk-stat-label">Today</div>
                  </div>
                  <div className="kiosk-stat">
                    <div className="kiosk-stat-value">{kiosk.totalTickets}</div>
                    <div className="kiosk-stat-label">Total</div>
                  </div>
                  <div className="kiosk-stat">
                    <div className="kiosk-stat-value">{kiosk.uptime}</div>
                    <div className="kiosk-stat-label">Uptime</div>
                  </div>
                  <div className="kiosk-stat">
                    <div className="kiosk-stat-value">v{kiosk.version}</div>
                    <div className="kiosk-stat-label">Version</div>
                  </div>
                </div>

                <div className="kiosk-health">
                  <div className="health-label">
                    System Health: {kiosk.health}% - {getHealthLabel(kiosk.health)}
                  </div>
                  <div className="health-bar">
                    <div
                      className={`health-progress health-progress--${getHealthColor(kiosk.health)}`}
                      style={{ width: `${kiosk.health}%` }}
                    ></div>
                  </div>
                  <div className="health-details">CPU, Memory, Network status</div>
                </div>

                <div className="kiosk-actions">
                  {kiosk.status === 'offline' ? (
                    <PrimaryButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(kiosk.id, 'online');
                      }}
                    >
                      Restart
                    </PrimaryButton>
                  ) : kiosk.status === 'maintenance' ? (
                    <PrimaryButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(kiosk.id, 'online');
                      }}
                    >
                      Resume
                    </PrimaryButton>
                  ) : (
                    <GhostButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(kiosk.id, 'maintenance');
                      }}
                    >
                      Maintenance
                    </GhostButton>
                  )}
                  <GhostButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Configure kiosk', kiosk.id);
                    }}
                  >
                    Configure
                  </GhostButton>
                  <PrimaryButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleKioskClick(kiosk);
                    }}
                  >
                    Details
                  </PrimaryButton>
                </div>

                <div className="kiosk-last-update">
                  Last update: {formatTimestamp(kiosk.lastUpdate)}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Kiosk Detail Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="xl">
        <ModalHeader onClose={() => setShowModal(false)}>
          Kiosk Details - {selectedKiosk?.id}
        </ModalHeader>
        <ModalBody>
          {selectedKiosk && (
            <div>
              {/* Basic Info */}
              <div className="modal-section">
                <h3 className="modal-section-title">Basic Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Name</div>
                    <div className="info-value">{selectedKiosk.name}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Location</div>
                    <div className="info-value">{selectedKiosk.location}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Department</div>
                    <div className="info-value">{selectedKiosk.department}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Status</div>
                    <div className="info-value">
                      <span className={`kiosk-status kiosk-status--${selectedKiosk.status}`}>
                        <span className="status-indicator"></span>
                        {selectedKiosk.status}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">IP Address</div>
                    <div className="info-value">{selectedKiosk.ipAddress}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Software Version</div>
                    <div className="info-value">v{selectedKiosk.version}</div>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="modal-section">
                <h3 className="modal-section-title">Performance Metrics</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">System Health</div>
                    <div className="info-value">
                      {selectedKiosk.health}% - {getHealthLabel(selectedKiosk.health)}
                      <div className="health-bar" style={{ marginTop: 'var(--space-1)' }}>
                        <div
                          className={`health-progress health-progress--${getHealthColor(selectedKiosk.health)}`}
                          style={{ width: `${selectedKiosk.health}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Uptime</div>
                    <div className="info-value">{selectedKiosk.uptime}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Today's Tickets</div>
                    <div className="info-value">{selectedKiosk.todayTickets}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Total Tickets</div>
                    <div className="info-value">{selectedKiosk.totalTickets.toLocaleString()}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Last Update</div>
                    <div className="info-value">{formatTimestamp(selectedKiosk.lastUpdate)}</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="modal-section">
                <h3 className="modal-section-title">Recent Activity</h3>
                <div className="activity-list">
                  {generateKioskActivity(selectedKiosk.id).map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon activity-icon--${activity.type}`}>
                        {activity.type === 'info' && 'ℹ️'}
                        {activity.type === 'warning' && '⚠️'}
                        {activity.type === 'error' && '❌'}
                        {activity.type === 'success' && '✅'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.title}</div>
                        <div className="activity-time">{formatTimestamp(activity.time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <OutlineButton onClick={() => setShowModal(false)}>Close</OutlineButton>
          <GhostButton>Download Logs</GhostButton>
          <PrimaryButton>Configure</PrimaryButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
