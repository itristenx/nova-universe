"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../../lib/api';

export default function GoAlertPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ const r = await apiFetch('/api/v2/goalert/users'); setUsers(r?.users || r || []);}catch(e:any){ setError(e.message);} })(); },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">GoAlert Integration</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="card">
        <div className="font-medium mb-2">Users</div>
        <ul className="divide-y">
          {users.map((u:any)=> (
            <li key={u.id || u.userID} className="py-2">
              <div className="font-medium">{u.name || u.email || u.id}</div>
              <div className="text-sm opacity-80">{u.email || ''}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}