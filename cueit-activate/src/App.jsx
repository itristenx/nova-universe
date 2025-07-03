import { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [kioskId, setKioskId] = useState('');
  const [message, setMessage] = useState('');

  const activate = async () => {
    if (!kioskId) return;
    try {
      const api = import.meta.env.VITE_API_URL;
      await axios.put(`${api}/api/kiosks/${kioskId}/active`, { active: true });
      setMessage('Kiosk activated');
    } catch (err) {
      setMessage('Activation failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="panel w-80 space-y-4 text-center">
        <h1 className="text-xl font-bold">Kiosk Activation</h1>
        <input
          type="text"
          value={kioskId}
          onChange={(e) => setKioskId(e.target.value)}
          placeholder="Enter kiosk ID"
          className="w-full px-2 py-1 rounded text-black"
        />
        <button onClick={activate} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
          Activate
        </button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

