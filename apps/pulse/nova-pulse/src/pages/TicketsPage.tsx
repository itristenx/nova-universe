import React from 'react'
import Sheet from '../components/system/Sheet'
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
  const [selected, setSelected] = React.useState<Ticket | null>(null)

  return (
    <div>
      <QueueSwitcher 
        queues={QUEUES} 
        currentQueue={queue} 
        onQueueChange={(q: string) => { setQueue(q); refetch() }} 
      />
      <TicketGrid 
        tickets={tickets} 
        onSelect={(t: Ticket) => {
          setSelected(t)
          // Keep route navigation for desktop; sheet for mobile
          if (window.innerWidth >= 768) navigate(`/tickets/${t.ticketId}`)
        }} 
      />
      {/* Pull-to-refresh wiring */}
      <RefreshWire onRefresh={refetch} />
      <Sheet isOpen={!!selected && window.innerWidth < 768} onClose={() => setSelected(null)} title={selected?.ticketId}>
        {selected && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{selected.title}</h2>
            <div className="text-sm text-gray-600">Status: {selected.status}</div>
            <div className="text-sm text-gray-600">Priority: {selected.priority}</div>
          </div>
        )}
      </Sheet>
    </div>
  )
}

function RefreshWire({ onRefresh }: { onRefresh: () => void }) {
  React.useEffect(() => {
    const handler = () => onRefresh()
    window.addEventListener('pulse:pull_to_refresh', handler)
    return () => window.removeEventListener('pulse:pull_to_refresh', handler)
  }, [onRefresh])
  return null
}
