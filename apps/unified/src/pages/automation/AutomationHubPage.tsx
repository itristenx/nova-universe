import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CogIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  CalendarIcon,
  BoltIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'

// Types
interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: string
  condition: string
  action: string
  status: 'active' | 'inactive' | 'error'
  executionCount: number
  lastExecuted: string
  createdAt: string
  category: 'incident' | 'change' | 'maintenance' | 'notification'
}

interface AutomationExecution {
  id: string
  ruleId: string
  status: 'running' | 'completed' | 'failed'
  startTime: string
  endTime?: string
  duration?: number
  logs: string[]
  result?: any
}

interface AutomationTemplate {
  id: string
  name: string
  description: string
  category: string
  trigger: string
  actions: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedSetupTime: string
}

export default function AutomationHubPage() {
  const { t } = useTranslation(['automation', 'common'])
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [executions, setExecutions] = useState<AutomationExecution[]>([])
  const [templates, setTemplates] = useState<AutomationTemplate[]>([])
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'templates'>('rules')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAutomationData()
  }, [])

  const loadAutomationData = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/automation')
      if (response.ok) {
        const data = await response.json()
        setRules(data.rules || [])
        setExecutions(data.executions || [])
        setTemplates(data.templates || [])
      } else {
        // Fallback to empty state if API fails
        setRules([])
        setExecutions([])
        setTemplates([])
      }
    } catch (error) {
      console.warn('Automation API unavailable, using fallback data:', error)
      // Fallback to empty state
      setRules([])
      setExecutions([])
      setTemplates([])
    }

    setLoading(false)
  }

  const toggleRuleStatus = async (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
        : rule
    ))
  }

  const executeRule = async (ruleId: string) => {
    // Simulate manual execution
    const newExecution: AutomationExecution = {
      id: `exec-${Date.now()}`,
      ruleId,
      status: 'running',
      startTime: new Date().toISOString(),
      logs: ['Manual execution started']
    }
    
    setExecutions(prev => [newExecution, ...prev])
    
    // Simulate execution completion
    setTimeout(() => {
      setExecutions(prev => prev.map(exec => 
        exec.id === newExecution.id 
          ? { 
              ...exec, 
              status: 'completed', 
              endTime: new Date().toISOString(),
              duration: 3000,
              logs: [...exec.logs, 'Execution completed successfully']
            }
          : exec
      ))
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'running':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
      case 'inactive':
        return <PauseIcon className="h-5 w-5 text-gray-400" />
      case 'failed':
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <CogIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl px-6 py-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <BoltIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold">{t('automation:title')}</h1>
        </div>
        <p className="text-blue-100">
          {t('automation:subtitle')}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
        <nav className="flex space-x-1">
          {(['rules', 'executions', 'templates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t(`automation:tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('automation:automationRules')}
            </h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {t('automation:createRule')}
            </button>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(rule.status)}
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {rule.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(rule.status)}`}>
                        {t(`automation:status.${rule.status}`)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rule.description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{t('automation:lastExecuted')}: {rule.lastExecuted}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>{t('automation:executions')}: {rule.executionCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{t('automation:created')}: {rule.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => executeRule(rule.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={t('automation:executeNow')}
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleRuleStatus(rule.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={rule.status === 'active' ? t('automation:pause') : t('automation:activate')}
                    >
                      {rule.status === 'active' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                    </button>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <CogIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'executions' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t('automation:executionHistory')}
          </h2>

          <div className="space-y-4">
            {executions.map((execution) => {
              const rule = rules.find(r => r.id === execution.ruleId)
              return (
                <div
                  key={execution.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {rule?.name || 'Unknown Rule'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t('automation:started')}: {execution.startTime}
                          {execution.duration && ` • ${t('automation:duration')}: ${execution.duration}ms`}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(execution.status)}`}>
                      {t(`automation:status.${execution.status}`)}
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('automation:executionLogs')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {execution.logs.map((log, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('automation:automationTemplates')}
            </h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              {t('automation:browseMarketplace')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(template.difficulty)}`}>
                    {t(`automation:difficulty.${template.difficulty}`)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-500">
                    <strong>{t('automation:trigger')}:</strong> {template.trigger}
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>{t('automation:setupTime')}:</strong> {template.estimatedSetupTime}
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {t('automation:actions')}:
                  </div>
                  {template.actions.slice(0, 3).map((action, index) => (
                    <div key={index} className="text-xs text-gray-500">
                      • {action}
                    </div>
                  ))}
                  {template.actions.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{template.actions.length - 3} {t('automation:moreActions')}
                    </div>
                  )}
                </div>

                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  {t('automation:useTemplate')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
