import axios from 'axios'
import type { Ticket, DashboardData, TimesheetEntry, TicketUpdate, Alert, Asset, XpEvent, LeaderboardEntry, TeamRanking, TicketHistoryEntry, QueueMetrics, AgentAvailability, QueueAlert } from '../types'

const client = axios.create({ baseURL: '/api/v1/pulse' })

export const _getDashboard = async () => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function dashboard: DashboardData }>('/dashboard')
  return data.dashboard
}

export const _getTickets = async (params?: Record<string, string | number>) => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function tickets: Ticket[] }>('/tickets', { params })
  return data.tickets
}

export const _updateTicket = async (ticketId: string, updates: TicketUpdate) => {
  const { data } = await client.put(`/tickets/${ticketId}/update`, updates)
  return data
}

export const _getTimesheet = async (params?: Record<string, string>) => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function timesheet: TimesheetEntry[] }>('/timesheet', { params })
  return data.timesheet
}

export const _getAlerts = async (params?: Record<string, string>) => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function alerts: Alert[] }>('/alerts', { params })
  return data.alerts
}

export const _getInventory = async () => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function assets: Asset[] }>('/inventory')
  return data.assets
}

export const _getAssetsForUser = async (userId: string) => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function assets: Asset[] }>(`/inventory/user/${userId}`)
  return data.assets
}

export const _getTicketHistory = async (ticketId: string) => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function history: TicketHistoryEntry[] }>(`/tickets/${ticketId}/history`)
  return data.history
}

export const _getRelatedItems = async (ticketId: string) => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function tickets: Ticket[]; assets: Asset[] }>(`/tickets/${ticketId}/related`)
  return { tickets: data.tickets, assets: data.assets }
}

export const _postXpEvent = async (event: Partial<XpEvent>) => {
  const { data } = await client.post('/xp', event)
  return data
}

export const _getXpLeaderboard = async () => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function leaderboard: LeaderboardEntry[]; teams: TeamRanking[]; me: { xp: number } }>('/xp')
  return data
}

// Queue metrics and agent availability functions
export const __getQueueMetrics = async (queue?: string) => {
  const params = queue ? { queue } : {}
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function metrics: QueueMetrics | QueueMetrics[] }>('/queues/metrics', { params })
  return data
}

export const _getQueueAgents = async (queueName: string) => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function agents: AgentAvailability[] }>(`/queues/${queueName}/agents`)
  return data.agents
}

export const _toggleAgentAvailability = async (queueName: string, updates: { isAvailable?: boolean; status?: string; maxCapacity?: number }) => {
  const { data } = await client.post(`/queues/${queueName}/agents/availability`, updates)
  return data
}

export const _getQueueAlerts = async (active = true) => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function alerts: QueueAlert[] }>('/queues/alerts', { params: { active } })
  return data.alerts
}

// CMDB API functions
export const __getCmdbItems = async (params?: Record<string, string | number>) => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[]; pagination: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types }>('/cmdb', { params })
  return data
}

export const _getCiTypes = async () => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[] }>('/cmdb/types')
  return data.data
}

export const _createCi = async (ciData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
  const { data } = await client.post('/cmdb', ciData)
  return data
}

export const _updateCi = async (id: string, ciData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
  const { data } = await client.put(`/cmdb/${id}`, ciData)
  return data
}

export const _deleteCi = async (id: string) => {
  const { data } = await client.delete(`/cmdb/${id}`)
  return data
}

export const _getCmdbHealth = async () => {
  const { data } = await client.get<{ success: boolean; // TODO-LINT: move to async function data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types }>('/cmdb/health')
  return data.data
}
