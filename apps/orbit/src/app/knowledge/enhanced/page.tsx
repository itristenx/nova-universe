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
  ArrowRight,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export default function EnhancedKnowledgeBase() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    difficulty: '',
    type: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
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
    },
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
        relevanceScore: 0.95,
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
        relevanceScore: 0.87,
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
        relevanceScore: 0.78,
      },
      {
        id: '4',
        title: 'Advanced Excel Functions',
        summary: 'Master complex Excel formulas and functions for data analysis',
        content: 'Advanced Excel tutorial...',
        category: 'Productivity',
        tags: ['excel', 'formulas', 'data analysis'],
        author: { name: 'Training Team' },
        createdAt: '2024-01-05',
        updatedAt: '2024-01-22',
        views: 1156,
        likes: 134,
        rating: 4.8,
        difficulty: 'advanced',
        estimatedReadTime: 25,
        type: 'tutorial',
        isBookmarked: true,
        relevanceScore: 0.72,
      },
    ];

    setArticles(mockArticles);
    setFilteredArticles(mockArticles);

    // Mock personalized sections
    setPersonalizedSections([
      {
        id: 'bookmarks',
        title: 'Your Bookmarks',
        articles: mockArticles.filter((a) => a.isBookmarked),
        icon: <Bookmark className="h-4 w-4" />,
      },
      {
        id: 'recent',
        title: 'Recently Viewed',
        articles: mockArticles.slice(0, 3),
        icon: <History className="h-4 w-4" />,
      },
      {
        id: 'trending',
        title: 'Trending This Week',
        articles: mockArticles.sort((a, b) => b.views - a.views).slice(0, 3),
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        id: 'recommended',
        title: 'Recommended for You',
        articles: mockArticles.slice(1, 4),
        icon: <Sparkles className="h-4 w-4" />,
      },
    ]);

    // Mock search suggestions
    setSearchSuggestions([
      'password reset',
      'vpn connection',
      'email setup',
      'printer troubleshooting',
      'software installation',
    ]);
  }, []);

  // Search functionality with AI-powered suggestions
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
      result = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
          article.summary.toLowerCase().includes(activeSearch.toLowerCase()) ||
          article.tags.some((tag) => tag.toLowerCase().includes(activeSearch.toLowerCase())),
      );
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter((a) => a.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      result = result.filter((a) => a.difficulty === filters.difficulty);
    }

    // Apply type filter
    if (filters.type) {
      result = result.filter((a) => a.type === filters.type);
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
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? { ...article, isBookmarked: !article.isBookmarked } : article,
      ),
    );
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
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'tutorial':
        return <BookOpen className="h-4 w-4" />;
      case 'faq':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 flex items-center justify-center gap-2 text-3xl font-bold">
          <Brain className="h-8 w-8 text-blue-600" />
          Intelligent Knowledge Base
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Find answers quickly with our AI-powered search and personalized recommendations
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleSearch)} className="space-y-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                {...register('query')}
                placeholder="Search articles, guides, tutorials..."
                className="py-3 pr-4 pl-10 text-lg"
              />
              {watchedQuery.length > 0 && searchSuggestions.length > 0 && (
                <div className="absolute top-full right-0 left-0 z-10 mt-1 rounded-md border bg-white shadow-lg">
                  {searchSuggestions
                    .filter((s) => s.toLowerCase().includes(watchedQuery.toLowerCase()))
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => setValue('query', suggestion)}
                      >
                        <Search className="text-muted-foreground h-3 w-3" />
                        {suggestion}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>

              <div className="ml-auto flex items-center gap-2">
                <Label htmlFor="view-mode" className="text-sm">
                  View:
                </Label>
                <Button
                  type="button"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? (
                    <Grid className="h-4 w-4" />
                  ) : (
                    <List className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters((f) => ({ ...f, category: value }))}
                  >
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
                  <Select
                    value={filters.difficulty}
                    onValueChange={(value) => setFilters((f) => ({ ...f, difficulty: value }))}
                  >
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
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters((f) => ({ ...f, type: value }))}
                  >
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
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: 'relevance' | 'recent' | 'popular' | 'rating') =>
                      setFilters((f) => ({ ...f, sortBy: value }))
                    }
                  >
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {section.articles.map((article) => (
                    <Card key={article.id} className="transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
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
                            <Bookmark
                              className={`h-4 w-4 ${article.isBookmarked ? 'fill-current' : ''}`}
                            />
                          </Button>
                        </div>

                        <h3 className="mb-2 line-clamp-2 font-semibold">{article.title}</h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                          {article.summary}
                        </p>

                        <div className="text-muted-foreground mb-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            {renderStars(article.rating)}
                            <span className="ml-1">{article.rating}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            <span>{article.views}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{article.estimatedReadTime} min read</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Read <ArrowRight className="ml-1 h-3 w-3" />
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
              <div className="py-8 text-center">
                <div className="text-muted-foreground mb-4">
                  <Search className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  No articles found matching your search.
                </div>
                <p className="text-muted-foreground text-sm">
                  Try different keywords or browse our categories below.
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className={`transition-shadow hover:shadow-md ${viewMode === 'list' ? 'flex' : ''}`}
                  >
                    <CardContent
                      className={
                        viewMode === 'list' ? 'flex flex-1 items-center space-x-4 p-4' : 'p-4'
                      }
                    >
                      {viewMode === 'list' && (
                        <div className="text-muted-foreground flex items-center gap-2">
                          {getTypeIcon(article.type)}
                        </div>
                      )}

                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {viewMode === 'grid' && getTypeIcon(article.type)}
                            <Badge className={getDifficultyColor(article.difficulty)}>
                              {article.difficulty}
                            </Badge>
                            <Badge variant="outline">{article.category}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(article.id)}
                            className="h-8 w-8 shrink-0 p-0"
                          >
                            <Bookmark
                              className={`h-4 w-4 ${article.isBookmarked ? 'fill-current' : ''}`}
                            />
                          </Button>
                        </div>

                        <h3 className="mb-2 font-semibold">{article.title}</h3>
                        <p className="text-muted-foreground mb-3 text-sm">{article.summary}</p>

                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-muted-foreground mb-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              {renderStars(article.rating)}
                              <span className="ml-1">{article.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{article.likes}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.estimatedReadTime} min read</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-muted-foreground text-xs">
                            By {article.author.name} • Updated{' '}
                            {new Date(article.updatedAt).toLocaleDateString()}
                          </div>
                          <Button size="sm" variant="outline">
                            Read <ArrowRight className="ml-1 h-3 w-3" />
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
