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
    } catch (_error) {
      toast.error('Search failed');
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
    } catch (_error) {
      toast.error('Failed to update tickets');
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
    } catch (_error) {
      toast.error('Failed to assign tickets');
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
    } catch (_error) {
      toast.error('Failed to delete tickets');
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      // Export with current filters
      // await ticketService.exportTickets(format, filters)
      toast.success(`Exporting tickets as ${format.toUpperCase()}`);
    } catch (_error) {
      toast.error('Export failed');
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
