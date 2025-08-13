"use client";
import { useEffect, useRef, useState } from 'react';

export default function InventoryScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e:any) { setError(e.message); }
  }

  useEffect(()=>{ startCamera(); return ()=>{ const v = videoRef.current; const s:any = v?.srcObject; s?.getTracks?.().forEach((t:any)=>t.stop()); }; },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Inventory Scan</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded border"/>
      <div className="text-sm opacity-70">Point the camera at a barcode/QR (decoder integration pending).</div>
    </div>
  );
}