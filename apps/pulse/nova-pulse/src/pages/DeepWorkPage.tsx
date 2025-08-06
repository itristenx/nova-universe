import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTickets, updateTicket, getAssetsForUser, getTicketHistory, getRelatedItems } from '../lib/api'
import type { TicketHistoryEntry } from '../types'
import { CosmoAssistant } from '../components/CosmoAssistant'

export const DeepWorkPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { ticketId } = useParams<{ ticketId: string }>()
  const [activeTab, setActiveTab] = useState<'timeline' | 'related' | 'assets'>('timeline')
  
  const { data, refetch } = useQuery({ queryKey: ['ticket', ticketId], queryFn: () => getTickets({ ticketId }).then(t => t[0]), enabled: !!ticketId })
  const { data: assets = [] } = useQuery({
    queryKey: ['ticketAssets', data?.requestedBy.id],
    queryFn: () => getAssetsForUser(data!.requestedBy.id),
    enabled: !!data
  })
  const { data: history = [] } = useQuery({
    queryKey: ['ticketHistory', ticketId],
    queryFn: () => getTicketHistory(ticketId!),
    enabled: !!ticketId
  })
  const { data: related } = useQuery({
    queryKey: ['ticketRelated', ticketId],
    queryFn: () => getRelatedItems(ticketId!),
    enabled: !!ticketId
  })
  const [note, setNote] = React.useState('')
  const [status, setStatus] = React.useState<string>()

  if (!data) return <div>Loading...</div>

  React.useEffect(() => {
    setStatus(data.status)
  }, [data.status])

  const handleUpdate = async () => {
    await updateTicket(ticketId!, { workNote: note })
    setNote('')
    refetch()
    queryClient.invalidateQueries({ queryKey: ['ticketHistory', ticketId] })
  }

  const handleStatusSave = async () => {
    if (!status || status === data.status) return
    await updateTicket(ticketId!, { status })
    refetch()
    queryClient.invalidateQueries({ queryKey: ['ticketHistory', ticketId] })
  }

  const toggleSla = async () => {
    const newStatus = data.status === 'on_hold' ? 'in_progress' : 'on_hold'
    await updateTicket(ticketId!, { status: newStatus })
    refetch()
    queryClient.invalidateQueries({ queryKey: ['ticketHistory', ticketId] })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{data.title}</h2>
      <div className="flex items-center gap-2">
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1">
          {['open', 'in_progress', 'on_hold', 'resolved', 'closed'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button 
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleStatusSave}
        >
          Save
        </button>
        <button 
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={toggleSla}
        >
          {data.status === 'on_hold' ? 'Resume SLA' : 'Pause SLA'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <h3 className="font-semibold mb-1">Requestor</h3>
          <p>{data.requestedBy.name}</p>
          <p className="text-sm text-muted-foreground">{data.requestedBy.email}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Linked Assets</h3>
          {assets.length === 0 ? <p className="text-sm text-muted-foreground">None</p> : (
            <ul className="list-disc pl-5 text-sm">
              {assets.map(a => (
                <li key={a.id}>{a.name} ({a.assetTag || 'n/a'})</li>
              ))}
            </ul>
          )}
        </div>
        <CosmoAssistant />
      </div>

      <div className="border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" role="tablist">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('timeline')}
              role="tab"
              aria-selected={activeTab === 'timeline'}
            >
              Timeline
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'related' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('related')}
              role="tab"
              aria-selected={activeTab === 'related'}
            >
              Related
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assets' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('assets')}
              role="tab"
              aria-selected={activeTab === 'assets'}
            >
              Assets
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'timeline' && (
            <div role="tabpanel">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {history.map((h: TicketHistoryEntry, i: number) => (
                  <li key={i}>{new Date(h.timestamp).toLocaleString()} - {h.user}: {h.action} {h.details ? `- ${h.details}` : ''}</li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === 'related' && (
            <div role="tabpanel" className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">Related Tickets</h4>
                <ul className="list-disc pl-5">
                  {(related?.tickets || []).map(t => (
                    <li key={t.ticketId}>{t.title} ({t.status})</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Org Assets</h4>
                <ul className="list-disc pl-5">
                  {(related?.assets || []).map(a => (
                    <li key={a.id}>{a.name} ({a.assetTag || 'n/a'})</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'assets' && (
            <div role="tabpanel">
              <ul className="list-disc pl-5 text-sm">
                {assets.map(a => (
                  <li key={a.id}>{a.name} ({a.assetTag || 'n/a'})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border" />
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleUpdate}
      >
        Add Note
      </button>
    </div>
  )
}
