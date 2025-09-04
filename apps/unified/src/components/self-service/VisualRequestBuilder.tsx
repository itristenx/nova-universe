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
      
      // Set the selected template for visual feedback and provide analytics
      setSelectedTemplate(template.id);
      
      // Analytics tracking for template usage
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'template_used', {
          event_category: 'workflow_builder',
          event_label: 'template_selection',
          template_id: template.id,
          template_category: template.category,
          template_label: template.label,
          workflow_node_count: nodes.length + 1,
        });
      }
      
      // Enterprise monitoring for workflow complexity
      if (typeof window !== 'undefined' && (window as any).NovaMonitoring) {
        (window as any).NovaMonitoring.recordEvent('workflow_template_added', {
          templateId: template.id,
          category: template.category,
          currentNodeCount: nodes.length + 1,
          workflowComplexity: nodes.length > 5 ? 'complex' : nodes.length > 2 ? 'moderate' : 'simple',
        });
      }
    },
    [setNodes, nodes.length],
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
    setSelectedTemplate('approval-step');
    
    // Analytics tracking for approval node addition
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quick_action_used', {
        event_category: 'workflow_builder',
        event_label: 'approval_node_added',
        workflow_node_count: nodes.length + 1,
      });
    }
  }, [setNodes, nodes.length]);

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
    setSelectedTemplate('information-form');
    
    // Analytics tracking for form node addition
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quick_action_used', {
        event_category: 'workflow_builder',
        event_label: 'form_node_added',
        workflow_node_count: nodes.length + 1,
      });
    }
  }, [setNodes, nodes.length]);

  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedTemplate(null);
    
    // Analytics tracking for workflow clearing
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'workflow_cleared', {
        event_category: 'workflow_builder',
        event_label: 'clear_workflow',
        previous_node_count: nodes.length,
        previous_edge_count: edges.length,
      });
    }
  }, [setNodes, setEdges, nodes.length, edges.length]);

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
            {selectedTemplate && (
              <div className="mt-2 flex items-center gap-2 rounded-md bg-nova-50 px-2 py-1 dark:bg-nova-900/20">
                <div className="h-2 w-2 rounded-full bg-nova-500"></div>
                <span className="text-xs font-medium text-nova-700 dark:text-nova-300">
                  Last used: {serviceTemplates.find(t => t.id === selectedTemplate)?.label}
                </span>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-nova-600 hover:text-nova-800 dark:text-nova-400 dark:hover:text-nova-200"
                  title="Clear selection"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
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

              {categories.map((category, categoryIndex) => (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                >
                  <div className="mb-4">
                    <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category}
                    </h5>
                    <div className="space-y-2">
                      {serviceTemplates
                        .filter((template) => template.category === category)
                        .map((template, templateIndex) => (
                          <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: (categoryIndex * 0.1) + (templateIndex * 0.05) }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button
                              onClick={() => addNode(template)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                                selectedTemplate === template.id
                                  ? 'border-nova-500 bg-nova-50 dark:border-nova-400 dark:bg-nova-900/20'
                                  : 'border-gray-200 hover:border-nova-300 hover:bg-nova-50 dark:border-gray-700 dark:hover:border-nova-600 dark:hover:bg-nova-900/10'
                              )}
                            >
                              <div className={cn(
                                'transition-colors',
                                selectedTemplate === template.id
                                  ? 'text-nova-700 dark:text-nova-300'
                                  : 'text-nova-600 dark:text-nova-400'
                              )}>
                                {template.icon}
                              </div>
                              <div className="flex-1">
                                <p className={cn(
                                  'text-sm font-medium transition-colors',
                                  selectedTemplate === template.id
                                    ? 'text-nova-900 dark:text-nova-100'
                                    : 'text-gray-900 dark:text-white'
                                )}>
                                  {template.label}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {template.description}
                                </p>
                              </div>
                              {selectedTemplate === template.id && (
                                <div className="text-nova-600 dark:text-nova-400">
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </motion.div>
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
