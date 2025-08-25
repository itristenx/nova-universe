import { useState, useEffect, useCallback, useRef } from 'react';

// Simple toast implementation until we can install sonner
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.info('ℹ️', message),
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  suggestions: string[];
}

export interface SetupConfig {
  [key: string]: any;
}

export interface StepData {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  required: boolean;
  estimatedTime: number;
  dependencies?: string[];
  canSkip?: boolean;
}

export interface UseSetupWizardReturn {
  // Current state
  currentStep: StepData;
  currentStepIndex: number;
  sessionId: string | null;
  isConnected: boolean;
  progress: number;
  config: SetupConfig;
  validation: ValidationResult | null;
  suggestions: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  updateConfig: (updates: Partial<SetupConfig>) => void;
  validateStep: (stepId: string) => Promise<boolean>;
  skipStep: (stepId: string) => void;
  resetWizard: () => void;
  retryConnection: () => void;
}

const WEBSOCKET_URL =
  process.env.REACT_APP_WS_URL || process.env.VITE_WS_URL || 'ws://localhost:3001';
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.VITE_API_URL ||
  process.env.VITE_API_BASE_URL ||
  'http://localhost:3001';

const setupSteps: StepData[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Get started with Nova Universe setup',
    component: null as any, // Will be filled by actual components
    required: true,
    estimatedTime: 2,
    canSkip: false,
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Configure your organization details',
    component: null as any,
    required: true,
    estimatedTime: 5,
    canSkip: false,
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Set up the first admin user',
    component: null as any,
    required: true,
    estimatedTime: 3,
    dependencies: ['organization'],
    canSkip: false,
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Configure database connection',
    component: null as any,
    required: true,
    estimatedTime: 5,
    canSkip: false,
  },
  {
    id: 'communications',
    title: 'Communications',
    description: 'Set up email and messaging',
    component: null as any,
    required: false,
    estimatedTime: 8,
    dependencies: ['database'],
    canSkip: true,
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    description: 'Configure monitoring and alerting',
    component: null as any,
    required: false,
    estimatedTime: 10,
    dependencies: ['database'],
    canSkip: true,
  },
  {
    id: 'storage',
    title: 'Storage',
    description: 'Configure file storage options',
    component: null as any,
    required: false,
    estimatedTime: 5,
    dependencies: ['database'],
    canSkip: true,
  },
  {
    id: 'ai',
    title: 'AI Features',
    description: 'Enable AI-powered capabilities',
    component: null as any,
    required: false,
    estimatedTime: 7,
    dependencies: ['database'],
    canSkip: true,
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Configure security settings',
    component: null as any,
    required: true,
    estimatedTime: 6,
    dependencies: ['admin', 'database'],
    canSkip: false,
  },
  {
    id: 'final',
    title: 'Complete',
    description: 'Review and finalize setup',
    component: null as any,
    required: true,
    estimatedTime: 3,
    dependencies: ['organization', 'admin', 'database', 'security'],
    canSkip: false,
  },
];

export const useSetupWizard = (): UseSetupWizardReturn => {
  // Core state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState<SetupConfig>({});
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [_skippedSteps, setSkippedSteps] = useState<Set<string>>(new Set());

  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize session
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/setup/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize session: ${response.statusText}`);
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setConfig(data.config || {});

      if (data.currentStep) {
        const stepIndex = setupSteps.findIndex((step) => step.id === data.currentStep);
        if (stepIndex !== -1) {
          setCurrentStepIndex(stepIndex);
        }
      }

      toast.success('Setup session initialized successfully');
      return data.sessionId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize session';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // WebSocket connection management
  const connectWebSocket = useCallback((sessionId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(`${WEBSOCKET_URL}/setup?sessionId=${sessionId}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Send initial message to confirm connection
        ws.send(
          JSON.stringify({
            type: 'ping',
            sessionId,
            timestamp: Date.now(),
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket(sessionId);
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to establish real-time connection');
    }
  }, []);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'pong':
        // Connection confirmation
        break;

      case 'progress':
        if (message.data?.progress !== undefined) {
          // Progress updates will be calculated locally for now
        }
        break;

      case 'validation':
        setValidation(message.data);
        break;

      case 'suggestions':
        setSuggestions(message.data?.suggestions || []);
        break;

      case 'error':
        setError(message.data?.message || 'An error occurred');
        toast.error(message.data?.message || 'An error occurred');
        break;

      case 'step_completed':
        if (message.data?.stepId) {
          setCompletedSteps((prev) => new Set([...prev, message.data.stepId]));
          toast.success(`${message.data.stepTitle || 'Step'} completed successfully`);
        }
        break;

      case 'config_updated':
        if (message.data?.config) {
          setConfig((prev) => ({ ...prev, ...message.data.config }));
        }
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, []);

  // Send WebSocket message
  const sendWebSocketMessage = useCallback(
    (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            ...message,
            sessionId,
            timestamp: Date.now(),
          }),
        );
      }
    },
    [sessionId],
  );

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        const sessionId = await initializeSession();
        connectWebSocket(sessionId);
      } catch (err) {
        console.error('Failed to initialize setup wizard:', err);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [initializeSession, connectWebSocket]);

  // Calculated values
  const currentStep = setupSteps[currentStepIndex] || setupSteps[0];
  const progress = ((currentStepIndex + 1) / setupSteps.length) * 100;

  // Actions
  const nextStep = useCallback(() => {
    if (currentStepIndex < setupSteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      const fromStep = setupSteps[currentStepIndex];
      const toStep = setupSteps[newIndex];

      setCurrentStepIndex(newIndex);
      setValidation(null);
      setError(null);

      if (fromStep && toStep) {
        sendWebSocketMessage({
          type: 'step_changed',
          data: {
            from: fromStep.id,
            to: toStep.id,
            direction: 'next',
          },
        });
      }
    }
  }, [currentStepIndex, sendWebSocketMessage]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      const fromStep = setupSteps[currentStepIndex];
      const toStep = setupSteps[newIndex];

      setCurrentStepIndex(newIndex);
      setValidation(null);
      setError(null);

      if (fromStep && toStep) {
        sendWebSocketMessage({
          type: 'step_changed',
          data: {
            from: fromStep.id,
            to: toStep.id,
            direction: 'previous',
          },
        });
      }
    }
  }, [currentStepIndex, sendWebSocketMessage]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < setupSteps.length) {
        const oldIndex = currentStepIndex;
        const fromStep = setupSteps[oldIndex];
        const toStep = setupSteps[stepIndex];

        setCurrentStepIndex(stepIndex);
        setValidation(null);
        setError(null);

        if (fromStep && toStep) {
          sendWebSocketMessage({
            type: 'step_changed',
            data: {
              from: fromStep.id,
              to: toStep.id,
              direction: stepIndex > oldIndex ? 'next' : 'previous',
            },
          });
        }
      }
    },
    [currentStepIndex, sendWebSocketMessage],
  );

  const updateConfig = useCallback(
    (updates: Partial<SetupConfig>) => {
      setConfig((prev) => {
        const newConfig = { ...prev, ...updates };

        // Send update to server
        sendWebSocketMessage({
          type: 'config_update',
          data: {
            stepId: currentStep?.id || 'unknown',
            updates,
            fullConfig: newConfig,
          },
        });

        return newConfig;
      });
    },
    [currentStep, sendWebSocketMessage],
  );

  const validateStep = useCallback(
    async (stepId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/setup/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            stepId,
            config,
          }),
        });

        if (!response.ok) {
          throw new Error(`Validation failed: ${response.statusText}`);
        }

        const result = await response.json();
        setValidation(result.validation);
        setSuggestions(result.suggestions || []);

        if (result.validation?.valid) {
          setCompletedSteps((prev) => new Set([...prev, stepId]));
          toast.success('Step validation successful');
        } else {
          toast.error('Please fix the validation errors before continuing');
        }

        return result.validation?.valid || false;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Validation failed';
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, config],
  );

  const skipStep = useCallback(
    (stepId: string) => {
      setSkippedSteps((prev) => new Set([...prev, stepId]));

      sendWebSocketMessage({
        type: 'step_skipped',
        data: { stepId },
      });

      toast.info(`${currentStep?.title || 'Step'} skipped`);
      nextStep();
    },
    [currentStep, nextStep, sendWebSocketMessage],
  );

  const resetWizard = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/setup/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error(`Reset failed: ${response.statusText}`);
      }

      // Reset local state
      setCurrentStepIndex(0);
      setConfig({});
      setValidation(null);
      setError(null);
      setCompletedSteps(new Set());
      setSkippedSteps(new Set());
      setSuggestions([]);

      toast.success('Setup wizard reset successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const retryConnection = useCallback(() => {
    if (sessionId) {
      setError(null);
      reconnectAttempts.current = 0;
      connectWebSocket(sessionId);
    } else {
      initializeSession().then((sessionId) => {
        if (sessionId) {
          connectWebSocket(sessionId);
        }
      });
    }
  }, [sessionId, connectWebSocket, initializeSession]);

  return {
    // Current state
    currentStep: currentStep as StepData, // Safe assertion since we fallback to setupSteps[0]
    currentStepIndex,
    sessionId,
    isConnected,
    progress,
    config,
    validation,
    suggestions,
    isLoading,
    error,

    // Actions
    nextStep,
    previousStep,
    goToStep,
    updateConfig,
    validateStep,
    skipStep,
    resetWizard,
    retryConnection,
  };
};
