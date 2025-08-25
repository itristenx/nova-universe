import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuidedFlowStore, GuidedFlow, FlowStep } from '@stores/guidedFlow';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface GuidedFlowWidgetProps {
  className?: string;
  onClose?: () => void;
}

export function GuidedFlowWidget({ className, onClose }: GuidedFlowWidgetProps) {
  const {
    flows,
    activeSession,
    isLoading,
    error,
    loadFlows,
    getFlow,
    startFlow,
    nextStep,
    completeFlow,
    resetFlow,
  } = useGuidedFlowStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (flows.length === 0) {
      loadFlows();
    }
  }, [flows.length, loadFlows]);

  const categories = ['all', ...new Set(flows.map((flow) => flow.category))];

  const filteredFlows = flows.filter((flow) => {
    const matchesCategory = selectedCategory === 'all' || flow.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      flow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleStartFlow = (flowId: string) => {
    startFlow(flowId);
  };

  const handleStepAnswer = (stepId: string, answer: any) => {
    nextStep(stepId, answer);
  };

  const handleCompleteFlow = () => {
    completeFlow();
  };

  const handleResetFlow = () => {
    resetFlow();
  };

  if (activeSession) {
    const flow = getFlow(activeSession.flowId);
    if (!flow) return null;

    return (
      <GuidedFlowSession
        flow={flow}
        session={activeSession}
        onStepAnswer={handleStepAnswer}
        onComplete={handleCompleteFlow}
        onReset={handleResetFlow}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800',
        className,
      )}
    >
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Guided Self-Service
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get step-by-step help with common tasks
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Close guided flow widget"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-4 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-nova-100 dark:bg-nova-900 text-nova-700 dark:text-nova-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                )}
              >
                {category === 'all' ? 'All Topics' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Flow List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="border-nova-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredFlows.map((flow, index) => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  onStart={() => handleStartFlow(flow.id)}
                  delay={index * 0.05}
                />
              ))}
            </AnimatePresence>

            {filteredFlows.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No help topics found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface FlowCardProps {
  flow: GuidedFlow;
  onStart: () => void;
  delay?: number;
}

function FlowCard({ flow, onStart, delay = 0 }: FlowCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'complex':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay }}
    >
      <button
        type="button"
        className="hover:border-nova-300 dark:hover:border-nova-600 w-full rounded-lg border border-gray-200 p-4 text-left transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:hover:bg-gray-700/50"
        onClick={onStart}
        aria-label={`Start ${flow.title} flow`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-2xl">{flow.icon}</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{flow.title}</h4>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{flow.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                <span>{flow.estimatedTime} min</span>
              </div>

              <div className="flex items-center gap-1">
                <StarIcon className="h-3 w-3" />
                <span>{flow.popularity}% helpful</span>
              </div>

              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  getDifficultyColor(flow.difficulty),
                )}
              >
                {flow.difficulty}
              </span>
            </div>

            {flow.tags.length > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <TagIcon className="h-3 w-3 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {flow.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {flow.tags.length > 3 && (
                    <span className="text-xs text-gray-400">+{flow.tags.length - 3}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <ArrowRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
        </div>
      </button>
    </motion.div>
  );
}

interface GuidedFlowSessionProps {
  flow: GuidedFlow;
  session: any;
  onStepAnswer: (stepId: string, answer: any) => void;
  onComplete: () => void;
  onReset: () => void;
  onClose?: () => void;
}

function GuidedFlowSession({
  flow,
  session,
  onStepAnswer,
  onComplete,
  onReset,
  onClose,
}: GuidedFlowSessionProps) {
  const currentStep = flow.steps.find((step) => step.id === session.currentStepId);
  const stepIndex = flow.steps.findIndex((step) => step.id === session.currentStepId);
  const progress = ((stepIndex + 1) / flow.steps.length) * 100;

  if (!currentStep) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Step not found</p>
          <button
            onClick={onReset}
            className="mt-4 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Reset Flow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{flow.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{flow.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Step {stepIndex + 1} of {flow.steps.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Reset
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label="Close guided flow session"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="bg-nova-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
            {currentStep.title}
          </h4>

          {currentStep.description && (
            <p className="mb-4 text-gray-600 dark:text-gray-400">{currentStep.description}</p>
          )}

          {currentStep.type === 'question' && currentStep.options ? (
            <QuestionStep
              step={currentStep}
              onAnswer={(answer) => onStepAnswer(currentStep.id, answer)}
            />
          ) : currentStep.type === 'result' ? (
            <ResultStep
              step={currentStep}
              onNext={() => {
                if (currentStep.nextStep) {
                  onStepAnswer(currentStep.id, 'continue');
                } else {
                  onComplete();
                }
              }}
            />
          ) : currentStep.type === 'action' ? (
            <ActionStep
              step={currentStep}
              onAction={(action) => onStepAnswer(currentStep.id, action)}
            />
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}

interface QuestionStepProps {
  step: FlowStep;
  onAnswer: (answer: string) => void;
}

function QuestionStep({ step, onAnswer }: QuestionStepProps) {
  return (
    <div className="space-y-3">
      <p className="mb-4 text-gray-700 dark:text-gray-300">{step.content}</p>

      <div className="grid gap-3">
        {step.options?.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onAnswer(option.id)}
            className="hover:border-nova-300 dark:hover:border-nova-600 hover:bg-nova-50 dark:hover:bg-nova-900/10 group rounded-lg border-2 border-gray-200 p-4 text-left transition-colors dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              {option.icon && <span className="text-2xl">{option.icon}</span>}
              <div className="flex-1">
                <h5 className="group-hover:text-nova-700 dark:group-hover:text-nova-300 font-medium text-gray-900 dark:text-white">
                  {option.label}
                </h5>
                {option.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                )}
              </div>
              <ArrowRightIcon className="group-hover:text-nova-600 dark:group-hover:text-nova-400 h-5 w-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ResultStepProps {
  step: FlowStep;
  onNext: () => void;
}

function ResultStep({ step, onNext }: ResultStepProps) {
  return (
    <div>
      <div className="prose dark:prose-invert mb-6 max-w-none">
        <div
          className="text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{
            __html: step.content
              .replace(/\n/g, '<br>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
          }}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="bg-nova-600 hover:bg-nova-700 flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors"
        >
          {step.nextStep ? 'Continue' : 'Complete'}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ActionStepProps {
  step: FlowStep;
  onAction: (action: string) => void;
}

function ActionStep({ step, onAction }: ActionStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-700 dark:text-gray-300">{step.content}</p>

      <div className="grid gap-3">
        {step.options?.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onAction(option.id)}
            className="hover:border-nova-300 dark:hover:border-nova-600 hover:bg-nova-50 dark:hover:bg-nova-900/10 group rounded-lg border-2 border-gray-200 p-4 text-left transition-colors dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              {option.icon && <span className="text-2xl">{option.icon}</span>}
              <div className="flex-1">
                <h5 className="group-hover:text-nova-700 dark:group-hover:text-nova-300 font-medium text-gray-900 dark:text-white">
                  {option.label}
                </h5>
                {option.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                )}
              </div>
              <ArrowRightIcon className="group-hover:text-nova-600 dark:group-hover:text-nova-400 h-5 w-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
