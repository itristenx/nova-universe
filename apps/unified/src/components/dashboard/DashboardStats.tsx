import { TicketIcon, CubeIcon, MapIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const stats = [
  { name: 'Open Tickets', value: '24', change: '+12%', icon: TicketIcon, color: 'text-blue-600' },
  { name: 'Assets Managed', value: '1,234', change: '+5%', icon: CubeIcon, color: 'text-green-600' },
  { name: 'Spaces Available', value: '89', change: '-2%', icon: MapIcon, color: 'text-purple-600' },
  { name: 'Active Users', value: '456', change: '+8%', icon: UserGroupIcon, color: 'text-orange-600' },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.name}
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
                <p className="ml-2 text-sm font-medium text-green-600">
                  {stat.change}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}