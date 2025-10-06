import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2, LucideIcon } from 'lucide-react';

export type DynamicIslandVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface DynamicIslandNotification {
  id: string;
  variant: DynamicIslandVariant;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // Auto-dismiss after ms (0 = no auto-dismiss)
  icon?: LucideIcon;
}

export interface DynamicIslandProps {
  notifications: DynamicIslandNotification[];
  onDismiss: (id: string) => void;
  position?: 'top' | 'bottom';
  maxVisible?: number;
}

const variantStyles = {
  success: {
    bg: 'bg-success-500/90 dark:bg-success-600/90',
    icon: CheckCircle,
    iconColor: 'text-white',
  },
  error: {
    bg: 'bg-error-500/90 dark:bg-error-600/90',
    icon: AlertCircle,
    iconColor: 'text-white',
  },
  warning: {
    bg: 'bg-warning-500/90 dark:bg-warning-600/90',
    icon: AlertTriangle,
    iconColor: 'text-white',
  },
  info: {
    bg: 'bg-apple-blue/90 dark:bg-apple-blue-dark/90',
    icon: Info,
    iconColor: 'text-white',
  },
  loading: {
    bg: 'bg-gray-800/90 dark:bg-gray-900/90',
    icon: Loader2,
    iconColor: 'text-white',
  },
};

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  notifications,
  onDismiss,
  position = 'top',
  maxVisible = 3,
}) => {
  const visibleNotifications = notifications.slice(0, maxVisible);
  const positionClasses = position === 'top' ? 'top-6' : 'bottom-6';

  return (
    <div className={`fixed ${positionClasses} left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none`}>
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification, index) => (
          <DynamicIslandItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
            index={index}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface DynamicIslandItemProps {
  notification: DynamicIslandNotification;
  onDismiss: (id: string) => void;
  index: number;
  position: 'top' | 'bottom';
}

const DynamicIslandItem: React.FC<DynamicIslandItemProps> = ({
  notification,
  onDismiss,
  index,
  position,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(100);

  const variant = variantStyles[notification.variant];
  const Icon = notification.icon || variant.icon;

  // Auto-dismiss logic
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (notification.duration! / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            onDismiss(notification.id);
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [notification.duration, notification.id, onDismiss]);

  // Auto-expand first notification
  useEffect(() => {
    if (index === 0 && notification.message) {
      setIsExpanded(true);
      const timer = setTimeout(() => setIsExpanded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [index, notification.message]);

  const yOffset = position === 'top' ? index * -10 : index * 10;

  return (
    <motion.div
      layout
      initial={{ 
        opacity: 0, 
        scale: 0.8,
        y: position === 'top' ? -20 : 20,
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: yOffset,
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.8,
        x: 100,
      }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0.0, 0.2, 1],
        layout: { duration: 0.3 }
      }}
      onMouseEnter={() => notification.message && setIsExpanded(true)}
      onMouseLeave={() => notification.message && setIsExpanded(false)}
      className="pointer-events-auto"
      style={{ zIndex: 100 - index }}
    >
      <motion.div
        layout
        className={`
          ${variant.bg} backdrop-blur-apple-lg
          rounded-full shadow-glass-xl overflow-hidden
          transition-all duration-400 ease-apple
        `}
      >
        <div className="relative">
          {/* Compact state */}
          <motion.div
            layout
            className="flex items-center gap-3 px-6 py-3"
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {notification.variant === 'loading' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Icon className={`w-5 h-5 ${variant.iconColor}`} />
                </motion.div>
              ) : (
                <Icon className={`w-5 h-5 ${variant.iconColor}`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-sf-text font-semibold text-white truncate">
                {notification.title}
              </p>
              
              <AnimatePresence>
                {isExpanded && notification.message && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                    className="text-xs font-sf-text text-white/90 mt-1 overflow-hidden"
                  >
                    {notification.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Action button */}
            {notification.action && (
              <motion.button
                layout
                onClick={notification.action.onClick}
                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-sf-text font-medium transition-all duration-400 ease-apple hover-lift-sm"
              >
                {notification.action.label}
              </motion.button>
            )}

            {/* Close button */}
            <button
              onClick={() => onDismiss(notification.id)}
              aria-label="Dismiss notification"
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-all duration-400 ease-apple"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </motion.div>

          {/* Progress bar */}
          {notification.duration && notification.duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-white/30"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Hook to manage Dynamic Island notifications
 */
export const useDynamicIsland = () => {
  const [notifications, setNotifications] = useState<DynamicIslandNotification[]>([]);

  const show = (notification: Omit<DynamicIslandNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
    return id;
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  const success = (title: string, message?: string, duration = 3000) => {
    return show({ variant: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration = 5000) => {
    return show({ variant: 'error', title, message, duration });
  };

  const warning = (title: string, message?: string, duration = 4000) => {
    return show({ variant: 'warning', title, message, duration });
  };

  const info = (title: string, message?: string, duration = 3000) => {
    return show({ variant: 'info', title, message, duration });
  };

  const loading = (title: string, message?: string) => {
    return show({ variant: 'loading', title, message, duration: 0 });
  };

  return {
    notifications,
    show,
    dismiss,
    dismissAll,
    success,
    error,
    warning,
    info,
    loading,
  };
};
