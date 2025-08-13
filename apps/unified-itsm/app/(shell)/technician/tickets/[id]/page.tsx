"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiTry } from '../../../../../lib/api';

export default function TicketDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [ticket, setTicket] = useState<any>(null);
  const [status, setStatus] = useState('in_progress');
  const [error, setError] = useState<string | null>(null);

  async function load(){ try{ setTicket(await apiTry([`/api/v1/pulse/tickets/${id}`,`/api/tickets/${id}`])); }catch(e:any){ setError(e.message);} }

  async function update(){ setError(null); try{ const t = await apiTry([`/api/v1/pulse/tickets/${id}`,`/api/tickets/${id}`], { method:'PATCH', body: JSON.stringify({ status })}); setTicket(t);}catch(e:any){ setError(e.message);} }

  async function addComment(){ setError(null); try{ await apiTry([`/api/v1/pulse/tickets/${id}/comments`, `/api/tickets/${id}/comments`], { method:'POST', body: JSON.stringify({ content: 'Acknowledged', type: 'internal' })}); await load(); }catch(e:any){ setError(e.message);} }

  useEffect(()=>{ if(id) load(); }, [id]);

  if(!ticket) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{ticket.title}</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="text-sm opacity-80">{ticket.priority} · {ticket.status}</div>
      <div className="card">
        <div className="font-medium mb-2">Update Status</div>
        <div className="flex gap-2">
          <select className="border rounded px-2 py-1" value={status} onChange={e=>setStatus(e.target.value)}>
            <option>open</option>
            <option>in_progress</option>
            <option>resolved</option>
            <option>closed</option>
          </select>
          <button className="rounded px-3 py-2 border" onClick={update}>Save</button>
          <button className="rounded px-3 py-2 border" onClick={addComment}>Add Comment</button>
        </div>
      </div>
      <div className="card">
        <div className="font-medium mb-2">Description</div>
        <div>{ticket.description}</div>
      </div>
    </div>
  );
}