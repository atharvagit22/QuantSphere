import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tabs from "./Tabs";
import KPIBar from "./KPIBar";
import EquityChart from "./EquityChart";

export default function DashboardContainer({ active, setActive, data, kpis }) {
  const tabs = {
    dashboard: (
      <div>
        <KPIBar kpis={kpis} />
        <EquityChart data={data} />
      </div>
    ),
    analytics: (
      <div className="text-gray-400 mt-6">Drawdown, distribution, and advanced stats will render here.</div>
    ),
    portfolio: (
      <div className="text-gray-400 mt-6">
        <p>Total Value: $62,633.41</p>
        <p>Asset Allocation charts and holdings details will appear here soon.</p>
      </div>
    ),
  };

  return (
    <div className="p-6">
      <Tabs active={active} setActive={setActive} />

      <div className="mt-8 relative min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute w-full"
          >
            {tabs[active]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
