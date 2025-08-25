import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
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
  EdgeTypes,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useRBACStore } from '../stores/rbacStore';
import type { ApprovalFlow, ApprovalStep, ApprovalCondition } from '../types/rbac';

// Custom node types for workflow builder
interface WorkflowNodeData {
  id: string;
  label: string;
  type: 'start' | 'approval' | 'condition' | 'action' | 'end';
  config?: any;
  description?: string;
  assignee?: string;
  conditions?: ApprovalCondition[];
  timeout?: number;
  escalation?: string[];
}

// Start Node Component
const StartNode = ({ data }: { data: WorkflowNodeData }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="rounded-lg border-2 border-green-600 bg-green-500 px-4 py-3 text-white shadow-lg"
  >
    <div className="flex items-center space-x-2">
      <PlayIcon className="h-5 w-5" />
      <div className="font-medium">Start</div>
    </div>
    {data.description && <div className="mt-1 text-sm text-green-100">{data.description}</div>}
  </motion.div>
);

// Approval Node Component
const ApprovalNode = ({ data }: { data: WorkflowNodeData }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="min-w-[200px] rounded-lg border-2 border-blue-600 bg-blue-500 px-4 py-3 text-white shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <UserIcon className="h-5 w-5" />
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="flex space-x-1">
        <PencilIcon className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" />
        <EyeIcon className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" />
      </div>
    </div>
    {data.assignee && (
      <div className="mt-1 text-sm text-blue-100">Assigned to: {data.assignee}</div>
    )}
    {data.timeout && (
      <div className="mt-1 flex items-center text-xs text-blue-200">
        <ClockIcon className="mr-1 h-3 w-3" />
        Timeout: {data.timeout}h
      </div>
    )}
  </motion.div>
);

// Condition Node Component
const ConditionNode = ({ data }: { data: WorkflowNodeData }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="rounded-lg border-2 border-yellow-600 bg-yellow-500 px-4 py-3 text-white shadow-lg"
  >
    <div className="flex items-center space-x-2">
      <Cog6ToothIcon className="h-5 w-5" />
      <div className="font-medium">{data.label}</div>
    </div>
    {data.conditions && data.conditions.length > 0 && (
      <div className="mt-1 text-sm text-yellow-100">{data.conditions.length} condition(s)</div>
    )}
  </motion.div>
);

// Action Node Component
const ActionNode = ({ data }: { data: WorkflowNodeData }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="rounded-lg border-2 border-purple-600 bg-purple-500 px-4 py-3 text-white shadow-lg"
  >
    <div className="flex items-center space-x-2">
      <Cog6ToothIcon className="h-5 w-5" />
      <div className="font-medium">{data.label}</div>
    </div>
    {data.description && <div className="mt-1 text-sm text-purple-100">{data.description}</div>}
  </motion.div>
);

// End Node Component
const EndNode = ({ data }: { data: WorkflowNodeData }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="rounded-lg border-2 border-red-600 bg-red-500 px-4 py-3 text-white shadow-lg"
  >
    <div className="flex items-center space-x-2">
      <StopIcon className="h-5 w-5" />
      <div className="font-medium">End</div>
    </div>
    {data.description && <div className="mt-1 text-sm text-red-100">{data.description}</div>}
  </motion.div>
);

const nodeTypes: NodeTypes = {
  start: StartNode,
  approval: ApprovalNode,
  condition: ConditionNode,
  action: ActionNode,
  end: EndNode,
};

// Node Configuration Modal
interface NodeConfigModalProps {
  node: Node<WorkflowNodeData> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeData: Partial<WorkflowNodeData>) => void;
}

const NodeConfigModal: React.FC<NodeConfigModalProps> = ({ node, isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<Partial<WorkflowNodeData>>({});
  const { users, roles } = useRBACStore();

  React.useEffect(() => {
    if (node) {
      setConfig(node.data);
    }
  }, [node]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  if (!isOpen || !node) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl"
      >
        <div className="p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Configure {node.data.type} Node
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Label</label>
              <input
                type="text"
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={config.description || ''}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {node.data.type === 'approval' && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Assignee</label>
                  <select
                    value={config.assignee || ''}
                    onChange={(e) => setConfig({ ...config, assignee: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select assignee...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Timeout (hours)
                  </label>
                  <input
                    type="number"
                    value={config.timeout || ''}
                    onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {node.data.type === 'condition' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Conditions</label>
                <div className="text-sm text-gray-500">Condition configuration coming soon...</div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Main Visual Workflow Builder Component
interface VisualWorkflowBuilderProps {
  workflow?: ApprovalFlow;
  onSave: (workflow: Partial<ApprovalFlow>) => void;
  onCancel: () => void;
}

export const VisualWorkflowBuilder: React.FC<VisualWorkflowBuilderProps> = ({
  workflow,
  onSave,
  onCancel,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string>('approval');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);
  const [workflowName, setWorkflowName] = useState(workflow?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(workflow?.description || '');

  // Initialize workflow from existing data
  React.useEffect(() => {
    if (workflow && workflow.steps && workflow.steps.length > 0) {
      const workflowNodes: Node<WorkflowNodeData>[] = [];
      const workflowEdges: Edge[] = [];

      // Add start node
      workflowNodes.push({
        id: 'start',
        type: 'start',
        position: { x: 100, y: 100 },
        data: {
          id: 'start',
          label: 'Start',
          type: 'start',
          description: 'Workflow start',
        },
      });

      // Add approval steps as nodes
      workflow.steps.forEach((step, index) => {
        workflowNodes.push({
          id: step.id,
          type: 'approval',
          position: { x: 100 + (index + 1) * 250, y: 100 },
          data: {
            id: step.id,
            label: step.name,
            type: 'approval',
            description: step.description,
            assignee: step.assignee_type === 'user' ? step.assignee_id : undefined,
            timeout: step.timeout_hours,
          },
        });

        // Add edge from previous node
        const sourceId = index === 0 ? 'start' : workflow.steps[index - 1].id;
        workflowEdges.push({
          id: `${sourceId}-${step.id}`,
          source: sourceId,
          target: step.id,
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      });

      // Add end node
      workflowNodes.push({
        id: 'end',
        type: 'end',
        position: { x: 100 + (workflow.steps.length + 1) * 250, y: 100 },
        data: {
          id: 'end',
          label: 'End',
          type: 'end',
          description: 'Workflow end',
        },
      });

      // Add edge to end node
      if (workflow.steps.length > 0) {
        workflowEdges.push({
          id: `${workflow.steps[workflow.steps.length - 1].id}-end`,
          source: workflow.steps[workflow.steps.length - 1].id,
          target: 'end',
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      }

      setNodes(workflowNodes);
      setEdges(workflowEdges);
    } else {
      // Initialize with start and end nodes
      setNodes([
        {
          id: 'start',
          type: 'start',
          position: { x: 100, y: 100 },
          data: {
            id: 'start',
            label: 'Start',
            type: 'start',
            description: 'Workflow start',
          },
        },
        {
          id: 'end',
          type: 'end',
          position: { x: 400, y: 100 },
          data: {
            id: 'end',
            label: 'End',
            type: 'end',
            description: 'Workflow end',
          },
        },
      ]);
      setEdges([]);
    }
  }, [workflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNodeId = `${type}-${Date.now()}`;
      const newNode: Node<WorkflowNodeData> = {
        id: newNodeId,
        type,
        position,
        data: {
          id: newNodeId,
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Step`,
          type: type as any,
          description: `New ${type} step`,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node<WorkflowNodeData>) => {
    setSelectedNode(node);
    setConfigModalOpen(true);
  }, []);

  const handleNodeConfigSave = useCallback(
    (nodeData: Partial<WorkflowNodeData>) => {
      if (!selectedNode) return;

      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id ? { ...node, data: { ...node.data, ...nodeData } } : node,
        ),
      );
    },
    [selectedNode, setNodes],
  );

  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  const handleSaveWorkflow = () => {
    // Convert nodes and edges back to ApprovalFlow format
    const approvalNodes = nodes.filter((node) => node.data.type === 'approval');
    const steps: ApprovalStep[] = approvalNodes.map((node, index) => ({
      id: node.data.id,
      name: node.data.label,
      description: node.data.description || '',
      order: index + 1,
      assignee_type: node.data.assignee ? 'user' : 'role',
      assignee_id: node.data.assignee || '',
      timeout_hours: node.data.timeout || 24,
      escalation_users: node.data.escalation || [],
      conditions: node.data.conditions || [],
      required: true,
    }));

    const workflowData: Partial<ApprovalFlow> = {
      name: workflowName,
      description: workflowDescription,
      steps,
      active: true,
    };

    onSave(workflowData);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="max-w-md flex-1">
            <input
              type="text"
              placeholder="Workflow name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="block w-full border-none text-lg font-medium placeholder-gray-400 focus:ring-0 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="mt-1 block w-full border-none text-sm text-gray-600 placeholder-gray-400 focus:ring-0 focus:outline-none"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWorkflow}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Workflow
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white p-4">
          <h3 className="mb-4 text-sm font-medium text-gray-900">Components</h3>
          <div className="space-y-2">
            {[
              { type: 'approval', label: 'Approval Step', icon: UserIcon, color: 'blue' },
              { type: 'condition', label: 'Condition', icon: Cog6ToothIcon, color: 'yellow' },
              { type: 'action', label: 'Action', icon: CheckCircleIcon, color: 'purple' },
            ].map(({ type, label, icon: Icon, color }) => (
              <div
                key={type}
                draggable
                onDragStart={(event) => onDragStart(event, type)}
                className={`flex cursor-move items-center space-x-2 rounded-md p-2 bg-${color}-50 border border-${color}-200 hover:bg-${color}-100`}
              >
                <Icon className={`h-4 w-4 text-${color}-600`} />
                <span className={`text-sm font-medium text-${color}-700`}>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-4 text-sm font-medium text-gray-900">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={deleteSelectedNodes}
                className="flex w-full items-center space-x-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 hover:bg-red-100"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <Background />
            <Panel position="top-right">
              <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                <div className="text-xs text-gray-600">
                  Double-click nodes to configure • Drag from component palette to add
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      <NodeConfigModal
        node={selectedNode}
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSave={handleNodeConfigSave}
      />
    </div>
  );
};

export default VisualWorkflowBuilder;
