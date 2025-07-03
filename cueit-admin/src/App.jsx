import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar.jsx';
import SettingsPanel from './SettingsPanel.jsx';
import UsersPanel from './UsersPanel.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [config, setConfig] = useState({
    logoUrl: import.meta.env.VITE_LOGO_URL,
    faviconUrl: import.meta.env.VITE_FAVICON_URL,
  });

  useEffect(() => {
    (async () => {
      try {
        const api = import.meta.env.VITE_API_URL;
        const { data } = await axios.get(`${api}/api/config`);
        setConfig((c) => ({ ...c, ...data }));
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    const link = document.getElementById('favicon');
    if (link && config.faviconUrl) link.href = config.faviconUrl;
  }, [config.faviconUrl]);

  return (
    <Router>
      <Navbar logo={config.logoUrl} />
      <div className="container mx-auto py-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPanel open={true} onClose={() => history.back()} config={config} setConfig={setConfig} />} />
          <Route path="/users" element={<UsersPanel open={true} />} />
        </Routes>
      </div>
    </Router>
  );
}
