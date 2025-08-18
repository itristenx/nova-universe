import { useState, useEffect } from 'react'
import { cn } from '../../utils'
import { useTicketStore } from '../../stores/tickets'
import { ticketService } from '../../services/tickets'

interface TicketCollaborationProps {
  className?: string
}

export function TicketCollaboration({ className }: TicketCollaborationProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  
  // Use ticket store for API integration
  const {
    tickets,
    currentTicket,
    isLoading,
    error,
    loadTickets,
    loadTicket,
    setSelectedTickets,
    clearError
  } = useTicketStore()

  // Load tickets on component mount
  useEffect(() => {
    loadTickets(1)
  }, [loadTickets])

  // Auto-select first ticket if available
  useEffect(() => {
    if (!selectedTicket && tickets.length > 0 && tickets[0]) {
      setSelectedTicket(tickets[0].id)
      loadTicket(tickets[0].id)
    }
  }, [tickets, selectedTicket, loadTicket])

  // Handle ticket selection
  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicket(ticketId)
    loadTicket(ticketId)
    setSelectedTickets([ticketId])
  }

  // Get selected ticket data
  const selectedTicketData = currentTicket || tickets.find(t => t.id === selectedTicket)

  // Loading state
  if (isLoading && tickets.length === 0) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tickets...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-900 dark:text-white font-medium mb-2">Error loading tickets</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError()
              loadTickets(1)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (tickets.length === 0) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🎫</div>
          <p className="text-gray-900 dark:text-white font-medium mb-2">No tickets found</p>
          <p className="text-gray-600 dark:text-gray-400">Create your first ticket to get started</p>
        </div>
      </div>
    )
  }

  // Helper functions
  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  const getStatusColor = (status: string) => {
    const config = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      open: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
      canceled: 'bg-gray-100 text-gray-600 border-gray-200'
    }
    return config[status as keyof typeof config] || config.open
  }

  const getPriorityColor = (priority: string) => {
    const config = {
      low: 'bg-gray-100 text-gray-700',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
      critical: 'bg-red-100 text-red-700'
    }
    return config[priority as keyof typeof config] || config.normal
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicketData) return
    
    try {
      await ticketService.addComment(selectedTicketData.id, newComment)
      setNewComment('')
      
      // Reload ticket to get updated comments
      await loadTicket(selectedTicketData.id)
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const renderTicketList = () => (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => handleTicketSelect(ticket.id)}
          className={cn(
            "border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedTicket === ticket.id
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  #{ticket.number}
                </span>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full border",
                  getStatusColor(ticket.status)
                )}>
                  {ticket.status}
                </span>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  getPriorityColor(ticket.priority)
                )}>
                  {ticket.priority}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {ticket.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {ticket.description}
              </p>
              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                <span>Assigned: {ticket.assignee?.displayName || 'Unassigned'}</span>
                <span>Updated: {formatTimeAgo(ticket.updatedAt)}</span>
                <span>{ticket.comments?.length || 0} comments</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderKanbanBoard = () => {
    const columns = [
      { key: 'new', title: 'New', tickets: tickets.filter(t => t.status === 'new') },
      { key: 'open', title: 'Open', tickets: tickets.filter(t => t.status === 'open') },
      { key: 'pending', title: 'Pending', tickets: tickets.filter(t => t.status === 'pending') },
      { key: 'resolved', title: 'Resolved', tickets: tickets.filter(t => t.status === 'resolved') }
    ]

    return (
      <div className="grid grid-cols-4 gap-4 h-full">
        {columns.map((column) => (
          <div key={column.key} className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {column.title}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {column.tickets.length}
              </span>
            </div>
            <div className="flex-1 space-y-3 min-h-0 overflow-y-auto">
              {column.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketSelect(ticket.id)}
                  className={cn(
                    "border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800",
                    selectedTicket === ticket.id
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      #{ticket.number}
                    </span>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      getPriorityColor(ticket.priority)
                    )}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {ticket.title}
                  </h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>👤 {ticket.assignee?.displayName || 'Unassigned'}</div>
                    <div>🕒 {formatTimeAgo(ticket.updatedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("h-full flex", className)}>
      {/* Ticket List/Board View */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Enhanced Ticket Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Real-time collaboration and workflow management
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                  viewMode === 'list'
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                  viewMode === 'board'
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                📊 Board
              </button>
            </div>

            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              ➕ New Ticket
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {viewMode === 'list' ? renderTicketList() : renderKanbanBoard()}
        </div>
      </div>

      {/* Ticket Detail Panel */}
      {selectedTicketData && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
          {/* Ticket Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                #{selectedTicketData.number}
              </h2>
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full border",
                getStatusColor(selectedTicketData.status)
              )}>
                {selectedTicketData.status}
              </span>
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
              {selectedTicketData.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTicketData.description}
            </p>
          </div>

          {/* Ticket Metadata */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                <span className={cn(
                  "ml-2 px-2 py-1 text-xs font-medium rounded-full",
                  getPriorityColor(selectedTicketData.priority)
                )}>
                  {selectedTicketData.priority}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Assignee:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {selectedTicketData.assignee?.displayName || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Requester:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {selectedTicketData.requester.displayName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{selectedTicketData.type}</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {selectedTicketData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Watchers */}
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Watchers:</span>
              <div className="space-y-1">
                {selectedTicketData.watchers?.map((watcher) => (
                  <div key={watcher.id} className="text-sm text-gray-900 dark:text-white">
                    👤 {watcher.displayName}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Activity & Comments
            </h4>
            
            {/* Comments List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedTicketData.comments?.map((comment) => (
                <div key={comment.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.author.displayName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {comment.content}
                  </p>
                  {comment.isInternal && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-full">
                      Internal Note
                    </span>
                  )}
                </div>
              )) || (
                <p className="text-sm text-gray-500 italic">No comments yet</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💬 Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
