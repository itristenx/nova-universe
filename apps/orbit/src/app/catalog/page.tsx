'use client';
import { useEffect, useState } from 'react';
import { getCatalogItems } from '../../lib/api';
import { Button } from '../../components/ui/button';

export default function CatalogPage() {
  const [items, setItems] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCatalogItems('demo-token')
      .then((res) => {
        if (res.success) setItems(res.items);
        else setError(res.error || 'Failed to load catalog');
      })
      .catch(() => setError('Failed to load catalog'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Request Catalog</h1>
      {loading ? (
        <div className="text-muted-foreground py-8 text-center">Loading...</div>
      ) : error ? (
        <div className="text-destructive py-8 text-center">{error}</div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-muted flex items-center justify-between rounded border p-3"
            >
              <span>{item.name}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => (window.location.href = `/catalog/${item.id}`)}
              >
                Request
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
