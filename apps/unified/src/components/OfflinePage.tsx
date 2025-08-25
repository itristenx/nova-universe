import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SignalSlashIcon,
} from '@heroicons/react/24/outline';

interface OfflinePageProps {
  className?: string;
}

export default function OfflinePage({ className = '' }: OfflinePageProps) {
  const { t } = useTranslation(['app', 'common']);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [lastTryTime, setLastTryTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRetryCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setLastTryTime(new Date());

    // Force a network check
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const formatLastTryTime = () => {
    if (!lastTryTime) return '';

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastTryTime.getTime()) / 1000);

    if (diff < 60) {
      return t('app.offline.lastTrySeconds', { seconds: diff });
    } else {
      const minutes = Math.floor(diff / 60);
      return t('app.offline.lastTryMinutes', { minutes });
    }
  };

  if (isOnline) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900 ${className}`}
      >
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
          <div className="mb-4 flex justify-center">
            <WifiIcon className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            {t('app.offline.backOnline')}
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {t('app.offline.connectionRestored')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700"
          >
            {t('app.offline.continue')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900 ${className}`}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex justify-center">
          <SignalSlashIcon className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          {t('app.offline.title')}
        </h1>

        <p className="mb-6 text-gray-600 dark:text-gray-400">{t('app.offline.description')}</p>

        {/* Connection Status */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{t('app.offline.noConnection')}</span>
          </div>

          {retryCount > 0 && lastTryTime && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              {t('app.offline.retryAttempts', { count: retryCount })} • {formatLastTryTime()}
            </div>
          )}
        </div>

        {/* Offline Features */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
            {t('app.offline.availableFeatures')}
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>{t('app.offline.feature.viewCachedData')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>{t('app.offline.feature.readKnowledgeBase')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span>{t('app.offline.feature.submitFormsOffline')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span>{t('app.offline.feature.realTimeUpdates')}</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>{t('app.offline.tryAgain')}</span>
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            {t('common.goBack')}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-xs text-blue-800 dark:text-blue-200">💡 {t('app.offline.tip')}</p>
        </div>
      </div>
    </div>
  );
}

// Hook for detecting online/offline status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // User came back online
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
  };
}
