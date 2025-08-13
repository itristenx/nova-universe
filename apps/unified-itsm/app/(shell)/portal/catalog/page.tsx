"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function CatalogPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ const r = await apiFetch<any>('/api/v1/catalog-items'); setItems(r.items||[]);}catch(e:any){ setError(e.message);} })(); },[]);

  async function request(item:any){ alert(`Requested: ${item.name}`); }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Service Catalog</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it:any)=> (
          <div key={it.id} className="card animate-scale-in">
            <div className="font-medium">{it.name}</div>
            <div className="text-sm opacity-80">{it.description}</div>
            <button className="mt-2 rounded px-3 py-2 border" onClick={()=>request(it)}>Request</button>
          </div>
        ))}
      </div>
    </div>
  );
}