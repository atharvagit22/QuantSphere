// src/components/Advanced/BacktestReplay.jsx
import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { useData } from "../../context/DataContext";

/**
 * Simple replay: uses OHLC from strategy.parsed.orders or price series.
 * If your CSV contains 'open,high,low,close' rows we will use them.
 */
export default function BacktestReplay() {
  const { strategies, activeStrategyIdx } = useData();
  const containerRef = useRef();
  const chartRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [pos, setPos] = useState(0);

  const strategy = strategies[activeStrategyIdx];
  const ohlc = (strategy?.parsed?.ohlcData || strategy?.parsed?.equityData || [])
    .map((r) => {
      // normalize: need {time, open, high, low, close}
      if (r.open != null && r.high != null) return { time: r.date, open: r.open, high: r.high, low: r.low, close: r.close };
      // fallback approximate using equity as close
      return { time: r.date, open: r.equity || r.close || 0, high: r.equity || r.close || 0, low: r.equity || r.close || 0, close: r.equity || r.close || 0 };
    });

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, { width: containerRef.current.clientWidth, height: 380, layout: { backgroundColor: "#0b1220", textColor: "#d1d5db" }});
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(ohlc);
    chartRef.current = { chart, candleSeries };
    const handleResize = () => chart.applyOptions({ width: containerRef.current.clientWidth });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [strategy?.id]);

  useEffect(() => {
    if (!chartRef.current) return;
    const { chart, candleSeries } = chartRef.current;
    // play loop
    let raf;
    if (isPlaying) {
      const step = () => {
        setPos((p) => {
          const next = Math.min(ohlc.length - 1, p + 1);
          candleSeries.update(ohlc[next]);
          chart.timeScale().scrollToPosition(ohlc.length - next);
          if (next >= ohlc.length - 1) setIsPlaying(false);
          return next;
        });
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Backtest Replay</h2>
      <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
        <div ref={containerRef}></div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => setIsPlaying((s) => !s)} className="px-3 py-1 bg-indigo-600 rounded text-white">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => { setPos(0); setIsPlaying(false); }} className="px-3 py-1 bg-slate-700 rounded text-white">Reset</button>
        </div>
      </div>
    </div>
  );
}
