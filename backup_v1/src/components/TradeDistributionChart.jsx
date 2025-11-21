// src/components/TradeDistributionChart.jsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function TradeDistributionChart({ data = [] }) {
  if (!data || data.length === 0) return <div className="text-sm text-gray-400">No distribution data.</div>;
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="bucket" tick={{ fill: "#9ca3af" }} />
          <YAxis tick={{ fill: "#9ca3af" }} />
          <Tooltip contentStyle={{ background: "#0b1220", borderColor: "#334155" }} />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
