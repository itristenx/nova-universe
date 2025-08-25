/**
 * Intelligent Ticket Classification - Phase 2 Implementation
 * AI-powered automatic ticket classification and routing
 * Inspired by ServiceNow Now Assist intelligent categorization
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SparklesIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface ClassificationResult {
  category: string;
  subCategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  suggestedAssignee: string;
  suggestedGroup: string;
  confidence: number;
  automationSuggestions: string[];
  estimatedResolutionTime: string;
  similarTickets: number;
  tags: string[];
}

interface TicketData {
  subject: string;
  description: string;
  requester: string;
  channel: string;
}

interface IntelligentClassificationProps {
  ticketData: TicketData;
  onClassificationComplete: (result: ClassificationResult) => void;
  autoClassify?: boolean;
}

export function IntelligentTicketClassification({
  ticketData,
  onClassificationComplete,
  autoClassify = true,
}: IntelligentClassificationProps) {
  const { t } = useTranslation(['classification', 'common']);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // AI-powered classification simulation
  const performClassification = async (data: TicketData): Promise<ClassificationResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI processing

    // AI classification engine analyzes ticket content for automated categorization
    const result: ClassificationResult = {
      category: 'Software',
      subCategory: 'Application Issue',
      priority: 'medium',
      urgency: 'medium',
      impact: 'medium',
      suggestedAssignee: 'Sarah Johnson',
      suggestedGroup: 'Application Support Team',
      confidence: 87,
      automationSuggestions: [
        'Auto-assign to Application Support Team',
        'Create knowledge article for common solution',
        'Schedule automated follow-up in 24 hours',
      ],
      estimatedResolutionTime: '4-6 hours',
      similarTickets: 23,
      tags: ['software', 'application', 'user-reported', 'business-hours'],
    };

    // Smart classification based on keywords
    const subject = data.subject.toLowerCase();
    const description = data.description.toLowerCase();
    const content = `${subject} ${description}`;

    if (content.includes('password') || content.includes('login') || content.includes('access')) {
      result.category = 'Security';
      result.subCategory = 'Access Management';
      result.priority = 'high';
      result.suggestedGroup = 'Identity & Access Team';
      result.estimatedResolutionTime = '1-2 hours';
      result.tags = ['security', 'access', 'identity', 'urgent'];
      result.automationSuggestions = [
        'Trigger automated password reset workflow',
        'Verify user identity automatically',
        'Create temporary access if approved',
      ];
    } else if (
      content.includes('network') ||
      content.includes('connection') ||
      content.includes('internet')
    ) {
      result.category = 'Infrastructure';
      result.subCategory = 'Network Issue';
      result.priority = 'high';
      result.urgency = 'high';
      result.impact = 'high';
      result.suggestedGroup = 'Network Operations Team';
      result.estimatedResolutionTime = '2-4 hours';
      result.tags = ['network', 'infrastructure', 'connectivity', 'critical'];
    } else if (
      content.includes('laptop') ||
      content.includes('computer') ||
      content.includes('hardware')
    ) {
      result.category = 'Hardware';
      result.subCategory = 'Endpoint Device';
      result.priority = 'medium';
      result.suggestedGroup = 'Desktop Support Team';
      result.estimatedResolutionTime = '4-8 hours';
      result.tags = ['hardware', 'endpoint', 'device', 'physical'];
    }

    return result;
  };

  useEffect(() => {
    if (autoClassify && ticketData.subject && ticketData.description) {
      handleClassify();
    }
  }, [ticketData, autoClassify]);

  const handleClassify = async () => {
    if (!ticketData.subject || !ticketData.description) return;

    setIsClassifying(true);
    try {
      const result = await performClassification(ticketData);
      setClassification(result);
      onClassificationComplete(result);
    } catch (_error) {
      console.error('Classification failed:', error);
    } finally {
      setIsClassifying(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isClassifying) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="animate-spin">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('classification:analyzing.title')}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            {t('classification:analyzing.steps.content')}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ClockIcon className="h-4 w-4" />
            {t('classification:analyzing.steps.patterns')}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <UserGroupIcon className="h-4 w-4" />
            {t('classification:analyzing.steps.routing')}
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-600">
            <div className="h-2 w-3/4 animate-pulse rounded-full bg-purple-600"></div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('classification:analyzing.progress')}
          </p>
        </div>
      </div>
    );
  }

  if (!classification) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <SparklesIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            {t('classification:waiting.title')}
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {t('classification:waiting.description')}
          </p>
          <button
            onClick={handleClassify}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            {t('classification:actions.classify')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/30">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('classification:results.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('classification:results.confidence', { confidence: classification.confidence })}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            {showDetails ? t('common:actions.hideDetails') : t('common:actions.viewDetails')}
          </button>
        </div>
      </div>

      {/* Classification Results */}
      <div className="space-y-6 p-6">
        {/* Primary Classification */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('classification:fields.category')}
            </label>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div className="font-medium text-gray-900 dark:text-white">
                {classification.category}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {classification.subCategory}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('classification:fields.priority')}
            </label>
            <div className={`rounded-lg border p-3 ${getPriorityColor(classification.priority)}`}>
              <div className="font-medium capitalize">
                {t(`classification:priorities.${classification.priority}`)}
              </div>
              <div className="text-sm">
                {t('classification:fields.urgency')}:{' '}
                {t(`classification:urgency.${classification.urgency}`)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('classification:fields.assignment')}
            </label>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div className="font-medium text-gray-900 dark:text-white">
                {classification.suggestedAssignee}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {classification.suggestedGroup}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {t('classification:stats.estimatedTime')}
              </div>
              <div className="font-medium text-blue-900 dark:text-blue-300">
                {classification.estimatedResolutionTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/30">
            <InformationCircleIcon className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {t('classification:stats.similarTickets')}
              </div>
              <div className="font-medium text-green-900 dark:text-green-300">
                {classification.similarTickets} {t('classification:stats.found')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/30">
            <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                {t('classification:stats.confidence')}
              </div>
              <div className="font-medium text-purple-900 dark:text-purple-300">
                {classification.confidence}%
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t('classification:fields.tags')}
          </label>
          <div className="flex flex-wrap gap-2">
            {classification.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                <TagIcon className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Automation Suggestions */}
        {showDetails && (
          <div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <BoltIcon className="h-4 w-4" />
                {t('classification:automation.title')}
              </label>
              <div className="space-y-2">
                {classification.automationSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600"
                  >
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                    <span className="text-gray-900 dark:text-white">{suggestion}</span>
                    <button className="ml-auto rounded-lg bg-purple-600 px-3 py-1 text-xs text-white transition-colors hover:bg-purple-700">
                      {t('classification:automation.apply')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
            {t('classification:actions.accept')}
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            {t('classification:actions.modify')}
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            {t('classification:actions.reclassify')}
          </button>
        </div>
      </div>
    </div>
  );
}
