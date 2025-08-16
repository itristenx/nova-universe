import { useState, useEffect } from 'react'
import { 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  PuzzlePieceIcon,
  BuildingOfficeIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { featureService } from '@services/features'
import { cn } from '@utils/index'
import toast from 'react-hot-toast'

interface SettingsSection {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<Record<string, any>>({
    general: {
      siteName: 'Nova Universe',
      siteUrl: 'https://nova.company.com',
      defaultLanguage: 'en',
      timezone: 'UTC',
      maintenanceMode: false,
    },
    security: {
      passwordMinLength: 8,
      requireMFA: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      allowSelfRegistration: false,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      digestFrequency: 'daily',
    },
    integrations: {
      slackEnabled: false,
      teamsEnabled: false,
      zoomEnabled: false,
    },
    modules: {},
  })

  const sections: SettingsSection[] = [
    {
      id: 'general',
      name: 'General',
      icon: CogIcon,
      description: 'Basic application settings and configuration',
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Security policies and authentication settings',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'Email, SMS, and push notification settings',
    },
    {
      id: 'integrations',
      name: 'Integrations',
      icon: PuzzlePieceIcon,
      description: 'Third-party service integrations',
    },
    {
      id: 'modules',
      name: 'Nova Modules',
      icon: CircleStackIcon,
      description: 'Enable/disable Nova modules and features',
    },
    {
      id: 'organization',
      name: 'Organization',
      icon: BuildingOfficeIcon,
      description: 'Company and organizational settings',
    },
  ]

  useEffect(() => {
    loadModuleSettings()
  }, [])

  const loadModuleSettings = async () => {
    try {
      const modules = await featureService.getModules()
      setSettings(prev => ({
        ...prev,
        modules: modules.reduce((acc, module) => ({
          ...acc,
          [module.key]: module.enabled
        }), {})
      }))
    } catch (error) {
      console.error('Failed to load module settings:', error)
    }
  }

  const handleSave = async (section: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`${sections.find(s => s.id === section)?.name} settings saved`)
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModuleToggle = async (moduleKey: string, enabled: boolean) => {
    try {
      await featureService.toggleModule(moduleKey, enabled)
      setSettings(prev => ({
        ...prev,
        modules: {
          ...prev.modules,
          [moduleKey]: enabled
        }
      }))
      toast.success(`${moduleKey} ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to update module')
    }
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, siteName: e.target.value }
            }))}
            className="input mt-1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Site URL
          </label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, siteUrl: e.target.value }
            }))}
            className="input mt-1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Default Language
          </label>
          <select
            value={settings.general.defaultLanguage}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, defaultLanguage: e.target.value }
            }))}
            className="input mt-1"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, timezone: e.target.value }
            }))}
            className="input mt-1"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.general.maintenanceMode}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            general: { ...prev.general, maintenanceMode: e.target.checked }
          }))}
          className="h-4 w-4 text-nova-600 focus:ring-nova-500"
        />
        <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
          Enable maintenance mode
        </label>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Minimum Password Length
          </label>
          <input
            type="number"
            min="6"
            max="32"
            value={settings.security.passwordMinLength}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
            }))}
            className="input mt-1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="480"
            value={settings.security.sessionTimeout}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
            }))}
            className="input mt-1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Max Login Attempts
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
            }))}
            className="input mt-1"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireMFA"
            checked={settings.security.requireMFA}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, requireMFA: e.target.checked }
            }))}
            className="h-4 w-4 text-nova-600 focus:ring-nova-500"
          />
          <label htmlFor="requireMFA" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
            Require multi-factor authentication
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowSelfRegistration"
            checked={settings.security.allowSelfRegistration}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, allowSelfRegistration: e.target.checked }
            }))}
            className="h-4 w-4 text-nova-600 focus:ring-nova-500"
          />
          <label htmlFor="allowSelfRegistration" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
            Allow self-registration
          </label>
        </div>
      </div>
    </div>
  )

  const renderModulesSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(featureService.getNovaModulesConfig()).map(([key, config]) => (
          <div key={key} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {config.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {config.features.slice(0, 3).map(feature => (
                    <span key={feature} className="badge badge-sm">
                      {feature}
                    </span>
                  ))}
                  {config.features.length > 3 && (
                    <span className="badge badge-sm">
                      +{config.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="ml-4">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.modules[key] || config.defaultEnabled}
                    onChange={(e) => handleModuleToggle(key, e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-nova-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nova-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-nova-800"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'security':
        return renderSecuritySettings()
      case 'modules':
        return renderModulesSettings()
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {sections.find(s => s.id === activeSection)?.name} settings coming soon
            </p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage application settings and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="card p-4">
          <nav className="space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                  activeSection === section.id
                    ? 'bg-nova-100 text-nova-700 dark:bg-nova-900 dark:text-nova-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                <section.icon className="h-5 w-5" />
                <div>
                  <div>{section.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {section.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {sections.find(s => s.id === activeSection)?.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sections.find(s => s.id === activeSection)?.description}
              </p>
            </div>

            {renderCurrentSection()}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => handleSave(activeSection)}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
