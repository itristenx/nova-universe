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
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeTime } from '@/lib/utils'

interface DashboardStats {
  totalTickets: number
  openTickets: number
  completedToday: number
  avgResolutionTime: string
  slaCompliance: number
  xpEarned: number
  rank: number
  teamRank: number
}

interface RecentTicket {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: string
  assignedAt: string
  customer: string
}

interface TeamMember {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  activeTickets: number
  xp: number
}

interface Alert {
  id: string
  type: 'sla_breach' | 'high_priority' | 'system' | 'team'
  title: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function PulseDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    completedToday: 0,
    avgResolutionTime: '0h',
    slaCompliance: 0,
    xpEarned: 0,
    rank: 0,
    teamRank: 0,
  })
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Simulate API calls - in production, these would be real API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          totalTickets: 156,
          openTickets: 12,
          completedToday: 8,
          avgResolutionTime: '2h 15m',
          slaCompliance: 94.2,
          xpEarned: 2840,
          rank: 7,
          teamRank: 3,
        })

        setRecentTickets([
          {
            id: 'TKT-001',
            title: 'Email server not responding',
            priority: 'high',
            status: 'In Progress',
            assignedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            customer: 'John Smith',
          },
          {
            id: 'TKT-002',
            title: 'Password reset request',
            priority: 'medium',
            status: 'New',
            assignedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            customer: 'Sarah Johnson',
          },
          {
            id: 'TKT-003',
            title: 'Software installation help',
            priority: 'low',
            status: 'Waiting for User',
            assignedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
            customer: 'Mike Davis',
          },
        ])

        setTeamMembers([
          {
            id: '1',
            name: 'Alice Johnson',
            status: 'online',
            activeTickets: 8,
            xp: 3200,
          },
          {
            id: '2',
            name: 'Bob Wilson',
            status: 'busy',
            activeTickets: 12,
            xp: 2950,
          },
          {
            id: '3',
            name: 'Charlie Brown',
            status: 'away',
            activeTickets: 5,
            xp: 2750,
          },
        ])

        setAlerts([
          {
            id: '1',
            type: 'sla_breach',
            title: 'SLA Breach Warning',
            description: 'Ticket TKT-001 will breach SLA in 15 minutes',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            severity: 'high',
          },
          {
            id: '2',
            type: 'high_priority',
            title: 'High Priority Ticket',
            description: 'New critical server outage ticket assigned',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            severity: 'critical',
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

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-blue-600 bg-blue-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getStatusColor = (status: string) => {
    if (status === 'online') return 'bg-green-500'
    if (status === 'busy') return 'bg-red-500'
    if (status === 'away') return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || 'Technician'}!</p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Technician'}! You're doing great work.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <EyeIcon className="w-4 h-4 mr-2" />
            Deep Work Mode
          </Button>
          <Button size="sm">
            <PlayIcon className="w-4 h-4 mr-2" />
            Start Timer
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
              {stats.totalTickets} total assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpIcon className="inline w-3 h-3 text-green-500" />
              +12% from yesterday
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
              <ArrowDownIcon className="inline w-3 h-3 text-green-500" />
              15m faster this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.slaCompliance}%</div>
            <Progress value={stats.slaCompliance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Recent Tickets</TabsTrigger>
          <TabsTrigger value="team">Team Status</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* XP & Gamification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrophyIcon className="w-5 h-5 mr-2" />
                  Your Performance
                </CardTitle>
                <CardDescription>
                  Track your progress and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">XP Earned This Month</span>
                  <span className="font-bold">{stats.xpEarned} XP</span>
                </div>
                <Progress value={(stats.xpEarned / 3000) * 100} />
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">#{stats.rank}</div>
                    <div className="text-sm text-muted-foreground">Global Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">#{stats.teamRank}</div>
                    <div className="text-sm text-muted-foreground">Team Rank</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <TicketIcon className="w-4 h-4 mr-2" />
                  Create New Ticket
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Check Team Queue
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Log Time Entry
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  View Escalations
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                Your most recently assigned tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{ticket.id}</span>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline">{ticket.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.customer} • {formatRelativeTime(ticket.assignedAt)}
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

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Status</CardTitle>
              <CardDescription>
                Current status of your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.activeTickets} active tickets • {member.xp} XP
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Important notifications and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start space-x-3 p-4 border rounded-lg"
                  >
                    <ExclamationTriangleIcon
                      className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(alert.timestamp)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Resolve
                    </Button>
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