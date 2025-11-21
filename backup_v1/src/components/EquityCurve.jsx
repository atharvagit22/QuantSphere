import React from "react";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";

export default function EquityCurve() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Equity Value ($)",
        data: [10000, 12000, 14000, 16000, 15500, 18000],
        fill: false,
        borderColor: "#2563eb",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: true, position: "top" } },
    animation: {
      duration: 1500,
      easing: "easeOutQuart",
    },
    scales: {
      y: { beginAtZero: false },
      x: { grid: { display: false } },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg"
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Equity Curve
      </h2>
      <Line data={data} options={options} />
    </motion.div>
  );
}
