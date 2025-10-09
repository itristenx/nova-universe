import { useState, useEffect } from 'react';
import { workflowsAPI, type Workflow, type WorkflowTemplate, type WorkflowInstance, type WorkflowAnalytics } from '@services/backend-api-client';
import { cn } from '@utils/index';
import toast from 'react-hot-toast';
import { useRoles } from '@hooks/usePermission';
import { AdminOnly, WorkflowAdminOnly } from '@components/common/PermissionGuard';
import { DisabledButton, ReadOnlyBadge } from '@components/common/UnauthorizedTooltip';

// Icons
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const TemplateIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

export const WorkflowBuilderPage: React.FC = () => {
  // RBAC checks
  const { isAdmin, isWorkflowAdmin } = useRoles();
  const canManageWorkflows = isAdmin || isWorkflowAdmin;
  
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowInstance[]>([]);
  const [analytics, setAnalytics] = useState<WorkflowAnalytics | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'executions' | 'analytics'>('workflows');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    definition: '{}',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  });

  const [executeVariables, setExecuteVariables] = useState('{}');

  // Load workflows
  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const [workflowsData, templatesData, statusData] = await Promise.all([
        workflowsAPI.list(),
        workflowsAPI.getTemplates(),
        workflowsAPI.getStatus(),
      ]);
      setWorkflows(workflowsData);
      setTemplates(templatesData);
      setSystemStatus(statusData);
    } catch (err: any) {
      setError(err.message || 'Failed to load workflows');
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  // Load executions
  const loadExecutions = async (workflowId: string) => {
    try {
      const data = await workflowsAPI.getExecutions(workflowId);
      setExecutions(data);
    } catch (err: any) {
      toast.error('Failed to load executions');
    }
  };

  // Load analytics
  const loadAnalytics = async (workflowId: string) => {
    try {
      const data = await workflowsAPI.getAnalytics(workflowId);
      setAnalytics(data);
    } catch (err: any) {
      toast.error('Failed to load analytics');
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflow && activeTab === 'executions') {
      loadExecutions(selectedWorkflow.id);
    }
  }, [selectedWorkflow, activeTab]);

  useEffect(() => {
    if (selectedWorkflow && activeTab === 'analytics') {
      loadAnalytics(selectedWorkflow.id);
    }
  }, [selectedWorkflow, activeTab]);

  // Handle create
  const handleCreate = async () => {
    try {
      let definition;
      try {
        definition = JSON.parse(formData.definition);
      } catch {
        toast.error('Invalid JSON in workflow definition');
        return;
      }

      await workflowsAPI.create({
        ...formData,
        definition,
      });
      toast.success('Workflow created successfully');
      setShowCreateModal(false);
      resetForm();
      loadWorkflows();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create workflow');
    }
  };

  // Handle create from template
  const handleCreateFromTemplate = async (template: WorkflowTemplate) => {
    try {
      await workflowsAPI.create({
        name: template.name,
        description: template.description,
        version: '1.0.0',
        definition: template.definition,
        status: 'DRAFT',
      });
      toast.success(`Workflow created from template: ${template.name}`);
      loadWorkflows();
      setActiveTab('workflows');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create workflow from template');
    }
  };

  // Handle publish
  const handlePublish = async (id: string) => {
    try {
      await workflowsAPI.publish(id);
      toast.success('Workflow published successfully');
      loadWorkflows();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish workflow');
    }
  };

  // Handle execute
  const handleExecute = async () => {
    if (!selectedWorkflow) return;

    try {
      let variables;
      try {
        variables = JSON.parse(executeVariables);
      } catch {
        toast.error('Invalid JSON in execution variables');
        return;
      }

      await workflowsAPI.execute(selectedWorkflow.id, variables);
      toast.success('Workflow execution started');
      setShowExecuteModal(false);
      setExecuteVariables('{}');
      if (activeTab === 'executions') {
        loadExecutions(selectedWorkflow.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute workflow');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await workflowsAPI.delete(id);
      toast.success('Workflow deleted successfully');
      loadWorkflows();
      if (selectedWorkflow?.id === id) {
        setSelectedWorkflow(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete workflow');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      version: '1.0.0',
      definition: '{}',
      status: 'DRAFT',
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      ARCHIVED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return colors[status] || colors.DRAFT;
  };

  // Get execution status badge color
  const getExecutionStatusBadgeClass = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      RUNNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || colors.PENDING;
  };

  if (loading && workflows.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Read-only badge for non-workflow-admins */}
      {!canManageWorkflows && (
        <ReadOnlyBadge 
          message="You have read-only access to workflows" 
          showContact 
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Builder</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Design, publish, and manage automated workflows
          </p>
        </div>
        
        {/* New Workflow button - Admin/WorkflowAdmin only */}
        <WorkflowAdminOnly fallback={
          <DisabledButton 
            requiredRole="Workflow Admin"
            tooltip="Only workflow administrators can create workflows"
            showContact
          >
            <PlusIcon />
            New Workflow
          </DisabledButton>
        }>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            New Workflow
          </button>
        </WorkflowAdminOnly>
      </div>

      {/* System Status */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              {systemStatus.healthy ? (
                <CheckCircleIcon className="text-green-500" />
              ) : (
                <XCircleIcon className="text-red-500" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">System Status</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {systemStatus.healthy ? 'Healthy' : 'Unhealthy'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Workflows</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {systemStatus.activeWorkflows || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Queued Tasks</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {systemStatus.queuedTasks || 0}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertIcon />
            <span>{error}</span>
          </div>
          <button
            onClick={loadWorkflows}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('workflows')}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'workflows'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Workflows ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Templates ({templates.length})
          </button>
          {selectedWorkflow && (
            <>
              <button
                onClick={() => setActiveTab('executions')}
                className={cn(
                  'px-4 py-2 font-medium border-b-2 transition-colors',
                  activeTab === 'executions'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                Executions
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  'px-4 py-2 font-medium border-b-2 transition-colors',
                  activeTab === 'analytics'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                Analytics
              </button>
            </>
          )}
        </div>
      </div>

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <TemplateIcon />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Workflows</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first workflow or use a template
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <PlusIcon />
                  New Workflow
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors inline-flex items-center gap-2"
                >
                  <TemplateIcon />
                  Browse Templates
                </button>
              </div>
            </div>
          ) : (
            workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={cn(
                  'bg-white dark:bg-gray-800 rounded-lg border p-6 transition-colors cursor-pointer',
                  selectedWorkflow?.id === workflow.id
                    ? 'border-blue-500 dark:border-blue-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                )}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {workflow.name}
                      </h3>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getStatusBadgeClass(workflow.status))}>
                        {workflow.status}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        v{workflow.version}
                      </span>
                      {workflow.isActive && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Active
                        </span>
                      )}
                    </div>
                    {workflow.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{workflow.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <ClockIcon />
                        <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Execute Button - Workflow Admin Only */}
                    {workflow.status === 'PUBLISHED' && (
                      <WorkflowAdminOnly fallback={
                        <button
                          disabled
                          className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                          title="Only workflow administrators can execute workflows"
                        >
                          <PlayIcon />
                        </button>
                      }>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkflow(workflow);
                            setShowExecuteModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Execute Workflow"
                        >
                          <PlayIcon />
                        </button>
                      </WorkflowAdminOnly>
                    )}
                    
                    {/* Publish Button - Workflow Admin Only */}
                    {workflow.status === 'DRAFT' && (
                      <WorkflowAdminOnly fallback={
                        <button
                          disabled
                          className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                          title="Only workflow administrators can publish workflows"
                        >
                          <CheckCircleIcon />
                        </button>
                      }>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublish(workflow.id);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Publish Workflow"
                        >
                          <CheckCircleIcon />
                        </button>
                      </WorkflowAdminOnly>
                    )}
                    
                    {/* Delete Button - Admin Only */}
                    <AdminOnly fallback={
                      <button
                        disabled
                        className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                        title="Only administrators can delete workflows"
                      >
                        <TrashIcon />
                      </button>
                    }>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(workflow.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Workflow"
                      >
                        <TrashIcon />
                      </button>
                    </AdminOnly>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TemplateIcon className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{template.category}</span>
                </div>
              </div>
              {template.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
              )}
              <button
                onClick={() => handleCreateFromTemplate(template)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <PlusIcon />
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Executions Tab */}
      {activeTab === 'executions' && selectedWorkflow && (
        <div className="space-y-4">
          {executions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">No executions yet</p>
            </div>
          ) : (
            executions.map((execution) => (
              <div
                key={execution.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getExecutionStatusBadgeClass(execution.status))}>
                        {execution.status}
                      </span>
                      {execution.currentStep && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Current step: {execution.currentStep}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <ClockIcon />
                        <span>Started {new Date(execution.createdAt).toLocaleString()}</span>
                      </div>
                      {execution.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircleIcon />
                          <span>Completed {new Date(execution.completedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && selectedWorkflow && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Executions</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.totalExecutions}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Successful</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analytics.successfulExecutions}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Failed</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {analytics.failedExecutions}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg. Execution Time</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(analytics.avgExecutionTime / 1000)}s
              </div>
            </div>
          </div>
          {analytics.lastExecutionAt && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Last Execution</div>
              <div className="text-gray-900 dark:text-white">
                {new Date(analytics.lastExecutionAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Workflow</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Definition (JSON) *
                </label>
                <textarea
                  value={formData.definition}
                  onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder='{"steps": [], "triggers": []}'
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name || !formData.definition}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execute Modal */}
      {showExecuteModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Execute Workflow: {selectedWorkflow.name}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Execution Variables (JSON)
                </label>
                <textarea
                  value={executeVariables}
                  onChange={(e) => setExecuteVariables(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowExecuteModal(false);
                  setExecuteVariables('{}');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlayIcon />
                Execute Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilderPage;
