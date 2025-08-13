"use client";
import { useState } from 'react';
import { apiFetch } from '../../../../../lib/api';

export default function HelpScoutPage() {
  const [apiKey, setApiKey] = useState('');
  const [mailboxId, setMailboxId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function runImport() {
    setError(null); setResult(null);
    try { const r = await apiFetch('/api/helpscout/import', { method: 'POST', body: JSON.stringify({ apiKey, mailboxId }) }); setResult(r); } catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">HelpScout</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="card">
        <div className="font-medium mb-2">Import Tickets</div>
        <div className="grid gap-2 md:grid-cols-3">
          <input className="border rounded px-3 py-2" placeholder="API Key" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Mailbox ID" value={mailboxId} onChange={e=>setMailboxId(e.target.value)} />
          <button className="rounded px-3 py-2 border" onClick={runImport}>Run Import</button>
        </div>
      </div>
      {result && <pre className="text-xs bg-black/5 p-3 rounded overflow-auto max-h-[50vh]">{JSON.stringify(result,null,2)}</pre>}
    </div>
  );
}