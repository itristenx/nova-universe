"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function StatusPage() {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ setSummary(await apiFetch('/api/v1/status/summary')); }catch(e:any){ setError(e.message);} })(); },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Status</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="card">
        <div className="font-medium mb-2">Overall: {summary?.status || 'unknown'}</div>
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {(summary?.components || []).map((c:any)=> (
            <li key={c.id} className="rounded border p-3">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm opacity-80">{c.status}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}