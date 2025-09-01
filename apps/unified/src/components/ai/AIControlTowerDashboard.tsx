/**
 * AI Control Tower Dashboard
 * Modern enterprise UI for AI/ML model management, training, and audit
 * Based on 2024-2025 industry standards for AI control interfaces
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  SmartToy as AIIcon,
  Storage as DataIcon,
  Train as TrainIcon,
  QueryStats as QueryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
  SmartToy,
  Settings,
  Psychology as PsychologyIcon,
  ModelTraining as ModelTrainingIcon,
  Tune as TuneIcon,
  AutoFixHigh as AutoFixHighIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { apiService } from '../../services/api.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import RAGManagementPanel from './RAGManagementPanel';
import RBACTestingPanel from './RBACTestingPanel';
import AIAgentManagementPanel from './AIAgentManagementPanel';

// Styled components with modern design
const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
}));

const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const colors = {
    READY: { bg: theme.palette.success.light, color: theme.palette.success.dark },
    TRAINING: { bg: theme.palette.warning.light, color: theme.palette.warning.dark },
    ERROR: { bg: theme.palette.error.light, color: theme.palette.error.dark },
    DEPLOYED: { bg: theme.palette.info.light, color: theme.palette.info.dark },
  };

  const statusColor = colors[status] || colors.READY;

  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: statusColor.color,
    },
  };
});

const ControlTowerHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(#grid)"/></svg>`)}")',
    pointerEvents: 'none',
  },
}));

export const AIControlTowerDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [models, setModels] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [ragSystems, _setRagSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // ML Pipeline states
  const [mlExperiments, setMlExperiments] = useState([]);
  const [mlPipelineStatus, setMlPipelineStatus] = useState(null);
  const [cosmoPersonalities, setCosmoPersonalities] = useState(new Map());
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [trainingStatus, setTrainingStatus] = useState({});

  // RAG Management states
  const [ragStats, setRagStats] = useState(null);
  const [ragQueryResults, setRagQueryResults] = useState([]);
  const [dataSourceConnectors, setDataSourceConnectors] = useState([]);
  const [synthQueryResults, setSynthQueryResults] = useState([]);

  // RBAC Testing states
  const [rbacTestResults, setRbacTestResults] = useState(null);
  const [personalityTestResults, setPersonalityTestResults] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [rbacUsers, setRbacUsers] = useState([]);
  const [rbacPolicies, setRbacPolicies] = useState([]);

  // Dialog states
  const [createTowerDialog, setCreateTowerDialog] = useState(false);
  const [createModelDialog, setCreateModelDialog] = useState(false);
  const [createRAGDialog, setCreateRAGDialog] = useState(false);
  const [trainingDialog, setTrainingDialog] = useState(false);
  const [createITSMExperimentDialog, setCreateITSMExperimentDialog] = useState(false);
  const [cosmoPersonalityDialog, setCosmoPersonalityDialog] = useState(false);
  const [modelSettingsDialog, setModelSettingsDialog] = useState(false);
  const [ragQueryDialog, setRagQueryDialog] = useState(false);
  const [synthQueryDialog, setSynthQueryDialog] = useState(false);
  const [rbacUserDialog, setRbacUserDialog] = useState(false);
  const [rbacPolicyDialog, setRbacPolicyDialog] = useState(false);

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load control towers
      const towersResponse = await apiService.get('/ai-control-tower/towers');
      setTowers(towersResponse.data);

      if (towersResponse.data.length > 0) {
        const firstTower = towersResponse.data[0];
        setSelectedTower(firstTower);

        // Load metrics for first tower
        const metricsResponse = await apiService.get(
          `/ai-control-tower/towers/${firstTower.id}/metrics`,
        );
        setMetrics(metricsResponse.data);
      }

      // Load ML Pipeline data
      await loadMLPipelineData();

      // Load RAG Management data
      await loadRAGData();

      // Load RBAC data
      await loadRBACData();

      setError(null);
    } catch (_err) {
      setError(_err.message || 'Failed to load dashboard data');
      showSnackbar('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMLPipelineData = useCallback(async () => {
    try {
      // Load ML experiments
      const experimentsResponse = await apiService.get('/api/ml-pipeline/experiments');
      setMlExperiments(experimentsResponse.data || []);

      // Load ML Pipeline status
      const statusResponse = await apiService.get('/api/ml-pipeline/status');
      setMlPipelineStatus(statusResponse.data);

      // Load Cosmo personalities
      const personalitiesResponse = await apiService.get('/api/ml-pipeline/cosmo-personalities');
      setCosmoPersonalities(new Map(Object.entries(personalitiesResponse.data || {})));

      // Load training status for each experiment
      const trainingStatusMap = {};
      for (const experiment of experimentsResponse.data || []) {
        try {
          const statusRes = await apiService.get(`/api/ml-pipeline/experiments/${experiment.id}/status`);
          trainingStatusMap[experiment.id] = statusRes.data;
        } catch (err) {
          console.warn(`Failed to load status for experiment ${experiment.id}:`, err);
        }
      }
      setTrainingStatus(trainingStatusMap);

    } catch (err) {
      console.error('Failed to load ML Pipeline data:', err);
      showSnackbar('Failed to load ML Pipeline data', 'warning');
    }
  }, []);

  const loadRAGData = useCallback(async () => {
    try {
      // Load RAG system statistics
      const statsResponse = await apiService.get('/api/nova-rag/stats');
      setRagStats(statsResponse.data);

      // Load data source connectors
      const connectorsResponse = await apiService.get('/api/nova-rag/data-sources');
      setDataSourceConnectors(connectorsResponse.data.connectors || []);

    } catch (err) {
      console.error('Failed to load RAG data:', err);
      showSnackbar('Failed to load RAG data', 'warning');
    }
  }, []);

  const loadRBACData = useCallback(async () => {
    try {
      // Load audit logs
      const auditResponse = await apiService.get('/api/nova-rag/rbac/audit-logs?limit=50');
      setAuditLogs(auditResponse.data.logs || []);

    } catch (err) {
      console.error('Failed to load RBAC data:', err);
      showSnackbar('Failed to load RBAC data', 'warning');
    }
  }, []);

  const handleTowerChange = async (tower) => {
    setSelectedTower(tower);
    try {
      const metricsResponse = await apiService.get(`/ai-control-tower/towers/${tower.id}/metrics`);
      setMetrics(metricsResponse.data);
    } catch (_err) {
      console.error('Failed to load tower metrics:', _err);
      showSnackbar('Failed to load tower metrics', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const createControlTower = async (towerData) => {
    try {
      const response = await apiService.post('/ai-control-tower/towers', towerData);
      setTowers((prev) => [...prev, response.data]);
      setCreateTowerDialog(false);
      showSnackbar('Control tower created successfully', 'success');
    } catch (_err) {
      console.error('Failed to create control tower:', _err);
      showSnackbar('Failed to create control tower', 'error');
    }
  };

  const createModel = async (modelData) => {
    try {
      const response = await apiService.post('/ai-control-tower/models', {
        ...modelData,
        towerId: selectedTower.id,
      });
      setModels((prev) => [...prev, response.data]);
      setCreateModelDialog(false);
      showSnackbar('AI model created successfully', 'success');
    } catch (_err) {
      console.error('Failed to create AI model:', _err);
      showSnackbar('Failed to create AI model', 'error');
    }
  };

  const startTraining = async (trainingData) => {
    try {
      await apiService.post('/ai-control-tower/training', trainingData);
      setTrainingDialog(false);
      showSnackbar('Training started successfully', 'success');
      loadDashboardData(); // Refresh data
    } catch (_err) {
      console.error('Failed to start training:', _err);
      showSnackbar('Failed to start training', 'error');
    }
  };

  // ML Pipeline specific handlers
  const createITSMExperiment = async (experimentData) => {
    try {
      const response = await apiService.post('/api/ml-pipeline/experiments/itsm', {
        modelName: experimentData.modelName,
        cosmoPersonalityProfile: experimentData.cosmoPersonality || 'default',
        itsmCategories: experimentData.categories || ['Hardware', 'Software', 'Network', 'Access Management', 'Infrastructure']
      });
      
      await loadMLPipelineData();
      setCreateITSMExperimentDialog(false);
      showSnackbar(`ITSM experiment created: ${response.data.experimentId}`, 'success');
    } catch (err) {
      console.error('Failed to create ITSM experiment:', err);
      showSnackbar('Failed to create ITSM experiment', 'error');
    }
  };

  const startMLTraining = async (experimentId) => {
    try {
      setTrainingStatus(prev => ({ ...prev, [experimentId]: { status: 'starting' } }));
      
      await apiService.post(`/api/ml-pipeline/experiments/${experimentId}/train`);
      
      showSnackbar('ML training started successfully', 'success');
      
      // Poll for training status
      pollTrainingStatus(experimentId);
    } catch (err) {
      console.error('Failed to start ML training:', err);
      showSnackbar('Failed to start ML training', 'error');
      setTrainingStatus(prev => ({ ...prev, [experimentId]: { status: 'error', error: err.message } }));
    }
  };

  const pollTrainingStatus = async (experimentId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await apiService.get(`/api/ml-pipeline/experiments/${experimentId}/status`);
        setTrainingStatus(prev => ({ ...prev, [experimentId]: response.data }));
        
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(pollInterval);
          if (response.data.status === 'completed') {
            showSnackbar(`Training completed for experiment ${experimentId}`, 'success');
          } else {
            showSnackbar(`Training failed for experiment ${experimentId}`, 'error');
          }
          await loadMLPipelineData();
        }
      } catch (err) {
        console.error('Failed to poll training status:', err);
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds

    // Clear interval after 1 hour to prevent infinite polling
    setTimeout(() => clearInterval(pollInterval), 3600000);
  };

  const updateCosmoPersonality = async (experimentId, personalityData) => {
    try {
      await apiService.put(`/api/ml-pipeline/experiments/${experimentId}/cosmo-personality`, personalityData);
      
      await loadMLPipelineData();
      setCosmoPersonalityDialog(false);
      showSnackbar('Cosmo personality updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update Cosmo personality:', err);
      showSnackbar('Failed to update Cosmo personality', 'error');
    }
  };

  const updateModelSettings = async (experimentId, settings) => {
    try {
      await apiService.put(`/api/ml-pipeline/experiments/${experimentId}/settings`, settings);
      
      await loadMLPipelineData();
      setModelSettingsDialog(false);
      showSnackbar('Model settings updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update model settings:', err);
      showSnackbar('Failed to update model settings', 'error');
    }
  };

  const deleteExperiment = async (experimentId) => {
    try {
      await apiService.delete(`/api/ml-pipeline/experiments/${experimentId}`);
      
      await loadMLPipelineData();
      showSnackbar('Experiment deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete experiment:', err);
      showSnackbar('Failed to delete experiment', 'error');
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner message="Loading AI Control Tower..." />
      </DashboardContainer>
    );
  }

  if (error && towers.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState
          icon={<AIIcon sx={{ fontSize: 64 }} />}
          title="Unable to load AI Control Tower"
          description={error}
          action={
            <Button variant="contained" onClick={loadDashboardData} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          }
        />
      </DashboardContainer>
    );
  }

  if (towers.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState
          icon={<AIIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />}
          title="Welcome to AI Control Tower"
          description="Create your first AI control tower to start managing models, training pipelines, and RAG systems."
          action={
            <Button
              variant="contained"
              size="large"
              onClick={() => setCreateTowerDialog(true)}
              startIcon={<AddIcon />}
            >
              Create Control Tower
            </Button>
          }
        />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer maxWidth="xl">
      {/* Header */}
      <ControlTowerHeader>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              AI Control Tower
            </Typography>
            <Typography variant="h6" opacity={0.9}>
              Enterprise AI/ML Management & Governance Platform
            </Typography>
          </Grid>
          <Grid item>
            <Box display="flex" gap={2}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={loadDashboardData}
                  sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </ControlTowerHeader>

      {/* Tower Selection */}
      {towers.length > 1 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Control Tower</InputLabel>
            <Select
              value={selectedTower?.id || ''}
              onChange={(e) => {
                const tower = towers.find((t) => t.id === e.target.value);
                handleTowerChange(tower);
              }}
            >
              {towers.map((tower) => (
                <MenuItem key={tower.id} value={tower.id}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AIIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2">{tower.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {tower.environment} • {tower.status}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Models
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {metrics.models.total}
                    </Typography>
                  </Box>
                  <AIIcon sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.7 }} />
                </Box>
                <Box display="flex" gap={1} mt={2}>
                  <Chip size="small" label={`${metrics.models.active} Active`} color="success" />
                  <Chip
                    size="small"
                    label={`${metrics.models.training} Training`}
                    color="warning"
                  />
                </Box>
              </CardContent>
            </MetricCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      API Requests
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {metrics.requests.total.toLocaleString()}
                    </Typography>
                  </Box>
                  <QueryIcon sx={{ fontSize: 40, color: theme.palette.info.main, opacity: 0.7 }} />
                </Box>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Avg: {Math.round(metrics.requests.averageResponseTime)}ms
                </Typography>
              </CardContent>
            </MetricCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Audit Events
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {metrics.audit.totalEvents}
                    </Typography>
                  </Box>
                  <SecurityIcon
                    sx={{ fontSize: 40, color: theme.palette.warning.main, opacity: 0.7 }}
                  />
                </Box>
                <Box display="flex" gap={1} mt={2}>
                  <Badge badgeContent={metrics.audit.highRiskEvents} color="error">
                    <Chip 
                      size="small" 
                      label="High Risk" 
                      color="error" 
                      variant="outlined" 
                      icon={<WarningIcon />}
                    />
                  </Badge>
                </Box>
              </CardContent>
            </MetricCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Error Rate
                    </Typography>
                    <Typography
                      variant="h4"
                      color={metrics.requests.errorRate > 5 ? 'error' : 'primary'}
                    >
                      {metrics.requests.errorRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  {metrics.requests.errorRate > 5 ? (
                    <ErrorIcon
                      sx={{ fontSize: 40, color: theme.palette.error.main, opacity: 0.7 }}
                    />
                  ) : (
                    <CheckCircleIcon
                      sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.7 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Last 24 hours
                </Typography>
              </CardContent>
            </MetricCard>
          </Grid>
        </Grid>
      )}

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AIIcon />} label="Models" />
          <Tab icon={<TrainIcon />} label="Training" />
          <Tab icon={<DataIcon />} label="RAG Systems" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
          <Tab icon={<SecurityIcon />} label="Audit" />
          <Tab icon={<SmartToy />} label="ML Pipeline" />
          <Tab icon={<Settings />} label="Cosmo AI" />
          <Tab icon={<QueryIcon />} label="RAG Management" />
          <Tab icon={<SecurityIcon />} label="RBAC Testing" />
          <Tab icon={<SmartToy />} label="AI Agents" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <ModelsPanel
            models={models}
            onCreateModel={() => setCreateModelDialog(true)}
            onStartTraining={(model) => {
              setSelectedItem(model);
              setTrainingDialog(true);
            }}
            onMenuOpen={handleMenuOpen}
          />
        )}

        {activeTab === 1 && (
          <TrainingPanel
            _towerId={selectedTower?.id}
            onStartTraining={() => setTrainingDialog(true)}
          />
        )}

        {activeTab === 2 && (
          <RAGPanel _ragSystems={ragSystems} onCreateRAG={() => setCreateRAGDialog(true)} />
        )}

        {activeTab === 3 && <AnalyticsPanel metrics={metrics} _towerId={selectedTower?.id} />}

        {activeTab === 4 && <AuditPanel towerId={selectedTower?.id} />}

        {activeTab === 5 && (
          <MLPipelinePanel
            experiments={mlExperiments}
            pipelineStatus={mlPipelineStatus}
            trainingStatus={trainingStatus}
            onCreateExperiment={() => setCreateITSMExperimentDialog(true)}
            onStartTraining={startMLTraining}
            onUpdateSettings={(experiment) => {
              setSelectedExperiment(experiment);
              setModelSettingsDialog(true);
            }}
            onDeleteExperiment={deleteExperiment}
          />
        )}

        {activeTab === 6 && (
          <CosmoPersonalityPanel
            personalities={cosmoPersonalities}
            experiments={mlExperiments}
            onUpdatePersonality={(experiment) => {
              setSelectedExperiment(experiment);
              setCosmoPersonalityDialog(true);
            }}
            onCreatePersonality={() => setCosmoPersonalityDialog(true)}
          />
        )}

        {activeTab === 7 && (
          <RAGManagementPanel
            ragStats={ragStats}
            dataSourceConnectors={dataSourceConnectors}
            ragQueryResults={ragQueryResults}
            synthQueryResults={synthQueryResults}
            onTestRAGQuery={() => setRagQueryDialog(true)}
            onTestSynthQuery={() => setSynthQueryDialog(true)}
            onSyncDataSources={async () => {
              try {
                await apiService.post('/api/nova-rag/data-sources/sync');
                await loadRAGData();
                showSnackbar('Data sources sync initiated', 'success');
              } catch (error) {
                showSnackbar('Failed to sync data sources', 'error');
              }
            }}
            onToggleConnector={async (connectorId, enabled) => {
              try {
                await apiService.post(`/api/nova-rag/data-sources/${connectorId}/toggle`, { enabled });
                await loadRAGData();
                showSnackbar(`Connector ${enabled ? 'enabled' : 'disabled'}`, 'success');
              } catch (error) {
                showSnackbar('Failed to toggle connector', 'error');
              }
            }}
          />
        )}

        {activeTab === 8 && (
          <RBACTestingPanel
            rbacTestResults={rbacTestResults}
            personalityTestResults={personalityTestResults}
            auditLogs={auditLogs}
            rbacUsers={rbacUsers}
            rbacPolicies={rbacPolicies}
            onRunRBACTests={async () => {
              try {
                const response = await apiService.post('/api/nova-rag/test-rbac');
                setRbacTestResults(response.data);
                showSnackbar('RBAC tests completed', 'success');
              } catch (error) {
                showSnackbar('Failed to run RBAC tests', 'error');
              }
            }}
            onTestPersonalities={async (query) => {
              try {
                const response = await apiService.post('/api/nova-rag/test-personalities', { query });
                setPersonalityTestResults(response.data);
                showSnackbar('Personality tests completed', 'success');
              } catch (error) {
                showSnackbar('Failed to test personalities', 'error');
              }
            }}
            onCreateRBACUser={() => setRbacUserDialog(true)}
            onCreateRBACPolicy={() => setRbacPolicyDialog(true)}
            onRefreshAuditLogs={loadRBACData}
          />
        )}

        {activeTab === 9 && (
          <AIAgentManagementPanel />
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => {
          switch (activeTab) {
            case 0:
              setCreateModelDialog(true);
              break;
            case 1:
              setTrainingDialog(true);
              break;
            case 2:
              setCreateRAGDialog(true);
              break;
            case 5:
              setCreateITSMExperimentDialog(true);
              break;
            case 6:
              setCosmoPersonalityDialog(true);
              break;
            case 7:
              setRagQueryDialog(true);
              break;
            case 8:
              setRbacUserDialog(true);
              break;
            default:
              setCreateTowerDialog(true);
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleMenuClose();
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
          }}
        >
          <DownloadIcon sx={{ mr: 1 }} /> Export
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
          }}
        >
          <SettingsIcon sx={{ mr: 1 }} /> Configure
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <CreateTowerDialog
        open={createTowerDialog}
        onClose={() => setCreateTowerDialog(false)}
        onSubmit={createControlTower}
      />

      <CreateModelDialog
        open={createModelDialog}
        onClose={() => setCreateModelDialog(false)}
        onSubmit={createModel}
      />

      <CreateRAGDialog
        open={createRAGDialog}
        onClose={() => setCreateRAGDialog(false)}
        onSubmit={() => {}}
      />

      <TrainingDialog
        open={trainingDialog}
        onClose={() => setTrainingDialog(false)}
        onSubmit={startTraining}
        selectedModel={selectedItem}
      />

      {/* ML Pipeline Dialogs */}
      <CreateITSMExperimentDialog
        open={createITSMExperimentDialog}
        onClose={() => setCreateITSMExperimentDialog(false)}
        onSubmit={createITSMExperiment}
        personalities={cosmoPersonalities}
      />

      <CosmoPersonalityDialog
        open={cosmoPersonalityDialog}
        onClose={() => setCosmoPersonalityDialog(false)}
        onSubmit={updateCosmoPersonality}
        experiment={selectedExperiment}
        personalities={cosmoPersonalities}
      />

      <ModelSettingsDialog
        open={modelSettingsDialog}
        onClose={() => setModelSettingsDialog(false)}
        onSubmit={updateModelSettings}
        experiment={selectedExperiment}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

// Individual panel components would be implemented separately
const ModelsPanel = ({ models, onCreateModel, onStartTraining, onMenuOpen }) => (
  <Grid container spacing={3}>
    {models.length === 0 ? (
      <Grid item xs={12}>
        <EmptyState
          icon={<AIIcon sx={{ fontSize: 48 }} />}
          title="No AI Models"
          description="Create your first AI model to get started with machine learning."
          action={
            <Button variant="contained" onClick={onCreateModel} startIcon={<AddIcon />}>
              Create Model
            </Button>
          }
        />
      </Grid>
    ) : (
      models.map((model) => (
        <Grid item xs={12} md={6} lg={4} key={model.id}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" gutterBottom>
                  {model.name}
                </Typography>
                <IconButton size="small" onClick={(e) => onMenuOpen(e, model)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {model.description}
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <StatusChip status={model.status} label={model.status} size="small" />
                <Chip label={model.type} size="small" variant="outlined" />
              </Box>
              {model.accuracy && (
                <Box>
                  <Typography variant="body2">
                    Accuracy: {(model.accuracy * 100).toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={model.accuracy * 100}
                    sx={{ mt: 1 }}
                  />
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => onStartTraining(model)}
                disabled={model.status === 'TRAINING'}
              >
                {model.status === 'TRAINING' ? 'Training...' : 'Train'}
              </Button>
              <Button size="small">Deploy</Button>
            </CardActions>
          </Card>
        </Grid>
      ))
    )}
  </Grid>
);

const TrainingPanel = ({ _towerId, onStartTraining }) => (
  <EmptyState
    icon={<TrainIcon sx={{ fontSize: 48 }} />}
    title="Training Dashboard"
    description="Monitor and manage your AI model training jobs."
    action={
      <Button variant="contained" onClick={onStartTraining} startIcon={<AddIcon />}>
        Start Training
      </Button>
    }
  />
);

const RAGPanel = ({ _ragSystems, onCreateRAG }) => (
  <EmptyState
    icon={<QueryIcon sx={{ fontSize: 48 }} />}
    title="RAG Systems"
    description="Create and manage Retrieval-Augmented Generation systems."
    action={
      <Button variant="contained" onClick={onCreateRAG} startIcon={<AddIcon />}>
        Create RAG System
      </Button>
    }
  />
);

const AnalyticsPanel = ({ metrics, _towerId }) => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>
      Performance Analytics
    </Typography>
    {metrics ? (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Model Distribution by Type
          </Typography>
          {Object.entries(metrics.models.byType).map(([type, count]) => (
            <Box key={type} display="flex" justifyContent="space-between" py={1}>
              <Typography variant="body2">{type}</Typography>
              <Chip label={count} size="small" />
            </Box>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Audit Events by Risk Level
          </Typography>
          {Object.entries(metrics.audit.riskDistribution).map(([level, count]) => (
            <Box key={level} display="flex" justifyContent="space-between" py={1}>
              <Typography variant="body2">{level}</Typography>
              <Chip
                label={count}
                size="small"
                color={level === 'HIGH' || level === 'CRITICAL' ? 'error' : 'default'}
              />
            </Box>
          ))}
        </Grid>
      </Grid>
    ) : (
      <CircularProgress />
    )}
  </Paper>
);

const AuditPanel = ({ towerId }) => (
  <EmptyState
    icon={<SecurityIcon sx={{ fontSize: 48 }} />}
    title="Audit Trail"
    description={`View comprehensive audit logs and compliance tracking for Tower ${towerId}.`}
  />
);

// Dialog components would be implemented separately

// Create ITSM Experiment Dialog
const CreateITSMExperimentDialog = ({ open, onClose, onSubmit, personalities }) => {
  const [formData, setFormData] = useState({
    modelName: '',
    cosmoPersonality: 'default',
    categories: ['Hardware', 'Software', 'Network', 'Access Management', 'Infrastructure']
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      modelName: '',
      cosmoPersonality: 'default',
      categories: ['Hardware', 'Software', 'Network', 'Access Management', 'Infrastructure']
    });
  };

  const personalityOptions = Array.from(personalities.entries());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create ITSM ML Experiment</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" paragraph>
          Create a new ITSM classification model with Cosmo personality integration for automated ticket management.
        </Typography>
        
        <TextField
          autoFocus
          margin="dense"
          label="Model Name"
          fullWidth
          variant="outlined"
          value={formData.modelName}
          onChange={(e) => setFormData((prev) => ({ ...prev, modelName: e.target.value }))}
          helperText="Enter a descriptive name for your ITSM model"
        />

        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel>Cosmo Personality Profile</InputLabel>
          <Select
            value={formData.cosmoPersonality}
            onChange={(e) => setFormData((prev) => ({ ...prev, cosmoPersonality: e.target.value }))}
            label="Cosmo Personality Profile"
          >
            {personalityOptions.map(([name, traits]) => (
              <MenuItem key={name} value={name}>
                <Box>
                  <Typography variant="body2">{name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {traits.tone} • {traits.responseStyle}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          ITSM Categories (will be automatically included):
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {formData.categories.map((category) => (
            <Chip key={category} label={category} size="small" variant="outlined" />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.modelName}
        >
          Create Experiment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Cosmo Personality Dialog
const CosmoPersonalityDialog = ({ open, onClose, onSubmit, experiment, personalities }) => {
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [customTraits, setCustomTraits] = useState({
    tone: '',
    responseStyle: '',
    usesEmojis: false,
    providesContext: true,
    offersAlternatives: true,
    followsUpProactively: true
  });

  useEffect(() => {
    if (experiment?.config?.cosmoPersonality) {
      setSelectedPersonality(experiment.config.cosmoPersonality.personalityProfile);
      const traits = experiment.config.cosmoPersonality.traits;
      setCustomTraits({
        tone: traits.tone,
        responseStyle: traits.responseStyle,
        usesEmojis: traits.communicationPreferences.usesEmojis,
        providesContext: traits.communicationPreferences.providesContext,
        offersAlternatives: traits.communicationPreferences.offersAlternatives,
        followsUpProactively: traits.communicationPreferences.followsUpProactively
      });
    }
  }, [experiment]);

  const handleSubmit = () => {
    const customPersonalityTraits = {
      tone: customTraits.tone,
      responseStyle: customTraits.responseStyle,
      expertise: ['ITSM', 'customer service', 'technical support'],
      communicationPreferences: {
        usesEmojis: customTraits.usesEmojis,
        providesContext: customTraits.providesContext,
        offersAlternatives: customTraits.offersAlternatives,
        followsUpProactively: customTraits.followsUpProactively
      }
    };

    onSubmit(experiment?.id, selectedPersonality, customPersonalityTraits);
  };

  const personalityOptions = Array.from(personalities.entries());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Configure Cosmo Personality
        {experiment && (
          <Typography variant="body2" color="textSecondary">
            for {experiment.config?.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel>Base Personality Profile</InputLabel>
          <Select
            value={selectedPersonality}
            onChange={(e) => setSelectedPersonality(e.target.value)}
            label="Base Personality Profile"
          >
            {personalityOptions.map(([name, traits]) => (
              <MenuItem key={name} value={name}>
                <Box>
                  <Typography variant="body2">{name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {traits.tone} • {traits.responseStyle}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Custom Traits</Typography>
        
        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel>Communication Tone</InputLabel>
          <Select
            value={customTraits.tone}
            onChange={(e) => setCustomTraits((prev) => ({ ...prev, tone: e.target.value }))}
            label="Communication Tone"
          >
            <MenuItem value="friendly">Friendly</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="empathetic">Empathetic</MenuItem>
            <MenuItem value="solution-focused">Solution-Focused</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel>Response Style</InputLabel>
          <Select
            value={customTraits.responseStyle}
            onChange={(e) => setCustomTraits((prev) => ({ ...prev, responseStyle: e.target.value }))}
            label="Response Style"
          >
            <MenuItem value="detailed">Detailed</MenuItem>
            <MenuItem value="concise">Concise</MenuItem>
            <MenuItem value="step-by-step">Step-by-step</MenuItem>
            <MenuItem value="conversational">Conversational</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Communication Preferences</Typography>
        
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center">
            <input
              type="checkbox"
              checked={customTraits.providesContext}
              onChange={(e) => setCustomTraits((prev) => ({ ...prev, providesContext: e.target.checked }))}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>Provides Context</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <input
              type="checkbox"
              checked={customTraits.offersAlternatives}
              onChange={(e) => setCustomTraits((prev) => ({ ...prev, offersAlternatives: e.target.checked }))}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>Offers Alternative Solutions</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <input
              type="checkbox"
              checked={customTraits.followsUpProactively}
              onChange={(e) => setCustomTraits((prev) => ({ ...prev, followsUpProactively: e.target.checked }))}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>Follows Up Proactively</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedPersonality || !customTraits.tone || !customTraits.responseStyle}
        >
          Update Personality
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Model Settings Dialog
const ModelSettingsDialog = ({ open, onClose, onSubmit, experiment }) => {
  const [settings, setSettings] = useState({
    hyperparameters: {
      epochs: 100,
      batch_size: 32,
      learning_rate: 0.001,
      hidden_layers: [128, 64, 32],
      dropout_rate: 0.3
    },
    evaluation: {
      validation_split: 0.2,
      cross_validation_folds: 5
    }
  });

  useEffect(() => {
    if (experiment?.config) {
      setSettings({
        hyperparameters: experiment.config.hyperparameters || settings.hyperparameters,
        evaluation: experiment.config.evaluation || settings.evaluation
      });
    }
  }, [experiment]);

  const handleSubmit = () => {
    onSubmit(experiment?.id, settings);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Model Settings
        {experiment && (
          <Typography variant="body2" color="textSecondary">
            for {experiment.config?.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Hyperparameters</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Epochs"
              type="number"
              fullWidth
              variant="outlined"
              value={settings.hyperparameters.epochs}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                hyperparameters: { ...prev.hyperparameters, epochs: parseInt(e.target.value) }
              }))}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Batch Size"
              type="number"
              fullWidth
              variant="outlined"
              value={settings.hyperparameters.batch_size}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                hyperparameters: { ...prev.hyperparameters, batch_size: parseInt(e.target.value) }
              }))}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Learning Rate"
              type="number"
              step="0.001"
              fullWidth
              variant="outlined"
              value={settings.hyperparameters.learning_rate}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                hyperparameters: { ...prev.hyperparameters, learning_rate: parseFloat(e.target.value) }
              }))}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Dropout Rate"
              type="number"
              step="0.1"
              fullWidth
              variant="outlined"
              value={settings.hyperparameters.dropout_rate}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                hyperparameters: { ...prev.hyperparameters, dropout_rate: parseFloat(e.target.value) }
              }))}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Evaluation Settings</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Validation Split"
              type="number"
              step="0.1"
              fullWidth
              variant="outlined"
              value={settings.evaluation.validation_split}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                evaluation: { ...prev.evaluation, validation_split: parseFloat(e.target.value) }
              }))}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Cross Validation Folds"
              type="number"
              fullWidth
              variant="outlined"
              value={settings.evaluation.cross_validation_folds}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                evaluation: { ...prev.evaluation, cross_validation_folds: parseInt(e.target.value) }
              }))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
        >
          Update Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CreateTowerDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    environment: 'DEVELOPMENT',
    organizationId: '', // This would come from user context
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: '', description: '', environment: 'DEVELOPMENT', organizationId: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create AI Control Tower</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Tower Name"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Environment</InputLabel>
          <Select
            value={formData.environment}
            onChange={(e) => setFormData((prev) => ({ ...prev, environment: e.target.value }))}
          >
            <MenuItem value="DEVELOPMENT">Development</MenuItem>
            <MenuItem value="STAGING">Staging</MenuItem>
            <MenuItem value="PRODUCTION">Production</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CreateModelDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'CLASSIFICATION',
    framework: 'tensorflow',
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: '', description: '', type: 'CLASSIFICATION', framework: 'tensorflow' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create AI Model</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Model Name"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Model Type</InputLabel>
          <Select
            value={formData.type}
            onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
          >
            <MenuItem value="CLASSIFICATION">Classification</MenuItem>
            <MenuItem value="REGRESSION">Regression</MenuItem>
            <MenuItem value="NLP">Natural Language Processing</MenuItem>
            <MenuItem value="COMPUTER_VISION">Computer Vision</MenuItem>
            <MenuItem value="TIME_SERIES">Time Series</MenuItem>
            <MenuItem value="CLUSTERING">Clustering</MenuItem>
            <MenuItem value="REINFORCEMENT_LEARNING">Reinforcement Learning</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Framework</InputLabel>
          <Select
            value={formData.framework}
            onChange={(e) => setFormData((prev) => ({ ...prev, framework: e.target.value }))}
          >
            <MenuItem value="tensorflow">TensorFlow</MenuItem>
            <MenuItem value="pytorch">PyTorch</MenuItem>
            <MenuItem value="scikit-learn">Scikit-Learn</MenuItem>
            <MenuItem value="xgboost">XGBoost</MenuItem>
            <MenuItem value="lightgbm">LightGBM</MenuItem>
            <MenuItem value="huggingface">Hugging Face</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mt: 2, p: 2, border: '1px dashed grey.300', borderRadius: 1 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            fullWidth
            onClick={() => {
              // Handle file upload for model artifacts
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pkl,.h5,.pt,.onnx,.joblib';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  console.log('Uploading model file:', file.name);
                  // Handle file upload logic here
                }
              };
              input.click();
            }}
          >
            Upload Model File (Optional)
          </Button>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: .pkl, .h5, .pt, .onnx, .joblib
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CreateRAGDialog = ({ open, onClose, onSubmit }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Create RAG System</DialogTitle>
    <DialogContent>
      <Typography>RAG System creation dialog would be implemented here</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSubmit} variant="contained">
        Create
      </Button>
    </DialogActions>
  </Dialog>
);

const TrainingDialog = ({ open, onClose, onSubmit, selectedModel }) => {
  const [formData, setFormData] = useState({
    name: '',
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
  });

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      modelId: selectedModel?.id,
    });
    setFormData({ name: '', epochs: 100, batchSize: 32, learningRate: 0.001 });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Start Model Training</DialogTitle>
      <DialogContent>
        {selectedModel && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Training model: <strong>{selectedModel.name}</strong>
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Training Job Name"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
        <TextField
          margin="dense"
          label="Epochs"
          type="number"
          fullWidth
          variant="outlined"
          value={formData.epochs}
          onChange={(e) => setFormData((prev) => ({ ...prev, epochs: parseInt(e.target.value) }))}
        />
        <TextField
          margin="dense"
          label="Batch Size"
          type="number"
          fullWidth
          variant="outlined"
          value={formData.batchSize}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, batchSize: parseInt(e.target.value) }))
          }
        />
        <TextField
          margin="dense"
          label="Learning Rate"
          type="number"
          step="0.001"
          fullWidth
          variant="outlined"
          value={formData.learningRate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, learningRate: parseFloat(e.target.value) }))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || !selectedModel}
        >
          Start Training
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ML Pipeline Panel Component
const MLPipelinePanel = ({ 
  experiments, 
  pipelineStatus, 
  trainingStatus, 
  onCreateExperiment, 
  onStartTraining, 
  onUpdateSettings, 
  onDeleteExperiment 
}) => {
  const theme = useTheme();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'running': return theme.palette.warning.main;
      case 'failed': return theme.palette.error.main;
      case 'pending': return theme.palette.info.main;
      default: return theme.palette.grey[400];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'running': return <CircularProgress size={20} />;
      case 'failed': return <ErrorIcon />;
      case 'pending': return <QueryIcon />;
      default: return <WarningIcon />;
    }
  };

  return (
    <Box>
      {/* Pipeline Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Experiments
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {experiments.length}
                  </Typography>
                </Box>
                <ModelTrainingIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Training
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {experiments.filter(exp => exp.status === 'running').length}
                  </Typography>
                </Box>
                <TrainIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed Models
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {experiments.filter(exp => exp.status === 'completed').length}
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    ITSM Models
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {experiments.filter(exp => exp.config?.type === 'itsm_classifier').length}
                  </Typography>
                </Box>
                <SmartToy color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* ML Experiments List */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">ML Experiments & Models</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={onCreateExperiment}
          >
            Create ITSM Experiment
          </Button>
        </Box>

        {experiments.length === 0 ? (
          <Box textAlign="center" py={6}>
            <ModelTrainingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No ML experiments yet
            </Typography>
            <Typography color="textSecondary" paragraph>
              Create your first ITSM classification experiment to start training AI models with Cosmo personality.
            </Typography>
            <Button variant="contained" onClick={onCreateExperiment} startIcon={<AddIcon />}>
              Create ITSM Experiment
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {experiments.map((experiment) => (
              <Grid item xs={12} sm={6} md={4} key={experiment.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Chip 
                        label={experiment.config?.type || 'Unknown'}
                        size="small"
                        color={experiment.config?.type === 'itsm_classifier' ? 'primary' : 'default'}
                      />
                      <Box display="flex" alignItems="center">
                        {getStatusIcon(experiment.status)}
                        <Typography 
                          variant="caption" 
                          color={getStatusColor(experiment.status)}
                          sx={{ ml: 0.5 }}
                        >
                          {experiment.status}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {experiment.config?.name || experiment.id}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Version: {experiment.config?.version || '1.0.0'}
                    </Typography>

                    {experiment.config?.cosmoPersonality && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <PsychologyIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          Cosmo: {experiment.config.cosmoPersonality.personalityProfile}
                        </Typography>
                      </Box>
                    )}

                    {trainingStatus[experiment.id] && (
                      <Box mb={1}>
                        <Typography variant="caption" color="textSecondary">
                          Training Progress
                        </Typography>
                        <LinearProgress 
                          variant={trainingStatus[experiment.id].status === 'running' ? 'indeterminate' : 'determinate'}
                          value={trainingStatus[experiment.id].progress || 0}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    )}

                    <Typography variant="caption" color="textSecondary">
                      Created: {new Date(experiment.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    {experiment.status === 'pending' && (
                      <Button 
                        size="small" 
                        onClick={() => onStartTraining(experiment.id)}
                        startIcon={<TrainIcon />}
                      >
                        Start Training
                      </Button>
                    )}
                    
                    <Button 
                      size="small" 
                      onClick={() => onUpdateSettings(experiment)}
                      startIcon={<TuneIcon />}
                    >
                      Settings
                    </Button>
                    
                    <IconButton 
                      size="small" 
                      onClick={() => onDeleteExperiment(experiment.id)}
                      color="error"
                    >
                      <ErrorIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

// Cosmo Personality Panel Component
const CosmoPersonalityPanel = ({ personalities, experiments, onUpdatePersonality, onCreatePersonality }) => {
  const personalityArray = Array.from(personalities.entries());

  const getPersonalityColor = (tone) => {
    switch (tone) {
      case 'friendly': return '#4CAF50';
      case 'professional': return '#2196F3';
      case 'empathetic': return '#FF9800';
      case 'solution-focused': return '#9C27B0';
      default: return '#757575';
    }
  };

  return (
    <Box>
      {/* Personality Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Personality Profiles
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {personalityArray.length}
                  </Typography>
                </Box>
                <PsychologyIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Models
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {experiments.filter(exp => exp.config?.cosmoPersonality).length}
                  </Typography>
                </Box>
                <AutoFixHighIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Consistency
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {experiments.length > 0 
                      ? `${(experiments.reduce((acc, exp) => acc + (exp.cosmoPersonality?.personalityConsistency || 0), 0) / experiments.length * 100).toFixed(0)}%`
                      : '0%'
                    }
                  </Typography>
                </Box>
                <TuneIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    ITSM Integration
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {experiments.filter(exp => exp.config?.type === 'itsm_classifier' && exp.config?.cosmoPersonality).length}
                  </Typography>
                </Box>
                <SmartToy color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Personality Profiles */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Cosmo Personality Profiles</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={onCreatePersonality}
          >
            Create Personality
          </Button>
        </Box>

        <Grid container spacing={2}>
          {personalityArray.map(([profileName, traits]) => (
            <Grid item xs={12} sm={6} md={4} key={profileName}>
              <Card sx={{ height: '100%', border: `2px solid ${getPersonalityColor(traits.tone)}` }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                    <Typography variant="h6" gutterBottom>
                      {profileName}
                    </Typography>
                    <Chip 
                      label={traits.tone}
                      size="small"
                      sx={{ 
                        backgroundColor: getPersonalityColor(traits.tone),
                        color: 'white'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Response Style: {traits.responseStyle}
                  </Typography>

                  <Box mb={1}>
                    <Typography variant="caption" color="textSecondary">
                      Expertise Areas:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {traits.expertise.slice(0, 3).map((skill, index) => (
                        <Chip key={index} label={skill} size="small" variant="outlined" />
                      ))}
                      {traits.expertise.length > 3 && (
                        <Chip label={`+${traits.expertise.length - 3} more`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Communication Preferences:
                    </Typography>
                    <Box mt={0.5}>
                      <Typography variant="caption" component="div">
                        ✓ Provides Context: {traits.communicationPreferences.providesContext ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        ✓ Offers Alternatives: {traits.communicationPreferences.offersAlternatives ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        ✓ Proactive Follow-up: {traits.communicationPreferences.followsUpProactively ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Active Experiments with Cosmo */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Experiments Using Cosmo Personality
        </Typography>

        {experiments.filter(exp => exp.config?.cosmoPersonality).length === 0 ? (
          <Box textAlign="center" py={4}>
            <PsychologyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="textSecondary">
              No experiments are currently using Cosmo personality profiles.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {experiments
              .filter(exp => exp.config?.cosmoPersonality)
              .map((experiment) => (
                <Grid item xs={12} sm={6} key={experiment.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="h6">
                          {experiment.config.name}
                        </Typography>
                        <Chip 
                          label={experiment.status}
                          size="small"
                          color={experiment.status === 'completed' ? 'success' : 'default'}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Personality: {experiment.config.cosmoPersonality.personalityProfile}
                      </Typography>

                      {experiment.cosmoPersonality?.personalityConsistency && (
                        <Box mb={1}>
                          <Typography variant="caption" color="textSecondary">
                            Personality Consistency: {(experiment.cosmoPersonality.personalityConsistency * 100).toFixed(1)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate"
                            value={experiment.cosmoPersonality.personalityConsistency * 100}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      )}

                      <Button 
                        size="small" 
                        onClick={() => onUpdatePersonality(experiment)}
                        startIcon={<TuneIcon />}
                      >
                        Adjust Personality
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            }
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default AIControlTowerDashboard;
