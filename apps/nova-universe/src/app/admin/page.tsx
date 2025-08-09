'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UserGroupIcon,
  TicketIcon,
  ComputerDesktopIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeTime } from '@/lib/utils'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalTickets: number
  openTickets: number
  resolvedToday: number
  avgResolutionTime: string
  systemUptime: string
  activeKiosks: number
  totalKiosks: number
  storageUsed: number
  cpuUsage: number
  memoryUsage: number
  slaCompliance: number
}

interface RecentActivity {
  id: string
  type: 'user' | 'ticket' | 'system' | 'kiosk'
  title: string
  description: string
  timestamp: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  user?: string
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  timestamp: string
  module: string
  resolved: boolean
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedToday: 0,
    avgResolutionTime: '0h',
    systemUptime: '0 days',
    activeKiosks: 0,
    totalKiosks: 0,
    storageUsed: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    slaCompliance: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Simulate API calls - in production, these would be real API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          totalUsers: 1247,
          activeUsers: 892,
          totalTickets: 3456,
          openTickets: 147,
          resolvedToday: 89,
          avgResolutionTime: '4h 32m',
          systemUptime: '45 days',
          activeKiosks: 12,
          totalKiosks: 15,
          storageUsed: 76,
          cpuUsage: 34,
          memoryUsage: 67,
          slaCompliance: 96.7,
        })

        setRecentActivity([
          {
            id: '1',
            type: 'user',
            title: 'New user registration',
            description: 'Sarah Johnson registered as Marketing Manager',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            user: 'System',
          },
          {
            id: '2',
            type: 'ticket',
            title: 'Critical ticket resolved',
            description: 'Server outage ticket #3456 resolved by Tech Team',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            severity: 'critical',
            user: 'Mike Davis',
          },
          {
            id: '3',
            type: 'system',
            title: 'Backup completed',
            description: 'Daily system backup completed successfully',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            user: 'System',
          },
          {
            id: '4',
            type: 'kiosk',
            title: 'Kiosk activated',
            description: 'New kiosk "Main Lobby" brought online',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            user: 'Admin',
          },
        ])

        setSystemAlerts([
          {
            id: '1',
            type: 'warning',
            title: 'Storage approaching limit',
            description: 'Database storage is at 76% capacity',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            module: 'Storage',
            resolved: false,
          },
          {
            id: '2',
            type: 'error',
            title: 'Email service degraded',
            description: 'SMTP server response times increased',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            module: 'Email',
            resolved: false,
          },
          {
            id: '3',
            type: 'info',
            title: 'Maintenance scheduled',
            description: 'System maintenance planned for this weekend',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            module: 'System',
            resolved: true,
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

  const getActivityIcon = (type: string) => {
    const icons = {
      user: UserGroupIcon,
      ticket: TicketIcon,
      system: ServerIcon,
      kiosk: ComputerDesktopIcon,
    }
    return icons[type as keyof typeof icons] || ServerIcon
  }

  const getActivityColor = (type: string) => {
    const colors = {
      user: 'text-blue-500',
      ticket: 'text-green-500',
      system: 'text-purple-500',
      kiosk: 'text-orange-500',
    }
    return colors[type as keyof typeof colors] || 'text-gray-500'
  }

  const getAlertColor = (type: string) => {
    const colors = {
      error: 'text-red-500 bg-red-50 border-red-200',
      warning: 'text-orange-500 bg-orange-50 border-orange-200',
      info: 'text-blue-500 bg-blue-50 border-blue-200',
    }
    return colors[type as keyof typeof colors] || colors.info
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || 'Administrator'}!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Administrator'}! System overview and management.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm">
            <CogIcon className="w-4 h-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">
                <ArrowUpIcon className="inline w-3 h-3" />
                {stats.activeUsers}
              </span>{' '}
              active now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">
                <ArrowDownIcon className="inline w-3 h-3" />
                {stats.resolvedToday}
              </span>{' '}
              resolved today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <ServerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemUptime}</div>
            <p className="text-xs text-muted-foreground">
              <CheckCircleIcon className="inline w-3 h-3 text-green-500" />
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.slaCompliance}%</div>
            <Progress value={stats.slaCompliance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database</span>
                <span>{stats.storageUsed}%</span>
              </div>
              <Progress value={stats.storageUsed} />
              <p className="text-xs text-muted-foreground">
                {stats.storageUsed > 75 ? (
                  <span className="text-orange-500">⚠️ Approaching limit</span>
                ) : (
                  'Normal usage'
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Load</span>
                <span>{stats.cpuUsage}%</span>
              </div>
              <Progress value={stats.cpuUsage} />
              <p className="text-xs text-muted-foreground">
                {stats.cpuUsage < 50 ? 'Low usage' : stats.cpuUsage < 80 ? 'Normal' : 'High usage'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>RAM Usage</span>
                <span>{stats.memoryUsage}%</span>
              </div>
              <Progress value={stats.memoryUsage} />
              <p className="text-xs text-muted-foreground">
                {stats.memoryUsage < 70 ? 'Normal' : 'High usage'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kiosk Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ComputerDesktopIcon className="w-5 h-5 mr-2" />
                  Kiosk Status
                </CardTitle>
                <CardDescription>
                  Nova Beacon kiosk management overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Kiosks</span>
                  <span className="font-bold">{stats.activeKiosks}/{stats.totalKiosks}</span>
                </div>
                <Progress value={(stats.activeKiosks / stats.totalKiosks) * 100} />
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{stats.activeKiosks}</div>
                    <div className="text-sm text-muted-foreground">Online</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{stats.totalKiosks - stats.activeKiosks}</div>
                    <div className="text-sm text-muted-foreground">Offline</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Resolution Time</span>
                    <span className="font-bold">{stats.avgResolutionTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Tickets</span>
                    <span className="font-bold">{stats.totalTickets.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Rate</span>
                    <span className="font-bold text-green-600">98.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="font-bold text-green-600">4.8/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system events and user activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${getActivityColor(activity.type)}`} />
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                          {activity.user && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">by {activity.user}</p>
                            </>
                          )}
                          {activity.severity && (
                            <Badge variant="outline" className="ml-auto">
                              {activity.severity}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Critical system notifications and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start space-x-3 p-4 border rounded-lg ${getAlertColor(alert.type)}`}
                  >
                    <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{alert.title}</p>
                        <Badge variant={alert.resolved ? "outline" : "destructive"} className="ml-2">
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{alert.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <p className="text-xs">{formatRelativeTime(alert.timestamp)}</p>
                        <span className="text-xs">•</span>
                        <p className="text-xs">{alert.module}</p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button variant="ghost" size="sm">
                        Resolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Create New User
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Manage VIP Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CogIcon className="w-4 h-4 mr-2" />
                  Role Management
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <ServerIcon className="w-4 h-4 mr-2" />
                  System Health Check
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kiosk Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <ComputerDesktopIcon className="w-4 h-4 mr-2" />
                  Deploy New Kiosk
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CogIcon className="w-4 h-4 mr-2" />
                  Configure Settings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Kiosk Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}