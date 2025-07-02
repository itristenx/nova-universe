import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3000/api/logs")
      .then((res) => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch logs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <nav className="bg-gray-800 text-white py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span role="img" aria-label="dashboard">🎛</span> CueIT Admin Dashboard
          </div>
        </div>
      </nav>
      <div className="min-h-screen bg-gray-900 text-white pt-4 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <p className="text-gray-400 text-center">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-400 text-center">No tickets found.</p>
          ) : (
            <div className="bg-white text-black shadow-xl rounded-lg overflow-hidden p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-300 border border-gray-400">
                  <thead className="bg-gray-100 sticky top-0 z-10 text-sm font-semibold text-gray-900 tracking-wide border-b border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left">Ticket ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">System</th>
                      <th className="px-4 py-3 text-left">Urgency</th>
                      <th className="px-4 py-3 text-left">Email Status</th>
                      <th className="px-4 py-3 text-left">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.ticket_id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition divide-x divide-gray-200">
                        <td className="px-4 py-3 border border-gray-300 text-left font-mono">{log.ticket_id}</td>
                        <td className="px-4 py-3 border border-gray-300 text-left">{log.name}</td>
                        <td className="px-4 py-3 border border-gray-300 text-left">{log.email}</td>
                        <td className="px-4 py-3 border border-gray-300 text-left">{log.title}</td>
                        <td className="px-4 py-3 border border-gray-300 text-left">{log.system}</td>
                        <td className="px-4 py-3 border border-gray-300 text-left">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${['High', 'Urgent'].includes(log.urgency) ? 'bg-red-600 text-white' :
                              log.urgency === 'Medium' ? 'bg-yellow-300 text-black' :
                              'bg-green-300 text-black'}`}>
                            {log.urgency}
                          </span>
                        </td>
                        <td className="px-4 py-3 border border-gray-300 text-left">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${log.email_status === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
                            {log.email_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 border border-gray-300 text-left text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
