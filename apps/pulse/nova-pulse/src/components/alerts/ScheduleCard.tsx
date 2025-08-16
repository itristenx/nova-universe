import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Schedule, ScheduleCardProps } from '../../types/alerts';
import OnCallIndicator from './OnCallIndicator';

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onScheduleSelect,
  onOverrideCreate,
  onRotateNow,
  showCurrentOnly = false,
  compact = false,
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
      className={`relative overflow-hidden ${compact ? 'p-4' : 'p-6'} group cursor-pointer rounded-2xl border border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300 ease-out hover:shadow-md`}
      onClick={() => onScheduleSelect?.(schedule)}
    >
      {/* Status Indicator */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`rounded-full p-2 ${getStatusColor()}`}>
            <StatusIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base leading-tight font-semibold text-gray-900">{schedule.name}</h3>
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
              className="rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600"
              title="Rotate now"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Description */}
      {!compact && schedule.description && (
        <div className="mb-4">
          <p className="text-sm leading-relaxed text-gray-700">{schedule.description}</p>
        </div>
      )}

      {/* Current On-Call */}
      {schedule.currentOnCall.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
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
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Next On-Call</span>
            <span className="text-xs text-gray-500">
              {formatDate(schedule.nextOnCall[0]?.shiftStart)} at{' '}
              {formatTime(schedule.nextOnCall[0]?.shiftStart)}
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
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">No one currently on-call</span>
          </div>
          <p className="mt-1 text-xs text-red-700">Alerts may not be delivered properly</p>
        </div>
      )}

      {/* Quick Actions */}
      {!compact && schedule.userCanEdit && (
        <div className="flex items-center space-x-2 border-t border-gray-100 pt-4">
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
                reason: '',
              });
            }}
            className="flex items-center space-x-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-600"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Override</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onRotateNow?.(schedule.id);
            }}
            className="flex items-center space-x-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-orange-600"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Rotate</span>
          </motion.button>
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-purple-500/5" />
    </motion.div>
  );
};

export default ScheduleCard;
