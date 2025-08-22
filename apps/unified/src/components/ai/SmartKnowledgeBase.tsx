/**
 * Smart Knowledge Base - Phase 2 Implementation
 * AI-powered knowledge search and content recommendations
 * Inspired by ServiceNow AI Search and intelligent knowledge discovery
 */
import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { knowledgeService, type SearchSuggestion } from '@/services/knowledge'
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  DocumentTextIcon,
  BookOpenIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  BookmarkIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  StarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

interface KnowledgeArticle {
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
  aiSummary?: string
  relatedArticles: string[]
  attachments?: string[]
}

interface SmartKnowledgeBaseProps {
  initialQuery?: string
  contextData?: {
    ticketCategory?: string
    userRole?: string
    department?: string
  }
}

export function SmartKnowledgeBase({ initialQuery = '', contextData }: SmartKnowledgeBaseProps) {
  const { t } = useTranslation(['knowledge', 'common'])
  const [query, setQuery] = useState(initialQuery)
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('relevance')
  const [aiInsights, setAiInsights] = useState<string[]>([])

  // AI-powered semantic search with intelligent content filtering
  const performAISearch = useCallback(async (searchQuery: string, category: string) => {
    if (!searchQuery.trim()) {
      setArticles([])
      setSuggestions([])
      setAiInsights([])
      return
    }

    setIsLoading(true)
    
    try {
      // Use real API call to search knowledge base
      const searchResults = await knowledgeService.search({
        query: searchQuery,
        category: category !== 'all' ? category : undefined,
        sortBy,
        limit: 20
      })

      setArticles(searchResults.articles)
      setSuggestions(searchResults.suggestions)
      setAiInsights(searchResults.insights)
    } catch (error) {
      console.error('Knowledge search failed:', error)
      setArticles([])
      setSuggestions([])
      setAiInsights([])
    } finally {
      setIsLoading(false)
    }
  }, [sortBy])

  useEffect(() => {
    performAISearch(query, selectedCategory)
  }, [query, selectedCategory, performAISearch])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const handleVote = async (articleId: string, isHelpful: boolean) => {
    try {
      await knowledgeService.rateArticle(articleId, isHelpful)
      
      // Update local state to reflect the vote
      setArticles(prev => prev.map(article => {
        if (article.id === articleId) {
          return {
            ...article,
            helpful: isHelpful ? article.helpful + 1 : article.helpful,
            notHelpful: !isHelpful ? article.notHelpful + 1 : article.notHelpful
          }
        }
        return article
      }))
    } catch (error) {
      console.error('Failed to rate article:', error)
    }
  }

  const handleArticleClick = async (articleId: string) => {
    try {
      await knowledgeService.trackView(articleId)
      
      // Update local state to reflect the view
      setArticles(prev => prev.map(article => {
        if (article.id === articleId) {
          return {
            ...article,
            views: article.views + 1
          }
        }
        return article
      }))
    } catch (error) {
      console.error('Failed to track article view:', error)
    }
  }

  const handleBookmark = async (articleId: string) => {
    try {
      await knowledgeService.bookmarkArticle(articleId)
      // Could add UI feedback here
    } catch (error) {
      console.error('Failed to bookmark article:', error)
    }
  }

  const handleShare = async (articleId: string) => {
    try {
      await knowledgeService.shareArticle(articleId, { method: 'copy-link' })
      // Could add UI feedback here (toast notification)
    } catch (error) {
      console.error('Failed to share article:', error)
    }
  }

  const categories = ['all', 'Security', 'Infrastructure', 'Software', 'Hardware', 'Process']

  return (
    <div className="space-y-6">
      {/* Smart Search Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('knowledge:search.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('knowledge:search.subtitle')}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('knowledge:search.placeholder')}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Search Suggestions */}
        {!query && suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('knowledge:suggestions.title')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSearch(suggestion.text)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <TagIcon className="w-3 h-3 text-blue-500" />
                  {suggestion.text}
                  <span className="text-xs text-gray-500">({suggestion.category})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? t('knowledge:categories.all') : category}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          aria-label={t('knowledge:sort.label')}
        >
          <option value="relevance">{t('knowledge:sort.relevance')}</option>
          <option value="recent">{t('knowledge:sort.recent')}</option>
          <option value="popular">{t('knowledge:sort.popular')}</option>
        </select>
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && query && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
            <LightBulbIcon className="w-4 h-4" />
            {t('knowledge:insights.title')}
          </h3>
          <div className="space-y-2">
            {aiInsights.map((insight, index) => (
              <p key={index} className="text-sm text-purple-800 dark:text-purple-200">
                • {insight}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    <h3 
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      onClick={() => handleArticleClick(article.id)}
                    >
                      {article.title}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                      {article.relevanceScore}% {t('knowledge:article.relevant')}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {article.summary}
                  </p>
                  
                  {article.aiSummary && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <SparklesIcon className="w-4 h-4 inline mr-1 text-purple-600" />
                        <strong>{t('knowledge:article.aiSummary')}:</strong> {article.aiSummary}
                      </p>
                    </div>
                  )}

                  {article.relatedArticles && article.relatedArticles.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <DocumentTextIcon className="w-4 h-4 inline mr-1 text-gray-600" />
                        <strong>{t('knowledge:article.relatedArticles')}:</strong>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {article.relatedArticles.map((relatedId, index) => (
                          <span
                            key={index}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            onClick={() => handleArticleClick(relatedId)}
                          >
                            {t('knowledge:article.relatedArticle')} {index + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {article.attachments && article.attachments.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <DocumentTextIcon className="w-4 h-4 inline mr-1 text-gray-600" />
                        <strong>{t('knowledge:article.attachments')}:</strong>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {article.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {t('knowledge:article.attachment')} {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <BookmarkIcon 
                    className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" 
                    onClick={() => handleBookmark(article.id)}
                    title={t('knowledge:article.bookmark')}
                  />
                  <ShareIcon 
                    className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" 
                    onClick={() => handleShare(article.id)}
                    title={t('knowledge:article.share')}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                  >
                    <TagIcon className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {article.lastUpdated}
                  </span>
                  <span className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-500" />
                    {article.rating}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span>{article.views} {t('knowledge:article.views')}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(article.id, true)}
                      className="flex items-center gap-1 px-2 py-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                    >
                      <HandThumbUpIcon className="w-4 h-4" />
                      {article.helpful}
                    </button>
                    <button
                      onClick={() => handleVote(article.id, false)}
                      className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <HandThumbDownIcon className="w-4 h-4" />
                      {article.notHelpful}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('knowledge:noResults.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('knowledge:noResults.description')}
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {t('knowledge:noResults.createArticle')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
