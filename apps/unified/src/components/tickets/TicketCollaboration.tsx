import { useState, useEffect } from 'react';
import { cn } from '../../utils';
import { useTicketStore } from '../../stores/tickets';
import { ticketService } from '../../services/tickets';

interface TicketCollaborationProps {
  className?: string;
}

export function TicketCollaboration({ className }: TicketCollaborationProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  // Use ticket store for API integration
  const {
    tickets,
    currentTicket,
    isLoading,
    error,
    loadTickets,
    loadTicket,
    setSelectedTickets,
    clearError,
  } = useTicketStore();

  // Load tickets on component mount
  useEffect(() => {
    loadTickets(1);
  }, [loadTickets]);

  // Auto-select first ticket if available
  useEffect(() => {
    if (!selectedTicket && tickets.length > 0 && tickets[0]) {
      setSelectedTicket(tickets[0].id);
      loadTicket(tickets[0].id);
    }
  }, [tickets, selectedTicket, loadTicket]);

  // Handle ticket selection
  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicket(ticketId);
    loadTicket(ticketId);
    setSelectedTickets([ticketId]);
  };

  // Get selected ticket data
  const selectedTicketData = currentTicket || tickets.find((t) => t.id === selectedTicket);

  // Loading state
  if (isLoading && tickets.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tickets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center">
          <div className="mb-4 text-4xl text-red-500">⚠️</div>
          <p className="mb-2 font-medium text-gray-900 dark:text-white">Error loading tickets</p>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => {
              clearError();
              loadTickets(1);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (tickets.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center">
          <div className="mb-4 text-6xl text-gray-400">🎫</div>
          <p className="mb-2 font-medium text-gray-900 dark:text-white">No tickets found</p>
          <p className="text-gray-600 dark:text-gray-400">
            Create your first ticket to get started
          </p>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const getStatusColor = (status: string) => {
    const config = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      open: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
      canceled: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return config[status as keyof typeof config] || config.open;
  };

  const getPriorityColor = (priority: string) => {
    const config = {
      low: 'bg-gray-100 text-gray-700',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
      critical: 'bg-red-100 text-red-700',
    };
    return config[priority as keyof typeof config] || config.normal;
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicketData) return;

    try {
      await ticketService.addComment(selectedTicketData.id, newComment);
      setNewComment('');

      // Reload ticket to get updated comments
      await loadTicket(selectedTicketData.id);
    } catch (_error) {
      console.error('Failed to add comment:', error);
    }
  };

  const renderTicketList = () => (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => handleTicketSelect(ticket.id)}
          className={cn(
            'cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-md',
            selectedTicket === ticket.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">#{ticket.number}</span>
                <span
                  className={cn(
                    'rounded-full border px-2 py-1 text-xs font-medium',
                    getStatusColor(ticket.status),
                  )}
                >
                  {ticket.status}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    getPriorityColor(ticket.priority),
                  )}
                >
                  {ticket.priority}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                {ticket.title}
              </h3>
              <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {ticket.description}
              </p>
              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                <span>Assigned: {ticket.assignee?.displayName || 'Unassigned'}</span>
                <span>Updated: {formatTimeAgo(ticket.updatedAt)}</span>
                <span>{ticket.comments?.length || 0} comments</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderKanbanBoard = () => {
    const columns = [
      { key: 'new', title: 'New', tickets: tickets.filter((t) => t.status === 'new') },
      { key: 'open', title: 'Open', tickets: tickets.filter((t) => t.status === 'open') },
      { key: 'pending', title: 'Pending', tickets: tickets.filter((t) => t.status === 'pending') },
      {
        key: 'resolved',
        title: 'Resolved',
        tickets: tickets.filter((t) => t.status === 'resolved'),
      },
    ];

    return (
      <div className="grid h-full grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.key} className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">{column.title}</h3>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700">
                {column.tickets.length}
              </span>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
              {column.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketSelect(ticket.id)}
                  className={cn(
                    'cursor-pointer rounded-lg border bg-white p-3 transition-all duration-200 hover:shadow-md dark:bg-gray-800',
                    selectedTicket === ticket.id
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'border-gray-200 dark:border-gray-700',
                  )}
                >
                  <div className="mb-2 flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      #{ticket.number}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-xs font-medium',
                        getPriorityColor(ticket.priority),
                      )}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {ticket.title}
                  </h4>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div>👤 {ticket.assignee?.displayName || 'Unassigned'}</div>
                    <div>🕒 {formatTimeAgo(ticket.updatedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* Ticket List/Board View */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Enhanced Ticket Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Real-time collaboration and workflow management
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center rounded-lg border border-gray-300 p-1 dark:border-gray-600">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  viewMode === 'board'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
              >
                📊 Board
              </button>
            </div>

            <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
              ➕ New Ticket
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1">
          {viewMode === 'list' ? renderTicketList() : renderKanbanBoard()}
        </div>
      </div>

      {/* Ticket Detail Panel */}
      {selectedTicketData && (
        <div className="w-96 overflow-y-auto border-l border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          {/* Ticket Header */}
          <div className="mb-6">
            <div className="mb-3 flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                #{selectedTicketData.number}
              </h2>
              <span
                className={cn(
                  'rounded-full border px-2 py-1 text-xs font-medium',
                  getStatusColor(selectedTicketData.status),
                )}
              >
                {selectedTicketData.status}
              </span>
            </div>
            <h3 className="mb-2 text-base font-medium text-gray-900 dark:text-white">
              {selectedTicketData.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTicketData.description}
            </p>
          </div>

          {/* Ticket Metadata */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                <span
                  className={cn(
                    'ml-2 rounded-full px-2 py-1 text-xs font-medium',
                    getPriorityColor(selectedTicketData.priority),
                  )}
                >
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
                <span className="ml-2 text-gray-900 dark:text-white">
                  {selectedTicketData.type}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <span className="mb-2 block text-sm text-gray-500 dark:text-gray-400">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {selectedTicketData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Watchers */}
            <div>
              <span className="mb-2 block text-sm text-gray-500 dark:text-gray-400">Watchers:</span>
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
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {selectedTicketData.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="border-l-2 border-gray-200 pl-3 dark:border-gray-700"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.author.displayName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{comment.content}</p>
                  {comment.isInternal && (
                    <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                      Internal Note
                    </span>
                  )}
                </div>
              )) || <p className="text-sm text-gray-500 italic">No comments yet</p>}
            </div>

            {/* Add Comment */}
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                💬 Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
