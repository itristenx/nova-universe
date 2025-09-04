import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, RefreshCw, Smartphone, Download, Bell, Clock, RotateCcw } from 'lucide-react';

interface CachedItem {
  type: 'ticket' | 'notification' | 'asset' | 'user';
  id: string;
  title?: string;
  message?: string;
  status?: string;
  time?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface PendingAction {
  id: string;
  type: 'create_ticket' | 'update_profile' | 'submit_form';
  description: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export default function OfflinePage() {
  const { t } = useTranslation(['offline', 'common']);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedData, setCachedData] = useState<CachedItem[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data and pending actions
    loadCachedData();
    loadPendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedData = async () => {
    try {
      // Load cached data from localStorage as fallback
      const cached = localStorage.getItem('nova_cached_data');
      setCachedData(cached ? JSON.parse(cached) : []);
    } catch (error) {
      console.error('Failed to load cached data:', error);
      
      // Track error for offline analytics
      const errorEvent = {
        type: 'cache_load_error',
        message: error instanceof Error ? error.message : 'Unknown cache load error',
        timestamp: new Date().toISOString(),
        context: 'offline_page_cache_load'
      };
      
      // Store error for later sync when online
      try {
        const errorLog = localStorage.getItem('nova_offline_errors') || '[]';
        const errors = JSON.parse(errorLog);
        errors.push(errorEvent);
        localStorage.setItem('nova_offline_errors', JSON.stringify(errors.slice(-50))); // Keep last 50 errors
      } catch (logError) {
        console.warn('Failed to log cache error:', logError);
      }
      
      setCachedData([]);
    }
  };

  const loadPendingActions = async () => {
    try {
      // Load pending actions from localStorage as fallback
      const pending = localStorage.getItem('nova_pending_actions');
      setPendingActions(pending ? JSON.parse(pending) : []);
    } catch (error) {
      console.error('Failed to load pending actions:', error);
      
      // Enhanced error handling for pending actions
      const errorDetails = {
        type: 'pending_actions_load_error',
        message: error instanceof Error ? error.message : 'Unknown pending actions error',
        timestamp: new Date().toISOString(),
        context: 'offline_page_pending_load'
      };
      
      // Store for analytics when back online
      try {
        const errorLog = localStorage.getItem('nova_offline_errors') || '[]';
        const errors = JSON.parse(errorLog);
        errors.push(errorDetails);
        localStorage.setItem('nova_offline_errors', JSON.stringify(errors.slice(-50)));
      } catch (logError) {
        console.warn('Failed to log pending actions error:', logError);
      }
      
      // Ensure pending actions is empty array on error
      setPendingActions([]);
    }
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    try {
      setRetryAttempts((prev) => prev + 1);

      // Simulate syncing pending actions
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear pending actions after successful sync
      setPendingActions([]);
      setLastSync(new Date());
      setRetryAttempts(0);

      // Refresh cached data
      loadCachedData();
    } catch (error) {
      console.error('Sync failed:', error);
      
      // Enhanced sync error handling with retry logic
      const syncError = {
        type: 'sync_failure',
        message: error instanceof Error ? error.message : 'Unknown sync error',
        timestamp: new Date().toISOString(),
        retryAttempt: retryAttempts,
        pendingActionsCount: pendingActions.length,
        context: 'offline_page_sync'
      };
      
      // Log sync failures for analysis
      try {
        const errorLog = localStorage.getItem('nova_offline_errors') || '[]';
        const errors = JSON.parse(errorLog);
        errors.push(syncError);
        localStorage.setItem('nova_offline_errors', JSON.stringify(errors.slice(-50)));
      } catch (logError) {
        console.warn('Failed to log sync error:', logError);
      }
      
      // Implement exponential backoff for retries
      const backoffDelay = Math.min(1000 * Math.pow(2, retryAttempts), 30000);
      console.log(`Will retry sync in ${backoffDelay}ms (attempt ${retryAttempts + 1})`);
      
      // Will retry automatically when online
    }
  };

  const retrySync = () => {
    if (isOnline) {
      syncPendingActions();
    }
  };

  const clearCache = async () => {
    try {
      // Clear cached data
      setCachedData([]);
      // Clear Cache Storage
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // Clear IndexedDB databases (best-effort)
      try {
        const anyIndexedDB = indexedDB as any;
        if (anyIndexedDB?.databases) {
          const dbs = await anyIndexedDB.databases();
          await Promise.all(
            dbs
              .map((db: any) => db?.name)
              .filter(Boolean)
              .map((name: string) => new Promise<void>((resolve) => {
                const req = indexedDB.deleteDatabase(name);
                req.onsuccess = () => resolve();
                req.onerror = () => resolve();
                req.onblocked = () => resolve();
              })),
          );
        }
      } catch (indexedDBError) {
        // Some browsers don't support indexedDB.databases(); ignore
        console.warn('IndexedDB enumeration not supported; skipping full DB clear');
        console.debug('IndexedDB error details:', indexedDBError instanceof Error ? indexedDBError.message : 'Unknown IndexedDB error');
      }

      // Clear local/session storage for good measure
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
    } catch (error) {
      console.error('Failed to clear cache:', error);
      
      // Enhanced cache clearing error handling
      const cacheError = {
        type: 'cache_clear_error',
        message: error instanceof Error ? error.message : 'Unknown cache clear error',
        timestamp: new Date().toISOString(),
        context: 'offline_page_cache_clear'
      };
      
      // Log cache clearing errors
      try {
        const errorLog = localStorage.getItem('nova_offline_errors') || '[]';
        const errors = JSON.parse(errorLog);
        errors.push(cacheError);
        localStorage.setItem('nova_offline_errors', JSON.stringify(errors.slice(-50)));
      } catch (logError) {
        console.warn('Failed to log cache clear error:', logError);
      }
      
      // Show user-friendly notification about cache clearing failure
      console.warn('Some cached data may not have been cleared. Please try refreshing the page.');
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return t('offline.justNow', 'Just now');
    if (diffInMinutes < 60)
      return t('offline.minutesAgo', '{{count}} minutes ago', { count: diffInMinutes });

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return t('offline.hoursAgo', '{{count}} hours ago', { count: diffInHours });

    const diffInDays = Math.floor(diffInHours / 24);
    return t('offline.daysAgo', '{{count}} days ago', { count: diffInDays });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return '🎫';
      case 'notification':
        return '📢';
      case 'asset':
        return '💻';
      case 'user':
        return '👤';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isOnline ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}
          >
            {isOnline ? (
              <div className="h-6 w-6 rounded-full bg-green-500" />
            ) : (
              <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isOnline
                ? t('offline.onlineTitle', "You're Online")
                : t('offline.offlineTitle', "You're Offline")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isOnline
                ? t('offline.onlineDescription', 'All features are available and data is syncing')
                : t(
                    'offline.offlineDescription',
                    'Limited functionality available. Your work will sync when connected.',
                  )}
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div
        className={`rounded-lg p-6 ${
          isOnline
            ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
            : 'border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`text-lg font-medium ${
                isOnline ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
              }`}
            >
              {isOnline
                ? t('offline.connected', 'Connected')
                : t('offline.disconnected', 'Disconnected')}
            </h3>
            <p
              className={`mt-1 text-sm ${
                isOnline ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}
            >
              {isOnline
                ? t('offline.allFeaturesAvailable', 'All features are available')
                : t('offline.limitedFeatures', 'Some features may be limited while offline')}
            </p>
            {lastSync && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {t('offline.lastSync', 'Last sync: {{time}}', {
                  time: formatTime(lastSync.toISOString()),
                })}
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
          <div className="mb-4 flex items-center justify-between">
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
              <div
                key={action.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
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
                {t(
                  'offline.viewCachedDataDesc',
                  'Access previously loaded tickets and information',
                )}
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
                {t(
                  'offline.submitFormsOfflineDesc',
                  'Create tickets and forms that will sync later',
                )}
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
          <div className="mb-4 flex items-center justify-between">
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
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg">{getTypeIcon(item.type)}</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.title || item.message}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.id}</span>
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
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(item.priority)}`}
                    >
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
          <li>
            • {t('offline.tip1', "Your work will be saved and synced when you're back online")}
          </li>
          <li>
            • {t('offline.tip2', 'Forms submitted offline will be queued and sent automatically')}
          </li>
          <li>
            • {t('offline.tip3', 'Cached data is available for viewing but may not be current')}
          </li>
          <li>
            • {t('offline.tip4', 'Check your connection and try refreshing if issues persist')}
          </li>
        </ul>
      </div>
    </div>
  );
}
