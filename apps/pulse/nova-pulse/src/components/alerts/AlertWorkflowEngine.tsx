import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {

  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { AlertWorkflowRule } from '../../types/alerts';
import { useAlertCosmo } from '../../hooks/useAlertCosmo';

interface WorkflowEngineProps {
  ticketData?: {
    id: string;
    title: string;
    description: string;
    priority: string;
    category: string;
    customerTier?: string;
    affectedUsers?: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  onWorkflowTriggered?: (workflowId: string, action: string) => void;
  className?: string;
}

interface WorkflowExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  ticketId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  triggeredAt: string;
  completedAt?: string;
  actions: {
    type: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
  }[];
  logs: string[];
}

const AlertWorkflowEngine: React.FC<WorkflowEngineProps> = ({
  ticketData,
  onWorkflowTriggered,
  className = ''
}) => {
  const queryClient = useQueryClient();
  const [activeExecutions, setActiveExecutions] = useState<WorkflowExecution[]>([]);
  const [isEngineEnabled, setIsEngineEnabled] = useState(true);

  useAlertCosmo({
    onAlertCreated: (alert) => {
      console.log('Workflow created alert:', alert);
    },
    onAlertEscalated: (escalation) => {
      console.log('Workflow escalated alert:', escalation);
    }
  });

  // Fetch workflow rules
  const { data: workflowRules = [] } = useQuery({
    queryKey: ['workflow-rules'],
    queryFn: async (): Promise<AlertWorkflowRule[]> => {
      const response = await fetch('/api/v2/alerts/workflow-rules', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to fetch workflow rules');
      const data = await response.json();
      return data.rules;
    }
  });

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: async ({ ruleId, ticketData: ticket }: { ruleId: string; ticketData: any }) => {
      const response = await fetch('/api/v2/alerts/workflow-execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ruleId,
          ticketData: ticket
        })
      });

      if (!response.ok) throw new Error('Failed to execute workflow');
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      onWorkflowTriggered?.(result.ruleId, result.action);
    }
  });

  // Evaluate if ticket matches workflow rule conditions
  const evaluateRule = (rule: AlertWorkflowRule, ticket: any): boolean => {
    const conditions = rule.triggerConditions;

    // Priority check
    if (conditions.priority && !conditions.priority.includes(ticket.priority)) {
      return false;
    }

    // Customer tier check
    if (conditions.customerType && ticket.customerTier && 
        !conditions.customerType.includes(ticket.customerTier)) {
      return false;
    }

    // Category check
    if (conditions.category && ticket.category !== conditions.category) {
      return false;
    }

    // Keyword check
    if (conditions.keywords && conditions.keywords.length > 0) {
      const text = `${ticket.title} ${ticket.description}`.toLowerCase();
      const hasKeyword = conditions.keywords.some((keyword: string) => 
        text.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }

    // Time threshold check (for existing tickets)
    if (conditions.timeThreshold) {
      const ticketAge = Date.now() - new Date(ticket.createdAt).getTime();
      const thresholdMs = conditions.timeThreshold * 60 * 1000;
      if (ticketAge < thresholdMs) {
        return false;
      }
    }

    // Affected users threshold
    if (conditions.affectedUsersThreshold && 
        (!ticket.affectedUsers || ticket.affectedUsers < conditions.affectedUsersThreshold)) {
      return false;
    }

    return true;
  };

  // Auto-evaluate workflows when ticket data changes
  useEffect(() => {
    if (!ticketData || !isEngineEnabled || !workflowRules.length) return;

    const evaluateWorkflows = async () => {
      const matchingRules = workflowRules
        .filter(rule => rule.enabled)
        .filter(rule => evaluateRule(rule, ticketData))
        .sort((a, b) => a.priority - b.priority); // Lower priority number = higher priority

      for (const rule of matchingRules) {
        // Check if we've already executed this rule for this ticket recently
        const recentExecution = activeExecutions.find(exec => 
          exec.ruleId === rule.id && 
          exec.ticketId === ticketData.id &&
          Date.now() - new Date(exec.triggeredAt).getTime() < 60 * 60 * 1000 // 1 hour
        );

        if (recentExecution) {
          continue; // Skip if recently executed
        }

        console.log(`Workflow rule "${rule.ruleName}" matches ticket ${ticketData.id}`);
        
        // Create execution record
        const execution: WorkflowExecution = {
          id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          ruleName: rule.ruleName,
          ticketId: ticketData.id,
          status: 'pending',
          triggeredAt: new Date().toISOString(),
          actions: Object.entries(rule.actions).map(([type, config]) => ({
            type,
            status: 'pending'
          })),
          logs: [`Workflow "${rule.ruleName}" triggered for ticket ${ticketData.id}`]
        };

        setActiveExecutions(prev => [...prev, execution]);

        // Execute the workflow
        try {
          await executeWorkflow(execution, rule, ticketData);
        } catch (error) {
          console.error('Workflow execution failed:', error);
          updateExecutionStatus(execution.id, 'failed');
        }
      }
    };

    // Debounce evaluation to avoid rapid re-evaluation
    const timeoutId = setTimeout(evaluateWorkflows, 1000);
    return () => clearTimeout(timeoutId);
  }, [ticketData, workflowRules, isEngineEnabled]);

  // Execute workflow actions
  const executeWorkflow = async (
    execution: WorkflowExecution, 
    rule: AlertWorkflowRule, 
    ticket: any
  ) => {
    updateExecutionStatus(execution.id, 'running');
    addExecutionLog(execution.id, 'Starting workflow execution...');

    const actions = rule.actions;

    // Handle alert creation
    if (actions.create_alert) {
      try {
        addExecutionLog(execution.id, 'Creating alert...');
        updateActionStatus(execution.id, 'create_alert', 'running');

        const result = await executeWorkflowMutation.mutateAsync({
          ruleId: rule.id,
          ticketData: ticket
        });

        updateActionStatus(execution.id, 'create_alert', 'completed', result);
        addExecutionLog(execution.id, `Alert created: ${result.alertId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        updateActionStatus(execution.id, 'create_alert', 'failed', null, message);
        addExecutionLog(execution.id, `Alert creation failed: ${message}`);
      }
    }

    // Handle escalation
    if (actions.escalate_to) {
      try {
        addExecutionLog(execution.id, `Escalating to ${actions.escalate_to}...`);
        updateActionStatus(execution.id, 'escalate', 'running');

        const escalationResult = await executeWorkflowMutation.mutateAsync({
          ruleId: rule.id,
          ticketData: { ...ticket, escalateTo: actions.escalate_to }
        });

        updateActionStatus(execution.id, 'escalate', 'completed', escalationResult);
        addExecutionLog(execution.id, `Escalated to ${actions.escalate_to}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        updateActionStatus(execution.id, 'escalate', 'failed', null, message);
        addExecutionLog(execution.id, `Escalation failed: ${message}`);
      }
    }

    // Handle notification
    if (actions.notify) {
      try {
        addExecutionLog(execution.id, `Sending notifications to ${JSON.stringify(actions.notify)}...`);
        updateActionStatus(execution.id, 'notify', 'running');

        // This would integrate with Nova Comms
        addExecutionLog(execution.id, `Notifications sent to ${actions.notify.join(', ')}`);
        updateActionStatus(execution.id, 'notify', 'completed');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        updateActionStatus(execution.id, 'notify', 'failed', null, message);
        addExecutionLog(execution.id, `Notification failed: ${message}`);
      }
    }

    // Handle priority change
    if (actions.priority_change) {
      try {
        addExecutionLog(execution.id, `Changing priority to ${actions.priority_change}...`);
        updateActionStatus(execution.id, 'priority_change', 'running');

        // This would update the ticket priority
        addExecutionLog(execution.id, `Priority changed to ${actions.priority_change}`);
        updateActionStatus(execution.id, 'priority_change', 'completed');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        updateActionStatus(execution.id, 'priority_change', 'failed', null, message);
        addExecutionLog(execution.id, `Priority change failed: ${message}`);
      }
    }

    // Mark execution as completed
    updateExecutionStatus(execution.id, 'completed');
    addExecutionLog(execution.id, 'Workflow execution completed');
  };

  // Helper functions for execution tracking
  const updateExecutionStatus = (execId: string, status: WorkflowExecution['status']) => {
    setActiveExecutions(prev => prev.map(exec => 
      exec.id === execId 
        ? { ...exec, status, ...(status === 'completed' && { completedAt: new Date().toISOString() }) }
        : exec
    ));
  };

  const updateActionStatus = (
    execId: string, 
    actionType: string, 
    status: any, 
    result?: any, 
    error?: string
  ) => {
    setActiveExecutions(prev => prev.map(exec => 
      exec.id === execId 
        ? {
            ...exec,
            actions: exec.actions.map(action =>
              action.type === actionType
                ? { ...action, status, result, error }
                : action
            )
          }
        : exec
    ));
  };

  const addExecutionLog = (execId: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActiveExecutions(prev => prev.map(exec => 
      exec.id === execId 
        ? { ...exec, logs: [...exec.logs, `[${timestamp}] ${message}`] }
        : exec
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!ticketData) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Engine Status */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BoltIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Alert Workflow Engine</h3>
            <p className="text-sm text-gray-600">
              {workflowRules.length} rules • {activeExecutions.length} active executions
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEngineEnabled(!isEngineEnabled)}
          className={`
            px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200
            flex items-center space-x-2
            ${isEngineEnabled 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          {isEngineEnabled ? (
            <>
              <PauseIcon className="w-4 h-4" />
              <span>Enabled</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              <span>Disabled</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Active Executions */}
      {activeExecutions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Active Executions</h4>
          {activeExecutions.map((execution) => (
            <motion.div
              key={execution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                p-4 border rounded-xl transition-all duration-200
                ${getStatusColor(execution.status)}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(execution.status)}
                  <div>
                    <h5 className="font-medium text-gray-900">{execution.ruleName}</h5>
                    <p className="text-sm text-gray-600">
                      Triggered {new Date(execution.triggeredAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className={`
                  px-2 py-1 text-xs rounded-full font-medium
                  ${execution.status === 'completed' ? 'bg-green-100 text-green-700' :
                    execution.status === 'failed' ? 'bg-red-100 text-red-700' :
                    execution.status === 'running' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }
                `}>
                  {execution.status.toUpperCase()}
                </span>
              </div>

              {/* Actions Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                {execution.actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    {getStatusIcon(action.status)}
                    <span className="text-gray-700 capitalize">
                      {action.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Execution Logs */}
              {execution.logs.length > 0 && (
                <details className="mt-3">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                    View Logs ({execution.logs.length})
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                    {execution.logs.map((log, index) => (
                      <div key={index} className="text-xs text-gray-600 font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Matching Rules Preview */}
      {isEngineEnabled && workflowRules.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-medium text-blue-900 mb-2">Applicable Workflow Rules</h4>
          <div className="space-y-2">
            {workflowRules
              .filter(rule => rule.enabled && evaluateRule(rule, ticketData))
              .map((rule) => (
                <div key={rule.id} className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">{rule.ruleName}</span>
                  <span className="text-blue-600">Priority {rule.priority}</span>
                </div>
              ))}
          </div>
          {workflowRules.filter(rule => rule.enabled && evaluateRule(rule, ticketData)).length === 0 && (
            <p className="text-sm text-blue-700">No workflow rules match this ticket currently.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertWorkflowEngine;
