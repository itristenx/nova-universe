"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function AdminDashboard() {
  const [health, setHealth] = useState<any>(null);
  const [server, setServer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [h, s] = await Promise.all([
          apiFetch('/api/monitoring/health').catch(() => ({ status: 'degraded' })),
          apiFetch('/api/v1/server-info').catch(() => ({ apiName: 'Nova Platform API' }))
        ]);
        setHealth(h);
        setServer(s);
      } catch (e: any) {
        setError(e.message || 'Failed to load dashboard');
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <div className="font-medium mb-2">System Health</div>
          <div className="text-sm opacity-80">Status: {health?.status ?? 'unknown'}</div>
          <pre className="text-xs mt-2 bg-black/5 p-2 rounded overflow-auto max-h-64">{JSON.stringify(health, null, 2)}</pre>
        </div>
        <div className="rounded border p-4">
          <div className="font-medium mb-2">Server Info</div>
          <div className="text-sm opacity-80">{server?.apiName} v{server?.apiVersion}</div>
          <pre className="text-xs mt-2 bg-black/5 p-2 rounded overflow-auto max-h-64">{JSON.stringify(server, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}