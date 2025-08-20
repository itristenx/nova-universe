import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn, formatRelativeTime, getTicketPriorityColor, getTicketStatusColor } from '@utils/index'
import { ticketService, type TicketFilters, type BulkUpdateData } from '@services/tickets'
import type { Ticket } from '@/types'
import toast from 'react-hot-toast'

type ViewMode = 'card' | 'list' | 'kanban'
type SortField = 'priority' | 'status' | 'createdAt' | 'updatedAt' | 'assignee'
type SortDirection = 'asc' | 'desc'

interface FilterState {
  query: string
  status: string[]
  priority: string[]
  assignee: string[]
  category: string[]
  type: string[]
}

interface Props {
  onSelect?: (ticket: Ticket) => void
  onBulkUpdate?: (ticketIds: string[], updates: Partial<Ticket>) => void
  view?: ViewMode
}

export default function EnhancedTicketGrid({
  onSelect,
  view: propView = 'card'
}: Props) {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>(propView)
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    status: [],
    priority: [],
    assignee: [],
    category: [],
    type: []
  })

  // Load tickets with pagination
  const { 
    data: ticketsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['tickets', currentPage, filters, sortField, sortDirection],
    queryFn: async () => {
      const ticketFilters: TicketFilters = {}
      
      if (filters.query) {
        ticketFilters.query = filters.query
      }
      if (filters.status.length > 0) {
        ticketFilters.status = filters.status
      }
      if (filters.priority.length > 0) {
        ticketFilters.priority = filters.priority
      }
      if (filters.assignee.length > 0) {
        ticketFilters.assignee = filters.assignee
      }
      if (filters.category.length > 0) {
        ticketFilters.category = filters.category
      }
      if (filters.type.length > 0) {
        ticketFilters.type = filters.type
      }
      
      const sortOptions = [{
        field: sortField,
        direction: sortDirection
      }]
      
      return await ticketService.getTickets(currentPage, 25, ticketFilters, sortOptions)
    }
  })

  const tickets = ticketsData?.data || []
  const totalPages = ticketsData?.meta?.totalPages || 1

  // Bulk update mutation using real service
  const bulkUpdateMutation = useMutation({
    mutationFn: async (data: { ticketIds: string[], updates: any }) => {
      const bulkData: BulkUpdateData = {
        ticketIds: data.ticketIds,
        updates: data.updates
      }
      return await ticketService.bulkUpdateTickets(bulkData)
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setSelectedTickets(new Set())
      toast.success(`${result.updated} tickets updated successfully`)
      if (result.failed > 0) {
        toast.error(`${result.failed} tickets failed to update`)
      }
    },
    onError: () => {
      toast.error('Failed to update tickets')
    }
  })

  // Handle sorting
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }, [sortField, sortDirection])

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }, [])

  // Handle ticket selection
  const handleTicketSelect = useCallback((ticketId: string) => {
    setSelectedTickets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId)
      } else {
        newSet.add(ticketId)
      }
      return newSet
    })
  }, [])

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string, value?: any) => {
    if (selectedTickets.size === 0) {
      toast.error('No tickets selected')
      return
    }

    const updates: any = {}
    switch (action) {
      case 'assign':
        updates.assigneeId = value
        break
      case 'status':
        updates.status = value
        break
      case 'priority':
        updates.priority = value
        break
      default:
        return
    }

    bulkUpdateMutation.mutate({
      ticketIds: Array.from(selectedTickets),
      updates
    })
  }, [selectedTickets, bulkUpdateMutation])

  // Render sort indicator
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4" /> : 
      <ArrowDownIcon className="h-4 w-4" />
  }

  // Render ticket card
  const renderTicketCard = (ticket: Ticket) => (
    <div
      key={ticket.id}
      className={cn(
        'group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md',
        selectedTickets.has(ticket.id) && 'ring-2 ring-blue-500'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={selectedTickets.has(ticket.id)}
            onChange={() => handleTicketSelect(ticket.id)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label={`Select ticket ${ticket.number}`}
          />
          <div className="flex-1 min-w-0">
            <Link
              to={`/tickets/${ticket.id}`}
              className="block hover:underline"
              onClick={() => onSelect?.(ticket)}
            >
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {ticket.title}
              </h3>
              <p className="text-xs text-gray-500">#{ticket.number}</p>
            </Link>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={cn(
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                getTicketStatusColor(ticket.status)
              )}>
                {ticket.status}
              </span>
              
              <span className={cn(
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                getTicketPriorityColor(ticket.priority)
              )}>
                {ticket.priority}
              </span>
              
              {ticket.category && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                  {ticket.category}
                </span>
              )}
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              <p>Requested by: {ticket.requester.firstName} {ticket.requester.lastName}</p>
              {ticket.assignee && (
                <p>Assigned to: {ticket.assignee.firstName} {ticket.assignee.lastName}</p>
              )}
              <p>Updated: {formatRelativeTime(ticket.updatedAt)}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {ticket.sla && (
            <div className="text-right">
              <ClockIcon className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <button
            type="button"
            className="text-gray-400 hover:text-yellow-500"
            aria-label="Bookmark ticket"
          >
            <BookmarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  // Render list view
  const renderListView = () => (
    <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedTickets.size === tickets.length && tickets.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTickets(new Set(tickets.map((t: Ticket) => t.id)))
                  } else {
                    setSelectedTickets(new Set())
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label="Select all tickets"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center space-x-1">
                <span>Ticket</span>
                {renderSortIcon('createdAt')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {renderSortIcon('status')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('priority')}
            >
              <div className="flex items-center space-x-1">
                <span>Priority</span>
                {renderSortIcon('priority')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('assignee')}
            >
              <div className="flex items-center space-x-1">
                <span>Assignee</span>
                {renderSortIcon('assignee')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('updatedAt')}
            >
              <div className="flex items-center space-x-1">
                <span>Updated</span>
                {renderSortIcon('updatedAt')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map((ticket: Ticket) => (
            <tr 
              key={ticket.id}
              className={cn(
                'hover:bg-gray-50',
                selectedTickets.has(ticket.id) && 'bg-blue-50'
              )}
            >
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedTickets.has(ticket.id)}
                  onChange={() => handleTicketSelect(ticket.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`Select ticket ${ticket.number}`}
                />
              </td>
              <td className="px-6 py-4">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="block hover:underline"
                  onClick={() => onSelect?.(ticket)}
                >
                  <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                  <div className="text-sm text-gray-500">#{ticket.number}</div>
                </Link>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                  getTicketStatusColor(ticket.status)
                )}>
                  {ticket.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                  getTicketPriorityColor(ticket.priority)
                )}>
                  {ticket.priority}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {ticket.assignee ? 
                  `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 
                  'Unassigned'
                }
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatRelativeTime(ticket.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load tickets</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['tickets'] })}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
          <p className="text-gray-600">
            {ticketsData?.meta?.total || 0} total tickets
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search tickets"
            />
          </div>
          
          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 border rounded-md',
              showFilters ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
            )}
            aria-label="Toggle filters"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
          
          {/* View mode toggle */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'px-3 py-2 text-sm font-medium border border-r-0 rounded-l-md',
                viewMode === 'card' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
              )}
              aria-label="Card view"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-2 text-sm font-medium border rounded-r-md',
                viewMode === 'list' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
              )}
              aria-label="List view"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                multiple
                value={filters.status}
                onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by status"
              >
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            {/* Priority filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                multiple
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by priority"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                multiple
                value={filters.category}
                onChange={(e) => handleFilterChange('category', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by category"
              >
                <option value="it">IT</option>
                <option value="hr">HR</option>
                <option value="ops">Operations</option>
                <option value="cyber">Cybersecurity</option>
              </select>
            </div>
            
            {/* Type filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                multiple
                value={filters.type}
                onChange={(e) => handleFilterChange('type', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by type"
              >
                <option value="incident">Incident</option>
                <option value="request">Request</option>
                <option value="problem">Problem</option>
                <option value="change">Change</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {selectedTickets.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700">
              {selectedTickets.size} ticket{selectedTickets.size === 1 ? '' : 's'} selected
            </p>
            <div className="flex items-center space-x-2">
              <select
                onChange={(e) => e.target.value && handleBulkAction('status', e.target.value)}
                className="text-sm border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
                aria-label="Bulk update status"
              >
                <option value="">Update Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              
              <select
                onChange={(e) => e.target.value && handleBulkAction('priority', e.target.value)}
                className="text-sm border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
                aria-label="Bulk update priority"
              >
                <option value="">Update Priority</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
              
              <button
                onClick={() => setSelectedTickets(new Set())}
                className="text-sm text-blue-700 hover:text-blue-900"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : tickets.length > 0 ? (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tickets.map(renderTicketCard)}
            </div>
          ) : (
            renderListView()
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      aria-label="Previous page"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          {page}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      aria-label="Next page"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No tickets found</p>
          <Link 
            to="/tickets/new"
            className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Create your first ticket
          </Link>
        </div>
      )}
    </div>
  )
}
