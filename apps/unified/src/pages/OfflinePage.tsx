import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { WifiOff, RefreshCw, Smartphone, Download, Bell, Clock, RotateCcw } from 'lucide-react'

interface CachedItem {
  type: 'ticket' | 'notification' | 'asset' | 'user'
  id: string
  title?: string
  message?: string
  status?: string
  time?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

interface PendingAction {
  id: string
  type: 'create_ticket' | 'update_profile' | 'submit_form'
  description: string
  timestamp: string
  data: Record<string, unknown>
}

export default function OfflinePage() {
  const { t } = useTranslation(['offline', 'common'])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [cachedData, setCachedData] = useState<CachedItem[]>([])
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [retryAttempts, setRetryAttempts] = useState(0)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      syncPendingActions()
    }
    
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load cached data and pending actions
    loadCachedData()
    loadPendingActions()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadCachedData = async () => {
    try {
      // Simulate loading cached data from IndexedDB
      const mockCachedData: CachedItem[] = [
        {
          type: 'ticket',
          id: 'TK-001',
          title: 'Password Reset Request',
          status: 'In Progress',
          time: '2025-01-19T10:30:00Z',
          priority: 'medium'
        },
        {
          type: 'ticket',
          id: 'TK-002',
          title: 'Hardware Request - Monitor',
          status: 'Pending',
          time: '2025-01-19T09:15:00Z',
          priority: 'low'
        },
        {
          type: 'notification',
          id: 'N-001',
          message: 'Your ticket TK-001 has been updated',
          time: '2025-01-19T11:00:00Z'
        },
        {
          type: 'notification',
          id: 'N-002',
          message: 'System maintenance scheduled for tonight',
          time: '2025-01-19T08:45:00Z'
        },
        {
          type: 'asset',
          id: 'A-001',
          title: 'MacBook Pro - Checked Out',
          status: 'Active',
          time: '2025-01-18T14:20:00Z'
        },
        {
          type: 'user',
          id: 'U-001',
          title: 'Profile Information',
          status: 'Cached',
          time: '2025-01-19T12:00:00Z'
        }
      ]
      
      setCachedData(mockCachedData)
    } catch (error) {
      console.error('Failed to load cached data:', error)
    }
  }

  const loadPendingActions = async () => {
    try {
      // Simulate loading pending actions from IndexedDB
      const mockPendingActions: PendingAction[] = [
        {
          id: 'PA-001',
          type: 'create_ticket',
          description: 'Submit new IT support request',
          timestamp: '2025-01-19T12:30:00Z',
          data: { title: 'Laptop issue', category: 'hardware' }
        },
        {
          id: 'PA-002',
          type: 'update_profile',
          description: 'Update contact information',
          timestamp: '2025-01-19T11:45:00Z',
          data: { phone: '+1234567890' }
        }
      ]
      
      setPendingActions(mockPendingActions)
    } catch (error) {
      console.error('Failed to load pending actions:', error)
    }
  }

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return

    try {
      setRetryAttempts(prev => prev + 1)
      
      // Simulate syncing pending actions
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear pending actions after successful sync
      setPendingActions([])
      setLastSync(new Date())
      setRetryAttempts(0)
      
      // Refresh cached data
      loadCachedData()
      
    } catch (error) {
      console.error('Sync failed:', error)
      // Will retry automatically when online
    }
  }

  const retrySync = () => {
    if (isOnline) {
      syncPendingActions()
    }
  }

  const clearCache = async () => {
    try {
      // Clear cached data
      setCachedData([])
      // In a real implementation, this would clear IndexedDB
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffInMinutes < 1) return t('offline.justNow', 'Just now')
    if (diffInMinutes < 60) return t('offline.minutesAgo', '{{count}} minutes ago', { count: diffInMinutes })
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return t('offline.hoursAgo', '{{count}} hours ago', { count: diffInHours })
    
    const diffInDays = Math.floor(diffInHours / 24)
    return t('offline.daysAgo', '{{count}} days ago', { count: diffInDays })
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return '🎫'
      case 'notification':
        return '📢'
      case 'asset':
        return '💻'
      case 'user':
        return '👤'
      default:
        return '📄'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isOnline ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }`}>
            {isOnline ? (
              <div className="h-6 w-6 rounded-full bg-green-500" />
            ) : (
              <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isOnline ? t('offline.onlineTitle', 'You\'re Online') : t('offline.offlineTitle', 'You\'re Offline')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isOnline 
                ? t('offline.onlineDescription', 'All features are available and data is syncing')
                : t('offline.offlineDescription', 'Limited functionality available. Your work will sync when connected.')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`rounded-lg p-6 ${
        isOnline 
          ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
          : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-medium ${
              isOnline ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
            }`}>
              {isOnline ? t('offline.connected', 'Connected') : t('offline.disconnected', 'Disconnected')}
            </h3>
            <p className={`mt-1 text-sm ${
              isOnline ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {isOnline 
                ? t('offline.allFeaturesAvailable', 'All features are available')
                : t('offline.limitedFeatures', 'Some features may be limited while offline')
              }
            </p>
            {lastSync && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {t('offline.lastSync', 'Last sync: {{time}}', { time: formatTime(lastSync.toISOString()) })}
              </p>
            )}
          </div>
          {!isOnline && (
            <button
              onClick={retrySync}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('offline.retry', 'Retry')}
            </button>
          )}
        </div>
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('offline.pendingActions', 'Pending Actions')}
              </h3>
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                {pendingActions.length}
              </span>
            </div>
            {retryAttempts > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('offline.retryAttempts', 'Retry attempts: {{count}}', { count: retryAttempts })}
              </p>
            )}
          </div>
          <div className="space-y-3">
            {pendingActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {action.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(action.timestamp)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  {t('offline.pending', 'Pending')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Offline Features */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          {t('offline.availableFeatures', 'Available Offline Features')}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {t('offline.viewCachedData', 'View Cached Data')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('offline.viewCachedDataDesc', 'Access previously loaded tickets and information')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {t('offline.submitFormsOffline', 'Submit Forms Offline')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('offline.submitFormsOfflineDesc', 'Create tickets and forms that will sync later')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {t('offline.viewNotifications', 'View Notifications')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('offline.viewNotificationsDesc', 'Read cached notifications and updates')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <WifiOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {t('offline.limitedRealTime', 'Limited Real-time Updates')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('offline.limitedRealTimeDesc', 'Live updates unavailable until reconnected')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cached Data */}
      {cachedData.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('offline.cachedData', 'Cached Data')}
            </h3>
            <button
              onClick={clearCache}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {t('offline.clearCache', 'Clear Cache')}
            </button>
          </div>
          <div className="space-y-3">
            {cachedData.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="text-lg">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.title || item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.id}
                      </span>
                      {item.time && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          • {formatTime(item.time)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.priority && (
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  )}
                  {item.status && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
          {t('offline.tipsTitle', 'Offline Tips')}
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li>• {t('offline.tip1', 'Your work will be saved and synced when you\'re back online')}</li>
          <li>• {t('offline.tip2', 'Forms submitted offline will be queued and sent automatically')}</li>
          <li>• {t('offline.tip3', 'Cached data is available for viewing but may not be current')}</li>
          <li>• {t('offline.tip4', 'Check your connection and try refreshing if issues persist')}</li>
        </ul>
      </div>
    </div>
  )
}
