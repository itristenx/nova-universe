import React, { useState } from 'react';

const IntakePage = () => {
  const [form, setForm] = useState({
    trackingNumber: '',
    carrier: '',
    sender: '',
    recipientId: '',
    department: '',
    packageType: '',
    assignedLocation: '',
    flags: '',
    linkedTicketId: '',
    linkedAssetId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/mailroom/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, flags: form.flags.split(',').map((f) => f.trim()) }),
      });
      if (!res.ok) throw new Error('Failed to create package');
      setSuccess(true);
      setForm({
        trackingNumber: '',
        carrier: '',
        sender: '',
        recipientId: '',
        department: '',
        packageType: '',
        assignedLocation: '',
        flags: '',
        linkedTicketId: '',
        linkedAssetId: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Mailroom Intake</h1>
      {error && <div className="text-destructive mb-2">{error}</div>}
      {success && <div className="text-success mb-2">Package created!</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="trackingNumber"
          value={form.trackingNumber}
          onChange={handleChange}
          placeholder="Tracking Number"
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          name="carrier"
          value={form.carrier}
          onChange={handleChange}
          placeholder="Carrier"
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          name="sender"
          value={form.sender}
          onChange={handleChange}
          placeholder="Sender"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="recipientId"
          value={form.recipientId}
          onChange={handleChange}
          placeholder="Recipient Nova ID"
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Department"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="packageType"
          value={form.packageType}
          onChange={handleChange}
          placeholder="Package Type"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="assignedLocation"
          value={form.assignedLocation}
          onChange={handleChange}
          placeholder="Assigned Location"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="flags"
          value={form.flags}
          onChange={handleChange}
          placeholder="Flags (comma separated)"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="linkedTicketId"
          value={form.linkedTicketId}
          onChange={handleChange}
          placeholder="Linked Ticket ID"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="linkedAssetId"
          value={form.linkedAssetId}
          onChange={handleChange}
          placeholder="Linked Asset ID"
          className="w-full rounded border px-3 py-2"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Create Package'}
        </button>
      </form>
    </div>
  );
};

export default IntakePage;
