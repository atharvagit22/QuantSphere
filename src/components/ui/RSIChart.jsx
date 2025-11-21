import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function RSIChart({ rsi = [], height = 200 }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height,
      layout: { background: { color: "#071018" }, textColor: "#fff" },
    });

    const line = chart.addLineSeries({
      color: "#60a5fa",
      lineWidth: 2,
    });

    const data = rsi.map((v, i) => ({
      value: v ?? 0,
      time: i + 1,
    }));

    line.setData(data);

    // levels
    chart.addLineSeries({ color: "#ef4444" }).setData(data.map(() => ({ value: 70 })));
    chart.addLineSeries({ color: "#10b981" }).setData(data.map(() => ({ value: 30 })));

    window.addEventListener("resize", resize);
    function resize() {
      chart.applyOptions({ width: ref.current.clientWidth });
    }
    return () => window.removeEventListener("resize", resize);
  }, [rsi]);

  return <div className="rounded-xl border border-white/10" ref={ref} />;
}
