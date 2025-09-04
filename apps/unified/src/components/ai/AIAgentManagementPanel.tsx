/**
 * AI Agent Management Panel
 * Enhanced UI for managing industry-standard AI Agent framework
 */

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/Tabs';
import { Progress } from '../common/Progress';
import { AlertCircle, Bot, Users, TrendingUp, Settings, MessageSquare, Brain, Shield, BarChart3 } from 'lucide-react';

interface AIAgentCapability {
  name: string;
  category: string;
  description: string;
  intents: string[];
  isActive: boolean;
  confidence: number;
  workflows: number;
}

interface ChannelCapabilities {
  id: string;
  name: string;
  type: string;
  features: Record<string, boolean>;
  limitations: {
    maxMessageLength: number;
    maxAttachments: number;
    supportedFileTypes: string[];
    rateLimits: {
      messagesPerMinute: number;
      messagesPerHour: number;
    };
  };
}

interface AgentAnalytics {
  totalConversations: number;
  averageSessionDuration: number;
  averageMessagesPerSession: number;
  intentAccuracy: number;
  resolutionRate: number;
  escalationRate: number;
  userSatisfactionScore: number;
  firstContactResolution: number;
  averageResponseTime: number;
  availabilityUptime: number;
}

interface ConversationSession {
  id: string;
  userId: string;
  channel: string;
  startTime: string;
  lastActivity: string;
  isActive: boolean;
  metadata: Record<string, any>;
}

const AIAgentManagementPanel: React.FC = () => {
  const [capabilities, setCapabilities] = useState<AIAgentCapability[]>([]);
  const [channels, setChannels] = useState<ChannelCapabilities[]>([]);
  const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Test conversation state
  const [testMessage, setTestMessage] = useState('');
  const [testChannel, setTestChannel] = useState('web');
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [capabilitiesRes, channelsRes, analyticsRes, sessionsRes] = await Promise.all([
        apiFetch('/api/ai-agent/capabilities'),
        apiFetch('/api/ai-agent/channels'),
        apiFetch('/api/ai-agent/analytics/summary'),
        apiFetch('/api/ai-agent/sessions')
      ]);

      if (capabilitiesRes.ok) {
        const capData = await capabilitiesRes.json();
        setCapabilities(capData.data.capabilities);
      }

      if (channelsRes.ok) {
        const chanData = await channelsRes.json();
        setChannels(chanData.data.channels);
      }

      if (analyticsRes.ok) {
        const analData = await analyticsRes.json();
        setAnalytics(analData.data.analytics?.metrics || null);
      }

      if (sessionsRes.ok) {
        const sessData = await sessionsRes.json();
        setSessions(sessData.data.sessions);
      }
    } catch (error) {
      console.error('Error loading AI agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAgentConversation = async () => {
    if (!testMessage.trim()) return;

    try {
      setTesting(true);
      const response = await apiFetch('/api/ai-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          channel: testChannel,
          tenantId: 'default'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults(result.data);
      }
    } catch (error) {
      console.error('Error testing agent conversation:', error);
    } finally {
      setTesting(false);
    }
  };

  const toggleCapability = async (capabilityName: string, isActive: boolean) => {
    try {
      const response = await apiFetch(`/api/ai-agent/capabilities/${capabilityName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error updating capability:', error);
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      const response = await apiFetch(`/api/ai-agent/sessions/${sessionId}/close`, {
        method: 'POST'
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Agent Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage and monitor industry-standard AI agent capabilities
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Capabilities</p>
                    <p className="text-2xl font-bold">
                      {capabilities.filter(c => c.isActive).length}
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold">{sessions.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics ? Math.round(analytics.resolutionRate * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
                    <p className="text-2xl font-bold">
                      {analytics ? analytics.userSatisfactionScore.toFixed(1) : '0.0'}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Analytics */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Real-time AI agent performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Intent Accuracy</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(analytics.intentAccuracy * 100)}%
                        </span>
                      </div>
                      <Progress value={analytics.intentAccuracy * 100} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">First Contact Resolution</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(analytics.firstContactResolution * 100)}%
                        </span>
                      </div>
                      <Progress value={analytics.firstContactResolution * 100} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">System Uptime</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(analytics.availabilityUptime * 100)}%
                        </span>
                      </div>
                      <Progress value={analytics.availabilityUptime * 100} />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Average Response Time</p>
                      <p className="text-lg">{analytics.averageResponseTime.toFixed(1)}s</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Capabilities</CardTitle>
              <CardDescription>
                Manage ITSM-specific agent capabilities and workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capabilities.map((capability) => (
                  <div
                    key={capability.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{capability.name}</h3>
                        <Badge variant={capability.isActive ? 'default' : 'secondary'} className="flex items-center gap-1">
                          {capability.isActive && <Shield className="h-3 w-3" />}
                          {capability.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{capability.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{capability.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          {capability.intents.length} intents
                        </span>
                        <span className="text-xs text-gray-500">
                          {capability.workflows} workflows
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          {capability.confidence < 0.7 && (
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                          )}
                          {Math.round(capability.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={capability.isActive ? 'destructive' : 'default'}
                        onClick={() => toggleCapability(capability.name, !capability.isActive)}
                      >
                        {capability.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Channels</CardTitle>
              <CardDescription>
                Multi-channel support and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((channel) => (
                  <Card key={channel.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                        <Badge>{channel.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Features</h4>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(channel.features).map(([feature, enabled]) => (
                              <Badge
                                key={feature}
                                variant={enabled ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Limitations</h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>Max message: {channel.limitations.maxMessageLength} chars</p>
                            <p>Max attachments: {channel.limitations.maxAttachments}</p>
                            <p>Rate limit: {channel.limitations.rateLimits.messagesPerMinute}/min</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Conversation Sessions</CardTitle>
              <CardDescription>
                Monitor and manage ongoing conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active conversation sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Session {session.id.slice(0, 8)}</h4>
                          <Badge variant="outline">{session.channel}</Badge>
                          {session.isActive && (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Started: {new Date(session.startTime).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Last activity: {new Date(session.lastActivity).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => closeSession(session.id)}
                      >
                        Close Session
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Conversation Testing</CardTitle>
              <CardDescription>
                Test AI agent responses across different channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Message</label>
                    <textarea
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                      placeholder="Enter a test message..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Channel</label>
                    <select
                      className="w-full p-3 border rounded-lg"
                      value={testChannel}
                      onChange={(e) => setTestChannel(e.target.value)}
                    >
                      {channels.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                          {channel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={testAgentConversation}
                  disabled={testing || !testMessage.trim()}
                  className="w-full"
                >
                  {testing ? 'Testing...' : 'Test Agent Response'}
                </Button>

                {testResults && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Test Results</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-3">
                        {testResults.messages?.map((message: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant={message.type === 'user' ? 'default' : 'secondary'}>
                                {message.type}
                              </Badge>
                              {message.confidence && (
                                <span className="text-sm text-gray-600">
                                  {Math.round(message.confidence * 100)}% confidence
                                </span>
                              )}
                            </div>
                            <p className="text-sm">{message.content}</p>
                            {message.richContent && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                Rich content: {message.richContent.type}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {testResults.suggestions && testResults.suggestions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                          <div className="flex flex-wrap gap-2">
                            {testResults.suggestions.map((suggestion: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {suggestion.text} ({Math.round(suggestion.confidence * 100)}%)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>
                Comprehensive AI agent performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Conversation Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Conversations</span>
                        <span className="font-medium">{analytics.totalConversations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Session Duration</span>
                        <span className="font-medium">{analytics.averageSessionDuration}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Messages per Session</span>
                        <span className="font-medium">{analytics.averageMessagesPerSession}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Quality Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Intent Accuracy</span>
                        <span className="font-medium">
                          {Math.round(analytics.intentAccuracy * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Escalation Rate</span>
                        <span className="font-medium">
                          {Math.round(analytics.escalationRate * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">User Satisfaction</span>
                        <span className="font-medium">
                          {analytics.userSatisfactionScore.toFixed(1)}/5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No analytics data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAgentManagementPanel;
