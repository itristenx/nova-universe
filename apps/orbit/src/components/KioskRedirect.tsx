"use client";
import { useEffect } from "react";
import { isTabletOrKiosk } from "../lib/device";

export function _KioskRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined" && isTabletOrKiosk(navigator.userAgent)) {
      if (window.location.pathname !== "/tickets/new") {
        window.location.href = "/tickets/new";
      }
    }
  }, []);
  return null;
}
