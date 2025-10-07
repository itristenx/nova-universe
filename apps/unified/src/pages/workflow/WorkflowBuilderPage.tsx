import React, { useState } from 'react';
import {
  Play,
  Save,
  Download,
  Upload,
  Settings,
  Zap,
  GitBranch,
  Clock,
  Check,
  X,
  Plus,
  Trash2,
  Copy,
  Eye,
  Code,
  FileText,
  AlertCircle,
} from 'lucide-react';
import SimpleWorkflowBuilder from '@components/workflow/SimpleWorkflowBuilder';

// Types
interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive';
  trigger: string;
  nodeCount: number;
  lastModified: string;
  createdBy: string;
}

const WorkflowBuilderPage: React.FC = () => {
  // State
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [showWorkflowList, setShowWorkflowList] = useState(true);

  // Sample Workflows
  const workflows: Workflow[] = [
    {
      id: 'wf-001',
      name: 'Ticket Auto-Assignment',
      description: 'Automatically assign incoming tickets based on category and priority',
      status: 'active',
      trigger: 'Ticket Created',
      nodeCount: 8,
      lastModified: '2025-01-26T10:30:00Z',
      createdBy: 'Sarah Johnson',
    },
    {
      id: 'wf-002',
      name: 'Escalation Manager',
      description: 'Escalate tickets after SLA threshold is breached',
      status: 'active',
      trigger: 'SLA Warning',
      nodeCount: 12,
      lastModified: '2025-01-25T14:20:00Z',
      createdBy: 'Mike Chen',
    },
    {
      id: 'wf-003',
      name: 'Change Approval Workflow',
      description: 'Route change requests through approval chain',
      status: 'active',
      trigger: 'Change Request Submitted',
      nodeCount: 15,
      lastModified: '2025-01-24T09:15:00Z',
      createdBy: 'David Park',
    },
    {
      id: 'wf-004',
      name: 'Asset Onboarding',
      description: 'Automate asset discovery and CMDB updates',
      status: 'draft',
      trigger: 'Asset Detected',
      nodeCount: 6,
      lastModified: '2025-01-26T08:00:00Z',
      createdBy: 'Emma Wilson',
    },
  ];

  const handleNewWorkflow = () => {
    setSelectedWorkflow(null);
    setWorkflowName('New Workflow');
    setWorkflowDescription('');
    setShowWorkflowList(false);
  };

  const handleLoadWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description);
    setShowWorkflowList(false);
  };

  const handleSaveWorkflow = (workflow: any) => {
    // TODO: Implement save functionality
    console.log('Saving workflow:', workflow);
  };

  const handleExecuteWorkflow = (workflowId: string) => {
    console.log('Executing workflow:', workflowId);
  };

  const handlePublishWorkflow = (workflowId: string) => {
    console.log('Publishing workflow:', workflowId);
  };

  const handleTestWorkflow = () => {
    setIsTestMode(!isTestMode);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Workflow Builder
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Design and automate your business processes with visual workflows
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!showWorkflowList && (
              <>
                <button
                  onClick={() => setShowWorkflowList(true)}
                  className="flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800"
                  aria-label="Show workflow list"
                >
                  <FileText className="h-5 w-5" />
                  My Workflows
                </button>

                <button
                  onClick={handleTestWorkflow}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
                    isTestMode
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white/70 backdrop-blur-xl hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800'
                  }`}
                  aria-label="Toggle test mode"
                >
                  <Play className="h-5 w-5" />
                  {isTestMode ? 'Stop Test' : 'Test Run'}
                </button>

                <button
                  onClick={handleSaveWorkflow}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 font-medium text-white shadow-lg transition-all hover:shadow-xl"
                  aria-label="Save workflow"
                >
                  <Save className="h-5 w-5" />
                  Save Workflow
                </button>
              </>
            )}

            {showWorkflowList && (
              <button
                onClick={handleNewWorkflow}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
                aria-label="Create new workflow"
              >
                <Plus className="h-5 w-5" />
                New Workflow
              </button>
            )}
          </div>
        </div>

        {/* Workflow Info Bar (shown when editing) */}
        {!showWorkflowList && (
          <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full bg-transparent text-xl font-semibold focus:outline-none"
                  placeholder="Workflow Name"
                  aria-label="Workflow name"
                />
                <input
                  type="text"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-600 focus:outline-none dark:text-gray-400"
                  placeholder="Add a description..."
                  aria-label="Workflow description"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Download workflow"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  className="rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Upload workflow"
                >
                  <Upload className="h-5 w-5" />
                </button>
                <button
                  className="rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Workflow settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  className="rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Copy workflow"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  className="rounded-lg p-2 text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label="Delete workflow"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {showWorkflowList ? (
        /* Workflow List */
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
            <h2 className="mb-4 text-xl font-semibold">My Workflows</h2>
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white/50 p-4 transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900/50"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h3 className="font-semibold">{workflow.name}</h3>
                      <span className={`rounded-lg px-2 py-1 text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {workflow.trigger}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {workflow.nodeCount} nodes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(workflow.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadWorkflow(workflow)}
                      className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-500/20 dark:text-blue-400"
                      aria-label={`Edit workflow ${workflow.name}`}
                    >
                      <Eye className="h-4 w-4" />
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {workflows.filter((w) => w.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Workflows</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/10 p-3">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {workflows.filter((w) => w.status === 'draft').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Draft Workflows</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <GitBranch className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{workflows.reduce((sum, w) => sum + w.nodeCount, 0)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started Guide */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-6 backdrop-blur-xl dark:border-blue-900 dark:bg-blue-900/20">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Getting Started with Workflows</h3>
            </div>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>Click "New Workflow" to create a visual automation</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>Drag and drop nodes to build your workflow logic</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>Configure triggers, conditions, and actions for each node</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span>Test your workflow before activating it in production</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /* Workflow Builder Canvas */
        <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
          {isTestMode && (
            <div className="border-b border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-900/20">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-100">
                <Play className="h-4 w-4" />
                Test Mode Active - Workflow will not affect production data
              </div>
            </div>
          )}
          <div className="p-6">
            <SimpleWorkflowBuilder
              onSave={handleSaveWorkflow}
              onExecute={handleExecuteWorkflow}
              onPublish={handlePublishWorkflow}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilderPage;
