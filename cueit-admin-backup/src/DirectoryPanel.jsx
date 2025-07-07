import { useEffect, useState } from 'react';
import axios from 'axios';
import useToast from './useToast.js';
import useApiError from './useApiError.js';

export default function DirectoryPanel() {
  const [cfg, setCfg] = useState({
    directoryProvider: 'mock',
    directoryUrl: '',
    directoryToken: '',
  });
  const api = import.meta.env.VITE_API_URL;
  const toast = useToast();
  const handleApiError = useApiError();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${api}/api/directory-config`);
        setCfg(res.data);
      } catch (err) {
        handleApiError(err, 'Failed to load directory config');
      }
    })();
  }, [api, handleApiError]);

  const save = async () => {
    try {
      await axios.put(`${api}/api/directory-config`, cfg);
      toast('Saved');
    } catch (err) {
      handleApiError(err, 'Failed to save config');
    }
  };

  const test = async () => {
    try {
      await axios.get(`${api}/api/directory-search`, { params: { q: 'test' } });
      toast('Connection successful');
    } catch (err) {
      handleApiError(err, 'Connection failed');
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <label className="block">
        Provider
        <select
          value={cfg.directoryProvider}
          onChange={(e) => setCfg({ ...cfg, directoryProvider: e.target.value })}
          className="mt-1 w-full px-2 py-1 rounded text-black"
        >
          <option value="mock">Mock</option>
          <option value="scim">SCIM</option>
        </select>
      </label>
      <label className="block">
        URL
        <input
          type="text"
          value={cfg.directoryUrl || ''}
          onChange={(e) => setCfg({ ...cfg, directoryUrl: e.target.value })}
          className="mt-1 w-full px-2 py-1 rounded text-black"
        />
      </label>
      <label className="block">
        Token
        <input
          type="text"
          value={cfg.directoryToken || ''}
          onChange={(e) => setCfg({ ...cfg, directoryToken: e.target.value })}
          className="mt-1 w-full px-2 py-1 rounded text-black"
        />
      </label>
      <div className="space-x-2">
        <button onClick={save} className="px-4 py-1 bg-blue-600 text-white rounded">
          Save
        </button>
        <button onClick={test} className="px-4 py-1 bg-green-600 text-white rounded">
          Test
        </button>
      </div>
    </div>
  );
}
