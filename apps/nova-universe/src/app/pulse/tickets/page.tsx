'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  TicketIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeTime } from '@/lib/utils'

interface Ticket {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'in-progress' | 'waiting' | 'resolved' | 'closed'
  category: string
  customer: {
    name: string
    email: string
    avatar?: string
  }
  assignee?: {
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  dueDate?: string
  slaStatus: 'ok' | 'warning' | 'breach'
  tags: string[]
  timeSpent?: number
  estimatedTime?: number
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Email server not responding',
    description: 'Users unable to send or receive emails since this morning',
    priority: 'high',
    status: 'in-progress',
    category: 'Infrastructure',
    customer: {
      name: 'John Smith',
      email: 'john.smith@company.com',
    },
    assignee: {
      name: 'Current User',
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'warning',
    tags: ['email', 'critical-system'],
    timeSpent: 45,
    estimatedTime: 120,
  },
  {
    id: 'TKT-002',
    title: 'Password reset request',
    description: 'User locked out of account and needs password reset',
    priority: 'medium',
    status: 'new',
    category: 'Access Management',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
    },
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'ok',
    tags: ['password', 'access'],
    estimatedTime: 30,
  },
  {
    id: 'TKT-003',
    title: 'Software installation help',
    description: 'Need assistance installing new design software',
    priority: 'low',
    status: 'waiting',
    category: 'Software',
    customer: {
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
    },
    assignee: {
      name: 'Current User',
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'ok',
    tags: ['software', 'installation'],
    timeSpent: 15,
    estimatedTime: 60,
  },
]

export default function TicketsPage() {
  const searchParams = useSearchParams()
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>(mockTickets)
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'all' | 'assigned' | 'unassigned'>('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const filterTickets = () => {
      let filtered = tickets

      // Search filter
      if (searchQuery) {
        filtered = filtered.filter(ticket =>
          ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }

      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(ticket => ticket.status === statusFilter)
      }

      // Priority filter
      if (priorityFilter !== 'all') {
        filtered = filtered.filter(ticket => ticket.priority === priorityFilter)
      }

      // View mode filter
      if (viewMode === 'assigned') {
        filtered = filtered.filter(ticket => ticket.assignee)
      } else if (viewMode === 'unassigned') {
        filtered = filtered.filter(ticket => !ticket.assignee)
      }

      setFilteredTickets(filtered)
    }

    filterTickets()
  }, [tickets, searchQuery, statusFilter, priorityFilter, viewMode])

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-blue-600 bg-blue-100 border-blue-200',
      medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      high: 'text-orange-600 bg-orange-100 border-orange-200',
      critical: 'text-red-600 bg-red-100 border-red-200',
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

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

  const getSlaStatusColor = (slaStatus: string) => {
    if (slaStatus === 'breach') return 'text-red-500'
    if (slaStatus === 'warning') return 'text-orange-500'
    return 'text-green-500'
  }

  const handleTicketAction = (ticketId: string, action: string) => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setTickets(prevTickets =>
        prevTickets.map(ticket => {
          if (ticket.id === ticketId) {
            switch (action) {
              case 'take':
                return {
                  ...ticket,
                  assignee: { name: 'Current User' },
                  status: 'in-progress' as const,
                  updatedAt: new Date().toISOString(),
                }
              case 'start':
                return {
                  ...ticket,
                  status: 'in-progress' as const,
                  updatedAt: new Date().toISOString(),
                }
              case 'pause':
                return {
                  ...ticket,
                  status: 'waiting' as const,
                  updatedAt: new Date().toISOString(),
                }
              case 'resolve':
                return {
                  ...ticket,
                  status: 'resolved' as const,
                  updatedAt: new Date().toISOString(),
                }
              default:
                return ticket
            }
          }
          return ticket
        })
      )
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track support tickets
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <TicketIcon className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription>
                Filter and search through your tickets
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tickets, customers, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Tickets ({filteredTickets.length})</TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned ({tickets.filter(t => t.assignee).length})
          </TabsTrigger>
          <TabsTrigger value="unassigned">
            Unassigned ({tickets.filter(t => !t.assignee).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <TicketList 
            tickets={filteredTickets} 
            onAction={handleTicketAction}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <TicketList 
            tickets={filteredTickets.filter(t => t.assignee)} 
            onAction={handleTicketAction}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="unassigned" className="space-y-4">
          <TicketList 
            tickets={filteredTickets.filter(t => !t.assignee)} 
            onAction={handleTicketAction}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TicketListProps {
  tickets: Ticket[]
  onAction: (ticketId: string, action: string) => void
  isLoading: boolean
}

function TicketList({ tickets, onAction, isLoading }: TicketListProps) {
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-blue-600 bg-blue-100 border-blue-200',
      medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      high: 'text-orange-600 bg-orange-100 border-orange-200',
      critical: 'text-red-600 bg-red-100 border-red-200',
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

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

  const getSlaStatusColor = (slaStatus: string) => {
    if (slaStatus === 'breach') return 'text-red-500'
    if (slaStatus === 'warning') return 'text-orange-500'
    return 'text-green-500'
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <TicketIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tickets found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search criteria
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-medium text-primary">
                    {ticket.id}
                  </span>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('-', ' ')}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className={`w-4 h-4 ${getSlaStatusColor(ticket.slaStatus)}`} />
                    <span className={`text-xs ${getSlaStatusColor(ticket.slaStatus)}`}>
                      {ticket.slaStatus === 'breach' ? 'SLA Breach' :
                       ticket.slaStatus === 'warning' ? 'SLA Warning' : 'On Time'}
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="font-medium text-lg mb-1">{ticket.title}</h3>
                  <p className="text-muted-foreground text-sm">{ticket.description}</p>
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-3 h-3" />
                      <span>{ticket.customer.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatRelativeTime(ticket.createdAt)}</span>
                    </div>
                    {ticket.assignee && (
                      <div>
                        Assigned to {ticket.assignee.name}
                      </div>
                    )}
                  </div>
                  
                  {ticket.timeSpent && (
                    <div className="flex items-center space-x-2">
                      <span>Time: {ticket.timeSpent}m</span>
                      {ticket.estimatedTime && (
                        <span>/ {ticket.estimatedTime}m</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {ticket.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {ticket.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {!ticket.assignee && (
                  <Button
                    size="sm"
                    onClick={() => onAction(ticket.id, 'take')}
                    disabled={isLoading}
                  >
                    Take Ticket
                  </Button>
                )}
                
                {ticket.status === 'new' && ticket.assignee && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(ticket.id, 'start')}
                    disabled={isLoading}
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                )}
                
                {ticket.status === 'in-progress' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAction(ticket.id, 'pause')}
                      disabled={isLoading}
                    >
                      <PauseIcon className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAction(ticket.id, 'resolve')}
                      disabled={isLoading}
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Ticket</DropdownMenuItem>
                    <DropdownMenuItem>Add Note</DropdownMenuItem>
                    <DropdownMenuItem>Log Time</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Close Ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}