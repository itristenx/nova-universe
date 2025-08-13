"use client";
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link className="card" href="/(shell)/admin/approvals">Approvals</Link>
        <Link className="card" href="/(shell)/admin/integrations/goalert">GoAlert</Link>
        <Link className="card" href="/(shell)/admin/analytics">Analytics</Link>
        <Link className="card" href="/(shell)/admin/status">System Status</Link>
        <Link className="card" href="/(shell)/admin/integrations">Integrations</Link>
      </div>
    </div>
  );
}