import React, { useState } from 'react';

export interface TicketCommentsProps {
  ticketId: string;
}

// Custom icons for React 19 compatibility
const PaperAirplaneIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />
  </svg>
);

const UserCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Mock comments data
const mockComments = [
  {
    id: '1',
    content: 'Initial issue report received. Investigating the problem.',
    author: 'John Smith',
    role: 'Support Agent',
    timestamp: '2024-01-15T10:30:00Z',
    type: 'internal',
  },
  {
    id: '2',
    content: 'Could you please provide more details about when this started happening?',
    author: 'Sarah Johnson',
    role: 'Customer Service',
    timestamp: '2024-01-15T11:45:00Z',
    type: 'public',
  },
  {
    id: '3',
    content: 'The issue appears to be related to network connectivity. Escalating to network team.',
    author: 'Mike Davis',
    role: 'Technical Lead',
    timestamp: '2024-01-15T14:20:00Z',
    type: 'internal',
  },
];

export function TicketComments({ ticketId }: TicketCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'public' | 'internal'>('public');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Here you would typically submit the comment to your API
    console.log('Submitting comment:', { ticketId, content: newComment, type: commentType });

    // Reset form
    setNewComment('');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCommentTypeColor = (type: string) => {
    return type === 'internal' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';
  };

  const getCommentTypeBadge = (type: string) => {
    return type === 'internal' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>

        {mockComments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <div className="mx-auto mb-4 h-16 w-16 text-gray-300">
              <UserCircleIcon className="h-full w-full" />
            </div>
            <p>No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockComments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-lg border p-4 ${getCommentTypeColor(comment.type)}`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCircleIcon className="h-6 w-6 text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900">{comment.author}</span>
                      <span className="ml-2 text-sm text-gray-500">{comment.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getCommentTypeBadge(comment.type)}`}
                    >
                      {comment.type}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="mr-1 h-4 w-4" />
                      {formatTimestamp(comment.timestamp)}
                    </div>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t pt-6">
        <h4 className="text-md mb-4 font-medium text-gray-900">Add Comment</h4>
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Comment Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="public"
                  checked={commentType === 'public'}
                  onChange={(e) => setCommentType(e.target.value as 'public' | 'internal')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Public (visible to customer)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="internal"
                  checked={commentType === 'internal'}
                  onChange={(e) => setCommentType(e.target.value as 'public' | 'internal')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Internal (staff only)</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="mb-2 block text-sm font-medium text-gray-700">
              Comment
            </label>
            <textarea
              id="comment"
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PaperAirplaneIcon className="mr-2 h-4 w-4" />
              Add Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
