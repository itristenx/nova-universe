import React from 'react';
import { Card } from '@/components/ui';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="mt-1 text-sm text-gray-600">
          View insights and analytics for your kiosk network and support system
        </p>
      </div>

      {/* Placeholder */}
      <Card>
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Coming Soon</h3>
          <p className="mt-1 text-sm text-gray-500">
            Advanced analytics and reporting features will be available here.
          </p>
        </div>
      </Card>
    </div>
  );
};
