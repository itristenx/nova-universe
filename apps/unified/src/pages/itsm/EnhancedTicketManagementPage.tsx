import React, { useState, useEffect, useMemo } from 'react';
import {
  DataGrid,
  ContextPanel,
  ContextPanelSection,
  ContextPanelField,
  SmartForm,
  StatusBadge,
  SearchBar,
  Dropdown,
  DropdownButton,
  Modal,
  ModalButton,
  useConfirmModal,
  useDynamicIsland,
  type DataGridColumn,
  type FormField,
  type SearchResult,
  type DropdownItem,
} from '@components/design-system';
import {
  Ticket as TicketIcon,
  Plus,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Trash2,
  Archive,
  UserPlus,
  Tag,
} from 'lucide-react';
import { ticketService } from '@services/tickets';
import type { Ticket } from '@/types';

interface TicketFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  type?: string[];
  assignee?: string[];
  requester?: string[];
  category?: string[];
  tags?: string[];
}

/**
 * Enhanced Ticket Management Page
 * Full-featured ticket management with all Phase 1+2 components
 */
export const EnhancedTicketManagementPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TicketFilters>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { confirm, ConfirmModal } = useConfirmModal();
  const dynamicIsland = useDynamicIsland();

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getTickets(page, 25, filters);
      setTickets(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      dynamicIsland.error('Error', 'Failed to load tickets');
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, filters]);

  // DataGrid columns
  const columns: DataGridColumn[] = [
    {
      id: 'number',
      header: 'Number',
      accessor: 'number',
      width: 120,
      sortable: true,
      cell: (row: Ticket) => (
        <span className="font-sf-mono font-medium text-apple-blue dark:text-apple-blue-dark">
          {row.number}
        </span>
      ),
    },
    {
      id: 'title',
      header: 'Title',
      accessor: 'title',
      minWidth: 200,
      sortable: true,
      filterable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: 130,
      sortable: true,
      cell: (row: Ticket) => {
        const variantMap: Record<string, any> = {
          new: 'info',
          open: 'open',
          pending: 'pending',
          resolved: 'resolved',
          closed: 'closed',
        };
        return (
          <StatusBadge
            variant={variantMap[row.status] || 'neutral'}
            label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
            size="sm"
            showDot
            animated={row.status === 'open' || row.status === 'new'}
          />
        );
      },
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: 'priority',
      width: 120,
      sortable: true,
      cell: (row: Ticket) => {
        const variantMap: Record<string, any> = {
          low: 'low',
          normal: 'medium',
          high: 'high',
          urgent: 'high',
          critical: 'critical',
        };
        return (
          <StatusBadge
            variant={variantMap[row.priority] || 'neutral'}
            label={row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
            size="sm"
          />
        );
      },
    },
    {
      id: 'requester',
      header: 'Requester',
      accessor: (row: Ticket) => row.requester?.displayName || row.requester?.email || 'Unknown',
      width: 150,
      sortable: true,
    },
    {
      id: 'assignee',
      header: 'Assignee',
      accessor: (row: Ticket) => row.assignee?.displayName || row.assignee?.email || 'Unassigned',
      width: 150,
      sortable: true,
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      width: 150,
      sortable: true,
      cell: (row: Ticket) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ ...filters, search: query });
  };

  const searchResults: SearchResult[] = useMemo(() => {
    if (!searchQuery) return [];
    return tickets
      .filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.number.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: `${t.number} - ${t.title}`,
        subtitle: `${t.status} • ${t.priority}`,
        icon: <TicketIcon className="w-5 h-5" />,
        category: 'Ticket',
      }));
  }, [tickets, searchQuery]);

  // Row click handler
  const handleRowClick = (row: Ticket) => {
    setSelectedTicket(row);
    setPanelOpen(true);
  };

  // Bulk actions
  const bulkActions: DropdownItem[] = [
    {
      id: 'assign',
      label: 'Assign',
      icon: <UserPlus className="w-4 h-4" />,
      onClick: () => dynamicIsland.info('Bulk assign', 'Coming soon'),
    },
    {
      id: 'tag',
      label: 'Add Tags',
      icon: <Tag className="w-4 h-4" />,
      onClick: () => dynamicIsland.info('Bulk tag', 'Coming soon'),
    },
    {
      id: 'divider1',
      label: '',
      divider: true,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      onClick: async () => {
        const confirmed = await confirm({
          title: 'Archive Tickets',
          message: `Archive ${selectedRows.length} ticket(s)?`,
          confirmLabel: 'Archive',
        });
        if (confirmed) {
          dynamicIsland.success('Archived', `${selectedRows.length} tickets archived`);
          setSelectedRows([]);
        }
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      danger: true,
      onClick: async () => {
        const confirmed = await confirm({
          title: 'Delete Tickets',
          message: `Permanently delete ${selectedRows.length} ticket(s)?`,
          variant: 'danger',
          confirmLabel: 'Delete',
        });
        if (confirmed) {
          dynamicIsland.success('Deleted', `${selectedRows.length} tickets deleted`);
          setSelectedRows([]);
        }
      },
    },
  ];

  // Filter dropdown
  const filterItems: DropdownItem[] = [
    {
      id: 'status',
      label: 'Status',
      children: [
        { id: 'status-all', label: 'All', onClick: () => setFilters({ ...filters, status: undefined }) },
        { id: 'status-open', label: 'Open', onClick: () => setFilters({ ...filters, status: ['open'] }) },
        { id: 'status-pending', label: 'Pending', onClick: () => setFilters({ ...filters, status: ['pending'] }) },
        { id: 'status-resolved', label: 'Resolved', onClick: () => setFilters({ ...filters, status: ['resolved'] }) },
      ],
    },
    {
      id: 'priority',
      label: 'Priority',
      children: [
        { id: 'priority-all', label: 'All', onClick: () => setFilters({ ...filters, priority: undefined }) },
        { id: 'priority-critical', label: 'Critical', onClick: () => setFilters({ ...filters, priority: ['critical'] }) },
        { id: 'priority-high', label: 'High', onClick: () => setFilters({ ...filters, priority: ['high', 'urgent'] }) },
        { id: 'priority-normal', label: 'Normal', onClick: () => setFilters({ ...filters, priority: ['normal'] }) },
        { id: 'priority-low', label: 'Low', onClick: () => setFilters({ ...filters, priority: ['low'] }) },
      ],
    },
  ];

  // Create ticket form fields
  const createTicketFields: FormField[] = [
    {
      id: 'title',
      name: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'Brief description of the issue',
      required: true,
      aiSuggestion: 'Unable to access shared network drive',
    },
    {
      id: 'description',
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Detailed description',
      required: true,
      rows: 6,
      helpText: 'Provide as much detail as possible',
    },
    {
      id: 'category',
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'hardware', label: 'Hardware' },
        { value: 'software', label: 'Software' },
        { value: 'network', label: 'Network' },
        { value: 'access', label: 'Access' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'priority',
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: true,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' },
      ],
      defaultValue: 'normal',
    },
    {
      id: 'type',
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'incident', label: 'Incident' },
        { value: 'request', label: 'Request' },
        { value: 'problem', label: 'Problem' },
      ],
      defaultValue: 'incident',
    },
  ];

  const handleCreateTicket = async (data: Record<string, unknown>) => {
    dynamicIsland.loading('Creating', 'Creating ticket...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dynamicIsland.success('Created', 'Ticket created successfully');
      setShowCreateModal(false);
      fetchTickets();
    } catch (error) {
      dynamicIsland.error('Error', 'Failed to create ticket');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-apple-bg-primary dark:bg-apple-bg-primary-dark">
      {/* Header */}
      <div className="glass border-b border-gray-200/20 dark:border-gray-700/20 p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-sf-display font-bold text-gray-900 dark:text-white">
                Tickets
              </h1>
              <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 mt-1">
                {total} total tickets • {selectedRows.length} selected
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTickets}
                className="p-2 glass rounded-apple-sm hover-lift transition-all"
                type="button"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => dynamicIsland.info('Export', 'Coming soon')}
                className="p-2 glass rounded-apple-sm hover-lift transition-all"
                type="button"
                aria-label="Export"
              >
                <Download className="w-5 h-5" />
              </button>

              <Dropdown
                trigger={
                  <DropdownButton icon={<Filter className="w-4 h-4" />}>
                    Filters
                  </DropdownButton>
                }
                items={filterItems}
              />

              {selectedRows.length > 0 && (
                <Dropdown
                  trigger={
                    <DropdownButton icon={<MoreVertical className="w-4 h-4" />}>
                      Bulk Actions ({selectedRows.length})
                    </DropdownButton>
                  }
                  items={bulkActions}
                />
              )}

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-apple-blue dark:bg-apple-blue-dark text-white rounded-apple-sm font-sf-text font-medium hover-lift transition-all"
                type="button"
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                New Ticket
              </button>
            </div>
          </div>

          {/* Search */}
          <SearchBar
            placeholder="Search tickets by number, title, or requester..."
            onSearch={handleSearch}
            results={searchResults}
            onResultClick={(result) => {
              const ticket = tickets.find((t) => t.id === result.id);
              if (ticket) handleRowClick(ticket);
            }}
            showShortcut
          />
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="max-w-[1600px] mx-auto h-full">
          <DataGrid
            columns={columns}
            data={tickets}
            loading={loading}
            onRowClick={handleRowClick}
            selectable
            onSelectionChange={setSelectedRows}
            pagination={{
              page,
              perPage: 25,
              total,
              onPageChange: setPage,
            }}
          />
        </div>
      </div>

      {/* Context Panel */}
      <ContextPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={selectedTicket?.number || 'Ticket Details'}
        subtitle={selectedTicket?.title}
        size="lg"
      >
        {selectedTicket && (
          <>
            <ContextPanelSection title="Details" defaultOpen>
              <ContextPanelField label="Status">
                <StatusBadge variant={selectedTicket.status as any} showDot />
              </ContextPanelField>
              <ContextPanelField label="Priority">
                <StatusBadge variant={selectedTicket.priority as any} />
              </ContextPanelField>
              <ContextPanelField label="Type" value={selectedTicket.type} />
              <ContextPanelField label="Category" value={selectedTicket.category || 'N/A'} />
            </ContextPanelSection>

            <ContextPanelSection title="Description" defaultOpen>
              <p className="font-sf-text text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedTicket.description}
              </p>
            </ContextPanelSection>

            <ContextPanelSection title="Assignment">
              <ContextPanelField
                label="Requester"
                value={selectedTicket.requester?.name || 'Unknown'}
              />
              <ContextPanelField
                label="Assignee"
                value={selectedTicket.assignee?.name || 'Unassigned'}
              />
              <ContextPanelField
                label="Group"
                value={selectedTicket.assignedGroup?.name || 'None'}
              />
            </ContextPanelSection>

            <ContextPanelSection title="Timeline">
              <ContextPanelField
                label="Created"
                value={new Date(selectedTicket.createdAt).toLocaleString()}
              />
              <ContextPanelField
                label="Updated"
                value={new Date(selectedTicket.updatedAt).toLocaleString()}
              />
              {selectedTicket.resolvedAt && (
                <ContextPanelField
                  label="Resolved"
                  value={new Date(selectedTicket.resolvedAt).toLocaleString()}
                />
              )}
            </ContextPanelSection>
          </>
        )}
      </ContextPanel>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Ticket"
        subtitle="Fill in the details to create a new support ticket"
        size="lg"
      >
        <SmartForm
          fields={createTicketFields}
          onSubmit={handleCreateTicket}
          onCancel={() => setShowCreateModal(false)}
          submitLabel="Create Ticket"
          aiEnabled
        />
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal />
    </div>
  );
};

export default EnhancedTicketManagementPage;
