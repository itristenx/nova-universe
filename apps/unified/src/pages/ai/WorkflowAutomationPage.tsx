import React from 'react';
import { WorkflowAutomationEngine } from '@components/ai/WorkflowAutomationEngine';

const WorkflowAutomationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <WorkflowAutomationEngine />
      </div>
    </div>
  );
};

export default WorkflowAutomationPage;
