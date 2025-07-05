import { useState } from 'react';
import axios from 'axios';
import theme from '../../design/theme.js';

export default function App() {
  const [kioskId, setKioskId] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const adminUrl = import.meta.env.VITE_ADMIN_URL;

  const activate = async () => {
    if (!kioskId) return;
    setStatus('loading');
    setMessage('');
    try {
      const api = import.meta.env.VITE_API_URL;
      await axios.put(`${api}/api/kiosks/${kioskId}/active`, { active: true });
      setMessage('Kiosk activated');
      setStatus('success');
    } catch (err) {
      setMessage('Activation failed');
      setStatus('error');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        fontFamily: theme.fonts.sans.join(','),
        color: theme.colors.content,
      }}
    >
      <h1 style={{ marginBottom: theme.spacing.md }}>Kiosk Activation</h1>
      <input
        type="text"
        value={kioskId}
        onChange={(e) => setKioskId(e.target.value)}
        placeholder="Enter kiosk ID"
        style={{
          padding: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          width: '200px',
          border: `1px solid ${theme.colors.secondary}`,
          borderRadius: '4px',
        }}
      />
      <button
        onClick={activate}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          backgroundColor: theme.colors.primary,
          color: theme.colors.base,
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Activate
      </button>
      {status === 'loading' && (
        <p
          role="status"
          style={{ color: theme.colors.yellow, marginTop: theme.spacing.md }}
        >
          Loading...
        </p>
      )}
      {message && status !== 'loading' && (
        <p
          style={{
            marginTop: theme.spacing.md,
            color:
              status === 'success'
                ? theme.colors.green
                : status === 'error'
                  ? theme.colors.red
                  : theme.colors.content,
          }}
        >
          {message}
        </p>
      )}
      {adminUrl && (
        <a
          href={adminUrl}
          style={{
            marginTop: theme.spacing.md,
            color: theme.colors.primary,
            textDecoration: 'underline',
          }}
        >
          Go to Admin UI
        </a>
      )}
    </div>
  );
}
