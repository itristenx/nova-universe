import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { apiClient } from '@/lib/api';

interface Module {
  name: string;
  displayName: string;
  enabled: boolean;
}

export const ModuleManagementPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);

  const load = async () => {
    const res = await apiClient.get<Module[]>('/api/v1/modules');
    setModules(res.data);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (m: Module) => {
    if (m.enabled) {
      await apiClient.post(`/api/v1/modules/${m.name}/disable`);
    } else {
      await apiClient.post(`/api/v1/modules/${m.name}/enable`);
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Module Management</h1>
        <p className="text-sm text-gray-600">Enable or disable Nova modules</p>
      </div>
      <Card className="p-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr><th className="px-2 py-1">Module</th><th className="px-2 py-1">Status</th><th></th></tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m.name}>
                <td className="border px-2 py-1">{m.displayName}</td>
                <td className="border px-2 py-1">{m.enabled ? 'Enabled' : 'Disabled'}</td>
                <td className="border px-2 py-1">
                  <Button variant="secondary" onClick={() => toggle(m)}>
                    {m.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </td>
              </tr>
            ))}
            {modules.length === 0 && <tr><td className="border px-2 py-1" colSpan={3}>No modules</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
