import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  X,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '@components/design-system';

interface AIInsight {
  id: string;
  type: 'prediction' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

interface AIInsightCardProps {
  insight: AIInsight;
  onDismiss?: (id: string) => void;
  onFeedback?: (id: string, positive: boolean) => void;
}

/**
 * AI Insight Card Component
 */
export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onDismiss,
  onFeedback,
}) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'prediction':
        return <Target className="w-5 h-5" />;
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch (insight.type) {
      case 'prediction':
        return 'from-blue-500 to-purple-500';
      case 'anomaly':
        return 'from-red-500 to-orange-500';
      case 'recommendation':
        return 'from-green-500 to-teal-500';
      case 'trend':
        return 'from-indigo-500 to-blue-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const getImpactVariant = () => {
    switch (insight.impact) {
      case 'high':
        return 'critical' as const;
      case 'medium':
        return 'warning' as const;
      case 'low':
        return 'info' as const;
      default:
        return 'info' as const;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="glass rounded-apple-lg p-5 hover:shadow-glass-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        <div
          className={`p-3 rounded-apple-md bg-gradient-to-br ${getColor()} text-white flex-shrink-0`}
        >
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-sf-display font-semibold text-gray-900 dark:text-white">
              {insight.title}
            </h3>
            {onDismiss && (
              <button
                onClick={() => onDismiss(insight.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                type="button"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 mb-3">
            {insight.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <StatusBadge
              variant={getImpactVariant()}
              label={`${insight.impact} impact`}
              size="xs"
            />
            <StatusBadge
              variant={insight.confidence > 80 ? 'success' : 'warning'}
              label={`${insight.confidence}% confidence`}
              size="xs"
            />
            <span className="text-xs font-sf-text text-gray-500 dark:text-gray-400">
              {insight.createdAt.toRelativeTime()}
            </span>
          </div>

          {/* Action Button */}
          {insight.actionable && insight.action && (
            <button
              onClick={insight.action.onClick}
              className="w-full px-4 py-2 rounded-apple-sm bg-apple-blue dark:bg-apple-blue-dark text-white text-sm font-sf-text font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
              type="button"
            >
              {insight.action.label}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {onFeedback && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200/20 dark:border-gray-700/20">
          <span className="text-xs font-sf-text text-gray-500 dark:text-gray-400">
            Was this helpful?
          </span>
          <button
            onClick={() => onFeedback(insight.id, true)}
            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
            type="button"
            aria-label="Helpful"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          </button>
          <button
            onClick={() => onFeedback(insight.id, false)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
            type="button"
            aria-label="Not helpful"
          >
            <ThumbsDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

/**
 * AI Insights Dashboard
 */
export const AIInsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Load insights
  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockInsights: AIInsight[] = [
          {
            id: '1',
            type: 'prediction',
            title: 'Ticket Volume Spike Predicted',
            description:
              'Based on historical data, we predict a 35% increase in ticket volume next week due to upcoming system maintenance.',
            confidence: 87,
            impact: 'high',
            actionable: true,
            action: {
              label: 'Schedule Additional Support',
              onClick: () => console.log('Schedule support'),
            },
            createdAt: new Date(Date.now() - 3600000),
          },
          {
            id: '2',
            type: 'anomaly',
            title: 'Unusual Spike in Failed Login Attempts',
            description:
              'Detected a 300% increase in failed login attempts in the past hour. This may indicate a security issue.',
            confidence: 94,
            impact: 'high',
            actionable: true,
            action: {
              label: 'Review Security Logs',
              onClick: () => console.log('Review logs'),
            },
            createdAt: new Date(Date.now() - 1800000),
          },
          {
            id: '3',
            type: 'recommendation',
            title: 'Optimize Ticket Routing',
            description:
              'By reassigning network-related tickets to Team B, you could reduce average resolution time by 4 hours.',
            confidence: 76,
            impact: 'medium',
            actionable: true,
            action: {
              label: 'Update Routing Rules',
              onClick: () => console.log('Update routing'),
            },
            createdAt: new Date(Date.now() - 7200000),
          },
          {
            id: '4',
            type: 'trend',
            title: 'Improving Customer Satisfaction',
            description:
              'Customer satisfaction scores have improved by 12% over the past month, trending upward consistently.',
            confidence: 92,
            impact: 'low',
            actionable: false,
            createdAt: new Date(Date.now() - 86400000),
          },
          {
            id: '5',
            type: 'recommendation',
            title: 'Knowledge Base Gap Identified',
            description:
              '15% of tickets about "VPN connection issues" have no related KB articles. Creating documentation could reduce tickets.',
            confidence: 83,
            impact: 'medium',
            actionable: true,
            action: {
              label: 'Create KB Article',
              onClick: () => console.log('Create article'),
            },
            createdAt: new Date(Date.now() - 172800000),
          },
        ];

        setInsights(mockInsights);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const handleDismiss = (id: string) => {
    setInsights((prev) => prev.filter((insight) => insight.id !== id));
  };

  const handleFeedback = (id: string, positive: boolean) => {
    console.log(`Feedback for ${id}: ${positive ? 'positive' : 'negative'}`);
    // Send feedback to backend
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-pulse" />
          <span className="text-lg font-sf-text text-gray-600 dark:text-gray-400">
            Loading AI insights...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.length === 0 ? (
        <div className="glass rounded-apple-lg p-12 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white mb-2">
            No Insights Available
          </h3>
          <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400">
            Check back later for AI-powered insights and recommendations
          </p>
        </div>
      ) : (
        insights.map((insight) => (
          <AIInsightCard
            key={insight.id}
            insight={insight}
            onDismiss={handleDismiss}
            onFeedback={handleFeedback}
          />
        ))
      )}
    </div>
  );
};

// Add relative time helper to Date prototype
declare global {
  interface Date {
    toRelativeTime(): string;
  }
}

Date.prototype.toRelativeTime = function () {
  const now = new Date();
  const diffMs = now.getTime() - this.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return this.toLocaleDateString();
};

export default AIInsightsDashboard;
