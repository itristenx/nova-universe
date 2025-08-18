import React, { useState } from 'react'

export interface TicketCommentsProps {
  ticketId: string
}

// Custom icons for React 19 compatibility
const PaperAirplaneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
)

const UserCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275" />
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Mock comments data
const mockComments = [
  {
    id: '1',
    content: 'Initial issue report received. Investigating the problem.',
    author: 'John Smith',
    role: 'Support Agent',
    timestamp: '2024-01-15T10:30:00Z',
    type: 'internal'
  },
  {
    id: '2',
    content: 'Could you please provide more details about when this started happening?',
    author: 'Sarah Johnson', 
    role: 'Customer Service',
    timestamp: '2024-01-15T11:45:00Z',
    type: 'public'
  },
  {
    id: '3',
    content: 'The issue appears to be related to network connectivity. Escalating to network team.',
    author: 'Mike Davis',
    role: 'Technical Lead',
    timestamp: '2024-01-15T14:20:00Z',
    type: 'internal'
  }
]

export function TicketComments({ ticketId }: TicketCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<'public' | 'internal'>('public')

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    // Here you would typically submit the comment to your API
    console.log('Submitting comment:', { ticketId, content: newComment, type: commentType })
    
    // Reset form
    setNewComment('')
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCommentTypeColor = (type: string) => {
    return type === 'internal' 
      ? 'bg-amber-50 border-amber-200' 
      : 'bg-blue-50 border-blue-200'
  }

  const getCommentTypeBadge = (type: string) => {
    return type === 'internal'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
        
        {mockComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mx-auto w-16 h-16 mb-4 text-gray-300">
              <UserCircleIcon className="w-full h-full" />
            </div>
            <p>No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockComments.map((comment) => (
              <div key={comment.id} className={`p-4 rounded-lg border ${getCommentTypeColor(comment.type)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <UserCircleIcon className="w-6 h-6 text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900">{comment.author}</span>
                      <span className="text-sm text-gray-500 ml-2">{comment.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCommentTypeBadge(comment.type)}`}>
                      {comment.type}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatTimestamp(comment.timestamp)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Add Comment</h4>
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment Type
            </label>
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
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              id="comment"
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Add Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
