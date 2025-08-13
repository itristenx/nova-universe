"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../../lib/api';

export default function KnowledgeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{ try{ const r = await apiFetch(`/api/v1/lore/articles/${id}`); setArticle(r?.article||r);}catch(e:any){ setError(e.message);} })(); },[id]);

  if(!article) return <div>Loading…</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{article.title}</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="opacity-80 text-sm">{(article.tags||[]).join(', ')}</div>
      <div className="card" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
    </div>
  );
}