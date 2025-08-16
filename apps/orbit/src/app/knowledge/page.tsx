'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { searchKnowledge } from '@/lib/api';

interface KnowledgeResult {
  id?: string;
  _id?: string;
  title?: string;
  summary?: string;
  url?: string;
  _source?: {
    title?: string;
    summary?: string;
    content?: string;
  };
}

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KnowledgeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  if (!token) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>Please log in to search the knowledge base.</p>
      </main>
    );
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await searchKnowledge(token, query.trim());
      if (res.success) {
        setResults(res.results || []);
      } else {
        setError(res.error || 'Search failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Knowledge Base</h1>
      <form className="mb-6 flex gap-2" onSubmit={handleSearch}>
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          Search
        </Button>
      </form>
      {loading ? (
        <div className="text-muted-foreground py-8 text-center">Searching...</div>
      ) : error ? (
        <div className="text-destructive py-8 text-center">{error}</div>
      ) : results.length === 0 && query ? (
        <div className="text-muted-foreground py-8 text-center">No results found.</div>
      ) : (
        <ul className="space-y-4">
          {results.map((r: KnowledgeResult) => (
            <li key={r.id || r._id} className="bg-muted rounded border p-4">
              <div className="mb-1 font-semibold">{r.title || r._source?.title}</div>
              <div className="text-muted-foreground text-sm">
                {r.summary || r._source?.summary || r._source?.content?.slice(0, 160)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
