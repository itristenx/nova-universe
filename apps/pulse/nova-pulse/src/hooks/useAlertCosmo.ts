import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, CreateAlertRequest, EscalateAlertRequest } from '../types/alerts';

interface CosmoAlertContext {
  ticketId?: string;
  alertId?: string;
  priority?: string;
  customerTier?: string;
  affectedUsers?: number;
  serviceCategory?: string;
  keywords?: string[];
}

interface CosmoAlertResponse {
  action: 'create_alert' | 'escalate_alert' | 'suggest_resolution' | 'no_action';
  reasoning: string;
  confidence: number;
  alertData?: CreateAlertRequest;
  escalationData?: EscalateAlertRequest;
  suggestions?: string[];
  metadata?: Record<string, any>;
}

interface UseAlertCosmoProps {
  context?: CosmoAlertContext;
  onAlertCreated?: (alert: Alert) => void;
  onAlertEscalated?: (escalation: any) => void;
  onSuggestionReceived?: (suggestions: string[]) => void;
}

export const useAlertCosmo = ({
  context,
  onAlertCreated,
  onAlertEscalated,
  onSuggestionReceived,
}: UseAlertCosmoProps = {}) => {
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<CosmoAlertResponse | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<CosmoAlertResponse[]>([]);

  // Cosmo analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (analysisContext: CosmoAlertContext & { message?: string }) => {
      const response = await fetch('/api/v2/synth/alerts/analyze', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: analysisContext,
          message:
            analysisContext.message || 'Please analyze this situation and recommend alert actions',
          module: 'pulse',
          userRole: 'technician', // This would come from user context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze with Cosmo');
      }

      const data = await response.json();
      return data.analysis as CosmoAlertResponse;
    },
    onSuccess: (analysis) => {
      setLastAnalysis(analysis);
      setAnalysisHistory((prev) => [analysis, ...prev.slice(0, 9)]); // Keep last 10

      // Handle suggestions
      if (analysis.suggestions && analysis.suggestions.length > 0) {
        onSuggestionReceived?.(analysis.suggestions);
      }
    },
  });

  // Auto-escalate mutation
  const autoEscalateMutation = useMutation({
    mutationFn: async (escalationData: EscalateAlertRequest) => {
      const response = await fetch(`/api/v2/alerts/escalate/${escalationData.ticketId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(escalationData),
      });

      if (!response.ok) {
        throw new Error('Failed to escalate alert');
      }

      return response.json();
    },
    onSuccess: (escalation) => {
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      onAlertEscalated?.(escalation);
    },
  });

  // Auto-create alert mutation
  const autoCreateMutation = useMutation({
    mutationFn: async (alertData: CreateAlertRequest) => {
      const response = await fetch('/api/v2/alerts/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...alertData,
          source: 'cosmo',
          metadata: {
            ...alertData.metadata,
            cosmoGenerated: true,
            cosmoConfidence: lastAnalysis?.confidence,
            cosmoReasoning: lastAnalysis?.reasoning,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create alert');
      }

      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      onAlertCreated?.(result.alert);
    },
  });

  // Main analysis function
  const analyzeWithCosmo = useCallback(
    async (analysisContext: CosmoAlertContext, message?: string): Promise<CosmoAlertResponse> => {
      setIsAnalyzing(true);

      try {
        const fullContext = { ...context, ...analysisContext, message };
        const analysis = await analyzeMutation.mutateAsync(fullContext);

        return analysis;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [context, analyzeMutation],
  );

  // Execute Cosmo recommendation
  const executeRecommendation = useCallback(
    async (analysis?: CosmoAlertResponse): Promise<void> => {
      const targetAnalysis = analysis || lastAnalysis;

      if (!targetAnalysis) {
        throw new Error('No analysis available to execute');
      }

      switch (targetAnalysis.action) {
        case 'create_alert':
          if (targetAnalysis.alertData) {
            await autoCreateMutation.mutateAsync(targetAnalysis.alertData);
          }
          break;

        case 'escalate_alert':
          if (targetAnalysis.escalationData) {
            await autoEscalateMutation.mutateAsync(targetAnalysis.escalationData);
          }
          break;

        case 'suggest_resolution':
          // Suggestions are handled in the onSuccess callback
          break;

        case 'no_action':
          // No action needed
          break;

        default:
          console.warn('Unknown Cosmo action:', targetAnalysis.action);
      }
    },
    [lastAnalysis, autoCreateMutation, autoEscalateMutation],
  );

  // Smart ticket analysis - analyzes a ticket and suggests alert actions
  const analyzeTicket = useCallback(
    async (ticketData: {
      id: string;
      title: string;
      description: string;
      priority: string;
      category: string;
      customerTier?: string;
      affectedUsers?: number;
    }): Promise<CosmoAlertResponse> => {
      return analyzeWithCosmo(
        {
          ticketId: ticketData.id,
          priority: ticketData.priority,
          customerTier: ticketData.customerTier,
          affectedUsers: ticketData.affectedUsers,
          serviceCategory: ticketData.category,
          keywords: extractKeywords(ticketData.title + ' ' + ticketData.description),
        },
        `Analyze ticket "${ticketData.title}" and determine if an alert should be created or escalated.`,
      );
    },
    [analyzeWithCosmo],
  );

  // Smart escalation - analyzes current alert state and suggests escalation
  const analyzeEscalation = useCallback(
    async (alertData: Alert): Promise<CosmoAlertResponse> => {
      const timeSinceCreated = Date.now() - new Date(alertData.createdAt).getTime();
      const timeSinceAcknowledged = alertData.acknowledgedAt
        ? Date.now() - new Date(alertData.acknowledgedAt).getTime()
        : null;

      return analyzeWithCosmo(
        {
          alertId: alertData.id,
          priority: alertData.priority,
          ticketId: alertData.ticketId,
          serviceCategory: alertData.serviceName,
          keywords: extractKeywords(alertData.summary + ' ' + (alertData.description || '')),
        },
        `Analyze alert "${alertData.summary}" (created ${Math.floor(timeSinceCreated / 60000)} minutes ago${
          timeSinceAcknowledged
            ? `, acknowledged ${Math.floor(timeSinceAcknowledged / 60000)} minutes ago`
            : ', not yet acknowledged'
        }) and determine if escalation is needed.`,
      );
    },
    [analyzeWithCosmo],
  );

  // Continuous monitoring mode
  const startContinuousMonitoring = useCallback(
    (
      monitoringContext: CosmoAlertContext,
      intervalMs: number = 300000, // 5 minutes default
    ) => {
      const interval = setInterval(async () => {
        try {
          await analyzeWithCosmo(
            monitoringContext,
            'Perform periodic analysis for potential alert actions',
          );
        } catch (error) {
          console.error('Continuous monitoring error:', error);
        }
      }, intervalMs);

      return () => clearInterval(interval);
    },
    [analyzeWithCosmo],
  );

  // Helper function to extract keywords from text
  const extractKeywords = (text: string): string[] => {
    const alertKeywords = [
      'critical',
      'urgent',
      'emergency',
      'outage',
      'down',
      'failed',
      'error',
      'security',
      'breach',
      'malware',
      'phishing',
      'unauthorized',
      'performance',
      'slow',
      'timeout',
      'latency',
      'degraded',
      'network',
      'connectivity',
      'disconnected',
      'unreachable',
      'server',
      'database',
      'application',
      'service',
      'infrastructure',
    ];

    const words = text.toLowerCase().split(/\s+/);
    return alertKeywords.filter((keyword) => words.some((word) => word.includes(keyword)));
  };

  return {
    // State
    isAnalyzing: isAnalyzing || analyzeMutation.isPending,
    lastAnalysis,
    analysisHistory,

    // Actions
    analyzeWithCosmo,
    executeRecommendation,
    analyzeTicket,
    analyzeEscalation,
    startContinuousMonitoring,

    // Status
    isCreatingAlert: autoCreateMutation.isPending,
    isEscalating: autoEscalateMutation.isPending,

    // Errors
    analysisError: analyzeMutation.error,
    createError: autoCreateMutation.error,
    escalationError: autoEscalateMutation.error,
  };
};
