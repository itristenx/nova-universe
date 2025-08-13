import React, { useEffect, useState } from 'react';

interface Package {
  id: number;
  trackingNumber: string;
  carrier: string;
  recipientId: string;
  status: string;
  assignedLocation?: string;
  createdAt: string;
}

const TrackingPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/mailroom/packages?status=${status}`)
      .then(res => res.json())
      .then(data => setPackages(data.packages || []))
      .catch(() => setError('Failed to load packages'))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Mailroom Delivery Tracking</h1>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Status:</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border rounded px-2 py-1"
          title="Filter by status"
        >
          <option value="all">All</option>
          <option value="inbound">Inbound</option>
          <option value="ready">Ready</option>
          <option value="picked_up">Picked Up</option>
          <option value="returned">Returned</option>
        </select>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-destructive mb-2">{error}</div>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Tracking #</th>
            <th className="p-2 border">Carrier</th>
            <th className="p-2 border">Recipient</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Location</th>
            <th className="p-2 border">Created</th>
          </tr>
        </thead>
        <tbody>
          {packages.map(pkg => (
            <tr key={pkg.id}>
              <td className="p-2 border">{pkg.trackingNumber}</td>
              <td className="p-2 border">{pkg.carrier}</td>
              <td className="p-2 border">{pkg.recipientId}</td>
              <td className="p-2 border">{pkg.status}</td>
              <td className="p-2 border">{pkg.assignedLocation || '-'}</td>
              <td className="p-2 border">{new Date(pkg.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackingPage;
