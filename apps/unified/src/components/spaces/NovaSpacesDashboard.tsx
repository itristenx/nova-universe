/**
 * Enhanced Nova Spaces Management Dashboard
 * Enterprise-grade space management competing with Maptician
 * Includes advanced booking, analytics, visitor management, and integrations
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardActions,
} from '../../../../../packages/design-system';
import { Button } from '../../../../../packages/design-system';
import { useSpaceStore } from '../../stores/spaces';
import { Building, MapPin, Users, Calendar, Settings, Search, Filter, Plus } from 'lucide-react';
import { SpaceFloorPlan } from './components/SpaceFloorPlan';
import { BookingEngine } from './components/BookingEngine';
import { SpaceAnalytics } from './components/SpaceAnalytics';
import { VisitorManagement } from './components/VisitorManagement';
import { SpaceSettings } from './components/SpaceSettings';
import './NovaSpacesDashboard.css';

interface NovaSpacesProps {
  className?: string;
}

export function NovaSpacesDashboard({ className }: NovaSpacesProps) {
  const { spaces, bookings, metrics, isLoading, error, loadSpaces, loadMetrics } = useSpaceStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    spaceType: '',
    status: '',
    capacity: { min: '', max: '' },
    amenities: [] as string[],
  });

  // Initialize data
  useEffect(() => {
    loadSpaces();
    loadMetrics();
  }, [loadSpaces, loadMetrics]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [loadMetrics]);

  const filteredSpaces = spaces.filter((space) => {
    if (selectedBuilding && space.building !== selectedBuilding) return false;
    if (selectedFloor && space.floor !== selectedFloor) return false;
    if (searchQuery && !space.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.spaceType && space.type !== filters.spaceType) return false;
    if (filters.status && space.status !== filters.status) return false;
    if (filters.capacity.min && space.capacity < parseInt(filters.capacity.min)) return false;
    if (filters.capacity.max && space.capacity > parseInt(filters.capacity.max)) return false;
    return true;
  });

  const quickStats = {
    totalSpaces: spaces.length,
    availableSpaces: spaces.filter((s) => s.status === 'available').length,
    occupiedSpaces: spaces.filter((s) => s.status === 'occupied').length,
    maintenanceSpaces: spaces.filter((s) => s.status === 'maintenance').length,
    utilizationRate: metrics?.utilizationRate || 0,
  };

  if (isLoading) {
    return (
      <div className="nova-loading-container">
        <div className="nova-spinner"></div>
        <p>Loading Nova Spaces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" status="error">
        <CardBody>
          <CardText>Error loading spaces: {error}</CardText>
          <CardActions>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardActions>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`nova-spaces-dashboard ${className || ''}`}>
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Nova Spaces</h1>
          <p className="dashboard-subtitle">Enterprise space management & booking system</p>
        </div>

        <div className="header-actions">
          <RealTimeStatusIndicator />
          <Button variant="outline" size="sm">
            <Settings className="icon-sm" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="icon-sm" />
            Quick Book
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="stats-grid">
        <Card variant="elevated">
          <CardBody>
            <div className="stat-card">
              <div className="stat-content">
                <p className="stat-label">Total Spaces</p>
                <p className="stat-value">{quickStats.totalSpaces}</p>
              </div>
              <Building className="stat-icon" />
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="stat-card">
              <div className="stat-content">
                <p className="stat-label">Available</p>
                <p className="stat-value available">{quickStats.availableSpaces}</p>
              </div>
              <div className="status-indicator available"></div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="stat-card">
              <div className="stat-content">
                <p className="stat-label">Occupied</p>
                <p className="stat-value occupied">{quickStats.occupiedSpaces}</p>
              </div>
              <Users className="stat-icon" />
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="stat-card">
              <div className="stat-content">
                <p className="stat-label">Maintenance</p>
                <p className="stat-value maintenance">{quickStats.maintenanceSpaces}</p>
              </div>
              <div className="status-indicator maintenance"></div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="stat-card">
              <div className="stat-content">
                <p className="stat-label">Utilization</p>
                <p className="stat-value">{quickStats.utilizationRate}%</p>
              </div>
              <Calendar className="stat-icon" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="filters-container">
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search spaces, rooms, desks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-controls">
              <label htmlFor="building-select" className="sr-only">
                Filter by building
              </label>
              <select
                id="building-select"
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="filter-select"
                aria-label="Filter spaces by building"
              >
                <option value="">All Buildings</option>
                {Array.from(new Set(spaces.map((s) => s.building))).map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>

              <label htmlFor="type-select" className="sr-only">
                Filter by type
              </label>
              <select
                id="type-select"
                value={filters.spaceType}
                onChange={(e) => setFilters({ ...filters, spaceType: e.target.value })}
                className="filter-select"
                aria-label="Filter spaces by type"
              >
                <option value="">All Types</option>
                <option value="conference_room">Conference Room</option>
                <option value="meeting_room">Meeting Room</option>
                <option value="hot_desk">Hot Desk</option>
                <option value="phone_booth">Phone Booth</option>
                <option value="focus_room">Focus Room</option>
              </select>

              <label htmlFor="status-select" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="filter-select"
                aria-label="Filter spaces by status"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="icon-sm" />
                More Filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content Tabs */}
      <div className="tabs-container">
        <div className="tabs-list">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'floorplan' ? 'active' : ''}`}
            onClick={() => setActiveTab('floorplan')}
          >
            Floor Plans
          </button>
          <button
            className={`tab ${activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            Booking
          </button>
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`tab ${activeTab === 'visitors' ? 'active' : ''}`}
            onClick={() => setActiveTab('visitors')}
          >
            Visitors
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="card-title-container">
                    <span>Spaces ({filteredSpaces.length})</span>
                    <div className="card-actions">
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                      <Button size="sm">
                        <Plus className="icon-sm" />
                        Add Space
                      </Button>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="spaces-grid">
                  {filteredSpaces.map((space) => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>

                {filteredSpaces.length === 0 && (
                  <div className="empty-state">
                    <p>No spaces found matching your criteria</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {activeTab === 'floorplan' && (
            <Card>
              <CardHeader>
                <CardTitle>Interactive Floor Plans</CardTitle>
              </CardHeader>
              <CardBody>
                <p>Floor plan visualization coming soon...</p>
              </CardBody>
            </Card>
          )}

          {activeTab === 'booking' && (
            <BookingEngine
              spaceId={selectedBuilding}
              onBookingCreated={(booking) => {
                console.log('New booking created:', booking);
                // Refresh bookings data
                loadSpaces();
              }}
              onBookingUpdated={(booking) => {
                console.log('Booking updated:', booking);
                loadSpaces();
              }}
              onBookingDeleted={(bookingId) => {
                console.log('Booking deleted:', bookingId);
                loadSpaces();
              }}
              className="booking-engine-tab"
            />
          )}

          {activeTab === 'analytics' && (
            <SpaceAnalytics
              buildingId={selectedBuilding}
              timeRange="month"
              onExportData={(data) => {
                console.log('Exporting analytics data:', data);
              }}
              className="analytics-tab"
            />
          )}

          {activeTab === 'visitors' && (
            <VisitorManagement
              buildingId={selectedBuilding}
              onVisitorCheckin={(visitorId) => {
                console.log('Visitor checked in:', visitorId);
              }}
              onVisitorCheckout={(visitorId) => {
                console.log('Visitor checked out:', visitorId);
              }}
              className="visitor-management-tab"
            />
          )}

          {activeTab === 'settings' && (
            <SpaceSettings
              buildingId={selectedBuilding}
              onSettingsChange={(settings) => {
                console.log('Settings updated:', settings);
                // Refresh spaces data
                loadSpaces();
              }}
              className="settings-tab"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Space Card Component
interface SpaceCardProps {
  space: any;
}

function SpaceCard({ space }: SpaceCardProps) {
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      available: 'status-badge available',
      occupied: 'status-badge occupied',
      maintenance: 'status-badge maintenance',
      reserved: 'status-badge reserved',
    };

    return (
      <span className={statusClasses[status as keyof typeof statusClasses] || 'status-badge'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeIcons = {
      conference_room: '🏢',
      meeting_room: '👥',
      phone_booth: '📞',
      focus_room: '�',
      hot_desk: '💺',
      office: '�',
    };

    return typeIcons[type as keyof typeof typeIcons] || '🏠';
  };

  return (
    <Card variant="outlined" interactive>
      <CardBody>
        <div className="space-card">
          <div className="space-card-header">
            <div className="space-title">
              <span className="space-icon">{getTypeIcon(space.type)}</span>
              <h3 className="space-name">{space.name}</h3>
            </div>
            {getStatusBadge(space.status)}
          </div>

          <div className="space-details">
            <div className="space-detail">
              <MapPin className="detail-icon" />
              <span>
                {space.building} - Floor {space.floor}
              </span>
            </div>
            <div className="space-detail">
              <Users className="detail-icon" />
              <span>Capacity: {space.capacity}</span>
            </div>
          </div>

          {space.amenities && space.amenities.length > 0 && (
            <div className="space-amenities">
              {space.amenities.slice(0, 3).map((amenity: string, index: number) => (
                <span key={index} className="amenity-tag">
                  {amenity}
                </span>
              ))}
              {space.amenities.length > 3 && (
                <span className="amenity-tag more">+{space.amenities.length - 3} more</span>
              )}
            </div>
          )}

          <CardActions justify="between">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            {space.status === 'available' && <Button size="sm">Book Now</Button>}
          </CardActions>
        </div>
      </CardBody>
    </Card>
  );
}

// Real-time Status Indicator
function RealTimeStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate connection monitoring
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1); // 90% uptime simulation
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="realtime-status">
      <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
      <span className="status-text">{isOnline ? 'Live' : 'Reconnecting...'}</span>
    </div>
  );
}

export default NovaSpacesDashboard;
