// src/hooks/useHotkeys.js
import { useEffect } from "react";

export default function useHotkeys(mapping = {}) {
  useEffect(() => {
    const handler = (e) => {
      const combo = `${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key}`;
      if (mapping[combo]) {
        e.preventDefault();
        mapping[combo](e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mapping]);
}
