// src/components/Layout/Risk.jsx
import React, { useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import { useData } from "../../context/DataContext.jsx";

export default function Risk() {
  const { data } = useData();
  const equity = (data?.equityData || []).map((d) => d.equity ?? null).filter((v) => v !== null);
  const dates = (data?.equityData || []).map((d) => d.date);

  const returns = useMemo(() => {
    const r = [];
    for (let i = 1; i < equity.length; i++) {
      const prev = equity[i - 1];
      const cur = equity[i];
      if (prev && cur) r.push((cur - prev) / Math.max(1, prev));
    }
    return r;
  }, [equity]);

  const mean = returns.reduce((a, b) => a + b, 0) / Math.max(1, returns.length);
  const std = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, returns.length));
  const annualFactor = Math.sqrt(252);
  const volatility = std * annualFactor;
  const sharpe = std === 0 ? 0 : (mean * annualFactor) / std;

  // VaR and CVaR (historical)
  const sorted = [...returns].sort((a, b) => a - b);
  const varLevel = 0.01;
  const varIndex = Math.max(0, Math.floor(sorted.length * varLevel));
  const var99 = sorted.length ? sorted[varIndex] : 0;
  const cvar99 = sorted.slice(0, varIndex + 1).length ? sorted.slice(0, varIndex + 1).reduce((a, b) => a + b, 0) / (varIndex + 1) : var99;
  const var99Amount = Math.round((var99 || 0) * (equity[equity.length - 1] || 0) * -1);
  const cvar99Amount = Math.round((cvar99 || 0) * (equity[equity.length - 1] || 0) * -1);

  const drawdown = data?.drawdownData && data.drawdownData.length ? data.drawdownData : dates.map((d) => ({ date: d, value: 0 }));

  const volatilityChart = {
    labels: dates.slice(1),
    datasets: [
      { label: "Abs returns", data: returns.map((v) => Math.abs(v)), borderColor: "#06b6d4", pointRadius: 0 },
      { label: "Volatility band (30)", data: (() => {
          const out = [];
          for (let i = 0; i < returns.length; i++) {
            const slice = returns.slice(Math.max(0, i - 29), i + 1);
            if (slice.length < 2) out.push(0);
            else {
              const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
              out.push(Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length));
            }
          }
          return out;
        })(), borderColor: "#a78bfa", pointRadius: 0 }
    ],
  };

  const drawdownChart = {
    labels: drawdown.map((d) => d.date),
    datasets: [{ label: "Drawdown", data: drawdown.map((d) => d.value), backgroundColor: "rgba(239,68,68,0.7)" }],
  };

  // returns histogram
  const histBuckets = useMemo(() => {
    const bins = Array(30).fill(0);
    if (!returns.length) return bins;
    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const step = (max - min) / bins.length || 1;
    returns.forEach((r) => {
      const idx = Math.min(bins.length - 1, Math.floor((r - min) / step));
      bins[idx] += 1;
    });
    return bins;
  }, [returns]);

  const histData = { labels: histBuckets.map((_, i) => i + 1), datasets: [{ data: histBuckets, backgroundColor: "#fb7185" }] };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Risk Metrics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Volatility (annualized)</div>
          <div className="text-2xl font-semibold mt-2">{(volatility * 100).toFixed(2)}%</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Sharpe Ratio</div>
          <div className="text-2xl font-semibold mt-2">{sharpe.toFixed(2)}</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Value-at-Risk (99%)</div>
          <div className="text-2xl font-semibold mt-2">${var99Amount.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">CVaR (99%): ${cvar99Amount.toLocaleString()}</div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-2">Max Drawdown Timeline</div>
        <div className="h-56">
          <Bar data={drawdownChart} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <div className="text-sm text-gray-400 mb-2">Volatility (recent)</div>
          <div className="h-48">
            <Line data={volatilityChart} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm text-gray-400 mb-2">Returns Histogram</div>
          <div className="h-48">
            <Bar data={histData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}
