import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function EquityChart({ data }) {
  if (!data) return null;

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Equity Curve",
        data: data.map((d) => d.value),
        borderColor: "#3b82f6",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: "easeOutQuart" },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#9ca3af", font: { family: "Inter", size: 12 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.07)" },
        ticks: { color: "#9ca3af", font: { family: "Inter", size: 12 } },
      },
    },
    plugins: {
      legend: {
        labels: { color: "#e5e7eb", font: { family: "Inter", size: 13 } },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#93c5fd",
        bodyColor: "#e5e7eb",
        borderColor: "#3b82f6",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="bg-[#1b1f27] p-6 rounded-xl border border-gray-800 shadow-inner mt-6 h-[350px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
