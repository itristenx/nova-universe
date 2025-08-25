// Nova Workflow Engine Types
// TypeScript interfaces for workflow automation

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

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  executionId: string;
  triggeredBy?: string;
  trigger?: Record<string, unknown>;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  context: Record<string, unknown>;
  status: ExecutionStatus;
  priority: ExecutionPriority;
  progress: number;
  currentNodeId?: string;
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  timeoutAt?: Date;
  duration?: number;
  error?: Record<string, unknown>;
  errorNodeId?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  workflow?: Workflow;
  nodeExecutions?: NodeExecution[];
}

export interface NodeExecution {
  id: string;
  executionId: string;
  nodeId: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  context: Record<string, unknown>;
  status: ExecutionStatus;
  attempt: number;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: Record<string, unknown>;
  stackTrace?: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface NodeCreateData {
  nodeId?: string;
  type: NodeType;
  category: string;
  name: string;
  description?: string;
  position: NodePosition;
  dimensions?: NodeDimensions;
  styling?: Record<string, unknown>;
  config?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  errorHandling?: Record<string, unknown>;
  timeout?: number;
  retryPolicy?: Record<string, unknown>;
}

export interface NodeUpdateData {
  name?: string;
  description?: string;
  position?: NodePosition;
  dimensions?: NodeDimensions;
  styling?: Record<string, unknown>;
  config?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  errorHandling?: Record<string, unknown>;
  timeout?: number;
  retryPolicy?: Record<string, unknown>;
}

export interface ConnectionCreateData {
  connectionId?: string;
  fromNodeId: string;
  fromPort?: string;
  toNodeId: string;
  toPort?: string;
  label?: string;
  conditions?: Record<string, unknown>;
  priority?: number;
  styling?: Record<string, unknown>;
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

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

// Event interfaces
export interface WorkflowEngineEvents {
  executionStarted: { executionId: string; workflowId: string };
  executionCompleted: { executionId: string; workflowId: string };
  executionFailed: { executionId: string; error: string };
  workflowPublished: { workflowId: string; publishedBy: string };
  nodeExecutionStarted: { executionId: string; nodeId: string };
  nodeExecutionCompleted: { executionId: string; nodeId: string };
  nodeExecutionFailed: { executionId: string; nodeId: string; error: string };
}

// Node processor interface
export interface NodeProcessor {
  execute(
    node: WorkflowNode,
    input: WorkflowExecutionInput,
    nodeExecutionId: string,
  ): Promise<WorkflowExecutionInput>;
}

// Condition evaluation interfaces
export interface ConditionExpression {
  type: 'expression';
  expression: string;
}

export interface ConditionComparison {
  type: 'comparison';
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: unknown;
}

export type WorkflowCondition = ConditionExpression | ConditionComparison;
