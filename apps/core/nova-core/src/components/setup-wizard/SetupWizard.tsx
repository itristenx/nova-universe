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
  { id: 'completion', name: 'Complete', component: CompletionStep }
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
    loadProgress 
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
          timezone: 'America/New_York'
        },
        admin: {
          firstName: 'Test',
          lastName: 'Admin',
          email: 'admin@novatest.local',
          username: 'admin',
          password: 'TestPassword123!',
          confirmPassword: 'TestPassword123!'
        },
        database: {
          type: 'sqlite' as const,
          filename: 'nova-test.db'
        },
        email: {
          provider: 'console' as const
        },
        authentication: {
          requireMfa: false,
          allowSelfRegistration: true,
          sessionTimeout: 24,
          maxLoginAttempts: 5
        },
        services: {
          storageProvider: 'local' as const,
          knowledgeBaseEnabled: true,
          aiAssistEnabled: false
        },
        branding: {
          companyName: 'Nova Test',
          portalTitle: 'Nova Test Portal',
          primaryColor: '#6366f1',
          secondaryColor: '#8b5cf6',
          accentColor: '#06b6d4',
          darkModeEnabled: true
        }
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
        setCurrentStepIndex(prev => prev + 1);
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
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleStepUpdate = useCallback((data: any) => {
    const updatedData = { [currentStep.id]: data };
    updateSetupData(updatedData);
  }, [currentStep.id, updateSetupData]);

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
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Quickly configure with test data
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {currentStepIndex + 1} of {STEPS.length}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
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
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      status === 'current'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : status === 'completed'
                        ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        : 'text-slate-500 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : status === 'current'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-500'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
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
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
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
                <div className="bg-slate-50 dark:bg-slate-700/50 px-8 py-4 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="secondary"
                      onClick={handleStepBack}
                      disabled={currentStepIndex === 0 || isLoading}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
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
                        <span>{currentStepIndex === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}</span>
                        <ArrowRightIcon className="w-4 h-4" />
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
