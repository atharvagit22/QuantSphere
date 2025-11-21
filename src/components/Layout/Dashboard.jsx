// src/components/Layout/Dashboard.jsx

import React, { useMemo, useState } from "react";

import { Line, Bar } from "react-chartjs-2";
import "../../utils/chartSetup.js";

import KPIBar from "../KPIBar.jsx";
import OrdersTable from "../OrdersTable.jsx";
import EquityCurve from "../EquityCurve.jsx";
import StatsCard from "../StatsCard.jsx";

import { useData } from "../../context/DataContext.jsx";
import DashboardLiveChart from "../DashboardLiveChart.jsx";
import toast from "react-hot-toast";

export default function Dashboard() {
  const {
    data,
    csvData,
    liveData,
    mode,
    setMode,
    loadCSVFile,
    loadDemo,
    syncLiveToDashboard,
    isLiveSynced,
    setIsLiveSynced,
  } = useData();

  const [tab, setTab] = useState("overview");

  const current = mode === "live" && liveData ? liveDataToApp(liveData) : (data || csvData || {});

  function liveDataToApp(live) {
    if (!live || !Array.isArray(live.candles)) return {};
    return {
      equityData: live.candles.map((c) => ({ date: c.time, equity: Number(c.close) })),
      drawdownData: (() => {
        let peak = -Infinity;
        return live.candles.map((c) => {
          const eq = Number(c.close);
          if (eq > peak) peak = eq;
          return { date: c.time, value: peak ? (eq - peak) / peak : 0 };
        });
      })(),
      orders: live.orders || [],
      tradeVolume: [],
      kpis: {},
    };
  }

  // computed series
  const d = current || {};
  const equityPoints = d.equityData || [];
  const labels = equityPoints.map((p) => p.date);
  const equityValues = equityPoints.map((p) => Number(p.equity || 0));

  const returns = useMemo(() => {
    const out = [];
    for (let i = 1; i < equityValues.length; i++) {
      const prev = equityValues[i - 1] || 0;
      const cur = equityValues[i] || 0;
      out.push(prev === 0 ? 0 : (cur - prev) / prev);
    }
    return out;
  }, [equityValues]);

  function annualizedSharpe(arr = []) {
    if (!arr.length) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
    return sd === 0 ? 0 : (mean / sd) * Math.sqrt(252);
  }

  // drawdown series
  const drawdown = d.drawdownData || [];
  const drawdownChart = {
    labels: drawdown.map((x) => x.date),
    datasets: [
      {
        label: "Drawdown",
        data: drawdown.map((x) => x.value),
        backgroundColor: drawdown.map((x) => (x.value < 0 ? "rgba(239,68,68,0.85)" : "rgba(34,197,94,0.8)")),
      },
    ],
  };

  const volume = d.tradeVolume || [];
  const volumeChart = {
    labels: volume.map((x) => x.date),
    datasets: [
      { label: "Buy", data: volume.map((x) => x.buy || 0), backgroundColor: "#06b6d4" },
      { label: "Sell", data: volume.map((x) => x.sell || 0), backgroundColor: "#7c3aed" },
    ],
  };

  const returnsHist = useMemo(() => {
    const bins = Array(20).fill(0);
    if (!returns.length) return { labels: bins.map((_, i) => i), datasets: [{ data: bins }] };
    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const step = (max - min) / bins.length || 1;
    returns.forEach((r) => {
      const idx = Math.min(bins.length - 1, Math.floor((r - min) / step));
      bins[idx] += 1;
    });
    return {
      labels: bins.map((_, i) => i),
      datasets: [{ label: "Returns", data: bins, backgroundColor: "#f59e0b" }],
    };
  }, [returns]);

  // KPI payload (normalize)
  const kpiPayload = {
    total_pl: d.kpis?.total_pl || 0,
    win_rate: d.kpis?.win_rate || 0,
    max_drawdown: typeof d.kpis?.max_drawdown === "number" ? d.kpis.max_drawdown : (d.kpis?.max_drawdown || 0),
    total_trades: d.kpis?.total_trades || 0,
    equitySeries: equityValues,
    drawdownSeries: drawdown.map((x) => x.value),
  };

  const handleCSV = async (e) => {
    const f = e.target.files?.[0];
    if (f) await loadCSVFile(f);
    setMode("csv");
  };

  // dashboard sync handler (called by Dashboard Sync Now button)
  const handleDashboardSync = async () => {
    if (!liveData?.candles?.length) {
      alert("No live dataset available. Open Live tab and load a symbol first.");
      return;
    }
    try {
      syncLiveToDashboard(liveData);
      setMode("csv"); // keep dashboard mode consistent with previous behavior
      setIsLiveSynced(true);
      toast.success("Dashboard synced with Live data");
    } catch (err) {
      console.error("Dashboard sync failed", err);
      toast.error("Sync failed");
    }
  };

  return (
    <div className="space-y-6 p-4">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Trading Overview</h2>
          <div className="text-sm text-gray-400">Snapshot of backtest / live data</div>
        </div>

        <div className="flex items-center gap-4">
          <input type="file" accept=".csv" onChange={handleCSV} className="file:rounded file:px-3 file:py-1 file:bg-indigo-600 file:text-white text-sm" />
          <button onClick={loadDemo} className="px-4 py-2 bg-emerald-600 text-white rounded text-sm">Load Demo Data</button>

          <div className="bg-[#071026] rounded p-1 flex text-sm">
            <button onClick={() => setMode("csv")} className={`px-3 py-1 rounded ${mode === "csv" ? "bg-[#0b69ff] text-white" : "text-gray-300"}`}>CSV MODE</button>
            <button onClick={() => setMode("live")} className={`ml-2 px-3 py-1 rounded ${mode === "live" ? "bg-[#06b6d4] text-black" : "text-gray-300"}`}>LIVE MODE</button>
          </div>
        </div>
      </div>

      <KPIBar kpis={kpiPayload} />

      {/* Tabs: Overview | Equity | Live Chart */}
      <div className="flex items-center gap-2">
        <button onClick={() => setTab("overview")} className={`px-3 py-2 rounded ${tab === "overview" ? "bg-[#0b1220] text-white" : "text-gray-300"}`}>Overview</button>
        <button onClick={() => setTab("equity")} className={`px-3 py-2 rounded ${tab === "equity" ? "bg-[#0b1220] text-white" : "text-gray-300"}`}>Equity</button>
        <button onClick={() => setTab("livechart")} className={`px-3 py-2 rounded ${tab === "livechart" ? "bg-[#0b1220] text-white" : "text-gray-300"}`}>Live Chart</button>
      </div>

      {/* Tab content */}

      {tab === "overview" && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="col-span-2 glass-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Equity Curve</div>
                  <div className="text-lg font-medium text-white">Portfolio Growth</div>
                </div>
                <div className="text-sm text-gray-400">{equityValues.length} points</div>
              </div>

              <div className="mt-4">
                <EquityCurve series={equityValues} labels={labels} />
              </div>
            </div>

            <div className="glass-card p-4">
              <StatsCard
                title="Key Stats"
                stats={{
                  "Sharpe (ann)": annualizedSharpe(returns).toFixed(2),
                  "Total Points": equityValues.length,
                  "Max Drawdown": `${(Math.min(...(drawdown.map(d => d.value)) || [0]) * 100).toFixed(2)}%`,
                  "Trades": d.kpis?.total_trades || 0,
                }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-4">
              <div className="text-sm text-gray-400">Buy vs Sell Volume</div>
              <div className="h-52 mt-4">
                <Bar data={volumeChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { x: { stacked: true }, y: { stacked: true } } }} />
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="text-sm text-gray-400">Recent Orders</div>
              <div className="mt-3"><OrdersTable orders={d.orders || []} /></div>
            </div>
          </div>
        </>
      )}

      {/* Live Chart tab - full width card */}
      {tab === "livechart" && (
        <div className="glass-card p-5 w-full min-h-[520px]">

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400">Dashboard Live Chart (mirrors Live)</div>
              <div className="text-xs text-gray-500">Candles • Volume • EMA20/50 • Markers • Alerts</div>
            </div>

            {/* Sync control - shown if not marked synced */}
            {!isLiveSynced && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDashboardSync}
                  className="px-3 py-2 bg-blue-600 rounded text-white text-sm"
                >
                  Sync Now
                </button>
                <div className="text-xs text-gray-400">or sync from Live tab</div>
              </div>
            )}
          </div>

          {/* Empty state or chart */}
          {!isLiveSynced ? (
            <div className="text-center text-gray-400 py-20">
              <div className="text-lg font-semibold mb-2">No live data synced</div>
              <div className="text-sm mb-4">
                Open the Live tab and click <b>Sync → Dashboard</b> OR use the button above.
              </div>
              <button onClick={handleDashboardSync} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Sync Now</button>
            </div>
          ) : (
            <div className="w-full">
              <DashboardLiveChart />
            </div>
          )}
        </div>
      )}

      {tab === "equity" && (
        <div className="glass-card p-5">
          <div className="text-sm text-gray-400">Equity — full view</div>
          <div className="mt-4">
            <EquityCurve series={equityValues} labels={labels} />
          </div>
        </div>
      )}
    </div>
  );
}
