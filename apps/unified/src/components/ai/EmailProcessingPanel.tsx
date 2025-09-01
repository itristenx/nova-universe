/**
 * Email Processing Panel for AI Control Tower
 * Manages Nova Synth email-to-ticket processing capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Switch,
  FormControlLabel,
  Badge,
} from '@mui/material';
import {
  Email as EmailIcon,
  SmartToy as AIIcon,
  Analytics as AnalyticsIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Assignment as TicketIcon,
  Psychology as PsychologyIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  AccountCircle as CustomerIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { apiService } from '../../services/api.service';

const EmailProcessingCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const MetricBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.main}10 100%)`,
  border: `1px solid ${theme.palette.primary.main}30`,
}));

interface EmailProcessingPanelProps {
  onClose?: () => void;
}

const EmailProcessingPanel: React.FC<EmailProcessingPanelProps> = ({ onClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [emailAccounts, setEmailAccounts] = useState<any[]>([]);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState({
    subject: '',
    body: '',
    from: { address: '', name: '' },
    receivedDateTime: new Date().toISOString(),
  });
  const [testResult, setTestResult] = useState<any>(null);
  const [emailAnalysis, setEmailAnalysis] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as any });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNovaSynthStats(),
        loadEmailAccounts(),
      ]);
    } catch (error) {
      console.error('Error loading email processing data:', error);
      showSnackbar('Failed to load email processing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadNovaSynthStats = async () => {
    try {
      const response = await apiService.request('/api/email-integration/nova-synth/stats', {
        method: 'GET',
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading Nova Synth stats:', error);
    }
  };

  const loadEmailAccounts = async () => {
    try {
      const response = await apiService.request('/api/email-integration/accounts', {
        method: 'GET',
      });
      setEmailAccounts(response.data || []);
    } catch (error) {
      console.error('Error loading email accounts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    showSnackbar('Data refreshed successfully', 'success');
  };

  const handleTestEmail = async () => {
    if (!testEmail.subject || !testEmail.body) {
      showSnackbar('Subject and body are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.request('/api/email-integration/test-nova-synth', {
        method: 'POST',
        body: JSON.stringify({
          testEmail,
          testAccount: {
            id: 'test',
            address: 'test@company.com',
            sendAutoReply: false,
            autoCreateTickets: true,
          },
        }),
      });

      setTestResult(response.data);
      setTestDialogOpen(false);
      setAnalysisDialogOpen(true);
      showSnackbar('Email analysis completed successfully', 'success');
    } catch (error) {
      console.error('Error testing email:', error);
      showSnackbar('Failed to test email processing', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeEmail = async () => {
    if (!testEmail.subject || !testEmail.body) {
      showSnackbar('Subject and body are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.request('/api/email-integration/analyze-email', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          context: {
            organizationContext: {
              name: 'Test Organization',
              industry: 'Technology',
              size: 'Medium',
            },
          },
        }),
      });

      setEmailAnalysis(response.data);
      showSnackbar('Email analysis completed', 'success');
    } catch (error) {
      console.error('Error analyzing email:', error);
      showSnackbar('Failed to analyze email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const renderSystemStatus = () => (
    <EmailProcessingCard>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <AIIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6">Nova Synth Email Processing</Typography>
          <Box sx={{ ml: 'auto' }}>
            {stats?.available ? (
              <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
            ) : (
              <ErrorIcon sx={{ color: theme.palette.error.main }} />
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MetricBox>
              <Typography variant="h4" color="primary">
                {stats?.available ? 'ONLINE' : 'OFFLINE'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                System Status
              </Typography>
            </MetricBox>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MetricBox>
              <Typography variant="h4" color="primary">
                {emailAccounts.filter(acc => acc.isActive).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Email Accounts
              </Typography>
            </MetricBox>
          </Grid>
        </Grid>

        {stats?.available && stats.stats && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Processing Statistics
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Cache Size: {stats.stats.processingCacheSize || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Customer Cache: {stats.stats.customerCacheSize || 0}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={handleRefresh}
          disabled={refreshing}
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
        >
          Refresh
        </Button>
        <Button 
          size="small" 
          onClick={() => setTestDialogOpen(true)}
          startIcon={<PlayIcon />}
          color="primary"
        >
          Test Processing
        </Button>
      </CardActions>
    </EmailProcessingCard>
  );

  const renderEmailAccounts = () => (
    <EmailProcessingCard>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <EmailIcon sx={{ mr: 1, color: theme.palette.info.main }} />
          <Typography variant="h6">Email Accounts</Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Auto Create Tickets</TableCell>
                <TableCell>Last Processed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emailAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.address}</TableCell>
                  <TableCell>
                    <Chip size="small" label={account.provider} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={account.isActive ? 'Active' : 'Inactive'}
                      color={account.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={account.autoCreateTickets ? 'Enabled' : 'Disabled'}
                      color={account.autoCreateTickets ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {account.lastProcessed 
                      ? new Date(account.lastProcessed).toLocaleString()
                      : 'Never'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {emailAccounts.length === 0 && (
          <Box textAlign="center" py={3}>
            <Typography color="textSecondary">
              No email accounts configured
            </Typography>
          </Box>
        )}
      </CardContent>
    </EmailProcessingCard>
  );

  const renderAnalysisResults = () => {
    if (!emailAnalysis) return null;

    const { emailAnalysis: analysis, recommendations, confidence } = emailAnalysis;

    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Analysis completed with {(confidence * 100).toFixed(1)}% confidence
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <CustomerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Customer Analysis
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Identified"
                    secondary={analysis.customer.identified ? 'Yes' : 'No'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Confidence"
                    secondary={`${(analysis.customer.confidence * 100).toFixed(1)}%`}
                  />
                </ListItem>
                {analysis.customer.customerInfo && (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={analysis.customer.customerInfo.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Name"
                        secondary={analysis.customer.customerInfo.name}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Incident Classification
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Category"
                    secondary={analysis.incident.category}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Type"
                    secondary={analysis.incident.type}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Confidence"
                    secondary={`${(analysis.incident.confidence * 100).toFixed(1)}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Affected Systems"
                    secondary={analysis.incident.affectedSystems.join(', ') || 'None detected'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Priority Assessment
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Priority"
                    secondary={
                      <Chip 
                        label={analysis.priority.level} 
                        color={
                          analysis.priority.level === 'CRITICAL' ? 'error' :
                          analysis.priority.level === 'HIGH' ? 'warning' :
                          analysis.priority.level === 'MEDIUM' ? 'info' : 'default'
                        }
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Urgency"
                    secondary={
                      <Chip 
                        label={analysis.priority.urgency} 
                        color={
                          analysis.priority.urgency === 'CRITICAL' ? 'error' :
                          analysis.priority.urgency === 'HIGH' ? 'warning' :
                          analysis.priority.urgency === 'MEDIUM' ? 'info' : 'default'
                        }
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Escalation Needed"
                    secondary={analysis.priority.escalationNeeded ? 'Yes' : 'No'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Content Analysis
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Sentiment"
                    secondary={
                      <Chip 
                        label={analysis.content.sentimentAnalysis.sentiment} 
                        color={
                          analysis.content.sentimentAnalysis.sentiment === 'urgent' ? 'error' :
                          analysis.content.sentimentAnalysis.sentiment === 'negative' ? 'warning' :
                          analysis.content.sentimentAnalysis.sentiment === 'positive' ? 'success' : 'default'
                        }
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Keywords"
                    secondary={analysis.content.extractedKeywords.slice(0, 5).join(', ') || 'None'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Error Messages"
                    secondary={analysis.content.technicalDetails.errorMessages.length || 'None detected'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            <TicketIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recommended Ticket Data
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={recommendations.ticketData.title}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={recommendations.ticketData.category}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={recommendations.ticketData.description}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Priority"
                value={recommendations.ticketData.priority}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Urgency"
                value={recommendations.ticketData.urgency}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Type"
                value={recommendations.ticketData.type}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  return (
    <Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          {renderSystemStatus()}
        </Grid>
        <Grid item xs={12} lg={6}>
          {renderEmailAccounts()}
        </Grid>
      </Grid>

      {/* Email Analysis Results */}
      {emailAnalysis && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Email Analysis Results
          </Typography>
          {renderAnalysisResults()}
        </Paper>
      )}

      {/* Test Email Dialog */}
      <Dialog 
        open={testDialogOpen} 
        onClose={() => setTestDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Test Email Processing</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Email"
                value={testEmail.from.address}
                onChange={(e) => setTestEmail(prev => ({
                  ...prev,
                  from: { ...prev.from, address: e.target.value }
                }))}
                margin="normal"
                placeholder="user@company.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Name"
                value={testEmail.from.name}
                onChange={(e) => setTestEmail(prev => ({
                  ...prev,
                  from: { ...prev.from, name: e.target.value }
                }))}
                margin="normal"
                placeholder="John Doe"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={testEmail.subject}
                onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
                margin="normal"
                placeholder="Can't access email - urgent help needed"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Email Body"
                value={testEmail.body}
                onChange={(e) => setTestEmail(prev => ({ ...prev, body: e.target.value }))}
                margin="normal"
                placeholder="Hi, I'm having trouble accessing my email since this morning. I keep getting an error message saying 'connection failed'. This is urgent as I have important client emails to send. Can someone help me ASAP?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAnalyzeEmail}
            color="secondary"
            disabled={loading}
          >
            Analyze Only
          </Button>
          <Button 
            onClick={handleTestEmail}
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <PlayIcon />}
          >
            Test Full Processing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analysis Results Dialog */}
      <Dialog 
        open={analysisDialogOpen} 
        onClose={() => setAnalysisDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Processing Results
          {testResult && (
            <Chip 
              label={`${(testResult.confidence * 100).toFixed(1)}% confidence`}
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {testResult && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Email processed successfully in {testResult.processingTime}ms
              </Alert>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">AI Analysis Results</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify(testResult.analysis, null, 2)}
                  </pre>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Ticket Recommendations</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify(testResult.recommendations, null, 2)}
                  </pre>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailProcessingPanel;