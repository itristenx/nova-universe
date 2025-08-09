import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardHeader,
  CardBody,
  Select,
  SelectItem,
  Progress,
  Chip,
  Badge,
  Tabs,
  Tab,
  Avatar
} from '@heroui/react'
import {
  ChartBarIcon,
  TrophyIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface PerformanceMetric {
  id: string
  name: string
  value: number
  target?: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  period: 'daily' | 'weekly' | 'monthly'
}

interface TeamMember {
  id: string
  name: string
  avatar?: string
  role: string
  metrics: {
    ticketsResolved: number
    avgResolutionTime: number // in minutes
    customerSatisfaction: number
    escalationRate: number
  }
  rank: number
  achievements: Achievement[]
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: Date
  category: 'productivity' | 'quality' | 'teamwork' | 'innovation'
}

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: Date
  category: 'individual' | 'team'
  priority: 'low' | 'medium' | 'high'
  progress: number // 0-100
}

interface Props {
  userId?: string
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
}

export const PerformanceAnalyticsDashboard: React.FC<Props> = ({
  userId = 'current-user',
  timeRange: initialTimeRange = 'month'
}) => {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [timeRange, setTimeRange] = useState(initialTimeRange)
  const [comparisonMode, setComparisonMode] = useState<'team' | 'department' | 'company'>('team')

  // Individual performance metrics
  const { data: personalMetrics = [] } = useQuery({
    queryKey: ['personal-metrics', userId, timeRange],
    queryFn: async (): Promise<PerformanceMetric[]> => [
      {
        id: 'tickets-resolved',
        name: 'Tickets Resolved',
        value: 47,
        target: 45,
        unit: 'tickets',
        trend: 'up',
        trendPercentage: 12.5,
        period: 'monthly'
      },
      {
        id: 'avg-resolution-time',
        name: 'Avg Resolution Time',
        value: 2.3,
        target: 3.0,
        unit: 'hours',
        trend: 'up',
        trendPercentage: 8.2,
        period: 'monthly'
      },
      {
        id: 'customer-satisfaction',
        name: 'Customer Satisfaction',
        value: 4.7,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        trendPercentage: 5.5,
        period: 'monthly'
      },
      {
        id: 'first-contact-resolution',
        name: 'First Contact Resolution',
        value: 78,
        target: 75,
        unit: '%',
        trend: 'up',
        trendPercentage: 3.2,
        period: 'monthly'
      },
      {
        id: 'escalation-rate',
        name: 'Escalation Rate',
        value: 8,
        target: 10,
        unit: '%',
        trend: 'down',
        trendPercentage: 15.0,
        period: 'monthly'
      },
      {
        id: 'knowledge-base-usage',
        name: 'Knowledge Base Usage',
        value: 23,
        target: 20,
        unit: 'articles',
        trend: 'up',
        trendPercentage: 18.5,
        period: 'monthly'
      }
    ]
  })

  // Team comparison data
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-performance', timeRange],
    queryFn: async (): Promise<TeamMember[]> => [
      {
        id: 'user-1',
        name: 'Sarah Wilson',
        role: 'Senior Agent',
        rank: 1,
        metrics: {
          ticketsResolved: 52,
          avgResolutionTime: 1.8,
          customerSatisfaction: 4.8,
          escalationRate: 5
        },
        achievements: [
          {
            id: 'speed-demon',
            name: 'Speed Demon',
            description: 'Resolved 50+ tickets in a month',
            icon: '⚡',
            rarity: 'rare',
            unlockedAt: new Date(),
            category: 'productivity'
          }
        ]
      },
      {
        id: 'user-2',
        name: 'Mike Rodriguez',
        role: 'Agent',
        rank: 2,
        metrics: {
          ticketsResolved: 47,
          avgResolutionTime: 2.3,
          customerSatisfaction: 4.7,
          escalationRate: 8
        },
        achievements: [
          {
            id: 'customer-hero',
            name: 'Customer Hero',
            description: 'Maintained 4.5+ satisfaction rating',
            icon: '🦸',
            rarity: 'epic',
            unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            category: 'quality'
          }
        ]
      },
      {
        id: 'user-3',
        name: 'Jessica Chen',
        role: 'Agent',
        rank: 3,
        metrics: {
          ticketsResolved: 43,
          avgResolutionTime: 2.1,
          customerSatisfaction: 4.6,
          escalationRate: 12
        },
        achievements: [
          {
            id: 'team-player',
            name: 'Team Player',
            description: 'Helped 10+ colleagues this month',
            icon: '🤝',
            rarity: 'common',
            unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            category: 'teamwork'
          }
        ]
      },
      {
        id: 'current-user',
        name: 'You',
        role: 'Agent',
        rank: 2,
        metrics: {
          ticketsResolved: 47,
          avgResolutionTime: 2.3,
          customerSatisfaction: 4.7,
          escalationRate: 8
        },
        achievements: [
          {
            id: 'consistent-performer',
            name: 'Consistent Performer',
            description: 'Met all targets this month',
            icon: '🎯',
            rarity: 'rare',
            unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            category: 'productivity'
          }
        ]
      }
    ]
  })

  // Goals and targets
  const { data: goals = [] } = useQuery({
    queryKey: ['performance-goals', userId],
    queryFn: async (): Promise<Goal[]> => [
      {
        id: 'monthly-tickets',
        title: 'Monthly Ticket Goal',
        description: 'Resolve 50 tickets this month',
        target: 50,
        current: 47,
        unit: 'tickets',
        deadline: new Date(2025, 7, 31), // End of August
        category: 'individual',
        priority: 'high',
        progress: 94
      },
      {
        id: 'satisfaction-score',
        title: 'Customer Satisfaction',
        description: 'Maintain 4.5+ rating',
        target: 4.5,
        current: 4.7,
        unit: '/5',
        deadline: new Date(2025, 7, 31),
        category: 'individual',
        priority: 'medium',
        progress: 100
      },
      {
        id: 'team-collaboration',
        title: 'Team Collaboration',
        description: 'Help 15 team members with complex issues',
        target: 15,
        current: 12,
        unit: 'interactions',
        deadline: new Date(2025, 7, 31),
        category: 'team',
        priority: 'medium',
        progress: 80
      },
      {
        id: 'knowledge-sharing',
        title: 'Knowledge Sharing',
        description: 'Create 5 new KB articles',
        target: 5,
        current: 3,
        unit: 'articles',
        deadline: new Date(2025, 8, 15), // Mid September
        category: 'individual',
        priority: 'low',
        progress: 60
      }
    ]
  })

  const currentUser = teamMembers.find(member => member.id === userId)
  const teamRank = currentUser?.rank || 0
  const totalTeamMembers = teamMembers.length

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpIcon className="w-4 h-4 text-green-500" />
      case 'down': return <ArrowDownIcon className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4" />
    }
  }

  const getMetricColor = (value: number, target?: number): "success" | "warning" | "danger" | "primary" => {
    if (!target) return 'primary'
    const ratio = value / target
    if (ratio >= 1.1) return 'success'
    if (ratio >= 0.9) return 'primary'
    if (ratio >= 0.7) return 'warning'
    return 'danger'
  }

  const getRarityColor = (rarity: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    switch (rarity) {
      case 'legendary': return 'warning'
      case 'epic': return 'secondary'
      case 'rare': return 'primary'
      default: return 'default'
    }
  }

  const getGoalProgressColor = (progress: number): "success" | "warning" | "danger" => {
    if (progress >= 90) return 'success'
    if (progress >= 70) return 'warning'
    return 'danger'
  }

  const formatTimeRange = (range: string) => {
    switch (range) {
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case 'quarter': return 'This Quarter'
      case 'year': return 'This Year'
      default: return 'This Month'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Performance Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your performance, compare with team, and achieve your goals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            label="Time Range"
            selectedKeys={[timeRange]}
            onSelectionChange={(keys) => setTimeRange(Array.from(keys)[0] as 'week' | 'month' | 'quarter' | 'year')}
            className="w-40"
            size="sm"
          >
            <SelectItem key="week">This Week</SelectItem>
            <SelectItem key="month">This Month</SelectItem>
            <SelectItem key="quarter">This Quarter</SelectItem>
            <SelectItem key="year">This Year</SelectItem>
          </Select>

          <Badge color="primary" variant="flat">
            #{teamRank} of {totalTeamMembers}
          </Badge>
        </div>
      </div>

      {/* Performance Overview */}
      <Tabs selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)}>
        <Tab key="overview" title={
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4" />
            Overview
          </div>
        }>
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardBody className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {metric.name}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {metric.value}{metric.unit}
                          </span>
                          {metric.target && (
                            <span className="text-sm text-gray-500">
                              / {metric.target}{metric.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Chip
                        size="sm"
                        color={getMetricColor(metric.value, metric.target)}
                        variant="flat"
                        startContent={getTrendIcon(metric.trend)}
                      >
                        {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}%
                      </Chip>
                    </div>

                    {metric.target && (
                      <Progress
                        value={(metric.value / metric.target) * 100}
                        color={getMetricColor(metric.value, metric.target)}
                        size="sm"
                        className="mt-2"
                      />
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Goals Progress */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Goals Progress</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {goal.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Chip size="sm" color={goal.priority === 'high' ? 'danger' : goal.priority === 'medium' ? 'warning' : 'default'}>
                            {goal.priority}
                          </Chip>
                          <Chip size="sm" variant="flat">
                            {goal.category}
                          </Chip>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium">
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4" />
                          Due: {goal.deadline.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <Progress
                        value={goal.progress}
                        color={getGoalProgressColor(goal.progress)}
                        size="sm"
                        showValueLabel
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="team" title={
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            Team Comparison
          </div>
        }>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h3 className="font-semibold">Team Leaderboard ({formatTimeRange(timeRange)})</h3>
                
                <Select
                  label="Compare with"
                  selectedKeys={[comparisonMode]}
                  onSelectionChange={(keys) => setComparisonMode(Array.from(keys)[0] as any)}
                  className="w-32"
                  size="sm"
                >
                  <SelectItem key="team">Team</SelectItem>
                  <SelectItem key="department">Department</SelectItem>
                  <SelectItem key="company">Company</SelectItem>
                </Select>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {teamMembers
                  .sort((a, b) => a.rank - b.rank)
                  .map((member, index) => (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg border ${
                        member.id === userId
                          ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {index === 0 && <TrophyIcon className="w-5 h-5 text-yellow-500" />}
                            {index === 1 && <Badge color="default" variant="flat">2nd</Badge>}
                            {index === 2 && <Badge color="default" variant="flat">3rd</Badge>}
                            {index > 2 && <span className="text-sm text-gray-500">#{index + 1}</span>}
                          </div>
                          
                          <Avatar name={member.name} size="sm" />
                          
                          <div>
                            <p className="font-medium">
                              {member.name}
                              {member.id === userId && (
                                <Badge size="sm" color="primary" variant="flat" className="ml-2">
                                  You
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">{member.role}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{member.metrics.ticketsResolved}</p>
                            <p className="text-gray-500">Tickets</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{member.metrics.avgResolutionTime}h</p>
                            <p className="text-gray-500">Avg Time</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{member.metrics.customerSatisfaction}/5</p>
                            <p className="text-gray-500">CSAT</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{member.metrics.escalationRate}%</p>
                            <p className="text-gray-500">Escalation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="achievements" title={
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            Achievements
          </div>
        }>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Recent Achievements</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {currentUser?.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{achievement.name}</h4>
                            <Chip
                              size="sm"
                              color={getRarityColor(achievement.rarity)}
                              variant="flat"
                            >
                              {achievement.rarity}
                            </Chip>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Unlocked {achievement.unlockedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Achievement Progress */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Achievement Progress</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        <span className="font-medium">Resolution Master</span>
                      </div>
                      <Chip size="sm" color="warning" variant="flat">legendary</Chip>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Resolve 100 tickets in a month
                    </p>
                    <Progress value={47} color="warning" size="sm" showValueLabel />
                    <p className="text-xs text-gray-500 mt-1">47 / 100 tickets</p>
                  </div>

                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⭐</span>
                        <span className="font-medium">Five Star Agent</span>
                      </div>
                      <Chip size="sm" color="secondary" variant="flat">epic</Chip>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Maintain 4.8+ satisfaction for 3 months
                    </p>
                    <Progress value={67} color="secondary" size="sm" showValueLabel />
                    <p className="text-xs text-gray-500 mt-1">2 / 3 months</p>
                  </div>

                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🚀</span>
                        <span className="font-medium">Speed Racer</span>
                      </div>
                      <Chip size="sm" color="primary" variant="flat">rare</Chip>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Average resolution time under 2 hours
                    </p>
                    <Progress value={85} color="primary" size="sm" showValueLabel />
                    <p className="text-xs text-gray-500 mt-1">Current: 2.3h average</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}
