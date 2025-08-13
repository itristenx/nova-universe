"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ const r = await apiFetch<{success:boolean, announcements:any[]}>('/announcements'); setItems(r.announcements||[]);}catch(e:any){ setError(e.message);} })(); },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Announcements</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <ul className="divide-y rounded border">
        {items.map((a:any)=> (
          <li key={a.id} className="p-3">
            <div className="font-medium">{a.title}</div>
            <div className="text-sm opacity-80">{a.level} · {new Date(a.createdAt).toLocaleString()}</div>
            <div className="mt-1">{a.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}