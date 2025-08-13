"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function OrgConfigPage() {
  const [org, setOrg] = useState<any>(null);
  const [dir, setDir] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{
    try {
      const [o, d] = await Promise.all([
        apiFetch('/api/v1/organizations/config'),
        apiFetch('/api/v1/directory/config')
      ]);
      setOrg(o); setDir(d);
    } catch(e:any){ setError(e.message); }
  })(); },[]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Organization & Directory Config</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="font-medium mb-2">Organization</div>
          <pre className="text-xs bg-black/5 p-2 rounded overflow-auto max-h-72">{JSON.stringify(org, null, 2)}</pre>
        </div>
        <div className="card">
          <div className="font-medium mb-2">Directory</div>
          <pre className="text-xs bg-black/5 p-2 rounded overflow-auto max-h-72">{JSON.stringify(dir, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}