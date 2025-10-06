import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Command } from 'lucide-react';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  category?: string;
  url?: string;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  results?: SearchResult[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  loading?: boolean;
  showShortcut?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * SearchBar - Unified search component with autocomplete and recent searches
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search anything...',
  onSearch,
  onResultClick,
  results = [],
  recentSearches = [],
  onClearRecent,
  loading = false,
  showShortcut = true,
  autoFocus = false,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = isFocused && (query.length > 0 || recentSearches.length > 0);
  const displayResults = query.length > 0 ? results : [];
  const displayRecent = query.length === 0 ? recentSearches : [];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemCount = displayResults.length || displayRecent.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (displayResults[selectedIndex]) {
          handleResultClick(displayResults[selectedIndex]);
        } else if (displayRecent[selectedIndex]) {
          handleRecentClick(displayRecent[selectedIndex]);
        }
      } else if (query) {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.title);
    setIsFocused(false);
    onResultClick?.(result);
  };

  const handleRecentClick = (recent: string) => {
    setQuery(recent);
    onSearch(recent);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) {
              onSearch(e.target.value);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="
            w-full
            pl-12 pr-20
            py-3
            glass
            rounded-apple-md
            font-sf-text text-sm
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-apple-blue dark:focus:ring-apple-blue-dark
            focus:shadow-glass-md
            transition-all duration-400 ease-apple
          "
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              type="button"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {showShortcut && !isFocused && (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-sf-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <Command className="w-3 h-3" />K
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
            className="
              absolute top-full left-0 right-0 mt-2
              glass-heavy
              rounded-apple-md
              border border-gray-200/10 dark:border-gray-700/10
              shadow-glass-lg
              max-h-96 overflow-y-auto
              z-50
            "
          >
            {/* Loading */}
            {loading && (
              <div className="p-4 text-center">
                <div className="inline-block w-5 h-5 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Results */}
            {!loading && displayResults.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-2 text-xs font-sf-text font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Results
                </div>
                {displayResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`
                      w-full px-3 py-2.5
                      flex items-center gap-3
                      text-left
                      font-sf-text
                      transition-colors duration-200
                      ${
                        selectedIndex === index
                          ? 'bg-apple-blue/10 dark:bg-apple-blue/20'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                      }
                    `}
                    type="button"
                  >
                    {result.icon && (
                      <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                        {result.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    {result.category && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {result.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!loading && displayRecent.length > 0 && (
              <div className="py-2 border-t border-gray-200/20 dark:border-gray-700/20">
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="text-xs font-sf-text font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Recent
                  </div>
                  {onClearRecent && (
                    <button
                      onClick={onClearRecent}
                      className="text-xs font-sf-text text-apple-blue dark:text-apple-blue-dark hover:underline"
                      type="button"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {displayRecent.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentClick(recent)}
                    className={`
                      w-full px-3 py-2.5
                      flex items-center gap-3
                      text-left
                      font-sf-text text-sm
                      transition-colors duration-200
                      ${
                        selectedIndex === index
                          ? 'bg-apple-blue/10 dark:bg-apple-blue/20'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                      }
                    `}
                    type="button"
                  >
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white truncate">{recent}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && query.length > 0 && displayResults.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-sf-text text-gray-500 dark:text-gray-400">
                  No results found for "{query}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
