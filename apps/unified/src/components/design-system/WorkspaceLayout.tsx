import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

export interface WorkspaceTab {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  closeable?: boolean;
}

export interface WorkspaceLayoutProps {
  /** List of workspace tabs */
  tabs: WorkspaceTab[];
  /** Active tab ID */
  activeTabId: string;
  /** Callback when tab changes */
  onTabChange: (tabId: string) => void;
  /** Callback when tab closes */
  onTabClose?: (tabId: string) => void;
  /** Sidebar content (optional) */
  sidebar?: React.ReactNode;
  /** Sidebar initial state */
  sidebarDefaultOpen?: boolean;
  /** Context panel content (optional) */
  contextPanel?: React.ReactNode;
  /** Context panel open state */
  contextPanelOpen?: boolean;
  /** Callback to close context panel */
  onContextPanelClose?: () => void;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  sidebar,
  sidebarDefaultOpen = true,
  contextPanel,
  contextPanelOpen = false,
  onContextPanelClose,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(sidebarDefaultOpen);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebar && sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="relative w-[280px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800"
          >
            {/* Glass background */}
            <div className="absolute inset-0 glass-light dark:glass-dark" />
            
            {/* Sidebar content */}
            <div className="relative h-full overflow-y-auto scrollbar-apple dark:scrollbar-apple-dark p-4">
              {sidebar}
            </div>

            {/* Toggle button */}
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full glass dark:glass-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-400 ease-apple"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="relative h-12 flex-shrink-0 border-b border-gray-200 dark:border-gray-800">
          {/* Glass background */}
          <div className="absolute inset-0 glass-light dark:glass-dark" />
          
          {/* Tabs */}
          <div className="relative h-full flex items-center">
            {/* Sidebar toggle (when closed) */}
            {sidebar && !sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="h-full px-3 flex items-center border-r border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-400 ease-apple"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {/* Tab list */}
            <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                
                return (
                  <div
                    key={tab.id}
                    className="relative flex-shrink-0 group"
                  >
                    <button
                      onClick={() => onTabChange(tab.id)}
                      className={`
                        h-12 px-4 flex items-center gap-2 border-r border-gray-200 dark:border-gray-800
                        font-sf-text text-sm transition-all duration-400 ease-apple
                        ${isActive
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {tab.icon && (
                        <span className="flex-shrink-0">
                          {tab.icon}
                        </span>
                      )}
                      <span className="truncate max-w-[150px]">
                        {tab.title}
                      </span>
                    </button>

                    {/* Close button */}
                    {tab.closeable && onTabClose && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTabClose(tab.id);
                        }}
                        aria-label={`Close ${tab.title} tab`}
                        className={`
                          absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded
                          opacity-0 group-hover:opacity-100 transition-opacity
                          hover:bg-gray-200 dark:hover:bg-gray-700
                          ${isActive ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}
                        `}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue"
                        transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab && (
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
                className="h-full overflow-auto scrollbar-apple dark:scrollbar-apple-dark"
              >
                {activeTab.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Context panel */}
      <AnimatePresence mode="wait">
        {contextPanelOpen && contextPanel && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="relative w-[400px] flex-shrink-0 border-l border-gray-200 dark:border-gray-800 shadow-glass-xl"
          >
            {/* Glass background */}
            <div className="absolute inset-0 glass dark:glass-dark" />
            
            {/* Panel content */}
            <div className="relative h-full flex flex-col">
              {/* Header */}
              <div className="h-12 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-sf-text font-semibold text-gray-900 dark:text-white">
                  Details
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Maximize panel"
                    className="p-1.5 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all duration-400 ease-apple"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onContextPanelClose}
                    aria-label="Close panel"
                    className="p-1.5 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all duration-400 ease-apple"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto scrollbar-apple dark:scrollbar-apple-dark">
                {contextPanel}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * WorkspaceCard - A card component for workspace content
 */
export interface WorkspaceCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = '',
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`glass dark:glass-dark rounded-apple-lg shadow-glass-md ${className}`}>
      {(title || subtitle || actions) && (
        <div className={`flex items-start justify-between gap-4 ${paddingClasses[padding]} border-b border-gray-200 dark:border-gray-700`}>
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm font-sf-text text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={title || subtitle || actions ? paddingClasses[padding] : paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
};
