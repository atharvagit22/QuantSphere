// src/components/ResidualsChart.jsx
import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function ResidualsChart({ data = [] }) {
  if (!data || data.length === 0) return <div className="text-sm text-gray-400">No residuals data.</div>;
  const formatted = data.map((r) => ({ date: r.date || r.to?.split?.("T")?.[0] || r.to || r.date, residual: r.residual ?? 0 }));
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <AreaChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="date" tick={{ fill: "#9ca3af" }} />
          <YAxis tick={{ fill: "#9ca3af" }} />
          <Tooltip contentStyle={{ background: "#0b1220", borderColor: "#334155" }} />
          <Area type="monotone" dataKey="residual" stroke="#10b981" fillOpacity={0.15} fill="#10b981" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
