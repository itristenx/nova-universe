"use client";
import { useEffect, useState } from "react";


// TODO: Replace with real status API
interface StatusData {
  id: number;
  service: string;
  state: string;
  updated: string;
}
export default function StatusPage() {
  const [status, setStatus] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // TODO: Call real status API
    setTimeout(() => {
      setStatus([
        { id: 1, service: "Email", state: "Operational", updated: "2025-07-28T10:00:00Z" },
        { id: 2, service: "VPN", state: "Degraded", updated: "2025-07-28T09:00:00Z" },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Service Status</h1>
      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading status...</div>
      ) : (
        <ul className="space-y-4">
          {status.map(s => (
            <li key={s.id} className="p-4 border rounded bg-muted flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.service}</div>
                <div className="text-xs text-muted-foreground">Last updated: {new Date(s.updated).toLocaleString()}</div>
              </div>
              <span className={
                s.state === "Operational"
                  ? "text-success"
                  : s.state === "Degraded"
                  ? "text-warning"
                  : "text-destructive"
              }>{s.state}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
