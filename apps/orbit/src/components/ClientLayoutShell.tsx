"use client";

import React, { useEffect, useState } from "react";
import { KioskRedirect } from "../components/KioskRedirect";
import { PWAInstaller } from "../components/PWAInstaller";
import { PerformanceMonitor } from "../lib/performance";

function OutageBanner() {
  const [status, setStatus] = useState<
    "operational" | "degraded" | "major_outage" | "maintenance" | null
  >(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let active = true;
    const tenant =
      typeof window !== "undefined"
        ? localStorage.getItem("tenant_id") || "public"
        : "public";

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/monitoring/status/${tenant}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setStatus(data.overall_status);
        const activeIncidents = Array.isArray(data.active_incidents)
          ? data.active_incidents
          : [];
        if (data.overall_status === "major_outage" && activeIncidents.length > 0) {
          const inc = activeIncidents[0];
          setMessage(
            `Major outage: ${inc.summary || "Multiple services impacted"}`
          );
        } else if (data.overall_status === "degraded") {
          setMessage("Some services are degraded.");
        } else if (data.overall_status === "maintenance") {
          setMessage("Scheduled maintenance in progress.");
        } else {
          setMessage("");
        }
      } catch {}
    }

    fetchStatus();
    const id = setInterval(fetchStatus, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!status || status === "operational" || !message) return null;

  const cls =
    status === "major_outage"
      ? "bg-red-600"
      : status === "degraded"
      ? "bg-yellow-500"
      : "bg-blue-600";

  return (
    <div className={`${cls} text-white text-sm w-full py-2 px-4 text-center`}>
      {message}
    </div>
  );
}

export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      PerformanceMonitor.getInstance();
    }
  }, []);

  return (
    <>
      <OutageBanner />
      <PWAInstaller />
      <KioskRedirect />
      {children}
    </>
  );
}