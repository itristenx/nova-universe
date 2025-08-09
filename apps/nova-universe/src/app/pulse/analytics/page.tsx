'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  FireIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface PerformanceMetric {
  title: string
  value: number | string
  change: number
  unit?: string
  trend: 'up' | 'down' | 'neutral'
  category: 'productivity' | 'quality' | 'efficiency' | 'satisfaction'
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  progress: number
  maxProgress: number
  category: 'speed' | 'quality' | 'collaboration' | 'learning'
}

const mockMetrics: PerformanceMetric[] = [
  {
    title: 'Tickets Resolved',
    value: 89,
    change: 12,
    trend: 'up',
    category: 'productivity'
  },
  {
    title: 'Average Resolution Time',
    value: '2.4h',
    change: -15,
    trend: 'up',
    category: 'efficiency'
  },
  {
    title: 'Customer Satisfaction',
    value: 4.7,
    change: 3,
    unit: '/5',
    trend: 'up',
    category: 'satisfaction'
  },
  {
    title: 'First Call Resolution',
    value: 78,
    change: 8,
    unit: '%',
    trend: 'up',
    category: 'quality'
  },
  {
    title: 'Response Time',
    value: '8m',
    change: -22,
    trend: 'up',
    category: 'efficiency'
  },
  {
    title: 'Escalation Rate',
    value: 12,
    change: -5,
    unit: '%',
    trend: 'up',
    category: 'quality'
  }
]

const mockAchievements: Achievement[] = [
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Resolve 50 tickets in under 1 hour each',
    icon: '⚡',
    earned: true,
    progress: 50,
    maxProgress: 50,
    category: 'speed'
  },
  {
    id: 'customer-champion',
    title: 'Customer Champion',
    description: 'Maintain 4.5+ rating for 30 days',
    icon: '🏆',
    earned: true,
    progress: 30,
    maxProgress: 30,
    category: 'quality'
  },
  {
    id: 'team-player',
    title: 'Team Player',
    description: 'Help 10 colleagues this month',
    icon: '🤝',
    earned: false,
    progress: 7,
    maxProgress: 10,
    category: 'collaboration'
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Complete 5 training modules',
    icon: '📚',
    earned: false,
    progress: 3,
    maxProgress: 5,
    category: 'learning'
  },
  {
    id: 'problem-solver',
    title: 'Problem Solver',
    description: 'Resolve 3 critical incidents',
    icon: '🔧',
    earned: false,
    progress: 1,
    maxProgress: 3,
    category: 'quality'
  },
  {
    id: 'efficiency-expert',
    title: 'Efficiency Expert',
    description: 'Resolve 100 tickets with 95% FCR',
    icon: '📈',
    earned: false,
    progress: 67,
    maxProgress: 100,
    category: 'efficiency'
  }
]

const categoryColors = {
  productivity: 'text-blue-600 bg-blue-100',
  quality: 'text-green-600 bg-green-100',
  efficiency: 'text-purple-600 bg-purple-100',
  satisfaction: 'text-orange-600 bg-orange-100'
}

const achievementCategories = {
  speed: 'bg-yellow-100 text-yellow-800',
  quality: 'bg-green-100 text-green-800',
  collaboration: 'bg-blue-100 text-blue-800',
  learning: 'bg-purple-100 text-purple-800'
}

export default function PerformanceAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredMetrics = selectedCategory === 'all' 
    ? mockMetrics 
    : mockMetrics.filter(metric => metric.category === selectedCategory)

  const overallScore = 87 // Mock overall performance score
  const rank = 3 // Mock team ranking
  const totalTechnicians = 15

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your performance, achievements, and growth as a technician
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <CardTitle>Overall Performance</CardTitle>
            <CardDescription>Your current performance score</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-blue-600 opacity-20"></div>
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{overallScore}</div>
                  <div className="text-sm text-muted-foreground">/ 100</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Team Ranking</span>
                <span className="font-medium">#{rank} of {totalTechnicians}</span>
              </div>
              <Progress value={(totalTechnicians - rank + 1) / totalTechnicians * 100} />
              <p className="text-xs text-muted-foreground">
                You're in the top {Math.round((totalTechnicians - rank + 1) / totalTechnicians * 100)}% of technicians
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key metrics for {selectedPeriod}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <ClockIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">2.4h</div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">4.7</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Escalated</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <FireIcon className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Streak</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <UserIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-muted-foreground">Helped</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed breakdown of your performance indicators</CardDescription>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="efficiency">Efficiency</SelectItem>
                <SelectItem value="satisfaction">Satisfaction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={cn("text-xs", categoryColors[metric.category])}>
                      {metric.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {metric.trend === 'up' ? (
                        <TrendingUpIcon className="w-4 h-4 text-green-600" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDownIcon className="w-4 h-4 text-red-600" />
                      ) : null}
                      <span className={cn(
                        "text-sm font-medium",
                        metric.trend === 'up' ? "text-green-600" : 
                        metric.trend === 'down' ? "text-red-600" : "text-muted-foreground"
                      )}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1">{metric.title}</h3>
                  <div className="text-2xl font-bold">
                    {metric.value}
                    {metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
          <TabsTrigger value="leaderboard">Team Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Badges</CardTitle>
              <CardDescription>Track your progress and unlock new achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockAchievements.map((achievement) => (
                  <Card key={achievement.id} className={cn(
                    "transition-all",
                    achievement.earned ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20" : ""
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={cn(
                          "text-2xl w-12 h-12 rounded-full flex items-center justify-center",
                          achievement.earned ? "bg-primary/20" : "bg-muted"
                        )}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-sm">{achievement.title}</h3>
                            {achievement.earned && (
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <Badge className={cn("text-xs", achievementCategories[achievement.category])}>
                            {achievement.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            {achievement.progress} / {achievement.maxProgress}
                          </span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className={cn(
                            "h-2",
                            achievement.earned && "bg-primary/20"
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Goals</CardTitle>
              <CardDescription>Set and track your performance goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Weekly Resolution Target</h3>
                    <Badge variant="secondary">120 / 100</Badge>
                  </div>
                  <Progress value={120} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Exceed your weekly target by 20 tickets
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Customer Satisfaction Goal</h3>
                    <Badge variant="secondary">4.7 / 4.5</Badge>
                  </div>
                  <Progress value={94} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Maintain 4.5+ rating - currently exceeding target
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Response Time Target</h3>
                    <Badge variant="outline">8m / 10m</Badge>
                  </div>
                  <Progress value={80} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Respond within 10 minutes - ahead of schedule
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Leaderboard</CardTitle>
              <CardDescription>See how you rank among your peers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Kim', score: 95, position: 1, change: 0 },
                  { name: 'Alex Rodriguez', score: 91, position: 2, change: 1 },
                  { name: 'You', score: 87, position: 3, change: -1, isOwn: true },
                  { name: 'Mike Chen', score: 84, position: 4, change: 2 },
                  { name: 'Emily Davis', score: 82, position: 5, change: -1 },
                ].map((member) => (
                  <div 
                    key={member.name} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      member.isOwn && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        member.position === 1 ? "bg-yellow-100 text-yellow-800" :
                        member.position === 2 ? "bg-gray-100 text-gray-800" :
                        member.position === 3 ? "bg-orange-100 text-orange-800" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {member.position}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">Score: {member.score}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {member.change !== 0 && (
                        <div className={cn(
                          "flex items-center space-x-1 text-xs",
                          member.change > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {member.change > 0 ? (
                            <TrendingUpIcon className="w-3 h-3" />
                          ) : (
                            <TrendingDownIcon className="w-3 h-3" />
                          )}
                          <span>{Math.abs(member.change)}</span>
                        </div>
                      )}
                      {member.position <= 3 && (
                        <TrophyIcon className={cn(
                          "w-5 h-5",
                          member.position === 1 ? "text-yellow-500" :
                          member.position === 2 ? "text-gray-500" :
                          "text-orange-500"
                        )} />
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