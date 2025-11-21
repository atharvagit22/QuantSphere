// src/components/CandleChart.jsx
import React, { useRef, useEffect } from "react";
import { createChart } from "lightweight-charts";

export default function CandleChart({ candles = [], height = 300 }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = ""; // clear
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height,
      layout: { background: { color: "#071018" }, textColor: "#d1d5db" },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.04)" },
      timeScale: { borderColor: "rgba(255,255,255,0.04)" },
    });
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#16a34a",
      downColor: "#ef4444",
      borderVisible: false,
      wickVisible: true,
    });
    if (candles && candles.length) candleSeries.setData(candles);

    // resize handler
    const onResize = () => chart.applyOptions({ width: ref.current.clientWidth });
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); chart.remove(); };
  }, [candles, height]);

  return <div ref={ref} style={{ width: "100%" }} />;
}
