'use client';
import { useEffect, useState } from 'react';
import { getServiceStatus } from '../../lib/api';

interface StatusData {
  id: number;
  service: string;
  state: string;
  updated: string;
}
export default function StatusPage() {
  const [status, setStatus] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const isAuthed = Boolean(token);

  useEffect(() => {
    if (!isAuthed) return;
    setLoading(true);
    getServiceStatus(token)
      .then((res) => {
        if (res.success) {
          setStatus(res.status || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthed, token]);

  return (
    <main className="mx-auto max-w-2xl p-8">
      {!isAuthed ? (
        <p>Please log in to view service status.</p>
      ) : (
        <>
          <h1 className="mb-4 text-2xl font-bold">Service Status</h1>
          {loading ? (
            <div className="text-muted-foreground py-8 text-center">Loading status...</div>
          ) : (
            <ul className="space-y-4">
              {status.map((s) => (
                <li
                  key={s.id}
                  className="bg-muted flex items-center justify-between rounded border p-4"
                >
                  <div>
                    <div className="font-semibold">{s.service}</div>
                    <div className="text-muted-foreground text-xs">
                      Last updated: {new Date(s.updated).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={
                      s.state === 'Operational'
                        ? 'text-success'
                        : s.state === 'Degraded'
                          ? 'text-warning'
                          : 'text-destructive'
                    }
                  >
                    {s.state}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
