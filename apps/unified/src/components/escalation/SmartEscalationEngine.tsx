import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface EscalationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  conditions: {
    type: 'time_threshold' | 'priority_level' | 'category' | 'customer_tier' | 'complexity_score';
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: string | number;
    unit?: string;
  }[];
  actions: {
    type: 'assign_to_user' | 'assign_to_group' | 'notify' | 'escalate_priority' | 'add_flag';
    target: string;
    delay?: number;
    message?: string;
  }[];
  accuracy: number;
  triggeredCount: number;
  lastTriggered?: Date;
}

interface EscalationEvent {
  id: string;
  ticketId: string;
  ticketTitle: string;
  ruleId: string;
  ruleName: string;
  status: 'pending' | 'approved' | 'executed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  triggeredAt: Date;
  scheduledFor?: Date;
  executedAt?: Date;
  reason: string;
  recommendation: string;
  confidence: number;
  reviewer?: string;
  customerImpact: 'high' | 'medium' | 'low';
  businessImpact: 'high' | 'medium' | 'low';
}

interface SmartEscalationEngineProps {
  className?: string;
  onRuleToggle?: (ruleId: string, enabled: boolean) => void;
  onEventAction?: (eventId: string, action: 'approve' | 'cancel' | 'delay') => void;
  onRuleEdit?: (rule: EscalationRule) => void;
  showAdvancedSettings?: boolean;
  autoApproveThreshold?: number;
}

// Escalation rules and events should be loaded from escalation API
const mockRules: EscalationRule[] = [];
const mockEvents: EscalationEvent[] = [];
    ruleId: 'complexity-rule',
    ruleName: 'High Complexity Detection',
    status: 'approved',
    priority: 'medium',
    triggeredAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    scheduledFor: new Date(Date.now() + 15 * 60 * 1000), // in 15 minutes
    reason: 'Complexity score: 9.2/10',
    recommendation: 'Escalate to database specialist team after 30-minute observation period',
    confidence: 87,
    reviewer: 'Mike Chen',
    customerImpact: 'low',
    businessImpact: 'medium',
  },
];

export function SmartEscalationEngine({
  className,
  onRuleToggle,
  onEventAction,
  onRuleEdit,
  showAdvancedSettings = false,
  autoApproveThreshold = 90,
}: SmartEscalationEngineProps) {
  const [rules, setRules] = useState<EscalationRule[]>(mockRules);
  const [events, setEvents] = useState<EscalationEvent[]>(mockEvents);
  const [selectedTab, setSelectedTab] = useState<'rules' | 'events' | 'analytics'>('events');
  const [isEngineRunning, setIsEngineRunning] = useState(true);
  const [showSettings, setShowSettings] = useState(showAdvancedSettings);

  // Auto-refresh events
  useEffect(() => {
    if (!isEngineRunning) return;

    const interval = setInterval(() => {
      // Simulate new events or status updates
      const now = new Date();
      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.status === 'pending' && event.scheduledFor && event.scheduledFor <= now) {
            return { ...event, status: 'executed', executedAt: now };
          }
          return event;
        }),
      );
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isEngineRunning]);

  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    setRules((prev) => prev.map((rule) => (rule.id === ruleId ? { ...rule, enabled } : rule)));
    onRuleToggle?.(ruleId, enabled);
  };

  const handleEventAction = (eventId: string, action: 'approve' | 'cancel' | 'delay') => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          switch (action) {
            case 'approve':
              return { ...event, status: 'approved' };
            case 'cancel':
              return { ...event, status: 'cancelled' };
            case 'delay':
              return {
                ...event,
                scheduledFor: new Date(Date.now() + 30 * 60 * 1000), // Delay by 30 minutes
              };
            default:
              return event;
          }
        }
        return event;
      }),
    );
    onEventAction?.(eventId, action);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-blue-600" />;
      case 'executed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    };
    return (
      <span
        className={cn(
          'rounded-full px-2 py-1 text-xs font-medium',
          colors[impact as keyof typeof colors],
        )}
      >
        {impact.toUpperCase()}
      </span>
    );
  };

  const activeRules = rules.filter((rule) => rule.enabled).length;
  const pendingEvents = events.filter((event) => event.status === 'pending').length;
  const totalTriggered = rules.reduce((sum, rule) => sum + rule.triggeredCount, 0);
  const avgAccuracy = rules.reduce((sum, rule) => sum + rule.accuracy, 0) / rules.length;

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Smart Escalation Engine
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            AI-powered ticket escalation with intelligent rule management
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Engine Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEngineRunning(!isEngineRunning)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors',
                isEngineRunning
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
              )}
            >
              {isEngineRunning ? (
                <>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                  <span>Running</span>
                  <PauseIcon className="h-4 w-4" />
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  <span>Stopped</span>
                  <PlayIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            title="Settings"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{activeRules}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/20">
              <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Events</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{pendingEvents}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
              <BoltIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Triggered</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {totalTriggered}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
              <CheckCircleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {avgAccuracy.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Engine Settings
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-Approve Threshold
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={autoApproveThreshold}
                className="w-full"
                title="Auto-approve threshold"
                aria-label="Auto-approve threshold"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>50%</span>
                <span>{autoApproveThreshold}%</span>
                <span>100%</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Evaluation Interval
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                title="Evaluation interval"
                aria-label="Evaluation interval"
              >
                <option>30 seconds</option>
                <option>1 minute</option>
                <option>5 minutes</option>
                <option>15 minutes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {['events', 'rules', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={cn(
                'border-b-2 px-1 py-2 text-sm font-medium capitalize transition-colors',
                selectedTab === tab
                  ? 'border-nova-500 text-nova-600 dark:text-nova-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300',
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Events Tab */}
      {selectedTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Escalation Events
              </h3>
              <button
                onClick={() => {
                  // Trigger events refresh
                  setEvents([...events]);
                }}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                title="Refresh events"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {events.length} total events
            </div>
          </div>

          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      {getStatusIcon(event.status)}
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {event.ticketTitle}
                      </h4>
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1',
                          getPriorityColor(event.priority),
                        )}
                      >
                        {event.priority === 'critical' && (
                          <ExclamationTriangleIcon className="h-3 w-3" />
                        )}
                        {event.priority.toUpperCase()}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        {event.confidence}% confidence
                      </span>
                    </div>

                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Rule:</strong> {event.ruleName} • <strong>Reason:</strong>{' '}
                      {event.reason}
                    </p>

                    <div className="bg-nova-50 dark:bg-nova-900/10 mb-3 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <InformationCircleIcon className="text-nova-600 dark:text-nova-400 mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <span className="text-nova-700 dark:text-nova-300 text-sm font-medium">
                            AI Recommendation:
                          </span>
                          <span className="text-nova-600 dark:text-nova-400 ml-2 text-sm flex items-center gap-1">
                            {event.recommendation.toLowerCase().includes('team') && (
                              <UserGroupIcon className="h-3 w-3" />
                            )}
                            {event.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Ticket: {event.ticketId}</span>
                        <span>Triggered: {event.triggeredAt.toLocaleTimeString()}</span>
                        {event.scheduledFor && (
                          <span>Scheduled: {event.scheduledFor.toLocaleTimeString()}</span>
                        )}
                        {event.reviewer && <span>Reviewer: {event.reviewer}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Customer:</span>
                        {getImpactBadge(event.customerImpact)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">Business:</span>
                        {getImpactBadge(event.businessImpact)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {event.status === 'pending' && (
                    <div className="ml-4 flex items-center gap-2">
                      <button
                        onClick={() => handleEventAction(event.id, 'approve')}
                        className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleEventAction(event.id, 'delay')}
                        className="rounded-lg bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                      >
                        Delay
                      </button>
                      <button
                        onClick={() => handleEventAction(event.id, 'cancel')}
                        className="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Escalation Rules
            </h3>
            <button className="bg-nova-600 hover:bg-nova-700 rounded-lg px-4 py-2 text-white transition-colors">
              Create Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => handleRuleToggle(rule.id, e.target.checked)}
                          className="text-nova-600 focus:ring-nova-500 rounded border-gray-300"
                          title={`Toggle ${rule.name}`}
                          aria-label={`Toggle ${rule.name}`}
                        />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs font-medium',
                          getPriorityColor(rule.priority),
                        )}
                      >
                        {rule.priority.toUpperCase()}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        {rule.accuracy}% accuracy
                      </span>
                    </div>

                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {rule.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Triggered: {rule.triggeredCount} times</span>
                        {rule.lastTriggered && (
                          <span>Last: {rule.lastTriggered.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRuleEdit?.(rule)}
                          className="text-nova-700 bg-nova-100 dark:bg-nova-900/20 dark:text-nova-400 hover:bg-nova-200 dark:hover:bg-nova-900/30 rounded-lg px-3 py-1 text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Escalation Analytics
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 font-medium text-gray-900 dark:text-white">Rule Performance</h4>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{rule.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="bg-nova-600 h-2 rounded-full transition-all"
                          style={{ width: `${rule.accuracy}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {rule.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 font-medium text-gray-900 dark:text-white">Recent Activity</h4>
              <div className="space-y-3">
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <FlagIcon className="mx-auto mb-2 h-12 w-12" />
                  <p>Analytics coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
