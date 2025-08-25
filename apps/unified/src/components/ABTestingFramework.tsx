import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  BeakerIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRBACStore } from '../stores/rbacStore';
import { featureFlagService } from '../services/liveApiServices';

// A/B Test Types
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  feature_flag_key: string;

  // Test Configuration
  hypothesis: string;
  success_metrics: string[];
  traffic_allocation: number; // Percentage of users to include
  variations: ABVariation[];

  // Targeting
  audience_segments: string[];
  geo_restrictions?: string[];
  device_restrictions?: string[];
  user_attributes?: Record<string, any>;

  // Scheduling
  start_date?: Date;
  end_date?: Date;
  duration_days?: number;

  // Results
  results?: ABTestResults;
  statistical_significance?: number;
  confidence_level: number;

  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
  tags: string[];
}

export interface ABVariation {
  id: string;
  name: string;
  description: string;
  traffic_percentage: number;
  is_control: boolean;
  configuration: Record<string, any>;

  // Results
  conversions?: number;
  total_users?: number;
  conversion_rate?: number;
  confidence_interval?: [number, number];
}

export interface ABTestResults {
  total_users: number;
  total_conversions: number;
  test_duration_days: number;
  statistical_significance: number;
  winning_variation: string | null;
  lift_percentage?: number;
  confidence_level: number;

  variation_results: Array<{
    variation_id: string;
    users: number;
    conversions: number;
    conversion_rate: number;
    confidence_interval: [number, number];
    statistical_significance: number;
  }>;

  daily_metrics: Array<{
    date: Date;
    variation_id: string;
    users: number;
    conversions: number;
    conversion_rate: number;
  }>;
}

// A/B Test List Component
interface ABTestListProps {
  onCreateTest: () => void;
  onEditTest: (test: ABTest) => void;
  onViewResults: (test: ABTest) => void;
}

export const ABTestList: React.FC<ABTestListProps> = ({
  onCreateTest,
  onEditTest,
  onViewResults,
}) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'running' | 'completed'>('all');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await fetch('/api/ab-tests');
      const data = await response.json();
      setTests(data.tests || []);
    } catch (_error) {
      console.error('Failed to load A/B tests:', error);
      // Demo data for now
      setTests([
        {
          id: '1',
          name: 'Service Catalog Layout Test',
          description: 'Testing grid vs list layout for service catalog',
          status: 'running',
          feature_flag_key: 'catalog_layout_experiment',
          hypothesis: 'Grid layout will increase engagement by 15%',
          success_metrics: ['click_through_rate', 'time_on_page'],
          traffic_allocation: 50,
          variations: [
            {
              id: 'control',
              name: 'Current List Layout',
              description: 'Existing list-based catalog layout',
              traffic_percentage: 50,
              is_control: true,
              configuration: { layout: 'list' },
              conversions: 245,
              total_users: 1200,
              conversion_rate: 20.4,
            },
            {
              id: 'treatment',
              name: 'New Grid Layout',
              description: 'Modern grid-based catalog layout',
              traffic_percentage: 50,
              is_control: false,
              configuration: { layout: 'grid' },
              conversions: 298,
              total_users: 1180,
              conversion_rate: 25.3,
            },
          ],
          audience_segments: ['all_users'],
          confidence_level: 95,
          created_by: 'admin',
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-20'),
          tags: ['catalog', 'ui', 'engagement'],
        },
        {
          id: '2',
          name: 'Approval Button Color Test',
          description: 'Testing button color impact on approval actions',
          status: 'completed',
          feature_flag_key: 'approval_button_color',
          hypothesis: 'Green buttons will increase approval rate by 10%',
          success_metrics: ['approval_rate'],
          traffic_allocation: 100,
          variations: [
            {
              id: 'control',
              name: 'Blue Buttons',
              description: 'Current blue approval buttons',
              traffic_percentage: 50,
              is_control: true,
              configuration: { button_color: 'blue' },
              conversions: 892,
              total_users: 2100,
              conversion_rate: 42.5,
            },
            {
              id: 'treatment',
              name: 'Green Buttons',
              description: 'Green approval buttons',
              traffic_percentage: 50,
              is_control: false,
              configuration: { button_color: 'green' },
              conversions: 987,
              total_users: 2080,
              conversion_rate: 47.5,
            },
          ],
          audience_segments: ['approvers'],
          confidence_level: 95,
          created_by: 'admin',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-14'),
          tags: ['approval', 'ui', 'conversion'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <PauseIcon className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTests = tests.filter((test) => filter === 'all' || test.status === filter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">A/B Tests</h2>
          <p className="text-gray-600">Manage and analyze your experiments</p>
        </div>
        <button
          onClick={onCreateTest}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Test
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All Tests' },
          { key: 'running', label: 'Running' },
          { key: 'completed', label: 'Completed' },
          { key: 'draft', label: 'Draft' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              filter === key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Test List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredTests.map((test) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-gray-200 bg-white shadow transition-shadow hover:shadow-md"
          >
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-2">
                    <BeakerIcon className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(test.status)}`}
                    >
                      {getStatusIcon(test.status)}
                      <span className="ml-1">{test.status}</span>
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">{test.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <UserGroupIcon className="mr-1 h-4 w-4" />
                      {test.traffic_allocation}% traffic
                    </span>
                    <span>{test.variations.length} variations</span>
                  </div>
                </div>
              </div>

              {/* Variations Summary */}
              {test.status === 'running' || test.status === 'completed' ? (
                <div className="mb-4 space-y-2">
                  {test.variations.map((variation) => (
                    <div
                      key={variation.id}
                      className="flex items-center justify-between rounded bg-gray-50 p-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-2 w-2 rounded-full ${variation.is_control ? 'bg-blue-500' : 'bg-green-500'}`}
                        />
                        <span className="text-sm font-medium">{variation.name}</span>
                        {variation.is_control && (
                          <span className="rounded bg-blue-100 px-1 text-xs text-blue-700">
                            Control
                          </span>
                        )}
                      </div>
                      {variation.conversion_rate && (
                        <div className="text-sm text-gray-600">
                          {variation.conversion_rate.toFixed(1)}% CR
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditTest(test)}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <CogIcon className="mr-2 h-4 w-4" />
                  Configure
                </button>
                {(test.status === 'running' || test.status === 'completed') && (
                  <button
                    onClick={() => onViewResults(test)}
                    className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Results
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="py-12 text-center">
          <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No A/B tests</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first experiment.
          </p>
          <div className="mt-6">
            <button
              onClick={onCreateTest}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// A/B Test Results Component
interface ABTestResultsProps {
  test: ABTest;
  onClose: () => void;
}

export const ABTestResults: React.FC<ABTestResultsProps> = ({ test, onClose }) => {
  const maxConversionRate = Math.max(...test.variations.map((v) => v.conversion_rate || 0));
  const winningVariation = test.variations.find((v) => v.conversion_rate === maxConversionRate);

  const controlVariation = test.variations.find((v) => v.is_control);
  const treatmentVariation = test.variations.find((v) => !v.is_control);

  const lift =
    controlVariation &&
    treatmentVariation &&
    controlVariation.conversion_rate &&
    treatmentVariation.conversion_rate
      ? ((treatmentVariation.conversion_rate - controlVariation.conversion_rate) /
          controlVariation.conversion_rate) *
        100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{test.name}</h2>
          <p className="text-gray-600">{test.description}</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
          <XCircleIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {test.variations.reduce((sum, v) => sum + (v.total_users || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Conversions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {test.variations.reduce((sum, v) => sum + (v.conversions || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            {lift > 0 ? (
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            ) : lift < 0 ? (
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
            ) : (
              <MinusIcon className="h-8 w-8 text-gray-600" />
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Lift</p>
              <p
                className={`text-2xl font-semibold ${
                  lift > 0 ? 'text-green-600' : lift < 0 ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {lift > 0 ? '+' : ''}
                {lift.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Statistical Significance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {test.statistical_significance ? `${test.statistical_significance}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Variation Comparison */}
      <div className="rounded-lg border bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Variation Performance</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {test.variations.map((variation) => (
              <div key={variation.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        variation.is_control ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                    />
                    <h4 className="font-medium text-gray-900">{variation.name}</h4>
                    {variation.is_control && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                        Control
                      </span>
                    )}
                    {winningVariation?.id === variation.id && (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                        Winner
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {variation.traffic_percentage}% traffic
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Users</p>
                    <p className="font-semibold">{(variation.total_users || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Conversions</p>
                    <p className="font-semibold">{(variation.conversions || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Conversion Rate</p>
                    <p className="font-semibold">{(variation.conversion_rate || 0).toFixed(2)}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${
                        variation.is_control ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${variation.conversion_rate || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Configuration */}
      <div className="rounded-lg border bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Test Configuration</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium text-gray-900">Hypothesis</h4>
              <p className="text-sm text-gray-600">{test.hypothesis}</p>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-900">Success Metrics</h4>
              <div className="flex flex-wrap gap-1">
                {test.success_metrics.map((metric) => (
                  <span
                    key={metric}
                    className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                  >
                    {metric.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-900">Audience</h4>
              <div className="flex flex-wrap gap-1">
                {test.audience_segments.map((segment) => (
                  <span
                    key={segment}
                    className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                  >
                    {segment.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-900">Feature Flag</h4>
              <code className="rounded bg-gray-100 px-2 py-1 text-sm">{test.feature_flag_key}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABTestList;
