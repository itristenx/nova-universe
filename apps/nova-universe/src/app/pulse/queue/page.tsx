'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  UserIcon,
  CheckIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeTime, cn } from '@/lib/utils'

interface QueueItem {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'waiting' | 'in_progress' | 'on_hold' | 'resolved'
  type: 'incident' | 'request' | 'change' | 'problem'
  requester: string
  assignee?: string
  estimatedTime: number
  actualTime?: number
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

const mockQueueItems: QueueItem[] = [
  {
    id: 'Q-001',
    title: 'Network connectivity issues in Building A',
    description: 'Users reporting intermittent network drops in the main office',
    priority: 'high',
    status: 'waiting',
    type: 'incident',
    requester: 'Sarah Johnson',
    estimatedTime: 120,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['network', 'infrastructure', 'building-a']
  },
  {
    id: 'Q-002',
    title: 'Software installation request - Adobe Creative Suite',
    description: 'Install Adobe Creative Suite for marketing team',
    priority: 'medium',
    status: 'in_progress',
    type: 'request',
    requester: 'Mike Chen',
    assignee: 'Alex Rodriguez',
    estimatedTime: 90,
    actualTime: 45,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    tags: ['software', 'installation', 'marketing']
  },
  {
    id: 'Q-003',
    title: 'Printer maintenance - Floor 3',
    description: 'Scheduled maintenance for HP LaserJet printers',
    priority: 'low',
    status: 'waiting',
    type: 'change',
    requester: 'System',
    estimatedTime: 60,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    tags: ['maintenance', 'printer', 'scheduled']
  },
  {
    id: 'Q-004',
    title: 'Email server performance degradation',
    description: 'Users experiencing slow email response times',
    priority: 'critical',
    status: 'waiting',
    type: 'problem',
    requester: 'IT Monitoring',
    estimatedTime: 180,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    tags: ['email', 'performance', 'server']
  }
]

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500'
}

const statusColors = {
  waiting: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  on_hold: 'bg-purple-500',
  resolved: 'bg-green-500'
}

const typeColors = {
  incident: 'bg-red-100 text-red-800',
  request: 'bg-blue-100 text-blue-800',
  change: 'bg-yellow-100 text-yellow-800',
  problem: 'bg-purple-100 text-purple-800'
}

export default function QueueManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filteredItems, setFilteredItems] = useState<QueueItem[]>(mockQueueItems)

  useEffect(() => {
    let filtered = mockQueueItems

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === filterPriority)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType)
    }

    setFilteredItems(filtered)
  }, [searchTerm, filterPriority, filterStatus, filterType])

  const handleAssignToMe = (itemId: string) => {
    // Mock assignment logic
    console.log('Assigning item to current user:', itemId)
  }

  const handleStartWork = (itemId: string) => {
    // Mock start work logic
    console.log('Starting work on item:', itemId)
  }

  const queueStats = {
    total: mockQueueItems.length,
    waiting: mockQueueItems.filter(item => item.status === 'waiting').length,
    inProgress: mockQueueItems.filter(item => item.status === 'in_progress').length,
    critical: mockQueueItems.filter(item => item.priority === 'critical').length,
    avgWaitTime: 45 // minutes
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Smart Queue Management</h1>
        <p className="text-muted-foreground mt-2">
          Intelligent work queue with priority-based assignment and load balancing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{queueStats.total}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-2xl font-bold text-orange-600">{queueStats.waiting}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{queueStats.inProgress}</p>
              </div>
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{queueStats.critical}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Wait</p>
                <p className="text-2xl font-bold">{queueStats.avgWaitTime}m</p>
              </div>
              <ClockIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search queue items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                  <SelectItem value="request">Request</SelectItem>
                  <SelectItem value="change">Change</SelectItem>
                  <SelectItem value="problem">Problem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="outline" className="font-mono">
                      {item.id}
                    </Badge>
                    <div className={cn("w-3 h-3 rounded-full", priorityColors[item.priority])} />
                    <Badge className={cn("text-xs", typeColors[item.type])}>
                      {item.type}
                    </Badge>
                    <Badge variant="secondary" className={cn("text-xs text-white", statusColors[item.status])}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-4">{item.description}</p>

                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>Requester: {item.requester}</span>
                    </div>
                    {item.assignee && (
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>Assigned: {item.assignee}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>Est: {item.estimatedTime}m</span>
                    </div>
                    <span>Created: {formatRelativeTime(item.createdAt)}</span>
                  </div>

                  {item.actualTime && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{item.actualTime}m / {item.estimatedTime}m</span>
                      </div>
                      <Progress value={(item.actualTime / item.estimatedTime) * 100} className="h-2" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  {!item.assignee && item.status === 'waiting' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleAssignToMe(item.id)}
                      className="whitespace-nowrap"
                    >
                      Assign to Me
                    </Button>
                  )}
                  {item.assignee && item.status === 'waiting' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStartWork(item.id)}
                      className="whitespace-nowrap"
                    >
                      Start Work
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    View Details
                    <ArrowRightIcon className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <FunnelIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No items found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}