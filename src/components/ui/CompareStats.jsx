import React from "react";

export default function CompareStats({ stats = [] }) {
  return (
    <div className="p-4 bg-[#0f1724] rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold mb-3">Statistics</h2>

      {stats.map((s, i) => (
        <div key={i} className="p-2 bg-white/5 rounded mb-2 text-sm">
          <div>Total P/L: <span className="text-blue-400">${s.totalPL.toFixed(2)}</span></div>
          <div>Win Rate: {(s.winRate * 100).toFixed(2)}%</div>
          <div>Max Drawdown: {s.maxDD}%</div>
          <div>Total Trades: {s.trades}</div>
        </div>
      ))}
    </div>
  );
}
