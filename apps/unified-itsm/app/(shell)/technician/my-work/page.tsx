"use client";
import { useEffect, useState } from 'react';
import { apiTry } from '../../../../lib/api';

function SlaBadge({ ticket }: { ticket: any }) {
  const due = ticket.dueDate || ticket.due_date;
  if (!due) return null;
  const ms = new Date(due).getTime() - Date.now();
  const hours = Math.round(ms / 36e5);
  const critical = ms < 0 || hours <= 0;
  const warn = hours <= 4;
  const cls = critical ? 'bg-red-600' : warn ? 'bg-yellow-500' : 'bg-green-600';
  return <span className={`text-xs text-white ${cls} rounded px-2 py-0.5`}>{critical ? 'SLA Breached' : `SLA ${hours}h`}</span>;
}

export default function MyWorkPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async ()=>{
      try {
        const list = await apiTry<any[]>(['/api/v1/pulse/tickets','/api/tickets']);
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
          <li key={t.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="text-sm opacity-80">{t.priority} · {t.status}</div>
            </div>
            <SlaBadge ticket={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}