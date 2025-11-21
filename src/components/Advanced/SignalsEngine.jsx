// src/components/Advanced/SignalsEngine.jsx
import React, { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { useData } from "../../context/DataContext";
import { sma, macd, rsi } from "../../utils/indicators";

export default function SignalsEngine() {
  const { strategies, activeStrategyIdx } = useData();
  const strategy = strategies[activeStrategyIdx] || null;
  const series = strategy?.parsed?.equityData || []; // reuse equity / price if available

  // attempt to get price series: prefer close, fallback to equity
  const prices = series.map((p) => (p.close ?? p.equity ?? p.funds ?? 0));
  const labels = series.map((p) => p.date);

  const short = 12, long = 26;
  const shortSMA = sma(prices, short);
  const longSMA = sma(prices, long);
  const theMacd = macd(prices, 12, 26, 9);
  const rsiVals = rsi(prices, 14);

  // detect simple crossover signals (short crosses above long => buy, below => sell)
  const signals = useMemo(() => {
    const arr = [];
    for (let i = 1; i < prices.length; i++) {
      const prevShort = shortSMA[i - 1], prevLong = longSMA[i - 1];
      const curShort = shortSMA[i], curLong = longSMA[i];
      if (prevShort < prevLong && curShort >= curLong) arr.push({ idx: i, type: "buy" });
      if (prevShort > prevLong && curShort <= curLong) arr.push({ idx: i, type: "sell" });
    }
    return arr;
  }, [prices, shortSMA, longSMA]);

  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: prices,
        borderColor: "#60a5fa",
        pointRadius: 0,
        tension: 0.2,
      },
      {
        label: `${short} SMA`,
        data: shortSMA,
        borderColor: "#a78bfa",
        pointRadius: 0,
      },
      {
        label: `${long} SMA`,
        data: longSMA,
        borderColor: "#f97316",
        pointRadius: 0,
      },
    ],
  };

  // overlay signal markers via plugin-style dataset
  const annotations = signals.map((s) => ({
    label: `${s.type}`,
    x: labels[s.idx],
    y: prices[s.idx],
    backgroundColor: s.type === "buy" ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)",
  }));

  // tiny UI
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Signals Engine</h2>
      <div className="grid md:grid-cols-1 gap-4">
        <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
          <div className="text-sm text-gray-400">Price + SMA (signals)</div>
          <div className="h-72 mt-3">
            <Line
              data={data}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  tooltip: { enabled: true },
                },
                elements: { point: { radius: 0 } },
              }}
            />
          </div>
          <div className="mt-3 flex gap-2">
            {signals.slice(-10).map((s, i) => (
              <div key={i} className={`px-2 py-1 rounded ${s.type === "buy" ? "bg-green-600" : "bg-red-600"} text-white text-xs`}>
                {s.type.toUpperCase()} @{labels[s.idx]}
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
            <div className="text-sm text-gray-400">MACD</div>
            <div className="h-48 mt-2">
              {/* simple MACD visual: plot macd and signal */}
              <Line
                data={{
                  labels,
                  datasets: [
                    { label: "MACD", data: theMacd.macdLine, borderColor: "#60a5fa", pointRadius: 0 },
                    { label: "Signal", data: theMacd.signal, borderColor: "#a78bfa", pointRadius: 0 },
                    { label: "Hist", data: theMacd.hist, type: "bar", backgroundColor: (ctx) => (ctx.dataset.data[ctx.dataIndex] >= 0 ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.8)") },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
            <div className="text-sm text-gray-400">RSI (14)</div>
            <div className="h-48 mt-2">
              <Line data={{ labels, datasets: [{ label: "RSI", data: rsiVals, borderColor: "#f472b6", pointRadius: 0 }] }} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
