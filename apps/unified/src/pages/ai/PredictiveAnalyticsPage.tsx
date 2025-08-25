import React from 'react';
import { PredictiveAnalyticsDashboard } from '@components/ai/PredictiveAnalyticsDashboard';

const PredictiveAnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <PredictiveAnalyticsDashboard />
      </div>
    </div>
  );
};

export default PredictiveAnalyticsPage;
