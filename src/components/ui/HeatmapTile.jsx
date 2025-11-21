// src/components/ui/HeatmapTile.jsx
import React from "react";

/**
 * Small presentational tile used in market panel heatmap
 * props:
 *  - symbol, pct, volume, closes (array)
 */
function Spark({ closes = [], w = 100, h = 28 }) {
  if (!closes || closes.length < 2) return <div className="text-xs text-gray-400">—</div>;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const stepX = w / (closes.length - 1);
  const points = closes.map((c, i) => `${i * stepX},${h - ((c - min) / range) * h}`);
  const d = `M${points.join(" L ")}`;
  const lastChange = ((closes[closes.length - 1] - closes[0]) / (closes[0] || 1)) * 100;
  const stroke = lastChange >= 0 ? "#34d399" : "#fb7185";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeatmapTile({ symbol, pct = 0, volume = 0, closes = [], onOpen, onToggleWatch, watched = false }) {
  const sign = pct >= 0 ? "+" : "";
  return (
    <div className="p-2 rounded hover:shadow-lg transition-colors bg-[#07121a]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium text-sm">{symbol}</div>
          <div className="text-xs text-gray-400">{volume ? (volume >= 1000 ? `${Math.round(volume / 1000)}k` : volume) : "—"}</div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className={`text-sm font-semibold ${pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{pct === 0 ? "—" : `${sign}${pct.toFixed(2)}%`}</div>
          <div className="flex items-center gap-1">
            <button onClick={() => onToggleWatch?.(symbol)} className="text-xs px-2 py-0.5 rounded bg-white/3">{watched ? "★" : "☆"}</button>
            <button onClick={() => onOpen?.(symbol)} className="text-xs px-2 py-0.5 rounded bg-indigo-600 text-white">Open</button>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <Spark closes={closes} w={120} h={28} />
      </div>
    </div>
  );
}
