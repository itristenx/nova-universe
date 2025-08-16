"use client";
import { useEffect, useState } from "react";
import { getServiceStatus } from "../../lib/api";

interface StatusData {
  id: number;
  service: string;
  state: string;
  updated: string;
}
export default function _StatusPage() {
  const [status, setStatus] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  if (!token) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <p>Please log in to view service status.</p>
      </main>
    );
  }

  useEffect(() => {
    setLoading(true);
    getServiceStatus(token)
      .then(res => {
        if (res.success) {
          setStatus(res.status || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
