// src/components/ui/LivePriceChart.jsx
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { startPolling } from "../../api/liveFetch";

export default function LivePriceChart({ symbol = "AAPL" }) {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    const stop = startPolling(symbol, (candles) => {
      // candles: [{time, open, high, low, close}, ...]
      const mapped = (candles || []).map((c) => ({ x: c.time, y: Number(c.close) }));
      setSeries(mapped);
    }, 5000);

    return () => stop && stop();
  }, [symbol]);

  const chartData = {
    labels: series.map((s) => s.x),
    datasets: [
      {
        label: `${symbol} (live)`,
        data: series.map((s) => s.y),
        borderColor: "#60a5fa",
        pointRadius: 0,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="glass-card p-4" style={{ height: 360 }}>
      <Line data={chartData} options={{ maintainAspectRatio: false }} />
    </div>
  );
}
