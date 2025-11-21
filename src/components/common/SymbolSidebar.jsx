// src/components/common/SymbolSidebar.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useData } from "../../context/DataContext.jsx";

export default function SymbolSidebar({ open, onClose, symbol }) {
  const { fetchOHLC } = useData();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!open || !symbol) return;
    let mounted = true;
    (async () => {
      try {
        const r = await fetchOHLC(symbol, "daily", "auto");
        if (!mounted) return;
        setSummary({ lastClose: r?.candles?.slice(-1)[0]?.close ?? null, candles: r?.candles?.slice(-30) ?? [] });
      } catch (err) {
        setSummary(null);
      }
    })();
    return () => { mounted = false; };
  }, [open, symbol, fetchOHLC]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative ml-auto w-[420px] max-w-full h-full bg-[#071018] border-l border-[#0f1720] p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{symbol}</div>
            <div className="text-xs text-gray-400">Snapshot</div>
          </div>
          <button onClick={onClose} className="p-2"><X size={18} /></button>
        </div>

        <div className="mt-4 text-sm text-gray-300">
          <div>Last Close: {summary?.lastClose ?? "—"}</div>
          <div className="mt-3">Recent candles: {summary?.candles?.length ?? 0} points</div>
        </div>

        <div className="mt-6">
          <div className="text-xs text-gray-400">Quick actions</div>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1.5 bg-indigo-600 rounded text-sm">Open in Chart</button>
            <button className="px-3 py-1.5 bg-emerald-600 rounded text-sm">Buy (Sim)</button>
            <button className="px-3 py-1.5 bg-rose-600 rounded text-sm">Sell (Sim)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
