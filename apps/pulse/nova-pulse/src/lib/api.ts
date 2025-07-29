import axios from 'axios'
import type { Ticket, DashboardData, TimesheetEntry, TicketUpdate, Alert, Asset, XpEvent, LeaderboardEntry, TeamRanking } from '../types'

const client = axios.create({ baseURL: '/api/v1/pulse' })
const mailroomClient = axios.create({ baseURL: '/api/v1/mailroom' })

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

export const getAssetsForUser = async (userId: string) => {
  const { data } = await client.get<{ success: boolean; assets: Asset[] }>(`/inventory/user/${userId}`)
  return data.assets
}

export const postXpEvent = async (event: Partial<XpEvent>) => {
  const { data } = await client.post('/xp', event)
  return data
}

export const getXpLeaderboard = async () => {
  const { data } = await client.get<{ success: boolean; leaderboard: LeaderboardEntry[]; teams: TeamRanking[]; me: { xp: number } }>('/xp')
  return data
}

export const intakePackage = async (pkg: Record<string, any>) => {
  const { data } = await mailroomClient.post('/packages', pkg)
  return data
}

export const updatePackageStatus = async (id: number, status: string) => {
  const { data } = await mailroomClient.patch(`/packages/${id}/status`, { status })
  return data
}

export const assignProxyPickup = async (id: number, payload: Record<string, any>) => {
  const { data } = await mailroomClient.post(`/packages/${id}/assign-proxy`, payload)
  return data
}

export const bulkImportPackages = async (packages: Record<string, any>[]) => {
  const { data } = await mailroomClient.post('/packages/bulk', { packages })
  return data
}
