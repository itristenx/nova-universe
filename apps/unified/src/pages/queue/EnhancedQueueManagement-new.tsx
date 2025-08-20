import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  QueueListIcon,
  UserGroupIcon,
  ClockIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn, formatRelativeTime } from '@utils/index'
import { ticketService } from '@services/tickets'
import { pulseService } from '@services/pulse'
import type { Ticket } from '@/types'
import toast from 'react-hot-toast'

interface Queue {
  id: string
  name: string
  description: string
  ticketCount: number
  avgWaitTime: number
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical'
  assignedAgents: number
  slaBreached: number
  status: 'active' | 'paused' | 'maintenance'
  rules: QueueRule[]
}

interface QueueRule {
  id: string
  type: 'priority' | 'category' | 'assignee' | 'age' | 'custom'
  condition: string
  value: string
  enabled: boolean
}

interface Props {
  onQueueSelect?: (queue: Queue) => void
  onTicketSelect?: (ticket: Ticket) => void
  compact?: boolean
}

export default function EnhancedQueueManagement({ 
  onQueueSelect, 
  onTicketSelect, 
  compact = false 
}: Props) {
  const queryClient = useQueryClient()
  
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null)
  const [filterText, setFilterText] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'tickets' | 'priority' | 'wait_time'>('tickets')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Load queue metrics from pulse API
  const { data: queueMetrics, isLoading: queuesLoading } = useQuery({
    queryKey: ['queue-metrics'],
    queryFn: () => pulseService.getQueueMetrics(),
    refetchInterval: autoRefresh ? 30000 : false
  })

  // Transform queue metrics into Queue format
  const queues: Queue[] = queueMetrics?.map(metric => ({
    id: metric.queue_name.toLowerCase().replace(/\s+/g, '-'),
    name: metric.queue_name,
    description: `${metric.queue_name} support queue`,
    ticketCount: metric.tickets_in_queue,
    avgWaitTime: metric.avg_wait_time_minutes / 60, // Convert minutes to hours
    priority: metric.tickets_in_queue > 20 ? 'high' : 
             metric.tickets_in_queue > 10 ? 'normal' : 'low',
    assignedAgents: metric.agents_available,
    slaBreached: metric.sla_breach_count || 0,
    status: metric.agents_available > 0 ? 'active' : 'paused',
    rules: []
  })) || []

  // Load tickets for selected queue
  const { data: queueTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['queue-tickets', selectedQueue],
    queryFn: async () => {
      if (!selectedQueue) return []
      
      // Filter tickets by queue category
      const filters = { category: [selectedQueue] }
      const response = await ticketService.getTickets(1, 50, filters)
      return response.data
    },
    enabled: !!selectedQueue,
    refetchInterval: autoRefresh ? 30000 : false // Auto-refresh every 30 seconds
  })

  // Queue assignment mutation (for future use)
  useMutation({
    mutationFn: async ({ ticketId, queueId }: { ticketId: string, queueId: string }) => {
      // Future: Real API call for queue assignment
      console.log('Assigning ticket to queue:', { ticketId, queueId })
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-tickets'] })
      toast.success('Ticket assigned to queue')
    },
    onError: () => {
      toast.error('Failed to assign ticket')
    }
  })

  const handleQueueSelect = useCallback((queue: Queue) => {
    setSelectedQueue(queue.id)
    onQueueSelect?.(queue)
  }, [onQueueSelect])

  const handleTicketSelect = useCallback((ticket: Ticket) => {
    onTicketSelect?.(ticket)
  }, [onTicketSelect])

  const filteredQueues = queues.filter(queue =>
    queue.name.toLowerCase().includes(filterText.toLowerCase()) ||
    queue.description.toLowerCase().includes(filterText.toLowerCase())
  )

  const sortedQueues = filteredQueues.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'tickets':
        return b.ticketCount - a.ticketCount
      case 'priority':
        const priorityOrder = { critical: 5, urgent: 4, high: 3, normal: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'wait_time':
        return b.avgWaitTime - a.avgWaitTime
      default:
        return 0
    }
  })

  const getPriorityColor = (priority: Queue['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-700 bg-red-100'
      case 'urgent':
        return 'text-red-600 bg-red-50'
      case 'high':
        return 'text-orange-600 bg-orange-50'
      case 'normal':
        return 'text-blue-600 bg-blue-50'
      case 'low':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: Queue['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100'
      case 'paused':
        return 'text-yellow-700 bg-yellow-100'
      case 'maintenance':
        return 'text-gray-700 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatWaitTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    }
    return `${hours.toFixed(1)}h`
  }

  if (compact) {
    if (queuesLoading) {
      return (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Active Queues</h3>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'p-1 rounded',
              autoRefresh ? 'text-blue-600' : 'text-gray-400'
            )}
            aria-label={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {sortedQueues.slice(0, 5).map((queue) => (
            <div
              key={queue.id}
              onClick={() => handleQueueSelect(queue)}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <QueueListIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{queue.name}</span>
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                  getPriorityColor(queue.priority)
                )}>
                  {queue.priority}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{queue.ticketCount}</span>
                <ChevronRightIcon className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Queue Management</h1>
          <p className="text-gray-600">
            Monitor and manage support queues
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search queues..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search queues"
            />
          </div>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            aria-label="Sort queues by"
          >
            <option value="tickets">Sort by Tickets</option>
            <option value="priority">Sort by Priority</option>
            <option value="wait_time">Sort by Wait Time</option>
            <option value="name">Sort by Name</option>
          </select>
          
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 border rounded-md',
              autoRefresh ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
            )}
            aria-label={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span className="text-sm">Auto-refresh</span>
          </button>
        </div>
      </div>

      {queuesLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 mt-4">Loading queue metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queues list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Queues</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {sortedQueues.map((queue) => (
                  <div
                    key={queue.id}
                    onClick={() => handleQueueSelect(queue)}
                    className={cn(
                      'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                      selectedQueue === queue.id && 'bg-blue-50 border-r-2 border-blue-500'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {queue.name}
                          </h4>
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                            getStatusColor(queue.status)
                          )}>
                            {queue.status}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {queue.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <QueueListIcon className="h-3 w-3 mr-1" />
                              {queue.ticketCount}
                            </span>
                            <span className="flex items-center">
                              <UserGroupIcon className="h-3 w-3 mr-1" />
                              {queue.assignedAgents}
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatWaitTime(queue.avgWaitTime)}
                            </span>
                          </div>
                          
                          {queue.slaBreached > 0 && (
                            <span className="flex items-center text-red-600">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              {queue.slaBreached}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <span className={cn(
                        'ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                        getPriorityColor(queue.priority)
                      )}>
                        {queue.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Queue details and tickets */}
          <div className="lg:col-span-2">
            {selectedQueue ? (
              <div className="space-y-6">
                {/* Selected queue details */}
                {(() => {
                  const queue = queues.find(q => q.id === selectedQueue)
                  if (!queue) return null
                  
                  return (
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{queue.name}</h3>
                          <p className="text-sm text-gray-600">{queue.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                            getPriorityColor(queue.priority)
                          )}>
                            {queue.priority}
                          </span>
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                            getStatusColor(queue.status)
                          )}>
                            {queue.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-gray-900">{queue.ticketCount}</div>
                          <div className="text-xs text-gray-500">Total Tickets</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-gray-900">{queue.assignedAgents}</div>
                          <div className="text-xs text-gray-500">Agents</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-gray-900">{formatWaitTime(queue.avgWaitTime)}</div>
                          <div className="text-xs text-gray-500">Avg Wait</div>
                        </div>
                        <div className="text-center">
                          <div className={cn(
                            "text-2xl font-semibold",
                            queue.slaBreached > 0 ? 'text-red-600' : 'text-green-600'
                          )}>
                            {queue.slaBreached}
                          </div>
                          <div className="text-xs text-gray-500">SLA Breached</div>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Queue tickets */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Queue Tickets</h3>
                      {ticketsLoading && <LoadingSpinner size="sm" />}
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {queueTickets?.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleTicketSelect(ticket)}
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                #{ticket.number} - {ticket.title}
                              </h4>
                              <span className={cn(
                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                ticket.priority === 'urgent' || ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                ticket.priority === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              )}>
                                {ticket.priority}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {ticket.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Requested by: {ticket.requester.firstName} {ticket.requester.lastName}</span>
                              <span>Created: {formatRelativeTime(ticket.createdAt)}</span>
                              {ticket.assignee && (
                                <span>Assigned to: {ticket.assignee.firstName} {ticket.assignee.lastName}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                              ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                              ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {ticket.status}
                            </span>
                            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {queueTickets?.length === 0 && (
                      <div className="text-center py-8">
                        <QueueListIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No tickets in this queue</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <QueueListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Queue</h3>
                <p className="text-gray-500">
                  Choose a queue from the list to view its details and tickets
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
