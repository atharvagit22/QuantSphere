// src/components/Sidebar.jsx
import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const tabs = [
  { name: "Dashboard", id: "dashboard" },
  { name: "Analytics", id: "analytics" },
  { name: "Portfolio", id: "portfolio" },
  { name: "Risk", id: "risk" },
  { name: "Signals", id: "signals" },
  { name: "ComparePRO+", id: "comparepro" },
  { name: "Live", id: "live" },
  { name: "Replay", id: "replay" },
  { name: "Optimizer", id: "optimizer" },
  { name: "Report", id: "report" },
  { name: "Settings", id: "settings" },
];

export default function Sidebar({ activeTab, setActiveTab, brandName = "QuantSphere" }) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="w-64 h-screen bg-[#05060A]/95 backdrop-blur-lg border-r border-white/5 flex flex-col p-4 shadow-xl"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Sparkles size={20} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white tracking-wide">{brandName}</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                ${active 
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md shadow-purple-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              {tab.name}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto text-xs text-gray-500 px-2">v1.0 • Local</div>
    </motion.aside>
  );
}
