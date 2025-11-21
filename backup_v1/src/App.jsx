import { useState, Suspense, lazy } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import "./index.css";
import "./chartConfig.js";

const Dashboard = lazy(() => import("./components/Layout/Dashboard.jsx"));
const Analytics = lazy(() => import("./components/Layout/Analytics.jsx"));
const Portfolio = lazy(() => import("./components/Layout/Portfolio.jsx"));

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-200 font-['Inter']">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1">
        <Navbar title={activeTab} />
        <div className="p-6 overflow-y-auto flex-1">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
                Loading {activeTab}...
              </div>
            }
          >
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "portfolio" && <Portfolio />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
