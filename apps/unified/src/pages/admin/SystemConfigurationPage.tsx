import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn, withMockFallback } from '@utils/index'
import toast from 'react-hot-toast'

// Custom icon components for React 19 compatibility
const CogIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.240.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ServerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
  </svg>
)

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
)

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
)

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0-1.125.504-1.125 1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

// Configuration interfaces
interface SystemConfig {
  general: {
    systemName: string
    systemDescription: string
    timezone: string
    defaultLanguage: string
    maintenanceMode: boolean
    debugMode: boolean
    logLevel: 'error' | 'warn' | 'info' | 'debug'
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
    twoFactorEnabled: boolean
    ipWhitelist: string[]
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    smtpSecure: boolean
    fromEmail: string
    fromName: string
  }
  notifications: {
    emailNotifications: boolean
    slackWebhook: string
    discordWebhook: string
    teamsWebhook: string
    criticalAlerts: boolean
    systemUpdates: boolean
  }
  storage: {
    maxFileSize: number
    allowedFileTypes: string[]
    storageQuota: number
    backupRetention: number
  }
}

export default function SystemConfigurationPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSystemConfig()
  }, [])

  const loadSystemConfig = async () => {
    try {
      setIsLoading(true)
      
      // Mock data for development/demo
      const mockConfig: SystemConfig = {
        general: {
          systemName: 'Nova Universe',
          systemDescription: 'Enterprise ITSM Platform',
          timezone: 'UTC',
          defaultLanguage: 'en',
          maintenanceMode: false,
          debugMode: false,
          logLevel: 'info',
        },
        security: {
          sessionTimeout: 3600,
          maxLoginAttempts: 3,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
          },
          twoFactorEnabled: false,
          ipWhitelist: [],
        },
        email: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          smtpUsername: 'noreply@example.com',
          smtpPassword: '••••••••',
          smtpSecure: true,
          fromEmail: 'noreply@example.com',
          fromName: 'Nova Universe',
        },
        notifications: {
          emailNotifications: true,
          slackWebhook: '',
          discordWebhook: '',
          teamsWebhook: '',
          criticalAlerts: true,
          systemUpdates: true,
        },
        storage: {
          maxFileSize: 10,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
          storageQuota: 1000,
          backupRetention: 30,
        },
      }

      // Use utility function to handle API vs mock data
      const config = await withMockFallback(
        () => {
          // TODO: Replace with actual API call when backend is available
          throw new Error('API not implemented yet')
          // return api.getSystemConfiguration()
        },
        mockConfig,
        'Using mock system configuration for demo'
      )

      setConfig(config)
    } catch (error) {
      console.error('Error loading system configuration:', error)
      toast.error('Failed to load system configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfiguration = async () => {
    if (!config) return

    try {
      setIsSaving(true)
      
      // Use utility function to handle API vs mock operation
      await withMockFallback(
        () => {
          // TODO: Replace with actual API call when backend is available
          throw new Error('Save API not implemented yet')
          // return api.saveSystemConfiguration(config)
        },
        undefined, // Mock operation - just succeed silently
        'Simulating save of system configuration'
      )
      
      setHasChanges(false)
      toast.success('Configuration saved successfully')
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    if (!config) return

    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    }
    
    setConfig(newConfig)
    setHasChanges(true)
  }

  const updateNestedConfig = (section: keyof SystemConfig, parent: string, field: string, value: any) => {
    if (!config) return

    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        [parent]: {
          ...(config[section] as any)[parent],
          [field]: value
        }
      }
    }
    
    setConfig(newConfig)
    setHasChanges(true)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'email', label: 'Email', icon: EnvelopeIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'storage', label: 'Storage', icon: DocumentIcon },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="Loading system configuration..." />
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="card p-12 text-center">
          <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            Configuration not available
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Unable to load system configuration
          </p>
          <button
            onClick={loadSystemConfig}
            className="btn btn-primary mt-4"
          >
            Retry
          </button>
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
            System Configuration
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage system-wide settings and configurations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 dark:text-amber-400">
              Unsaved changes
            </span>
          )}
          
          <button
            onClick={saveConfiguration}
            disabled={isSaving || !hasChanges}
            className={cn(
              'btn',
              hasChanges ? 'btn-primary' : 'btn-secondary',
              isSaving && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Configuration Tabs */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-nova-500 text-nova-600 dark:text-nova-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  General Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      System Name
                    </label>
                    <input
                      type="text"
                      value={config.general.systemName}
                      onChange={(e) => updateConfig('general', 'systemName', e.target.value)}
                      className="input"
                      placeholder="Enter system name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={config.general.timezone}
                      onChange={(e) => updateConfig('general', 'timezone', e.target.value)}
                      className="input"
                      aria-label="System timezone"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">GMT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Language
                    </label>
                    <select
                      value={config.general.defaultLanguage}
                      onChange={(e) => updateConfig('general', 'defaultLanguage', e.target.value)}
                      className="input"
                      aria-label="Default language"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Log Level
                    </label>
                    <select
                      value={config.general.logLevel}
                      onChange={(e) => updateConfig('general', 'logLevel', e.target.value)}
                      className="input"
                      aria-label="Log level"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    System Description
                  </label>
                  <textarea
                    value={config.general.systemDescription}
                    onChange={(e) => updateConfig('general', 'systemDescription', e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Enter system description"
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={config.general.maintenanceMode}
                      onChange={(e) => updateConfig('general', 'maintenanceMode', e.target.checked)}
                      className="checkbox"
                      aria-labelledby="maintenanceMode"
                    />
                    <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Maintenance Mode
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="debugMode"
                      checked={config.general.debugMode}
                      onChange={(e) => updateConfig('general', 'debugMode', e.target.checked)}
                      className="checkbox"
                      aria-labelledby="debugMode"
                    />
                    <label htmlFor="debugMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Debug Mode
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Security Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Session Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.security.sessionTimeout}
                      onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="input"
                      min="300"
                      max="86400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={config.security.maxLoginAttempts}
                      onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="input"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Password Policy
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Minimum Length
                      </label>
                      <input
                        type="number"
                        value={config.security.passwordPolicy.minLength}
                        onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                        className="input"
                        min="4"
                        max="128"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireUppercase"
                        checked={config.security.passwordPolicy.requireUppercase}
                        onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                        className="checkbox"
                        aria-labelledby="requireUppercase"
                      />
                      <label htmlFor="requireUppercase" className="text-sm text-gray-700 dark:text-gray-300">
                        Require uppercase letters
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireLowercase"
                        checked={config.security.passwordPolicy.requireLowercase}
                        onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
                        className="checkbox"
                        aria-labelledby="requireLowercase"
                      />
                      <label htmlFor="requireLowercase" className="text-sm text-gray-700 dark:text-gray-300">
                        Require lowercase letters
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireNumbers"
                        checked={config.security.passwordPolicy.requireNumbers}
                        onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                        className="checkbox"
                        aria-labelledby="requireNumbers"
                      />
                      <label htmlFor="requireNumbers" className="text-sm text-gray-700 dark:text-gray-300">
                        Require numbers
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireSpecialChars"
                        checked={config.security.passwordPolicy.requireSpecialChars}
                        onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                        className="checkbox"
                        aria-labelledby="requireSpecialChars"
                      />
                      <label htmlFor="requireSpecialChars" className="text-sm text-gray-700 dark:text-gray-300">
                        Require special characters
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="twoFactorEnabled"
                      checked={config.security.twoFactorEnabled}
                      onChange={(e) => updateConfig('security', 'twoFactorEnabled', e.target.checked)}
                      className="checkbox"
                      aria-labelledby="twoFactorEnabled"
                    />
                    <label htmlFor="twoFactorEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Two-Factor Authentication
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Email Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={config.email.smtpHost}
                      onChange={(e) => updateConfig('email', 'smtpHost', e.target.value)}
                      className="input"
                      placeholder="smtp.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={config.email.smtpPort}
                      onChange={(e) => updateConfig('email', 'smtpPort', parseInt(e.target.value))}
                      className="input"
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={config.email.smtpUsername}
                      onChange={(e) => updateConfig('email', 'smtpUsername', e.target.value)}
                      className="input"
                      placeholder="username@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={config.email.smtpPassword}
                      onChange={(e) => updateConfig('email', 'smtpPassword', e.target.value)}
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={config.email.fromEmail}
                      onChange={(e) => updateConfig('email', 'fromEmail', e.target.value)}
                      className="input"
                      placeholder="noreply@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={config.email.fromName}
                      onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
                      className="input"
                      placeholder="Nova Universe"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="smtpSecure"
                      checked={config.email.smtpSecure}
                      onChange={(e) => updateConfig('email', 'smtpSecure', e.target.checked)}
                      className="checkbox"
                      aria-labelledby="smtpSecure"
                    />
                    <label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use SSL/TLS Encryption
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Notification Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={config.notifications.emailNotifications}
                      onChange={(e) => updateConfig('notifications', 'emailNotifications', e.target.checked)}
                      className="checkbox"
                      aria-labelledby="emailNotifications"
                    />
                    <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Email Notifications
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="criticalAlerts"
                      checked={config.notifications.criticalAlerts}
                      onChange={(e) => updateConfig('notifications', 'criticalAlerts', e.target.checked)}
                      className="checkbox"
                      aria-labelledby="criticalAlerts"
                    />
                    <label htmlFor="criticalAlerts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Critical Alert Notifications
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="systemUpdates"
                      checked={config.notifications.systemUpdates}
                      onChange={(e) => updateConfig('notifications', 'systemUpdates', e.target.checked)}
                      className="checkbox"
                      aria-labelledby="systemUpdates"
                    />
                    <label htmlFor="systemUpdates" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      System Update Notifications
                    </label>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slack Webhook URL
                    </label>
                    <input
                      type="url"
                      value={config.notifications.slackWebhook}
                      onChange={(e) => updateConfig('notifications', 'slackWebhook', e.target.value)}
                      className="input"
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Microsoft Teams Webhook URL
                    </label>
                    <input
                      type="url"
                      value={config.notifications.teamsWebhook}
                      onChange={(e) => updateConfig('notifications', 'teamsWebhook', e.target.value)}
                      className="input"
                      placeholder="https://outlook.office.com/webhook/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discord Webhook URL
                    </label>
                    <input
                      type="url"
                      value={config.notifications.discordWebhook}
                      onChange={(e) => updateConfig('notifications', 'discordWebhook', e.target.value)}
                      className="input"
                      placeholder="https://discord.com/api/webhooks/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Storage Tab */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Storage Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      value={config.storage.maxFileSize}
                      onChange={(e) => updateConfig('storage', 'maxFileSize', parseInt(e.target.value))}
                      className="input"
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Storage Quota (GB)
                    </label>
                    <input
                      type="number"
                      value={config.storage.storageQuota}
                      onChange={(e) => updateConfig('storage', 'storageQuota', parseInt(e.target.value))}
                      className="input"
                      min="1"
                      max="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Backup Retention (days)
                    </label>
                    <input
                      type="number"
                      value={config.storage.backupRetention}
                      onChange={(e) => updateConfig('storage', 'backupRetention', parseInt(e.target.value))}
                      className="input"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allowed File Types
                  </label>
                  <input
                    type="text"
                    value={config.storage.allowedFileTypes.join(', ')}
                    onChange={(e) => updateConfig('storage', 'allowedFileTypes', e.target.value.split(',').map(s => s.trim()))}
                    className="input"
                    placeholder="pdf, doc, docx, txt, jpg, png"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Comma-separated list of allowed file extensions
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
