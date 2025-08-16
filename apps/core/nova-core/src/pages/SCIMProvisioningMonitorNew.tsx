import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Card, Button, Table, TableHead as TableHeader, TableBody, TableCell, TableRow, Chip, Modal, Input, Select, Switch, Textarea } from '@/components/ui';
import { 
  UserIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ArrowPathIcon,
  KeyIcon,
  WifiIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useToastStore } from '@/stores/toast';
import { Tabs as LocalTabs } from '@/components/ui/Tabs';

interface SCIMUser {
  id: string;
  userName: string;
  emails: Array<{ value: string; primary: boolean }>;
  name: { givenName: string; familyName: string };
  active: boolean;
  externalId?: string;
  lastModified: string;
  created: string;
  groups: string[];
}

interface SCIMGroup {
  id: string;
  displayName: string;
  members: Array<{ value: string; display: string }>;
  externalId?: string;
  lastModified: string;
  created: string;
}

interface ProvisioningEvent {
  id: string;
  timestamp: string;
  eventType: 'user_created' | 'user_updated' | 'user_deleted' | 'group_created' | 'group_updated' | 'group_deleted' | 'sync_started' | 'sync_completed' | 'sync_failed';
  resourceId?: string;
  resourceType: 'user' | 'group' | 'system';
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: Record<string, unknown>;
}

interface SCIMConfig {
  enabled: boolean;
  endpoint: string;
  token: string;
  userSyncEnabled: boolean;
  groupSyncEnabled: boolean;
  allowNonProvisionedUsers: boolean;
  syncInterval: number;
  lastSync?: string;
  syncStatus: 'idle' | 'running' | 'error' | 'success';
  errorMessage?: string;
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
  groupCreations24h: number;
  groupUpdates24h: number;
  groupDeletions24h: number;
}

export default function SCIMProvisioningMonitor() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addToast } = useToastStore();
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  
  // SCIM Data State
  const [scimConfig, setSCIMConfig] = useState<SCIMConfig>({
    enabled: false,
    endpoint: '/scim/v2',
    token: '',
    userSyncEnabled: true,
    groupSyncEnabled: false,
    allowNonProvisionedUsers: false,
    syncInterval: 3600,
    syncStatus: 'idle',
  });
  
  const [scimUsers, setSCIMUsers] = useState<SCIMUser[]>([]);
  const [scimGroups, setSCIMGroups] = useState<SCIMGroup[]>([]);
  const [provisioningEvents, setProvisioningEvents] = useState<ProvisioningEvent[]>([]);
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
    groupCreations24h: 0,
    groupUpdates24h: 0,
    groupDeletions24h: 0,
  });

  // Load initial data
  useEffect(() => {
    loadSCIMData();
  }, []);

  const loadSCIMData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSCIMConfig(),
        loadSCIMUsers(),
        loadSCIMGroups(),
        loadProvisioningEvents(),
        loadSyncMetrics()
      ]);
    } catch (err) {
      console.error('Failed to load SCIM data:', err);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load SCIM provisioning data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSCIMConfig = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockConfig: SCIMConfig = {
        enabled: true,
        endpoint: '/scim/v2',
        token: 'scim_***hidden***',
        userSyncEnabled: true,
        groupSyncEnabled: true,
        allowNonProvisionedUsers: false,
        syncInterval: 3600,
        lastSync: new Date(Date.now() - 1800000).toISOString(),
        syncStatus: 'success'
      };
      setSCIMConfig(mockConfig);
    } catch (err) {
      console.error('Failed to load SCIM config:', err);
    }
  };

  const loadSCIMUsers = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockUsers: SCIMUser[] = [
        {
          id: '1',
          userName: 'john.doe',
          emails: [{ value: 'john.doe@company.com', primary: true }],
          name: { givenName: 'John', familyName: 'Doe' },
          active: true,
          externalId: 'ext_john_123',
          lastModified: new Date(Date.now() - 86400000).toISOString(),
          created: new Date(Date.now() - 2592000000).toISOString(),
          groups: ['Administrators', 'IT Staff']
        },
        {
          id: '2',
          userName: 'jane.smith',
          emails: [{ value: 'jane.smith@company.com', primary: true }],
          name: { givenName: 'Jane', familyName: 'Smith' },
          active: true,
          externalId: 'ext_jane_456',
          lastModified: new Date(Date.now() - 43200000).toISOString(),
          created: new Date(Date.now() - 1296000000).toISOString(),
          groups: ['Users', 'Marketing']
        }
      ];
      setSCIMUsers(mockUsers);
    } catch (err) {
      console.error('Failed to load SCIM users:', err);
    }
  };

  const loadSCIMGroups = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockGroups: SCIMGroup[] = [
        {
          id: '1',
          displayName: 'Administrators',
          members: [
            { value: '1', display: 'John Doe' }
          ],
          externalId: 'ext_admin_group',
          lastModified: new Date(Date.now() - 86400000).toISOString(),
          created: new Date(Date.now() - 5184000000).toISOString()
        },
        {
          id: '2',
          displayName: 'IT Staff',
          members: [
            { value: '1', display: 'John Doe' }
          ],
          externalId: 'ext_it_group',
          lastModified: new Date(Date.now() - 172800000).toISOString(),
          created: new Date(Date.now() - 5184000000).toISOString()
        }
      ];
      setSCIMGroups(mockGroups);
    } catch (err) {
      console.error('Failed to load SCIM groups:', err);
    }
  };

  const loadProvisioningEvents = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockEvents: ProvisioningEvent[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          eventType: 'sync_completed',
          resourceType: 'system',
          status: 'success',
          message: 'SCIM sync completed successfully',
          details: { duration: 45, usersProcessed: 125, groupsProcessed: 8 }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          eventType: 'user_updated',
          resourceId: '1',
          resourceType: 'user',
          status: 'success',
          message: 'User john.doe updated successfully'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          eventType: 'sync_started',
          resourceType: 'system',
          status: 'info',
          message: 'SCIM sync started'
        }
      ];
      setProvisioningEvents(mockEvents);
    } catch (err) {
      console.error('Failed to load provisioning events:', err);
    }
  };

  const loadSyncMetrics = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockMetrics: SyncMetrics = {
        totalUsers: 125,
        activeUsers: 118,
        inactiveUsers: 7,
        totalGroups: 8,
        lastSyncDuration: 45,
        averageSyncDuration: 42,
        successfulSyncs: 47,
        failedSyncs: 2,
        syncSuccess24h: 4,
        syncErrors24h: 0,
        userCreations24h: 2,
        userUpdates24h: 5,
        userDeletions24h: 1,
        groupCreations24h: 0,
        groupUpdates24h: 1,
        groupDeletions24h: 0
      };
      setSyncMetrics(mockMetrics);
    } catch (err) {
      console.error('Failed to load sync metrics:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSCIMData();
    setRefreshing(false);
    addToast({
      type: 'success',
      title: 'Refreshed',
      description: 'SCIM provisioning data has been refreshed'
    });
  };

  const handleConfigSave = async () => {
    try {
      // Mock implementation - replace with actual API call
      addToast({
        type: 'success',
        title: 'Configuration Saved',
        description: 'SCIM configuration has been updated successfully'
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save SCIM configuration'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'running':
        return 'primary';
      case 'error':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <span className="ml-4 text-lg">Loading SCIM provisioning data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SCIM Provisioning Monitor</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage SCIM user and group provisioning
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="bordered"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            startContent={<ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpen}
            startContent={<Cog6ToothIcon className="h-4 w-4" />}
          >
            Configure
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <WifiIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sync Status</p>
              <div className="flex items-center mt-1">
                <Chip
                  color={getSyncStatusColor(scimConfig.syncStatus)}
                  size="sm"
                  variant="flat"
                >
                  {scimConfig.syncStatus.charAt(0).toUpperCase() + scimConfig.syncStatus.slice(1)}
                </Chip>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{syncMetrics.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{syncMetrics.totalGroups}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Sync</p>
              <p className="text-sm text-gray-900">
                {scimConfig.lastSync ? new Date(scimConfig.lastSync).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card className="p-6">
        <LocalTabs>
          <div key="users" title="Users">
            <div className="mt-4">
              <Table aria-label="SCIM Users">
                <TableHeader>
                  <th scope="col">USERNAME</th>
                  <th scope="col">NAME</th>
                  <th scope="col">EMAIL</th>
                  <th scope="col">STATUS</th>
                  <th scope="col">GROUPS</th>
                  <th scope="col">LAST MODIFIED</th>
                </TableHeader>
                <TableBody>
                  {scimUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.userName}</TableCell>
                      <TableCell>{`${user.name.givenName} ${user.name.familyName}`}</TableCell>
                      <TableCell>{user.emails[0]?.value}</TableCell>
                      <TableCell>
                        <Chip
                          color={user.active ? 'success' : 'danger'}
                          size="sm"
                          variant="flat"
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.groups.map((group, idx) => (
                            <Chip key={idx} size="sm" variant="bordered">
                              {group}
                            </Chip>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.lastModified).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div key="groups" title="Groups">
            <div className="mt-4">
              <Table aria-label="SCIM Groups">
                <TableHeader>
                  <th scope="col">GROUP NAME</th>
                  <th scope="col">MEMBERS</th>
                  <th scope="col">EXTERNAL ID</th>
                  <th scope="col">CREATED</th>
                  <th scope="col">LAST MODIFIED</th>
                </TableHeader>
                <TableBody>
                  {scimGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>{group.displayName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {group.members.length}
                        </div>
                      </TableCell>
                      <TableCell>{group.externalId || '-'}</TableCell>
                      <TableCell>
                        {new Date(group.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(group.lastModified).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div key="activity" title="Activity Log">
            <div className="mt-4 space-y-4">
              {provisioningEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                  {getStatusIcon(event.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{event.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                      <span>Type: {event.eventType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Resource: {event.resourceType}</span>
                      {event.resourceId && (
                        <>
                          <span>•</span>
                          <span>ID: {event.resourceId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div key="analytics" title="Analytics">
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Duration</span>
                      <span className="text-sm font-medium">{syncMetrics.lastSyncDuration}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Duration</span>
                      <span className="text-sm font-medium">{syncMetrics.averageSyncDuration}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium">
                        {Math.round((syncMetrics.successfulSyncs / (syncMetrics.successfulSyncs + syncMetrics.failedSyncs)) * 100)}%
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">24h Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">User Creations</span>
                      <span className="text-sm font-medium text-green-600">+{syncMetrics.userCreations24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">User Updates</span>
                      <span className="text-sm font-medium text-blue-600">{syncMetrics.userUpdates24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">User Deletions</span>
                      <span className="text-sm font-medium text-red-600">-{syncMetrics.userDeletions24h}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-sm font-medium text-green-600">{syncMetrics.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Inactive Users</span>
                      <span className="text-sm font-medium text-red-600">{syncMetrics.inactiveUsers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(syncMetrics.activeUsers / Math.max(syncMetrics.totalUsers, 1)) * 100}%` }} />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </LocalTabs>
      </Card>

      {/* Configuration Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" title="SCIM Configuration">
        <div className="p-2">
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable SCIM Provisioning</p>
                  <p className="text-sm text-gray-600">Allow automatic user and group provisioning</p>
                </div>
                <Switch
                  checked={scimConfig.enabled}
                  onChange={(enabled) => setSCIMConfig(prev => ({ ...prev, enabled }))}
                />
              </div>

              <Input
                label="SCIM Endpoint"
                value={scimConfig.endpoint}
                onChange={(e) => setSCIMConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="/scim/v2"
              />

              <Input
                label="Bearer Token"
                type="password"
                value={scimConfig.token}
                onChange={(e) => setSCIMConfig(prev => ({ ...prev, token: e.target.value }))}
                placeholder="Enter SCIM bearer token"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">User Sync</p>
                    <p className="text-sm text-gray-600">Sync user accounts</p>
                  </div>
                  <Switch
                    checked={scimConfig.userSyncEnabled}
                    onChange={(userSyncEnabled) => setSCIMConfig(prev => ({ ...prev, userSyncEnabled }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Group Sync</p>
                    <p className="text-sm text-gray-600">Sync group memberships</p>
                  </div>
                  <Switch
                    checked={scimConfig.groupSyncEnabled}
                    onChange={(groupSyncEnabled: boolean) => setSCIMConfig(prev => ({ ...prev, groupSyncEnabled }))}
                  />
                </div>
              </div>

              <Select
                label="Sync Interval"
                value={scimConfig.syncInterval.toString()}
                onChange={(value: string) => setSCIMConfig(prev => ({ ...prev, syncInterval: parseInt(value) }))}
                options={[
                  { value: '300', label: '5 minutes' },
                  { value: '900', label: '15 minutes' },
                  { value: '1800', label: '30 minutes' },
                  { value: '3600', label: '1 hour' },
                  { value: '21600', label: '6 hours' },
                  { value: '43200', label: '12 hours' },
                  { value: '86400', label: '24 hours' },
                ]}
              />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onPress={handleConfigSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
