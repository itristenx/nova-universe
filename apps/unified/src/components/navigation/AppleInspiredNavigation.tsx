import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  TicketIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/itsm',
    icon: HomeIcon,
    description: 'Overview and statistics',
  },
  {
    name: 'Tickets',
    href: '/tickets/apple',
    icon: TicketIcon,
    description: 'Manage support tickets',
  },
  {
    name: 'Create Ticket',
    href: '/tickets/create',
    icon: PlusIcon,
    description: 'Submit new request',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    description: 'Performance insights',
  },
  {
    name: 'Knowledge',
    href: '/knowledge',
    icon: QuestionMarkCircleIcon,
    description: 'Help articles and guides',
  },
];

const bottomNavItems: NavItem[] = [
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
    description: 'Account settings',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    description: 'System preferences',
  },
];

interface AppleInspiredNavigationProps {
  className?: string;
}

export function AppleInspiredNavigation({ className }: AppleInspiredNavigationProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const isActive = (href: string) => {
    if (href === '/itsm') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-out',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-nova-500 to-nova-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nova ITSM
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Service Management
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className={cn(
            'relative transition-all duration-200',
            searchFocused && 'transform scale-105'
          )}>
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-nova-500/50 focus:border-nova-500 focus:bg-white dark:focus:bg-gray-700',
                'placeholder-gray-400 dark:placeholder-gray-500'
              )}
            />
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                'hover:bg-gray-100 dark:hover:bg-gray-800/50',
                active
                  ? 'bg-nova-50 dark:bg-nova-900/20 text-nova-700 dark:text-nova-300 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                'w-5 h-5 transition-colors',
                active
                  ? 'text-nova-600 dark:text-nova-400'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
              )} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Notifications */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-start gap-3">
              <BellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  New Updates
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  3 tickets require your attention
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-2 border-t border-gray-200/50 dark:border-gray-700/50">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                'hover:bg-gray-100 dark:hover:bg-gray-800/50',
                active
                  ? 'bg-nova-50 dark:bg-nova-900/20 text-nova-700 dark:text-nova-300'
                  : 'text-gray-700 dark:text-gray-300'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                'w-5 h-5 transition-colors',
                active
                  ? 'text-nova-600 dark:text-nova-400'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
              )} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}