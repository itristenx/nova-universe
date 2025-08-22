import React from 'react'
import { SmartKnowledgeBase } from '@components/ai/SmartKnowledgeBase'

const SmartKnowledgePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <SmartKnowledgeBase />
      </div>
    </div>
  )
}

export default SmartKnowledgePage
