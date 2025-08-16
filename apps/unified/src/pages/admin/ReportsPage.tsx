import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  TicketIcon,
  CubeIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn, formatNumber, formatCurrency, formatPercentage } from '@utils/index'
import toast from 'react-hot-toast'

interface MetricCard {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<any>
  color: string
}

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }>
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedReport, setSelectedReport] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [chartData, setChartData] = useState<Record<string, ChartData>>({})

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'tickets', name: 'Tickets', icon: TicketIcon },
    { id: 'assets', name: 'Assets', icon: CubeIcon },
    { id: 'users', name: 'Users', icon: UserGroupIcon },
    { id: 'spaces', name: 'Spaces', icon: BuildingOfficeIcon },
  ]

  const timePeriods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
  ]

  useEffect(() => {
    loadReportData()
  }, [selectedPeriod, selectedReport])

  const loadReportData = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data based on selected report and period
      const mockMetrics: MetricCard[] = [
        {
          title: 'Total Tickets',
          value: formatNumber(1247),
          change: 12.5,
          trend: 'up',
          icon: TicketIcon,
          color: 'text-blue-600'
        },
        {
          title: 'Active Assets',
          value: formatNumber(3892),
          change: -2.1,
          trend: 'down',
          icon: CubeIcon,
          color: 'text-green-600'
        },
        {
          title: 'Active Users',
          value: formatNumber(156),
          change: 8.3,
          trend: 'up',
          icon: UserGroupIcon,
          color: 'text-purple-600'
        },
        {
          title: 'Resolution Rate',
          value: formatPercentage(94.2),
          change: 3.7,
          trend: 'up',
          icon: ClockIcon,
          color: 'text-emerald-600'
        },
        {
          title: 'Asset Value',
          value: formatCurrency(2847593),
          change: 15.8,
          trend: 'up',
          icon: ArrowTrendingUpIcon,
          color: 'text-yellow-600'
        },
        {
          title: 'Space Utilization',
          value: formatPercentage(78.4),
          change: -1.2,
          trend: 'down',
          icon: BuildingOfficeIcon,
          color: 'text-indigo-600'
        },
      ]

      const mockChartData = {
        ticketTrends: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'New Tickets',
              data: [23, 45, 56, 78, 32, 67, 43],
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: 'rgb(59, 130, 246)',
            },
            {
              label: 'Resolved Tickets',
              data: [18, 42, 51, 73, 28, 61, 39],
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'rgb(34, 197, 94)',
            },
          ],
        },
        assetsByCategory: {
          labels: ['Hardware', 'Software', 'Furniture', 'Vehicles', 'Other'],
          datasets: [
            {
              label: 'Assets',
              data: [1245, 678, 432, 156, 89],
              backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(245, 158, 11, 0.8)',
              ],
            },
          ],
        },
      }

      setMetrics(mockMetrics)
      setChartData(mockChartData)
    } catch (error) {
      toast.error('Failed to load report data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setIsLoading(true)
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setIsLoading(false)
    }
  }

  const renderMetricCard = (metric: MetricCard) => (
    <div key={metric.title} className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {metric.title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {metric.value}
          </p>
        </div>
        <div className={cn('rounded-full p-3', 
          metric.color === 'text-blue-600' && 'bg-blue-100 dark:bg-blue-900/20',
          metric.color === 'text-green-600' && 'bg-green-100 dark:bg-green-900/20',
          metric.color === 'text-purple-600' && 'bg-purple-100 dark:bg-purple-900/20',
          metric.color === 'text-emerald-600' && 'bg-emerald-100 dark:bg-emerald-900/20',
          metric.color === 'text-yellow-600' && 'bg-yellow-100 dark:bg-yellow-900/20',
          metric.color === 'text-indigo-600' && 'bg-indigo-100 dark:bg-indigo-900/20'
        )}>
          <metric.icon className={cn('h-6 w-6', metric.color)} />
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <div className={cn(
          'flex items-center text-sm',
          metric.trend === 'up' ? 'text-green-600' : 
          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
        )}>
          {metric.trend === 'up' ? (
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
          ) : metric.trend === 'down' ? (
            <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
          ) : null}
          <span>{Math.abs(metric.change)}%</span>
        </div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          vs previous period
        </span>
      </div>
    </div>
  )

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(renderMetricCard)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Ticket Trends
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Chart placeholder - Line chart showing ticket trends</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Assets by Category
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Chart placeholder - Pie chart showing asset distribution</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { type: 'ticket', message: 'New ticket #1247 created by John Doe', time: '2 minutes ago' },
            { type: 'asset', message: 'Asset LAP-001 assigned to Jane Smith', time: '5 minutes ago' },
            { type: 'user', message: 'New user Bob Johnson registered', time: '10 minutes ago' },
            { type: 'space', message: 'Conference Room A booked for 2:00 PM', time: '15 minutes ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-nova-500"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSpecificReport = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {reportTypes.find(r => r.id === selectedReport)?.name} Report
        </h3>
        <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Detailed {selectedReport} analytics and visualizations will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Comprehensive insights and analytics across all Nova modules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input"
          >
            {timePeriods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleExport(e.target.value as 'pdf' | 'excel' | 'csv')
                  e.target.value = ''
                }
              }}
              className="btn btn-secondary"
              defaultValue=""
            >
              <option value="" disabled>Export</option>
              <option value="pdf">Export as PDF</option>
              <option value="excel">Export as Excel</option>
              <option value="csv">Export as CSV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {reportTypes.map(report => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedReport === report.id
                  ? 'bg-nova-100 text-nova-700 dark:bg-nova-900 dark:text-nova-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              <report.icon className="h-4 w-4" />
              {report.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading report data..." />
        </div>
      ) : selectedReport === 'overview' ? (
        renderOverviewReport()
      ) : (
        renderSpecificReport()
      )}

      {/* Quick Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Top Performing Agents
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Alice Johnson', tickets: 47, rating: 4.9 },
              { name: 'Bob Wilson', tickets: 42, rating: 4.8 },
              { name: 'Carol Davis', tickets: 38, rating: 4.7 },
            ].map((agent, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {agent.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {agent.tickets} tickets resolved
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ⭐ {agent.rating}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            System Health
          </h3>
          <div className="space-y-3">
            {[
              { name: 'API Response Time', value: '120ms', status: 'good' },
              { name: 'Database Performance', value: '98%', status: 'good' },
              { name: 'Storage Usage', value: '67%', status: 'warning' },
              { name: 'Active Sessions', value: '234', status: 'good' },
            ].map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">{metric.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {metric.value}
                  </span>
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    metric.status === 'good' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  )}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Upcoming Maintenance
          </h3>
          <div className="space-y-3">
            {[
              { asset: 'Server Room AC', date: 'Tomorrow', priority: 'high' },
              { asset: 'Printer - Floor 2', date: 'Dec 15', priority: 'medium' },
              { asset: 'Elevator B', date: 'Dec 20', priority: 'low' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.asset}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.date}
                  </p>
                </div>
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                  item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                )}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
