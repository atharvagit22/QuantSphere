// src/components/Layout/Analytics.jsx
import React from "react";
import TradeDistributionChart from "../../components/TradeDistributionChart.jsx";
import ResidualsChart from "../../components/ResidualsChart.jsx";
import PerformanceSummary from "../../components/PerformanceSummary.jsx";
import dummyData from "../../utils/dummyData.js";

export default function Analytics() {
  const { tradeDistribution = [], residuals = [], performance = {} } = dummyData || {};
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4 text-white">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
          <div className="text-sm text-gray-400 mb-2">Trade Distribution</div>
          <TradeDistributionChart data={tradeDistribution} />
        </div>

        <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
          <div className="text-sm text-gray-400 mb-2">Residuals</div>
          <ResidualsChart data={residuals} />
        </div>
      </div>

      <div>
        <PerformanceSummary performance={performance} />
      </div>
    </div>
  );
}
