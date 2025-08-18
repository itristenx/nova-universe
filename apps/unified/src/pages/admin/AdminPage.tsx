import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  ServerIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  TicketIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { useReportsStore } from '@stores/reports'
import { useUserStore } from '@stores/users'

interface QuickStat {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: any
  color: string
}

export default function AdminPage() {
  const { overviewMetrics, loadOverviewData, isLoading } = useReportsStore()
  const { getUserStats } = useUserStore()
  const [systemHealth] = useState<'healthy' | 'warning' | 'error'>('healthy')

  useEffect(() => {
    loadOverviewData()
    getUserStats()
  }, [loadOverviewData, getUserStats])

  const quickStats: QuickStat[] = [
    {
      title: 'Total Users',
      value: overviewMetrics?.activeUsers?.value || '0',
      change: overviewMetrics?.activeUsers?.change || 0,
      trend: overviewMetrics?.activeUsers?.trend || 'neutral',
      icon: UserGroupIcon,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Active Tickets',
      value: overviewMetrics?.totalTickets?.value || '0',
      change: overviewMetrics?.totalTickets?.change || 0,
      trend: overviewMetrics?.totalTickets?.trend || 'neutral',
      icon: TicketIcon,
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      title: 'Assets',
      value: overviewMetrics?.activeAssets?.value || '0',
      change: overviewMetrics?.activeAssets?.change || 0,
      trend: overviewMetrics?.activeAssets?.trend || 'neutral',
      icon: CpuChipIcon,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Space Utilization',
      value: overviewMetrics?.spaceUtilization?.value || '0%',
      change: overviewMetrics?.spaceUtilization?.change || 0,
      trend: overviewMetrics?.spaceUtilization?.trend || 'neutral',
      icon: BuildingOfficeIcon,
      color: 'bg-purple-50 text-purple-600'
    }
  ]

  const adminTasks = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: UserGroupIcon,
      link: '/admin/users',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: CogIcon,
      link: '/admin/settings',
      color: 'bg-gray-50 text-gray-600'
    },
    {
      title: 'Reports & Analytics',
      description: 'View system reports and analytics',
      icon: ChartBarIcon,
      link: '/admin/reports',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Detailed analytics and performance metrics',
      icon: ChartBarIcon,
      link: '/admin/analytics',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Site Asset Management',
      description: 'Manage site assets and configurations',
      icon: ServerIcon,
      link: '/admin/assets',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Kiosk Management',
      description: 'Manage kiosks and status indicators',
      icon: ComputerDesktopIcon,
      link: '/admin/kiosks',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'SCIM Provisioning',
      description: 'Monitor SCIM user and group synchronization',
      icon: UserGroupIcon,
      link: '/admin/scim',
      color: 'bg-cyan-50 text-cyan-600'
    },
    {
      title: 'API Documentation',
      description: 'Explore API endpoints and manage API keys',
      icon: ServerIcon,
      link: '/admin/api-docs',
      color: 'bg-orange-50 text-orange-600'
    }
  ]

  const recentActivities = [
    {
      type: 'user',
      message: 'New user registration',
      time: '2 minutes ago',
      icon: UserGroupIcon,
      status: 'success'
    },
    {
      type: 'system',
      message: 'System backup completed',
      time: '15 minutes ago',
      icon: CheckCircleIcon,
      status: 'success'
    },
    {
      type: 'alert',
      message: 'High ticket volume detected',
      time: '1 hour ago',
      icon: ExclamationTriangleIcon,
      status: 'warning'
    },
    {
      type: 'maintenance',
      message: 'Scheduled maintenance reminder',
      time: '2 hours ago',
      icon: ClockIcon,
      status: 'info'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSystemHealthColor = () => {
    switch (systemHealth) {
      case 'healthy':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your Nova Universe platform
          </p>
        </div>

        {/* System Health Status */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getSystemHealthColor()}`}>
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
                  <p className="text-sm text-gray-600">
                    All systems are operating normally
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSystemHealthColor()}`}>
                {systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon
                const changeIcon = stat.trend === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
                const changeColor = stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                
                return (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className={`flex items-center space-x-1 ${changeColor}`}>
                        {React.createElement(changeIcon, { className: 'h-4 w-4' })}
                        <span className="text-sm font-medium">{Math.abs(stat.change)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Tasks */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminTasks.map((task, index) => {
                const Icon = task.icon
                return (
                  <Link
                    key={index}
                    to={task.link}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${task.color} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-lg ${getStatusColor(activity.status)} bg-opacity-10`}>
                        <Icon className={`h-4 w-4 ${getStatusColor(activity.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="px-6 py-3 border-t border-gray-200">
                <Link
                  to="/admin/activity"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1.2ms</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">v2.1.0</div>
                <div className="text-sm text-gray-600">Current Version</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
