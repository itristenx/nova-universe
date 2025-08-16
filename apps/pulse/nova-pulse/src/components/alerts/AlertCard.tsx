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
  showActions = true,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'triggered':
        return 'text-red-600 bg-red-50';
      case 'acknowledged':
        return 'text-orange-600 bg-orange-50';
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'closed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'triggered':
        return ExclamationTriangleIcon;
      case 'acknowledged':
        return ClockIcon;
      case 'resolved':
        return CheckCircleIcon;
      case 'closed':
        return CheckCircleIcon;
      default:
        return ClockIcon;
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
      className={`relative overflow-hidden ${compact ? 'p-4' : 'p-6'} rounded-2xl border border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300 ease-out hover:shadow-md ${isSelected ? 'bg-blue-50/30 ring-2 ring-blue-500' : ''} group cursor-pointer`}
      onClick={() => onSelect?.(alert.id, !isSelected)}
    >
      {/* Priority Indicator */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${getPriorityColor(alert.priority)}`} />

      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500"
          >
            <CheckCircleIcon className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`rounded-full p-2 ${getStatusColor(alert.status)}`}>
            <StatusIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base leading-tight font-semibold text-gray-900">
                {alert.summary}
              </h3>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(alert.priority)} text-white`}
              >
                {alert.priority.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {alert.serviceName} • {formatTimeAgo(alert.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {!compact && alert.description && (
        <div className="mb-4">
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-700">{alert.description}</p>
        </div>
      )}

      {/* Metadata Row */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {alert.ticketId && (
            <div className="flex items-center space-x-1">
              <TagIcon className="h-4 w-4" />
              <span>#{alert.ticketId}</span>
            </div>
          )}

          {alert.escalationLevel > 0 && (
            <div className="flex items-center space-x-1 text-orange-600">
              <ArrowUpIcon className="h-4 w-4" />
              <span>L{alert.escalationLevel}</span>
            </div>
          )}

          {alert.acknowledgedBy && (
            <div className="flex items-center space-x-1">
              <UserIcon className="h-4 w-4" />
              <span>{alert.acknowledgedBy}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {alert.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            {alert.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {tag}
              </span>
            ))}
            {alert.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{alert.tags.length - 2}</span>
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
                className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-orange-600"
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
                className="rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-600"
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
                className="flex items-center space-x-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-600"
              >
                <ArrowUpIcon className="h-4 w-4" />
                <span>Escalate</span>
              </motion.button>
            )}
          </div>

          {/* View Details */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              // Handle view details
            }}
          >
            <EyeIcon className="h-5 w-5" />
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
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-purple-500/5" />
    </motion.div>
  );
};

export default AlertCard;
