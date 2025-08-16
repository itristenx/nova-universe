"use client"

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Bot
} from 'lucide-react';

// Type definitions
interface ConfigOption {
  value: string;
  label: string;
}

interface ConfigValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

interface ConfigDefinition {
  key: string;
  category: string;
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  defaultValue: string;
  isUIEditable: boolean;
  isRequired: boolean;
  validation?: ConfigValidation;
  helpText: string;
  example: string;
  options?: readonly ConfigOption[];
}

interface ConfigCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Configuration category definitions with enhanced metadata
const CONFIG_CATEGORIES: Record<string, ConfigCategory> = {
  branding: {
    id: 'branding',
    name: 'Organization Branding',
    description: 'Customize your organization\'s appearance and identity',
    icon: Palette,
    color: 'bg-purple-500',
  },
  security: {
    id: 'security',
    name: 'Security Policies',
    description: 'Configure security settings and access controls',
    icon: Shield,
    color: 'bg-red-500',
  },
  features: {
    id: 'features',
    name: 'Feature Toggles',
    description: 'Enable or disable application features',
    icon: Zap,
    color: 'bg-blue-500',
  },
  integrations: {
    id: 'integrations',
    name: 'External Integrations',
    description: 'Configure third-party service integrations',
    icon: Database,
    color: 'bg-green-500',
  },
  communications: {
    id: 'communications',
    name: 'Communications',
    description: 'Email and notification settings',
    icon: Mail,
    color: 'bg-orange-500',
  },
  ai: {
    id: 'ai',
    name: 'AI & Machine Learning',
    description: 'Configure AI assistants and ML features',
    icon: Bot,
    color: 'bg-indigo-500',
  },
} as const;

// Configuration field definitions with validation and UI metadata
const CONFIG_DEFINITIONS = {
  // Branding configurations
  ORGANIZATION_NAME: {
    key: 'ORGANIZATION_NAME',
    category: 'branding',
    name: 'Organization Name',
    description: 'The name of your organization displayed throughout the application',
    type: 'string',
    defaultValue: 'Nova Universe',
    isUIEditable: true,
    isRequired: false,
    validation: {
      minLength: 1,
      maxLength: 100,
      pattern: '^[a-zA-Z0-9\\s&.-]+$'
    },
    helpText: 'Enter your organization\'s full name. This will appear in headers, emails, and branding.',
    example: 'Acme Corporation',
  },
  LOGO_URL: {
    key: 'LOGO_URL',
    category: 'branding',
    name: 'Logo URL',
    description: 'URL or path to your organization\'s logo',
    type: 'string',
    defaultValue: '/assets/logo.png',
    isUIEditable: true,
    isRequired: false,
    validation: {
      pattern: '^(https?://|/)',
    },
    helpText: 'Provide a URL to your logo image. Recommended size: 200x50px',
    example: 'https://example.com/logo.png',
  },
  PRIMARY_COLOR: {
    key: 'PRIMARY_COLOR',
    category: 'branding',
    name: 'Primary Brand Color',
    description: 'Primary color for your brand (hex format)',
    type: 'string',
    defaultValue: '#3b82f6',
    isUIEditable: true,
    isRequired: false,
    validation: {
      pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
    },
    helpText: 'Enter a hex color code for your primary brand color',
    example: '#3b82f6',
  },

  // Security configurations
  MIN_PIN_LENGTH: {
    key: 'MIN_PIN_LENGTH',
    category: 'security',
    name: 'Minimum PIN Length',
    description: 'Minimum required length for user PINs',
    type: 'number',
    defaultValue: '4',
    isUIEditable: true,
    isRequired: false,
    validation: {
      min: 3,
      max: 10
    },
    helpText: 'Set the minimum number of digits required for user PINs',
    example: '4',
  },
  RATE_LIMIT_WINDOW: {
    key: 'RATE_LIMIT_WINDOW',
    category: 'security',
    name: 'Rate Limit Window (minutes)',
    description: 'Time window for rate limiting in minutes',
    type: 'number',
    defaultValue: '15',
    isUIEditable: true,
    isRequired: false,
    validation: {
      min: 1,
      max: 60
    },
    helpText: 'Time window in minutes for tracking rate limits',
    example: '15',
  },

  // Feature toggles
  COSMO_ENABLED: {
    key: 'COSMO_ENABLED',
    category: 'features',
    name: 'Enable Cosmo AI Assistant',
    description: 'Enable or disable the Cosmo AI assistant feature',
    type: 'boolean',
    defaultValue: 'true',
    isUIEditable: true,
    isRequired: false,
    helpText: 'Toggle the AI assistant feature for users',
    example: 'true',
  },
  AI_TICKET_PROCESSING_ENABLED: {
    key: 'AI_TICKET_PROCESSING_ENABLED',
    category: 'features',
    name: 'AI Ticket Processing',
    description: 'Enable automatic AI processing of support tickets',
    type: 'boolean',
    defaultValue: 'false',
    isUIEditable: true,
    isRequired: false,
    helpText: 'Enable AI to automatically categorize and process tickets',
    example: 'true',
  },

  // Integration settings
  DIRECTORY_PROVIDER: {
    key: 'DIRECTORY_PROVIDER',
    category: 'integrations',
    name: 'Directory Provider',
    description: 'Type of directory service provider',
    type: 'select',
    defaultValue: 'local',
    isUIEditable: true,
    isRequired: false,
    options: [
      { value: 'local', label: 'Local Authentication' },
      { value: 'ldap', label: 'LDAP' },
      { value: 'azure-ad', label: 'Azure Active Directory' },
      { value: 'okta', label: 'Okta' },
      { value: 'google', label: 'Google Workspace' },
    ],
    helpText: 'Select your organization\'s directory service provider',
    example: 'azure-ad',
  },

  // Communications
  FROM_EMAIL: {
    key: 'FROM_EMAIL',
    category: 'communications',
    name: 'From Email Address',
    description: 'Default email address for system notifications',
    type: 'string',
    defaultValue: 'noreply@example.com',
    isUIEditable: true,
    isRequired: false,
    validation: {
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
    },
    helpText: 'Email address used as the sender for system notifications',
    example: 'helpdesk@yourcompany.com',
  },

  // AI configurations
  COSMO_PERSONALITY: {
    key: 'COSMO_PERSONALITY',
    category: 'ai',
    name: 'Cosmo AI Personality',
    description: 'Personality style for the AI assistant',
    type: 'select',
    defaultValue: 'professional',
    isUIEditable: true,
    isRequired: false,
    options: [
      { value: 'professional', label: 'Professional' },
      { value: 'friendly', label: 'Friendly' },
      { value: 'casual', label: 'Casual' },
      { value: 'technical', label: 'Technical' },
    ],
    helpText: 'Choose the personality style for AI interactions',
    example: 'friendly',
  },
} as const;

interface ConfigValue {
  key: string;
  value: string;
  valueType: string;
  category: string;
  isPublic: boolean;
  isUIEditable: boolean;
  isRequired: boolean;
  description?: string;
  updatedAt: string;
  updatedBy?: string;
}

interface ConfigHistory {
  id: number;
  configKey: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changeReason?: string;
  createdAt: string;
}

interface ApiConfigResponse {
  value: string | number | boolean;
  source: string;
  metadata?: {
    valueType?: string;
    category?: string;
    isUIEditable?: boolean;
    isRequired?: boolean;
    description?: string;
    updatedBy?: string;
  };
}

const ConfigurationManagement: React.FC = () => {
  const [configs, setConfigs] = useState<Record<string, ConfigValue>>({});
  const [configHistory, setConfigHistory] = useState<ConfigHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, string>>({});

  // Load configurations from API
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config/admin'); // TODO-LINT: move to async function
      if (response.ok) {
        const data = await response.json(); // TODO-LINT: move to async function
        const configsMap: Record<string, ConfigValue> = {};
        
        Object.entries(data).forEach(([key, configData]) => {
          const typedConfigData = configData as ApiConfigResponse;
          configsMap[key] = {
            key,
            value: String(typedConfigData.value),
            valueType: typedConfigData.metadata?.valueType || 'string',
            category: typedConfigData.metadata?.category || 'general',
            isPublic: true,
            isUIEditable: typedConfigData.metadata?.isUIEditable || false,
            isRequired: typedConfigData.metadata?.isRequired || false,
            description: typedConfigData.metadata?.description || '',
            updatedAt: new Date().toISOString(),
            updatedBy: typedConfigData.metadata?.updatedBy
          };
        });
        
        setConfigs(configsMap);
      }
    } catch (error) {
      console.error('Failed to load configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfigHistory = async (configKey: string) => {
    try {
      const response = await fetch(`/api/config/${configKey}/history`); // TODO-LINT: move to async function
      if (response.ok) {
        const data = await response.json(); // TODO-LINT: move to async function
        setConfigHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load config history:', error);
    }
  };

  const saveConfiguration = async (key: string, value: string, reason?: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/config/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value,
          reason,
        }),
      }); // TODO-LINT: move to async function

      if (response.ok) {
        const updatedConfig = await response.json(); // TODO-LINT: move to async function
        setConfigs(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            value: updatedConfig.value,
            updatedAt: updatedConfig.updatedAt,
            updatedBy: updatedConfig.updatedBy,
          },
        }));
        // Remove from unsaved changes
        setUnsavedChanges(prev => {
          const newChanges = { ...prev };
          delete newChanges[key];
          return newChanges;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save configuration:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const validateConfigValue = (definition: ConfigDefinition, value: string): string | null => {
    const { validation, type } = definition;
    
    if (!validation) return null;

    if (type === 'number') {
      const num = parseInt(value);
      if (isNaN(num)) return 'Must be a valid number';
      if (validation.min !== undefined && num < validation.min) {
        return `Must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && num > validation.max) {
        return `Must be at most ${validation.max}`;
      }
    }

    if (type === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        return `Must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `Must be at most ${validation.maxLength} characters`;
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return 'Invalid format';
      }
    }

    return null;
  };

  const handleConfigChange = (key: string, value: string) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveConfig = async (key: string) => {
    const newValue = unsavedChanges[key];
    if (newValue !== undefined) {
      const success = await saveConfiguration(key, newValue); // TODO-LINT: move to async function
      if (success) {
        // Show success message
      }
    }
  };

  const getConfigValue = (key: string): string => {
    if (unsavedChanges[key] !== undefined) {
      return unsavedChanges[key];
    }
    return configs[key]?.value || CONFIG_DEFINITIONS[key as keyof typeof CONFIG_DEFINITIONS]?.defaultValue || '';
  };

  const hasUnsavedChanges = (key: string): boolean => {
    return unsavedChanges[key] !== undefined;
  };

  const filteredConfigs = Object.values(CONFIG_DEFINITIONS).filter(config => {
    const matchesSearch = !searchQuery || 
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.key.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = config.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  const renderConfigField = (definition: ConfigDefinition) => {
    const { key, name, description, type, helpText, example, validation, options } = definition;
    const value = getConfigValue(key);
    const hasChanges = hasUnsavedChanges(key);
    const validationError = validateConfigValue(definition, value);

    return (
      <Card key={key} className={`transition-all duration-200 ${hasChanges ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm font-medium">{name}</CardTitle>
              {hasChanges && (
                <Badge variant="outline" className="text-xs">
                  Modified
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveConfig(key)}
                  disabled={saving || !!validationError}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      loadConfigHistory(key);
                    }}
                  >
                    <History className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configuration History: {name}</DialogTitle>
                    <DialogDescription>
                      View the change history for this configuration setting
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {configHistory.map((entry) => (
                      <div key={entry.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">{entry.changedBy || 'System'}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div>Old: <code className="bg-muted px-1 rounded">{entry.oldValue || 'null'}</code></div>
                          <div>New: <code className="bg-muted px-1 rounded">{entry.newValue || 'null'}</code></div>
                          {entry.changeReason && (
                            <div>Reason: {entry.changeReason}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {type === 'boolean' && (
            <div className="flex items-center space-x-2">
              <Switch
                checked={value === 'true'}
                onCheckedChange={(checked) => handleConfigChange(key, checked.toString())}
              />
              <Label className="text-sm">
                {value === 'true' ? 'Enabled' : 'Disabled'}
              </Label>
            </div>
          )}

          {type === 'string' && (
            <div className="space-y-2">
              <Input
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                placeholder={example}
                className={validationError ? 'border-red-500' : ''}
              />
              {validationError && (
                <p className="text-xs text-red-500">{validationError}</p>
              )}
            </div>
          )}

          {type === 'number' && (
            <div className="space-y-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                placeholder={example}
                min={validation?.min}
                max={validation?.max}
                className={validationError ? 'border-red-500' : ''}
              />
              {validationError && (
                <p className="text-xs text-red-500">{validationError}</p>
              )}
            </div>
          )}

          {type === 'select' && options && (
            <Select
              value={value}
              onValueChange={(newValue) => handleConfigChange(key, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: ConfigOption) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {helpText && (
            <div className="flex items-start space-x-2 mt-2">
              <Info className="w-3 h-3 mt-0.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{helpText}</p>
            </div>
          )}

          {example && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Example: <code className="bg-muted px-1 rounded text-xs">{example}</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading configuration...</span>
      </div>
    );
  }

  const hasAnyUnsavedChanges = Object.keys(unsavedChanges).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuration Management</h1>
          <p className="text-muted-foreground">
            Manage your application settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasAnyUnsavedChanges && (
            <Alert className="w-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have unsaved changes
              </AlertDescription>
            </Alert>
          )}
          <Button variant="outline" onClick={loadConfigurations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search configurations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
          <Label className="text-sm">Show Advanced</Label>
        </div>
      </div>

      {/* Configuration tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          {Object.values(CONFIG_CATEGORIES).map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.values(CONFIG_CATEGORIES).map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${category.color} text-white`}>
                <category.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{category.name}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredConfigs.map(renderConfigField)}
            </div>

            {filteredConfigs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No configurations found in this category</p>
                {searchQuery && (
                  <p className="text-sm mt-1">Try adjusting your search query</p>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ConfigurationManagement;
