"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Invisible tap zone — bottom-right corner of the screen.
 * Tap 5 times within 3 seconds to navigate to /kiosk.
 * No visual feedback by design.
 */
export function KioskTrigger() {
  const router = useRouter();
  const tapsRef = useRef<number[]>([]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    tapsRef.current = [...tapsRef.current, now].filter((t) => now - t < 3000);
    if (tapsRef.current.length >= 5) {
      tapsRef.current = [];
      router.push("/kiosk");
    }
  }, [router]);

  return (
    <div
      aria-hidden="true"
      onClick={handleTap}
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: 60,
        height: 60,
        zIndex: 9999,
        cursor: "default",
        WebkitTapHighlightColor: "transparent",
      }}
    />
  );
}
