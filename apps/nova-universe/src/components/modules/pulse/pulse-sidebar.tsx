'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-provider'
import { NovaLogo } from '@/components/ui/nova-logo'
import { Badge } from '@/components/ui/badge'
import {
  HomeIcon,
  TicketIcon,
  EyeIcon,
  QueueListIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  TrophyIcon,
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  {
    name: 'Dashboard',
    href: '/pulse',
    icon: HomeIcon,
    description: 'Overview and metrics',
  },
  {
    name: 'Tickets',
    href: '/pulse/tickets',
    icon: TicketIcon,
    description: 'Manage support tickets',
    badge: '12',
  },
  {
    name: 'Deep Work',
    href: '/pulse/deep-work',
    icon: EyeIcon,
    description: 'Focus mode for tickets',
  },
  {
    name: 'Queue Management',
    href: '/pulse/queue',
    icon: QueueListIcon,
    description: 'Smart queue routing',
    badge: '5',
  },
  {
    name: 'Communication',
    href: '/pulse/communication',
    icon: ChatBubbleLeftRightIcon,
    description: 'Team collaboration',
  },
  {
    name: 'Search',
    href: '/pulse/search',
    icon: MagnifyingGlassIcon,
    description: 'Advanced search tools',
  },
  {
    name: 'Analytics',
    href: '/pulse/analytics',
    icon: ChartBarIcon,
    description: 'Performance insights',
  },
  {
    name: 'Alerts',
    href: '/pulse/alerts',
    icon: ExclamationTriangleIcon,
    description: 'System notifications',
    badge: '3',
  },
  {
    name: 'Inventory',
    href: '/pulse/inventory',
    icon: CubeIcon,
    description: 'Asset management',
  },
  {
    name: 'Timesheet',
    href: '/pulse/timesheet',
    icon: ClockIcon,
    description: 'Time tracking',
  },
  {
    name: 'Team',
    href: '/pulse/team',
    icon: UserGroupIcon,
    description: 'Team collaboration',
  },
  {
    name: 'Knowledge',
    href: '/pulse/knowledge',
    icon: DocumentTextIcon,
    description: 'Internal knowledge base',
  },
  {
    name: 'Leaderboard',
    href: '/pulse/leaderboard',
    icon: TrophyIcon,
    description: 'Performance rankings',
  },
  {
    name: 'Gamification',
    href: '/pulse/gamification',
    icon: PlayIcon,
    description: 'Achievements & XP',
  },
]

const bottomNavigation = [
  {
    name: 'Notifications',
    href: '/pulse/notifications',
    icon: BellIcon,
    badge: '2',
  },
  {
    name: 'Settings',
    href: '/pulse/settings',
    icon: CogIcon,
  },
]

export function PulseSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div
      className={cn(
        'bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo & Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <NovaLogo className="w-8 h-8" />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold module-pulse">Nova Pulse</h1>
                  <Badge variant="outline" className="text-xs">Beta</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Technician Portal</p>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="flex justify-center w-full">
              <NovaLogo className="w-8 h-8" />
            </div>
          )}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Technician'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.roles?.find(r => r.name.includes('tech'))?.displayName || 'Technician'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'flex-shrink-0 transition-colors',
                  collapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-2 border-t border-border space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'flex-shrink-0 transition-colors',
                  collapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}