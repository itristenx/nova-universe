'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Plus,
  Star,
  ArrowRight,
  MessageSquare,
  User,
  ShoppingCart,
  FileText,
  Zap,
  Ticket,
  Brain,
  Heart,
  Eye,
  RefreshCw,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Types
interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  completedTickets: number;
  avgResolutionTime: string;
}

interface RecentActivity {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'service_requested' | 'knowledge_viewed';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  icon: React.ReactNode;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'knowledge' | 'service' | 'tool';
  href: string;
  reason: string;
  icon: React.ReactNode;
}

export default function EnhancedUserDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    completedTickets: 0,
    avgResolutionTime: '0 days',
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'new-ticket',
      title: 'Submit Ticket',
      description: 'Report an issue or request help',
      href: '/tickets/new-enhanced',
      icon: <Plus className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      popular: true,
    },
    {
      id: 'track-tickets',
      title: 'Track Tickets',
      description: 'View status and updates',
      href: '/tickets/track',
      icon: <Eye className="h-6 w-6" />,
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      popular: true,
    },
    {
      id: 'request-service',
      title: 'Request Service',
      description: 'Browse service catalog',
      href: '/catalog/enhanced',
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      popular: true,
    },
    {
      id: 'search-knowledge',
      title: 'Knowledge Base',
      description: 'Find answers and guides',
      href: '/knowledge/enhanced',
      icon: <Brain className="h-6 w-6" />,
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    },
    {
      id: 'knowledge-community',
      title: 'Knowledge Community',
      description: 'Expert network & peer recognition',
      href: '/knowledge-community',
      icon: <Star className="h-6 w-6" />,
      color:
        'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200',
      popular: true,
    },

    {
      id: 'cosmo-chat',
      title: 'Cosmo Assistant',
      description: 'Chat with AI assistant',
      href: '/cosmo',
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    },
    {
      id: 'service-status',
      title: 'Service Status',
      description: 'Check system health',
      href: '/status',
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    },
  ];

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);

      try {
        // Try to fetch from API first, fallback to mock data
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          throw new Error('API not available');
        }
      } catch (error) {
        console.warn('API not available, using mock data:', error);
        // Fallback to mock stats
        setStats({
          totalTickets: 12,
          openTickets: 3,
          completedTickets: 9,
          avgResolutionTime: '2.5 days',
        });
      }

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'ticket_created',
          title: 'Password Reset Request',
          description: 'New ticket created - Laptop login issues',
          timestamp: '2 hours ago',
          status: 'open',
          icon: <Ticket className="h-4 w-4" />,
        },
        {
          id: '2',
          type: 'service_requested',
          title: 'Microsoft Office License',
          description: 'Service request approved and provisioned',
          timestamp: '1 day ago',
          status: 'completed',
          icon: <ShoppingCart className="h-4 w-4" />,
        },
        {
          id: '3',
          type: 'knowledge_viewed',
          title: 'VPN Setup Guide',
          description: 'Viewed knowledge article',
          timestamp: '2 days ago',
          icon: <FileText className="h-4 w-4" />,
        },
        {
          id: '4',
          type: 'ticket_updated',
          title: 'Hardware Request Update',
          description: 'Ticket status changed to In Progress',
          timestamp: '3 days ago',
          status: 'in_progress',
          icon: <RefreshCw className="h-4 w-4" />,
        },
      ]);

      // Mock notifications
      setNotifications([
        {
          id: '1',
          title: 'Ticket Updated',
          message: 'Your password reset request has been resolved',
          type: 'success',
          timestamp: '1 hour ago',
          read: false,
        },
        {
          id: '2',
          title: 'Service Maintenance',
          message: 'Email service will be unavailable tonight 11 PM - 2 AM',
          type: 'warning',
          timestamp: '3 hours ago',
          read: false,
        },
        {
          id: '3',
          title: 'New Feature Available',
          message: 'Enhanced ticket tracking is now available',
          type: 'info',
          timestamp: '1 day ago',
          read: true,
        },
      ]);

      // Mock personalized recommendations
      setRecommendations([
        {
          id: '1',
          title: 'VPN Access Request',
          description: 'Many users like you also request VPN access',
          type: 'service',
          href: '/catalog/enhanced?service=vpn',
          reason: 'Based on your role and recent activity',
          icon: <ShoppingCart className="h-4 w-4" />,
        },
        {
          id: '2',
          title: 'Password Security Guide',
          description: 'Learn about strong password practices',
          type: 'knowledge',
          href: '/knowledge/enhanced?category=security',
          reason: 'Related to your recent password reset',
          icon: <FileText className="h-4 w-4" />,
        },
        {
          id: '3',
          title: 'Mobile Device Setup',
          description: 'Configure your work phone or tablet',
          type: 'service',
          href: '/catalog/enhanced?service=mobile',
          reason: 'Popular among your department',
          icon: <ShoppingCart className="h-4 w-4" />,
        },
      ]);

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getActivityStatusColor = (status?: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome to Nova Orbit</h1>
              <p className="text-muted-foreground">Your personal IT service portal</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                {notifications.filter((n) => !n.read).length} new
              </Button>
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Tickets</p>
                  <p className="text-2xl font-bold">{stats.totalTickets}</p>
                </div>
                <Ticket className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Open Tickets</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.openTickets}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTickets}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Avg Resolution</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgResolutionTime}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.id} href={action.href}>
                  <Card className={`cursor-pointer transition-all hover:shadow-lg ${action.color}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-white/20 p-2">{action.icon}</div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">{action.title}</h3>
                            {action.popular && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm opacity-80">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-60" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="hover:bg-muted/50 flex items-start gap-3 rounded-lg p-3 transition-colors"
                  >
                    <div className="bg-muted rounded-lg p-2">{activity.icon}</div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-medium">{activity.title}</h4>
                        {activity.status && (
                          <Badge
                            className={getActivityStatusColor(activity.status)}
                            variant="secondary"
                          >
                            {activity.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-1 text-sm">{activity.description}</p>
                      <p className="text-muted-foreground text-xs">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <Link href="/tickets">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Recommendations */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {notifications.filter((n) => !n.read).length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-lg border p-3 ${notification.read ? 'opacity-60' : 'border-blue-200 bg-blue-50'}`}
                    >
                      <div className="flex items-start gap-2">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <h5 className="text-sm font-medium">{notification.title}</h5>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {notification.message}
                          </p>
                          <p className="text-muted-foreground mt-2 text-xs">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>

            {/* Personalized Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <Link key={rec.id} href={rec.href}>
                      <div className="hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors">
                        <div className="flex items-start gap-2">
                          {rec.icon}
                          <div className="flex-1">
                            <h5 className="text-sm font-medium">{rec.title}</h5>
                            <p className="text-muted-foreground mt-1 text-xs">{rec.description}</p>
                            <p className="mt-2 text-xs text-blue-600">{rec.reason}</p>
                          </div>
                          <ArrowRight className="text-muted-foreground h-3 w-3" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Satisfaction Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Your Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Ticket Resolution</span>
                  <span className="text-muted-foreground text-sm">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Service Quality</span>
                  <span className="text-muted-foreground text-sm">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-muted-foreground text-sm">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <p className="mb-2 text-sm text-blue-800">
                <strong>Overall Satisfaction: 4.2/5</strong>
              </p>
              <p className="text-xs text-blue-600">
                Help us improve by providing feedback on your recent experiences.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
