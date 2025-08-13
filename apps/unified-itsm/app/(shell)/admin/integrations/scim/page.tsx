"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../../lib/api';

export default function ScimPage() {
  const [events, setEvents] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ setEvents(await apiFetch('/api/scim/monitor')); }catch(e:any){ setError(e.message);} })(); },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">SCIM Monitor</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <pre className="text-xs bg-black/5 p-3 rounded overflow-auto max-h-[70vh]">{JSON.stringify(events,null,2)}</pre>
    </div>
  );
}