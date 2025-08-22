/**
 * Intelligent Ticket Classification - Phase 2 Implementation
 * AI-powered automatic ticket classification and routing
 * Inspired by ServiceNow Now Assist intelligent categorization
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
} from '@heroicons/react/24/outline'

interface ClassificationResult {
  category: string
  subCategory: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  impact: 'low' | 'medium' | 'high' | 'critical'
  suggestedAssignee: string
  suggestedGroup: string
  confidence: number
  automationSuggestions: string[]
  estimatedResolutionTime: string
  similarTickets: number
  tags: string[]
}

interface TicketData {
  subject: string
  description: string
  requester: string
  channel: string
}

interface IntelligentClassificationProps {
  ticketData: TicketData
  onClassificationComplete: (result: ClassificationResult) => void
  autoClassify?: boolean
}

export function IntelligentTicketClassification({
  ticketData,
  onClassificationComplete,
  autoClassify = true
}: IntelligentClassificationProps) {
  const { t } = useTranslation(['classification', 'common'])
  const [isClassifying, setIsClassifying] = useState(false)
  const [classification, setClassification] = useState<ClassificationResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // AI-powered classification simulation
  const performClassification = async (data: TicketData): Promise<ClassificationResult> => {
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate AI processing

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
        'Schedule automated follow-up in 24 hours'
      ],
      estimatedResolutionTime: '4-6 hours',
      similarTickets: 23,
      tags: ['software', 'application', 'user-reported', 'business-hours']
    }

    // Smart classification based on keywords
    const subject = data.subject.toLowerCase()
    const description = data.description.toLowerCase()
    const content = `${subject} ${description}`

    if (content.includes('password') || content.includes('login') || content.includes('access')) {
      result.category = 'Security'
      result.subCategory = 'Access Management'
      result.priority = 'high'
      result.suggestedGroup = 'Identity & Access Team'
      result.estimatedResolutionTime = '1-2 hours'
      result.tags = ['security', 'access', 'identity', 'urgent']
      result.automationSuggestions = [
        'Trigger automated password reset workflow',
        'Verify user identity automatically',
        'Create temporary access if approved'
      ]
    } else if (content.includes('network') || content.includes('connection') || content.includes('internet')) {
      result.category = 'Infrastructure'
      result.subCategory = 'Network Issue'
      result.priority = 'high'
      result.urgency = 'high'
      result.impact = 'high'
      result.suggestedGroup = 'Network Operations Team'
      result.estimatedResolutionTime = '2-4 hours'
      result.tags = ['network', 'infrastructure', 'connectivity', 'critical']
    } else if (content.includes('laptop') || content.includes('computer') || content.includes('hardware')) {
      result.category = 'Hardware'
      result.subCategory = 'Endpoint Device'
      result.priority = 'medium'
      result.suggestedGroup = 'Desktop Support Team'
      result.estimatedResolutionTime = '4-8 hours'
      result.tags = ['hardware', 'endpoint', 'device', 'physical']
    }

    return result
  }

  useEffect(() => {
    if (autoClassify && ticketData.subject && ticketData.description) {
      handleClassify()
    }
  }, [ticketData, autoClassify])

  const handleClassify = async () => {
    if (!ticketData.subject || !ticketData.description) return

    setIsClassifying(true)
    try {
      const result = await performClassification(ticketData)
      setClassification(result)
      onClassificationComplete(result)
    } catch (error) {
      console.error('Classification failed:', error)
    } finally {
      setIsClassifying(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (isClassifying) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('classification:analyzing.title')}
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            {t('classification:analyzing.steps.content')}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ClockIcon className="w-4 h-4" />
            {t('classification:analyzing.steps.patterns')}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <UserGroupIcon className="w-4 h-4" />
            {t('classification:analyzing.steps.routing')}
          </div>
        </div>
        
        <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('classification:analyzing.progress')}
          </p>
        </div>
      </div>
    )
  }

  if (!classification) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('classification:waiting.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('classification:waiting.description')}
          </p>
          <button
            onClick={handleClassify}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('classification:actions.classify')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
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
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {showDetails ? t('common:actions.hideDetails') : t('common:actions.viewDetails')}
          </button>
        </div>
      </div>

      {/* Classification Results */}
      <div className="p-6 space-y-6">
        {/* Primary Classification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('classification:fields.category')}
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
            <div className={`p-3 rounded-lg border ${getPriorityColor(classification.priority)}`}>
              <div className="font-medium capitalize">
                {t(`classification:priorities.${classification.priority}`)}
              </div>
              <div className="text-sm">
                {t('classification:fields.urgency')}: {t(`classification:urgency.${classification.urgency}`)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('classification:fields.assignment')}
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <ClockIcon className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {t('classification:stats.estimatedTime')}
              </div>
              <div className="font-medium text-blue-900 dark:text-blue-300">
                {classification.estimatedResolutionTime}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <InformationCircleIcon className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {t('classification:stats.similarTickets')}
              </div>
              <div className="font-medium text-green-900 dark:text-green-300">
                {classification.similarTickets} {t('classification:stats.found')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
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
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                <TagIcon className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Automation Suggestions */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <BoltIcon className="w-4 h-4" />
                {t('classification:automation.title')}
              </label>
              <div className="space-y-2">
                {classification.automationSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                    <span className="text-gray-900 dark:text-white">{suggestion}</span>
                    <button className="ml-auto px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      {t('classification:automation.apply')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            {t('classification:actions.accept')}
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {t('classification:actions.modify')}
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {t('classification:actions.reclassify')}
          </button>
        </div>
      </div>
    </div>
  )
}
