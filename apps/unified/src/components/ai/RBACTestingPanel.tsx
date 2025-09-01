/**
 * RBAC Testing Panel
 * UI component for testing RBAC policies, personality responses, and managing access controls
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
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  PlayArrow as PlayIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Policy as PolicyIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const TestCard = styled(Card)(({ theme, status }) => {
  let borderColor = theme.palette.grey[300];
  let backgroundColor = theme.palette.background.paper;
  
  if (status === 'passed') {
    borderColor = theme.palette.success.main;
    backgroundColor = alpha(theme.palette.success.light, 0.1);
  } else if (status === 'failed') {
    borderColor = theme.palette.error.main;
    backgroundColor = alpha(theme.palette.error.light, 0.1);
  }
  
  return {
    border: `2px solid ${borderColor}`,
    backgroundColor,
    transition: 'all 0.3s ease',
  };
});

const RBACTestingPanel = ({
  rbacTestResults,
  personalityTestResults,
  auditLogs,
  rbacUsers,
  rbacPolicies,
  onRunRBACTests,
  onTestPersonalities,
  onCreateRBACUser,
  onCreateRBACPolicy,
  onRefreshAuditLogs,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [testQuery, setTestQuery] = useState('');
  const [isTestingRBAC, setIsTestingRBAC] = useState(false);
  const [isTestingPersonalities, setIsTestingPersonalities] = useState(false);
  const [selectedPersonalities, setSelectedPersonalities] = useState(['default', 'technical-expert', 'crisis-management']);

  const handleRunRBACTests = async () => {
    setIsTestingRBAC(true);
    try {
      await onRunRBACTests();
    } finally {
      setIsTestingRBAC(false);
    }
  };

  const handleTestPersonalities = async () => {
    if (!testQuery.trim()) return;
    
    setIsTestingPersonalities(true);
    try {
      await onTestPersonalities(testQuery);
    } finally {
      setIsTestingPersonalities(false);
    }
  };

  const getTestStatusIcon = (passed) => {
    return passed ? (
      <CheckCircleIcon color="success" />
    ) : (
      <ErrorIcon color="error" />
    );
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
        RBAC Testing & Management
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<SecurityIcon />} label="RBAC Tests" />
          <Tab icon={<PsychologyIcon />} label="Personality Tests" />
          <Tab icon={<PersonIcon />} label="Users & Policies" />
          <Tab icon={<DescriptionIcon />} label="Audit Logs" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {/* RBAC Tests Tab */}
        {activeTab === 0 && (
          <Box>
            {/* Test Controls */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  RBAC Configuration Tests
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Run automated tests to validate RBAC policies, roles, and access controls.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={isTestingRBAC ? <CircularProgress size={20} /> : <PlayIcon />}
                  onClick={handleRunRBACTests}
                  disabled={isTestingRBAC}
                  sx={{ mt: 2 }}
                >
                  {isTestingRBAC ? 'Running Tests...' : 'Run RBAC Tests'}
                </Button>
              </CardContent>
            </Card>

            {/* Test Results */}
            {rbacTestResults && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Test Results
                  </Typography>
                  
                  {/* Summary */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <TestCard status="passed">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Tests Passed
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {rbacTestResults.testsPassed}
                          </Typography>
                        </CardContent>
                      </TestCard>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TestCard status="failed">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Tests Failed
                          </Typography>
                          <Typography variant="h4" color="error.main">
                            {rbacTestResults.testsFailed}
                          </Typography>
                        </CardContent>
                      </TestCard>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TestCard>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Total Tests
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {rbacTestResults.tests?.length || 0}
                          </Typography>
                        </CardContent>
                      </TestCard>
                    </Grid>
                  </Grid>

                  {/* Detailed Results */}
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Status</TableCell>
                          <TableCell>Test Scenario</TableCell>
                          <TableCell>Expected</TableCell>
                          <TableCell>Actual</TableCell>
                          <TableCell>Reason</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rbacTestResults.tests?.map((test, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {getTestStatusIcon(test.passed)}
                            </TableCell>
                            <TableCell>{test.scenario}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={test.expected ? 'Allow' : 'Deny'}
                                color={test.expected ? 'success' : 'error'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={test.actual ? 'Allow' : 'Deny'}
                                color={test.actual ? 'success' : 'error'}
                              />
                            </TableCell>
                            <TableCell>{test.reason || test.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Personality Tests Tab */}
        {activeTab === 1 && (
          <Box>
            {/* Test Controls */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personality Response Tests
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Test how different personality profiles respond to the same query.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Test Query"
                  placeholder="Enter a question or request to test..."
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  sx={{ mt: 2, mb: 2 }}
                  multiline
                  rows={3}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Personalities to Test</InputLabel>
                  <Select
                    multiple
                    value={selectedPersonalities}
                    onChange={(e) => setSelectedPersonalities(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="technical-expert">Technical Expert</MenuItem>
                    <MenuItem value="crisis-management">Crisis Management</MenuItem>
                    <MenuItem value="friendly-assistant">Friendly Assistant</MenuItem>
                    <MenuItem value="professional">Professional</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  variant="contained"
                  startIcon={isTestingPersonalities ? <CircularProgress size={20} /> : <PsychologyIcon />}
                  onClick={handleTestPersonalities}
                  disabled={isTestingPersonalities || !testQuery.trim()}
                >
                  {isTestingPersonalities ? 'Testing...' : 'Test Personalities'}
                </Button>
              </CardContent>
            </Card>

            {/* Personality Test Results */}
            {personalityTestResults && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personality Test Results
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Query: "{personalityTestResults.query}"
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {Object.entries(personalityTestResults.personalities).map(([personality, result]) => (
                      <Grid item xs={12} key={personality}>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                              {personality.charAt(0).toUpperCase() + personality.slice(1)}
                            </Typography>
                            {result.error ? (
                              <Chip label="Error" color="error" size="small" />
                            ) : (
                              <>
                                <Chip 
                                  label={`${(result.confidence * 100).toFixed(1)}% confidence`} 
                                  size="small" 
                                  sx={{ mr: 1 }}
                                />
                                <Chip 
                                  label={`${result.processingTime}ms`} 
                                  size="small" 
                                  color="info"
                                />
                              </>
                            )}
                          </AccordionSummary>
                          <AccordionDetails>
                            {result.error ? (
                              <Alert severity="error">
                                {result.error}
                              </Alert>
                            ) : (
                              <Box>
                                <Typography variant="body1" paragraph>
                                  {result.response}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Response Type: {result.responseType} | RAG Chunks: {result.ragChunks}
                                </Typography>
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Users & Policies Tab */}
        {activeTab === 2 && (
          <Box>
            <Grid container spacing={3}>
              {/* Users Section */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      RBAC Users
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={onCreateRBACUser}
                      sx={{ mb: 2 }}
                    >
                      Create User
                    </Button>
                    
                    <List>
                      {rbacUsers.length === 0 ? (
                        <ListItem>
                          <ListItemText 
                            primary="No RBAC users configured"
                            secondary="Create users to test access controls"
                          />
                        </ListItem>
                      ) : (
                        rbacUsers.map((user, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <PersonIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={user.email}
                              secondary={`Tenant: ${user.tenantId} | Roles: ${user.roles?.join(', ')}`}
                            />
                            <ListItemSecondaryAction>
                              <Chip
                                size="small"
                                label={user.securityClearance || 'standard'}
                                color="info"
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Policies Section */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <PolicyIcon sx={{ mr: 1 }} />
                      RBAC Policies
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={onCreateRBACPolicy}
                      sx={{ mb: 2 }}
                    >
                      Create Policy
                    </Button>
                    
                    <List>
                      {rbacPolicies.length === 0 ? (
                        <ListItem>
                          <ListItemText 
                            primary="No RBAC policies configured"
                            secondary="Create policies to control access"
                          />
                        </ListItem>
                      ) : (
                        rbacPolicies.map((policy, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <PolicyIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={policy.name}
                              secondary={`Effect: ${policy.effect} | Priority: ${policy.priority}`}
                            />
                            <ListItemSecondaryAction>
                              <Chip
                                size="small"
                                label={policy.isActive ? 'Active' : 'Inactive'}
                                color={policy.isActive ? 'success' : 'default'}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 3 && (
          <Box>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Access Audit Logs
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={onRefreshAuditLogs}
                  >
                    Refresh
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Resource</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="textSecondary">
                              No audit logs available
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        auditLogs.map((log, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                            <TableCell>{log.userId}</TableCell>
                            <TableCell>{log.resource}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={log.granted ? 'Allowed' : 'Denied'}
                                color={log.granted ? 'success' : 'error'}
                              />
                            </TableCell>
                            <TableCell>{log.reason}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RBACTestingPanel;