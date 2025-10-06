import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const MotionDiv = (motion as any).div as React.FC<any>;
const AP = (AnimatePresence as any) as React.FC<any>;
import { mlService, type MLModel as MLModelType } from '@services/ml';
import {
  CpuChipIcon,
  ChartBarIcon,
  LightBulbIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BeakerIcon,
  RocketLaunchIcon,
  PauseIcon,
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


      // Load ML models from API
      const modelsResponse = await mlService.getModels({ limit: 100 });
      setModels(modelsResponse.models || []);
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
      <AP mode="wait">
        {selectedTab === 'insights' && (
          <MotionDiv
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
                  <MotionDiv
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
                  </MotionDiv>
                ))}
            </div>
          </MotionDiv>
        )}

        {selectedTab === 'models' && (
          <MotionDiv
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
          </MotionDiv>
        )}

        {selectedTab === 'recommendations' && (
          <MotionDiv
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {recommendations.map((rec) => (
                <div key={rec.id} className="rounded-lg border bg-white p-6 shadow">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{rec.item_name}</h3>
                      <p className="text-sm text-gray-500">
                        {rec.recommendation_type.replace('_', ' ')} • Score: {Math.round(rec.score * 100)}%
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      {rec.item_type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-700">Reasoning:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {rec.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-blue-500">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-2">
                    <button className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                      Apply Recommendation
                    </button>
                    <button className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
                  <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Recommendations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Recommendations will appear here based on your usage patterns.
                  </p>
                </div>
              )}
            </div>
          </MotionDiv>
        )}

        {selectedTab === 'anomalies' && (
          <MotionDiv
            key="anomalies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="rounded-lg border bg-white p-6 shadow">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{anomaly.title}</h3>
                      <p className="text-sm text-gray-500">
                        {anomaly.type.replace('_', ' ')} • Severity: {anomaly.severity}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      anomaly.severity === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : anomaly.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {Math.round(anomaly.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <p className="mb-4 text-sm text-gray-600">{anomaly.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-700">Affected Entities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {anomaly.affected_entities.map((entity, index) => (
                        <span key={index} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          {entity.name} ({entity.type})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">
                      Investigate
                    </button>
                    <button className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                      Mark as False Positive
                    </button>
                  </div>
                </div>
              ))}
              {anomalies.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
                  <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Anomalies Detected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The system is operating normally. Anomalies will be reported here when detected.
                  </p>
                </div>
              )}
            </div>
          </MotionDiv>
        )}
      </AP>
    </div>
  );
};

export default MLDashboard;
