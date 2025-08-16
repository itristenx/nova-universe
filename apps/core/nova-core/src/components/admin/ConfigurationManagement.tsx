import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  Info,
  Search,
  History,
  Shield,
  Palette,
  Zap,
  Database,
  Mail,
  Bot,
  Eye,
  EyeOff,
  Clock,
  Server,
  RotateCcw,
  Cpu,
} from 'lucide-react';

// Simple custom components - only keep essential ones
const Badge: React.FC<{ children: React.ReactNode; className?: string; variant?: string }> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClasses =
    variant === 'outline'
      ? 'border border-gray-300 text-gray-700 bg-white'
      : 'bg-blue-100 text-blue-800';

  return <span className={`${baseClasses} ${variantClasses} ${className}`}>{children}</span>;
};

const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`rounded-lg border border-yellow-300 bg-yellow-50 p-4 ${className}`}>
    {children}
  </div>
);

const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="mb-1 text-sm font-medium text-yellow-800">{children}</h3>
);

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-yellow-700">{children}</div>
);

// API and toast utilities
const api = {
  get: async (url: string, config?: any) => {
    console.log('API GET:', url, config);

    // Mock data for demonstration
    const mockConfigs: Record<string, ConfigValue> = {
      ORGANIZATION_NAME: {
        value: 'Nova Universe',
        source: 'database' as const,
        metadata: {
          description: 'Organization name displayed throughout the application',
          category: 'branding',
          valueType: 'string',
          isUIEditable: true,
          isRequired: false,
          defaultValue: 'Nova Universe',
          helpText: 'This name appears in headers, emails, and branding elements',
          isAdvanced: false,
          displayOrder: 1,
        },
      },
      PRIMARY_COLOR: {
        value: '#3b82f6',
        source: 'database' as const,
        metadata: {
          description: 'Primary brand color',
          category: 'branding',
          valueType: 'string',
          isUIEditable: true,
          isRequired: false,
          defaultValue: '#3b82f6',
          helpText: 'Primary color used throughout the interface',
          isAdvanced: false,
          displayOrder: 2,
        },
      },
      COSMO_ENABLED: {
        value: true,
        source: 'database' as const,
        metadata: {
          description: 'Enable Cosmo AI assistant',
          category: 'features',
          valueType: 'boolean',
          isUIEditable: true,
          isRequired: false,
          defaultValue: true,
          helpText: 'Toggle the AI assistant feature for users',
          isAdvanced: false,
          displayOrder: 1,
        },
      },
      MIN_PIN_LENGTH: {
        value: 4,
        source: 'database' as const,
        metadata: {
          description: 'Minimum PIN length required',
          category: 'security',
          valueType: 'number',
          isUIEditable: true,
          isRequired: false,
          defaultValue: 4,
          helpText: 'Minimum number of digits required for user PINs',
          isAdvanced: false,
          displayOrder: 1,
        },
      },
      JWT_SECRET: {
        value: '***',
        source: 'environment' as const,
        metadata: {
          description: 'JWT token signing secret',
          category: 'security',
          valueType: 'string',
          isUIEditable: false,
          isRequired: true,
          defaultValue: null,
          helpText: 'Secret used for JWT token signing - managed via environment variables',
          isAdvanced: true,
          displayOrder: 10,
        },
      },
    };

    return { data: mockConfigs };
  },
  put: async (url: string, data: any) => {
    console.log('API PUT:', url, data);
    return { data: { success: true } };
  },
  post: async (url: string, data: any) => {
    console.log('API POST:', url, data);
    return { data: { success: true } };
  },
};

const useToast = () => ({
  addToast: (toast: any) => {
    console.log('Toast:', toast);
    // In a real implementation, this would show a toast notification
  },
});

interface ConfigValue {
  value: any;
  source: 'environment' | 'database' | 'default';
  metadata?: {
    description: string;
    category: string;
    subcategory?: string;
    valueType: string;
    isUIEditable: boolean;
    isRequired: boolean;
    defaultValue?: any;
    helpText?: string;
    isAdvanced: boolean;
    displayOrder?: number;
  };
}

interface ConfigSection {
  category: string;
  icon: React.ElementType;
  title: string;
  description: string;
  configs: Record<string, ConfigValue>;
}

const ConfigurationManagement: React.FC = () => {
  const [configs, setConfigs] = useState<Record<string, ConfigValue>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeCategory, setActiveCategory] = useState('branding');
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [selectedConfigHistory, setSelectedConfigHistory] = useState<string | null>(null);

  const { addToast } = useToast();

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/config/admin', {
        params: { includeAdvanced: true },
      });
      setConfigs(response.data);
    } catch (error) {
      console.error('Failed to load configurations:', error);
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Failed to Load Configuration',
        message: 'Unable to load configuration settings. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: any) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateValue = (key: string, value: any, config: ConfigValue): string | null => {
    const metadata = config.metadata;
    if (!metadata) return null;

    // Required validation
    if (metadata.isRequired && (value === null || value === undefined || value === '')) {
      return 'This field is required';
    }

    // Type-specific validation
    switch (metadata.valueType) {
      case 'number':
        if (isNaN(Number(value))) {
          return 'Must be a valid number';
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return 'Must be true or false';
        }
        break;
      // Add more type validations as needed
    }

    // Key-specific validation
    if (key.includes('color') && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
      return 'Must be a valid hex color (e.g., #3b82f6)';
    }

    if (key.includes('pin_length')) {
      const num = Number(value);
      if (key.includes('min') && (num < 3 || num > 12)) {
        return 'Must be between 3 and 12';
      }
      if (key.includes('max') && (num < 4 || num > 20)) {
        return 'Must be between 4 and 20';
      }
    }

    return null;
  };

  const saveConfiguration = async (key: string) => {
    if (!pendingChanges[key]) return;

    const config = configs[key];
    const value = pendingChanges[key];

    // Validate
    const error = validateValue(key, value, config);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
      return;
    }

    try {
      setSaving(true);
      await api.put(`/config/${key}`, { value });

      // Update local state
      setConfigs((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          value,
          source: 'database',
        },
      }));

      // Remove from pending changes
      setPendingChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[key];
        return newChanges;
      });

      addToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Configuration Updated',
        message: `${key} has been updated successfully.`,
      });
    } catch (error: any) {
      console.error('Failed to save configuration:', error);
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Save Failed',
        message: error.response?.data?.error || 'Failed to save configuration.',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAllChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    // Validate all pending changes
    const errors: Record<string, string> = {};
    for (const [key, value] of Object.entries(pendingChanges)) {
      const config = configs[key];
      const error = validateValue(key, value, config);
      if (error) {
        errors[key] = error;
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Validation Errors',
        message: 'Please fix the validation errors before saving.',
      });
      return;
    }

    try {
      setSaving(true);
      const configArray = Object.entries(pendingChanges).map(([key, value]) => ({ key, value }));

      await api.post('/config/bulk', {
        configs: configArray,
        reason: 'Bulk update from admin UI',
      });

      // Update local state
      setConfigs((prev) => {
        const updated = { ...prev };
        for (const [key, value] of Object.entries(pendingChanges)) {
          updated[key] = {
            ...updated[key],
            value,
            source: 'database',
          };
        }
        return updated;
      });

      setPendingChanges({});

      addToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'All Changes Saved',
        message: `${configArray.length} configuration(s) updated successfully.`,
      });
    } catch (error: any) {
      console.error('Failed to save configurations:', error);
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Bulk Save Failed',
        message: error.response?.data?.error || 'Failed to save configurations.',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = (key: string) => {
    const config = configs[key];
    if (config.metadata?.defaultValue !== undefined) {
      handleValueChange(key, config.metadata.defaultValue);
    }
  };

  const discardChanges = () => {
    setPendingChanges({});
    setValidationErrors({});
  };

  const getConfigSections = (): ConfigSection[] => {
    const sections: Record<string, ConfigSection> = {};

    for (const [key, config] of Object.entries(configs)) {
      const category = config.metadata?.category || 'other';

      if (!sections[category]) {
        sections[category] = {
          category,
          icon: getCategoryIcon(category),
          title: getCategoryTitle(category),
          description: getCategoryDescription(category),
          configs: {},
        };
      }

      sections[category].configs[key] = config;
    }

    return Object.values(sections).sort((a, b) => {
      const order = ['branding', 'security', 'features', 'integrations', 'performance'];
      return order.indexOf(a.category) - order.indexOf(b.category);
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'branding':
        return Palette;
      case 'security':
        return Shield;
      case 'features':
        return Zap;
      case 'integrations':
        return Cpu;
      case 'performance':
        return Database;
      default:
        return Settings;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'branding':
        return 'Branding & Appearance';
      case 'security':
        return 'Security & Access Control';
      case 'features':
        return 'Feature Toggles';
      case 'integrations':
        return 'External Integrations';
      case 'performance':
        return 'Performance & Limits';
      default:
        return 'Other Settings';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'branding':
        return "Customize your organization's branding and visual appearance";
      case 'security':
        return 'Configure security policies and access controls';
      case 'features':
        return 'Enable or disable application features';
      case 'integrations':
        return 'Configure external service integrations';
      case 'performance':
        return 'Adjust performance settings and resource limits';
      default:
        return 'Miscellaneous configuration options';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'environment':
        return (
          <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
            <Server className="mr-1 h-3 w-3" />
            Environment
          </span>
        );
      case 'database':
        return (
          <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
            <Database className="mr-1 h-3 w-3" />
            Database
          </span>
        );
      case 'default':
        return (
          <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
            <Settings className="mr-1 h-3 w-3" />
            Default
          </span>
        );
      default:
        return null;
    }
  };

  const renderConfigInput = (key: string, config: ConfigValue) => {
    const metadata = config.metadata;
    if (!metadata) return null;

    const currentValue = pendingChanges[key] !== undefined ? pendingChanges[key] : config.value;
    const hasChanges = pendingChanges[key] !== undefined;
    const isReadOnly = !metadata.isUIEditable || config.source === 'environment';
    const error = validationErrors[key];

    switch (metadata.valueType) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={key}
              checked={currentValue === true || currentValue === 'true'}
              onChange={(e) => handleValueChange(key, e.target.checked)}
              disabled={isReadOnly}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={key} className="text-sm text-gray-700">
              {metadata.description}
            </label>
            {hasChanges && (
              <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600">
                <Clock className="mr-1 h-3 w-3" />
                Pending
              </span>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <label htmlFor={key} className="block text-sm font-medium text-gray-700">
              {metadata.description}
            </label>
            <input
              id={key}
              type="number"
              value={currentValue || ''}
              onChange={(e) => handleValueChange(key, e.target.value)}
              disabled={isReadOnly}
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'json':
      case 'array':
        return (
          <div className="space-y-2">
            <label htmlFor={key} className="block text-sm font-medium text-gray-700">
              {metadata.description}
            </label>
            <textarea
              id={key}
              value={
                typeof currentValue === 'string'
                  ? currentValue
                  : JSON.stringify(currentValue, null, 2)
              }
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleValueChange(key, parsed);
                } catch {
                  handleValueChange(key, e.target.value);
                }
              }}
              disabled={isReadOnly}
              className={`w-full rounded-md border px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        // String input with special handling for select options
        if (key.includes('provider') || key.includes('personality')) {
          const options = getSelectOptions(key);
          if (options.length > 0) {
            return (
              <div className="space-y-2">
                <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                  {metadata.description}
                </label>
                <select
                  id={key}
                  value={currentValue || ''}
                  onChange={(e) => handleValueChange(key, e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select an option</option>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            );
          }
        }

        return (
          <div className="space-y-2">
            <label htmlFor={key} className="block text-sm font-medium text-gray-700">
              {metadata.description}
            </label>
            <input
              id={key}
              type={key.includes('color') ? 'color' : 'text'}
              value={currentValue || ''}
              onChange={(e) => handleValueChange(key, e.target.value)}
              disabled={isReadOnly}
              className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
    }
  };

  const getSelectOptions = (key: string) => {
    switch (key) {
      case 'integrations.cosmo_model_provider':
        return [
          { value: 'openai', label: 'OpenAI' },
          { value: 'anthropic', label: 'Anthropic' },
          { value: 'azure', label: 'Azure OpenAI' },
          { value: 'google', label: 'Google AI' },
          { value: 'cohere', label: 'Cohere' },
        ];
      case 'integrations.directory_provider':
        return [
          { value: 'mock', label: 'Mock (Testing)' },
          { value: 'ldap', label: 'LDAP' },
          { value: 'azure_ad', label: 'Azure Active Directory' },
          { value: 'okta', label: 'Okta' },
          { value: 'google', label: 'Google Workspace' },
        ];
      case 'integrations.cosmo_personality':
        return [
          { value: 'friendly_professional', label: 'Friendly Professional' },
          { value: 'technical_expert', label: 'Technical Expert' },
          { value: 'casual_helper', label: 'Casual Helper' },
          { value: 'formal_assistant', label: 'Formal Assistant' },
        ];
      default:
        return [];
    }
  };

  const pendingCount = Object.keys(pendingChanges).length;
  const sections = getConfigSections();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Settings className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-gray-600">Manage your Nova Universe system settings and preferences</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>

          {pendingCount > 0 && (
            <>
              <button
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                onClick={discardChanges}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Discard Changes ({pendingCount})
              </button>
              <button
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                onClick={saveAllChanges}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : `Save All Changes (${pendingCount})`}
              </button>
            </>
          )}
        </div>
      </div>

      {pendingCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription>
            You have {pendingCount} unsaved configuration change(s). Don't forget to save your
            changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Simple tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeCategory === section.category;
            return (
              <button
                key={section.category}
                onClick={() => setActiveCategory(section.category)}
                className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="mr-2 h-4 w-4" />
                  {section.title.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {sections.map((section) => {
        if (activeCategory !== section.category) return null;

        return (
          <div key={section.category}>
            <div className="rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h2 className="flex items-center text-lg font-medium text-gray-900">
                    <section.icon className="mr-2 h-5 w-5" />
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                </div>

                <div className="max-h-[600px] space-y-6 overflow-y-auto">
                  {Object.entries(section.configs)
                    .filter(([, config]) => showAdvanced || !config.metadata?.isAdvanced)
                    .sort(
                      ([, a], [, b]) =>
                        (a.metadata?.displayOrder || 999) - (b.metadata?.displayOrder || 999),
                    )
                    .map(([key, config]) => (
                      <div key={key} className="space-y-4 rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{key}</h4>
                            {getSourceBadge(config.source)}
                            {config.metadata?.isRequired && (
                              <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                                Required
                              </span>
                            )}
                            {config.metadata?.isAdvanced && (
                              <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600">
                                Advanced
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {config.metadata?.defaultValue !== undefined && (
                              <button
                                className="inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                onClick={() => resetToDefault(key)}
                                disabled={config.source === 'environment'}
                              >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Default
                              </button>
                            )}

                            {pendingChanges[key] !== undefined && (
                              <button
                                className="inline-flex items-center rounded border border-transparent bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                                onClick={() => saveConfiguration(key)}
                                disabled={saving}
                              >
                                <Save className="mr-1 h-3 w-3" />
                                Save
                              </button>
                            )}
                          </div>
                        </div>

                        {renderConfigInput(key, config)}

                        {config.metadata?.helpText && (
                          <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <p>{config.metadata.helpText}</p>
                          </div>
                        )}

                        {config.source === 'environment' && (
                          <Alert>
                            <Server className="h-4 w-4" />
                            <AlertDescription>
                              This setting is controlled by an environment variable and cannot be
                              changed through the UI.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConfigurationManagement;
