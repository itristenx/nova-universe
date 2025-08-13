"use client";
import { useEffect, useState } from 'react';
import { apiTry } from '../../../../lib/api';

export default function ApprovalsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ const r = await apiTry<any>(['/api/v1/orbit/approvals']); setItems(r.items||[]);}catch(e:any){ setError(e.message);} })(); },[]);

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
              <button className="rounded px-3 py-2 border">Approve</button>
              <button className="rounded px-3 py-2 border">Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}