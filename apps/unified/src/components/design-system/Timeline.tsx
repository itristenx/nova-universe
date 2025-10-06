import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User,
  FileText,
  Upload,
  Download,
  Link as LinkIcon,
  Settings,
  LucideIcon
} from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'comment' | 'status_change' | 'assignment' | 'attachment' | 'system' | 'edit';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
  icon?: LucideIcon;
  iconColor?: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
  emptyMessage?: string;
  showRelativeTime?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
}

const eventIcons: Record<string, LucideIcon> = {
  comment: MessageSquare,
  status_change: CheckCircle,
  assignment: User,
  attachment: Upload,
  system: Settings,
  edit: Edit,
};

const eventColors: Record<string, string> = {
  comment: 'text-apple-blue',
  status_change: 'text-success-500',
  assignment: 'text-apple-purple',
  attachment: 'text-apple-orange',
  system: 'text-gray-500',
  edit: 'text-warning-500',
};

const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

export const Timeline: React.FC<TimelineProps> = ({
  events,
  loading = false,
  emptyMessage = 'No activity yet',
  showRelativeTime = true,
  onEventClick,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm font-sf-text text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Timeline line */}
      <div className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />

      {/* Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = event.icon || eventIcons[event.type] || MessageSquare;
          const iconColor = event.iconColor || eventColors[event.type] || 'text-gray-500';

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: [0.4, 0.0, 0.2, 1] 
              }}
              onClick={() => onEventClick?.(event)}
              className={`relative flex gap-4 ${onEventClick ? 'cursor-pointer' : ''}`}
            >
              {/* Icon */}
              <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center ${iconColor} shadow-glass-sm`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="glass dark:glass-dark rounded-apple-lg p-4 hover:shadow-glass-md transition-all duration-400 ease-apple">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-sf-text font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h4>
                      {event.user && (
                        <div className="flex items-center gap-2 mt-1">
                          {event.user.avatar ? (
                            <img
                              src={event.user.avatar}
                              alt={event.user.name}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gradient-apple flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <span className="text-xs font-sf-text text-gray-600 dark:text-gray-400">
                            {event.user.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <time className="flex-shrink-0 text-xs font-sf-text text-gray-500 dark:text-gray-400">
                      {showRelativeTime 
                        ? getRelativeTime(event.timestamp)
                        : new Date(event.timestamp).toLocaleString()
                      }
                    </time>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-sm font-sf-text text-gray-600 dark:text-gray-300 mt-2">
                      {event.description}
                    </p>
                  )}

                  {/* Metadata */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <dl className="grid grid-cols-2 gap-2">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-xs font-sf-text font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              {key}
                            </dt>
                            <dd className="text-sm font-sf-text text-gray-900 dark:text-white mt-0.5">
                              {String(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * TimelineItem - Individual timeline event (for custom timeline implementations)
 */
export interface TimelineItemProps {
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  children?: React.ReactNode;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  icon: Icon = MessageSquare,
  iconColor = 'text-gray-500',
  title,
  description,
  timestamp,
  user,
  children,
  isLast = false,
}) => {
  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
      )}

      {/* Icon */}
      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center ${iconColor} shadow-glass-sm`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-sf-text font-semibold text-gray-900 dark:text-white">
              {title}
            </h4>
            {user && (
              <div className="flex items-center gap-2 mt-1">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-apple flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="text-xs font-sf-text text-gray-600 dark:text-gray-400">
                  {user.name}
                </span>
              </div>
            )}
          </div>

          <time className="flex-shrink-0 text-xs font-sf-text text-gray-500 dark:text-gray-400">
            {getRelativeTime(timestamp)}
          </time>
        </div>

        {description && (
          <p className="text-sm font-sf-text text-gray-600 dark:text-gray-300 mt-2">
            {description}
          </p>
        )}

        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
