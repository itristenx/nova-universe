import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Ticket, 
  Package, 
  BookOpen, 
  Zap, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  User,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@stores/auth';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
  children?: NavigationItem[];
}

interface LiquidGlassShellProps {
  children?: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { 
    id: 'itsm', 
    label: 'Service Desk', 
    icon: Ticket, 
    path: '/itsm',
    children: [
      { id: 'tickets', label: 'Tickets', icon: Ticket, path: '/itsm/tickets' },
      { id: 'service-catalog', label: 'Service Catalog', icon: Package, path: '/itsm/service-catalog' },
      { id: 'approvals', label: 'Approvals', icon: ChevronRight, path: '/itsm/approvals' },
    ]
  },
  { id: 'assets', label: 'Assets', icon: Package, path: '/assets' },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen, path: '/knowledge' },
  { id: 'workflows', label: 'Workflows', icon: Zap, path: '/workflows' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles, path: '/ai/cosmo' },
];

export const LiquidGlassShell: React.FC<LiquidGlassShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['itsm']);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Cmd/Ctrl + B for sidebar toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Glassmorphic Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="relative w-[280px] flex-shrink-0"
          >
            {/* Glass background */}
            <div className="absolute inset-0 glass dark:glass-dark" />
            
            {/* Sidebar content */}
            <div className="relative h-full flex flex-col p-4 overflow-hidden">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8 px-3">
                <div className="w-10 h-10 rounded-apple bg-gradient-nova flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white">
                    Nova Universe
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-sf-text">
                    Enterprise Service Management
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto scrollbar-apple dark:scrollbar-apple-dark space-y-1">
                {navigationItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (item.children) {
                          toggleExpanded(item.id);
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-apple-sm
                        font-sf-text text-sm transition-all duration-400 ease-apple
                        ${isActiveRoute(item.path)
                          ? 'bg-apple-blue text-white shadow-apple'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-apple-red text-white text-xs font-medium">
                          {item.badge}
                        </span>
                      )}
                      {item.children && (
                        <ChevronRight 
                          className={`w-4 h-4 transition-transform duration-400 ${
                            expandedItems.includes(item.id) ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* Submenu */}
                    <AnimatePresence>
                      {item.children && expandedItems.includes(item.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                          className="ml-6 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => navigate(child.path)}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2 rounded-apple-sm
                                font-sf-text text-sm transition-all duration-400 ease-apple
                                ${isActiveRoute(child.path)
                                  ? 'bg-apple-blue/10 text-apple-blue dark:text-apple-blue-dark'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
                              `}
                            >
                              <child.icon className="w-4 h-4" />
                              <span>{child.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>

              {/* User profile */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-400 ease-apple">
                  <div className="w-8 h-8 rounded-full bg-gradient-apple flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-sf-text font-medium text-gray-900 dark:text-white">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email || 'user@nova.com'}
                    </p>
                  </div>
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation bar with glassmorphism */}
        <header className="relative h-16 flex-shrink-0 border-b border-gray-200 dark:border-gray-800">
          {/* Glass background */}
          <div className="absolute inset-0 glass dark:glass-dark" />
          
          {/* Header content */}
          <div className="relative h-full flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-400 ease-apple"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Search bar */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-apple bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-400 ease-apple min-w-[300px]"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400 font-sf-text">
                  Search... (⌘K)
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button 
                aria-label="View notifications"
                className="relative p-2 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-400 ease-apple"
              >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-apple-red rounded-full" />
              </button>

              {/* User menu */}
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-400 ease-apple">
                <div className="w-7 h-7 rounded-full bg-gradient-apple flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-sf-text font-medium text-gray-700 dark:text-gray-300">
                  {user?.firstName || 'User'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          {children || <Outlet />}
        </main>
      </div>

      {/* Global search modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[100]"
            >
              <div className="glass dark:glass-dark rounded-apple-lg shadow-glass-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets, knowledge, assets..."
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white font-sf-text text-lg placeholder-gray-400"
                  />
                  <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs font-sf-mono text-gray-600 dark:text-gray-400">
                    ESC
                  </kbd>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-sf-text">
                    Start typing to search across all modules...
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
