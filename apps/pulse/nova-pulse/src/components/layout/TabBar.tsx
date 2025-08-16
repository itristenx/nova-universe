import React from 'react'
import { NavLink } from 'react-router-dom'
import { HomeIcon, TicketIcon, QueueListIcon, ExclamationTriangleIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

const tabs = [
  { name: 'Home', to: '/', icon: HomeIcon },
  { name: 'Tickets', to: '/tickets', icon: TicketIcon },
  { name: 'Queue', to: '/queue', icon: QueueListIcon },
  { name: 'Alerts', to: '/alerts', icon: ExclamationTriangleIcon },
  { name: 'More', to: '/analytics', icon: EllipsisHorizontalIcon },
]

const TabBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-[90] border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur px-2 pt-2 pb-[calc(0.5rem+var(--safe-bottom))] md:hidden">
      <ul className="flex items-center justify-between">
        {tabs.map((tab) => (
          <li key={tab.name} className="flex-1">
            <NavLink
              to={tab.to}
              className={({ isActive }) => `flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs transition-transform duration-150 ${isActive ? 'text-primary-600 scale-100' : 'text-gray-500 dark:text-gray-400 hover:scale-[1.05]'}`}
            >
              <tab.icon className="h-6 w-6" />
              <span>{tab.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TabBar


