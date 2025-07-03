import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './components/Modal.jsx';
import Input from './components/Input.jsx';
import Button from './components/Button.jsx';
import Table from './components/Table.jsx';
import UsersPanel from './UsersPanel.jsx';

export default function SettingsPanel({ open, onClose, config, setConfig }) {
  const [tab, setTab] = useState('general');
  const [kiosks, setKiosks] = useState([]);
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open && tab === 'kiosks') {
      (async () => {
        try {
          const res = await axios.get(`${api}/api/kiosks`);
          setKiosks(res.data);
        } catch {
          alert('Failed to load kiosks');
        }
      })();
    }
  }, [open, tab, api]);

  const saveConfig = async () => {
    try {
      await axios.put(`${api}/api/config`, config);
      alert('Saved');
    } catch {
      alert('Failed to save configuration');
    }
  };

  const toggle = async (id, active) => {
    try {
      await axios.put(`${api}/api/kiosks/${id}/active`, { active: !active });
      setKiosks((k) => k.map((x) => (x.id === id ? { ...x, active: !active } : x)));
    } catch {
      alert('Failed to toggle kiosk');
    }
  };

  const saveKiosk = async (kiosk) => {
    try {
      await axios.put(`${api}/api/kiosks/${kiosk.id}`, {
        logoUrl: kiosk.logoUrl,
        bgUrl: kiosk.bgUrl,
      });
    } catch {
      alert('Failed to save kiosk');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="tabs mb-4">
        <a className={`tab tab-bordered ${tab === 'general' ? 'tab-active' : ''}`} onClick={() => setTab('general')}>General</a>
        <a className={`tab tab-bordered ${tab === 'kiosks' ? 'tab-active' : ''}`} onClick={() => setTab('kiosks')}>Kiosks</a>
        <a className={`tab tab-bordered ${tab === 'users' ? 'tab-active' : ''}`} onClick={() => setTab('users')}>Users</a>
      </div>
      {tab === 'general' && (
        <div className="space-y-3 text-sm">
          <label className="form-control">
            <span className="label-text">Logo URL</span>
            <Input value={config.logoUrl || ''} onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text">Favicon URL</span>
            <Input value={config.faviconUrl || ''} onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text">Welcome Message</span>
            <Input value={config.welcomeMessage || ''} onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text">Help Message</span>
            <Input value={config.helpMessage || ''} onChange={(e) => setConfig({ ...config, helpMessage: e.target.value })} />
          </label>
          <Button onClick={saveConfig}>Save</Button>
        </div>
      )}
      {tab === 'kiosks' && (
        <div className="overflow-y-auto max-h-72">
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Version</th>
                <th>Last Seen</th>
                <th>Logo URL</th>
                <th>Background</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {kiosks.map((k) => (
                <tr key={k.id}>
                  <td className="font-mono break-all">{k.id}</td>
                  <td>{k.version}</td>
                  <td className="text-xs">{new Date(k.last_seen).toLocaleString()}</td>
                  <td><Input value={k.logoUrl || ''} onChange={(e) => setKiosks((ks) => ks.map((x) => x.id === k.id ? { ...x, logoUrl: e.target.value } : x))} className="w-28" /></td>
                  <td><Input value={k.bgUrl || ''} onChange={(e) => setKiosks((ks) => ks.map((x) => x.id === k.id ? { ...x, bgUrl: e.target.value } : x))} className="w-28" /></td>
                  <td><Button variant={k.active ? 'success' : 'error'} onClick={() => toggle(k.id, k.active)}>{k.active ? 'Disable' : 'Activate'}</Button></td>
                  <td><Button onClick={() => saveKiosk(k)}>Save</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      {tab === 'users' && <UsersPanel open={open && tab === 'users'} />}
    </Modal>
  );
}
