"use client";
import { useEffect, useState } from "react";
import { getCatalogItems } from "../../lib/api";
import { Button } from "../../components/ui/button";

export default function CatalogPage() {
  const [items, setItems] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCatalogItems("demo-token")
      .then(res => {
        if (res.success) setItems(res.items);
        else setError(res.error || "Failed to load catalog");
      })
      .catch(() => setError("Failed to load catalog"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Request Catalog</h1>
      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="py-8 text-center text-destructive">{error}</div>
      ) : (
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id} className="p-3 border rounded bg-muted flex items-center justify-between">
              <span>{item.name}</span>
              <Button size="sm" variant="outline" onClick={() => (window.location.href = `/catalog/${item.id}`)}>Request</Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
