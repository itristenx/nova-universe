"use client";
import { useState } from 'react';
import { apiFetch, setAuthToken } from '../../lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      // Ensure user exists (idempotent)
      try {
        await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, first_name: 'Admin', last_name: 'User', role: 'admin' }) });
      } catch {}
      const res = await apiFetch<{ token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setAuthToken(res.token);
      window.location.href = '/';
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      <form onSubmit={handleLogin} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button disabled={busy} className="rounded px-3 py-2 bg-blue-600 text-white disabled:opacity-60">{busy? 'Signing in…':'Sign in'}</button>
      </form>
      <div className="mt-3 text-sm"><Link href="/">Back</Link></div>
    </div>
  );
}