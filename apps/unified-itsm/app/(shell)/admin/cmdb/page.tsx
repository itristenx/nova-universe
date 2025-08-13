"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function CMDBPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try { const r = await apiFetch<any>('/api/v1/cmdb/cis?search=' + encodeURIComponent(q)); setItems(r.data || []);} catch(e:any){ setError(e.message); }
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">CMDB</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2 flex-1" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search CIs…" />
        <button className="rounded px-3 py-2 border" onClick={load}>Search</button>
      </div>
      <ul className="divide-y rounded border">
        {items.map((ci:any)=> (
          <li key={ci.id} className="p-3">
            <div className="font-medium">{ci.displayName || ci.name}</div>
            <div className="text-sm opacity-80">{ci.ciType} · {ci.environment} · {ci.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}