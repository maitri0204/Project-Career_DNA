"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * BUG-010 / UX-001 fix:
 * - Removed destructive document.body.innerHTML = "" behavior
 * - Removed devtools size detection (unreliable, harms accessibility)
 * - Only blocks keyboard shortcuts during active test sections, not globally
 * - Right-click is no longer blocked globally
 */
export default function DevToolsBlocker() {
  const pathname = usePathname();
  const isTestSection = pathname?.includes("/test/sections") ?? false;

  useEffect(() => {
    if (typeof window === "undefined" || !isTestSection) return;

    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      if (key === "F12") { e.preventDefault(); e.stopPropagation(); return false; }
      if (ctrl && shift && (key === "I" || key === "i" || key === "J" || key === "j" || key === "C" || key === "c")) {
        e.preventDefault(); e.stopPropagation(); return false;
      }
      if (ctrl && (key === "U" || key === "u")) {
        e.preventDefault(); e.stopPropagation(); return false;
      }
    };

    document.addEventListener("keydown", blockKeys, true);

    return () => {
      document.removeEventListener("keydown", blockKeys, true);
    };
  }, [isTestSection]);

  return null;
}
