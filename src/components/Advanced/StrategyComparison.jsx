// src/components/Advanced/StrategyComparison.jsx
import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { Line } from "react-chartjs-2";

export default function StrategyComparison() {
  const { strategies, uploadMultiple } = useData();
  const [selected, setSelected] = useState(strategies.map((s) => s.id));

  // To add multiple files via input:
  const handleFiles = async (e) => {
    const files = e.target.files;
    await uploadMultiple(files);
  };

  // Prepare dataset list
  const datasets = strategies.map((s, idx) => {
    const eq = s.parsed?.equityData || [];
    return {
      label: s.name,
      data: eq.map((p) => p.equity || p.close || 0),
      borderColor: ["#60a5fa", "#a78bfa", "#f97316", "#10b981", "#ef4444"][idx % 5],
      fill: false,
      pointRadius: 0,
    };
  });

  const labels = strategies[0]?.parsed?.equityData?.map((p) => p.date) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Strategy Comparison</h2>
      <div>
        <input type="file" multiple accept=".csv" onChange={handleFiles} />
      </div>

      <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
        <div className="h-96">
          <Line
            data={{
              labels,
              datasets: datasets,
            }}
            options={{ maintainAspectRatio: false }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((s) => {
          const eq = s.parsed?.equityData || [];
          const last = eq[eq.length - 1]?.equity || 0;
          const first = eq[0]?.equity || 0;
          const pct = first ? (((last - first) / first) * 100).toFixed(2) : "0.00";
          return (
            <div key={s.id} className="bg-[#0f1724] p-3 rounded-2xl border border-[#1f2937]">
              <div className="flex justify-between">
                <div>{s.name}</div>
                <div className="text-white font-semibold">{last.toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-400">Return: {pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
