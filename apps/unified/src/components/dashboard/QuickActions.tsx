import { Link } from 'react-router-dom'
import { TicketIcon, CubeIcon, MapIcon } from '@heroicons/react/24/outline'

const actions = [
  { name: 'Create Ticket', href: '/tickets/new', icon: TicketIcon, color: 'bg-blue-500' },
  { name: 'Add Asset', href: '/assets/new', icon: CubeIcon, color: 'bg-green-500' },
  { name: 'Book Space', href: '/spaces/booking', icon: MapIcon, color: 'bg-purple-500' },
]

export function QuickActions() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className={`rounded-lg p-2 ${action.color}`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}