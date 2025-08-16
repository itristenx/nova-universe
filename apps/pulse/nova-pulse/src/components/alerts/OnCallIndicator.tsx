import React from 'react';
import { motion } from 'framer-motion';
import { UserIcon, PhoneIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { OnCallIndicatorProps } from '../../types/alerts';

const OnCallIndicator: React.FC<OnCallIndicatorProps> = ({
  users,
  schedule,
  size = 'md',
  showDetails = true,
  interactive = true,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getSizeClass = () => sizeClasses[size];

  const formatTimeRange = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const endTime = new Date(end).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${startTime} - ${endTime}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (users.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <div
          className={` ${getSizeClass()} flex items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100`}
        >
          <UserIcon className="h-4 w-4 text-gray-400" />
        </div>
        {showDetails && <span className="text-sm text-gray-500">No one on-call</span>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center space-x-3 ${interactive ? '-mx-2 rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-gray-50' : ''} `}
        >
          {/* Avatar */}
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className={` ${getSizeClass()} rounded-full border-2 object-cover ${user.isBackup ? 'border-orange-300' : 'border-green-300'} `}
              />
            ) : (
              <div
                className={` ${getSizeClass()} rounded-full ${
                  user.isBackup
                    ? 'border-2 border-orange-300 bg-orange-100 text-orange-700'
                    : 'border-2 border-green-300 bg-green-100 text-green-700'
                } flex items-center justify-center font-medium`}
              >
                {getInitials(user.name)}
              </div>
            )}

            {/* Status indicators */}
            <div className="absolute -right-1 -bottom-1">
              {user.isBackup ? (
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-orange-500">
                  <ShieldCheckIcon className="h-2.5 w-2.5 text-white" />
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
          </div>

          {/* User Info */}
          {showDetails && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="truncate font-medium text-gray-900">{user.name}</span>
                {user.isBackup && (
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                    Backup
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {formatTimeRange(user.shiftStart, user.shiftEnd)}
              </div>

              {/* Contact Methods */}
              <div className="mt-1 flex items-center space-x-3">
                {user.phone && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${user.phone}`);
                    }}
                    className="p-1 text-gray-400 transition-colors duration-200 hover:text-blue-600"
                    title={`Call ${user.phone}`}
                  >
                    <PhoneIcon className="h-4 w-4" />
                  </motion.button>
                )}

                {user.email && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`mailto:${user.email}`);
                    }}
                    className="p-1 text-gray-400 transition-colors duration-200 hover:text-blue-600"
                    title={`Email ${user.email}`}
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {/* Multiple users summary */}
      {!showDetails && users.length > 1 && (
        <div className="text-xs text-gray-500">+{users.length - 1} more on-call</div>
      )}
    </div>
  );
};

export default OnCallIndicator;
