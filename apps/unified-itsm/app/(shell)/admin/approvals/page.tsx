"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function AdminApprovalsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any|null>(null);
  const [newApprover, setNewApprover] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set('q', q);
      if (status) qs.set('status', status);
      const r:any = await apiFetch('/api/v1/approvals' + (qs.toString()?`?${qs.toString()}`:''));
      setItems(Array.isArray(r) ? r : (r.items || []));
    } catch (e:any) { setError(e.message); }
  }
  useEffect(()=>{ load(); },[]);

  async function openHistory(id:string){
    setHistory([]); setMessage(null); setError(null);
    try { const r:any = await apiFetch(`/api/v1/approvals/${id}/history`); setHistory(r.items||[]); } catch(e:any){ setError(e.message); }
  }

  async function reassign(id:string){
    setMessage(null); setError(null);
    try { await apiFetch(`/api/v1/approvals/${id}/reassign`, { method:'PUT', body: JSON.stringify({ approverUserId: newApprover }) }); setMessage('Approval rerouted'); setNewApprover(''); await load(); } catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Admin: Approvals Management</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}
      <div className="flex flex-wrap gap-2">
        <input className="border rounded px-3 py-2" placeholder="Search title" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="border rounded px-3 py-2" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="rounded px-3 py-2 border" onClick={load}>Search</button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="font-medium mb-2">Approvals</div>
          <ul className="divide-y rounded border">
            {items.map((a:any)=> (
              <li key={a.id} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.title || a.requestId}</div>
                    <div className="text-sm opacity-80">{a.status}</div>
                  </div>
                  <button className="text-sm underline" onClick={()=>{ setSelected(a); openHistory(a.id); }}>History</button>
                </div>
                <div className="flex gap-2">
                  <input className="border rounded px-3 py-2 flex-1" placeholder="New approver user id" value={newApprover} onChange={e=>setNewApprover(e.target.value)} />
                  <button className="rounded px-3 py-2 border" onClick={()=>reassign(a.id)}>Reroute</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">History{selected ? `: ${selected.title||selected.id}`: ''}</div>
          <div className="rounded border p-3 space-y-2 max-h-[480px] overflow-auto">
            {history.length === 0 && <div className="text-sm opacity-70">Select an approval to view audit trail.</div>}
            {history.map((h:any, idx:number)=> (
              <div key={idx} className="text-sm">
                <div className="font-mono opacity-70">{h.timestamp}</div>
                <div className="font-medium">{h.action}</div>
                <pre className="whitespace-pre-wrap break-words text-xs opacity-90">{JSON.stringify(h.details || h, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}