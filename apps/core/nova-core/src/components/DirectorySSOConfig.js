import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Select, Checkbox, Modal } from '@/components/ui';
import { UserGroupIcon, ShieldCheckIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon, CogIcon, ArrowPathIcon, KeyIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import { PasskeyManagement } from './PasskeyManagement';
export const DirectorySSOConfig = ({ onConfigChange }) => {
    const [activeTab, setActiveTab] = useState('directory');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [setupType, setSetupType] = useState('directory');
    const [directoryConfig, setDirectoryConfig] = useState({
        enabled: false,
        provider: 'mock',
        readonly: true,
        syncInterval: 3600
    });
    const [ssoConfig, setSsoConfig] = useState({
        enabled: false,
        provider: 'saml'
    });
    const [scimConfig, setScimConfig] = useState({
        enabled: false
    });
    const { addToast } = useToastStore();
    useEffect(() => {
        loadConfigs();
    }, []);
    const loadConfigs = async () => {
        try {
            setLoading(true);
            // Load directory config
            const directoryData = await api.getDirectoryConfig();
            setDirectoryConfig({
                enabled: directoryData.directoryEnabled === '1' || directoryData.directoryEnabled === true,
                provider: directoryData.directoryProvider || 'mock',
                url: directoryData.directoryUrl || '',
                token: directoryData.directoryToken || '',
                baseDN: directoryData.directoryBaseDN || '',
                bindDN: directoryData.directoryBindDN || '',
                bindPassword: directoryData.directoryBindPassword || '',
                userFilter: directoryData.directoryUserFilter || '',
                syncInterval: parseInt(directoryData.directorySyncInterval) || 3600,
                readonly: true // Always true for 1-way pull
            });
            // Load SSO config
            const ssoData = await api.getSSOConfig();
            setSsoConfig(ssoData);
            // Load SCIM config
            const scimData = await api.getSCIMConfig();
            setScimConfig(scimData);
        }
        catch (error) {
            console.error('Failed to load directory/SSO configs:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load configuration'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const saveDirectoryConfig = async () => {
        try {
            setSaving(true);
            const configToSave = {
                directoryEnabled: directoryConfig.enabled ? '1' : '0',
                directoryProvider: directoryConfig.provider,
                directoryUrl: directoryConfig.url || '',
                directoryToken: directoryConfig.token || '',
                directoryBaseDN: directoryConfig.baseDN || '',
                directoryBindDN: directoryConfig.bindDN || '',
                directoryBindPassword: directoryConfig.bindPassword || '',
                directoryUserFilter: directoryConfig.userFilter || '',
                directorySyncInterval: directoryConfig.syncInterval?.toString() || '3600'
            };
            await api.updateDirectoryConfig(configToSave);
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Directory configuration saved successfully'
            });
            onConfigChange?.();
        }
        catch (error) {
            console.error('Failed to save directory config:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to save directory configuration'
            });
        }
        finally {
            setSaving(false);
        }
    };
    const testDirectoryConnection = async () => {
        try {
            setTesting(true);
            // Test directory search with a sample query
            const response = await api.searchDirectory('test');
            addToast({
                type: 'success',
                title: 'Connection Successful',
                description: `Directory connection test passed. Found ${response.length} test results.`
            });
        }
        catch (error) {
            console.error('Directory connection test failed:', error);
            addToast({
                type: 'error',
                title: 'Connection Failed',
                description: 'Directory connection test failed. Please check your configuration.'
            });
        }
        finally {
            setTesting(false);
        }
    };
    const openSetupWizard = (type) => {
        setSetupType(type);
        setShowSetupModal(true);
    };
    const saveSSOConfig = async () => {
        try {
            setSaving(true);
            await api.updateSSOConfig({
                enabled: ssoConfig.enabled,
                provider: ssoConfig.provider,
                configuration: ssoConfig
            });
            addToast({
                type: 'success',
                title: 'Success',
                description: 'SSO configuration saved successfully'
            });
            onConfigChange?.();
        }
        catch (error) {
            console.error('Failed to save SSO config:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to save SSO configuration'
            });
        }
        finally {
            setSaving(false);
        }
    };
    const saveSCIMConfig = async () => {
        try {
            setSaving(true);
            await api.updateSCIMConfig({
                enabled: scimConfig.enabled,
                bearerToken: scimConfig.token,
                endpointUrl: scimConfig.endpoint,
                autoProvisioning: scimConfig.autoProvisioning,
                autoDeprovisioning: scimConfig.autoDeprovisioning,
                syncInterval: scimConfig.syncInterval
            });
            addToast({
                type: 'success',
                title: 'Success',
                description: 'SCIM configuration saved successfully'
            });
            onConfigChange?.();
        }
        catch (error) {
            console.error('Failed to save SCIM config:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to save SCIM configuration'
            });
        }
        finally {
            setSaving(false);
        }
    };
    const renderDirectoryTab = () => (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4" },
            React.createElement("div", { className: "flex" },
                React.createElement(InformationCircleIcon, { className: "h-5 w-5 text-blue-400" }),
                React.createElement("div", { className: "ml-3" },
                    React.createElement("h3", { className: "text-sm font-medium text-blue-800 dark:text-blue-200" }, "1-Way Directory Integration"),
                    React.createElement("div", { className: "mt-2 text-sm text-blue-700 dark:text-blue-300" },
                        React.createElement("p", null, "Directory integration is read-only and pulls user information for display purposes only. Nova Universe will never modify user data in your directory."))))),
        React.createElement(Card, { className: "p-6" },
            React.createElement("div", { className: "flex items-center justify-between mb-6" },
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100" }, "Directory Configuration"),
                    React.createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400" }, "Configure directory integration for user lookup and display")),
                React.createElement("div", { className: "flex space-x-2" },
                    React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => openSetupWizard('directory') },
                        React.createElement(CogIcon, { className: "h-4 w-4 mr-2" }),
                        "Setup Wizard"),
                    directoryConfig.enabled && (React.createElement(Button, { variant: "secondary", size: "sm", onClick: testDirectoryConnection, disabled: testing },
                        React.createElement(ArrowPathIcon, { className: `h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}` }),
                        "Test Connection")))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(Checkbox, { label: "Enable Directory Integration", checked: directoryConfig.enabled, onChange: (checked) => setDirectoryConfig(prev => ({ ...prev, enabled: checked })) }),
                    React.createElement(Select, { label: "Directory Provider", value: directoryConfig.provider, onChange: (value) => setDirectoryConfig(prev => ({ ...prev, provider: value })), options: [
                            { value: 'mock', label: 'Mock Directory (for testing)' },
                            { value: 'scim', label: 'SCIM 2.0' },
                            { value: 'ldap', label: 'LDAP' },
                            { value: 'activedirectory', label: 'Active Directory' }
                        ], disabled: !directoryConfig.enabled }),
                    directoryConfig.provider === 'scim' && (React.createElement(React.Fragment, null,
                        React.createElement(Input, { label: "SCIM Endpoint URL", value: directoryConfig.url || '', onChange: (e) => setDirectoryConfig(prev => ({ ...prev, url: e.target.value })), placeholder: "https://your-idp.com/scim/v2", disabled: !directoryConfig.enabled }),
                        React.createElement(Input, { label: "Bearer Token", type: "password", value: directoryConfig.token || '', onChange: (e) => setDirectoryConfig(prev => ({ ...prev, token: e.target.value })), placeholder: "Bearer token for SCIM API", disabled: !directoryConfig.enabled }))),
                    (directoryConfig.provider === 'ldap' || directoryConfig.provider === 'activedirectory') && (React.createElement(React.Fragment, null,
                        React.createElement(Input, { label: "LDAP Server URL", value: directoryConfig.url || '', onChange: (e) => setDirectoryConfig(prev => ({ ...prev, url: e.target.value })), placeholder: "ldap://your-ldap-server.com:389", disabled: !directoryConfig.enabled }),
                        React.createElement(Input, { label: "Base DN", value: directoryConfig.baseDN || '', onChange: (e) => setDirectoryConfig(prev => ({ ...prev, baseDN: e.target.value })), placeholder: "ou=users,dc=company,dc=com", disabled: !directoryConfig.enabled }),
                        React.createElement(Input, { label: "Bind DN", value: directoryConfig.bindDN || '', onChange: (e) => setDirectoryConfig(prev => ({ ...prev, bindDN: e.target.value })), placeholder: "cn=admin,dc=company,dc=com", disabled: !directoryConfig.enabled }),
                        React.createElement(Input, { label: "Bind Password", type: "password", value: directoryConfig.bindPassword || '', onChange: (e) => setDirectoryConfig(prev => ({ ...prev, bindPassword: e.target.value })), placeholder: "Password for bind DN", disabled: !directoryConfig.enabled })))),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(Input, { label: "User Filter", value: directoryConfig.userFilter || '', onChange: (e) => setDirectoryConfig(prev => ({ ...prev, userFilter: e.target.value })), placeholder: "(objectClass=person)", disabled: !directoryConfig.enabled, helperText: "LDAP filter for user objects" }),
                    React.createElement(Input, { label: "Sync Interval (seconds)", type: "number", value: directoryConfig.syncInterval?.toString() || '3600', onChange: (e) => setDirectoryConfig(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 3600 })), disabled: !directoryConfig.enabled, helperText: "How often to sync user data (3600 = 1 hour)" }),
                    React.createElement("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded-md" },
                        React.createElement("h4", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2" }, "Security Notice"),
                        React.createElement("ul", { className: "text-xs text-gray-600 dark:text-gray-400 space-y-1" },
                            React.createElement("li", null, "\u2022 Directory integration is read-only"),
                            React.createElement("li", null, "\u2022 User data is never modified in your directory"),
                            React.createElement("li", null, "\u2022 Used only for lookup and display purposes"),
                            React.createElement("li", null, "\u2022 Credentials are stored encrypted"))))),
            React.createElement("div", { className: "flex justify-end mt-6" },
                React.createElement(Button, { variant: "primary", onClick: saveDirectoryConfig, disabled: saving || !directoryConfig.enabled, isLoading: saving }, "Save Directory Configuration")))));
    const renderSSOTab = () => (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4" },
            React.createElement("div", { className: "flex" },
                React.createElement(ExclamationTriangleIcon, { className: "h-5 w-5 text-amber-400" }),
                React.createElement("div", { className: "ml-3" },
                    React.createElement("h3", { className: "text-sm font-medium text-amber-800 dark:text-amber-200" }, "SSO Configuration Notice"),
                    React.createElement("div", { className: "mt-2 text-sm text-amber-700 dark:text-amber-300" },
                        React.createElement("p", null, "SSO provides an additional login method alongside local authentication. Users can still log in with their email/password even when SSO is enabled. Contact your system administrator to configure SAML SSO."))))),
        React.createElement(Card, { className: "p-6" },
            React.createElement("div", { className: "flex items-center justify-between mb-6" },
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100" }, "Single Sign-On (SSO)"),
                    React.createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400" }, "Configure SAML SSO for seamless authentication")),
                React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => openSetupWizard('sso') },
                    React.createElement(CogIcon, { className: "h-4 w-4 mr-2" }),
                    "Setup Guide")),
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Checkbox, { label: "Enable SSO", checked: ssoConfig.enabled, onChange: (checked) => setSsoConfig(prev => ({ ...prev, enabled: checked })) }),
                ssoConfig.enabled && (React.createElement("div", { className: "space-y-4" },
                    React.createElement(Select, { label: "SSO Provider", value: ssoConfig.provider, onChange: (value) => setSsoConfig(prev => ({ ...prev, provider: value })), options: [
                            { value: 'saml', label: 'SAML 2.0' },
                            { value: 'oidc', label: 'OpenID Connect' }
                        ] }),
                    ssoConfig.provider === 'saml' && (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(Input, { label: "SAML Entry Point", value: ssoConfig.saml?.entryPoint || '', onChange: (e) => setSsoConfig(prev => ({
                                ...prev,
                                saml: {
                                    enabled: true,
                                    entryPoint: e.target.value,
                                    issuer: prev.saml?.issuer || '',
                                    callbackUrl: prev.saml?.callbackUrl || '',
                                    cert: prev.saml?.cert || ''
                                }
                            })), placeholder: "https://idp.example.com/sso/saml" }),
                        React.createElement(Input, { label: "SAML Issuer", value: ssoConfig.saml?.issuer || '', onChange: (e) => setSsoConfig(prev => ({
                                ...prev,
                                saml: {
                                    enabled: true,
                                    entryPoint: prev.saml?.entryPoint || '',
                                    issuer: e.target.value,
                                    callbackUrl: prev.saml?.callbackUrl || '',
                                    cert: prev.saml?.cert || ''
                                }
                            })), placeholder: "https://your-app.com" }),
                        React.createElement(Input, { label: "Callback URL", value: ssoConfig.saml?.callbackUrl || '', onChange: (e) => setSsoConfig(prev => ({
                                ...prev,
                                saml: {
                                    enabled: true,
                                    entryPoint: prev.saml?.entryPoint || '',
                                    issuer: prev.saml?.issuer || '',
                                    callbackUrl: e.target.value,
                                    cert: prev.saml?.cert || ''
                                }
                            })), placeholder: "https://your-app.com/auth/saml/callback" }),
                        React.createElement("div", { className: "md:col-span-2" },
                            React.createElement("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" }, "Identity Provider Certificate"),
                            React.createElement("textarea", { value: ssoConfig.saml?.cert || '', onChange: (e) => setSsoConfig(prev => ({
                                    ...prev,
                                    saml: {
                                        enabled: true,
                                        entryPoint: prev.saml?.entryPoint || '',
                                        issuer: prev.saml?.issuer || '',
                                        callbackUrl: prev.saml?.callbackUrl || '',
                                        cert: e.target.value
                                    }
                                })), placeholder: "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----", rows: 4, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100" })))),
                    ssoConfig.provider === 'oidc' && (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(Input, { label: "Discovery URL", value: ssoConfig.oidc?.discoveryUrl || '', onChange: (e) => setSsoConfig(prev => ({
                                ...prev,
                                oidc: {
                                    enabled: true,
                                    discoveryUrl: e.target.value,
                                    clientId: prev.oidc?.clientId || '',
                                    clientSecret: prev.oidc?.clientSecret || '',
                                    scope: prev.oidc?.scope || 'openid profile email'
                                }
                            })), placeholder: "https://idp.example.com/.well-known/openid_configuration" }),
                        React.createElement(Input, { label: "Client ID", value: ssoConfig.oidc?.clientId || '', onChange: (e) => setSsoConfig(prev => ({
                                ...prev,
                                oidc: {
                                    enabled: true,
                                    discoveryUrl: prev.oidc?.discoveryUrl || '',
                                    clientId: e.target.value,
                                    clientSecret: prev.oidc?.clientSecret || '',
                                    scope: prev.oidc?.scope || 'openid profile email'
                                }
                            })), placeholder: "your-client-id" }),
                        React.createElement(Input, { label: "Client Secret", type: "password", value: ssoConfig.oidc?.clientSecret || '', onChange: (e) => setSsoConfig(prev => ({
                                ...prev,
                                oidc: {
                                    enabled: true,
                                    discoveryUrl: prev.oidc?.discoveryUrl || '',
                                    clientId: prev.oidc?.clientId || '',
                                    clientSecret: e.target.value,
                                    scope: prev.oidc?.scope || 'openid profile email'
                                }
                            })), placeholder: "your-client-secret" }),
                        React.createElement(Input, { label: "Scope", value: ssoConfig.oidc?.scope || 'openid profile email', onChange: (e) => setSsoConfig(prev => ({
                                ...prev,
                                oidc: {
                                    enabled: true,
                                    discoveryUrl: prev.oidc?.discoveryUrl || '',
                                    clientId: prev.oidc?.clientId || '',
                                    clientSecret: prev.oidc?.clientSecret || '',
                                    scope: e.target.value
                                }
                            })), placeholder: "openid profile email" }))))),
                React.createElement("div", { className: "flex items-center space-x-2" },
                    ssoConfig.enabled ? (React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-green-500" })) : (React.createElement(XCircleIcon, { className: "h-5 w-5 text-gray-400" })),
                    React.createElement("span", { className: `text-sm ${ssoConfig.enabled ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}` },
                        "SSO ",
                        ssoConfig.enabled ? 'Enabled' : 'Disabled')),
                ssoConfig.saml && (React.createElement("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded-md" },
                    React.createElement("h4", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-3" }, "Current SAML Configuration"),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" },
                        React.createElement("div", null,
                            React.createElement("span", { className: "font-medium text-gray-700 dark:text-gray-300" }, "Entry Point:"),
                            React.createElement("span", { className: "text-gray-600 dark:text-gray-400 ml-2" }, ssoConfig.saml.entryPoint ? '✓ Configured' : '✗ Not configured')),
                        React.createElement("div", null,
                            React.createElement("span", { className: "font-medium text-gray-700 dark:text-gray-300" }, "Issuer:"),
                            React.createElement("span", { className: "text-gray-600 dark:text-gray-400 ml-2" }, ssoConfig.saml.issuer ? '✓ Configured' : '✗ Not configured')),
                        React.createElement("div", null,
                            React.createElement("span", { className: "font-medium text-gray-700 dark:text-gray-300" }, "Callback URL:"),
                            React.createElement("span", { className: "text-gray-600 dark:text-gray-400 ml-2" }, ssoConfig.saml.callbackUrl ? '✓ Configured' : '✗ Not configured')),
                        React.createElement("div", null,
                            React.createElement("span", { className: "font-medium text-gray-700 dark:text-gray-300" }, "Certificate:"),
                            React.createElement("span", { className: "text-gray-600 dark:text-gray-400 ml-2" }, ssoConfig.saml.cert ? '✓ Configured' : '✗ Not configured'))))),
                ssoConfig.enabled && (React.createElement("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-md" },
                    React.createElement("h4", { className: "text-sm font-medium text-green-800 dark:text-green-200 mb-3" }, "SSO Login Information"),
                    React.createElement("div", { className: "space-y-2 text-xs" },
                        React.createElement("div", null,
                            React.createElement("span", { className: "font-medium text-green-700 dark:text-green-300" }, "SSO Login URL:"),
                            React.createElement("code", { className: "ml-2 bg-green-100 dark:bg-green-800 px-1 rounded" },
                                window.location.origin,
                                "/auth/saml")),
                        React.createElement("div", null,
                            React.createElement("span", { className: "font-medium text-green-700 dark:text-green-300" }, "Callback URL:"),
                            React.createElement("code", { className: "ml-2 bg-green-100 dark:bg-green-800 px-1 rounded" },
                                window.location.origin,
                                "/auth/saml/callback")),
                        React.createElement("div", { className: "mt-2 text-green-700 dark:text-green-300" },
                            React.createElement("p", null, "Users can choose between local login (email/password) or SSO on the login page."))))),
                React.createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md" },
                    React.createElement("h4", { className: "text-sm font-medium text-blue-800 dark:text-blue-200 mb-2" }, "Information"),
                    React.createElement("div", { className: "text-xs text-blue-700 dark:text-blue-300 space-y-1" },
                        React.createElement("div", null, "Configure your SSO provider above to enable single sign-on for users."),
                        React.createElement("div", null, "Users will be able to choose between local login (email/password) or SSO on the login page."),
                        React.createElement("div", null, "SSO provides an additional authentication method alongside existing local accounts.")))),
            React.createElement("div", { className: "flex justify-end mt-6" },
                React.createElement(Button, { variant: "primary", onClick: saveSSOConfig, disabled: saving, isLoading: saving }, "Save SSO Configuration")))));
    const renderSCIMTab = () => (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4" },
            React.createElement("div", { className: "flex" },
                React.createElement(InformationCircleIcon, { className: "h-5 w-5 text-green-400" }),
                React.createElement("div", { className: "ml-3" },
                    React.createElement("h3", { className: "text-sm font-medium text-green-800 dark:text-green-200" }, "SCIM User Provisioning"),
                    React.createElement("div", { className: "mt-2 text-sm text-green-700 dark:text-green-300" },
                        React.createElement("p", null, "SCIM 2.0 endpoints allow your identity provider to automatically provision and deprovision users."))))),
        React.createElement(Card, { className: "p-6" },
            React.createElement("div", { className: "flex items-center justify-between mb-6" },
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100" }, "SCIM Provisioning"),
                    React.createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400" }, "Configure SCIM endpoints for automated user management")),
                React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => openSetupWizard('scim') },
                    React.createElement(CogIcon, { className: "h-4 w-4 mr-2" }),
                    "Setup Guide")),
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Checkbox, { label: "Enable SCIM Provisioning", checked: scimConfig.enabled, onChange: (checked) => setScimConfig(prev => ({ ...prev, enabled: checked })) }),
                scimConfig.enabled && (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(Input, { label: "Bearer Token", type: "password", value: scimConfig.token || '', onChange: (e) => setScimConfig(prev => ({ ...prev, token: e.target.value })), placeholder: "Enter SCIM bearer token", helperText: "Token used by identity provider to authenticate SCIM requests" }),
                        React.createElement(Input, { label: "SCIM Endpoint URL (Optional)", value: scimConfig.endpoint || '', onChange: (e) => setScimConfig(prev => ({ ...prev, endpoint: e.target.value })), placeholder: "https://external-scim-endpoint.com", helperText: "Leave empty to use built-in SCIM endpoints" })),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        React.createElement("div", null,
                            React.createElement(Checkbox, { label: "Auto Provisioning", checked: scimConfig.autoProvisioning || false, onChange: (checked) => setScimConfig(prev => ({ ...prev, autoProvisioning: checked })) }),
                            React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Automatically create users when provisioned via SCIM")),
                        React.createElement("div", null,
                            React.createElement(Checkbox, { label: "Auto Deprovisioning", checked: scimConfig.autoDeprovisioning || false, onChange: (checked) => setScimConfig(prev => ({ ...prev, autoDeprovisioning: checked })) }),
                            React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Automatically disable users when deprovisioned via SCIM")),
                        React.createElement(Input, { label: "Sync Interval (minutes)", type: "number", value: scimConfig.syncInterval?.toString() || '60', onChange: (e) => setScimConfig(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 60 })), helperText: "How often to sync with external SCIM endpoint" })),
                    React.createElement("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded-md" },
                        React.createElement("h4", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-3" }, "SCIM Endpoints"),
                        React.createElement("div", { className: "space-y-2 text-xs" },
                            React.createElement("div", null,
                                React.createElement("span", { className: "font-medium text-gray-700 dark:text-gray-300" }, "Base URL:"),
                                React.createElement("code", { className: "ml-2 bg-gray-100 dark:bg-gray-700 px-1 rounded" },
                                    window.location.origin,
                                    "/scim/v2")),
                            React.createElement("div", null,
                                React.createElement("span", { className: "font-medium text-gray-700 dark:text-gray-300" }, "Users:"),
                                React.createElement("code", { className: "ml-2 bg-gray-100 dark:bg-gray-700 px-1 rounded" },
                                    window.location.origin,
                                    "/scim/v2/Users")),
                            React.createElement("div", null,
                                React.createElement("span", { className: "font-medium text-gray-700 dark:text-gray-300" }, "Groups:"),
                                React.createElement("code", { className: "ml-2 bg-gray-100 dark:bg-gray-700 px-1 rounded" },
                                    window.location.origin,
                                    "/scim/v2/Groups")))))),
                React.createElement("div", { className: "flex items-center space-x-2" },
                    scimConfig.enabled ? (React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-green-500" })) : (React.createElement(XCircleIcon, { className: "h-5 w-5 text-gray-400" })),
                    React.createElement("span", { className: `text-sm ${scimConfig.enabled ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}` },
                        "SCIM 2.0 ",
                        scimConfig.enabled ? 'Enabled' : 'Disabled')),
                React.createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md" },
                    React.createElement("h4", { className: "text-sm font-medium text-blue-800 dark:text-blue-200 mb-2" }, "Setup Instructions"),
                    React.createElement("div", { className: "text-xs text-blue-700 dark:text-blue-300 space-y-1" },
                        React.createElement("div", null, "1. Enable SCIM provisioning above and set a bearer token"),
                        React.createElement("div", null, "2. Configure your identity provider with the SCIM endpoints shown above"),
                        React.createElement("div", null, "3. Use the bearer token as an Authorization header in your IdP"),
                        React.createElement("div", null, "4. Test user provisioning to ensure everything works correctly")))),
            React.createElement("div", { className: "flex justify-end mt-6" },
                React.createElement(Button, { variant: "primary", onClick: saveSCIMConfig, disabled: saving, isLoading: saving }, "Save SCIM Configuration")))));
    const renderSetupModal = () => (React.createElement(Modal, { isOpen: showSetupModal, onClose: () => setShowSetupModal(false), title: `${setupType.toUpperCase()} Setup Guide`, size: "lg" },
        React.createElement("div", { className: "space-y-4" },
            setupType === 'directory' && (React.createElement("div", { className: "space-y-4" },
                React.createElement("h3", { className: "text-lg font-medium" }, "Directory Integration Setup"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-blue-800 dark:text-blue-200 mb-2" }, "Step 1: Choose Provider"),
                        React.createElement("ul", { className: "text-sm text-blue-700 dark:text-blue-300 space-y-1" },
                            React.createElement("li", null,
                                "\u2022 ",
                                React.createElement("strong", null, "SCIM 2.0:"),
                                " For modern identity providers (Okta, Azure AD, etc.)"),
                            React.createElement("li", null,
                                "\u2022 ",
                                React.createElement("strong", null, "LDAP:"),
                                " For traditional LDAP directories"),
                            React.createElement("li", null,
                                "\u2022 ",
                                React.createElement("strong", null, "Active Directory:"),
                                " For Microsoft Active Directory"))),
                    React.createElement("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-green-800 dark:text-green-200 mb-2" }, "Step 2: Configure Credentials"),
                        React.createElement("ul", { className: "text-sm text-green-700 dark:text-green-300 space-y-1" },
                            React.createElement("li", null, "\u2022 Enter your directory server URL"),
                            React.createElement("li", null, "\u2022 Provide authentication credentials (token or bind DN/password)"),
                            React.createElement("li", null, "\u2022 Configure user filters if needed"))),
                    React.createElement("div", { className: "bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-purple-800 dark:text-purple-200 mb-2" }, "Step 3: Test & Save"),
                        React.createElement("ul", { className: "text-sm text-purple-700 dark:text-purple-300 space-y-1" },
                            React.createElement("li", null, "\u2022 Use the \"Test Connection\" button to verify setup"),
                            React.createElement("li", null, "\u2022 Save configuration when test passes"),
                            React.createElement("li", null, "\u2022 Users will now be searchable in kiosk forms")))))),
            setupType === 'sso' && (React.createElement("div", { className: "space-y-4" },
                React.createElement("h3", { className: "text-lg font-medium" }, "SAML SSO Setup"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-amber-800 dark:text-amber-200 mb-2" }, "Step 1: Configure Environment Variables"),
                        React.createElement("div", { className: "text-sm text-amber-700 dark:text-amber-300 space-y-2" },
                            React.createElement("p", null,
                                "Add these variables to your ",
                                React.createElement("code", { className: "bg-amber-100 dark:bg-amber-800 px-1 rounded" }, ".env"),
                                " file:"),
                            React.createElement("pre", { className: "bg-amber-100 dark:bg-amber-800 p-2 rounded text-xs overflow-x-auto" }, `SAML_ENTRY_POINT=https://your-idp.com/sso/saml
SAML_ISSUER=https://your-app.com
SAML_CALLBACK_URL=https://your-app.com/login/callback
SAML_CERT="-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----"
SESSION_SECRET=your-secure-session-secret`))),
                    React.createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-blue-800 dark:text-blue-200 mb-2" }, "Step 2: Configure Identity Provider"),
                        React.createElement("ul", { className: "text-sm text-blue-700 dark:text-blue-300 space-y-1" },
                            React.createElement("li", null, "\u2022 Create a new SAML application in your IdP"),
                            React.createElement("li", null,
                                "\u2022 Set Single Sign On URL to: ",
                                React.createElement("code", { className: "bg-blue-100 dark:bg-blue-800 px-1 rounded" },
                                    window.location.origin,
                                    "/login/callback")),
                            React.createElement("li", null, "\u2022 Set Audience URI to your issuer value"),
                            React.createElement("li", null, "\u2022 Map email attribute to user email"))),
                    React.createElement("div", { className: "bg-red-50 dark:bg-red-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-red-800 dark:text-red-200 mb-2" }, "Step 3: Restart Server"),
                        React.createElement("p", { className: "text-sm text-red-700 dark:text-red-300" }, "Server restart is required for SSO changes to take effect. Contact your system administrator."))))),
            setupType === 'scim' && (React.createElement("div", { className: "space-y-4" },
                React.createElement("h3", { className: "text-lg font-medium" }, "SCIM Provisioning Setup"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-green-800 dark:text-green-200 mb-2" }, "Step 1: Generate SCIM Token"),
                        React.createElement("div", { className: "text-sm text-green-700 dark:text-green-300 space-y-2" },
                            React.createElement("p", null, "Set the SCIM token in your environment:"),
                            React.createElement("pre", { className: "bg-green-100 dark:bg-green-800 p-2 rounded text-xs" }, "SCIM_TOKEN=your-secure-scim-token"))),
                    React.createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-blue-800 dark:text-blue-200 mb-2" }, "Step 2: Configure Identity Provider"),
                        React.createElement("div", { className: "text-sm text-blue-700 dark:text-blue-300 space-y-2" },
                            React.createElement("p", null, "Use these SCIM endpoints in your IdP:"),
                            React.createElement("ul", { className: "space-y-1" },
                                React.createElement("li", null,
                                    "\u2022 Base URL: ",
                                    React.createElement("code", { className: "bg-blue-100 dark:bg-blue-800 px-1 rounded" },
                                        window.location.origin,
                                        "/scim/v2")),
                                React.createElement("li", null, "\u2022 Authentication: Bearer Token (use your SCIM_TOKEN)"),
                                React.createElement("li", null, "\u2022 Supported operations: Create, Read, Update, Delete users")))),
                    React.createElement("div", { className: "bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-purple-800 dark:text-purple-200 mb-2" }, "Step 3: Test Provisioning"),
                        React.createElement("div", { className: "text-sm text-purple-700 dark:text-purple-300" },
                            React.createElement("p", null, "Test user creation with curl:"),
                            React.createElement("pre", { className: "bg-purple-100 dark:bg-purple-800 p-2 rounded text-xs mt-2 overflow-x-auto" }, `curl -X POST ${window.location.origin}/scim/v2/Users \\
  -H "Authorization: Bearer YOUR_SCIM_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"userName":"test@example.com","displayName":"Test User"}'`)))))),
            React.createElement("div", { className: "flex justify-end" },
                React.createElement(Button, { variant: "secondary", onClick: () => setShowSetupModal(false) }, "Close")))));
    if (loading) {
        return (React.createElement("div", { className: "flex items-center justify-center py-12" },
            React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" })));
    }
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "border-b border-gray-200 dark:border-gray-700" },
            React.createElement("nav", { className: "-mb-px flex space-x-8" }, [
                { id: 'directory', label: 'Directory Integration', icon: UserGroupIcon },
                { id: 'sso', label: 'Single Sign-On', icon: ShieldCheckIcon },
                { id: 'scim', label: 'SCIM Provisioning', icon: CogIcon },
                { id: 'passkeys', label: 'Passkeys', icon: KeyIcon }
            ].map((tab) => (React.createElement("button", { key: tab.id, onClick: () => setActiveTab(tab.id), className: `group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}` },
                React.createElement(tab.icon, { className: "w-5 h-5 mr-2" }),
                tab.label))))),
        activeTab === 'directory' && renderDirectoryTab(),
        activeTab === 'sso' && renderSSOTab(),
        activeTab === 'scim' && renderSCIMTab(),
        activeTab === 'passkeys' && React.createElement(PasskeyManagement, null),
        renderSetupModal()));
};
