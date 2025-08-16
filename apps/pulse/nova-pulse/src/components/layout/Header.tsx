import React from 'react';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { isDark } = useTheme();

  return (
    <header className="sticky top-0 z-[100] bg-white/75 dark:bg-gray-800/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200/70 dark:border-gray-700/60 pt-[var(--safe-top)]">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side */}
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden -ml-2 mr-2 h-11 w-11 inline-flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 active:scale-[0.98] transition-transform duration-150"
            onClick={onToggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex items-center">
            <img
              className="h-8 w-auto mr-3"
              src={isDark ? '/logo-dark.png' : '/logo.png'}
              alt="Nova Universe"
              onError={(e) => {
                // Fallback to regular logo if dark version doesn't exist
                if (e.currentTarget.src.includes('logo-dark.png')) {
                  e.currentTarget.src = '/logo.png';
                }
              }}
            />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pulse</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {/* Notification badge */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800" />
          </button>
        </div>
      </div>
    </header>
  );
};
