import React, { useEffect, useState } from 'react';
import { Card, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { InventoryAsset } from '@/types';

export const InventoryPage: React.FC = () => {
  const [assets, setAssets] = useState<InventoryAsset[]>([]);
  const [search, setSearch] = useState('');
  const { addToast } = useToastStore();

  const loadAssets = async () => {
    try {
      const data = await api.getInventoryAssets();
      setAssets(data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', description: 'Failed to load assets' });
    }
  };

  useEffect(() => { loadAssets(); }, []);

  const filtered = assets.filter(a =>
    !search || a.asset_tag?.includes(search) || a.serial_number?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Input placeholder="Search by asset tag or serial" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Tag</th>
              <th className="text-left p-2">Model</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.asset_tag}</td>
                <td className="p-2">{a.model}</td>
                <td className="p-2">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
