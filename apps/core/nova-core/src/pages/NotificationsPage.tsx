import React, { useState, useEffect } from 'react';
import { Button, Card, Modal, Textarea, Select } from '@/components/ui';
import { 
  BellIcon, 
  PlusIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldExclamationIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { Notification } from '@/types';

interface NotificationFormData {
  message: string;
  type: 'ticket' | 'system' | 'integration';
  level: 'info' | 'warning' | 'error' | 'critical';
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>({
    message: '',
    type: 'system',
    level: 'info'
  });
  const { addToast } = useToastStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications(); // TODO-LINT: move to async function
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async () => {
    if (!formData.message.trim()) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Message is required',
      });
      return;
    }

    try {
      setCreating(true);
      const newNotification = await api.createNotification({
        message: formData.message,
        type: formData.type,
        level: formData.level,
        read: false
      }); // TODO-LINT: move to async function
      
      setNotifications([newNotification, ...notifications]);
      setShowCreateModal(false);
      resetForm();
      
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Kiosk notification created successfully',
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create notification',
      });
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      message: '',
      type: 'system',
      level: 'info'
    });
  };

  const deleteNotification = async (id: number) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await api.deleteNotification(id); // TODO-LINT: move to async function
        setNotifications(notifications.filter(n => n.id !== id));
        addToast({
          type: 'success',
          title: 'Success',
          description: 'Notification deleted successfully',
        });
      } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
        console.error('Failed to delete notification:', error);
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to delete notification',
        });
      }
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const getNotificationIcon = (type: string, level?: string) => {
    // Use level for more specific icon selection if available
    if (level) {
      switch (level) {
        case 'critical':
          return <ShieldExclamationIcon className="h-5 w-5 text-red-600" />;
        case 'error':
          return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
        case 'warning':
          return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
        case 'info':
          return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
        default:
          return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      }
    }
    
    // Fallback to type-based icons
    switch (type) {
      case 'system':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'integration':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'ticket':
        return <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getNotificationBg = (type: string, level?: string) => {
    // Use level for more specific background selection if available
    if (level) {
      switch (level) {
        case 'critical':
          return 'bg-red-100 border-red-300';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'warning':
          return 'bg-orange-50 border-orange-200';
        case 'info':
          return 'bg-blue-50 border-blue-200';
        default:
          return 'bg-green-50 border-green-200';
      }
    }
    
    // Fallback to type-based backgrounds
    switch (type) {
      case 'system':
        return 'bg-red-50 border-red-200';
      case 'integration':
        return 'bg-yellow-50 border-yellow-200';
      case 'ticket':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kiosk Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage real-time notifications displayed on kiosks
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Kiosk Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <BellIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => n.type === 'system').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Integration</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => n.type === 'integration').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => !n.read).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first notification to get started.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={openCreateModal}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Kiosk Notification
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 ${getNotificationBg(notification.type, notification.level)}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type, notification.level)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.message}
                    </p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Type: {notification.type}</span>
                      {notification.level && (
                        <span>Level: {notification.level}</span>
                      )}
                      <span>Created: {formatDate(notification.createdAt)}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        !notification.read 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {!notification.read ? 'Unread' : 'Read'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Kiosk Notification Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Create Kiosk Notification"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Kiosk Notification System
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Create real-time notifications that will be displayed on all active kiosks. Notifications appear as non-dismissible overlays and are automatically streamed to kiosks via Server-Sent Events.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Textarea
              label="Notification Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter the message to display on kiosks..."
              rows={3}
              required
              helperText="This message will be displayed on all active kiosks in real-time"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Notification Type"
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as any })}
                options={[
                  { value: 'system', label: 'System Alert' },
                  { value: 'integration', label: 'Service Integration' },
                  { value: 'ticket', label: 'Ticket Notice' }
                ]}
                required
                helperText="Categorizes the notification for filtering"
              />

              <Select
                label="Urgency Level"
                value={formData.level}
                onChange={(value) => setFormData({ ...formData, level: value as any })}
                options={[
                  { value: 'info', label: 'Info (Blue)' },
                  { value: 'warning', label: 'Warning (Orange)' },
                  { value: 'error', label: 'Error (Red)' },
                  { value: 'critical', label: 'Critical (Dark Red)' }
                ]}
                required
                helperText="Determines the color and icon displayed"
              />
            </div>

            {/* Preview */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Preview on Kiosk</h4>
              <div className={`rounded-lg border p-3 ${getNotificationBg(formData.type, formData.level)}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(formData.type, formData.level)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formData.message || 'Your notification message will appear here...'}
                    </p>
                    <div className="mt-1 text-xs text-gray-500">
                      Type: {formData.type} • Level: {formData.level}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={closeCreateModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={createNotification}
            isLoading={creating}
            disabled={!formData.message.trim()}
          >
            Create & Send to Kiosks
          </Button>
        </div>
      </Modal>
    </div>
  );
};
