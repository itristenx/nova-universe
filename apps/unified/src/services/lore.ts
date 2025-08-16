import { apiClient } from './api'

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  summary?: string
  category: KnowledgeCategory
  tags: string[]
  author: {
    id: string
    name: string
    avatar?: string
  }
  status: 'draft' | 'published' | 'archived' | 'under_review'
  visibility: 'public' | 'internal' | 'team' | 'role_specific'
  visibilityRules?: {
    roles?: string[]
    teams?: string[]
    departments?: string[]
  }
  metrics: {
    views: number
    likes: number
    dislikes: number
    helpfulVotes: number
    notHelpfulVotes: number
    avgRating: number
    totalRatings: number
  }
  verification: {
    isVerified: boolean
    verifiedBy?: string
    verifiedAt?: string
    verificationBadge?: 'verified_solution' | 'expert_reviewed' | 'community_approved'
  }
  linkedTickets: string[]
  relatedArticles: string[]
  attachments: KnowledgeAttachment[]
  xpReward: number
  impactScore: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  lastReviewedAt?: string
}

export interface KnowledgeCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  parentId?: string
  children?: KnowledgeCategory[]
  articleCount: number
  isActive: boolean
  sortOrder: number
}

export interface KnowledgeAttachment {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'link'
  url: string
  description?: string
  size?: number
  uploadedAt: string
}

export interface KnowledgeSearchFilters {
  query?: string
  categories?: string[]
  tags?: string[]
  authors?: string[]
  status?: string[]
  visibility?: string[]
  verified?: boolean
  dateRange?: {
    start: string
    end: string
  }
  rating?: {
    min: number
    max: number
  }
}

export interface KnowledgeSearchResult {
  articles: KnowledgeArticle[]
  suggestions: string[]
  facets: {
    categories: Array<{ id: string; name: string; count: number }>
    tags: Array<{ name: string; count: number }>
    authors: Array<{ id: string; name: string; count: number }>
  }
  total: number
  page: number
  perPage: number
}

export interface KnowledgeFeedback {
  id: string
  articleId: string
  userId: string
  type: 'helpful' | 'not_helpful' | 'incorrect' | 'outdated' | 'suggestion'
  rating?: number
  comment?: string
  suggestion?: string
  createdAt: string
}

export interface KnowledgeComment {
  id: string
  articleId: string
  userId: string
  content: string
  parentId?: string
  replies: KnowledgeComment[]
  isModerated: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthorStats {
  totalArticles: number
  totalViews: number
  totalLikes: number
  totalXP: number
  verifiedArticles: number
  averageRating: number
  rank: number
  badges: string[]
  achievements: Array<{
    id: string
    name: string
    description: string
    earnedAt: string
  }>
}

class LoreService {
  /**
   * Search knowledge articles
   */
  async searchArticles(
    filters: KnowledgeSearchFilters,
    page = 1,
    perPage = 20
  ): Promise<KnowledgeSearchResult> {
    const params = {
      ...filters,
      page,
      perPage
    }
    
    const response = await apiClient.get<KnowledgeSearchResult>('/lore/search', { params })
    return response.data!
  }

  /**
   * Get article by ID
   */
  async getArticle(id: string): Promise<KnowledgeArticle> {
    const response = await apiClient.get<KnowledgeArticle>(`/lore/articles/${id}`)
    return response.data!
  }

  /**
   * Create new article
   */
  async createArticle(data: {
    title: string
    content: string
    summary?: string
    categoryId: string
    tags: string[]
    visibility: 'public' | 'internal' | 'team' | 'role_specific'
    visibilityRules?: {
      roles?: string[]
      teams?: string[]
      departments?: string[]
    }
    status?: 'draft' | 'published'
    attachments?: File[]
  }): Promise<KnowledgeArticle> {
    const formData = new FormData()
    
    // Add article data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachments') return
      if (value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      }
    })
    
    // Add attachments
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file)
      })
    }
    
    const response = await apiClient.post<KnowledgeArticle>('/lore/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data!
  }

  /**
   * Update article
   */
  async updateArticle(id: string, data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
    const response = await apiClient.patch<KnowledgeArticle>(`/lore/articles/${id}`, data)
    return response.data!
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string): Promise<void> {
    await apiClient.delete(`/lore/articles/${id}`)
  }

  /**
   * Publish article
   */
  async publishArticle(id: string): Promise<KnowledgeArticle> {
    const response = await apiClient.post<KnowledgeArticle>(`/lore/articles/${id}/publish`)
    return response.data!
  }

  /**
   * Archive article
   */
  async archiveArticle(id: string): Promise<KnowledgeArticle> {
    const response = await apiClient.post<KnowledgeArticle>(`/lore/articles/${id}/archive`)
    return response.data!
  }

  /**
   * Submit article for review
   */
  async submitForReview(id: string): Promise<KnowledgeArticle> {
    const response = await apiClient.post<KnowledgeArticle>(`/lore/articles/${id}/submit-review`)
    return response.data!
  }

  /**
   * Verify article (admin/expert only)
   */
  async verifyArticle(
    id: string,
    badge: 'verified_solution' | 'expert_reviewed' | 'community_approved'
  ): Promise<KnowledgeArticle> {
    const response = await apiClient.post<KnowledgeArticle>(`/lore/articles/${id}/verify`, {
      badge
    })
    return response.data!
  }

  /**
   * Get article categories
   */
  async getCategories(): Promise<KnowledgeCategory[]> {
    const response = await apiClient.get<KnowledgeCategory[]>('/lore/categories')
    return response.data!
  }

  /**
   * Create category
   */
  async createCategory(data: {
    name: string
    description?: string
    icon?: string
    color?: string
    parentId?: string
  }): Promise<KnowledgeCategory> {
    const response = await apiClient.post<KnowledgeCategory>('/lore/categories', data)
    return response.data!
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: Partial<KnowledgeCategory>): Promise<KnowledgeCategory> {
    const response = await apiClient.patch<KnowledgeCategory>(`/lore/categories/${id}`, data)
    return response.data!
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit = 20): Promise<Array<{ name: string; count: number }>> {
    const response = await apiClient.get<Array<{ name: string; count: number }>>(`/lore/tags/popular?limit=${limit}`)
    return response.data!
  }

  /**
   * Submit feedback on article
   */
  async submitFeedback(data: {
    articleId: string
    type: 'helpful' | 'not_helpful' | 'incorrect' | 'outdated' | 'suggestion'
    rating?: number
    comment?: string
    suggestion?: string
  }): Promise<KnowledgeFeedback> {
    const response = await apiClient.post<KnowledgeFeedback>('/lore/feedback', data)
    return response.data!
  }

  /**
   * Get article feedback
   */
  async getArticleFeedback(articleId: string): Promise<KnowledgeFeedback[]> {
    const response = await apiClient.get<KnowledgeFeedback[]>(`/lore/articles/${articleId}/feedback`)
    return response.data!
  }

  /**
   * Add comment to article
   */
  async addComment(articleId: string, content: string, parentId?: string): Promise<KnowledgeComment> {
    const response = await apiClient.post<KnowledgeComment>(`/lore/articles/${articleId}/comments`, {
      content,
      parentId
    })
    return response.data!
  }

  /**
   * Get article comments
   */
  async getComments(articleId: string): Promise<KnowledgeComment[]> {
    const response = await apiClient.get<KnowledgeComment[]>(`/lore/articles/${articleId}/comments`)
    return response.data!
  }

  /**
   * Update comment
   */
  async updateComment(commentId: string, content: string): Promise<KnowledgeComment> {
    const response = await apiClient.patch<KnowledgeComment>(`/lore/comments/${commentId}`, {
      content
    })
    return response.data!
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/lore/comments/${commentId}`)
  }

  /**
   * Get related articles
   */
  async getRelatedArticles(articleId: string, limit = 5): Promise<KnowledgeArticle[]> {
    const response = await apiClient.get<KnowledgeArticle[]>(`/lore/articles/${articleId}/related?limit=${limit}`)
    return response.data!
  }

  /**
   * Get article suggestions for ticket
   */
  async getArticleSuggestionsForTicket(ticketId: string): Promise<KnowledgeArticle[]> {
    const response = await apiClient.get<KnowledgeArticle[]>(`/lore/suggestions/ticket/${ticketId}`)
    return response.data!
  }

  /**
   * Get author statistics
   */
  async getAuthorStats(userId: string): Promise<AuthorStats> {
    const response = await apiClient.get<AuthorStats>(`/lore/authors/${userId}/stats`)
    return response.data!
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(timeframe: 'week' | 'month' | 'quarter' | 'year' | 'all' = 'month'): Promise<Array<{
    user: {
      id: string
      name: string
      avatar?: string
    }
    stats: AuthorStats
    rank: number
  }>> {
    const response = await apiClient.get(`/lore/leaderboard?timeframe=${timeframe}`)
    return response.data!
  }

  /**
   * Track article view
   */
  async trackView(articleId: string): Promise<void> {
    await apiClient.post(`/lore/articles/${articleId}/view`)
  }

  /**
   * Like/unlike article
   */
  async toggleLike(articleId: string): Promise<{ liked: boolean; totalLikes: number }> {
    const response = await apiClient.post<{ liked: boolean; totalLikes: number }>(`/lore/articles/${articleId}/like`)
    return response.data!
  }

  /**
   * Rate article
   */
  async rateArticle(articleId: string, rating: number): Promise<{ avgRating: number; totalRatings: number }> {
    const response = await apiClient.post<{ avgRating: number; totalRatings: number }>(`/lore/articles/${articleId}/rate`, {
      rating
    })
    return response.data!
  }

  /**
   * Get article analytics
   */
  async getArticleAnalytics(articleId: string, timeframe = '30d'): Promise<{
    views: number
    uniqueViews: number
    likes: number
    ratings: number
    comments: number
    helpfulVotes: number
    xpEarned: number
    viewsOverTime: Array<{ date: string; views: number }>
    topReferrers: Array<{ source: string; count: number }>
    demographics: {
      roles: Array<{ role: string; count: number }>
      departments: Array<{ department: string; count: number }>
    }
  }> {
    const response = await apiClient.get(`/lore/articles/${articleId}/analytics?timeframe=${timeframe}`)
    return response.data!
  }

  /**
   * Export knowledge base
   */
  async exportKnowledgeBase(
    format: 'pdf' | 'docx' | 'html' | 'json',
    filters?: KnowledgeSearchFilters
  ): Promise<{ downloadUrl: string; filename: string }> {
    const response = await apiClient.post<{ downloadUrl: string; filename: string }>('/lore/export', {
      format,
      filters
    })
    return response.data!
  }

  /**
   * Import articles from file
   */
  async importArticles(file: File, options?: {
    categoryId?: string
    visibility?: string
    skipDuplicates?: boolean
  }): Promise<{
    imported: number
    skipped: number
    errors: Array<{ row: number; message: string }>
  }> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }
    
    const response = await apiClient.post('/lore/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data!
  }

  /**
   * Get knowledge base statistics
   */
  async getKnowledgeBaseStats(): Promise<{
    totalArticles: number
    publishedArticles: number
    draftArticles: number
    archivedArticles: number
    totalViews: number
    totalAuthors: number
    totalCategories: number
    totalTags: number
    avgRating: number
    topCategories: Array<{ id: string; name: string; count: number }>
    recentActivity: Array<{
      type: 'created' | 'updated' | 'viewed' | 'liked' | 'commented'
      articleId: string
      articleTitle: string
      userId: string
      userName: string
      timestamp: string
    }>
  }> {
    const response = await apiClient.get('/lore/stats')
    return response.data!
  }
}

export const loreService = new LoreService()