// src/components/PerformanceSummary.jsx
import React from "react";

export default function PerformanceSummary({ performance = {} }) {
  return (
    <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400">Performance Summary</div>
          <div className="text-lg font-medium text-white mt-1">Overview</div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-400">Sharpe</div>
          <div className="font-semibold text-white">{(performance.sharpe ?? 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-sm text-gray-400">Annualised Return</div>
        <div className="text-right font-semibold">{((performance.annualisedReturn ?? 0) * 100).toFixed(1)}%</div>
        <div className="text-sm text-gray-400">Win Rate</div>
        <div className="text-right font-semibold">{((performance.winRate ?? 0) * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
}
