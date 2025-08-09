'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  StarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeTime, cn } from '@/lib/utils'

interface KnowledgeArticle {
  id: string
  title: string
  content: string
  summary: string
  category: string
  tags: string[]
  author: string
  views: number
  rating: number
  helpful: number
  createdAt: Date
  updatedAt: Date
  featured: boolean
}

interface Category {
  id: string
  name: string
  description: string
  icon: any
  color: string
  articleCount: number
}

const mockCategories: Category[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Basic guides and tutorials for new users',
    icon: BookOpenIcon,
    color: 'bg-blue-100 text-blue-800',
    articleCount: 12
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: WrenchScrewdriverIcon,
    color: 'bg-red-100 text-red-800',
    articleCount: 24
  },
  {
    id: 'how-to',
    name: 'How-to Guides',
    description: 'Step-by-step instructions',
    icon: LightBulbIcon,
    color: 'bg-yellow-100 text-yellow-800',
    articleCount: 18
  },
  {
    id: 'faq',
    name: 'FAQ',
    description: 'Frequently asked questions',
    icon: QuestionMarkCircleIcon,
    color: 'bg-green-100 text-green-800',
    articleCount: 32
  },
  {
    id: 'policies',
    name: 'Policies',
    description: 'Company policies and procedures',
    icon: ExclamationTriangleIcon,
    color: 'bg-purple-100 text-purple-800',
    articleCount: 8
  }
]

const mockArticles: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'How to Reset Your Password',
    content: 'Follow these steps to reset your password...',
    summary: 'Quick guide to resetting your account password in Nova Universe',
    category: 'getting-started',
    tags: ['password', 'security', 'account'],
    author: 'IT Support Team',
    views: 1247,
    rating: 4.8,
    helpful: 92,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    featured: true
  },
  {
    id: '2',
    title: 'VPN Connection Issues',
    content: 'Troubleshooting common VPN connectivity problems...',
    summary: 'Resolve VPN connection issues and improve remote access stability',
    category: 'troubleshooting',
    tags: ['vpn', 'connectivity', 'remote-work'],
    author: 'Network Team',
    views: 856,
    rating: 4.6,
    helpful: 78,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    featured: true
  },
  {
    id: '3',
    title: 'Setting Up Email on Mobile Devices',
    content: 'Configure your work email on iOS and Android devices...',
    summary: 'Step-by-step guide for setting up corporate email on mobile devices',
    category: 'how-to',
    tags: ['email', 'mobile', 'setup'],
    author: 'Mobile Support',
    views: 623,
    rating: 4.9,
    helpful: 89,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    featured: false
  },
  {
    id: '4',
    title: 'What is Two-Factor Authentication?',
    content: 'Understanding and setting up 2FA for enhanced security...',
    summary: 'Learn about two-factor authentication and how to enable it',
    category: 'faq',
    tags: ['security', 'authentication', '2fa'],
    author: 'Security Team',
    views: 445,
    rating: 4.7,
    helpful: 71,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    featured: false
  },
  {
    id: '5',
    title: 'Remote Work Security Policy',
    content: 'Guidelines and requirements for secure remote work...',
    summary: 'Security best practices and requirements for remote employees',
    category: 'policies',
    tags: ['policy', 'security', 'remote-work'],
    author: 'HR Department',
    views: 338,
    rating: 4.5,
    helpful: 62,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    featured: false
  }
]

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'relevance' | 'views' | 'rating' | 'recent'>('relevance')

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.views - a.views
      case 'rating':
        return b.rating - a.rating
      case 'recent':
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      default:
        return 0
    }
  })

  const featuredArticles = mockArticles.filter(article => article.featured)
  const totalViews = mockArticles.reduce((sum, article) => sum + article.views, 0)
  const avgRating = mockArticles.reduce((sum, article) => sum + article.rating, 0) / mockArticles.length

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock search logic
    console.log('Searching for:', searchTerm)
  }

  const handleArticleClick = (articleId: string) => {
    // Mock article view logic
    console.log('Opening article:', articleId)
  }

  const handleHelpful = (articleId: string) => {
    // Mock helpful vote logic
    console.log('Marking as helpful:', articleId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Find answers, guides, and helpful resources
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">{mockArticles.length}</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <EyeIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
              </div>
              <StarIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{mockCategories.length}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span>Featured Articles</span>
            </CardTitle>
            <CardDescription>Most helpful and popular articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 line-clamp-1">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-3 h-3" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3" />
                          <span>{article.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HeartIcon className="w-3 h-3" />
                          <span>{article.helpful}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 max-w-2xl">
            <TabsTrigger value="all">All</TabsTrigger>
            {mockCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="truncate">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-border rounded px-2 py-1"
            >
              <option value="relevance">Relevance</option>
              <option value="views">Most Viewed</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {/* Categories Overview */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={cn("p-3 rounded-lg", category.color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {category.articleCount} articles
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Category Articles */}
        {mockCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <category.icon className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredArticles
                    .filter(article => article.category === category.id)
                    .map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article.id)}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{article.title}</h3>
                            {article.featured && (
                              <StarIcon className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {article.summary}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                            <span>By {article.author}</span>
                            <div className="flex items-center space-x-1">
                              <EyeIcon className="w-3 h-3" />
                              <span>{article.views} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <StarIcon className="w-3 h-3" />
                              <span>{article.rating} rating</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>Updated {formatRelativeTime(article.updatedAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {article.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleHelpful(article.id)
                            }}
                          >
                            <HeartIcon className="w-3 h-3 mr-1" />
                            Helpful
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <MagnifyingGlassIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No articles found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse by category
                </p>
              </div>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}