"use client";

import { useEffect } from "react";

/**
 * Registers the service worker unconditionally.
 * next-pwa v5 injects registration via webpack entry — that's broken with
 * Turbopack (Next.js 16 default). This component is the reliable fallback.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[SW] Registered, scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
  }, []);

  return null;
}
