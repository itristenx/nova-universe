import { useState, useEffect, useCallback, useRef } from 'react';
import { CosmoSDK } from './CosmoSDK';
import {
  CosmoConfig,
  CosmoContext,
  CosmoMessage,
  CosmoConversation,
  CosmoEvent,
  CosmoEventType,
} from './types';

export interface UseCosmoOptions {
  autoStart?: boolean;
  initialMessage?: string;
  onMessage?: (message: CosmoMessage) => void;
  onEscalation?: (escalation: any) => void;
  onXPAwarded?: (xp: any) => void;
  onError?: (error: any) => void;
}

export interface UseCosmoReturn {
  // State
  conversation: CosmoConversation | null;
  messages: CosmoMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;

  // Actions
  sendMessage: (text: string) => Promise<void>;
  startConversation: (initialMessage?: string) => Promise<void>;
  endConversation: () => Promise<void>;
  triggerEscalation: (
    reason: string,
    level?: 'low' | 'medium' | 'high' | 'critical',
  ) => Promise<void>;
  clearError: () => void;

  // SDK instance (for advanced usage)
  sdk: CosmoSDK | null;
}

export function useCosmo(
  config: CosmoConfig,
  context: CosmoContext,
  options: UseCosmoOptions = {},
): UseCosmoReturn {
  const [sdk, setSdk] = useState<CosmoSDK | null>(null);
  const [conversation, setConversation] = useState<CosmoConversation | null>(null);
  const [messages, setMessages] = useState<CosmoMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Initialize SDK
  useEffect(() => {
    const cosmoSDK = new CosmoSDK(config);

    // Set up event handlers
    cosmoSDK.on('message', (event: CosmoEvent) => {
      const message = event.data.message as CosmoMessage;
      setMessages((prev: CosmoMessage[]) => {
        // Avoid duplicates
        if (prev.some((m: CosmoMessage) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });

      if (optionsRef.current.onMessage) {
        optionsRef.current.onMessage(message);
      }
    });

    cosmoSDK.on('conversation_started', (event: CosmoEvent) => {
      const conversation = event.data.conversation as CosmoConversation;
      setConversation(conversation);
      setMessages(conversation.messages);
    });

    cosmoSDK.on('conversation_ended', (event: CosmoEvent) => {
      setConversation(null);
      setMessages([]);
    });

    cosmoSDK.on('escalation_created', (event: CosmoEvent) => {
      if (optionsRef.current.onEscalation) {
        optionsRef.current.onEscalation(event.data);
      }
    });

    cosmoSDK.on('xp_awarded', (event: CosmoEvent) => {
      if (optionsRef.current.onXPAwarded) {
        optionsRef.current.onXPAwarded(event.data);
      }
    });

    cosmoSDK.on('connection_status', (event: CosmoEvent) => {
      setIsConnected(event.data.connected);
    });

    cosmoSDK.on('error', (event: CosmoEvent) => {
      const errorMessage =
        typeof event.data === 'string' ? event.data : event.data.error || 'Unknown error';
      setError(errorMessage);

      if (optionsRef.current.onError) {
        optionsRef.current.onError(event.data);
      }
    });

    // Initialize SDK
    cosmoSDK
      .initialize(context)
      .then(() => {
        setSdk(cosmoSDK);

        // Auto-start conversation if enabled
        if (options.autoStart) {
          startConversationInternal(cosmoSDK, options.initialMessage);
        }
      })
      .catch((err) => {
        setError(err.message);
        if (optionsRef.current.onError) {
          optionsRef.current.onError(err);
        }
      });

    // Cleanup on unmount
    return () => {
      cosmoSDK.dispose();
    };
  }, [config.apiUrl, context.userId, context.tenantId]); // Re-initialize if key config changes

  const startConversationInternal = async (sdkInstance: CosmoSDK, initialMessage?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await sdkInstance.startConversation(initialMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = useCallback(
    async (initialMessage?: string) => {
      if (!sdk) {
        setError('SDK not initialized');
        return;
      }

      await startConversationInternal(sdk, initialMessage);
    },
    [sdk],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!sdk) {
        setError('SDK not initialized');
        return;
      }

      if (!text.trim()) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await sdk.sendMessage(text);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [sdk],
  );

  const endConversation = useCallback(async () => {
    if (!sdk) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sdk.endConversation();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end conversation';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const triggerEscalation = useCallback(
    async (reason: string, level: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
      if (!sdk) {
        setError('SDK not initialized');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await sdk.triggerEscalation(reason, level);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to trigger escalation';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [sdk],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    conversation,
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    startConversation,
    endConversation,
    triggerEscalation,
    clearError,
    sdk,
  };
}
