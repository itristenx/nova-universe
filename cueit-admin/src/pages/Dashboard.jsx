import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Table from '../components/Table.jsx';
import Input from '../components/Input.jsx';

const urgencyPriority = { Urgent: 3, High: 2, Medium: 1, Low: 0 };

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('timestamp');
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

  const uniqueSystems = useMemo(() => [...new Set(logs.map((log) => log.system))], [logs]);

  useEffect(() => {
    (async () => {
      try {
        const api = import.meta.env.VITE_API_URL;
        const { data } = await axios.get(`${api}/api/logs`);
        setLogs(data);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
        <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="select select-bordered">
          <option value="">All Urgencies</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)} className="select select-bordered">
          <option value="">All Systems</option>
          {uniqueSystems.map((system) => (
            <option key={system} value={system}>{system}</option>
          ))}
        </select>
        <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="select select-bordered">
          <option value="timestamp">Sort by Date</option>
          <option value="urgency">Sort by Urgency</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Title</th>
              <th>System</th>
              <th>Urgency</th>
              <th>Email Status</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.ticket_id}>
                <td className="font-mono">{log.ticket_id}</td>
                <td>{log.name}</td>
                <td>{log.email}</td>
                <td>{log.title}</td>
                <td>{log.system}</td>
                <td>
                  <span className="badge badge-outline">
                    {log.urgency}
                  </span>
                </td>
                <td>
                  <span className={`badge ${log.email_status === 'success' ? 'badge-success' : 'badge-error'}`}>{log.email_status}</span>
                </td>
                <td className="text-xs">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
