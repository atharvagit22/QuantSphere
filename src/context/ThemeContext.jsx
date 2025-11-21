// ThemeContext.jsx — adds Bloomberg-like dark theme switch & classes
import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("qd_theme") || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    try { localStorage.setItem("qd_theme", theme); } catch {}
    const root = document.documentElement;
    root.classList.remove("dark", "light", "bloomberg");
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "bloomberg") root.classList.add("bloomberg");
    else root.classList.add("light");
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
