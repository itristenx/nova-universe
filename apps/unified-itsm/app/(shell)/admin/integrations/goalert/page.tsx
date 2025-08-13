"use client";
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../../lib/api';

export default function GoAlertAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [onCall, setOnCall] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{
    try{
      const u:any = await apiFetch('/api/v2/goalert/users');
      setUsers(u.users || []);
      const s:any = await apiFetch('/api/v2/goalert/schedules');
      setSchedules(s.schedules || []);
      const a:any = await apiFetch('/api/v2/goalert/alerts');
      setAlerts(a.alerts || a || []);
    }catch(e:any){ setError(e.message); }
  })(); },[]);

  async function loadOnCall(id:string){
    setSelectedSchedule(id);
    try{ const r:any = await apiFetch(`/api/v2/goalert/schedules/${id}/on-call`); setOnCall(r.onCall || []);}catch(e:any){ setError(e.message); }
  }

  async function filterAlerts(){
    try{ const qs = serviceId?`?serviceID=${encodeURIComponent(serviceId)}`:''; const r:any = await apiFetch(`/api/v2/goalert/alerts${qs}`); setAlerts(r.alerts || r || []);}catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">GoAlert Integration</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="font-medium mb-2">Users</div>
          <ul className="divide-y rounded border max-h-[400px] overflow-auto">
            {users.map((u:any)=>(
              <li key={u.id} className="p-3 text-sm">
                <div className="font-medium">{u.name}</div>
                <div className="opacity-70">{u.email}</div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Schedules</div>
          <ul className="divide-y rounded border max-h-[240px] overflow-auto">
            {schedules.map((s:any)=>(
              <li key={s.id} className="p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="opacity-70">{s.timeZone}</div>
                </div>
                <button className="text-sm underline" onClick={()=>loadOnCall(s.id)}>On-call</button>
              </li>
            ))}
          </ul>
          {selectedSchedule && (
            <div className="mt-3">
              <div className="font-medium">Current On-call</div>
              <div className="rounded border p-3 text-sm space-y-1">
                {onCall.length === 0 && <div className="opacity-70">No active on-call users.</div>}
                {onCall.map((o:any, idx:number)=>(
                  <div key={idx} className="flex items-center justify-between">
                    <div>{o.user?.name || o.userID}</div>
                    <div className="opacity-70">{o.start} → {o.end}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded border p-3">
        <div className="font-medium mb-2">Alerts</div>
        <div className="flex gap-2 mb-2">
          <input className="border rounded px-3 py-2" placeholder="Filter by serviceID" value={serviceId} onChange={e=>setServiceId(e.target.value)} />
          <button className="rounded px-3 py-2 border" onClick={filterAlerts}>Apply</button>
        </div>
        <ul className="divide-y max-h-[320px] overflow-auto">
          {alerts.map((a:any)=>(
            <li key={a.id} className="p-2 text-sm">
              <div className="font-medium">{a.summary || a.status}</div>
              <div className="opacity-70">{a.serviceID || ''} · {a.status} · {a.severity}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}