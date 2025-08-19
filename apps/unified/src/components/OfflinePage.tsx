import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  WifiIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  SignalSlashIcon 
} from '@heroicons/react/24/outline'

interface OfflinePageProps {
  className?: string
}

export default function OfflinePage({ className = '' }: OfflinePageProps) {
  const { t } = useTranslation(['app', 'common'])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [retryCount, setRetryCount] = useState(0)
  const [lastTryTime, setLastTryTime] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setRetryCount(0)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setLastTryTime(new Date())
    
    // Force a network check
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  const formatLastTryTime = () => {
    if (!lastTryTime) return ''
    
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastTryTime.getTime()) / 1000)
    
    if (diff < 60) {
      return t('app.offline.lastTrySeconds', { seconds: diff })
    } else {
      const minutes = Math.floor(diff / 60)
      return t('app.offline.lastTryMinutes', { minutes })
    }
  }

  if (isOnline) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 ${className}`}>
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <WifiIcon className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('app.offline.backOnline')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('app.offline.connectionRestored')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {t('app.offline.continue')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <SignalSlashIcon className="w-16 h-16 text-red-500" />
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('app.offline.title')}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('app.offline.description')}
        </p>

        {/* Connection Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <ExclamationTriangleIcon className="w-4 h-4" />
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
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('app.offline.availableFeatures')}
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('app.offline.feature.viewCachedData')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('app.offline.feature.readKnowledgeBase')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>{t('app.offline.feature.submitFormsOffline')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{t('app.offline.feature.realTimeUpdates')}</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>{t('app.offline.tryAgain')}</span>
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {t('common.goBack')}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            💡 {t('app.offline.tip')}
          </p>
        </div>
      </div>
    </div>
  )
}

// Hook for detecting online/offline status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        // User came back online
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return {
    isOnline,
    wasOffline
  }
}
