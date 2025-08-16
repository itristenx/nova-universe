'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Star,
  Heart,
  MessageSquare,
  Users,
  Award,
  BookOpen,
  Plus,
  Filter,
  Eye,
  ThumbsUp,
  Share2,
  Bookmark,
  Crown,
  Shield,
  Target,
  CheckCircle,
  Clock,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// Types
interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: Expert;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  helpful: number;
  notHelpful: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  lastUpdated: Date;
  verified: boolean;
  featured: boolean;
  communityScore: number;
}

interface ExpertBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Expert {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar?: string;
  expertise: string[];
  reputation: number;
  badges: ExpertBadge[];
  articlesWritten: number;
  helpfulVotes: number;
  verified: boolean;
}

interface Activity {
  id: string;
  type: 'article_published' | 'question_answered' | 'solution_verified' | 'expert_recognized';
  user: Expert;
  timestamp: Date;
  description: string;
  points: number;
}

interface Community {
  totalMembers: number;
  totalArticles: number;
  totalQuestions: number;
  topContributors: Expert[];
  recentActivity: Activity[];
}

export default function KnowledgeSharingPlatform() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedTab, setSelectedTab] = useState('articles');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize mock data
  useEffect(() => {
    const mockExperts: Expert[] = [
      {
        id: '1',
        name: 'Dr. Sarah Chen',
        title: 'Senior Network Engineer',
        department: 'Infrastructure',
        expertise: ['Network Security', 'VPN', 'Firewall Configuration'],
        reputation: 2840,
        badges: [
          {
            id: 'network-guru',
            name: 'Network Guru',
            description: 'Expert in network troubleshooting',
            icon: '🌐',
            rarity: 'epic',
          },
          {
            id: 'helpful-hero',
            name: 'Helpful Hero',
            description: '100+ helpful answers',
            icon: '🏆',
            rarity: 'rare',
          },
        ],
        articlesWritten: 23,
        helpfulVotes: 156,
        verified: true,
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        title: 'Cloud Solutions Architect',
        department: 'DevOps',
        expertise: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        reputation: 1920,
        badges: [
          {
            id: 'cloud-master',
            name: 'Cloud Master',
            description: 'Cloud infrastructure expert',
            icon: '☁️',
            rarity: 'epic',
          },
          {
            id: 'verified-expert',
            name: 'Verified Expert',
            description: 'Company verified expertise',
            icon: '✅',
            rarity: 'legendary',
          },
        ],
        articlesWritten: 18,
        helpfulVotes: 134,
        verified: true,
      },
      {
        id: '3',
        name: 'Emma Thompson',
        title: 'Security Analyst',
        department: 'Cybersecurity',
        expertise: ['Incident Response', 'Malware Analysis', 'SIEM'],
        reputation: 1560,
        badges: [
          {
            id: 'security-shield',
            name: 'Security Shield',
            description: 'Cybersecurity specialist',
            icon: '🛡️',
            rarity: 'rare',
          },
        ],
        articlesWritten: 15,
        helpfulVotes: 98,
        verified: true,
      },
    ];

    const mockArticles: KnowledgeArticle[] = [
      {
        id: '1',
        title: 'Complete Guide to VPN Troubleshooting',
        content: 'Comprehensive guide covering common VPN issues and their solutions...',
        summary:
          'Step-by-step troubleshooting guide for VPN connectivity issues, covering client setup, server configuration, and common error resolution.',
        author: mockExperts[0],
        category: 'Network',
        tags: ['VPN', 'Network', 'Troubleshooting', 'Security'],
        views: 1247,
        likes: 89,
        comments: 23,
        helpful: 156,
        notHelpful: 12,
        difficulty: 'intermediate',
        estimatedReadTime: 8,
        lastUpdated: new Date('2024-01-10'),
        verified: true,
        featured: true,
        communityScore: 4.8,
      },
      {
        id: '2',
        title: 'Docker Container Best Practices for Production',
        content: 'Essential practices for running Docker containers in production environments...',
        summary:
          'Learn the essential best practices for deploying and managing Docker containers in production, including security, monitoring, and optimization.',
        author: mockExperts[1],
        category: 'DevOps',
        tags: ['Docker', 'DevOps', 'Production', 'Best Practices'],
        views: 892,
        likes: 67,
        comments: 18,
        helpful: 89,
        notHelpful: 3,
        difficulty: 'advanced',
        estimatedReadTime: 12,
        lastUpdated: new Date('2024-01-08'),
        verified: true,
        featured: false,
        communityScore: 4.6,
      },
      {
        id: '3',
        title: 'Incident Response Playbook: Malware Detection',
        content: 'Detailed playbook for responding to malware incidents...',
        summary:
          'Comprehensive incident response procedures for malware detection, containment, and remediation with step-by-step workflows.',
        author: mockExperts[2],
        category: 'Security',
        tags: ['Security', 'Incident Response', 'Malware', 'Playbook'],
        views: 634,
        likes: 45,
        comments: 12,
        helpful: 67,
        notHelpful: 5,
        difficulty: 'intermediate',
        estimatedReadTime: 15,
        lastUpdated: new Date('2024-01-05'),
        verified: true,
        featured: false,
        communityScore: 4.4,
      },
    ];

    const mockCommunity: Community = {
      totalMembers: 1247,
      totalArticles: 89,
      totalQuestions: 234,
      topContributors: mockExperts,
      recentActivity: [
        {
          id: '1',
          type: 'article_published',
          user: mockExperts[0],
          timestamp: new Date(Date.now() - 300000),
          description: 'Published "VPN Troubleshooting Guide"',
          points: 50,
        },
        {
          id: '2',
          type: 'solution_verified',
          user: mockExperts[1],
          timestamp: new Date(Date.now() - 600000),
          description: 'Solution verified for Docker deployment issue',
          points: 25,
        },
      ],
    };

    setExperts(mockExperts);
    setArticles(mockArticles);
    setCommunity(mockCommunity);
  }, []);

  // Filter and sort articles
  const filteredArticles = articles
    .filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        case 'popular':
          return b.views - a.views;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return b.communityScore - a.communityScore;
      }
    });

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 p-2 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Knowledge Sharing Platform
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-100 to-pink-100"
                  >
                    Community Powered
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Expert knowledge base with community features, peer recognition, and collaborative
                  problem solving
                </p>
              </div>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Share Knowledge
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Community Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Community Members</p>
                <p className="text-2xl font-bold">{community?.totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Knowledge Articles</p>
                <p className="text-2xl font-bold">{community?.totalArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Questions Answered</p>
                <p className="text-2xl font-bold">{community?.totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Verified Experts</p>
                <p className="text-2xl font-bold">{experts.filter((e) => e.verified).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Knowledge Base</TabsTrigger>
          <TabsTrigger value="experts">Expert Network</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="recognition">Recognition</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Search articles, topics, or solutions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="helpful">Most Helpful</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className={article.featured ? 'border-yellow-200 bg-yellow-50' : ''}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{article.title}</h3>
                        {article.featured && (
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="mr-1 h-3 w-3" />
                            Featured
                          </Badge>
                        )}
                        {article.verified && (
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        <Badge className={getDifficultyColor(article.difficulty)}>
                          {article.difficulty}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground mb-3 text-sm">{article.summary}</p>

                      <div className="text-muted-foreground mb-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.views.toLocaleString()} views
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {article.helpful} helpful
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {article.comments} comments
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {article.estimatedReadTime} min read
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                            <span className="text-xs font-medium">
                              {article.author.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{article.author.name}</p>
                            <p className="text-muted-foreground text-xs">{article.author.title}</p>
                          </div>
                          {article.author.verified && <Shield className="h-4 w-4 text-blue-600" />}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {article.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                            <span className="text-sm font-medium">{article.communityScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button size="sm">Read Article</Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Expert Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {experts.map((expert) => (
                  <Card key={expert.id} className="relative">
                    <CardContent className="p-4">
                      {expert.verified && (
                        <div className="absolute top-2 right-2">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                      )}

                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                          <span className="text-sm font-medium">
                            {expert.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{expert.name}</h4>
                          <p className="text-muted-foreground text-sm">{expert.title}</p>
                          <p className="text-muted-foreground text-xs">{expert.department}</p>
                        </div>
                      </div>

                      <div className="mb-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Reputation</span>
                          <span className="font-medium">{expert.reputation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Articles</span>
                          <span className="font-medium">{expert.articlesWritten}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Helpful Votes</span>
                          <span className="font-medium">{expert.helpfulVotes}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-muted-foreground text-xs font-medium">EXPERTISE</p>
                        <div className="flex flex-wrap gap-1">
                          {expert.expertise.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <p className="text-muted-foreground text-xs font-medium">BADGES</p>
                        <div className="flex gap-1">
                          {expert.badges.slice(0, 2).map((badge) => (
                            <div
                              key={badge.id}
                              className={`rounded px-2 py-1 text-xs font-medium ${getBadgeColor(badge.rarity)}`}
                              title={badge.description}
                            >
                              {badge.icon} {badge.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Community Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {community?.recentActivity.map((activity: Activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-xs font-medium">
                          {activity.user.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-muted-foreground text-xs">
                          by {activity.user.name} • {activity.points} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {community?.topContributors.map((contributor: Expert, index: number) => (
                    <div key={contributor.id} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center">
                        {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Award className="h-5 w-5 text-gray-400" />}
                        {index === 2 && <Award className="h-5 w-5 text-amber-600" />}
                        {index > 2 && <span className="text-sm font-medium">{index + 1}</span>}
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-xs font-medium">
                          {contributor.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{contributor.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {contributor.reputation.toLocaleString()} reputation
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recognition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recognition & Rewards System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-medium">Achievement Badges</h4>
                  <div className="space-y-3">
                    {[
                      {
                        name: 'Knowledge Pioneer',
                        description: 'First to answer in a category',
                        rarity: 'epic',
                        progress: 80,
                      },
                      {
                        name: 'Solution Architect',
                        description: '50+ verified solutions',
                        rarity: 'rare',
                        progress: 65,
                      },
                      {
                        name: 'Community Helper',
                        description: '100+ helpful votes',
                        rarity: 'common',
                        progress: 90,
                      },
                    ].map((badge, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium">{badge.name}</span>
                          <Badge className={getBadgeColor(badge.rarity)}>{badge.rarity}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2 text-xs">{badge.description}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={badge.progress} className="h-2 flex-1" />
                          <span className="text-xs">{badge.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-medium">Leaderboard</h4>
                  <div className="space-y-2">
                    {experts.slice(0, 5).map((expert, index) => (
                      <div
                        key={expert.id}
                        className="bg-muted flex items-center justify-between rounded p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{expert.name}</span>
                        </div>
                        <span className="text-sm font-medium">{expert.reputation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
