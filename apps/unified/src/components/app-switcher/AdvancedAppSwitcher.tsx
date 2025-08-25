/**
 * Advanced App Switcher Component - Workvivo-style with Nova Universe integration
 * Features: Smart search, categories, favorites, collections, personalization, SSO integration
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  HeartIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  PlusIcon,
  StarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type {
  App,
  Category,
  Collection,
  DashboardConfig,
  DashboardData,
  LaunchContext,
  SearchFilters,
  ApiResponse,
} from '../../types/app-switcher';

// Enhanced App Switcher Service
class AppSwitcherService {
  private baseUrl = '/api/v1/app-switcher';

  async getDashboard(options: Record<string, any> = {}): Promise<ApiResponse<DashboardData>> {
    const params = new URLSearchParams(options);
    const response = await fetch(`${this.baseUrl}/dashboard?${params}`);
    return response.json();
  }

  async getConfig(): Promise<ApiResponse<DashboardConfig>> {
    const response = await fetch(`${this.baseUrl}/config`);
    return response.json();
  }

  async updateConfig(config: Partial<DashboardConfig>): Promise<ApiResponse<DashboardConfig>> {
    const response = await fetch(`${this.baseUrl}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return response.json();
  }

  async launchApp(appId: number, context: LaunchContext = {}): Promise<void> {
    const response = await fetch(`${this.baseUrl}/apps/${appId}/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    });
    const result = await response.json();

    if (result.success) {
      const { url, requires_new_window } = result.data;

      if (requires_new_window) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }

      // Track usage
      this.trackUsage(appId, 'launch', context);
    }
  }

  async toggleFavorite(appId: number): Promise<ApiResponse<{ is_favorite: boolean }>> {
    const response = await fetch(`${this.baseUrl}/apps/${appId}/favorite`, {
      method: 'POST',
    });
    return response.json();
  }

  async searchApps(
    query: string,
    filters: SearchFilters = {},
  ): Promise<ApiResponse<{ apps: App[] }>> {
    const params = new URLSearchParams({ q: query, ...(filters as any) });
    const response = await fetch(`${this.baseUrl}/search?${params}`);
    return response.json();
  }

  async getRecommendations(limit = 6): Promise<ApiResponse<{ recommendations: App[] }>> {
    const response = await fetch(`${this.baseUrl}/recommendations?limit=${limit}`);
    return response.json();
  }

  async getCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
    const response = await fetch(`${this.baseUrl}/categories`);
    return response.json();
  }

  async trackUsage(
    appId: number,
    action: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/track-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, action, metadata }),
      });
    } catch (_error) {
      console.warn('Failed to track usage:', error);
    }
  }
}

// App Card Component
interface AppCardProps {
  app: App;
  layout: 'grid' | 'list';
  onLaunch: (appId: number, context: LaunchContext) => Promise<void>;
  onToggleFavorite: (appId: number) => Promise<void>;
  showStats?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({
  app,
  layout,
  onLaunch,
  onToggleFavorite,
  showStats = false,
}) => {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      setIsLaunching(true);
      try {
        await onLaunch(app.id, { launch_method: 'card_click' });
      } finally {
        setIsLaunching(false);
      }
    },
    [app.id, onLaunch],
  );

  const handleFavoriteToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onToggleFavorite(app.id);
    },
    [app.id, onToggleFavorite],
  );

  if (layout === 'list') {
    return (
      <div
        className="group flex cursor-pointer items-center rounded-xl border bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-lg"
        onClick={handleLaunch}
      >
        <div
          className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-semibold text-white"
          style={{ backgroundColor: app.backgroundColor }}
        >
          {app.iconUrl ? (
            <img src={app.iconUrl} alt={app.name} className="h-8 w-8 rounded-md" />
          ) : (
            app.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900">{app.name}</h3>
            {app.isFeatured && <StarSolidIcon className="h-4 w-4 text-yellow-500" />}
            {app.isPinned && <TagIcon className="h-4 w-4 text-blue-500" />}
          </div>
          <p className="truncate text-sm text-gray-600">{app.description}</p>
          {showStats && (
            <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
              <span>{app.usage30d} uses this month</span>
              <span>{app.totalUsers} total users</span>
              {app.rating > 0 && (
                <div className="flex items-center gap-1">
                  <StarSolidIcon className="h-3 w-3 text-yellow-400" />
                  <span>{app.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {app.lastAccess && (
            <div className="text-xs text-gray-500">
              <ClockIcon className="mr-1 inline h-3 w-3" />
              {new Date(app.lastAccess).toLocaleDateString()}
            </div>
          )}

          <button
            onClick={handleFavoriteToggle}
            className="rounded-md p-1 transition-colors hover:bg-gray-100"
            title={app.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {app.isFavorite ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {isLaunching ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          ) : (
            <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
          )}
        </div>
      </div>
    );
  }

  // Grid/Card layout
  return (
    <div
      className="group relative transform cursor-pointer rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
      onClick={handleLaunch}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteToggle}
        className="absolute top-3 right-3 z-10 rounded-full p-1.5 transition-colors hover:bg-gray-100"
        title={app.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {app.isFavorite ? (
          <HeartSolidIcon className="h-5 w-5 text-red-500" />
        ) : (
          <HeartIcon className="h-5 w-5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>

      {/* App Icon */}
      <div className="mb-4">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white"
          style={{ backgroundColor: app.backgroundColor }}
        >
          {app.iconUrl ? (
            <img src={app.iconUrl} alt={app.name} className="h-12 w-12 rounded-xl" />
          ) : (
            app.name.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="text-center">
        <div className="mb-1 flex items-center justify-center gap-1">
          <h3 className="truncate font-semibold text-gray-900">{app.name}</h3>
          {app.isFeatured && <StarSolidIcon className="h-4 w-4 text-yellow-500" />}
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{app.description}</p>

        {/* Category Badge */}
        {app.category && (
          <span
            className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${app.category.color}20`,
              color: app.category.color,
            }}
          >
            {app.category.name}
          </span>
        )}

        {/* Stats */}
        {showStats && (
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-500">
            {app.usage30d > 0 && (
              <span className="flex items-center gap-1">
                <ChartBarIcon className="h-3 w-3" />
                {app.usage30d}
              </span>
            )}
            {app.totalUsers > 0 && (
              <span className="flex items-center gap-1">
                <UserGroupIcon className="h-3 w-3" />
                {app.totalUsers}
              </span>
            )}
            {app.rating > 0 && (
              <span className="flex items-center gap-1">
                <StarSolidIcon className="h-3 w-3 text-yellow-400" />
                {app.rating.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Launch Indicator */}
      {isLaunching && (
        <div className="bg-opacity-90 absolute inset-0 flex items-center justify-center rounded-2xl bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
};

// Main App Switcher Component
const AdvancedAppSwitcher: React.FC = () => {
  const [service] = useState(() => new AppSwitcherService());

  // State
  const [apps, setApps] = useState<App[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recommendations, setRecommendations] = useState<App[]>([]);
  const [config, setConfig] = useState<DashboardConfig>({} as DashboardConfig);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<App[]>([]);
  const [selectedView, setSelectedView] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDashboard();
    loadCategories();
    loadRecommendations();
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, configRes] = await Promise.all([
        service.getDashboard({ view: selectedView, category_id: selectedCategory }),
        service.getConfig(),
      ]);

      if (dashboardRes.success && dashboardRes.data) {
        setApps(dashboardRes.data.apps);
        setCollections(dashboardRes.data.collections);
        setConfig(dashboardRes.data.dashboardConfig);
        setLayout(
          dashboardRes.data.dashboardConfig.layout_type === 'grid' ||
            dashboardRes.data.dashboardConfig.layout_type === 'list'
            ? dashboardRes.data.dashboardConfig.layout_type
            : 'grid',
        );
      }
    } catch (_error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [service, selectedView, selectedCategory]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await service.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch (_error) {
      console.error('Failed to load categories:', error);
    }
  }, [service]);

  const loadRecommendations = useCallback(async () => {
    try {
      const response = await service.getRecommendations(6);
      if (response.success && response.data) {
        setRecommendations(response.data.recommendations);
      }
    } catch (_error) {
      console.error('Failed to load recommendations:', error);
    }
  }, [service]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const searchTimer = setTimeout(async () => {
        try {
          const response = await service.searchApps(searchQuery, {
            category_id: selectedCategory || undefined,
          });
          if (response.success && response.data) {
            setSearchResults(response.data.apps);
          }
        } catch (_error) {
          console.error('Search failed:', error);
        }
      }, 300);

      return () => clearTimeout(searchTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory, service]);

  // Event handlers
  const handleLaunchApp = useCallback(
    async (appId: number, context: LaunchContext) => {
      await service.launchApp(appId, context);
    },
    [service],
  );

  const handleToggleFavorite = useCallback(
    async (appId: number) => {
      try {
        const response = await service.toggleFavorite(appId);
        if (response.success && response.data) {
          setApps((prev) =>
            prev.map((app) =>
              app.id === appId ? { ...app, isFavorite: response.data!.is_favorite } : app,
            ),
          );
        }
      } catch (_error) {
        console.error('Failed to toggle favorite:', error);
      }
    },
    [service],
  );

  const handleViewChange = useCallback((view: string, categoryId: number | null = null) => {
    setSelectedView(view);
    setSelectedCategory(categoryId);
    setSearchQuery('');
  }, []);

  const handleLayoutChange = useCallback(
    async (newLayout: 'grid' | 'list') => {
      setLayout(newLayout);
      try {
        await service.updateConfig({ layout_type: newLayout });
      } catch (_error) {
        console.error('Failed to update layout:', error);
      }
    },
    [service],
  );

  // Computed values
  const displayApps = useMemo(() => {
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults;
    }
    return apps;
  }, [apps, searchQuery, searchResults]);

  const isSearching = searchQuery.trim().length >= 2;

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-600">Loading apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Apps</h1>
              <span className="text-sm text-gray-500">
                {displayApps.length} {displayApps.length === 1 ? 'app' : 'apps'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Layout Toggle */}
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => handleLayoutChange('grid')}
                  className={`rounded-md p-2 transition-colors ${
                    layout === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid view"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleLayoutChange('list')}
                  className={`rounded-md p-2 transition-colors ${
                    layout === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-lg p-2 transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Toggle filters"
              >
                <FunnelIcon className="h-5 w-5" />
              </button>

              {/* Settings */}
              <button
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                title="Settings"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative mx-auto max-w-md">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 rounded-xl border bg-white p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* View Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">View</label>
                <select
                  value={selectedView}
                  onChange={(e) => handleViewChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Apps</option>
                  <option value="favorites">Favorites</option>
                  <option value="recent">Recently Used</option>
                  <option value="pinned">Pinned</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) =>
                    handleViewChange(selectedView, e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Sort By</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500">
                  <option value="name">Name</option>
                  <option value="recent">Recently Used</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {!isSearching && recommendations.length > 0 && selectedView === 'all' && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {recommendations.slice(0, 6).map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  layout="grid"
                  onLaunch={handleLaunchApp}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Collections */}
        {!isSearching && collections.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Collections</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="cursor-pointer rounded-xl border bg-white p-4 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg font-semibold text-white"
                      style={{ backgroundColor: collection.color }}
                    >
                      {collection.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{collection.name}</h3>
                      <p className="text-sm text-gray-600">{collection.app_count} apps</p>
                    </div>
                  </div>
                  {collection.description && (
                    <p className="mb-3 text-sm text-gray-600">{collection.description}</p>
                  )}
                  <div className="flex -space-x-2">
                    {(collection as any).preview_apps
                      ?.slice(0, 4)
                      .map((app: App, index: number) => (
                        <div
                          key={app.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white text-xs font-semibold text-white"
                          style={{ backgroundColor: app.backgroundColor }}
                        >
                          {app.iconUrl ? (
                            <img src={app.iconUrl} alt={app.name} className="h-6 w-6 rounded-md" />
                          ) : (
                            app.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      ))}
                    {collection.app_count > 4 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white bg-gray-200 text-xs font-medium text-gray-600">
                        +{collection.app_count - 4}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Apps Grid/List */}
        <div className="mb-8">
          {isSearching && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-sm text-gray-600">
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
              </p>
            </div>
          )}

          {displayApps.length > 0 ? (
            <div
              className={
                layout === 'grid'
                  ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'space-y-3'
              }
            >
              {displayApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  layout={layout}
                  onLaunch={handleLaunchApp}
                  onToggleFavorite={handleToggleFavorite}
                  showStats={layout === 'list'}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <MagnifyingGlassIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {isSearching ? 'No apps found' : 'No apps available'}
              </h3>
              <p className="text-gray-600">
                {isSearching
                  ? 'Try adjusting your search terms or filters'
                  : 'Check back later for new apps'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAppSwitcher;
