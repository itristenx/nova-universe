import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCulturalFormatting } from '../../utils/culturalFormatting'
import {
  UsersIcon,
  TicketIcon,
  ServerStackIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'

interface DashboardStats {
  totalUsers: number
  activeTickets: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  serverUptime: string
  recentAlerts: number
  completedTasks: number
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const formatting = useCulturalFormatting()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeTickets: 23,
        systemHealth: 'healthy',
        serverUptime: '99.9%',
        recentAlerts: 3,
        completedTasks: 156
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.title')}
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('admin.dashboard.lastUpdated')}: {formatting.formatTime(new Date())}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.metrics.totalUsers')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatting.formatNumber(stats?.totalUsers || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TicketIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.metrics.activeTickets')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatting.formatNumber(stats?.activeTickets || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ServerStackIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.metrics.serverUptime')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.serverUptime}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.metrics.completedTasks')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatting.formatNumber(stats?.completedTasks || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Overall Status
              </span>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-600">
                  Healthy
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Database
              </span>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-600">
                  Connected
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                API Services
              </span>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-600">
                  Running
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Background Jobs
              </span>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-yellow-600">
                  Processing
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Alerts
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  High CPU usage detected
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Server load at 85% - 2 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Database backup completed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Weekly backup successful - 1 hour ago
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  User registration spike
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  50 new users in the last hour - 3 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <UsersIcon className="h-5 w-5 mr-2" />
            Manage Users
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
            <TicketIcon className="h-5 w-5 mr-2" />
            View Tickets
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <ServerStackIcon className="h-5 w-5 mr-2" />
            System Status
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Reports
          </button>
        </div>
      </div>
    </div>
  )
}
