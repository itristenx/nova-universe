"use client";
import { useEffect, useMemo, useState } from "react";

interface Announcement { id: number|string; title: string; body: string; level: string; createdAt: string; }
interface StatusSummary { success: boolean; status: string; components: {id:string; name:string; status:string;}[]; updatedAt: string; }
interface Kiosk { id: string; name?: string; location?: string; active?: boolean; configuration?: any; logoUrl?: string; bgUrl?: string; currentStatus?: string; }

export default function KioskPreviewPage() {
  const [ann, setAnn] = useState<Announcement[]>([]);
  const [status, setStatus] = useState<StatusSummary|null>(null);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [selected, setSelected] = useState<string>("");
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  const authedHeaders = useMemo(() => token ? { headers: { Authorization: `Bearer ${token}` } } : {}, [token]);

  useEffect(() => {
    fetch("/announcements").then(r=>r.json()).then(d=> setAnn(d.announcements || [])).catch(()=>{});
    fetch("/status/summary").then(r=>r.json()).then(setStatus).catch(()=>{});
    if (token) {
      fetch("/api/kiosks", authedHeaders as any).then(r=>r.json()).then((data)=> {
        const list = Array.isArray(data) ? data : (data.kiosks || []);
        setKiosks(list);
        if (list.length && !selected) setSelected(list[0].id);
      }).catch(()=>{});
    }
  }, [token]);

  if (!token) {
    return (
      <main className="p-8 max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Kiosk Preview</h1>
        <p className="text-muted-foreground">Please log in to preview kiosks.</p>
      </main>
    );
  }

  const selectedKiosk = kiosks.find(k => k.id === selected);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kiosk Preview</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Kiosk</label>
          <select
            className="border rounded px-2 py-1 text-sm bg-background"
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            {kiosks.map(k => (
              <option key={k.id} value={k.id}>{k.name || k.id} {k.location ? `(${k.location})` : ''}</option>
            ))}
          </select>
        </div>
      </div>

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

      <section>
        <h2 className="text-xl font-semibold mb-2">Full Web Preview</h2>
        {!selectedKiosk ? (
          <div className="text-muted-foreground">Select a kiosk to preview.</div>
        ) : (
          <div className="rounded border bg-muted p-2">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
              <div>Previewing: {selectedKiosk.name || selectedKiosk.id} {selectedKiosk.location ? `— ${selectedKiosk.location}` : ''}</div>
              <div>Active: {String(selectedKiosk.active ?? selectedKiosk["isActive"])}</div>
            </div>
            <KioskWebMock kioskId={selectedKiosk.id} />
          </div>
        )}
      </section>
    </main>
  );
}

function KioskWebMock({ kioskId }: { kioskId: string }) {
  const [core, setCore] = useState<any>(null);
  const [remote, setRemote] = useState<any>(null);
  useEffect(() => {
    fetch(`/core/config?kiosk_id=${encodeURIComponent(kioskId)}`).then(r=>r.json()).then(setCore).catch(()=>{});
    fetch(`/api/kiosks/${encodeURIComponent(kioskId)}`).then(r=>r.json()).then(setRemote).catch(()=>{});
  }, [kioskId]);

  const primary = core?.theme?.primary_color || '#1D1EFF';
  const logo = core?.theme?.logo_url || remote?.logoUrl || '/logo.png';
  const room = remote?.roomName || remote?.name || 'Conference Room';
  const lastSeen = remote?.lastSeen;

  return (
    <div className="bg-background border rounded h-[520px] flex flex-col overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="text-lg font-semibold">{room}</div>
        <div className="text-xs text-muted-foreground">{lastSeen ? `Last seen ${new Date(lastSeen).toLocaleString()}` : ''}</div>
      </div>
      <div className="px-4 pb-3">
        <div className="rounded-xl px-4 py-3 text-white" style={{ backgroundColor: primary }}>
          <div className="flex items-center gap-3">
            <img src={logo} alt="logo" className="w-8 h-8 rounded" />
            <div>
              <div className="font-semibold">{room}</div>
              <div className="text-xs opacity-80">Kiosk Ready</div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4">
        <div className="rounded-lg px-3 py-2 bg-white/5">
          <div className="flex items-center gap-2 text-sm text-white">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div>No upcoming meetings</div>
            <div className="ml-auto text-xs opacity-80">Last sync {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        {/* Center card with time/message */}
        <div className="rounded-2xl px-8 py-6 bg-white/10 border border-white/20 text-white text-center">
          <div className="text-4xl font-light">{new Date().toLocaleTimeString()}</div>
          <div className="opacity-80">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <div className="mt-2">Welcome to {room}</div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="space-y-3">
          <div className="rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white flex items-center gap-3">
            <div className="w-1.5 h-10 rounded bg-green-500" />
            <div>
              <div className="font-semibold">Available</div>
              <div className="text-xs opacity-80">Tap to open a ticket</div>
            </div>
          </div>
          <button className="w-full rounded-lg bg-blue-600 text-white py-3 shadow hover:bg-blue-500">Open Ticket</button>
        </div>
      </div>
      <div className="border-t bg-background/95 px-3 py-2 text-xs text-muted-foreground flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        Online
        <div className="ml-auto">Kiosk ID: {kioskId}</div>
      </div>
    </div>
  );
}
