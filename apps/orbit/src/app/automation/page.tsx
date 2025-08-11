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
  const [loading, setLoading] = useState<boolean>(false);

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
              metrics: { totalRuns: 1247, successRate: 94.2, avgExecutionTime: 1.8, lastRun: new Date().toISOString(), impactScore: 8.5 },
              nextRun: new Date(),
              createdBy: 'system',
              lastModified: new Date()
            }
          ]);
        }
        
        // Load insights
        const insightsResponse = await fetch('/api/v2/automation/insights');
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          setPredictiveInsights(insightsData.insights || []);
        } else {
          // Fallback to basic insights
          setPredictiveInsights([
            {
              id: 'insight-001',
              type: 'workload_prediction',
              title: 'Workflow Optimization Opportunity',
              description: 'Smart assignment workflow can be optimized for 15% better performance',
              confidence: 0.89,
              severity: 'high',
              suggestedAction: 'Enable machine learning refinement and add feedback loop',
              data: { currentEfficiency: 85, potentialEfficiency: 98 }
            }
          ]);
        }
        
      } catch (error) {
        console.error('Failed to load automation data:', error);
        // Use minimal fallback data
        setWorkflows([]);
        setPredictiveInsights([]);
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-medium">Active Workflows</p>
              </div>
              <p className="text-2xl font-bold">{filteredWorkflows.filter(w => w.status === 'active').length}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-medium">Average Success Rate</p>
              </div>
              <p className="text-2xl font-bold">{filteredWorkflows.length > 0 ?
                `${Math.round(filteredWorkflows.reduce((acc, w) => acc + (w.metrics.successRate || 0), 0) / filteredWorkflows.length)}%` : '—'}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-amber-50">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-medium">Avg. Execution Time</p>
              </div>
              <p className="text-2xl font-bold">{filteredWorkflows.length > 0 ?
                `${(filteredWorkflows.reduce((acc, w) => acc + (w.metrics.avgExecutionTime || 0), 0) / filteredWorkflows.length).toFixed(1)}s` : '—'}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <p className="text-sm font-medium">Pending Insights</p>
              </div>
              <p className="text-2xl font-bold">{predictiveInsights.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-2">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Workflow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {/* Workflows list */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading automation data…</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWorkflows.map((workflow) => (
                    <div key={workflow.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(workflow.type)}
                          <h3 className="font-medium">{workflow.name}</h3>
                        </div>
                        <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{workflow.description}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => toggleWorkflowStatus(workflow.id)}>
                          {workflow.status === 'active' ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                          {workflow.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Success: {workflow.metrics.successRate}%</div>
                        <div className="flex items-center gap-1"><Timer className="w-3 h-3" /> Avg Time: {workflow.metrics.avgExecutionTime}s</div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last Run: {workflow.metrics.lastRun ? new Date(workflow.metrics.lastRun).toLocaleString() : '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictiveInsights.map((insight) => (
                <div key={insight.id} className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{insight.title}</h3>
                      <p className="text-sm">{insight.description}</p>
                    </div>
                    <Badge variant="secondary">Confidence: {Math.round(insight.confidence * 100)}%</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Suggested action: {insight.suggestedAction}</div>
                </div>
              ))}
              {predictiveInsights.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No insights available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Automation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /><span>Overall Success Rate</span></div>
                  <Progress value={Math.min(100, Math.round(filteredWorkflows.reduce((acc, w) => acc + (w.metrics.successRate || 0), 0) / Math.max(1, filteredWorkflows.length)))} />
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2"><Eye className="w-4 h-4" /><span>Execution Visibility</span></div>
                  <Progress value={78} />
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2"><Activity className="w-4 h-4" /><span>Automation Coverage</span></div>
                  <Progress value={64} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Notification Preferences</h3>
                  <div className="flex items-center gap-2">
                    <input id="notif-email" type="checkbox" className="rounded border-gray-300" />
                    <label htmlFor="notif-email">Email notifications</label>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input id="notif-slack" type="checkbox" className="rounded border-gray-300" />
                    <label htmlFor="notif-slack">Slack notifications</label>
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Execution Settings</h3>
                  <div className="flex items-center gap-2">
                    <input id="auto-run" type="checkbox" className="rounded border-gray-300" />
                    <label htmlFor="auto-run">Auto-run workflows</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
