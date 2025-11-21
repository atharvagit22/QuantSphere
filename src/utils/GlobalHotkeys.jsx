// src/utils/GlobalHotkeys.jsx
import { useEffect } from "react";

/**
 * GlobalHotkeys component
 * - Accepts a handler map: { "ctrl+k": ()=>..., "1": ()=>..., ... }
 * - Simple, zero-deps implementation.
 *
 * Usage: <GlobalHotkeys bindings={bindings} />
 */
export default function GlobalHotkeys({ bindings = {} }) {
  useEffect(() => {
    function down(e) {
      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push("ctrl");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      // key normalized
      const k = (e.key || "").toLowerCase();
      // avoid modifier-only
      if (k && !["control", "shift", "alt", "meta"].includes(k)) {
        parts.push(k);
      }
      const key = parts.join("+");
      if (bindings[key]) {
        e.preventDefault();
        try { bindings[key](); } catch (err) { console.error("hotkey error", err); }
      }
    }
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [bindings]);
  return null;
}
