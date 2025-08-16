import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  StarIcon,
  EyeIcon,
  ThumbUpIcon,
  ThumbDownIcon,
  CheckBadgeIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { CosmoKnowledgeAssistant } from '@components/cosmo/CosmoWidget'
import { loreService, KnowledgeArticle, KnowledgeCategory, KnowledgeSearchFilters } from '@services/lore'
import { synthService } from '@services/synth'
import { cn, formatRelativeTime, formatNumber } from '@utils/index'
import toast from 'react-hot-toast'

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'popular' | 'rating'>('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [popularTags, setPopularTags] = useState<Array<{ name: string; count: number }>>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  const [filters, setFilters] = useState<KnowledgeSearchFilters>({
    query: '',
    categories: [],
    tags: [],
    verified: undefined,
    visibility: ['public']
  })

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    searchArticles()
  }, [filters, pagination.page, sortBy])

  const loadInitialData = async () => {
    try {
      const [categoriesData, tagsData, leaderboardData, statsData] = await Promise.all([
        loreService.getCategories(),
        loreService.getPopularTags(),
        loreService.getLeaderboard(),
        loreService.getKnowledgeBaseStats()
      ])

      setCategories(categoriesData)
      setPopularTags(tagsData)
      setLeaderboard(leaderboardData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load initial data:', error)
      toast.error('Failed to load knowledge base data')
    }
  }

  const searchArticles = async () => {
    setIsLoading(true)
    
    try {
      const result = await loreService.searchArticles(
        filters,
        pagination.page,
        pagination.perPage
      )

      setArticles(result.articles)
      setPagination(prev => ({
        ...prev,
        total: result.total
      }))
    } catch (error) {
      console.error('Failed to search articles:', error)
      toast.error('Failed to search knowledge base')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setFilters(prev => ({ ...prev, query }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setFilters(prev => ({
      ...prev,
      categories: categoryId ? [categoryId] : []
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleLikeArticle = async (articleId: string) => {
    try {
      const result = await loreService.toggleLike(articleId)
      
      // Update article in state
      setArticles(prev => prev.map(article => 
        article.id === articleId
          ? { ...article, metrics: { ...article.metrics, likes: result.totalLikes } }
          : article
      ))

      toast.success(result.liked ? 'Article liked!' : 'Like removed')
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  const handleRateArticle = async (articleId: string, rating: number) => {
    try {
      const result = await loreService.rateArticle(articleId, rating)
      
      // Update article in state
      setArticles(prev => prev.map(article => 
        article.id === articleId
          ? { 
              ...article, 
              metrics: { 
                ...article.metrics, 
                avgRating: result.avgRating,
                totalRatings: result.totalRatings
              }
            }
          : article
      ))

      toast.success('Rating submitted!')
    } catch (error) {
      toast.error('Failed to submit rating')
    }
  }

  const askCosmoAboutArticle = async (article: KnowledgeArticle) => {
    try {
      const response = await synthService.askCosmo(
        `Tell me more about "${article.title}" and help me understand this topic better`,
        {
          currentModule: 'knowledge_base',
          organizationData: { articleId: article.id }
        }
      )
      
      toast.success('Cosmo is ready to help with this article!')
    } catch (error) {
      toast.error('Failed to get help from Cosmo')
    }
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            className={cn(
              'transition-colors',
              interactive && 'hover:text-yellow-400',
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            )}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarSolidIcon className="w-4 h-4" />
            ) : (
              <StarIcon className="w-4 h-4" />
            )}
          </button>
        ))}
      </div>
    )
  }

  const renderArticleCard = (article: KnowledgeArticle) => (
    <div key={article.id} className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link 
            to={`/knowledge/articles/${article.id}`}
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-nova-600 transition-colors"
          >
            {article.title}
          </Link>
          
          {article.verification.isVerified && (
            <div className="flex items-center gap-1 mt-1">
              <CheckBadgeIcon className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 dark:text-green-400">
                {article.verification.verificationBadge}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLikeArticle(article.id)}
            className="btn btn-ghost btn-sm"
          >
            <ThumbUpIcon className="w-4 h-4" />
            {article.metrics.likes}
          </button>
          
          <button
            onClick={() => askCosmoAboutArticle(article)}
            className="btn btn-ghost btn-sm text-purple-600"
            title="Ask Cosmo about this article"
          >
            ✨
          </button>
        </div>
      </div>

      {article.summary && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {article.summary}
        </p>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            {formatNumber(article.metrics.views)}
          </div>
          
          <div className="flex items-center gap-1">
            {renderStars(article.metrics.avgRating)}
            <span>({article.metrics.totalRatings})</span>
          </div>
          
          <div className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            {article.author.name}
          </div>
        </div>

        <span className="text-xs text-gray-400">
          {formatRelativeTime(article.updatedAt)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map(tag => (
            <button
              key={tag}
              onClick={() => handleTagFilter(tag)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <TagIcon className="w-3 h-3" />
              {tag}
            </button>
          ))}
          {article.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{article.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {renderStars(0, true, (rating) => handleRateArticle(article.id, rating))}
        </div>
      </div>
    </div>
  )

  const renderCategoryTree = (categories: KnowledgeCategory[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className={cn('', level > 0 && 'ml-4')}>
        <button
          onClick={() => handleCategoryFilter(category.id)}
          className={cn(
            'flex items-center gap-2 w-full p-2 text-left rounded-lg transition-colors',
            selectedCategory === category.id
              ? 'bg-nova-100 text-nova-700 dark:bg-nova-900 dark:text-nova-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          {category.icon && <span className="text-lg">{category.icon}</span>}
          <span className="flex-1">{category.name}</span>
          <span className="text-sm text-gray-500">
            {formatNumber(category.articleCount)}
          </span>
        </button>
        
        {category.children && category.children.length > 0 && (
          <div className="mt-1">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Nova Lore Knowledge Base
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Discover solutions, share knowledge, and learn from the community
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/knowledge/create" className="btn btn-primary">
            <PlusIcon className="h-4 w-4" />
            Create Article
          </Link>
          
          <Link to="/knowledge/leaderboard" className="btn btn-secondary">
            <TrophyIcon className="h-4 w-4" />
            Leaderboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-nova-600">
              {formatNumber(stats.totalArticles)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Articles</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(stats.publishedArticles)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(stats.totalViews)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.avgRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <div className="card p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Categories
            </h3>
            
            <button
              onClick={() => handleCategoryFilter('')}
              className={cn(
                'flex items-center gap-2 w-full p-2 text-left rounded-lg transition-colors mb-2',
                !selectedCategory
                  ? 'bg-nova-100 text-nova-700 dark:bg-nova-900 dark:text-nova-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <span className="flex-1">All Categories</span>
              <span className="text-sm text-gray-500">
                {formatNumber(stats?.totalArticles || 0)}
              </span>
            </button>
            
            {renderCategoryTree(categories)}
          </div>

          {/* Popular Tags */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Popular Tags
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, 10).map(tag => (
                <button
                  key={tag.name}
                  onClick={() => handleTagFilter(tag.name)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors',
                    filters.tags?.includes(tag.name)
                      ? 'bg-nova-100 text-nova-700 dark:bg-nova-900 dark:text-nova-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  )}
                >
                  <TagIcon className="w-3 h-3" />
                  {tag.name}
                  <span className="text-xs opacity-75">
                    {tag.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Top Contributors
            </h3>
            
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((author, index) => (
                <div key={author.user.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      index === 0 && 'bg-yellow-100 text-yellow-800',
                      index === 1 && 'bg-gray-100 text-gray-800',
                      index === 2 && 'bg-orange-100 text-orange-800',
                      index > 2 && 'bg-blue-100 text-blue-800'
                    )}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {author.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {author.stats.totalXP} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters Bar */}
          <div className="card p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-secondary"
                >
                  <FunnelIcon className="h-4 w-4" />
                  Filters
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'btn btn-sm',
                    viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'
                  )}
                >
                  Grid
                </button>
                
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'btn btn-sm',
                    viewMode === 'list' ? 'btn-primary' : 'btn-secondary'
                  )}
                >
                  List
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.categories?.length || filters.tags?.length) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {filters.categories?.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId)
                    return category ? (
                      <span
                        key={categoryId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-nova-100 text-nova-700 rounded-full text-xs"
                      >
                        {category.name}
                        <button
                          onClick={() => handleCategoryFilter('')}
                          className="ml-1 hover:text-nova-900"
                        >
                          ×
                        </button>
                      </span>
                    ) : null
                  })}
                  
                  {filters.tags?.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagFilter(tag)}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Articles */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading articles..." />
            </div>
          ) : articles.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No articles found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters, or create a new article
              </p>
              <Link to="/knowledge/create" className="btn btn-primary mt-4">
                <PlusIcon className="h-4 w-4" />
                Create Article
              </Link>
            </div>
          ) : (
            <div className={cn(
              'grid gap-6',
              viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
            )}>
              {articles.map(renderArticleCard)}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.perPage && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
                {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.perPage)}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cosmo Assistant */}
      <CosmoKnowledgeAssistant />
    </div>
  )
}