import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowUpIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { AlertCardProps } from '../../types/alerts';

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onResolve,
  onEscalate,
  onSelect,
  isSelected = false,
  compact = false,
  showActions = true
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'triggered': return 'text-red-600 bg-red-50';
      case 'acknowledged': return 'text-orange-600 bg-orange-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'closed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'triggered': return ExclamationTriangleIcon;
      case 'acknowledged': return ClockIcon;
      case 'resolved': return CheckCircleIcon;
      case 'closed': return CheckCircleIcon;
      default: return ClockIcon;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const StatusIcon = getStatusIcon(alert.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`
        relative overflow-hidden
        ${compact ? 'p-4' : 'p-6'}
        bg-white/80 backdrop-blur-xl
        border border-gray-200/50
        rounded-2xl shadow-sm hover:shadow-md
        transition-all duration-300 ease-out
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}
        group cursor-pointer
      `}
      onClick={() => onSelect?.(alert.id, !isSelected)}
    >
      {/* Priority Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(alert.priority)}`} />
      
      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <CheckCircleIcon className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getStatusColor(alert.status)}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                {alert.summary}
              </h3>
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${getPriorityColor(alert.priority)} text-white
              `}>
                {alert.priority.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {alert.serviceName} • {formatTimeAgo(alert.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {!compact && alert.description && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
            {alert.description}
          </p>
        </div>
      )}

      {/* Metadata Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {alert.ticketId && (
            <div className="flex items-center space-x-1">
              <TagIcon className="w-4 h-4" />
              <span>#{alert.ticketId}</span>
            </div>
          )}
          
          {alert.escalationLevel > 0 && (
            <div className="flex items-center space-x-1 text-orange-600">
              <ArrowUpIcon className="w-4 h-4" />
              <span>L{alert.escalationLevel}</span>
            </div>
          )}

          {alert.acknowledgedBy && (
            <div className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>{alert.acknowledgedBy}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {alert.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            {alert.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
              >
                {tag}
              </span>
            ))}
            {alert.tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{alert.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {alert.status === 'triggered' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAcknowledge?.(alert.id);
                }}
                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Acknowledge
              </motion.button>
            )}

            {alert.status === 'acknowledged' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve?.(alert.id);
                }}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Resolve
              </motion.button>
            )}

            {(alert.status === 'triggered' || alert.status === 'acknowledged') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEscalate?.(alert.id);
                }}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-1"
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span>Escalate</span>
              </motion.button>
            )}
          </div>

          {/* View Details */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              // Handle view details
            }}
          >
            <EyeIcon className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* Live Update Indicator */}
      <AnimatePresence>
        {alert.status === 'triggered' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default AlertCard;
