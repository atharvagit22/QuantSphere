// src/components/ui/LiveKPIRibbon.jsx
import React, { useMemo } from "react";
import { useData } from "../../context/DataContext.jsx";

/**
 * Small ribbon to surface live quick KPIs above the chart
 * Props:
 *  - lastPrice (number)
 *  - returnsSeries (array)
 */
export default function LiveKPIRibbon({ lastPrice = null, returnsSeries = [] }) {
  const { computeSimulatorKPIs, mode, liveData } = useData();

  const stats = useMemo(() => {
    const last = lastPrice ?? (liveData?.candles?.length ? Number(liveData.candles[liveData.candles.length - 1].close) : null);
    const ret = returnsSeries && returnsSeries.length ? (returnsSeries.slice(-1)[0] || 0) : 0;
    const vol = returnsSeries && returnsSeries.length ? (Math.sqrt(returnsSeries.reduce((s, r) => s + (r - (ret || 0)) ** 2, 0) / returnsSeries.length) || 0) : 0;
    return {
      last,
      lastReturnPct: ret * 100,
      vol,
      mode,
    };
  }, [lastPrice, returnsSeries, liveData, mode]);

  return (
    <div className="w-full bg-[#071018] border rounded p-2 flex items-center gap-4 text-xs text-gray-200">
      <div className="flex-1">
        <div className="text-[11px] text-gray-400">Last Price</div>
        <div className="font-semibold text-lg">{stats.last != null ? `$${Number(stats.last).toFixed(2)}` : "—"}</div>
      </div>

      <div className="w-[1px] h-6 bg-white/5" />

      <div>
        <div className="text-[11px] text-gray-400">Return (last)</div>
        <div className={`font-semibold ${stats.lastReturnPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {stats.lastReturnPct >= 0 ? "+" : ""}{(stats.lastReturnPct || 0).toFixed(2)}%
        </div>
      </div>

      <div className="w-[1px] h-6 bg-white/5" />

      <div>
        <div className="text-[11px] text-gray-400">Vol (est)</div>
        <div className="font-semibold">{(stats.vol * 100).toFixed(2)}%</div>
      </div>

      <div className="ml-auto text-xs text-gray-400">Mode: <span className="font-semibold text-white ml-1">{stats.mode}</span></div>
    </div>
  );
}
