"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const DISMISSED_KEY = "hbfit_pwa_banner_dismissed";

export function PWAInstallBanner() {
  const { canInstall, installed, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(true); // start hidden, read localStorage
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem(DISMISSED_KEY);
    setDismissed(val === "1");
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  const handleInstall = async () => {
    setInstalling(true);
    const outcome = await install();
    setInstalling(false);
    if (outcome === "accepted") dismiss();
  };

  // Only show if: prompt available, not already installed, not dismissed
  if (!canInstall || installed || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 flex items-start gap-4 animate-in slide-in-from-bottom-4 duration-300">
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
        <Download size={18} className="text-white" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-montserrat font-bold text-sm text-white">Install Honor Bound FIT</p>
        <p className="font-lora text-xs text-zinc-400 mt-0.5">
          Add to your home screen for quick access to your dashboard.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {installing ? "Installing…" : "Install"}
          </button>
          <button
            onClick={dismiss}
            className="font-montserrat text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>

      {/* Close */}
      <button onClick={dismiss} className="shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}
