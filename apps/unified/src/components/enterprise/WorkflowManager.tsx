import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { workflowService, type Workflow, type WorkflowExecution } from '@services/workflow';
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

interface WorkflowManagerProps {
  className?: string;
}

export default function WorkflowManager({ className = '' }: WorkflowManagerProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'executions' | 'analytics'>('list');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workflowExecutions, setWorkflowExecutions] = useState<WorkflowExecution[]>([]);
  const [filter, setFilter] = useState({
    status: '',
    type: '',
    category: '',
    search: ''
  });

  // Enterprise workflow operations
  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWorkflows(prev => prev.filter(w => w.id !== workflowId));
        console.log('Workflow deleted successfully');
      } else {
        throw new Error('Failed to delete workflow');
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      alert('Failed to delete workflow. Please try again.');
    }
  };

  const stopWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to stop all running instances of this workflow?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}/stop`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update workflow status to PAUSED
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId ? { ...w, status: 'PAUSED' as const } : w
        ));
        console.log('Workflow stopped successfully');
      } else {
        throw new Error('Failed to stop workflow');
      }
    } catch (error) {
      console.error('Error stopping workflow:', error);
      alert('Failed to stop workflow. Please try again.');
    }
  };

  const duplicateWorkflow = async (workflow: Workflow) => {
    try {
      const duplicatedWorkflow = {
        ...workflow,
        id: `${workflow.id}_copy_${Date.now()}`,
        name: `${workflow.name} (Copy)`,
        status: 'DRAFT' as const,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        last_executed: undefined,
        execution_count: 0,
        success_rate: 0,
      };

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedWorkflow),
      });

      if (response.ok) {
        const newWorkflow = await response.json();
        setWorkflows(prev => [...prev, newWorkflow]);
        console.log('Workflow duplicated successfully');
      } else {
        throw new Error('Failed to duplicate workflow');
      }
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      // Fallback: add to local state
      const duplicatedWorkflow = {
        ...workflow,
        id: `${workflow.id}_copy_${Date.now()}`,
        name: `${workflow.name} (Copy)`,
        status: 'DRAFT' as const,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        last_executed: undefined,
        execution_count: 0,
        success_rate: 0,
      };
      setWorkflows(prev => [...prev, duplicatedWorkflow]);
    }
  };

  const createWorkflow = async (workflowData: Partial<Workflow>) => {
    try {
      const newWorkflow = {
        id: `wf_${Date.now()}`,
        name: workflowData.name || 'New Workflow',
        description: workflowData.description || '',
        type: workflowData.type || 'PROCESS',
        category: workflowData.category || 'GENERAL',
        status: 'DRAFT' as const,
        version: '1.0.0',
        created_by: 'current_user',
        created_at: new Date().toISOString(),
        execution_count: 0,
        success_rate: 0,
        ...workflowData,
      };

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkflow),
      });

      if (response.ok) {
        const createdWorkflow = await response.json();
        setWorkflows(prev => [...prev, createdWorkflow]);
        setShowCreateModal(false);
        console.log('Workflow created successfully');
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      // Fallback: add to local state
      const newWorkflow = {
        id: `wf_${Date.now()}`,
        name: workflowData.name || 'New Workflow',
        description: workflowData.description || '',
        type: workflowData.type || 'PROCESS',
        category: workflowData.category || 'GENERAL',
        status: 'DRAFT' as const,
        version: '1.0.0',
        created_by: 'current_user',
        created_at: new Date().toISOString(),
        execution_count: 0,
        success_rate: 0,
        ...workflowData,
      } as Workflow;
      
      setWorkflows(prev => [...prev, newWorkflow]);
      setShowCreateModal(false);
    }
  };

  // Load workflows and executions from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [workflowsResponse, executionsResponse] = await Promise.all([
          workflowService.getWorkflows({ limit: 100 }),
          workflowService.getExecutions({ limit: 50 }),
        ]);
        
        setWorkflows(workflowsResponse.workflows || []);
        setWorkflowExecutions(executionsResponse.executions || []);
      } catch (error) {
        console.error('Failed to load workflow data:', error);
        // Set empty state on error
        setWorkflows([]);
        setWorkflowExecutions([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
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
                        onClick={() => stopWorkflow(workflow.id)}
                        disabled={workflow.status !== 'ACTIVE'}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Stop Workflow"
                      >
                        <StopIcon className="w-5 h-5" />
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
                        onClick={() => duplicateWorkflow(workflow)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Duplicate Workflow"
                      >
                        <DocumentDuplicateIcon className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => deleteWorkflow(workflow.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Workflow"
                      >
                        <TrashIcon className="w-5 h-5" />
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
            className="space-y-4"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Executions</h3>
                <p className="text-sm text-gray-600">Monitor workflow execution history and status</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {workflowExecutions.length > 0 ? (
                  workflowExecutions.map((execution) => (
                    <div key={execution.execution_id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            execution.status === 'COMPLETED' ? 'bg-green-500' :
                            execution.status === 'RUNNING' ? 'bg-blue-500' :
                            execution.status === 'FAILED' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`} />
                          <div>
                            <div className="font-medium text-gray-900">
                              {workflows.find(w => w.id === execution.workflow_id)?.name || 'Unknown Workflow'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Execution ID: {execution.execution_id}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-8">
                          <div className="text-center">
                            <div className={`text-sm font-medium ${
                              execution.status === 'COMPLETED' ? 'text-green-600' :
                              execution.status === 'RUNNING' ? 'text-blue-600' :
                              execution.status === 'FAILED' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {execution.status}
                            </div>
                            <div className="text-xs text-gray-500">Status</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {execution.duration ? `${execution.duration}ms` : '-'}
                            </div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(execution.started_at)}
                            </div>
                            <div className="text-xs text-gray-500">Started</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {execution.triggered_by}
                            </div>
                            <div className="text-xs text-gray-500">Triggered By</div>
                          </div>
                        </div>
                      </div>
                      
                      {execution.error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-sm text-red-800">
                            <strong>Error:</strong> {execution.error}
                          </div>
                        </div>
                      )}
                      
                      {execution.result && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm text-green-800">
                            <strong>Result:</strong> {execution.result}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Executions Found</h3>
                    <p className="text-gray-500">
                      Execute a workflow to see execution history here
                    </p>
                  </div>
                )}
              </div>
            </div>
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

      {/* Create Workflow Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Workflow</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const workflowData = {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    type: formData.get('type') as Workflow['type'],
                    category: formData.get('category') as string,
                  };
                  createWorkflow(workflowData);
                }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter workflow name"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what this workflow does"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PROCESS">Process</option>
                      <option value="APPROVAL">Approval</option>
                      <option value="AUTOMATION">Automation</option>
                      <option value="INTEGRATION">Integration</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., INCIDENT, CHANGE, GENERAL"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Workflow
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}