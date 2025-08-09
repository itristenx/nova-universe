'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TicketIcon,
  ClockIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  BoltIcon,
  HeartIcon,
  FireIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface UserStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  avgResolutionTime: string
  satisfaction: number
  knowledgeViews: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  popular?: boolean
}

interface RecentTicket {
  id: string
  title: string
  status: 'new' | 'in-progress' | 'waiting' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  lastUpdate: string
}

interface Recommendation {
  id: string
  type: 'article' | 'service' | 'tip'
  title: string
  description: string
  href: string
  reason: string
  icon: React.ReactNode
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
}

export default function PortalDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats>({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResolutionTime: '0h',
    satisfaction: 0,
    knowledgeViews: 0,
  })
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Simulate API calls - in production, these would be real API calls
        await new Promise(resolve => setTimeout(resolve, 800))
        
        setStats({
          totalTickets: 23,
          openTickets: 3,
          resolvedTickets: 20,
          avgResolutionTime: '2h 45m',
          satisfaction: 4.8,
          knowledgeViews: 47,
        })

        setRecentTickets([
          {
            id: 'TKT-1001',
            title: 'Password reset request',
            status: 'in-progress',
            priority: 'medium',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            lastUpdate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: 'TKT-1002',
            title: 'Software installation help',
            status: 'waiting',
            priority: 'low',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'TKT-1003',
            title: 'Email setup assistance',
            status: 'resolved',
            priority: 'high',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ])

        setRecommendations([
          {
            id: '1',
            type: 'article',
            title: 'How to reset your password',
            description: 'Step-by-step guide for password management',
            href: '/portal/knowledge/password-reset',
            reason: 'Based on your recent ticket',
            icon: <DocumentTextIcon className="w-5 h-5" />,
          },
          {
            id: '2',
            type: 'service',
            title: 'Request new software',
            description: 'Browse our software catalog',
            href: '/portal/catalog/software',
            reason: 'Popular among your department',
            icon: <ShoppingCartIcon className="w-5 h-5" />,
          },
          {
            id: '3',
            type: 'tip',
            title: 'Set up two-factor authentication',
            description: 'Enhance your account security',
            href: '/portal/knowledge/2fa-setup',
            reason: 'Security best practice',
            icon: <BoltIcon className="w-5 h-5" />,
          },
        ])

        setNotifications([
          {
            id: '1',
            title: 'Ticket Update',
            message: 'Your password reset request is being processed',
            type: 'info',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            read: false,
          },
          {
            id: '2',
            title: 'Service Approved',
            message: 'Your software installation request has been approved',
            type: 'success',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
          },
        ])

      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'new-ticket',
      title: 'Submit Ticket',
      description: 'Report an issue or request help',
      href: '/portal/tickets/new',
      icon: <TicketIcon className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      popular: true,
    },
    {
      id: 'track-tickets',
      title: 'Track Tickets',
      description: 'View status and updates',
      href: '/portal/tickets',
      icon: <ClockIcon className="w-6 h-6" />,
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      popular: true,
    },
    {
      id: 'request-service',
      title: 'Request Service',
      description: 'Browse service catalog',
      href: '/portal/catalog',
      icon: <ShoppingCartIcon className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      popular: true,
    },
    {
      id: 'search-knowledge',
      title: 'Knowledge Base',
      description: 'Find answers and guides',
      href: '/portal/knowledge',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    },
    {
      id: 'contact-support',
      title: 'Contact Support',
      description: 'Get direct assistance',
      href: '/portal/contact',
      icon: <QuestionMarkCircleIcon className="w-6 h-6" />,
      color: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
    {
      id: 'community',
      title: 'Community',
      description: 'Join discussions',
      href: '/portal/community',
      icon: <UserGroupIcon className="w-6 h-6" />,
      color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'text-blue-600 bg-blue-100 border-blue-200',
      'in-progress': 'text-purple-600 bg-purple-100 border-purple-200',
      waiting: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      resolved: 'text-green-600 bg-green-100 border-green-200',
      closed: 'text-gray-600 bg-gray-100 border-gray-200',
    }
    return colors[status as keyof typeof colors] || colors.new
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-blue-600 bg-blue-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getNotificationColor = (type: string) => {
    const colors = {
      info: 'border-l-blue-500 bg-blue-50',
      success: 'border-l-green-500 bg-green-50',
      warning: 'border-l-yellow-500 bg-yellow-50',
      error: 'border-l-red-500 bg-red-50',
    }
    return colors[type as keyof typeof colors] || colors.info
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your support requests and services.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <QuestionMarkCircleIcon className="w-4 h-4 mr-2" />
            Get Help
          </Button>
          <Button size="sm">
            <TicketIcon className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTickets} total tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground">
              Faster than average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <StarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.satisfaction}/5.0</div>
            <p className="text-xs text-muted-foreground">
              <CheckCircleIcon className="inline w-3 h-3 text-green-500" />
              Excellent rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Views</CardTitle>
            <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.knowledgeViews}</div>
            <p className="text-xs text-muted-foreground">
              Articles read this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and frequently used services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.id}
                className={cn(
                  'relative p-4 rounded-lg border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group',
                  action.color
                )}
              >
                {action.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-primary">
                    <FireIcon className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-md bg-white/50">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:underline">{action.title}</h3>
                    <p className="text-sm opacity-80">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Recent Tickets</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
          <TabsTrigger value="notifications">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
                  Your Progress
                </CardTitle>
                <CardDescription>
                  Track your support experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tickets Resolved</span>
                    <span>{stats.resolvedTickets}/{stats.totalTickets}</span>
                  </div>
                  <Progress value={(stats.resolvedTickets / stats.totalTickets) * 100} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
                    <div className="text-sm text-muted-foreground">Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.openTickets}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Support Information</CardTitle>
                <CardDescription>
                  When and how to reach us
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Support Hours</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri: 8:00 AM - 6:00 PM EST</p>
                    <p className="text-sm text-muted-foreground">Sat-Sun: 10:00 AM - 4:00 PM EST</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Emergency Support</p>
                    <p className="text-sm text-muted-foreground">24/7 for critical issues</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-sm text-muted-foreground">
                      High Priority: &lt; 2 hours
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Normal Priority: &lt; 24 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                Your latest support requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-medium text-primary">
                          {ticket.id}
                        </span>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {formatRelativeTime(ticket.createdAt)} • 
                        Last updated {formatRelativeTime(ticket.lastUpdate)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Helpful resources and services based on your activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="p-2 rounded-md bg-muted">
                      {recommendation.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{recommendation.title}</p>
                      <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <HeartIcon className="inline w-3 h-3 mr-1" />
                        {recommendation.reason}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {recommendation.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>
                Latest notifications and announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 rounded-r-lg ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge className="ml-2">New</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}