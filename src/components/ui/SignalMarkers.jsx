import React from "react";

export default function SignalMarkers({ signals = [], equityData = [] }) {
  return (
    <div className="bg-[#0f1724] p-4 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold mb-3">Signals</h2>

      {signals.length === 0 && <p className="text-gray-500 text-sm">No signals generated.</p>}

      <ul className="space-y-2 text-sm">
        {signals.map((s, i) => (
          <li key={i} className="flex justify-between p-2 bg-white/5 rounded">
            <span className={s.type === "buy" ? "text-emerald-400" : "text-rose-400"}>
              {s.type.toUpperCase()}
            </span>
            <span>{s.reason}</span>
            <span className="text-gray-400">
              {equityData[s.index]?.date ?? "N/A"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
