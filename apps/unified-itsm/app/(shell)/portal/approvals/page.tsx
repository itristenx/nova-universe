"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function ApprovalsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load(){ try{ const r = await apiFetch('/api/v1/approvals/my'); setItems(r.items||[]);}catch(e:any){ setError(e.message);} }
  useEffect(()=>{ load(); },[]);

  async function act(id: string, action: 'approve'|'reject') {
    try { await apiFetch(`/api/v1/approvals/${id}/action`, { method:'POST', body: JSON.stringify({ action }) }); await load(); } catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Approvals</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <ul className="divide-y rounded border">
        {items.map((a:any)=> (
          <li key={a.id} className="p-3">
            <div className="font-medium">{a.title || a.requestId}</div>
            <div className="text-sm opacity-80">{a.status}</div>
            <div className="flex gap-2 mt-2">
              <button className="rounded px-3 py-2 border" onClick={()=>act(a.id,'approve')}>Approve</button>
              <button className="rounded px-3 py-2 border" onClick={()=>act(a.id,'reject')}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}