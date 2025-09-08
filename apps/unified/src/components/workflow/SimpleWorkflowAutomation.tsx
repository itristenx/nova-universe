// Nova Workflow Automation - Main Container Component
// ServiceNow-style workflow automation system

import React, { useState, useCallback } from 'react';
import SimpleWorkflowBuilder from './SimpleWorkflowBuilder';
import { Workflow, WorkflowStatus, WorkflowType } from '../../types/workflow';
import './SimpleWorkflowAutomation.css';

interface WorkflowAutomationProps {
  workflowId?: string;
  onClose?: () => void;
}

const SimpleWorkflowAutomation = ({ workflowId, onClose }: WorkflowAutomationProps) => {
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
      // Implement actual API call to WorkflowEngineService
      console.log('Loading workflow:', id);
      const response = await fetch(`/api/workflows/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load workflow: ${response.statusText}`);
      }
      
      const workflowData = await response.json();
      setCurrentWorkflow(workflowData.workflow || workflowData);
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
      // Implement actual API call to WorkflowEngineService
      console.log('Saving workflow:', workflow);
      
      const method = workflow.id ? 'PUT' : 'POST';
      const url = workflow.id ? `/api/workflows/${workflow.id}` : '/api/workflows';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflow)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save workflow: ${response.statusText}`);
      }
      
      const savedWorkflow = await response.json();
      setCurrentWorkflow(savedWorkflow.workflow || savedWorkflow);
      
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
      // Implement actual API call to WorkflowEngineService
      console.log('Executing workflow:', id);
      
      const response = await fetch(`/api/workflows/${id}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute workflow: ${response.statusText}`);
      }
      
      const result = await response.json();
      alert(`Workflow execution ${result.success ? 'started successfully' : 'failed'}!`);
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
        // Implement actual API call to WorkflowEngineService
        console.log('Publishing workflow:', id);
        
        const response = await fetch(`/api/workflows/${id}/publish`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to publish workflow: ${response.statusText}`);
        }
        
        const result = await response.json();
        alert(`Workflow ${result.success ? 'published successfully' : 'failed to publish'}!`);
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

      <SimpleWorkflowBuilder
        workflow={currentWorkflow}
        onSave={handleSaveWorkflow}
        onExecute={handleExecuteWorkflow}
        onPublish={handlePublishWorkflow}
      />
    </div>
  );
};

export default SimpleWorkflowAutomation;
