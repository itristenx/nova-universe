"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    (async()=>{
      try { setData(await apiFetch('/api/analytics/dashboard')); } catch(e:any){ setError(e.message); }
    })();
  },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Analytics</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <pre className="text-xs bg-black/5 p-3 rounded overflow-auto max-h-[60vh]">{JSON.stringify(data,null,2)}</pre>
    </div>
  );
}