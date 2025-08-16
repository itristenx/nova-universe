import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { useToastStore } from '@/stores/toast';
import { api } from '../lib/api';
import { KioskActivation } from '../types';
import { PlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

export const KioskActivationPage: React.FC = () => {
  const [kioskId, setKioskId] = useState('');
  const [activations, setActivations] = useState<KioskActivation[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [newSystem, setNewSystem] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemsLoading, setSystemsLoading] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [linkKioskId, setLinkKioskId] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [latestActivation, setLatestActivation] = useState<{
    code: string;
    qr?: string;
    expiresAt: string;
  } | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [paired, setPaired] = useState(false);
  const { addToast } = useToastStore();
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    loadActivations();
    loadSystems();

    // Auto-refresh activations every 30 seconds to sync with other pages
    const interval = setInterval(loadActivations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    subscribe('kiosks');
    const handler = (e: any) => {
      try {
        const msg = typeof e?.detail === 'object' ? e.detail : e;
        const type = msg?.type || msg?.data?.type;
        const data = msg?.data || msg;
        if ((type === 'kiosk_activated' || type === 'kiosk_check_in') && waiting) {
          if (!kioskId || data.kioskId === kioskId || latestActivation) {
            setPaired(true);
            setWaiting(false);
          }
        }
      } catch {}
    };
    // Assuming useWebSocket emits window events; if not, adapt to your hook’s onMessage handler
    window.addEventListener('realtime_update', handler as any);
    window.addEventListener('data_update', handler as any);
    return () => {
      window.removeEventListener('realtime_update', handler as any);
      window.removeEventListener('data_update', handler as any);
    };
  }, [waiting, kioskId, latestActivation]);

  const loadSystems = async () => {
    try {
      setSystemsLoading(true);
      const data = await api.getKioskSystems();
      setSystems(data?.systems || []);
    } catch (error) {
      console.error('Failed to load systems:', error);
      setSystems([]); // Ensure systems is always an array
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load kiosk systems',
      });
    } finally {
      setSystemsLoading(false);
    }
  };

  const loadActivations = async () => {
    try {
      setLoading(true);
      const data = await api.getKioskActivations();
      setActivations(data);
    } catch (error) {
      console.error('Failed to load activations:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load kiosk activations',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateActivation = async () => {
    try {
      setGeneratingQR(true);
      setWaiting(false);
      setPaired(false);
      const input = {
        kioskId: kioskId || `kiosk-${Math.random().toString(36).slice(2, 7)}`,
      } as any;
      const activation = await fetch('/api/v2/beacon/activation-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((r) => r.json());
      setLatestActivation({
        code: activation.code,
        qr: activation.qr,
        expiresAt: activation.expiresAt,
      });
      setWaiting(true);
      addToast({ type: 'success', title: 'Success', description: 'Activation code generated' });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to generate activation code',
      });
    } finally {
      setGeneratingQR(false);
    }
  };

  const activateKiosk = async () => {
    if (!kioskId.trim()) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Please enter a kiosk ID',
      });
      return;
    }

    try {
      setLoading(true);
      await api.updateKioskStatus(kioskId, { active: true });
      addToast({
        type: 'success',
        title: 'Success',
        description: `Kiosk ${kioskId} activated successfully`,
      });
      setKioskId('');
    } catch (error) {
      console.error('Failed to activate kiosk:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to activate kiosk',
      });
    } finally {
      setLoading(false);
    }
  };

  const addSystem = async () => {
    if (!newSystem.trim()) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Please enter a system name',
      });
      return;
    }

    if ((systems || []).includes(newSystem.trim())) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'This system already exists',
      });
      return;
    }

    try {
      const updatedSystems = [...(systems || []), newSystem.trim()];
      await api.updateKioskSystems(updatedSystems);
      setSystems(updatedSystems);
      setNewSystem('');
      addToast({
        type: 'success',
        title: 'Success',
        description: 'System added successfully',
      });
    } catch (error) {
      console.error('Failed to add system:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to add system',
      });
    }
  };

  const removeSystem = async (systemToRemove: string) => {
    try {
      const updatedSystems = (systems || []).filter((s) => s !== systemToRemove);
      await api.updateKioskSystems(updatedSystems);
      setSystems(updatedSystems);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'System removed successfully',
      });
    } catch (error) {
      console.error('Failed to remove system:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to remove system',
      });
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const linkAsset = async () => {
    if (!linkKioskId || (!assetTag && !serialNumber)) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Enter kiosk ID and asset tag or serial',
      });
      return;
    }
    try {
      const res = await fetch('/api/v2/beacon/link-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kioskId: linkKioskId,
          assetTag: assetTag || undefined,
          serialNumber: serialNumber || undefined,
        }),
      });
      if (!res.ok) throw new Error('Link failed');
      const data = await res.json();
      addToast({
        type: 'success',
        title: 'Linked',
        description: `Linked to asset ${data?.result?.asset?.tag || ''}`,
      });
      setLinkKioskId('');
      setAssetTag('');
      setSerialNumber('');
    } catch (e) {
      addToast({ type: 'error', title: 'Error', description: 'Failed to link asset' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kiosk Management</h1>
        <p className="text-gray-600">
          Manage kiosk activation codes, activate kiosks manually, and configure system options.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Manual Activation */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Manual Activation</h2>
          <div className="mb-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${waiting && !paired ? 'animate-pulse bg-blue-100 text-blue-800' : paired ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${waiting && !paired ? 'bg-blue-500' : paired ? 'bg-green-500' : 'bg-gray-400'}`}
              ></span>
              {waiting && !paired ? 'Waiting for kiosk...' : paired ? 'Kiosk Paired' : 'Idle'}
            </span>
          </div>
          <div className="space-y-4">
            <Input
              label="Kiosk ID"
              value={kioskId}
              onChange={(e) => setKioskId(e.target.value)}
              placeholder="Enter kiosk ID to activate"
            />
            <Button
              variant="primary"
              onClick={activateKiosk}
              disabled={loading || !kioskId.trim()}
              className="w-full"
            >
              Activate Kiosk
            </Button>
          </div>
        </Card>

        {/* QR Code Generation */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Generate Activation QR Code</h2>
          <p className="mb-4 text-gray-600">
            Generate a QR code that kiosks can scan to activate themselves.
          </p>
          <Button
            variant="primary"
            onClick={generateActivation}
            disabled={generatingQR}
            className="w-full"
          >
            {generatingQR ? 'Generating...' : 'Generate QR Code'}
          </Button>
          {latestActivation && (
            <div className="mt-4 rounded border p-4 text-center">
              <div className="text-sm text-gray-600">Activation Code</div>
              <div className="text-2xl font-semibold tracking-wider">{latestActivation.code}</div>
              {latestActivation.qr && (
                <img src={latestActivation.qr} alt="QR" className="mx-auto mt-3 h-36" />
              )}
              <div className="mt-2 text-xs text-gray-500">
                Expires {new Date(latestActivation.expiresAt).toLocaleString()}
              </div>
              <div className="mt-3">
                {waiting && !paired && (
                  <div className="animate-pulse text-blue-600">Waiting for kiosk to pair...</div>
                )}
                {paired && <div className="text-green-600">Kiosk paired!</div>}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Link kiosk to inventory asset */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Link Kiosk to Inventory Asset</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            label="Kiosk ID"
            value={linkKioskId}
            onChange={(e) => setLinkKioskId(e.target.value)}
            placeholder="kiosk-001"
          />
          <Input
            label="Asset Tag"
            value={assetTag}
            onChange={(e) => setAssetTag(e.target.value)}
            placeholder="ASSET-123"
          />
          <Input
            label="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="SN123456"
          />
          <Button variant="primary" onClick={linkAsset} className="w-full">
            Link Asset
          </Button>
        </div>
      </Card>

      {/* Systems Management */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Kiosk Systems Configuration</h2>
        <p className="mb-4 text-gray-600">
          Manage the list of systems that appear in the kiosk interface for ticket creation.
        </p>

        {/* Add New System */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <Input
              value={newSystem}
              onChange={(e) => setNewSystem(e.target.value)}
              placeholder="Enter new system name"
              onKeyPress={(e) => e.key === 'Enter' && addSystem()}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={addSystem}
              disabled={!newSystem.trim() || systemsLoading}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>
        </div>

        {/* Systems List */}
        {systemsLoading ? (
          <div className="py-8 text-center">Loading systems...</div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(systems || []).map((system) => (
              <div
                key={system}
                className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2"
              >
                <span className="text-sm font-medium text-gray-900">{system}</span>
                <button
                  onClick={() => removeSystem(system)}
                  className="text-red-500 transition-colors hover:text-red-700"
                  title="Remove system"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            {(systems || []).length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500">
                No systems configured yet.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Activation Codes List */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Activation Codes</h2>
          <Button
            variant="bordered"
            size="sm"
            onClick={loadActivations}
            disabled={loading}
            className="text-blue-600 hover:text-blue-900"
            title="Refresh activation codes"
          >
            <ArrowPathIcon className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center">Loading activations...</div>
        ) : activations.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No activation codes generated yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activations.map((activation) => (
              <div
                key={activation.id}
                className={`rounded-lg border p-4 ${
                  activation.used
                    ? 'border-gray-300 bg-gray-50'
                    : isExpired(activation.expiresAt)
                      ? 'border-red-300 bg-red-50'
                      : 'border-green-300 bg-green-50'
                }`}
              >
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-900">Code: {activation.code}</div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(activation.createdAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Expires: {new Date(activation.expiresAt).toLocaleString()}
                  </div>
                </div>

                {activation.qrCode && (
                  <div className="mb-3 text-center">
                    <img
                      src={activation.qrCode}
                      alt="QR Code"
                      className="mx-auto h-32 max-w-full"
                    />
                  </div>
                )}

                <div className="text-center">
                  {activation.used ? (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      Used{' '}
                      {activation.usedAt &&
                        `on ${new Date(activation.usedAt).toLocaleDateString()}`}
                    </span>
                  ) : isExpired(activation.expiresAt) ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
