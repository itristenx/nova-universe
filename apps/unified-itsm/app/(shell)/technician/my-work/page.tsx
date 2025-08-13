"use client";
import { useEffect, useRef, useState } from 'react';
import { apiTry } from '../../../../lib/api';
import Chart from 'chart.js/auto';

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
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(()=>{ (async()=>{
    try{ const r:any = await apiTry(['/api/v1/pulse/tickets','/api/tickets']); setTickets(r.items||r||[]);}catch(e:any){ setError(e.message);} })(); },[]);

  useEffect(()=>{
    const ctx = chartRef.current?.getContext('2d');
    let chart:any;
    if (ctx) {
      chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Open','In Progress','Resolved'],
          datasets: [{ data: [
            tickets.filter(t=>t.status==='open').length,
            tickets.filter(t=>t.status==='in_progress').length,
            tickets.filter(t=>t.status==='resolved').length
          ], backgroundColor: ['#ef4444','#f59e0b','#10b981'] }]
        }
      });
    }
    return ()=>{ chart?.destroy?.(); };
  },[tickets]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Work</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="rounded border p-3">
        <div className="text-sm opacity-70 mb-2">Ticket Mix</div>
        <canvas ref={chartRef} height={120} />
      </div>
      <ul className="divide-y rounded border">
        {tickets.map((t:any)=> (
          <li key={t.id} className="p-3">
            <div className="font-medium">{t.title || t.id}</div>
            <div className="text-sm opacity-80">{t.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}