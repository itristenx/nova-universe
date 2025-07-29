"use client";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { searchKB } from "../../lib/api";

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  interface KnowledgeResult {
    id: string;
    title: string;
    summary: string;
    kbId: string;
  }
  const [results, setResults] = useState<KnowledgeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "demo-token" : "";

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    const res = await searchKB(token, query);
    if (res.success) {
      setResults(res.results);
    } else {
      setError(res.error || "Search failed");
    }
    setLoading(false);
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Knowledge Base</h1>
      <form className="flex gap-2 mb-6" onSubmit={handleSearch}>
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Search articles..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={loading}>Search</Button>
      </form>
      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Searching...</div>
      ) : error ? (
        <div className="py-8 text-center text-destructive">{error}</div>
      ) : results.length === 0 && query ? (
        <div className="py-8 text-center text-muted-foreground">No results found.</div>
      ) : (
        <ul className="space-y-4">
          {results.map(r => (
            <li key={r.id} className="p-4 border rounded bg-muted">
              <a href={`/knowledge/${r.kbId}`} className="block">
                <div className="font-semibold mb-1">{r.title}</div>
                <div className="text-sm text-muted-foreground">{r.summary}</div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
