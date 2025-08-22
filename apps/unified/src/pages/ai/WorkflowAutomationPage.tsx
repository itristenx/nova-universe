import React from 'react'
import { WorkflowAutomationEngine } from '@components/ai/WorkflowAutomationEngine'

const WorkflowAutomationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <WorkflowAutomationEngine />
      </div>
    </div>
  )
}

export default WorkflowAutomationPage
