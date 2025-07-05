import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useApiError from './useApiError.js';

export default function FeedbackPanel({ open }) {
  const [items, setItems] = useState([]);
  const api = import.meta.env.VITE_API_URL;
  const handleApiError = useApiError();

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const res = await axios.get(`${api}/api/feedback`);
          setItems(res.data);
        } catch (err) {
          handleApiError(err, 'Failed to load feedback');
        }
      })();
    }
  }, [open, api, handleApiError]);

  if (!open) return null;

  return (
    <div className="overflow-y-auto text-sm h-full">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="pb-2">Date</th>
            <th className="pb-2">Name</th>
            <th className="pb-2">Message</th>
          </tr>
        </thead>
        <tbody>
          {items.map((f) => (
            <tr key={f.id} className="border-t border-gray-700">
              <td className="py-1 pr-2 text-xs">{new Date(f.timestamp).toLocaleString()}</td>
              <td className="py-1 pr-2">{f.name}</td>
              <td className="py-1 pr-2">{f.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
