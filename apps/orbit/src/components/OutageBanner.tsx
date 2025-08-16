'use client';

import { useEffect, useState } from 'react';

export function _OutageBanner() {
  const [status, setStatus] = useState<'operational' | 'degraded' | 'major_outage' | 'maintenance' | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let isComponentMounted = true;
    const tenant = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || 'public' : 'public';

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/monitoring/status/${tenant}`); // TODO-LINT: move to async function
        if (!res.ok) return;
        const data = await res.json(); // TODO-LINT: move to async function
        if (!isComponentMounted) return;
        setStatus(data.overall_status);
        const activeIncidents = Array.isArray(data.active_incidents) ? data.active_incidents : [];
        if (data.overall_status === 'major_outage' && activeIncidents.length > 0) {
          const inc = activeIncidents[0];
          setMessage(`Major outage: ${inc.summary || 'Multiple services impacted'}`);
        } else if (data.overall_status === 'degraded') {
          setMessage('Some services are degraded.');
        } else if (data.overall_status === 'maintenance') {
          setMessage('Scheduled maintenance in progress.');
        } else {
          setMessage('');
        }
      } catch {
        // ignore
      }
    }

    fetchStatus();
    const id = setInterval(fetchStatus, 30000);
    return () => {
      isComponentMounted = false;
      clearInterval(id);
    };
  }, []);

  if (!status || status === 'operational' || !message) return null;

  const className = status === 'major_outage' ? 'bg-red-600' : status === 'degraded' ? 'bg-yellow-500' : 'bg-blue-600';

  return (
    <div className={`${className} text-white text-sm w-full py-2 px-4 text-center`}>
      {message}
    </div>
  );
}