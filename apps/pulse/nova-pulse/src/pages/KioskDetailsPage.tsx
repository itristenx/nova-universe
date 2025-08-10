import React, { useEffect, useMemo, useState } from 'react';

interface Kiosk { id: string; name?: string; location?: string; active?: boolean; configuration?: any; logoUrl?: string; bgUrl?: string; currentStatus?: string; }

const KioskWebMock: React.FC<{ kioskId: string }> = ({ kioskId }) => {
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
        <div className="rounded-2xl px-8 py-6 bg-white/10 border border-white/20 text-white text-center">
          <div className="text-4xl font-light">{new Date().toLocaleTimeString()}</div>
          <div className="opacity-80">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <div className="mt-2">Welcome to {room}</div>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-3">
        <div className="rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white flex items-center gap-3">
          <div className="w-1.5 h-10 rounded bg-green-500" />
          <div>
            <div className="font-semibold">Available</div>
            <div className="text-xs opacity-80">Tap to open a ticket</div>
          </div>
        </div>
        <button className="w-full rounded-lg bg-blue-600 text-white py-3 shadow hover:bg-blue-500">Open Ticket</button>
      </div>
      <div className="border-t bg-background/95 px-3 py-2 text-xs text-muted-foreground flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        Online
        <div className="ml-auto">Kiosk ID: {kioskId}</div>
      </div>
    </div>
  );
};

export const KioskDetailsPage: React.FC = () => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [selected, setSelected] = useState<string>('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const headers = useMemo(() => token ? { headers: { Authorization: `Bearer ${token}` } } : {}, [token]);

  useEffect(() => {
    fetch('/api/kiosks', headers as any).then(r=>r.json()).then((data) => {
      const list = Array.isArray(data) ? data : (data.kiosks || []);
      setKiosks(list);
      if (list.length && !selected) setSelected(list[0].id);
    }).catch(()=>{});
  }, [token]);

  const selectedKiosk = kiosks.find(k => k.id === selected);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kiosk Details</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Kiosk</label>
          <select className="border rounded px-2 py-1 text-sm bg-background" value={selected} onChange={e => setSelected(e.target.value)}>
            {kiosks.map(k => (
              <option key={k.id} value={k.id}>{k.name || k.id} {k.location ? `(${k.location})` : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedKiosk ? (
        <div className="text-muted-foreground">No kiosks found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded border p-4">
              <h2 className="text-lg font-semibold mb-2">Merged Configuration</h2>
              <pre className="text-xs overflow-auto">{JSON.stringify(selectedKiosk.effectiveConfig || selectedKiosk.configuration || {}, null, 2)}</pre>
            </div>
            <div className="rounded border p-4">
              <h2 className="text-lg font-semibold mb-2">Theme</h2>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: (selectedKiosk as any)?.effectiveConfig?.theme?.primaryColor || '#1D1EFF' }} />
                <div className="text-sm">Primary</div>
              </div>
            </div>
            <div className="rounded border p-4">
              <h2 className="text-lg font-semibold mb-2">Features</h2>
              <ul className="text-sm list-disc ml-5">
                <li>Ticket Submission: {String((selectedKiosk as any)?.effectiveConfig?.features?.ticketSubmission ?? true)}</li>
                <li>Status Updates: {String((selectedKiosk as any)?.effectiveConfig?.features?.statusUpdates ?? true)}</li>
                <li>Directory Integration: {String((selectedKiosk as any)?.effectiveConfig?.features?.directoryIntegration ?? false)}</li>
              </ul>
            </div>
          </div>
          <div>
            <KioskWebMock kioskId={selectedKiosk.id} />
          </div>
        </div>
      )}
    </div>
  );
};
