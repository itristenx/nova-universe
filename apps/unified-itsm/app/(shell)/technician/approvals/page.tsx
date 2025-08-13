"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function TechApprovalsPage() {
  const [approverUserId, setApproverUserId] = useState('');
  const [title, setTitle] = useState('Approval Request');
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setMessage(null); setError(null);
    try { const r = await apiFetch('/api/v1/approvals/request', { method:'POST', body: JSON.stringify({ approverUserId, title, details }) }); setMessage(`Sent request ${r.id}`); } catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">One-off Approvals</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}
      <div className="grid gap-2 md:grid-cols-2">
        <input className="border rounded px-3 py-2" placeholder="Approver User ID" value={approverUserId} onChange={e=>setApproverUserId(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      </div>
      <textarea className="border rounded px-3 py-2 w-full" placeholder="Details" value={details} onChange={e=>setDetails(e.target.value)} />
      <button className="rounded px-3 py-2 border" onClick={send}>Send Approval</button>
    </div>
  );
}