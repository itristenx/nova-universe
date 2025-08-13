"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function ConfigPage() {
  const [cfg, setCfg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ const r = await apiFetch('/api/v1/configuration'); setCfg(r.configuration);}catch(e:any){ setError(e.message);} })(); },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Configuration</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <pre className="text-xs bg-black/5 p-3 rounded overflow-auto max-h-[70vh]">{JSON.stringify(cfg, null, 2)}</pre>
    </div>
  );
}