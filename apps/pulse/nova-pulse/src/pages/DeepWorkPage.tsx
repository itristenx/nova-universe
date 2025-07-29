import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTickets, updateTicket, getAssetsForUser } from '../lib/api'

export const DeepWorkPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { data } = useQuery({ queryKey: ['ticket', ticketId], queryFn: () => getTickets({ ticketId }).then(t => t[0]), enabled: !!ticketId })
  const { data: assets = [] } = useQuery({
    queryKey: ['ticketAssets', data?.requestedBy.id],
    queryFn: () => getAssetsForUser(data!.requestedBy.id),
    enabled: !!data
  })
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
      {assets.length > 0 && (
        <div>
          <h3 className="font-semibold">Linked Assets</h3>
          <ul className="list-disc pl-5">
            {assets.map(a => (
              <li key={a.id}>{a.name} ({a.assetTag || 'n/a'})</li>
            ))}
          </ul>
        </div>
      )}
      <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border" />
      <button className="btn-primary" onClick={handleUpdate}>Add Note</button>
    </div>
  )
}
