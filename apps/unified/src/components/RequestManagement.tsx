import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  TagIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useCatalogStore } from '../stores/catalogStore';
import { cn } from '@utils/index';
import type { CatalogRequest } from '../stores/catalogStore';

interface RequestManagementProps {
  className?: string;
}

export default function RequestManagement({ className }: RequestManagementProps) {
  const { requests, items, updateRequest, approveRequest, rejectRequest, createRequest } =
    useCatalogStore();

  const [selectedRequest, setSelectedRequest] = useState<CatalogRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Filter requests based on search and status
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchQuery === '' ||
      request.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requested_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.state === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status counts for filter badges
  const statusCounts = {
    all: requests.length,
    draft: requests.filter((r) => r.state === 'draft').length,
    submitted: requests.filter((r) => r.state === 'submitted').length,
    pending_approval: requests.filter((r) => r.state === 'pending_approval').length,
    approved: requests.filter((r) => r.state === 'approved').length,
    rejected: requests.filter((r) => r.state === 'rejected').length,
    fulfilling: requests.filter((r) => r.state === 'fulfilling').length,
    delivered: requests.filter((r) => r.state === 'delivered').length,
    closed: requests.filter((r) => r.state === 'closed').length,
  };

  const handleApprove = (requestId: string) => {
    approveRequest(requestId, 'current_user');
  };

  const handleReject = (requestId: string, reason: string) => {
    rejectRequest(requestId, 'current_user', reason);
  };

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
                Request Management
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Track and manage service catalog requests with approval workflows
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                <ShoppingCartIcon className="mr-2 h-4 w-4" />
                New Request
              </button>
            </div>
          </div>

          {/* Status Overview */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Total Requests</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {statusCounts.all}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Pending Approval
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {statusCounts.pending_approval}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Approved</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {statusCounts.approved}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowPathIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">In Progress</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {statusCounts.fulfilling}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Rejected</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {statusCounts.rejected}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                aria-label="Filter by status"
              >
                <option value="all">All Status ({statusCounts.all})</option>
                <option value="pending_approval">
                  Pending Approval ({statusCounts.pending_approval})
                </option>
                <option value="approved">Approved ({statusCounts.approved})</option>
                <option value="fulfilling">In Progress ({statusCounts.fulfilling})</option>
                <option value="delivered">Delivered ({statusCounts.delivered})</option>
                <option value="rejected">Rejected ({statusCounts.rejected})</option>
                <option value="closed">Closed ({statusCounts.closed})</option>
              </select>

              <button
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                aria-label="Advanced filters"
              >
                <FunnelIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Request List */}
        <div className="overflow-hidden bg-white shadow sm:rounded-md dark:bg-slate-800">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRequests.map((request) => (
              <RequestListItem
                key={request.id}
                request={request}
                onSelect={() => setSelectedRequest(request)}
                onApprove={() => handleApprove(request.id)}
                onReject={(reason) => handleReject(request.id, reason)}
              />
            ))}
          </ul>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="py-12 text-center">
              <DocumentTextIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-600">No requests found</h3>
              <p className="mb-4 text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'No requests have been created yet'}
              </p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <ShoppingCartIcon className="mr-2 h-4 w-4" />
                Create First Request
              </button>
            </div>
          )}
        </div>

        {/* Request Detail Modal */}
        {selectedRequest && (
          <RequestDetailModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onApprove={() => handleApprove(selectedRequest.id)}
            onReject={(reason) => handleReject(selectedRequest.id, reason)}
            onUpdate={(updates) => updateRequest(selectedRequest.id, updates)}
          />
        )}

        {/* New Request Form Modal */}
        {showRequestForm && (
          <NewRequestModal
            onClose={() => setShowRequestForm(false)}
            items={items}
            onSubmit={(requestData) => {
              createRequest(requestData);
              setShowRequestForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Request List Item Component
interface RequestListItemProps {
  request: CatalogRequest;
  onSelect: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

function RequestListItem({ request, onSelect, onApprove, onReject }: RequestListItemProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'fulfilling':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <ClockIcon className="h-4 w-4" />;
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4" />;
      case 'fulfilling':
        return <ArrowPathIcon className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const handleRejectSubmit = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  return (
    <>
      <li className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {request.number}
                  </h3>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      getStatusColor(request.state),
                    )}
                  >
                    {getStatusIcon(request.state)}
                    <span className="ml-1">{request.state.replace('_', ' ')}</span>
                  </span>
                </div>

                <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  {request.item_name}
                </p>

                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <UserIcon className="mr-1 h-3 w-3" />
                    {request.requested_by}
                  </span>
                  <span className="flex items-center">
                    <BuildingOfficeIcon className="mr-1 h-3 w-3" />
                    {request.department}
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {new Date(request.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <CurrencyDollarIcon className="mr-1 h-3 w-3" />$
                    {request.total_price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {request.state === 'pending_approval' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove();
                    }}
                    className="inline-flex items-center rounded border border-transparent bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                  >
                    <CheckCircleIcon className="mr-1 h-3 w-3" />
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRejectModal(true);
                    }}
                    className="inline-flex items-center rounded border border-transparent bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                  >
                    <XCircleIcon className="mr-1 h-3 w-3" />
                    Reject
                  </button>
                </>
              )}

              <button
                onClick={onSelect}
                className="inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                <EyeIcon className="mr-1 h-3 w-3" />
                View
              </button>
            </div>
          </div>
        </div>
      </li>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Reject Request</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close reject modal"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <p className="mb-4 text-sm text-gray-500">
                Please provide a reason for rejecting this request:
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="Enter rejection reason..."
              />

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim()}
                  className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Request Detail Modal Component
interface RequestDetailModalProps {
  request: CatalogRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onUpdate: (updates: Partial<CatalogRequest>) => void;
}

function RequestDetailModal({
  request,
  onClose,
  onApprove,
  onReject,
  onUpdate,
}: RequestDetailModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectSubmit = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      onClose();
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
      <div className="relative top-10 mx-auto min-h-[80vh] w-full max-w-4xl rounded-md border bg-white p-0 shadow-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
              <p className="text-sm text-gray-500">{request.number}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close request details"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Request Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Request Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Item</dt>
                      <dd className="text-sm text-gray-900">{request.item_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Requested By</dt>
                      <dd className="text-sm text-gray-900">{request.requested_by}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Department</dt>
                      <dd className="text-sm text-gray-900">{request.department}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                      <dd className="text-sm text-gray-900">{request.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Unit Price</dt>
                      <dd className="text-sm text-gray-900">
                        ${request.unit_price.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        ${request.total_price.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Variable Values */}
                {Object.keys(request.variables).length > 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Configuration</h3>
                    <dl className="space-y-3">
                      {Object.entries(request.variables).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm font-medium text-gray-500">{key}</dt>
                          <dd className="text-sm text-gray-900">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>

              {/* Status and Timeline */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Status & Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Request Created</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {request.submitted_at && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <ArrowPathIcon className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Request Submitted</p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.submitted_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {request.approved_at && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Request Approved</p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.approved_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Comments</h3>
                  <div className="space-y-3">
                    {request.comments.length > 0 ? (
                      request.comments.map((comment) => (
                        <div key={comment.id} className="rounded-lg bg-gray-50 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No comments yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          {request.state === 'pending_approval' && (
            <div className="flex justify-end space-x-3 border-t border-gray-200 p-6">
              {showRejectForm ? (
                <div className="flex flex-1 space-x-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                    placeholder="Rejection reason..."
                    rows={2}
                  />
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    disabled={!rejectReason.trim()}
                    className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      onApprove();
                      onClose();
                    }}
                    className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Approve Request
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// New Request Modal Component
interface NewRequestModalProps {
  onClose: () => void;
  items: any[];
  onSubmit: (requestData: any) => void;
}

function NewRequestModal({ onClose, items, onSubmit }: NewRequestModalProps) {
  const [formData, setFormData] = useState({
    item_id: '',
    requested_by: 'current_user',
    requested_for: '',
    department: '',
    cost_center: '',
    quantity: 1,
    budget_code: '',
    project_code: '',
    delivery_instructions: '',
    variables: {},
  });

  const selectedItem = items.find((item) => item.id === formData.item_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) return;

    const requestData = {
      ...formData,
      item_name: selectedItem.name,
      unit_price: selectedItem.price,
      total_price: selectedItem.price * formData.quantity,
      recurring_cost: selectedItem.recurring_price
        ? selectedItem.recurring_price * formData.quantity
        : undefined,
      currency: selectedItem.currency,
      billing_department: formData.department,
      billing_contact: formData.requested_by,
      charge_to_department: formData.department,
      state: 'draft',
      approval_status: 'not_required',
    };

    onSubmit(requestData);
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
      <div className="relative top-10 mx-auto w-full max-w-2xl rounded-md border bg-white p-0 shadow-lg">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">New Service Request</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close new request form"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="item_id" className="block text-sm font-medium text-gray-700">
                  Service Item *
                </label>
                <select
                  id="item_id"
                  value={formData.item_id}
                  onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select an item</option>
                  {items
                    .filter((item) => item.status === 'active')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ${item.price}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department *
                </label>
                <input
                  type="text"
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="cost_center" className="block text-sm font-medium text-gray-700">
                  Cost Center
                </label>
                <input
                  type="text"
                  id="cost_center"
                  value={formData.cost_center}
                  onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="budget_code" className="block text-sm font-medium text-gray-700">
                  Budget Code
                </label>
                <input
                  type="text"
                  id="budget_code"
                  value={formData.budget_code}
                  onChange={(e) => setFormData({ ...formData, budget_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="project_code" className="block text-sm font-medium text-gray-700">
                  Project Code
                </label>
                <input
                  type="text"
                  id="project_code"
                  value={formData.project_code}
                  onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="delivery_instructions"
                className="block text-sm font-medium text-gray-700"
              >
                Delivery Instructions
              </label>
              <textarea
                id="delivery_instructions"
                value={formData.delivery_instructions}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_instructions: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Any special delivery or configuration instructions..."
              />
            </div>

            {selectedItem && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900">Order Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Item:</span>
                    <span>{selectedItem.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unit Price:</span>
                    <span>${selectedItem.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-medium">
                    <span>Total:</span>
                    <span>${(selectedItem.price * formData.quantity).toLocaleString()}</span>
                  </div>
                  {selectedItem.recurring_price && (
                    <div className="flex justify-between text-gray-600">
                      <span>Monthly Recurring:</span>
                      <span>
                        ${(selectedItem.recurring_price * formData.quantity).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.item_id || !formData.department}
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
