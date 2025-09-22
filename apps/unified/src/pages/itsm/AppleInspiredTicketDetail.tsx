import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { ticketService } from '@services/tickets';
import { AppleInspiredLayout } from '@components/layout/AppleInspiredLayout';
import { AppleCard, AppleCardHeader, AppleCardContent } from '@components/design-system/AppleCard';
import { AppleButton, AppleButtonGroup } from '@components/design-system/AppleButton';
import { AppleTextarea, AppleSelect } from '@components/design-system/AppleForm';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { cn, formatRelativeTime } from '@utils/index';
import toast from 'react-hot-toast';
import type { Ticket } from '@/types';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  type: 'comment' | 'status_change' | 'assignment';
}

export default function AppleInspiredTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (id) {
      loadTicket(id);
    }
  }, [id]);

  const loadTicket = async (ticketId: string) => {
    try {
      setIsLoading(true);
      const ticketData = await ticketService.getTicketById(ticketId);
      setTicket(ticketData);
      setNewStatus(ticketData.status);
      
      // Mock comments for now - replace with real API call
      setComments([
        {
          id: '1',
          content: 'Ticket created by user',
          author: 'System',
          createdAt: ticketData.createdAt,
          type: 'status_change',
        },
        {
          id: '2',
          content: 'I\'m experiencing this issue when trying to access the application. The error appears consistently.',
          author: typeof ticketData.requester === 'string' ? ticketData.requester : ticketData.requester?.displayName || 'Unknown',
          createdAt: ticketData.createdAt,
          type: 'comment',
        },
      ]);
    } catch (error) {
      console.error('Failed to load ticket:', error);
      toast.error('Failed to load ticket details');
      navigate('/tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!ticket || !newStatus) return;

    try {
      setIsUpdating(true);
      await ticketService.updateTicket(ticket.id, { status: newStatus as any });
      
      const updatedTicket = { ...ticket, status: newStatus as any };
      setTicket(updatedTicket);
      
      // Add status change comment
      const statusComment: Comment = {
        id: Date.now().toString(),
        content: `Status changed to ${newStatus}`,
        author: 'Current User',
        createdAt: new Date().toISOString(),
        type: 'status_change',
      };
      setComments(prev => [...prev, statusComment]);
      
      setShowStatusUpdate(false);
      toast.success('Ticket status updated successfully');
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      toast.error('Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!ticket || !newComment.trim()) return;

    try {
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: 'Current User',
        createdAt: new Date().toISOString(),
        type: 'comment',
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;
    
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        await ticketService.deleteTicket(ticket.id);
        toast.success('Ticket deleted successfully');
        navigate('/tickets');
      } catch (error) {
        console.error('Failed to delete ticket:', error);
        toast.error('Failed to delete ticket');
      }
    }
  };

  if (isLoading) {
    return (
      <AppleInspiredLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="xl" text="Loading ticket details..." />
        </div>
      </AppleInspiredLayout>
    );
  }

  if (!ticket) {
    return (
      <AppleInspiredLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Ticket not found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The ticket you're looking for doesn't exist or has been deleted.
            </p>
            <Link to="/tickets">
              <AppleButton variant="primary">
                Back to Tickets
              </AppleButton>
            </Link>
          </div>
        </div>
      </AppleInspiredLayout>
    );
  }

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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <span>{config.icon}</span>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
    { value: 'canceled', label: 'Canceled' },
  ];

  return (
    <AppleInspiredLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <AppleButton
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => navigate(-1)}
            >
              Back
            </AppleButton>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-3 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ticket #{ticket.id.slice(0, 8)}
              </h1>
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
            </div>
            <AppleButtonGroup>
              <AppleButton
                variant="secondary"
                size="sm"
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => setShowStatusUpdate(!showStatusUpdate)}
              >
                Edit
              </AppleButton>
              <AppleButton
                variant="danger"
                size="sm"
                icon={<TrashIcon className="w-4 h-4" />}
                onClick={handleDeleteTicket}
              >
                Delete
              </AppleButton>
            </AppleButtonGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <AppleCard variant="elevated">
              <AppleCardHeader
                title={ticket.title}
                subtitle="Ticket Description"
              />
              <AppleCardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>
              </AppleCardContent>
            </AppleCard>

            {/* Status Update */}
            {showStatusUpdate && (
              <AppleCard variant="filled" className="border-l-4 border-l-nova-500">
                <AppleCardContent>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Update Status
                    </h3>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <AppleSelect
                          label="New Status"
                          value={newStatus}
                          onChange={setNewStatus}
                          options={statusOptions}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <AppleButton
                          variant="primary"
                          onClick={handleStatusUpdate}
                          loading={isUpdating}
                          disabled={newStatus === ticket.status}
                        >
                          Update
                        </AppleButton>
                        <AppleButton
                          variant="ghost"
                          onClick={() => setShowStatusUpdate(false)}
                        >
                          Cancel
                        </AppleButton>
                      </div>
                    </div>
                  </div>
                </AppleCardContent>
              </AppleCard>
            )}

            {/* Comments */}
            <AppleCard variant="elevated">
              <AppleCardHeader
                title="Activity"
                subtitle={`${comments.length} activities`}
                action={
                  <AppleButton
                    variant="ghost"
                    size="sm"
                    icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
                  />
                }
              />
              <AppleCardContent>
                <div className="space-y-6">
                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                            comment.type === 'status_change'
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          )}>
                            {comment.type === 'status_change' ? (
                              <CheckCircleIcon className="w-4 h-4" />
                            ) : (
                              comment.author.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {comment.author}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(new Date(comment.createdAt))}
                            </span>
                            {comment.type === 'status_change' && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                Status Change
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="space-y-3">
                      <AppleTextarea
                        label="Add a comment"
                        value={newComment}
                        onChange={setNewComment}
                        placeholder="Write your comment here..."
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <AppleButton
                          variant="primary"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          icon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
                        >
                          Add Comment
                        </AppleButton>
                      </div>
                    </div>
                  </div>
                </div>
              </AppleCardContent>
            </AppleCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Information */}
            <AppleCard variant="filled">
              <AppleCardHeader
                title="Ticket Information"
                subtitle="Details & metadata"
              />
              <AppleCardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Requester</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {typeof ticket.requester === 'string' ? ticket.requester : ticket.requester?.displayName || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TagIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {ticket.category || 'Other'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatRelativeTime(new Date(ticket.createdAt))}
                      </p>
                    </div>
                  </div>

                  {ticket.updatedAt && (
                    <div className="flex items-center gap-3">
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatRelativeTime(new Date(ticket.updatedAt))}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </AppleCardContent>
            </AppleCard>

            {/* Quick Actions */}
            <AppleCard variant="filled">
              <AppleCardHeader
                title="Quick Actions"
                subtitle="Common operations"
              />
              <AppleCardContent>
                <div className="space-y-3">
                  <AppleButton
                    variant="secondary"
                    fullWidth
                    icon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
                    onClick={() => document.querySelector<HTMLTextAreaElement>('textarea')?.focus()}
                  >
                    Add Comment
                  </AppleButton>
                  <AppleButton
                    variant="secondary"
                    fullWidth
                    icon={<PaperClipIcon className="w-4 h-4" />}
                  >
                    Add Attachment
                  </AppleButton>
                  <AppleButton
                    variant="secondary"
                    fullWidth
                    icon={<UserIcon className="w-4 h-4" />}
                  >
                    Assign to Me
                  </AppleButton>
                </div>
              </AppleCardContent>
            </AppleCard>
          </div>
        </div>
      </div>
    </AppleInspiredLayout>
  );
}