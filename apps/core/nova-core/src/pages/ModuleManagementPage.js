import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Switch, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tabs, Tab, Progress, Divider, Input, Select, SelectItem } from '@heroui/react';
import { CheckCircleIcon, XCircleIcon, CogIcon, InformationCircleIcon, PuzzlePieceIcon, ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useToastStore } from '@/stores/toast';
export const _ModuleManagementPage = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);
    const { addToast } = useToastStore();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    useEffect(() => {
        load();
    }, []);
    const load = async () => {
        try {
            setLoading(true);
            // For now, use mock data since the API endpoint doesn't exist yet
            // const data = await api.getModules(); // TODO-LINT: move to async function
            // Generate mock module data
            const mockModules = [
                {
                    key: 'ticket-management',
                    name: 'Ticket Management',
                    description: 'Core ticket management and workflow automation',
                    enabled: true,
                    version: '2.1.0',
                    category: 'Core',
                    status: 'active',
                    dependencies: ['user-management', 'notification-engine'],
                    configurations: [
                        { key: 'auto_assign', label: 'Auto Assignment', type: 'boolean', value: true, description: 'Automatically assign tickets to available agents' },
                        { key: 'escalation_timeout', label: 'Escalation Timeout (hours)', type: 'number', value: 24 },
                        { key: 'priority_levels', label: 'Priority Levels', type: 'select', value: '5', options: ['3', '4', '5', '6'] }
                    ],
                    health: {
                        status: 'healthy',
                        lastCheck: '2024-01-15 10:30:00',
                        uptime: 99.9,
                        errors: []
                    }
                },
                {
                    key: 'user-management',
                    name: 'User Management',
                    description: 'User authentication, authorization, and profile management',
                    enabled: true,
                    version: '1.8.2',
                    category: 'Security',
                    status: 'active',
                    dependencies: [],
                    configurations: [
                        { key: 'session_timeout', label: 'Session Timeout (minutes)', type: 'number', value: 30 },
                        { key: 'password_policy', label: 'Strong Password Policy', type: 'boolean', value: true },
                        { key: 'mfa_required', label: 'MFA Required', type: 'boolean', value: false }
                    ],
                    health: {
                        status: 'healthy',
                        lastCheck: '2024-01-15 10:25:00',
                        uptime: 99.8,
                        errors: []
                    }
                },
                {
                    key: 'knowledge-base',
                    name: 'Knowledge Base',
                    description: 'Knowledge management and self-service portal',
                    enabled: false,
                    version: '1.5.1',
                    category: 'Content',
                    status: 'inactive',
                    dependencies: ['search-engine'],
                    configurations: [
                        { key: 'public_access', label: 'Public Access', type: 'boolean', value: false },
                        { key: 'article_approval', label: 'Article Approval Required', type: 'boolean', value: true },
                        { key: 'search_provider', label: 'Search Provider', type: 'select', value: 'elasticsearch', options: ['elasticsearch', 'database', 'external'] }
                    ],
                    health: {
                        status: 'warning',
                        lastCheck: '2024-01-15 09:45:00',
                        uptime: 0,
                        errors: ['Module is disabled']
                    }
                },
                {
                    key: 'notification-engine',
                    name: 'Notification Engine',
                    description: 'Email, SMS, and push notification delivery',
                    enabled: true,
                    version: '2.0.3',
                    category: 'Communication',
                    status: 'active',
                    dependencies: [],
                    configurations: [
                        { key: 'email_provider', label: 'Email Provider', type: 'select', value: 'smtp', options: ['smtp', 'sendgrid', 'mailgun', 'ses'] },
                        { key: 'batch_size', label: 'Batch Size', type: 'number', value: 100 },
                        { key: 'retry_attempts', label: 'Retry Attempts', type: 'number', value: 3 }
                    ],
                    health: {
                        status: 'healthy',
                        lastCheck: '2024-01-15 10:28:00',
                        uptime: 99.5,
                        errors: []
                    }
                },
                {
                    key: 'reporting-analytics',
                    name: 'Reporting & Analytics',
                    description: 'Advanced reporting, dashboards, and business intelligence',
                    enabled: true,
                    version: '1.9.0',
                    category: 'Analytics',
                    status: 'error',
                    dependencies: ['data-warehouse'],
                    configurations: [
                        { key: 'data_retention', label: 'Data Retention (days)', type: 'number', value: 365 },
                        { key: 'real_time_updates', label: 'Real-time Updates', type: 'boolean', value: true },
                        { key: 'export_formats', label: 'Export Formats', type: 'select', value: 'all', options: ['pdf', 'excel', 'csv', 'all'] }
                    ],
                    health: {
                        status: 'error',
                        lastCheck: '2024-01-15 10:20:00',
                        uptime: 85.2,
                        errors: ['Database connection timeout', 'Cache service unavailable']
                    }
                }
            ];
            setModules(mockModules);
        }
        catch (err) {
            console.error(err);
            addToast({ type: 'error', title: 'Error', description: 'Failed to load modules' });
        }
        finally {
            setLoading(false);
        }
    };
    const update = async (key, enabled) => {
        try {
            // await api.updateModule(key, enabled); // TODO-LINT: move to async function
            setModules(mods => mods.map(m => (m.key === key ? { ...m, enabled, status: enabled ? 'active' : 'inactive' } : m)));
            addToast({ type: 'success', title: 'Updated', description: `Module ${key} ${enabled ? 'enabled' : 'disabled'}` });
        }
        catch (err) {
            console.error(err);
            addToast({ type: 'error', title: 'Error', description: 'Failed to update module' });
        }
    };
    const refreshModules = async () => {
        setRefreshing(true);
        await load(); // TODO-LINT: move to async function
        setRefreshing(false);
        addToast({ type: 'success', title: 'Refreshed', description: 'Module status updated' });
    };
    const getStatusIcon = (enabled) => (enabled ? React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-green-500" }) : React.createElement(XCircleIcon, { className: "h-5 w-5 text-gray-400" }));
    const getHealthIcon = (status) => {
        switch (status) {
            case 'healthy': return React.createElement(CheckCircleIcon, { className: "h-4 w-4 text-green-500" });
            case 'warning': return React.createElement(ExclamationTriangleIcon, { className: "h-4 w-4 text-yellow-500" });
            case 'error': return React.createElement(XCircleIcon, { className: "h-4 w-4 text-red-500" });
            default: return React.createElement(ClockIcon, { className: "h-4 w-4 text-gray-400" });
        }
    };
    const getCategoryColor = (category) => {
        const colors = {
            'Core': 'primary',
            'Security': 'danger',
            'Content': 'secondary',
            'Communication': 'success',
            'Analytics': 'warning'
        };
        return colors[category] || 'default';
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Core': return React.createElement(PuzzlePieceIcon, { className: "h-4 w-4" });
            case 'Security': return React.createElement(ShieldCheckIcon, { className: "h-4 w-4" });
            case 'Communication': return React.createElement(InformationCircleIcon, { className: "h-4 w-4" });
            default: return React.createElement(CogIcon, { className: "h-4 w-4" });
        }
    };
    const openModuleDetails = (module) => {
        setSelectedModule(module);
        onOpen();
    };
    const groupedModules = modules.reduce((acc, module) => {
        if (!acc[module.category]) {
            acc[module.category] = [];
        }
        acc[module.category].push(module);
        return acc;
    }, {});
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Module Management"),
                React.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "Configure and monitor Nova modules for your organization.")),
            React.createElement(Button, { color: "primary", variant: "flat", startContent: React.createElement(ArrowPathIcon, { className: "h-4 w-4" }), onPress: refreshModules, isLoading: refreshing }, "Refresh Status")),
        React.createElement(Tabs, { selectedKey: activeTab, onSelectionChange: (key) => setActiveTab(key) },
            React.createElement(Tab, { key: "overview", title: "Overview" },
                React.createElement("div", { className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                        React.createElement(Card, null,
                            React.createElement(CardBody, { className: "text-center" },
                                React.createElement("div", { className: "text-2xl font-bold text-primary" }, modules.length),
                                React.createElement("div", { className: "text-sm text-gray-600" }, "Total Modules"))),
                        React.createElement(Card, null,
                            React.createElement(CardBody, { className: "text-center" },
                                React.createElement("div", { className: "text-2xl font-bold text-green-600" }, modules.filter(m => m.enabled).length),
                                React.createElement("div", { className: "text-sm text-gray-600" }, "Active Modules"))),
                        React.createElement(Card, null,
                            React.createElement(CardBody, { className: "text-center" },
                                React.createElement("div", { className: "text-2xl font-bold text-yellow-600" }, modules.filter(m => m.health.status === 'warning').length),
                                React.createElement("div", { className: "text-sm text-gray-600" }, "Warnings"))),
                        React.createElement(Card, null,
                            React.createElement(CardBody, { className: "text-center" },
                                React.createElement("div", { className: "text-2xl font-bold text-red-600" }, modules.filter(m => m.health.status === 'error').length),
                                React.createElement("div", { className: "text-sm text-gray-600" }, "Errors")))),
                    Object.entries(groupedModules).map(([category, categoryModules]) => (React.createElement(Card, { key: category },
                        React.createElement(CardHeader, null,
                            React.createElement("div", { className: "flex items-center gap-2" },
                                getCategoryIcon(category),
                                React.createElement("h3", { className: "text-lg font-semibold" },
                                    category,
                                    " Modules"),
                                React.createElement(Chip, { color: getCategoryColor(category), size: "sm", variant: "flat" }, categoryModules.length))),
                        React.createElement(CardBody, null,
                            React.createElement("div", { className: "space-y-4" }, categoryModules.map(module => (React.createElement("div", { key: module.key, className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg" },
                                React.createElement("div", { className: "flex items-center space-x-4" },
                                    getStatusIcon(module.enabled),
                                    React.createElement("div", null,
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("span", { className: "font-medium text-gray-900" }, module.name),
                                            React.createElement(Chip, { size: "sm", variant: "flat", color: module.enabled ? 'success' : 'default' },
                                                "v",
                                                module.version),
                                            getHealthIcon(module.health.status)),
                                        React.createElement("p", { className: "text-sm text-gray-600" }, module.description),
                                        module.dependencies.length > 0 && (React.createElement("p", { className: "text-xs text-gray-500" },
                                            "Dependencies: ",
                                            module.dependencies.join(', '))))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(Button, { size: "sm", variant: "flat", onPress: () => openModuleDetails(module) }, "Configure"),
                                    React.createElement(Switch, { isSelected: module.enabled, onValueChange: (checked) => update(module.key, checked), isDisabled: loading })))))))))))),
            React.createElement(Tab, { key: "health", title: "Health Monitor" },
                React.createElement(Card, null,
                    React.createElement(CardHeader, null,
                        React.createElement("h3", { className: "text-lg font-semibold" }, "Module Health Status")),
                    React.createElement(CardBody, null,
                        React.createElement("div", { className: "space-y-4" }, modules.map(module => (React.createElement("div", { key: module.key, className: "p-4 border border-gray-200 rounded-lg" },
                            React.createElement("div", { className: "flex items-center justify-between mb-2" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("span", { className: "font-medium" }, module.name),
                                    getHealthIcon(module.health.status)),
                                React.createElement(Chip, { size: "sm", color: module.health.status === 'healthy' ? 'success' : module.health.status === 'warning' ? 'warning' : 'danger' },
                                    module.health.uptime,
                                    "% uptime")),
                            React.createElement(Progress, { value: module.health.uptime, color: module.health.uptime > 95 ? 'success' : module.health.uptime > 85 ? 'warning' : 'danger', className: "mb-2" }),
                            React.createElement("div", { className: "text-xs text-gray-500" },
                                "Last checked: ",
                                module.health.lastCheck),
                            module.health.errors.length > 0 && (React.createElement("div", { className: "mt-2 p-2 bg-red-50 border border-red-200 rounded" },
                                React.createElement("div", { className: "text-sm font-medium text-red-800" }, "Errors:"),
                                React.createElement("ul", { className: "text-sm text-red-700 list-disc list-inside" }, module.health.errors.map((error, idx) => (React.createElement("li", { key: idx }, error)))))))))))))),
        React.createElement(Modal, { isOpen: isOpen, onOpenChange: onOpenChange, size: "2xl" },
            React.createElement(ModalContent, null, (onClose) => (React.createElement(React.Fragment, null,
                React.createElement(ModalHeader, { className: "flex flex-col gap-1" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        selectedModule && getCategoryIcon(selectedModule.category),
                        React.createElement("span", null,
                            selectedModule?.name,
                            " Configuration"))),
                React.createElement(ModalBody, null, selectedModule && (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-sm font-medium text-gray-500" }, "Version"),
                            React.createElement("div", null, selectedModule.version)),
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-sm font-medium text-gray-500" }, "Status"),
                            React.createElement("div", { className: "flex items-center gap-1" },
                                getHealthIcon(selectedModule.health.status),
                                React.createElement("span", { className: "capitalize" }, selectedModule.health.status))),
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-sm font-medium text-gray-500" }, "Category"),
                            React.createElement(Chip, { size: "sm", color: getCategoryColor(selectedModule.category) }, selectedModule.category)),
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-sm font-medium text-gray-500" }, "Uptime"),
                            React.createElement("div", null,
                                selectedModule.health.uptime,
                                "%"))),
                    React.createElement(Divider, null),
                    React.createElement("div", null,
                        React.createElement("h4", { className: "font-medium text-gray-900 mb-3" }, "Module Configuration"),
                        React.createElement("div", { className: "space-y-3" }, selectedModule.configurations.map(config => (React.createElement("div", { key: config.key },
                            React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, config.label),
                            config.type === 'boolean' ? (React.createElement(Switch, { isSelected: config.value })) : config.type === 'select' ? (React.createElement(Select, { placeholder: "Select an option", selectedKeys: [config.value], className: "max-w-xs" }, (config.options || []).map(option => (React.createElement(SelectItem, { key: option }, option))))) : config.type === 'number' ? (React.createElement(Input, { type: "number", value: config.value.toString(), className: "max-w-xs" })) : (React.createElement(Input, { value: config.value.toString(), className: "max-w-xs" })),
                            config.description && (React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, config.description))))))),
                    selectedModule.dependencies.length > 0 && (React.createElement(React.Fragment, null,
                        React.createElement(Divider, null),
                        React.createElement("div", null,
                            React.createElement("h4", { className: "font-medium text-gray-900 mb-2" }, "Dependencies"),
                            React.createElement("div", { className: "flex flex-wrap gap-2" }, selectedModule.dependencies.map(dep => (React.createElement(Chip, { key: dep, size: "sm", variant: "flat" }, dep)))))))))),
                React.createElement(ModalFooter, null,
                    React.createElement(Button, { color: "danger", variant: "light", onPress: onClose }, "Cancel"),
                    React.createElement(Button, { color: "primary", onPress: onClose }, "Save Configuration"))))))));
};
