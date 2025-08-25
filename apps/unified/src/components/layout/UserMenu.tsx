import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@stores/auth';
import { getUserDisplayName, getInitials } from '@utils/index';
import { cn } from '@utils/index';

interface UserMenuProps {
  children?: React.ReactNode;
}

export function UserMenu({ children }: UserMenuProps) {
  const { t } = useTranslation(['navigation', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return children || null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={getUserDisplayName(user)}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="bg-nova-600 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white">
            {getInitials(getUserDisplayName(user))}
          </div>
        )}
        <span className="hidden text-sm font-medium text-gray-700 sm:block dark:text-gray-300">
          {getUserDisplayName(user)}
        </span>
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* User Info Header */}
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={getUserDisplayName(user)}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="bg-nova-600 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white">
                  {getInitials(getUserDisplayName(user))}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getUserDisplayName(user)}
                </div>
                <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <UserIcon className="h-4 w-4" />
              {t('navigation.profile')}
            </Link>

            <Link
              to="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              {t('navigation.settings')}
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 py-1 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
