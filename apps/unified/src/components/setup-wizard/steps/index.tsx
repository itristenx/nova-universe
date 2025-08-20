import React from 'react';

export interface MonitoringStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

export const MonitoringStep: React.FC<MonitoringStepProps> = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Monitoring Configuration
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This step will configure Nova Sentinel and GoAlert monitoring.
      </p>
    </div>
  );
};

export interface StorageStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

export const StorageStep: React.FC<StorageStepProps> = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Storage Configuration
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This step will configure S3-compatible file storage.
      </p>
    </div>
  );
};

export interface AIStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

export const AIStep: React.FC<AIStepProps> = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        AI Features
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This step will configure AI-powered capabilities.
      </p>
    </div>
  );
};

export interface SecurityStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

export const SecurityStep: React.FC<SecurityStepProps> = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Security Configuration
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This step will configure authentication and security policies.
      </p>
    </div>
  );
};

export interface FinalStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

export const FinalStep: React.FC<FinalStepProps> = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Setup Complete
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Review your configuration and complete the setup process.
      </p>
    </div>
  );
};
