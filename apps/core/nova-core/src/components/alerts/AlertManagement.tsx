import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BellIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface AlertService {
  id: string;
  name: string;
  description: string;
  escalationPolicyId: string;
  escalationPolicy?: EscalationPolicy;
  integrationCount: number;
  enabled: boolean;
  createdAt: string;
}

interface EscalationPolicy {
  id: string;
  name: string;
  description: string;
  steps: EscalationStep[];
  enabled: boolean;
  createdAt: string;
}

interface EscalationStep {
  id: string;
  stepNumber: number;
  delayMinutes: number;
  targets: EscalationTarget[];
}

interface EscalationTarget {
  id: string;
  type: 'user' | 'schedule' | 'webhook' | 'email';
  name: string;
  config: Record<string, any>;
}

interface Schedule {
  id: string;
  name: string;
  description: string;
  timezone: string;
  enabled: boolean;
  rules: ScheduleRule[];
  overrides: ScheduleOverride[];
}

interface ScheduleRule {
  id: string;
  startTime: string;
  endTime: string;
  weekdays: number[];
  userId: string;
  userName: string;
}

interface ScheduleOverride {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string;
  reason: string;
}

const AlertManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'services' | 'policies' | 'schedules' | 'audit'>('services');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch alert services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['alert-services'],
    queryFn: async (): Promise<AlertService[]> => {
      const response = await fetch('/api/v2/alerts/services', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      return data.services;
    }
  });

  // Fetch escalation policies
  const { data: policies = [], isLoading: policiesLoading } = useQuery({
    queryKey: ['escalation-policies'],
    queryFn: async (): Promise<EscalationPolicy[]> => {
      const response = await fetch('/api/v2/alerts/escalation-policies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data = await response.json();
      return data.escalationPolicies;
    }
  });

  // Fetch schedules
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['alert-schedules'],
    queryFn: async (): Promise<Schedule[]> => {
      const response = await fetch('/api/v2/alerts/schedules', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      return data.schedules;
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      const response = await fetch(`/api/v2/alerts/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error(`Failed to delete ${type}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`alert-${variables.type}`] });
      queryClient.invalidateQueries({ queryKey: [`${variables.type.slice(0, -1)}-policies`] });
    }
  });

  const handleDelete = (type: string, id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate({ type, id });
    }
  };

  const tabs = [
    { id: 'services', label: 'Alert Services', icon: BellIcon, count: services.length },
    { id: 'policies', label: 'Escalation Policies', icon: ExclamationTriangleIcon, count: policies.length },
    { id: 'schedules', label: 'On-Call Schedules', icon: UserGroupIcon, count: schedules.length },
    { id: 'audit', label: 'Audit Logs', icon: ClockIcon, count: 0 }
  ];

  const renderServicesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alert Services</h2>
          <p className="text-gray-600 mt-1">Manage alert routing and service configurations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Service</span>
        </motion.button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <motion.div
            key={service.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${service.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <BellIcon className={`w-6 h-6 ${service.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="View details"
                >
                  <EyeIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                  title="Edit service"
                >
                  <PencilIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete('services', service.id, service.name)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete service"
                >
                  <TrashIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Escalation Policy</span>
                <span className="font-medium text-gray-900">
                  {service.escalationPolicy?.name || 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Integrations</span>
                <span className="font-medium text-gray-900">{service.integrationCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`
                  px-2 py-1 text-xs rounded-full font-medium
                  ${service.enabled 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {service.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {services.length === 0 && !servicesLoading && (
        <div className="text-center py-12">
          <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No alert services configured</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
          >
            Create First Service
          </motion.button>
        </div>
      )}
    </div>
  );

  const renderPoliciesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Escalation Policies</h2>
          <p className="text-gray-600 mt-1">Define how alerts are escalated through your organization</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Policy</span>
        </motion.button>
      </div>

      <div className="space-y-4">
        {policies.map((policy) => (
          <motion.div
            key={policy.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
                <p className="text-gray-600">{policy.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`
                  px-3 py-1 text-sm rounded-full font-medium
                  ${policy.enabled 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {policy.enabled ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete('policies', policy.id, policy.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Escalation Steps</h4>
              {policy.steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {step.targets.map(t => t.name).join(', ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        after {step.delayMinutes} minutes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSchedulesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">On-Call Schedules</h2>
          <p className="text-gray-600 mt-1">Manage rotation schedules and on-call assignments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Schedule</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schedules.map((schedule) => (
          <motion.div
            key={schedule.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                <p className="text-gray-600">{schedule.description}</p>
                <p className="text-sm text-gray-500 mt-1">Timezone: {schedule.timezone}</p>
              </div>
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Rotate now"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                  title="Edit schedule"
                >
                  <PencilIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Current On-Call</h4>
                {schedule.rules.slice(0, 2).map((rule) => (
                  <div key={rule.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {rule.userName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{rule.userName}</span>
                      <p className="text-sm text-gray-600">
                        {rule.startTime} - {rule.endTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Active Overrides</h4>
                {schedule.overrides.slice(0, 2).map((override) => (
                  <div key={override.id} className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {override.userName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{override.userName}</span>
                      <p className="text-sm text-gray-600">{override.reason}</p>
                    </div>
                  </div>
                ))}
                {schedule.overrides.length === 0 && (
                  <p className="text-sm text-gray-500">No active overrides</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Alert Audit Logs</h2>
        <p className="text-gray-600 mt-1">Track all alert operations and changes</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6">
        <div className="text-center py-12">
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Audit log feature coming soon</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
          <p className="text-gray-600 mt-2">
            Configure and manage your alert infrastructure
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'services' && renderServicesTab()}
            {activeTab === 'policies' && renderPoliciesTab()}
            {activeTab === 'schedules' && renderSchedulesTab()}
            {activeTab === 'audit' && renderAuditTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertManagement;
