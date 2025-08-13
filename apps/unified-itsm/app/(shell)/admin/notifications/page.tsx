"use client";
import { useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('Announcement');
  const [message, setMessage] = useState('');
  const [recipientRoles, setRecipientRoles] = useState('tech,admin');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setError(null); setResult(null);
    try {
      const payload = {
        module: 'core.admin', eventType: 'custom', title, message,
        recipientRoles: recipientRoles.split(',').map(s=>s.trim()).filter(Boolean),
        priority: 'NORMAL'
      };
      const r = await apiFetch('/api/v2/notifications/send', { method:'POST', body: JSON.stringify(payload) });
      setResult(r);
    } catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Custom Notifications</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid gap-2 md:grid-cols-2">
        <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Recipient Roles (comma separated)" value={recipientRoles} onChange={e=>setRecipientRoles(e.target.value)} />
      </div>
      <textarea className="border rounded px-3 py-2 w-full" placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} />
      <button className="rounded px-3 py-2 border" onClick={send}>Send</button>
      {result && <pre className="text-xs bg-black/5 p-3 rounded overflow-auto max-h-[50vh]">{JSON.stringify(result,null,2)}</pre>}
    </div>
  );
}