import { useEffect, useState } from 'react'
import { cn } from '@utils/index'
import toast from 'react-hot-toast'
import { samlConfigService, type SAMLConfig, type SAMLTestResult } from '@services/samlConfig'

// Simple icon components to avoid React 19 compatibility issues
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

const CogIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

const ExclamationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
)

const CopyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.375A2.25 2.25 0 014.125 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
)

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
)

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
)

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
)

const LinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

type TestResult = SAMLTestResult

export default function SAMLConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'configuration' | 'testing' | 'metadata'>('configuration')
  const [config, setConfig] = useState<SAMLConfig>({
    enabled: false,
    entryPoint: '',
    issuer: '',
    callbackUrl: `${window.location.origin}/auth/saml/callback`,
    cert: '',
    signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
    authnContextClassRef: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
    attributeMapping: {
      email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
      firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
      groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'
    },
    allowedClockDrift: 60000,
    forceAuthn: false,
    bypassLoginPage: false,
    groupMirroringEnabled: false,
    autoProvisionUsers: true,
    defaultUserRole: 'user'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [metadata, setMetadata] = useState('')

  useEffect(() => {
    loadConfig()
    loadMetadata()
  }, [])

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const data = await samlConfigService.getConfig()
      setConfig(data)
    } catch {
      toast.error('Failed to load SAML configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      await samlConfigService.update(config)
      toast.success('SAML configuration saved successfully')
    } catch {
      toast.error('Failed to save SAML configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await samlConfigService.test()
      setTestResult(result)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'SAML configuration test failed',
        details: error
      })
      toast.error('SAML test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const loadMetadata = async () => {
    try {
      const data = await samlConfigService.getMetadata()
      setMetadata(data)
    } catch {
      toast.error('Failed to load SAML metadata')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const tabs = [
    { id: 'configuration', label: 'Configuration', icon: CogIcon },
    { id: 'testing', label: 'Testing', icon: PlayIcon },
    { id: 'metadata', label: 'Metadata', icon: DocumentIcon }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              SAML Configuration
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Configure SAML SSO integration
            </p>
          </div>
        </div>
        
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading SAML configuration...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            SAML Configuration
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Configure SAML SSO integration for single sign-on
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadConfig}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            <RefreshIcon className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className="btn btn-primary"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={cn(
        "card p-4 border-l-4",
        config.enabled 
          ? "border-l-green-500 bg-green-50 dark:bg-green-900/20" 
          : "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      )}>
        <div className="flex items-center space-x-3">
          {config.enabled ? (
            <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          ) : (
            <ExclamationIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              SAML SSO Status: {config.enabled ? 'Enabled' : 'Disabled'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {config.enabled 
                ? 'Users can sign in using SAML SSO' 
                : 'SAML SSO is currently disabled'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'configuration' && (
            <div className="space-y-8">
              {/* Basic Configuration */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <ShieldIcon className="h-5 w-5" />
                  <span>Basic Configuration</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enable SAML SSO
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Allow users to sign in with SAML
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bypass Login Page
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.bypassLoginPage}
                        onChange={(e) => setConfig({ ...config, bypassLoginPage: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Redirect directly to IdP
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity Provider Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <KeyIcon className="h-5 w-5" />
                  <span>Identity Provider Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      IdP Entry Point URL *
                    </label>
                    <input
                      type="url"
                      value={config.entryPoint}
                      onChange={(e) => setConfig({ ...config, entryPoint: e.target.value })}
                      placeholder="https://your-idp.com/sso/saml"
                      className="input w-full"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      The SSO URL provided by your identity provider
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      IdP Issuer/Entity ID *
                    </label>
                    <input
                      type="text"
                      value={config.issuer}
                      onChange={(e) => setConfig({ ...config, issuer: e.target.value })}
                      placeholder="https://your-idp.com"
                      className="input w-full"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      The unique identifier for your identity provider
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      X.509 Certificate *
                    </label>
                    <textarea
                      value={config.cert}
                      onChange={(e) => setConfig({ ...config, cert: e.target.value })}
                      placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                      rows={6}
                      className="input w-full font-mono text-sm"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      The public certificate from your identity provider
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Provider Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <LinkIcon className="h-5 w-5" />
                  <span>Service Provider Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Callback URL (Read-only)
                    </label>
                    <div className="flex">
                      <input
                        type="url"
                        value={config.callbackUrl}
                        readOnly
                        className="input w-full bg-gray-50 dark:bg-gray-700"
                      />
                      <button
                        onClick={() => copyToClipboard(config.callbackUrl)}
                        className="ml-2 btn btn-secondary"
                        title="Copy to clipboard"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Configure this URL in your identity provider
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Signature Algorithm
                      </label>
                      <select
                        value={config.signatureAlgorithm}
                        onChange={(e) => setConfig({ ...config, signatureAlgorithm: e.target.value })}
                        className="input w-full"
                      >
                        <option value="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256">RSA-SHA256</option>
                        <option value="http://www.w3.org/2000/09/xmldsig#rsa-sha1">RSA-SHA1</option>
                        <option value="http://www.w3.org/2001/04/xmldsig-more#rsa-sha512">RSA-SHA512</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Digest Algorithm
                      </label>
                      <select
                        value={config.digestAlgorithm}
                        onChange={(e) => setConfig({ ...config, digestAlgorithm: e.target.value })}
                        className="input w-full"
                      >
                        <option value="http://www.w3.org/2001/04/xmlenc#sha256">SHA256</option>
                        <option value="http://www.w3.org/2000/09/xmldsig#sha1">SHA1</option>
                        <option value="http://www.w3.org/2001/04/xmlenc#sha512">SHA512</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attribute Mapping */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Attribute Mapping
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(config.attributeMapping).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                        {key === 'displayName' ? 'Display Name' : key}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setConfig({
                          ...config,
                          attributeMapping: {
                            ...config.attributeMapping,
                            [key]: e.target.value
                          }
                        })}
                        className="input w-full"
                        placeholder={`SAML attribute for ${key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* User Provisioning */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  User Provisioning
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.autoProvisionUsers}
                      onChange={(e) => setConfig({ ...config, autoProvisionUsers: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Automatically create users on first login
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.groupMirroringEnabled}
                      onChange={(e) => setConfig({ ...config, groupMirroringEnabled: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Mirror groups from SAML attributes
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default User Role
                    </label>
                    <select
                      value={config.defaultUserRole}
                      onChange={(e) => setConfig({ ...config, defaultUserRole: e.target.value })}
                      className="input w-full"
                    >
                      <option value="user">User</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    SAML Configuration Test
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Test your SAML configuration to ensure it's working correctly
                  </p>
                </div>
                <button
                  onClick={testConnection}
                  disabled={isTesting || !config.enabled}
                  className="btn btn-primary"
                >
                  {isTesting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      Run Test
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div className={cn(
                  "card p-4 border-l-4",
                  testResult.success 
                    ? "border-l-green-500 bg-green-50 dark:bg-green-900/20" 
                    : "border-l-red-500 bg-red-50 dark:bg-red-900/20"
                )}>
                  <div className="flex items-start space-x-3">
                    {testResult.success ? (
                      <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <XIcon className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {testResult.message}
                      </h4>
                      {testResult.details && (
                        <div className="mt-2">
                          <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {JSON.stringify(testResult.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500">
                <div className="flex items-start space-x-3">
                  <InfoIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Test Requirements
                    </h4>
                    <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• SAML must be enabled</li>
                      <li>• Valid IdP Entry Point URL</li>
                      <li>• Valid X.509 certificate</li>
                      <li>• Callback URL configured in IdP</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Service Provider Metadata
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download or copy this metadata to configure your identity provider
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => copyToClipboard(metadata)}
                    className="btn btn-secondary"
                  >
                    <CopyIcon className="h-4 w-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([metadata], { type: 'application/xml' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'saml-metadata.xml'
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="btn btn-primary"
                  >
                    Download XML
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Metadata XML
                  </h4>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto">
                    {metadata}
                  </pre>
                </div>
              </div>

              <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500">
                <div className="flex items-start space-x-3">
                  <InfoIcon className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Configuration Instructions
                    </h4>
                    <ol className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                      <li>Download the metadata XML file</li>
                      <li>Upload it to your identity provider</li>
                      <li>Configure the callback URL: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{config.callbackUrl}</code></li>
                      <li>Set up attribute mappings in your IdP</li>
                      <li>Test the configuration using the Testing tab</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
