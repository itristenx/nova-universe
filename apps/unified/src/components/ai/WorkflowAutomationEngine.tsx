/**
 * Workflow Automation Engine - Phase 2 Implementation
 * AI-powered workflow creation and automation management
 * Inspired by ServiceNow Flow Designer and intelligent automation
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { analyticsService } from '@/services/analytics'
import {
  BoltIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

interface WorkflowStep {
  id: string
  type: 'trigger' | 'condition' | 'action' | 'approval'
  name: string
  description: string
  config: Record<string, any>
  position: { x: number; y: number }
  connections: string[]
}

interface Workflow {
  id: string
  name: string
  description: string
  category: string
  status: 'active' | 'inactive' | 'draft'
  trigger: string
  steps: WorkflowStep[]
  statistics: {
    executions: number
    successRate: number
    avgExecutionTime: string
    timeSaved: string
  }
  lastModified: string
  createdBy: string
  aiSuggestions?: string[]
}

interface AutomationTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedSetupTime: string
  benefits: string[]
  requiredIntegrations: string[]
}

export function WorkflowAutomationEngine() {
  const { t } = useTranslation(['automation', 'common'])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [templates, setTemplates] = useState<AutomationTemplate[]>([])
  const [selectedTab, setSelectedTab] = useState<'workflows' | 'templates' | 'analytics'>('workflows')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAutomationData = async () => {
      setIsLoading(true)
      
      try {
        const automationData = await analyticsService.getWorkflowAutomationData()
        setWorkflows(automationData.workflows)
        setTemplates(automationData.templates)
      } catch (error) {
        console.error('Failed to fetch workflow automation data:', error)
        setWorkflows([])
        setTemplates([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAutomationData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'draft': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50'
      case 'intermediate': return 'text-yellow-600 bg-yellow-50'
      case 'advanced': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const toggleWorkflowStatus = async (workflowId: string) => {
    try {
      // Find current workflow status
      const currentWorkflow = workflows.find(wf => wf.id === workflowId)
      if (!currentWorkflow) return

      const newStatus = currentWorkflow.status === 'active' ? 'inactive' : 'active'
      
      // Update via API (this would be a real API call)
      // await analyticsService.updateWorkflowStatus(workflowId, newStatus)
      
      // Update local state
      setWorkflows(prev => prev.map(wf => {
        if (wf.id === workflowId) {
          return {
            ...wf,
            status: newStatus
          }
        }
        return wf
      }))
    } catch (error) {
      console.error('Failed to toggle workflow status:', error)
    }
  }

  const handleCreateWorkflow = () => {
    // Navigate to workflow creation
    console.log('Create workflow clicked')
  }

  const handleUseTemplate = (templateId: string) => {
    // Use template to create workflow
    console.log('Use template clicked:', templateId)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BoltIcon className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('automation:title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('automation:subtitle')}
            </p>
          </div>
        </div>
        
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          onClick={handleCreateWorkflow}
        >
          <PlusIcon className="w-4 h-4" />
          {t('automation:actions.createWorkflow')}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(['workflows', 'templates', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t(`automation:tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Workflows Tab */}
      {selectedTab === 'workflows' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {workflow.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(workflow.status)}`}>
                        {t(`automation:status.${workflow.status}`)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {workflow.description}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('automation:workflow.trigger')}: {workflow.trigger}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => toggleWorkflowStatus(workflow.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        workflow.status === 'active'
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      title={workflow.status === 'active' ? t('automation:actions.pause') : t('automation:actions.start')}
                    >
                      {workflow.status === 'active' ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                    </button>
                    <button 
                      className="p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={t('automation:actions.configure')}
                      aria-label={t('automation:actions.configure')}
                    >
                      <CogIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {workflow.statistics.executions}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('automation:stats.executions')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {workflow.statistics.successRate}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('automation:stats.successRate')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {workflow.statistics.avgExecutionTime}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('automation:stats.avgTime')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-600">
                      {workflow.statistics.timeSaved}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('automation:stats.timeSaved')}
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                {workflow.aiSuggestions && workflow.aiSuggestions.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-900 dark:text-purple-300">
                        {t('automation:aiSuggestions.title')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {workflow.aiSuggestions.map((suggestion, index) => (
                        <p key={index} className="text-xs text-purple-800 dark:text-purple-200">
                          • {suggestion}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{t('automation:workflow.lastModified')}: {workflow.lastModified}</span>
                  <span>{workflow.createdBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(template.difficulty)}`}>
                        {t(`automation:difficulty.${template.difficulty}`)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    {t('automation:template.setupTime')}: {template.estimatedSetupTime}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('automation:template.benefits')}:
                    </div>
                    <div className="space-y-1">
                      {template.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircleIcon className="w-3 h-3 text-green-500" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('automation:template.requiredIntegrations')}:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.requiredIntegrations.map((integration, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          {integration}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  {t('automation:actions.useTemplate')}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <BoltIcon className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {workflows.filter(w => w.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('automation:analytics.activeWorkflows')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <ChartBarIcon className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    2,139
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('automation:analytics.totalExecutions')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    20.8h
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('automation:analytics.timeSavedWeek')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    95.7%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('automation:analytics.overallSuccessRate')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('automation:analytics.topPerformingWorkflows')}
            </h3>
            <div className="space-y-4">
              {workflows
                .filter(w => w.status === 'active')
                .sort((a, b) => b.statistics.successRate - a.statistics.successRate)
                .slice(0, 3)
                .map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {workflow.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {workflow.statistics.executions} {t('automation:analytics.executions')} • {workflow.statistics.timeSaved}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {workflow.statistics.successRate}%
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
