import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function MACDChart({ macd, height = 200 }) {
  const ref = useRef();

  useEffect(() => {
    if (!macd) return;
    if (!ref.current) return;

    ref.current.innerHTML = "";
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height,
      layout: { background: { color: "#071018" }, textColor: "#fff" },
    });

    const macdLine = chart.addLineSeries({ color: "#60a5fa" });
    const signalLine = chart.addLineSeries({ color: "#fbbf24" });
    const histogram = chart.addHistogramSeries({ color: "#22c55e" });

    const m = macd.macdLine.map((v, i) => ({ value: v, time: i + 1 }));
    const s = macd.signalLine.map((v, i) => ({ value: v, time: i + 1 }));
    const h = macd.hist.map((v, i) => ({ value: v, time: i + 1 }));

    macdLine.setData(m);
    signalLine.setData(s);
    histogram.setData(h);

  }, [macd]);

  return <div className="rounded-xl border border-white/10" ref={ref} />;
}
