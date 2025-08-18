import React, { useEffect, useState } from 'react'
import { useReportsStore } from '@stores/reports'
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CpuChipIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TicketIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import type { MetricData } from '@services/reports'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

const ReportsPage: React.FC = () => {
  const {
    filters,
    selectedReport,
    isLoading,
    isExporting,
    overviewMetrics,
    ticketMetrics,
    assetMetrics,
    userMetrics,
    spaceMetrics,
    ticketTrends,
    assetReportData,
    userReportData,
    spaceReportData,
    error,
    setFilters,
    setSelectedReport,
    loadOverviewData,
    loadTicketData,
    loadAssetData,
    loadUserData,
    loadSpaceData,
    exportReport,
    loadAllReportData
  } = useReportsStore()

  const [chartType, setChartType] = useState<'line' | 'bar' | 'doughnut'>('line')

  // Load initial data
  useEffect(() => {
    loadOverviewData()
  }, [loadOverviewData])

  // Load data when report type changes
  useEffect(() => {
    switch (selectedReport) {
      case 'overview':
        loadOverviewData()
        break
      case 'tickets':
        loadTicketData()
        break
      case 'assets':
        loadAssetData()
        break
      case 'users':
        loadUserData()
        break
      case 'spaces':
        loadSpaceData()
        break
    }
  }, [selectedReport, filters, loadOverviewData, loadTicketData, loadAssetData, loadUserData, loadSpaceData])

  const handlePeriodChange = (period: '24h' | '7d' | '30d' | '90d' | '1y') => {
    setFilters({ period })
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportReport(format)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleRefresh = () => {
    loadAllReportData()
  }

  const renderMetricCard = (metric: MetricData, IconComponent: any) => {
    const isPositiveChange = metric.change >= 0
    const changeIcon = isPositiveChange ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
    const changeColor = metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <IconComponent className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${changeColor}`}>
            {React.createElement(changeIcon, { className: 'h-4 w-4' })}
            <span className="text-sm font-medium">{Math.abs(metric.change)}%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{metric.period}</p>
      </div>
    )
  }

  const renderOverviewMetrics = () => {
    if (!overviewMetrics) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderMetricCard(overviewMetrics.totalTickets, TicketIcon)}
        {renderMetricCard(overviewMetrics.activeAssets, CpuChipIcon)}
        {renderMetricCard(overviewMetrics.activeUsers, UserGroupIcon)}
        {renderMetricCard(overviewMetrics.resolutionRate, CheckCircleIcon)}
        {renderMetricCard(overviewMetrics.assetValue, ChartBarIcon)}
        {renderMetricCard(overviewMetrics.spaceUtilization, BuildingOfficeIcon)}
      </div>
    )
  }

  const renderTicketMetrics = () => {
    if (!ticketMetrics) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderMetricCard(ticketMetrics.totalTickets, TicketIcon)}
          {renderMetricCard(ticketMetrics.openTickets, ExclamationTriangleIcon)}
          {renderMetricCard(ticketMetrics.resolvedTickets, CheckCircleIcon)}
          {renderMetricCard(ticketMetrics.avgResolutionTime, ClockIcon)}
          {renderMetricCard(ticketMetrics.escalatedTickets, ArrowTrendingUpIcon)}
          {renderMetricCard(ticketMetrics.customerSatisfaction, ChartBarIcon)}
        </div>
        
        {ticketTrends && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Ticket Trends</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded text-sm ${chartType === 'line' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded text-sm ${chartType === 'bar' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Bar
                </button>
              </div>
            </div>
            <div className="h-80">
              {chartType === 'line' ? (
                <Line
                  data={ticketTrends.newTickets}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Bar
                  data={ticketTrends.newTickets}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderAssetMetrics = () => {
    if (!assetMetrics) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderMetricCard(assetMetrics.totalAssets, CpuChipIcon)}
          {renderMetricCard(assetMetrics.totalValue, ChartBarIcon)}
          {renderMetricCard(assetMetrics.avgAge, CalendarIcon)}
          {renderMetricCard(assetMetrics.utilizationRate, ArrowTrendingUpIcon)}
          {renderMetricCard(assetMetrics.maintenanceCosts, ArrowTrendingDownIcon)}
          {renderMetricCard(assetMetrics.activeAssets, CheckCircleIcon)}
        </div>

        {assetReportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution</h3>
              <div className="h-64">
                <Doughnut
                  data={assetReportData.byCategory}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Value Trends</h3>
              <div className="h-64">
                <Line
                  data={assetReportData.valueOverTime}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value: string | number) => `$${value}k`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderUserMetrics = () => {
    if (!userMetrics) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderMetricCard(userMetrics.totalUsers, UserGroupIcon)}
          {renderMetricCard(userMetrics.activeUsers, ArrowTrendingUpIcon)}
          {renderMetricCard(userMetrics.newUsers, ChartBarIcon)}
          {renderMetricCard(userMetrics.avgSessionTime, CheckCircleIcon)}
          {renderMetricCard(userMetrics.ticketsPerUser, TicketIcon)}
          {renderMetricCard(userMetrics.loginFrequency, ClockIcon)}
        </div>

        {userReportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
              <div className="h-64">
                <Bar
                  data={userReportData.activityLevels}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
              <div className="h-64">
                <Doughnut
                  data={userReportData.departmentBreakdown}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSpaceMetrics = () => {
    if (!spaceMetrics) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderMetricCard(spaceMetrics.totalSpaces, BuildingOfficeIcon)}
          {renderMetricCard(spaceMetrics.occupiedSpaces, ArrowTrendingUpIcon)}
          {renderMetricCard(spaceMetrics.utilizationRate, CalendarIcon)}
          {renderMetricCard(spaceMetrics.avgOccupancy, ChartBarIcon)}
          {renderMetricCard(spaceMetrics.energyCosts, ExclamationTriangleIcon)}
          {renderMetricCard(spaceMetrics.maintenanceRequests, CheckCircleIcon)}
        </div>

        {spaceReportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Space Utilization</h3>
              <div className="h-64">
                <Line
                  data={spaceReportData.utilizationTrends}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: (value: string | number) => `${value}%`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Space Types</h3>
              <div className="h-64">
                <Doughnut
                  data={spaceReportData.occupancyRates}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCurrentReport = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewMetrics()
      case 'tickets':
        return renderTicketMetrics()
      case 'assets':
        return renderAssetMetrics()
      case 'users':
        return renderUserMetrics()
      case 'spaces':
        return renderSpaceMetrics()
      default:
        return null
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Comprehensive insights into your ITSM operations
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="period-select" className="text-sm font-medium text-gray-700">Period:</label>
                  <select
                    id="period-select"
                    value={filters.period}
                    onChange={(e) => handlePeriodChange(e.target.value as any)}
                    className="rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Excel
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Type Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Report types">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'tickets', label: 'Tickets', icon: TicketIcon },
              { key: 'assets', label: 'Assets', icon: CpuChipIcon },
              { key: 'users', label: 'Users', icon: UserGroupIcon },
              { key: 'spaces', label: 'Spaces', icon: BuildingOfficeIcon },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedReport(key as any)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedReport === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`mr-2 h-5 w-5 ${
                    selectedReport === key
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Report Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-lg text-gray-600">Loading {selectedReport} report...</span>
          </div>
        ) : (
          renderCurrentReport()
        )}
        
        {/* No Data State */}
        {!isLoading && !renderCurrentReport() && (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
            <p className="mt-1 text-sm text-gray-500">
              There is no data available for the selected report and time period.
            </p>
            <div className="mt-6">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                Refresh Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
