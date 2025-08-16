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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white/80 backdrop-blur transition-transform duration-250 ease-out lg:static lg:inset-0 lg:translate-x-0 dark:bg-gray-800/70 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex flex-col items-center border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="mb-3 flex w-full items-center justify-between">
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
                className="focus:ring-primary-500 ml-1 flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:outline-none focus:ring-inset lg:hidden"
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
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                  }`
                }
                onClick={() => onClose()}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-primary-600 dark:bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="text-sm font-medium text-white">U</span>
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
