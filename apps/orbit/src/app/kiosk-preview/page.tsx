'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

interface Announcement {
  id: number | string;
  title: string;
  body: string;
  level: string;
  createdAt: string;
}
interface StatusSummary {
  success: boolean;
  status: string;
  components: { id: string; name: string; status: string }[];
  updatedAt: string;
}
interface Kiosk {
  id: string;
  name?: string;
  location?: string;
  active?: boolean;
  configuration?: Record<string, unknown>;
  logoUrl?: string;
  bgUrl?: string;
  currentStatus?: string;
}

export default function KioskPreviewPage() {
  const [ann, setAnn] = useState<Announcement[]>([]);
  const [status, setStatus] = useState<StatusSummary | null>(null);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [selected, setSelected] = useState<string>('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  const authedHeaders = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token],
  );

  useEffect(() => {
    fetch('/announcements')
      .then((r) => r.json())
      .then((d) => setAnn(d.announcements || []))
      .catch(() => {});
    fetch('/status/summary')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
    if (token) {
      fetch('/api/kiosks', authedHeaders as RequestInit)
        .then((r) => r.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data.kiosks || [];
          setKiosks(list);
          if (list.length && !selected) setSelected(list[0].id);
        })
        .catch(() => {});
    }
  }, [token, authedHeaders, selected]);

  if (!token) {
    return (
      <main className="mx-auto max-w-3xl space-y-8 p-8">
        <h1 className="text-2xl font-bold">Kiosk Preview</h1>
        <p className="text-muted-foreground">Please log in to preview kiosks.</p>
      </main>
    );
  }

  const selectedKiosk = kiosks.find((k) => k.id === selected);

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kiosk Preview</h1>
        <div className="flex items-center gap-3">
          <label className="text-muted-foreground text-sm">Kiosk</label>
          <select
            className="bg-background rounded border px-2 py-1 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {kiosks.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name || k.id} {k.location ? `(${k.location})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Status Summary</h2>
        {!status ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : (
          <div className="bg-muted rounded border p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Overall: {status.status}</div>
              <div className="text-muted-foreground text-xs">
                Updated {new Date(status.updatedAt).toLocaleString()}
              </div>
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
              {status.components?.map((c) => (
                <li
                  key={c.id}
                  className="bg-background flex items-center justify-between rounded border p-3"
                >
                  <span>{c.name}</span>
                  <span
                    className={c.status === 'operational' ? 'text-green-600' : 'text-yellow-600'}
                  >
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Announcements</h2>
        {ann.length === 0 ? (
          <div className="text-muted-foreground">No announcements</div>
        ) : (
          <ul className="space-y-3">
            {ann.map((a) => (
              <li key={a.id} className="bg-background rounded border p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="mt-1 text-sm">{a.body}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Full Web Preview</h2>
        {!selectedKiosk ? (
          <div className="text-muted-foreground">Select a kiosk to preview.</div>
        ) : (
          <div className="bg-muted rounded border p-2">
            <div className="text-muted-foreground flex items-center justify-between px-2 py-1 text-xs">
              <div>
                Previewing: {selectedKiosk.name || selectedKiosk.id}{' '}
                {selectedKiosk.location ? `— ${selectedKiosk.location}` : ''}
              </div>
              <div>Active: {String(selectedKiosk.active ?? false)}</div>
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
    fetch(`/core/config?kiosk_id=${encodeURIComponent(kioskId)}`)
      .then((r) => r.json())
      .then(setCore)
      .catch(() => {});
    fetch(`/api/kiosks/${encodeURIComponent(kioskId)}`)
      .then((r) => r.json())
      .then(setRemote)
      .catch(() => {});
  }, [kioskId]);

  const primary = core?.theme?.primary_color || '#1D1EFF';
  const logo = core?.theme?.logo_url || remote?.logoUrl || '/logo.png';
  const room = remote?.roomName || remote?.name || 'Conference Room';
  const lastSeen = remote?.lastSeen;

  return (
    <div className="bg-background flex h-[520px] flex-col overflow-hidden rounded border">
      <div className="flex items-center justify-between p-4">
        <div className="text-lg font-semibold">{room}</div>
        <div className="text-muted-foreground text-xs">
          {lastSeen ? `Last seen ${new Date(lastSeen).toLocaleString()}` : ''}
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="rounded-xl px-4 py-3 text-white" style={{ backgroundColor: primary }}>
          <div className="flex items-center gap-3">
            <Image
              src={logo}
              alt="logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded"
              unoptimized={true}
            />
            <div>
              <div className="font-semibold">{room}</div>
              <div className="text-xs opacity-80">Kiosk Ready</div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4">
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-white">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <div>No upcoming meetings</div>
            <div className="ml-auto text-xs opacity-80">
              Last sync {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      <div className="text-muted-foreground flex flex-1 items-center justify-center">
        {/* Center card with time/message */}
        <div className="rounded-2xl border border-white/20 bg-white/10 px-8 py-6 text-center text-white">
          <div className="text-4xl font-light">{new Date().toLocaleTimeString()}</div>
          <div className="opacity-80">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="mt-2">Welcome to {room}</div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white">
            <div className="h-10 w-1.5 rounded bg-green-500" />
            <div>
              <div className="font-semibold">Available</div>
              <div className="text-xs opacity-80">Tap to open a ticket</div>
            </div>
          </div>
          <button className="w-full rounded-lg bg-blue-600 py-3 text-white shadow hover:bg-blue-500">
            Open Ticket
          </button>
        </div>
      </div>
      <div className="bg-background/95 text-muted-foreground flex items-center gap-3 border-t px-3 py-2 text-xs">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        Online
        <div className="ml-auto">Kiosk ID: {kioskId}</div>
      </div>
    </div>
  );
}
