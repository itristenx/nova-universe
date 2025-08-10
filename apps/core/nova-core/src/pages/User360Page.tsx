import React from 'react';
import { api } from '../lib/api';

export default function User360Page() {
  const [query, setQuery] = React.useState('');
  const [users, setUsers] = React.useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [assets, setAssets] = React.useState<any[]>([]);
  const [dashboard, setDashboard] = React.useState<any | null>(null);
  const [slackStatus, setSlackStatus] = React.useState<{ linked: boolean; account: any | null }>({ linked: false, account: null });
  const [loading, setLoading] = React.useState(false);
  const [linkPayload, setLinkPayload] = React.useState({ slackUserId: '', slackTeamId: '', slackUsername: '' });
  const [message, setMessage] = React.useState<string | null>(null);

  const search = async () => {
    setLoading(true);
    try {
      const res = await api.searchDirectory(query);
      setUsers(res);
    } finally {
      setLoading(false);
    }
  };

  const loadUser360 = async (userId: string) => {
    setLoading(true);
    try {
      setSelectedUserId(userId);
      const [assetsRes, dashRes, slackRes] = await Promise.all([
        api.client.get(`/api/v1/pulse/inventory/assets?assignedTo=${encodeURIComponent(userId)}&includeHistory=true`).then(r => r.data),
        api.client.get('/api/v1/pulse/dashboard').then(r => r.data),
        api.getSlackLinkStatus().then(d => ({ linked: d.linked, account: d.account }))
      ]);
      setAssets(assetsRes.assets || []);
      setDashboard(dashRes.dashboard || null);
      setSlackStatus(slackRes);
    } catch (e) {
      setMessage('Failed to load User360');
    } finally {
      setLoading(false);
    }
  };

  const linkSlack = async () => {
    setLoading(true);
    try {
      await api.linkSlackAccount({
        slackUserId: linkPayload.slackUserId,
        slackTeamId: linkPayload.slackTeamId || undefined,
        slackUsername: linkPayload.slackUsername || undefined
      });
      const status = await api.getSlackLinkStatus();
      setSlackStatus({ linked: status.linked, account: status.account });
      setMessage('Slack account linked');
    } catch (e) {
      setMessage('Failed to link Slack account');
    } finally {
      setLoading(false);
    }
  };

  const unlinkSlack = async () => {
    setLoading(true);
    try {
      await api.unlinkSlackAccount();
      const status = await api.getSlackLinkStatus();
      setSlackStatus({ linked: status.linked, account: status.account });
      setMessage('Slack account unlinked');
    } catch (e) {
      setMessage('Failed to unlink Slack account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">User 360</h1>

      {message && (
        <div className="rounded bg-blue-50 text-blue-800 p-2 text-sm">{message}</div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Search Directory</label>
          <input
            className="w-full border rounded p-2"
            placeholder="Name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="px-3 py-2 bg-black text-white rounded" onClick={search} disabled={loading}>Search</button>
      </div>

      {users.length > 0 && (
        <div className="border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    <button className="px-2 py-1 bg-gray-900 text-white rounded" onClick={() => loadUser360(u.id)} disabled={loading}>View 360</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUserId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="font-semibold">Summary</h2>
            <div className="rounded border p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>Slack Link</div>
                {slackStatus.linked ? (
                  <span className="text-green-600">Linked</span>
                ) : (
                  <span className="text-gray-500">Not linked</span>
                )}
              </div>
              {slackStatus.linked && slackStatus.account && (
                <div className="mt-2 text-xs text-gray-600">
                  <div>User: {slackStatus.account.username || slackStatus.account.external_user_id}</div>
                  {slackStatus.account.external_team_id && (
                    <div>Team: {slackStatus.account.external_team_id}</div>
                  )}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                {!slackStatus.linked ? (
                  <>
                    <input className="border rounded p-1 text-xs" placeholder="Slack User ID" value={linkPayload.slackUserId} onChange={(e) => setLinkPayload(p => ({ ...p, slackUserId: e.target.value }))} />
                    <input className="border rounded p-1 text-xs" placeholder="Team ID (optional)" value={linkPayload.slackTeamId} onChange={(e) => setLinkPayload(p => ({ ...p, slackTeamId: e.target.value }))} />
                    <input className="border rounded p-1 text-xs" placeholder="Username (optional)" value={linkPayload.slackUsername} onChange={(e) => setLinkPayload(p => ({ ...p, slackUsername: e.target.value }))} />
                    <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs" onClick={linkSlack} disabled={loading || !linkPayload.slackUserId}>Link</button>
                  </>
                ) : (
                  <button className="px-2 py-1 bg-red-600 text-white rounded text-xs" onClick={unlinkSlack} disabled={loading}>Unlink</button>
                )}
              </div>
            </div>

            <h2 className="font-semibold mt-6">Agent Dashboard Summary</h2>
            <pre className="rounded border p-3 text-xs overflow-auto bg-gray-50">{JSON.stringify(dashboard, null, 2)}</pre>
          </div>
          <div className="md:col-span-2">
            <h2 className="font-semibold">Assets</h2>
            <div className="rounded border p-3 text-sm overflow-auto">
              <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(assets, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}