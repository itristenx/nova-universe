import React from 'react';
import {
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  assignedTo?: string;
  errorMessage?: string;
  outputs?: Record<string, any>;
}

interface WorkflowStatusProps {
  workflowId: string;
  workflowName: string;
  status: 'active' | 'completed' | 'failed' | 'paused' | 'cancelled';
  currentStep?: number;
  totalSteps: number;
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  startedBy: string;
  errorMessage?: string;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  className?: string;
}

const getStatusIcon = (status: WorkflowStatusProps['status']) => {
  switch (status) {
    case 'active':
      return <PlayIcon className="h-4 w-4 text-blue-600" />;
    case 'completed':
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
    case 'failed':
      return <XCircleIcon className="h-4 w-4 text-red-600" />;
    case 'paused':
      return <PauseIcon className="h-4 w-4 text-yellow-600" />;
    case 'cancelled':
      return <XCircleIcon className="h-4 w-4 text-gray-600" />;
    default:
      return <ClockIcon className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: WorkflowStatusProps['status']) => {
  switch (status) {
    case 'active':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'paused':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'cancelled':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStepStatusIcon = (status: WorkflowStep['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    case 'failed':
      return <XCircleIcon className="h-5 w-5 text-red-600" />;
    case 'active':
      return <PlayIcon className="h-5 w-5 text-blue-600" />;
    case 'skipped':
      return <ArrowRightIcon className="h-5 w-5 text-gray-400" />;
    default:
      return <ClockIcon className="h-5 w-5 text-gray-400" />;
  }
};

const getStepStatusColor = (status: WorkflowStep['status']) => {
  switch (status) {
    case 'completed':
      return 'border-green-200 bg-green-50';
    case 'failed':
      return 'border-red-200 bg-red-50';
    case 'active':
      return 'border-blue-200 bg-blue-50';
    case 'skipped':
      return 'border-gray-200 bg-gray-50';
    default:
      return 'border-gray-200 bg-white';
  }
};

const formatDuration = (startTime: string, endTime?: string) => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

  if (duration < 60) {
    return `${duration}s`;
  } else if (duration < 3600) {
    return `${Math.floor(duration / 60)}m ${duration % 60}s`;
  } else {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

export function WorkflowStatusBadge({
  status,
  currentStep,
  totalSteps,
  className,
}: Pick<WorkflowStatusProps, 'status' | 'currentStep' | 'totalSteps' | 'className'>) {
  const progress = currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium',
        getStatusColor(status),
        className,
      )}
    >
      {getStatusIcon(status)}
      <span className="capitalize">{status}</span>
      {currentStep && totalSteps && (
        <span className="text-xs opacity-75">
          {currentStep}/{totalSteps} • {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}

export function WorkflowStatusDetails({
  workflowId,
  workflowName,
  status,
  currentStep,
  totalSteps,
  steps,
  startedAt,
  completedAt,
  startedBy,
  errorMessage,
  onPause,
  onResume,
  onCancel,
  className,
}: WorkflowStatusProps) {
  const progress = currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className={cn('space-y-4 rounded-lg border border-gray-200 bg-white p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{workflowName}</h3>
          <p className="text-sm text-gray-500">Workflow ID: {workflowId}</p>
        </div>
        <WorkflowStatusBadge status={status} currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Started by:</span>
          <div className="font-medium">{startedBy}</div>
        </div>
        <div>
          <span className="text-gray-500">Duration:</span>
          <div className="font-medium">{formatDuration(startedAt, completedAt)}</div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <XCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Workflow Error</h4>
              <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(status === 'active' || status === 'paused') && (
        <div className="flex gap-2">
          {status === 'active' && onPause && (
            <button
              onClick={onPause}
              className="rounded-md border border-yellow-300 bg-yellow-100 px-3 py-1.5 text-sm text-yellow-700 hover:bg-yellow-200"
            >
              Pause
            </button>
          )}
          {status === 'paused' && onResume && (
            <button
              onClick={onResume}
              className="rounded-md border border-blue-300 bg-blue-100 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-200"
            >
              Resume
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Workflow Steps</h4>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex items-start gap-3 rounded-md border p-3',
                getStepStatusColor(step.status),
              )}
            >
              <div className="mt-0.5 flex-shrink-0">{getStepStatusIcon(step.status)}</div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-900">
                    {index + 1}. {step.name}
                  </h5>
                  {step.assignedTo && (
                    <span className="text-xs text-gray-500">Assigned to {step.assignedTo}</span>
                  )}
                </div>

                {step.description && (
                  <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                )}

                {step.errorMessage && (
                  <p className="mt-1 text-sm text-red-600">{step.errorMessage}</p>
                )}

                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  {step.startedAt && (
                    <span>Started: {new Date(step.startedAt).toLocaleString()}</span>
                  )}
                  {step.completedAt && (
                    <span>Completed: {new Date(step.completedAt).toLocaleString()}</span>
                  )}
                  {step.startedAt && (
                    <span>Duration: {formatDuration(step.startedAt, step.completedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkflowStatusDetails;
