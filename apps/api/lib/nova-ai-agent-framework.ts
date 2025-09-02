/**
 * Nova AI Agent Framework - Industry Standard Implementation
 *
 * Implements enterprise-grade AI Agent capabilities following industry standards
 * from ServiceNow, Jira Service Management, Zendesk, and other leading ITSM platforms.
 *
 * Features:
 * - Virtual Agent with conversational AI
 * - Intent recognition and NLU capabilities
 * - Multi-turn dialog management
 * - Context preservation across conversations
 * - ITSM-specific agent capabilities
 * - Performance analytics and metrics
 * - Automated escalation workflows
 * - Continuous learning and improvement
 */

import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { ragEngine, RAGQuery } from './rag-engine.js';
import { ragRBAC } from './nova-rag-rbac.js';
import { novaSynthRAG } from './nova-synth-rag-integration.js';
import { userInteractionService } from '../services/user-interaction.service.js';
import crypto from 'crypto';

// Core AI Agent Types
export interface AIAgentIntent {
  id: string;
  name: string;
  category: 'incident' | 'service_request' | 'problem' | 'change' | 'knowledge' | 'general';
  confidence: number;
  entities: Record<string, any>;
  requiredSlots: string[];
  fulfilledSlots: string[];
  isComplete: boolean;
}

export interface ConversationContext {
  id: string;
  userId: string;
  tenantId: string;
  channel: 'web' | 'mobile' | 'email' | 'slack' | 'teams' | 'api';
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  messages: ConversationMessage[];
  currentIntent?: AIAgentIntent;
  slots: Record<string, any>;
  state: 'active' | 'waiting' | 'escalated' | 'resolved' | 'abandoned';
  escalationLevel: 0 | 1 | 2 | 3; // 0=agent, 1=senior_agent, 2=human_support, 3=specialist
  metadata: Record<string, any>;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  intent?: AIAgentIntent;
  confidence?: number;
  attachments?: MessageAttachment[];
  richContent?: RichMessageContent;
  metadata: Record<string, any>;
}

export interface MessageAttachment {
  id: string;
  type: 'file' | 'image' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface RichMessageContent {
  type: 'card' | 'carousel' | 'form' | 'list' | 'buttons' | 'quick_replies';
  title?: string;
  subtitle?: string;
  items?: any[];
  actions?: MessageAction[];
  metadata?: Record<string, any>;
}

export interface MessageAction {
  type: 'button' | 'link' | 'form_submit' | 'escalate' | 'suggest';
  label: string;
  value?: string;
  action?: string;
  url?: string;
  payload?: Record<string, any>;
}

// ITSM-Specific Agent Capabilities
export interface ITSMAgentCapability {
  name: string;
  category: 'incident' | 'service_request' | 'problem' | 'change' | 'knowledge';
  description: string;
  intents: string[];
  workflows: WorkflowDefinition[];
  permissions: string[];
  isActive: boolean;
  confidence: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  category: string;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  automationLevel: 'none' | 'assisted' | 'automated' | 'fully_automated';
  escalationRules: EscalationRule[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'collect_info' | 'validate' | 'process' | 'approve' | 'execute' | 'notify';
  description: string;
  requiredSlots: string[];
  automationScript?: string;
  humanRequired: boolean;
  estimatedDuration: number; // minutes
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'regex';
  value: any;
  action: 'continue' | 'skip' | 'escalate' | 'approve_required';
}

export interface EscalationRule {
  trigger: 'time_exceeded' | 'confidence_low' | 'user_request' | 'complexity_high' | 'approval_required';
  condition: any;
  action: 'human_handoff' | 'supervisor_review' | 'specialist_escalation';
  target?: string;
  delay?: number; // minutes
}

// Agent Performance & Analytics
export interface AgentPerformanceMetrics {
  conversationId: string;
  userId: string;
  tenantId: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  intentAccuracy: number;
  resolutionRate: number;
  escalationRate: number;
  averageResponseTime: number; // seconds
  userSatisfactionScore?: number; // 1-5
  completionStatus: 'resolved' | 'escalated' | 'abandoned' | 'ongoing';
  category: string;
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  automationLevel: number; // 0-1, 1 = fully automated
}

// Main AI Agent Framework Class
export class NovaAIAgentFramework extends EventEmitter {
  private conversations: Map<string, ConversationContext> = new Map();
  private capabilities: Map<string, ITSMAgentCapability> = new Map();
  private performanceMetrics: AgentPerformanceMetrics[] = [];
  private intentClassifier: IntentClassifier;
  private dialogManager: DialogManager;
  private workflowEngine: WorkflowEngine;
  private analyticsEngine: AnalyticsEngine;

  constructor() {
    super();
    this.intentClassifier = new IntentClassifier();
    this.dialogManager = new DialogManager();
    this.workflowEngine = new WorkflowEngine();
    this.analyticsEngine = new AnalyticsEngine();
    this.initializeCapabilities();
  }

  /**
   * Initialize ITSM-specific agent capabilities
   */
  private initializeCapabilities(): void {
    // Incident Management Capability
    this.capabilities.set('incident_management', {
      name: 'Incident Management',
      category: 'incident',
      description: 'Handle incident reporting, categorization, and resolution',
      intents: ['report_incident', 'check_incident_status', 'update_incident'],
      workflows: [
        {
          id: 'incident_creation',
          name: 'Create New Incident',
          category: 'incident',
          steps: [
            {
              id: 'collect_details',
              name: 'Collect Incident Details',
              type: 'collect_info',
              description: 'Gather incident description, urgency, impact',
              requiredSlots: ['description', 'urgency', 'impact', 'affected_service'],
              humanRequired: false,
              estimatedDuration: 5
            },
            {
              id: 'categorize',
              name: 'Auto-Categorize Incident',
              type: 'process',
              description: 'Automatically categorize and assign priority',
              requiredSlots: ['description', 'urgency', 'impact'],
              automationScript: 'categorizeIncident',
              humanRequired: false,
              estimatedDuration: 1
            },
            {
              id: 'assign',
              name: 'Auto-Assign to Team',
              type: 'process',
              description: 'Assign to appropriate support team',
              requiredSlots: ['category', 'priority'],
              automationScript: 'assignIncident',
              humanRequired: false,
              estimatedDuration: 1
            }
          ],
          conditions: [
            {
              field: 'priority',
              operator: 'equals',
              value: 'Critical',
              action: 'escalate'
            }
          ],
          automationLevel: 'automated',
          escalationRules: [
            {
              trigger: 'confidence_low',
              condition: { confidence: '<0.7' },
              action: 'human_handoff'
            }
          ]
        }
      ],
      permissions: ['create_incident', 'view_incident', 'update_incident'],
      isActive: true,
      confidence: 0.95
    });

    // Service Request Capability
    this.capabilities.set('service_request', {
      name: 'Service Request Fulfillment',
      category: 'service_request',
      description: 'Handle service catalog requests and fulfillment',
      intents: ['request_service', 'check_request_status', 'approve_request'],
      workflows: [
        {
          id: 'service_request_fulfillment',
          name: 'Service Request Fulfillment',
          category: 'service_request',
          steps: [
            {
              id: 'identify_service',
              name: 'Identify Requested Service',
              type: 'collect_info',
              description: 'Determine which service catalog item is needed',
              requiredSlots: ['service_type', 'justification'],
              humanRequired: false,
              estimatedDuration: 3
            },
            {
              id: 'validate_eligibility',
              name: 'Validate User Eligibility',
              type: 'validate',
              description: 'Check user permissions and approval requirements',
              requiredSlots: ['service_type', 'user_role'],
              automationScript: 'validateServiceEligibility',
              humanRequired: false,
              estimatedDuration: 2
            },
            {
              id: 'collect_requirements',
              name: 'Collect Service Requirements',
              type: 'collect_info',
              description: 'Gather service-specific requirements and details',
              requiredSlots: ['requirements'],
              humanRequired: false,
              estimatedDuration: 5
            }
          ],
          conditions: [
            {
              field: 'approval_required',
              operator: 'equals',
              value: true,
              action: 'approve_required'
            }
          ],
          automationLevel: 'assisted',
          escalationRules: [
            {
              trigger: 'approval_required',
              condition: { cost: '>$1000' },
              action: 'supervisor_review'
            }
          ]
        }
      ],
      permissions: ['request_service', 'view_service_catalog', 'approve_request'],
      isActive: true,
      confidence: 0.92
    });

    // Knowledge Management Capability
    this.capabilities.set('knowledge_management', {
      name: 'Knowledge Management',
      category: 'knowledge',
      description: 'Search and recommend knowledge articles and solutions',
      intents: ['search_knowledge', 'suggest_solution', 'create_knowledge'],
      workflows: [
        {
          id: 'knowledge_search',
          name: 'Intelligent Knowledge Search',
          category: 'knowledge',
          steps: [
            {
              id: 'understand_query',
              name: 'Understand Search Query',
              type: 'process',
              description: 'Parse and understand user search intent',
              requiredSlots: ['query'],
              automationScript: 'parseSearchQuery',
              humanRequired: false,
              estimatedDuration: 1
            },
            {
              id: 'search_knowledge',
              name: 'Search Knowledge Base',
              type: 'process',
              description: 'Execute semantic search across knowledge articles',
              requiredSlots: ['parsed_query'],
              automationScript: 'searchKnowledgeBase',
              humanRequired: false,
              estimatedDuration: 2
            },
            {
              id: 'apply_rbac',
              name: 'Apply Access Controls',
              type: 'process',
              description: 'Filter results based on user permissions using RAG RBAC',
              requiredSlots: ['search_results', 'user_context'],
              automationScript: 'applyRAGRBAC',
              humanRequired: false,
              estimatedDuration: 1
            },
            {
              id: 'enhance_with_synth',
              name: 'Enhance with Synthetic RAG',
              type: 'process',
              description: 'Augment results with synthesized knowledge using Nova Synth RAG',
              requiredSlots: ['filtered_results'],
              automationScript: 'enhanceWithSynthRAG',
              humanRequired: false,
              estimatedDuration: 2
            },
            {
              id: 'rank_results',
              name: 'Rank and Filter Results',
              type: 'process',
              description: 'Apply relevance scoring and RBAC filtering',
              requiredSlots: ['search_results'],
              automationScript: 'rankKnowledgeResults',
              humanRequired: false,
              estimatedDuration: 1
            }
          ],
          conditions: [],
          automationLevel: 'fully_automated',
          escalationRules: [
            {
              trigger: 'confidence_low',
              condition: { relevance_score: '<0.6' },
              action: 'human_handoff'
            }
          ]
        }
      ],
      permissions: ['search_knowledge', 'view_knowledge', 'suggest_knowledge'],
      isActive: true,
      confidence: 0.98
    });

    logger.info('AI Agent Framework capabilities initialized', {
      capabilityCount: this.capabilities.size,
      capabilities: Array.from(this.capabilities.keys())
    });
  }

  /**
   * Process user message and generate agent response
   */
  async processMessage(
    message: string,
    context: {
      userId: string;
      tenantId: string;
      channel: string;
      sessionId?: string;
      conversationId?: string;
    }
  ): Promise<{
    response: ConversationMessage;
    conversation: ConversationContext;
    actions: MessageAction[];
    metadata: Record<string, any>;
  }> {
    try {
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(context);
      
      // Record user message interaction in User360
      await this.recordUserInteraction(message, conversation, context, 'user');
      
      // Classify intent
      const intent = await this.intentClassifier.classifyIntent(message, conversation);
      
      // Create user message
      const userMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        type: 'user',
        content: message,
        timestamp: new Date(),
        intent,
        metadata: { channel: context.channel }
      };
      
      conversation.messages.push(userMessage);
      conversation.lastActivity = new Date();
      
      // Load AI conversation memory for context
      const aiMemory = await this.loadAIConversationMemory(context.userId, conversation.id);
      
      // Generate response using dialog manager with memory context
      const response = await this.dialogManager.generateResponse(
        userMessage,
        conversation,
        intent,
        aiMemory
      );
      
      // Record AI response interaction in User360
      await this.recordUserInteraction(response.content, conversation, context, 'agent', {
        intent,
        confidence: intent?.confidence,
        aiPersonality: 'cosmo'
      });
      
      // Execute workflow if needed
      if (intent && intent.category !== 'general') {
        await this.workflowEngine.processIntent(intent, conversation);
      }
      
      // Track performance metrics
      await this.analyticsEngine.trackInteraction(conversation, intent, response);
      
      // Update conversation
      conversation.messages.push(response);
      conversation.currentIntent = intent;
      this.conversations.set(conversation.id, conversation);
      
      return {
        response,
        conversation,
        actions: response.richContent?.actions || [],
        metadata: {
          intentConfidence: intent?.confidence || 0,
          escalationLevel: conversation.escalationLevel,
          automationLevel: this.calculateAutomationLevel(intent, conversation),
          aiMemoryLoaded: !!aiMemory
        }
      };
      
    } catch (error) {
      logger.error('Error processing message in AI Agent Framework', {
        error: error.message,
        userId: context.userId,
        tenantId: context.tenantId
      });
      
      throw error;
    }
  }

  /**
   * Get or create conversation context
   */
  private async getOrCreateConversation(context: {
    userId: string;
    tenantId: string;
    channel: string;
    sessionId?: string;
    conversationId?: string;
  }): Promise<ConversationContext> {
    const conversationId = context.conversationId || crypto.randomUUID();
    
    if (this.conversations.has(conversationId)) {
      return this.conversations.get(conversationId)!;
    }
    
    const conversation: ConversationContext = {
      id: conversationId,
      userId: context.userId,
      tenantId: context.tenantId,
      channel: context.channel as any,
      sessionId: context.sessionId || crypto.randomUUID(),
      startTime: new Date(),
      lastActivity: new Date(),
      messages: [],
      slots: {},
      state: 'active',
      escalationLevel: 0,
      metadata: {}
    };
    
    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  /**
   * Calculate automation level for current interaction
   */
  private calculateAutomationLevel(
    intent: AIAgentIntent | undefined,
    conversation: ConversationContext
  ): number {
    if (!intent) return 0;
    
    const capability = this.capabilities.get(intent.category);
    if (!capability) return 0;
    
    const workflow = capability.workflows.find(w => 
      w.steps.some(step => !step.humanRequired)
    );
    
    if (!workflow) return 0;
    
    const automatedSteps = workflow.steps.filter(step => !step.humanRequired).length;
    const totalSteps = workflow.steps.length;
    let baseAutomationLevel = automatedSteps / totalSteps;
    
    // Adjust automation level based on conversation complexity and history
    const conversationLength = conversation.messages.length;
    const hasEscalations = conversation.metadata.escalationCount > 0;
    const userTier = conversation.metadata.userTier || 'standard';
    
    // Reduce automation for complex conversations or premium users
    if (conversationLength > 10 || hasEscalations) {
      baseAutomationLevel *= 0.8; // 20% reduction for complex cases
    }
    
    if (userTier === 'premium' || userTier === 'enterprise') {
      baseAutomationLevel *= 0.9; // 10% reduction for premium users (more human touch)
    }
    
    return Math.max(0, Math.min(1, baseAutomationLevel));
  }

  /**
   * Get agent performance metrics
   */
  async getPerformanceMetrics(
    filters: {
      userId?: string;
      tenantId?: string;
      startDate?: Date;
      endDate?: Date;
      category?: string;
    } = {}
  ): Promise<{
    metrics: AgentPerformanceMetrics[];
    summary: {
      totalConversations: number;
      averageIntentAccuracy: number;
      averageResolutionRate: number;
      averageEscalationRate: number;
      averageResponseTime: number;
      averageSatisfactionScore: number;
    };
  }> {
    let filteredMetrics = this.performanceMetrics;
    
    if (filters.userId) {
      filteredMetrics = filteredMetrics.filter(m => m.userId === filters.userId);
    }
    
    if (filters.tenantId) {
      filteredMetrics = filteredMetrics.filter(m => m.tenantId === filters.tenantId);
    }
    
    if (filters.startDate) {
      filteredMetrics = filteredMetrics.filter(m => m.startTime >= filters.startDate!);
    }
    
    if (filters.endDate) {
      filteredMetrics = filteredMetrics.filter(m => m.startTime <= filters.endDate!);
    }
    
    if (filters.category) {
      filteredMetrics = filteredMetrics.filter(m => m.category === filters.category);
    }
    
    const summary = {
      totalConversations: filteredMetrics.length,
      averageIntentAccuracy: filteredMetrics.reduce((sum, m) => sum + m.intentAccuracy, 0) / filteredMetrics.length || 0,
      averageResolutionRate: filteredMetrics.reduce((sum, m) => sum + m.resolutionRate, 0) / filteredMetrics.length || 0,
      averageEscalationRate: filteredMetrics.reduce((sum, m) => sum + m.escalationRate, 0) / filteredMetrics.length || 0,
      averageResponseTime: filteredMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / filteredMetrics.length || 0,
      averageSatisfactionScore: filteredMetrics.filter(m => m.userSatisfactionScore).reduce((sum, m) => sum + (m.userSatisfactionScore || 0), 0) / filteredMetrics.filter(m => m.userSatisfactionScore).length || 0
    };
    
    return { metrics: filteredMetrics, summary };
  }

  /**
   * Get available agent capabilities
   */
  getCapabilities(): ITSMAgentCapability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Update agent capability configuration
   */
  async updateCapability(
    capabilityName: string,
    updates: Partial<ITSMAgentCapability>
  ): Promise<ITSMAgentCapability> {
    const capability = this.capabilities.get(capabilityName);
    if (!capability) {
      throw new Error(`Capability '${capabilityName}' not found`);
    }
    
    const updatedCapability = { ...capability, ...updates };
    this.capabilities.set(capabilityName, updatedCapability);
    
    logger.info('AI Agent capability updated', {
      capability: capabilityName,
      updates: Object.keys(updates)
    });
    
    return updatedCapability;
  }

  // ============================================================================
  // USER360 INTEGRATION METHODS
  // ============================================================================

  /**
   * Record user interaction in User360 system
   */
  private async recordUserInteraction(
    content: string,
    conversation: ConversationContext,
    context: { userId: string; tenantId: string; channel: string },
    messageType: 'user' | 'agent',
    aiData?: {
      intent?: AIAgentIntent;
      confidence?: number;
      aiPersonality?: string;
    }
  ): Promise<void> {
    try {
      if (!userInteractionService.isInitialized) {
        logger.warn('User Interaction Service not initialized, skipping interaction recording');
        return;
      }

      // Map channel to our communication channel enum
      const communicationChannel = this.mapChannelToCommunicationChannel(context.channel);
      
      // Create or get conversation session
      const session = await userInteractionService.createOrGetSession({
        userId: context.userId,
        sessionType: 'AI_CHAT',
        channel: communicationChannel,
        externalId: conversation.id,
        subject: this.extractConversationSubject(conversation),
        context: {
          tenantId: context.tenantId,
          conversationId: conversation.id,
          sessionId: conversation.sessionId,
          agentFramework: 'nova-ai-agent',
          currentIntent: conversation.currentIntent?.name,
          escalationLevel: conversation.escalationLevel
        },
        category: this.mapIntentToCategory(conversation.currentIntent),
        priority: this.mapEscalationToPriority(conversation.escalationLevel)
      });

      // Determine interaction type and direction
      const interactionType = messageType === 'user' ? 'CHAT_MESSAGE' : 'AI_RESPONSE';
      const direction = messageType === 'user' ? 'INBOUND' : 'OUTBOUND';

      // Record the interaction
      await userInteractionService.recordInteraction({
        userId: context.userId,
        sessionId: session.id,
        interactionType,
        channel: communicationChannel,
        direction,
        content,
        isAIGenerated: messageType === 'agent',
        aiPersonality: aiData?.aiPersonality || (messageType === 'agent' ? 'cosmo' : null),
        aiConfidence: aiData?.confidence,
        aiIntent: aiData?.intent?.name,
        aiSentiment: await this.detectSentiment(content),
        category: this.mapIntentToCategory(aiData?.intent || conversation.currentIntent),
        priority: this.mapEscalationToPriority(conversation.escalationLevel),
        urgency: this.mapEscalationToUrgency(conversation.escalationLevel),
        businessImpact: this.mapIntentToBusinessImpact(aiData?.intent || conversation.currentIntent),
        requiresResponse: messageType === 'user',
        metadata: {
          conversationId: conversation.id,
          sessionId: conversation.sessionId,
          tenantId: context.tenantId,
          messageId: crypto.randomUUID(),
          agentFramework: 'nova-ai-agent',
          escalationLevel: conversation.escalationLevel,
          messageType,
          intentConfidence: aiData?.confidence || 0
        },
        tags: [
          'ai-chat',
          messageType,
          ...(aiData?.intent ? [aiData.intent.category, aiData.intent.name] : []),
          ...(conversation.escalationLevel > 0 ? ['escalated'] : []),
          communicationChannel.toLowerCase()
        ]
      });

      logger.debug(`AI chat interaction recorded in User360: ${messageType} message for user ${context.userId}`);
    } catch (error) {
      logger.error('Error recording AI chat interaction in User360:', error);
      // Don't throw error as this shouldn't break chat functionality
    }
  }

  /**
   * Load AI conversation memory for context
   */
  private async loadAIConversationMemory(userId: string, conversationId: string): Promise<any> {
    try {
      if (!userInteractionService.isInitialized) {
        return null;
      }

      const memory = await userInteractionService.getAIMemory(userId, 'cosmo', conversationId);
      return memory;
    } catch (error) {
      logger.error('Error loading AI conversation memory:', error);
      return null;
    }
  }

  /**
   * Map channel to communication channel enum
   */
  private mapChannelToCommunicationChannel(channel: string): string {
    const mapping: Record<string, string> = {
      'web': 'WEB_CHAT',
      'mobile': 'MOBILE_CHAT',
      'api': 'API',
      'slack': 'SLACK',
      'teams': 'TEAMS',
      'whatsapp': 'WHATSAPP',
      'sms': 'SMS'
    };
    return mapping[channel.toLowerCase()] || 'WEB_CHAT';
  }

  /**
   * Extract conversation subject from context
   */
  private extractConversationSubject(conversation: ConversationContext): string {
    if (conversation.currentIntent) {
      return `${conversation.currentIntent.category}: ${conversation.currentIntent.name}`;
    }
    
    const firstMessage = conversation.messages.find(m => m.type === 'user');
    if (firstMessage) {
      return firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '');
    }
    
    return 'AI Chat Session';
  }

  /**
   * Map intent to category
   */
  private mapIntentToCategory(intent?: AIAgentIntent): string {
    if (!intent) return 'GENERAL';
    
    const mapping: Record<string, string> = {
      'incident': 'INCIDENT_MANAGEMENT',
      'service_request': 'SERVICE_REQUEST',
      'problem': 'PROBLEM_MANAGEMENT',
      'change': 'CHANGE_MANAGEMENT',
      'knowledge': 'KNOWLEDGE_MANAGEMENT',
      'general': 'GENERAL'
    };
    
    return mapping[intent.category] || 'GENERAL';
  }

  /**
   * Map escalation level to priority
   */
  private mapEscalationToPriority(escalationLevel: number): string {
    if (escalationLevel >= 3) return 'CRITICAL';
    if (escalationLevel >= 2) return 'HIGH';
    if (escalationLevel >= 1) return 'NORMAL';
    return 'LOW';
  }

  /**
   * Map escalation level to urgency
   */
  private mapEscalationToUrgency(escalationLevel: number): string {
    if (escalationLevel >= 3) return 'CRITICAL';
    if (escalationLevel >= 2) return 'HIGH';
    if (escalationLevel >= 1) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Map intent to business impact
   */
  private mapIntentToBusinessImpact(intent?: AIAgentIntent): string {
    if (!intent) return 'LOW';
    
    const mapping: Record<string, string> = {
      'incident': 'HIGH',
      'problem': 'HIGH',
      'change': 'MEDIUM',
      'service_request': 'MEDIUM',
      'knowledge': 'LOW',
      'general': 'LOW'
    };
    
    return mapping[intent.category] || 'LOW';
  }

  /**
   * Detect sentiment in message content
   */
  private async detectSentiment(content: string): Promise<string> {
    try {
      // Simple sentiment detection
      const positiveWords = ['good', 'great', 'excellent', 'happy', 'thanks', 'perfect', 'amazing', 'love'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'problem', 'issue', 'broken', 'help'];
      
      const lowerContent = content.toLowerCase();
      const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
      const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
      
      if (positiveCount > negativeCount) return 'Positive';
      if (negativeCount > positiveCount) return 'Negative';
      return 'Neutral';
    } catch (error) {
      logger.error('Error detecting sentiment:', error);
      return 'Neutral';
    }
  }

  /**
   * RAG Automation Scripts - Knowledge Management Workflow Implementation
   */

  private async searchKnowledgeBase(slots: Record<string, any>): Promise<any[]> {
    try {
      const query = slots.parsed_query || slots.query;
      const ragQuery: RAGQuery = {
        query: query,
        maxResults: 10,
        includeMetadata: true,
        filters: slots.filters || {}
      };
      
      const results = await ragEngine.search(ragQuery);
      return results;
    } catch (error) {
      logger.error('Error in searchKnowledgeBase automation:', error);
      return [];
    }
  }

  private async applyRAGRBAC(slots: Record<string, any>): Promise<any[]> {
    try {
      const searchResults = slots.search_results || [];
      const userContext = slots.user_context || {};
      
      const filteredResults = await ragRBAC.filterResults(searchResults, userContext);
      return filteredResults;
    } catch (error) {
      logger.error('Error in applyRAGRBAC automation:', error);
      return slots.search_results || [];
    }
  }

  private async enhanceWithSynthRAG(slots: Record<string, any>): Promise<any[]> {
    try {
      const filteredResults = slots.filtered_results || [];
      const enhancedResults = await novaSynthRAG.enhance(filteredResults);
      return enhancedResults;
    } catch (error) {
      logger.error('Error in enhanceWithSynthRAG automation:', error);
      return slots.filtered_results || [];
    }
  }
}

// Supporting Classes
class IntentClassifier {
  async classifyIntent(
    message: string,
    conversation: ConversationContext
  ): Promise<AIAgentIntent> {
    // Basic intent classification - in production this would use ML models
    const intent: AIAgentIntent = {
      id: crypto.randomUUID(),
      name: 'general_inquiry',
      category: 'general',
      confidence: 0.8,
      entities: {},
      requiredSlots: [],
      fulfilledSlots: [],
      isComplete: false
    };
    
    // Simple keyword-based classification with conversation context
    const lowerMessage = message.toLowerCase();
    
    // Use conversation history to improve intent classification accuracy
    const previousMessages = conversation.messages || [];
    const recentContext = previousMessages.slice(-3).map(msg => msg.content).join(' ').toLowerCase();
    
    if (lowerMessage.includes('incident') || lowerMessage.includes('outage') || lowerMessage.includes('down')) {
      intent.name = 'report_incident';
      intent.category = 'incident';
      intent.confidence = 0.9;
      intent.requiredSlots = ['description', 'urgency', 'impact'];
      
      // Boost confidence if recent context indicates incident discussion
      if (recentContext.includes('incident') || recentContext.includes('problem')) {
        intent.confidence = Math.min(0.95, intent.confidence + 0.05);
      }
    } else if (lowerMessage.includes('request') || lowerMessage.includes('need') || lowerMessage.includes('access')) {
      intent.name = 'request_service';
      intent.category = 'service_request';
      intent.confidence = 0.85;
      intent.requiredSlots = ['service_type', 'justification'];
      
      // Boost confidence if recent context indicates service requests
      if (recentContext.includes('request') || recentContext.includes('service')) {
        intent.confidence = Math.min(0.95, intent.confidence + 0.05);
      }
    } else if (lowerMessage.includes('how') || lowerMessage.includes('help') || lowerMessage.includes('guide')) {
      intent.name = 'search_knowledge';
      intent.category = 'knowledge';
      intent.confidence = 0.95;
      intent.requiredSlots = ['query'];
      
      // Use conversation history to understand the knowledge domain
      if (recentContext.includes('technical') || recentContext.includes('system')) {
        intent.entities.domain = 'technical';
      } else if (recentContext.includes('process') || recentContext.includes('procedure')) {
        intent.entities.domain = 'process';
      }
    }
    
    return intent;
  }
}

class DialogManager {
  async generateResponse(
    userMessage: ConversationMessage,
    conversation: ConversationContext,
    intent: AIAgentIntent
  ): Promise<ConversationMessage> {
    const response: ConversationMessage = {
      id: crypto.randomUUID(),
      type: 'agent',
      content: '',
      timestamp: new Date(),
      intent,
      confidence: intent.confidence,
      metadata: {}
    };
    
    // Generate appropriate response based on intent
    switch (intent.category) {
      case 'incident':
        response.content = "I'll help you report this incident. Let me gather some details to ensure we address this properly.";
        response.richContent = {
          type: 'form',
          title: 'Incident Details',
          items: [
            { field: 'description', label: 'Description', type: 'textarea', required: true },
            { field: 'urgency', label: 'Urgency', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: true },
            { field: 'impact', label: 'Impact', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: true }
          ],
          actions: [
            { type: 'form_submit', label: 'Submit Incident', action: 'submit_incident' }
          ]
        };
        break;
        
      case 'service_request':
        response.content = "I can help you with that service request. Let me guide you through the process.";
        response.richContent = {
          type: 'buttons',
          title: 'Service Categories',
          items: [
            { label: 'IT Equipment', value: 'it_equipment' },
            { label: 'Software Access', value: 'software_access' },
            { label: 'Account Management', value: 'account_management' },
            { label: 'Other Services', value: 'other_services' }
          ],
          actions: [
            { type: 'button', label: 'Select Category', action: 'select_service_category' }
          ]
        };
        break;
        
      case 'knowledge':
        // Use RAG engine for knowledge search
        response.content = "Let me search our knowledge base for relevant information.";
        // This would integrate with the existing RAG engine
        break;
        
      default:
        response.content = "I'm here to help! I can assist with incidents, service requests, and finding information. What can I do for you today?";
        response.richContent = {
          type: 'quick_replies',
          items: [
            { label: 'Report Incident', value: 'report_incident' },
            { label: 'Request Service', value: 'request_service' },
            { label: 'Search Knowledge', value: 'search_knowledge' },
            { label: 'Check Status', value: 'check_status' }
          ]
        };
    }
    
    return response;
  }
}

class WorkflowEngine {
  async processIntent(
    intent: AIAgentIntent,
    conversation: ConversationContext
  ): Promise<void> {
    // Workflow processing logic - would execute ITSM workflows
    logger.info('Processing workflow for intent', {
      intent: intent.name,
      category: intent.category,
      conversationId: conversation.id
    });
  }
}

class AnalyticsEngine {
  async trackInteraction(
    conversation: ConversationContext,
    intent: AIAgentIntent | undefined,
    response: ConversationMessage
  ): Promise<void> {
    // Track interaction metrics for performance analysis
    logger.info('Tracking agent interaction', {
      conversationId: conversation.id,
      intent: intent?.name,
      confidence: intent?.confidence,
      responseType: response.richContent?.type
    });
  }
}

// Export singleton instance
export const novaAIAgent = new NovaAIAgentFramework();

logger.info('Nova AI Agent Framework initialized');