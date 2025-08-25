import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

// Types
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  action: string;
  status: 'active' | 'inactive' | 'error';
  executionCount: number;
  lastExecuted: string;
  createdAt: string;
  category: 'incident' | 'change' | 'maintenance' | 'notification';
}

interface AutomationExecution {
  id: string;
  ruleId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  logs: string[];
  result?: any;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: string;
  actions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: string;
}

export default function AutomationHubPage() {
  const { t } = useTranslation(['automation', 'common']);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'templates'>('rules');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/automation');
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules || []);
        setExecutions(data.executions || []);
        setTemplates(data.templates || []);
      } else {
        // Fallback to empty state if API fails
        setRules([]);
        setExecutions([]);
        setTemplates([]);
      }
    } catch (_error) {
      console.warn('Automation API unavailable, using fallback data:', error);
      // Fallback to empty state
      setRules([]);
      setExecutions([]);
      setTemplates([]);
    }

    setLoading(false);
  };

  const toggleRuleStatus = async (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
          : rule,
      ),
    );
  };

  const executeRule = async (ruleId: string) => {
    // Simulate manual execution
    const newExecution: AutomationExecution = {
      id: `exec-${Date.now()}`,
      ruleId,
      status: 'running',
      startTime: new Date().toISOString(),
      logs: ['Manual execution started'],
    };

    setExecutions((prev) => [newExecution, ...prev]);

    // Simulate execution completion
    setTimeout(() => {
      setExecutions((prev) =>
        prev.map((exec) =>
          exec.id === newExecution.id
            ? {
                ...exec,
                status: 'completed',
                endTime: new Date().toISOString(),
                duration: 3000,
                logs: [...exec.logs, 'Execution completed successfully'],
              }
            : exec,
        ),
      );
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'running':
        return <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />;
      case 'inactive':
        return <PauseIcon className="h-5 w-5 text-gray-400" />;
      case 'failed':
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CogIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-white">
        <div className="mb-2 flex items-center space-x-3">
          <BoltIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold">{t('automation:title')}</h1>
        </div>
        <p className="text-blue-100">{t('automation:subtitle')}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
        <nav className="flex space-x-1">
          {(['rules', 'executions', 'templates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t(`automation:tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      {activeTab === 'rules' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('automation:automationRules')}
            </h2>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              {t('automation:createRule')}
            </button>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      {getStatusIcon(rule.status)}
                      <h3 className="font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${getStatusColor(rule.status)}`}
                      >
                        {t(`automation:status.${rule.status}`)}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {rule.description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>
                          {t('automation:lastExecuted')}: {rule.lastExecuted}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>
                          {t('automation:executions')}: {rule.executionCount}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {t('automation:created')}: {rule.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => executeRule(rule.id)}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      title={t('automation:executeNow')}
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleRuleStatus(rule.id)}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      title={
                        rule.status === 'active' ? t('automation:pause') : t('automation:activate')
                      }
                    >
                      {rule.status === 'active' ? (
                        <PauseIcon className="h-4 w-4" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
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
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {t('automation:executionHistory')}
          </h2>

          <div className="space-y-4">
            {executions.map((execution) => {
              const rule = rules.find((r) => r.id === execution.ruleId);
              return (
                <div
                  key={execution.id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {rule?.name || 'Unknown Rule'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t('automation:started')}: {execution.startTime}
                          {execution.duration &&
                            ` • ${t('automation:duration')}: ${execution.duration}ms`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getStatusColor(execution.status)}`}
                    >
                      {t(`automation:status.${execution.status}`)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                    <div className="mb-2 flex items-center space-x-2">
                      <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('automation:executionLogs')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {execution.logs.map((log, index) => (
                        <div
                          key={index}
                          className="font-mono text-sm text-gray-600 dark:text-gray-400"
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('automation:automationTemplates')}
            </h2>
            <button className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
              {t('automation:browseMarketplace')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${getDifficultyColor(template.difficulty)}`}
                  >
                    {t(`automation:difficulty.${template.difficulty}`)}
                  </span>
                </div>

                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {template.description}
                </p>

                <div className="mb-4 space-y-2">
                  <div className="text-xs text-gray-500">
                    <strong>{t('automation:trigger')}:</strong> {template.trigger}
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>{t('automation:setupTime')}:</strong> {template.estimatedSetupTime}
                  </div>
                </div>

                <div className="mb-4 space-y-1">
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

                <button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                  {t('automation:useTemplate')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
