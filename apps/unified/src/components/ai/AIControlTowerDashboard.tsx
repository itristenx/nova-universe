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
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { apiService } from '../../services/api.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';

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
  const [ragSystems, setRagSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Dialog states
  const [createTowerDialog, setCreateTowerDialog] = useState(false);
  const [createModelDialog, setCreateModelDialog] = useState(false);
  const [createRAGDialog, setCreateRAGDialog] = useState(false);
  const [trainingDialog, setTrainingDialog] = useState(false);

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

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      showSnackbar('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTowerChange = async (tower) => {
    setSelectedTower(tower);
    try {
      const metricsResponse = await apiService.get(`/ai-control-tower/towers/${tower.id}/metrics`);
      setMetrics(metricsResponse.data);
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      showSnackbar('Failed to create AI model', 'error');
    }
  };

  const startTraining = async (trainingData) => {
    try {
      await apiService.post('/ai-control-tower/training', trainingData);
      setTrainingDialog(false);
      showSnackbar('Training started successfully', 'success');
      loadDashboardData(); // Refresh data
    } catch (err) {
      showSnackbar('Failed to start training', 'error');
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
                    <Chip size="small" label="High Risk" color="error" variant="outlined" />
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
            towerId={selectedTower?.id}
            onStartTraining={() => setTrainingDialog(true)}
          />
        )}

        {activeTab === 2 && (
          <RAGPanel ragSystems={ragSystems} onCreateRAG={() => setCreateRAGDialog(true)} />
        )}

        {activeTab === 3 && <AnalyticsPanel metrics={metrics} towerId={selectedTower?.id} />}

        {activeTab === 4 && <AuditPanel towerId={selectedTower?.id} />}
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

const TrainingPanel = ({ towerId, onStartTraining }) => (
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

const RAGPanel = ({ ragSystems, onCreateRAG }) => (
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

const AnalyticsPanel = ({ metrics, towerId }) => (
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
    description="View comprehensive audit logs and compliance tracking."
  />
);

// Dialog components would be implemented separately
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

export default AIControlTowerDashboard;
