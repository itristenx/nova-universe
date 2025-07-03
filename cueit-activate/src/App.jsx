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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
      <h1>Kiosk Activation</h1>
      <input
        type="text"
        value={kioskId}
        onChange={(e) => setKioskId(e.target.value)}
        placeholder="Enter kiosk ID"
        style={{ padding: '0.5rem', marginBottom: '1rem', width: '200px' }}
      />
      <button onClick={activate} style={{ padding: '0.5rem 1rem' }}>Activate</button>
      {message && <p>{message}</p>}
    </div>
  );
}
