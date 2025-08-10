import axios from 'axios'
import type { Ticket, DashboardData, TimesheetEntry, TicketUpdate, Alert, Asset, XpEvent, LeaderboardEntry, TeamRanking, TicketHistoryEntry, QueueMetrics, AgentAvailability, QueueAlert } from '../types'

const client = axios.create({ baseURL: '/api/v1/pulse' })

export const getDashboard = async () => {
  const { data } = await client.get<{ success: boolean; dashboard: DashboardData }>('/dashboard')
  return data.dashboard
}

export const getTickets = async (params?: Record<string, string | number>) => {
  const { data } = await client.get<{ success: boolean; tickets: Ticket[] }>('/tickets', { params })
  return data.tickets
}

export const updateTicket = async (ticketId: string, updates: TicketUpdate) => {
  const { data } = await client.put(`/tickets/${ticketId}/update`, updates)
  return data
}

export const getTimesheet = async (params?: Record<string, string>) => {
  const { data } = await client.get<{ success: boolean; timesheet: TimesheetEntry[] }>('/timesheet', { params })
  return data.timesheet
}

export const getAlerts = async (params?: Record<string, string>) => {
  const { data } = await client.get<{ success: boolean; alerts: Alert[] }>('/alerts', { params })
  return data.alerts
}

export const getInventory = async () => {
  const { data } = await client.get<{ success: boolean; assets: Asset[] }>('/inventory')
  return data.assets
}

// CMDB
export const cmdb = {
  listClasses: async () => {
    const { data } = await axios.get('/api/v1/cmdb/classes')
    return data.classes as Array<{ id: number; key: string; name: string }>
  },
  listItems: async (params?: { classKey?: string; q?: string; limit?: number; offset?: number }) => {
    const { data } = await axios.get('/api/v1/cmdb/items', { params })
    return data.items as Array<any>
  },
  getItem: async (id: number) => {
    const { data } = await axios.get(`/api/v1/cmdb/items/${id}`)
    return data.item as any
  },
  getGraph: async (rootId: number, depth = 2) => {
    const { data } = await axios.get('/api/v1/cmdb/graph', { params: { rootId, depth } })
    return data.graph as { nodes: any[]; edges: any[] }
  },
}

export const getAssetsForUser = async (userId: string) => {
  const { data } = await client.get<{ success: boolean; assets: Asset[] }>(`/inventory/user/${userId}`)
  return data.assets
}

export const getTicketHistory = async (ticketId: string) => {
  const { data } = await client.get<{ success: boolean; history: TicketHistoryEntry[] }>(`/tickets/${ticketId}/history`)
  return data.history
}

export const getRelatedItems = async (ticketId: string) => {
  const { data } = await client.get<{ success: boolean; tickets: Ticket[]; assets: Asset[] }>(`/tickets/${ticketId}/related`)
  return { tickets: data.tickets, assets: data.assets }
}

export const postXpEvent = async (event: Partial<XpEvent>) => {
  const { data } = await client.post('/xp', event)
  return data
}

export const getXpLeaderboard = async () => {
  const { data } = await client.get<{ success: boolean; leaderboard: LeaderboardEntry[]; teams: TeamRanking[]; me: { xp: number } }>('/xp')
  return data
}

// Queue metrics and agent availability functions
export const getQueueMetrics = async (queue?: string) => {
  const params = queue ? { queue } : {}
  const { data } = await client.get<{ success: boolean; metrics: QueueMetrics | QueueMetrics[] }>('/queues/metrics', { params })
  return data
}

export const getQueueAgents = async (queueName: string) => {
  const { data } = await client.get<{ success: boolean; agents: AgentAvailability[] }>(`/queues/${queueName}/agents`)
  return data.agents
}

export const toggleAgentAvailability = async (queueName: string, updates: { isAvailable?: boolean; status?: string; maxCapacity?: number }) => {
  const { data } = await client.post(`/queues/${queueName}/agents/availability`, updates)
  return data
}

export const getQueueAlerts = async (active = true) => {
  const { data } = await client.get<{ success: boolean; alerts: QueueAlert[] }>('/queues/alerts', { params: { active } })
  return data.alerts
}
