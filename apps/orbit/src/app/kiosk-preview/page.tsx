"use client";
import { useEffect, useState } from "react";

interface Announcement { id: number|string; title: string; body: string; level: string; createdAt: string; }
interface StatusSummary { success: boolean; status: string; components: {id:string; name:string; status:string;}[]; updatedAt: string; }

export default function KioskPreviewPage() {
  const [ann, setAnn] = useState<Announcement[]>([]);
  const [status, setStatus] = useState<StatusSummary|null>(null);

  useEffect(() => {
    fetch("/announcements").then(r=>r.json()).then(d=> setAnn(d.announcements || [])).catch(()=>{});
    fetch("/status/summary").then(r=>r.json()).then(setStatus).catch(()=>{});
  }, []);

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Kiosk Preview</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Status Summary</h2>
        {!status ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : (
          <div className="rounded border p-4 bg-muted">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Overall: {status.status}</div>
              <div className="text-xs text-muted-foreground">Updated {new Date(status.updatedAt).toLocaleString()}</div>
            </div>
            <ul className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              {status.components?.map(c => (
                <li key={c.id} className="rounded bg-background border p-3 flex items-center justify-between">
                  <span>{c.name}</span>
                  <span className={c.status === 'operational' ? 'text-green-600' : 'text-yellow-600'}>{c.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Announcements</h2>
        {ann.length === 0 ? (
          <div className="text-muted-foreground">No announcements</div>
        ) : (
          <ul className="space-y-3">
            {ann.map(a => (
              <li key={a.id} className="rounded border p-4 bg-background">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm mt-1">{a.body}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}