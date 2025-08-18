import { useState, useEffect } from 'react'

// Simple icon components to avoid React 19 compatibility issues
const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
)

const ComputerDesktopIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
  </svg>
)

const ArrowTrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
)

const DocumentChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
)

// Mock chart components for visualization
const SimpleLineChart = ({ data, height = 200 }: { data: any[], height?: number }) => (
  <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center`} style={{ height }}>
    <div className="text-center">
      <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Line Chart</p>
      <p className="text-xs text-gray-400">{data.length} data points</p>
    </div>
  </div>
)

const SimpleBarChart = ({ data, height = 200 }: { data: any[], height?: number }) => (
  <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center`} style={{ height }}>
    <div className="text-center">
      <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Bar Chart</p>
      <p className="text-xs text-gray-400">{data.length} data points</p>
    </div>
  </div>
)

const SimplePieChart = ({ data, height = 200 }: { data: any[], height?: number }) => (
  <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center`} style={{ height }}>
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-gray-400 mx-auto mb-2"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Pie Chart</p>
      <p className="text-xs text-gray-400">{data.length} segments</p>
    </div>
  </div>
)

interface AnalyticsData {
  ticketTrends: Array<{
    date: string
    created: number
    resolved: number
    pending: number
  }>
  kioskMetrics: Array<{
    kioskId: string
    name: string
    totalSubmissions: number
    avgResponseTime: number
    satisfaction: number
  }>
  userActivityMetrics: Array<{
    date: string
    activeUsers: number
    newUsers: number
    returning: number
  }>
  topCategories: Array<{
    category: string
    count: number
    percentage: number
  }>
  resolutionTimes: Array<{
    priority: string
    avgTime: number
    target: number
  }>
  departmentStats: Array<{
    department: string
    totalTickets: number
    resolved: number
    pending: number
    avgResolutionTime: number
  }>
  performanceMetrics: {
    averageResolutionTime: number
    firstResponseTime: number
    customerSatisfaction: number
    slaCompliance: number
    backlogSize: number
    agentUtilization: number
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'kiosks' | 'users'>('overview')

  // Toast utility function
  const toast = {
    success: (message: string) => console.log('Success:', message),
    error: (message: string) => console.error('Error:', message)
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedTimeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await api.getAnalyticsData(selectedTimeRange)
      const mockData: AnalyticsData = {
        ticketTrends: [
          { date: '2024-01-01', created: 45, resolved: 38, pending: 7 },
          { date: '2024-01-02', created: 52, resolved: 47, pending: 12 },
          { date: '2024-01-03', created: 38, resolved: 43, pending: 7 },
          { date: '2024-01-04', created: 61, resolved: 55, pending: 13 },
          { date: '2024-01-05', created: 49, resolved: 51, pending: 11 }
        ],
        kioskMetrics: [
          { kioskId: 'kiosk-001', name: 'Main Lobby', totalSubmissions: 234, avgResponseTime: 2.3, satisfaction: 4.2 },
          { kioskId: 'kiosk-002', name: 'IT Floor', totalSubmissions: 187, avgResponseTime: 1.8, satisfaction: 4.5 },
          { kioskId: 'kiosk-003', name: 'Break Room', totalSubmissions: 156, avgResponseTime: 2.1, satisfaction: 4.1 }
        ],
        userActivityMetrics: [
          { date: '2024-01-01', activeUsers: 127, newUsers: 8, returning: 119 },
          { date: '2024-01-02', activeUsers: 142, newUsers: 12, returning: 130 },
          { date: '2024-01-03', activeUsers: 135, newUsers: 6, returning: 129 }
        ],
        topCategories: [
          { category: 'Hardware Issues', count: 89, percentage: 32.1 },
          { category: 'Software Support', count: 76, percentage: 27.4 },
          { category: 'Account Access', count: 54, percentage: 19.5 },
          { category: 'Network Issues', count: 33, percentage: 11.9 },
          { category: 'Other', count: 25, percentage: 9.0 }
        ],
        resolutionTimes: [
          { priority: 'Critical', avgTime: 0.8, target: 1.0 },
          { priority: 'High', avgTime: 2.3, target: 4.0 },
          { priority: 'Medium', avgTime: 8.5, target: 24.0 },
          { priority: 'Low', avgTime: 72.2, target: 120.0 }
        ],
        departmentStats: [
          { department: 'IT Support', totalTickets: 156, resolved: 142, pending: 14, avgResolutionTime: 4.2 },
          { department: 'HR', totalTickets: 78, resolved: 71, pending: 7, avgResolutionTime: 12.5 },
          { department: 'Facilities', totalTickets: 43, resolved: 38, pending: 5, avgResolutionTime: 8.7 }
        ],
        performanceMetrics: {
          averageResolutionTime: 8.4,
          firstResponseTime: 0.7,
          customerSatisfaction: 4.3,
          slaCompliance: 94.2,
          backlogSize: 26,
          agentUtilization: 78.5
        }
      }
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${(hours * 60).toFixed(0)}m`
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`
    } else {
      return `${(hours / 24).toFixed(1)}d`
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'tickets', label: 'Tickets', icon: DocumentChartBarIcon },
    { id: 'kiosks', label: 'Kiosks', icon: ComputerDesktopIcon },
    { id: 'users', label: 'Users', icon: UserIcon }
  ]

  const timeRanges = [
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
    { id: '1y', label: 'Last year' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Analytics & Reports
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              System performance and usage analytics
            </p>
          </div>
        </div>
        
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading analytics data...
          </p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Analytics & Reports
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              System performance and usage analytics
            </p>
          </div>
        </div>
        
        <div className="card p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No analytics data available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics & Reports
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Comprehensive system performance and usage analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            aria-label="Select time range"
          >
            {timeRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadAnalyticsData}
            disabled={loading}
            className="btn btn-secondary"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Performance Metrics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Key Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="card bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Avg Resolution Time
                          </p>
                          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {formatTime(analyticsData.performanceMetrics.averageResolutionTime)}
                          </p>
                        </div>
                        <ClockIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="card bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            Customer Satisfaction
                          </p>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {analyticsData.performanceMetrics.customerSatisfaction.toFixed(1)}/5.0
                          </p>
                        </div>
                        <ArrowTrendingUpIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="card bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            SLA Compliance
                          </p>
                          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {formatPercentage(analyticsData.performanceMetrics.slaCompliance)}
                          </p>
                        </div>
                        <DocumentChartBarIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Trends Chart */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Ticket Trends
                </h3>
                <div className="card">
                  <div className="p-6">
                    <SimpleLineChart data={analyticsData.ticketTrends} height={300} />
                  </div>
                </div>
              </div>

              {/* Department Performance */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Department Performance
                </h3>
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total Tickets
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Resolved
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Pending
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Avg Resolution Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {analyticsData.departmentStats.map((dept) => (
                          <tr key={dept.department}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {dept.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatNumber(dept.totalTickets)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatNumber(dept.resolved)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatNumber(dept.pending)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatTime(dept.avgResolutionTime)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-8">
              {/* Ticket Categories */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Top Ticket Categories
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <div className="p-6">
                      <SimplePieChart data={analyticsData.topCategories} />
                    </div>
                  </div>
                  <div className="card">
                    <div className="p-6">
                      <div className="space-y-4">
                        {analyticsData.topCategories.map((category, index) => (
                          <div key={category.category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? 'bg-blue-500' :
                                index === 1 ? 'bg-green-500' :
                                index === 2 ? 'bg-yellow-500' :
                                index === 3 ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`} />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {category.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatNumber(category.count)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatPercentage(category.percentage)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Times by Priority */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Resolution Times by Priority
                </h3>
                <div className="card">
                  <div className="p-6">
                    <SimpleBarChart data={analyticsData.resolutionTimes} height={250} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kiosks' && (
            <div className="space-y-8">
              {/* Kiosk Performance Metrics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Kiosk Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyticsData.kioskMetrics.map((kiosk) => (
                    <div key={kiosk.kioskId} className="card">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {kiosk.name}
                          </h4>
                          <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Total Submissions
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatNumber(kiosk.totalSubmissions)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Avg Response Time
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatTime(kiosk.avgResponseTime)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Satisfaction
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {kiosk.satisfaction.toFixed(1)}/5.0
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8">
              {/* User Activity Trends */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  User Activity Trends
                </h3>
                <div className="card">
                  <div className="p-6">
                    <SimpleLineChart data={analyticsData.userActivityMetrics} height={300} />
                  </div>
                </div>
              </div>

              {/* User Statistics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  User Statistics Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card">
                    <div className="p-6 text-center">
                      <UserIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {formatNumber(analyticsData.userActivityMetrics.reduce((sum, day) => sum + day.activeUsers, 0))}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Active Users
                      </p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="p-6 text-center">
                      <UserIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {formatNumber(analyticsData.userActivityMetrics.reduce((sum, day) => sum + day.newUsers, 0))}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        New Users
                      </p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="p-6 text-center">
                      <UserIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {formatNumber(analyticsData.userActivityMetrics.reduce((sum, day) => sum + day.returning, 0))}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Returning Users
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
