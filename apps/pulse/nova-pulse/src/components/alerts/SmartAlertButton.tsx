import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAlertCosmo } from '../../hooks/useAlertCosmo';

interface SmartAlertButtonProps {
  ticketData?: {
    id: string;
    title: string;
    description: string;
    priority: string;
    category: string;
    customerTier?: string;
    affectedUsers?: number;
  };
  className?: string;
  onAlertCreated?: (alert: any) => void;
  onAlertEscalated?: (escalation: any) => void;
}

const SmartAlertButton: React.FC<SmartAlertButtonProps> = ({
  ticketData,
  className = '',
  onAlertCreated,
  onAlertEscalated,
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [autoExecute, setAutoExecute] = useState(false);

  const {
    isAnalyzing,
    lastAnalysis,
    analyzeTicket,
    executeRecommendation,
    isCreatingAlert,
    isEscalating,
    analysisError,
  } = useAlertCosmo({
    onAlertCreated,
    onAlertEscalated,
    onSuggestionReceived: (suggestions) => {
      console.log('Cosmo suggestions:', suggestions);
    },
  });

  const handleSmartAnalyze = async () => {
    if (!ticketData) return;

    try {
      const analysis = await analyzeTicket(ticketData);
      setShowSuggestion(true);

      // Auto-execute high confidence recommendations for critical issues
      if (
        analysis.confidence > 0.8 &&
        (analysis.action === 'create_alert' || analysis.action === 'escalate_alert') &&
        ticketData.priority === 'critical'
      ) {
        setAutoExecute(true);
        setTimeout(() => {
          executeRecommendation(analysis);
          setAutoExecute(false);
        }, 3000); // 3 second delay for user to cancel
      }
    } catch (error) {
      console.error('Smart analysis failed:', error);
    }
  };

  const handleExecuteRecommendation = async () => {
    try {
      await executeRecommendation();
      setShowSuggestion(false);
    } catch (error) {
      console.error('Failed to execute recommendation:', error);
    }
  };

  const handleCancelAutoExecute = () => {
    setAutoExecute(false);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_alert':
        return ExclamationTriangleIcon;
      case 'escalate_alert':
        return ArrowUpIcon;
      case 'suggest_resolution':
        return CheckCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create_alert':
        return 'bg-red-500 hover:bg-red-600';
      case 'escalate_alert':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'suggest_resolution':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create_alert':
        return 'Create Alert';
      case 'escalate_alert':
        return 'Escalate Alert';
      case 'suggest_resolution':
        return 'Get Suggestions';
      case 'no_action':
        return 'No Action Needed';
      default:
        return 'Unknown Action';
    }
  };

  const isLoading = isAnalyzing || isCreatingAlert || isEscalating;

  return (
    <div className={`relative ${className}`}>
      {/* Main Smart Alert Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSmartAnalyze}
        disabled={isLoading || !ticketData}
        className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
          isLoading
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'bg-purple-500 text-white shadow-lg hover:bg-purple-600 hover:shadow-xl'
        } `}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5" />
            <span>Smart Alert</span>
          </>
        )}
      </motion.button>

      {/* Auto-Execute Countdown */}
      <AnimatePresence>
        {autoExecute && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 z-50 mt-2 min-w-72 rounded-xl border border-orange-200 bg-orange-100 p-4 shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                <span className="text-sm font-medium text-orange-900">
                  Auto-executing in 3 seconds...
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCancelAutoExecute}
                className="rounded p-1 text-orange-600 hover:bg-orange-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </motion.button>
            </div>
            <p className="text-xs text-orange-700">
              High confidence critical recommendation will be executed automatically. Click X to
              cancel.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Result Suggestion */}
      <AnimatePresence>
        {showSuggestion && lastAnalysis && !autoExecute && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 z-50 mt-2 min-w-80 rounded-xl border border-gray-200/50 bg-white/95 p-4 shadow-lg backdrop-blur-xl"
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Cosmo Recommendation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    lastAnalysis.confidence > 0.7
                      ? 'bg-green-100 text-green-700'
                      : lastAnalysis.confidence > 0.5
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  } `}
                >
                  {Math.round(lastAnalysis.confidence * 100)}% confident
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSuggestion(false)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Reasoning */}
            <div className="mb-4">
              <p className="text-sm text-gray-700">{lastAnalysis.reasoning}</p>
            </div>

            {/* Suggestions */}
            {lastAnalysis.suggestions && lastAnalysis.suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-xs font-medium text-gray-600">Suggestions:</h4>
                <ul className="space-y-1">
                  {lastAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                      <span className="mt-1 text-purple-400">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            {lastAnalysis.action !== 'no_action' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Recommended action:</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExecuteRecommendation}
                  disabled={isLoading}
                  className={`flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-white transition-all duration-200 ${getActionColor(lastAnalysis.action)} ${isLoading ? 'cursor-not-allowed opacity-50' : ''} `}
                >
                  {React.createElement(getActionIcon(lastAnalysis.action), {
                    className: 'w-4 h-4',
                  })}
                  <span>{getActionLabel(lastAnalysis.action)}</span>
                </motion.button>
              </div>
            )}

            {lastAnalysis.action === 'no_action' && (
              <div className="py-2 text-center">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">No immediate action needed</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {analysisError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 z-50 mt-2 min-w-64 rounded-xl border border-red-200 bg-red-50 p-3 shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Analysis failed</span>
            </div>
            <p className="mt-1 text-xs text-red-700">{analysisError.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartAlertButton;
