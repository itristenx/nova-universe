import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTicketStore } from '@stores/tickets';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { TicketTable } from '@components/tickets/TicketTable';
import { TicketFilters } from '@components/tickets/TicketFilters';
import { BulkActions } from '@components/tickets/BulkActions';
import { TicketStats } from '@components/tickets/TicketStats';
import { cn, formatNumber } from '@utils/index';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const {
    tickets,
    selectedTickets,
    isLoading,
    error,
    pagination,
    stats,
    filters,
    loadTickets,
    loadStats,
    setFilters,
    searchTickets,
    clearSelectedTickets,
    bulkUpdateTickets,
    bulkDeleteTickets,
    refreshTickets,
    clearError,
  } = useTicketStore();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load tickets and stats on component mount
  useEffect(() => {
    loadTickets();
    loadStats();
  }, [loadTickets, loadStats]);

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      await loadTickets();
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      await searchTickets(query);
    } catch (error) {
      // Comprehensive error handling for ticket search
      const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
      const searchContext = {
        query: query,
        queryLength: query.length,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'current-user', // TODO: Get from auth context
        searchType: 'ticket_search',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        stackTrace: error instanceof Error ? error.stack : undefined,
      };

      // Log comprehensive error details
      console.error('🔍 Ticket Search Error:', {
        error: errorMessage,
        context: searchContext,
        severity: 'medium',
        category: 'search_functionality',
        impact: 'user_experience',
        timestamp: Date.now(),
      });

      // Analytics tracking for search failures
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'search_error', {
          event_category: 'ticket_management',
          event_label: 'search_failure',
          search_term: query,
          error_message: errorMessage,
          custom_parameter_1: searchContext.searchType,
          custom_parameter_2: searchContext.errorType,
        });
      }

      // Enhanced user feedback with actionable suggestions
      const userMessage = errorMessage.includes('network') || errorMessage.includes('timeout')
        ? 'Search temporarily unavailable. Please check your connection and try again.'
        : errorMessage.includes('rate limit') || errorMessage.includes('too many')
        ? 'Search rate limit exceeded. Please wait a moment before searching again.'
        : errorMessage.includes('invalid') || errorMessage.includes('malformed')
        ? 'Invalid search query format. Please check your search terms and try again.'
        : `Search failed: ${errorMessage}. Please try a different search term.`;

      toast.error(userMessage, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
      });

      // Enterprise monitoring and alerting
      if (typeof window !== 'undefined' && (window as any).NovaMonitoring) {
        (window as any).NovaMonitoring.recordError('ticket_search_failure', {
          error: errorMessage,
          context: searchContext,
          severity: 'medium',
          requiresAttention: query.length > 50, // Flag complex queries
        });
      }

      // Optional: Send error to external monitoring service
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        try {
          fetch('/api/errors/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'ticket_search_error',
              error: errorMessage,
              context: searchContext,
              timestamp: Date.now(),
            }),
          }).catch(() => {}); // Silent fail for error reporting
        } catch (reportingError) {
          console.warn('Failed to report search error:', reportingError);
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle bulk actions
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedTickets.length === 0) {
      toast.error('Please select tickets to update');
      return;
    }

    try {
      await bulkUpdateTickets(selectedTickets, { status });
      toast.success(`Updated ${selectedTickets.length} tickets`);
      clearSelectedTickets();
    } catch (error) {
      // Comprehensive error handling for bulk status updates
      const errorMessage = error instanceof Error ? error.message : 'Unknown bulk update error';
      const updateContext = {
        selectedTicketCount: selectedTickets.length,
        targetStatus: status,
        ticketIds: selectedTickets.slice(0, 10), // Limit to first 10 for logging
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'current-user', // TODO: Get from auth context
        operationType: 'bulk_status_update',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        stackTrace: error instanceof Error ? error.stack : undefined,
      };

      // Log comprehensive error details
      console.error('📝 Bulk Status Update Error:', {
        error: errorMessage,
        context: updateContext,
        severity: 'high',
        category: 'bulk_operations',
        impact: 'data_integrity',
        timestamp: Date.now(),
      });

      // Analytics tracking for bulk operation failures
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'bulk_operation_error', {
          event_category: 'ticket_management',
          event_label: 'bulk_status_update_failure',
          ticket_count: selectedTickets.length,
          target_status: status,
          error_message: errorMessage,
          custom_parameter_1: updateContext.operationType,
          custom_parameter_2: updateContext.errorType,
        });
      }

      // Enhanced user feedback with actionable suggestions
      const userMessage = errorMessage.includes('permission') || errorMessage.includes('unauthorized')
        ? 'Insufficient permissions to update these tickets. Please contact your administrator.'
        : errorMessage.includes('network') || errorMessage.includes('timeout')
        ? 'Update failed due to connection issues. Please try again.'
        : errorMessage.includes('conflict') || errorMessage.includes('locked')
        ? 'Some tickets are currently being edited by other users. Please try again in a moment.'
        : errorMessage.includes('validation') || errorMessage.includes('invalid')
        ? `Invalid status "${status}" for selected tickets. Please refresh and try again.`
        : `Failed to update ${selectedTickets.length} tickets: ${errorMessage}`;

      toast.error(userMessage, {
        duration: 6000,
        position: 'top-right',
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
      });

      // Enterprise monitoring and alerting
      if (typeof window !== 'undefined' && (window as any).NovaMonitoring) {
        (window as any).NovaMonitoring.recordError('bulk_status_update_failure', {
          error: errorMessage,
          context: updateContext,
          severity: 'high',
          requiresAttention: selectedTickets.length > 10, // Flag large bulk operations
        });
      }

      // Optional: Send error to external monitoring service
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        try {
          fetch('/api/errors/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'bulk_status_update_error',
              error: errorMessage,
              context: updateContext,
              timestamp: Date.now(),
            }),
          }).catch(() => {}); // Silent fail for error reporting
        } catch (reportingError) {
          console.warn('Failed to report bulk update error:', reportingError);
        }
      }
    }
  };

  const handleBulkAssign = async (assigneeId: string) => {
    if (selectedTickets.length === 0) {
      toast.error('Please select tickets to assign');
      return;
    }

    try {
      await bulkUpdateTickets(selectedTickets, { assigneeId });
      toast.success(`Assigned ${selectedTickets.length} tickets`);
      clearSelectedTickets();
    } catch (error) {
      // Comprehensive error handling for bulk ticket assignment
      const errorMessage = error instanceof Error ? error.message : 'Unknown bulk assignment error';
      const assignContext = {
        selectedTicketCount: selectedTickets.length,
        assigneeId: assigneeId,
        ticketIds: selectedTickets.slice(0, 10), // Limit to first 10 for logging
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'current-user', // TODO: Get from auth context
        operationType: 'bulk_assignment',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        stackTrace: error instanceof Error ? error.stack : undefined,
      };

      // Log comprehensive error details
      console.error('👤 Bulk Assignment Error:', {
        error: errorMessage,
        context: assignContext,
        severity: 'high',
        category: 'bulk_operations',
        impact: 'workflow_management',
        timestamp: Date.now(),
      });

      // Analytics tracking for bulk assignment failures
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'bulk_operation_error', {
          event_category: 'ticket_management',
          event_label: 'bulk_assignment_failure',
          ticket_count: selectedTickets.length,
          assignee_id: assigneeId,
          error_message: errorMessage,
          custom_parameter_1: assignContext.operationType,
          custom_parameter_2: assignContext.errorType,
        });
      }

      // Enhanced user feedback with actionable suggestions
      const userMessage = errorMessage.includes('permission') || errorMessage.includes('unauthorized')
        ? 'Insufficient permissions to assign these tickets. Please contact your administrator.'
        : errorMessage.includes('network') || errorMessage.includes('timeout')
        ? 'Assignment failed due to connection issues. Please try again.'
        : errorMessage.includes('not found') || errorMessage.includes('invalid assignee')
        ? 'Selected assignee is no longer available. Please refresh and try again.'
        : errorMessage.includes('conflict') || errorMessage.includes('locked')
        ? 'Some tickets are currently being edited by other users. Please try again in a moment.'
        : errorMessage.includes('capacity') || errorMessage.includes('workload')
        ? 'Assignee has reached maximum ticket capacity. Please choose a different assignee.'
        : `Failed to assign ${selectedTickets.length} tickets: ${errorMessage}`;

      toast.error(userMessage, {
        duration: 6000,
        position: 'top-right',
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
      });

      // Enterprise monitoring and alerting
      if (typeof window !== 'undefined' && (window as any).NovaMonitoring) {
        (window as any).NovaMonitoring.recordError('bulk_assignment_failure', {
          error: errorMessage,
          context: assignContext,
          severity: 'high',
          requiresAttention: selectedTickets.length > 5, // Flag bulk assignments
        });
      }

      // Optional: Send error to external monitoring service
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        try {
          fetch('/api/errors/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'bulk_assignment_error',
              error: errorMessage,
              context: assignContext,
              timestamp: Date.now(),
            }),
          }).catch(() => {}); // Silent fail for error reporting
        } catch (reportingError) {
          console.warn('Failed to report bulk assignment error:', reportingError);
        }
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTickets.length === 0) {
      toast.error('Please select tickets to delete');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedTickets.length} tickets? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await bulkDeleteTickets(selectedTickets);
      toast.success(`Deleted ${selectedTickets.length} tickets`);
    } catch (error) {
      // Comprehensive error handling for bulk ticket deletion
      const errorMessage = error instanceof Error ? error.message : 'Unknown bulk deletion error';
      const deleteContext = {
        selectedTicketCount: selectedTickets.length,
        ticketIds: selectedTickets.slice(0, 10), // Limit to first 10 for logging
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'current-user', // TODO: Get from auth context
        operationType: 'bulk_deletion',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        stackTrace: error instanceof Error ? error.stack : undefined,
        confirmationGiven: true, // User confirmed the deletion
      };

      // Log comprehensive error details - high severity for data loss operations
      console.error('🗑️ Bulk Deletion Error:', {
        error: errorMessage,
        context: deleteContext,
        severity: 'critical',
        category: 'bulk_operations',
        impact: 'data_loss_prevention',
        timestamp: Date.now(),
      });

      // Analytics tracking for bulk deletion failures
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'bulk_operation_error', {
          event_category: 'ticket_management',
          event_label: 'bulk_deletion_failure',
          ticket_count: selectedTickets.length,
          error_message: errorMessage,
          custom_parameter_1: deleteContext.operationType,
          custom_parameter_2: deleteContext.errorType,
        });
      }

      // Enhanced user feedback with recovery suggestions
      const userMessage = errorMessage.includes('permission') || errorMessage.includes('unauthorized')
        ? 'Insufficient permissions to delete these tickets. Please contact your administrator.'
        : errorMessage.includes('network') || errorMessage.includes('timeout')
        ? 'Deletion failed due to connection issues. Please verify your connection and try again.'
        : errorMessage.includes('constraint') || errorMessage.includes('referenced')
        ? 'Some tickets cannot be deleted as they are referenced by other records. Please archive them instead.'
        : errorMessage.includes('not found') || errorMessage.includes('already deleted')
        ? 'Some tickets have already been deleted by another user. Please refresh the page.'
        : errorMessage.includes('locked') || errorMessage.includes('in use')
        ? 'Some tickets are currently being modified. Please try again in a moment.'
        : `Failed to delete ${selectedTickets.length} tickets: ${errorMessage}. Your data is safe.`;

      toast.error(userMessage, {
        duration: 8000, // Longer duration for critical operations
        position: 'top-right',
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
      });

      // Enterprise monitoring and alerting - critical for deletion failures
      if (typeof window !== 'undefined' && (window as any).NovaMonitoring) {
        (window as any).NovaMonitoring.recordError('bulk_deletion_failure', {
          error: errorMessage,
          context: deleteContext,
          severity: 'critical',
          requiresAttention: true, // Always flag deletion failures
          alertTeam: true,
        });
      }

      // Optional: Send error to external monitoring service with high priority
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        try {
          fetch('/api/errors/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'bulk_deletion_error',
              error: errorMessage,
              context: deleteContext,
              priority: 'high',
              timestamp: Date.now(),
            }),
          }).catch(() => {}); // Silent fail for error reporting
        } catch (reportingError) {
          console.warn('Failed to report bulk deletion error:', reportingError);
        }
      }
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      // Export with current filters
      // await ticketService.exportTickets(format, filters)
      toast.success(`Exporting tickets as ${format.toUpperCase()}`);
    } catch (error) {
      // Comprehensive error handling for ticket export
      const errorMessage = error instanceof Error ? error.message : 'Unknown export error';
      const exportContext = {
        exportFormat: format,
        filtersActive: Object.keys(filters).length > 0,
        filterDetails: filters,
        ticketCount: tickets.length,
        searchQuery: searchQuery,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'current-user', // TODO: Get from auth context
        operationType: 'ticket_export',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        stackTrace: error instanceof Error ? error.stack : undefined,
      };

      // Log comprehensive error details
      console.error('📊 Export Error:', {
        error: errorMessage,
        context: exportContext,
        severity: 'medium',
        category: 'data_export',
        impact: 'reporting_functionality',
        timestamp: Date.now(),
      });

      // Analytics tracking for export failures
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'export_error', {
          event_category: 'ticket_management',
          event_label: 'export_failure',
          export_format: format,
          ticket_count: tickets.length,
          error_message: errorMessage,
          custom_parameter_1: exportContext.operationType,
          custom_parameter_2: exportContext.errorType,
        });
      }

      // Enhanced user feedback with format-specific suggestions
      const userMessage = errorMessage.includes('permission') || errorMessage.includes('unauthorized')
        ? 'Insufficient permissions to export tickets. Please contact your administrator.'
        : errorMessage.includes('size') || errorMessage.includes('too large')
        ? `Export file too large for ${format.toUpperCase()} format. Try applying filters to reduce the dataset.`
        : errorMessage.includes('network') || errorMessage.includes('timeout')
        ? 'Export failed due to connection issues. Please try again.'
        : errorMessage.includes('format') || errorMessage.includes('unsupported')
        ? `${format.toUpperCase()} export is currently unavailable. Please try a different format.`
        : errorMessage.includes('storage') || errorMessage.includes('disk')
        ? 'Export temporarily unavailable due to server storage issues. Please try again later.'
        : `Failed to export as ${format.toUpperCase()}: ${errorMessage}. Please try again.`;

      toast.error(userMessage, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
      });

      // Enterprise monitoring and alerting
      if (typeof window !== 'undefined' && (window as any).NovaMonitoring) {
        (window as any).NovaMonitoring.recordError('ticket_export_failure', {
          error: errorMessage,
          context: exportContext,
          severity: 'medium',
          requiresAttention: tickets.length > 1000, // Flag large export failures
        });
      }

      // Optional: Send error to external monitoring service
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        try {
          fetch('/api/errors/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'ticket_export_error',
              error: errorMessage,
              context: exportContext,
              timestamp: Date.now(),
            }),
          }).catch(() => {}); // Silent fail for error reporting
        } catch (reportingError) {
          console.warn('Failed to report export error:', reportingError);
        }
      }
    }
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tickets</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage and track all service requests and incidents
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export menu */}
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleExport(e.target.value as 'csv' | 'excel' | 'pdf');
                  e.target.value = '';
                }
              }}
              className="btn btn-secondary"
              defaultValue=""
              aria-label="Export tickets format selection"
              title="Choose export format for tickets"
            >
              <option value="" disabled>
                <DocumentArrowDownIcon className="h-4 w-4" />
                Export
              </option>
              <option value="csv">Export as CSV</option>
              <option value="excel">Export as Excel</option>
              <option value="pdf">Export as PDF</option>
            </select>
          </div>

          {/* Create ticket button */}
          <Link to="/tickets/new" className="btn btn-primary">
            <PlusIcon className="h-4 w-4" />
            New Ticket
          </Link>
        </div>
      </div>

      {/* Stats overview */}
      {stats && <TicketStats stats={stats} />}

      {/* Search and filters bar */}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets by title, description, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          {/* Filter and sort buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'btn btn-secondary',
                showFilters && 'bg-nova-100 text-nova-700 dark:bg-nova-900 dark:text-nova-300',
              )}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="bg-nova-600 ml-1 rounded-full px-2 py-0.5 text-xs text-white">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>

            <button onClick={refreshTickets} disabled={isLoading} className="btn btn-secondary">
              <ArrowsUpDownIcon className="h-4 w-4" />
              Sort
            </button>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <TicketFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({})}
            />
          </div>
        )}
      </div>

      {/* Bulk actions bar */}
      {selectedTickets.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatNumber(selectedTickets.length)} ticket
                {selectedTickets.length !== 1 ? 's' : ''} selected
              </span>

              <BulkActions
                selectedCount={selectedTickets.length}
                onStatusUpdate={handleBulkStatusUpdate}
                onAssign={handleBulkAssign}
                onDelete={handleBulkDelete}
              />
            </div>

            <button onClick={clearSelectedTickets} className="btn btn-ghost btn-sm">
              <XMarkIcon className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading tickets
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    clearError();
                    refreshTickets();
                  }}
                  className="btn btn-sm btn-secondary"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tickets table */}
      <div className="card overflow-hidden">
        {isLoading && !tickets.length ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="lg" text="Loading tickets..." />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <PlusIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No tickets found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first ticket'}
            </p>
            {!searchQuery && Object.keys(filters).length === 0 && (
              <Link to="/tickets/new" className="btn btn-primary mt-4">
                <PlusIcon className="h-4 w-4" />
                Create Ticket
              </Link>
            )}
          </div>
        ) : (
          <TicketTable
            tickets={tickets}
            selectedTickets={selectedTickets}
            isLoading={isLoading}
            pagination={pagination}
            onLoadTickets={loadTickets}
          />
        )}
      </div>
    </div>
  );
}
