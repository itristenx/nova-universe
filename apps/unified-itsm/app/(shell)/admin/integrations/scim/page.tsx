"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../../lib/api';

export default function ScimPage() {
  const [events, setEvents] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState('');

  async function load(){
    try{ setEvents(await apiFetch('/api/scim/monitor' + (type?`?type=${encodeURIComponent(type)}`:''))); }catch(e:any){ setError(e.message); }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">SCIM Monitor</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2" placeholder="Filter by type (eg. user.create)" value={type} onChange={e=>setType(e.target.value)} />
        <button className="rounded px-3 py-2 border" onClick={load}>Refresh</button>
      </div>
      <pre className="text-xs bg-black/5 p-3 rounded overflow-auto max-h-[70vh]">{JSON.stringify(events,null,2)}</pre>
    </div>
  );
}