import React from 'react';
import ServiceCatalog from './ServiceCatalog';

/**
 * Production Enterprise Service Catalog Platform
 *
 * This component provides a complete enterprise-grade service catalog system
 * with live API integration, advanced security, ML insights, and workflow automation.
 */
export default function CatalogApp() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ServiceCatalog />
    </div>
  );
}

// Export for external use
export { ServiceCatalog };
export { default as CatalogManagement } from './CatalogManagement';
export { default as RequestManagement } from './RequestManagement';
export { useCatalogStore } from '../stores/catalogStore';
