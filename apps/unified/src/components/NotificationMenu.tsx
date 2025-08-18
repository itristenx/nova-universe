import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  BellIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import notificationService from '@services/notifications'
import type { Notification } from '@services/notifications'

const priorityIcons = {
  low: InformationCircleIcon,
  normal: InformationCircleIcon,
  high: ExclamationTriangleIcon,
  urgent: ExclamationTriangleIcon
}

const priorityColors = {
  low: 'text-blue-500',
  normal: 'text-yellow-500', 
  high: 'text-orange-500',
  urgent: 'text-red-500'
}

const NotificationMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const queryClient = useQueryClient()
  const wsRef = useRef<(() => void) | null>(null)

  // Fetch notifications
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 30000 // Refresh every 30 seconds as backup to real-time
  })

  const notifications = notificationsResponse?.data || []

  // Set up real-time updates
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        const cleanup = await notificationService.subscribeToNotifications((notification) => {
          // Add new notification to the cache
          queryClient.setQueryData(['notifications'], (oldData: any) => {
            const notificationsList = oldData?.data || []
            return {
              ...oldData,
              data: [notification, ...notificationsList]
            }
          })
          
          // Show toast for urgent notifications
          if (notification.priority === 'urgent') {
            toast.success(notification.message)
          }
        })
        
        wsRef.current = cleanup
      } catch (error) {
        console.error('Failed to set up notification WebSocket:', error)
      }
    }

    setupWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current()
      }
    }
  }, [queryClient])

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => {
      toast.error('Failed to mark notification as read')
    }
  })

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
    onError: () => {
      toast.error('Failed to mark all notifications as read')
    }
  })

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => {
      toast.error('Failed to delete notification')
    }
  })

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return notification.status === 'unread'
    if (activeTab === 'important') return notification.priority === 'high' || notification.priority === 'urgent'
    return true
  })

  // Count unread notifications
  const unreadCount = notifications.filter((n: Notification) => n.status === 'unread').length

  const handleMarkAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    markAsReadMutation.mutate(id)
  }

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    deleteNotificationMutation.mutate(id)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const renderNotification = (notification: Notification) => {
    const IconComponent = priorityIcons[notification.priority] || InformationCircleIcon
    const iconColor = priorityColors[notification.priority] || 'text-gray-500'

    return (
      <div
        key={notification.id}
        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
          notification.status === 'unread' ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <IconComponent className={`w-5 h-5 mt-0.5 ${iconColor}`} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`text-sm font-medium ${notification.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                {notification.title}
              </h4>
              <div className="flex items-center gap-1 flex-shrink-0">
                {notification.status === 'unread' && (
                  <button
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-blue-600"
                    title="Mark as read"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(notification.id, e)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-600"
                  title="Delete notification"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {formatTimeAgo(notification.createdAt)}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {notification.type}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
                <button 
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Notification settings"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100">
            <div className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'all' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'unread' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('important')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'important' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Important
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <BellIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map(renderNotification)}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <button className="w-full py-2 text-sm text-center text-gray-600 hover:text-gray-900">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Backdrop to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default NotificationMenu
