import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import UsersPanel from './UsersPanel.jsx';
import useToast from './useToast.js';
import useApiError from './useApiError.js';

export default function SettingsPanel({ open, onClose, config, setConfig }) {
  const [tab, setTab] = useState('general');
  const [kiosks, setKiosks] = useState([]);
  const api = import.meta.env.VITE_API_URL;
  const activateUrl = import.meta.env.VITE_ACTIVATE_URL;
  const toast = useToast();
  const handleApiError = useApiError();

  useEffect(() => {
    if (open && tab === 'kiosks') {
      (async () => {
        try {
          const res = await axios.get(`${api}/api/kiosks`);
          setKiosks(res.data);
        } catch (err) {
          handleApiError(err, 'Failed to load kiosks');
        }
      })();
    }
  }, [open, tab, api, handleApiError]);

  const saveConfig = async () => {
    try {
      await axios.put(`${api}/api/config`, config);
      toast('Configuration saved');
    } catch (err) {
      handleApiError(err, 'Failed to save configuration');
    }
  };

  const toggle = async (id, active) => {
    try {
      await axios.put(`${api}/api/kiosks/${id}/active`, { active: !active });
      setKiosks((k) => k.map((x) => (x.id === id ? { ...x, active: !active } : x)));
    } catch (err) {
      handleApiError(err, 'Failed to toggle kiosk');
    }
  };

  const saveKiosk = async (kiosk) => {
    try {
      await axios.put(`${api}/api/kiosks/${kiosk.id}`, {
        logoUrl: kiosk.logoUrl,
        bgUrl: kiosk.bgUrl,
      });
    } catch (err) {
      handleApiError(err, 'Failed to save kiosk');
    }
  };

  const deleteKiosk = async (id) => {
    try {
      await axios.delete(`${api}/api/kiosks/${id}`);
      setKiosks((ks) => ks.filter((x) => x.id !== id));
    } catch (err) {
      handleApiError(err, 'Failed to delete kiosk');
    }
  };

  const clearKiosks = async () => {
    try {
      await axios.delete(`${api}/api/kiosks`);
      setKiosks([]);
    } catch (err) {
      handleApiError(err, 'Failed to clear kiosks');
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className={`absolute right-0 top-0 bottom-0 w-96 bg-gray-800 text-white p-6 transform transition-all duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={onClose} className="mb-4 text-right w-full hover:text-gray-300">
          <XMarkIcon className="w-5 h-5 inline" />
        </button>
        <div className="flex mb-4 border-b border-gray-700 text-sm">
          <button className={`mr-4 pb-2 ${tab === 'general' ? 'border-b-2 border-white' : 'text-gray-400'}`} onClick={() => setTab('general')}>General</button>
          <button className={`mr-4 pb-2 ${tab === 'kiosks' ? 'border-b-2 border-white' : 'text-gray-400'}`} onClick={() => setTab('kiosks')}>Kiosks</button>
          <button className={`pb-2 ${tab === 'users' ? 'border-b-2 border-white' : 'text-gray-400'}`} onClick={() => setTab('users')}>Users</button>
        </div>
        {tab === 'general' && (
          <div className="space-y-3 text-sm overflow-y-auto">
            <label className="block">
              Logo URL
              <input
                type="text"
                value={config.logoUrl || ''}
                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                className="mt-1 w-full px-2 py-1 rounded text-black"
              />
            </label>
            <label className="block">
              Favicon URL
              <input
                type="text"
                value={config.faviconUrl || ''}
                onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                className="mt-1 w-full px-2 py-1 rounded text-black"
              />
            </label>
            <label className="block">
              Welcome Message
              <input
                type="text"
                value={config.welcomeMessage || ''}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                className="mt-1 w-full px-2 py-1 rounded text-black"
              />
            </label>
            <label className="block">
              Help Message
              <input
                type="text"
                value={config.helpMessage || ''}
                onChange={(e) => setConfig({ ...config, helpMessage: e.target.value })}
                className="mt-1 w-full px-2 py-1 rounded text-black"
              />
            </label>
            <button onClick={saveConfig} className="px-4 py-2 bg-blue-600 text-white rounded mt-2">Save</button>
            <div className="pt-4 border-t border-gray-700 text-gray-300 text-xs space-y-2">
              <div>Environment</div>
              <label className="block">
                API URL
                <input
                  type="text"
                  value={import.meta.env.VITE_API_URL}
                  readOnly
                  className="mt-1 w-full px-2 py-1 rounded bg-gray-700 text-gray-400"
                />
              </label>
              <label className="block">
                Default Logo
                <input
                  type="text"
                  value={import.meta.env.VITE_LOGO_URL}
                  readOnly
                  className="mt-1 w-full px-2 py-1 rounded bg-gray-700 text-gray-400"
                />
              </label>
              <label className="block">
                Default Favicon
                <input
                  type="text"
                  value={import.meta.env.VITE_FAVICON_URL}
                  readOnly
                  className="mt-1 w-full px-2 py-1 rounded bg-gray-700 text-gray-400"
                />
              </label>
            </div>
          </div>
        )}
        {tab === 'kiosks' && (
          <div className="overflow-y-auto text-sm h-full">
            <div className="flex items-center justify-between mb-2">
              <button onClick={clearKiosks} className="px-2 py-1 bg-red-600 rounded">Clear Kiosks</button>
              {activateUrl && (
                <a href={activateUrl} target="_blank" rel="noopener" className="text-primary underline text-xs">
                  Open Activation Page
                </a>
              )}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Version</th>
                  <th className="pb-2">Last Seen</th>
                  <th className="pb-2">Logo URL</th>
                  <th className="pb-2">Background</th>
                  <th className="pb-2">Active</th>
                  <th className="pb-2"></th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {kiosks.map((k) => (
                  <tr key={k.id} className="border-t border-gray-700">
                    <td className="py-1 pr-2 font-mono break-all">{k.id}</td>
                    <td className="py-1 pr-2">{k.version}</td>
                    <td className="py-1 pr-2 text-xs">{new Date(k.last_seen).toLocaleString()}</td>
                    <td className="py-1 pr-2">
                      <input
                        type="text"
                        value={k.logoUrl || ''}
                        onChange={(e) => setKiosks((ks) => ks.map((x) => x.id === k.id ? { ...x, logoUrl: e.target.value } : x))}
                        className="w-28 px-1 text-black rounded"
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="text"
                        value={k.bgUrl || ''}
                        onChange={(e) => setKiosks((ks) => ks.map((x) => x.id === k.id ? { ...x, bgUrl: e.target.value } : x))}
                        className="w-28 px-1 text-black rounded"
                      />
                    </td>
                    <td className="py-1">
                      <button
                        onClick={() => toggle(k.id, k.active)}
                        className={`px-2 py-1 rounded text-xs ${k.active ? 'bg-green-600' : 'bg-red-600'}`}
                      >
                        {k.active ? 'Disable' : 'Activate'}
                      </button>
                    </td>
                    <td className="py-1 pl-2">
                      <button onClick={() => saveKiosk(k)} className="px-2 py-1 rounded text-xs bg-blue-600">Save</button>
                    </td>
                    <td className="py-1 pl-2">
                      <button onClick={() => deleteKiosk(k.id)} className="px-2 py-1 rounded text-xs bg-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'users' && <UsersPanel open={open && tab === 'users'} />}
      </div>
    </div>
  );
}

