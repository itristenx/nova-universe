// Service Catalog Management Components
export { default as ServiceCatalog } from './ServiceCatalog';
export { default as CatalogApp } from './CatalogApp';
export { default as CatalogManagement } from './CatalogManagement';
export { default as RequestManagement } from './RequestManagement';

// Admin Components
export { default as ConfigurationManagement } from './admin/ConfigurationManagement';

// Enterprise Components - NEW
export { default as WorkflowManager } from './enterprise/WorkflowManager';
export { default as ApprovalManager } from './enterprise/ApprovalManager';
export { default as WorkflowAutomationDashboard } from './enterprise/WorkflowAutomationDashboard';

// AI and Workflow Components
export { default as ApprovalWorkflowEngine } from './ApprovalWorkflowEngine';
export { default as VisualWorkflowBuilder } from './VisualWorkflowBuilder';

// Workflow Components
export * from './workflow';

// Other Components
export { default as KioskRedirect } from './KioskRedirect';
export { default as LanguageSwitcher } from './LanguageSwitcher';
export { default as NotificationMenu } from './NotificationMenu';
export { default as OfflinePage } from './OfflinePage';
export { default as PWAInstaller } from './PWAInstaller';

// Component Folders with index.ts
export * from './ai';
export * from './files';
