import { Link, useLocation } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  separator?: React.ReactNode
}

// Route to breadcrumb mapping - returns function that takes translation function
const getRouteBreadcrumbs = (t: (key: string) => string): Record<string, BreadcrumbItem[]> => ({
  '/dashboard': [
    { label: t('navigation.dashboard'), current: true }
  ],
  '/tickets': [
    { label: t('navigation.tickets'), current: true }
  ],
  '/tickets/new': [
    { label: t('navigation.tickets'), href: '/tickets' },
    { label: t('navigation.createTicket'), current: true }
  ],
  '/assets': [
    { label: t('navigation.assets'), current: true }
  ],
  '/assets/new': [
    { label: t('navigation.assets'), href: '/assets' },
    { label: t('navigation.createAsset'), current: true }
  ],
  '/spaces': [
    { label: t('navigation.spaces'), current: true }
  ],
  '/spaces/floor-plan': [
    { label: t('navigation.spaces'), href: '/spaces' },
    { label: t('navigation.floorPlan'), current: true }
  ],
  '/admin/users': [
    { label: t('navigation.administration'), href: '/admin' },
    { label: t('navigation.users'), current: true }
  ],
  '/admin/reports': [
    { label: t('navigation.administration'), href: '/admin' },
    { label: t('navigation.reports'), current: true }
  ],
  '/admin/site-assets': [
    { label: t('navigation.administration'), href: '/admin' },
    { label: t('navigation.siteAssets'), current: true }
  ],
  '/profile': [
    { label: t('navigation.profile'), current: true }
  ],
  '/settings': [
    { label: t('navigation.settings'), current: true }
  ]
})

// Generate breadcrumbs from dynamic routes
const generateBreadcrumbsFromPath = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []
  
  // Build cumulative path and breadcrumbs
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1
    
    // Capitalize and format segment
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    const breadcrumbItem: BreadcrumbItem = {
      label,
      current: isLast
    }
    
    if (!isLast) {
      breadcrumbItem.href = currentPath
    }
    
    breadcrumbs.push(breadcrumbItem)
  })
  
  return breadcrumbs
}

export function Breadcrumb({ items, separator }: BreadcrumbProps) {
  const location = useLocation()
  const { t } = useTranslation('navigation')
  
  // Get route breadcrumbs with translation function
  const routeBreadcrumbs = getRouteBreadcrumbs(t)
  
  // Use provided items or generate from current route
  const breadcrumbItems = items || 
    routeBreadcrumbs[location.pathname] || 
    generateBreadcrumbsFromPath(location.pathname)
  
  // Don't show breadcrumbs on dashboard or if only one item
  if (location.pathname === '/dashboard' || breadcrumbItems.length <= 1) {
    return null
  }

  const defaultSeparator = <ChevronRightIcon className="h-4 w-4 text-gray-400" />

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4" aria-label={t('breadcrumb')}>
      {/* Home link */}
      <Link
        to="/dashboard"
        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        title={t('goToDashboard')}
      >
        <HomeIcon className="h-4 w-4" />
        <span className="sr-only">{t('dashboard')}</span>
      </Link>
      
      {breadcrumbItems.length > 0 && (
        <span className="text-gray-400">{separator || defaultSeparator}</span>
      )}

      {/* Breadcrumb items */}
      {breadcrumbItems.map((item: BreadcrumbItem, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          {item.current ? (
            <span className="font-medium text-gray-900 dark:text-white" aria-current="page">
              {item.label}
            </span>
          ) : (
            <>
              <Link
                to={item.href!}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                {item.label}
              </Link>
              {index < breadcrumbItems.length - 1 && (
                <span className="text-gray-400">{separator || defaultSeparator}</span>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  )
}

// Hook for custom breadcrumb management
export function useBreadcrumb() {
  const location = useLocation()
  const { t } = useTranslation('navigation')
  
  const setBreadcrumb = (items: BreadcrumbItem[]) => {
    // In a real implementation, this would update a global state
    // For now, we'll just return the items
    return items
  }
  
  const getCurrentBreadcrumb = (): BreadcrumbItem[] => {
    const routeBreadcrumbs = getRouteBreadcrumbs(t)
    return routeBreadcrumbs[location.pathname] || 
           generateBreadcrumbsFromPath(location.pathname)
  }
  
  return {
    setBreadcrumb,
    getCurrentBreadcrumb,
    currentPath: location.pathname
  }
}
