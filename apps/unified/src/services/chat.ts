import { apiClient } from './api'
import type { ApiResponse } from '@/types'

export interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  isTyping?: boolean
  suggestions?: string[]
  actions?: ChatAction[]
  attachments?: string[]
}

export interface ChatAction {
  id: string
  label: string
  type: 'link' | 'action' | 'form'
  data: any
}

export interface ChatResponse {
  message: ChatMessage
  context?: any
}

export interface ChatRequest {
  message: string
  context?: any
  conversationId?: string
}

class ChatService {
  private readonly baseUrl = '/api/v1/chat'

  /**
   * Send a message to the AI chatbot and get a response
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ApiResponse<ChatResponse>>(`${this.baseUrl}/message`, {
      message: request.message,
      context: request.context,
      conversationId: request.conversationId
    })

    return response.data.data
  }

  /**
   * Get chat suggestions based on current context
   */
  async getSuggestions(context?: any): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<{ suggestions: string[] }>>(`${this.baseUrl}/suggestions`, {
      params: { context: JSON.stringify(context || {}) }
    })

    return response.data.data.suggestions
  }

  /**
   * Rate a chat response
   */
  async rateResponse(messageId: string, rating: 'positive' | 'negative', feedback?: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/rate`, {
      messageId,
      rating,
      feedback
    })
  }

  /**
   * Get chat history for a conversation
   */
  async getChatHistory(conversationId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<ApiResponse<{ messages: ChatMessage[] }>>(`${this.baseUrl}/history/${conversationId}`)
    
    return response.data.data.messages
  }

  /**
   * Start a new conversation
   */
  async startConversation(): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ conversationId: string }>>(`${this.baseUrl}/conversation`)
    
    return response.data.data.conversationId
  }

  /**
   * End a conversation
   */
  async endConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/conversation/${conversationId}`)
  }
}

export const chatService = new ChatService()
