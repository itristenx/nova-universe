import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Select, Checkbox } from '@heroui/react';
import { Cog6ToothIcon, CheckCircleIcon, XCircleIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
const integrationTypes = [
    { value: 'smtp', label: 'SMTP Email' },
    { value: 'helpscout', label: 'Help Scout' },
    { value: 'slack', label: 'Slack' },
    { value: 'teams', label: 'Microsoft Teams' },
    { value: 'webhook', label: 'Generic Webhook' },
];
export const IntegrationsPage = () => {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingIntegration, setEditingIntegration] = useState(null);
    const [testingIntegration, setTestingIntegration] = useState(null);
    const { addToast } = useToastStore();
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        config: {},
        enabled: true,
    });
    useEffect(() => {
        loadIntegrations();
    }, []);
    const loadIntegrations = async () => {
        try {
            setLoading(true);
            const data = await api.getIntegrations();
            setIntegrations(data);
        }
        catch (error) {
            console.error('Failed to load integrations:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load integrations',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateIntegration = async () => {
        try {
            const integrationData = {
                ...formData,
                type: formData.type,
            };
            const newIntegration = await api.updateIntegration(0, integrationData);
            setIntegrations([...integrations, newIntegration]);
            setShowCreateModal(false);
            resetForm();
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Integration created successfully',
            });
        }
        catch (error) {
            console.error('Failed to create integration:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to create integration',
            });
        }
    };
    const handleUpdateIntegration = async () => {
        if (!editingIntegration)
            return;
        try {
            const integrationData = {
                ...formData,
                type: formData.type,
            };
            await api.updateIntegration(editingIntegration.id, integrationData);
            setIntegrations(integrations.map(i => i.id === editingIntegration.id
                ? { ...i, ...integrationData }
                : i));
            setEditingIntegration(null);
            resetForm();
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Integration updated successfully',
            });
        }
        catch (error) {
            console.error('Failed to update integration:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to update integration',
            });
        }
    };
    const deleteIntegration = async (id) => {
        if (confirm('Are you sure you want to delete this integration?')) {
            try {
                await api.deleteIntegration(id);
                setIntegrations(integrations.filter(i => i.id !== id));
                addToast({
                    type: 'success',
                    title: 'Success',
                    description: 'Integration deleted successfully',
                });
            }
            catch (error) {
                console.error('Failed to delete integration:', error);
                addToast({
                    type: 'error',
                    title: 'Error',
                    description: error.response?.data?.error || 'Failed to delete integration. Please try again.',
                });
            }
        }
    };
    const testIntegration = async (id) => {
        try {
            setTestingIntegration(id);
            await api.testIntegration(id);
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Integration test successful',
            });
        }
        catch (error) {
            console.error('Failed to test integration:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Integration test failed',
            });
        }
        finally {
            setTestingIntegration(null);
        }
    };
    const resetForm = () => {
        setFormData({
            name: '',
            type: '',
            config: {},
            enabled: true,
        });
    };
    const openEditModal = (integration) => {
        setEditingIntegration(integration);
        setFormData({
            name: integration.name,
            type: integration.type,
            config: integration.config || {},
            enabled: integration.enabled,
        });
    };
    const closeModals = () => {
        setShowCreateModal(false);
        setEditingIntegration(null);
        resetForm();
    };
    const renderConfigFields = (type) => {
        switch (type) {
            case 'smtp':
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "bg-green-50 border border-green-200 rounded-md p-4" },
                        React.createElement("div", { className: "text-sm text-green-700" },
                            React.createElement("h4", { className: "font-medium mb-2" }, "SMTP Setup Instructions:"),
                            React.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs" },
                                React.createElement("li", null,
                                    React.createElement("strong", null, "Gmail:"),
                                    " Use smtp.gmail.com, port 587, enable 2FA and use App Password"),
                                React.createElement("li", null,
                                    React.createElement("strong", null, "Outlook:"),
                                    " Use smtp.live.com, port 587 with TLS"),
                                React.createElement("li", null,
                                    React.createElement("strong", null, "Office 365:"),
                                    " Use smtp.office365.com, port 587 with TLS"),
                                React.createElement("li", null,
                                    React.createElement("strong", null, "Custom:"),
                                    " Contact your email provider for SMTP settings")))),
                    React.createElement(Input, { label: "SMTP Host", value: formData.config.host || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, host: e.target.value }
                        }), placeholder: "smtp.gmail.com", required: true }),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement(Input, { label: "Port", type: "number", value: formData.config.port || '', onChange: (e) => setFormData({
                                ...formData,
                                config: { ...formData.config, port: parseInt(e.target.value) }
                            }), placeholder: "587", required: true }),
                        React.createElement("div", { className: "flex items-center pt-6" },
                            React.createElement(Checkbox, { label: "Use TLS", checked: formData.config.secure || false, onChange: (checked) => setFormData({
                                    ...formData,
                                    config: { ...formData.config, secure: checked }
                                }) }))),
                    React.createElement(Input, { label: "Username", value: formData.config.username || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, username: e.target.value }
                        }), placeholder: "your-email@example.com", required: true }),
                    React.createElement(Input, { label: "Password", type: "password", value: formData.config.password || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, password: e.target.value }
                        }), placeholder: "App password or SMTP password", required: true })));
            case 'helpscout':
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement(Input, { label: "API Key", value: formData.config.apiKey || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, apiKey: e.target.value }
                        }), placeholder: "Help Scout API key", required: true }),
                    React.createElement(Input, { label: "Mailbox ID", value: formData.config.mailboxId || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, mailboxId: e.target.value }
                        }), placeholder: "123456", required: true })));
            case 'slack':
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4" },
                        React.createElement("div", { className: "text-sm text-blue-700" },
                            React.createElement("h4", { className: "font-medium mb-2" }, "Slack Setup Instructions:"),
                            React.createElement("ol", { className: "list-decimal list-inside space-y-1 text-xs" },
                                React.createElement("li", null, "Go to your Slack workspace settings"),
                                React.createElement("li", null, "Navigate to \"Apps\" \u2192 \"App Directory\" \u2192 \"Manage\""),
                                React.createElement("li", null, "Create a new app or select \"Incoming Webhooks\""),
                                React.createElement("li", null, "Enable incoming webhooks and add to workspace"),
                                React.createElement("li", null, "Copy the webhook URL and paste it below")))),
                    React.createElement(Input, { label: "Webhook URL", value: formData.config.webhookUrl || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, webhookUrl: e.target.value }
                        }), placeholder: "https://hooks.slack.com/services/...", required: true }),
                    React.createElement(Input, { label: "Channel", value: formData.config.channel || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, channel: e.target.value }
                        }), placeholder: "#general or #support", required: true }),
                    React.createElement(Input, { label: "Username (optional)", value: formData.config.username || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, username: e.target.value }
                        }), placeholder: "Nova Universe Bot" })));
            case 'teams':
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4" },
                        React.createElement("div", { className: "text-sm text-blue-700" },
                            React.createElement("h4", { className: "font-medium mb-2" }, "Microsoft Teams Setup Instructions:"),
                            React.createElement("ol", { className: "list-decimal list-inside space-y-1 text-xs" },
                                React.createElement("li", null, "Open Microsoft Teams and go to your channel"),
                                React.createElement("li", null, "Click \"...\" \u2192 \"Connectors\" \u2192 \"Configure\""),
                                React.createElement("li", null, "Find \"Incoming Webhook\" and click \"Add\""),
                                React.createElement("li", null, "Provide a name and upload an image (optional)"),
                                React.createElement("li", null, "Copy the webhook URL and paste it below")))),
                    React.createElement(Input, { label: "Webhook URL", value: formData.config.webhookUrl || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, webhookUrl: e.target.value }
                        }), placeholder: "https://your-tenant.webhook.office.com/...", required: true })));
            case 'webhook':
                return (React.createElement("div", { className: "space-y-4" },
                    React.createElement(Input, { label: "Webhook URL", value: formData.config.url || '', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, url: e.target.value }
                        }), placeholder: "https://your-webhook-endpoint.com/hook", required: true }),
                    React.createElement(Select, { label: "HTTP Method", value: formData.config.method || 'POST', onChange: (value) => setFormData({
                            ...formData,
                            config: { ...formData.config, method: value }
                        }), options: [
                            { value: 'POST', label: 'POST' },
                            { value: 'PUT', label: 'PUT' },
                            { value: 'PATCH', label: 'PATCH' },
                        ] }),
                    React.createElement(Input, { label: "Content Type", value: formData.config.contentType || 'application/json', onChange: (e) => setFormData({
                            ...formData,
                            config: { ...formData.config, contentType: e.target.value }
                        }), placeholder: "application/json" })));
            default:
                return null;
        }
    };
    const getStatusIcon = (enabled, working) => {
        if (working === false) {
            return React.createElement(XCircleIcon, { className: "h-5 w-5 text-red-500" });
        }
        if (enabled) {
            return React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-green-500" });
        }
        return React.createElement(XCircleIcon, { className: "h-5 w-5 text-gray-400" });
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex justify-between items-start" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Integrations"),
                React.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "Manage external service integrations and API connections")),
            React.createElement(Button, { variant: "primary", onClick: () => setShowCreateModal(true) },
                React.createElement(PlusIcon, { className: "h-4 w-4 mr-2" }),
                "Add Integration")),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-blue-500" },
                        React.createElement(Cog6ToothIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Total Integrations"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, integrations.length)))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-green-500" },
                        React.createElement(CheckCircleIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Active"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, integrations.filter(i => i.enabled).length)))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-red-500" },
                        React.createElement(XCircleIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Inactive"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, integrations.filter(i => !i.enabled).length))))),
        React.createElement(Card, null, loading ? (React.createElement("div", { className: "flex items-center justify-center py-12" },
            React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" }))) : integrations.length === 0 ? (React.createElement("div", { className: "text-center py-12" },
            React.createElement(Cog6ToothIcon, { className: "mx-auto h-12 w-12 text-gray-400" }),
            React.createElement("h3", { className: "mt-2 text-sm font-medium text-gray-900" }, "No integrations configured"),
            React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, "Get started by adding your first integration."),
            React.createElement("div", { className: "mt-6" },
                React.createElement(Button, { variant: "primary", onClick: () => setShowCreateModal(true) },
                    React.createElement(PlusIcon, { className: "h-4 w-4 mr-2" }),
                    "Add Integration")))) : (React.createElement("div", { className: "divide-y divide-gray-200 dark:divide-gray-700" }, integrations.map((integration) => (React.createElement("div", { key: integration.id, className: "p-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center space-x-4" },
                    getStatusIcon(integration.enabled, integration.working),
                    React.createElement("div", null,
                        React.createElement("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100" }, integration.name),
                        React.createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400" }, integrationTypes.find(t => t.value === integration.type)?.label || integration.type))),
                React.createElement("div", { className: "flex items-center space-x-2" },
                    React.createElement(Button, { variant: "default", size: "sm", onClick: () => testIntegration(integration.id), isLoading: testingIntegration === integration.id, className: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" }, "Test"),
                    React.createElement(Button, { variant: "default", size: "sm", onClick: () => openEditModal(integration), className: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" },
                        React.createElement(PencilIcon, { className: "h-4 w-4" })),
                    React.createElement(Button, { variant: "default", size: "sm", onClick: () => deleteIntegration(integration.id), className: "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" },
                        React.createElement(TrashIcon, { className: "h-4 w-4" })))),
            integration.lastError && (React.createElement("div", { className: "mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md" },
                React.createElement("p", { className: "text-sm text-red-600 dark:text-red-400" }, integration.lastError))))))))),
        React.createElement(Modal, { isOpen: showCreateModal, onClose: closeModals, title: "Add Integration", size: "lg" },
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Input, { label: "Integration Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "My Integration", required: true }),
                React.createElement(Select, { label: "Integration Type", value: formData.type, onChange: (value) => setFormData({ ...formData, type: value, config: {} }), options: integrationTypes, required: true }),
                formData.type && renderConfigFields(formData.type),
                React.createElement(Checkbox, { label: "Enable this integration", checked: formData.enabled, onChange: (checked) => setFormData({ ...formData, enabled: checked }) })),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: closeModals }, "Cancel"),
                React.createElement(Button, { variant: "primary", onClick: handleCreateIntegration, disabled: !formData.name || !formData.type }, "Create Integration"))),
        React.createElement(Modal, { isOpen: !!editingIntegration, onClose: closeModals, title: `Edit Integration: ${editingIntegration?.name}`, size: "lg" },
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Input, { label: "Integration Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), required: true }),
                React.createElement(Select, { label: "Integration Type", value: formData.type, onChange: (value) => setFormData({ ...formData, type: value, config: {} }), options: integrationTypes, required: true }),
                formData.type && renderConfigFields(formData.type),
                React.createElement(Checkbox, { label: "Enable this integration", checked: formData.enabled, onChange: (checked) => setFormData({ ...formData, enabled: checked }) })),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: closeModals }, "Cancel"),
                React.createElement(Button, { variant: "primary", onClick: handleUpdateIntegration, disabled: !formData.name || !formData.type }, "Save Changes")))));
};
