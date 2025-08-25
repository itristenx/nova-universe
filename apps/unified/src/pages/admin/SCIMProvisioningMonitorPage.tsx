import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { cn, formatNumber, formatRelativeTime } from '@utils/index';
import toast from 'react-hot-toast';
import SCIMService, { type SCIMUser, type SCIMGroup, type SCIMConfiguration } from '@services/scim';

// Custom icon components for React 19 compatibility
const UserIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

const UserGroupIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);

const WifiIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
    />
  </svg>
);

export default function SCIMProvisioningMonitorPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'groups' | 'events' | 'config'>(
    'overview',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [scimConfig, setSCIMConfig] = useState<SCIMConfiguration>({
    enabled: false,
    endpoint: '',
    token: '',
    userAttributes: [],
    groupAttributes: [],
    syncInterval: 3600,
    lastSync: '',
    totalUsers: 0,
    totalGroups: 0,
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [userSyncEnabled, setUserSyncEnabled] = useState(true);
  const [groupSyncEnabled, setGroupSyncEnabled] = useState(true);

  const ArrowPathIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );

  const CogIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.240.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  interface ProvisioningEvent {
    id: string;
    timestamp: string;
    eventType:
      | 'user_created'
      | 'user_updated'
      | 'user_deleted'
      | 'group_created'
      | 'group_updated'
      | 'group_deleted'
      | 'sync_started'
      | 'sync_completed'
      | 'sync_failed';
    resourceId?: string;
    resourceType: 'user' | 'group' | 'system';
    status: 'success' | 'warning' | 'error' | 'info';
    message: string;
    details?: Record<string, unknown>;
  }

  interface SyncMetrics {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalGroups: number;
    lastSyncDuration: number;
    averageSyncDuration: number;
    successfulSyncs: number;
    failedSyncs: number;
    syncSuccess24h: number;
    syncErrors24h: number;
    userCreations24h: number;
    userUpdates24h: number;
    userDeletions24h: number;
  }

  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalGroups: 0,
    lastSyncDuration: 0,
    averageSyncDuration: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    syncSuccess24h: 0,
    syncErrors24h: 0,
    userCreations24h: 0,
    userUpdates24h: 0,
    userDeletions24h: 0,
  });
  const [users, setUsers] = useState<SCIMUser[]>([]);
  const [groups, setGroups] = useState<SCIMGroup[]>([]);
  const [events, setEvents] = useState<ProvisioningEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load SCIM configuration
      const config = await SCIMService.getConfiguration();
      setSCIMConfig(config);

      if (config.enabled) {
        setSyncStatus('success');
        setUserSyncEnabled(true);
        setGroupSyncEnabled(true);

        // Get stats
        const stats = await SCIMService.getStats();
        setSyncMetrics({
          totalUsers: stats.totalUsers,
          activeUsers: stats.activeUsers,
          inactiveUsers: stats.totalUsers - stats.activeUsers,
          totalGroups: stats.totalGroups,
          lastSyncDuration: 0, // Not available in SCIMStats
          averageSyncDuration: 0, // Not available in SCIMStats
          successfulSyncs: 0, // Not available in SCIMStats
          failedSyncs: stats.errorCount,
          syncSuccess24h: 0, // Not available in SCIMStats
          syncErrors24h: stats.errorCount,
          userCreations24h: 0, // Not available in SCIMStats
          userUpdates24h: 0, // Not available in SCIMStats
          userDeletions24h: 0, // Not available in SCIMStats
        });

        // Load data based on active tab
        if (activeTab === 'users' || activeTab === 'overview') {
          const usersResponse = await SCIMService.getUsers();
          setUsers(usersResponse.users);
        }

        if (activeTab === 'groups' || activeTab === 'overview') {
          const groupsResponse = await SCIMService.getGroups();
          setGroups(groupsResponse.groups);
        }

        if (activeTab === 'events') {
          const eventsResponse = await SCIMService.getEvents();
          setEvents(
            eventsResponse.events.map((event) => {
              // Map SCIM operations to ProvisioningEvent eventTypes
              let eventType: ProvisioningEvent['eventType'];
              switch (event.operation) {
                case 'CREATE':
                  eventType = event.resourceType === 'User' ? 'user_created' : 'group_created';
                  break;
                case 'UPDATE':
                  eventType = event.resourceType === 'User' ? 'user_updated' : 'group_updated';
                  break;
                case 'DELETE':
                  eventType = event.resourceType === 'User' ? 'user_deleted' : 'group_deleted';
                  break;
                case 'SYNC':
                  eventType = event.status === 'SUCCESS' ? 'sync_completed' : 'sync_failed';
                  break;
                default:
                  eventType = 'sync_completed';
              }

              // Map SCIM status to ProvisioningEvent status
              let status: ProvisioningEvent['status'];
              switch (event.status) {
                case 'SUCCESS':
                  status = 'success';
                  break;
                case 'ERROR':
                  status = 'error';
                  break;
                case 'PENDING':
                  status = 'info';
                  break;
                default:
                  status = 'info';
              }

              return {
                id: event.id,
                timestamp: event.timestamp,
                eventType,
                resourceId: event.resourceId,
                resourceType: event.resourceType.toLowerCase() as 'user' | 'group' | 'system',
                status,
                message: event.details,
                ...(event.error && { details: { error: event.error } }),
              };
            }),
          );
        }
      }
    } catch (_error) {
      console.error('Failed to load SCIM data:', error);
      setSyncStatus('error');
      toast.error('Failed to load SCIM data');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus('running');
    try {
      const result = await SCIMService.triggerSync();
      toast.success(`Manual sync initiated: ${result.message}`);

      // Reload data after sync
      setTimeout(() => {
        loadData();
        setIsSyncing(false);
      }, 2000);
    } catch (_error) {
      console.error('Failed to trigger sync:', error);
      setSyncStatus('error');
      toast.error('Failed to trigger manual sync');
      setIsSyncing(false);
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'info':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
        return UserIcon;
      case 'group_created':
      case 'group_updated':
      case 'group_deleted':
        return UserGroupIcon;
      case 'sync_started':
      case 'sync_completed':
      case 'sync_failed':
        return ArrowPathIcon;
      default:
        return ClockIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              SCIM Provisioning Monitor
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Monitor user provisioning and synchronization
            </p>
          </div>
        </div>

        <div className="card p-12 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading SCIM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            SCIM Provisioning Monitor
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Monitor user provisioning and synchronization status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadData} disabled={isLoading} className="btn btn-secondary">
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={triggerManualSync}
            disabled={isSyncing || !scimConfig.enabled}
            className="btn btn-primary"
          >
            {isSyncing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Syncing...
              </>
            ) : (
              <>
                <WifiIcon className="h-4 w-4" />
                Manual Sync
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={cn(
          'card border-l-4 p-4',
          scimConfig.enabled && syncStatus === 'success'
            ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
            : scimConfig.enabled && syncStatus === 'error'
              ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
              : scimConfig.enabled
                ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20',
        )}
      >
        <div className="flex items-center space-x-3">
          {scimConfig.enabled && syncStatus === 'success' ? (
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          ) : scimConfig.enabled && syncStatus === 'error' ? (
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          ) : scimConfig.enabled ? (
            <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <ExclamationTriangleIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              SCIM Status:{' '}
              {scimConfig.enabled
                ? syncStatus === 'success'
                  ? 'Active'
                  : syncStatus === 'error'
                    ? 'Error'
                    : 'Running'
                : 'Disabled'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {scimConfig.enabled
                ? scimConfig.lastSync
                  ? `Last sync: ${formatRelativeTime(scimConfig.lastSync)}`
                  : 'No sync data available'
                : 'SCIM provisioning is currently disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: ClockIcon },
              { id: 'users', label: 'Users', icon: UserIcon },
              { id: 'groups', label: 'Groups', icon: UserGroupIcon },
              { id: 'events', label: 'Events', icon: ArrowPathIcon },
              { id: 'config', label: 'Configuration', icon: CogIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="card p-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(syncMetrics.totalUsers)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(syncMetrics.activeUsers)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(syncMetrics.totalGroups)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Groups</div>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {syncMetrics.lastSyncDuration}s
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Last Sync Duration
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 24h Activity */}
              <div className="card p-6">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  24-Hour Activity
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {syncMetrics.userCreations24h}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Users Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {syncMetrics.userUpdates24h}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Users Updated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {syncMetrics.userDeletions24h}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Users Deleted</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Groups
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Last Modified
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="mr-3 h-6 w-6 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.displayName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.userName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              user.active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                            )}
                          >
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.groups.map((group) => (
                              <span
                                key={group}
                                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              >
                                {group}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(user.lastModified)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Last Modified
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {groups.map((group) => (
                      <tr key={group.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserGroupIcon className="mr-3 h-6 w-6 text-gray-400" />
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {group.displayName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {group.members.length} members
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(group.lastModified)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {events.map((event) => {
                  const Icon = getEventIcon(event.eventType);
                  return (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                    >
                      <div className={cn('rounded-lg p-2', getEventStatusColor(event.status))}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {event.message}
                          </p>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              getEventStatusColor(event.status),
                            )}
                          >
                            {event.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(event.timestamp)} • {event.eventType} •{' '}
                          {event.resourceType}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="card border-l-4 border-l-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h3 className="font-medium text-amber-900 dark:text-amber-300">
                      Configuration Read-Only
                    </h3>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      SCIM configuration is managed through environment variables and cannot be
                      modified through this interface.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Connection Settings
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        SCIM Endpoint
                      </label>
                      <input
                        type="text"
                        value={scimConfig.endpoint}
                        disabled
                        title="SCIM Endpoint"
                        className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bearer Token
                      </label>
                      <input
                        type="password"
                        value={scimConfig.token ? '••••••••••••••••' : ''}
                        disabled
                        title="Bearer Token"
                        className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Sync Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        User Sync Enabled
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          userSyncEnabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                        )}
                      >
                        {userSyncEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Group Sync Enabled
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          groupSyncEnabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                        )}
                      >
                        {groupSyncEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sync Interval
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {scimConfig.syncInterval}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
