import React, { useEffect, useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { apiClient } from '@/lib/api';

interface ApiKey {
  id: string;
  name: string;
  key: string;
}

export const APIDocsPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newName, setNewName] = useState('');

  const loadKeys = async () => {
    const res = await apiClient.get<ApiKey[]>('/api/v1/api-keys');
    setKeys(res.data);
  };

  useEffect(() => { loadKeys(); }, []);

  const createKey = async () => {
    if (!newName) return;
    await apiClient.post<ApiKey>('/api/v1/api-keys', { name: newName });
    setNewName('');
    loadKeys();
  };

  const deleteKey = async (id: string) => {
    await apiClient.delete(`/api/v1/api-keys/${id}`);
    loadKeys();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Documentation</h1>
        <p className="text-sm text-gray-600">Interactive Swagger docs and API key management</p>
      </div>
      <Card className="p-4">
        <iframe src="/api-docs" title="Swagger" className="w-full h-[600px] border" />
      </Card>
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">API Keys</h2>
        <div className="flex space-x-2">
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Key name" />
          <Button onClick={createKey}>Create</Button>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr><th className="px-2 py-1">Name</th><th className="px-2 py-1">Key</th><th></th></tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.id}>
                <td className="border px-2 py-1">{k.name}</td>
                <td className="border px-2 py-1 font-mono">
                  {k.key.slice(0, 4) + '****' + k.key.slice(-4)}
                  <Button
                    variant="secondary"
                    className="ml-2"
                    onClick={() => navigator.clipboard.writeText(k.key)}
                  >
                    Copy
                  </Button>
                </td>
                <td className="border px-2 py-1">
                  <Button variant="secondary" onClick={() => deleteKey(k.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr><td className="border px-2 py-1" colSpan={3}>No keys</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
