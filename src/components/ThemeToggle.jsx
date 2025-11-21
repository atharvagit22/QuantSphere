// src/components/ThemeToggle.jsx
import React, { useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx"; // keep your ThemeContext if exists

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    document.body.classList.remove("theme-glass", "theme-cyber", "theme-clean");
    if (theme === "glass") document.body.classList.add("theme-glass");
    else if (theme === "cyber") document.body.classList.add("theme-cyber");
    else if (theme === "clean") document.body.classList.add("theme-clean");
    localStorage.setItem("qd_theme", theme);
  }, [theme]);

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="bg-[#0b0b0d] text-white border px-2 py-1 rounded"
    >
      <option value="glass">Glass (default)</option>
      <option value="cyber">Cyberpunk</option>
      <option value="clean">Clean / White</option>
    </select>
  );
}
