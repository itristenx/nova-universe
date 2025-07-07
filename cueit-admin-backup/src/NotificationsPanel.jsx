import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useApiError from './useApiError.js';
import { colors } from './theme.js';

export default function NotificationsPanel({ open }) {
  const api = import.meta.env.VITE_API_URL;
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState('info');
  const handleApiError = useApiError();

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const res = await axios.get(`${api}/api/notifications`);
          setItems(res.data);
        } catch (err) {
          handleApiError(err, 'Failed to load notifications');
        }
      })();
    }
  }, [open, api, handleApiError]);

  if (!open) return null;

  const add = async () => {
    try {
      const res = await axios.post(`${api}/api/notifications`, { message, level });
      setItems((it) => [
        ...it,
        { id: res.data.id, message, level, active: 1, created_at: new Date().toISOString() },
      ]);
      setMessage('');
    } catch (err) {
      handleApiError(err, 'Failed to add notification');
    }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`${api}/api/notifications/${id}`);
      setItems((it) => it.filter((n) => n.id !== id));
    } catch (err) {
      handleApiError(err, 'Failed to delete notification');
    }
  };

  return (
    <div className="overflow-y-auto text-sm h-full">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          className="flex-grow px-1 text-black rounded"
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="px-1 text-black rounded"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <button
          onClick={add}
          style={{ backgroundColor: colors.primary, color: '#fff' }}
          className="px-2 rounded"
        >
          Add
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="pb-2">Message</th>
            <th className="pb-2">Level</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((n) => (
            <tr key={n.id} className="border-t border-gray-700">
              <td className="py-1 pr-2">{n.message}</td>
              <td className="py-1 pr-2">{n.level}</td>
              <td className="py-1 pr-2">
                <button
                  onClick={() => remove(n.id)}
                  style={{ backgroundColor: colors.accent, color: '#fff' }}
                  className="px-2 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
