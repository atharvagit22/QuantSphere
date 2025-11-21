// src/components/KPIBar.jsx
import React from "react";

function Card({ title, value, meta }) {
  return (
    <div className="bg-[#0f1724] p-4 rounded-xl border border-[#1f2937] shadow-sm">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="text-2xl font-semibold text-white mt-1">{value}</div>
      {meta && <div className="text-xs text-gray-400 mt-1">{meta}</div>}
    </div>
  );
}

export default function KPIBar({ kpis = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <Card title="Total P/L (USD)" value={`$${(kpis.total_pl ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
      <Card title="Trades" value={kpis.trades ?? "-"} />
      <Card title="Win Rate" value={`${((kpis.win_rate ?? kpis.winRate ?? 0) * 100).toFixed(1)}%`} />
      <Card title="Sharpe Ratio" value={(kpis.sharpe ?? kpis.sharpeRatio ?? 0).toFixed(2)} />
    </div>
  );
}
