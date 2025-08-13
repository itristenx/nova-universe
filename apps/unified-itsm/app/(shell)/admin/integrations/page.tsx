"use client";
import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function IntegrationsOverview() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function seedCatalog(){
    setMessage(null); setError(null);
    try { await apiFetch('/api/v1/catalog-items/seed-defaults', { method:'POST', body: JSON.stringify({ workflows: {} }) }); setMessage('Seeded default catalog items'); } catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Integrations</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link className="card" href="/(shell)/admin/integrations/goalert">GoAlert</Link>
        <Link className="card" href="/(shell)/admin/integrations/helpscout">HelpScout</Link>
        <Link className="card" href="/(shell)/admin/integrations/scim">SCIM</Link>
        <Link className="card" href="/(shell)/admin/status">Sentinel Monitors</Link>
      </div>
      <div className="rounded border p-3">
        <div className="font-medium mb-2">Catalog</div>
        <button className="rounded px-3 py-2 border" onClick={seedCatalog}>Seed Default Catalog Items</button>
      </div>
    </div>
  );
}