// AlertsPanel.jsx — polished with animation and history toggle
import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext.jsx";
import { motion } from "framer-motion";

export default function AlertsPanel({ open, onClose, onAddAlert }) {
  const { alerts: ctxAlerts = [], addAlert: ctxAdd, removeAlert: ctxRemove, toggleAlert: ctxToggle, alertsLog } = useData();
  const [symbol, setSymbol] = useState("AAPL");
  const [metric, setMetric] = useState("rsi");
  const [op, setOp] = useState("<");
  const [value, setValue] = useState("");
  const [localAlerts, setLocalAlerts] = useState([]);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => { setLocalAlerts(ctxAlerts || []); }, [ctxAlerts]);

  if (!open) return null;

  function submit() {
    if (!symbol || !metric || !op || value === "") { alert("Enter values"); return; }
    const payload = { symbol: symbol.toUpperCase(), metric, op, value };
    if (onAddAlert) onAddAlert(payload);
    else if (ctxAdd) ctxAdd(payload);
    setValue("");
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18 }} className="relative z-50 w-[640px] max-w-full bg-[#0b0f14] rounded-xl border border-[#111827] p-6 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Alerts</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowLog((v) => !v)} className="text-xs px-2 py-1 border rounded">{showLog ? "Hide Log" : "Show Log"}</button>
            <button className="text-gray-400" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Symbol</label>
            <input className="w-full px-3 py-2 bg-[#071022] rounded mt-1" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="text-xs text-gray-400">Metric</label>
            <select className="w-full px-3 py-2 bg-[#071022] rounded mt-1" value={metric} onChange={(e) => setMetric(e.target.value)}>
              <option value="rsi">RSI(14)</option>
              <option value="macd">MACD Cross</option>
              <option value="ema">EMA Cross</option>
              <option value="price">Price</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400">Operator</label>
            <select className="w-full px-3 py-2 bg-[#071022] rounded mt-1" value={op} onChange={(e) => setOp(e.target.value)}>
              <option value="<">&lt;</option>
              <option value=">">&gt;</option>
              <option value="=">=</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400">Value</label>
            <input className="w-full px-3 py-2 bg-[#071022] rounded mt-1" value={value} onChange={(e) => setValue(e.target.value)} />
            <div className="text-xs text-gray-500 mt-1">For MACD/EMA use "bull" or "bear"</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={submit} className="px-4 py-2 bg-amber-500 text-black rounded">Add Alert</button>
          <button onClick={() => { setSymbol("AAPL"); setMetric("rsi"); setOp("<"); setValue(""); }} className="px-4 py-2 border rounded text-sm">Reset</button>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Active Alerts</div>
            <div className="text-xs text-gray-500">{localAlerts.length} items</div>
          </div>

          <div className="space-y-2">
            {localAlerts.length === 0 ? <div className="text-gray-500">No alerts configured</div> :
              localAlerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-[#07121a] p-2 rounded">
                  <div>
                    <div className="font-medium">{a.symbol} — {a.metric.toUpperCase()} {a.op} {String(a.value)}</div>
                    <div className="text-xs text-gray-400">{a.enabled ? "Enabled" : "Disabled"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => ctxToggle?.(a.id)} className="px-2 py-1 border rounded text-xs">{a.enabled ? "Disable" : "Enable"}</button>
                    <button onClick={() => ctxRemove?.(a.id)} className="px-2 py-1 bg-rose-600 text-white rounded text-xs">Remove</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {showLog && (
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-2">Alert History</div>
            <div className="max-h-40 overflow-auto bg-[#07121a] p-2 rounded">
              {alertsLog && alertsLog.length ? alertsLog.slice(0, 50).map((e) => (
                <div key={e.id} className="text-xs text-gray-300 py-1 border-b border-[#0b1220]">
                  <div className="flex justify-between">
                    <div>{e.ts} • {e.symbol} • {e.metric}</div>
                    <div className="font-semibold">{e.op} {e.value}</div>
                  </div>
                </div>
              )) : <div className="text-xs text-gray-500">No events</div>}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
