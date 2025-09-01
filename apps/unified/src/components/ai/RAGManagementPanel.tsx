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
import { styled } from '@mui/material/styles';

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
  backgroundColor: connected ? theme.palette.success.light + '10' : theme.palette.grey[50],
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

  return (
    <Box>
      {/* RAG System Overview */}
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SearchIcon sx={{ mr: 2, color: 'primary.main' }} />
        RAG System Management
      </Typography>

      {/* Statistics Cards */}
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

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Data Source Connectors */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Source Connectors
          </Typography>
          
          <Grid container spacing={2}>
            {dataSourceConnectors?.map((connector) => (
              <Grid item xs={12} md={6} key={connector.id}>
                <ConnectorCard connected={connector.isConnected}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {getConnectorIcon(connector.type)}
                      <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                        {connector.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={connector.isConnected ? 'Connected' : 'Disconnected'}
                        color={getConnectorStatusColor(connector)}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Type: {connector.type}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      Documents: {connector.totalDocuments?.toLocaleString() || 0}
                    </Typography>
                    
                    {connector.lastSync && (
                      <Typography variant="body2" color="textSecondary">
                        Last sync: {new Date(connector.lastSync).toLocaleString()}
                      </Typography>
                    )}
                    
                    {connector.nextSync && (
                      <Typography variant="body2" color="textSecondary">
                        Next sync: {new Date(connector.nextSync).toLocaleString()}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={connector.config.enabled}
                          onChange={(e) => onToggleConnector(connector.id, e.target.checked)}
                          size="small"
                        />
                      }
                      label="Enabled"
                    />
                    
                    <Button
                      size="small"
                      startIcon={syncingConnectors.has(connector.id) ? <SyncIcon /> : <RefreshIcon />}
                      onClick={() => handleConnectorSync(connector.id)}
                      disabled={syncingConnectors.has(connector.id) || !connector.config.enabled}
                    >
                      {syncingConnectors.has(connector.id) ? 'Syncing...' : 'Sync Now'}
                    </Button>
                  </CardActions>
                  
                  {syncingConnectors.has(connector.id) && (
                    <LinearProgress />
                  )}
                </ConnectorCard>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

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
                        <ListItemIcon>
                          <SearchIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Query: ${result.query}`}
                          secondary={`Confidence: ${(result.confidence * 100).toFixed(1)}% | Chunks: ${result.chunks} | Time: ${result.retrievalTime}ms`}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            size="small"
                            label={result.rbacEnforced ? 'RBAC' : 'Open'}
                            color={result.rbacEnforced ? 'success' : 'default'}
                          />
                        </ListItemSecondaryAction>
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
                        <ListItemIcon>
                          <PsychologyIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Query: ${result.query}`}
                          secondary={`Personality: ${result.personality} | Confidence: ${(result.confidence * 100).toFixed(1)}% | RAG Chunks: ${result.ragChunks}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            size="small"
                            label={result.responseType}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      {ragStats && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  RAG Engine
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color={ragStats.ragEngine?.isInitialized ? 'success' : 'error'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Initialized"
                      secondary={ragStats.ragEngine?.isInitialized ? 'Running' : 'Not running'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <StorageIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Vector Stores"
                      secondary={`${ragStats.ragEngine?.embeddingModels?.length || 0} models, ${ragStats.ragEngine?.vectorStores?.length || 0} stores`}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  RBAC System
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color={ragStats.rbac?.isInitialized ? 'success' : 'error'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="RBAC Enabled"
                      secondary={ragStats.rbac?.isInitialized ? 'Active' : 'Inactive'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Policies"
                      secondary={`${ragStats.rbac?.policies || 0} policies, ${ragStats.rbac?.roles || 0} roles`}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RAGManagementPanel;