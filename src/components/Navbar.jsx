// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { useData } from "../context/DataContext.jsx";

function KPICompact({ kpis = {} }) {
  const items = [
    { label: "P/L", value: kpis.total_pl ?? 0 },
    { label: "Win%", value: kpis.win_rate ? `${(kpis.win_rate * 100).toFixed(1)}%` : "0%" },
    { label: "MDD", value: kpis.max_drawdown ? `${(kpis.max_drawdown * 100).toFixed(2)}%` : "0%" },
  ];

  return (
    <div className="flex items-center gap-3">
      {items.map((it, i) => (
        <div
          key={i}
          className="bg-[#0b1722] px-3 py-1.5 rounded-md text-xs shadow-inner border border-[#0e1c2c]"
        >
          <div className="text-[10px] text-gray-400">{it.label}</div>
          <div className="font-semibold tracking-tight">
            {typeof it.value === "number"
              ? `$${it.value.toLocaleString()}`
              : it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ModeBadge({ mode }) {
  const isLive = mode === "live";

  return (
    <div
      className={`
        px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 
        shadow-md border 
        ${isLive 
          ? "bg-emerald-600/90 border-emerald-300/40 text-black" 
          : "bg-amber-500/90 border-amber-300/40 text-black"}
      `}
    >
      <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-300" : "bg-yellow-200"}`} />
      {isLive ? "LIVE MODE" : "BACKTEST"}
    </div>
  );
}

export default function Navbar({ title, children, kpis }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const { mode } = useData();

  return (
    <div className="
      w-full border-b border-[#0a1120]
      px-6 py-4 flex items-center justify-between
      bg-[#06060a]/70 backdrop-blur-lg sticky top-0 z-40
      shadow-lg
    ">
      {/* Left Side */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <span className="text-sm text-gray-500 mt-0.5">QuantDash • Professional Toolkit</span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        <ModeBadge mode={mode} />
        {kpis && <KPICompact kpis={kpis} />}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="
            p-2 rounded-md bg-[#0b1720]
            hover:bg-[#0e1c2c] transition-all
            border border-[#132438]
          "
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {children}
      </div>
    </div>
  );
}
