// src/components/Layout/Optimizer.jsx
import React, { useMemo, useState } from "react";
import { useData } from "../../context/DataContext.jsx";
import { simulateFrontier, pickBestSharpe, computeReturnsFromEquity } from "../../utils/optimizer.js";
import { Line } from "react-chartjs-2";
import { demoCompareSets } from "../../utils/demoData.js";

export default function Optimizer() {
  const { data, setData } = useData();
  const sets = data.compare || [];

  const [samplingPoints, setSamplingPoints] = useState(500);
  const [seed] = useState(() => Math.floor(Math.random() * 100000));

  const normalized = useMemo(() => {
    return (sets || []).map((s, i) => ({
      id: s.id ?? `set${i + 1}`,
      name: s.name ?? `Set ${i + 1}`,
      equityData: s.equityData || [],
      kpis: s.kpis || {},
      orders: s.orders || [],
      trades: (s.orders || []).length,
    }));
  }, [sets]);

  const returnsSeries = useMemo(() => {
    if (!normalized || normalized.length === 0) return [];
    return normalized.map((s) => computeReturnsFromEquity(s.equityData || []));
  }, [normalized]);

  const frontier = useMemo(() => {
    if (!returnsSeries || returnsSeries.length === 0) return [];
    return simulateFrontier(returnsSeries, samplingPoints);
  }, [returnsSeries, samplingPoints, seed]);

  const best = useMemo(() => pickBestSharpe(frontier), [frontier]);

  const chartData = useMemo(() => {
    if (!frontier || frontier.length === 0) return { labels: [], datasets: [] };
    return {
      labels: frontier.map((_, i) => i + 1),
      datasets: [
        { label: "Frontier (ret)", data: frontier.map((p) => p.ret), borderColor: "#60a5fa", pointRadius: 2, tension: 0.2 },
        { label: "Frontier (risk)", data: frontier.map((p) => p.risk), borderColor: "#7c3aed", pointRadius: 2, tension: 0.2 },
      ],
    };
  }, [frontier]);

  const loadDemoOptimizer = () => {
    setData((prev) => ({ ...(prev || {}), compare: demoCompareSets }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio Optimizer</h1>
          <div className="text-sm text-gray-400">Sampled efficient frontier using uploaded compare sets</div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Samples</label>
          <input type="number" value={samplingPoints} onChange={(e) => setSamplingPoints(Number(e.target.value || 100))} className="w-20 px-2 py-1 rounded bg-[#071018] border" />
          <button onClick={loadDemoOptimizer} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm">Load Demo Data</button>
        </div>
      </div>

      {normalized.length === 0 ? (
        <div className="glass-card p-4 text-gray-400">Upload multiple CSVs in Compare to enable optimizer or click "Load Demo Data".</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-4">
              <div className="text-sm text-gray-400 mb-2">Efficient frontier (sampled portfolios)</div>
              <div style={{ height: 300 }}>
                <Line data={chartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="text-sm text-gray-400 mb-2">Best portfolio (max Sharpe)</div>
              {!best ? (
                <div className="text-gray-400">No best portfolio found</div>
              ) : (
                <>
                  <div className="text-sm text-gray-300 mb-3">Sharpe: {(best.sharpe || 0).toFixed(4)}</div>
                  <div className="space-y-2">
                    {best.weights.map((w, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-200">
                        <div>{normalized[i]?.name ?? `Set ${i + 1}`}</div>
                        <div className="font-medium">{(w * 100).toFixed(2)}%</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="text-sm text-gray-400 mb-2">Underlying sets</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {normalized.map((s) => (
                <div key={s.id} className="p-3 bg-[#071018] rounded">
                  <div className="text-sm text-gray-300 font-medium">{s.name}</div>
                  <div className="text-xs text-gray-500 mt-1">Trades: {s.trades}</div>
                  <div className="text-xs text-gray-400 mt-1">Win rate: {((s.kpis?.win_rate ?? 0) * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
