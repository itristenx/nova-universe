"use client";
import Link from 'next/link';

export default function AdminStatusPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">System Status</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link className="card" href="/(shell)/admin/integrations">Monitoring Health</Link>
        <Link className="card" href="#">Status Pages</Link>
        <Link className="card" href="#">Incidents</Link>
      </div>
    </div>
  );
}