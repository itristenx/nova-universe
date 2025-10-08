import { useState, useEffect } from 'react';
import { changesAPI, type ChangeRequest, type ChangeFilters } from '@services/backend-api-client';
import { cn } from '@utils/index';
import toast from 'react-hot-toast';

// Icons
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export const ChangeManagementPage: React.FC = () => {
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [calendarChanges, setCalendarChanges] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedChange, setSelectedChange] = useState<ChangeRequest | null>(null);
  const [filters, setFilters] = useState<ChangeFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    shortDescription: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    urgency: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    impact: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    category: '',
    changeType: 'NORMAL' as 'STANDARD' | 'NORMAL' | 'EMERGENCY',
    riskLevel: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH',
    startDate: '',
    endDate: '',
    justification: '',
    implementationPlan: '',
    backoutPlan: '',
  });

  // Stats
  const stats = {
    total: changes.length,
    new: changes.filter(c => c.state === 'NEW').length,
    assessment: changes.filter(c => c.state === 'ASSESSMENT').length,
    approved: changes.filter(c => c.approvalStatus === 'APPROVED').length,
    scheduled: changes.filter(c => c.state === 'SCHEDULED').length,
    implemented: changes.filter(c => c.state === 'IMPLEMENTATION').length,
    highPriority: changes.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length,
    highRisk: changes.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'VERY_HIGH').length,
  };

  // Load changes
  const loadChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await changesAPI.list(filters);
      setChanges(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load changes');
      toast.error('Failed to load changes');
    } finally {
      setLoading(false);
    }
  };

  // Load calendar
  const loadCalendar = async () => {
    try {
      const data = await changesAPI.getCalendar();
      setCalendarChanges(data);
    } catch (err: any) {
      toast.error('Failed to load calendar');
    }
  };

  useEffect(() => {
    loadChanges();
  }, [filters]);

  useEffect(() => {
    if (activeView === 'calendar') {
      loadCalendar();
    }
  }, [activeView]);

  // Handle create
  const handleCreate = async () => {
    try {
      const data = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
      };
      await changesAPI.create(data);
      toast.success('Change request created successfully');
      setShowCreateModal(false);
      resetForm();
      loadChanges();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create change request');
    }
  };

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      await changesAPI.approve(id);
      toast.success('Change request approved');
      loadChanges();
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
      loadChanges();
      setShowDetailsModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject change');
    }
  };

  // Handle implement
  const handleImplement = async (id: string) => {
    try {
      await changesAPI.implement(id);
      toast.success('Change marked as implemented');
      loadChanges();
      setShowDetailsModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to implement change');
    }
  };

  const resetForm = () => {
    setFormData({
      shortDescription: '',
      description: '',
      priority: 'MEDIUM',
      urgency: 'MEDIUM',
      impact: 'MEDIUM',
      category: '',
      changeType: 'NORMAL',
      riskLevel: 'MEDIUM',
      startDate: '',
      endDate: '',
      justification: '',
      implementationPlan: '',
      backoutPlan: '',
    });
  };

  // Get state badge color
  const getStateBadgeClass = (state: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      ASSESSMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      SCHEDULED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      IMPLEMENTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[state] || colors.NEW;
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

  if (loading && changes.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Change Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track change requests across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-4 py-2 rounded-lg flex items-center gap-2 transition-colors',
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <FilterIcon />
            Filters
          </button>
          <button
            onClick={() => setActiveView(activeView === 'list' ? 'calendar' : 'list')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <CalendarIcon />
            {activeView === 'list' ? 'Calendar View' : 'List View'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            New Change Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">New</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.new}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Assessment</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.assessment}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.approved}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.scheduled}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Implemented</div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{stats.implemented}</div>
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

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
              <select
                value={filters.state || ''}
                onChange={(e) => setFilters({ ...filters, state: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All States</option>
                <option value="NEW">New</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="APPROVED">Approved</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IMPLEMENTED">Implemented</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={filters.changeType || ''}
                onChange={(e) => setFilters({ ...filters, changeType: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="STANDARD">Standard</option>
                <option value="NORMAL">Normal</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Level</label>
              <select
                value={filters.riskLevel || ''}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Risk Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="VERY_HIGH">Very High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <input
                type="text"
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                placeholder="Filter by category"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                placeholder="Search changes"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertIcon />
            <span>{error}</span>
          </div>
          <button
            onClick={loadChanges}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* List View */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {changes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <CalendarIcon />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Change Requests</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by creating your first change request
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <PlusIcon />
                New Change Request
              </button>
            </div>
          ) : (
            changes.map((change) => (
              <div
                key={change.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedChange(change);
                  setShowDetailsModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {change.shortDescription}
                      </h3>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getStateBadgeClass(change.state))}>
                        {change.state}
                      </span>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getPriorityBadgeClass(change.priority))}>
                        {change.priority}
                      </span>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getRiskBadgeClass(change.riskLevel))}>
                        {change.riskLevel} Risk
                      </span>
                    </div>
                    {change.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{change.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Type:</span>
                        <span>{change.changeType}</span>
                      </div>
                      {change.category && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Category:</span>
                          <span>{change.category}</span>
                        </div>
                      )}
                      {change.startDate && (
                        <div className="flex items-center gap-1">
                          <ClockIcon />
                          <span>{new Date(change.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {change.state === 'ASSESSMENT' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(change.id);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckIcon />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(change.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XIcon />
                        </button>
                      </>
                    )}
                    {change.state === 'SCHEDULED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImplement(change.id);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Mark as Implemented"
                      >
                        <CheckIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scheduled Changes</h3>
          {calendarChanges.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No scheduled changes</p>
          ) : (
            <div className="space-y-4">
              {calendarChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {change.startDate && new Date(change.startDate).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {change.startDate && new Date(change.startDate).getDate()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{change.shortDescription}</h4>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getPriorityBadgeClass(change.priority))}>
                        {change.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {change.startDate && change.endDate && (
                        <>
                          {new Date(change.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(change.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Change Request</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Description *
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.changeType}
                    onChange={(e) => setFormData({ ...formData, changeType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="NORMAL">Normal</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Level</label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="VERY_HIGH">Very High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Justification</label>
                <textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Implementation Plan</label>
                <textarea
                  value={formData.implementationPlan}
                  onChange={(e) => setFormData({ ...formData, implementationPlan: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backout Plan</label>
                <textarea
                  value={formData.backoutPlan}
                  onChange={(e) => setFormData({ ...formData, backoutPlan: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.shortDescription}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Change Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedChange.shortDescription}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', getStateBadgeClass(selectedChange.state))}>
                      {selectedChange.state}
                    </span>
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', getPriorityBadgeClass(selectedChange.priority))}>
                      {selectedChange.priority}
                    </span>
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', getRiskBadgeClass(selectedChange.riskLevel))}>
                      {selectedChange.riskLevel} Risk
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
              {selectedChange.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedChange.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedChange.changeType}</p>
                </div>
                {selectedChange.category && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedChange.category}</p>
                  </div>
                )}
              </div>
              {(selectedChange.startDate || selectedChange.endDate) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</h3>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    {selectedChange.startDate && (
                      <div>
                        <span className="text-sm">Start: </span>
                        <span>{new Date(selectedChange.startDate).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedChange.endDate && (
                      <div>
                        <span className="text-sm">End: </span>
                        <span>{new Date(selectedChange.endDate).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {selectedChange.justification && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Justification</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedChange.justification}</p>
                </div>
              )}
              {selectedChange.implementationPlan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Implementation Plan</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedChange.implementationPlan}</p>
                </div>
              )}
              {selectedChange.backoutPlan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backout Plan</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedChange.backoutPlan}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              {selectedChange.state === 'ASSESSMENT' && (
                <>
                  <button
                    onClick={() => handleReject(selectedChange.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <XIcon />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedChange.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckIcon />
                    Approve
                  </button>
                </>
              )}
              {selectedChange.state === 'SCHEDULED' && (
                <button
                  onClick={() => handleImplement(selectedChange.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <CheckIcon />
                  Mark as Implemented
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeManagementPage;
