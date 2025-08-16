'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  CheckCircle,
  Pause,
  Play,
  Settings,
  Eye,
  Copy,
  Plus,
  Filter,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience?: string[];
  environment: 'development' | 'staging' | 'production';
  createdAt: Date;
  updatedAt: Date;
}

interface ABExperiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ExperimentVariant[];
  targetMetric: string;
  trafficAllocation: number;
  startDate: Date;
  endDate?: Date;
  results?: ExperimentResults;
  significance: number;
  confidence: number;
}

interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  isControl: boolean;
  metrics: VariantMetrics;
}

interface VariantMetrics {
  participants: number;
  conversions: number;
  conversionRate: number;
  averageValue: number;
  bounceRate: number;
  sessionDuration: number;
}

interface ExperimentResults {
  winner?: string;
  significance: number;
  confidenceInterval: [number, number];
  pValue: number;
  improvement: number;
}

interface ConversionFunnel {
  name: string;
  steps: FunnelStep[];
  totalUsers: number;
  conversionRate: number;
}

interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

interface PerformanceImpact {
  metric: string;
  baseline: number;
  variant: number;
  impact: number;
  significance: string;
}

// Feature Flag Hook (example implementation)
function useFeatureFlag(flagName: string): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch from your feature flag service
    const storedFlags = localStorage.getItem('feature-flags');
    if (storedFlags) {
      const flags = JSON.parse(storedFlags);
      setIsEnabled(flags[flagName] || false);
    }
  }, [flagName]);

  return isEnabled;
}

// A/B Test Hook (example implementation)
function useABTest(experimentId: string): string {
  const [variant, setVariant] = useState('control');

  useEffect(() => {
    // In a real app, this would be determined by your A/B testing service
    const userId = localStorage.getItem('user-id') || 'anonymous';
    const hash = userId.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Simple hash-based variant assignment
    const variantIndex = Math.abs(hash) % 100;
    setVariant(variantIndex < 50 ? 'control' : 'variant-a');
  }, [experimentId]);

  return variant;
}

export default function ABTestingFramework() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [experiments, setExperiments] = useState<ABExperiment[]>([]);
  const [funnels, setFunnels] = useState<ConversionFunnel[]>([]);
  const [performanceImpacts, setPerformanceImpacts] = useState<PerformanceImpact[]>([]);
  const [selectedTab, setSelectedTab] = useState('experiments');
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock feature flags
      setFeatureFlags([
        {
          id: '1',
          name: 'enhanced_dashboard_v2',
          description: 'New dashboard layout with improved analytics',
          enabled: true,
          rolloutPercentage: 25,
          targetAudience: ['beta_users', 'internal_staff'],
          environment: 'production',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          name: 'ai_powered_suggestions',
          description: 'AI-powered ticket suggestions and auto-assignment',
          enabled: false,
          rolloutPercentage: 0,
          environment: 'staging',
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-12'),
        },
        {
          id: '3',
          name: 'mobile_responsive_redesign',
          description: 'Improved mobile experience with touch optimizations',
          enabled: true,
          rolloutPercentage: 100,
          environment: 'production',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-14'),
        },
      ]);

      // Mock experiments
      setExperiments([
        {
          id: '1',
          name: 'Ticket Submission Button Color',
          description: 'Testing different button colors for ticket submission CTA',
          status: 'running',
          variants: [
            {
              id: 'control',
              name: 'Blue Button (Control)',
              description: 'Current blue submit button',
              trafficPercentage: 50,
              isControl: true,
              metrics: {
                participants: 1247,
                conversions: 342,
                conversionRate: 27.4,
                averageValue: 145.3,
                bounceRate: 23.1,
                sessionDuration: 8.2,
              },
            },
            {
              id: 'variant-a',
              name: 'Green Button',
              description: 'Green submit button variant',
              trafficPercentage: 50,
              isControl: false,
              metrics: {
                participants: 1198,
                conversions: 378,
                conversionRate: 31.6,
                averageValue: 152.7,
                bounceRate: 21.3,
                sessionDuration: 9.1,
              },
            },
          ],
          targetMetric: 'conversion_rate',
          trafficAllocation: 50,
          startDate: new Date('2024-01-10'),
          significance: 95,
          confidence: 87,
          results: {
            winner: 'variant-a',
            significance: 95,
            confidenceInterval: [2.1, 6.3],
            pValue: 0.023,
            improvement: 15.3,
          },
        },
        {
          id: '2',
          name: 'Knowledge Base Search Layout',
          description: 'Comparing search bar positions in knowledge base',
          status: 'completed',
          variants: [
            {
              id: 'control',
              name: 'Top Search Bar',
              description: 'Search bar at the top of the page',
              trafficPercentage: 33.3,
              isControl: true,
              metrics: {
                participants: 892,
                conversions: 234,
                conversionRate: 26.2,
                averageValue: 89.4,
                bounceRate: 34.7,
                sessionDuration: 5.3,
              },
            },
            {
              id: 'variant-a',
              name: 'Sidebar Search',
              description: 'Search bar in left sidebar',
              trafficPercentage: 33.3,
              isControl: false,
              metrics: {
                participants: 856,
                conversions: 187,
                conversionRate: 21.8,
                averageValue: 76.2,
                bounceRate: 41.2,
                sessionDuration: 4.1,
              },
            },
            {
              id: 'variant-b',
              name: 'Center Search',
              description: 'Large center search with categories',
              trafficPercentage: 33.4,
              isControl: false,
              metrics: {
                participants: 923,
                conversions: 312,
                conversionRate: 33.8,
                averageValue: 112.6,
                bounceRate: 28.3,
                sessionDuration: 7.2,
              },
            },
          ],
          targetMetric: 'search_success_rate',
          trafficAllocation: 25,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-14'),
          significance: 99,
          confidence: 99,
          results: {
            winner: 'variant-b',
            significance: 99,
            confidenceInterval: [4.2, 11.8],
            pValue: 0.001,
            improvement: 29.0,
          },
        },
      ]);

      // Mock conversion funnels
      setFunnels([
        {
          name: 'Ticket Submission Funnel',
          totalUsers: 5847,
          conversionRate: 23.4,
          steps: [
            { name: 'Landing Page Visit', users: 5847, conversionRate: 100, dropOffRate: 0 },
            { name: 'Started Form', users: 4234, conversionRate: 72.4, dropOffRate: 27.6 },
            { name: 'Filled Details', users: 2891, conversionRate: 68.3, dropOffRate: 31.7 },
            { name: 'Submitted Ticket', users: 1369, conversionRate: 47.3, dropOffRate: 52.7 },
          ],
        },
        {
          name: 'Knowledge Base Search Funnel',
          totalUsers: 3421,
          conversionRate: 45.7,
          steps: [
            { name: 'Search Page Visit', users: 3421, conversionRate: 100, dropOffRate: 0 },
            { name: 'Performed Search', users: 2734, conversionRate: 79.9, dropOffRate: 20.1 },
            { name: 'Clicked Result', users: 2156, conversionRate: 78.9, dropOffRate: 21.1 },
            { name: 'Found Solution', users: 1564, conversionRate: 72.5, dropOffRate: 27.5 },
          ],
        },
      ]);

      // Mock performance impacts
      setPerformanceImpacts([
        {
          metric: 'Page Load Time',
          baseline: 2.3,
          variant: 1.9,
          impact: -17.4,
          significance: 'high',
        },
        {
          metric: 'Time to Interactive',
          baseline: 3.7,
          variant: 3.2,
          impact: -13.5,
          significance: 'medium',
        },
        {
          metric: 'Bundle Size',
          baseline: 245.6,
          variant: 231.2,
          impact: -5.9,
          significance: 'low',
        },
        {
          metric: 'Memory Usage',
          baseline: 42.3,
          variant: 38.9,
          impact: -8.0,
          significance: 'medium',
        },
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const toggleFeatureFlag = useCallback((flagId: string) => {
    setFeatureFlags((prev) =>
      prev.map((flag) =>
        flag.id === flagId ? { ...flag, enabled: !flag.enabled, updatedAt: new Date() } : flag,
      ),
    );
  }, []);

  const getExperimentStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignificanceColor = (significance: number) => {
    if (significance >= 95) return 'text-green-600';
    if (significance >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: number) => {
    if (Math.abs(impact) >= 15) return 'font-bold text-green-600';
    if (Math.abs(impact) >= 5) return 'font-medium text-yellow-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <FlaskConical className="mx-auto mb-4 h-8 w-8 animate-pulse text-purple-600" />
          <p className="text-muted-foreground">Loading A/B testing framework...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-2 text-white">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  A/B Testing Framework
                  <Badge variant="outline" className="border-purple-600 text-purple-600">
                    Experimentation Platform
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Feature flags, user experience experiments, conversion funnel analysis, and
                  performance impact measurement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Experiment
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="funnels">Conversion Funnels</TabsTrigger>
          <TabsTrigger value="performance">Performance Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Experiments</h3>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {experiments.map((experiment) => (
              <Card key={experiment.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Experiment Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <h4 className="font-semibold">{experiment.name}</h4>
                          <Badge className={getExperimentStatusColor(experiment.status)}>
                            {experiment.status}
                          </Badge>
                          {experiment.results?.winner && (
                            <Badge variant="outline" className="border-green-600 text-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Winner:{' '}
                              {
                                experiment.variants.find((v) => v.id === experiment.results!.winner)
                                  ?.name
                              }
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2 text-sm">
                          {experiment.description}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                          <span>Target: {experiment.targetMetric.replace('_', ' ')}</span>
                          <span>Traffic: {experiment.trafficAllocation}%</span>
                          <span>
                            Confidence:{' '}
                            <span className={getSignificanceColor(experiment.confidence)}>
                              {experiment.confidence}%
                            </span>
                          </span>
                          {experiment.results && (
                            <span>
                              Improvement:{' '}
                              <span className={getImpactColor(experiment.results.improvement)}>
                                +{experiment.results.improvement}%
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {experiment.status === 'running' ? (
                          <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Variants Comparison */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {experiment.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className={`rounded-lg border p-4 ${variant.isControl ? 'border-blue-200 bg-blue-50' : 'bg-gray-50'}`}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h5 className="text-sm font-medium">{variant.name}</h5>
                            {variant.isControl && (
                              <Badge
                                variant="outline"
                                className="border-blue-600 text-xs text-blue-600"
                              >
                                Control
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Participants:</span>
                              <span className="font-medium">
                                {variant.metrics.participants.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Conversions:</span>
                              <span className="font-medium">{variant.metrics.conversions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rate:</span>
                              <span className="font-medium text-green-600">
                                {variant.metrics.conversionRate}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg Value:</span>
                              <span className="font-medium">${variant.metrics.averageValue}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Results Summary */}
                    {experiment.results && (
                      <div className="rounded-lg bg-green-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Experiment Results</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <span className="text-muted-foreground">Statistical Significance:</span>
                            <div className="font-medium">{experiment.results.significance}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">P-Value:</span>
                            <div className="font-medium">{experiment.results.pValue}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Improvement:</span>
                            <div className="font-medium text-green-600">
                              +{experiment.results.improvement}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confidence Interval:</span>
                            <div className="font-medium">
                              [{experiment.results.confidenceInterval[0]}%,{' '}
                              {experiment.results.confidenceInterval[1]}%]
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flags" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Feature Flags</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Flag
            </Button>
          </div>

          <div className="space-y-4">
            {featureFlags.map((flag) => (
              <Card key={flag.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="font-medium">{flag.name}</h4>
                        <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Badge variant="outline">{flag.environment}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3 text-sm">{flag.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Rollout Percentage:</span>
                          <span className="font-medium">{flag.rolloutPercentage}%</span>
                        </div>
                        <Progress value={flag.rolloutPercentage} className="h-2" />

                        {flag.targetAudience && flag.targetAudience.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Targets:</span>
                            <div className="flex gap-1">
                              {flag.targetAudience.map((audience) => (
                                <Badge key={audience} variant="outline" className="text-xs">
                                  {audience.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        variant={flag.enabled ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => toggleFeatureFlag(flag.id)}
                      >
                        {flag.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="funnels" className="space-y-4">
          <h3 className="text-lg font-semibold">Conversion Funnels</h3>

          <div className="space-y-6">
            {funnels.map((funnel, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{funnel.name}</CardTitle>
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <span>Total Users: {funnel.totalUsers.toLocaleString()}</span>
                    <span>Overall Conversion: {funnel.conversionRate}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {funnel.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                          {stepIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-medium">{step.name}</span>
                            <span className="text-muted-foreground text-sm">
                              {step.users.toLocaleString()} users ({step.conversionRate}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Progress value={step.conversionRate} className="h-2 flex-1" />
                            {stepIndex > 0 && (
                              <span className="text-xs text-red-600">
                                -{step.dropOffRate}% drop-off
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <h3 className="text-lg font-semibold">Performance Impact Analysis</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {performanceImpacts.map((impact, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h4 className="mb-3 font-medium">{impact.metric}</h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Baseline:</span>
                      <span className="font-medium">
                        {impact.baseline}
                        {impact.metric.includes('Time')
                          ? 's'
                          : impact.metric.includes('Size')
                            ? 'KB'
                            : 'MB'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Variant:</span>
                      <span className="font-medium">
                        {impact.variant}
                        {impact.metric.includes('Time')
                          ? 's'
                          : impact.metric.includes('Size')
                            ? 'KB'
                            : 'MB'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Impact:</span>
                      <span
                        className={`font-medium ${impact.impact < 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {impact.impact > 0 ? '+' : ''}
                        {impact.impact}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Significance:</span>
                      <Badge
                        variant={
                          impact.significance === 'high'
                            ? 'default'
                            : impact.significance === 'medium'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {impact.significance}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
