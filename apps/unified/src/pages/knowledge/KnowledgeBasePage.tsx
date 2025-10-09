import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  DocumentTextIcon,
  TagIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import backendAPI from '../../services/backend-api-client';
import { usePermission } from '@hooks/usePermission';
import { PermissionGuard } from '@components/common/PermissionGuard';
import { DisabledButton, ReadOnlyBadge } from '@components/common/UnauthorizedTooltip';

export default function KnowledgeBasePage() {
  // RBAC checks
  const canCreateArticle = usePermission('articles:create');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for backend data
  const [categories, setCategories] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [popularArticles, setPopularArticles] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch popular articles and categories on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch popular articles from backend
        const articles = await backendAPI.knowledge.getPopular();
        setPopularArticles(articles);
        
        // Fetch categories from backend
        const cats = await backendAPI.knowledge.getCategories();
        // Map categories to include colors
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];
        const categoriesWithColors = cats.map((cat: any, idx: number) => ({
          ...cat,
          color: colors[idx % colors.length]
        }));
        setCategories(categoriesWithColors);
      } catch (err: any) {
        console.error('Error fetching knowledge base data:', err);
        setError(err.message || 'Failed to load knowledge base');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    async function performSearch() {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      try {
        const results = await backendAPI.knowledge.search(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching:', err);
      }
    }
    
    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Error Loading Knowledge Base</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const articlesToDisplay = searchQuery.trim() ? searchResults : popularArticles;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Find answers and solutions to common questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!canCreateArticle && (
            <ReadOnlyBadge 
              message="You have read-only access to the knowledge base" 
              showContact 
            />
          )}
          <PermissionGuard permission="articles:create">
            <button className="bg-nova-600 hover:bg-nova-700 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors">
              <PlusIcon className="h-4 w-4" />
              Suggest Article
            </button>
            <DisabledButton 
              tooltip="You don't have permission to suggest articles"
              showContact
            >
              <PlusIcon className="h-4 w-4" />
              Suggest Article
            </DisabledButton>
          </PermissionGuard>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <MagnifyingGlassIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search for articles, guides, and solutions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 py-3 pr-4 pl-12 text-lg focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Categories */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <TagIcon className="h-5 w-5" />
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.name}
              className="flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <div
                className={`h-10 w-10 rounded-lg ${category.color} flex items-center justify-center`}
              >
                <BookOpenIcon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.count} articles
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Articles */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <DocumentTextIcon className="h-5 w-5" />
          {searchQuery.trim() ? 'Search Results' : 'Popular Articles'}
        </h2>
        {articlesToDisplay.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpenIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{searchQuery.trim() ? 'No articles found' : 'No articles available'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articlesToDisplay.map((article: any) => (
              <div
                key={article.id}
                className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="hover:text-nova-600 dark:hover:text-nova-400 font-medium text-gray-900 dark:text-white">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{article.summary}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      {article.categoryId && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          {article.categoryId}
                        </span>
                      )}
                      <span>{article.viewCount || 0} views</span>
                      <span>{article.helpfulCount || 0} found helpful</span>
                      {article.publishedAt && (
                        <span>Published {new Date(article.publishedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
