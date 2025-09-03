import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  CogIcon,
  ArrowRightIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'PROCESS' | 'APPROVAL' | 'AUTOMATION' | 'INTEGRATION';
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  version: string;
  created_by: string;
  created_at: string;
  last_executed?: string;
  execution_count: number;
  success_rate: number;
}

interface WorkflowExecution {
  execution_id: string;
  workflow_id: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  started_at: string;
  completed_at?: string;
  duration?: number;
  triggered_by: string;
  result?: string;
  error?: string;
}

interface WorkflowManagerProps {
  className?: string;
}

export default function WorkflowManager({ className = '' }: WorkflowManagerProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'executions' | 'analytics'>('list');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState({
    status: '',
    type: '',
    category: '',
    search: ''
  });

  // Mock data - replace with API calls
  useEffect(() => {
    const mockWorkflows: Workflow[] = [
      {
        id: 'wf_incident_mgmt',
        name: 'Incident Management',
        description: 'Automated incident handling and escalation process',
        type: 'PROCESS',
        category: 'INCIDENT',
        status: 'ACTIVE',
        version: '1.2.0',
        created_by: 'admin',
        created_at: '2024-01-15T10:30:00Z',
        last_executed: '2024-01-20T14:22:00Z',
        execution_count: 156,
        success_rate: 94.5
      },
      {
        id: 'wf_change_approval',
        name: 'Change Approval Process',
        description: 'Multi-level change approval workflow with CAB review',
        type: 'APPROVAL',
        category: 'CHANGE',
        status: 'ACTIVE',
        version: '2.1.0',
        created_by: 'admin',
        created_at: '2024-01-10T09:15:00Z',
        last_executed: '2024-01-20T16:45:00Z',
        execution_count: 89,
        success_rate: 98.9
      },
      {
        id: 'wf_user_provisioning',
        name: 'User Provisioning',
        description: 'Automated user account and access management',
        type: 'AUTOMATION',
        category: 'IAM',
        status: 'ACTIVE',
        version: '1.0.0',
        created_by: 'admin',
        created_at: '2024-01-08T11:00:00Z',
        last_executed: '2024-01-20T13:30:00Z',
        execution_count: 234,
        success_rate: 96.2
      },
      {
        id: 'wf_backup_routine',
        name: 'Daily Backup Routine',
        description: 'Automated daily backup and verification process',
        type: 'AUTOMATION',
        category: 'BACKUP',
        status: 'PAUSED',
        version: '1.1.2',
        created_by: 'admin',
        created_at: '2024-01-05T08:00:00Z',
        last_executed: '2024-01-19T02:00:00Z',
        execution_count: 45,
        success_rate: 100.0
      }
    ];

    setTimeout(() => {
      setWorkflows(mockWorkflows);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'PAUSED':
        return <PauseIcon className="w-5 h-5 text-yellow-500" />;
      case 'DRAFT':
        return <PencilIcon className="w-5 h-5 text-gray-500" />;
      case 'ARCHIVED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PROCESS':
        return <CogIcon className="w-5 h-5 text-blue-500" />;
      case 'APPROVAL':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'AUTOMATION':
        return <BoltIcon className="w-5 h-5 text-purple-500" />;
      case 'INTEGRATION':
        return <ArrowRightIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <CogIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_data: {}, context: {} })
      });
      
      if (response.ok) {
        const execution = await response.json();
        console.log('Workflow executed:', execution);
        // Refresh workflows or show success message
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = !filter.status || workflow.status === filter.status;
    const matchesType = !filter.type || workflow.type === filter.type;
    const matchesCategory = !filter.category || workflow.category === filter.category;
    const matchesSearch = !filter.search || 
      workflow.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      workflow.description.toLowerCase().includes(filter.search.toLowerCase());
    
    return matchesStatus && matchesType && matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className={`workflow-manager ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`workflow-manager ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Manager</h1>
          <p className="text-gray-600">Manage and monitor your automated workflows</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Workflow
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'list', label: 'Workflows', count: workflows.length },
            { key: 'executions', label: 'Executions', count: 0 },
            { key: 'analytics', label: 'Analytics', count: 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search workflows..."
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="PROCESS">Process</option>
            <option value="APPROVAL">Approval</option>
            <option value="AUTOMATION">Automation</option>
            <option value="INTEGRATION">Integration</option>
          </select>
          <select
            value={filter.category}
            onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="INCIDENT">Incident</option>
            <option value="CHANGE">Change</option>
            <option value="IAM">IAM</option>
            <option value="BACKUP">Backup</option>
          </select>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {filteredWorkflows.map((workflow) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getTypeIcon(workflow.type)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Version {workflow.version}</span>
                        <span>•</span>
                        <span>{workflow.category}</span>
                        <span>•</span>
                        <span>Created {formatDate(workflow.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(workflow.status)}
                      <span className={`text-sm font-medium ${
                        workflow.status === 'ACTIVE' ? 'text-green-600' :
                        workflow.status === 'PAUSED' ? 'text-yellow-600' :
                        workflow.status === 'DRAFT' ? 'text-gray-600' :
                        'text-red-600'
                      }`}>
                        {workflow.status}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{workflow.execution_count}</div>
                      <div className="text-xs text-gray-500">Executions</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{workflow.success_rate}%</div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => executeWorkflow(workflow.id)}
                        disabled={workflow.status !== 'ACTIVE'}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Execute Workflow"
                      >
                        <PlayIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedWorkflow(workflow)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="Edit Workflow"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="View Analytics"
                      >
                        <ChartBarIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {workflow.last_executed && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Last executed: {formatDate(workflow.last_executed)}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {filteredWorkflows.length === 0 && (
              <div className="text-center py-12">
                <CogIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                <p className="text-gray-500 mb-4">
                  {workflows.length === 0 
                    ? "Get started by creating your first workflow"
                    : "Try adjusting your filters to see more results"
                  }
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Workflow
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'executions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg p-8 text-center"
          >
            <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Executions</h3>
            <p className="text-gray-500">View and monitor workflow execution history</p>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg p-8 text-center"
          >
            <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Analytics</h3>
            <p className="text-gray-500">Performance metrics and insights</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workflow Details Modal */}
      <AnimatePresence>
        {selectedWorkflow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedWorkflow(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selectedWorkflow.name}</h2>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedWorkflow.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Type</h3>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(selectedWorkflow.type)}
                      <span className="text-gray-600">{selectedWorkflow.type}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedWorkflow.status)}
                      <span className="text-gray-600">{selectedWorkflow.status}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
                    <span className="text-gray-600">{selectedWorkflow.category}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Version</h3>
                    <span className="text-gray-600">{selectedWorkflow.version}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedWorkflow.execution_count}</div>
                    <div className="text-sm text-gray-600">Total Executions</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedWorkflow.success_rate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => executeWorkflow(selectedWorkflow.id)}
                    disabled={selectedWorkflow.status !== 'ACTIVE'}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Execute
                  </button>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}