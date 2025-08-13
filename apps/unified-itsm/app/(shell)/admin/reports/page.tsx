"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

function Bar({ value, max, label }: { value: number, max: number, label: string }) {
  const width = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1"><span>{label}</span><span>{value}</span></div>
      <div className="h-2 bg-black/10 rounded">
        <div className="h-2 bg-blue-600 rounded" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ setData(await apiFetch('/api/analytics/dashboard')); }catch(e:any){ setError(e.message);} })(); },[]);

  if (!data) return <div>Loading…</div>;

  const total = Number(data?.summary?.totalTickets || 0);
  const open = Number(data?.summary?.openTickets || 0);
  const resolved = Number(data?.summary?.resolvedTickets || 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Reports</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="font-medium mb-2">Ticket Summary</div>
          <Bar label="Total" value={total} max={total} />
          <Bar label="Open" value={open} max={total} />
          <Bar label="Resolved" value={resolved} max={total} />
        </div>
        <div className="card">
          <div className="font-medium mb-2">Performance</div>
          <div className="text-sm">Avg Response Time: {data?.performance?.avgResponseTime ?? '-'} ms</div>
          <div className="text-sm">Error Rate: {data?.performance?.errorRate ?? '-'} %</div>
        </div>
      </div>
      <div className="card">
        <div className="font-medium mb-2">Daily Tickets</div>
        <div className="grid grid-cols-12 gap-1 items-end h-24">
          {(data?.trends?.dailyTickets || []).map((d:any, i:number)=>{
            const v = Number(d.tickets || 0);
            const max = Math.max(1, ...(data?.trends?.dailyTickets || []).map((x:any)=> Number(x.tickets||0)));
            const h = Math.round((v / max) * 100);
            return <div key={i} className="bg-blue-500 rounded" style={{ height: `${h}%` }} title={`${d.date}: ${v}`} />;
          })}
        </div>
      </div>
    </div>
  );
}