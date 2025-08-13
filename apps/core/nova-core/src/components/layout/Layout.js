import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '@/components/ui';
import { useToastStore } from '@/stores/toast';
export const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toasts, removeToast } = useToastStore();
    return (React.createElement("div", { className: "flex h-screen bg-gray-50 dark:bg-gray-900" },
        React.createElement(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }),
        React.createElement("div", { className: "flex-1 flex flex-col overflow-hidden" },
            React.createElement(Header, { onToggleSidebar: () => setSidebarOpen(true) }),
            React.createElement("main", { className: "flex-1 overflow-auto bg-gray-50 dark:bg-gray-900" },
                React.createElement("div", { className: "py-6" },
                    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                        React.createElement(Outlet, null))))),
        React.createElement(ToastContainer, { toasts: toasts, onRemove: removeToast })));
};
