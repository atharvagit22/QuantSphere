// src/App.jsx
import { useState, Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import "./index.css";
import "./chartConfig.js";
import GlobalHotkeys from "./utils/GlobalHotkeys.jsx";
import FAB from "./components/ui/FAB.jsx";

// lazy pages
const Dashboard = lazy(() => import("./components/Layout/Dashboard.jsx"));
const Analytics = lazy(() => import("./components/Layout/Analytics.jsx"));
const Portfolio = lazy(() => import("./components/Layout/Portfolio.jsx"));
const Risk = lazy(() => import("./components/Layout/Risk.jsx"));
const Signals = lazy(() => import("./components/Layout/Signals.jsx"));
const ComparePRO = lazy(() => import("./components/Layout/ComparePROPlus.jsx"));
const Live = lazy(() => import("./components/Layout/Live.jsx"));
const Replay = lazy(() => import("./components/Layout/Replay.jsx"));
const Report = lazy(() => import("./components/Layout/Report.jsx"));
const Settings = lazy(() => import("./components/Layout/Settings.jsx"));
const Optimizer = lazy(() => import("./components/Layout/Optimizer.jsx"));

// 🚀 OPTIONAL: Login
// const Login = lazy(() => import("./pages/Login.jsx"));

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Hotkeys for navigation
  const bindings = {
    "1": () => setActiveTab("dashboard"),
    "2": () => setActiveTab("analytics"),
    "3": () => setActiveTab("portfolio"),
    "4": () => setActiveTab("risk"),
    "5": () => setActiveTab("signals"),
    "6": () => setActiveTab("comparepro"),
    "7": () => setActiveTab("live"),
    "8": () => setActiveTab("replay"),
    "9": () => setActiveTab("optimizer"),
  };

  return (
    <div className="flex min-h-screen bg-[#06060a] text-gray-200">

      {/* Global Toasts */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <GlobalHotkeys bindings={bindings} />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} brandName="QuantSphere" />

      {/* Main Content */}
      <div className="flex flex-col flex-1">

        {/* Navbar Title */}
        <Navbar
          title={
            activeTab
              ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
              : ""
          }
          brand="QuantSphere"
        />

        <div className="p-6 overflow-y-auto flex-1">
          <Suspense
            fallback={
              <div className="flex justify-center items-center text-gray-400">
                Loading {activeTab}...
              </div>
            }
          >
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "portfolio" && <Portfolio />}
            {activeTab === "risk" && <Risk />}
            {activeTab === "signals" && <Signals />}
            {activeTab === "comparepro" && <ComparePRO />}
            {activeTab === "live" && <Live />}
            {activeTab === "replay" && <Replay />}
            {activeTab === "report" && <Report />}
            {activeTab === "settings" && <Settings />}
            {activeTab === "optimizer" && <Optimizer />}
          </Suspense>
        </div>
      </div>

      {/* Floating Action Button */}
      <FAB
        onLoadParsedData={(parsed) => {
          console.info("FAB loaded parsed data", parsed);
        }}
        onLoadDemo={(demo) => {
          console.info("FAB demo loaded", demo);
        }}
      />
    </div>
  );
}
