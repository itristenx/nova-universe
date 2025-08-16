import React from 'react';
import ConfigurationManagement from '../../../components/admin/ConfigurationManagement';

export default function AdminConfigurationPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <ConfigurationManagement />
      </div>
    </div>
  );
}
