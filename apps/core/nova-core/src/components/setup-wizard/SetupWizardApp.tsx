import React from 'react';
import { SetupProvider } from './SetupContext';
import { SetupWizard } from './SetupWizard';

interface SetupWizardAppProps {
  onComplete?: () => void;
}

export const SetupWizardApp: React.FC<SetupWizardAppProps> = ({ onComplete }) => {
  return (
    <SetupProvider>
      <SetupWizard onComplete={onComplete} />
    </SetupProvider>
  );
};
