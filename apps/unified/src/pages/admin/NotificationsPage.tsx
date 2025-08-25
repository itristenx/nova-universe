import { useState, useEffect } from 'react';
import { cn } from '@utils/index';
import toast from 'react-hot-toast';
import { AdminNotificationsService } from '@services/adminNotifications';
import type { AdminNotification, AdminNotificationForm } from '@services/adminNotifications';

// Simple icon components
const BellIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const InformationCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
    />
  </svg>
);

const ShieldExclamationIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008zM9.75 9.75a2.25 2.25 0 114.5 0c0 .414-.168.79-.441 1.06l-2.09 2.09A1.5 1.5 0 0010.5 14.25h3a1.5 1.5 0 000-3h-1.69L9.75 9.19V9.75z"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface Notification {
  id: number;
  message: string;
  type: 'system' | 'maintenance' | 'security' | 'announcement';
  level: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  targetRoles?: string[];
}

interface NotificationForm {
  message: string;
  type: 'system' | 'maintenance' | 'security' | 'announcement';
  level: 'info' | 'warning' | 'error' | 'success';
  expiresAt: string;
  targetRoles: string[];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<NotificationForm>({
    message: '',
    type: 'system',
    level: 'info',
    expiresAt: '',
    targetRoles: [],
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const notifications = await AdminNotificationsService.getAll();
      setNotifications(notifications);
    } catch (_error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const createNotification = async () => {
    if (!formData.message.trim()) {
      toast.error('Message is required');
      return;
    }

    setIsCreating(true);
    try {
      const newNotification = await AdminNotificationsService.create(formData);
      setNotifications([newNotification, ...notifications]);
      setShowModal(false);
      resetForm();
      toast.success('Notification created successfully');
    } catch (_error) {
      console.error('Failed to create notification:', error);
      toast.error('Failed to create notification');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteNotification = async (id: number) => {
    if (!window.confirm('Delete this notification? This action cannot be undone.')) return;

    try {
      await AdminNotificationsService.delete(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success('Notification deleted successfully');
    } catch (_error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const resetForm = () => {
    setFormData({
      message: '',
      type: 'system',
      level: 'info',
      expiresAt: '',
      targetRoles: [],
    });
  };

  const getTypeIcon = (type: string, level: string) => {
    if (type === 'security') return <ShieldExclamationIcon className="h-5 w-5" />;
    if (level === 'error') return <ExclamationCircleIcon className="h-5 w-5" />;
    if (level === 'warning') return <ExclamationTriangleIcon className="h-5 w-5" />;
    if (level === 'success') return <CheckCircleIcon className="h-5 w-5" />;
    return <InformationCircleIcon className="h-5 w-5" />;
  };

  const getTypeColor = (type: string, level: string) => {
    if (type === 'security') return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
    if (level === 'error') return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
    if (level === 'warning')
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
    if (level === 'success')
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'announcement':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const availableRoles = [
    'admin',
    'agent',
    'user',
    'tech_lead',
    'hr_lead',
    'ops_lead',
    'cyber_lead',
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              System Notifications
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage system-wide notifications and announcements
            </p>
          </div>
        </div>

        <div className="card p-12 text-center">
          <div className="border-primary-600 mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            System Notifications
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Create and manage system-wide notifications, announcements, and alerts
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <PlusIcon className="h-4 w-4" />
          Create Notification
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="card p-12 text-center">
            <BellIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No notifications created
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Create system notifications to keep users informed about updates, maintenance, and
              important announcements.
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="btn btn-primary"
            >
              <PlusIcon className="h-4 w-4" />
              Create First Notification
            </button>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'card border-l-4 p-6',
                notification.read ? 'opacity-75' : '',
                getTypeColor(notification.type, notification.level).includes('red')
                  ? 'border-l-red-500'
                  : getTypeColor(notification.type, notification.level).includes('yellow')
                    ? 'border-l-yellow-500'
                    : getTypeColor(notification.type, notification.level).includes('green')
                      ? 'border-l-green-500'
                      : 'border-l-blue-500',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start space-x-3">
                  <div
                    className={cn(
                      'flex-shrink-0 rounded-lg p-2',
                      getTypeColor(notification.type, notification.level),
                    )}
                  >
                    {getTypeIcon(notification.type, notification.level)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          getTypeBadgeColor(notification.type),
                        )}
                      >
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </span>

                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          notification.level === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : notification.level === 'warning'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : notification.level === 'success'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                        )}
                      >
                        {notification.level.charAt(0).toUpperCase() + notification.level.slice(1)}
                      </span>

                      {!notification.read && (
                        <span className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mb-2 text-gray-900 dark:text-gray-100">{notification.message}</p>

                    <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <p>Created: {formatDate(notification.createdAt)}</p>
                      {notification.expiresAt && (
                        <p>Expires: {formatDate(notification.expiresAt)}</p>
                      )}
                      {notification.targetRoles && notification.targetRoles.length > 0 && (
                        <p>Target roles: {notification.targetRoles.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notification Modal */}
      {showModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Create System Notification
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                title="Close modal"
                aria-label="Close modal"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label
                  htmlFor="notification-message"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Message *
                </label>
                <textarea
                  id="notification-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Enter your notification message..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="notification-type"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Type
                  </label>
                  <select
                    id="notification-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="system">System</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="security">Security</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="notification-level"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Priority Level
                  </label>
                  <select
                    id="notification-level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="notification-expires"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Expires At (Optional)
                </label>
                <input
                  id="notification-expires"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Target Roles (Leave empty for all users)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              targetRoles: [...formData.targetRoles, role],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              targetRoles: formData.targetRoles.filter((r) => r !== role),
                            });
                          }
                        }}
                        className="text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                        {role.replace('_', ' ').charAt(0).toUpperCase() +
                          role.replace('_', ' ').slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={createNotification}
                disabled={isCreating}
                className="btn btn-primary"
              >
                {isCreating ? 'Creating...' : 'Create Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
