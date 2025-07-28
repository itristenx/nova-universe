import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTickets, updateTicket } from '../lib/api'

export const DeepWorkPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { data } = useQuery({ queryKey: { key: 'ticket', ticketId }, queryFn: () => getTickets({ ticketId }).then(t => t[0]), enabled: !!ticketId })
  const [note, setNote] = React.useState('')

  if (!data) return <div>Loading...</div>

  const handleUpdate = async () => {
    await updateTicket(ticketId!, { workNote: note })
    setNote('')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{data.title}</h2>
      <p>Status: {data.status}</p>
      <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border" />
      <button className="btn-primary" onClick={handleUpdate}>Add Note</button>
    </div>
  )
}
