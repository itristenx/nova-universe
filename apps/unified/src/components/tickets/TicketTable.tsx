import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useTicketStore } from '@stores/tickets';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import {
  cn,
  formatRelativeTime,
  getTicketPriorityColor,
  getTicketStatusColor,
  formatTicketNumber,
  getUserDisplayName,
  getInitials,
} from '@utils/index';
import type { Ticket } from '@/types';

interface TicketTableProps {
  tickets: Ticket[];
  selectedTickets: string[];
  isLoading: boolean;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onLoadTickets: (page?: number) => Promise<void>;
}

export function TicketTable({
  tickets,
  selectedTickets,
  isLoading,
  pagination,
  onLoadTickets,
}: TicketTableProps) {
  const { setSelectedTickets, addSelectedTicket, removeSelectedTicket, sort, setSortOrder } =
    useTicketStore();

  // Calculate if all tickets are selected
  const allSelected = useMemo(() => {
    return tickets.length > 0 && tickets.every((ticket) => selectedTickets.includes(ticket.id));
  }, [tickets, selectedTickets]);

  // Calculate if some tickets are selected (for indeterminate state)
  const someSelected = useMemo(() => {
    return selectedTickets.length > 0 && !allSelected;
  }, [selectedTickets, allSelected]);

  // Handle header checkbox change
  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      setSelectedTickets(
        selectedTickets.filter((id) => !tickets.some((ticket) => ticket.id === id)),
      );
    } else {
      // Select all on current page
      const currentPageIds = tickets.map((ticket) => ticket.id);
      const newSelected = [...new Set([...selectedTickets, ...currentPageIds])];
      setSelectedTickets(newSelected);
    }
  };

  // Handle individual ticket selection
  const handleTicketSelect = (ticketId: string, checked: boolean) => {
    if (checked) {
      addSelectedTicket(ticketId);
    } else {
      removeSelectedTicket(ticketId);
    }
  };

  // Handle column sorting
  const handleSort = (field: string) => {
    const currentSort = sort.find((s) => s.field === field);
    const newDirection = currentSort?.direction === 'asc' ? 'desc' : 'asc';
    setSortOrder([{ field, direction: newDirection }]);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      onLoadTickets(page);
    }
  };

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const { page, totalPages } = pagination;

    // Always show first page
    pages.push(1);

    // Add ellipsis if needed
    if (page > 3) {
      pages.push(-1); // -1 represents ellipsis
    }

    // Add pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Add ellipsis if needed
    if (page < totalPages - 2) {
      pages.push(-1);
    }

    // Always show last page if more than one page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  }, [pagination]);

  const getSortIcon = (field: string) => {
    const currentSort = sort.find((s) => s.field === field);
    return (
      <ChevronUpDownIcon
        className={cn('h-4 w-4 transition-colors', currentSort ? 'text-nova-600' : 'text-gray-400')}
      />
    );
  };

  const columns = [
    {
      key: 'number',
      label: 'Ticket',
      sortable: true,
      className: 'w-32',
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      className: 'min-w-0 flex-1',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'w-28',
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      className: 'w-28',
    },
    {
      key: 'assignee',
      label: 'Assignee',
      sortable: false,
      className: 'w-40',
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      className: 'w-32',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {/* Selection column */}
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  className="text-nova-600 focus:ring-nova-500 h-4 w-4 rounded border-gray-300"
                />
              </th>

              {/* Column headers */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400',
                    column.className,
                  )}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="group flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {column.label}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className={cn(
                  'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                  selectedTickets.includes(ticket.id) && 'bg-nova-50 dark:bg-nova-900/20',
                )}
              >
                {/* Selection checkbox */}
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.id)}
                    onChange={(e) => handleTicketSelect(ticket.id, e.target.checked)}
                    className="text-nova-600 focus:ring-nova-500 h-4 w-4 rounded border-gray-300"
                  />
                </td>

                {/* Ticket number */}
                <td className="px-4 py-4">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300 font-medium"
                  >
                    {formatTicketNumber(ticket.number, ticket.type)}
                  </Link>
                </td>

                {/* Title */}
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
                    >
                      {ticket.title}
                    </Link>
                    {ticket.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.description}
                      </p>
                    )}
                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {ticket.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                        {ticket.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{ticket.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span className={cn('badge', getTicketStatusColor(ticket.status))}>
                    {ticket.status}
                  </span>
                </td>

                {/* Priority */}
                <td className="px-4 py-4">
                  <span className={cn('badge', getTicketPriorityColor(ticket.priority))}>
                    {ticket.priority}
                  </span>
                </td>

                {/* Assignee */}
                <td className="px-4 py-4">
                  {ticket.assignee ? (
                    <div className="flex items-center gap-2">
                      {ticket.assignee.avatar ? (
                        <img
                          src={ticket.assignee.avatar}
                          alt={getUserDisplayName(ticket.assignee)}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                          {getInitials(getUserDisplayName(ticket.assignee))}
                        </div>
                      )}
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {getUserDisplayName(ticket.assignee)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <UserIcon className="h-4 w-4" />
                      <span className="text-sm">Unassigned</span>
                    </div>
                  )}
                </td>

                {/* Created date */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <ClockIcon className="h-4 w-4" />
                    <span title={ticket.createdAt}>{formatRelativeTime(ticket.createdAt)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.perPage + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.perPage, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>

              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-700 dark:hover:bg-gray-800"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  {/* Page numbers */}
                  {pageNumbers.map((page, index) =>
                    page === -1 ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset dark:text-gray-300 dark:ring-gray-700"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-700 dark:hover:bg-gray-800',
                          page === pagination.page
                            ? 'bg-nova-600 focus-visible:outline-nova-600 z-10 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                            : 'text-gray-900 dark:text-gray-100',
                        )}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-700 dark:hover:bg-gray-800"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
