import React, { useEffect, useState } from 'react';
import { Card, Select } from '@/components/ui';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { User } from '@/types';

export const VIPManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers(); // TODO-LINT: move to async function
      setUsers(data);
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', title: 'Error', description: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const updateVip = async (user: User, isVip: boolean, vipLevel: string) => {
    try {
      await api.updateVipStatus(user.id, { isVip, vipLevel }); // TODO-LINT: move to async function
      setUsers(users.map(u => u.id === user.id ? { ...u, isVip, vipLevel } : u));
      addToast({ type: 'success', title: 'Updated', description: 'VIP status saved' });
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', title: 'Error', description: 'Failed to update VIP' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <h1 className="text-xl font-semibold mb-4">VIP Management</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">User</th>
            <th className="px-4 py-2 text-left">VIP</th>
            <th className="px-4 py-2 text-left">Level</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(u => (
            <tr key={u.id}>
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">
                <input type="checkbox" checked={!!(u as any).isVip} onChange={e => updateVip(u, e.target.checked, (u as any).vipLevel || 'priority')} />
              </td>
              <td className="px-4 py-2">
                <Select
                  value={(u as any).vipLevel || 'priority'}
                  onChange={val => updateVip(u, !!(u as any).isVip, val)}
                  options={[
                    { value: 'priority', label: 'priority' },
                    { value: 'gold', label: 'gold' },
                    { value: 'exec', label: 'exec' },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
