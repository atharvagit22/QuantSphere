import React from "react";
import { motion } from "framer-motion";
import KPIBar from "../KPIBar";
import EquityChart from "../EquityChart";
import ResidualChart from "../ResidualChart";
import OrdersTable from "../OrdersTable";
import PortfolioSummary from "../PortfolioSummary";
import TradeDistributionChart from "../TradeDistributionChart";
import PerformanceSummary from "../PerformanceSummary";
import UploadPanel from "../UploadPanel";
import { dummyData } from "../../utils/dummyData";

export default function TabContainer({ activeTab }) {
  return (
    <motion.main
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 p-6 overflow-y-auto"
    >
      {activeTab === "dashboard" && (
        <>
          <UploadPanel />
          <KPIBar kpis={dummyData.kpis} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <EquityChart data={dummyData.equity} />
            <ResidualChart data={dummyData.residuals} />
          </div>
          <OrdersTable orders={dummyData.orders} />
        </>
      )}

      {activeTab === "analytics" && (
        <>
          <PerformanceSummary data={dummyData.performance} />
          <TradeDistributionChart data={dummyData.trades} />
        </>
      )}

      {activeTab === "portfolio" && <PortfolioSummary data={dummyData.portfolio} />}

      {activeTab === "settings" && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-700 dark:text-gray-200">
          <p>Settings & Theme controls will appear here.</p>
        </div>
      )}
    </motion.main>
  );
}
