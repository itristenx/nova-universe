import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudIcon,
  SignalIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { connectionService, type ConnectionStatus } from '@services/connectionService';

interface ConnectionStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  onRetry?: () => void;
}

export function ConnectionStatusIndicator({
  className = '',
  showDetails = false,
  onRetry,
}: ConnectionStatusIndicatorProps) {
  const [status, setStatus] = useState<ConnectionStatus>(connectionService.getStatus());
  const [showDetailedStatus, setShowDetailedStatus] = useState(false);

  useEffect(() => {
    const unsubscribe = connectionService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const getStatusColor = () => {
    if (!status.isOnline) return 'text-red-500';
    if (!status.isAPIConnected) return 'text-orange-500';

    switch (status.quality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'poor':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return ExclamationTriangleIcon;
    if (!status.isAPIConnected) return ArrowPathIcon;

    switch (status.quality) {
      case 'excellent':
      case 'good':
        return CheckCircleIcon;
      case 'poor':
        return SignalIcon;
      default:
        return WifiIcon;
    }
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (!status.isAPIConnected) return 'Connecting...';

    switch (status.quality) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'poor':
        return 'Poor';
      default:
        return 'Connected';
    }
  };

  const StatusIcon = getStatusIcon();

  if (status.isOnline && status.isAPIConnected && !showDetails) {
    return null; // Don't show indicator when everything is working fine
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowDetailedStatus(!showDetailedStatus)}
          className="flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-3 py-1 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <motion.div
            animate={{ rotate: status.isAPIConnected ? 0 : 360 }}
            transition={{
              duration: 2,
              repeat: status.isAPIConnected ? 0 : Infinity,
              ease: 'linear',
            }}
          >
            <StatusIcon className={`h-4 w-4 ${getStatusColor()}`} />
          </motion.div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
          {status.latency && <span className="text-xs text-gray-500">{status.latency}ms</span>}
        </button>

        {onRetry && !status.isAPIConnected && (
          <button
            onClick={onRetry}
            title="Retry connection"
            aria-label="Retry connection"
            className="rounded-full bg-blue-500 p-1 text-white transition-colors hover:bg-blue-600"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDetailedStatus && (
          <div className="absolute top-full left-0 z-50 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="min-w-[250px] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Connection Status
                </span>
                <div className="flex items-center space-x-1">
                  <div
                    className={`h-2 w-2 rounded-full ${status.isAPIConnected ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span className="text-xs text-gray-500">
                    {status.isAPIConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-gray-500">Network</div>
                  <div className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
                    {status.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">API</div>
                  <div className={status.isAPIConnected ? 'text-green-600' : 'text-red-600'}>
                    {status.isAPIConnected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
                {status.latency && (
                  <div>
                    <div className="text-gray-500">Latency</div>
                    <div className="text-gray-700 dark:text-gray-300">{status.latency}ms</div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500">Quality</div>
                  <div className={getStatusColor()}>{status.quality}</div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Last checked: {status.lastCheck.toLocaleTimeString()}
              </div>

              {status.retryCount > 0 && (
                <div className="text-xs text-orange-500">Retry attempts: {status.retryCount}</div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OfflineScreenProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function OfflineScreen({ onRetry, isRetrying }: OfflineScreenProps) {
  const [status, setStatus] = useState<ConnectionStatus>(connectionService.getStatus());

  useEffect(() => {
    const unsubscribe = connectionService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      await connectionService.forceCheck();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            {!status.isOnline ? (
              <WifiIcon className="h-10 w-10 text-white" />
            ) : (
              <CloudIcon className="h-10 w-10 text-white" />
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {!status.isOnline ? 'No Internet Connection' : 'Connecting to Nova Universe'}
        </h1>

        {/* Description */}
        <p className="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
          {!status.isOnline
            ? 'Please check your internet connection and try again.'
            : "We're establishing a secure connection to our servers. This usually takes just a moment."}
        </p>

        {/* Status Indicator */}
        <div className="mb-8">
          {status.isAPIConnected ? (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <ArrowPathIcon className="h-5 w-5 text-blue-500" />
              </motion.div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isRetrying ? 'Retrying...' : 'Connecting...'}
              </span>
            </div>
          )}
        </div>

        {/* Retry Button */}
        {!status.isAPIConnected && (
          <div>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex transform items-center space-x-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-colors hover:scale-105 hover:bg-blue-700 hover:shadow-xl disabled:transform-none disabled:bg-blue-400"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
            </button>
          </div>
        )}

        {/* Connection Details */}
        <div className="mt-8 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Network Status</div>
              <div className={`font-medium ${status.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {status.isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Server Status</div>
              <div
                className={`font-medium ${status.isAPIConnected ? 'text-green-600' : 'text-red-600'}`}
              >
                {status.isAPIConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>

          {status.retryCount > 0 && (
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Retry attempts: {status.retryCount}
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          Having trouble? Contact your system administrator.
        </div>
      </div>
    </div>
  );
}
