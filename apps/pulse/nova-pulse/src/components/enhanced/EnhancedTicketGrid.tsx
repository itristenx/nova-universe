import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Ticket } from '../../types'

// Mock API function - replace with actual API call
const getTickets = async (): Promise<Ticket[]> => {
  // This would typically fetch from your API
  return []
}

// Simple icon components as replacements
const Search = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)
const Filter = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
)
const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const Star = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)
const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)
const Tag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)

interface Props {
  tickets?: Ticket[]
  onSelect?: (ticket: Ticket) => void
  view?: 'list' | 'card' | 'kanban'
}

interface FilterState {
  search: string
  status: string[]
  priority: string[]
  assignee: string[]
  category: string[]
  slaStatus: string[]
}

interface EnhancedTicket extends Ticket {
  slaRemaining?: number
  slaStatus: string
  slaHours?: number
}

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
}

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  on_hold: 'bg-gray-100 text-gray-800 border-gray-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-slate-100 text-slate-800 border-slate-200'
}

export const EnhancedTicketGrid: React.FC<Props> = ({ 
  tickets: propTickets, 
  onSelect,
  view: propView = 'card' 
}) => {
  const [viewMode, setViewMode] = useState<'card' | 'list'>(propView === 'kanban' ? 'card' : propView)
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    assignee: [],
    category: [],
    slaStatus: []
  })

  // Use prop tickets or fetch from API
  const { data: apiTickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
    enabled: !propTickets // Only fetch if tickets not provided as props
  })
  
  const tickets = propTickets || apiTickets
  const [sortBy, setSortBy] = useState<string>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Calculate SLA status for each ticket
  const ticketsWithSLA = useMemo(() => {
    return tickets.map(ticket => {
      const now = new Date()
      const dueDate = ticket.dueDate ? new Date(ticket.dueDate) : null
      const slaRemaining = dueDate ? Math.max(0, dueDate.getTime() - now.getTime()) : null
      const slaStatus = slaRemaining === null ? 'no_sla' :
                       slaRemaining <= 0 ? 'breached' :
                       slaRemaining <= 2 * 60 * 60 * 1000 ? 'warning' : 'ok' // 2 hours warning
      
      return {
        ...ticket,
        slaRemaining,
        slaStatus,
        slaHours: slaRemaining ? Math.floor(slaRemaining / (1000 * 60 * 60)) : null
      }
    })
  }, [tickets])

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = ticketsWithSLA.filter(ticket => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!ticket.title.toLowerCase().includes(searchLower) && 
            !ticket.ticketId.toLowerCase().includes(searchLower) &&
            !ticket.requestedBy.name.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(ticket.status)) {
        return false
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(ticket.priority)) {
        return false
      }

      // SLA status filter
      if (filters.slaStatus.length > 0 && !filters.slaStatus.includes(ticket.slaStatus)) {
        return false
      }

      return true
    })

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a]
      let bValue: any = b[sortBy as keyof typeof b]

      // Handle special sorting cases
      if (sortBy === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
      } else if (sortBy === 'slaRemaining') {
        aValue = a.slaRemaining || Infinity
        bValue = b.slaRemaining || Infinity
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [ticketsWithSLA, filters, sortBy, sortOrder])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const SLAIndicator: React.FC<{ ticket: any }> = ({ ticket }) => {
    if (ticket.slaStatus === 'no_sla') return null
    
    const colors = {
      ok: 'text-green-600',
      warning: 'text-yellow-600',
      breached: 'text-red-600'
    }

    return (
      <div className={`flex items-center gap-1 ${colors[ticket.slaStatus as keyof typeof colors]}`}>
        <Clock className="w-3 h-3" />
        <span className="text-xs">
          {ticket.slaStatus === 'breached' ? 'BREACHED' : 
           ticket.slaStatus === 'warning' ? `${ticket.slaHours}h` : 
           `${ticket.slaHours}h`}
        </span>
      </div>
    )
  }

  if (viewMode === 'card') {
    return (
      <div className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  multiple 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.status}
                  onChange={(e) => updateFilter('status', Array.from(e.target.selectedOptions, option => option.value))}
                  aria-label="Filter by status"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select 
                  multiple 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.priority}
                  onChange={(e) => updateFilter('priority', Array.from(e.target.selectedOptions, option => option.value))}
                  aria-label="Filter by priority"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* SLA Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SLA Status</label>
                <select 
                  multiple 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.slaStatus}
                  onChange={(e) => updateFilter('slaStatus', Array.from(e.target.selectedOptions, option => option.value))}
                  aria-label="Filter by SLA status"
                >
                  <option value="ok">On Track</option>
                  <option value="warning">Warning</option>
                  <option value="breached">Breached</option>
                  <option value="no_sla">No SLA</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedTickets.map(ticket => (
            <div
              key={ticket.ticketId}
              onClick={() => onSelect?.(ticket as Ticket)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {ticket.vipWeight && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  <span className="font-mono text-sm text-gray-600">{ticket.ticketId}</span>
                </div>
                <SLAIndicator ticket={ticket} />
              </div>

              {/* Title */}
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{ticket.title}</h3>

              {/* Status and Priority */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]}`}>
                  {ticket.priority}
                </span>
              </div>

              {/* Requestor */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <User className="w-4 h-4" />
                <span>{ticket.requestedBy.name}</span>
              </div>

              {/* Updated Time */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Updated {new Date(ticket.updatedAt).toLocaleDateString()}</span>
              </div>

              {/* Category/Subcategory */}
              {(ticket.category || ticket.subcategory) && (
                <div className="flex items-center gap-1 mt-2">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {[ticket.category, ticket.subcategory].filter(Boolean).join(' / ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredAndSortedTickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tickets found matching your criteria
          </div>
        )}
      </div>
    )
  }

  // List view (enhanced table)
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ticketId')}>
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}>
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('priority')}>
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requestor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('updatedAt')}>
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTickets.map(ticket => (
                <tr 
                  key={ticket.ticketId}
                  onClick={() => onSelect?.(ticket as Ticket)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {ticket.vipWeight && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      <span className="font-mono text-sm">{ticket.ticketId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {ticket.title}
                    </div>
                    {(ticket.category || ticket.subcategory) && (
                      <div className="text-xs text-gray-500">
                        {[ticket.category, ticket.subcategory].filter(Boolean).join(' / ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ticket.requestedBy.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SLAIndicator ticket={ticket} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No results */}
        {filteredAndSortedTickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tickets found matching your criteria
          </div>
        )}
      </div>
    </div>
  )
}
