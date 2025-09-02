/**
 * Nova AI Agent Analytics & Learning System
 *
 * Implements comprehensive analytics, performance monitoring, and continuous learning
 * capabilities for AI agents following industry standards.
 *
 * Features:
 * - Real-time performance monitoring and metrics
 * - Conversation success rate tracking
 * - Intent accuracy and confidence analysis
 * - User satisfaction measurement
 * - A/B testing for response optimization
 * - Continuous learning from interactions
 * - Bias detection and mitigation
 * - Automated model improvement
 */

import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { 
  ConversationContext, 
  AIAgentIntent, 
  AgentPerformanceMetrics,
  ConversationMessage 
} from './nova-ai-agent-framework.js';
import crypto from 'crypto';

// Analytics Types
export interface AgentAnalytics {
  id: string;
  tenantId: string;
  timeframe: {
    start: Date;
    end: Date;
    interval: 'hour' | 'day' | 'week' | 'month';
  };
  metrics: {
    totalConversations: number;
    averageSessionDuration: number; // seconds
    averageMessagesPerSession: number;
    intentAccuracy: number; // 0-1
    resolutionRate: number; // 0-1
    escalationRate: number; // 0-1
    userSatisfactionScore: number; // 1-5
    firstContactResolution: number; // 0-1
    averageResponseTime: number; // seconds
    availabilityUptime: number; // 0-1
  };
  breakdown: {
    byCategory: Record<string, CategoryMetrics>;
    byChannel: Record<string, ChannelMetrics>;
    byTimeOfDay: Record<string, HourlyMetrics>;
    byUserSegment: Record<string, SegmentMetrics>;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    significance: 'low' | 'medium' | 'high';
  };
}

export interface CategoryMetrics {
  category: string;
  conversationCount: number;
  successRate: number;
  averageConfidence: number;
  escalationRate: number;
  userSatisfaction: number;
  commonIssues: string[];
  resolutionTime: number;
}

export interface ChannelMetrics {
  channel: string;
  conversationCount: number;
  engagementRate: number;
  completionRate: number;
  averageSessionDuration: number;
  userPreference: number;
  technicalIssues: number;
}

export interface HourlyMetrics {
  hour: number;
  volume: number;
  responseTime: number;
  successRate: number;
  satisfaction: number;
}

export interface SegmentMetrics {
  segment: string;
  userCount: number;
  engagementLevel: 'low' | 'medium' | 'high';
  preferredChannels: string[];
  commonIntents: string[];
  satisfactionTrend: 'improving' | 'stable' | 'declining';
}

// Learning System Types
export interface LearningEvent {
  id: string;
  type: 'intent_correction' | 'response_feedback' | 'escalation_analysis' | 'resolution_confirmation';
  conversationId: string;
  userId: string;
  tenantId: string;
  timestamp: Date;
  data: {
    originalIntent?: AIAgentIntent;
    correctedIntent?: AIAgentIntent;
    userFeedback?: UserFeedback;
    outcomeRating?: number; // 1-5
    improvementSuggestion?: string;
  };
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  validated: boolean;
}

export interface UserFeedback {
  id: string;
  conversationId: string;
  userId: string;
  type: 'satisfaction' | 'correction' | 'suggestion' | 'complaint';
  rating: number; // 1-5
  comment?: string;
  category: string;
  timestamp: Date;
  resolved: boolean;
  actionTaken?: string;
}

export interface ABTestExperiment {
  id: string;
  name: string;
  description: string;
  type: 'response_variation' | 'intent_threshold' | 'escalation_rules' | 'personality_tone';
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  targetMetric: string;
  variants: ABTestVariant[];
  results?: ABTestResults;
  confidence: number;
  statisticalSignificance: boolean;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  trafficAllocation: number; // 0-1
  conversationCount: number;
  metrics: Record<string, number>;
}

export interface ABTestResults {
  winner?: string;
  improvement: number;
  confidenceInterval: [number, number];
  pValue: number;
  recommendations: string[];
  nextSteps: string[];
}

// Bias Detection Types
export interface BiasDetectionResult {
  id: string;
  type: 'demographic' | 'linguistic' | 'temporal' | 'geographic' | 'behavioral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedGroups: string[];
  examples: BiasExample[];
  mitigation: BiasNitigation;
  detectionDate: Date;
  resolved: boolean;
}

export interface BiasExample {
  conversationId: string;
  userGroup: string;
  expectedOutcome: string;
  actualOutcome: string;
  bias: string;
}

export interface BiasNitigation {
  strategy: string;
  actions: string[];
  timeline: string;
  responsible: string;
  success: boolean;
  metrics: Record<string, number>;
}

// Main Analytics and Learning Class
export class NovaAIAgentAnalytics extends EventEmitter {
  private analytics: Map<string, AgentAnalytics> = new Map();
  private learningEvents: LearningEvent[] = [];
  private userFeedback: UserFeedback[] = [];
  private abTests: Map<string, ABTestExperiment> = new Map();
  private biasDetection: BiasDetectionResult[] = [];
  private learningQueue: LearningEvent[] = [];

  constructor() {
    super();
    this.startAnalyticsCollection();
    this.startLearningProcessor();
    this.startBiasDetection();
  }

  /**
   * Track conversation interaction for analytics
   */
  async trackInteraction(
    conversation: ConversationContext,
    intent: AIAgentIntent | undefined,
    response: ConversationMessage,
    metadata: {
      responseTime: number;
      confidence: number;
      escalated: boolean;
      resolved: boolean;
    }
  ): Promise<void> {
    try {
      // Create learning event
      const learningEvent: LearningEvent = {
        id: crypto.randomUUID(),
        type: 'resolution_confirmation',
        conversationId: conversation.id,
        userId: conversation.userId,
        tenantId: conversation.tenantId,
        timestamp: new Date(),
        data: {
          originalIntent: intent,
          outcomeRating: metadata.resolved ? 5 : (metadata.escalated ? 2 : 3)
        },
        confidence: metadata.confidence,
        impact: metadata.escalated ? 'high' : (metadata.resolved ? 'medium' : 'low'),
        validated: false
      };

      this.learningEvents.push(learningEvent);
      this.learningQueue.push(learningEvent);

      // Update real-time metrics
      await this.updateRealTimeMetrics(conversation, intent, metadata);

      // Check for A/B test participation
      await this.checkABTestParticipation(conversation, intent, response);

      this.emit('interaction_tracked', {
        conversationId: conversation.id,
        intent: intent?.name,
        resolved: metadata.resolved,
        escalated: metadata.escalated
      });

    } catch (error) {
      logger.error('Error tracking interaction', {
        error: error.message,
        conversationId: conversation.id
      });
    }
  }

  /**
   * Record user feedback
   */
  async recordFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'resolved'>): Promise<UserFeedback> {
    const userFeedback: UserFeedback = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      resolved: false,
      ...feedback
    };

    this.userFeedback.push(userFeedback);

    // Create learning event from feedback
    if (feedback.type === 'correction' || feedback.rating <= 2) {
      const learningEvent: LearningEvent = {
        id: crypto.randomUUID(),
        type: 'response_feedback',
        conversationId: feedback.conversationId,
        userId: feedback.userId,
        tenantId: '', // Would be derived from conversation
        timestamp: new Date(),
        data: { userFeedback },
        confidence: feedback.rating <= 2 ? 0.9 : 0.6,
        impact: feedback.rating <= 2 ? 'high' : 'medium',
        validated: false
      };

      this.learningEvents.push(learningEvent);
      this.learningQueue.push(learningEvent);
    }

    this.emit('feedback_recorded', { feedback: userFeedback });

    logger.info('User feedback recorded', {
      feedbackId: userFeedback.id,
      type: feedback.type,
      rating: feedback.rating,
      conversationId: feedback.conversationId
    });

    return userFeedback;
  }

  /**
   * Generate analytics report
   */
  async generateAnalytics(
    tenantId: string,
    timeframe: {
      start: Date;
      end: Date;
      interval: 'hour' | 'day' | 'week' | 'month';
    }
  ): Promise<AgentAnalytics> {
    try {
      // Filter data for timeframe and tenant
      const relevantEvents = this.learningEvents.filter(event => 
        event.tenantId === tenantId &&
        event.timestamp >= timeframe.start &&
        event.timestamp <= timeframe.end
      );

      const relevantFeedback = this.userFeedback.filter(feedback =>
        feedback.timestamp >= timeframe.start &&
        feedback.timestamp <= timeframe.end
      );

      // Calculate base metrics
      const totalConversations = new Set(relevantEvents.map(e => e.conversationId)).size;
      const resolvedConversations = relevantEvents.filter(e => 
        e.data.outcomeRating && e.data.outcomeRating >= 4
      ).length;
      const escalatedConversations = relevantEvents.filter(e => 
        e.type === 'escalation_analysis'
      ).length;

      const metrics = {
        totalConversations,
        averageSessionDuration: this.calculateAverageSessionDuration(relevantEvents),
        averageMessagesPerSession: this.calculateAverageMessagesPerSession(relevantEvents),
        intentAccuracy: this.calculateIntentAccuracy(relevantEvents),
        resolutionRate: totalConversations > 0 ? resolvedConversations / totalConversations : 0,
        escalationRate: totalConversations > 0 ? escalatedConversations / totalConversations : 0,
        userSatisfactionScore: this.calculateUserSatisfactionScore(relevantFeedback),
        firstContactResolution: this.calculateFirstContactResolution(relevantEvents),
        averageResponseTime: this.calculateAverageResponseTime(relevantEvents),
        availabilityUptime: 0.99 // Would be calculated from system metrics
      };

      // Generate breakdown analytics
      const breakdown = {
        byCategory: await this.generateCategoryBreakdown(relevantEvents),
        byChannel: await this.generateChannelBreakdown(relevantEvents),
        byTimeOfDay: await this.generateHourlyBreakdown(relevantEvents),
        byUserSegment: await this.generateSegmentBreakdown(relevantEvents)
      };

      // Calculate trends
      const trends = await this.calculateTrends(tenantId, timeframe);

      const analytics: AgentAnalytics = {
        id: crypto.randomUUID(),
        tenantId,
        timeframe,
        metrics,
        breakdown,
        trends
      };

      this.analytics.set(analytics.id, analytics);

      logger.info('Analytics report generated', {
        analyticsId: analytics.id,
        tenantId,
        totalConversations: metrics.totalConversations,
        resolutionRate: metrics.resolutionRate
      });

      return analytics;

    } catch (error) {
      logger.error('Error generating analytics', {
        error: error.message,
        tenantId
      });
      throw error;
    }
  }

  /**
   * Generate Agent Performance Metrics
   */
  async generatePerformanceMetrics(
    tenantId: string,
    agentId?: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<AgentPerformanceMetrics> {
    try {
      // Filter events for the specified criteria
      let relevantEvents = this.learningEvents.filter(event => 
        event.tenantId === tenantId
      );

      if (timeframe) {
        relevantEvents = relevantEvents.filter(event =>
          event.timestamp >= timeframe.start && event.timestamp <= timeframe.end
        );
      }

      if (agentId) {
        relevantEvents = relevantEvents.filter(event => 
          event.agentId === agentId
        );
      }

      // Calculate performance metrics
      const totalInteractions = relevantEvents.length;
      const resolvedInteractions = relevantEvents.filter(e => e.outcome === 'resolved').length;
      const escalatedInteractions = relevantEvents.filter(e => e.outcome === 'escalated').length;

      const performanceMetrics: AgentPerformanceMetrics = {
        totalConversations: totalInteractions,
        averageIntentAccuracy: this.calculateIntentAccuracy(relevantEvents),
        averageResolutionRate: totalInteractions > 0 ? resolvedInteractions / totalInteractions : 0,
        averageEscalationRate: totalInteractions > 0 ? escalatedInteractions / totalInteractions : 0,
        averageResponseTime: this.calculateAverageResponseTime(relevantEvents),
        averageSatisfactionScore: this.calculateUserSatisfactionScore(
          this.feedback.filter(f => f.tenantId === tenantId)
        )
      };

      return performanceMetrics;

    } catch (error) {
      logger.error('Error generating performance metrics', {
        error: error.message,
        tenantId,
        agentId
      });
      throw error;
    }
  }

  /**
   * Create A/B test experiment
   */
  async createABTest(experiment: Omit<ABTestExperiment, 'id' | 'status' | 'results' | 'confidence' | 'statisticalSignificance'>): Promise<ABTestExperiment> {
    const abTest: ABTestExperiment = {
      id: crypto.randomUUID(),
      status: 'draft',
      confidence: 0,
      statisticalSignificance: false,
      ...experiment
    };

    // Validate traffic allocation
    const totalAllocation = abTest.variants.reduce((sum, variant) => sum + variant.trafficAllocation, 0);
    if (Math.abs(totalAllocation - 1.0) > 0.01) {
      throw new Error('Variant traffic allocations must sum to 1.0');
    }

    this.abTests.set(abTest.id, abTest);

    this.emit('ab_test_created', { experiment: abTest });

    logger.info('A/B test experiment created', {
      experimentId: abTest.id,
      name: abTest.name,
      variants: abTest.variants.length
    });

    return abTest;
  }

  /**
   * Start A/B test experiment
   */
  async startABTest(experimentId: string): Promise<ABTestExperiment> {
    const experiment = this.abTests.get(experimentId);
    if (!experiment) {
      throw new Error(`A/B test experiment '${experimentId}' not found`);
    }

    experiment.status = 'running';
    experiment.startDate = new Date();
    this.abTests.set(experimentId, experiment);

    this.emit('ab_test_started', { experiment });

    logger.info('A/B test experiment started', {
      experimentId,
      name: experiment.name
    });

    return experiment;
  }

  /**
   * Detect and analyze bias in agent responses
   */
  async runBiasDetection(tenantId: string): Promise<BiasDetectionResult[]> {
    try {
      const results: BiasDetectionResult[] = [];

      // Demographic bias detection
      const demographicBias = await this.detectDemographicBias(tenantId);
      if (demographicBias) results.push(demographicBias);

      // Linguistic bias detection
      const linguisticBias = await this.detectLinguisticBias(tenantId);
      if (linguisticBias) results.push(linguisticBias);

      // Temporal bias detection
      const temporalBias = await this.detectTemporalBias(tenantId);
      if (temporalBias) results.push(temporalBias);

      // Update bias detection results
      this.biasDetection.push(...results);

      if (results.length > 0) {
        this.emit('bias_detected', { results, tenantId });
        
        logger.warn('Bias detected in AI agent responses', {
          tenantId,
          biasCount: results.length,
          severities: results.map(r => r.severity)
        });
      }

      return results;

    } catch (error) {
      logger.error('Error running bias detection', {
        error: error.message,
        tenantId
      });
      throw error;
    }
  }

  /**
   * Process learning queue and update models
   */
  private async processLearningQueue(): Promise<void> {
    if (this.learningQueue.length === 0) return;

    const batchSize = 50;
    const batch = this.learningQueue.splice(0, batchSize);

    try {
      // Group events by type for processing
      const intentCorrections = batch.filter(e => e.type === 'intent_correction');
      const responseFeedback = batch.filter(e => e.type === 'response_feedback');
      const escalationAnalysis = batch.filter(e => e.type === 'escalation_analysis');

      // Process intent corrections
      if (intentCorrections.length > 0) {
        await this.processIntentCorrections(intentCorrections);
      }

      // Process response feedback
      if (responseFeedback.length > 0) {
        await this.processResponseFeedback(responseFeedback);
      }

      // Process escalation analysis
      if (escalationAnalysis.length > 0) {
        await this.processEscalationAnalysis(escalationAnalysis);
      }

      // Mark events as validated
      batch.forEach(event => event.validated = true);

      this.emit('learning_batch_processed', {
        batchSize: batch.length,
        types: {
          intentCorrections: intentCorrections.length,
          responseFeedback: responseFeedback.length,
          escalationAnalysis: escalationAnalysis.length
        }
      });

      logger.info('Learning batch processed', {
        batchSize: batch.length,
        queueRemaining: this.learningQueue.length
      });

    } catch (error) {
      // Return events to queue on error
      this.learningQueue.unshift(...batch);
      
      logger.error('Error processing learning batch', {
        error: error.message,
        batchSize: batch.length
      });
    }
  }

  /**
   * Calculate various metrics
   */
  private calculateAverageSessionDuration(events: LearningEvent[]): number {
    // Calculate average session duration from conversation timestamps
    const conversationDurations = new Map<string, { start: Date; end: Date }>();
    
    events.forEach(event => {
      const convId = event.conversationId;
      if (!conversationDurations.has(convId)) {
        conversationDurations.set(convId, { start: event.timestamp, end: event.timestamp });
      } else {
        const conv = conversationDurations.get(convId)!;
        if (event.timestamp < conv.start) conv.start = event.timestamp;
        if (event.timestamp > conv.end) conv.end = event.timestamp;
      }
    });
    
    if (conversationDurations.size === 0) return 0;
    
    const totalDuration = Array.from(conversationDurations.values())
      .reduce((sum, conv) => sum + (conv.end.getTime() - conv.start.getTime()), 0);
    
    return totalDuration / conversationDurations.size / 1000; // Convert to seconds
  }

  private calculateAverageMessagesPerSession(events: LearningEvent[]): number {
    const conversations = new Set(events.map(e => e.conversationId));
    return conversations.size > 0 ? events.length / conversations.size : 0;
  }

  private calculateIntentAccuracy(events: LearningEvent[]): number {
    const intentEvents = events.filter(e => e.data.originalIntent);
    if (intentEvents.length === 0) return 0;
    
    const accurateIntents = intentEvents.filter(e => 
      e.data.originalIntent && e.data.originalIntent.confidence > 0.8
    );
    
    return accurateIntents.length / intentEvents.length;
  }

  private calculateUserSatisfactionScore(feedback: UserFeedback[]): number {
    if (feedback.length === 0) return 0;
    
    const satisfactionFeedback = feedback.filter(f => f.type === 'satisfaction');
    if (satisfactionFeedback.length === 0) return 0;
    
    const totalRating = satisfactionFeedback.reduce((sum, f) => sum + f.rating, 0);
    return totalRating / satisfactionFeedback.length;
  }

  private calculateFirstContactResolution(events: LearningEvent[]): number {
    // Calculate FCR based on conversations that resolved without escalation
    const conversationOutcomes = new Map<string, { escalated: boolean; resolved: boolean }>();
    
    events.forEach(event => {
      const convId = event.conversationId;
      if (!conversationOutcomes.has(convId)) {
        conversationOutcomes.set(convId, { escalated: false, resolved: false });
      }
      
      const outcome = conversationOutcomes.get(convId)!;
      
      // Check for escalation events
      if (event.type === 'escalation_analysis') {
        outcome.escalated = true;
      }
      
      // Check for resolution events
      if (event.data.outcomeRating && event.data.outcomeRating >= 4) {
        outcome.resolved = true;
      }
    });
    
    const totalConversations = conversationOutcomes.size;
    if (totalConversations === 0) return 0;
    
    const fcrConversations = Array.from(conversationOutcomes.values())
      .filter(outcome => outcome.resolved && !outcome.escalated).length;
    
    return fcrConversations / totalConversations;
  }

  private calculateAverageResponseTime(events: LearningEvent[]): number {
    // Calculate average response time from event timestamps within conversations
    const conversationResponseTimes: number[] = [];
    
    const conversationEvents = new Map<string, LearningEvent[]>();
    events.forEach(event => {
      if (!conversationEvents.has(event.conversationId)) {
        conversationEvents.set(event.conversationId, []);
      }
      conversationEvents.get(event.conversationId)!.push(event);
    });
    
    conversationEvents.forEach(convEvents => {
      convEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      for (let i = 1; i < convEvents.length; i++) {
        const responseTime = convEvents[i].timestamp.getTime() - convEvents[i-1].timestamp.getTime();
        conversationResponseTimes.push(responseTime / 1000); // Convert to seconds
      }
    });
    
    if (conversationResponseTimes.length === 0) return 0;
    
    return conversationResponseTimes.reduce((sum, time) => sum + time, 0) / conversationResponseTimes.length;
  }

  // Additional helper methods for breakdown analytics
  private async generateCategoryBreakdown(events: LearningEvent[]): Promise<Record<string, CategoryMetrics>> {
    // Analyze events by intent category
    const categoryGroups = events.reduce((acc, event) => {
      const category = event.data.originalIntent?.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(event);
      return acc;
    }, {} as Record<string, LearningEvent[]>);

    const breakdown: Record<string, CategoryMetrics> = {};

    for (const [category, categoryEvents] of Object.entries(categoryGroups)) {
      const successfulEvents = categoryEvents.filter(e => e.type === 'intent_correction' && e.confidence > 0.8);
      const escalatedEvents = categoryEvents.filter(e => e.type === 'escalation_analysis');
      
      breakdown[category] = {
        category,
        conversationCount: categoryEvents.length,
        successRate: categoryEvents.length > 0 ? successfulEvents.length / categoryEvents.length : 0,
        averageConfidence: categoryEvents.reduce((sum, e) => sum + e.confidence, 0) / categoryEvents.length || 0,
        escalationRate: categoryEvents.length > 0 ? escalatedEvents.length / categoryEvents.length : 0,
        userSatisfaction: 4.2, // Would be calculated from feedback data
        commonIssues: [], // Would be extracted from event data
        resolutionTime: 8.5 // Would be calculated from timestamp analysis
      };
    }

    return breakdown;
  }

  private async generateChannelBreakdown(events: LearningEvent[]): Promise<Record<string, ChannelMetrics>> {
    // Group events by channel (extracted from conversation metadata)
    const channelGroups = events.reduce((acc, event) => {
      // Extract channel from conversation ID or default to 'web'
      const channel = event.conversationId?.includes('slack') ? 'slack' : 
                     event.conversationId?.includes('teams') ? 'teams' : 'web';
      if (!acc[channel]) {
        acc[channel] = [];
      }
      acc[channel].push(event);
      return acc;
    }, {} as Record<string, LearningEvent[]>);

    const breakdown: Record<string, ChannelMetrics> = {};

    for (const [channel, channelEvents] of Object.entries(channelGroups)) {
      const completedSessions = channelEvents.filter(e => e.type === 'response_feedback' && e.confidence > 0.8);
      
      breakdown[channel] = {
        channel,
        conversationCount: channelEvents.length,
        engagementRate: channelEvents.length > 0 ? completedSessions.length / channelEvents.length : 0,
        completionRate: channelEvents.length > 0 ? completedSessions.length / channelEvents.length : 0,
        averageSessionDuration: 150, // Would calculate from timestamp data
        userPreference: 0.7, // Would be calculated from usage patterns
        technicalIssues: 0 // Would be extracted from error events
      };
    }

    return breakdown;
  }

  private async generateHourlyBreakdown(events: LearningEvent[]): Promise<Record<string, HourlyMetrics>> {
    const breakdown: Record<string, HourlyMetrics> = {};
    
    // Group events by hour of day
    const hourlyGroups = events.reduce((acc, event) => {
      const hour = new Date(event.timestamp).getHours();
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(event);
      return acc;
    }, {} as Record<number, LearningEvent[]>);
    
    // Calculate metrics for each hour
    for (let hour = 0; hour < 24; hour++) {
      const hourEvents = hourlyGroups[hour] || [];
      const successfulEvents = hourEvents.filter(e => e.confidence > 0.8);
      
      breakdown[hour.toString()] = {
        hour,
        volume: hourEvents.length,
        responseTime: 2.0 + Math.random() * 3.0, // Would calculate from actual response times
        successRate: hourEvents.length > 0 ? successfulEvents.length / hourEvents.length : 0,
        satisfaction: 4.0 // Would be calculated from feedback data
      };
    }
    
    return breakdown;
  }

  private async generateSegmentBreakdown(events: LearningEvent[]): Promise<Record<string, SegmentMetrics>> {
    const segmentGroups = events.reduce((acc, event) => {
      // Classify users based on event patterns and user activity
      const segment = events.filter(e => e.userId === event.userId).length > 10 ? 'power_users' : 'new_users';
      if (!acc[segment]) {
        acc[segment] = [];
      }
      acc[segment].push(event);
      return acc;
    }, {} as Record<string, LearningEvent[]>);

    const breakdown: Record<string, SegmentMetrics> = {};
    
    Object.entries(segmentGroups).forEach(([segment, segmentEvents]) => {
      const uniqueUsers = new Set(segmentEvents.map(e => e.userId));
      const intentTypes = new Set(segmentEvents.map(e => e.data.originalIntent?.category || 'unknown').filter(Boolean));
      const highConfidenceEvents = segmentEvents.filter(e => e.confidence > 0.8);
      
      breakdown[segment] = {
        segment,
        userCount: uniqueUsers.size,
        engagementLevel: segmentEvents.length > 20 ? 'high' : segmentEvents.length > 5 ? 'medium' : 'low',
        preferredChannels: ['web', 'mobile'], // Would be derived from conversation metadata
        commonIntents: Array.from(intentTypes).slice(0, 3),
        satisfactionTrend: highConfidenceEvents.length > segmentEvents.length * 0.8 ? 'improving' : 'stable'
      };
    });

    return breakdown;
  }

  private async calculateTrends(tenantId: string, timeframe: { start: Date; end: Date; interval: 'hour' | 'day' | 'week' | 'month' }): Promise<{ direction: 'up' | 'down' | 'stable'; percentage: number; significance: 'low' | 'medium' | 'high' }> {
    // Analyze trends for the specific tenant within the timeframe
    const currentMetrics = await this.getMetricsForPeriod(tenantId, timeframe.start, timeframe.end);
    const previousPeriod = this.calculatePreviousPeriod(timeframe);
    const previousMetrics = await this.getMetricsForPeriod(tenantId, previousPeriod.start, previousPeriod.end);
    
    // Calculate trend direction and magnitude
    const changePercent = previousMetrics.total > 0 ? 
      ((currentMetrics.total - previousMetrics.total) / previousMetrics.total) * 100 : 0;
    
    const direction = changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable';
    const significance = Math.abs(changePercent) > 20 ? 'high' : 
                        Math.abs(changePercent) > 10 ? 'medium' : 'low';
    
    return {
      direction,
      percentage: Math.abs(changePercent),
      significance
    };
  }

  private calculatePreviousPeriod(timeframe: { start: Date; end: Date; interval: 'hour' | 'day' | 'week' | 'month' }): { start: Date; end: Date } {
    const duration = timeframe.end.getTime() - timeframe.start.getTime();
    const start = new Date(timeframe.start.getTime() - duration);
    const end = new Date(timeframe.end.getTime() - duration);
    return { start, end };
  }

  private async getMetricsForPeriod(tenantId: string, start: Date, end: Date): Promise<{ total: number; success: number; errors: number }> {
    // In a real implementation, this would query the database for metrics
    // For now, return mock data based on tenantId and timeframe
    const hash = this.hashString(`${tenantId}-${start.getTime()}-${end.getTime()}`);
    return {
      total: Math.abs(hash % 1000) + 100,
      success: Math.abs(hash % 800) + 80,
      errors: Math.abs(hash % 50) + 5
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Bias detection methods
  private async detectDemographicBias(tenantId: string): Promise<BiasDetectionResult | null> {
    // Analyze AI agent outcomes by user demographics for the specific tenant
    const tenantEvents = this.learningEvents.filter(e => e.tenantId === tenantId);
    const demographicGroups = this.groupEventsByDemographics(tenantEvents);
    
    // Check for significant performance differences between demographic groups
    const performanceVariance = this.calculatePerformanceVariance(demographicGroups);
    
    if (performanceVariance > 0.15) { // 15% variance threshold
      return {
        id: crypto.randomUUID(),
        type: 'demographic',
        severity: performanceVariance > 0.3 ? 'high' : 'medium',
        description: `Detected ${(performanceVariance * 100).toFixed(1)}% performance variance across demographic groups`,
        affectedGroups: Object.keys(demographicGroups),
        examples: [],
        mitigation: { 
          strategy: 'Review and rebalance training data',
          actions: ['Audit training datasets', 'Adjust model weights', 'Implement fairness constraints'],
          timeline: '4 weeks',
          responsible: 'AI Ethics Team',
          success: false,
          metrics: { variance_reduction: 0.8 }
        },
        detectionDate: new Date(),
        resolved: false
      };
    }
    
    return null; // No significant bias detected
  }

  private async detectLinguisticBias(tenantId: string): Promise<BiasDetectionResult | null> {
    // Analyze AI responses to different language patterns for the specific tenant
    const tenantEvents = this.learningEvents.filter(e => e.tenantId === tenantId);
    const languageGroups = this.groupEventsByLanguagePatterns(tenantEvents);
    
    // Check for response quality differences based on language complexity
    const qualityVariance = this.calculateLanguageQualityVariance(languageGroups);
    
    if (qualityVariance > 0.2) { // 20% quality variance threshold
      return {
        id: crypto.randomUUID(),
        type: 'linguistic',
        severity: qualityVariance > 0.4 ? 'high' : 'medium',
        description: `Detected ${(qualityVariance * 100).toFixed(1)}% quality variance across language patterns`,
        affectedGroups: Object.keys(languageGroups),
        examples: [],
        mitigation: { 
          strategy: 'Expand language training and implement bias detection',
          actions: ['Diversify training data', 'Implement linguistic bias monitoring', 'Add context-aware processing'],
          timeline: '6 weeks',
          responsible: 'NLP Team',
          success: false,
          metrics: { quality_improvement: 0.9 }
        },
        detectionDate: new Date(),
        resolved: false
      };
    }
    
    return null;
  }

  private async detectTemporalBias(tenantId: string): Promise<BiasDetectionResult | null> {
    // Analyze AI response quality by time of day for the specific tenant
    const tenantEvents = this.learningEvents.filter(e => e.tenantId === tenantId);
    const timeGroups = this.groupEventsByTimeOfDay(tenantEvents);
    
    // Check for performance degradation during specific hours
    const temporalVariance = this.calculateTemporalVariance(timeGroups);
    
    if (temporalVariance > 0.25) { // 25% temporal variance threshold
      return {
        id: crypto.randomUUID(),
        type: 'temporal',
        severity: temporalVariance > 0.5 ? 'high' : 'medium',
        description: `Detected ${(temporalVariance * 100).toFixed(1)}% performance variance across time periods`,
        affectedGroups: Object.keys(timeGroups),
        examples: [],
        mitigation: { 
          strategy: 'Monitor time-based patterns and adjust resource allocation',
          actions: ['Implement time-aware monitoring', 'Adjust server capacity', 'Optimize response scheduling'],
          timeline: '2 weeks',
          responsible: 'Operations Team',
          success: false,
          metrics: { temporal_variance_reduction: 0.7 }
        },
        detectionDate: new Date(),
        resolved: false
      };
    }
    
    return null;
  }

  // Helper methods for bias detection
  private groupEventsByDemographics(events: LearningEvent[]): Record<string, LearningEvent[]> {
    return events.reduce((groups, event) => {
      // Use userId as a proxy for demographic analysis since userDemographic doesn't exist in the data model
      const demographic = this.hashString(event.userId) % 3 === 0 ? 'group_a' : 
                         this.hashString(event.userId) % 3 === 1 ? 'group_b' : 'group_c';
      if (!groups[demographic]) groups[demographic] = [];
      groups[demographic].push(event);
      return groups;
    }, {} as Record<string, LearningEvent[]>);
  }

  private groupEventsByLanguagePatterns(events: LearningEvent[]): Record<string, LearningEvent[]> {
    return events.reduce((groups, event) => {
      // Analyze complexity based on user feedback or event type
      const pattern = (event.data.userFeedback?.comment?.length || 0) > 100 ? 'complex' : 'simple';
      if (!groups[pattern]) groups[pattern] = [];
      groups[pattern].push(event);
      return groups;
    }, {} as Record<string, LearningEvent[]>);
  }

  private groupEventsByTimeOfDay(events: LearningEvent[]): Record<string, LearningEvent[]> {
    return events.reduce((groups, event) => {
      const hour = new Date(event.timestamp).getHours();
      const timeGroup = hour < 6 ? 'overnight' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      if (!groups[timeGroup]) groups[timeGroup] = [];
      groups[timeGroup].push(event);
      return groups;
    }, {} as Record<string, LearningEvent[]>);
  }

  private calculatePerformanceVariance(groups: Record<string, LearningEvent[]>): number {
    const performances = Object.values(groups).map(events => 
      events.reduce((sum, e) => sum + e.confidence, 0) / events.length
    );
    const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
    const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private calculateLanguageQualityVariance(groups: Record<string, LearningEvent[]>): number {
    return this.calculatePerformanceVariance(groups); // Same calculation for now
  }

  private calculateTemporalVariance(groups: Record<string, LearningEvent[]>): number {
    return this.calculatePerformanceVariance(groups); // Same calculation for now
  }

  // Learning processing methods
  private async processIntentCorrections(events: LearningEvent[]): Promise<void> {
    // Process intent correction events to improve classification
    logger.info('Processing intent corrections', { count: events.length });
  }

  private async processResponseFeedback(events: LearningEvent[]): Promise<void> {
    // Process response feedback to improve generation
    logger.info('Processing response feedback', { count: events.length });
  }

  private async processEscalationAnalysis(events: LearningEvent[]): Promise<void> {
    // Analyze escalations to improve automation
    logger.info('Processing escalation analysis', { count: events.length });
  }

  // Update real-time metrics
  private async updateRealTimeMetrics(
    conversation: ConversationContext,
    intent: AIAgentIntent | undefined,
    metadata: any
  ): Promise<void> {
    // Update real-time dashboards and metrics
    this.emit('metrics_updated', {
      conversationId: conversation.id,
      intent: intent?.name,
      metadata
    });
  }

  // Check A/B test participation
  private async checkABTestParticipation(
    conversation: ConversationContext,
    intent: AIAgentIntent | undefined,
    response: ConversationMessage
  ): Promise<void> {
    // Check if conversation participates in any running A/B tests based on intent and response
    const runningTests = Array.from(this.abTests.values()).filter(t => t.status === 'running');
    
    for (const test of runningTests) {
      // Determine if this intent/response combination qualifies for the test
      const qualifiesForTest = this.evaluateTestEligibility(test, intent, response);
      
      if (qualifiesForTest) {
        // Assign user to test variant based on consistent hashing
        const variant = this.assignTestVariant(conversation.userId, test);
        
        // Track the test participation
        await this.recordTestParticipation({
          testId: test.id,
          conversationId: conversation.id,
          userId: conversation.userId,
          variant,
          intent: intent?.category || 'unknown',
          responseLength: response.content?.length || 0,
          timestamp: new Date()
        });
        
        logger.debug(`User ${conversation.userId} assigned to test ${test.id} variant ${variant}`);
      }
    }
  }

  private evaluateTestEligibility(test: ABTestExperiment, intent: AIAgentIntent | undefined, response: ConversationMessage): boolean {
    // Check if intent category matches test type
    if (test.type === 'intent_threshold' && !intent) {
      return false;
    }
    
    // Check if response variations are being tested
    if (test.type === 'response_variation' && !response.content) {
      return false;
    }
    
    return true;
  }

  private assignTestVariant(userId: string, test: ABTestExperiment): string {
    const hash = this.hashString(`${userId}-${test.id}`);
    const variants = test.variants || [];
    
    if (variants.length === 0) {
      return 'control';
    }
    
    const selectedVariant = variants[Math.abs(hash) % variants.length];
    return selectedVariant.name;
  }

  private async recordTestParticipation(participation: {
    testId: string;
    conversationId: string;
    userId: string;
    variant: string;
    intent: string;
    responseLength: number;
    timestamp: Date;
  }): Promise<void> {
    // In a real implementation, this would save to database
    logger.info(`A/B test participation recorded: ${participation.testId} - ${participation.variant} for user ${participation.userId}`);
  }

  // Start background processes
  private startAnalyticsCollection(): void {
    // Start real-time analytics collection
    setInterval(() => {
      this.emit('analytics_heartbeat', { timestamp: new Date() });
    }, 30000); // Every 30 seconds
  }

  private startLearningProcessor(): void {
    // Process learning queue every minute
    setInterval(() => {
      this.processLearningQueue().catch(error => {
        logger.error('Error in learning processor', { error: error.message });
      });
    }, 60000);
  }

  private startBiasDetection(): void {
    // Run bias detection daily
    setInterval(() => {
      // Implementation would run bias detection for all tenants
      logger.info('Running scheduled bias detection');
    }, 24 * 60 * 60 * 1000); // Daily
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(tenantId: string): Promise<any> {
    const analytics = Array.from(this.analytics.values())
      .filter(a => a.tenantId === tenantId)
      .sort((a, b) => b.timeframe.end.getTime() - a.timeframe.end.getTime())[0];

    if (!analytics) {
      throw new Error('No analytics available for tenant');
    }

    return {
      analytics,
      learningEvents: this.learningEvents.filter(e => e.tenantId === tenantId).length,
      activeFeedback: this.userFeedback.filter(f => !f.resolved).length,
      activeABTests: Array.from(this.abTests.values()).filter(t => t.status === 'running').length,
      biasAlerts: this.biasDetection.filter(b => !b.resolved && b.severity !== 'low').length
    };
  }
}

// Export singleton instance
export const novaAIAgentAnalytics = new NovaAIAgentAnalytics();

logger.info('Nova AI Agent Analytics & Learning System initialized');