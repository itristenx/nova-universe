// Nova Workflow Components - Main Export
// ServiceNow-style workflow automation system

export { default as SimpleWorkflowAutomation } from './SimpleWorkflowAutomation';
export { default as SimpleWorkflowBuilder } from './SimpleWorkflowBuilder';

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
