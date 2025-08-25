// Nova Workflow Components - Main Export
// ServiceNow-style workflow automation system

export { default as WorkflowAutomation } from './WorkflowAutomation';
export { default as WorkflowBuilder } from './WorkflowBuilder';

// Export workflow types
export type {
  Workflow,
  WorkflowNode,
  WorkflowConnection,
  WorkflowExecutionInput,
  WorkflowStatus,
  WorkflowType,
  NodeType,
  ExecutionStatus,
} from '../../types/workflow';
