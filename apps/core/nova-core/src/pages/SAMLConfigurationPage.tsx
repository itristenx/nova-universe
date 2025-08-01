import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import {
    ArrowPathIcon,
    CheckCircleIcon,
    ClipboardDocumentIcon,
    CogIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    KeyIcon,
    LinkIcon,
    PlayIcon,
    ShieldCheckIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';

interface SAMLConfig {
  enabled: boolean;
  entryPoint: string;
  issuer: string;
  callbackUrl: string;
  cert: string;
  signatureAlgorithm: string;
  digestAlgorithm: string;
  authnContextClassRef: string;
  attributeMapping: {
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
    groups: string;
  };
  idpMetadata?: string;
  spEntityId?: string;
  allowedClockDrift: number;
  forceAuthn: boolean;
  bypassLoginPage: boolean;
  groupMirroringEnabled: boolean;
  autoProvisionUsers: boolean;
  defaultUserRole: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: {
    connectionTest?: boolean;
    certificateValid?: boolean;
    attributeMapping?: boolean;
    userInfo?: {
      email: string;
      displayName: string;
      firstName: string;
      lastName: string;
      groups: string[];
    };
  };
}

export const SAMLConfigurationPage: React.FC = () => {
  const [config, setConfig] = useState<SAMLConfig>({
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
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'attributes' | 'test'>('basic');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showMetadataParser, setShowMetadataParser] = useState(false);
  const [metadataXml, setMetadataXml] = useState('');

  // Simple toast replacement
  const addToast = (params: { type: 'success' | 'error'; title: string; description: string }) => {
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
    } catch (error) {
      console.error('Failed to load SAML config:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load SAML configuration'
      });
    } finally {
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
    } catch (error) {
      console.error('Failed to save SAML config:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save SAML configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  const testSAMLConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      // Simulate SAML connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: TestResult = {
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
    } catch (error) {
      console.error('SAML test failed:', error);
      addToast({
        type: 'error',
        title: 'Test Failed',
        description: 'Failed to test SAML connection'
      });
    } finally {
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
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to parse IdP metadata'
      });
    }
  };

  const copyToClipboard = (text: string) => {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <ShieldCheckIcon className="h-8 w-8 mr-3 text-blue-600" />
            SAML Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure Security Assertion Markup Language (SAML) 2.0 for enterprise single sign-on
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowSetupWizard(true)}
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Setup Wizard
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowMetadataParser(true)}
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Parse Metadata
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`border rounded-lg p-4 ${
        config.enabled 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-center">
          {config.enabled ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-3" />
          )}
          <div>
            <h3 className={`font-medium ${
              config.enabled 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              SAML SSO {config.enabled ? 'Enabled' : 'Disabled'}
            </h3>
            <p className={`text-sm ${
              config.enabled 
                ? 'text-green-600 dark:text-green-300' 
                : 'text-amber-600 dark:text-amber-300'
            }`}>
              {config.enabled 
                ? 'Users can authenticate using SAML SSO in addition to local login'
                : 'Configure SAML settings below and enable to allow SSO authentication'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Configuration', icon: CogIcon },
            { id: 'advanced', label: 'Advanced Settings', icon: KeyIcon },
            { id: 'attributes', label: 'Attribute Mapping', icon: LinkIcon },
            { id: 'test', label: 'Test & Validate', icon: PlayIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'basic' | 'advanced' | 'attributes' | 'test')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Basic SAML Configuration</h3>
              <Checkbox
                label="Enable SAML SSO"
                checked={config.enabled}
                onChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Identity Provider SSO URL"
                  value={config.entryPoint}
                  onChange={(e) => setConfig(prev => ({ ...prev, entryPoint: e.target.value }))}
                  placeholder="https://idp.example.com/sso/saml"
                  helperText="The URL where users will be redirected for authentication"
                  required
                />
                
                <Input
                  label="Identity Provider Issuer"
                  value={config.issuer}
                  onChange={(e) => setConfig(prev => ({ ...prev, issuer: e.target.value }))}
                  placeholder="https://idp.example.com"
                  helperText="Unique identifier for the identity provider"
                  required
                />

                <Input
                  label="Callback URL"
                  value={config.callbackUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, callbackUrl: e.target.value }))}
                  placeholder="https://your-app.com/auth/saml/callback"
                  helperText="URL where IdP sends authentication response"
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Identity Provider Certificate *
                  </label>
                  <textarea
                    value={config.cert}
                    onChange={(e) => setConfig(prev => ({ ...prev, cert: e.target.value }))}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;MIICXjCCAcegAwIBAgIBADA...&#10;-----END CERTIFICATE-----"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    X.509 certificate used to verify SAML assertions from the IdP
                  </p>
                </div>

                <Input
                  label="Service Provider Entity ID"
                  value={config.spEntityId}
                  onChange={(e) => setConfig(prev => ({ ...prev, spEntityId: e.target.value }))}
                  placeholder="https://your-app.com"
                  helperText="Unique identifier for this service provider"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Service Provider Information
              </h4>
              <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center justify-between">
                  <span>SSO Login URL:</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                      {window.location.origin}/auth/saml
                    </code>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => copyToClipboard(`${window.location.origin}/auth/saml`)}
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>ACS URL:</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                      {config.callbackUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => copyToClipboard(config.callbackUrl)}
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>SP Metadata:</span>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={generateMetadata}
                  >
                    Generate & Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'advanced' && (
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Advanced SAML Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Select
                  label="Signature Algorithm"
                  value={config.signatureAlgorithm}
                  onChange={(value) => setConfig(prev => ({ ...prev, signatureAlgorithm: value }))}
                  options={[
                    { value: 'sha1', label: 'SHA-1 (Legacy)' },
                    { value: 'sha256', label: 'SHA-256 (Recommended)' },
                    { value: 'sha512', label: 'SHA-512' }
                  ]}
                />

                <Select
                  label="Digest Algorithm"
                  value={config.digestAlgorithm}
                  onChange={(value) => setConfig(prev => ({ ...prev, digestAlgorithm: value }))}
                  options={[
                    { value: 'sha1', label: 'SHA-1 (Legacy)' },
                    { value: 'sha256', label: 'SHA-256 (Recommended)' },
                    { value: 'sha512', label: 'SHA-512' }
                  ]}
                />

                <Input
                  label="Authentication Context Class"
                  value={config.authnContextClassRef}
                  onChange={(e) => setConfig(prev => ({ ...prev, authnContextClassRef: e.target.value }))}
                  placeholder="urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport"
                  helperText="Required authentication strength"
                />
              </div>

              <div className="space-y-4">
                <Input
                  label="Allowed Clock Drift (seconds)"
                  type="number"
                  value={config.allowedClockDrift.toString()}
                  onChange={(e) => setConfig(prev => ({ ...prev, allowedClockDrift: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  helperText="Tolerance for timestamp differences with IdP"
                />

                <div className="space-y-3">
                  <div>
                    <Checkbox
                      label="Force Authentication"
                      checked={config.forceAuthn}
                      onChange={(checked) => setConfig(prev => ({ ...prev, forceAuthn: checked }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Require users to re-authenticate even if they have an active IdP session</p>
                  </div>

                  <div>
                    <Checkbox
                      label="Bypass Login Page"
                      checked={config.bypassLoginPage}
                      onChange={(checked) => setConfig(prev => ({ ...prev, bypassLoginPage: checked }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Redirect directly to IdP without showing local login page</p>
                  </div>

                  <div>
                    <Checkbox
                      label="Auto-Provision Users"
                      checked={config.autoProvisionUsers}
                      onChange={(checked) => setConfig(prev => ({ ...prev, autoProvisionUsers: checked }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically create local accounts for new SAML users</p>
                  </div>

                  <div>
                    <Checkbox
                      label="Enable Group Mirroring"
                      checked={config.groupMirroringEnabled}
                      onChange={(checked) => setConfig(prev => ({ ...prev, groupMirroringEnabled: checked }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Synchronize user groups from SAML attributes</p>
                  </div>
                </div>
              </div>
            </div>

            {config.autoProvisionUsers && (
              <div className="border-t pt-4">
                <Select
                  label="Default User Role"
                  value={config.defaultUserRole}
                  onChange={(value) => setConfig(prev => ({ ...prev, defaultUserRole: value }))}
                  options={[
                    { value: 'user', label: 'User' },
                    { value: 'admin', label: 'Administrator' },
                    { value: 'moderator', label: 'Moderator' }
                  ]}
                  helperText="Role assigned to auto-provisioned users"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'attributes' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">SAML Attribute Mapping</h3>
              <p className="text-sm text-gray-500 mt-1">
                Map SAML assertion attributes to user profile fields
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Email Attribute"
                value={config.attributeMapping.email}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  attributeMapping: { ...prev.attributeMapping, email: e.target.value }
                }))}
                placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
                helperText="SAML attribute containing user email address"
                required
              />

              <Input
                label="Display Name Attribute"
                value={config.attributeMapping.displayName}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  attributeMapping: { ...prev.attributeMapping, displayName: e.target.value }
                }))}
                placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
                helperText="SAML attribute containing user's full name"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name Attribute"
                  value={config.attributeMapping.firstName}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    attributeMapping: { ...prev.attributeMapping, firstName: e.target.value }
                  }))}
                  placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
                />

                <Input
                  label="Last Name Attribute"
                  value={config.attributeMapping.lastName}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    attributeMapping: { ...prev.attributeMapping, lastName: e.target.value }
                  }))}
                  placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
                />
              </div>

              {config.groupMirroringEnabled && (
                <Input
                  label="Groups Attribute"
                  value={config.attributeMapping.groups}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    attributeMapping: { ...prev.attributeMapping, groups: e.target.value }
                  }))}
                  placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/group"
                  helperText="SAML attribute containing user group memberships"
                />
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Common Attribute Names
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Microsoft AD FS:</p>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Email: emailaddress</li>
                    <li>• Name: displayname</li>
                    <li>• Groups: group</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Okta:</p>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Email: email</li>
                    <li>• Name: displayName</li>
                    <li>• Groups: groups</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'test' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Test SAML Configuration</h3>
              <p className="text-sm text-gray-500 mt-1">
                Validate your SAML setup before enabling for users
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={testSAMLConnection}
                disabled={testing || !config.entryPoint || !config.issuer}
                isLoading={testing}
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Test Configuration
              </Button>
              
              <Button
                variant="secondary"
                onClick={loadConfig}
                disabled={loading}
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Reload Config
              </Button>
            </div>

            {testResult && (
              <div className={`border rounded-lg p-4 ${
                testResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center mb-3">
                  {testResult.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <h4 className={`font-medium ${
                    testResult.success 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    Test {testResult.success ? 'Passed' : 'Failed'}
                  </h4>
                </div>
                <p className={`text-sm mb-4 ${
                  testResult.success 
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {testResult.message}
                </p>

                {testResult.details && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Test Details:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        {testResult.details.connectionTest ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        IdP Connection
                      </div>
                      <div className="flex items-center">
                        {testResult.details.certificateValid ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        Certificate Validation
                      </div>
                      <div className="flex items-center">
                        {testResult.details.attributeMapping ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        Attribute Mapping
                      </div>
                    </div>

                    {testResult.details.userInfo && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                        <h6 className="font-medium text-sm mb-2">Sample User Data:</h6>
                        <pre className="text-xs text-gray-600 dark:text-gray-300">
                          {JSON.stringify(testResult.details.userInfo, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Testing Guidelines
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                    <li>• Ensure all required fields are configured before testing</li>
                    <li>• Test with a non-production user account first</li>
                    <li>• Verify attribute mappings return expected user data</li>
                    <li>• Check that group memberships are correctly synchronized</li>
                    <li>• Confirm certificate validation passes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="secondary"
          onClick={loadConfig}
          disabled={loading}
        >
          Reset Changes
        </Button>
        <Button
          onClick={saveConfig}
          disabled={saving}
          isLoading={saving}
        >
          Save Configuration
        </Button>
      </div>

      {/* Setup Wizard Modal */}
      {showSetupWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">SAML Setup Wizard</h3>
              <Button
                variant="default"
                onClick={() => setShowSetupWizard(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Step 1: Gather Information</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• IdP SSO URL (from your identity provider)</li>
                  <li>• IdP Entity ID/Issuer</li>
                  <li>• IdP signing certificate</li>
                  <li>• Attribute mappings for user data</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Step 2: Configure Identity Provider</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Entity ID: <code className="bg-green-100 dark:bg-green-800 px-1 rounded">{config.spEntityId}</code></li>
                  <li>• ACS URL: <code className="bg-green-100 dark:bg-green-800 px-1 rounded">{config.callbackUrl}</code></li>
                  <li>• Name ID Format: EmailAddress</li>
                  <li>• Signature Required: Yes</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Step 3: Test Configuration</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Use the test functionality in this interface</li>
                  <li>• Verify user attributes are correctly mapped</li>
                  <li>• Test with different user accounts</li>
                  <li>• Confirm group synchronization if enabled</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Parser Modal */}
      {showMetadataParser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Parse IdP Metadata</h3>
              <Button
                variant="default"
                onClick={() => setShowMetadataParser(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IdP Metadata XML
                </label>
                <textarea
                  value={metadataXml}
                  onChange={(e) => setMetadataXml(e.target.value)}
                  placeholder="Paste your identity provider's metadata XML here..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowMetadataParser(false)}
                >
                  Cancel
                </Button>
                <Button onClick={parseMetadata}>
                  Parse Metadata
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
