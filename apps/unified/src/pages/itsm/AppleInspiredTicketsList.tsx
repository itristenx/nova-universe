import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ticketService } from '@services/tickets';
import { AppleInspiredLayout } from '@components/layout/AppleInspiredLayout';
import { AppleCard, AppleCardHeader, AppleCardContent } from '@components/design-system/AppleCard';
import { AppleButton, AppleButtonGroup } from '@components/design-system/AppleButton';
import { AppleTable } from '@components/design-system/AppleTable';
import { AppleInput, AppleSelect } from '@components/design-system/AppleForm';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { cn, formatRelativeTime } from '@utils/index';
import toast from 'react-hot-toast';
import type { Ticket } from '@/types';

interface TicketFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  assignee: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export default function AppleInspiredTicketsList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });

  const [filters, setFilters] = useState<TicketFilters>({
    search: '',
    status: '',
    priority: '',
    category: '',
    assignee: '',
  });

  // Load tickets
  const loadTickets = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await ticketService.getTickets(
        page,
        25,
        {
          status: filters.status ? [filters.status] : undefined,
          priority: filters.priority ? [filters.priority] : undefined,
          category: filters.category ? [filters.category] : undefined,
          assignee: filters.assignee ? [filters.assignee] : undefined,
        },
        [{ field: sortConfig.field, direction: sortConfig.direction }]
      );

      setTickets(response.data);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadTickets(1);
  }, [filters, sortConfig]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== '') {
        loadTickets(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTickets(
      selectedTickets.length === tickets.length ? [] : tickets.map(t => t.id)
    );
  };

  const handleBulkAction = async (action: 'close' | 'delete') => {
    if (selectedTickets.length === 0) return;

    try {
      if (action === 'delete') {
        for (const ticketId of selectedTickets) {
          await ticketService.deleteTicket(ticketId);
        }
        toast.success(`Deleted ${selectedTickets.length} tickets`);
      } else if (action === 'close') {
        for (const ticketId of selectedTickets) {
          await ticketService.updateTicket(ticketId, { status: 'closed' });
        }
        toast.success(`Closed ${selectedTickets.length} tickets`);
      }

      setSelectedTickets([]);
      loadTickets(currentPage);
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      category: '',
      assignee: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: '●' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: '◐' },
      resolved: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: '✓' },
      closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: '✕' },
      canceled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '✕' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span>{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: '↓' },
      medium: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: '→' },
      high: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', icon: '↑' },
      critical: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '⚠' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span>{config.icon}</span>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const tableColumns = [
    {
      key: 'id',
      title: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'title',
      title: 'Title',
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      width: '120px',
      sortable: true,
    },
    {
      key: 'priority',
      title: 'Priority',
      width: '120px',
      sortable: true,
    },
    {
      key: 'category',
      title: 'Category',
      width: '120px',
      sortable: true,
    },
    {
      key: 'requester',
      title: 'Requester',
      width: '150px',
      sortable: true,
    },
    {
      key: 'createdAt',
      title: 'Created',
      width: '120px',
      sortable: true,
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '120px',
      align: 'center' as const,
    },
  ];

  const formattedTickets = tickets.map(ticket => ({
    ...ticket,
    status: getStatusBadge(ticket.status),
    priority: getPriorityBadge(ticket.priority),
    category: (
      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
        {ticket.category || 'Other'}
      </span>
    ),
    requester: (
      <span className="text-sm text-gray-900 dark:text-gray-100">
        {typeof ticket.requester === 'string' ? ticket.requester : ticket.requester?.displayName || 'Unknown'}
      </span>
    ),
    createdAt: (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {formatRelativeTime(new Date(ticket.createdAt))}
      </span>
    ),
    actions: (
      <div className="flex items-center justify-center gap-1">
        <AppleButton
          variant="ghost"
          size="xs"
          icon={<EyeIcon className="w-3 h-3" />}
          onClick={() => navigate(`/tickets/${ticket.id}`)}
        />
        <AppleButton
          variant="ghost"
          size="xs"
          icon={<PencilIcon className="w-3 h-3" />}
          onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
        />
        <AppleButton
          variant="ghost"
          size="xs"
          icon={<TrashIcon className="w-3 h-3" />}
          onClick={() => handleBulkAction('delete')}
        />
      </div>
    ),
  }));

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
    { value: 'canceled', label: 'Canceled' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'software', label: 'Software' },
    { value: 'network', label: 'Network' },
    { value: 'access', label: 'Access' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <AppleInspiredLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Support Tickets
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and track all support requests
              </p>
            </div>
            <div className="flex gap-3">
              <AppleButton
                variant="secondary"
                icon={<FunnelIcon className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </AppleButton>
              <Link to="/tickets/create">
                <AppleButton
                  variant="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                >
                  Create Ticket
                </AppleButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <AppleCard variant="filled" className="mb-6">
            <AppleCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <AppleInput
                  label="Search"
                  value={filters.search}
                  onChange={(value) => handleFilterChange('search', value)}
                  placeholder="Search tickets..."
                  icon={<MagnifyingGlassIcon className="w-4 h-4" />}
                />
                <AppleSelect
                  label="Status"
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  options={statusOptions}
                />
                <AppleSelect
                  label="Priority"
                  value={filters.priority}
                  onChange={(value) => handleFilterChange('priority', value)}
                  options={priorityOptions}
                />
                <AppleSelect
                  label="Category"
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  options={categoryOptions}
                />
                <div className="flex items-end gap-2">
                  <AppleButton
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    icon={<XMarkIcon className="w-4 h-4" />}
                  >
                    Clear
                  </AppleButton>
                </div>
              </div>
            </AppleCardContent>
          </AppleCard>
        )}

        {/* Bulk Actions */}
        {selectedTickets.length > 0 && (
          <AppleCard variant="filled" className="mb-6 border-l-4 border-l-nova-500">
            <AppleCardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedTickets.length} ticket(s) selected
                </span>
                <AppleButtonGroup>
                  <AppleButton
                    variant="secondary"
                    size="sm"
                    icon={<CheckCircleIcon className="w-4 h-4" />}
                    onClick={() => handleBulkAction('close')}
                  >
                    Close Selected
                  </AppleButton>
                  <AppleButton
                    variant="danger"
                    size="sm"
                    icon={<TrashIcon className="w-4 h-4" />}
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete Selected
                  </AppleButton>
                </AppleButtonGroup>
              </div>
            </AppleCardContent>
          </AppleCard>
        )}

        {/* Tickets Table */}
        <AppleCard variant="elevated">
          <AppleCardHeader
            title="All Tickets"
            subtitle={`${tickets.length} tickets found`}
            action={
              <AppleButton
                variant="ghost"
                size="sm"
                icon={<ArrowsUpDownIcon className="w-4 h-4" />}
                onClick={() => handleSort('createdAt')}
              >
                Sort
              </AppleButton>
            }
          />
          <AppleCardContent>
            <AppleTable
              columns={tableColumns}
              data={formattedTickets}
              selectedRows={selectedTickets}
              onRowSelect={handleTicketSelect}
              onSelectAll={handleSelectAll}
              onRowClick={(ticket) => navigate(`/tickets/apple/${ticket.id}`)}
              isLoading={isLoading}
              emptyState={
                <div className="text-center py-12">
                  <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No tickets found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {filters.search || filters.status || filters.priority || filters.category
                      ? 'Try adjusting your filters to see more results.'
                      : 'Get started by creating your first support ticket.'}
                  </p>
                  <Link to="/tickets/create">
                    <AppleButton variant="primary" icon={<PlusIcon className="w-4 h-4" />}>
                      Create Your First Ticket
                    </AppleButton>
                  </Link>
                </div>
              }
            />
          </AppleCardContent>
        </AppleCard>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <AppleButton
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => loadTickets(currentPage - 1)}
              >
                Previous
              </AppleButton>
              <AppleButton
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => loadTickets(currentPage + 1)}
              >
                Next
              </AppleButton>
            </div>
          </div>
        )}
      </div>
    </AppleInspiredLayout>
  );
}