import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  TrophyIcon,
  PlayIcon,
  ChartBarIcon,
  XMarkIcon,
  EyeIcon,
  QueueListIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ServerIcon,
  BellIcon,
  CircleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tickets', href: '/tickets', icon: TicketIcon },
  { name: 'Deep Work', href: '/deepwork', icon: EyeIcon },
  { name: 'Queue Management', href: '/queue', icon: QueueListIcon },
  { name: 'Communication', href: '/communication', icon: ChatBubbleLeftRightIcon },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Alerts', href: '/alerts', icon: ExclamationTriangleIcon },
  { name: 'Monitoring', href: '/monitoring', icon: ServerIcon },
  { name: 'GoAlert', href: '/goalert', icon: BellIcon },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon },
  { name: 'CMDB', href: '/cmdb', icon: CircleStackIcon },
  { name: 'Support Groups', href: '/support-groups', icon: UserGroupIcon },
  { name: 'Leaderboard', href: '/leaderboard', icon: TrophyIcon },
  { name: 'Gamification', href: '/gamification', icon: PlayIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-gray-800/70 backdrop-blur transform transition-transform duration-250 ease-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex flex-col items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-auto max-w-[140px]"
                  src={isDark ? '/logo-dark.png' : '/logo.png'}
                  alt="Nova Universe"
                  onError={(e) => {
                    // Fallback to regular logo if dark version doesn't exist
                    if (e.currentTarget.src.includes('logo-dark.png')) {
                      e.currentTarget.src = '/logo.png';
                    }
                  }}
                />
              </div>
              {/* Close button for mobile */}
              <button
                type="button"
                className="lg:hidden ml-1 flex items-center justify-center h-11 w-11 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="w-full text-center">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nova Pulse</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Performance Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
                onClick={() => onClose()}
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    U
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Performance Analyst</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
