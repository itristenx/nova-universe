import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  isBookmarked?: boolean;
}

interface SearchSuggestion {
  query: string;
  type: 'recent' | 'popular' | 'autocomplete';
  count?: number;
}

interface KnowledgeBaseProps {
  articles?: Article[];
  categories?: string[];
  onArticleSelect?: (article: Article) => void;
  onBookmarkToggle?: (articleId: string) => void;
  className?: string;
}

export default function EnhancedKnowledgeBase({
  articles = [],
  categories = [],
  onArticleSelect,
  onBookmarkToggle,
  className = '',
}: KnowledgeBaseProps) {
  const { t } = useTranslation(['knowledgeBase', 'common']);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'popular' | 'rating'>('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Search and filtering state
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('kb-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback(
    (query: string) => {
      if (!query.trim() || searchHistory.includes(query)) return;

      const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('kb-search-history', JSON.stringify(newHistory));
    },
    [searchHistory],
  );

  // Generate search suggestions
  const generateSuggestions = useCallback(
    (query: string): SearchSuggestion[] => {
      if (!query.trim()) {
        return searchHistory.slice(0, 5).map((h) => ({ query: h, type: 'recent' as const }));
      }

      const suggestions: SearchSuggestion[] = [];

      // Autocomplete from article titles and content
      articles.forEach((article) => {
        if (article.title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            query: article.title,
            type: 'autocomplete',
          });
        }
      });

      // Recent searches that match
      searchHistory.forEach((h) => {
        if (h.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            query: h,
            type: 'recent',
          });
        }
      });

      return suggestions.slice(0, 8);
    },
    [articles, searchHistory],
  );

  // Update suggestions when query changes
  useEffect(() => {
    const suggestions = generateSuggestions(searchQuery);
    setSearchSuggestions(suggestions);
  }, [searchQuery, generateSuggestions]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach((article) => {
      article.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [articles]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          article.category.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((article) =>
        selectedTags.every((tag) => article.tags.includes(tag)),
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'relevance':
      default:
        // Keep natural order for relevance when searching
        break;
    }

    return filtered;
  }, [articles, searchQuery, selectedCategory, selectedTags, sortBy]);

  const handleSearch = useCallback(
    (query: string = searchQuery) => {
      if (query.trim()) {
        setIsSearching(true);
        saveToHistory(query.trim());
        setShowSuggestions(false);

        // Simulate search delay
        setTimeout(() => {
          setIsSearching(false);
        }, 300);
      }
    },
    [searchQuery, saveToHistory],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: SearchSuggestion) => {
      setSearchQuery(suggestion.query);
      setShowSuggestions(false);
      handleSearch(suggestion.query);
    },
    [handleSearch],
  );

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
    setSortBy('relevance');
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            placeholder={t(
              'knowledgeBase.searchPlaceholder',
              'Search articles, guides, and solutions...',
            )}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-12 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />

          <div className="absolute top-1/2 left-4 -translate-y-1/2 transform">
            {isSearching ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            ) : (
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="absolute top-1/2 right-4 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex w-full items-center space-x-3 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <div className="flex-shrink-0">
                  {suggestion.type === 'recent' ? (
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-900 dark:text-white">
                    {suggestion.query}
                  </p>
                  {suggestion.type === 'recent' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('knowledgeBase.recentSearch', 'Recent search')}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-4">
          {/* Categories */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">{t('knowledgeBase.allCategories', 'All Categories')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-lg border px-3 py-2 transition-colors ${
              showFilters || selectedTags.length > 0
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                />
              </svg>
              <span>{t('knowledgeBase.filters', 'Filters')}</span>
              {selectedTags.length > 0 && (
                <span className="min-w-[20px] rounded-full bg-blue-500 px-2 py-0.5 text-center text-xs text-white">
                  {selectedTags.length}
                </span>
              )}
            </div>
          </button>

          {/* Clear Filters */}
          {(searchQuery || selectedCategory || selectedTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {t('knowledgeBase.clearFilters', 'Clear all')}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="relevance">{t('knowledgeBase.sortRelevance', 'Relevance')}</option>
            <option value="newest">{t('knowledgeBase.sortNewest', 'Newest')}</option>
            <option value="popular">{t('knowledgeBase.sortPopular', 'Most Popular')}</option>
            <option value="rating">{t('knowledgeBase.sortRating', 'Highest Rated')}</option>
          </select>

          {/* View Mode */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-500 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-500 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tag Filters */}
      {showFilters && allTags.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
            {t('knowledgeBase.filterByTags', 'Filter by tags')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('knowledgeBase.resultsCount', '{{count}} articles found', {
              count: filteredArticles.length,
            })}
          </p>

          {searchQuery && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('knowledgeBase.searchingFor', 'Searching for: ')}
              <span className="font-medium text-gray-900 dark:text-white">"{searchQuery}"</span>
            </div>
          )}
        </div>

        {/* Articles Grid/List */}
        {filteredArticles.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
            }
          >
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                viewMode={viewMode}
                onSelect={() => onArticleSelect?.(article)}
                onBookmarkToggle={() => onBookmarkToggle?.(article.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.718 2.172C5.297 18.233 4.665 19.054 4 20h16c-.665-.946-1.297-1.767-2.282-2.828z"
              />
            </svg>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              {t('knowledgeBase.noResults', 'No articles found')}
            </h3>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              {t('knowledgeBase.noResultsDesc', 'Try adjusting your search or filters')}
            </p>
            <button
              onClick={clearFilters}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {t('knowledgeBase.clearFilters', 'Clear all filters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Article Card Component
interface ArticleCardProps {
  article: Article;
  viewMode: 'list' | 'grid';
  onSelect: () => void;
  onBookmarkToggle: () => void;
}

function ArticleCard({ article, viewMode, onSelect, onBookmarkToggle }: ArticleCardProps) {
  const { t } = useTranslation(['knowledgeBase', 'common']);

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
        viewMode === 'list' ? 'p-4' : 'p-6'
      }`}
    >
      <div
        className={`flex ${viewMode === 'list' ? 'items-start space-x-4' : 'flex-col space-y-4'}`}
      >
        {/* Article Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between">
            <button onClick={onSelect} className="group flex-1 text-left">
              <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {article.title}
              </h3>
            </button>

            <button
              onClick={onBookmarkToggle}
              className={`ml-2 rounded-full p-1 transition-colors ${
                article.isBookmarked
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
              }`}
            >
              <svg
                className="h-5 w-5"
                fill={article.isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>

          <p className="mb-3 line-clamp-3 text-gray-600 dark:text-gray-300">{article.excerpt}</p>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{article.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>{article.category}</span>

              <span
                className={`rounded-full px-2 py-1 text-xs ${difficultyColors[article.difficulty]}`}
              >
                {t(`knowledgeBase.difficulty.${article.difficulty}`, article.difficulty)}
              </span>

              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{article.estimatedReadTime} min</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>{article.viewCount}</span>
              </div>

              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{article.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
