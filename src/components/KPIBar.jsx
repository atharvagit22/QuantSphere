// KPIBar.jsx — polished KPI cards with small sparklines and accessible numbers
import React, { memo } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

function KPIItem({ title, value, spark = [] }) {
  return (
    <div className="glass-card p-4 neon-ring">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-gray-400">{title}</div>
          <div className="text-xl font-semibold mt-1">{typeof value === "number" ? `$${value.toLocaleString()}` : value}</div>
        </div>
        <div className="w-20">
          <Sparklines data={Array.isArray(spark) && spark.length ? spark : [0,0,1,2,1,3]}>
            <SparklinesLine color="#7c3aed" style={{ strokeWidth: 2 }} />
          </Sparklines>
        </div>
      </div>
    </div>
  );
}

export default memo(function KPIBar({ kpis = {} }) {
  const items = [
    { title: "Total P/L", value: kpis.total_pl ?? 0, spark: (kpis.equitySeries || []).slice(-20) },
    { title: "Win Rate", value: kpis.win_rate ? `${(kpis.win_rate * 100).toFixed(1)}%` : "0%", spark: (kpis.winSeries || []) },
    { title: "Max Drawdown", value: typeof kpis.max_drawdown === "number" ? `${(kpis.max_drawdown * 100).toFixed(2)}%` : kpis.max_drawdown ?? "0%", spark: (kpis.drawdownSeries || []) },
    { title: "Total Trades", value: kpis.total_trades ?? 0, spark: (kpis.tradeSeries || []) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it, i) => <KPIItem key={i} {...it} />)}
    </div>
  );
});
