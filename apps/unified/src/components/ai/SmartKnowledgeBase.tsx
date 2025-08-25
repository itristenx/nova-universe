/**
 * Smart Knowledge Base - Phase 2 Implementation
 * AI-powered knowledge search and content recommendations
 * Inspired by ServiceNow AI Search and intelligent knowledge discovery
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { knowledgeService, type SearchSuggestion } from '@/services/knowledge';
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
} from '@heroicons/react/24/outline';

interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  lastUpdated: string;
  views: number;
  rating: number;
  helpful: number;
  notHelpful: number;
  relevanceScore: number;
  aiSummary?: string;
  relatedArticles: string[];
  attachments?: string[];
}

interface SmartKnowledgeBaseProps {
  initialQuery?: string;
  contextData?: {
    ticketCategory?: string;
    userRole?: string;
    department?: string;
  };
}

export function SmartKnowledgeBase({ initialQuery = '', contextData }: SmartKnowledgeBaseProps) {
  const { t } = useTranslation(['knowledge', 'common']);
  const [query, setQuery] = useState(initialQuery);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  // AI-powered semantic search with intelligent content filtering
  const performAISearch = useCallback(
    async (searchQuery: string, category: string) => {
      if (!searchQuery.trim()) {
        setArticles([]);
        setSuggestions([]);
        setAiInsights([]);
        return;
      }

      setIsLoading(true);

      try {
        // Use real API call to search knowledge base
        const searchResults = await knowledgeService.search({
          query: searchQuery,
          category: category !== 'all' ? category : undefined,
          sortBy,
          limit: 20,
        });

        setArticles(searchResults.articles);
        setSuggestions(searchResults.suggestions);
        setAiInsights(searchResults.insights);
      } catch (_error) {
        console.error('Knowledge search failed:', error);
        setArticles([]);
        setSuggestions([]);
        setAiInsights([]);
      } finally {
        setIsLoading(false);
      }
    },
    [sortBy],
  );

  useEffect(() => {
    performAISearch(query, selectedCategory);
  }, [query, selectedCategory, performAISearch]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleVote = async (articleId: string, isHelpful: boolean) => {
    try {
      await knowledgeService.rateArticle(articleId, isHelpful);

      // Update local state to reflect the vote
      setArticles((prev) =>
        prev.map((article) => {
          if (article.id === articleId) {
            return {
              ...article,
              helpful: isHelpful ? article.helpful + 1 : article.helpful,
              notHelpful: !isHelpful ? article.notHelpful + 1 : article.notHelpful,
            };
          }
          return article;
        }),
      );
    } catch (_error) {
      console.error('Failed to rate article:', error);
    }
  };

  const handleArticleClick = async (articleId: string) => {
    try {
      await knowledgeService.trackView(articleId);

      // Update local state to reflect the view
      setArticles((prev) =>
        prev.map((article) => {
          if (article.id === articleId) {
            return {
              ...article,
              views: article.views + 1,
            };
          }
          return article;
        }),
      );
    } catch (_error) {
      console.error('Failed to track article view:', error);
    }
  };

  const handleBookmark = async (articleId: string) => {
    try {
      await knowledgeService.bookmarkArticle(articleId);
      // Could add UI feedback here
    } catch (_error) {
      console.error('Failed to bookmark article:', error);
    }
  };

  const handleShare = async (articleId: string) => {
    try {
      await knowledgeService.shareArticle(articleId, { method: 'copy-link' });
      // Could add UI feedback here (toast notification)
    } catch (_error) {
      console.error('Failed to share article:', error);
    }
  };

  const categories = ['all', 'Security', 'Infrastructure', 'Software', 'Hardware', 'Process'];

  return (
    <div className="space-y-6">
      {/* Smart Search Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="mb-4 flex items-center gap-3">
          <SparklesIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('knowledge:search.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t('knowledge:search.subtitle')}</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('knowledge:search.placeholder')}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-12 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {isLoading && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2 transform">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Search Suggestions */}
        {!query && suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('knowledge:suggestions.title')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSearch(suggestion.text)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <TagIcon className="h-3 w-3 text-blue-500" />
                  {suggestion.text}
                  <span className="text-xs text-gray-500">({suggestion.category})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? t('knowledge:categories.all') : category}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          aria-label={t('knowledge:sort.label')}
        >
          <option value="relevance">{t('knowledge:sort.relevance')}</option>
          <option value="recent">{t('knowledge:sort.recent')}</option>
          <option value="popular">{t('knowledge:sort.popular')}</option>
        </select>
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && query && (
        <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-300">
            <LightBulbIcon className="h-4 w-4" />
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
              <div
                key={i}
                className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-3 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mb-2 h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.id}
              className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <h3
                      className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                      onClick={() => handleArticleClick(article.id)}
                    >
                      {article.title}
                    </h3>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {article.relevanceScore}% {t('knowledge:article.relevant')}
                    </span>
                  </div>
                  <p className="mb-3 text-gray-600 dark:text-gray-400">{article.summary}</p>

                  {article.aiSummary && (
                    <div className="mb-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-3 dark:from-blue-900/20 dark:to-purple-900/20">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <SparklesIcon className="mr-1 inline h-4 w-4 text-purple-600" />
                        <strong>{t('knowledge:article.aiSummary')}:</strong> {article.aiSummary}
                      </p>
                    </div>
                  )}

                  {article.relatedArticles && article.relatedArticles.length > 0 && (
                    <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                      <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                        <DocumentTextIcon className="mr-1 inline h-4 w-4 text-gray-600" />
                        <strong>{t('knowledge:article.relatedArticles')}:</strong>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {article.relatedArticles.map((relatedId, index) => (
                          <span
                            key={index}
                            className="cursor-pointer text-xs text-blue-600 hover:underline dark:text-blue-400"
                            onClick={() => handleArticleClick(relatedId)}
                          >
                            {t('knowledge:article.relatedArticle')} {index + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {article.attachments && article.attachments.length > 0 && (
                    <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                      <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                        <DocumentTextIcon className="mr-1 inline h-4 w-4 text-gray-600" />
                        <strong>{t('knowledge:article.attachments')}:</strong>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {article.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {t('knowledge:article.attachment')} {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center gap-2">
                  <BookmarkIcon
                    className="h-5 w-5 cursor-pointer text-gray-400 transition-colors hover:text-blue-600"
                    onClick={() => handleBookmark(article.id)}
                    title={t('knowledge:article.bookmark')}
                  />
                  <ShareIcon
                    className="h-5 w-5 cursor-pointer text-gray-400 transition-colors hover:text-blue-600"
                    onClick={() => handleShare(article.id)}
                    title={t('knowledge:article.share')}
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {article.lastUpdated}
                  </span>
                  <span className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    {article.rating}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span>
                    {article.views} {t('knowledge:article.views')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(article.id, true)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <HandThumbUpIcon className="h-4 w-4" />
                      {article.helpful}
                    </button>
                    <button
                      onClick={() => handleVote(article.id, false)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <HandThumbDownIcon className="h-4 w-4" />
                      {article.notHelpful}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <BookOpenIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              {t('knowledge:noResults.title')}
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {t('knowledge:noResults.description')}
            </p>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              {t('knowledge:noResults.createArticle')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
