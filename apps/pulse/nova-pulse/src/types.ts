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

export interface Asset {
  id: number
  name: string
  type: string
  status?: string
}

export interface XpEvent {
  amount: number
  reason?: string
  createdAt: string
}
