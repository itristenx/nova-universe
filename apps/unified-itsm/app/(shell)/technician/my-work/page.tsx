"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function MyWorkPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async ()=>{
      try {
        const list = await apiFetch<any[]>('/api/tickets');
        setTickets(list);
      } catch(e:any) { setError(e.message); }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Work</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
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