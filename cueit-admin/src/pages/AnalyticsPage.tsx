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

      {/* Analytics Dashboard */}
      <Card>
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive analytics and reporting capabilities are available for your CueIT deployment.
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              • <strong>Ticket Analytics:</strong> Response times, resolution patterns, and volume trends
            </p>
            <p className="text-sm text-gray-600">
              • <strong>Kiosk Performance:</strong> Usage metrics, uptime monitoring, and user interaction data
            </p>
            <p className="text-sm text-gray-600">
              • <strong>System Insights:</strong> Performance metrics, integration status, and operational reports
            </p>
            <p className="text-sm text-gray-600">
              • <strong>Custom Reports:</strong> Configurable dashboards and automated reporting
            </p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Enterprise Feature:</strong> Advanced analytics capabilities are included with CueIT Enterprise licenses. 
              Contact your administrator or sales representative for access to detailed reporting and analytics features.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
