// src/components/Layout/Signals.jsx
import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "../../utils/chartSetup";
import { useData } from "../../context/DataContext.jsx";
import { sma, ema, rsi, macd, detectMACross } from "../../utils/analyticsHelpers.js";

export default function Signals() {
  const { data } = useData();
  const prices = Array.isArray(data?.prices)
    ? data.prices
    : Array.isArray(data?.equityData)
    ? data.equityData.map((p) => ({ date: p.date, close: p.equity }))
    : [];

  const closes = prices.map((p) => Number(p.close || 0));
  const dates = prices.map((p) => p.date);

  const short = 20,
    long = 50;
  const smaShort = useMemo(() => sma(closes, short), [closes]);
  const smaLong = useMemo(() => sma(closes, long), [closes]);

  const bbPeriod = 20;
  const bollinger = useMemo(() => {
    const mid = sma(closes, bbPeriod);
    const upper = [],
      lower = [];
    for (let i = 0; i < closes.length; i++) {
      const start = Math.max(0, i - bbPeriod + 1);
      const window = closes.slice(start, i + 1);
      const mean = window.reduce((a, b) => a + b, 0) / window.length;
      const sd = Math.sqrt(window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length || 0);
      upper.push(mean + 2 * sd);
      lower.push(mean - 2 * sd);
    }
    return { middle: mid, upper, lower };
  }, [closes]);

  const macdObj = useMemo(() => macd(closes, 12, 26, 9), [closes]);
  const macdLine = macdObj.macdLine || [];
  const signalLine = macdObj.signalLine || [];

  const rsiData = useMemo(() => rsi(closes, 14), [closes]);

  const signals = useMemo(() => {
    const arr = [];
    const cross = detectMACross(smaShort, smaLong);
    cross.forEach((s) => {
      arr.push({
        type: s.type,
        index: s.index,
        price: closes[s.index],
        date: dates[s.index],
        rsi: rsiData[s.index] ?? null,
      });
    });
    return arr;
  }, [smaShort, smaLong, closes, dates, rsiData]);

  const priceChart = useMemo(
    () => ({
      labels: dates,
      datasets: [
        { label: "Price", data: closes, borderColor: "#60a5fa", pointRadius: 0, tension: 0.25, fill: false },
        { label: `${short} SMA`, data: smaShort, borderColor: "#a78bfa", borderDash: [6, 3], pointRadius: 0 },
        { label: `${long} SMA`, data: smaLong, borderColor: "#06b6d4", borderDash: [6, 3], pointRadius: 0 },
        { label: `BB Upper`, data: bollinger.upper, borderColor: "#f97316", pointRadius: 0, borderDash: [4, 2], fill: false },
        { label: `BB Lower`, data: bollinger.lower, borderColor: "#f97316", pointRadius: 0, borderDash: [4, 2], fill: false },
        {
          label: "Buy",
          data: signals.filter((s) => s.type === "buy").map((s) => ({ x: s.date, y: s.price })),
          type: "scatter",
          pointStyle: "triangle",
          pointRadius: 8,
          pointBackgroundColor: "#10b981",
          showLine: false,
          order: 10,
        },
        {
          label: "Sell",
          data: signals.filter((s) => s.type === "sell").map((s) => ({ x: s.date, y: s.price })),
          type: "scatter",
          pointStyle: "triangle",
          rotation: 180,
          pointRadius: 8,
          pointBackgroundColor: "#ef4444",
          showLine: false,
          order: 10,
        },
      ],
    }),
    [dates, closes, smaShort, smaLong, bollinger, signals]
  );

  const macdChart = useMemo(
    () => ({
      labels: dates,
      datasets: [
        { label: "MACD", data: macdLine, borderColor: "#60a5fa", pointRadius: 0 },
        { label: "Signal", data: signalLine, borderColor: "#a78bfa", pointRadius: 0 },
      ],
    }),
    [dates, macdLine, signalLine]
  );

  const rsiChart = useMemo(
    () => ({
      labels: dates,
      datasets: [{ label: "RSI (14)", data: rsiData, borderColor: "#f59e0b", pointRadius: 0 }],
    }),
    [dates, rsiData]
  );

  if (!closes.length) {
    return (
      <div className="p-6">
        <div className="glass-card p-4 text-gray-400">No price/equity series available — upload CSV or load demo.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Signals</h2>
        <div className="text-sm text-gray-400">Price signals, Bollinger Bands, MACD and RSI</div>
      </div>

      <div className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-2">Price & Indicators</div>
        <div className="h-80">
          <Line data={priceChart} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-4 h-48">
          <div className="text-sm text-gray-400 mb-2">MACD</div>
          <Line data={macdChart} options={{ maintainAspectRatio: false }} />
        </div>

        <div className="glass-card p-4 h-48">
          <div className="text-sm text-gray-400 mb-2">RSI (14)</div>
          <Line data={rsiChart} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-2">Recent Trading Signals</div>
        {signals.length === 0 ? (
          <div className="text-gray-500 italic">No signals found for current dataset.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400">
              <tr className="border-b border-[#111827]">
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Price</th>
                <th className="py-2">RSI</th>
              </tr>
            </thead>
            <tbody>
              {signals.slice(-50).reverse().map((s, i) => (
                <tr key={i} className="border-b border-[#111827]">
                  <td className="py-2">{s.date}</td>
                  <td className={`py-2 ${s.type === "buy" ? "text-green-400" : "text-red-400"}`}>{s.type.toUpperCase()}</td>
                  <td className="py-2">{Number(s.price).toFixed(2)}</td>
                  <td className="py-2">{s.rsi ? s.rsi.toFixed(1) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
