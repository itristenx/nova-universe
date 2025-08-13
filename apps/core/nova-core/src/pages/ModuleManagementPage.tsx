import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Switch, 
  Button, 
  Chip, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Progress,
  Divider,
  Input,
  Textarea,
  Select,
  SelectItem
} from '@heroui/react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CogIcon, 
  InformationCircleIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';

interface Module {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  version: string;
  category: string;
  status: 'active' | 'inactive' | 'error' | 'updating';
  dependencies: string[];
  configurations: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    value: any;
    options?: string[];
    description?: string;
  }[];
  health: {
    status: 'healthy' | 'warning' | 'error';
    lastCheck: string;
    uptime: number;
    errors: string[];
  };
}

export const ModuleManagementPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
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
      // const data = await api.getModules();
      
      // Generate mock module data
      const mockModules: Module[] = [
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
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', description: 'Failed to load modules' });
    } finally {
      setLoading(false);
    }
  };

  const update = async (key: string, enabled: boolean) => {
    try {
      // await api.updateModule(key, enabled);
      setModules(mods => mods.map(m => (m.key === key ? { ...m, enabled, status: enabled ? 'active' : 'inactive' } : m)));
      addToast({ type: 'success', title: 'Updated', description: `Module ${key} ${enabled ? 'enabled' : 'disabled'}` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', description: 'Failed to update module' });
    }
  };

  const refreshModules = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    addToast({ type: 'success', title: 'Refreshed', description: 'Module status updated' });
  };

  const getStatusIcon = (enabled: boolean) => (
    enabled ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <XCircleIcon className="h-5 w-5 text-gray-400" />
  );

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'warning': return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string): "warning" | "default" | "success" | "primary" | "danger" | "secondary" => {
    const colors: Record<string, "warning" | "default" | "success" | "primary" | "danger" | "secondary"> = {
      'Core': 'primary',
      'Security': 'danger',
      'Content': 'secondary',
      'Communication': 'success',
      'Analytics': 'warning'
    };
    return colors[category] || 'default';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Core': return <PuzzlePieceIcon className="h-4 w-4" />;
      case 'Security': return <ShieldCheckIcon className="h-4 w-4" />;
      case 'Communication': return <InformationCircleIcon className="h-4 w-4" />;
      default: return <CogIcon className="h-4 w-4" />;
    }
  };

  const openModuleDetails = (module: Module) => {
    setSelectedModule(module);
    onOpen();
  };

  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
          <p className="mt-1 text-sm text-gray-600">Configure and monitor Nova modules for your organization.</p>
        </div>
        <Button 
          color="primary" 
          variant="flat" 
          startContent={<ArrowPathIcon className="h-4 w-4" />}
          onPress={refreshModules}
          isLoading={refreshing}
        >
          Refresh Status
        </Button>
      </div>

      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
        <Tab key="overview" title="Overview">
          <div className="space-y-6">
            {/* Module Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardBody className="text-center">
                  <div className="text-2xl font-bold text-primary">{modules.length}</div>
                  <div className="text-sm text-gray-600">Total Modules</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-2xl font-bold text-green-600">{modules.filter(m => m.enabled).length}</div>
                  <div className="text-sm text-gray-600">Active Modules</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{modules.filter(m => m.health.status === 'warning').length}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-2xl font-bold text-red-600">{modules.filter(m => m.health.status === 'error').length}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </CardBody>
              </Card>
            </div>

            {/* Modules by Category */}
            {Object.entries(groupedModules).map(([category, categoryModules]) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <h3 className="text-lg font-semibold">{category} Modules</h3>
                    <Chip color={getCategoryColor(category)} size="sm" variant="flat">
                      {categoryModules.length}
                    </Chip>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {categoryModules.map(module => (
                      <div key={module.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(module.enabled)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{module.name}</span>
                              <Chip size="sm" variant="flat" color={module.enabled ? 'success' : 'default'}>
                                v{module.version}
                              </Chip>
                              {getHealthIcon(module.health.status)}
                            </div>
                            <p className="text-sm text-gray-600">{module.description}</p>
                            {module.dependencies.length > 0 && (
                              <p className="text-xs text-gray-500">
                                Dependencies: {module.dependencies.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => openModuleDetails(module)}
                          >
                            Configure
                          </Button>
                          <Switch 
                            isSelected={module.enabled} 
                            onValueChange={(checked) => update(module.key, checked)}
                            isDisabled={loading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Tab>

        <Tab key="health" title="Health Monitor">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Module Health Status</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {modules.map(module => (
                  <div key={module.key} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{module.name}</span>
                        {getHealthIcon(module.health.status)}
                      </div>
                      <Chip 
                        size="sm" 
                        color={module.health.status === 'healthy' ? 'success' : module.health.status === 'warning' ? 'warning' : 'danger'}
                      >
                        {module.health.uptime}% uptime
                      </Chip>
                    </div>
                    <Progress 
                      value={module.health.uptime} 
                      color={module.health.uptime > 95 ? 'success' : module.health.uptime > 85 ? 'warning' : 'danger'}
                      className="mb-2"
                    />
                    <div className="text-xs text-gray-500">
                      Last checked: {module.health.lastCheck}
                    </div>
                    {module.health.errors.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="text-sm font-medium text-red-800">Errors:</div>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {module.health.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Module Configuration Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {selectedModule && getCategoryIcon(selectedModule.category)}
                  <span>{selectedModule?.name} Configuration</span>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedModule && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Version</div>
                        <div>{selectedModule.version}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Status</div>
                        <div className="flex items-center gap-1">
                          {getHealthIcon(selectedModule.health.status)}
                          <span className="capitalize">{selectedModule.health.status}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Category</div>
                        <Chip size="sm" color={getCategoryColor(selectedModule.category)}>{selectedModule.category}</Chip>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Uptime</div>
                        <div>{selectedModule.health.uptime}%</div>
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Module Configuration</h4>
                      <div className="space-y-3">
                        {selectedModule.configurations.map(config => (
                          <div key={config.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {config.label}
                            </label>
                            {config.type === 'boolean' ? (
                              <Switch isSelected={config.value} />
                            ) : config.type === 'select' ? (
                              <Select 
                                placeholder="Select an option"
                                selectedKeys={[config.value]}
                                className="max-w-xs"
                              >
                                {(config.options || []).map(option => (
                                  <SelectItem key={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </Select>
                            ) : config.type === 'number' ? (
                              <Input 
                                type="number" 
                                value={config.value.toString()} 
                                className="max-w-xs"
                              />
                            ) : (
                              <Input 
                                value={config.value.toString()} 
                                className="max-w-xs"
                              />
                            )}
                            {config.description && (
                              <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedModule.dependencies.length > 0 && (
                      <>
                        <Divider />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedModule.dependencies.map(dep => (
                              <Chip key={dep} size="sm" variant="flat">{dep}</Chip>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Save Configuration
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
