import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useRBACStore } from '../stores/rbacStore';
import { ApprovalInstance, ApprovalFlow, ApprovalStep, ApprovalStepInstance } from '../types/rbac';

interface ApprovalWorkflowEngineProps {
  className?: string;
  showMyApprovals?: boolean;
  recordId?: string;
  recordTable?: string;
}

export default function ApprovalWorkflowEngine({
  className = '',
  showMyApprovals = false,
  recordId,
  recordTable,
}: ApprovalWorkflowEngineProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'flows'>('pending');
  const [selectedInstance, setSelectedInstance] = useState<ApprovalInstance | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    currentUser,
    approvalInstances,
    approvalFlows,
    getMyApprovals,
    getApprovalHistory,
    approveRequest,
    rejectRequest,
    delegateApproval,
    escalateApproval,
    cancelApproval,
    checkPermission,
  } = useRBACStore();

  // Get relevant approval instances
  const myApprovals = showMyApprovals ? getMyApprovals() : [];
  const historyApprovals = recordId ? getApprovalHistory(recordId) : getApprovalHistory();
  const pendingApprovals = approvalInstances.filter(
    (instance) => instance.status === 'pending' || instance.status === 'escalated',
  );

  const handleApprove = (instanceId: string, stepId: string) => {
    if (!selectedInstance) return;

    approveRequest(instanceId, stepId, approvalComment);
    setApprovalComment('');
    setShowApprovalModal(false);
    setSelectedInstance(null);
  };

  const handleReject = (instanceId: string, stepId: string) => {
    if (!selectedInstance) return;

    rejectRequest(instanceId, stepId, rejectReason);
    setRejectReason('');
    setShowRejectModal(false);
    setSelectedInstance(null);
  };

  const getCurrentStep = (instance: ApprovalInstance): ApprovalStepInstance | null => {
    return instance.steps.find((step) => step.status === 'pending') || null;
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'escalated':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderApprovalInstance = (instance: ApprovalInstance) => {
    const currentStep = getCurrentStep(instance);
    const flow = approvalFlows.find((f) => f.id === instance.flow_id);

    return (
      <div key={instance.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{flow?.name || 'Unknown Flow'}</h3>
            <p className="text-sm text-gray-600">
              {instance.record_table} - {instance.record_id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(instance.status)}`}
            >
              {instance.status}
            </span>
            {instance.escalation_count > 0 && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                Escalated {instance.escalation_count}x
              </span>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {instance.steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-shrink-0 flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      step.status === 'approved'
                        ? 'border-green-500 bg-green-100'
                        : step.status === 'rejected'
                          ? 'border-red-500 bg-red-100'
                          : step.status === 'pending'
                            ? 'border-yellow-500 bg-yellow-100'
                            : 'border-gray-300 bg-gray-100'
                    }`}
                  >
                    {getStepStatusIcon(step.status)}
                  </div>
                  <span className="mt-1 max-w-20 truncate text-center text-xs text-gray-500">
                    Step {step.order + 1}
                  </span>
                  {step.approver_name && (
                    <span className="max-w-20 truncate text-center text-xs text-gray-400">
                      {step.approver_name}
                    </span>
                  )}
                </div>
                {index < instance.steps.length - 1 && (
                  <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Current Step Actions */}
        {currentStep && instance.status === 'pending' && (
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Current Step:{' '}
                  {flow?.steps.find((s) => s.id === currentStep.step_id)?.name ||
                    `Step ${currentStep.order + 1}`}
                </h4>
                <p className="text-sm text-gray-600">
                  Waiting for approval from: {currentStep.approver_name || 'Pending assignment'}
                </p>
              </div>

              {/* Action buttons for current user */}
              {currentUser &&
                (currentStep.approver_id === currentUser.id ||
                  checkPermission('approvals:admin')) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedInstance(instance);
                        setShowApprovalModal(true);
                      }}
                      className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-green-700"
                    >
                      <CheckCircleIcon className="mr-1 h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInstance(instance);
                        setShowRejectModal(true);
                      }}
                      className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-red-700"
                    >
                      <XCircleIcon className="mr-1 h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Audit Trail */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-900">Activity History</h4>
          <div className="space-y-3">
            {instance.audit_trail.slice(0, 3).map((audit) => (
              <div key={audit.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{audit.user_name}</span>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                        audit.action === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : audit.action === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : audit.action === 'escalated'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {audit.action}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{audit.details}</p>
                  <p className="text-xs text-gray-500">{audit.timestamp.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {instance.audit_trail.length > 3 && (
              <button
                onClick={() => setSelectedInstance(instance)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all {instance.audit_trail.length} activities
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPendingTab = () => {
    const approvalsToShow = showMyApprovals ? myApprovals : pendingApprovals;

    return (
      <div className="space-y-6">
        {approvalsToShow.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {showMyApprovals ? 'No pending approvals' : 'No pending requests'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {showMyApprovals
                ? 'You have no approvals waiting for your action.'
                : 'There are no pending approval requests in the system.'}
            </p>
          </div>
        ) : (
          approvalsToShow.map(renderApprovalInstance)
        )}
      </div>
    );
  };

  const renderHistoryTab = () => {
    return (
      <div className="space-y-6">
        {historyApprovals.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No approval history</h3>
            <p className="mt-1 text-sm text-gray-500">No completed approval processes found.</p>
          </div>
        ) : (
          historyApprovals.map(renderApprovalInstance)
        )}
      </div>
    );
  };

  const renderFlowsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Approval Flows</h3>
          {checkPermission('approvals:create') && (
            <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Flow
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {approvalFlows.map((flow) => (
            <div key={flow.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{flow.name}</h4>
                  <p className="text-sm text-gray-600">{flow.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      flow.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {flow.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Table:</span>
                  <p className="text-gray-900">{flow.trigger_table}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Steps:</span>
                  <p className="text-gray-900">{flow.steps.length}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                {checkPermission('approvals:read') && (
                  <button className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <EyeIcon className="mr-2 h-4 w-4" />
                    View
                  </button>
                )}
                {checkPermission('approvals:update') && (
                  <button className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="py-12 text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
        <p className="mt-1 text-sm text-gray-500">Please log in to view approval workflows.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Workflows</h2>
          <p className="mt-1 text-sm text-gray-600">Manage approval processes and requests</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {showMyApprovals ? 'My Approvals' : 'Pending Requests'}
            {(showMyApprovals ? myApprovals : pendingApprovals).length > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                {(showMyApprovals ? myApprovals : pendingApprovals).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('flows')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'flows'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Approval Flows
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'pending' && renderPendingTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'flows' && renderFlowsTab()}
        </motion.div>
      </AnimatePresence>

      {/* Approval Modal */}
      {showApprovalModal && selectedInstance && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="mb-4 flex items-center">
                <CheckCircleIcon className="mr-2 h-6 w-6 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Approve Request</h3>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Comments (optional)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  rows={3}
                  placeholder="Add any comments about your approval..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const currentStep = getCurrentStep(selectedInstance);
                    if (currentStep) {
                      handleApprove(selectedInstance.id, currentStep.id);
                    }
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalComment('');
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedInstance && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="mb-4 flex items-center">
                <XCircleIcon className="mr-2 h-6 w-6 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900">Reject Request</h3>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Reason for rejection *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const currentStep = getCurrentStep(selectedInstance);
                    if (currentStep && rejectReason.trim()) {
                      handleReject(selectedInstance.id, currentStep.id);
                    }
                  }}
                  disabled={!rejectReason.trim()}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:bg-gray-300"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
