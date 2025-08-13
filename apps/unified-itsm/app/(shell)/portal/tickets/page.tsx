"use client";
import { useEffect, useState } from 'react';
import { apiTry } from '../../../../lib/api';

export default function PortalTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const list = await apiTry<any[]>(['/api/v1/orbit/tickets','/api/tickets']);
      setTickets(list);
    } catch(e:any){ setError(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function submitTicket() {
    setError(null);
    try {
      await apiTry([ '/api/v1/orbit/tickets','/api/tickets' ], { method: 'POST', body: JSON.stringify({ title, description, priority: 'medium', category: 'general', requester_email: 'user@example.com' }) });
      setTitle(''); setDescription('');
      await load();
    } catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Tickets</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="rounded border p-4">
        <div className="font-medium mb-2">Submit a ticket</div>
        <div className="space-y-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Title" />
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Describe your issue" />
          <button className="rounded px-3 py-2 border" onClick={submitTicket}>Submit</button>
        </div>
      </div>
      <ul className="divide-y rounded border">
        {tickets.map((t:any)=> (
          <li key={t.id} className="p-3">
            <div className="font-medium">{t.title}</div>
            <div className="text-sm opacity-80">{t.priority} · {t.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}