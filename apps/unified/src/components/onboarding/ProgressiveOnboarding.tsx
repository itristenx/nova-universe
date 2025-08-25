import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  LightBulbIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  type: 'tooltip' | 'modal' | 'highlight' | 'tour';
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  allowSkip?: boolean;
  autoAdvance?: number; // milliseconds
}

interface OnboardingTour {
  id: string;
  title: string;
  description: string;
  category: 'welcome' | 'feature' | 'workflow' | 'tip';
  steps: OnboardingStep[];
  triggerCondition?: {
    type: 'firstVisit' | 'featureAccess' | 'manual' | 'timeDelay';
    value?: any;
  };
  priority: number;
}

interface ProgressiveOnboardingProps {
  className?: string;
  autoStart?: boolean;
  onComplete?: (tourId: string) => void;
  onSkip?: (tourId: string, stepId: string) => void;
}

// Mock onboarding tours
const onboardingTours: OnboardingTour[] = [
  {
    id: 'welcome-tour',
    title: 'Welcome to Nova Unified',
    description: "Let's get you started with the basics",
    category: 'welcome',
    priority: 1,
    triggerCondition: { type: 'firstVisit' },
    steps: [
      {
        id: 'dashboard-overview',
        title: 'Your Dashboard',
        description:
          'This is your personalized dashboard. Here you can see your tickets, recent activity, and quick actions.',
        target: '[data-tour="dashboard"]',
        position: 'center',
        type: 'modal',
        icon: <InformationCircleIcon className="h-5 w-5" />,
      },
      {
        id: 'navigation-menu',
        title: 'Navigation Menu',
        description:
          'Use this menu to access different areas of the platform. Click on any item to explore.',
        target: '[data-tour="navigation"]',
        position: 'right',
        type: 'tooltip',
        icon: <LightBulbIcon className="h-5 w-5" />,
      },
      {
        id: 'create-ticket',
        title: 'Create Your First Ticket',
        description:
          'Click here to create a new support ticket. This is how you request help or report issues.',
        target: '[data-tour="create-ticket"]',
        position: 'bottom',
        type: 'highlight',
        icon: <PlayIcon className="h-5 w-5" />,
        action: {
          label: 'Try It Now',
          onClick: () => console.log('Navigate to create ticket'),
        },
      },
      {
        id: 'search-function',
        title: 'Smart Search',
        description:
          'Use our AI-powered search to find answers, tickets, or knowledge articles quickly.',
        target: '[data-tour="search"]',
        position: 'bottom',
        type: 'tooltip',
        icon: <LightBulbIcon className="h-5 w-5" />,
      },
      {
        id: 'profile-settings',
        title: 'Your Profile',
        description: 'Access your profile settings, preferences, and notification options here.',
        target: '[data-tour="profile"]',
        position: 'left',
        type: 'tooltip',
        icon: <InformationCircleIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'tickets-workflow',
    title: 'Working with Tickets',
    description: 'Learn how to manage and track your tickets effectively',
    category: 'workflow',
    priority: 2,
    triggerCondition: { type: 'featureAccess', value: 'tickets' },
    steps: [
      {
        id: 'ticket-list',
        title: 'Your Tickets',
        description:
          'This shows all your tickets. You can filter by status, priority, or assigned agent.',
        target: '[data-tour="ticket-list"]',
        position: 'top',
        type: 'tooltip',
        icon: <InformationCircleIcon className="h-5 w-5" />,
      },
      {
        id: 'ticket-status',
        title: 'Understanding Status',
        description:
          'Ticket statuses help you track progress: Open (new), In Progress (being worked on), Resolved (completed).',
        target: '[data-tour="ticket-status"]',
        position: 'bottom',
        type: 'tooltip',
        icon: <LightBulbIcon className="h-5 w-5" />,
      },
      {
        id: 'ticket-priority',
        title: 'Priority Levels',
        description:
          'Set appropriate priority: Low (minor issues), Medium (standard), High (urgent), Critical (system down).',
        target: '[data-tour="ticket-priority"]',
        position: 'left',
        type: 'tooltip',
        icon: <ExclamationTriangleIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'knowledge-base-tour',
    title: 'Knowledge Base Features',
    description: 'Discover self-service options and documentation',
    category: 'feature',
    priority: 3,
    triggerCondition: { type: 'featureAccess', value: 'knowledge-base' },
    steps: [
      {
        id: 'kb-search',
        title: 'Search Knowledge Base',
        description:
          'Search our comprehensive knowledge base for instant answers to common questions.',
        target: '[data-tour="kb-search"]',
        position: 'bottom',
        type: 'highlight',
        icon: <LightBulbIcon className="h-5 w-5" />,
      },
      {
        id: 'kb-categories',
        title: 'Browse Categories',
        description:
          'Articles are organized by category. Browse by topic to find relevant information.',
        target: '[data-tour="kb-categories"]',
        position: 'right',
        type: 'tooltip',
        icon: <InformationCircleIcon className="h-5 w-5" />,
      },
      {
        id: 'kb-feedback',
        title: 'Rate Articles',
        description:
          'Help us improve by rating articles. Your feedback helps other users find the best content.',
        target: '[data-tour="kb-feedback"]',
        position: 'top',
        type: 'tooltip',
        icon: <CheckCircleIcon className="h-5 w-5" />,
      },
    ],
  },
];

export function ProgressiveOnboarding({
  className,
  autoStart = false,
  onComplete,
  onSkip,
}: ProgressiveOnboardingProps) {
  const [activeTour, setActiveTour] = useState<OnboardingTour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  // Get available tours based on trigger conditions
  const getAvailableTours = useCallback(() => {
    return onboardingTours
      .filter((tour) => !completedTours.includes(tour.id))
      .sort((a, b) => a.priority - b.priority);
  }, [completedTours]);

  // Start a specific tour
  const startTour = useCallback((tourId: string) => {
    const tour = onboardingTours.find((t) => t.id === tourId);
    if (tour) {
      setActiveTour(tour);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    }
  }, []);

  // Calculate tooltip position
  const calculateTooltipPosition = useCallback((target: HTMLElement, position: string) => {
    const rect = target.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    switch (position) {
      case 'top':
        return { x: rect.left + rect.width / 2 + scrollX, y: rect.top + scrollY - 10 };
      case 'bottom':
        return { x: rect.left + rect.width / 2 + scrollX, y: rect.bottom + scrollY + 10 };
      case 'left':
        return { x: rect.left + scrollX - 10, y: rect.top + rect.height / 2 + scrollY };
      case 'right':
        return { x: rect.right + scrollX + 10, y: rect.top + rect.height / 2 + scrollY };
      case 'center':
        return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      default:
        return { x: rect.left + rect.width / 2 + scrollX, y: rect.bottom + scrollY + 10 };
    }
  }, []);

  // Update target element and position
  useEffect(() => {
    if (activeTour && isPlaying) {
      const step = activeTour.steps[currentStepIndex];
      if (step) {
        const element = document.querySelector(step.target) as HTMLElement;
        if (element) {
          setTargetElement(element);
          const position = calculateTooltipPosition(element, step.position);
          setTooltipPosition(position);

          // Add highlight class
          if (step.type === 'highlight') {
            element.classList.add('nova-onboarding-highlight');
          }

          // Auto advance
          if (step.autoAdvance && isPlaying) {
            autoAdvanceRef.current = setTimeout(() => {
              handleNext();
            }, step.autoAdvance);
          }
        }
      }
    }

    return () => {
      // Clean up highlight classes
      document.querySelectorAll('.nova-onboarding-highlight').forEach((el) => {
        el.classList.remove('nova-onboarding-highlight');
      });

      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current);
      }
    };
  }, [activeTour, currentStepIndex, isPlaying, calculateTooltipPosition]);

  // Auto-start tours
  useEffect(() => {
    if (autoStart && !activeTour) {
      const availableTours = getAvailableTours();
      if (availableTours.length > 0) {
        startTour(availableTours[0].id);
      }
    }
  }, [autoStart, activeTour, getAvailableTours, startTour]);

  const handleNext = useCallback(() => {
    if (!activeTour) return;

    if (currentStepIndex < activeTour.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Tour completed
      setCompletedTours((prev) => [...prev, activeTour.id]);
      onComplete?.(activeTour.id);
      setActiveTour(null);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [activeTour, currentStepIndex, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    if (!activeTour) return;

    const currentStep = activeTour.steps[currentStepIndex];
    onSkip?.(activeTour.id, currentStep.id);
    setActiveTour(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [activeTour, currentStepIndex, onSkip]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
    }
  }, []);

  const handleResume = useCallback(() => {
    setIsPlaying(true);
  }, []);

  if (!activeTour || !isPlaying) return null;

  const currentStep = activeTour.steps[currentStepIndex];
  if (!currentStep || !targetElement) return null;

  const TooltipContent = () => (
    <div className="max-w-sm rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div className="p-4">
        <div className="mb-3 flex items-start gap-3">
          {currentStep.icon && (
            <div className="text-nova-600 dark:text-nova-400 mt-0.5 flex-shrink-0">
              {currentStep.icon}
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentStep.title}
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {currentStep.description}
            </p>
          </div>
        </div>

        {currentStep.action && (
          <button
            onClick={currentStep.action.onClick}
            className="bg-nova-600 hover:bg-nova-700 mb-3 w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            {currentStep.action.label}
          </button>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentStepIndex + 1} of {activeTour.steps.length}
            </span>

            <div className="flex gap-1">
              {activeTour.steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    index <= currentStepIndex
                      ? 'bg-nova-600 dark:bg-nova-400'
                      : 'bg-gray-300 dark:bg-gray-600',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStep.allowSkip !== false && (
              <button
                onClick={handleSkip}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Skip
              </button>
            )}

            <div className="flex gap-1">
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="rounded-md p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
                aria-label="Previous step"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              <button
                onClick={isPlaying ? handlePause : handleResume}
                className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={isPlaying ? 'Pause tour' : 'Resume tour'}
              >
                {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              </button>

              <button
                onClick={handleNext}
                className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Next step"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ModalContent = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-800">
        <div className="p-6">
          <div className="mb-4 flex items-start gap-4">
            {currentStep.icon && (
              <div className="text-nova-600 dark:text-nova-400 flex-shrink-0">
                {currentStep.icon}
              </div>
            )}
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {currentStep.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{currentStep.description}</p>
            </div>
            <button
              onClick={handleSkip}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Close tour"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {currentStep.action && (
            <button
              onClick={currentStep.action.onClick}
              className="bg-nova-600 hover:bg-nova-700 mb-4 w-full rounded-lg px-4 py-3 font-medium text-white transition-colors"
            >
              {currentStep.action.label}
            </button>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStepIndex + 1} of {activeTour.steps.length}
              </span>

              <div className="flex gap-1">
                {activeTour.steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-2 w-2 rounded-full',
                      index <= currentStepIndex
                        ? 'bg-nova-600 dark:bg-nova-400'
                        : 'bg-gray-300 dark:bg-gray-600',
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                className="bg-nova-600 hover:bg-nova-700 rounded-lg px-4 py-2 text-white transition-colors"
              >
                {currentStepIndex === activeTour.steps.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (currentStep.type === 'modal') {
    return createPortal(<ModalContent />, document.body);
  }

  // Tooltip positioning
  const tooltipStyle = {
    position: 'absolute' as const,
    left: tooltipPosition.x,
    top: tooltipPosition.y,
    transform:
      currentStep.position === 'center'
        ? 'translate(-50%, -50%)'
        : currentStep.position === 'top'
          ? 'translate(-50%, -100%)'
          : currentStep.position === 'bottom'
            ? 'translate(-50%, 0)'
            : currentStep.position === 'left'
              ? 'translate(-100%, -50%)'
              : 'translate(0, -50%)',
    zIndex: 1000,
  };

  return createPortal(
    <AnimatePresence>
      <div
        key={`${activeTour.id}-${currentStepIndex}`}
        style={tooltipStyle}
        className="pointer-events-auto"
      >
        <TooltipContent />
      </div>
    </AnimatePresence>,
    document.body,
  );
}

// Tour management hook
export function useOnboardingTours() {
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [availableTours, setAvailableTours] = useState(onboardingTours);

  const markTourCompleted = useCallback((tourId: string) => {
    setCompletedTours((prev) => [...prev, tourId]);
  }, []);

  const resetTours = useCallback(() => {
    setCompletedTours([]);
  }, []);

  const getRecommendedTour = useCallback(() => {
    return availableTours
      .filter((tour) => !completedTours.includes(tour.id))
      .sort((a, b) => a.priority - b.priority)[0];
  }, [availableTours, completedTours]);

  return {
    completedTours,
    availableTours,
    markTourCompleted,
    resetTours,
    getRecommendedTour,
  };
}
