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
      .then((res) => res.json())
      .then((data) => setPackages(data.packages || []))
      .catch(() => setError('Failed to load packages'))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Mailroom Delivery Tracking</h1>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border px-2 py-1"
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
            <th className="border p-2">Tracking #</th>
            <th className="border p-2">Carrier</th>
            <th className="border p-2">Recipient</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg.id}>
              <td className="border p-2">{pkg.trackingNumber}</td>
              <td className="border p-2">{pkg.carrier}</td>
              <td className="border p-2">{pkg.recipientId}</td>
              <td className="border p-2">{pkg.status}</td>
              <td className="border p-2">{pkg.assignedLocation || '-'}</td>
              <td className="border p-2">{new Date(pkg.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackingPage;
