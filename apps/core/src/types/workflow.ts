// Nova Workflow Types for Frontend
// TypeScript interfaces for React components

export interface WorkflowExecutionInput {
  [key: string]: unknown;
}

export interface WorkflowNode {
  id: string;
  workflowId: string;
  nodeId: string;
  type: NodeType;
  category: string;
  name: string;
  description?: string;
  position: NodePosition;
  dimensions?: NodeDimensions;
  styling: Record<string, unknown>;
  config: Record<string, unknown>;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  errorHandling?: Record<string, unknown>;
  timeout?: number;
  retryPolicy?: Record<string, unknown>;
  isActive: boolean;
  executionCount: number;
  lastExecuted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowConnection {
  id: string;
  workflowId: string;
  connectionId: string;
  fromNodeId: string;
  fromPort?: string;
  toNodeId: string;
  toPort?: string;
  label?: string;
  conditions?: Record<string, unknown>;
  priority: number;
  styling: Record<string, unknown>;
  isActive: boolean;
  executionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: WorkflowStatus;
  type: WorkflowType;
  category?: string;
  tags: string[];
  canvas: Record<string, unknown>;
  trigger?: Record<string, unknown>;
  variables: Record<string, unknown>;
  settings: Record<string, unknown>;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeDimensions {
  width: number;
  height: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface WorkflowCreateData {
  name: string;
  description?: string;
  type?: WorkflowType;
  category?: string;
  tags?: string[];
  canvas?: Record<string, unknown>;
  trigger?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  createdBy: string;
}

export interface WorkflowUpdateData {
  name?: string;
  description?: string;
  canvas?: Record<string, unknown>;
  trigger?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  updatedBy: string;
}

// Enums
export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
  DEPRECATED = 'DEPRECATED',
}

export enum WorkflowType {
  PROCESS = 'PROCESS',
  INTEGRATION = 'INTEGRATION',
  AUTOMATION = 'AUTOMATION',
  APPROVAL = 'APPROVAL',
  NOTIFICATION = 'NOTIFICATION',
  DECISION = 'DECISION',
  SCHEDULED = 'SCHEDULED',
}

export enum NodeType {
  TRIGGER = 'TRIGGER',
  ACTION = 'ACTION',
  CONDITION = 'CONDITION',
  LOOP = 'LOOP',
  PARALLEL = 'PARALLEL',
  SEQUENTIAL = 'SEQUENTIAL',
  DECISION = 'DECISION',
  INTEGRATION = 'INTEGRATION',
  NOTIFICATION = 'NOTIFICATION',
  APPROVAL = 'APPROVAL',
  DELAY = 'DELAY',
  SCRIPT = 'SCRIPT',
  FORM = 'FORM',
  API_CALL = 'API_CALL',
  DATABASE = 'DATABASE',
  FILE_OPERATION = 'FILE_OPERATION',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WEBHOOK = 'WEBHOOK',
  TRANSFORMATION = 'TRANSFORMATION',
  VALIDATION = 'VALIDATION',
  END = 'END',
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
  TIMEOUT = 'TIMEOUT',
  RETRY = 'RETRY',
}

export enum ExecutionPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

// React component props
export interface NodeComponentProps {
  data: {
    label: string;
    description?: string;
    config: Record<string, unknown>;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    nodeType: NodeType;
    category: string;
  };
  isConnectable: boolean;
  selected?: boolean;
}

export interface WorkflowToolbarProps {
  workflow: Workflow;
  onSave: () => void;
  onExecute: () => void;
  onPublish: () => void;
  onSettings: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}

export interface WorkflowNodeFormProps {
  node: any; // ReactFlow Node type
  onClose: () => void;
  onUpdate: (nodeId: string, updates: any) => void;
  onDelete: (nodeId: string) => void;
}

export interface WorkflowSettingsProps {
  workflow: Workflow;
  onClose: () => void;
  onUpdate: (updates: Partial<Workflow>) => void;
}
