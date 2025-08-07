export interface Ticket {
  id: number
  ticketId: string
  title: string
  priority: string
  status: string
  category?: string
  subcategory?: string
  requestedBy: { id: number; name: string }
  assignedTo?: { id: number; name: string }
  createdAt: string
  updatedAt: string
  dueDate?: string
  slaRemaining?: number
  vipWeight?: number
}

export interface TicketUpdate extends Partial<Ticket> {
  workNote?: string
  timeSpent?: number
}

export interface DashboardData {
  myTickets: {
    total: number
    open: number
    inProgress: number
    resolved: number
  }
  todayStats: {
    ticketsResolved: number
    avgResolutionTime: number
    totalTimeLogged: number
  }
  upcomingTasks: Ticket[]
  recentActivity: { ticketId: string; action: string; timestamp: string }[]
}

export interface TimesheetEntry {
  ticketId: string
  title: string
  timeSpent: number
  date: string
}

export interface Alert {
  id: string
  message: string
  createdAt: string
}

export interface QueueMetrics {
  id: string
  queueName: string
  totalAgents: number
  availableAgents: number
  totalTickets: number
  openTickets: number
  avgResponseTime: number
  avgResolutionTime: number
  slaBreaches: number
  highPriorityTickets: number
  capacityUtilization: number
  averageWaitTime: number
  thresholdWarning: boolean
  thresholdCritical: boolean
  lastCalculated: string
}

export interface AgentAvailability {
  id: string
  userId: string
  queueName: string
  isAvailable: boolean
  maxCapacity: number
  currentLoad: number
  status: string
  lastUpdated: string
  createdAt: string
  user?: {
    name: string
    email: string
    department: string
  }
  currentTickets?: number
}

export interface QueueAlert {
  id: string
  queueName: string
  alertType: string
  message: string
  isActive: boolean
  alertedAt: string
  resolvedAt?: string
  notifiedUsers: string[]
}

export interface Asset {
  id: number
  name: string
  type: string
  assetTag?: string
  serialNumber?: string
  model?: string
  status?: string
}

export interface TicketHistoryEntry {
  action: string
  details?: string
  timestamp: string
  user: string
}

export interface XpEvent {
  amount: number
  reason?: string
  createdAt: string
}

export interface LeaderboardEntry {
  userId: string
  name: string
  department?: string
  xpTotal: number
}

export interface TeamRanking {
  team: string | null
  xpTotal: number
}
