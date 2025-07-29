"use client";
import { useEffect, useState } from "react";
import { InventoryAsset } from "../../types";

async function getAssets(token: string) {
  const res = await fetch(`/api/v1/inventory`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return data.assets as InventoryAsset[];
}

export default function InventoryLookupPage() {
  const [assets, setAssets] = useState<InventoryAsset[]>([]);
  const [query, setQuery] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    getAssets(token).then(setAssets).catch(() => setAssets([]));
  }, [token]);

  const filtered = assets.filter(a => !query || a.asset_tag?.includes(query) || a.serial_number?.includes(query));

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Assets</h1>
      <input className="border px-3 py-2 mb-4 w-full" placeholder="Search by tag or serial" value={query} onChange={e => setQuery(e.target.value)} />
      <ul className="space-y-2">
        {filtered.map(a => (
          <li key={a.id} className="p-3 border rounded bg-muted">
            <div className="font-semibold">{a.asset_tag}</div>
            <div className="text-sm text-muted-foreground">{a.model}</div>
          </li>
        ))}
        {filtered.length === 0 && <div className="text-muted-foreground">No assets found.</div>}
      </ul>
    </main>
  );
}
