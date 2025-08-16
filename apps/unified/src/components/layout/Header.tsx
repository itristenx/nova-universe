import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@stores/auth'
import { UserMenu } from './UserMenu'
import { NotificationMenu } from './NotificationMenu'
import { SearchCommand } from './SearchCommand'
import { getUserDisplayName, getInitials } from '@utils/index'

interface HeaderProps {
  onMenuClick: () => void
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

export function Header({ onMenuClick, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const { user } = useAuthStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:block"
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-nova text-white">
              <span className="text-sm font-bold">N</span>
            </div>
            <span className="hidden text-lg font-semibold text-gray-900 dark:text-gray-100 sm:block">
              Nova Universe
            </span>
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-xl mx-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-left text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Search tickets, assets, spaces...</span>
            <span className="sm:hidden">Search...</span>
            <div className="ml-auto flex items-center gap-1">
              <kbd className="hidden rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-400 sm:inline">
                ⌘
              </kbd>
              <kbd className="hidden rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-400 sm:inline">
                K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <NotificationMenu>
            <button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
              <BellIcon className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </button>
          </NotificationMenu>

          {/* User menu */}
          <UserMenu>
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={getUserDisplayName(user)}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-nova-600 text-sm font-medium text-white">
                  {user ? getInitials(getUserDisplayName(user)) : 'U'}
                </div>
              )}
              <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:block">
                {user ? getUserDisplayName(user) : 'User'}
              </span>
            </button>
          </UserMenu>
        </div>
      </header>

      {/* Search command palette */}
      <SearchCommand
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  )
}