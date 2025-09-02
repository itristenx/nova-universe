/**
 * AI-Enhanced Search Component
 * Smart search with Cosmo AI assistance
 */
import React, { useState, useCallback, useEffect } from 'react';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { AIIndicator, CosmoAvatar } from './index';

interface AISearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showCosmo?: boolean;
  className?: string;
}

export function AISearch({ 
  placeholder = "Ask Cosmo anything or search...", 
  onSearch,
  showCosmo = true,
  className = ""
}: AISearchProps) {
  const [query, setQuery] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearch = useCallback((searchQuery: string) => {
    if (onSearch) {
      onSearch(searchQuery);
    }
    
    // Simulate AI suggestions
    if (searchQuery.length > 2) {
      setSuggestions([
        `AI-suggested: ${searchQuery} documentation`,
        `Smart filter: Recent ${searchQuery} issues`,
        `Cosmo recommends: ${searchQuery} best practices`
      ]);
    } else {
      setSuggestions([]);
    }
  }, [onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Trigger AI mode for natural language queries
    setIsAIMode(value.includes('?') || value.includes('how') || value.includes('what') || value.includes('why'));
  };

  // Debounced search with proper cleanup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Search Icon */}
          <div className="absolute left-3 flex items-center">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            {isAIMode && (
              <AIIndicator type="cosmo" size="xs" className="ml-1" />
            )}
          </div>
          
          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full pl-12 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
              ${isAIMode ? 'bg-blue-50 border-blue-300' : 'bg-white'}
            `}
          />
          
          {/* Cosmo Avatar */}
          {showCosmo && (
            <div className="absolute right-3">
              <CosmoAvatar size="sm" thinking={query.length > 0 && isAIMode} />
            </div>
          )}
        </div>
        
        {/* AI Mode Indicator */}
        {isAIMode && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-blue-100 border border-blue-200 rounded-lg p-2">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <SparklesIcon className="w-4 h-4" />
              <span>AI-powered search mode activated</span>
            </div>
          </div>
        )}
      </form>
      
      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="flex items-center space-x-2 px-2 py-1 text-xs text-gray-500 border-b border-gray-100">
              <AIIndicator type="ai" size="xs" />
              <span>AI Suggestions</span>
            </div>
            <div className="mt-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion.replace(/^[^:]+:\s*/, ''));
                    handleSearch(suggestion);
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded text-sm transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-3 h-3 text-purple-500 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AISearch;