'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Search, 
  Star,
  MessageCircle,
  ThumbsUp,
  Clock,
  BookOpen,
  TrendingUp,
  Eye,
  History,
  FileText,
  Video,
  Brain,
  Sparkles,
  Filter,
  Grid,
  List,
  Bookmark,
  ArrowRight
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  type: 'article' | 'video' | 'tutorial' | 'faq';
  isBookmarked: boolean;
  relevanceScore?: number;
}

interface SearchFilters {
  category: string;
  difficulty: string;
  type: string;
  sortBy: 'relevance' | 'recent' | 'popular' | 'rating';
  sortOrder: 'asc' | 'desc';
}

interface PersonalizedSection {
  id: string;
  title: string;
  articles: KnowledgeArticle[];
  icon: React.ReactNode;
}

// Search schema
const searchSchema = z.object({
  query: z.string().min(1, 'Please enter a search term'),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function _EnhancedKnowledgeBase() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    difficulty: '',
    type: '',
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [personalizedSections, setPersonalizedSections] = useState<PersonalizedSection[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [activeSearch, setActiveSearch] = useState<string>('');

  // Form management
  const { register, handleSubmit, watch, setValue } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    }
  });

  const watchedQuery = watch('query');

  // Mock data
  useEffect(() => {
    const mockArticles: KnowledgeArticle[] = [
      {
        id: '1',
        title: 'Password Reset Guide',
        summary: 'Step-by-step instructions for resetting your password across all company systems',
        content: 'Detailed password reset instructions...',
        category: 'Security',
        tags: ['password', 'security', 'authentication'],
        author: { name: 'IT Security Team' },
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        views: 1250,
        likes: 89,
        rating: 4.7,
        difficulty: 'beginner',
        estimatedReadTime: 3,
        type: 'article',
        isBookmarked: false,
        relevanceScore: 0.95
      },
      {
        id: '2',
        title: 'VPN Setup and Troubleshooting',
        summary: 'Complete guide to setting up and troubleshooting VPN connections',
        content: 'VPN setup instructions...',
        category: 'Network',
        tags: ['vpn', 'network', 'remote work'],
        author: { name: 'Network Admin' },
        createdAt: '2024-01-10',
        updatedAt: '2024-01-25',
        views: 892,
        likes: 67,
        rating: 4.5,
        difficulty: 'intermediate',
        estimatedReadTime: 8,
        type: 'tutorial',
        isBookmarked: true,
        relevanceScore: 0.87
      },
      {
        id: '3',
        title: 'Email Configuration Tutorial',
        summary: 'Video tutorial on configuring email clients for optimal performance',
        content: 'Email configuration video...',
        category: 'Email',
        tags: ['email', 'outlook', 'configuration'],
        author: { name: 'Support Team' },
        createdAt: '2024-01-08',
        updatedAt: '2024-01-18',
        views: 634,
        likes: 45,
        rating: 4.3,
        difficulty: 'beginner',
        estimatedReadTime: 12,
        type: 'video',
        isBookmarked: false,
        relevanceScore: 0.78
      },
      {
        id: '4',
        title: 'Advanced Excel Functions',
        summary: 'Master complex Excel formulas and _functions for data analysis',
        content: 'Advanced Excel tutorial...',
        category: 'Productivity',
        tags: ['_excel', 'formulas', 'data analysis'],
        author: { name: '_Training Team' },
        createdAt: '2024-01-05',
        updatedAt: '2024-01-22',
        views: 1156,
        likes: 134,
        rating: 4.8,
        difficulty: 'advanced',
        estimatedReadTime: 25,
        type: 'tutorial',
        isBookmarked: true,
        relevanceScore: 0.72
      }
    ];

    setArticles(mockArticles);
    setFilteredArticles(mockArticles);

    // Mock personalized sections
    setPersonalizedSections([
      {
        id: 'bookmarks',
        title: 'Your Bookmarks',
        articles: mockArticles.filter(a => a.isBookmarked),
        icon: <Bookmark className="w-4 h-4" />
      },
      {
        id: 'recent',
        title: 'Recently Viewed',
        articles: mockArticles.slice(0, 3),
        icon: <History className="w-4 h-4" />
      },
      {
        id: 'trending',
        title: 'Trending This Week',
        articles: mockArticles.sort((a, b) => b.views - a.views).slice(0, 3),
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        id: 'recommended',
        title: 'Recommended for You',
        articles: mockArticles.slice(1, 4),
        icon: <Sparkles className="w-4 h-4" />
      }
    ]);

    // Mock search suggestions
    setSearchSuggestions([
      'password reset',
      'vpn connection',
      'email setup',
      'printer troubleshooting',
      'software installation'
    ]);
  }, []);

  // Search _functionality with AI-powered suggestions
  useEffect(() => {
    if (watchedQuery.length > 2) {
      setActiveSearch(watchedQuery);
    } else if (watchedQuery.length === 0) {
      setActiveSearch('');
    }
  }, [watchedQuery]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...articles];

    // If there's an active search, start with search results
    if (activeSearch) {
      result = articles.filter(article =>
        article.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
        article.summary.toLowerCase().includes(activeSearch.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(activeSearch.toLowerCase()))
      );
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(a => a.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      result = result.filter(a => a.difficulty === filters.difficulty);
    }

    // Apply type filter
    if (filters.type) {
      result = result.filter(a => a.type === filters.type);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'relevance':
          comparison = (b.relevanceScore || 0) - (a.relevanceScore || 0);
          break;
        case 'recent':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case 'popular':
          comparison = b.views - a.views;
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
      }
      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    setFilteredArticles(result);
  }, [filters, articles, activeSearch]);

  const handleSearch = (data: SearchFormData) => {
    setActiveSearch(data.query);
  };

  const toggleBookmark = (articleId: string) => {
    setArticles(prev => prev.map(article =>
      article.id === articleId
        ? { ...article, isBookmarked: !article.isBookmarked }
        : article
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'tutorial':
        return <BookOpen className="w-4 h-4" />;
      case 'faq':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          Intelligent Knowledge Base
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers quickly with our AI-powered search and personalized recommendations
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleSearch)} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                {...register('query')}
                placeholder="Search articles, guides, tutorials..."
                className="pl-10 pr-4 py-3 text-lg"
              />
              {watchedQuery.length > 0 && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 mt-1">
                  {searchSuggestions
                    .filter(s => s.toLowerCase().includes(watchedQuery.toLowerCase()))
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => setValue('query', suggestion)}
                      >
                        <Search className="w-3 h-3 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex items-center gap-2 ml-auto">
                <Label htmlFor="view-mode" className="text-sm">View:</Label>
                <Button
                  type="button"
                  variant={viewMode === 'grid' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(f => ({ ...f, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Network">Network</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Difficulty</Label>
                  <Select value={filters.difficulty} onValueChange={(value) => setFilters(f => ({ ...f, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Content Type</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters(f => ({ ...f, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="article">Articles</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="tutorial">Tutorials</SelectItem>
                      <SelectItem value="faq">FAQs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={filters.sortBy} onValueChange={(value: 'relevance' | 'recent' | 'popular' | 'rating') => setFilters(f => ({ ...f, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Personalized Sections (shown when no active search) */}
      {!activeSearch && (
        <div className="space-y-6">
          {personalizedSections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.articles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(article.type)}
                            <Badge className={getDifficultyColor(article.difficulty)}>
                              {article.difficulty}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(article.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Bookmark className={`w-4 h-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        
                        <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.summary}</p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            {renderStars(article.rating)}
                            <span className="ml-1">{article.rating}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            <span>{article.views}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{article.estimatedReadTime} min read</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Read <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search Results */}
      {activeSearch && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results for &quot;{activeSearch}&quot;
              <Badge variant="secondary" className="ml-2">
                {filteredArticles.length} results
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No articles found matching your search.
                </div>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or browse our categories below.
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredArticles.map((article) => (
                  <Card key={article.id} className={`hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
                    <CardContent className={viewMode === 'list' ? "flex items-center p-4 space-x-4 flex-1" : "p-4"}>
                      {viewMode === 'list' && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {getTypeIcon(article.type)}
                        </div>
                      )}
                      
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {viewMode === 'grid' && getTypeIcon(article.type)}
                            <Badge className={getDifficultyColor(article.difficulty)}>
                              {article.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {article.category}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(article.id)}
                            className="h-8 w-8 p-0 shrink-0"
                          >
                            <Bookmark className={`w-4 h-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        
                        <h3 className="font-semibold mb-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              {renderStars(article.rating)}
                              <span className="ml-1">{article.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{article.likes}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.estimatedReadTime} min read</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            By {article.author.name} • Updated {new Date(article.updatedAt).toLocaleDateString()}
                          </div>
                          <Button size="sm" variant="outline">
                            Read <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
