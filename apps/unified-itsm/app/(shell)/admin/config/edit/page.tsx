"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../../lib/api';

export default function ConfigEditPage() {
  const [cfg, setCfg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ (async()=>{ try{ const r = await apiFetch('/api/v1/configuration'); setCfg(r.configuration);}catch(e:any){ setError(e.message);} })(); },[]);

  async function save(key: string, value: any) {
    setSaving(true); setError(null);
    try { await apiFetch(`/api/v1/configuration/${encodeURIComponent(key)}`, { method:'PUT', body: JSON.stringify({ value }) }); alert('Saved'); } catch(e:any){ setError(e.message); } finally { setSaving(false); }
  }

  if (!cfg) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Edit Configuration</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.keys(cfg.application || {}).map((k)=> (
          <div key={k} className="card">
            <div className="font-medium mb-2">application.{k}</div>
            <input className="border rounded px-2 py-1 w-full" defaultValue={String(cfg.application[k])} onBlur={(e)=>save(`application.${k}`, e.target.value)} disabled={saving} />
          </div>
        ))}
        {Object.keys(cfg.features || {}).map((k)=> (
          <div key={k} className="card">
            <div className="font-medium mb-2">features.{k}</div>
            <select className="border rounded px-2 py-1 w-full" defaultValue={String(cfg.features[k])} onChange={(e)=>save(`features.${k}`, e.target.value === 'true')} disabled={saving}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}