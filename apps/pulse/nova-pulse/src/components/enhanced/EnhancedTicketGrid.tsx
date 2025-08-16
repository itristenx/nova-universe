import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { listContainer, listItem } from '../system/Motion';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Chip,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ButtonGroup,
} from '@heroui/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ViewColumnsIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { Ticket } from '../../types';

// Mock API function - replace with actual API call
const getTickets = async (): Promise<Ticket[]> => {
  return [];
};

interface Props {
  tickets?: Ticket[];
  onSelect?: (ticket: Ticket) => void;
  onBulkUpdate?: (ticketIds: string[], updates: Partial<Ticket>) => void;
  view?: 'list' | 'card' | 'kanban';
}

type ViewMode = 'card' | 'list' | 'kanban';
type SortField = 'priority' | 'status' | 'created' | 'updated' | 'assignee';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  assignee: string[];
  queue: string[];
  slaStatus: string[];
}

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  isDefault?: boolean;
}

interface EnhancedTicket extends Omit<Ticket, 'slaRemaining'> {
  slaRemaining?: number;
  slaStatus: 'safe' | 'warning' | 'breach' | 'no_sla';
  slaHours?: number;
}

export const EnhancedTicketGrid: React.FC<Props> = ({
  tickets: propTickets,
  onSelect,
  onBulkUpdate,
  view: propView = 'card',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(propView);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    assignee: [],
    queue: [],
    slaStatus: [],
  });

  const savedFilters: SavedFilter[] = [
    {
      id: 'default',
      name: 'My Open Tickets',
      filters: {
        search: '',
        status: ['open', 'in-progress'],
        priority: [],
        assignee: [],
        queue: [],
        slaStatus: [],
      },
      isDefault: true,
    },
    {
      id: 'high-priority',
      name: 'High Priority',
      filters: {
        search: '',
        status: [],
        priority: ['high', 'critical'],
        assignee: [],
        queue: [],
        slaStatus: [],
      },
    },
    {
      id: 'sla-risk',
      name: 'SLA Risk',
      filters: {
        search: '',
        status: [],
        priority: [],
        assignee: [],
        queue: [],
        slaStatus: ['warning', 'breach'],
      },
    },
  ];

  const {
    isOpen: isBulkModalOpen,
    onOpen: onBulkModalOpen,
    onClose: onBulkModalClose,
  } = useDisclosure();

  // Use prop tickets or fetch from API
  const { data: apiTickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
    enabled: !propTickets,
  });

  const tickets = propTickets || apiTickets;

  // Mock data for filtering options
  const filterOptions = {
    status: ['open', 'in-progress', 'pending', 'resolved', 'closed'],
    priority: ['low', 'medium', 'high', 'critical'],
    assignee: ['john.doe', 'jane.smith', 'mike.wilson', 'unassigned'],
    queue: ['support', 'technical', 'billing', 'sales'],
    slaStatus: ['safe', 'warning', 'breach', 'no_sla'],
  };

  // Calculate SLA status for each ticket
  const ticketsWithSLA = useMemo((): EnhancedTicket[] => {
    return tickets.map((ticket) => {
      const now = new Date();
      const dueDate = ticket.dueDate ? new Date(ticket.dueDate) : null;
      const slaRemaining = dueDate
        ? Math.max(0, dueDate.getTime() - now.getTime())
        : ticket.slaRemaining || 0;
      const slaStatus: EnhancedTicket['slaStatus'] =
        dueDate === null
          ? 'no_sla'
          : slaRemaining <= 0
            ? 'breach'
            : slaRemaining <= 2 * 60 * 60 * 1000
              ? 'warning'
              : 'safe'; // 2 hours warning

      return {
        ...ticket,
        slaRemaining,
        slaStatus,
        slaHours: slaRemaining ? Math.floor(slaRemaining / (1000 * 60 * 60)) : undefined,
      };
    });
  }, [tickets]);

  // Enhanced ticket filtering and sorting
  const filteredAndSortedTickets = useMemo(() => {
    const filtered = ticketsWithSLA.filter((ticket) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !ticket.title.toLowerCase().includes(searchTerm) &&
          !ticket.ticketId.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(ticket.status)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(ticket.priority)) {
        return false;
      }

      // Assignee filter
      if (filters.assignee.length > 0) {
        const assigneeName =
          typeof ticket.assignedTo === 'object' ? ticket.assignedTo?.name : ticket.assignedTo;
        if (!filters.assignee.includes(assigneeName || 'unassigned')) {
          return false;
        }
      }

      // SLA Status filter
      if (filters.slaStatus.length > 0 && !filters.slaStatus.includes(ticket.slaStatus)) {
        return false;
      }

      return true;
    });

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'priority': {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        }
        case 'status': {
          aValue = a.status;
          bValue = b.status;
          break;
        }
        case 'created': {
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        }
        case 'updated': {
          aValue = new Date(a.updatedAt || 0).getTime();
          bValue = new Date(b.updatedAt || 0).getTime();
          break;
        }
        case 'assignee': {
          const aAssignee = typeof a.assignedTo === 'object' ? a.assignedTo?.name : a.assignedTo;
          const bAssignee = typeof b.assignedTo === 'object' ? b.assignedTo?.name : b.assignedTo;
          aValue = aAssignee || 'zzz';
          bValue = bAssignee || 'zzz';
          break;
        }
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [ticketsWithSLA, filters, sortField, sortDirection]);

  // Helper functions
  const getSLAColor = (status: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'safe':
        return 'success';
      case 'warning':
        return 'warning';
      case 'breach':
        return 'danger';
      default:
        return 'success';
    }
  };

  const getPriorityColor = (priority: string): 'default' | 'primary' | 'warning' | 'danger' => {
    switch (priority) {
      case 'low':
        return 'default';
      case 'medium':
        return 'primary';
      case 'high':
        return 'warning';
      case 'critical':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusColor = (
    status: string,
  ): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'secondary';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Event handlers
  const handleTicketSelect = useCallback(
    (ticket: Ticket) => {
      onSelect?.(ticket);
    },
    [onSelect],
  );

  const handleBulkSelect = useCallback(
    (ticketId: string, selected: boolean) => {
      const newSelected = new Set(selectedTickets);
      if (selected) {
        newSelected.add(ticketId);
      } else {
        newSelected.delete(ticketId);
      }
      setSelectedTickets(newSelected);
    },
    [selectedTickets],
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedTickets(new Set(filteredAndSortedTickets.map((t) => t.ticketId)));
      } else {
        setSelectedTickets(new Set());
      }
    },
    [filteredAndSortedTickets],
  );

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    },
    [sortField, sortDirection],
  );

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSavedFilterApply = useCallback((filter: SavedFilter) => {
    setFilters(filter.filters);
  }, []);

  const handleBulkUpdate = useCallback(
    (updates: Partial<Ticket>) => {
      if (selectedTickets.size > 0) {
        onBulkUpdate?.(Array.from(selectedTickets), updates);
        setSelectedTickets(new Set());
        onBulkModalClose();
      }
    },
    [selectedTickets, onBulkUpdate, onBulkModalClose],
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUpIcon className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDownIcon className="ml-1 h-3 w-3" />
    );
  };

  const SLAIndicator: React.FC<{ ticket: EnhancedTicket }> = ({ ticket }) => {
    if (ticket.slaStatus === 'no_sla') return null;

    return (
      <div className="flex items-center gap-1">
        <Chip size="sm" color={getSLAColor(ticket.slaStatus)} variant="dot">
          <ClockIcon className="mr-1 h-3 w-3" />
          {ticket.slaStatus === 'breach'
            ? 'BREACHED'
            : ticket.slaStatus === 'warning'
              ? `${ticket.slaHours}h`
              : `${ticket.slaHours}h`}
        </Chip>
      </div>
    );
  };

  // Render components
  const renderTicketCard = (ticket: EnhancedTicket) => {
    const assigneeName =
      typeof ticket.assignedTo === 'object' ? ticket.assignedTo?.name : ticket.assignedTo;

    return (
      <Card
        key={ticket.ticketId}
        className="mb-4 cursor-pointer transition-shadow hover:shadow-md"
        isPressable
        onPress={() => handleTicketSelect(ticket as Ticket)}
      >
        <CardHeader className="flex items-start justify-between pb-2">
          <div className="flex items-center gap-2">
            <Checkbox
              isSelected={selectedTickets.has(ticket.ticketId)}
              onValueChange={(selected) => handleBulkSelect(ticket.ticketId, selected)}
              onClick={(e) => e.stopPropagation()}
            />
            <div>
              <h4 className="flex items-center gap-1 text-sm font-semibold">
                {ticket.vipWeight && <StarIconSolid className="h-4 w-4 text-yellow-500" />}#
                {ticket.ticketId}
              </h4>
              <p className="text-xs text-gray-500">
                {new Date(ticket.createdAt || 0).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Chip size="sm" color={getPriorityColor(ticket.priority)} variant="flat">
              {ticket.priority}
            </Chip>
            <SLAIndicator ticket={ticket} />
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium">{ticket.title}</h3>
          <div className="flex items-center justify-between">
            <Chip size="sm" color={getStatusColor(ticket.status)} variant="flat">
              {ticket.status}
            </Chip>
            <span className="text-xs text-gray-500">{assigneeName || 'Unassigned'}</span>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderTicketRow = (ticket: EnhancedTicket) => {
    const assigneeName =
      typeof ticket.assignedTo === 'object' ? ticket.assignedTo?.name : ticket.assignedTo;

    return (
      <TableRow
        key={ticket.ticketId}
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => handleTicketSelect(ticket as Ticket)}
      >
        <TableCell>
          <Checkbox
            isSelected={selectedTickets.has(ticket.ticketId)}
            onValueChange={(selected) => handleBulkSelect(ticket.ticketId, selected)}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {ticket.vipWeight && <StarIconSolid className="h-4 w-4 text-yellow-500" />}
            <span className="font-medium">#{ticket.ticketId}</span>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <p className="line-clamp-1 font-medium">{ticket.title}</p>
            <p className="line-clamp-1 text-xs text-gray-500">{ticket.category || 'No category'}</p>
          </div>
        </TableCell>
        <TableCell>
          <Chip size="sm" color={getPriorityColor(ticket.priority)} variant="flat">
            {ticket.priority}
          </Chip>
        </TableCell>
        <TableCell>
          <Chip size="sm" color={getStatusColor(ticket.status)} variant="flat">
            {ticket.status}
          </Chip>
        </TableCell>
        <TableCell>
          <span className="text-sm">{assigneeName || 'Unassigned'}</span>
        </TableCell>
        <TableCell>
          <SLAIndicator ticket={ticket} />
        </TableCell>
        <TableCell>
          <span className="text-xs text-gray-500">
            {new Date(ticket.updatedAt || ticket.createdAt || 0).toLocaleDateString()}
          </span>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Tickets ({filteredAndSortedTickets.length})</h2>
          {selectedTickets.size > 0 && <Badge color="primary">{selectedTickets.size}</Badge>}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <Input
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            startContent={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
            className="w-64"
            size="sm"
          />

          {/* Saved Filters */}
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" size="sm" startContent={<BookmarkIcon className="h-4 w-4" />}>
                Saved Filters
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {savedFilters.map((filter) => (
                <DropdownItem
                  key={filter.id}
                  onClick={() => handleSavedFilterApply(filter)}
                  className={filter.isDefault ? 'font-medium' : ''}
                >
                  {filter.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Filters */}
          <Button
            variant={showFilters ? 'solid' : 'flat'}
            size="sm"
            startContent={<FunnelIcon className="h-4 w-4" />}
            onPress={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>

          {/* View Mode */}
          <ButtonGroup size="sm">
            <Button
              variant={viewMode === 'card' ? 'solid' : 'flat'}
              isIconOnly
              onPress={() => setViewMode('card')}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'solid' : 'flat'}
              isIconOnly
              onPress={() => setViewMode('list')}
            >
              <ListBulletIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'solid' : 'flat'}
              isIconOnly
              onPress={() => setViewMode('kanban')}
            >
              <ViewColumnsIcon className="h-4 w-4" />
            </Button>
          </ButtonGroup>

          {/* Bulk Actions */}
          {selectedTickets.size > 0 && (
            <Button size="sm" color="primary" variant="flat" onPress={onBulkModalOpen}>
              Bulk Actions ({selectedTickets.size})
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <Select
                label="Status"
                selectionMode="multiple"
                selectedKeys={filters.status}
                onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys))}
                size="sm"
              >
                {filterOptions.status.map((status) => (
                  <SelectItem key={status}>{status}</SelectItem>
                ))}
              </Select>

              <Select
                label="Priority"
                selectionMode="multiple"
                selectedKeys={filters.priority}
                onSelectionChange={(keys) => handleFilterChange('priority', Array.from(keys))}
                size="sm"
              >
                {filterOptions.priority.map((priority) => (
                  <SelectItem key={priority}>{priority}</SelectItem>
                ))}
              </Select>

              <Select
                label="Assignee"
                selectionMode="multiple"
                selectedKeys={filters.assignee}
                onSelectionChange={(keys) => handleFilterChange('assignee', Array.from(keys))}
                size="sm"
              >
                {filterOptions.assignee.map((assignee) => (
                  <SelectItem key={assignee}>{assignee}</SelectItem>
                ))}
              </Select>

              <Select
                label="Queue"
                selectionMode="multiple"
                selectedKeys={filters.queue}
                onSelectionChange={(keys) => handleFilterChange('queue', Array.from(keys))}
                size="sm"
              >
                {filterOptions.queue.map((queue) => (
                  <SelectItem key={queue}>{queue}</SelectItem>
                ))}
              </Select>

              <Select
                label="SLA Status"
                selectionMode="multiple"
                selectedKeys={filters.slaStatus}
                onSelectionChange={(keys) => handleFilterChange('slaStatus', Array.from(keys))}
                size="sm"
              >
                {filterOptions.slaStatus.map((status) => (
                  <SelectItem key={status}>{status}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="flat"
                onPress={() =>
                  setFilters({
                    search: '',
                    status: [],
                    priority: [],
                    assignee: [],
                    queue: [],
                    slaStatus: [],
                  })
                }
              >
                Clear All
              </Button>
              <Button size="sm" color="primary" onPress={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tickets Display */}
      {viewMode === 'card' && (
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={listContainer}
          initial="hidden"
          animate="show"
        >
          {filteredAndSortedTickets.map((t) => (
            <motion.div key={t.ticketId} variants={listItem}>
              {renderTicketCard(t)}
            </motion.div>
          ))}
        </motion.div>
      )}

      {viewMode === 'list' && (
        <Card>
          <CardBody className="p-0">
            <Table removeWrapper selectionMode="none" className="min-h-[400px]">
              <TableHeader>
                <TableColumn width={50}>
                  <Checkbox
                    isSelected={
                      selectedTickets.size === filteredAndSortedTickets.length &&
                      filteredAndSortedTickets.length > 0
                    }
                    isIndeterminate={
                      selectedTickets.size > 0 &&
                      selectedTickets.size < filteredAndSortedTickets.length
                    }
                    onValueChange={handleSelectAll}
                  />
                </TableColumn>
                <TableColumn className="cursor-pointer" onClick={() => handleSort('priority')}>
                  <div className="flex items-center">
                    ID <SortIcon field="priority" />
                  </div>
                </TableColumn>
                <TableColumn>Title</TableColumn>
                <TableColumn className="cursor-pointer" onClick={() => handleSort('priority')}>
                  <div className="flex items-center">
                    Priority <SortIcon field="priority" />
                  </div>
                </TableColumn>
                <TableColumn className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Status <SortIcon field="status" />
                  </div>
                </TableColumn>
                <TableColumn className="cursor-pointer" onClick={() => handleSort('assignee')}>
                  <div className="flex items-center">
                    Assignee <SortIcon field="assignee" />
                  </div>
                </TableColumn>
                <TableColumn>SLA</TableColumn>
                <TableColumn className="cursor-pointer" onClick={() => handleSort('updated')}>
                  <div className="flex items-center">
                    Updated <SortIcon field="updated" />
                  </div>
                </TableColumn>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTickets.map((t) => (
                  <motion.tr
                    key={t.ticketId}
                    variants={listItem}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {renderTicketRow(t)}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {filterOptions.status.map((status) => {
            const statusTickets = filteredAndSortedTickets.filter((t) => t.status === status);
            return (
              <Card key={status} className="min-h-[500px]">
                <CardHeader>
                  <div className="flex w-full items-center justify-between">
                    <h3 className="font-medium capitalize">{status}</h3>
                    <Badge color="primary">{statusTickets.length}</Badge>
                  </div>
                </CardHeader>
                <CardBody className="space-y-2">
                  {statusTickets.map((ticket) => (
                    <Card
                      key={ticket.ticketId}
                      className="cursor-pointer p-3 transition-shadow hover:shadow-md"
                      isPressable
                      onPress={() => handleTicketSelect(ticket as Ticket)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium">#{ticket.ticketId}</span>
                          {ticket.vipWeight && (
                            <StarIconSolid className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="line-clamp-2 text-xs">{ticket.title}</p>
                        <div className="flex items-center justify-between">
                          <Chip size="sm" color={getPriorityColor(ticket.priority)} variant="flat">
                            {ticket.priority}
                          </Chip>
                          <SLAIndicator ticket={ticket} />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedTickets.length === 0 && (
        <Card>
          <CardBody className="py-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <ListBulletIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">No tickets found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
              </div>
              <Button
                color="primary"
                variant="flat"
                onPress={() =>
                  setFilters({
                    search: '',
                    status: [],
                    priority: [],
                    assignee: [],
                    queue: [],
                    slaStatus: [],
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Bulk Actions Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={onBulkModalClose}>
        <ModalContent>
          <ModalHeader>Bulk Actions ({selectedTickets.size} tickets)</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">Change Status</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.status.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="flat"
                      color={getStatusColor(status)}
                      onPress={() => handleBulkUpdate({ status })}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Change Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.priority.map((priority) => (
                    <Button
                      key={priority}
                      size="sm"
                      variant="flat"
                      color={getPriorityColor(priority)}
                      onPress={() => handleBulkUpdate({ priority })}
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Assign To</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.assignee
                    .filter((a) => a !== 'unassigned')
                    .map((assignee) => (
                      <Button
                        key={assignee}
                        size="sm"
                        variant="flat"
                        onPress={() => handleBulkUpdate({ assignedTo: { id: 0, name: assignee } })}
                      >
                        {assignee}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onBulkModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
