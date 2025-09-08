import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
  TicketIcon,
  UserIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface SearchResult {
  id: string;
  type: 'article' | 'ticket' | 'user' | 'workflow' | 'service';
  title: string;
  description: string;
  url: string;
  score: number;
  metadata: {
    category?: string;
    tags?: string[];
    lastUpdated?: string;
    author?: string;
    status?: string;
  };
  highlight?: {
    title?: boolean;
    description?: boolean;
    content?: string[];
  };
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'filter' | 'shortcut';
  category?: string;
  icon?: React.ReactNode;
  action?: () => void;
}

interface AIPoweredSearchProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string, filters?: any) => void;
  onResultSelect?: (result: SearchResult) => void;
  autoFocus?: boolean;
  enableVoiceSearch?: boolean;
  enableFilters?: boolean;
  maxResults?: number;
}

// Default suggestions (static UI hints)
const defaultSuggestions: SearchSuggestion[] = [
  {
    id: 'reset-password',
    text: 'How to reset my password',
    type: 'query',
    category: 'Popular',
    icon: <BoltIcon className="h-4 w-4" />,
  },
  {
    id: 'new-user-access',
    text: 'Set up new user access',
    type: 'query',
    category: 'Popular',
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    id: 'vpn-connection',
    text: 'VPN connection issues',
    type: 'query',
    category: 'Common Issues',
    icon: <BoltIcon className="h-4 w-4" />,
  },
  {
    id: 'software-request',
    text: 'Request new software',
    type: 'shortcut',
    category: 'Quick Actions',
    icon: <DocumentTextIcon className="h-4 w-4" />,
  },
  {
    id: 'my-tickets',
    text: 'My open tickets',
    type: 'shortcut',
    category: 'Quick Actions',
    icon: <TicketIcon className="h-4 w-4" />,
  },
];

// No local mock results; queries hit live API

export function AIPoweredSearch({
  className,
  placeholder = "Search anything... (e.g., 'reset password', 'new user setup')",
  onSearch,
  onResultSelect,
  autoFocus = false,
  enableVoiceSearch = true,
  enableFilters = true,
  maxResults = 10,
}: AIPoweredSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>(defaultSuggestions);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced filter management
  const handleFilterChange = useCallback((filterType: string, value: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle clicks outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams({ q: searchQuery, size: String(maxResults || 20) });
        const resp = await fetch(`/api/v1/search/tickets?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!resp.ok) throw new Error(`Search failed: ${resp.status}`);
        const data = await resp.json();
        const hits = Array.isArray(data.results) ? data.results : [];
        const mapped: SearchResult[] = hits.map((hit: any) => ({
          id: hit.id || hit._id || String(Math.random()),
          type: 'ticket',
          title: hit.title || hit.subject || 'Ticket',
          description: hit.description || hit.summary || '',
          url: hit.url || (hit.id ? `/tickets/${hit.id}` : '#'),
          score: hit._score || 0,
          metadata: hit.metadata || {},
          highlight: hit.highlight || undefined,
        }));
        setResults(mapped);
      } catch (e) {
        console.error('Search error', e);
        setResults([]);
      }
      setIsLoading(false);
      onSearch?.(searchQuery, filters);
    },
    [maxResults, filters, onSearch],
  );

  // Handle query change with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + suggestions.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            const suggestion = suggestions[selectedIndex];
            if (suggestion.type === 'shortcut' && suggestion.action) {
              suggestion.action();
            } else {
              setQuery(suggestion.text);
              performSearch(suggestion.text);
            }
          } else {
            const result = results[selectedIndex - suggestions.length];
            handleResultSelect(result);
          }
        } else if (query.trim()) {
          performSearch(query);
          setSearchHistory((prev) => [query, ...prev.filter((h) => h !== query)].slice(0, 10));
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);

    // Filter suggestions based on input
    const filteredSuggestions = defaultSuggestions.filter((suggestion) =>
      suggestion.text.toLowerCase().includes(value.toLowerCase()),
    );
    setSuggestions(filteredSuggestions);
  };

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'shortcut' && suggestion.action) {
      suggestion.action();
    } else {
      setQuery(suggestion.text);
      performSearch(suggestion.text);
      setSearchHistory((prev) =>
        [suggestion.text, ...prev.filter((h) => h !== suggestion.text)].slice(0, 10),
      );
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsVoiceActive(true);
      recognition.onend = () => setIsVoiceActive(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        performSearch(transcript);
        setIsOpen(true);
      };

      recognition.start();
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'ticket':
        return <TicketIcon className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'user':
        return <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'workflow':
        return <SparklesIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article':
        return 'Knowledge Base';
      case 'ticket':
        return 'Support Ticket';
      case 'user':
        return 'User Profile';
      case 'workflow':
        return 'Workflow';
      case 'service':
        return 'Service';
      default:
        return 'Content';
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-2xl', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="focus:ring-nova-500 focus:border-nova-500 w-full rounded-xl border border-gray-300 bg-white py-4 pr-20 pl-12 text-lg shadow-sm transition-colors focus:ring-2 dark:border-gray-600 dark:bg-gray-800"
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-4">
          {/* Voice Search */}
          {enableVoiceSearch && (
            <button
              onClick={startVoiceSearch}
              className={cn(
                'rounded-lg p-2 transition-colors',
                isVoiceActive
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300',
              )}
              title="Voice search"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {/* Filters */}
          {enableFilters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title="Search filters"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </button>
          )}

          {/* Clear */}
          {query && (
            <button
              onClick={clearSearch}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* AI Indicator */}
        <div className="absolute -top-2 -right-2">
          <div className="from-nova-500 flex items-center gap-1 rounded-full bg-gradient-to-r to-purple-600 px-2 py-1 text-xs font-medium text-white shadow-lg">
            <SparklesIcon className="h-3 w-3" />
            AI-Powered
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && enableFilters && (
        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Search Filters</h4>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                aria-label="Filter by content type"
              >
                <option value="">All Types</option>
                <option value="article">Knowledge Base</option>
                <option value="ticket">Support Ticket</option>
                <option value="user">User Profile</option>
                <option value="workflow">Workflow</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange || ''}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                aria-label="Filter by date range"
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                aria-label="Filter by priority level"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="max-h-96 overflow-y-auto">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="border-nova-600 h-5 w-5 animate-spin rounded-full border-b-2"></div>
                    <SparklesIcon className="text-nova-600 h-5 w-5" />
                    <span>AI is searching...</span>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {!query && suggestions.length > 0 && (
                <div className="p-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Suggestions
                  </h4>
                  <div className="space-y-1">
                    {suggestions.slice(0, 5).map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                          selectedIndex === index
                            ? 'bg-nova-50 dark:bg-nova-900/20 text-nova-700 dark:text-nova-300'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
                        )}
                      >
                        <div className="flex-shrink-0 text-gray-400">
                          {suggestion.icon || <MagnifyingGlassIcon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm">{suggestion.text}</span>
                          {suggestion.category && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              in {suggestion.category}
                            </span>
                          )}
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {query && !isLoading && results.length > 0 && (
                <div className="p-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Search Results ({results.length})
                  </h4>
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultSelect(result)}
                        className={cn(
                          'group w-full rounded-lg p-4 text-left transition-colors',
                          selectedIndex === suggestions.length + index
                            ? 'bg-nova-50 dark:bg-nova-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0">{getResultIcon(result.type)}</div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h5 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {result.highlight?.title ? (
                                  <span dangerouslySetInnerHTML={{ __html: result.title }} />
                                ) : (
                                  result.title
                                )}
                              </h5>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                {getTypeLabel(result.type)}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                              {result.highlight?.description ? (
                                <span dangerouslySetInnerHTML={{ __html: result.description }} />
                              ) : (
                                result.description
                              )}
                            </p>
                            {result.metadata.tags && (
                              <div className="mt-2 flex items-center gap-1">
                                {result.metadata.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>{Math.round(result.score * 100)}% match</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query && !isLoading && results.length === 0 && (
                <div className="p-8 text-center">
                  <div className="mb-2 text-gray-400">
                    <MagnifyingGlassIcon className="mx-auto h-12 w-12" />
                  </div>
                  <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    No results found
                  </h4>
                  <p className="mx-auto max-w-sm text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms or use different keywords. Our AI is constantly
                    learning to provide better results.
                  </p>
                </div>
              )}

              {/* Search History */}
              {!query && searchHistory.length > 0 && (
                <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <ClockIcon className="h-4 w-4" />
                    Recent Searches
                  </h4>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 3).map((historyItem, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(historyItem);
                          performSearch(historyItem);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        {historyItem}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
