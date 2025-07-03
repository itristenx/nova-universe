import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import SettingsPanel from './SettingsPanel';
import './App.css';

const urgencyPriority = { Urgent: 3, High: 2, Medium: 1, Low: 0 };

function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [systemFilter, setSystemFilter] = useState('');

  const filteredLogs = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = logs.filter((log) => {
      const matchesSearch =
        log.name.toLowerCase().includes(searchLower) ||
        log.email.toLowerCase().includes(searchLower) ||
        log.system.toLowerCase().includes(searchLower);

      const matchesUrgency = urgencyFilter ? log.urgency === urgencyFilter : true;
      const matchesSystem = systemFilter ? log.system === systemFilter : true;

      return matchesSearch && matchesUrgency && matchesSystem;
    });

    return [...filtered].sort((a, b) => {
      if (sortField === 'timestamp') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      if (sortField === 'urgency') {
        return (urgencyPriority[b.urgency] || 0) - (urgencyPriority[a.urgency] || 0);
      }
      return (a[sortField] || '').localeCompare(b[sortField] || '');
    });
  }, [logs, search, sortField, urgencyFilter, systemFilter]);

  const uniqueSystems = useMemo(
    () => [...new Set(logs.map((log) => log.system))],
    [logs]
  );

  const [config, setConfig] = useState({
    logoUrl: import.meta.env.VITE_LOGO_URL,
    faviconUrl: import.meta.env.VITE_FAVICON_URL,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = import.meta.env.VITE_API_URL;
        const [logsRes, configRes] = await Promise.all([
          axios.get(`${api}/api/logs`),
          axios.get(`${api}/api/config`)
        ]);
        setLogs(logsRes.data);
        setConfig((c) => ({ ...c, ...configRes.data }));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const link = document.getElementById('favicon');
    if (link && config.faviconUrl) {
      link.href = config.faviconUrl;
    }
  }, [config.faviconUrl]);

  return (
    <>
      <Navbar
        logo={config.logoUrl}
        search={search}
        setSearch={setSearch}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        openSettings={() => setShowSettings(true)}
      />
      <div className="min-h-screen bg-gray-900 text-white pb-8 flex flex-col">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <p className="text-gray-400 text-center">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-400 text-center">No tickets found.</p>
          ) : (
            <div className="bg-white text-black shadow-xl rounded-lg overflow-hidden p-6">
              <div className="mb-12 px-4 space-y-4">
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex gap-3 justify-end w-full flex-wrap sm:flex-nowrap mb-4">
                    <select
                      value={urgencyFilter}
                      onChange={(e) => setUrgencyFilter(e.target.value)}
                      className="px-4 py-2 border rounded-md text-sm"
                    >
                      <option value="">All Urgencies</option>
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <select
                      value={systemFilter}
                      onChange={(e) => setSystemFilter(e.target.value)}
                      className="px-4 py-2 border rounded-md text-sm"
                    >
                      <option value="">All Systems</option>
                      {uniqueSystems.map((system) => (
                        <option key={system} value={system}>{system}</option>
                      ))}
                    </select>
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                      className="px-4 py-2 border rounded-md text-sm"
                    >
                      <option value="timestamp">Sort by Date</option>
                      <option value="urgency">Sort by Urgency</option>
                      <option value="name">Sort by Name</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto mt-6 bg-gray-100 rounded-xl p-4">
                <table className="min-w-full text-sm table-auto border-collapse rounded-lg overflow-hidden shadow-md">
                  <thead className="bg-gray-100 sticky top-0 z-10 text-sm font-semibold text-gray-900 tracking-wide">
                    <tr className="border-b border-gray-300">
                      <th className="px-4 py-2 text-left whitespace-nowrap">Ticket ID</th>
                      <th className="px-4 py-2 text-left whitespace-nowrap">Name</th>
                      <th className="px-4 py-2 text-left whitespace-nowrap">Email</th>
                      <th className="px-4 py-2 text-left whitespace-nowrap">Title</th>
                      <th className="px-4 py-2 text-left whitespace-nowrap">System</th>
                      <th className="px-4 py-2 text-left whitespace-nowrap">Urgency</th>
                      <th className="px-4 py-2 text-left whitespace-nowrap">Email Status</th>
                      <th className="px-4 py-2 text-left whitespace-nowrap">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.ticket_id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition divide-x divide-gray-200">
                        <td className="px-4 py-2 text-left font-mono">{log.ticket_id}</td>
                        <td className="px-4 py-2 text-left">{log.name}</td>
                        <td className="px-4 py-2 text-left">{log.email}</td>
                        <td className="px-4 py-2 text-left">{log.title}</td>
                        <td className="px-4 py-2 text-left">{log.system}</td>
                        <td className="px-4 py-2 text-left">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold
                              ${log.urgency === 'Urgent' ? 'bg-red-600 text-white' :
                                log.urgency === 'High' ? 'bg-orange-400 text-black' :
                                log.urgency === 'Medium' ? 'bg-yellow-300 text-black' :
                                'bg-green-300 text-black'}`}
                          >
                            {log.urgency}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-left">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${log.email_status === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
                            {log.email_status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-left text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="text-center text-gray-400 py-4">CueIT Admin</footer>
      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        setConfig={setConfig}
        saveConfig={async () => {
          try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/config`, config);
            alert('Saved');
          } catch {
            alert('Failed');
          }
        }}
      />
    </>
  );
}

export default App;

