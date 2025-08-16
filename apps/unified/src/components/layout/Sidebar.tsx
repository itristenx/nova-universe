import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  TicketIcon,
  CubeIcon,
  MapIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@utils/index'

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Tickets', href: '/tickets', icon: TicketIcon },
  { name: 'Assets', href: '/assets', icon: CubeIcon },
  { name: 'Spaces', href: '/spaces', icon: MapIcon },
  { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
]

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const location = useLocation()

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
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Nova Universe
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                               location.pathname.startsWith(item.href + '/')
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'nav-link',
                      isActive && 'nav-link-active'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
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
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-nova text-white">
              <span className="text-sm font-bold">N</span>
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Nova Universe
              </span>
            )}
          </div>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                               location.pathname.startsWith(item.href + '/')
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'nav-link',
                      isActive && 'nav-link-active',
                      isCollapsed && 'justify-center'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}