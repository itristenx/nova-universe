import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  EnvelopeIcon,
  TvIcon
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

const getAllNavigation = (t: any): NavigationItem[] => [
  { 
    name: t('navigation.dashboard'), 
    href: '/dashboard', 
    icon: HomeIcon 
  },
  
  // Core ITSM Functionality
  { 
    name: t('sidebar.serviceDesk'), 
    href: '/tickets', 
    icon: TicketIcon,
    children: [
      { name: t('sidebar.myTickets'), href: '/tickets/my', icon: TicketIcon },
      { name: t('sidebar.allTickets'), href: '/tickets', icon: TicketIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.createTicket'), href: '/tickets/new', icon: TicketIcon },
      { name: t('sidebar.queueManagement'), href: '/tickets/queues', icon: TicketIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.slaManagement'), href: '/tickets/sla', icon: TicketIcon, roles: ['admin'] }
    ]
  },
  
  // Asset Management (Nova Core)
  { 
    name: t('sidebar.assetManagement'), 
    href: '/assets', 
    icon: CubeIcon,
    children: [
      { name: t('sidebar.myAssets'), href: '/assets/my', icon: CubeIcon },
      { name: t('sidebar.allAssets'), href: '/assets', icon: CubeIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.assetCheckInOut'), href: '/assets/checkout', icon: CubeIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.inventoryManagement'), href: '/assets/inventory', icon: CubeIcon, roles: ['admin'] },
      { name: t('sidebar.assetCategories'), href: '/assets/categories', icon: CubeIcon, roles: ['admin'] },
      { name: t('sidebar.maintenanceTracking'), href: '/assets/maintenance', icon: WrenchScrewdriverIcon, roles: ['admin', 'agent'] }
    ]
  },
  
  // Space Management (Nova Atlas)
  { 
    name: t('sidebar.spaceManagement'), 
    href: '/spaces', 
    icon: MapIcon,
    children: [
      { name: t('sidebar.bookSpace'), href: '/spaces/booking', icon: CalendarIcon },
      { name: t('sidebar.myBookings'), href: '/spaces/my', icon: MapIcon },
      { name: t('sidebar.allSpaces'), href: '/spaces', icon: BuildingOfficeIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.spaceAnalytics'), href: '/spaces/analytics', icon: ChartBarIcon, roles: ['admin'] },
      { name: t('sidebar.floorPlans'), href: '/spaces/floorplans', icon: MapIcon, roles: ['admin'] }
    ]
  },
  
  // Digital Signage (Nova TV)
  { 
    name: t('sidebar.novaTV'), 
    href: '/nova-tv', 
    icon: TvIcon,
    roles: ['admin', 'agent'],
    children: [
      { name: t('sidebar.tvDashboard'), href: '/nova-tv', icon: TvIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.deviceManagement'), href: '/nova-tv/devices', icon: TvIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.dashboardBuilder'), href: '/nova-tv/builder', icon: WrenchScrewdriverIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.qrAuthentication'), href: '/nova-tv/auth', icon: ShieldCheckIcon, roles: ['admin', 'agent'] }
    ]
  },
  
  // Knowledge Management
  { 
    name: t('sidebar.knowledgeBase'), 
    href: '/knowledge', 
    icon: DocumentTextIcon,
    children: [
      { name: t('sidebar.browseArticles'), href: '/knowledge', icon: DocumentTextIcon },
      { name: t('sidebar.searchSolutions'), href: '/knowledge/search', icon: DocumentTextIcon },
      { name: t('sidebar.createArticle'), href: '/knowledge/create', icon: DocumentTextIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.manageCategories'), href: '/knowledge/categories', icon: DocumentTextIcon, roles: ['admin'] }
    ]
  },
  
  // Communication & Collaboration
  { 
    name: t('sidebar.communications'), 
    href: '/communications', 
    icon: ChatBubbleLeftIcon,
    children: [
      { name: t('sidebar.announcements'), href: '/communications/announcements', icon: BellIcon },
      { name: t('sidebar.teamChat'), href: '/communications/chat', icon: ChatBubbleLeftIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.broadcastMessages'), href: '/communications/broadcast', icon: BellIcon, roles: ['admin'] }
    ]
  },
  
  // Training & Development
  { 
    name: t('sidebar.learning'), 
    href: '/learning', 
    icon: AcademicCapIcon,
    children: [
      { name: t('sidebar.trainingCourses'), href: '/learning/courses', icon: AcademicCapIcon },
      { name: t('sidebar.certifications'), href: '/learning/certifications', icon: AcademicCapIcon },
      { name: t('sidebar.myProgress'), href: '/learning/progress', icon: AcademicCapIcon },
      { name: t('sidebar.courseManagement'), href: '/learning/manage', icon: AcademicCapIcon, roles: ['admin'] }
    ]
  },
  
  // Monitoring & Operations (Nova Sentinel)
  { 
    name: t('sidebar.monitoring'), 
    href: '/monitoring', 
    icon: ShieldCheckIcon,
    roles: ['admin', 'agent'],
    children: [
      { name: t('sidebar.systemHealth'), href: '/monitoring/health', icon: ShieldCheckIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.alertManagement'), href: '/monitoring/alerts', icon: BellIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.serviceStatus'), href: '/monitoring/status', icon: CloudIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.performanceMetrics'), href: '/monitoring/metrics', icon: ChartBarIcon, roles: ['admin'] }
    ]
  },
  
  // AI Integration & Automation (Cosmo)
  { 
    name: t('sidebar.aiAssistant'), 
    href: '/ai', 
    icon: CpuChipIcon,
    children: [
      { name: t('sidebar.cosmoChat'), href: '/ai/chat', icon: ChatBubbleLeftIcon },
      { name: t('sidebar.smartSuggestions'), href: '/ai/suggestions', icon: CpuChipIcon },
      { name: t('sidebar.automationHub'), href: '/automation', icon: WrenchScrewdriverIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.mailroomIntegration'), href: '/automation/mailroom', icon: EnvelopeIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.mobileCompanion'), href: '/mobile/companion', icon: CpuChipIcon },
      { name: t('sidebar.accessibilityAudit'), href: '/accessibility/audit', icon: ShieldCheckIcon, roles: ['admin'] },
      { name: t('sidebar.aiAnalytics'), href: '/ai/analytics', icon: ChartBarIcon, roles: ['admin'] },
      { name: t('sidebar.modelConfiguration'), href: '/ai/config', icon: Cog6ToothIcon, roles: ['admin'] }
    ]
  },
  
  // Administration (Nova Core)
  { 
    name: t('sidebar.administration'), 
    href: '/admin', 
    icon: Cog6ToothIcon,
    roles: ['admin'],
    children: [
      { name: t('sidebar.userManagement'), href: '/admin/users', icon: UserGroupIcon, roles: ['admin'] },
      { name: t('sidebar.rolePermissions'), href: '/admin/roles', icon: ShieldCheckIcon, roles: ['admin'] },
      { name: t('sidebar.organizationSettings'), href: '/admin/organization', icon: BuildingOfficeIcon, roles: ['admin'] },
      { name: t('sidebar.systemConfiguration'), href: '/admin/system', icon: Cog6ToothIcon, roles: ['admin'] },
      { name: t('sidebar.emailAccounts'), href: '/admin/email-accounts', icon: EnvelopeIcon, roles: ['admin'] },
      { name: t('sidebar.notifications'), href: '/admin/notifications', icon: BellIcon, roles: ['admin'] },
      { name: t('sidebar.siteAssetManagement'), href: '/admin/assets', icon: CubeIcon, roles: ['admin'] },
      { name: t('sidebar.integrationManagement'), href: '/admin/integrations', icon: CloudIcon, roles: ['admin'] },
      { name: t('sidebar.offlineManagement'), href: '/offline', icon: CloudIcon, roles: ['admin'] },
      { name: t('sidebar.auditLogs'), href: '/admin/audit', icon: DocumentTextIcon, roles: ['admin'] }
    ]
  },
  
  // Analytics & Reporting
  { 
    name: t('sidebar.analytics'), 
    href: '/analytics', 
    icon: ChartBarIcon,
    roles: ['admin', 'agent'],
    children: [
      { name: t('sidebar.performanceDashboard'), href: '/analytics/performance', icon: ChartBarIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.serviceReports'), href: '/analytics/service', icon: ChartBarIcon, roles: ['admin', 'agent'] },
      { name: t('sidebar.assetReports'), href: '/analytics/assets', icon: ChartBarIcon, roles: ['admin'] },
      { name: t('sidebar.spaceUtilization'), href: '/analytics/spaces', icon: ChartBarIcon, roles: ['admin'] },
      { name: t('sidebar.customReports'), href: '/analytics/custom', icon: ChartBarIcon, roles: ['admin'] }
    ]
  }
]

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const { t } = useTranslation(['navigation', 'sidebar'])
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

  const navigation = filterNavigationByRole(getAllNavigation(t))

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
            aria-label={t('navigation.close', 'Close sidebar')}
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