import React from "react";

export default function OptimalWeightsTable({ best }) {
  if (!best) return null;

  return (
    <div className="bg-[#0f1724] p-4 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold mb-3">Optimal Weights</h2>

      {best.weights.map((w, i) => (
        <div key={i} className="flex justify-between text-sm text-gray-300">
          <span>Asset {i + 1}</span>
          <span>{(w * 100).toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
}
