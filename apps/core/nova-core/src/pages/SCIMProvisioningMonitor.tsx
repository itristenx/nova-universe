import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  Select,
  Box,
  TableCell,
  Badge,
  Group,
  Tooltip,
  IconButton,
  TableRow,
  TableBody,
  Table,
  TableContainer,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  FormControlLabel,
  Switch,
  LinearProgress,
  Chip,
  Person,
  NetworkCheck,
  VpnKey,
  Schedule,
  CheckCircle,
  Warning,
  ErrorIcon,
  Info,
  Sync,
  LoadingSpinner,
  Paper,
  TableHead
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scim-tabpanel-${index}`}
      aria-labelledby={`scim-tab-${index}`}
      {...other}
    >
      {value === index && <Box style={{ padding: 24 }}>{children}</Box>}
    </div>
  );
}

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
  source: string;
  externalId?: string;
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
  
  // UI State
  const [selectedUser, setSelectedUser] = useState<SCIMUser | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SCIMGroup | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('24h');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [manualSyncRunning, setManualSyncRunning] = useState(false);

  // Load SCIM Configuration
  const loadSCIMConfig = useCallback(async () => {
    try {
      const response = await api.get<SCIMConfig>('/api/scim-config');
      setSCIMConfig(response.data);
    } catch (err) {
      console.error('Failed to load SCIM config:', err);
      setError('Failed to load SCIM configuration');
    }
  }, []);

  // Load SCIM Users
  const loadSCIMUsers = useCallback(async () => {
    if (!scimConfig.enabled) return;
    
    try {
      setRefreshing(true);
      const response = await api.get<{ Resources: SCIMUser[] }>('/scim/v2/Users');
      if (response.data && response.data.Resources) {
        setSCIMUsers(response.data.Resources);
      }
    } catch (err) {
      console.error('Failed to load SCIM users:', err);
      setError('Failed to load SCIM users');
    } finally {
      setRefreshing(false);
    }
  }, [scimConfig.enabled]);

  // Load SCIM Groups
  const loadSCIMGroups = useCallback(async () => {
    if (!scimConfig.enabled || !scimConfig.groupSyncEnabled) return;
    
    try {
      const response = await api.get<{ Resources: SCIMGroup[] }>('/scim/v2/Groups');
      if (response.data && response.data.Resources) {
        setSCIMGroups(response.data.Resources);
      }
    } catch (err) {
      console.error('Failed to load SCIM groups:', err);
      setError('Failed to load SCIM groups');
    }
  }, [scimConfig.enabled, scimConfig.groupSyncEnabled]);

  // Load Provisioning Events (simulated)
  const loadProvisioningEvents = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from an audit/event log API
      const mockEvents: ProvisioningEvent[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          eventType: 'user_created',
          resourceId: 'user-123',
          resourceType: 'user',
          status: 'success',
          message: 'User john.doe@company.com created successfully',
          source: 'Azure AD',
          externalId: 'azure-user-123',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          eventType: 'sync_completed',
          resourceType: 'system',
          status: 'success',
          message: 'Scheduled sync completed successfully - 25 users, 5 groups processed',
          source: 'System',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          eventType: 'user_updated',
          resourceId: 'user-456',
          resourceType: 'user',
          status: 'success',
          message: 'User jane.smith@company.com updated - name change',
          source: 'Azure AD',
          externalId: 'azure-user-456',
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          eventType: 'group_created',
          resourceId: 'group-789',
          resourceType: 'group',
          status: 'success',
          message: 'Group "Engineering" created with 12 members',
          source: 'Azure AD',
          externalId: 'azure-group-789',
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          eventType: 'sync_failed',
          resourceType: 'system',
          status: 'error',
          message: 'Sync failed: Connection timeout to identity provider',
          source: 'System',
        },
      ];
      setProvisioningEvents(mockEvents);
    } catch (err) {
      console.error('Failed to load provisioning events:', err);
      setError('Failed to load provisioning events');
    }
  }, []);

  // Load Sync Metrics (simulated)
  const loadSyncMetrics = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from analytics/metrics API
      const mockMetrics: SyncMetrics = {
        totalUsers: scimUsers.length,
        activeUsers: scimUsers.filter(user => user.active).length,
        inactiveUsers: scimUsers.filter(user => !user.active).length,
        totalGroups: scimGroups.length,
        lastSyncDuration: 45000,
        averageSyncDuration: 42000,
        successfulSyncs: 247,
        failedSyncs: 3,
        syncSuccess24h: 24,
        syncErrors24h: 0,
        userCreations24h: 3,
        userUpdates24h: 7,
        userDeletions24h: 1,
        groupCreations24h: 1,
        groupUpdates24h: 2,
        groupDeletions24h: 0,
      };
      setSyncMetrics(mockMetrics);
    } catch (err) {
      console.error('Failed to load sync metrics:', err);
      setError('Failed to load sync metrics');
    }
  }, [scimUsers, scimGroups]);

  // Manual Sync Trigger
  const triggerManualSync = useCallback(async () => {
    setManualSyncRunning(true);
    setError(null);
    
    try {
      // In a real implementation, this would trigger a sync job
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate sync
      setSuccess('Manual sync completed successfully');
      await loadSCIMUsers();
      await loadSCIMGroups();
      await loadProvisioningEvents();
      await loadSyncMetrics();
    } catch (err) {
      console.error('Manual sync failed:', err);
      setError('Manual sync failed');
    } finally {
      setManualSyncRunning(false);
    }
  }, [loadSCIMUsers, loadSCIMGroups, loadProvisioningEvents, loadSyncMetrics]);

  // Filtered Data
  const filteredUsers = useMemo(() => {
    let filtered = scimUsers;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        filterStatus === 'active' ? user.active : !user.active
      );
    }
    
    return filtered;
  }, [scimUsers, filterStatus]);

  const filteredGroups = useMemo(() => {
    let filtered = scimGroups;
    
    return filtered;
  }, [scimGroups]);

  const filteredEvents = useMemo(() => {
    let filtered = provisioningEvents;
    
    if (eventFilter !== 'all') {
      filtered = filtered.filter(event => event.status === eventFilter);
    }
    
    // Apply date range filter
    const now = new Date();
    const cutoff = new Date(now.getTime() - (
      dateRange === '1h' ? 3600000 :
      dateRange === '24h' ? 86400000 :
      dateRange === '7d' ? 604800000 :
      dateRange === '30d' ? 2592000000 :
      86400000
    ));
    
    filtered = filtered.filter(event => new Date(event.timestamp) >= cutoff);
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [provisioningEvents, eventFilter, dateRange]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await loadSCIMConfig();
      setIsLoading(false);
    };
    
    loadInitialData();
  }, [loadSCIMConfig]);

  // Load dependent data when config changes
  useEffect(() => {
    if (scimConfig.enabled) {
      loadSCIMUsers();
      loadSCIMGroups();
      loadProvisioningEvents();
    }
  }, [scimConfig.enabled, loadSCIMUsers, loadSCIMGroups, loadProvisioningEvents]);

  // Load metrics when data changes
  useEffect(() => {
    loadSyncMetrics();
  }, [loadSyncMetrics]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'info': return <Info color="info" />;
      default: return <Info />;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
        return <Person />;
      case 'group_created':
      case 'group_updated':
      case 'group_deleted':
        return <Group />;
      case 'sync_started':
      case 'sync_completed':
      case 'sync_failed':
        return <Sync />;
      default:
        return <Info />;
    }
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <LoadingSpinner />
        <Typography variant="h6" style={{ marginLeft: 16 }}>
          Loading SCIM Provisioning Monitor...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info />
          SCIM Provisioning Monitor
        </Typography>
        <Box style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="primary"
            startIcon={<Info />}
            onClick={() => {
              loadSCIMUsers();
              loadSCIMGroups();
              loadProvisioningEvents();
              loadSyncMetrics();
            }}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            startIcon={manualSyncRunning ? <LoadingSpinner size={16} /> : <Sync />}
            onClick={triggerManualSync}
            disabled={!scimConfig.enabled || manualSyncRunning}
          >
            {manualSyncRunning ? 'Syncing...' : 'Manual Sync'}
          </Button>
          <Button
            variant="primary"
            startIcon={<Info />}
            onClick={() => setShowConfigDialog(true)}
          >
            Configure
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" style={{ marginBottom: 16 }} onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" style={{ marginBottom: 16 }} onClose={() => setSuccess(null)}>
          <AlertTitle>Success</AlertTitle>
          {success}
        </Alert>
      )}

      {/* SCIM Status Overview */}
      <Card style={{ marginBottom: 24 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box>
                  {scimConfig.enabled ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="SCIM Enabled"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      icon={<Sync />}
                      label="SCIM Disabled"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Sync Status
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {scimConfig.syncStatus === 'running' && <LoadingSpinner size={16} />}
                {scimConfig.syncStatus === 'success' && <CheckCircle color="success" />}
                {scimConfig.syncStatus === 'error' && <ErrorIcon color="error" />}
                {scimConfig.syncStatus === 'idle' && <Schedule color="action" />}
                <Typography variant="body2">
                  {scimConfig.syncStatus === 'running' && 'Sync in Progress'}
                  {scimConfig.syncStatus === 'success' && 'Last Sync Successful'}
                  {scimConfig.syncStatus === 'error' && 'Sync Failed'}
                  {scimConfig.syncStatus === 'idle' && 'Ready for Sync'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Last Sync
              </Typography>
              <Typography variant="body2">
                {scimConfig.lastSync ? formatTimestamp(scimConfig.lastSync) : 'Never'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Sync Interval
              </Typography>
              <Typography variant="body2">
                Sync Interval
              </Typography>
              <Typography variant="body2">
                {scimConfig.syncInterval ? `${scimConfig.syncInterval / 60} minutes` : 'Manual only'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Person color="primary" />
                <Typography variant="h6">{syncMetrics.totalUsers}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Total Users
              </Typography>
              <Typography variant="caption" color="success.main">
                {syncMetrics.activeUsers} active, {syncMetrics.inactiveUsers} inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Group color="primary" />
                <Typography variant="h6">{syncMetrics.totalGroups}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Total Groups
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {scimConfig.groupSyncEnabled ? 'Group sync enabled' : 'Group sync disabled'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Info color="success" />
                <Typography variant="h6">{syncMetrics.syncSuccess24h}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Successful Syncs (24h)
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Avg duration: {formatDuration(syncMetrics.averageSyncDuration)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Info color="error" />
                <Typography variant="h6">{syncMetrics.syncErrors24h}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Sync Errors (24h)
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total operations: {syncMetrics.userCreations24h + syncMetrics.userUpdates24h + syncMetrics.userDeletions24h}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box style={{ borderBottom: 1, borderColor: 'divider' }}>
          {/* <Tabs tabs={tabDefs} initialIndex={currentTab} /> */}
        </Box>

        {/* Users Tab */}
        <TabPanel value={0} index={0}>
          <Box style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            {/* <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSearchTerm(e.target.value)}
            /> */}
            <FormControl style={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e: React.ChangeEvent<{ value: string }>) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="textSecondary">
              {filteredUsers.length} of {scimUsers.length} users
            </Typography>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Groups</TableCell>
                  <TableCell>Last Modified</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.name.givenName} {user.name.familyName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user.userName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.emails.find(email => email.primary)?.value || user.emails[0]?.value}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active ? 'Active' : 'Inactive'}
                        color={user.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={user.groups.length} color="primary">
                        <Group />
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTimestamp(user.lastModified)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDialog(true);
                          }}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Groups Tab */}
        <TabPanel value={0} index={1}>
          <Box style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            {/* <TextField
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSearchTerm(e.target.value)}
            /> */}
            <Typography variant="body2" color="textSecondary">
              {filteredGroups.length} of {scimGroups.length} groups
            </Typography>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Group Name</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell>Last Modified</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {group.displayName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={group.members.length} color="primary">
                        <Person />
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTimestamp(group.lastModified)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedGroup(group);
                            setShowGroupDialog(true);
                          }}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel value={0} index={2}>
          <Box style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <FormControl style={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={eventFilter}
                label="Filter"
                onChange={(e: React.ChangeEvent<{ value: string }>) => setEventFilter(e.target.value)}
              >
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="info">Info</MenuItem>
              </Select>
            </FormControl>
            <FormControl style={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={dateRange}
                label="Time Range"
                onChange={(e: React.ChangeEvent<{ value: string }>) => setDateRange(e.target.value)}
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="textSecondary">
              {filteredEvents.length} events
            </Typography>
          </Box>

          <List>
            {filteredEvents.map((event) => (
              <ListItem key={event.id} divider>
                <ListItemIcon>
                  {getEventTypeIcon(event.eventType)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(event.status)}
                      <Typography variant="body2" component="span">
                        {event.message}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {formatTimestamp(event.timestamp)} • {event.source}
                        {event.externalId && ` • External ID: ${event.externalId}`}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {filteredEvents.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No events found"
                  secondary="No provisioning events match the current filters"
                />
              </ListItem>
            )}
          </List>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={0} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Activity (24h)
                  </Typography>
                  <Box style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <Box>
                      <Typography variant="h4" color="success.main">
                        {syncMetrics.userCreations24h}
                      </Typography>
                      <Typography variant="caption">Created</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" color="info.main">
                        {syncMetrics.userUpdates24h}
                      </Typography>
                      <Typography variant="caption">Updated</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" color="error.main">
                        {syncMetrics.userDeletions24h}
                      </Typography>
                      <Typography variant="caption">Deleted</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Group Activity (24h)
                  </Typography>
                  <Box style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <Box>
                      <Typography variant="h4" color="success.main">
                        {syncMetrics.groupCreations24h}
                      </Typography>
                      <Typography variant="caption">Created</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" color="info.main">
                        {syncMetrics.groupUpdates24h}
                      </Typography>
                      <Typography variant="caption">Updated</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" color="error.main">
                        {syncMetrics.groupDeletions24h}
                      </Typography>
                      <Typography variant="caption">Deleted</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sync Performance
                  </Typography>
                  <Box style={{ marginBottom: 16 }}>
                    <Typography variant="body2" color="textSecondary">
                      Success Rate
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(syncMetrics.successfulSyncs / (syncMetrics.successfulSyncs + syncMetrics.failedSyncs)) * 100}
                      style={{ marginBottom: 8 }}
                    />
                    <Typography variant="caption">
                      {Math.round((syncMetrics.successfulSyncs / (syncMetrics.successfulSyncs + syncMetrics.failedSyncs)) * 100)}%
                      ({syncMetrics.successfulSyncs} successful, {syncMetrics.failedSyncs} failed)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Average Sync Duration
                    </Typography>
                    <Typography variant="h6">
                      {formatDuration(syncMetrics.averageSyncDuration)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Health
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <NetworkCheck color={scimConfig.enabled ? 'success' : 'error'} />
                      </ListItemIcon>
                      <ListItemText
                        primary="SCIM Endpoint"
                        secondary={scimConfig.enabled ? 'Active' : 'Disabled'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VpnKey color={scimConfig.token ? 'success' : 'error'} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Authentication"
                        secondary={scimConfig.token ? 'Configured' : 'Not Configured'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule color={scimConfig.syncInterval > 0 ? 'success' : 'warning'} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Scheduled Sync"
                        secondary={scimConfig.syncInterval > 0 ? 'Enabled' : 'Disabled'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* User Details Dialog */}
      <Dialog
        open={showUserDialog}
        onClose={() => setShowUserDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Person />
            User Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {selectedUser.name.givenName} {selectedUser.name.familyName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Username
                </Typography>
                <Typography variant="body1">{selectedUser.userName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {selectedUser.emails.find(email => email.primary)?.value || selectedUser.emails[0]?.value}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={selectedUser.active ? 'Active' : 'Inactive'}
                  color={selectedUser.active ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created
                </Typography>
                <Typography variant="body1">{formatTimestamp(selectedUser.created)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Modified
                </Typography>
                <Typography variant="body1">{formatTimestamp(selectedUser.lastModified)}</Typography>
              </Grid>
              {selectedUser.externalId && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    External ID
                  </Typography>
                  <Typography variant="body1">{selectedUser.externalId}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Groups ({selectedUser.groups.length})
                </Typography>
                <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {selectedUser.groups.map((groupId) => (
                    <Chip key={groupId} label={groupId} size="small" />
                  ))}
                  {selectedUser.groups.length === 0 && (
                    <Typography variant="body2" color="textSecondary">
                      No group memberships
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Group Details Dialog */}
      <Dialog
        open={showGroupDialog}
        onClose={() => setShowGroupDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Group />
            Group Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedGroup && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Display Name
                </Typography>
                <Typography variant="body1">{selectedGroup.displayName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created
                </Typography>
                <Typography variant="body1">{formatTimestamp(selectedGroup.created)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Modified
                </Typography>
                <Typography variant="body1">{formatTimestamp(selectedGroup.lastModified)}</Typography>
              </Grid>
              {selectedGroup.externalId && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    External ID
                  </Typography>
                  <Typography variant="body1">{selectedGroup.externalId}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Members ({selectedGroup.members.length})
                </Typography>
                <List dense>
                  {selectedGroup.members.map((member) => (
                    <ListItem key={member.value} style={{ paddingLeft: 0, paddingRight: 0 }}>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText primary={member.display} secondary={member.value} />
                    </ListItem>
                  ))}
                  {selectedGroup.members.length === 0 && (
                    <Typography variant="body2" color="textSecondary">
                      No members
                    </Typography>
                  )}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGroupDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog
        open={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>SCIM Configuration</DialogTitle>
        <DialogContent>
          <Alert severity="info" style={{ marginBottom: 16 }}>
            SCIM configuration changes require server restart to take effect.
          </Alert>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={scimConfig.enabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSCIMConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label="Enable SCIM Provisioning"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={scimConfig.userSyncEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSCIMConfig(prev => ({ ...prev, userSyncEnabled: e.target.checked }))}
                  disabled={!scimConfig.enabled}
                />
              }
              label="Enable User Sync"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={scimConfig.groupSyncEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSCIMConfig(prev => ({ ...prev, groupSyncEnabled: e.target.checked }))}
                  disabled={!scimConfig.enabled}
                />
              }
              label="Enable Group Sync"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={scimConfig.allowNonProvisionedUsers}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSCIMConfig(prev => ({ ...prev, allowNonProvisionedUsers: e.target.checked }))}
                  disabled={!scimConfig.enabled}
                />
              }
              label="Allow Non-Provisioned Users"
            />
            {/* <TextField
              label="Sync Interval (seconds)"
              type="number"
              value={scimConfig.syncInterval}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSCIMConfig(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 0 }))}
              disabled={!scimConfig.enabled}
              InputProps={{
                endAdornment: <Typography variant="caption">0 = manual only</Typography>
              }}
            /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfigDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowConfigDialog(false)}>
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
