import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useSetupWizard } from './hooks/useSetupWizard';
import { WelcomeStep } from './steps/WelcomeStep';
import { OrganizationStep } from './steps/OrganizationStep';
import { AdminStep } from './steps/AdminStep';
import { DatabaseStep } from './steps/DatabaseStep';
import { CommunicationsStep } from './steps/CommunicationsStep';
import { MonitoringStep, StorageStep, AIStep, SecurityStep, FinalStep } from './steps';

// Simple utility function
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Simple UI components
const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'secondary' | 'outline';
  size?: 'sm' | 'default';
  className?: string;
}> = ({ children, variant = 'default', size = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    destructive: 'bg-red-100 text-red-800',
    secondary: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
  };

  const sizeClasses = {
    default: 'px-2 py-1 text-xs',
    sm: 'px-1.5 py-0.5 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm';
  className?: string;
}> = ({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizeClasses = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1.5 text-sm',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center rounded-md font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </button>
  );
};

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => {
  const width = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('h-2 w-full rounded-full bg-gray-200', className)}>
      <div
        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={cn('rounded-md border p-4', className)}>{children}</div>;

const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={cn('text-sm', className)}>{children}</div>;

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={cn(
      'rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
      className,
    )}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={cn('p-6 pb-0', className)}>{children}</div>;

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>;

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={cn('p-6', className)}>{children}</div>;

export interface SetupWizardProps {
  onComplete?: (config: any) => void;
  onCancel?: () => void;
  className?: string;
}

export interface StepConfig {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  required: boolean;
  estimatedTime: number; // in minutes
  dependencies?: string[];
  canSkip?: boolean;
}

const setupSteps: StepConfig[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Get started with Nova Universe setup',
    component: WelcomeStep,
    required: true,
    estimatedTime: 2,
    canSkip: false,
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Configure your organization details',
    component: OrganizationStep,
    required: true,
    estimatedTime: 5,
    canSkip: false,
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Set up the first admin user',
    component: AdminStep,
    required: true,
    estimatedTime: 3,
    dependencies: ['organization'],
    canSkip: false,
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Configure database connection',
    component: DatabaseStep,
    required: true,
    estimatedTime: 5,
    canSkip: false,
  },
  {
    id: 'communications',
    title: 'Communications',
    description: 'Set up email and messaging',
    component: CommunicationsStep,
    required: false,
    estimatedTime: 8,
    dependencies: ['database'],
    canSkip: true,
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    description: 'Configure monitoring and alerting',
    component: MonitoringStep,
    required: false,
    estimatedTime: 10,
    dependencies: ['database'],
    canSkip: true,
  },
  {
    id: 'storage',
    title: 'Storage',
    description: 'Configure file storage options',
    component: StorageStep,
    required: false,
    estimatedTime: 5,
    dependencies: ['database'],
    canSkip: true,
  },
  {
    id: 'ai',
    title: 'AI Features',
    description: 'Enable AI-powered capabilities',
    component: AIStep,
    required: false,
    estimatedTime: 7,
    dependencies: ['database'],
    canSkip: true,
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Configure security settings',
    component: SecurityStep,
    required: true,
    estimatedTime: 6,
    dependencies: ['admin', 'database'],
    canSkip: false,
  },
  {
    id: 'final',
    title: 'Complete',
    description: 'Review and finalize setup',
    component: FinalStep,
    required: true,
    estimatedTime: 3,
    dependencies: ['organization', 'admin', 'database', 'security'],
    canSkip: false,
  },
];

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, onCancel, className }) => {
  const {
    currentStep,
    currentStepIndex,
    sessionId,
    isConnected,
    progress,
    config,
    validation,
    suggestions,
    isLoading,
    error,
    nextStep,
    previousStep,
    updateConfig,
    validateStep,
    skipStep,
    retryConnection,
  } = useSetupWizard();

  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const wizardRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    if (wizardRef.current) {
      wizardRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleNext = useCallback(async () => {
    const isValid = await validateStep(currentStep.id);
    if (isValid) {
      if (currentStepIndex === setupSteps.length - 1) {
        onComplete?.(config);
      } else {
        nextStep();
      }
    }
  }, [currentStep.id, currentStepIndex, validateStep, nextStep, config, onComplete]);

  const handleSkip = useCallback(() => {
    if (currentStep.canSkip) {
      setShowSkipConfirmation(true);
    }
  }, [currentStep.canSkip]);

  const confirmSkip = useCallback(() => {
    skipStep(currentStep.id);
    setShowSkipConfirmation(false);
  }, [skipStep, currentStep.id]);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const StepComponent = currentStep.component;
  const estimatedTimeRemaining = setupSteps
    .slice(currentStepIndex + 1)
    .reduce((total, step) => total + step.estimatedTime, 0);

  return (
    <div
      ref={wizardRef}
      className={cn(
        'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100',
        'dark:from-gray-900 dark:to-gray-800',
        className,
      )}
      role="main"
      aria-label="Setup Wizard"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Nova Universe Setup
              </h1>
              <Badge
                variant={isConnected ? 'success' : 'destructive'}
                className="flex items-center space-x-1"
              >
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {estimatedTimeRemaining > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ≈ {estimatedTimeRemaining} min remaining
                </div>
              )}
              {onCancel && (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cancel Setup
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Step {currentStepIndex + 1} of {setupSteps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress
              value={progress}
              className="h-2"
              aria-label={`Setup progress: ${Math.round(progress)}% complete`}
            />
          </div>
        </div>
      </div>

      {/* Connection Error Banner */}
      {!isConnected && (
        <Alert className="mx-4 mt-4 border-yellow-200 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Connection lost. Some features may not work properly.</span>
            <Button
              size="sm"
              variant="outline"
              onClick={retryConnection}
              disabled={isLoading}
              className="ml-4"
            >
              <RefreshCw className={cn('mr-1 h-3 w-3', isLoading && 'animate-spin')} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg">Setup Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {setupSteps.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isAccessible = index <= currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        'flex items-center space-x-3 rounded-lg p-2 transition-colors',
                        isCurrent &&
                          'border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
                        isCompleted && 'text-green-600 dark:text-green-400',
                        !isAccessible && 'opacity-50',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-bold',
                            isCurrent
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300 text-gray-500',
                          )}
                        >
                          {index + 1}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            'truncate font-medium',
                            isCurrent && 'text-blue-900 dark:text-blue-100',
                          )}
                        >
                          {step.title}
                        </div>
                        {step.required && (
                          <Badge variant="secondary" size="sm" className="mt-1">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Step Content */}
            <div className="lg:col-span-3">
              <div key={currentStep.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{currentStep.title}</CardTitle>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                          {currentStep.description}
                        </p>
                      </div>
                      <Badge variant="outline">≈ {currentStep.estimatedTime} min</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Error Display */}
                    {error && (
                      <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Validation Messages */}
                    {validation && !validation.valid && validation.errors.length > 0 && (
                      <Alert className="mb-6 border-yellow-200 bg-yellow-50 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {validation.errors.map((error: string, index: number) => (
                              <div key={index}>{error}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <div className="font-medium">Suggestions:</div>
                            {suggestions.map((suggestion: string, index: number) => (
                              <div key={index} className="text-sm">
                                • {suggestion}
                              </div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Step Content */}
                    <StepComponent
                      config={config}
                      updateConfig={updateConfig}
                      validation={validation}
                      isLoading={isLoading}
                      sessionId={sessionId}
                      collapsedSections={collapsedSections}
                      toggleSection={toggleSection}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStepIndex === 0 || isLoading}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-4">
                {currentStep.canSkip && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Skip Step
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>
                    {currentStepIndex === setupSteps.length - 1 ? 'Complete Setup' : 'Next'}
                  </span>
                  {currentStepIndex < setupSteps.length - 1 && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
