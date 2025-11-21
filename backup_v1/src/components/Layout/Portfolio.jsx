import React from "react";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import "../../utils/chartSetup";

const portfolioData = {
  labels: ["Stocks", "Bonds", "Crypto", "Cash"],
  datasets: [
    {
      data: [55, 25, 15, 5],
      backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#6b7280"],
    },
  ],
};

export default function Portfolio() {
  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-semibold text-white mb-4">Portfolio</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937] flex flex-col justify-center items-center">
          <h2 className="text-gray-400 mb-3">Asset Allocation</h2>
          <div className="h-64 w-64">
            <Doughnut data={portfolioData} />
          </div>
        </div>
        <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
          <h2 className="text-gray-400 mb-3">Holdings</h2>
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="text-left py-2">Symbol</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Value ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AAPL</td>
                <td className="text-right">25</td>
                <td className="text-right">4,550</td>
              </tr>
              <tr>
                <td>TSLA</td>
                <td className="text-right">10</td>
                <td className="text-right">7,800</td>
              </tr>
              <tr>
                <td>AMZN</td>
                <td className="text-right">5</td>
                <td className="text-right">15,500</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
