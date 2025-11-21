// src/components/Advanced/LiveData.jsx
import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { Line } from "react-chartjs-2";

export default function LiveData() {
  const { fetchLiveOHLC, livePriceSeries } = useData();
  const [symbol, setSymbol] = useState("");
  const [apiKey, setApiKey] = useState(localStorage.getItem("alphaKey") || "");

  const handleFetch = async () => {
    localStorage.setItem("alphaKey", apiKey);
    await fetchLiveOHLC({ symbol, apiKey, interval: "60min" });
  };

  const labels = livePriceSeries.map((d) => d.time);
  const closes = livePriceSeries.map((d) => d.close);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Live Market Data</h2>
      <div className="flex gap-2">
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="SYMBOL (eg: AAPL)" className="px-2 py-1 rounded bg-slate-800"/>
        <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AlphaVantage API key" className="px-2 py-1 rounded bg-slate-800"/>
        <button onClick={handleFetch} className="px-3 py-1 bg-indigo-600 rounded">Fetch</button>
      </div>

      <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937] h-72">
        <Line data={{ labels, datasets: [{ label: symbol || "Live", data: closes, borderColor: "#60a5fa", pointRadius: 0 }] }} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
}
