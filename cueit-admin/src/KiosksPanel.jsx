import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function KiosksPanel({ open, onClose }) {
  const [kiosks, setKiosks] = useState([]);
  const api = process.env.VITE_API_URL;

  useEffect(() => {
    if (open) {
      axios.get(`${api}/api/kiosks`).then((res) => setKiosks(res.data));
    }
  }, [open, api]);

  const toggle = async (id, active) => {
    await axios.put(`${api}/api/kiosks/${id}/active`, { active: !active });
    setKiosks((k) => k.map((x) => (x.id === id ? { ...x, active: !active } : x)));
  };

  const save = async (kiosk) => {
    await axios.put(`${api}/api/kiosks/${kiosk.id}`, {
      logoUrl: kiosk.logoUrl,
      bgUrl: kiosk.bgUrl,
    });
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-60 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div
        className={`absolute right-0 top-0 bottom-0 w-96 bg-gray-800 text-white p-6 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button onClick={onClose} className="mb-4 text-right w-full hover:text-gray-300">
          ✖
        </button>
        <h2 className="text-lg mb-4">Kiosks</h2>
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
                  <button
                    onClick={() => save(k)}
                    className="px-2 py-1 rounded text-xs bg-blue-600"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
