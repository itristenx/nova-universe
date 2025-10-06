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
  // Analytics data should be loaded via spaces service
  const mockAnalyticsData: AnalyticsData = {
    totalBookings: 0,
    occupancyRate: 0,
    peakUtilization: 0,
    avgBookingDuration: 0,
    totalRevenue: 0,
    topSpaces: [],
    utilizationTrend: [],
  };

  const mockSpaceMetrics: SpaceMetrics[] = [];
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
            <div className="filter-header">
              <Filter className="icon-sm text-gray-500" />
              <span className="filter-title">Analytics Filters</span>
            </div>
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
              <div className="building-selector-header">
                <Building className="icon-sm text-gray-500" />
                <label htmlFor="building-select" className="building-label">
                  Building
                </label>
              </div>
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
                      <div className="space-name-with-location">
                        <MapPin className="icon-xs text-gray-500" />
                        <h4>{space.name}</h4>
                      </div>
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
              <div className="card-header-with-icon">
                <PieChart className="icon-sm text-blue-600" />
                <CardTitle>Space Type Performance</CardTitle>
              </div>
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
                  <div 
                    key={trend.date} 
                    className="trend-bar"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
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
