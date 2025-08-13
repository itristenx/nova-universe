"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function InventoryPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { (async()=>{ try{ const r = await apiFetch<{success:boolean, assets:any[]}>('/api/v1/inventory'); setAssets(r.assets||[]);}catch(e:any){setError(e.message);} })(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Inventory</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <ul className="divide-y rounded border">
        {assets.map((a:any)=>(
          <li key={a.id} className="p-3">
            <div className="font-medium">{a.asset_tag}</div>
            <div className="text-sm opacity-80">{a.model} · {a.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}