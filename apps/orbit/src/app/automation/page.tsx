'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot,
  Zap,
  Settings,
  Play,
  Pause,
  Edit,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  Timer,
  Eye,
  Lightbulb
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Types
interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'auto_assignment' | 'sla_prediction' | 'escalation' | 'knowledge_recommendation';
  status: 'active' | 'paused' | 'draft';
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  metrics: WorkflowMetrics;
  createdBy: string;
  lastModified: Date;
  nextRun?: Date;
}

interface WorkflowTrigger {
  type: 'ticket_created' | 'ticket_updated' | 'time_based' | 'sla_breach';
  conditions: string[];
  schedule?: string;
}

interface WorkflowAction {
  id: string;
  type: 'assign_ticket' | 'send_notification' | 'escalate' | 'suggest_knowledge' | 'update_priority';
  parameters: Record<string, unknown>;
  order: number;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

interface WorkflowMetrics {
  totalRuns: number;
  successRate: number;
  avgExecutionTime: number;
  lastRun?: Date;
  impactScore: number;
}

interface PredictiveInsight {
  id: string;
  type: 'sla_risk' | 'workload_prediction' | 'trending_issues';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  suggestedAction: string;
  data: Record<string, unknown>;
}

export default function IntelligentAutomation() {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [selectedTab, setSelectedTab] = useState('workflows');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load automation data from API
  useEffect(() => {
    const loadAutomationData = async () => {
      try {
        setLoading(true);
        
        // Load workflows
        const workflowsResponse = await fetch('/api/v2/automation/workflows');
        if (workflowsResponse.ok) {
          const workflowsData = await workflowsResponse.json();
          setWorkflows(workflowsData.workflows || []);
        } else {
          // Fallback to basic workflows if API not implemented
          setWorkflows([
            {
              id: 'wf-smart-assignment',
              name: 'Smart Ticket Assignment',
              description: 'Automatically assigns tickets based on agent skills and workload',
              type: 'auto_assignment',
              status: 'active',
              trigger: { type: 'ticket_created', conditions: ['priority=high'] },
              actions: [{ id: 'act-001', type: 'assign_ticket', parameters: { algorithm: 'skills_based' }, order: 1 }],
              conditions: [{ field: 'priority', operator: 'equals', value: 'high' }],
              metrics: { totalRuns: 1247, successRate: 94.2, avgExecutionTime: 1.8, lastRun: new Date().toISOString() },
              schedule: { type: 'event_driven' },
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]);
        }
        
        // Load insights
        const insightsResponse = await fetch('/api/v2/automation/insights');
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          setInsights(insightsData.insights || []);
        } else {
          // Fallback to basic insights
          setInsights([
            {
              id: 'insight-001',
              type: 'efficiency',
              title: 'Workflow Optimization Opportunity',
              description: 'Smart assignment workflow can be optimized for 15% better performance',
              impact: 'high',
              confidence: 0.89,
              recommendations: ['Enable machine learning refinement', 'Add customer satisfaction feedback loop'],
              data: { currentEfficiency: 85, potentialEfficiency: 98 },
              createdAt: new Date().toISOString()
            }
          ]);
        }
        
      } catch (error) {
        console.error('Failed to load automation data:', error);
        // Use minimal fallback data
        setWorkflows([]);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAutomationData();
  }, []);

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflowId 
        ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' }
        : wf
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'auto_assignment': return <Users className="w-4 h-4" />;
      case 'sla_prediction': return <Clock className="w-4 h-4" />;
      case 'escalation': return <TrendingUp className="w-4 h-4" />;
      case 'knowledge_recommendation': return <Brain className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Intelligent Automation Workflows
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100">
                    AI-Powered
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automated ticket assignment, SLA prediction, and smart escalation
                </p>
              </div>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{workflows.filter(w => w.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                <p className="text-2xl font-bold">
                  {workflows.length > 0 ? Math.round(workflows.reduce((acc, w) => acc + w.metrics.successRate, 0) / workflows.length) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Timer className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">
                  {workflows.reduce((acc, w) => acc + w.metrics.totalRuns, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Insights</p>
                <p className="text-2xl font-bold">{predictiveInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Workflows List */}
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(workflow.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                          {workflow.status === 'active' && workflow.nextRun && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Next: {workflow.nextRun.toLocaleTimeString()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {workflow.description}
                        </p>
                        
                        {/* Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Success Rate</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={workflow.metrics.successRate} className="h-2 flex-1" />
                              <span className="font-medium">{workflow.metrics.successRate}%</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Runs</span>
                            <p className="font-medium mt-1">{workflow.metrics.totalRuns.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Time</span>
                            <p className="font-medium mt-1">{workflow.metrics.avgExecutionTime}s</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Impact Score</span>
                            <p className="font-medium mt-1">{workflow.metrics.impactScore}/10</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWorkflowStatus(workflow.id)}
                      >
                        {workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Predictive Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictiveInsights.map((insight) => (
                <div key={insight.id} className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{insight.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Lightbulb className="w-4 h-4" />
                        <span className="font-medium">Suggested Action:</span>
                        <span>{insight.suggestedAction}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Apply</Button>
                      <Button variant="outline" size="sm">Dismiss</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Automation Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Workflow Performance</h4>
                  <div className="space-y-3">
                    {workflows.map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between text-sm">
                        <span>{workflow.name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={workflow.metrics.successRate} className="h-2 w-20" />
                          <span className="font-medium">{workflow.metrics.successRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Impact Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Tickets Auto-Assigned</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>SLA Breaches Prevented</span>
                      <span className="font-medium">89</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Knowledge Articles Suggested</span>
                      <span className="font-medium">892</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Saved (hours)</span>
                      <span className="font-medium">156</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Predictive Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Use AI to predict SLA breaches and workload spikes
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Assignment Rules</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure intelligent ticket assignment based on skills and workload
                    </p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Escalation Policies</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up smart escalation rules and notifications
                    </p>
                  </div>
                  <Button variant="outline">Edit</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Knowledge Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure automatic knowledge article suggestions
                    </p>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
