import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { api } from '@/lib/api';
import { getEnv } from '@/lib/env';
import type { ApiKey } from '@/types';

export const APIDocumentationPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = getEnv();

  const load = async () => {
    try {
      const data = await api.getApiKeys();
      setKeys(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createKey = async () => {
    try {
      const { apiKey } = await api.createApiKey();
      setKeys(prev => [...prev, apiKey]);
    } catch (err) {
      console.error("Failed to create API key:", err);
    }
  };

  const deleteKey = async (key: string) => {
    await api.deleteApiKey(key);
    setKeys(prev => prev.filter(k => k.key !== key));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
        <p className="mt-1 text-sm text-gray-600">Explore the Nova Universe API and manage your API keys.</p>
      </div>
      <Card className="p-4">
        <iframe src={`${apiUrl}/api-docs`} title="API Docs" className="w-full h-[600px] border rounded" />
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">API Keys</h2>
          <Button onClick={createKey}>Generate Key</Button>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr><th className="px-2 py-1 text-left">Key</th><th className="px-2 py-1 text-left">Created</th><th></th></tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.key}>
                  <td className="border px-2 py-1 font-mono break-all">{k.key}</td>
                  <td className="border px-2 py-1">{new Date(k.createdAt).toLocaleString()}</td>
                  <td className="border px-2 py-1 text-right">
                    <Button variant="secondary" size="sm" onClick={() => deleteKey(k.key)}>Delete</Button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr><td colSpan={3} className="text-center p-2 text-gray-500">No API keys</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default APIDocumentationPage;
