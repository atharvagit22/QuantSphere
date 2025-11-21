// src/components/EquityCurve.jsx
import React, { useMemo } from "react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import "chartjs-adapter-date-fns";

// REGISTER EVERYTHING
ChartJS.register(
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  CandlestickController,
  CandlestickElement
);

export default function EquityCurve({ series = [], labels = [], candles = [], showCandles = false }) {
  
  const chartData = useMemo(() => {
    if (showCandles && candles.length) {
      return {
        datasets: [
          {
            type: "candlestick",
            label: "OHLC",
            data: candles.map(c => ({
              x: new Date(c.time),
              o: Number(c.open),
              h: Number(c.high),
              l: Number(c.low),
              c: Number(c.close),
            })),
            borderColor: {
              up: "#10b981",     // green
              down: "#ef4444",   // red
              unchanged: "#555",
            },
            color: {
              up: "#10b981",
              down: "#ef4444",
              unchanged: "#999",
            },
          },
        ],
      };
    }

    // fallback: line chart
    return {
      labels,
      datasets: [
        {
          label: "Equity",
          type: "line",
          data: series,
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96,165,250,0.12)",
          fill: true,
          tension: 0.25,
          pointRadius: 0,
        },
      ],
    };
  }, [series, labels, candles, showCandles]);

  const options = {
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: { unit: "hour" },
        grid: { display: false },
        ticks: { color: "#aaa" },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#aaa" },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div style={{ height: 320 }}>
      <Chart type={showCandles ? "candlestick" : "line"} data={chartData} options={options} />
    </div>
  );
}
