import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@stores/auth'
import {
  HomeIcon,
  TicketIcon,
  CubeIcon,
  MapIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  XMarkIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  CloudIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { cn } from '@utils/index'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  roles?: string[]
  children?: NavigationItem[]
}

const getAllNavigation = (): NavigationItem[] => [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon 
  },
  
  // Core ITSM Functionality
  { 
    name: 'Service Desk', 
    href: '/tickets', 
    icon: TicketIcon,
    children: [
      { name: 'My Tickets', href: '/tickets/my', icon: TicketIcon },
      { name: 'All Tickets', href: '/tickets', icon: TicketIcon, roles: ['admin', 'agent'] },
      { name: 'Create Ticket', href: '/tickets/new', icon: TicketIcon },
      { name: 'Queue Management', href: '/tickets/queues', icon: TicketIcon, roles: ['admin', 'agent'] },
      { name: 'SLA Management', href: '/tickets/sla', icon: TicketIcon, roles: ['admin'] }
    ]
  },
  
  // Asset Management (Nova Core)
  { 
    name: 'Asset Management', 
    href: '/assets', 
    icon: CubeIcon,
    children: [
      { name: 'My Assets', href: '/assets/my', icon: CubeIcon },
      { name: 'All Assets', href: '/assets', icon: CubeIcon, roles: ['admin', 'agent'] },
      { name: 'Asset Check-in/out', href: '/assets/checkout', icon: CubeIcon, roles: ['admin', 'agent'] },
      { name: 'Inventory Management', href: '/assets/inventory', icon: CubeIcon, roles: ['admin'] },
      { name: 'Asset Categories', href: '/assets/categories', icon: CubeIcon, roles: ['admin'] },
      { name: 'Maintenance Tracking', href: '/assets/maintenance', icon: WrenchScrewdriverIcon, roles: ['admin', 'agent'] }
    ]
  },
  
  // Space Management (Nova Atlas)
  { 
    name: 'Space Management', 
    href: '/spaces', 
    icon: MapIcon,
    children: [
      { name: 'Book Space', href: '/spaces/booking', icon: CalendarIcon },
      { name: 'My Bookings', href: '/spaces/my', icon: MapIcon },
      { name: 'All Spaces', href: '/spaces', icon: BuildingOfficeIcon, roles: ['admin', 'agent'] },
      { name: 'Space Analytics', href: '/spaces/analytics', icon: ChartBarIcon, roles: ['admin'] },
      { name: 'Floor Plans', href: '/spaces/floorplans', icon: MapIcon, roles: ['admin'] }
    ]
  },
  
  // Knowledge Management
  { 
    name: 'Knowledge Base', 
    href: '/knowledge', 
    icon: DocumentTextIcon,
    children: [
      { name: 'Browse Articles', href: '/knowledge', icon: DocumentTextIcon },
      { name: 'Search Solutions', href: '/knowledge/search', icon: DocumentTextIcon },
      { name: 'Create Article', href: '/knowledge/create', icon: DocumentTextIcon, roles: ['admin', 'agent'] },
      { name: 'Manage Categories', href: '/knowledge/categories', icon: DocumentTextIcon, roles: ['admin'] }
    ]
  },
  
  // Communication & Collaboration
  { 
    name: 'Communications', 
    href: '/communications', 
    icon: ChatBubbleLeftIcon,
    children: [
      { name: 'Announcements', href: '/communications/announcements', icon: BellIcon },
      { name: 'Team Chat', href: '/communications/chat', icon: ChatBubbleLeftIcon, roles: ['admin', 'agent'] },
      { name: 'Broadcast Messages', href: '/communications/broadcast', icon: BellIcon, roles: ['admin'] }
    ]
  },
  
  // Training & Development
  { 
    name: 'Learning', 
    href: '/learning', 
    icon: AcademicCapIcon,
    children: [
      { name: 'Training Courses', href: '/learning/courses', icon: AcademicCapIcon },
      { name: 'Certifications', href: '/learning/certifications', icon: AcademicCapIcon },
      { name: 'My Progress', href: '/learning/progress', icon: AcademicCapIcon },
      { name: 'Course Management', href: '/learning/manage', icon: AcademicCapIcon, roles: ['admin'] }
    ]
  },
  
  // Monitoring & Operations (Nova Sentinel)
  { 
    name: 'Monitoring', 
    href: '/monitoring', 
    icon: ShieldCheckIcon,
    roles: ['admin', 'agent'],
    children: [
      { name: 'System Health', href: '/monitoring/health', icon: ShieldCheckIcon, roles: ['admin', 'agent'] },
      { name: 'Alert Management', href: '/monitoring/alerts', icon: BellIcon, roles: ['admin', 'agent'] },
      { name: 'Service Status', href: '/monitoring/status', icon: CloudIcon, roles: ['admin', 'agent'] },
      { name: 'Performance Metrics', href: '/monitoring/metrics', icon: ChartBarIcon, roles: ['admin'] }
    ]
  },
  
  // AI Integration (Cosmo)
  { 
    name: 'AI Assistant', 
    href: '/ai', 
    icon: CpuChipIcon,
    children: [
      { name: 'Cosmo Chat', href: '/ai/chat', icon: ChatBubbleLeftIcon },
      { name: 'Smart Suggestions', href: '/ai/suggestions', icon: CpuChipIcon },
      { name: 'AI Analytics', href: '/ai/analytics', icon: ChartBarIcon, roles: ['admin'] },
      { name: 'Model Configuration', href: '/ai/config', icon: Cog6ToothIcon, roles: ['admin'] }
    ]
  },
  
  // Administration (Nova Core)
  { 
    name: 'Administration', 
    href: '/admin', 
    icon: Cog6ToothIcon,
    roles: ['admin'],
    children: [
      { name: 'User Management', href: '/admin/users', icon: UserGroupIcon, roles: ['admin'] },
      { name: 'Role & Permissions', href: '/admin/roles', icon: ShieldCheckIcon, roles: ['admin'] },
      { name: 'Organization Settings', href: '/admin/organization', icon: BuildingOfficeIcon, roles: ['admin'] },
      { name: 'System Configuration', href: '/admin/system', icon: Cog6ToothIcon, roles: ['admin'] },
      { name: 'Email Accounts', href: '/admin/email-accounts', icon: EnvelopeIcon, roles: ['admin'] },
      { name: 'Notifications', href: '/admin/notifications', icon: BellIcon, roles: ['admin'] },
      { name: 'Site Asset Management', href: '/admin/assets', icon: CubeIcon, roles: ['admin'] },
      { name: 'Integration Management', href: '/admin/integrations', icon: CloudIcon, roles: ['admin'] },
      { name: 'Audit Logs', href: '/admin/audit', icon: DocumentTextIcon, roles: ['admin'] }
    ]
  },
  
  // Analytics & Reporting
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon,
    roles: ['admin', 'agent'],
    children: [
      { name: 'Performance Dashboard', href: '/analytics/performance', icon: ChartBarIcon, roles: ['admin', 'agent'] },
      { name: 'Service Reports', href: '/analytics/service', icon: ChartBarIcon, roles: ['admin', 'agent'] },
      { name: 'Asset Reports', href: '/analytics/assets', icon: ChartBarIcon, roles: ['admin'] },
      { name: 'Space Utilization', href: '/analytics/spaces', icon: ChartBarIcon, roles: ['admin'] },
      { name: 'Custom Reports', href: '/analytics/custom', icon: ChartBarIcon, roles: ['admin'] }
    ]
  }
]

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuthStore()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const getUserRole = () => {
    if (!user?.roles) return 'user'
    if (user.roles.some(role => role.name === 'admin')) return 'admin'
    if (user.roles.some(role => role.name === 'agent')) return 'agent'
    return 'user'
  }

  const userRole = getUserRole()

  const filterNavigationByRole = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      // If no roles specified, show to everyone
      if (!item.roles) return true
      // If user has required role, show the item
      return item.roles.includes(userRole)
    }).map(item => {
      const filteredChildren = item.children ? filterNavigationByRole(item.children) : undefined
      return {
        ...item,
        ...(filteredChildren && { children: filteredChildren })
      }
    }).filter(item => !item.children || item.children.length > 0)
  }

  const navigation = filterNavigationByRole(getAllNavigation())

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName)
    } else {
      newExpanded.add(sectionName)
    }
    setExpandedSections(newExpanded)
  }

  const isItemActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const isSectionActive = (item: NavigationItem) => {
    if (isItemActive(item.href)) return true
    if (item.children) {
      return item.children.some(child => isItemActive(child.href))
    }
    return false
  }

  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0
    const isActive = isItemActive(item.href)
    const sectionActive = isSectionActive(item)
    const isExpanded = expandedSections.has(item.name)

    if (hasChildren && !isCollapsed) {
      return (
        <li key={item.name}>
          <button
            onClick={() => toggleSection(item.name)}
            className={cn(
              'nav-link w-full justify-between',
              sectionActive && 'nav-link-active'
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </div>
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <ul className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {item.children?.map(child => renderNavigationItem(child, true))}
            </ul>
          )}
        </li>
      )
    }

    return (
      <li key={item.name}>
        <Link
          to={item.href}
          onClick={onClose}
          className={cn(
            'nav-link',
            isActive && 'nav-link-active',
            isCollapsed && 'justify-center',
            isChild && 'text-sm'
          )}
          title={isCollapsed ? item.name : undefined}
        >
          <item.icon className="h-5 w-5" />
          {!isCollapsed && <span>{item.name}</span>}
        </Link>
      </li>
    )
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-nova text-white">
            <span className="text-sm font-bold">N</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Nova Universe
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {userRole} Portal
              </span>
            </div>
          )}
        </div>
      </div>
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map(item => renderNavigationItem(item))}
        </ul>
      </nav>
    </>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-nova text-white">
              <span className="text-sm font-bold">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Nova Universe
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {userRole} Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map(item => renderNavigationItem(item))}
          </ul>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-20 hidden bg-white shadow-lg transition-all duration-300 dark:bg-gray-800 lg:block',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </div>
    </>
  )
}