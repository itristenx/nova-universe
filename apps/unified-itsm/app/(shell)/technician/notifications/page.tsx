"use client";
import { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(()=>{
    setSupported('serviceWorker' in navigator && 'PushManager' in window);
    if (typeof Notification !== 'undefined') setPermission(Notification.permission);
  },[]);

  async function subscribe() {
    if (!supported) return;
    try {
      await navigator.serviceWorker.register('/sw.js');
      const reg = await navigator.serviceWorker.ready;
      // In a real implementation we would use VAPID and send subscription to server
      await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: new Uint8Array([]) }).catch(()=>null);
      alert('Notifications enabled (dev)');
    } catch (e:any) { alert(e.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notifications</h2>
      {!supported && <div className="text-sm">Web Push not supported in this browser.</div>}
      {supported && (
        <div className="space-y-2">
          <div className="text-sm opacity-80">Permission: {permission}</div>
          <button className="rounded px-3 py-2 border" onClick={subscribe}>Enable Notifications</button>
        </div>
      )}
    </div>
  );
}