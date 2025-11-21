// StatsCard.jsx
import React from "react";

/**
 * StatsCard
 * props:
 *  - title (string)
 *  - stats (object) -> { label: value }
 */
export default function StatsCard({ title = "Stats", stats = {} }) {
  const entries = Object.entries(stats || {});
  return (
    <div className="p-4 bg-[#071018] rounded-xl border border-[#0f1720]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-400">{title}</div>
        <div className="text-xs text-gray-500">Summary</div>
      </div>

      <div className="space-y-2">
        {entries.map(([k, v], i) => (
          <div key={k} className="flex justify-between items-center text-sm p-2 rounded hover:bg-[#08121a]">
            <div className="text-gray-300">{k}</div>
            <div className="text-gray-100 font-medium">{v}</div>
          </div>
        ))}
        {entries.length === 0 && <div className="text-xs text-gray-500">No stats</div>}
      </div>
    </div>
  );
}
