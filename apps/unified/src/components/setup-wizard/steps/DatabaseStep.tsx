import React from 'react';

export interface DatabaseStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

export const DatabaseStep: React.FC<DatabaseStepProps> = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Database Configuration
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This step will configure the PostgreSQL database connection.
      </p>
    </div>
  );
};
