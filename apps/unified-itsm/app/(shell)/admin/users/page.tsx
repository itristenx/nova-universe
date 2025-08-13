"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function UsersPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async ()=>{
      try {
        const r = await apiFetch<any[]>('/api/v1/roles');
        setRoles(r);
      } catch(e:any) { setError(e.message); }
    })();
  }, []);

  async function search() {
    setError(null);
    try {
      const res = await apiFetch<any[]>('/api/v1/directory/search?q=' + encodeURIComponent(query));
      setResults(res);
    } catch(e:any) { setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Users & Roles</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="rounded border p-4">
        <div className="font-medium mb-2">Roles</div>
        <ul className="list-disc pl-5 text-sm">
          {roles.map((r:any)=>(<li key={r.id}>{r.name}</li>))}
        </ul>
      </div>
      <div className="rounded border p-4">
        <div className="font-medium mb-2">Directory Search</div>
        <div className="flex gap-2">
          <input className="border rounded px-3 py-2 flex-1" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users…" />
          <button onClick={search} className="rounded px-3 py-2 border">Search</button>
        </div>
        <ul className="mt-3 text-sm divide-y">
          {results.map((u:any)=>(<li key={u.id} className="py-2">{u.name} <span className="opacity-70">{u.email}</span></li>))}
        </ul>
      </div>
    </div>
  );
}