import React from 'react';
import { SmartKnowledgeBase } from '@components/ai/SmartKnowledgeBase';

const SmartKnowledgePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <SmartKnowledgeBase />
      </div>
    </div>
  );
};

export default SmartKnowledgePage;
