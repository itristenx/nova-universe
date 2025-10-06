import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

export interface ContextPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel is closed */
  onClose: () => void;
  /** Panel title */
  title?: string;
  /** Panel subtitle or breadcrumb */
  subtitle?: string;
  /** Panel content */
  children: React.ReactNode;
  /** Width of the panel - 'sm' (400px), 'md' (600px), 'lg' (800px), 'xl' (1000px), 'full' */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Show maximize/minimize button */
  resizable?: boolean;
  /** Additional actions in the header */
  headerActions?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
}

const sizeClasses = {
  sm: 'w-[400px]',
  md: 'w-[600px]',
  lg: 'w-[800px]',
  xl: 'w-[1000px]',
  full: 'w-[calc(100vw-280px)]',
};

export const ContextPanel: React.FC<ContextPanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  resizable = false,
  headerActions,
  footer,
  loading = false,
}) => {
  const [isMaximized, setIsMaximized] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const panelWidth = isMaximized ? 'w-[calc(100vw-280px)]' : sizeClasses[size];

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80]"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.4, 0.0, 0.2, 1],
              opacity: { duration: 0.25 }
            }}
            className={`fixed top-0 right-0 h-full ${panelWidth} flex flex-col z-[90] shadow-glass-xl`}
          >
            {/* Glass background */}
            <div className="absolute inset-0 glass dark:glass-dark rounded-l-apple-lg" />

            {/* Panel content */}
            <div className="relative flex flex-col h-full">
              {/* Header */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {subtitle && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-sf-text text-gray-500 dark:text-gray-400">
                          {subtitle}
                        </span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    )}
                    {title && (
                      <h2 className="text-xl font-sf-display font-semibold text-gray-900 dark:text-white truncate">
                        {title}
                      </h2>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {headerActions}
                    
                    {resizable && (
                      <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        aria-label={isMaximized ? 'Minimize panel' : 'Maximize panel'}
                        className="p-2 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-400 ease-apple text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {isMaximized ? (
                          <Minimize2 className="w-5 h-5" />
                        ) : (
                          <Maximize2 className="w-5 h-5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      aria-label="Close panel"
                      className="p-2 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-400 ease-apple text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto scrollbar-apple dark:scrollbar-apple-dark">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-3 border-apple-blue border-t-transparent rounded-full mx-auto mb-3"
                      />
                      <p className="text-sm font-sf-text text-gray-500 dark:text-gray-400">
                        Loading...
                      </p>
                    </div>
                  </div>
                ) : (
                  children
                )}
              </div>

              {/* Footer */}
              {footer && (
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * ContextPanelSection - A section within a context panel
 */
export interface ContextPanelSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const ContextPanelSection: React.FC<ContextPanelSectionProps> = ({
  title,
  children,
  className = '',
  collapsible = false,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 last:border-0 ${className}`}>
      {title && (
        <button
          onClick={() => collapsible && setIsExpanded(!isExpanded)}
          disabled={!collapsible}
          className={`w-full px-6 py-3 flex items-center justify-between ${
            collapsible ? 'hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer' : 'cursor-default'
          } transition-all duration-400 ease-apple`}
        >
          <h3 className="text-sm font-sf-text font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
            {title}
          </h3>
          {collapsible && (
            <ChevronRight 
              className={`w-4 h-4 text-gray-400 transition-transform duration-400 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          )}
        </button>
      )}
      
      <AnimatePresence initial={false}>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className={title ? 'px-6 py-4' : 'p-6'}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * ContextPanelField - A field display within a context panel
 */
export interface ContextPanelFieldProps {
  label: string;
  value: React.ReactNode;
  inline?: boolean;
  className?: string;
}

export const ContextPanelField: React.FC<ContextPanelFieldProps> = ({
  label,
  value,
  inline = false,
  className = '',
}) => {
  return (
    <dl className={`${inline ? 'flex items-center justify-between gap-4' : 'space-y-1'} ${className}`}>
      <dt className="text-xs font-sf-text font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm font-sf-text text-gray-900 dark:text-white">
        {value}
      </dd>
    </dl>
  );
};
