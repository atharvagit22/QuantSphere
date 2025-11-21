// src/components/Sidebar.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, BarChart2, PieChart, Shield, Activity, GitCompare, Zap, Play, Sliders, FileText, Settings, ChevronLeft } from "lucide-react";

const tabs = [
 
 { name: "Dashboard", id: "dashboard", icon: <LayoutDashboard size={18} /> },
 { name: "Live", id: "live", icon: <Zap size={18} /> },
  { name: "Analytics", id: "analytics", icon: <BarChart2 size={18} /> },
  { name: "Portfolio", id: "portfolio", icon: <PieChart size={18} /> },
  { name: "Risk", id: "risk", icon: <Shield size={18} /> },
  { name: "Signals", id: "signals", icon: <Activity size={18} /> },
  { name: "ComparePRO+", id: "comparepro", icon: <GitCompare size={18} /> },
  
  { name: "Replay", id: "replay", icon: <Play size={18} /> },
  { name: "Optimizer", id: "optimizer", icon: <Sliders size={18} /> },
  { name: "Report", id: "report", icon: <FileText size={18} /> },
  { name: "Settings", id: "settings", icon: <Settings size={18} /> },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.35 }} className={`h-screen border-r border-[#0d1622] bg-[#07070b] p-4 flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      <button className="absolute top-4 right-[-12px] bg-[#0a0f18] border border-[#162231] w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#111a26] transition" onClick={() => setCollapsed((c) => !c)}>
        <ChevronLeft size={16} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center text-white font-bold text-xl shadow-xl">Q</div>
        {!collapsed && (
          <div>
            <div className="font-semibold text-lg">QuantDash</div>
            <div className="text-xs text-gray-400">v1.0 • Local</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 mt-4">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <div key={tab.id} className="relative group">
              <button onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active ? "bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white shadow-lg" : "text-gray-300 hover:bg-[#0b0f14] hover:shadow-inner"}`}>
                <span className={`${active ? "text-white" : "text-gray-500"}`}>{tab.icon}</span>
                {!collapsed && <span className="truncate">{tab.name}</span>}
              </button>

              {collapsed && <span className="absolute left-20 top-2 px-2 py-1 rounded bg-[#111827] text-xs text-white opacity-0 group-hover:opacity-100 transition z-50 shadow-xl">{tab.name}</span>}
            </div>
          );
        })}
      </nav>

      {!collapsed && <div className="mt-auto text-xs text-gray-500 text-center opacity-60">Built for backtesting • Dark glass UI</div>}
    </motion.aside>
  );
}
