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
              <th className="pb-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {kiosks.map((k) => (
              <tr key={k.id} className="border-t border-gray-700">
                <td className="py-1 pr-2 font-mono break-all">{k.id}</td>
                <td className="py-1 pr-2">{k.version}</td>
                <td className="py-1 pr-2 text-xs">{new Date(k.last_seen).toLocaleString()}</td>
                <td className="py-1">
                  <button
                    onClick={() => toggle(k.id, k.active)}
                    className={`px-2 py-1 rounded text-xs ${k.active ? 'bg-green-600' : 'bg-red-600'}`}
                  >
                    {k.active ? 'Disable' : 'Activate'}
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
