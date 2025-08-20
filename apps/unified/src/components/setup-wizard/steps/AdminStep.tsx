import React from 'react';

export interface AdminStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

export const AdminStep: React.FC<AdminStepProps> = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Administrator Setup
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This step will configure the first administrator user account.
      </p>
    </div>
  );
};
