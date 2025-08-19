import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MobileNavigation, { QuickActionButton, MobileSearch } from './MobileNavigation'

interface MobileLayoutProps {
  children: React.ReactNode
  showBottomNav?: boolean
  quickAction?: {
    icon?: React.ReactNode
    label?: string
    onClick: () => void
  }
  searchConfig?: {
    onSearch: (query: string) => void
    placeholder?: string
  }
  className?: string
}

export default function MobileLayout({
  children,
  showBottomNav = true,
  quickAction,
  searchConfig,
  className = ''
}: MobileLayoutProps) {
  const { t } = useTranslation(['app'])
  const [viewportHeight, setViewportHeight] = useState('100vh')

  // Handle viewport height for mobile browsers
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visual viewport if available (for mobile keyboards)
      if ('visualViewport' in window && window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`)
      } else {
        setViewportHeight(`${window.innerHeight}px`)
      }
    }

    updateViewportHeight()

    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight)
      return () => {
        window.visualViewport?.removeEventListener('resize', updateViewportHeight)
      }
    } else {
      window.addEventListener('resize', updateViewportHeight)
      return () => {
        window.removeEventListener('resize', updateViewportHeight)
      }
    }
  }, [])

  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: viewportHeight }}
    >
      {/* Main content area */}
      <main 
        className={`w-full overflow-auto ${
          showBottomNav ? 'pb-16' : 'pb-4'
        } px-safe pt-safe`}
        style={{ 
          height: '100%',
          paddingBottom: showBottomNav ? 'calc(4rem + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)'
        }}
      >
        {children}
      </main>

      {/* Quick action button */}
      {quickAction && (
        <QuickActionButton
          onClick={quickAction.onClick}
          icon={quickAction.icon}
          label={quickAction.label}
        />
      )}

      {/* Bottom navigation */}
      {showBottomNav && <MobileNavigation />}
    </div>
  )
}

// Hook to detect mobile device and capabilities
export function useMobileDevice() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isTouch: false,
    isStandalone: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
    screenSize: { width: 0, height: 0 },
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(userAgent)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches

      // Get safe area insets
      const style = getComputedStyle(document.documentElement)
      const safeAreaTop = parseInt(style.getPropertyValue('--sat') || '0', 10)
      const safeAreaBottom = parseInt(style.getPropertyValue('--sab') || '0', 10)
      const safeAreaLeft = parseInt(style.getPropertyValue('--sal') || '0', 10)
      const safeAreaRight = parseInt(style.getPropertyValue('--sar') || '0', 10)

      setDeviceInfo({
        isMobile,
        isTablet,
        isTouch,
        isStandalone,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        screenSize: { width: window.innerWidth, height: window.innerHeight },
        safeArea: {
          top: safeAreaTop,
          bottom: safeAreaBottom,
          left: safeAreaLeft,
          right: safeAreaRight
        }
      })
    }

    updateDeviceInfo()

    // Listen for orientation changes
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    // Listen for display mode changes (for PWA install)
    if (window.matchMedia) {
      const standaloneQuery = window.matchMedia('(display-mode: standalone)')
      standaloneQuery.addEventListener('change', updateDeviceInfo)
      
      return () => {
        window.removeEventListener('resize', updateDeviceInfo)
        window.removeEventListener('orientationchange', updateDeviceInfo)
        standaloneQuery.removeEventListener('change', updateDeviceInfo)
      }
    }

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

// Mobile-specific header component
interface MobileHeaderProps {
  title: string
  leftAction?: {
    icon: React.ReactNode
    onClick: () => void
    label: string
  }
  rightActions?: Array<{
    icon: React.ReactNode
    onClick: () => void
    label: string
  }>
  showSearch?: boolean
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  className?: string
}

export function MobileHeader({
  title,
  leftAction,
  rightActions = [],
  showSearch = false,
  onSearch,
  searchPlaceholder,
  className = ''
}: MobileHeaderProps) {
  return (
    <header className={`sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between h-14 px-4 pt-safe">
        {/* Left action */}
        <div className="flex-shrink-0">
          {leftAction ? (
            <button
              onClick={leftAction.onClick}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label={leftAction.label}
            >
              {leftAction.icon}
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Title */}
        <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white text-center truncate px-2">
          {title}
        </h1>

        {/* Right actions */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {showSearch && onSearch && (
            <MobileSearch
              onSearch={onSearch}
              placeholder={searchPlaceholder}
            />
          )}
          
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}
          
          {rightActions.length === 0 && !showSearch && (
            <div className="w-10" />
          )}
        </div>
      </div>
    </header>
  )
}

// Mobile-optimized list component
interface MobileListProps {
  children: React.ReactNode
  className?: string
  loading?: boolean
  empty?: {
    icon?: React.ReactNode
    title: string
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
  }
}

export function MobileList({
  children,
  className = '',
  loading = false,
  empty
}: MobileListProps) {
  const { t } = useTranslation(['common'])

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (empty && !children) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center px-4">
          {empty.icon && (
            <div className="text-gray-400 dark:text-gray-500 mb-4 flex justify-center">
              {empty.icon}
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {empty.title}
          </h3>
          {empty.description && (
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {empty.description}
            </p>
          )}
          {empty.action && (
            <button
              onClick={empty.action.onClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              {empty.action.label}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {children}
    </div>
  )
}

// Mobile card component
interface MobileCardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function MobileCard({
  children,
  onClick,
  className = '',
  padding = 'md'
}: MobileCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${
        onClick ? 'hover:bg-gray-50 dark:hover:bg-gray-750 active:bg-gray-100 dark:active:bg-gray-700 transition-colors' : ''
      } ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </Component>
  )
}
