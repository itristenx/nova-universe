import React from 'react';
import { AIChatbot } from '@components/ai/AIChatbot';

const AIChatbotPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <AIChatbot />
      </div>
    </div>
  );
};

export default AIChatbotPage;
