import React, { useState, useEffect } from 'react';
import { Button, Card, Modal, Textarea, Select } from '@heroui/react';
import { BellIcon, PlusIcon, TrashIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, ExclamationCircleIcon, ShieldExclamationIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const _NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
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
        }
        catch (error) {
            console.error('Failed to load notifications:', error);
        }
        finally {
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
        }
        catch (error) {
            console.error('Failed to create notification:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to create notification',
            });
        }
        finally {
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
    const deleteNotification = async (id) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            try {
                await api.deleteNotification(id); // TODO-LINT: move to async function
                setNotifications(notifications.filter(n => n.id !== id));
                addToast({
                    type: 'success',
                    title: 'Success',
                    description: 'Notification deleted successfully',
                });
            }
            catch (error) {
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
    const getNotificationIcon = (type, level) => {
        // Use level for more specific icon selection if available
        if (level) {
            switch (level) {
                case 'critical':
                    return React.createElement(ShieldExclamationIcon, { className: "h-5 w-5 text-red-600" });
                case 'error':
                    return React.createElement(ExclamationCircleIcon, { className: "h-5 w-5 text-red-500" });
                case 'warning':
                    return React.createElement(ExclamationTriangleIcon, { className: "h-5 w-5 text-orange-500" });
                case 'info':
                    return React.createElement(InformationCircleIcon, { className: "h-5 w-5 text-blue-500" });
                default:
                    return React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-green-500" });
            }
        }
        // Fallback to type-based icons
        switch (type) {
            case 'system':
                return React.createElement(ExclamationTriangleIcon, { className: "h-5 w-5 text-red-500" });
            case 'integration':
                return React.createElement(ExclamationTriangleIcon, { className: "h-5 w-5 text-yellow-500" });
            case 'ticket':
                return React.createElement(ChatBubbleBottomCenterTextIcon, { className: "h-5 w-5 text-blue-500" });
            default:
                return React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-green-500" });
        }
    };
    const getNotificationBg = (type, level) => {
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
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex justify-between items-start" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Kiosk Notifications"),
                React.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "Manage real-time notifications displayed on kiosks")),
            React.createElement(Button, { variant: "primary", onClick: openCreateModal },
                React.createElement(PlusIcon, { className: "h-4 w-4 mr-2" }),
                "Create Kiosk Notification")),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6" },
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-blue-500" },
                        React.createElement(BellIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Total"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, notifications.length)))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-red-500" },
                        React.createElement(ExclamationTriangleIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "System"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, notifications.filter(n => n.type === 'system').length)))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-yellow-500" },
                        React.createElement(ExclamationTriangleIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Integration"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, notifications.filter(n => n.type === 'integration').length)))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-green-500" },
                        React.createElement(CheckCircleIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Unread"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, notifications.filter(n => !n.read).length))))),
        React.createElement(Card, null, loading ? (React.createElement("div", { className: "flex items-center justify-center py-12" },
            React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" }))) : notifications.length === 0 ? (React.createElement("div", { className: "text-center py-12" },
            React.createElement(BellIcon, { className: "mx-auto h-12 w-12 text-gray-400" }),
            React.createElement("h3", { className: "mt-2 text-sm font-medium text-gray-900" }, "No notifications"),
            React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, "Create your first notification to get started."),
            React.createElement("div", { className: "mt-6" },
                React.createElement(Button, { variant: "primary", onClick: openCreateModal },
                    React.createElement(PlusIcon, { className: "h-4 w-4 mr-2" }),
                    "Create Kiosk Notification")))) : (React.createElement("div", { className: "space-y-4" }, notifications.map((notification) => (React.createElement("div", { key: notification.id, className: `rounded-lg border p-4 ${getNotificationBg(notification.type, notification.level)}` },
            React.createElement("div", { className: "flex items-start" },
                React.createElement("div", { className: "flex-shrink-0" }, getNotificationIcon(notification.type, notification.level)),
                React.createElement("div", { className: "ml-3 flex-1" },
                    React.createElement("p", { className: "text-sm font-medium text-gray-900" }, notification.message),
                    React.createElement("div", { className: "mt-1 flex items-center space-x-4 text-xs text-gray-500" },
                        React.createElement("span", null,
                            "Type: ",
                            notification.type),
                        notification.level && (React.createElement("span", null,
                            "Level: ",
                            notification.level)),
                        React.createElement("span", null,
                            "Created: ",
                            formatDate(notification.createdAt)),
                        React.createElement("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${!notification.read
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'}` }, !notification.read ? 'Unread' : 'Read'))),
                React.createElement("div", { className: "ml-4 flex-shrink-0" },
                    React.createElement(Button, { variant: "default", size: "sm", onClick: () => deleteNotification(notification.id), className: "text-red-600 hover:text-red-900" },
                        React.createElement(TrashIcon, { className: "h-4 w-4" })))))))))),
        React.createElement(Modal, { isOpen: showCreateModal, onClose: closeCreateModal, title: "Create Kiosk Notification", size: "lg" },
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4" },
                    React.createElement("div", { className: "flex" },
                        React.createElement("div", { className: "ml-3" },
                            React.createElement("h3", { className: "text-sm font-medium text-blue-800" }, "Kiosk Notification System"),
                            React.createElement("div", { className: "mt-2 text-sm text-blue-700" },
                                React.createElement("p", null, "Create real-time notifications that will be displayed on all active kiosks. Notifications appear as non-dismissible overlays and are automatically streamed to kiosks via Server-Sent Events."))))),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(Textarea, { label: "Notification Message", value: formData.message, onChange: (e) => setFormData({ ...formData, message: e.target.value }), placeholder: "Enter the message to display on kiosks...", rows: 3, required: true, helperText: "This message will be displayed on all active kiosks in real-time" }),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(Select, { label: "Notification Type", value: formData.type, onChange: (value) => setFormData({ ...formData, type: value }), options: [
                                { value: 'system', label: 'System Alert' },
                                { value: 'integration', label: 'Service Integration' },
                                { value: 'ticket', label: 'Ticket Notice' }
                            ], required: true, helperText: "Categorizes the notification for filtering" }),
                        React.createElement(Select, { label: "Urgency Level", value: formData.level, onChange: (value) => setFormData({ ...formData, level: value }), options: [
                                { value: 'info', label: 'Info (Blue)' },
                                { value: 'warning', label: 'Warning (Orange)' },
                                { value: 'error', label: 'Error (Red)' },
                                { value: 'critical', label: 'Critical (Dark Red)' }
                            ], required: true, helperText: "Determines the color and icon displayed" })),
                    React.createElement("div", { className: "border border-gray-200 rounded-lg p-4" },
                        React.createElement("h4", { className: "text-sm font-medium text-gray-900 mb-3" }, "Preview on Kiosk"),
                        React.createElement("div", { className: `rounded-lg border p-3 ${getNotificationBg(formData.type, formData.level)}` },
                            React.createElement("div", { className: "flex items-start" },
                                React.createElement("div", { className: "flex-shrink-0" }, getNotificationIcon(formData.type, formData.level)),
                                React.createElement("div", { className: "ml-3 flex-1" },
                                    React.createElement("p", { className: "text-sm font-medium text-gray-900" }, formData.message || 'Your notification message will appear here...'),
                                    React.createElement("div", { className: "mt-1 text-xs text-gray-500" },
                                        "Type: ",
                                        formData.type,
                                        " \u2022 Level: ",
                                        formData.level))))))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: closeCreateModal }, "Cancel"),
                React.createElement(Button, { variant: "primary", onClick: createNotification, isLoading: creating, disabled: !formData.message.trim() }, "Create & Send to Kiosks")))));
};
