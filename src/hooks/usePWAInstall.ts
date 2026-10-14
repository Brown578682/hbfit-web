"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Module-level so the event is never lost between component mounts
let _deferredPrompt: BeforeInstallPromptEvent | null = null;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    _deferredPrompt = null;
    notify();
  });
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && !!(window.navigator as { standalone?: boolean }).standalone)
  );
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  const sync = useCallback(() => {
    setCanInstall(!!_deferredPrompt);
    setInstalled(isStandalone());
  }, []);

  useEffect(() => {
    sync();
    _listeners.add(sync);
    return () => { _listeners.delete(sync); };
  }, [sync]);

  const install = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!_deferredPrompt) return "unavailable";
    await _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    if (outcome === "accepted") {
      _deferredPrompt = null;
      setCanInstall(false);
      setInstalled(true);
      notify();
    }
    return outcome;
  }, []);

  return { canInstall, installed, install };
}
