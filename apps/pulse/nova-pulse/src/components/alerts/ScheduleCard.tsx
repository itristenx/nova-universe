import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Schedule, ScheduleCardProps } from '../../types/alerts';
import OnCallIndicator from './OnCallIndicator';

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onScheduleSelect,
  onOverrideCreate,
  onRotateNow,
  showCurrentOnly = false,
  compact = false
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (!schedule.enabled) return 'text-gray-500 bg-gray-100';
    if (schedule.currentOnCall.length === 0) return 'text-red-600 bg-red-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusIcon = () => {
    if (!schedule.enabled) return ClockIcon;
    if (schedule.currentOnCall.length === 0) return ExclamationTriangleIcon;
    return CheckCircleIcon;
  };

  const StatusIcon = getStatusIcon();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`
        relative overflow-hidden
        ${compact ? 'p-4' : 'p-6'}
        bg-white/80 backdrop-blur-xl
        border border-gray-200/50
        rounded-2xl shadow-sm hover:shadow-md
        transition-all duration-300 ease-out
        group cursor-pointer
      `}
      onClick={() => onScheduleSelect?.(schedule)}
    >
      {/* Status Indicator */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getStatusColor()}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-tight">
              {schedule.name}
            </h3>
            <p className="text-sm text-gray-600">
              {schedule.timeZone} • {schedule.enabled ? 'Active' : 'Disabled'}
            </p>
          </div>
        </div>

        {schedule.userCanEdit && (
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onRotateNow?.(schedule.id);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Rotate now"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Description */}
      {!compact && schedule.description && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {schedule.description}
          </p>
        </div>
      )}

      {/* Current On-Call */}
      {schedule.currentOnCall.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Currently On-Call</span>
            {!compact && (
              <span className="text-xs text-gray-500">
                Until {formatTime(schedule.currentOnCall[0]?.shiftEnd)}
              </span>
            )}
          </div>
          
          <OnCallIndicator
            users={schedule.currentOnCall}
            schedule={schedule}
            size={compact ? 'sm' : 'md'}
            showDetails={!compact}
          />
        </div>
      )}

      {/* Next On-Call */}
      {!showCurrentOnly && !compact && schedule.nextOnCall.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Next On-Call</span>
            <span className="text-xs text-gray-500">
              {formatDate(schedule.nextOnCall[0]?.shiftStart)} at {formatTime(schedule.nextOnCall[0]?.shiftStart)}
            </span>
          </div>
          
          <OnCallIndicator
            users={schedule.nextOnCall}
            schedule={schedule}
            size="sm"
            showDetails={false}
          />
        </div>
      )}

      {/* No one on call warning */}
      {schedule.enabled && schedule.currentOnCall.length === 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">
              No one currently on-call
            </span>
          </div>
          <p className="text-xs text-red-700 mt-1">
            Alerts may not be delivered properly
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {!compact && schedule.userCanEdit && (
        <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle create override
              onOverrideCreate?.({
                scheduleId: schedule.id,
                userId: '', // Would be selected from a modal
                start: new Date().toISOString(),
                end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                reason: ''
              });
            }}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-1"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Override</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onRotateNow?.(schedule.id);
            }}
            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-1"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Rotate</span>
          </motion.button>
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default ScheduleCard;
