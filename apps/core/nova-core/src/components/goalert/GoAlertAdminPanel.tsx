import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CogIcon,
  UserGroupIcon,
  ServerIcon,
  CalendarIcon,
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  KeyIcon,
  PhoneIcon,
  EnvelopeIcon,
  LinkIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface GoAlertService {
  id: string;
  name: string;
  description: string;
  escalationPolicyID: string;
  integrationKeys: Array<{
    id: string;
    name: string;
    type: string;
    href: string;
  }>;
}

interface GoAlertUser {
  id: string;
  name: string;
  email: string;
  role: string;
  contactMethods: Array<{
    id: string;
    name: string;
    type: 'SMS' | 'VOICE' | 'EMAIL' | 'WEBHOOK';
    value: string;
  }>;
  notificationRules: Array<{
    id: string;
    contactMethodID: string;
    delayMinutes: number;
  }>;
}

interface CreateServiceFormData {
  name: string;
  description: string;
  escalationPolicyID: string;
}

interface CreateEscalationPolicyFormData {
  name: string;
  description: string;
  repeat: number;
  steps: Array<{
    delayMinutes: number;
    targets: Array<{
      id: string;
      type: string;
    }>;
  }>;
}

const GoAlertAdminPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<
    'overview' | 'services' | 'policies' | 'schedules' | 'users'
  >('overview');
  const [showCreateService, setShowCreateService] = useState(false);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [editingService, setEditingService] = useState<GoAlertService | null>(null);

  // Form states
  const [serviceForm, setServiceForm] = useState<CreateServiceFormData>({
    name: '',
    description: '',
    escalationPolicyID: '',
  });

  const [policyForm, setPolicyForm] = useState<CreateEscalationPolicyFormData>({
    name: '',
    description: '',
    repeat: 0,
    steps: [{ delayMinutes: 0, targets: [] }],
  });

  // Fetch system overview
  const { data: overview } = useQuery({
    queryKey: ['goalert-overview'],
    queryFn: async () => {
      const [services, policies, schedules, alerts] = await Promise.all([
        fetch('/api/v2/goalert/services', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then((r) => r.json()),
        fetch('/api/v2/goalert/escalation-policies', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then((r) => r.json()),
        fetch('/api/v2/goalert/schedules', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then((r) => r.json()),
        fetch('/api/v2/goalert/alerts?status=active', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then((r) => r.json()),
      ]);

      return {
        services: services.services || [],
        escalationPolicies: policies.escalationPolicies || [],
        schedules: schedules.schedules || [],
        activeAlerts: alerts.alerts || [],
      };
    },
    refetchInterval: 60000,
  });

  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ['goalert-users'],
    queryFn: async (): Promise<GoAlertUser[]> => {
      const response = await fetch('/api/v2/goalert/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.users;
    },
    enabled: activeSection === 'users',
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: CreateServiceFormData) => {
      const response = await fetch('/api/v2/goalert/services', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) throw new Error('Failed to create service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalert-overview'] });
      setShowCreateService(false);
      setServiceForm({ name: '', description: '', escalationPolicyID: '' });
    },
  });

  // Create escalation policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: CreateEscalationPolicyFormData) => {
      const response = await fetch('/api/v2/goalert/escalation-policies', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData),
      });
      if (!response.ok) throw new Error('Failed to create escalation policy');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalert-overview'] });
      setShowCreatePolicy(false);
      setPolicyForm({
        name: '',
        description: '',
        repeat: 0,
        steps: [{ delayMinutes: 0, targets: [] }],
      });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await fetch(`/api/v2/goalert/services/${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalert-overview'] });
    },
  });

  const sections = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'services', name: 'Services', icon: ServerIcon },
    { id: 'policies', name: 'Escalation Policies', icon: UserGroupIcon },
    { id: 'schedules', name: 'Schedules', icon: CalendarIcon },
    { id: 'users', name: 'Users', icon: UserGroupIcon },
  ];

  // Escalation policies
  const { data: policies = [] } = useQuery({
    queryKey: ['goalert-escalation-policies'],
    queryFn: async () => {
      const r = await fetch('/api/v2/alerts/escalation-policies', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!r.ok) throw new Error('Failed to fetch policies');
      const d = await r.json();
      return d.escalationPolicies || [];
    },
    enabled: activeSection === 'policies',
  });

  const createEscalationPolicyMutation = useMutation({
    mutationFn: async (payload: any) => {
      const r = await fetch('/api/v2/alerts/escalation-policies', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('Failed to create policy');
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goalert-escalation-policies'] }),
  });

  const updateEscalationPolicyMutation = useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const r = await fetch(`/api/v2/alerts/escalation-policies/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('Failed to update policy');
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goalert-escalation-policies'] }),
  });

  const deleteEscalationPolicyMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/v2/alerts/escalation-policies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!r.ok) throw new Error('Failed to delete policy');
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goalert-escalation-policies'] }),
  });

  // Schedules
  const { data: schedules = [] } = useQuery({
    queryKey: ['goalert-schedules-admin'],
    queryFn: async () => {
      const r = await fetch('/api/v2/alerts/schedules', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!r.ok) throw new Error('Failed to fetch schedules');
      const d = await r.json();
      return d.schedules || [];
    },
    enabled: activeSection === 'schedules',
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const r = await fetch('/api/v2/goalert/schedules', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('Failed to create schedule');
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goalert-schedules-admin'] }),
  });

  const renderPolicies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Escalation Policies</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreatePolicy(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 inline h-4 w-4" /> Create Policy
        </motion.button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((p: any) => (
          <motion.div
            key={p.id}
            className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateEscalationPolicyMutation.mutate({ id: p.id, name: p.name })}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteEscalationPolicyMutation.mutate(p.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">Steps: {p.stepCount}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSchedules = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Schedules</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            createScheduleMutation.mutate({ name: `Schedule ${Date.now()}`, timeZone: 'UTC' })
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 inline h-4 w-4" /> Create Schedule
        </motion.button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map((s: any) => (
          <motion.div
            key={s.id}
            className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <p className="text-sm text-gray-600">{s.description}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">Time Zone: {s.timeZone || 'UTC'}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">GoAlert System Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-red-100 p-2">
              <BellIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.activeAlerts.length || 0}
              </p>
              <p className="text-sm text-gray-600">Active Alerts</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <ServerIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview?.services.length || 0}</p>
              <p className="text-sm text-gray-600">Services</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.escalationPolicies.length || 0}
              </p>
              <p className="text-sm text-gray-600">Escalation Policies</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview?.schedules.length || 0}</p>
              <p className="text-sm text-gray-600">Schedules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Active Alerts</h3>
        <div className="space-y-3">
          {overview?.activeAlerts.slice(0, 5).map((alert: any) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-lg bg-red-50 p-3"
            >
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">{alert.summary}</p>
                  <p className="text-sm text-gray-600">{alert.serviceName}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(alert.createdAt).toLocaleTimeString()}
              </span>
            </div>
          )) || <p className="py-4 text-center text-gray-500">No active alerts</p>}
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Services Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateService(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 inline h-4 w-4" />
          Create Service
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {overview?.services.map((service: GoAlertService) => (
          <motion.div
            key={service.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <ServerIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingService(service)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteServiceMutation.mutate(service.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <UserGroupIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Policy: {service.escalationPolicyID}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <KeyIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {service.integrationKeys?.length || 0} integration keys
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Manage Integration Keys
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Service Modal */}
      <AnimatePresence>
        {showCreateService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowCreateService(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Create New Service</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter service name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter service description"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Escalation Policy
                  </label>
                  <select
                    aria-label="Escalation policy"
                    value={serviceForm.escalationPolicyID}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, escalationPolicyID: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select escalation policy</option>
                    {overview?.escalationPolicies.map((policy: any) => (
                      <option key={policy.id} value={policy.id}>
                        {policy.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateService(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => createServiceMutation.mutate(serviceForm)}
                  disabled={
                    !serviceForm.name ||
                    !serviceForm.escalationPolicyID ||
                    createServiceMutation.isPending
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">User Management</h2>

      <div className="space-y-4">
        {users.map((user) => (
          <motion.div
            key={user.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="font-medium text-blue-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">Role: {user.role}</p>

                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Contact Methods:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {user.contactMethods.map((method) => (
                          <span
                            key={method.id}
                            className="inline-flex items-center space-x-1 rounded bg-gray-100 px-2 py-1 text-xs"
                          >
                            {method.type === 'EMAIL' && <EnvelopeIcon className="h-3 w-3" />}
                            {method.type === 'SMS' && <PhoneIcon className="h-3 w-3" />}
                            {method.type === 'VOICE' && <PhoneIcon className="h-3 w-3" />}
                            {method.type === 'WEBHOOK' && <LinkIcon className="h-3 w-3" />}
                            <span>{method.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Notification Rules: {user.notificationRules.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                Configure
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GoAlert Administration</h1>
          <p className="mt-1 text-gray-600">Complete GoAlert system management through Nova Core</p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => queryClient.invalidateQueries()}
            className="rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
            title="Refresh all data"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <div className="rounded-xl border border-gray-200/50 bg-white/80 p-1 backdrop-blur-xl">
        <div className="flex space-x-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{section.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderOverview()}
          </motion.div>
        )}

        {activeSection === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderServices()}
          </motion.div>
        )}

        {activeSection === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderUsers()}
          </motion.div>
        )}

        {activeSection === 'policies' && (
          <motion.div
            key="policies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderPolicies()}
          </motion.div>
        )}
        {activeSection === 'schedules' && (
          <motion.div
            key="schedules"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderSchedules()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoAlertAdminPanel;
