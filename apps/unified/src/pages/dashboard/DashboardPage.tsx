import { useAuthStore } from '@stores/auth'
import { DashboardStats } from '@components/dashboard/DashboardStats'
import { QuickActions } from '@components/dashboard/QuickActions'
import { RecentActivity } from '@components/dashboard/RecentActivity'
import { TicketOverview } from '@components/dashboard/TicketOverview'
import { AssetOverview } from '@components/dashboard/AssetOverview'
import { SpaceOverview } from '@components/dashboard/SpaceOverview'
import { getUserDisplayName } from '@utils/index'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  CheckCircleIcon,
  ServerIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { t } = useTranslation('dashboard')
  const [systemMetrics, setSystemMetrics] = useState({
    apiStatus: 'healthy',
    dbConnections: 45,
    activeUsers: 128,
    systemLoad: 23,
    uptime: '99.9%'
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('greeting.morning')
    if (hour < 18) return t('greeting.afternoon')
    return t('greeting.evening')
  }

  const getUserRole = () => {
    if (!user?.roles) return 'user'
    if (user.roles.some(role => role.name === 'admin')) return 'admin'
    if (user.roles.some(role => role.name === 'agent')) return 'agent'
    return 'user'
  }

  const userRole = getUserRole()
  const isAdmin = userRole === 'admin'
  const isAgent = userRole === 'agent'
  const isUser = userRole === 'user'

  // Simulate real-time system metrics updates
  useEffect(() => {
    if (!isAdmin) return

    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        dbConnections: Math.floor(Math.random() * 20) + 40,
        activeUsers: Math.floor(Math.random() * 50) + 100,
        systemLoad: Math.floor(Math.random() * 30) + 15
      }))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAdmin])

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Welcome Section with Role-Specific Information */}
      <div className="bg-gradient-to-r from-nova-600 to-nova-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {user ? getUserDisplayName(user) : 'User'}!
            </h1>
            <p className="mt-2 text-nova-100">
              {isAdmin && t('welcomeMessage.admin')}
              {isAgent && t('welcomeMessage.agent')}
              {isUser && t('welcomeMessage.user')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-nova-200">{t('role')}</div>
            <div className="text-lg font-semibold capitalize">{userRole}</div>
          </div>
        </div>
      </div>

      {/* Role-Specific Stats Overview */}
      <DashboardStats />

      {/* Quick Actions - Role Adaptive */}
      <QuickActions />

      {/* Main Dashboard Grid - Adaptive Layout */}
      <div className="grid gap-6">
        {/* Admin View - Full System Management */}
        {isAdmin && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* System Health Cards */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ServerIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {t('systemMetrics.apiStatus')}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {systemMetrics.uptime}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span className="ml-1">{t('systemMetrics.healthy')}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {t('systemMetrics.activeUsers')}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {systemMetrics.activeUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CpuChipIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {t('systemMetrics.systemLoad')}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {systemMetrics.systemLoad}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {t('systemMetrics.dbConnections')}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {systemMetrics.dbConnections}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TicketOverview />
              </div>
              <div>
                <AssetOverview />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpaceOverview />
              <RecentActivity />
            </div>
          </>
        )}

        {/* Agent View - Focused on Ticket Management */}
        {isAgent && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <TicketOverview />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity />
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('agentPerformance.title')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('agentPerformance.resolvedToday')}</span>
                    <span className="text-lg font-semibold text-green-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('agentPerformance.avgResponseTime')}</span>
                    <span className="text-lg font-semibold text-blue-600">2.3h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('agentPerformance.customerRating')}</span>
                    <span className="text-lg font-semibold text-yellow-600">4.8/5</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* User View - Self-Service Focus */}
        {isUser && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('userSections.myRecentTickets')}
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((ticket) => (
                    <div key={ticket} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">REQ{String(ticket).padStart(6, '0')}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{t('userSections.sampleTicketTitle')}</div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {t('status.inProgress')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('userSections.quickSubmit')}
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-nova-50 dark:bg-nova-900 rounded-lg hover:bg-nova-100 dark:hover:bg-nova-800 transition-colors">
                    <div className="font-medium text-nova-900 dark:text-nova-100">{t('userSections.hardwareRequest')}</div>
                    <div className="text-sm text-nova-700 dark:text-nova-300">{t('userSections.hardwareRequestDesc')}</div>
                  </button>
                  <button className="w-full text-left p-3 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
                    <div className="font-medium text-green-900 dark:text-green-100">{t('userSections.softwareAccess')}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">{t('userSections.softwareAccessDesc')}</div>
                  </button>
                  <button className="w-full text-left p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors">
                    <div className="font-medium text-yellow-900 dark:text-yellow-100">{t('userSections.reportIssue')}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">{t('userSections.reportIssueDesc')}</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AssetOverview />
              <SpaceOverview />
            </div>
          </>
        )}
      </div>
    </div>
  )
}