// src/components/ThemeToggle.jsx
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition-transform"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="text-yellow-400 w-5 h-5" /> : <Moon className="text-gray-800 w-5 h-5" />}
    </button>
  );
}
