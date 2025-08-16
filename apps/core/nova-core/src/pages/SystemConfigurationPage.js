import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Switch, Select, SelectItem, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Textarea, Divider } from '@heroui/react';
import { CogIcon, ServerIcon, ShieldCheckIcon, KeyIcon, BellIcon, EnvelopeIcon, DocumentIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { useToastStore } from '@/stores/toast';
const SystemConfigurationPage = () => {
    const [config, setConfig] = useState(null);
    const [featureFlags, setFeatureFlags] = useState([]);
    const [envVars, setEnvVars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedEnvVar, setSelectedEnvVar] = useState(null);
    const addToast = useToastStore((state) => state.addToast);
    useEffect(() => {
        loadSystemConfig();
        loadFeatureFlags();
        loadEnvironmentVariables();
    }, []);
    const loadSystemConfig = async () => {
        try {
            // For now, use mock data since the API endpoint doesn't exist yet
            // const response = await api.getConfig(); // TODO-LINT: move to async function
            // Set default config 
            setConfig({
                general: {
                    systemName: 'Nova Universe',
                    systemDescription: 'Enterprise ITSM Platform',
                    timezone: 'UTC',
                    defaultLanguage: 'en',
                    maintenanceMode: false,
                    debugMode: false,
                    logLevel: 'info'
                },
                security: {
                    sessionTimeout: 3600,
                    maxLoginAttempts: 3,
                    passwordPolicy: {
                        minLength: 8,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSpecialChars: true
                    },
                    twoFactorEnabled: false,
                    ipWhitelist: []
                },
                email: {
                    smtpHost: '',
                    smtpPort: 587,
                    smtpUsername: '',
                    smtpPassword: '',
                    smtpSecure: true,
                    fromEmail: '',
                    fromName: 'Nova Universe'
                },
                notifications: {
                    emailNotifications: true,
                    slackWebhook: '',
                    discordWebhook: '',
                    teamsWebhook: '',
                    criticalAlerts: true,
                    systemUpdates: true
                },
                storage: {
                    maxFileSize: 10485760, // 10MB
                    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
                    storageQuota: 1073741824, // 1GB
                    backupRetention: 30
                },
                integrations: {
                    elasticsearchEnabled: false,
                    elasticsearchUrl: '',
                    redisEnabled: false,
                    redisUrl: '',
                    webhooksEnabled: true,
                    apiRateLimit: 100
                }
            });
        }
        catch (error) {
            console.error('Failed to load system config:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadFeatureFlags = async () => {
        try {
            // For now, use mock data since the API endpoint doesn't exist yet
            // const response = await api.getFeatureFlags(); // TODO-LINT: move to async function
            // Set some default feature flags
            setFeatureFlags([
                {
                    id: 'new-ui',
                    name: 'New UI Design',
                    description: 'Enable the new modern UI design',
                    enabled: true,
                    category: 'ui',
                    rolloutPercentage: 100
                },
                {
                    id: 'ai-suggestions',
                    name: 'AI Suggestions',
                    description: 'Enable AI-powered ticket suggestions',
                    enabled: false,
                    category: 'experimental',
                    rolloutPercentage: 10
                },
                {
                    id: 'advanced-analytics',
                    name: 'Advanced Analytics',
                    description: 'Enable advanced analytics dashboard',
                    enabled: true,
                    category: 'ui',
                    rolloutPercentage: 80
                }
            ]);
        }
        catch (error) {
            console.error('Failed to load feature flags:', error);
        }
    };
    const loadEnvironmentVariables = async () => {
        try {
            // For now, use mock data since the API endpoint doesn't exist yet
            // const response = await api.getEnvironmentVariables(); // TODO-LINT: move to async function
            // Set some default env vars (non-sensitive)
            setEnvVars([
                {
                    key: 'NODE_ENV',
                    value: 'production',
                    description: 'Node.js environment',
                    sensitive: false
                },
                {
                    key: 'DATABASE_URL',
                    value: '***REDACTED***',
                    description: 'Database connection string',
                    sensitive: true
                },
                {
                    key: 'API_RATE_LIMIT',
                    value: '100',
                    description: 'API rate limit per minute',
                    sensitive: false
                }
            ]);
        }
        catch (error) {
            console.error('Failed to load environment variables:', error);
        }
    };
    const saveConfig = async () => {
        if (!config)
            return;
        setSaving(true);
        try {
            // For now, just simulate save since the API endpoint doesn't exist yet
            // await api.updateConfig(config); // TODO-LINT: move to async function
            await new Promise(resolve => setTimeout(resolve, 1000)); // TODO-LINT: move to async function // Simulate API call
            addToast({
                id: Date.now().toString(),
                type: 'success',
                title: 'Configuration Saved',
                message: 'System configuration has been updated successfully'
            });
        }
        catch (error) {
            console.error('Failed to save config:', error);
            addToast({
                id: Date.now().toString(),
                type: 'error',
                title: 'Save Failed',
                message: 'Failed to save system configuration'
            });
        }
        finally {
            setSaving(false);
        }
    };
    const toggleFeatureFlag = async (flagId) => {
        try {
            // For now, just simulate toggle since the API endpoint doesn't exist yet
            // await api.toggleFeatureFlag(flagId); // TODO-LINT: move to async function
            setFeatureFlags(prev => prev.map(flag => flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag));
            addToast({
                id: Date.now().toString(),
                type: 'success',
                title: 'Feature Flag Updated',
                message: 'Feature flag has been toggled successfully'
            });
        }
        catch (error) {
            console.error('Failed to toggle feature flag:', error);
            addToast({
                id: Date.now().toString(),
                type: 'error',
                title: 'Toggle Failed',
                message: 'Failed to toggle feature flag'
            });
        }
    };
    const updateConfig = (section, field, value) => {
        if (!config)
            return;
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };
    const updateNestedConfig = (section, parentField, field, value) => {
        if (!config)
            return;
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [parentField]: {
                    ...prev[section][parentField],
                    [field]: value
                }
            }
        }));
    };
    if (loading) {
        return (React.createElement("div", { className: "flex justify-center items-center min-h-96" },
            React.createElement("div", { className: "text-center" },
                React.createElement(CogIcon, { className: "w-12 h-12 mx-auto animate-spin text-primary" }),
                React.createElement("p", { className: "mt-4 text-lg" }, "Loading system configuration..."))));
    }
    if (!config) {
        return (React.createElement("div", { className: "text-center py-12" },
            React.createElement("p", { className: "text-red-600" }, "Failed to load system configuration")));
    }
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-3xl font-bold" }, "System Configuration"),
                React.createElement("p", { className: "text-gray-600 dark:text-gray-400" }, "Manage system settings, environment variables, and feature flags")),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(Button, { color: "success", startContent: React.createElement(WrenchScrewdriverIcon, { className: "w-4 h-4" }), onPress: saveConfig, isLoading: saving }, "Save Configuration"))),
        React.createElement(Card, null,
            React.createElement(CardBody, null,
                React.createElement(Tabs, { selectedKey: activeTab, onSelectionChange: (key) => setActiveTab(key), "aria-label": "System Configuration Tabs" },
                    React.createElement(Tab, { key: "general", title: React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(CogIcon, { className: "w-4 h-4" }),
                            "General") },
                        React.createElement("div", { className: "space-y-6 pt-4" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                React.createElement(Input, { label: "System Name", value: config.general.systemName, onChange: (e) => updateConfig('general', 'systemName', e.target.value) }),
                                React.createElement(Input, { label: "Timezone", value: config.general.timezone, onChange: (e) => updateConfig('general', 'timezone', e.target.value) }),
                                React.createElement(Select, { label: "Default Language", selectedKeys: [config.general.defaultLanguage], onSelectionChange: (keys) => updateConfig('general', 'defaultLanguage', Array.from(keys)[0]) },
                                    React.createElement(SelectItem, { key: "en" }, "English"),
                                    React.createElement(SelectItem, { key: "es" }, "Spanish"),
                                    React.createElement(SelectItem, { key: "fr" }, "French"),
                                    React.createElement(SelectItem, { key: "de" }, "German")),
                                React.createElement(Select, { label: "Log Level", selectedKeys: [config.general.logLevel], onSelectionChange: (keys) => updateConfig('general', 'logLevel', Array.from(keys)[0]) },
                                    React.createElement(SelectItem, { key: "error" }, "Error"),
                                    React.createElement(SelectItem, { key: "warn" }, "Warning"),
                                    React.createElement(SelectItem, { key: "info" }, "Info"),
                                    React.createElement(SelectItem, { key: "debug" }, "Debug"))),
                            React.createElement(Textarea, { label: "System Description", value: config.general.systemDescription, onChange: (e) => updateConfig('general', 'systemDescription', e.target.value) }),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Maintenance Mode"),
                                        React.createElement("p", { className: "text-sm text-gray-600" }, "Put the system into maintenance mode")),
                                    React.createElement(Switch, { isSelected: config.general.maintenanceMode, onValueChange: (checked) => updateConfig('general', 'maintenanceMode', checked) })),
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Debug Mode"),
                                        React.createElement("p", { className: "text-sm text-gray-600" }, "Enable debug logging and error details")),
                                    React.createElement(Switch, { isSelected: config.general.debugMode, onValueChange: (checked) => updateConfig('general', 'debugMode', checked) }))))),
                    React.createElement(Tab, { key: "security", title: React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(ShieldCheckIcon, { className: "w-4 h-4" }),
                            "Security") },
                        React.createElement("div", { className: "space-y-6 pt-4" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                React.createElement(Input, { type: "number", label: "Session Timeout (seconds)", value: config.security.sessionTimeout.toString(), onChange: (e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value)) }),
                                React.createElement(Input, { type: "number", label: "Max Login Attempts", value: config.security.maxLoginAttempts.toString(), onChange: (e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value)) })),
                            React.createElement(Divider, null),
                            React.createElement("div", null,
                                React.createElement("h3", { className: "text-lg font-semibold mb-4" }, "Password Policy"),
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement(Input, { type: "number", label: "Minimum Length", value: config.security.passwordPolicy.minLength.toString(), onChange: (e) => updateNestedConfig('security', 'passwordPolicy', 'minLength', parseInt(e.target.value)) }),
                                    React.createElement("div", { className: "space-y-3" },
                                        React.createElement("div", { className: "flex items-center justify-between" },
                                            React.createElement("span", null, "Require Uppercase"),
                                            React.createElement(Switch, { isSelected: config.security.passwordPolicy.requireUppercase, onValueChange: (checked) => updateNestedConfig('security', 'passwordPolicy', 'requireUppercase', checked) })),
                                        React.createElement("div", { className: "flex items-center justify-between" },
                                            React.createElement("span", null, "Require Lowercase"),
                                            React.createElement(Switch, { isSelected: config.security.passwordPolicy.requireLowercase, onValueChange: (checked) => updateNestedConfig('security', 'passwordPolicy', 'requireLowercase', checked) })),
                                        React.createElement("div", { className: "flex items-center justify-between" },
                                            React.createElement("span", null, "Require Numbers"),
                                            React.createElement(Switch, { isSelected: config.security.passwordPolicy.requireNumbers, onValueChange: (checked) => updateNestedConfig('security', 'passwordPolicy', 'requireNumbers', checked) })),
                                        React.createElement("div", { className: "flex items-center justify-between" },
                                            React.createElement("span", null, "Require Special Characters"),
                                            React.createElement(Switch, { isSelected: config.security.passwordPolicy.requireSpecialChars, onValueChange: (checked) => updateNestedConfig('security', 'passwordPolicy', 'requireSpecialChars', checked) }))))),
                            React.createElement(Divider, null),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement("h4", { className: "font-medium" }, "Two-Factor Authentication"),
                                    React.createElement("p", { className: "text-sm text-gray-600" }, "Require 2FA for all users")),
                                React.createElement(Switch, { isSelected: config.security.twoFactorEnabled, onValueChange: (checked) => updateConfig('security', 'twoFactorEnabled', checked) })))),
                    React.createElement(Tab, { key: "email", title: React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(EnvelopeIcon, { className: "w-4 h-4" }),
                            "Email") },
                        React.createElement("div", { className: "space-y-6 pt-4" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                React.createElement(Input, { label: "SMTP Host", value: config.email.smtpHost, onChange: (e) => updateConfig('email', 'smtpHost', e.target.value) }),
                                React.createElement(Input, { type: "number", label: "SMTP Port", value: config.email.smtpPort.toString(), onChange: (e) => updateConfig('email', 'smtpPort', parseInt(e.target.value)) }),
                                React.createElement(Input, { label: "SMTP Username", value: config.email.smtpUsername, onChange: (e) => updateConfig('email', 'smtpUsername', e.target.value) }),
                                React.createElement(Input, { type: "password", label: "SMTP Password", value: config.email.smtpPassword, onChange: (e) => updateConfig('email', 'smtpPassword', e.target.value) }),
                                React.createElement(Input, { label: "From Email", value: config.email.fromEmail, onChange: (e) => updateConfig('email', 'fromEmail', e.target.value) }),
                                React.createElement(Input, { label: "From Name", value: config.email.fromName, onChange: (e) => updateConfig('email', 'fromName', e.target.value) })),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement("h4", { className: "font-medium" }, "SMTP Secure (TLS/SSL)"),
                                    React.createElement("p", { className: "text-sm text-gray-600" }, "Use secure connection for SMTP")),
                                React.createElement(Switch, { isSelected: config.email.smtpSecure, onValueChange: (checked) => updateConfig('email', 'smtpSecure', checked) })))),
                    React.createElement(Tab, { key: "notifications", title: React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(BellIcon, { className: "w-4 h-4" }),
                            "Notifications") },
                        React.createElement("div", { className: "space-y-6 pt-4" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Email Notifications"),
                                        React.createElement("p", { className: "text-sm text-gray-600" }, "Enable email notifications")),
                                    React.createElement(Switch, { isSelected: config.notifications.emailNotifications, onValueChange: (checked) => updateConfig('notifications', 'emailNotifications', checked) })),
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Critical Alerts"),
                                        React.createElement("p", { className: "text-sm text-gray-600" }, "Send alerts for critical system events")),
                                    React.createElement(Switch, { isSelected: config.notifications.criticalAlerts, onValueChange: (checked) => updateConfig('notifications', 'criticalAlerts', checked) })),
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "System Updates"),
                                        React.createElement("p", { className: "text-sm text-gray-600" }, "Send notifications for system updates")),
                                    React.createElement(Switch, { isSelected: config.notifications.systemUpdates, onValueChange: (checked) => updateConfig('notifications', 'systemUpdates', checked) }))),
                            React.createElement(Divider, null),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h3", { className: "text-lg font-semibold" }, "Webhook URLs"),
                                React.createElement(Input, { label: "Slack Webhook", value: config.notifications.slackWebhook, onChange: (e) => updateConfig('notifications', 'slackWebhook', e.target.value), placeholder: "https://hooks.slack.com/services/..." }),
                                React.createElement(Input, { label: "Discord Webhook", value: config.notifications.discordWebhook, onChange: (e) => updateConfig('notifications', 'discordWebhook', e.target.value), placeholder: "https://discord.com/api/webhooks/..." }),
                                React.createElement(Input, { label: "Teams Webhook", value: config.notifications.teamsWebhook, onChange: (e) => updateConfig('notifications', 'teamsWebhook', e.target.value), placeholder: "https://outlook.office.com/webhook/..." })))),
                    React.createElement(Tab, { key: "integrations", title: React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(ServerIcon, { className: "w-4 h-4" }),
                            "Integrations") },
                        React.createElement("div", { className: "space-y-6 pt-4" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                                React.createElement(Card, null,
                                    React.createElement(CardHeader, null,
                                        React.createElement("h3", { className: "text-lg font-semibold" }, "Elasticsearch")),
                                    React.createElement(CardBody, null,
                                        React.createElement("div", { className: "space-y-4" },
                                            React.createElement("div", { className: "flex items-center justify-between" },
                                                React.createElement("span", null, "Enable Elasticsearch"),
                                                React.createElement(Switch, { isSelected: config.integrations.elasticsearchEnabled, onValueChange: (checked) => updateConfig('integrations', 'elasticsearchEnabled', checked) })),
                                            React.createElement(Input, { label: "Elasticsearch URL", value: config.integrations.elasticsearchUrl, onChange: (e) => updateConfig('integrations', 'elasticsearchUrl', e.target.value), isDisabled: !config.integrations.elasticsearchEnabled })))),
                                React.createElement(Card, null,
                                    React.createElement(CardHeader, null,
                                        React.createElement("h3", { className: "text-lg font-semibold" }, "Redis")),
                                    React.createElement(CardBody, null,
                                        React.createElement("div", { className: "space-y-4" },
                                            React.createElement("div", { className: "flex items-center justify-between" },
                                                React.createElement("span", null, "Enable Redis"),
                                                React.createElement(Switch, { isSelected: config.integrations.redisEnabled, onValueChange: (checked) => updateConfig('integrations', 'redisEnabled', checked) })),
                                            React.createElement(Input, { label: "Redis URL", value: config.integrations.redisUrl, onChange: (e) => updateConfig('integrations', 'redisUrl', e.target.value), isDisabled: !config.integrations.redisEnabled }))))),
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Webhooks"),
                                        React.createElement("p", { className: "text-sm text-gray-600" }, "Enable outgoing webhooks")),
                                    React.createElement(Switch, { isSelected: config.integrations.webhooksEnabled, onValueChange: (checked) => updateConfig('integrations', 'webhooksEnabled', checked) })),
                                React.createElement(Input, { type: "number", label: "API Rate Limit (per minute)", value: config.integrations.apiRateLimit.toString(), onChange: (e) => updateConfig('integrations', 'apiRateLimit', parseInt(e.target.value)) })))),
                    React.createElement(Tab, { key: "feature-flags", title: React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(KeyIcon, { className: "w-4 h-4" }),
                            "Feature Flags") },
                        React.createElement("div", { className: "space-y-6 pt-4" },
                            React.createElement("div", { className: "space-y-4" }, featureFlags.map((flag) => (React.createElement(Card, { key: flag.id },
                                React.createElement(CardBody, null,
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("div", { className: "flex-1" },
                                            React.createElement("div", { className: "flex items-center gap-3" },
                                                React.createElement("h4", { className: "font-medium" }, flag.name),
                                                React.createElement(Chip, { color: flag.category === 'ui' ? 'primary' :
                                                        flag.category === 'api' ? 'secondary' :
                                                            flag.category === 'integration' ? 'success' : 'warning', variant: "flat", size: "sm" }, flag.category),
                                                flag.enabled && (React.createElement(Chip, { color: "success", variant: "flat", size: "sm" }, "Active"))),
                                            React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, flag.description),
                                            React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
                                                "Rollout: ",
                                                flag.rolloutPercentage,
                                                "%")),
                                        React.createElement(Switch, { isSelected: flag.enabled, onValueChange: () => toggleFeatureFlag(flag.id) }))))))))),
                    React.createElement(Tab, { key: "environment", title: React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(DocumentIcon, { className: "w-4 h-4" }),
                            "Environment") },
                        React.createElement("div", { className: "space-y-6 pt-4" },
                            React.createElement("div", { className: "flex justify-between items-center" },
                                React.createElement("h3", { className: "text-lg font-semibold" }, "Environment Variables"),
                                React.createElement(Button, { size: "sm", onPress: onOpen }, "Add Variable")),
                            React.createElement("div", { className: "space-y-3" }, envVars.map((envVar) => (React.createElement(Card, { key: envVar.key },
                                React.createElement(CardBody, null,
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("div", { className: "flex-1" },
                                            React.createElement("div", { className: "flex items-center gap-3" },
                                                React.createElement("code", { className: "font-mono text-sm bg-gray-100 px-2 py-1 rounded" }, envVar.key),
                                                envVar.sensitive && (React.createElement(Chip, { color: "warning", variant: "flat", size: "sm" }, "Sensitive"))),
                                            React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, envVar.description),
                                            React.createElement("p", { className: "text-xs font-mono text-gray-500 mt-1" }, envVar.sensitive ? '***REDACTED***' : envVar.value)),
                                        React.createElement(Button, { size: "sm", variant: "light", onPress: () => {
                                                setSelectedEnvVar(envVar);
                                                onOpen();
                                            } }, "Edit")))))))))))),
        React.createElement(Modal, { isOpen: isOpen, onClose: onClose, size: "lg" },
            React.createElement(ModalContent, null,
                React.createElement(ModalHeader, null, selectedEnvVar ? 'Edit Environment Variable' : 'Add Environment Variable'),
                React.createElement(ModalBody, null,
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(Input, { label: "Key", placeholder: "VARIABLE_NAME", defaultValue: selectedEnvVar?.key || '' }),
                        React.createElement(Input, { label: "Value", placeholder: "variable value", defaultValue: selectedEnvVar?.value || '' }),
                        React.createElement(Textarea, { label: "Description", placeholder: "Description of this environment variable", defaultValue: selectedEnvVar?.description || '' }),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", null, "Sensitive Variable"),
                            React.createElement(Switch, { defaultSelected: selectedEnvVar?.sensitive || false })))),
                React.createElement(ModalFooter, null,
                    React.createElement(Button, { variant: "light", onPress: onClose }, "Cancel"),
                    React.createElement(Button, { color: "primary", onPress: onClose },
                        selectedEnvVar ? 'Update' : 'Add',
                        " Variable"))))));
};
export default SystemConfigurationPage;
