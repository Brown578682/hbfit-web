"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const view = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i);
  return view;
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

/** Registers /sw.js if not already registered, returns the registration. */
async function getOrRegisterSW(): Promise<ServiceWorkerRegistration> {
  // Check if one is already registered
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;

  // Register fresh
  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

  // Wait for it to become active (max 5 s)
  return new Promise((resolve, reject) => {
    if (reg.active) { resolve(reg); return; }
    const sw = reg.installing ?? reg.waiting;
    if (!sw) { reject(new Error("SW install state unknown")); return; }
    const timeout = setTimeout(() => reject(new Error("SW activation timed out")), 5000);
    sw.addEventListener("statechange", () => {
      if (sw.state === "activated") {
        clearTimeout(timeout);
        resolve(reg);
      }
    });
  });
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [subscribed, setSubscribed]   = useState(false);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermission);
    checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      if (!reg) { setSubscribed(false); return; }
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch {
      setSubscribed(false);
    }
  }

  async function subscribe() {
    if (!("serviceWorker" in navigator)) return;
    setLoading(true);
    try {
      const reg = await getOrRegisterSW();

      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== "granted") return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as unknown as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (res.ok) {
        setSubscribed(true);
      } else {
        console.error("[Push] Server rejected subscription:", await res.text());
      }
    } catch (err) {
      console.error("[Push] subscribe failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
      }
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }

  return { permission, subscribed, loading, subscribe, unsubscribe };
}
