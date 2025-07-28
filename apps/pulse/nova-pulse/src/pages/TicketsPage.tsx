import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getTickets } from '../lib/api'
import { TicketGrid } from '../components/TicketGrid'
import { QueueSwitcher } from '../components/QueueSwitcher'

const QUEUES = ['HR', 'IT', 'Operations', 'Cyber']

export const TicketsPage: React.FC = () => {
  const [queue, setQueue] = React.useState(QUEUES[0])
  const navigate = useNavigate()
  const { data: tickets = [], refetch } = useQuery(['tickets', queue], () => getTickets({ queue }))

  return (
    <div>
      <QueueSwitcher queues={QUEUES} value={queue} onChange={q => { setQueue(q); refetch() }} />
      <TicketGrid tickets={tickets} onSelect={t => navigate(`/tickets/${t.ticketId}`)} />
    </div>
  )
}
