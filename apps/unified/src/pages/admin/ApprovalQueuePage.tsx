import { useState, useEffect } from 'react';
import { changesAPI, type ChangeRequest } from '@services/backend-api-client';
import { cn } from '@utils/index';
import toast from 'react-hot-toast';

// Icons
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export const ApprovalQueuePage: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<ChangeRequest[]>([]);
  const [allApprovals, setAllApprovals] = useState<ChangeRequest[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-priority' | 'high-risk'>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Stats
  const stats = {
    total: allApprovals.length,
    pending: pendingApprovals.length,
    highPriority: pendingApprovals.filter(a => a.priority === 'HIGH' || a.priority === 'CRITICAL').length,
    highRisk: pendingApprovals.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'VERY_HIGH').length,
  };

  // Load approvals
  const loadApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all changes that need approval (ASSESSMENT state)
      const [pending, all] = await Promise.all([
        changesAPI.list({ state: 'ASSESSMENT' }),
        changesAPI.list({ state: 'ASSESSMENT,AUTHORIZATION' }),
      ]);
      
      setPendingApprovals(pending);
      setAllApprovals(all);
    } catch (err: any) {
      setError(err.message || 'Failed to load approvals');
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadApprovals, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle approve
  const handleApprove = async (id: string, notes?: string) => {
    try {
      await changesAPI.approve(id, notes);
      toast.success('Change request approved');
      loadApprovals();
      setShowDetailsModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve change');
    }
  };

  // Handle reject
  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await changesAPI.reject(id, reason);
      toast.success('Change request rejected');
      loadApprovals();
      setShowDetailsModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject change');
    }
  };

  // Get filtered approvals
  const getFilteredApprovals = () => {
    let filtered = pendingApprovals;
    
    if (activeFilter === 'high-priority') {
      filtered = filtered.filter(a => a.priority === 'HIGH' || a.priority === 'CRITICAL');
    } else if (activeFilter === 'high-risk') {
      filtered = filtered.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'VERY_HIGH');
    }
    
    return filtered;
  };

  // Get priority badge color
  const getPriorityBadgeClass = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[priority] || colors.MEDIUM;
  };

  // Get risk badge color
  const getRiskBadgeClass = (risk: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      VERY_HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[risk] || colors.MEDIUM;
  };

  const filteredApprovals = getFilteredApprovals();

  if (loading && pendingApprovals.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approval Queue</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve pending change requests
          </p>
        </div>
        <button
          onClick={loadApprovals}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Pending</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Awaiting Action</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">High Priority</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.highPriority}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">High Risk</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.highRisk}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={cn(
            'px-4 py-2 rounded-lg transition-colors',
            activeFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
        >
          All ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveFilter('high-priority')}
          className={cn(
            'px-4 py-2 rounded-lg transition-colors',
            activeFilter === 'high-priority'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
        >
          High Priority ({stats.highPriority})
        </button>
        <button
          onClick={() => setActiveFilter('high-risk')}
          className={cn(
            'px-4 py-2 rounded-lg transition-colors',
            activeFilter === 'high-risk'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
        >
          High Risk ({stats.highRisk})
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertIcon />
            <span>{error}</span>
          </div>
          <button
            onClick={loadApprovals}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Approval List */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <CheckIcon className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeFilter === 'all'
                ? 'No pending approvals at this time'
                : `No ${activeFilter.replace('-', ' ')} approvals pending`}
            </p>
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {approval.shortDescription}
                    </h3>
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', getPriorityBadgeClass(approval.priority))}>
                      {approval.priority}
                    </span>
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', getRiskBadgeClass(approval.riskLevel))}>
                      {approval.riskLevel} Risk
                    </span>
                  </div>
                  {approval.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{approval.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Type:</span>
                      <span>{approval.changeType}</span>
                    </div>
                    {approval.category && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Category:</span>
                        <span>{approval.category}</span>
                      </div>
                    )}
                    {approval.startDate && (
                      <div className="flex items-center gap-1">
                        <ClockIcon />
                        <span>Scheduled: {new Date(approval.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedApproval(approval);
                      setShowDetailsModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <EyeIcon />
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <XIcon />
                  </button>
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Approve"
                  >
                    <CheckIcon />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedApproval.shortDescription}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', getPriorityBadgeClass(selectedApproval.priority))}>
                      {selectedApproval.priority}
                    </span>
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', getRiskBadgeClass(selectedApproval.riskLevel))}>
                      {selectedApproval.riskLevel} Risk
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {selectedApproval.changeType}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XIcon />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {selectedApproval.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedApproval.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {selectedApproval.category && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedApproval.category}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Change Type</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedApproval.changeType}</p>
                </div>
              </div>
              {(selectedApproval.startDate || selectedApproval.endDate) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</h3>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    {selectedApproval.startDate && (
                      <div>
                        <span className="text-sm">Start: </span>
                        <span>{new Date(selectedApproval.startDate).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedApproval.endDate && (
                      <div>
                        <span className="text-sm">End: </span>
                        <span>{new Date(selectedApproval.endDate).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {selectedApproval.justification && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Justification</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedApproval.justification}</p>
                </div>
              )}
              {selectedApproval.implementationPlan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Implementation Plan</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedApproval.implementationPlan}</p>
                </div>
              )}
              {selectedApproval.backoutPlan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backout Plan</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedApproval.backoutPlan}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => handleReject(selectedApproval.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <XIcon />
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedApproval.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckIcon />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueuePage;
