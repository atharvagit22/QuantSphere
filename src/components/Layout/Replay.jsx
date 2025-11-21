// src/components/Layout/Replay.jsx
import React, { useEffect, useState, useRef } from "react";
import { useData } from "../../context/DataContext.jsx";
import ReplayChart from "../../components/ui/ReplayChart.jsx";
import OrdersTable from "../../components/OrdersTable.jsx";
import { demoMainData } from "../../utils/demoData.js";

export default function Replay() {
  const { data, setData } = useData();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const equityData = data?.equityData?.length ? data.equityData : data?.compare?.[0]?.equityData ?? [];
  const orders = data?.orders?.length ? data.orders : data?.compare?.[0]?.orders ?? [];

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setIndex((i) => Math.min(equityData.length - 1, i + 1));
      }, 300);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, equityData.length]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === " " || e.key === "k") {
        setPlaying((p) => !p);
      } else if (e.key === "ArrowRight") {
        setIndex((i) => Math.min(equityData.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(0, i - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [equityData.length]);

  const loadDemoReplay = () => {
    setData(demoMainData);
    setIndex(0);
  };

  if (!equityData || equityData.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Replay</h1>
            <div className="text-sm text-gray-400">Replay equity & trades over time</div>
          </div>
          <div>
            <button onClick={loadDemoReplay} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm">Load Demo Replay</button>
          </div>
        </div>

        <div className="glass-card p-4 text-gray-400 mt-6">No equity series loaded — upload CSV in Compare or click Load Demo Replay.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Replay</h1>
          <div className="text-sm text-gray-400">Replay equity & trades over time</div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setPlaying((p) => !p)} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={() => { setIndex(0); setPlaying(false); }} className="px-3 py-1.5 border rounded text-sm">Reset</button>
          <button onClick={loadDemoReplay} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm">Load Demo</button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-2">Replay (equity)</div>
        <ReplayChart equityData={equityData} currentIndex={index} />
        <div className="mt-3">
          <input type="range" min={0} max={Math.max(0, equityData.length - 1)} value={index} onChange={(e) => setIndex(Number(e.target.value))} className="w-full" />
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-2">Orders (during replay)</div>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
