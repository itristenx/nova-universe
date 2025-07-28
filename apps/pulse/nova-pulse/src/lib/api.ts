import axios from 'axios'
import type { Ticket, DashboardData, TimesheetEntry, TicketUpdate } from '../types'

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
