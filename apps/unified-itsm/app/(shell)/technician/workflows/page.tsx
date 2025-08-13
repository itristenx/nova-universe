"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function WorkflowsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [workflow, setWorkflow] = useState('example');
  const [error, setError] = useState<string | null>(null);

  async function trigger() {
    setError(null);
    try { await apiFetch('/api/workflows/trigger', { method: 'POST', body: JSON.stringify({ workflow }) }); await load(); } catch(e:any){ setError(e.message); }
  }

  async function load() {
    try { const s = await apiFetch<any>('/api/workflows/status'); setRuns(s); } catch(e:any){ setError(e.message); }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Workflows & Runbooks</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2" value={workflow} onChange={e=>setWorkflow(e.target.value)} />
        <button className="rounded px-3 py-2 border" onClick={trigger}>Trigger</button>
      </div>
      <ul className="divide-y rounded border">
        {runs.map((r:any, i:number)=> (
          <li key={i} className="p-3">
            <div className="font-medium">{r.workflow}</div>
            <div className="text-sm opacity-80">{r.timestamp}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}