import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CpuChipIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  UserIcon,
  BuildingLibraryIcon,
  TagIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BeakerIcon,
  RocketLaunchIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { useRBACStore } from '../stores/rbacStore';

// ML Model Types
export interface MLModel {
  id: string;
  name: string;
  description: string;
  type: 'recommendation' | 'anomaly_detection' | 'prediction' | 'classification' | 'clustering';
  status: 'training' | 'active' | 'inactive' | 'error';
  accuracy: number;
  last_trained: Date;
  version: string;
  features: string[];
  metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    auc_roc?: number;
  };
  training_data_size: number;
  prediction_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface MLInsight {
  id: string;
  type: 'recommendation' | 'anomaly' | 'prediction' | 'trend';
  category: 'catalog' | 'user_behavior' | 'approval' | 'security' | 'cost' | 'performance';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
  actions?: Array<{
    label: string;
    action: string;
    parameters?: Record<string, any>;
  }>;
  created_at: Date;
  expires_at?: Date;
  is_dismissed: boolean;
  user_feedback?: 'helpful' | 'not_helpful';
}

export interface MLRecommendation {
  id: string;
  user_id: string;
  item_type: 'catalog_item' | 'workflow' | 'role' | 'feature';
  item_id: string;
  item_name: string;
  recommendation_type: 'similar' | 'frequently_together' | 'trending' | 'personalized';
  score: number;
  reasoning: string[];
  context: Record<string, any>;
  created_at: Date;
}

export interface MLAnomalyDetection {
  id: string;
  type: 'user_behavior' | 'system_performance' | 'security' | 'data_quality';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  affected_entities: Array<{
    type: string;
    id: string;
    name: string;
  }>;
  anomaly_data: Record<string, any>;
  baseline_data: Record<string, any>;
  detected_at: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assigned_to?: string;
}

// ML Dashboard Component
export const MLDashboard: React.FC = () => {
  const [models, setModels] = useState<MLModel[]>([]);
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [recommendations, setRecommendations] = useState<MLRecommendation[]>([]);
  const [anomalies, setAnomalies] = useState<MLAnomalyDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    'insights' | 'models' | 'recommendations' | 'anomalies'
  >('insights');
  const { currentUser, hasPermission } = useRBACStore();

  useEffect(() => {
    if (hasPermission('ml.view')) {
      loadMLData();
    }
  }, [hasPermission]);

  const loadMLData = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API calls
      setModels([
        {
          id: 'model_1',
          name: 'Service Catalog Recommender',
          description: 'Recommends relevant catalog items based on user behavior and department',
          type: 'recommendation',
          status: 'active',
          accuracy: 0.87,
          last_trained: new Date('2024-01-18T10:00:00'),
          version: '2.1.0',
          features: [
            'user_department',
            'previous_requests',
            'role',
            'time_of_day',
            'item_category',
          ],
          metrics: {
            precision: 0.89,
            recall: 0.84,
            f1_score: 0.87,
            auc_roc: 0.91,
          },
          training_data_size: 50000,
          prediction_count: 12450,
          created_at: new Date('2024-01-01T00:00:00'),
          updated_at: new Date('2024-01-18T10:00:00'),
        },
        {
          id: 'model_2',
          name: 'User Behavior Anomaly Detector',
          description: 'Detects unusual user behavior patterns that may indicate security risks',
          type: 'anomaly_detection',
          status: 'active',
          accuracy: 0.94,
          last_trained: new Date('2024-01-19T14:30:00'),
          version: '1.3.2',
          features: [
            'login_times',
            'access_patterns',
            'location',
            'device_info',
            'permission_usage',
          ],
          metrics: {
            precision: 0.96,
            recall: 0.92,
            f1_score: 0.94,
            auc_roc: 0.97,
          },
          training_data_size: 75000,
          prediction_count: 8920,
          created_at: new Date('2023-12-15T00:00:00'),
          updated_at: new Date('2024-01-19T14:30:00'),
        },
        {
          id: 'model_3',
          name: 'Approval Time Predictor',
          description: 'Predicts approval processing time based on request attributes',
          type: 'prediction',
          status: 'training',
          accuracy: 0.76,
          last_trained: new Date('2024-01-20T09:00:00'),
          version: '1.0.1',
          features: ['request_type', 'cost', 'department', 'approver_workload', 'priority'],
          metrics: {
            precision: 0.78,
            recall: 0.74,
            f1_score: 0.76,
          },
          training_data_size: 30000,
          prediction_count: 2150,
          created_at: new Date('2024-01-10T00:00:00'),
          updated_at: new Date('2024-01-20T09:00:00'),
        },
      ]);

      setInsights([
        {
          id: 'insight_1',
          type: 'trend',
          category: 'catalog',
          title: 'Increasing Demand for Development Tools',
          description:
            'Development-related catalog requests have increased by 34% this month, driven primarily by the Engineering department.',
          confidence: 0.92,
          severity: 'medium',
          data: {
            increase_percentage: 34,
            primary_driver: 'Engineering',
            top_items: ['IDE Licenses', 'Cloud Development Environments', 'Testing Tools'],
          },
          actions: [
            {
              label: 'Bulk Purchase Development Licenses',
              action: 'create_bulk_request',
              parameters: { category: 'development_tools' },
            },
            {
              label: 'Review Development Tool Budget',
              action: 'review_budget',
              parameters: { department: 'engineering' },
            },
          ],
          created_at: new Date('2024-01-20T08:00:00'),
          is_dismissed: false,
        },
        {
          id: 'insight_2',
          type: 'anomaly',
          category: 'approval',
          title: 'Approval Bottleneck Detected',
          description: 'Manager approval step is taking 3x longer than usual for IT requests.',
          confidence: 0.88,
          severity: 'high',
          data: {
            normal_time: '2.5 hours',
            current_time: '7.8 hours',
            affected_department: 'IT',
            pending_requests: 23,
          },
          actions: [
            {
              label: 'Reassign Pending Requests',
              action: 'reassign_approvals',
              parameters: { department: 'IT' },
            },
            {
              label: 'Add Backup Approver',
              action: 'add_approver',
              parameters: { role: 'it_manager' },
            },
          ],
          created_at: new Date('2024-01-20T10:30:00'),
          is_dismissed: false,
        },
        {
          id: 'insight_3',
          type: 'prediction',
          category: 'cost',
          title: 'Budget Overage Risk',
          description:
            'Based on current spending trends, the Marketing department is likely to exceed their Q1 budget by 18%.',
          confidence: 0.85,
          severity: 'high',
          data: {
            current_spend: 82000,
            projected_overage: 18,
            risk_factors: [
              'Increased software licenses',
              'Conference expenses',
              'Contractor tools',
            ],
          },
          actions: [
            {
              label: 'Review Marketing Requests',
              action: 'review_department_requests',
              parameters: { department: 'marketing' },
            },
            {
              label: 'Set Spending Alert',
              action: 'create_budget_alert',
              parameters: { department: 'marketing', threshold: 90 },
            },
          ],
          created_at: new Date('2024-01-20T07:15:00'),
          is_dismissed: false,
        },
      ]);

      setRecommendations([
        {
          id: 'rec_1',
          user_id: currentUser?.id || 'current_user',
          item_type: 'catalog_item',
          item_id: 'item_123',
          item_name: 'Slack Premium License',
          recommendation_type: 'frequently_together',
          score: 0.89,
          reasoning: [
            'Users who request Zoom Pro often also request Slack Premium',
            'Your department frequently uses communication tools',
            'This combination improves team collaboration by 23%',
          ],
          context: {
            previous_request: 'Zoom Pro License',
            department: 'Engineering',
            team_size: 12,
          },
          created_at: new Date('2024-01-20T11:00:00'),
        },
        {
          id: 'rec_2',
          user_id: currentUser?.id || 'current_user',
          item_type: 'workflow',
          item_id: 'workflow_456',
          item_name: 'Fast-Track Approval for Development Tools',
          recommendation_type: 'personalized',
          score: 0.76,
          reasoning: [
            'You frequently request development tools',
            'This workflow reduces approval time by 60%',
            'Similar users find this workflow helpful',
          ],
          context: {
            request_frequency: 'weekly',
            avg_approval_time: '4.2 hours',
            tool_category: 'development',
          },
          created_at: new Date('2024-01-20T09:30:00'),
        },
      ]);

      setAnomalies([
        {
          id: 'anom_1',
          type: 'user_behavior',
          title: 'Unusual Access Pattern Detected',
          description:
            'User accessing admin functions outside normal hours with elevated permissions',
          severity: 'high',
          confidence: 0.91,
          affected_entities: [{ type: 'user', id: 'user_789', name: 'jane.smith@company.com' }],
          anomaly_data: {
            access_time: '2:30 AM',
            permissions_used: ['user.delete', 'system.config'],
            location: 'Unknown IP',
          },
          baseline_data: {
            normal_hours: '9 AM - 6 PM',
            typical_permissions: ['user.view', 'request.approve'],
            usual_location: 'Office Network',
          },
          detected_at: new Date('2024-01-20T02:30:00'),
          status: 'open',
        },
        {
          id: 'anom_2',
          type: 'system_performance',
          title: 'Request Processing Slowdown',
          description: 'Catalog request processing time has increased significantly',
          severity: 'medium',
          confidence: 0.83,
          affected_entities: [{ type: 'system', id: 'catalog_api', name: 'Catalog API' }],
          anomaly_data: {
            avg_processing_time: '12.5 seconds',
            error_rate: '3.2%',
            peak_time: '11:00 AM - 2:00 PM',
          },
          baseline_data: {
            normal_processing_time: '2.1 seconds',
            normal_error_rate: '0.8%',
            typical_load: 'steady',
          },
          detected_at: new Date('2024-01-20T11:15:00'),
          status: 'investigating',
          assigned_to: 'devops_team',
        },
      ]);
    } catch (_error) {
      console.error('Failed to load ML data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'training':
        return <BeakerIcon className="h-4 w-4 text-blue-500" />;
      case 'inactive':
        return <PauseIcon className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleInsightAction = (insight: MLInsight, actionIndex: number) => {
    const action = insight.actions?.[actionIndex];
    if (!action) return;

    console.log('Executing ML insight action:', action);
    // Implement action execution logic here
  };

  const dismissInsight = (insightId: string) => {
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === insightId ? { ...insight, is_dismissed: true } : insight,
      ),
    );
  };

  const provideFeedback = (insightId: string, feedback: 'helpful' | 'not_helpful') => {
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === insightId ? { ...insight, user_feedback: feedback } : insight,
      ),
    );
  };

  if (!hasPermission('ml.view')) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view ML insights.
          </p>
        </div>
      </div>
    );
  }

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
          <h2 className="flex items-center text-2xl font-bold text-gray-900">
            <SparklesIcon className="mr-3 h-8 w-8 text-purple-600" />
            AI & Machine Learning
          </h2>
          <p className="text-gray-600">Intelligent insights and automated recommendations</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'insights', label: 'Smart Insights', icon: LightBulbIcon },
            { key: 'models', label: 'ML Models', icon: CpuChipIcon },
            { key: 'recommendations', label: 'Recommendations', icon: RocketLaunchIcon },
            { key: 'anomalies', label: 'Anomalies', icon: ExclamationCircleIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as any)}
              className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium ${
                selectedTab === key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Insights Summary */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 shadow">
                <div className="flex items-center">
                  <LightBulbIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Active Insights</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {insights.filter((i) => !i.is_dismissed).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-6 shadow">
                <div className="flex items-center">
                  <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">High Priority</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {insights.filter((i) => i.severity === 'high' && !i.is_dismissed).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-6 shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Math.round(
                        (insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights List */}
            <div className="space-y-4">
              {insights
                .filter((i) => !i.is_dismissed)
                .map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border bg-white p-6 shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(insight.severity)}`}
                          >
                            {insight.severity}
                          </span>
                          <span className="text-sm text-gray-500">{insight.category}</span>
                          <span className="text-sm text-gray-500">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>

                        <h3 className="mb-2 text-lg font-medium text-gray-900">{insight.title}</h3>
                        <p className="mb-4 text-gray-600">{insight.description}</p>

                        {/* Insight Actions */}
                        {insight.actions && insight.actions.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {insight.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => handleInsightAction(insight, index)}
                                className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-3 py-1 text-sm font-medium text-white hover:bg-purple-700"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Feedback */}
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500">Was this helpful?</span>
                          <button
                            onClick={() => provideFeedback(insight.id, 'helpful')}
                            className={`rounded px-2 py-1 ${
                              insight.user_feedback === 'helpful'
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-600 hover:text-green-600'
                            }`}
                          >
                            👍 Yes
                          </button>
                          <button
                            onClick={() => provideFeedback(insight.id, 'not_helpful')}
                            className={`rounded px-2 py-1 ${
                              insight.user_feedback === 'not_helpful'
                                ? 'bg-red-100 text-red-700'
                                : 'text-gray-600 hover:text-red-600'
                            }`}
                          >
                            👎 No
                          </button>
                          <button
                            onClick={() => dismissInsight(insight.id)}
                            className="ml-auto text-gray-400 hover:text-gray-600"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {selectedTab === 'models' && (
          <motion.div
            key="models"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {models.map((model) => (
                <div key={model.id} className="rounded-lg border bg-white p-6 shadow">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <CpuChipIcon className="h-6 w-6 text-purple-600" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{model.name}</h3>
                        <p className="text-sm text-gray-500">{model.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(model.status)}
                      <span className="text-sm text-gray-600">{model.status}</span>
                    </div>
                  </div>

                  <p className="mb-4 text-gray-600">{model.description}</p>

                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Accuracy</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.round(model.accuracy * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Predictions</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {model.prediction_count.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Last trained: {model.last_trained.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MLDashboard;
