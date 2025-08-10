import React from 'react';
import AlertDashboard from '../components/alerts/AlertDashboard';

const AlertsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <AlertDashboard />
      </div>
    </div>
  );
};

export default AlertsPage;