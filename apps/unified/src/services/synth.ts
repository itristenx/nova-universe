import { useState } from 'react'
import { apiClient } from './api'

// Types for Nova Synth and Cosmo
export interface SynthIntent {
  classification: 'ticket' | 'command' | 'query' | 'conversation'
  confidence: number
  ticketType?: 'INC' | 'REQ' | 'PRB' | 'CHG' | 'TASK' | 'HR' | 'OPS' | 'ISAC' | 'FB'
  priority?: 'low' | 'normal' | 'high' | 'urgent' | 'critical'
  category?: string
  extractedData?: Record<string, unknown>
}

export interface CosmoConversation {
  id: string
  userId: string
  tenantId: string
  messages: CosmoMessage[]
  context: ConversationContext
  status: 'active' | 'ended' | 'escalated'
  createdAt: string
  updatedAt: string
}

export interface CosmoMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    intent?: SynthIntent
    actions?: CosmoAction[]
    citations?: string[]
    xpAwarded?: number
  }
}

export interface CosmoAction {
  type: 'create_ticket' | 'search_kb' | 'grant_xp' | 'trigger_workflow' | 'send_notification'
  data: Record<string, unknown>
  status: 'pending' | 'completed' | 'failed'
  result?: unknown
}

export interface ConversationContext {
  activeTicket?: string
  recentTickets?: string[]
  userRole?: string
  currentModule?: string
  organizationData?: Record<string, unknown>
  sessionData?: Record<string, unknown>
}

export interface MCPSession {
  sessionId: string
  userId: string
  tenantId: string
  availableTools: string[]
  context: Record<string, unknown>
  createdAt: string
  expiresAt: string
}

export interface MCPTool {
  name: string
  description: string
  schema: Record<string, unknown>
  enabled: boolean
  permissions: string[]
}

export interface WorkflowTrigger {
  id: string
  name: string
  description: string
  conditions: Record<string, unknown>
  actions: WorkflowAction[]
  enabled: boolean
}

export interface WorkflowAction {
  type: string
  parameters: Record<string, unknown>
  delay?: number
  conditions?: Record<string, unknown>
}

export interface GamificationEvent {
  userId: string
  action: string
  xpAwarded: number
  badgeEarned?: string
  metadata?: Record<string, unknown>
}

export interface KnowledgeQuery {
  query: string
  context?: string
  maxResults?: number
  filters?: Record<string, unknown>
}

export interface KnowledgeResult {
  id: string
  title: string
  content: string
  relevanceScore: number
  url?: string
  lastUpdated: string
  author?: string
}

class SynthService {
  /**
   * Start a new conversation with Cosmo
   */
  async startConversation(context?: Partial<ConversationContext>): Promise<CosmoConversation> {
    const response = await apiClient.post<CosmoConversation>('/v2/synth/conversation/start', {
      context: context || {}
    })
    return response.data!
  }

  /**
   * Send a message to Cosmo and get response
   */
  async sendMessage(conversationId: string, message: string): Promise<CosmoMessage> {
    const response = await apiClient.post<CosmoMessage>(
      `/v2/synth/conversation/${conversationId}/send`,
      { message }
    )
    return response.data!
  }

  /**
   * Get conversation history
   */
  async getConversation(conversationId: string): Promise<CosmoConversation> {
    const response = await apiClient.get<CosmoConversation>(
      `/v2/synth/conversation/${conversationId}`
    )
    return response.data!
  }

  /**
   * End a conversation
   */
  async endConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/v2/synth/conversation/${conversationId}`)
  }

  /**
   * Classify intent from user input
   */
  async classifyIntent(input: string, context?: Record<string, unknown>): Promise<SynthIntent> {
    const response = await apiClient.post<SynthIntent>('/v2/synth/intent/classify', {
      input,
      context
    })
    return response.data!
  }

  /**
   * Auto-create ticket from classified intent
   */
  async autoCreateTicket(intent: SynthIntent, originalInput: string): Promise<{ ticketId: string }> {
    const response = await apiClient.post<{ ticketId: string }>('/v2/synth/ticket/auto-create', {
      intent,
      originalInput
    })
    return response.data!
  }

  /**
   * Search knowledge base using AI-powered semantic search
   */
  async searchKnowledge(query: KnowledgeQuery): Promise<KnowledgeResult[]> {
    const response = await apiClient.post<KnowledgeResult[]>('/v2/synth/lore/query', query)
    return response.data!
  }

  /**
   * Submit feedback on AI results for training
   */
  async submitFeedback(
    resultId: string,
    feedback: 'helpful' | 'not_helpful' | 'incorrect',
    comment?: string
  ): Promise<void> {
    await apiClient.post('/v2/synth/lore/feedback', {
      resultId,
      feedback,
      comment
    })
  }

  /**
   * Execute a predefined workflow
   */
  async executeWorkflow(workflowId: string, parameters?: Record<string, unknown>): Promise<{ executionId: string }> {
    const response = await apiClient.post<{ executionId: string }>('/v2/synth/workflow/execute', {
      workflowId,
      parameters
    })
    return response.data!
  }

  /**
   * Execute a custom workflow
   */
  async executeCustomWorkflow(workflow: WorkflowAction[], context?: Record<string, unknown>): Promise<{ executionId: string }> {
    const response = await apiClient.post<{ executionId: string }>('/v2/synth/workflow/custom', {
      workflow,
      context
    })
    return response.data!
  }

  /**
   * Award XP to user
   */
  async grantXP(userId: string, amount: number, reason: string, metadata?: Record<string, unknown>): Promise<GamificationEvent> {
    const response = await apiClient.post<GamificationEvent>('/v2/synth/gamification/xp', {
      userId,
      amount,
      reason,
      metadata
    })
    return response.data!
  }

  /**
   * Get user's gamification profile
   */
  async getGamificationProfile(userId: string): Promise<{
    xp: number
    level: number
    badges: string[]
    leaderboardRank: number
    achievements: Array<{
      id: string
      name: string
      description: string
      earnedAt: string
    }>
  }> {
    const response = await apiClient.get(`/v2/synth/gamification/profile?userId=${userId}`)
    return response.data!
  }

  /**
   * Register an event hook
   */
  async registerHook(
    eventType: string,
    targetUrl: string,
    conditions?: Record<string, unknown>
  ): Promise<{ hookId: string }> {
    const response = await apiClient.post<{ hookId: string }>('/v2/synth/hook/register', {
      eventType,
      targetUrl,
      conditions
    })
    return response.data!
  }

  /**
   * Manually trigger a hook
   */
  async triggerHook(hookId: string, payload: Record<string, unknown>): Promise<void> {
    await apiClient.post(`/v2/synth/hook/trigger`, {
      hookId,
      payload
    })
  }

  // MCP (Model Context Protocol) Support

  /**
   * Start an MCP session
   */
  async startMCPSession(tools?: string[]): Promise<MCPSession> {
    const response = await apiClient.post<MCPSession>('/v2/synth/mcp/session', {
      requestedTools: tools
    })
    return response.data!
  }

  /**
   * Execute MCP tool action
   */
  async executeMCPTool(
    sessionId: string,
    toolName: string,
    parameters: Record<string, unknown>
  ): Promise<{ result: unknown; success: boolean; error?: string }> {
    const response = await apiClient.post(`/v2/synth/mcp/tool/${toolName}`, {
      sessionId,
      parameters
    })
    return response.data!
  }

  /**
   * Get MCP session context
   */
  async getMCPSession(sessionId: string): Promise<MCPSession> {
    const response = await apiClient.get<MCPSession>(`/v2/synth/mcp/session/${sessionId}`)
    return response.data!
  }

  /**
   * End MCP session
   */
  async endMCPSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/v2/synth/mcp/session/${sessionId}`)
  }

  /**
   * Get available MCP tools
   */
  async getAvailableMCPTools(): Promise<MCPTool[]> {
    const response = await apiClient.get<MCPTool[]>('/v2/synth/mcp/tools')
    return response.data!
  }

  // Utility methods for common Cosmo interactions

  /**
   * Quick ticket creation via Cosmo
   */
  async createTicketWithCosmo(
    description: string,
    type?: string,
    priority?: string
  ): Promise<{ ticketId: string; conversation: CosmoConversation }> {
    const conversation = await this.startConversation({
      currentModule: 'ticket_creation'
    })

    const message = `Create a ${type || 'support'} ticket: ${description}${priority ? ` (Priority: ${priority})` : ''}`
    const response = await this.sendMessage(conversation.id, message)

    return {
      ticketId: response.metadata?.actions?.find(a => a.type === 'create_ticket')?.result as string || '',
      conversation
    }
  }

  /**
   * Ask Cosmo for help
   */
  async askCosmo(
    question: string,
    context?: ConversationContext
  ): Promise<{ answer: string; suggestions: KnowledgeResult[]; actions: CosmoAction[] }> {
    const conversation = await this.startConversation(context)
    const response = await this.sendMessage(conversation.id, question)

    // Extract knowledge results from citations
    const suggestions: KnowledgeResult[] = []
    if (response.metadata?.citations) {
      for (const citation of response.metadata.citations) {
        try {
          const kbResults = await this.searchKnowledge({ query: citation, maxResults: 3 })
          suggestions.push(...kbResults)
        } catch (error) {
          console.warn('Failed to fetch knowledge for citation:', citation)
        }
      }
    }

    return {
      answer: response.content,
      suggestions,
      actions: response.metadata?.actions || []
    }
  }

  /**
   * Get Cosmo's suggestions for a ticket
   */
  async getTicketSuggestions(ticketId: string): Promise<{
    suggestedActions: string[]
    relatedArticles: KnowledgeResult[]
    priorityRecommendation?: string
    categoryRecommendation?: string
  }> {
    const conversation = await this.startConversation({
      activeTicket: ticketId,
      currentModule: 'ticket_analysis'
    })

    const response = await this.sendMessage(
      conversation.id,
      `Analyze ticket ${ticketId} and provide suggestions for resolution, related knowledge articles, and recommended priority/category.`
    )

    // Parse structured response from Cosmo
    const suggestions = {
      suggestedActions: [],
      relatedArticles: [],
      priorityRecommendation: undefined,
      categoryRecommendation: undefined
    }

    // Extract knowledge articles from citations
    if (response.metadata?.citations) {
      for (const citation of response.metadata.citations) {
        try {
          const kbResults = await this.searchKnowledge({ query: citation, maxResults: 5 })
          suggestions.relatedArticles.push(...kbResults)
        } catch (error) {
          console.warn('Failed to fetch knowledge for citation:', citation)
        }
      }
    }

    return suggestions
  }
}

export const synthService = new SynthService()

// Cosmo Widget Hook for React components
export const useCosmo = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [conversation, setConversation] = useState<CosmoConversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const startConversation = async (context?: Partial<ConversationContext>) => {
    setIsLoading(true)
    try {
      const conv = await synthService.startConversation(context)
      setConversation(conv)
      setIsOpen(true)
    } catch (error) {
      console.error('Failed to start conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (message: string) => {
    if (!conversation) return

    setIsLoading(true)
    try {
      const response = await synthService.sendMessage(conversation.id, message)
      
      // Update conversation with new message
      const updatedConversation = await synthService.getConversation(conversation.id)
      setConversation(updatedConversation)
      
      return response
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const endConversation = async () => {
    if (!conversation) return

    try {
      await synthService.endConversation(conversation.id)
      setConversation(null)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to end conversation:', error)
    }
  }

  return {
    isOpen,
    setIsOpen,
    conversation,
    isLoading,
    startConversation,
    sendMessage,
    endConversation
  }
}

// Export common Cosmo presets
export const CosmoPresets = {
  TICKET_CREATION: {
    currentModule: 'ticket_creation',
    sessionData: { intent: 'create_ticket' }
  },
  
  KNOWLEDGE_SEARCH: {
    currentModule: 'knowledge_base',
    sessionData: { intent: 'find_information' }
  },
  
  TECHNICAL_SUPPORT: {
    currentModule: 'technical_support',
    sessionData: { intent: 'get_help' }
  },
  
  ADMIN_ASSISTANCE: {
    currentModule: 'admin_panel',
    sessionData: { intent: 'administration' }
  }
} as const