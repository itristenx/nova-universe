import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import {
  UserIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  WifiIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress,
  Switch,
  Input,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react';
import { useToastStore } from '@/stores/toast';
export default function SCIMProvisioningMonitor() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { addToast } = useToastStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // SCIM Data State
  const [scimConfig, setSCIMConfig] = useState({
    enabled: false,
    endpoint: '/scim/v2',
    token: '',
    userSyncEnabled: true,
    groupSyncEnabled: false,
    allowNonProvisionedUsers: false,
    syncInterval: 3600,
    syncStatus: 'idle',
  });
  const [scimUsers, setSCIMUsers] = useState([]);
  const [scimGroups, setSCIMGroups] = useState([]);
  const [provisioningEvents, setProvisioningEvents] = useState([]);
  const [syncMetrics, setSyncMetrics] = useState({
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
        loadSyncMetrics(),
      ]);
    } catch (err) {
      console.error('Failed to load SCIM data:', err);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load SCIM provisioning data',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const loadSCIMConfig = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockConfig = {
        enabled: true,
        endpoint: '/scim/v2',
        token: 'scim_***hidden***',
        userSyncEnabled: true,
        groupSyncEnabled: true,
        allowNonProvisionedUsers: false,
        syncInterval: 3600,
        lastSync: new Date(Date.now() - 1800000).toISOString(),
        syncStatus: 'success',
      };
      setSCIMConfig(mockConfig);
    } catch (err) {
      console.error('Failed to load SCIM config:', err);
    }
  };
  const loadSCIMUsers = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockUsers = [
        {
          id: '1',
          userName: 'john.doe',
          emails: [{ value: 'john.doe@company.com', primary: true }],
          name: { givenName: 'John', familyName: 'Doe' },
          active: true,
          externalId: 'ext_john_123',
          lastModified: new Date(Date.now() - 86400000).toISOString(),
          created: new Date(Date.now() - 2592000000).toISOString(),
          groups: ['Administrators', 'IT Staff'],
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
          groups: ['Users', 'Marketing'],
        },
      ];
      setSCIMUsers(mockUsers);
    } catch (err) {
      console.error('Failed to load SCIM users:', err);
    }
  };
  const loadSCIMGroups = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockGroups = [
        {
          id: '1',
          displayName: 'Administrators',
          members: [{ value: '1', display: 'John Doe' }],
          externalId: 'ext_admin_group',
          lastModified: new Date(Date.now() - 86400000).toISOString(),
          created: new Date(Date.now() - 5184000000).toISOString(),
        },
        {
          id: '2',
          displayName: 'IT Staff',
          members: [{ value: '1', display: 'John Doe' }],
          externalId: 'ext_it_group',
          lastModified: new Date(Date.now() - 172800000).toISOString(),
          created: new Date(Date.now() - 5184000000).toISOString(),
        },
      ];
      setSCIMGroups(mockGroups);
    } catch (err) {
      console.error('Failed to load SCIM groups:', err);
    }
  };
  const loadProvisioningEvents = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockEvents = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          eventType: 'sync_completed',
          resourceType: 'system',
          status: 'success',
          message: 'SCIM sync completed successfully',
          details: { duration: 45, usersProcessed: 125, groupsProcessed: 8 },
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          eventType: 'user_updated',
          resourceId: '1',
          resourceType: 'user',
          status: 'success',
          message: 'User john.doe updated successfully',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          eventType: 'sync_started',
          resourceType: 'system',
          status: 'info',
          message: 'SCIM sync started',
        },
      ];
      setProvisioningEvents(mockEvents);
    } catch (err) {
      console.error('Failed to load provisioning events:', err);
    }
  };
  const loadSyncMetrics = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockMetrics = {
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
        groupDeletions24h: 0,
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
      description: 'SCIM provisioning data has been refreshed',
    });
  };
  const handleConfigSave = async () => {
    try {
      // Mock implementation - replace with actual API call
      addToast({
        type: 'success',
        title: 'Configuration Saved',
        description: 'SCIM configuration has been updated successfully',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save SCIM configuration',
      });
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return React.createElement(CheckCircleIcon, { className: 'h-5 w-5 text-green-500' });
      case 'warning':
        return React.createElement(ExclamationTriangleIcon, {
          className: 'h-5 w-5 text-yellow-500',
        });
      case 'error':
        return React.createElement(ExclamationTriangleIcon, { className: 'h-5 w-5 text-red-500' });
      case 'info':
        return React.createElement(InformationCircleIcon, { className: 'h-5 w-5 text-blue-500' });
      default:
        return React.createElement(InformationCircleIcon, { className: 'h-5 w-5 text-gray-500' });
    }
  };
  const getSyncStatusColor = (status) => {
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
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center min-h-[400px]' },
      React.createElement(Spinner, { size: 'lg' }),
      React.createElement(
        'span',
        { className: 'ml-4 text-lg' },
        'Loading SCIM provisioning data...',
      ),
    );
  }
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-start' },
      React.createElement(
        'div',
        null,
        React.createElement(
          'h1',
          { className: 'text-2xl font-bold text-gray-900' },
          'SCIM Provisioning Monitor',
        ),
        React.createElement(
          'p',
          { className: 'mt-1 text-sm text-gray-600' },
          'Monitor and manage SCIM user and group provisioning',
        ),
      ),
      React.createElement(
        'div',
        { className: 'flex gap-2' },
        React.createElement(
          Button,
          {
            variant: 'outline',
            size: 'sm',
            onClick: handleRefresh,
            disabled: refreshing,
            startContent: React.createElement(ArrowPathIcon, {
              className: `h-4 w-4 ${refreshing ? 'animate-spin' : ''}`,
            }),
          },
          refreshing ? 'Refreshing...' : 'Refresh',
        ),
        React.createElement(
          Button,
          {
            color: 'primary',
            size: 'sm',
            onClick: onOpen,
            startContent: React.createElement(Cog6ToothIcon, { className: 'h-4 w-4' }),
          },
          'Configure',
        ),
      ),
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
      React.createElement(
        Card,
        { className: 'p-4' },
        React.createElement(
          'div',
          { className: 'flex items-center' },
          React.createElement(
            'div',
            { className: 'p-2 bg-blue-100 rounded-lg' },
            React.createElement(WifiIcon, { className: 'h-6 w-6 text-blue-600' }),
          ),
          React.createElement(
            'div',
            { className: 'ml-4' },
            React.createElement(
              'p',
              { className: 'text-sm font-medium text-gray-600' },
              'Sync Status',
            ),
            React.createElement(
              'div',
              { className: 'flex items-center mt-1' },
              React.createElement(
                Chip,
                { color: getSyncStatusColor(scimConfig.syncStatus), size: 'sm', variant: 'flat' },
                scimConfig.syncStatus.charAt(0).toUpperCase() + scimConfig.syncStatus.slice(1),
              ),
            ),
          ),
        ),
      ),
      React.createElement(
        Card,
        { className: 'p-4' },
        React.createElement(
          'div',
          { className: 'flex items-center' },
          React.createElement(
            'div',
            { className: 'p-2 bg-green-100 rounded-lg' },
            React.createElement(UserIcon, { className: 'h-6 w-6 text-green-600' }),
          ),
          React.createElement(
            'div',
            { className: 'ml-4' },
            React.createElement(
              'p',
              { className: 'text-sm font-medium text-gray-600' },
              'Total Users',
            ),
            React.createElement(
              'p',
              { className: 'text-2xl font-bold text-gray-900' },
              syncMetrics.totalUsers,
            ),
          ),
        ),
      ),
      React.createElement(
        Card,
        { className: 'p-4' },
        React.createElement(
          'div',
          { className: 'flex items-center' },
          React.createElement(
            'div',
            { className: 'p-2 bg-purple-100 rounded-lg' },
            React.createElement(UserGroupIcon, { className: 'h-6 w-6 text-purple-600' }),
          ),
          React.createElement(
            'div',
            { className: 'ml-4' },
            React.createElement(
              'p',
              { className: 'text-sm font-medium text-gray-600' },
              'Total Groups',
            ),
            React.createElement(
              'p',
              { className: 'text-2xl font-bold text-gray-900' },
              syncMetrics.totalGroups,
            ),
          ),
        ),
      ),
      React.createElement(
        Card,
        { className: 'p-4' },
        React.createElement(
          'div',
          { className: 'flex items-center' },
          React.createElement(
            'div',
            { className: 'p-2 bg-orange-100 rounded-lg' },
            React.createElement(ClockIcon, { className: 'h-6 w-6 text-orange-600' }),
          ),
          React.createElement(
            'div',
            { className: 'ml-4' },
            React.createElement(
              'p',
              { className: 'text-sm font-medium text-gray-600' },
              'Last Sync',
            ),
            React.createElement(
              'p',
              { className: 'text-sm text-gray-900' },
              scimConfig.lastSync ? new Date(scimConfig.lastSync).toLocaleString() : 'Never',
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      Card,
      { className: 'p-6' },
      React.createElement(
        Tabs,
        { 'aria-label': 'SCIM provisioning tabs', defaultSelectedKey: 'users' },
        React.createElement(
          Tab,
          { key: 'users', title: 'Users' },
          React.createElement(
            'div',
            { className: 'mt-4' },
            React.createElement(
              Table,
              { 'aria-label': 'SCIM Users' },
              React.createElement(
                TableHeader,
                null,
                React.createElement(TableColumn, null, 'USERNAME'),
                React.createElement(TableColumn, null, 'NAME'),
                React.createElement(TableColumn, null, 'EMAIL'),
                React.createElement(TableColumn, null, 'STATUS'),
                React.createElement(TableColumn, null, 'GROUPS'),
                React.createElement(TableColumn, null, 'LAST MODIFIED'),
              ),
              React.createElement(
                TableBody,
                null,
                scimUsers.map((user) =>
                  React.createElement(
                    TableRow,
                    { key: user.id },
                    React.createElement(TableCell, null, user.userName),
                    React.createElement(
                      TableCell,
                      null,
                      `${user.name.givenName} ${user.name.familyName}`,
                    ),
                    React.createElement(TableCell, null, user.emails[0]?.value),
                    React.createElement(
                      TableCell,
                      null,
                      React.createElement(
                        Chip,
                        { color: user.active ? 'success' : 'danger', size: 'sm', variant: 'flat' },
                        user.active ? 'Active' : 'Inactive',
                      ),
                    ),
                    React.createElement(
                      TableCell,
                      null,
                      React.createElement(
                        'div',
                        { className: 'flex gap-1 flex-wrap' },
                        user.groups.map((group, idx) =>
                          React.createElement(
                            Chip,
                            { key: idx, size: 'sm', variant: 'bordered' },
                            group,
                          ),
                        ),
                      ),
                    ),
                    React.createElement(
                      TableCell,
                      null,
                      new Date(user.lastModified).toLocaleDateString(),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        React.createElement(
          Tab,
          { key: 'groups', title: 'Groups' },
          React.createElement(
            'div',
            { className: 'mt-4' },
            React.createElement(
              Table,
              { 'aria-label': 'SCIM Groups' },
              React.createElement(
                TableHeader,
                null,
                React.createElement(TableColumn, null, 'GROUP NAME'),
                React.createElement(TableColumn, null, 'MEMBERS'),
                React.createElement(TableColumn, null, 'EXTERNAL ID'),
                React.createElement(TableColumn, null, 'CREATED'),
                React.createElement(TableColumn, null, 'LAST MODIFIED'),
              ),
              React.createElement(
                TableBody,
                null,
                scimGroups.map((group) =>
                  React.createElement(
                    TableRow,
                    { key: group.id },
                    React.createElement(TableCell, null, group.displayName),
                    React.createElement(
                      TableCell,
                      null,
                      React.createElement(
                        'div',
                        { className: 'flex items-center' },
                        React.createElement(UserGroupIcon, { className: 'h-4 w-4 mr-1' }),
                        group.members.length,
                      ),
                    ),
                    React.createElement(TableCell, null, group.externalId || '-'),
                    React.createElement(
                      TableCell,
                      null,
                      new Date(group.created).toLocaleDateString(),
                    ),
                    React.createElement(
                      TableCell,
                      null,
                      new Date(group.lastModified).toLocaleDateString(),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        React.createElement(
          Tab,
          { key: 'activity', title: 'Activity Log' },
          React.createElement(
            'div',
            { className: 'mt-4 space-y-4' },
            provisioningEvents.map((event) =>
              React.createElement(
                'div',
                { key: event.id, className: 'flex items-start space-x-3 p-4 border rounded-lg' },
                getStatusIcon(event.status),
                React.createElement(
                  'div',
                  { className: 'flex-1' },
                  React.createElement(
                    'div',
                    { className: 'flex items-center justify-between' },
                    React.createElement(
                      'p',
                      { className: 'text-sm font-medium text-gray-900' },
                      event.message,
                    ),
                    React.createElement(
                      'p',
                      { className: 'text-xs text-gray-500' },
                      new Date(event.timestamp).toLocaleString(),
                    ),
                  ),
                  React.createElement(
                    'div',
                    { className: 'mt-1 flex items-center space-x-2 text-xs text-gray-500' },
                    React.createElement('span', null, 'Type: ', event.eventType.replace('_', ' ')),
                    React.createElement('span', null, '\u2022'),
                    React.createElement('span', null, 'Resource: ', event.resourceType),
                    event.resourceId &&
                      React.createElement(
                        React.Fragment,
                        null,
                        React.createElement('span', null, '\u2022'),
                        React.createElement('span', null, 'ID: ', event.resourceId),
                      ),
                  ),
                ),
              ),
            ),
          ),
        ),
        React.createElement(
          Tab,
          { key: 'analytics', title: 'Analytics' },
          React.createElement(
            'div',
            { className: 'mt-4' },
            React.createElement(
              'div',
              { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
              React.createElement(
                Card,
                { className: 'p-4' },
                React.createElement(
                  'h3',
                  { className: 'text-lg font-semibold text-gray-900 mb-4' },
                  'Sync Performance',
                ),
                React.createElement(
                  'div',
                  { className: 'space-y-3' },
                  React.createElement(
                    'div',
                    { className: 'flex justify-between' },
                    React.createElement(
                      'span',
                      { className: 'text-sm text-gray-600' },
                      'Last Duration',
                    ),
                    React.createElement(
                      'span',
                      { className: 'text-sm font-medium' },
                      syncMetrics.lastSyncDuration,
                      's',
                    ),
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex justify-between' },
                    React.createElement(
                      'span',
                      { className: 'text-sm text-gray-600' },
                      'Average Duration',
                    ),
                    React.createElement(
                      'span',
                      { className: 'text-sm font-medium' },
                      syncMetrics.averageSyncDuration,
                      's',
                    ),
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex justify-between' },
                    React.createElement(
                      'span',
                      { className: 'text-sm text-gray-600' },
                      'Success Rate',
                    ),
                    React.createElement(
                      'span',
                      { className: 'text-sm font-medium' },
                      Math.round(
                        (syncMetrics.successfulSyncs /
                          (syncMetrics.successfulSyncs + syncMetrics.failedSyncs)) *
                          100,
                      ),
                      '%',
                    ),
                  ),
                ),
              ),
              React.createElement(
                Card,
                { className: 'p-4' },
                React.createElement(
                  'h3',
                  { className: 'text-lg font-semibold text-gray-900 mb-4' },
                  '24h Activity',
                ),
                React.createElement(
                  'div',
                  { className: 'space-y-3' },
                  React.createElement(
                    'div',
                    { className: 'flex justify-between' },
                    React.createElement(
                      'span',
                      { className: 'text-sm text-gray-600' },
                      'User Creations',
                    ),
                    React.createElement(
                      'span',
                      { className: 'text-sm font-medium text-green-600' },
                      '+',
                      syncMetrics.userCreations24h,
                    ),
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex justify-between' },
                    React.createElement(
                      'span',
                      { className: 'text-sm text-gray-600' },
                      'User Updates',
                    ),
                    React.createElement(
                      'span',
                      { className: 'text-sm font-medium text-blue-600' },
                      syncMetrics.userUpdates24h,
                    ),
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex justify-between' },
                    React.createElement(
                      'span',
                      { className: 'text-sm text-gray-600' },
                      'User Deletions',
                    ),
                    React.createElement(
                      'span',
                      { className: 'text-sm font-medium text-red-600' },
                      '-',
                      syncMetrics.userDeletions24h,
                    ),
                  ),
                ),
              ),
              React.createElement(
                Card,
                { className: 'p-4' },
                React.createElement(
                  'h3',
                  { className: 'text-lg font-semibold text-gray-900 mb-4' },
                  'User Status',
                ),
                React.createElement(
                  'div',
                  { className: 'space-y-3' },
                  React.createElement(
                    'div',
                    { className: 'flex justify-between' },
                    React.createElement(
                      'span',
                      { className: 'text-sm text-gray-600' },
                      'Active Users',
                    ),
                    React.createElement(
                      'span',
                      { className: 'text-sm font-medium text-green-600' },
                      syncMetrics.activeUsers,
                    ),
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex justify-between' },
                    React.createElement(
                      'span',
                      { className: 'text-sm text-gray-600' },
                      'Inactive Users',
                    ),
                    React.createElement(
                      'span',
                      { className: 'text-sm font-medium text-red-600' },
                      syncMetrics.inactiveUsers,
                    ),
                  ),
                  React.createElement(Progress, {
                    value: (syncMetrics.activeUsers / syncMetrics.totalUsers) * 100,
                    color: 'success',
                    className: 'mt-2',
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      Modal,
      { isOpen: isOpen, onClose: onClose, size: '2xl' },
      React.createElement(
        ModalContent,
        null,
        React.createElement(ModalHeader, null, 'SCIM Configuration'),
        React.createElement(
          ModalBody,
          null,
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'div',
              { className: 'flex items-center justify-between' },
              React.createElement(
                'div',
                null,
                React.createElement('p', { className: 'font-medium' }, 'Enable SCIM Provisioning'),
                React.createElement(
                  'p',
                  { className: 'text-sm text-gray-600' },
                  'Allow automatic user and group provisioning',
                ),
              ),
              React.createElement(Switch, {
                isSelected: scimConfig.enabled,
                onValueChange: (enabled) => setSCIMConfig((prev) => ({ ...prev, enabled })),
              }),
            ),
            React.createElement(Input, {
              label: 'SCIM Endpoint',
              value: scimConfig.endpoint,
              onChange: (e) => setSCIMConfig((prev) => ({ ...prev, endpoint: e.target.value })),
              placeholder: '/scim/v2',
            }),
            React.createElement(Input, {
              label: 'Bearer Token',
              type: 'password',
              value: scimConfig.token,
              onChange: (e) => setSCIMConfig((prev) => ({ ...prev, token: e.target.value })),
              placeholder: 'Enter SCIM bearer token',
            }),
            React.createElement(
              'div',
              { className: 'grid grid-cols-2 gap-4' },
              React.createElement(
                'div',
                { className: 'flex items-center justify-between' },
                React.createElement(
                  'div',
                  null,
                  React.createElement('p', { className: 'font-medium' }, 'User Sync'),
                  React.createElement(
                    'p',
                    { className: 'text-sm text-gray-600' },
                    'Sync user accounts',
                  ),
                ),
                React.createElement(Switch, {
                  isSelected: scimConfig.userSyncEnabled,
                  onValueChange: (userSyncEnabled) =>
                    setSCIMConfig((prev) => ({ ...prev, userSyncEnabled })),
                }),
              ),
              React.createElement(
                'div',
                { className: 'flex items-center justify-between' },
                React.createElement(
                  'div',
                  null,
                  React.createElement('p', { className: 'font-medium' }, 'Group Sync'),
                  React.createElement(
                    'p',
                    { className: 'text-sm text-gray-600' },
                    'Sync group memberships',
                  ),
                ),
                React.createElement(Switch, {
                  isSelected: scimConfig.groupSyncEnabled,
                  onValueChange: (groupSyncEnabled) =>
                    setSCIMConfig((prev) => ({ ...prev, groupSyncEnabled })),
                }),
              ),
            ),
            React.createElement(
              Select,
              {
                label: 'Sync Interval',
                selectedKeys: [scimConfig.syncInterval.toString()],
                onSelectionChange: (keys) => {
                  const interval = Array.from(keys)[0];
                  setSCIMConfig((prev) => ({ ...prev, syncInterval: parseInt(interval) }));
                },
              },
              React.createElement(SelectItem, { key: '300', value: '300' }, '5 minutes'),
              React.createElement(SelectItem, { key: '900', value: '900' }, '15 minutes'),
              React.createElement(SelectItem, { key: '1800', value: '1800' }, '30 minutes'),
              React.createElement(SelectItem, { key: '3600', value: '3600' }, '1 hour'),
              React.createElement(SelectItem, { key: '21600', value: '21600' }, '6 hours'),
              React.createElement(SelectItem, { key: '43200', value: '43200' }, '12 hours'),
              React.createElement(SelectItem, { key: '86400', value: '86400' }, '24 hours'),
            ),
          ),
        ),
        React.createElement(
          ModalFooter,
          null,
          React.createElement(Button, { variant: 'light', onPress: onClose }, 'Cancel'),
          React.createElement(
            Button,
            { color: 'primary', onPress: handleConfigSave },
            'Save Configuration',
          ),
        ),
      ),
    ),
  );
}
