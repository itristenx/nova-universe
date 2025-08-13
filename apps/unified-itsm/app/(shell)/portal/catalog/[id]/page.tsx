"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../lib/api';

function uuidv4() {
  return (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) ||
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

export default function CatalogItemPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{
    try {
      const list:any = await apiFetch('/api/v1/catalog-items');
      const arr = list.items || list || [];
      const found = arr.find((x:any)=> String(x.id) === String(params.id));
      if (found) {
        setItem(found);
        // initialize values, apply simple autofill for user fields
        const v: Record<string,any> = {};
        (found.form_schema?.fields || []).forEach((f:any)=>{
          if (f.autofill === 'user.name') v[f.id] = '[Your Name]';
          if (f.autofill === 'user.department') v[f.id] = '[Your Department]';
          if (f.default !== undefined) v[f.id] = f.default;
        });
        setValues(v);
      } else {
        setError('Item not found');
      }
    } catch(e:any){ setError(e.message); }
  })(); },[params?.id]);

  function setField(id:string, val:any){ setValues(v=>({ ...v, [id]: val })); }

  async function submit(){
    setMessage(null); setError(null);
    try {
      const reqId = uuidv4();
      await apiFetch(`/api/v1/orbit/catalog/${params.id}`, { method:'POST', body: JSON.stringify({ reqId, values }) });
      setMessage('Request submitted. Redirecting…');
      setTimeout(()=> router.push('/(shell)/portal/catalog'), 1000);
    } catch(e:any){ setError(e.message); }
  }

  if (!item) return <div className="p-4">Loading… {error && <span className="text-sm text-red-600">{error}</span>}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{item.name}</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}
      <div className="rounded border p-3 space-y-3">
        {(item.form_schema?.fields || []).map((f:any)=> (
          <div key={f.id} className="space-y-1">
            <label className="text-sm opacity-70">{f.label}</label>
            {f.type === 'text' && (
              <input className="border rounded px-3 py-2 w-full" value={values[f.id] || ''} onChange={e=>setField(f.id, e.target.value)} />
            )}
            {f.type === 'textarea' && (
              <textarea className="border rounded px-3 py-2 w-full" value={values[f.id] || ''} onChange={e=>setField(f.id, e.target.value)} />
            )}
            {f.type === 'number' && (
              <input type="number" className="border rounded px-3 py-2 w-full" value={values[f.id] ?? ''} onChange={e=>setField(f.id, Number(e.target.value))} />
            )}
            {f.type === 'select' && (
              <select className="border rounded px-3 py-2 w-full" value={values[f.id] || ''} onChange={e=>setField(f.id, e.target.value)}>
                <option value="">Select…</option>
                {(f.options||[]).map((o:any)=> <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {f.type === 'multiselect' && (
              <select multiple className="border rounded px-3 py-2 w-full" value={values[f.id] || []} onChange={e=>setField(f.id, Array.from(e.target.selectedOptions).map(o=>o.value))}>
                {(f.options||[]).map((o:any)=> <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          </div>
        ))}
        <button className="rounded px-3 py-2 border" onClick={submit}>Submit Request</button>
      </div>
    </div>
  );
}