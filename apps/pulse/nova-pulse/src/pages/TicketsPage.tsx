import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getTickets } from '../lib/api'
import { TicketGrid } from '../components/TicketGrid.tsx'
import { QueueSwitcher } from '../components/QueueSwitcher'
import type { Ticket } from '../types'

const QUEUES = ['HR', 'IT', 'Operations', 'Cyber']

export const TicketsPage: React.FC = () => {
  const [queue, setQueue] = React.useState(QUEUES[0])
  const { data: tickets = [], refetch } = useQuery({ 
    queryKey: ['tickets', queue], 
    queryFn: () => getTickets({ queue }) 
  })
  const navigate = useNavigate()

  return (
    <div>
      <QueueSwitcher 
        queues={QUEUES} 
        currentQueue={queue} 
        onQueueChange={(q: string) => { setQueue(q); refetch() }} 
      />
      <TicketGrid 
        tickets={tickets} 
        onSelect={(t: Ticket) => navigate(`/tickets/${t.ticketId}`)} 
      />
    </div>
  )
}
