/**
 * Enhanced Apple-style Automation Hub
 * Central automation management with Apple design and enterprise functionality
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BoltIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WifiIcon,
  DocumentTextIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from '@components/common/GlassCard';
import { AppleButton } from '@components/common/AppleButton';
import { AppleInput } from '@components/common/AppleInput';
import { StatusBadge } from '@components/common/AppleBadges';
import { cn, cardHoverEffect, formatRelativeTime } from '@utils/apple-utils';
import { fadeInAnimation } from '@utils/apple-utils';

// Integration interface
interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'productivity' | 'monitoring' | 'security' | 'database' | 'cloud';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  icon: React.ReactNode;
  provider: string;
  lastSync?: Date;
  syncFrequency?: string;
  recordsProcessed?: number;
  errorCount?: number;
  configRequired?: boolean;
}

// Automation rule interface
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'paused' | 'draft';
  category: 'tickets' | 'users' | 'notifications' | 'reporting';
  executions: number;
  lastTriggered?: Date;
  successRate: number;
  priority: 'low' | 'normal' | 'high';
  createdBy: string;
}

// Mock integrations
const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Microsoft Teams',
    description: 'Send notifications and create channels for incidents',
    category: 'communication',
    status: 'connected',
    icon: <EnvelopeIcon className="h-6 w-6" />,
    provider: 'Microsoft',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    syncFrequency: 'Real-time',
    recordsProcessed: 1247,
    errorCount: 0
  },
  {
    id: '2',
    name: 'Slack',
    description: 'Team communication and alert notifications',
    category: 'communication',
    status: 'connected',
    icon: <WifiIcon className="h-6 w-6" />,
    provider: 'Slack Technologies',
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
    syncFrequency: 'Real-time',
    recordsProcessed: 892,
    errorCount: 0
  },
  {
    id: '3',
    name: 'Jira Service Management',
    description: 'Sync tickets and project management data',
    category: 'productivity',
    status: 'connected',
    icon: <DocumentTextIcon className="h-6 w-6" />,
    provider: 'Atlassian',
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    syncFrequency: 'Every 15 minutes',
    recordsProcessed: 456,
    errorCount: 2
  },
  {
    id: '4',
    name: 'Active Directory',
    description: 'User authentication and directory services',
    category: 'security',
    status: 'connected',
    icon: <UserIcon className="h-6 w-6" />,
    provider: 'Microsoft',
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    syncFrequency: 'Hourly',
    recordsProcessed: 2341,
    errorCount: 0
  },
  {
    id: '5',
    name: 'Monitoring Dashboard',
    description: 'System health and performance monitoring',
    category: 'monitoring',
    status: 'error',
    icon: <ChartBarIcon className="h-6 w-6" />,
    provider: 'DataDog',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    syncFrequency: 'Every 5 minutes',
    recordsProcessed: 0,
    errorCount: 15,
    configRequired: true
  },
  {
    id: '6',
    name: 'AWS S3',
    description: 'File storage and backup integration',
    category: 'cloud',
    status: 'connected',
    icon: <GlobeAltIcon className="h-6 w-6" />,
    provider: 'Amazon Web Services',
    lastSync: new Date(Date.now() - 45 * 60 * 1000),
    syncFrequency: 'Daily',
    recordsProcessed: 789,
    errorCount: 0
  }
];

// Mock automation rules
const mockAutomationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Critical Incident Alert',
    description: 'Send immediate notifications for critical incidents to management',
    trigger: 'Ticket Priority = Critical',
    actions: ['Send Teams Message', 'Create Phone Alert', 'Escalate to Manager'],
    status: 'active',
    category: 'tickets',
    executions: 23,
    lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
    successRate: 100,
    priority: 'high',
    createdBy: 'John Smith'
  },
  {
    id: '2',
    name: 'Auto-Assign Hardware Requests',
    description: 'Automatically assign hardware requests to IT procurement team',
    trigger: 'Category = Hardware AND Type = Request',
    actions: ['Assign to IT Team', 'Set SLA Timer', 'Send Acknowledgment'],
    status: 'active',
    category: 'tickets',
    executions: 156,
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    successRate: 94.2,
    priority: 'normal',
    createdBy: 'Sarah Johnson'
  },
  {
    id: '3',
    name: 'User Onboarding Workflow',
    description: 'Trigger onboarding process when new user is created',
    trigger: 'New User Account Created',
    actions: ['Create Welcome Email', 'Assign Laptop', 'Schedule Training'],
    status: 'active',
    category: 'users',
    executions: 47,
    lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000),
    successRate: 97.8,
    priority: 'high',
    createdBy: 'Mike Wilson'
  }
];

export default function EnhancedAutomationHubPage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'integrations' | 'automations'>('integrations');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    return mockIntegrations.filter(integration => {
      const matchesSearch = searchQuery === '' || 
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  // Filter automation rules
  const filteredAutomations = useMemo(() => {
    return mockAutomationRules.filter(rule => {
      const matchesSearch = searchQuery === '' || 
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'text-green-800 bg-green-100';
      case 'disconnected':
      case 'paused':
        return 'text-orange-800 bg-orange-100';
      case 'error':
        return 'text-red-800 bg-red-100';
      case 'syncing':
        return 'text-blue-800 bg-blue-100';
      case 'draft':
        return 'text-gray-800 bg-gray-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <EnvelopeIcon className="h-5 w-5" />;
      case 'productivity': return <DocumentTextIcon className="h-5 w-5" />;
      case 'monitoring': return <ChartBarIcon className="h-5 w-5" />;
      case 'security': return <UserIcon className="h-5 w-5" />;
      case 'cloud': return <GlobeAltIcon className="h-5 w-5" />;
      case 'database': return <CogIcon className="h-5 w-5" />;
      case 'tickets': return <BoltIcon className="h-5 w-5" />;
      case 'users': return <UserIcon className="h-5 w-5" />;
      case 'notifications': return <EnvelopeIcon className="h-5 w-5" />;
      case 'reporting': return <ChartBarIcon className="h-5 w-5" />;
      default: return <CogIcon className="h-5 w-5" />;
    }
  };

  const connectedCount = mockIntegrations.filter(i => i.status === 'connected').length;
  const errorCount = mockIntegrations.filter(i => i.status === 'error').length;
  const activeRulesCount = mockAutomationRules.filter(r => r.status === 'active').length;
  const totalExecutions = mockAutomationRules.reduce((sum, r) => sum + r.executions, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8" {...fadeInAnimation()}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Automation Hub
              </h1>
              <p className="text-xl text-gray-600">
                Connect services and automate your ITSM workflows
              </p>
            </div>

            <div className="flex gap-3">
              <AppleButton
                variant="secondary"
                leftIcon={<CogIcon className="h-5 w-5" />}
              >
                Browse Marketplace
              </AppleButton>
              
              <AppleButton
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Add Integration
              </AppleButton>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" {...fadeInAnimation(0.1)}>
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{connectedCount}</div>
              <div className="text-sm font-medium text-gray-600">Connected Services</div>
            </div>
          </GlassCard>
          
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{activeRulesCount}</div>
              <div className="text-sm font-medium text-gray-600">Active Rules</div>
            </div>
          </GlassCard>
          
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{totalExecutions.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600">Total Executions</div>
            </div>
          </GlassCard>
          
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className={cn(
                'text-3xl font-bold mb-1',
                errorCount > 0 ? 'text-red-600' : 'text-green-600'
              )}>
                {errorCount}
              </div>
              <div className="text-sm font-medium text-gray-600">Integration Issues</div>
            </div>
          </GlassCard>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8" {...fadeInAnimation(0.2)}>
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => setSelectedTab('integrations')}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200',
                selectedTab === 'integrations'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Integrations
            </button>
            <button
              onClick={() => setSelectedTab('automations')}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200',
                selectedTab === 'automations'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Automation Rules
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <GlassCard intensity="medium" hover={false} padding="md" className="mb-6" {...fadeInAnimation(0.3)}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <AppleInput
                placeholder={`Search ${selectedTab}...`}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="glass"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={cn(
                  'px-4 py-3 bg-white/90 backdrop-blur-sm',
                  'border border-gray-200 rounded-xl',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200 ease-out'
                )}
              >
                <option value="all">All Status</option>
                {selectedTab === 'integrations' ? (
                  <>
                    <option value="connected">Connected</option>
                    <option value="disconnected">Disconnected</option>
                    <option value="error">Error</option>
                    <option value="syncing">Syncing</option>
                  </>
                ) : (
                  <>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </>
                )}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={cn(
                  'px-4 py-3 bg-white/90 backdrop-blur-sm',
                  'border border-gray-200 rounded-xl',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200 ease-out'
                )}
              >
                <option value="all">All Categories</option>
                {selectedTab === 'integrations' ? (
                  <>
                    <option value="communication">Communication</option>
                    <option value="productivity">Productivity</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="security">Security</option>
                    <option value="cloud">Cloud</option>
                    <option value="database">Database</option>
                  </>
                ) : (
                  <>
                    <option value="tickets">Tickets</option>
                    <option value="users">Users</option>
                    <option value="notifications">Notifications</option>
                    <option value="reporting">Reporting</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Content */}
        {selectedTab === 'integrations' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" {...fadeInAnimation(0.4)}>
            {filteredIntegrations.map((integration, index) => (
              <GlassCard
                key={integration.id}
                intensity="medium"
                hover="strong"
                padding="lg"
                className={cn(
                  cardHoverEffect('strong'),
                  'cursor-pointer'
                )}
                onClick={() => navigate(`/automation/integrations/${integration.id}`)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                      {integration.icon}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                      <div className="text-sm text-gray-600">{integration.provider}</div>
                    </div>
                  </div>

                  <StatusBadge status={integration.status} size="sm" />
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {integration.description}
                </p>

                <div className="space-y-2 text-sm">
                  {integration.lastSync && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Last Sync:</span>
                      <span className="text-gray-900">{formatRelativeTime(integration.lastSync)}</span>
                    </div>
                  )}
                  
                  {integration.syncFrequency && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Frequency:</span>
                      <span className="text-gray-900">{integration.syncFrequency}</span>
                    </div>
                  )}

                  {integration.recordsProcessed !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Records:</span>
                      <span className="text-gray-900">{integration.recordsProcessed.toLocaleString()}</span>
                    </div>
                  )}

                  {integration.errorCount !== undefined && integration.errorCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Errors:</span>
                      <span className="text-red-600 font-medium">{integration.errorCount}</span>
                    </div>
                  )}
                </div>

                {integration.configRequired && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Configuration Required</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <AppleButton
                    size="sm"
                    variant={integration.status === 'connected' ? 'ghost' : 'primary'}
                    leftIcon={integration.status === 'connected' ? <CogIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {integration.status === 'connected' ? 'Configure' : 'Connect'}
                  </AppleButton>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="space-y-4" {...fadeInAnimation(0.4)}>
            {filteredAutomations.map((rule, index) => (
              <GlassCard
                key={rule.id}
                intensity="medium"
                hover="medium"
                padding="lg"
                className={cn(
                  cardHoverEffect('medium'),
                  'cursor-pointer'
                )}
                onClick={() => navigate(`/automation/rules/${rule.id}`)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <StatusBadge status={rule.status} size="sm" />
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium">
                        {rule.category}
                      </span>
                      <span className={cn(
                        'px-2 py-1 rounded-lg text-xs font-medium',
                        rule.priority === 'high' && 'bg-red-100 text-red-800',
                        rule.priority === 'normal' && 'bg-blue-100 text-blue-800',
                        rule.priority === 'low' && 'bg-gray-100 text-gray-800'
                      )}>
                        {rule.priority} priority
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{rule.name}</h3>
                    
                    <p className="text-gray-600 mb-4">{rule.description}</p>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Trigger: </span>
                        <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {rule.trigger}
                        </span>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-500">Actions: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rule.actions.map((action, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-lg"
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                      <div className="flex items-center gap-1">
                        <BoltIcon className="h-4 w-4" />
                        <span>{rule.executions} executions</span>
                      </div>
                      
                      {rule.lastTriggered && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>Last: {formatRelativeTime(rule.lastTriggered)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{rule.createdBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className={cn(
                        'text-lg font-bold',
                        rule.successRate >= 95 ? 'text-green-600' :
                        rule.successRate >= 85 ? 'text-orange-600' : 'text-red-600'
                      )}>
                        {rule.successRate}%
                      </div>
                      <div className="text-xs text-gray-500">success rate</div>
                    </div>

                    <div className="flex gap-2">
                      <AppleButton
                        size="sm"
                        variant="ghost"
                        leftIcon={rule.status === 'active' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rule.status === 'active' ? 'Pause' : 'Start'}
                      </AppleButton>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Empty States */}
        {((selectedTab === 'integrations' && filteredIntegrations.length === 0) ||
          (selectedTab === 'automations' && filteredAutomations.length === 0)) && (
          <GlassCard intensity="medium" hover={false} padding="xl" className="text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                {selectedTab === 'integrations' ? 
                  <CogIcon className="h-8 w-8 text-gray-400" /> :
                  <BoltIcon className="h-8 w-8 text-gray-400" />
                }
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {selectedTab} found
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedTab === 'integrations' ? 
                  'Try adjusting your search criteria or add a new integration.' :
                  'Try adjusting your filters or create a new automation rule.'
                }
              </p>
              <AppleButton
                onClick={() => navigate(`/automation/${selectedTab}/create`)}
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                {selectedTab === 'integrations' ? 'Add Integration' : 'Create Rule'}
              </AppleButton>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}