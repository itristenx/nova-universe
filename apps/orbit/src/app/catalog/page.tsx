"use client";
import { useEffect, useState } from "react";
import { getCategories } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

interface Category {
  name: string;
  subcategories?: string[];
}
export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCategories("demo-token")
      .then(res => {
        if (res.success) setCategories(res.categories);
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
        <>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">{selected} Items</h2>
              <ul className="space-y-2">
                {(categories.find(c => c.name === selected)?.subcategories ?? []).map((item: string) => (
                  <li key={item} className="p-3 border rounded bg-muted flex items-center justify-between">
                    <span>{item}</span>
                    <Button size="sm" variant="outline" onClick={() => window.location.href = `/tickets/new?category=${encodeURIComponent(selected)}&subcategory=${encodeURIComponent(item)}`}>Request</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </main>
  );
}
