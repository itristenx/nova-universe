import { Link, useLocation } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  separator?: React.ReactNode
}

// Route to breadcrumb mapping
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [
    { label: 'Dashboard', current: true }
  ],
  '/tickets': [
    { label: 'Tickets', current: true }
  ],
  '/tickets/new': [
    { label: 'Tickets', href: '/tickets' },
    { label: 'Create Ticket', current: true }
  ],
  '/assets': [
    { label: 'Assets', current: true }
  ],
  '/assets/new': [
    { label: 'Assets', href: '/assets' },
    { label: 'Create Asset', current: true }
  ],
  '/spaces': [
    { label: 'Spaces', current: true }
  ],
  '/spaces/floor-plan': [
    { label: 'Spaces', href: '/spaces' },
    { label: 'Floor Plan', current: true }
  ],
  '/admin/users': [
    { label: 'Administration', href: '/admin' },
    { label: 'Users', current: true }
  ],
  '/admin/reports': [
    { label: 'Administration', href: '/admin' },
    { label: 'Reports', current: true }
  ],
  '/admin/site-assets': [
    { label: 'Administration', href: '/admin' },
    { label: 'Site Assets', current: true }
  ],
  '/profile': [
    { label: 'Profile', current: true }
  ],
  '/settings': [
    { label: 'Settings', current: true }
  ]
}

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
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4" aria-label="Breadcrumb">
      {/* Home link */}
      <Link
        to="/dashboard"
        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        title="Go to Dashboard"
      >
        <HomeIcon className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>
      
      {breadcrumbItems.length > 0 && (
        <span className="text-gray-400">{separator || defaultSeparator}</span>
      )}

      {/* Breadcrumb items */}
      {breadcrumbItems.map((item, index) => (
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
  
  const setBreadcrumb = (items: BreadcrumbItem[]) => {
    // In a real implementation, this would update a global state
    // For now, we'll just return the items
    return items
  }
  
  const getCurrentBreadcrumb = (): BreadcrumbItem[] => {
    return routeBreadcrumbs[location.pathname] || 
           generateBreadcrumbsFromPath(location.pathname)
  }
  
  return {
    setBreadcrumb,
    getCurrentBreadcrumb,
    currentPath: location.pathname
  }
}
