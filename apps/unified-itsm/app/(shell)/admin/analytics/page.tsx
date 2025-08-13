"use client";
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function AdminAnalyticsPage() {
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const lineRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(()=>{
    const barCtx = barRef.current?.getContext('2d');
    const lineCtx = lineRef.current?.getContext('2d');
    let bar: any, line: any;
    if (barCtx) {
      bar = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
          datasets: [{ label: 'Tickets Opened', data: [12,9,14,11,7,5,3], backgroundColor: 'rgba(59,130,246,0.5)' }]
        },
      });
    }
    if (lineCtx) {
      line = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: ['W1','W2','W3','W4'],
          datasets: [
            { label: 'Avg SLA (hrs)', data: [8,7.5,7.2,6.9], borderColor: 'rgba(16,185,129,1)', fill: false },
            { label: 'Breaches', data: [3,2,4,1], borderColor: 'rgba(239,68,68,1)', fill: false }
          ]
        },
      });
    }
    return ()=>{ bar?.destroy?.(); line?.destroy?.(); };
  },[]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded border p-3">
          <div className="text-sm opacity-70 mb-2">Daily Tickets Opened</div>
          <canvas ref={barRef} height={160} />
        </div>
        <div className="rounded border p-3">
          <div className="text-sm opacity-70 mb-2">SLA Trend</div>
          <canvas ref={lineRef} height={160} />
        </div>
      </div>
    </div>
  );
}