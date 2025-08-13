import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, UsersIcon, ComputerDesktopIcon, DocumentTextIcon, CogIcon, ChartBarIcon, BellIcon, BookOpenIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, QrCodeIcon, } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/contexts/ThemeContext';
const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Tickets', href: '/tickets', icon: DocumentTextIcon },
    { name: 'Knowledge', href: '/knowledge', icon: BookOpenIcon },
    { name: 'Kiosks', href: '/kiosks', icon: ComputerDesktopIcon },
    { name: 'Kiosk Management', href: '/kiosk-activation', icon: QrCodeIcon },
    { name: 'Users', href: '/users', icon: UsersIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Integrations', href: '/integrations', icon: Cog6ToothIcon },
    { name: 'Email Accounts', href: '/email-accounts', icon: Cog6ToothIcon },
    { name: 'Modules', href: '/modules', icon: Cog6ToothIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
];
export const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { isDark } = useTheme();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (React.createElement(React.Fragment, null,
        isOpen && (React.createElement("div", { className: "fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden", onClick: onClose })),
        React.createElement("div", { className: `fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}` },
            React.createElement("div", { className: "flex flex-col h-full" },
                React.createElement("div", { className: "flex flex-col items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700" },
                    React.createElement("div", { className: "flex-shrink-0 mb-3" },
                        React.createElement("img", { className: "h-12 w-auto max-w-[160px]", src: isDark ? '/logo-dark.png' : '/logo.png', alt: "Nova Universe", onError: (e) => {
                                // Fallback to regular logo if dark version doesn't exist
                                if (e.currentTarget.src.includes('logo-dark.png')) {
                                    e.currentTarget.src = '/logo.png';
                                }
                                else {
                                    e.currentTarget.src = '/vite.svg';
                                }
                            } })),
                    React.createElement("div", { className: "w-full text-center" },
                        React.createElement("h1", { className: "text-xl font-bold text-gray-900 dark:text-gray-100" }, "Nova Universe Portal"))),
                React.createElement("nav", { className: "flex-1 px-4 py-6 space-y-1" }, navigation.map((item) => (React.createElement(NavLink, { key: item.name, to: item.href, className: ({ isActive }) => `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'}`, onClick: () => onClose() },
                    React.createElement(item.icon, { className: "mr-3 h-5 w-5 flex-shrink-0", "aria-hidden": "true" }),
                    item.name)))),
                React.createElement("div", { className: "flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4" },
                    React.createElement("div", { className: "flex items-center" },
                        React.createElement("div", { className: "flex-shrink-0" },
                            React.createElement("div", { className: "h-8 w-8 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center" },
                                React.createElement("span", { className: "text-sm font-medium text-white" }, user?.name?.charAt(0)?.toUpperCase() || 'A'))),
                        React.createElement("div", { className: "ml-3 flex-1" },
                            React.createElement("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300" }, user?.name || 'Admin'),
                            React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" }, user?.roles?.[0] || 'Administrator')),
                        React.createElement("button", { onClick: handleLogout, className: "ml-3 flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300", title: "Logout" },
                            React.createElement(ArrowRightOnRectangleIcon, { className: "h-5 w-5" }))))))));
};
