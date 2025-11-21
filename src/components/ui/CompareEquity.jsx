import React from "react";
import { Line } from "react-chartjs-2";

export default function CompareEquity({ datasets }) {
  const labels = datasets[0]?.equityData?.map((e) => e.date) || [];

  const chartSets = datasets.map((d, i) => ({
    label: `Set ${i + 1}`,
    data: d.equityData.map((p) => p.equity),
    borderColor: ["#60a5fa", "#7c3aed", "#06b6d4", "#f59e0b"][i],
    pointRadius: 0,
  }));

  return (
    <div className="p-4 bg-[#0f1724] rounded-xl border border-white/10">
      <Line
        data={{ labels, datasets: chartSets }}
        options={{ maintainAspectRatio: false }}
        height={300}
      />
    </div>
  );
}
