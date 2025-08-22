import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline'
import { UserMenu } from './UserMenu'
import { NotificationMenu } from './NotificationMenu'
import { UnifiedCommandCenter } from './UnifiedCommandCenter'
import { AppSwitcher } from '../navigation/AppSwitcher'
import LanguageSwitcher from '../common/LanguageSwitcher'

interface HeaderProps {
  onMenuClick: () => void
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

export function Header({ onMenuClick, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const { t } = useTranslation(['navigation', 'common'])
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
            title={t('common.openMenu')}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
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
              {t('app.name')}
            </span>
          </Link>

          {/* App Switcher */}
          <AppSwitcher currentApp="unified" />
        </div>

        {/* Center section - Command Center */}
        <div className="flex-1 max-w-xl mx-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-left text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
          >
            <CommandLineIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t('navigation:searchPlaceholder')}</span>
            <span className="sm:hidden">{t('navigation:commandCenter.title')}</span>
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
          {/* Language Switcher */}
          <LanguageSwitcher className="hidden sm:block" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? t('common.switchToDark') : t('common.switchToLight')}
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
          <UserMenu />
        </div>
      </header>

      {/* Unified Command Center */}
      <UnifiedCommandCenter
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  )
}