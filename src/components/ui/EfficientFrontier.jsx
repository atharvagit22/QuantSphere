import React, { useRef, useEffect } from "react";
import { createChart } from "lightweight-charts";

export default function EfficientFrontier({ frontier }) {
  const ref = useRef();

  useEffect(() => {
    if (!frontier || !ref.current) return;

    ref.current.innerHTML = "";
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 300,
      layout: { background: { color: "#071018" }, textColor: "#fff" },
    });

    const scatter = chart.addScatterSeries({
      color: "#60a5fa",
      markerSize: 8,
    });

    scatter.setData(
      frontier.map((p, i) => ({
        time: i + 1,
        value: p.return,
      }))
    );

  }, [frontier]);

  return <div ref={ref} className="rounded-xl border border-white/10" />;
}
