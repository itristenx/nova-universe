/**
 * Enhanced Apple-style Knowledge Base Management
 * Professional knowledge management with Apple design and enterprise functionality
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  PlusIcon,
  FolderIcon,
  StarIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from '@components/common/GlassCard';
import { AppleButton } from '@components/common/AppleButton';
import { AppleInput } from '@components/common/AppleInput';
import { StatusBadge } from '@components/common/AppleBadges';
import { cn, cardHoverEffect, formatRelativeTime } from '@utils/apple-utils';
import { fadeInAnimation } from '@utils/apple-utils';

// Knowledge article interface
interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  subcategory?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  views: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  attachments?: {
    type: 'document' | 'video' | 'image' | 'link';
    name: string;
    url: string;
  }[];
  featured?: boolean;
  helpful: number;
  notHelpful: number;
}

// Category interface
interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  articleCount: number;
  subcategories?: { id: string; name: string; articleCount: number }[];
}

// Mock categories
const categories: Category[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Basic setup and onboarding guides',
    icon: <BookOpenIcon className="h-6 w-6" />,
    color: 'blue',
    articleCount: 23,
    subcategories: [
      { id: 'setup', name: 'Initial Setup', articleCount: 8 },
      { id: 'basics', name: 'Basics', articleCount: 15 }
    ]
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: <DocumentTextIcon className="h-6 w-6" />,
    color: 'orange',
    articleCount: 45,
    subcategories: [
      { id: 'hardware', name: 'Hardware Issues', articleCount: 18 },
      { id: 'software', name: 'Software Issues', articleCount: 27 }
    ]
  },
  {
    id: 'tutorials',
    name: 'Tutorials',
    description: 'Step-by-step guides and how-tos',
    icon: <VideoCameraIcon className="h-6 w-6" />,
    color: 'green',
    articleCount: 32,
    subcategories: [
      { id: 'video', name: 'Video Tutorials', articleCount: 12 },
      { id: 'written', name: 'Written Guides', articleCount: 20 }
    ]
  },
  {
    id: 'policies',
    name: 'Policies & Procedures',
    description: 'Company policies and standard procedures',
    icon: <FolderIcon className="h-6 w-6" />,
    color: 'purple',
    articleCount: 18
  },
  {
    id: 'faqs',
    name: 'FAQs',
    description: 'Frequently asked questions',
    icon: <StarIcon className="h-6 w-6" />,
    color: 'indigo',
    articleCount: 28
  }
];

// Mock articles
const mockArticles: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'How to Set Up Your New Laptop',
    summary: 'Complete guide for setting up your new company laptop with all necessary software and configurations.',
    content: '...',
    category: 'getting-started',
    subcategory: 'setup',
    status: 'published',
    author: { id: '1', name: 'John Smith' },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    views: 245,
    rating: 4.8,
    ratingCount: 32,
    tags: ['laptop', 'setup', 'onboarding'],
    featured: true,
    helpful: 28,
    notHelpful: 2,
    attachments: [
      { type: 'video', name: 'Setup Video Guide', url: '/videos/laptop-setup.mp4' },
      { type: 'document', name: 'Setup Checklist', url: '/docs/setup-checklist.pdf' }
    ]
  },
  {
    id: '2',
    title: 'Troubleshooting Wi-Fi Connection Issues',
    summary: 'Step-by-step guide to resolve common Wi-Fi connectivity problems.',
    content: '...',
    category: 'troubleshooting',
    subcategory: 'network',
    status: 'published',
    author: { id: '2', name: 'Sarah Johnson' },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    views: 189,
    rating: 4.5,
    ratingCount: 24,
    tags: ['wifi', 'network', 'connectivity'],
    helpful: 22,
    notHelpful: 3
  },
  {
    id: '3',
    title: 'Password Reset Guide',
    summary: 'How to reset your password and set up multi-factor authentication.',
    content: '...',
    category: 'faqs',
    status: 'published',
    author: { id: '3', name: 'Mike Wilson' },
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    views: 421,
    rating: 4.9,
    ratingCount: 67,
    tags: ['password', 'security', 'mfa'],
    featured: true,
    helpful: 63,
    notHelpful: 1
  }
];

export default function EnhancedKnowledgeBasePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('published');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = mockArticles.filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockArticles, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const featuredArticles = mockArticles.filter(article => article.featured);
  const totalViews = mockArticles.reduce((sum, article) => sum + article.views, 0);
  const avgRating = mockArticles.reduce((sum, article) => sum + article.rating, 0) / mockArticles.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-800 bg-green-100';
      case 'review': return 'text-orange-800 bg-orange-100';
      case 'draft': return 'text-gray-800 bg-gray-100';
      case 'archived': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    if (!cat) return 'bg-gray-100 text-gray-800';
    
    switch (cat.color) {
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'indigo': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoCameraIcon className="h-4 w-4" />;
      case 'image': return <PhotoIcon className="h-4 w-4" />;
      case 'link': return <LinkIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8" {...fadeInAnimation()}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Knowledge Base
              </h1>
              <p className="text-xl text-gray-600">
                Your central hub for documentation, guides, and institutional knowledge
              </p>
            </div>

            <div className="flex gap-3">
              <AppleButton
                variant="secondary"
                leftIcon={<StarIcon className="h-5 w-5" />}
              >
                Popular Articles
              </AppleButton>
              
              <AppleButton
                onClick={() => navigate('/knowledge/create')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create Article
              </AppleButton>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" {...fadeInAnimation(0.1)}>
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{mockArticles.length}</div>
              <div className="text-sm font-medium text-gray-600">Total Articles</div>
            </div>
          </GlassCard>
          
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{totalViews.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600">Total Views</div>
            </div>
          </GlassCard>
          
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{avgRating.toFixed(1)}</div>
              <div className="text-sm font-medium text-gray-600">Avg Rating</div>
            </div>
          </GlassCard>
          
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{categories.length}</div>
              <div className="text-sm font-medium text-gray-600">Categories</div>
            </div>
          </GlassCard>
        </div>

        {/* Categories */}
        <div className="mb-8" {...fadeInAnimation(0.2)}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'p-4 rounded-2xl border-2 text-center transition-all duration-200',
                'hover:scale-105 hover:shadow-lg',
                selectedCategory === 'all'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center text-white">
                <BookOpenIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-gray-900 block">All Categories</span>
              <span className="text-xs text-gray-500">{mockArticles.length} articles</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'p-4 rounded-2xl border-2 text-center transition-all duration-200',
                  'hover:scale-105 hover:shadow-lg',
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-white',
                  category.color === 'blue' && 'bg-gradient-to-r from-blue-500 to-blue-600',
                  category.color === 'orange' && 'bg-gradient-to-r from-orange-500 to-orange-600',
                  category.color === 'green' && 'bg-gradient-to-r from-green-500 to-green-600',
                  category.color === 'purple' && 'bg-gradient-to-r from-purple-500 to-purple-600',
                  category.color === 'indigo' && 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                )}>
                  {category.icon}
                </div>
                <span className="text-sm font-semibold text-gray-900 block">{category.name}</span>
                <span className="text-xs text-gray-500">{category.articleCount} articles</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-8" {...fadeInAnimation(0.3)}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <StarIcon className="h-6 w-6 text-yellow-500" />
              Featured Articles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <GlassCard
                  key={article.id}
                  intensity="medium"
                  hover="strong"
                  padding="lg"
                  className={cn(
                    cardHoverEffect('strong'),
                    'cursor-pointer relative'
                  )}
                  onClick={() => navigate(`/knowledge/${article.id}`)}
                >
                  {/* Featured Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Featured
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.summary}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{article.views}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span>{article.rating}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{article.author.name}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <GlassCard intensity="medium" hover={false} padding="md" className="mb-6" {...fadeInAnimation(0.4)}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <AppleInput
                placeholder="Search articles, guides, and documentation..."
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="glass"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={cn(
                  'px-4 py-3 bg-white/90 backdrop-blur-sm',
                  'border border-gray-200 rounded-xl',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200 ease-out'
                )}
              >
                <option value="published">Published</option>
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={cn(
                  'px-4 py-3 bg-white/90 backdrop-blur-sm',
                  'border border-gray-200 rounded-xl',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200 ease-out'
                )}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Recently Updated</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Articles List */}
        <div className="space-y-4" {...fadeInAnimation(0.5)}>
          {filteredArticles.map((article, index) => (
            <GlassCard
              key={article.id}
              intensity="medium"
              hover="medium"
              padding="lg"
              className={cn(
                cardHoverEffect('medium'),
                'cursor-pointer'
              )}
              onClick={() => navigate(`/knowledge/${article.id}`)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <StatusBadge status={article.status} size="sm" />
                    <span className={cn(
                      'px-2 py-1 rounded-lg text-xs font-medium',
                      getCategoryColor(article.category)
                    )}>
                      {categories.find(c => c.id === article.category)?.name || article.category}
                    </span>
                    {article.featured && (
                      <span className="text-yellow-500 text-sm">⭐ Featured</span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {article.summary}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{article.author.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Updated {formatRelativeTime(article.updatedAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>{article.views} views</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      <span>{article.rating} ({article.ratingCount})</span>
                    </div>
                  </div>

                  {/* Tags and Attachments */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {article.attachments && article.attachments.length > 0 && (
                      <div className="flex items-center gap-1">
                        {article.attachments.slice(0, 3).map((attachment, idx) => (
                          <div
                            key={idx}
                            className="p-1 bg-gray-100 rounded text-gray-600"
                            title={attachment.name}
                          >
                            {getAttachmentIcon(attachment.type)}
                          </div>
                        ))}
                        {article.attachments.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{article.attachments.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Stats */}
                <div className="flex flex-col items-end gap-2 text-center">
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{article.helpful}</span>
                  </div>
                  <div className="text-xs text-gray-500">helpful</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <GlassCard intensity="medium" hover={false} padding="xl" className="text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <BookOpenIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or create a new article.
              </p>
              <AppleButton
                onClick={() => navigate('/knowledge/create')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create New Article
              </AppleButton>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}