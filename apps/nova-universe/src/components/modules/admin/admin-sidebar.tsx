'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-provider'
import { NovaLogo } from '@/components/ui/nova-logo'
import { Badge } from '@/components/ui/badge'
import { BetaBadge } from '@/components/ui/beta-badge'
import {
  HomeIcon,
  TicketIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ServerIcon,
  CubeIcon,
  UsersIcon,
  KeyIcon,
  LinkIcon,
  CloudIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
    description: 'System overview and metrics',
  },
  {
    name: 'Tickets',
    href: '/admin/tickets',
    icon: TicketIcon,
    description: 'Manage all support tickets',
    badge: '24',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: UserGroupIcon,
    description: 'User management and roles',
  },
  {
    name: 'VIP Management',
    href: '/admin/vip',
    icon: ShieldCheckIcon,
    description: 'VIP user priority settings',
  },
  {
    name: 'Kiosks',
    href: '/admin/kiosks',
    icon: ComputerDesktopIcon,
    description: 'Beacon kiosk management',
    badge: '3',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
    description: 'Reports and insights',
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: BellIcon,
    description: 'System notifications',
    badge: '5',
  },
  {
    name: 'Email Accounts',
    href: '/admin/email',
    icon: EnvelopeIcon,
    description: 'Email configuration',
  },
  {
    name: 'Integrations',
    href: '/admin/integrations',
    icon: LinkIcon,
    description: 'Third-party integrations',
  },
  {
    name: 'Modules',
    href: '/admin/modules',
    icon: CubeIcon,
    description: 'Nova module management',
  },
  {
    name: 'SAML Config',
    href: '/admin/saml',
    icon: KeyIcon,
    description: 'SAML authentication',
  },
  {
    name: 'System Config',
    href: '/admin/system',
    icon: ServerIcon,
    description: 'System configuration',
  },
  {
    name: 'Backup & Storage',
    href: '/admin/backup',
    icon: CloudIcon,
    description: 'Data backup and storage',
  },
]

const bottomNavigation = [
  {
    name: 'Alerts',
    href: '/admin/alerts',
    icon: ExclamationTriangleIcon,
    badge: '2',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: CogIcon,
  },
]

export function AdminSidebar() {
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
                  <h1 className="text-lg font-bold nova-text-gradient">Nova Core</h1>
                  <BetaBadge size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
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
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-muted-foreground truncate">
                System Administrator
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