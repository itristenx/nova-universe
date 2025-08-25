// Nova Workflow Builder - Simplified Visual Designer
// ServiceNow-style workflow automation builder without external dependencies

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Workflow } from '../../types/workflow';
import './WorkflowBuilder.css';

const WorkflowBuilder = ({
  workflow,
  onSave,
  onExecute,
  onPublish,
}: {
  workflow?: Workflow;
  onSave: (workflow: Workflow) => void;
  onExecute: (workflowId: string) => void;
  onPublish: (workflowId: string) => void;
}) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNodeType, setDraggedNodeType] = useState(null);
  const [workflowData, setWorkflowData] = useState({
    id: workflow?.id || '',
    name: workflow?.name || 'New Workflow',
    description: workflow?.description || '',
    version: workflow?.version || '1.0.0',
    status: workflow?.status || 'DRAFT',
    type: workflow?.type || 'PROCESS',
    category: workflow?.category || '',
    tags: workflow?.tags || [],
    canvas: workflow?.canvas || {},
    trigger: workflow?.trigger || null,
    variables: workflow?.variables || {},
    settings: workflow?.settings || {},
    createdBy: workflow?.createdBy || 'current-user',
    updatedBy: workflow?.updatedBy || null,
    createdAt: workflow?.createdAt || new Date(),
    updatedAt: workflow?.updatedAt || new Date(),
    publishedAt: workflow?.publishedAt || null,
    archivedAt: workflow?.archivedAt || null,
    nodes: workflow?.nodes || [],
    connections: workflow?.connections || [],
  });

  const canvasRef = useRef(null);

  // Update node positions in the DOM
  useEffect(() => {
    nodes.forEach((node) => {
      const element = document.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
      if (element) {
        element.style.left = `${node.position.x}px`;
        element.style.top = `${node.position.y}px`;
      }
    });
  }, [nodes]);

  const nodeTypes = [
    { type: 'TRIGGER', label: 'Trigger', icon: '▶️', color: '#10b981' },
    { type: 'ACTION', label: 'Action', icon: '⚡', color: '#3b82f6' },
    { type: 'CONDITION', label: 'Condition', icon: '❓', color: '#f59e0b' },
    { type: 'INTEGRATION', label: 'Integration', icon: '🔗', color: '#8b5cf6' },
    { type: 'APPROVAL', label: 'Approval', icon: '✅', color: '#ef4444' },
    { type: 'DECISION', label: 'Decision', icon: '🎯', color: '#06b6d4' },
    { type: 'NOTIFICATION', label: 'Notification', icon: '📧', color: '#84cc16' },
    { type: 'DELAY', label: 'Delay', icon: '⏰', color: '#6b7280' },
    { type: 'END', label: 'End', icon: '🏁', color: '#6b7280' },
  ];

  const handleDragStart = useCallback((nodeType) => {
    setDraggedNodeType(nodeType);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!draggedNodeType || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newNode = {
        id: `node-${Date.now()}`,
        type: draggedNodeType,
        label: `${draggedNodeType} Node`,
        position: { x, y },
        data: {},
      };

      setNodes((prev) => [...prev, newNode]);
      setDraggedNodeType(null);
    },
    [draggedNodeType],
  );

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDelete = useCallback((nodeId) => {
    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    setConnections((prev) =>
      prev.filter((conn) => conn.sourceId !== nodeId && conn.targetId !== nodeId),
    );
    setSelectedNode(null);
  }, []);

  const handleNodeUpdate = useCallback(
    (nodeId, updates) => {
      setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)));
      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [selectedNode],
  );

  const handleSaveWorkflow = useCallback(() => {
    const updatedWorkflow = {
      ...workflowData,
      canvas: { nodes, connections },
      updatedAt: new Date(),
    };
    onSave(updatedWorkflow);
  }, [workflowData, nodes, connections, onSave]);

  const getNodeTypeInfo = (type) => {
    return nodeTypes.find((nt) => nt.type === type) || nodeTypes[0];
  };

  return (
    <div className="workflow-builder">
      {/* Toolbar */}
      <div className="workflow-builder__toolbar">
        <div className="toolbar-section">
          <h2>{workflowData.name}</h2>
          <span className={`status-badge status-${workflowData.status.toLowerCase()}`}>
            {workflowData.status}
          </span>
        </div>
        <div className="toolbar-section">
          <button className="btn btn-primary" onClick={handleSaveWorkflow}>
            💾 Save
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onExecute(workflowData.id)}
            disabled={!workflowData.id}
          >
            ▶️ Execute
          </button>
          <button
            className="btn btn-success"
            onClick={() => onPublish(workflowData.id)}
            disabled={!workflowData.id || workflowData.status === 'PUBLISHED'}
          >
            📤 Publish
          </button>
        </div>
      </div>

      <div className="workflow-builder__content">
        {/* Sidebar with node palette */}
        <div className="workflow-builder__sidebar">
          <h3>Node Palette</h3>
          <div className="node-palette">
            {nodeTypes.map((nodeType) => (
              <div
                key={nodeType.type}
                className={`palette-node node-type-${nodeType.type.toLowerCase()}`}
                draggable
                onDragStart={() => handleDragStart(nodeType.type)}
              >
                <span className="node-icon">{nodeType.icon}</span>
                <span className="node-label">{nodeType.label}</span>
              </div>
            ))}
          </div>

          {/* Workflow Info */}
          <div className="workflow-info">
            <h4>Workflow Info</h4>
            <div className="info-item">
              <label htmlFor="workflow-name">Name:</label>
              <input
                id="workflow-name"
                type="text"
                value={workflowData.name}
                onChange={(e) => setWorkflowData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
              />
            </div>
            <div className="info-item">
              <label htmlFor="workflow-description">Description:</label>
              <textarea
                id="workflow-description"
                value={workflowData.description || ''}
                onChange={(e) =>
                  setWorkflowData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter workflow description"
              />
            </div>
            <div className="info-item">
              <label htmlFor="workflow-type">Type:</label>
              <select
                id="workflow-type"
                value={workflowData.type}
                onChange={(e) => setWorkflowData((prev) => ({ ...prev, type: e.target.value }))}
                title="Select workflow type"
              >
                <option value="PROCESS">Process</option>
                <option value="INTEGRATION">Integration</option>
                <option value="AUTOMATION">Automation</option>
                <option value="APPROVAL">Approval</option>
                <option value="NOTIFICATION">Notification</option>
                <option value="DECISION">Decision</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main canvas */}
        <div
          className="workflow-builder__canvas"
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="canvas-grid">
            {/* Grid lines */}
            <svg className="grid-svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Render nodes */}
            {nodes.map((node) => {
              const nodeInfo = getNodeTypeInfo(node.type);
              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className={`canvas-node ${selectedNode?.id === node.id ? 'selected' : ''} node-type-${node.type.toLowerCase()}`}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="node-header">
                    <span className="node-icon">{nodeInfo.icon}</span>
                    <span className="node-title">{node.label}</span>
                  </div>
                  <div className="node-ports">
                    <div className="input-port"></div>
                    <div className="output-port"></div>
                  </div>
                </div>
              );
            })}

            {/* Render connections */}
            {connections.map((connection) => {
              const sourceNode = nodes.find((n) => n.id === connection.sourceId);
              const targetNode = nodes.find((n) => n.id === connection.targetId);

              if (!sourceNode || !targetNode) return null;

              const sourceX = sourceNode.position.x + 90; // Center of node
              const sourceY = sourceNode.position.y + 25;
              const targetX = targetNode.position.x + 90;
              const targetY = targetNode.position.y + 25;

              return (
                <svg key={connection.id} className="connection-svg">
                  <path
                    d={`M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY} ${targetX - 50} ${targetY} ${targetX} ${targetY}`}
                    stroke="#6b7280"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                    </marker>
                  </defs>
                </svg>
              );
            })}
          </div>
        </div>

        {/* Properties panel */}
        {selectedNode && (
          <div className="workflow-builder__properties">
            <h3>Node Properties</h3>
            <div className="property-group">
              <label htmlFor="node-label">Label:</label>
              <input
                id="node-label"
                type="text"
                value={selectedNode.label}
                onChange={(e) => handleNodeUpdate(selectedNode.id, { label: e.target.value })}
                placeholder="Enter node label"
              />
            </div>
            <div className="property-group">
              <label>Type:</label>
              <span>{selectedNode.type}</span>
            </div>
            <div className="property-actions">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleNodeDelete(selectedNode.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
