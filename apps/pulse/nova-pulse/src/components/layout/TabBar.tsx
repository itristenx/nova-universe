import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  TicketIcon,
  QueueListIcon,
  ExclamationTriangleIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

const tabs = [
  { name: 'Home', to: '/', icon: HomeIcon },
  { name: 'Tickets', to: '/tickets', icon: TicketIcon },
  { name: 'Queue', to: '/queue', icon: QueueListIcon },
  { name: 'Alerts', to: '/alerts', icon: ExclamationTriangleIcon },
  { name: 'More', to: '/analytics', icon: EllipsisHorizontalIcon },
];

const TabBar: React.FC = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[90] border-t border-gray-200 bg-white/90 px-2 pt-2 pb-[calc(0.5rem+var(--safe-bottom))] backdrop-blur supports-[backdrop-filter]:backdrop-blur md:hidden dark:border-gray-800 dark:bg-gray-900/80">
      <ul className="flex items-center justify-between">
        {tabs.map((tab) => (
          <li key={tab.name} className="flex-1">
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs transition-transform duration-150 ${isActive ? 'text-primary-600 scale-100' : 'text-gray-500 hover:scale-[1.05] dark:text-gray-400'}`
              }
            >
              <tab.icon className="h-6 w-6" />
              <span>{tab.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TabBar;
