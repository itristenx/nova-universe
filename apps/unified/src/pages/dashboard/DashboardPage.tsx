import { useAuthStore } from '@stores/auth'
import { DashboardStats } from '@components/dashboard/DashboardStats'
import { QuickActions } from '@components/dashboard/QuickActions'
import { RecentActivity } from '@components/dashboard/RecentActivity'
import { TicketOverview } from '@components/dashboard/TicketOverview'
import { AssetOverview } from '@components/dashboard/AssetOverview'
import { SpaceOverview } from '@components/dashboard/SpaceOverview'
import { getUserDisplayName } from '@utils/index'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const isAdmin = user?.roles?.some(role => role.name === 'admin')

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-nova-600 to-nova-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {user ? getUserDisplayName(user) : 'User'}!
        </h1>
        <p className="mt-1 opacity-90">
          Welcome to your Nova Universe dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Stats overview */}
      <DashboardStats />

      {/* Quick actions */}
      <QuickActions />

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Ticket overview */}
        <div className="xl:col-span-2">
          <TicketOverview />
        </div>

        {/* Recent activity */}
        <div>
          <RecentActivity />
        </div>

        {/* Asset overview */}
        <div>
          <AssetOverview />
        </div>

        {/* Space overview */}
        <div>
          <SpaceOverview />
        </div>

        {/* Additional widgets based on role */}
        {isAdmin && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Background Jobs</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  2 Pending
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}