import React, { useEffect, useState } from 'react';
import { Card, Switch } from '@/components/ui';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';

interface Module {
  key: string;
  enabled: boolean;
}

export const ModuleManagementPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getModules();
      const list = Object.entries(data).map(([key, enabled]) => ({ key, enabled }));
      setModules(list);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', description: 'Failed to load modules' });
    } finally {
      setLoading(false);
    }
  };

  const update = async (key: string, enabled: boolean) => {
    try {
      await api.updateModule(key, enabled);
      setModules(mods => mods.map(m => (m.key === key ? { ...m, enabled } : m)));
      addToast({ type: 'success', title: 'Updated', description: `Module ${key} ${enabled ? 'enabled' : 'disabled'}` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', description: 'Failed to update module' });
    }
  };

  const getStatusIcon = (enabled: boolean) => (
    enabled ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <XCircleIcon className="h-5 w-5 text-gray-400" />
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
        <p className="mt-1 text-sm text-gray-600">Enable or disable Nova modules for your tenant.</p>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {modules.map(mod => (
              <div key={mod.key} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(mod.enabled)}
                  <span className="font-medium text-gray-900">{mod.key}</span>
                </div>
                <Switch checked={mod.enabled} onChange={checked => update(mod.key, checked)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
