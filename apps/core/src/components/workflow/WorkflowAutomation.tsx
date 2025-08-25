// Nova Workflow Automation - Main Container Component
// ServiceNow-style workflow automation system

import React, { useState, useCallback } from 'react';
import WorkflowBuilder from './WorkflowBuilder';
import { Workflow, WorkflowStatus, WorkflowType } from '../../types/workflow';
import './WorkflowAutomation.css';

interface WorkflowAutomationProps {
  workflowId?: string;
  onClose?: () => void;
}

const WorkflowAutomation = ({ workflowId, onClose }: WorkflowAutomationProps) => {
  const [currentWorkflow, setCurrentWorkflow] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load workflow if ID provided
  React.useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual API call to WorkflowEngineService
      console.log('Loading workflow:', id);
      // For now, create a mock workflow
      const mockWorkflow: Workflow = {
        id,
        name: 'Sample Workflow',
        description: 'A sample workflow for testing',
        version: '1.0.0',
        status: WorkflowStatus.DRAFT,
        type: WorkflowType.PROCESS,
        category: 'automation',
        tags: ['sample', 'test'],
        canvas: {},
        trigger: undefined,
        variables: {},
        settings: {},
        createdBy: 'system',
        updatedBy: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
        archivedAt: undefined,
        nodes: [],
        connections: [],
      };
      setCurrentWorkflow(mockWorkflow);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkflow = useCallback(async (workflow: Workflow) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual API call to WorkflowEngineService
      console.log('Saving workflow:', workflow);
      setCurrentWorkflow(workflow);
      // Show success message
      alert('Workflow saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExecuteWorkflow = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual API call to WorkflowEngineService
      console.log('Executing workflow:', id);
      // Show success message
      alert('Workflow execution started!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute workflow');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePublishWorkflow = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Implement actual API call to WorkflowEngineService
        console.log('Publishing workflow:', id);
        if (currentWorkflow) {
          setCurrentWorkflow({
            ...currentWorkflow,
            status: WorkflowStatus.PUBLISHED,
            publishedAt: new Date(),
            updatedAt: new Date(),
          });
        }
        // Show success message
        alert('Workflow published successfully!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to publish workflow');
      } finally {
        setIsLoading(false);
      }
    },
    [currentWorkflow],
  );

  if (isLoading) {
    return (
      <div className="workflow-automation">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading workflow automation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workflow-automation">
        <div className="error-overlay">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => setError(null)}>
              Retry
            </button>
            {onClose && (
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-automation">
      {onClose && (
        <div className="workflow-automation__header">
          <button
            className="btn btn-secondary btn-sm close-button"
            onClick={onClose}
            title="Close Workflow Automation"
          >
            ✕
          </button>
        </div>
      )}

      <WorkflowBuilder
        workflow={currentWorkflow}
        onSave={handleSaveWorkflow}
        onExecute={handleExecuteWorkflow}
        onPublish={handlePublishWorkflow}
      />
    </div>
  );
};

export default WorkflowAutomation;
