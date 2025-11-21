// src/components/Layout/Dashboard.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Line, Bar } from "react-chartjs-2";
import "../../utils/chartSetup";
import KPIBar from "../../components/KPIBar.jsx";
import OrdersTable from "../../components/OrdersTable.jsx";
import dummyData from "../../utils/dummyData.js";

const fmt = (v) => (typeof v === "number" ? v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : v);

export default function Dashboard() {
  const data = dummyData || {};

  const equity = data.equityData || [];
  const equityChart = useMemo(() => {
    const labels = equity.map((p) => p.date);
    const values = equity.map((p) => p.equity);
    return {
      labels,
      datasets: [
        {
          label: "Portfolio Value (USD)",
          data: values,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.12)",
          fill: true,
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    };
  }, [equity]);

  const equityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,0.02)" } },
      y: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,0.02)" } },
    },
  };

  const drawdown = data.drawdownData || [];
  const drawdownChart = useMemo(() => {
    return {
      labels: drawdown.map((d) => d.date),
      datasets: [
        {
          label: "Drawdown",
          data: drawdown.map((d) => d.value),
          backgroundColor: drawdown.map((d) => (d.value < 0 ? "rgba(239,68,68,0.85)" : "rgba(34,197,94,0.85)")),
        },
      ],
    };
  }, [drawdown]);

  const volume = data.tradeVolume || [];
  const tradeVolumeChart = useMemo(() => {
    return {
      labels: volume.map((d) => d.date),
      datasets: [
        { label: "Buy", data: volume.map((d) => d.buy || 0), backgroundColor: "rgba(59,130,246,0.85)" },
        { label: "Sell", data: volume.map((d) => d.sell || 0), backgroundColor: "rgba(156,163,175,0.35)" },
      ],
    };
  }, [volume]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Dashboard Overview</h2>
      </div>

      <KPIBar kpis={data.kpis || {}} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div layout className="col-span-2 bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937] shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-400">Equity Curve</div>
              <div className="text-lg font-medium text-white mt-1">Portfolio Growth</div>
            </div>
            <div className="text-sm text-gray-400">Total: ${fmt(data.kpis?.total_pl ?? 0)}</div>
          </div>
          <div className="h-72 mt-4">
            <Line data={equityChart} options={equityOptions} />
          </div>
        </motion.div>

        <motion.div layout className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937] shadow">
          <div className="text-sm text-gray-400">Drawdown</div>
          <div className="h-40 mt-3">
            <Bar data={drawdownChart} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div layout className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937] shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Trade Volume</div>
              <div className="text-lg font-medium text-white">Buys vs Sells</div>
            </div>
            <div className="text-sm text-gray-400">Period: {volume.length} periods</div>
          </div>
          <div className="h-52 mt-4">
            <Bar data={tradeVolumeChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: "top" } }, scales: { x: { stacked: true }, y: { stacked: true } } }} />
          </div>
        </motion.div>

        <motion.div layout className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937] shadow">
          <div className="text-sm text-gray-400">Recent Orders</div>
          <div className="mt-3">
            <OrdersTable orders={data.orders || []} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
