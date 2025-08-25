import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useTicketStore } from '@stores/tickets';
import { useAuthStore } from '@stores/auth';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { TicketComments } from '@components/tickets/TicketComments';
import { TicketHistory } from '@components/tickets/TicketHistory';
import { TicketAttachments } from '@components/tickets/TicketAttachments';
import { UpdateTicketModal } from '@components/tickets/UpdateTicketModal';
import {
  cn,
  formatRelativeTime,
  getTicketPriorityColor,
  getTicketStatusColor,
  formatTicketNumber,
  getUserDisplayName,
  getInitials,
} from '@utils/index';
import toast from 'react-hot-toast';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTicket, isLoading, error, loadTicket, updateTicket, deleteTicket, clearError } =
    useTicketStore();

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history' | 'attachments'>(
    'details',
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Load ticket on component mount
  useEffect(() => {
    if (id) {
      loadTicket(id);
    }
  }, [id, loadTicket]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  const handleStatusUpdate = async (status: string) => {
    if (!currentTicket) return;

    try {
      await updateTicket(currentTicket.id, { status });
      toast.success(`Ticket ${status}`);
    } catch (_error) {
      toast.error('Failed to update ticket status');
    }
  };

  const handlePriorityUpdate = async (priority: string) => {
    if (!currentTicket) return;

    try {
      await updateTicket(currentTicket.id, { priority });
      toast.success('Priority updated');
    } catch (_error) {
      toast.error('Failed to update priority');
    }
  };

  const handleAssignment = async (assigneeId: string) => {
    if (!currentTicket) return;

    try {
      await updateTicket(currentTicket.id, { assigneeId });
      toast.success('Ticket assigned');
    } catch (_error) {
      toast.error('Failed to assign ticket');
    }
  };

  const handleDelete = async () => {
    if (!currentTicket) return;

    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTicket(currentTicket.id);
      toast.success('Ticket deleted');
      navigate('/tickets');
    } catch (_error) {
      toast.error('Failed to delete ticket');
      setIsDeleting(false);
    }
  };

  if (isLoading && !currentTicket) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Loading ticket..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            Error loading ticket
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => navigate('/tickets')} className="btn btn-secondary">
              Back to Tickets
            </button>
            <button onClick={() => id && loadTicket(id)} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Ticket not found</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The ticket you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/tickets" className="btn btn-primary mt-4">
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentTicket.requester?.id === user?.id;
  const isAssignee = currentTicket.assignee?.id === user?.id;
  const canEdit = isOwner || isAssignee || user?.roles?.some((role) => role.name === 'admin');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/tickets"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatTicketNumber(currentTicket.number, currentTicket.type)}
              </h1>

              <span className={cn('badge', getTicketStatusColor(currentTicket.status))}>
                {currentTicket.status}
              </span>

              <span className={cn('badge', getTicketPriorityColor(currentTicket.priority))}>
                {currentTicket.priority}
              </span>
            </div>

            <h2 className="mt-1 text-xl text-gray-600 dark:text-gray-400">{currentTicket.title}</h2>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowUpdateModal(true)} className="btn btn-secondary">
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>

            <button onClick={handleDelete} disabled={isDeleting} className="btn btn-error">
              {isDeleting ? <LoadingSpinner size="sm" /> : <TrashIcon className="h-4 w-4" />}
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="card mb-6 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { key: 'details', label: 'Details', icon: ClockIcon },
                  { key: 'comments', label: 'Comments', icon: ChatBubbleLeftRightIcon },
                  { key: 'history', label: 'History', icon: ClockIcon },
                  { key: 'attachments', label: 'Attachments', icon: PaperClipIcon },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={cn(
                      'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap',
                      activeTab === tab.key
                        ? 'border-nova-500 text-nova-600 dark:text-nova-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                      Description
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentTicket.description}
                      </p>
                    </div>
                  </div>

                  {currentTicket.tags && currentTicket.tags.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentTicket.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          >
                            <TagIcon className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">
                        {formatRelativeTime(currentTicket.createdAt)}
                      </p>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Last Updated
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">
                        {formatRelativeTime(currentTicket.updatedAt)}
                      </p>
                    </div>

                    {currentTicket.dueDate && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Due Date
                        </h4>
                        <p className="text-gray-900 dark:text-gray-100">
                          {formatRelativeTime(currentTicket.dueDate)}
                        </p>
                      </div>
                    )}

                    {currentTicket.category && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Category
                        </h4>
                        <p className="text-gray-900 dark:text-gray-100">{currentTicket.category}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'comments' && <TicketComments ticketId={currentTicket.id} />}

              {activeTab === 'history' && <TicketHistory ticketId={currentTicket.id} />}

              {activeTab === 'attachments' && <TicketAttachments ticketId={currentTicket.id} />}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="card p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Quick Actions
            </h3>

            <div className="space-y-3">
              {canEdit && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      value={currentTicket.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      className="input"
                    >
                      <option value="new">New</option>
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <select
                      value={currentTicket.priority}
                      onChange={(e) => handlePriorityUpdate(e.target.value)}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assign to
                    </label>
                    <select
                      value={currentTicket.assignee?.id || ''}
                      onChange={(e) => handleAssignment(e.target.value)}
                      className="input"
                    >
                      <option value="">Unassigned</option>
                      <option value="user1">John Doe</option>
                      <option value="user2">Jane Smith</option>
                      <option value="user3">Bob Johnson</option>
                    </select>
                  </div>
                </>
              )}

              {!canEdit && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You don't have permission to modify this ticket.
                </p>
              )}
            </div>
          </div>

          {/* Ticket info */}
          <div className="card p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Ticket Information
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Requester
                </h4>
                <div className="flex items-center gap-2">
                  {currentTicket.requester?.avatar ? (
                    <img
                      src={currentTicket.requester.avatar}
                      alt={getUserDisplayName(currentTicket.requester)}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                      {currentTicket.requester
                        ? getInitials(getUserDisplayName(currentTicket.requester))
                        : 'U'}
                    </div>
                  )}
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {currentTicket.requester
                      ? getUserDisplayName(currentTicket.requester)
                      : 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Assignee
                </h4>
                <div className="flex items-center gap-2">
                  {currentTicket.assignee ? (
                    <>
                      {currentTicket.assignee.avatar ? (
                        <img
                          src={currentTicket.assignee.avatar}
                          alt={getUserDisplayName(currentTicket.assignee)}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                          {getInitials(getUserDisplayName(currentTicket.assignee))}
                        </div>
                      )}
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {getUserDisplayName(currentTicket.assignee)}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <UserIcon className="h-4 w-4" />
                      <span className="text-sm">Unassigned</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Type</h4>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {currentTicket.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update modal */}
      {showUpdateModal && (
        <UpdateTicketModal
          ticket={currentTicket}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={() => {
            setShowUpdateModal(false);
            if (id) loadTicket(id);
          }}
        />
      )}
    </div>
  );
}
