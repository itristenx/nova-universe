import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  NodeTypes,
  Position,
  Handle,
} from 'reactflow';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  UserIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

import 'reactflow/dist/style.css';

// Node Types
interface ServiceNodeData {
  label: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  fields?: Array<{
    id: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'textarea';
    required?: boolean;
    options?: string[];
    value?: any;
  }>;
}

interface ApprovalNodeData {
  label: string;
  approver: string;
  condition?: string;
}

interface FormNodeData {
  label: string;
  fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'textarea';
    required?: boolean;
    options?: string[];
    value?: any;
  }>;
}

// Custom Node Components
function ServiceNode({ data, selected }: { data: ServiceNodeData; selected: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 px-4 py-3 shadow-lg transition-all',
        selected
          ? 'border-nova-500 bg-nova-50 dark:bg-nova-900/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
      )}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3" />

      <div className="flex min-w-[200px] items-center gap-3">
        <div className="text-nova-600 dark:text-nova-400 flex-shrink-0">{data.icon}</div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{data.label}</h4>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{data.description}</p>
          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {data.category}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3 w-3" />
    </div>
  );
}

function ApprovalNode({ data, selected }: { data: ApprovalNodeData; selected: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 px-4 py-3 shadow-lg transition-all',
        selected
          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
      )}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3" />

      <div className="flex min-w-[200px] items-center gap-3">
        <div className="flex-shrink-0 text-amber-600 dark:text-amber-400">
          <ShieldCheckIcon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{data.label}</h4>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Approver: {data.approver}</p>
          <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            Approval Required
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3 w-3" />
    </div>
  );
}

function FormNode({ data, selected }: { data: FormNodeData; selected: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 px-4 py-3 shadow-lg transition-all',
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
      )}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3" />

      <div className="flex min-w-[200px] items-center gap-3">
        <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
          <DocumentTextIcon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{data.label}</h4>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {data.fields.length} fields
          </p>
          <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Form Input
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3 w-3" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  service: ServiceNode,
  approval: ApprovalNode,
  form: FormNode,
};

// Service Templates
const serviceTemplates = [
  {
    id: 'new-user',
    type: 'service',
    category: 'User Management',
    icon: <UserIcon className="h-5 w-5" />,
    label: 'New User Account',
    description: 'Create a new user account with appropriate access',
    fields: [
      { id: 'firstName', label: 'First Name', type: 'text' as const, required: true },
      { id: 'lastName', label: 'Last Name', type: 'text' as const, required: true },
      { id: 'email', label: 'Email Address', type: 'text' as const, required: true },
      {
        id: 'department',
        label: 'Department',
        type: 'select' as const,
        required: true,
        options: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'],
      },
      {
        id: 'role',
        label: 'Role',
        type: 'select' as const,
        required: true,
        options: ['Employee', 'Manager', 'Director', 'Admin'],
      },
    ],
  },
  {
    id: 'software-install',
    type: 'service',
    category: 'Software',
    icon: <ComputerDesktopIcon className="h-5 w-5" />,
    label: 'Software Installation',
    description: 'Request software installation on your device',
    fields: [
      { id: 'software', label: 'Software Name', type: 'text' as const, required: true },
      { id: 'version', label: 'Version', type: 'text' as const },
      {
        id: 'justification',
        label: 'Business Justification',
        type: 'textarea' as const,
        required: true,
      },
      {
        id: 'urgency',
        label: 'Urgency',
        type: 'select' as const,
        required: true,
        options: ['Low', 'Medium', 'High', 'Critical'],
      },
    ],
  },
  {
    id: 'hardware-request',
    type: 'service',
    category: 'Hardware',
    icon: <DevicePhoneMobileIcon className="h-5 w-5" />,
    label: 'Hardware Request',
    description: 'Request new hardware or equipment',
    fields: [
      {
        id: 'type',
        label: 'Hardware Type',
        type: 'select' as const,
        required: true,
        options: ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Tablet', 'Other'],
      },
      { id: 'specifications', label: 'Specifications', type: 'textarea' as const },
      {
        id: 'justification',
        label: 'Business Justification',
        type: 'textarea' as const,
        required: true,
      },
    ],
  },
  {
    id: 'access-request',
    type: 'service',
    category: 'Access',
    icon: <ShieldCheckIcon className="h-5 w-5" />,
    label: 'Access Request',
    description: 'Request access to systems or resources',
    fields: [
      { id: 'system', label: 'System/Resource', type: 'text' as const, required: true },
      {
        id: 'accessType',
        label: 'Access Type',
        type: 'select' as const,
        required: true,
        options: ['Read', 'Write', 'Admin', 'Full Control'],
      },
      {
        id: 'justification',
        label: 'Business Justification',
        type: 'textarea' as const,
        required: true,
      },
    ],
  },
  {
    id: 'maintenance',
    type: 'service',
    category: 'Maintenance',
    icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
    label: 'System Maintenance',
    description: 'Schedule system maintenance or updates',
    fields: [
      { id: 'system', label: 'System', type: 'text' as const, required: true },
      {
        id: 'type',
        label: 'Maintenance Type',
        type: 'select' as const,
        required: true,
        options: ['Update', 'Patch', 'Optimization', 'Backup', 'Other'],
      },
      { id: 'scheduledDate', label: 'Preferred Date', type: 'text' as const },
      { id: 'impact', label: 'Expected Impact', type: 'textarea' as const },
    ],
  },
  {
    id: 'cloud-service',
    type: 'service',
    category: 'Cloud',
    icon: <CloudIcon className="h-5 w-5" />,
    label: 'Cloud Service',
    description: 'Request cloud resources or services',
    fields: [
      {
        id: 'service',
        label: 'Cloud Service',
        type: 'select' as const,
        required: true,
        options: ['AWS EC2', 'Azure VM', 'Google Cloud', 'Storage', 'Database', 'Other'],
      },
      { id: 'specifications', label: 'Specifications', type: 'textarea' as const, required: true },
      {
        id: 'duration',
        label: 'Duration Needed',
        type: 'select' as const,
        required: true,
        options: ['1 week', '1 month', '3 months', '6 months', '1 year', 'Permanent'],
      },
    ],
  },
];

interface VisualRequestBuilderProps {
  className?: string;
  onSave?: (workflow: { nodes: Node[]; edges: Edge[] }) => void;
  onPreview?: (workflow: { nodes: Node[]; edges: Edge[] }) => void;
}

export function VisualRequestBuilder({ className, onSave, onPreview }: VisualRequestBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = useCallback(
    (template: any) => {
      const newNode: Node = {
        id: `${template.id}-${Date.now()}`,
        type: template.type,
        position: { x: Math.random() * 400, y: Math.random() * 300 },
        data: {
          label: template.label,
          category: template.category,
          icon: template.icon,
          description: template.description,
          fields: template.fields || [],
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  const addApprovalNode = useCallback(() => {
    const newNode: Node = {
      id: `approval-${Date.now()}`,
      type: 'approval',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        label: 'Approval Step',
        approver: 'Manager',
        condition: 'Required for all requests',
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const addFormNode = useCallback(() => {
    const newNode: Node = {
      id: `form-${Date.now()}`,
      type: 'form',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        label: 'Information Form',
        fields: [
          { id: 'description', label: 'Description', type: 'textarea' as const, required: true },
          {
            id: 'priority',
            label: 'Priority',
            type: 'select' as const,
            options: ['Low', 'Medium', 'High', 'Critical'],
          },
        ],
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const handleSave = useCallback(() => {
    onSave?.({ nodes, edges });
  }, [nodes, edges, onSave]);

  const handlePreview = useCallback(() => {
    onPreview?.({ nodes, edges });
  }, [nodes, edges, onPreview]);

  const categories = useMemo(() => {
    const cats = [...new Set(serviceTemplates.map((t) => t.category))];
    return cats;
  }, []);

  return (
    <div
      className={cn(
        'flex h-[600px] rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900',
        className,
      )}
    >
      {/* Sidebar */}
      {showSidebar && (
        <div className="flex w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Visual Request Builder</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Drag and drop to build workflows
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Quick Actions */}
            <div>
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Quick Add</h4>
              <div className="space-y-2">
                <button
                  onClick={addFormNode}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10"
                >
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Information Form
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Collect user input</p>
                  </div>
                </button>

                <button
                  onClick={addApprovalNode}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-50 dark:border-gray-700 dark:hover:border-amber-600 dark:hover:bg-amber-900/10"
                >
                  <ShieldCheckIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Approval Step
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Require approval</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Service Templates */}
            <div>
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Service Templates</h4>

              {categories.map((category) => (
                <div key={category} className="mb-4">
                  <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category}
                  </h5>
                  <div className="space-y-2">
                    {serviceTemplates
                      .filter((template) => template.category === category)
                      .map((template) => (
                        <button
                          key={template.id}
                          onClick={() => addNode(template)}
                          className="hover:border-nova-300 dark:hover:border-nova-600 hover:bg-nova-50 dark:hover:bg-nova-900/10 flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors dark:border-gray-700"
                        >
                          <div className="text-nova-600 dark:text-nova-400">{template.icon}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {template.label}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {template.description}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              onClick={handlePreview}
              disabled={nodes.length === 0}
              className="bg-nova-600 hover:bg-nova-700 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlayIcon className="h-4 w-4" />
              Preview Workflow
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={nodes.length === 0}
                className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>

              <button
                onClick={clearWorkflow}
                className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                title="Clear workflow"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
        >
          <Background color="#6B7280" gap={20} />
          <Controls />
        </ReactFlow>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute top-4 left-4 z-10 rounded-lg border border-gray-200 bg-white p-2 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
        >
          <CogIcon className="h-5 w-5" />
        </button>

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <PlusIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Build Your Request Workflow
              </h3>
              <p className="max-w-sm text-gray-600 dark:text-gray-400">
                Start by adding service templates, forms, or approval steps from the sidebar.
                Connect them together to create your custom workflow.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
