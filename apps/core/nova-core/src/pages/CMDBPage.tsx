import React, { useEffect, useMemo, useState } from 'react';

const fetchJson = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

interface CiClass {
  id: number;
  name: string;
  label?: string;
  description?: string;
  parent_id?: number | null;
}

interface CiItem {
  id: number;
  class_id: number;
  name: string;
  status?: string;
  environment?: string;
  owner_user_id?: string;
  owner_group?: string;
  criticality?: number;
  attributes?: Record<string, unknown>;
}

const CMDBPage: React.FC = () => {
  const [classes, setClasses] = useState<CiClass[]>([]);
  const [items, setItems] = useState<CiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const load = async () => {
    try {
      setLoading(true);
      const [c, i] = await Promise.all([
        fetchJson('/api/v1/cmdb/classes'),
        fetchJson('/api/v1/cmdb/items'),
      ]);
      setClasses(c.classes || []);
      setItems(i.items || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load CMDB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (selectedClass) {
        const c = parseInt(selectedClass);
        if (it.class_id !== c) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        return it.name.toLowerCase().includes(q) || JSON.stringify(it.attributes || {}).toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, query, selectedClass]);

  const createQuick = async () => {
    const name = prompt('CI name');
    if (!name) return;
    const classId = parseInt(prompt('Class ID (numeric)') || '');
    if (!classId) return;
    await fetchJson('/api/v1/cmdb/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId, name }),
    });
    await load();
  };

  if (loading) return <div className="p-4">Loading CMDB...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">CMDB</h1>

      <div className="flex gap-2 items-center">
        <select className="border rounded px-2 py-1" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id.toString()}>
              {c.label || c.name} (#{c.id})
            </option>
          ))}
        </select>
        <input className="border rounded px-2 py-1 flex-1" placeholder="Search name or attributes..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="border rounded px-3 py-1" onClick={createQuick}>Quick add</button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Class</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Environment</th>
              <th className="text-left p-2">Attributes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.id}</td>
                <td className="p-2">{it.class_id}</td>
                <td className="p-2">{it.name}</td>
                <td className="p-2">{it.status || 'active'}</td>
                <td className="p-2">{it.environment || '-'}</td>
                <td className="p-2 font-mono text-xs">{JSON.stringify(it.attributes || {})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500">Tip: use API `/api/v1/cmdb/relationship-types` and `/api/v1/cmdb/relationships` to model dependencies</div>
    </div>
  );
};

export default CMDBPage;