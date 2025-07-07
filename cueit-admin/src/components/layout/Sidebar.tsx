import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/auth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tickets', href: '/tickets', icon: DocumentTextIcon },
  { name: 'Kiosks', href: '/kiosks', icon: ComputerDesktopIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Integrations', href: '/integrations', icon: Cog6ToothIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8"
                  src="/logo.png"
                  alt="CueIT"
                  onError={(e) => {
                    e.currentTarget.src = '/vite.svg';
                  }}
                />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">CueIT Admin</h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                onClick={() => onClose()}
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User menu */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
