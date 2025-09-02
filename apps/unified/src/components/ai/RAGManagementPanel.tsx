/**
 * RAG Management Panel
 * UI component for managing RAG system, data sources, and testing queries
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Search as SearchIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Sync as SyncIcon,
  CloudSync as CloudSyncIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const ConnectorCard = styled(Card)(({ theme, connected }) => ({
  border: `2px solid ${connected ? theme.palette.success.main : theme.palette.grey[300]}`,
  backgroundColor: connected ? alpha(theme.palette.success.light, 0.1) : theme.palette.grey[50],
}));

const RAGManagementPanel = ({
  ragStats,
  dataSourceConnectors,
  ragQueryResults,
  synthQueryResults,
  onTestRAGQuery,
  onTestSynthQuery,
  onSyncDataSources,
  onToggleConnector,
}) => {
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [syncingConnectors, setSyncingConnectors] = useState(new Set());
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [connectorActions, setConnectorActions] = useState({});
  const [showSystemAlerts, setShowSystemAlerts] = useState(true);

  const handleConnectorSync = async (connectorId) => {
    setSyncingConnectors(prev => new Set([...prev, connectorId]));
    try {
      await onSyncDataSources(connectorId);
    } finally {
      setSyncingConnectors(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectorId);
        return newSet;
      });
    }
  };

  const getConnectorStatusColor = (connector) => {
    if (!connector.isConnected) return 'error';
    if (connector.totalDocuments === 0) return 'warning';
    return 'success';
  };

  const getConnectorIcon = (type) => {
    switch (type) {
      case 'knowledge_base':
        return <InfoIcon />;
      case 'tickets':
        return <WarningIcon />;
      case 'service_catalog':
        return <StorageIcon />;
      case 'monitoring':
        return <CloudSyncIcon />;
      default:
        return <StorageIcon />;
    }
  };

  const handleConnectorSelect = (connector) => {
    setSelectedConnector(connector);
    setShowDetailedView(true);
  };

  const handleConnectorAction = (connectorId, action) => {
    setConnectorActions(prev => ({
      ...prev,
      [connectorId]: action
    }));
  };

  const getSystemAlerts = () => {
    const alerts = [];
    
    if (ragStats?.ragEngine?.totalChunks === 0) {
      alerts.push({
        severity: 'warning',
        message: 'No documents indexed. Add data sources to enable RAG functionality.'
      });
    }
    
    const disconnectedConnectors = dataSourceConnectors?.filter(c => !c.isConnected).length || 0;
    if (disconnectedConnectors > 0) {
      alerts.push({
        severity: 'error',
        message: `${disconnectedConnectors} data source connector(s) are disconnected.`
      });
    }
    
    return alerts;
  };

  const renderSystemAlerts = () => {
    if (!showSystemAlerts) return null;
    
    const alerts = getSystemAlerts();
    if (alerts.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            severity={alert.severity}
            onClose={() => setShowSystemAlerts(false)}
            sx={{ mb: 1 }}
          >
            {alert.message}
          </Alert>
        ))}
      </Box>
    );
  };

  const renderDataSourceTable = () => (
    <Paper sx={{ mb: 4 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Data Source Connectors</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Last Sync</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell>Settings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataSourceConnectors?.map((connector) => (
              <TableRow key={connector.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getConnectorIcon(connector.type)}
                    {connector.type}
                  </Box>
                </TableCell>
                <TableCell>{connector.name}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={connector.isConnected ? 'Connected' : 'Disconnected'}
                    color={getConnectorStatusColor(connector)}
                    icon={connector.isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
                  />
                  {syncingConnectors.has(connector.id) && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <LinearProgress />
                    </Box>
                  )}
                </TableCell>
                <TableCell>{connector.totalDocuments?.toLocaleString() || 0}</TableCell>
                <TableCell>
                  {connector.lastSync ? new Date(connector.lastSync).toLocaleString() : 'Never'}
                </TableCell>
                <TableCell>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => handleConnectorSelect(connector)}
                      disabled={!connector.isConnected}
                    >
                      <PlayIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleConnectorSync(connector.id)}
                      disabled={syncingConnectors.has(connector.id)}
                    >
                      <SyncIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleConnectorAction(connector.id, 'stop')}
                      disabled={!connector.isConnected}
                    >
                      <StopIcon />
                    </IconButton>
                  </CardActions>
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={connector.config?.enabled || false}
                        onChange={(e) => onToggleConnector(connector.id, e.target.checked)}
                        size="small"
                      />
                    }
                    label="Auto-sync"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SearchIcon sx={{ mr: 2, color: 'primary.main' }} />
        RAG System Management
      </Typography>

      {/* System Alerts */}
      {renderSystemAlerts()}

      {/* Toggle Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant={showDetailedView ? "contained" : "outlined"}
          onClick={() => setShowDetailedView(!showDetailedView)}
          startIcon={<InfoIcon />}
        >
          {showDetailedView ? 'Hide' : 'Show'} Detailed View
        </Button>
        <Button
          variant={showSystemAlerts ? "contained" : "outlined"}
          onClick={() => setShowSystemAlerts(!showSystemAlerts)}
          startIcon={<WarningIcon />}
        >
          {showSystemAlerts ? 'Hide' : 'Show'} System Alerts
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* RAG Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Documents
              </Typography>
              <Typography variant="h4" color="primary">
                {ragStats?.ragEngine?.totalChunks?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Indexed chunks
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Connectors
              </Typography>
              <Typography variant="h4" color="success.main">
                {dataSourceConnectors?.filter(c => c.isConnected)?.length || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                of {dataSourceConnectors?.length || 0} total
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                RBAC Users
              </Typography>
              <Typography variant="h4" color="info.main">
                {ragStats?.rbac?.users || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                With access controls
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cache Efficiency
              </Typography>
              <Typography variant="h4" color="warning.main">
                {ragStats?.rbac?.cacheEntries || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Cached decisions
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Data Source Connectors Table */}
      {renderDataSourceTable()}

      {/* System Status Info */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="RAG Engine"
              secondary="Operational and processing queries"
            />
            <ListItemSecondaryAction>
              <Chip size="small" label="Active" color="success" />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onTestRAGQuery}
          >
            Test RAG Query
          </Button>
          <Button
            variant="contained"
            startIcon={<PsychologyIcon />}
            onClick={onTestSynthQuery}
            color="secondary"
          >
            Test Synth Query
          </Button>
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={() => onSyncDataSources()}
          >
            Sync All Sources
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh Dashboard
          </Button>
        </Box>
      </Paper>

      {/* Selected Connector Details (when detailed view is enabled) */}
      {showDetailedView && selectedConnector && (
        <ConnectorCard connected={selectedConnector.isConnected}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Connector Details: {selectedConnector.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Type: {selectedConnector.type}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Status: {selectedConnector.isConnected ? 'Connected' : 'Disconnected'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Documents: {selectedConnector.totalDocuments?.toLocaleString() || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Last Sync: {selectedConnector.lastSync ? 
                    new Date(selectedConnector.lastSync).toLocaleString() : 'Never'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Sync Frequency: {selectedConnector.syncFrequency || 'Manual'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Actions: {connectorActions[selectedConnector.id] || 'None'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </ConnectorCard>
      )}

      {/* Recent Query Results */}
      {(ragQueryResults.length > 0 || synthQueryResults.length > 0) && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Query Results
            </Typography>
            
            {ragQueryResults.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>RAG Query Results ({ragQueryResults.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {ragQueryResults.slice(0, 5).map((result, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={result.query}
                          secondary={`${result.sources.length} sources • ${new Date(result.timestamp).toLocaleString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}
            
            {synthQueryResults.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Synth Query Results ({synthQueryResults.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {synthQueryResults.slice(0, 5).map((result, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={result.query}
                          secondary={`Response: ${result.response.substring(0, 100)}... • ${new Date(result.timestamp).toLocaleString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}
      {/* Recent Query Results */}
      {(ragQueryResults.length > 0 || synthQueryResults.length > 0) && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Query Results
            </Typography>
            
            {ragQueryResults.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>RAG Query Results ({ragQueryResults.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {ragQueryResults.slice(0, 5).map((result, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={result.query}
                          secondary={`${result.sources.length} sources • ${new Date(result.timestamp).toLocaleString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}
            
            {synthQueryResults.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Synth Query Results ({synthQueryResults.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {synthQueryResults.slice(0, 5).map((result, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={result.query}
                          secondary={`Response: ${result.response.substring(0, 100)}... • ${new Date(result.timestamp).toLocaleString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RAGManagementPanel;