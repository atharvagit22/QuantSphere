// src/components/Layout/Settings.jsx
import React, { useState } from "react";
import { useData } from "../../context/DataContext.jsx";

export default function Settings() {
  const { resetData, rawCsvFileName } = useData();
  const [apiKey, setApiKey] = useState("");

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-white">Settings</h2>

      <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
        <div className="text-sm text-gray-400">API Key</div>
        <div className="mt-2 flex gap-2">
          <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter API key" className="flex-1 p-2 bg-[#061022] border border-[#111827] rounded" />
          <button className="px-3 py-2 bg-blue-600 rounded">Save</button>
        </div>
      </div>

      <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Data Reset</div>
            <div className="text-xs text-gray-500">Reset parsed CSV and state</div>
          </div>
          <div>
            <button onClick={resetData} className="px-4 py-2 rounded bg-rose-600 text-white">Reset</button>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">Loaded: {rawCsvFileName || "none"}</div>
      </div>
    </div>
  );
}
