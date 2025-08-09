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
  ShoppingCartIcon,
  DocumentTextIcon,
  UserIcon,
  BellIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  TagIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ComputerDesktopIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  {
    name: 'Dashboard',
    href: '/portal',
    icon: HomeIcon,
    description: 'Overview and quick actions',
  },
  {
    name: 'Submit Ticket',
    href: '/portal/tickets/new',
    icon: TicketIcon,
    description: 'Report issues or request help',
  },
  {
    name: 'My Tickets',
    href: '/portal/tickets',
    icon: ClockIcon,
    description: 'Track your support requests',
    badge: '3',
  },
  {
    name: 'Service Catalog',
    href: '/portal/catalog',
    icon: ShoppingCartIcon,
    description: 'Browse available services',
  },
  {
    name: 'Knowledge Base',
    href: '/portal/knowledge',
    icon: DocumentTextIcon,
    description: 'Self-help articles and guides',
  },
  {
    name: 'Community',
    href: '/portal/community',
    icon: ChatBubbleLeftRightIcon,
    description: 'User forums and discussions',
  },
  {
    name: 'Kiosk Access',
    href: '/portal/kiosk',
    icon: ComputerDesktopIcon,
    description: 'Nearby self-service kiosks',
  },
  {
    name: 'Contact Support',
    href: '/portal/contact',
    icon: PhoneIcon,
    description: 'Get in touch with support',
  },
]

const bottomNavigation = [
  {
    name: 'Notifications',
    href: '/portal/notifications',
    icon: BellIcon,
    badge: '2',
  },
  {
    name: 'Profile',
    href: '/portal/profile',
    icon: UserIcon,
  },
  {
    name: 'Settings',
    href: '/portal/settings',
    icon: CogIcon,
  },
]

export function PortalSidebar() {
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
                  <h1 className="text-lg font-bold nova-text-gradient">Nova Orbit</h1>
                  <BetaBadge size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">Self-Service Portal</p>
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
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.department || 'Employee'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Support */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <QuestionMarkCircleIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Need Help?</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Get quick assistance or submit a ticket
            </p>
            <div className="space-y-2">
              <Link
                href="/portal/tickets/new"
                className="block text-xs text-primary hover:underline"
              >
                Submit New Ticket
              </Link>
              <Link
                href="/portal/contact"
                className="block text-xs text-primary hover:underline"
              >
                Contact Support
              </Link>
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

      {/* Support Contact */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <PhoneIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <EnvelopeIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">support@company.com</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}