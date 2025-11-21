import React from "react";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";

export default function DrawdownChart() {
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Drawdown (%)",
        data: [0, -2, -1.5, -3],
        backgroundColor: "#dc2626",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: true, position: "top" } },
    animation: {
      duration: 1500,
      easing: "easeOutBounce",
    },
    scales: {
      y: { beginAtZero: true },
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
        Drawdown Chart
      </h2>
      <Bar data={data} options={options} />
    </motion.div>
  );
}
