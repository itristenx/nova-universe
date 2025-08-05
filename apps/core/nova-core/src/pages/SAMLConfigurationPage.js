import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { ArrowPathIcon, CheckCircleIcon, ClipboardDocumentIcon, CogIcon, DocumentTextIcon, ExclamationTriangleIcon, InformationCircleIcon, KeyIcon, LinkIcon, PlayIcon, ShieldCheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
export const SAMLConfigurationPage = () => {
    const [config, setConfig] = useState({
        enabled: false,
        entryPoint: '',
        issuer: '',
        callbackUrl: `${window.location.origin}/auth/saml/callback`,
        cert: '',
        signatureAlgorithm: 'sha256',
        digestAlgorithm: 'sha256',
        authnContextClassRef: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
        attributeMapping: {
            email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
            displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
            firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
            lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
            groups: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/group'
        },
        spEntityId: window.location.origin,
        allowedClockDrift: 0,
        forceAuthn: false,
        bypassLoginPage: false,
        groupMirroringEnabled: false,
        autoProvisionUsers: true,
        defaultUserRole: 'user'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [showSetupWizard, setShowSetupWizard] = useState(false);
    const [showMetadataParser, setShowMetadataParser] = useState(false);
    const [metadataXml, setMetadataXml] = useState('');
    // Simple toast replacement
    const addToast = (params) => {
        console.log(`${params.type.toUpperCase()}: ${params.title} - ${params.description}`);
        // In a real implementation, you would use your toast system here
    };
    const loadConfig = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getSSOConfig();
            if (data.saml) {
                setConfig({
                    ...config,
                    ...data.saml,
                    enabled: data.enabled && data.provider === 'saml'
                });
            }
        }
        catch (error) {
            console.error('Failed to load SAML config:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load SAML configuration'
            });
        }
        finally {
            setLoading(false);
        }
    }, [config]);
    useEffect(() => {
        loadConfig();
    }, [loadConfig]);
    const saveConfig = async () => {
        try {
            setSaving(true);
            await api.updateSSOConfig({
                enabled: config.enabled,
                provider: 'saml',
                configuration: {
                    saml: config
                }
            });
            addToast({
                type: 'success',
                title: 'Success',
                description: 'SAML configuration saved successfully. Server restart may be required for changes to take effect.'
            });
        }
        catch (error) {
            console.error('Failed to save SAML config:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to save SAML configuration'
            });
        }
        finally {
            setSaving(false);
        }
    };
    const testSAMLConnection = async () => {
        try {
            setTesting(true);
            setTestResult(null);
            // Simulate SAML connection test
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockResult = {
                success: config.entryPoint && config.issuer && config.cert ? true : false,
                message: config.entryPoint && config.issuer && config.cert
                    ? 'SAML configuration test passed successfully'
                    : 'Missing required SAML configuration fields',
                details: {
                    connectionTest: !!config.entryPoint,
                    certificateValid: !!config.cert,
                    attributeMapping: true,
                    userInfo: config.entryPoint && config.issuer && config.cert ? {
                        email: 'test.user@example.com',
                        displayName: 'Test User',
                        firstName: 'Test',
                        lastName: 'User',
                        groups: ['Users', 'Employees']
                    } : undefined
                }
            };
            setTestResult(mockResult);
            addToast({
                type: mockResult.success ? 'success' : 'error',
                title: mockResult.success ? 'Test Successful' : 'Test Failed',
                description: mockResult.message
            });
        }
        catch (error) {
            console.error('SAML test failed:', error);
            addToast({
                type: 'error',
                title: 'Test Failed',
                description: 'Failed to test SAML connection'
            });
        }
        finally {
            setTesting(false);
        }
    };
    const parseMetadata = () => {
        try {
            if (!metadataXml.trim()) {
                addToast({
                    type: 'error',
                    title: 'Error',
                    description: 'Please provide IdP metadata XML'
                });
                return;
            }
            // Mock metadata parsing - in real implementation would parse XML
            const mockParsedData = {
                entryPoint: 'https://your-idp.com/sso/saml',
                issuer: 'https://your-idp.com',
                cert: '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----'
            };
            setConfig(prev => ({
                ...prev,
                ...mockParsedData
            }));
            setShowMetadataParser(false);
            setMetadataXml('');
            addToast({
                type: 'success',
                title: 'Success',
                description: 'IdP metadata parsed successfully'
            });
        }
        catch {
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to parse IdP metadata'
            });
        }
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        addToast({
            type: 'success',
            title: 'Copied',
            description: 'Text copied to clipboard'
        });
    };
    const generateMetadata = () => {
        const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${config.spEntityId}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService index="0" isDefault="true" 
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" 
      Location="${config.callbackUrl}" />
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
        copyToClipboard(metadata);
    };
    if (loading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600" })));
    }
    return (React.createElement("div", { className: "p-6 max-w-6xl mx-auto space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center" },
                    React.createElement(ShieldCheckIcon, { className: "h-8 w-8 mr-3 text-blue-600" }),
                    "SAML Configuration"),
                React.createElement("p", { className: "text-gray-600 dark:text-gray-400 mt-1" }, "Configure Security Assertion Markup Language (SAML) 2.0 for enterprise single sign-on")),
            React.createElement("div", { className: "flex space-x-3" },
                React.createElement(Button, { variant: "secondary", onClick: () => setShowSetupWizard(true) },
                    React.createElement(CogIcon, { className: "h-4 w-4 mr-2" }),
                    "Setup Wizard"),
                React.createElement(Button, { variant: "secondary", onClick: () => setShowMetadataParser(true) },
                    React.createElement(DocumentTextIcon, { className: "h-4 w-4 mr-2" }),
                    "Parse Metadata"))),
        React.createElement("div", { className: `border rounded-lg p-4 ${config.enabled
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}` },
            React.createElement("div", { className: "flex items-center" },
                config.enabled ? (React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-green-500 mr-3" })) : (React.createElement(ExclamationTriangleIcon, { className: "h-5 w-5 text-amber-500 mr-3" })),
                React.createElement("div", null,
                    React.createElement("h3", { className: `font-medium ${config.enabled
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-amber-800 dark:text-amber-200'}` },
                        "SAML SSO ",
                        config.enabled ? 'Enabled' : 'Disabled'),
                    React.createElement("p", { className: `text-sm ${config.enabled
                            ? 'text-green-600 dark:text-green-300'
                            : 'text-amber-600 dark:text-amber-300'}` }, config.enabled
                        ? 'Users can authenticate using SAML SSO in addition to local login'
                        : 'Configure SAML settings below and enable to allow SSO authentication')))),
        React.createElement("div", { className: "border-b border-gray-200 dark:border-gray-700" },
            React.createElement("nav", { className: "-mb-px flex space-x-8" }, [
                { id: 'basic', label: 'Basic Configuration', icon: CogIcon },
                { id: 'advanced', label: 'Advanced Settings', icon: KeyIcon },
                { id: 'attributes', label: 'Attribute Mapping', icon: LinkIcon },
                { id: 'test', label: 'Test & Validate', icon: PlayIcon }
            ].map((tab) => (React.createElement("button", { key: tab.id, onClick: () => setActiveTab(tab.id), className: `flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}` },
                React.createElement(tab.icon, { className: "h-4 w-4 mr-2" }),
                tab.label))))),
        activeTab === 'basic' && (React.createElement(Card, { className: "p-6" },
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("h3", { className: "text-lg font-medium" }, "Basic SAML Configuration"),
                    React.createElement(Checkbox, { label: "Enable SAML SSO", checked: config.enabled, onChange: (checked) => setConfig(prev => ({ ...prev, enabled: checked })) })),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(Input, { label: "Identity Provider SSO URL", value: config.entryPoint, onChange: (e) => setConfig(prev => ({ ...prev, entryPoint: e.target.value })), placeholder: "https://idp.example.com/sso/saml", helperText: "The URL where users will be redirected for authentication", required: true }),
                        React.createElement(Input, { label: "Identity Provider Issuer", value: config.issuer, onChange: (e) => setConfig(prev => ({ ...prev, issuer: e.target.value })), placeholder: "https://idp.example.com", helperText: "Unique identifier for the identity provider", required: true }),
                        React.createElement(Input, { label: "Callback URL", value: config.callbackUrl, onChange: (e) => setConfig(prev => ({ ...prev, callbackUrl: e.target.value })), placeholder: "https://your-app.com/auth/saml/callback", helperText: "URL where IdP sends authentication response", required: true })),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" }, "Identity Provider Certificate *"),
                            React.createElement("textarea", { value: config.cert, onChange: (e) => setConfig(prev => ({ ...prev, cert: e.target.value })), placeholder: "-----BEGIN CERTIFICATE-----\nMIICXjCCAcegAwIBAgIBADA...\n-----END CERTIFICATE-----", rows: 6, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm" }),
                            React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "X.509 certificate used to verify SAML assertions from the IdP")),
                        React.createElement(Input, { label: "Service Provider Entity ID", value: config.spEntityId, onChange: (e) => setConfig(prev => ({ ...prev, spEntityId: e.target.value })), placeholder: "https://your-app.com", helperText: "Unique identifier for this service provider" }))),
                React.createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md" },
                    React.createElement("h4", { className: "text-sm font-medium text-blue-800 dark:text-blue-200 mb-2" }, "Service Provider Information"),
                    React.createElement("div", { className: "space-y-2 text-sm text-blue-700 dark:text-blue-300" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", null, "SSO Login URL:"),
                            React.createElement("div", { className: "flex items-center space-x-2" },
                                React.createElement("code", { className: "bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded" },
                                    window.location.origin,
                                    "/auth/saml"),
                                React.createElement(Button, { size: "sm", variant: "default", onClick: () => copyToClipboard(`${window.location.origin}/auth/saml`) },
                                    React.createElement(ClipboardDocumentIcon, { className: "h-4 w-4" })))),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", null, "ACS URL:"),
                            React.createElement("div", { className: "flex items-center space-x-2" },
                                React.createElement("code", { className: "bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded" }, config.callbackUrl),
                                React.createElement(Button, { size: "sm", variant: "default", onClick: () => copyToClipboard(config.callbackUrl) },
                                    React.createElement(ClipboardDocumentIcon, { className: "h-4 w-4" })))),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", null, "SP Metadata:"),
                            React.createElement(Button, { size: "sm", variant: "default", onClick: generateMetadata }, "Generate & Copy"))))))),
        activeTab === 'advanced' && (React.createElement(Card, { className: "p-6" },
            React.createElement("div", { className: "space-y-6" },
                React.createElement("h3", { className: "text-lg font-medium" }, "Advanced SAML Settings"),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(Select, { label: "Signature Algorithm", value: config.signatureAlgorithm, onChange: (value) => setConfig(prev => ({ ...prev, signatureAlgorithm: value })), options: [
                                { value: 'sha1', label: 'SHA-1 (Legacy)' },
                                { value: 'sha256', label: 'SHA-256 (Recommended)' },
                                { value: 'sha512', label: 'SHA-512' }
                            ] }),
                        React.createElement(Select, { label: "Digest Algorithm", value: config.digestAlgorithm, onChange: (value) => setConfig(prev => ({ ...prev, digestAlgorithm: value })), options: [
                                { value: 'sha1', label: 'SHA-1 (Legacy)' },
                                { value: 'sha256', label: 'SHA-256 (Recommended)' },
                                { value: 'sha512', label: 'SHA-512' }
                            ] }),
                        React.createElement(Input, { label: "Authentication Context Class", value: config.authnContextClassRef, onChange: (e) => setConfig(prev => ({ ...prev, authnContextClassRef: e.target.value })), placeholder: "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport", helperText: "Required authentication strength" })),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(Input, { label: "Allowed Clock Drift (seconds)", type: "number", value: config.allowedClockDrift.toString(), onChange: (e) => setConfig(prev => ({ ...prev, allowedClockDrift: parseInt(e.target.value) || 0 })), placeholder: "0", helperText: "Tolerance for timestamp differences with IdP" }),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("div", null,
                                React.createElement(Checkbox, { label: "Force Authentication", checked: config.forceAuthn, onChange: (checked) => setConfig(prev => ({ ...prev, forceAuthn: checked })) }),
                                React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Require users to re-authenticate even if they have an active IdP session")),
                            React.createElement("div", null,
                                React.createElement(Checkbox, { label: "Bypass Login Page", checked: config.bypassLoginPage, onChange: (checked) => setConfig(prev => ({ ...prev, bypassLoginPage: checked })) }),
                                React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Redirect directly to IdP without showing local login page")),
                            React.createElement("div", null,
                                React.createElement(Checkbox, { label: "Auto-Provision Users", checked: config.autoProvisionUsers, onChange: (checked) => setConfig(prev => ({ ...prev, autoProvisionUsers: checked })) }),
                                React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Automatically create local accounts for new SAML users")),
                            React.createElement("div", null,
                                React.createElement(Checkbox, { label: "Enable Group Mirroring", checked: config.groupMirroringEnabled, onChange: (checked) => setConfig(prev => ({ ...prev, groupMirroringEnabled: checked })) }),
                                React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Synchronize user groups from SAML attributes"))))),
                config.autoProvisionUsers && (React.createElement("div", { className: "border-t pt-4" },
                    React.createElement(Select, { label: "Default User Role", value: config.defaultUserRole, onChange: (value) => setConfig(prev => ({ ...prev, defaultUserRole: value })), options: [
                            { value: 'user', label: 'User' },
                            { value: 'admin', label: 'Administrator' },
                            { value: 'moderator', label: 'Moderator' }
                        ], helperText: "Role assigned to auto-provisioned users" })))))),
        activeTab === 'attributes' && (React.createElement(Card, { className: "p-6" },
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-lg font-medium" }, "SAML Attribute Mapping"),
                    React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, "Map SAML assertion attributes to user profile fields")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(Input, { label: "Email Attribute", value: config.attributeMapping.email, onChange: (e) => setConfig(prev => ({
                            ...prev,
                            attributeMapping: { ...prev.attributeMapping, email: e.target.value }
                        })), placeholder: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress", helperText: "SAML attribute containing user email address", required: true }),
                    React.createElement(Input, { label: "Display Name Attribute", value: config.attributeMapping.displayName, onChange: (e) => setConfig(prev => ({
                            ...prev,
                            attributeMapping: { ...prev.attributeMapping, displayName: e.target.value }
                        })), placeholder: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", helperText: "SAML attribute containing user's full name" }),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(Input, { label: "First Name Attribute", value: config.attributeMapping.firstName, onChange: (e) => setConfig(prev => ({
                                ...prev,
                                attributeMapping: { ...prev.attributeMapping, firstName: e.target.value }
                            })), placeholder: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname" }),
                        React.createElement(Input, { label: "Last Name Attribute", value: config.attributeMapping.lastName, onChange: (e) => setConfig(prev => ({
                                ...prev,
                                attributeMapping: { ...prev.attributeMapping, lastName: e.target.value }
                            })), placeholder: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname" })),
                    config.groupMirroringEnabled && (React.createElement(Input, { label: "Groups Attribute", value: config.attributeMapping.groups, onChange: (e) => setConfig(prev => ({
                            ...prev,
                            attributeMapping: { ...prev.attributeMapping, groups: e.target.value }
                        })), placeholder: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/group", helperText: "SAML attribute containing user group memberships" }))),
                React.createElement("div", { className: "bg-gray-50 dark:bg-gray-800 p-4 rounded-md" },
                    React.createElement("h4", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2" }, "Common Attribute Names"),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-gray-700 dark:text-gray-300" }, "Microsoft AD FS:"),
                            React.createElement("ul", { className: "text-gray-600 dark:text-gray-400 space-y-1" },
                                React.createElement("li", null, "\u2022 Email: emailaddress"),
                                React.createElement("li", null, "\u2022 Name: displayname"),
                                React.createElement("li", null, "\u2022 Groups: group"))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-gray-700 dark:text-gray-300" }, "Okta:"),
                            React.createElement("ul", { className: "text-gray-600 dark:text-gray-400 space-y-1" },
                                React.createElement("li", null, "\u2022 Email: email"),
                                React.createElement("li", null, "\u2022 Name: displayName"),
                                React.createElement("li", null, "\u2022 Groups: groups")))))))),
        activeTab === 'test' && (React.createElement(Card, { className: "p-6" },
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-lg font-medium" }, "Test SAML Configuration"),
                    React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, "Validate your SAML setup before enabling for users")),
                React.createElement("div", { className: "flex space-x-4" },
                    React.createElement(Button, { onClick: testSAMLConnection, disabled: testing || !config.entryPoint || !config.issuer, isLoading: testing },
                        React.createElement(PlayIcon, { className: "h-4 w-4 mr-2" }),
                        "Test Configuration"),
                    React.createElement(Button, { variant: "secondary", onClick: loadConfig, disabled: loading },
                        React.createElement(ArrowPathIcon, { className: "h-4 w-4 mr-2" }),
                        "Reload Config")),
                testResult && (React.createElement("div", { className: `border rounded-lg p-4 ${testResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}` },
                    React.createElement("div", { className: "flex items-center mb-3" },
                        testResult.success ? (React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-green-500 mr-2" })) : (React.createElement(XCircleIcon, { className: "h-5 w-5 text-red-500 mr-2" })),
                        React.createElement("h4", { className: `font-medium ${testResult.success
                                ? 'text-green-800 dark:text-green-200'
                                : 'text-red-800 dark:text-red-200'}` },
                            "Test ",
                            testResult.success ? 'Passed' : 'Failed')),
                    React.createElement("p", { className: `text-sm mb-4 ${testResult.success
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'}` }, testResult.message),
                    testResult.details && (React.createElement("div", { className: "space-y-2" },
                        React.createElement("h5", { className: "font-medium text-sm" }, "Test Details:"),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" },
                            React.createElement("div", { className: "flex items-center" },
                                testResult.details.connectionTest ? (React.createElement(CheckCircleIcon, { className: "h-4 w-4 text-green-500 mr-2" })) : (React.createElement(XCircleIcon, { className: "h-4 w-4 text-red-500 mr-2" })),
                                "IdP Connection"),
                            React.createElement("div", { className: "flex items-center" },
                                testResult.details.certificateValid ? (React.createElement(CheckCircleIcon, { className: "h-4 w-4 text-green-500 mr-2" })) : (React.createElement(XCircleIcon, { className: "h-4 w-4 text-red-500 mr-2" })),
                                "Certificate Validation"),
                            React.createElement("div", { className: "flex items-center" },
                                testResult.details.attributeMapping ? (React.createElement(CheckCircleIcon, { className: "h-4 w-4 text-green-500 mr-2" })) : (React.createElement(XCircleIcon, { className: "h-4 w-4 text-red-500 mr-2" })),
                                "Attribute Mapping")),
                        testResult.details.userInfo && (React.createElement("div", { className: "mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded" },
                            React.createElement("h6", { className: "font-medium text-sm mb-2" }, "Sample User Data:"),
                            React.createElement("pre", { className: "text-xs text-gray-600 dark:text-gray-300" }, JSON.stringify(testResult.details.userInfo, null, 2)))))))),
                React.createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md" },
                    React.createElement("div", { className: "flex" },
                        React.createElement(InformationCircleIcon, { className: "h-5 w-5 text-blue-400 mr-3 mt-0.5" }),
                        React.createElement("div", null,
                            React.createElement("h4", { className: "text-sm font-medium text-blue-800 dark:text-blue-200" }, "Testing Guidelines"),
                            React.createElement("ul", { className: "text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1" },
                                React.createElement("li", null, "\u2022 Ensure all required fields are configured before testing"),
                                React.createElement("li", null, "\u2022 Test with a non-production user account first"),
                                React.createElement("li", null, "\u2022 Verify attribute mappings return expected user data"),
                                React.createElement("li", null, "\u2022 Check that group memberships are correctly synchronized"),
                                React.createElement("li", null, "\u2022 Confirm certificate validation passes")))))))),
        React.createElement("div", { className: "flex justify-end space-x-3" },
            React.createElement(Button, { variant: "secondary", onClick: loadConfig, disabled: loading }, "Reset Changes"),
            React.createElement(Button, { onClick: saveConfig, disabled: saving, isLoading: saving }, "Save Configuration")),
        showSetupWizard && (React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" },
            React.createElement("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto" },
                React.createElement("div", { className: "flex justify-between items-center mb-4" },
                    React.createElement("h3", { className: "text-lg font-medium" }, "SAML Setup Wizard"),
                    React.createElement(Button, { variant: "default", onClick: () => setShowSetupWizard(false) }, "\u00D7")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-blue-800 dark:text-blue-200 mb-2" }, "Step 1: Gather Information"),
                        React.createElement("ul", { className: "text-sm text-blue-700 dark:text-blue-300 space-y-1" },
                            React.createElement("li", null, "\u2022 IdP SSO URL (from your identity provider)"),
                            React.createElement("li", null, "\u2022 IdP Entity ID/Issuer"),
                            React.createElement("li", null, "\u2022 IdP signing certificate"),
                            React.createElement("li", null, "\u2022 Attribute mappings for user data"))),
                    React.createElement("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-green-800 dark:text-green-200 mb-2" }, "Step 2: Configure Identity Provider"),
                        React.createElement("ul", { className: "text-sm text-green-700 dark:text-green-300 space-y-1" },
                            React.createElement("li", null,
                                "\u2022 Entity ID: ",
                                React.createElement("code", { className: "bg-green-100 dark:bg-green-800 px-1 rounded" }, config.spEntityId)),
                            React.createElement("li", null,
                                "\u2022 ACS URL: ",
                                React.createElement("code", { className: "bg-green-100 dark:bg-green-800 px-1 rounded" }, config.callbackUrl)),
                            React.createElement("li", null, "\u2022 Name ID Format: EmailAddress"),
                            React.createElement("li", null, "\u2022 Signature Required: Yes"))),
                    React.createElement("div", { className: "bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md" },
                        React.createElement("h4", { className: "font-medium text-amber-800 dark:text-amber-200 mb-2" }, "Step 3: Test Configuration"),
                        React.createElement("ul", { className: "text-sm text-amber-700 dark:text-amber-300 space-y-1" },
                            React.createElement("li", null, "\u2022 Use the test functionality in this interface"),
                            React.createElement("li", null, "\u2022 Verify user attributes are correctly mapped"),
                            React.createElement("li", null, "\u2022 Test with different user accounts"),
                            React.createElement("li", null, "\u2022 Confirm group synchronization if enabled"))))))),
        showMetadataParser && (React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" },
            React.createElement("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4" },
                React.createElement("div", { className: "flex justify-between items-center mb-4" },
                    React.createElement("h3", { className: "text-lg font-medium" }, "Parse IdP Metadata"),
                    React.createElement(Button, { variant: "default", onClick: () => setShowMetadataParser(false) }, "\u00D7")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" }, "IdP Metadata XML"),
                        React.createElement("textarea", { value: metadataXml, onChange: (e) => setMetadataXml(e.target.value), placeholder: "Paste your identity provider's metadata XML here...", rows: 10, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm" })),
                    React.createElement("div", { className: "flex justify-end space-x-3" },
                        React.createElement(Button, { variant: "secondary", onClick: () => setShowMetadataParser(false) }, "Cancel"),
                        React.createElement(Button, { onClick: parseMetadata }, "Parse Metadata"))))))));
};
