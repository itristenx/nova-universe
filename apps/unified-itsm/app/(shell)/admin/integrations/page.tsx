"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function IntegrationsPage() {
  const [status, setStatus] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{
    try {
      const s: any = {};
      // Minimal health checks via monitoring and config endpoints
      s.monitoring = await apiFetch('/api/monitoring/health').catch(()=>({status:'unknown'}));
      s.org = await apiFetch('/api/v1/organizations/config').catch(()=>null);
      s.helpscout = await apiFetch('/api/helpscout/import', { method: 'POST', body: JSON.stringify({ apiKey: 'placeholder', mailboxId: 'placeholder' }) }).then(()=>({ ok:true })).catch(()=>({ ok:false }));
      s.scim = await apiFetch('/api/scim/monitor').catch(()=>({ ok:false }));
      setStatus(s);
    } catch(e:any){ setError(e.message); }
  })(); },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Integrations</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card"><div className="font-medium mb-2">Monitoring</div><pre className="text-xs bg-black/5 p-2 rounded">{JSON.stringify(status.monitoring,null,2)}</pre></div>
        <div className="card"><div className="font-medium mb-2">Org Config</div><pre className="text-xs bg-black/5 p-2 rounded">{JSON.stringify(status.org,null,2)}</pre></div>
        <div className="card"><div className="font-medium mb-2">HelpScout Import Test</div><div className="text-sm">{status.helpscout?.ok ? 'OK' : 'Unavailable'}</div></div>
        <div className="card"><div className="font-medium mb-2">SCIM Monitor</div><pre className="text-xs bg-black/5 p-2 rounded">{JSON.stringify(status.scim,null,2)}</pre></div>
      </div>
    </div>
  );
}