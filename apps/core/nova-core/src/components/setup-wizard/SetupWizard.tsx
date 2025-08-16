import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { WelcomeStep } from './steps/WelcomeStep';
import { OrganizationStep } from './steps/OrganizationStep';
import { AdminAccountStep } from './steps/AdminAccountStep';
import { DatabaseStep } from './steps/DatabaseStep';
import { EmailStep } from './steps/EmailStep';
import { AuthenticationStep } from './steps/AuthenticationStep';
import { ServicesStep } from './steps/ServicesStep';
import { BrandingStep } from './steps/BrandingStep';
import { CompletionStep } from './steps/CompletionStep';
import { Button } from '../ui/Button';
import { useSetup } from './SetupContext';

interface SetupWizardProps {
  onComplete?: () => void;
}

const STEPS = [
  { id: 'welcome', name: 'Welcome', component: WelcomeStep },
  { id: 'organization', name: 'Organization', component: OrganizationStep },
  { id: 'admin', name: 'Admin Account', component: AdminAccountStep },
  { id: 'database', name: 'Database', component: DatabaseStep },
  { id: 'email', name: 'Email', component: EmailStep },
  { id: 'authentication', name: 'Authentication', component: AuthenticationStep },
  { id: 'services', name: 'Services', component: ServicesStep },
  { id: 'branding', name: 'Branding', component: BrandingStep },
  { id: 'completion', name: 'Complete', component: CompletionStep },
];

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const {
    currentStep: contextCurrentStep,
    setCurrentStep,
    setupData,
    updateSetupData,
    errors,
    isLoading: contextIsLoading,
    validateStep,
    saveProgress,
    loadProgress,
  } = useSetup();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSetup, setIsAutoSetup] = useState(false);

  const currentStep = STEPS[currentStepIndex];
  const CurrentStepComponent = currentStep.component;

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Auto-setup for testing
  const runAutoSetup = useCallback(async () => {
    setIsAutoSetup(true);
    setIsLoading(true);

    try {
      // Auto-fill with test data
      const autoData = {
        organization: {
          name: 'Nova Test Organization',
          domain: 'novatest.local',
          size: '50-200',
          industry: 'technology',
          timezone: 'America/New_York',
        },
        admin: {
          firstName: 'Test',
          lastName: 'Admin',
          email: 'admin@novatest.local',
          username: 'admin',
          password: 'TestPassword123!',
          confirmPassword: 'TestPassword123!',
        },
        database: {
          type: 'sqlite' as const,
          filename: 'nova-test.db',
        },
        email: {
          provider: 'console' as const,
        },
        authentication: {
          requireMfa: false,
          allowSelfRegistration: true,
          sessionTimeout: 24,
          maxLoginAttempts: 5,
        },
        services: {
          storageProvider: 'local' as const,
          knowledgeBaseEnabled: true,
          aiAssistEnabled: false,
        },
        branding: {
          companyName: 'Nova Test',
          portalTitle: 'Nova Test Portal',
          primaryColor: '#6366f1',
          secondaryColor: '#8b5cf6',
          accentColor: '#06b6d4',
          darkModeEnabled: true,
        },
      };

      // Update all setup data
      updateSetupData(autoData);

      // Jump to completion step
      setCurrentStepIndex(STEPS.length - 1);
    } catch (error) {
      console.error('Auto-setup failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateSetupData]);

  const handleStepComplete = useCallback(async () => {
    const isValid = await validateStep(currentStep.id);
    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      // Save progress after each step
      await saveProgress();

      // Move to next step or complete
      if (currentStepIndex < STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        // Final step completed
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentStep.id, currentStepIndex, validateStep, saveProgress, onComplete]);

  const handleStepBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleStepUpdate = useCallback(
    (data: any) => {
      const updatedData = { [currentStep.id]: data };
      updateSetupData(updatedData);
    },
    [currentStep.id, updateSetupData],
  );

  const jumpToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      setCurrentStepIndex(stepIndex);
    }
  }, []);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="min-h-screen w-80 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-lg font-bold text-white">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nova Universe</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Setup Wizard</p>
              </div>
            </div>

            {/* Auto Setup Button */}
            {currentStepIndex === 0 && !isAutoSetup && (
              <div className="mb-6">
                <Button
                  variant="secondary"
                  onClick={runAutoSetup}
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="w-full"
                >
                  🚀 Auto-Setup for Testing
                </Button>
                <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  Quickly configure with test data
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Progress
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {currentStepIndex + 1} of {STEPS.length}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }} // eslint-disable-line no-inline-styles
                />
              </div>
            </div>

            {/* Steps List */}
            <nav className="space-y-2">
              {STEPS.map((step, index) => {
                const status = getStepStatus(index);
                const isClickable = index <= currentStepIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => isClickable && jumpToStep(index)}
                    disabled={!isClickable}
                    className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      status === 'current'
                        ? 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        : status === 'completed'
                          ? 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                          : 'cursor-not-allowed text-slate-500 dark:text-slate-500'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                          : status === 'current'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500'
                      }`}
                    >
                      {status === 'completed' ? <CheckCircleIcon className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className="font-medium">{step.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mx-auto max-w-4xl px-6 py-8">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="p-8">
                <CurrentStepComponent
                  data={setupData[currentStep.id as keyof typeof setupData] || {}}
                  onUpdate={handleStepUpdate}
                  onComplete={handleStepComplete}
                  errors={errors}
                  isLoading={isLoading}
                />
              </div>

              {/* Step Navigation */}
              {currentStep.id !== 'welcome' && currentStep.id !== 'completion' && (
                <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 dark:border-slate-600 dark:bg-slate-700/50">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="secondary"
                      onClick={handleStepBack}
                      disabled={currentStepIndex === 0 || isLoading}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                      <span>Back</span>
                    </Button>

                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Step {currentStepIndex + 1} of {STEPS.length}
                      </span>
                      <Button
                        variant="primary"
                        onClick={handleStepComplete}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="flex items-center space-x-2"
                      >
                        <span>
                          {currentStepIndex === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
                        </span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
