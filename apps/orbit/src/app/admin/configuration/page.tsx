import React from 'react';
import ConfigurationManagement from '../../../components/admin/ConfigurationManagement';

export default function AdminConfigurationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <ConfigurationManagement />
      </div>
    </div>
  );
}
