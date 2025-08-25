/**
 * Unified Command Center - Phase 1 Implementation
 * Advanced search and command interface inspired by ServiceNow and Apple
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  BookmarkIcon,
  CommandLineIcon,
  UserIcon,
  TicketIcon,
  CubeIcon,
  DocumentTextIcon,
  MapIcon,
  ChartBarIcon,
  XMarkIcon,
  ArrowRightIcon,
  SparklesIcon,
  CpuChipIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  DocumentMagnifyingGlassIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@stores/auth';

interface SearchScope {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  placeholder: string;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  scope: string;
  icon: React.ComponentType<any>;
  metadata?: {
    status?: string;
    priority?: string;
    assignee?: string;
    lastModified?: string;
  };
}

interface QuickAction {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  action: () => void;
  shortcut?: string;
  category: string;
}

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const searchScopes: SearchScope[] = [
  {
    id: 'all',
    name: 'navigation:commandCenter.scopes.all.name',
    icon: MagnifyingGlassIcon,
    color: 'text-gray-600',
    placeholder: 'navigation:commandCenter.scopes.all.placeholder',
  },
  {
    id: 'tickets',
    name: 'navigation:commandCenter.scopes.tickets.name',
    icon: TicketIcon,
    color: 'text-blue-600',
    placeholder: 'navigation:commandCenter.scopes.tickets.placeholder',
  },
  {
    id: 'assets',
    name: 'navigation:commandCenter.scopes.assets.name',
    icon: CubeIcon,
    color: 'text-green-600',
    placeholder: 'navigation:commandCenter.scopes.assets.placeholder',
  },
  {
    id: 'knowledge',
    name: 'navigation:commandCenter.scopes.knowledge.name',
    icon: DocumentTextIcon,
    color: 'text-purple-600',
    placeholder: 'navigation:commandCenter.scopes.knowledge.placeholder',
  },
  {
    id: 'users',
    name: 'navigation:commandCenter.scopes.users.name',
    icon: UserIcon,
    color: 'text-orange-600',
    placeholder: 'navigation:commandCenter.scopes.users.placeholder',
  },
  {
    id: 'spaces',
    name: 'navigation:commandCenter.scopes.spaces.name',
    icon: MapIcon,
    color: 'text-indigo-600',
    placeholder: 'navigation:commandCenter.scopes.spaces.placeholder',
  },
  {
    id: 'ai',
    name: 'navigation:commandCenter.scopes.ai.name',
    icon: SparklesIcon,
    color: 'text-purple-600',
    placeholder: 'navigation:commandCenter.scopes.ai.placeholder',
  },
];

export function UnifiedCommandCenter({ isOpen, onClose }: CommandCenterProps) {
  const { t } = useTranslation(['navigation', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [query, setQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Quick actions based on user role
  const quickActions: QuickAction[] = [
    {
      id: 'create-ticket',
      name: t('navigation:commandCenter.quickActions.createTicket'),
      icon: TicketIcon,
      action: () => navigate('/tickets/new'),
      shortcut: '⌘T',
      category: 'Creation',
    },
    {
      id: 'view-dashboard',
      name: t('navigation:commandCenter.quickActions.dashboard'),
      icon: ChartBarIcon,
      action: () => navigate('/dashboard'),
      shortcut: '⌘D',
      category: 'Navigation',
    },
    {
      id: 'knowledge-base',
      name: t('navigation:commandCenter.quickActions.knowledgeBase'),
      icon: DocumentTextIcon,
      action: () => navigate('/knowledge'),
      shortcut: '⌘K',
      category: 'Navigation',
    },
    {
      id: 'asset-checkout',
      name: t('navigation:commandCenter.quickActions.assetCheckout'),
      icon: CubeIcon,
      action: () => navigate('/assets/checkout'),
      category: 'Actions',
    },
    {
      id: 'book-space',
      name: t('navigation:commandCenter.quickActions.bookSpace'),
      icon: MapIcon,
      action: () => navigate('/spaces/booking'),
      category: 'Actions',
    },
    {
      id: 'ai-control-center',
      name: t('navigation:commandCenter.quickActions.aiControlCenter'),
      icon: SparklesIcon,
      action: () => navigate('/ai'),
      shortcut: '⌘A',
      category: 'AI',
    },
    {
      id: 'ai-analytics',
      name: t('navigation:commandCenter.quickActions.aiAnalytics'),
      icon: ChartBarIcon,
      action: () => navigate('/ai/analytics'),
      category: 'AI',
    },
    {
      id: 'ai-chatbot',
      name: t('navigation:commandCenter.quickActions.aiChatbot'),
      icon: ChatBubbleLeftRightIcon,
      action: () => navigate('/ai/chatbot'),
      shortcut: '⌘⇧C',
      category: 'AI',
    },
    {
      id: 'smart-knowledge',
      name: t('navigation:commandCenter.quickActions.smartKnowledge'),
      icon: DocumentMagnifyingGlassIcon,
      action: () => navigate('/ai/knowledge'),
      category: 'AI',
    },
    {
      id: 'workflow-automation',
      name: t('navigation:commandCenter.quickActions.workflowAutomation'),
      icon: CogIcon,
      action: () => navigate('/ai/automation'),
      category: 'AI',
    },
  ];

  // Enhanced search function with AI scope integration and prepared for full API integration
  const performSearch = useCallback(async (searchQuery: string, scope: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // AI scope - provide relevant AI feature results
      if (scope === 'ai') {
        const aiResults: SearchResult[] = [];
        const query = searchQuery.toLowerCase();

        if (query.includes('predict') || query.includes('analytic') || query.includes('forecast')) {
          aiResults.push({
            id: 'ai-analytics',
            title: t('navigation:commandCenter.searchResults.aiAnalytics.title'),
            description: t('navigation:commandCenter.searchResults.aiAnalytics.description'),
            url: '/ai/analytics',
            scope: 'ai',
            icon: ChartBarIcon,
            metadata: {
              status: t('navigation:commandCenter.searchResults.status.active'),
              lastModified: 'Today',
            },
          });
        }

        if (query.includes('chat') || query.includes('bot') || query.includes('assistant')) {
          aiResults.push({
            id: 'ai-chatbot',
            title: t('navigation:commandCenter.searchResults.aiChatbot.title'),
            description: t('navigation:commandCenter.searchResults.aiChatbot.description'),
            url: '/ai/chatbot',
            scope: 'ai',
            icon: ChatBubbleLeftRightIcon,
            metadata: { status: t('navigation:commandCenter.searchResults.status.available247') },
          });
        }

        if (query.includes('classify') || query.includes('ticket') || query.includes('routing')) {
          aiResults.push({
            id: 'ai-classification',
            title: t('navigation:commandCenter.searchResults.aiClassification.title'),
            description: t('navigation:commandCenter.searchResults.aiClassification.description'),
            url: '/ai/classification',
            scope: 'ai',
            icon: CpuChipIcon,
            metadata: {
              status: t('navigation:commandCenter.searchResults.status.learning'),
              lastModified: 'Today',
            },
          });
        }

        if (query.includes('knowledge') || query.includes('search') || query.includes('article')) {
          aiResults.push({
            id: 'ai-knowledge',
            title: t('navigation:commandCenter.searchResults.aiKnowledge.title'),
            description: t('navigation:commandCenter.searchResults.aiKnowledge.description'),
            url: '/ai/knowledge',
            scope: 'ai',
            icon: DocumentMagnifyingGlassIcon,
            metadata: { status: t('navigation:commandCenter.searchResults.status.enhanced') },
          });
        }

        if (query.includes('workflow') || query.includes('automat') || query.includes('process')) {
          aiResults.push({
            id: 'ai-automation',
            title: t('navigation:commandCenter.searchResults.aiAutomation.title'),
            description: t('navigation:commandCenter.searchResults.aiAutomation.description'),
            url: '/ai/automation',
            scope: 'ai',
            icon: CogIcon,
            metadata: { status: t('navigation:commandCenter.searchResults.status.optimizing') },
          });
        }

        // If no specific matches, show all AI features
        if (aiResults.length === 0) {
          aiResults.push(
            {
              id: 'ai-control-center',
              title: t('navigation:commandCenter.searchResults.aiControlCenter.title'),
              description: t('navigation:commandCenter.searchResults.aiControlCenter.description'),
              url: '/ai',
              scope: 'ai',
              icon: SparklesIcon,
              metadata: { status: t('navigation:commandCenter.searchResults.status.active') },
            },
            ...[
              {
                id: 'ai-analytics',
                title: t('navigation:commandCenter.searchResults.aiAnalytics.title'),
                icon: ChartBarIcon,
                url: '/ai/analytics',
              },
              {
                id: 'ai-chatbot',
                title: t('navigation:commandCenter.searchResults.aiChatbot.title'),
                icon: ChatBubbleLeftRightIcon,
                url: '/ai/chatbot',
              },
              {
                id: 'ai-classification',
                title: t('navigation:commandCenter.searchResults.aiClassification.title'),
                icon: CpuChipIcon,
                url: '/ai/classification',
              },
              {
                id: 'ai-knowledge',
                title: t('navigation:commandCenter.searchResults.aiKnowledge.title'),
                icon: DocumentMagnifyingGlassIcon,
                url: '/ai/knowledge',
              },
              {
                id: 'ai-automation',
                title: t('navigation:commandCenter.searchResults.aiAutomation.title'),
                icon: CogIcon,
                url: '/ai/automation',
              },
            ].map((feature) => ({
              ...feature,
              description:
                feature.id === 'ai-analytics'
                  ? t('navigation:commandCenter.searchResults.aiAnalytics.description')
                  : feature.id === 'ai-chatbot'
                    ? t('navigation:commandCenter.searchResults.aiChatbot.description')
                    : feature.id === 'ai-classification'
                      ? t('navigation:commandCenter.searchResults.aiClassification.description')
                      : feature.id === 'ai-knowledge'
                        ? t('navigation:commandCenter.searchResults.aiKnowledge.description')
                        : t('navigation:commandCenter.searchResults.aiAutomation.description'),
              scope: 'ai' as const,
              metadata: { status: t('navigation:commandCenter.searchResults.status.available') },
            })),
          );
        }

        setResults(aiResults);
        return;
      }

      // Search implementation for other scopes will integrate with backend APIs
      // Currently returns empty results for non-AI scopes during Phase 1-3 development
      // Future implementation will connect to:
      // - Ticket search API for tickets scope
      // - Asset search API for assets scope
      // - Knowledge search API for knowledge scope
      // - User search API for users scope
      // - Space search API for spaces scope
      setResults([]);
    } catch (_error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search input changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query, selectedScope);
    }, 150);

    return () => clearTimeout(debounceTimer);
  }, [query, selectedScope, performSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            navigate(results[selectedIndex].url);
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate, onClose]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentScope = searchScopes.find((scope) => scope.id === selectedScope) || searchScopes[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-screen items-start justify-center px-4 pt-16">
        <div
          ref={containerRef}
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <CommandLineIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('navigation:commandCenter.title')}
              </span>
            </div>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={t('navigation:commandCenter.closeLabel')}
              title={t('navigation:commandCenter.closeLabel')}
            >
              <XMarkIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Search Scopes */}
          <div className="flex gap-1 border-b border-gray-100 p-3 dark:border-gray-800">
            {searchScopes.map((scope) => {
              const Icon = scope.icon;
              return (
                <button
                  key={scope.id}
                  onClick={() => setSelectedScope(scope.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    selectedScope === scope.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${selectedScope === scope.id ? scope.color : ''}`} />
                  {t(scope.name)}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative p-4">
            <div className="flex items-center gap-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(currentScope.placeholder)}
                className="flex-1 bg-transparent text-lg placeholder-gray-400 outline-none dark:text-white"
              />
              {isLoading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              )}
            </div>
          </div>

          {/* Results or Empty State */}
          <div className="max-h-96 overflow-y-auto">
            {query ? (
              <div className="pb-4">
                {results.length > 0 ? (
                  <div className="space-y-1 px-2">
                    {results.map((result, index) => {
                      const Icon = result.icon;
                      return (
                        <button
                          key={result.id}
                          onClick={() => {
                            navigate(result.url);
                            onClose();
                          }}
                          className={`mx-2 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                            index === selectedIndex
                              ? 'bg-blue-50 dark:bg-blue-900/30'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Icon className="h-5 w-5 text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-gray-900 dark:text-white">
                              {result.title}
                            </div>
                            <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                              {result.description}
                            </div>
                            {result.metadata && (
                              <div className="mt-1 flex gap-2">
                                {result.metadata.status && (
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                                    {result.metadata.status}
                                  </span>
                                )}
                                {result.metadata.priority && (
                                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                    {result.metadata.priority}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('navigation:commandCenter.noResults', { query })}
                  </div>
                )}
              </div>
            ) : (
              <div className="pb-4">
                {/* Quick Actions */}
                <div className="px-4 py-2">
                  <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('navigation:commandCenter.quickActions.title')}
                  </h3>

                  {/* Group actions by category */}
                  {Object.entries(
                    quickActions.reduce(
                      (acc, action) => {
                        if (!acc[action.category]) {
                          acc[action.category] = [];
                        }
                        acc[action.category].push(action);
                        return acc;
                      },
                      {} as Record<string, QuickAction[]>,
                    ),
                  ).map(([category, actions]) => (
                    <div key={category} className="mb-4 last:mb-0">
                      {Object.keys(
                        quickActions.reduce(
                          (acc, action) => {
                            if (!acc[action.category]) {
                              acc[action.category] = [];
                            }
                            acc[action.category].push(action);
                            return acc;
                          },
                          {} as Record<string, QuickAction[]>,
                        ),
                      ).length > 1 && (
                        <h4 className="mb-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-500">
                          {category}
                        </h4>
                      )}
                      <div className="space-y-1">
                        {actions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.id}
                              onClick={() => {
                                action.action();
                                onClose();
                              }}
                              className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <Icon
                                className={`h-5 w-5 ${
                                  category === 'AI' ? 'text-purple-500' : 'text-gray-400'
                                }`}
                              />
                              <span className="flex-1 text-gray-900 dark:text-white">
                                {action.name}
                              </span>
                              {action.shortcut && (
                                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-400 dark:bg-gray-800">
                                  {action.shortcut}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-800">
                    <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('navigation:commandCenter.recentSearches.title')}
                    </h3>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 dark:border-gray-600 dark:bg-gray-700">
                  ↑↓
                </kbd>
                {t('navigation:commandCenter.shortcuts.navigate')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 dark:border-gray-600 dark:bg-gray-700">
                  ↵
                </kbd>
                {t('navigation:commandCenter.shortcuts.select')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 dark:border-gray-600 dark:bg-gray-700">
                  Esc
                </kbd>
                {t('navigation:commandCenter.shortcuts.close')}
              </span>
            </div>
            <div>{t('navigation:commandCenter.poweredBy')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
