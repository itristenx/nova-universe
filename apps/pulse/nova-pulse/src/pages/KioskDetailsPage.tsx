import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import kioskStyles from './KioskDetailsPage.module.css';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import listStyles from '../components/TicketGrid.module.css';

interface Kiosk {
  id: string;
  name?: string;
  location?: string;
  active?: boolean;
  configuration?: any;
  effectiveConfig?: any;
  logoUrl?: string;
  bgUrl?: string;
  currentStatus?: string;
}

const KioskWebMock: React.FC<{ kioskId: string }> = ({ kioskId }) => {
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
        <div className={`rounded-xl px-4 py-3 text-white ${kioskStyles.primaryTint}`}>
          <div className="flex items-center gap-3">
            <img src={logo} alt="logo" className="h-8 w-8 rounded" />
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
      <div className="space-y-3 px-4 pb-4">
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
      <div className="bg-background/95 text-muted-foreground flex items-center gap-3 border-t px-3 py-2 text-xs">
        <div className="h-2 w-2 rounded-full bg-green-500" />
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
  const headers = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token],
  );

  useEffect(() => {
    fetch('/api/kiosks', headers as any)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.kiosks || [];
        setKiosks(list);
        if (list.length && !selected) setSelected(list[0].id);
      })
      .catch(() => {});
  }, [token]);

  const selectedKiosk = kiosks.find((k) => k.id === selected);

  return (
    <motion.div
      className={`space-y-6 p-6 ${listStyles.pullContainer}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.back()}
            aria-label="Go back"
            title="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white/80 shadow-sm backdrop-blur dark:bg-gray-900/80"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Kiosk Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="kiosk-select" className="text-muted-foreground text-sm">
            Kiosk
          </label>
          <select
            id="kiosk-select"
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

      {!selectedKiosk ? (
        <div className="text-muted-foreground">No kiosks found</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded border p-4">
              <h2 className="mb-2 text-lg font-semibold">Merged Configuration</h2>
              <pre className="overflow-auto text-xs">
                {JSON.stringify(
                  selectedKiosk.effectiveConfig || selectedKiosk.configuration || {},
                  null,
                  2,
                )}
              </pre>
            </div>
            <div className="rounded border p-4">
              <h2 className="mb-2 text-lg font-semibold">Theme</h2>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded ${kioskStyles.primaryTint}`} />
                <div className="text-sm">Primary</div>
              </div>
            </div>
            <div className="rounded border p-4">
              <h2 className="mb-2 text-lg font-semibold">Features</h2>
              <ul className="ml-5 list-disc text-sm">
                <li>
                  Ticket Submission:{' '}
                  {String(selectedKiosk.effectiveConfig?.features?.ticketSubmission ?? true)}
                </li>
                <li>
                  Status Updates:{' '}
                  {String(selectedKiosk.effectiveConfig?.features?.statusUpdates ?? true)}
                </li>
                <li>
                  Directory Integration:{' '}
                  {String(selectedKiosk.effectiveConfig?.features?.directoryIntegration ?? false)}
                </li>
              </ul>
            </div>
          </div>
          <div>
            <KioskWebMock kioskId={selectedKiosk.id} />
          </div>
        </div>
      )}
    </motion.div>
  );
};
