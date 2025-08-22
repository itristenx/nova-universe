import { apiClient } from './api'
import type { ApiResponse } from '@/types'

export interface KnowledgeArticle {
  id: string
  title: string
  summary: string
  content: string
  category: string
  tags: string[]
  author: string
  lastUpdated: string
  views: number
  rating: number
  helpful: number
  notHelpful: number
  relevanceScore: number
  aiSummary: string
  relatedArticles: string[]
}

export interface SearchSuggestion {
  id: string
  text: string
  category: string
}

export interface KnowledgeSearchParams {
  query: string
  category?: string
  sortBy?: string
  limit?: number
}

export interface KnowledgeSearchResponse {
  articles: KnowledgeArticle[]
  suggestions: SearchSuggestion[]
  insights: string[]
  totalResults: number
}

class KnowledgeService {
  private readonly baseUrl = '/api/v1/knowledge'

  /**
   * Perform AI-powered knowledge search
   */
  async search(params: KnowledgeSearchParams): Promise<KnowledgeSearchResponse> {
    const searchParams = new URLSearchParams({
      q: params.query,
      ...(params.category && params.category !== 'all' && { category: params.category }),
      ...(params.sortBy && { sort: params.sortBy }),
      ...(params.limit && { limit: params.limit.toString() })
    })

    const response = await apiClient.get<ApiResponse<KnowledgeSearchResponse>>(
      `${this.baseUrl}/search?${searchParams}`
    )
    return (response.data.data || response.data) as KnowledgeSearchResponse
  }

  /**
   * Get knowledge article by ID
   */
  async getArticle(id: string): Promise<KnowledgeArticle> {
    const response = await apiClient.get<ApiResponse<KnowledgeArticle>>(`${this.baseUrl}/articles/${id}`)
    return (response.data.data || response.data) as KnowledgeArticle
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(): Promise<SearchSuggestion[]> {
    const response = await apiClient.get<ApiResponse<SearchSuggestion[]>>(`${this.baseUrl}/suggestions`)
    return (response.data.data || response.data) as SearchSuggestion[]
  }

  /**
   * Get AI insights for knowledge base
   */
  async getAIInsights(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(`${this.baseUrl}/ai-insights`)
    return (response.data.data || response.data) as string[]
  }

  /**
   * Rate an article as helpful or not helpful
   */
  async rateArticle(articleId: string, helpful: boolean): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/articles/${articleId}/rate`, {
      helpful
    })
  }

  /**
   * Track article view
   */
  async trackView(articleId: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/articles/${articleId}/view`)
  }

  /**
   * Bookmark an article
   */
  async bookmarkArticle(articleId: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/articles/${articleId}/bookmark`)
  }

  /**
   * Remove bookmark from an article
   */
  async unbookmarkArticle(articleId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/articles/${articleId}/bookmark`)
  }

  /**
   * Share an article
   */
  async shareArticle(articleId: string, shareData: { method: string; recipients?: string[] }): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/articles/${articleId}/share`, shareData)
  }

  /**
   * Get related articles for an article
   */
  async getRelatedArticles(articleId: string): Promise<KnowledgeArticle[]> {
    const response = await apiClient.get<ApiResponse<KnowledgeArticle[]>>(`${this.baseUrl}/articles/${articleId}/related`)
    return (response.data.data || response.data) as KnowledgeArticle[]
  }
}

export const knowledgeService = new KnowledgeService()
