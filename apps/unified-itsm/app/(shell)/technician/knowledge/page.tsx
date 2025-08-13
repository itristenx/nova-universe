"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function KnowledgePage() {
  const [q, setQ] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setError(null);
    try {
      const res = await apiFetch<any>('/api/v1/lore/articles?search=' + encodeURIComponent(q));
      setArticles(res.articles || []);
    } catch(e:any){ setError(e.message); }
  }

  useEffect(()=>{ /* initial no-op */ },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Knowledge</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Search knowledge…" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="rounded px-3 py-2 border" onClick={search}>Search</button>
      </div>
      <ul className="divide-y rounded border">
        {articles.map((a:any)=> (
          <li key={a.id} className="p-3">
            <div className="font-medium">{a.title}</div>
            <div className="text-sm opacity-80">{a.excerpt}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}