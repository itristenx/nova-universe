/**
 * Advanced Space Analytics Component for Nova Spaces
 * Enterprise-grade analytics and insights for space utilization
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Building,
  Filter,
  Download,
  RefreshCw,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../../../../packages/design-system';
import { Card, CardHeader, CardBody, CardTitle } from '../../../../../../packages/design-system';
import './SpaceAnalytics.css';

interface SpaceAnalyticsProps {
  buildingId?: string;
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  onExportData?: (data: any) => void;
  className?: string;
}

interface AnalyticsData {
  utilizationRate: number;
  totalBookings: number;
  averageOccupancy: number;
  peakHours: string[];
  popularSpaces: Array<{
    id: string;
    name: string;
    bookings: number;
    utilization: number;
  }>;
  occupancyTrends: Array<{
    date: string;
    occupancy: number;
    bookings: number;
  }>;
  spaceTypeMetrics: Array<{
    type: string;
    count: number;
    utilization: number;
    revenue: number;
  }>;
  hourlyUtilization: Array<{
    hour: number;
    utilization: number;
  }>;
}

interface SpaceMetrics {
  id: string;
  name: string;
  type: string;
  capacity: number;
  totalBookings: number;
  totalHours: number;
  utilization: number;
  revenue: number;
  avgRating: number;
  issues: number;
}

export function SpaceAnalytics({
  buildingId,
  timeRange = 'week',
  onExportData,
  className,
}: SpaceAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [spaceMetrics, setSpaceMetrics] = useState<SpaceMetrics[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedBuilding, setSelectedBuilding] = useState(buildingId || '');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data
  const mockAnalyticsData: AnalyticsData = {
    utilizationRate: 73.5,
    totalBookings: 1247,
    averageOccupancy: 8.2,
    peakHours: ['09:00', '10:00', '14:00', '15:00'],
    popularSpaces: [
      { id: 'conf-a', name: 'Conference Room A', bookings: 156, utilization: 89.2 },
      { id: 'open-1', name: 'Open Workspace 1', bookings: 142, utilization: 76.8 },
      { id: 'focus-3', name: 'Focus Room 3', bookings: 98, utilization: 85.1 },
      { id: 'phone-2', name: 'Phone Booth 2', bookings: 87, utilization: 92.3 },
      { id: 'collab-1', name: 'Collaboration Space 1', bookings: 76, utilization: 68.4 },
    ],
    occupancyTrends: [
      { date: '2024-01-08', occupancy: 68, bookings: 34 },
      { date: '2024-01-09', occupancy: 72, bookings: 38 },
      { date: '2024-01-10', occupancy: 78, bookings: 42 },
      { date: '2024-01-11', occupancy: 85, bookings: 47 },
      { date: '2024-01-12', occupancy: 81, bookings: 45 },
      { date: '2024-01-13', occupancy: 65, bookings: 28 },
      { date: '2024-01-14', occupancy: 58, bookings: 22 },
    ],
    spaceTypeMetrics: [
      { type: 'Conference Room', count: 12, utilization: 78.5, revenue: 15600 },
      { type: 'Hot Desk', count: 45, utilization: 65.2, revenue: 8900 },
      { type: 'Focus Room', count: 8, utilization: 82.1, revenue: 3200 },
      { type: 'Phone Booth', count: 15, utilization: 71.8, revenue: 2250 },
      { type: 'Open Space', count: 6, utilization: 73.4, revenue: 4800 },
    ],
    hourlyUtilization: [
      { hour: 8, utilization: 35 },
      { hour: 9, utilization: 68 },
      { hour: 10, utilization: 85 },
      { hour: 11, utilization: 79 },
      { hour: 12, utilization: 45 },
      { hour: 13, utilization: 52 },
      { hour: 14, utilization: 82 },
      { hour: 15, utilization: 88 },
      { hour: 16, utilization: 76 },
      { hour: 17, utilization: 62 },
      { hour: 18, utilization: 28 },
    ],
  };

  const mockSpaceMetrics: SpaceMetrics[] = [
    {
      id: 'conf-a',
      name: 'Conference Room A',
      type: 'Conference Room',
      capacity: 12,
      totalBookings: 156,
      totalHours: 312,
      utilization: 89.2,
      revenue: 3900,
      avgRating: 4.6,
      issues: 2,
    },
    {
      id: 'conf-b',
      name: 'Conference Room B',
      type: 'Conference Room',
      capacity: 8,
      totalBookings: 98,
      totalHours: 196,
      utilization: 67.3,
      revenue: 2450,
      avgRating: 4.2,
      issues: 1,
    },
    {
      id: 'focus-1',
      name: 'Focus Room 1',
      type: 'Focus Room',
      capacity: 2,
      totalBookings: 76,
      totalHours: 152,
      utilization: 85.1,
      revenue: 760,
      avgRating: 4.8,
      issues: 0,
    },
    {
      id: 'open-1',
      name: 'Open Workspace 1',
      type: 'Open Space',
      capacity: 20,
      totalBookings: 142,
      totalHours: 568,
      utilization: 76.8,
      revenue: 1420,
      avgRating: 4.1,
      issues: 3,
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setSpaceMetrics(mockSpaceMetrics);
      setIsLoading(false);
    }, 1000);
  }, [selectedTimeRange, selectedBuilding]);

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setSpaceMetrics(mockSpaceMetrics);
      setIsLoading(false);
    }, 500);
  };

  const handleExportData = () => {
    const exportData = {
      analytics: analyticsData,
      metrics: spaceMetrics,
      timeRange: selectedTimeRange,
      building: selectedBuilding,
      exportDate: new Date().toISOString(),
    };
    onExportData?.(exportData);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  if (!analyticsData) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className={`space-analytics ${className || ''}`}>
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h2>Space Analytics</h2>
          <p>Insights and metrics for space utilization and performance</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`icon-sm ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="icon-sm" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="analytics-filters">
        <CardBody>
          <div className="filter-container">
            <div className="time-range-selector">
              <label htmlFor="time-range" className="sr-only">
                Select time range
              </label>
              <select
                id="time-range"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="filter-select"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="building-selector">
              <label htmlFor="building-select" className="sr-only">
                Select building
              </label>
              <select
                id="building-select"
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="filter-select"
              >
                <option value="">All Buildings</option>
                <option value="main">Main Building</option>
                <option value="north">North Wing</option>
                <option value="south">South Wing</option>
              </select>
            </div>

            <div className="view-mode-selector">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                <Eye className="icon-sm" />
                Overview
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('detailed')}
              >
                <BarChart3 className="icon-sm" />
                Detailed
              </Button>
              <Button
                variant={viewMode === 'trends' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('trends')}
              >
                <TrendingUp className="icon-sm" />
                Trends
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Key Metrics */}
      <div className="key-metrics-grid">
        <Card className="metric-card">
          <CardBody>
            <div className="metric-content">
              <div className="metric-info">
                <h3>Utilization Rate</h3>
                <div className="metric-value">
                  {formatPercentage(analyticsData.utilizationRate)}
                  <span className="metric-trend positive">
                    <TrendingUp className="icon-xs" />
                    +5.2%
                  </span>
                </div>
              </div>
              <div className="metric-icon utilization">
                <Activity className="icon-lg" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="metric-card">
          <CardBody>
            <div className="metric-content">
              <div className="metric-info">
                <h3>Total Bookings</h3>
                <div className="metric-value">
                  {analyticsData.totalBookings.toLocaleString()}
                  <span className="metric-trend positive">
                    <TrendingUp className="icon-xs" />
                    +12.8%
                  </span>
                </div>
              </div>
              <div className="metric-icon bookings">
                <Calendar className="icon-lg" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="metric-card">
          <CardBody>
            <div className="metric-content">
              <div className="metric-info">
                <h3>Avg Occupancy</h3>
                <div className="metric-value">
                  {analyticsData.averageOccupancy}
                  <span className="metric-trend negative">
                    <TrendingDown className="icon-xs" />
                    -2.1%
                  </span>
                </div>
              </div>
              <div className="metric-icon occupancy">
                <Users className="icon-lg" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="metric-card">
          <CardBody>
            <div className="metric-content">
              <div className="metric-info">
                <h3>Peak Hours</h3>
                <div className="metric-value">{analyticsData.peakHours.join(', ')}</div>
              </div>
              <div className="metric-icon peak-hours">
                <Clock className="icon-lg" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="overview-content">
          {/* Popular Spaces */}
          <Card className="popular-spaces">
            <CardHeader>
              <CardTitle>Most Popular Spaces</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-list">
                {analyticsData.popularSpaces.map((space, index) => (
                  <div key={space.id} className="space-item">
                    <div className="space-rank">#{index + 1}</div>
                    <div className="space-info">
                      <h4>{space.name}</h4>
                      <div className="space-stats">
                        <span>{space.bookings} bookings</span>
                        <span>{formatPercentage(space.utilization)} utilization</span>
                      </div>
                    </div>
                    <div className="utilization-bar">
                      <div
                        className={`utilization-fill utilization-bar-${Math.round(space.utilization / 10) * 10}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Space Type Metrics */}
          <Card className="space-type-metrics">
            <CardHeader>
              <CardTitle>Space Type Performance</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="type-metrics-grid">
                {analyticsData.spaceTypeMetrics.map((type) => (
                  <div key={type.type} className="type-metric">
                    <h4>{type.type}</h4>
                    <div className="type-stats">
                      <div className="stat">
                        <span className="stat-label">Count</span>
                        <span className="stat-value">{type.count}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Utilization</span>
                        <span className="stat-value">{formatPercentage(type.utilization)}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">{formatCurrency(type.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Detailed Mode */}
      {viewMode === 'detailed' && (
        <div className="detailed-content">
          <Card className="space-metrics-table">
            <CardHeader>
              <CardTitle>Detailed Space Metrics</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="table-container">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Space</th>
                      <th>Type</th>
                      <th>Capacity</th>
                      <th>Bookings</th>
                      <th>Hours</th>
                      <th>Utilization</th>
                      <th>Revenue</th>
                      <th>Rating</th>
                      <th>Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spaceMetrics.map((space) => (
                      <tr key={space.id}>
                        <td className="space-name">{space.name}</td>
                        <td>{space.type}</td>
                        <td>{space.capacity}</td>
                        <td>{space.totalBookings}</td>
                        <td>{space.totalHours}h</td>
                        <td>
                          <span
                            className={`utilization-badge ${space.utilization > 80 ? 'high' : space.utilization > 60 ? 'medium' : 'low'}`}
                          >
                            {formatPercentage(space.utilization)}
                          </span>
                        </td>
                        <td>{formatCurrency(space.revenue)}</td>
                        <td>
                          <div className="rating">★ {space.avgRating}</div>
                        </td>
                        <td>
                          {space.issues > 0 ? (
                            <span className="issues-badge">
                              <AlertTriangle className="icon-xs" />
                              {space.issues}
                            </span>
                          ) : (
                            <span className="no-issues">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Trends Mode */}
      {viewMode === 'trends' && (
        <div className="trends-content">
          {/* Occupancy Trends */}
          <Card className="occupancy-trends">
            <CardHeader>
              <CardTitle>Occupancy Trends</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="trend-chart">
                {analyticsData.occupancyTrends.map((trend, index) => (
                  <div key={trend.date} className="trend-bar">
                    <div
                      className={`occupancy-bar occupancy-bar-${Math.round(trend.occupancy / 10) * 10}`}
                      title={`${trend.date}: ${trend.occupancy}% occupancy`}
                    ></div>
                    <span className="trend-label">
                      {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Hourly Utilization */}
          <Card className="hourly-utilization">
            <CardHeader>
              <CardTitle>Hourly Utilization Pattern</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="hourly-chart">
                {analyticsData.hourlyUtilization.map((hour) => (
                  <div key={hour.hour} className="hour-bar">
                    <div
                      className={`hour-utilization occupancy-bar-${Math.round(hour.utilization / 10) * 10}`}
                      title={`${hour.hour}:00 - ${formatPercentage(hour.utilization)} utilization`}
                    ></div>
                    <span className="hour-label">{hour.hour}:00</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
