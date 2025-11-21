import React from "react";

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-xl font-semibold mt-1 text-slate-800">{value}</div>
    </div>
  );
}

export default function KPIBar({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card title="Total P/L (USD)" value={kpis.total_pl.toFixed(2)} />
      <Card title="Trades" value={kpis.trades} />
      <Card title="Win Rate" value={(kpis.win_rate * 100).toFixed(1) + "%"} />
      <Card title="Avg P/L" value={kpis.avg_pl.toFixed(2)} />
    </div>
  );
}
