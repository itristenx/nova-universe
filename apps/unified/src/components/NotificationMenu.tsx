import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import notificationService from '@services/notifications';
import type { Notification } from '@services/notifications';

const priorityIcons = {
  low: InformationCircleIcon,
  normal: InformationCircleIcon,
  high: ExclamationTriangleIcon,
  urgent: ExclamationTriangleIcon,
};

const priorityColors = {
  low: 'text-blue-500',
  normal: 'text-yellow-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const NotificationMenu: React.FC = () => {
  const { t } = useTranslation(['common', 'notifications']);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();
  const wsRef = useRef<(() => void) | null>(null);

  // Fetch notifications
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 30000, // Refresh every 30 seconds as backup to real-time
  });

  const notifications = notificationsResponse?.data || [];

  // Set up real-time updates
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        const cleanup = await notificationService.subscribeToNotifications((notification) => {
          // Add new notification to the cache
          queryClient.setQueryData(['notifications'], (oldData: any) => {
            const notificationsList = oldData?.data || [];
            return {
              ...oldData,
              data: [notification, ...notificationsList],
            };
          });

          // Show toast for urgent notifications
          if (notification.priority === 'urgent') {
            toast.success(notification.message);
          }
        });

        wsRef.current = cleanup;
      } catch (_error) {
        console.error('Failed to set up notification WebSocket:', error);
      }
    };

    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current();
      }
    };
  }, [queryClient]);

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error(t('notifications:markAsReadError'));
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('notifications:markAllAsReadSuccess'));
    },
    onError: () => {
      toast.error(t('notifications:markAllAsReadError'));
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error(t('notifications:deleteError'));
    },
  });

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return notification.status === 'unread';
    if (activeTab === 'important')
      return notification.priority === 'high' || notification.priority === 'urgent';
    return true;
  });

  // Count unread notifications
  const unreadCount = notifications.filter((n: Notification) => n.status === 'unread').length;

  const handleMarkAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteNotificationMutation.mutate(id);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('notifications:justNow');
    if (diffInMinutes < 60) return t('notifications:minutesAgo', { count: diffInMinutes });

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('notifications:hoursAgo', { count: diffInHours });

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('notifications:daysAgo', { count: diffInDays });

    return date.toLocaleDateString();
  };

  const renderNotification = (notification: Notification) => {
    const IconComponent = priorityIcons[notification.priority] || InformationCircleIcon;
    const iconColor = priorityColors[notification.priority] || 'text-gray-500';

    return (
      <div
        key={notification.id}
        className={`border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 ${
          notification.status === 'unread' ? 'border-l-2 border-l-blue-500 bg-blue-50' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <IconComponent className={`mt-0.5 h-5 w-5 ${iconColor}`} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={`text-sm font-medium ${notification.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}
              >
                {notification.title}
              </h4>
              <div className="flex flex-shrink-0 items-center gap-1">
                {notification.status === 'unread' && (
                  <button
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-blue-600"
                    title={t('notifications:markAsRead')}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(notification.id, e)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-600"
                  title={t('notifications:deleteNotification')}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">{formatTimeAgo(notification.createdAt)}</span>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {notification.type}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t('notifications:title')}</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {t('notifications:markAllRead')}
                  </button>
                )}
                <button
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title={t('notifications:settings')}
                >
                  <Cog6ToothIcon className="h-4 w-4" />
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
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('notifications:all')} ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'unread'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('notifications:unread')} ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('important')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'important'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('notifications:important')}
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-gray-500">
                <BellIcon className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">{t('notifications:noNotifications')}</p>
              </div>
            ) : (
              <div>{filteredNotifications.map(renderNotification)}</div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-gray-100 p-2">
              <button className="w-full py-2 text-center text-sm text-gray-600 hover:text-gray-900">
                {t('notifications:viewAll')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close menu */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default NotificationMenu;
