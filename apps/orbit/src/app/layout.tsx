'use client';

import React, { useEffect, useState } from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KioskRedirect } from "../components/KioskRedirect";
import { PWAInstaller } from "../components/PWAInstaller";
import { defaultBranding } from "../lib/branding";

// Initialize performance monitoring
import { PerformanceMonitor } from "../lib/performance";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nova Universe - IT Service Management",
  description: "Advanced IT Service Management platform with AI-powered automation and intelligent workflows",
  manifest: "/manifest.json",
  themeColor: "#1e40af",
  viewport: "width=device-width, initial-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nova Universe",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#1e40af",
    "msapplication-config": "/browserconfig.xml",
  },
};

function OutageBanner() {
  const [status, setStatus] = useState<'operational' | 'degraded' | 'major_outage' | 'maintenance' | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let active = true;
    const tenant = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || 'public' : 'public';

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/monitoring/status/${tenant}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
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
      } catch {}
    }

    fetchStatus();
    const id = setInterval(fetchStatus, 30000);
    return () => { active = false; clearInterval(id); };
  }, []);

  if (!status || status === 'operational' || !message) return null;

  const cls = status === 'major_outage' ? 'bg-red-600' : status === 'degraded' ? 'bg-yellow-500' : 'bg-blue-600';

  return (
    <div className={`${cls} text-white text-sm w-full py-2 px-4 text-center`}> 
      {message}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize performance monitoring in client-side
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      PerformanceMonitor.getInstance();
    }
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased branding-theme`}
        data-color-primary={defaultBranding.primaryColor}
        data-color-secondary={defaultBranding.secondaryColor}
      >
        <OutageBanner />
        <PWAInstaller />
        <KioskRedirect />
        {children}
      </body>
    </html>
  );
}
