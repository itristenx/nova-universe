"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

function uuidv4() {
  return (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) ||
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

export default function CatalogPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ const r = await apiFetch<any>('/api/v1/catalog-items'); setItems(r.items||r||[]);}catch(e:any){ setError(e.message);} })(); },[]);

  async function request(item:any){
    setMessage(null); setError(null);
    try {
      // create a request context id
      const reqId = uuidv4();
      const r:any = await apiFetch(`/api/v1/orbit/catalog/${item.id}`, { method:'POST', body: JSON.stringify({ reqId }) });
      setMessage(`Request submitted. RITM ${r.ritmId || 'created'}`);
    } catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Service Catalog</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it:any)=> (
          <div key={it.id} className="card animate-scale-in">
            <div className="font-medium">{it.name}</div>
            <div className="text-sm opacity-80">{it.description || 'Standard request'}</div>
            <button className="mt-2 rounded px-3 py-2 border" onClick={()=>request(it)}>Request</button>
          </div>
        ))}
      </div>
    </div>
  );
}