// OrderbookDepth.jsx (kept as before)
import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function OrderbookDepth({ bids = [], asks = [], width = 320, height = 120 }) {
  const { labels, bidCum, askCum } = useMemo(() => {
    const b = bids.map((x) => ({ price: Number(x[0] || x.price), qty: Number(x[1] || x.qty) })).slice().reverse();
    const a = asks.map((x) => ({ price: Number(x[0] || x.price), qty: Number(x[1] || x.qty) }));
    const pricesSet = new Set();
    b.forEach((p) => pricesSet.add(p.price));
    a.forEach((p) => pricesSet.add(p.price));
    const prices = Array.from(pricesSet).sort((x, y) => x - y);
    let cum = 0;
    const bidMap = {};
    b.forEach((p) => { cum += p.qty; bidMap[p.price] = cum; });
    cum = 0;
    const askMap = {};
    a.forEach((p) => { cum += p.qty; askMap[p.price] = cum; });
    const bidCumArr = prices.map((p) => bidMap[p] ?? 0);
    const askCumArr = prices.map((p) => askMap[p] ?? 0);
    const labels = prices.map((p) => p.toString());
    return { labels, bidCum: bidCumArr, askCum: askCumArr };
  }, [bids, asks]);

  if ((!labels || labels.length === 0) && (!bidCum || bidCum.length === 0) && (!askCum || askCum.length === 0)) {
    return <div className="text-xs text-gray-400">No depth</div>;
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Bids (cumulative)",
        data: bidCum,
        borderColor: "#34d399",
        backgroundColor: "rgba(52,211,153,0.08)",
        fill: true,
        tension: 0.15,
        pointRadius: 0,
        borderWidth: 2,
        stepped: true,
      },
      {
        label: "Asks (cumulative)",
        data: askCum,
        borderColor: "#fb7185",
        backgroundColor: "rgba(251,113,133,0.06)",
        fill: true,
        tension: 0.15,
        pointRadius: 0,
        borderWidth: 2,
        stepped: true,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: {
        grid: { color: "#0b1220" },
        ticks: { color: "#9ca3af", font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true, mode: "index", intersect: false },
    },
  };

  return (
    <div style={{ width: "100%", height: height }}>
      <Line data={data} options={options} />
    </div>
  );
}
