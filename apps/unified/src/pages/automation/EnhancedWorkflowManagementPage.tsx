/**
 * Enhanced Apple-style Workflow Management Interface
 * Visual workflow builder with drag-and-drop functionality and Apple design
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  UserIcon,
  BoltIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from '@components/common/GlassCard';
import { AppleButton } from '@components/common/AppleButton';
import { StatusBadge, PriorityBadge } from '@components/common/AppleBadges';
import { cn, cardHoverEffect, formatRelativeTime } from '@utils/apple-utils';
import { fadeInAnimation, springAnimation } from '@utils/apple-utils';

// Workflow step interface
interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'task' | 'condition' | 'notification' | 'integration';
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
  assignee?: {
    id: string;
    name: string;
    role: string;
  };
  duration?: number;
  completedAt?: Date;
  position: { x: number; y: number };
}

// Workflow interface
interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'approval' | 'automation' | 'escalation' | 'onboarding' | 'maintenance';
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  lastRun?: Date;
  executions: number;
  successRate: number;
  avgDuration: string;
  steps: WorkflowStep[];
}

// Mock workflows
const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'New User Onboarding',
    description: 'Automated workflow for setting up new employee accounts and access',
    category: 'onboarding',
    status: 'active',
    trigger: 'User Creation Event',
    priority: 'high',
    createdBy: { id: '1', name: 'John Smith' },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    executions: 47,
    successRate: 95.7,
    avgDuration: '2.3h',
    steps: [
      {
        id: 'step1',
        name: 'Manager Approval',
        type: 'approval',
        status: 'completed',
        assignee: { id: '2', name: 'Sarah Johnson', role: 'Manager' },
        duration: 45,
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        position: { x: 100, y: 50 }
      },
      {
        id: 'step2',
        name: 'Create AD Account',
        type: 'integration',
        status: 'completed',
        duration: 5,
        completedAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
        position: { x: 300, y: 50 }
      },
      {
        id: 'step3',
        name: 'Send Welcome Email',
        type: 'notification',
        status: 'active',
        position: { x: 500, y: 50 }
      }
    ]
  },
  {
    id: '2',
    name: 'Incident Escalation',
    description: 'Automatic escalation for critical incidents based on SLA thresholds',
    category: 'escalation',
    status: 'active',
    trigger: 'SLA Breach Warning',
    priority: 'critical',
    createdBy: { id: '2', name: 'Mike Wilson' },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    lastRun: new Date(Date.now() - 30 * 60 * 1000),
    executions: 23,
    successRate: 100,
    avgDuration: '15m',
    steps: []
  },
  {
    id: '3',
    name: 'Software License Approval',
    description: 'Multi-stage approval process for software license requests',
    category: 'approval',
    status: 'active',
    trigger: 'License Request Submission',
    priority: 'normal',
    createdBy: { id: '3', name: 'Lisa Chen' },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    executions: 156,
    successRate: 89.1,
    avgDuration: '3.2d',
    steps: []
  }
];

export default function EnhancedWorkflowManagementPage() {
  const navigate = useNavigate();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter workflows
  const filteredWorkflows = mockWorkflows.filter(workflow => {
    const matchesCategory = selectedCategory === 'all' || workflow.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || workflow.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-800 bg-green-100';
      case 'paused': return 'text-orange-800 bg-orange-100';
      case 'draft': return 'text-gray-800 bg-gray-100';
      case 'archived': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'approval': return 'bg-blue-100 text-blue-800';
      case 'automation': return 'bg-purple-100 text-purple-800';
      case 'escalation': return 'bg-red-100 text-red-800';
      case 'onboarding': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'approval': return <CheckCircleIcon className="h-5 w-5" />;
      case 'task': return <BoltIcon className="h-5 w-5" />;
      case 'condition': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'notification': return <DocumentTextIcon className="h-5 w-5" />;
      case 'integration': return <CogIcon className="h-5 w-5" />;
      default: return <CircleIcon className="h-5 w-5" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'skipped': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8" {...fadeInAnimation()}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Workflow Management
              </h1>
              <p className="text-xl text-gray-600">
                Design, monitor, and optimize business process automation
              </p>
            </div>

            <div className="flex gap-3">
              <AppleButton
                variant="secondary"
                leftIcon={<EyeIcon className="h-5 w-5" />}
              >
                View Templates
              </AppleButton>
              
              <AppleButton
                onClick={() => navigate('/workflows/builder')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create Workflow
              </AppleButton>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" {...fadeInAnimation(0.1)}>
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{mockWorkflows.length}</div>
              <div className="text-sm font-medium text-gray-600">Total Workflows</div>
            </div>
          </GlassCard>
          
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {mockWorkflows.filter(w => w.status === 'active').length}
              </div>
              <div className="text-sm font-medium text-gray-600">Active</div>
            </div>
          </GlassCard>
          
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {mockWorkflows.reduce((sum, w) => sum + w.executions, 0)}
              </div>
              <div className="text-sm font-medium text-gray-600">Total Executions</div>
            </div>
          </GlassCard>
          
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {(mockWorkflows.reduce((sum, w) => sum + w.successRate, 0) / mockWorkflows.length).toFixed(1)}%
              </div>
              <div className="text-sm font-medium text-gray-600">Avg Success Rate</div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflows List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <GlassCard intensity="medium" hover={false} padding="md" className="mb-6" {...fadeInAnimation(0.2)}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 bg-white/90 backdrop-blur-sm',
                      'border border-gray-200 rounded-xl',
                      'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      'transition-all duration-200 ease-out'
                    )}
                  >
                    <option value="all">All Categories</option>
                    <option value="approval">Approval Workflows</option>
                    <option value="automation">Automation</option>
                    <option value="escalation">Escalation</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="flex-1">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 bg-white/90 backdrop-blur-sm',
                      'border border-gray-200 rounded-xl',
                      'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      'transition-all duration-200 ease-out'
                    )}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </GlassCard>

            {/* Workflows List */}
            <div className="space-y-4" {...fadeInAnimation(0.3)}>
              {filteredWorkflows.map((workflow, index) => (
                <GlassCard
                  key={workflow.id}
                  intensity="medium"
                  hover="medium"
                  padding="lg"
                  className={cn(
                    cardHoverEffect('medium'),
                    'cursor-pointer',
                    selectedWorkflow?.id === workflow.id && 'ring-2 ring-blue-500 bg-blue-50/50'
                  )}
                  onClick={() => setSelectedWorkflow(workflow)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <StatusBadge status={workflow.status} size="sm" />
                        <PriorityBadge priority={workflow.priority} size="sm" />
                        <span className={cn(
                          'px-2 py-1 rounded-lg text-xs font-medium',
                          getCategoryColor(workflow.category)
                        )}>
                          {workflow.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                        {workflow.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {workflow.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <BoltIcon className="h-4 w-4" />
                          <span>Trigger: {workflow.trigger}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>Avg: {workflow.avgDuration}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          <span>{workflow.createdBy.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{workflow.executions}</div>
                        <div className="text-xs text-gray-500">executions</div>
                      </div>
                      
                      <div className="text-right">
                        <div className={cn(
                          'text-sm font-semibold',
                          workflow.successRate >= 95 ? 'text-green-600' :
                          workflow.successRate >= 85 ? 'text-orange-600' : 'text-red-600'
                        )}>
                          {workflow.successRate}%
                        </div>
                        <div className="text-xs text-gray-500">success</div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <AppleButton
                          size="sm"
                          variant="ghost"
                          leftIcon={workflow.status === 'active' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {workflow.status === 'active' ? 'Pause' : 'Start'}
                        </AppleButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Workflow Details Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <GlassCard intensity="medium" hover={false} padding="lg" {...fadeInAnimation(0.4)}>
                {selectedWorkflow ? (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {selectedWorkflow.name}
                    </h3>

                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
                        <div className="text-gray-900">{selectedWorkflow.description}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Trigger</div>
                        <div className="text-gray-900">{selectedWorkflow.trigger}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Executions</div>
                          <div className="text-xl font-bold text-blue-600">{selectedWorkflow.executions}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Success Rate</div>
                          <div className="text-xl font-bold text-green-600">{selectedWorkflow.successRate}%</div>
                        </div>
                      </div>

                      {/* Steps Preview */}
                      {selectedWorkflow.steps.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-3">Current Steps</div>
                          <div className="space-y-2">
                            {selectedWorkflow.steps.map((step, index) => (
                              <div key={step.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                                <div className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center',
                                  getStepStatusColor(step.status)
                                )}>
                                  {getStepIcon(step.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm">{step.name}</div>
                                  <div className="text-xs text-gray-500 capitalize">{step.type}</div>
                                </div>

                                {step.assignee && (
                                  <div className="text-xs text-gray-600">
                                    {step.assignee.name}
                                  </div>
                                )}

                                {index < selectedWorkflow.steps.length - 1 && (
                                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="space-y-2">
                          <AppleButton
                            size="sm"
                            className="w-full"
                            onClick={() => navigate(`/workflows/${selectedWorkflow.id}/builder`)}
                          >
                            Edit Workflow
                          </AppleButton>
                          
                          <AppleButton
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            onClick={() => navigate(`/workflows/${selectedWorkflow.id}/analytics`)}
                          >
                            View Analytics
                          </AppleButton>

                          <AppleButton
                            size="sm"
                            variant="ghost"
                            className="w-full"
                            leftIcon={selectedWorkflow.status === 'active' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                          >
                            {selectedWorkflow.status === 'active' ? 'Pause Workflow' : 'Start Workflow'}
                          </AppleButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <BoltIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-gray-600">
                      Select a workflow to view details
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}